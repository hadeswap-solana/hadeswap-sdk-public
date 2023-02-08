import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import {
  AUTHORIZATION_RULES_PROGRAM,
  EMPTY_PUBKEY,
  ENCODER,
  FEE_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  NFTS_OWNER_PREFIX,
  SOL_FUNDS_PREFIX,
} from '../../constants';

import {
  anchorRawBNsAndPubkeysToNumsAndStrings,
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadata,
  returnAnchorProgram,
} from '../../helpers';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { AccountMeta } from '@solana/web3.js';
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

type BuyNftFromPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    maxAmountToPay: number;
    skipFailed: boolean;

    pnft?: {
      nameForRuleSet?: string;
      payerRuleSet?: web3.PublicKey;
    };
  };

  accounts: {
    nftPairBox: web3.PublicKey;
    nftMint: web3.PublicKey;
    vaultNftTokenAccount: web3.PublicKey;
    assetReceiver: web3.PublicKey;
    protocolFeeReceiver: web3.PublicKey;

    pair: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const buyNftFromPair: BuyNftFromPair = async ({ programId, connection, accounts, args, sendTxn }) => {
  const encoder = new TextEncoder();
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const ownerTokenRecord = findTokenRecordPda(accounts.nftMint, accounts.vaultNftTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.nftMint, userNftTokenAccount);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);
  const metadataInfo = getMetaplexMetadata(accounts.nftMint);
  const metadataAccount = await Metadata.fromAccountAddress(connection, metadataInfo);
  const ruleSet = !args?.pnft
    ? METADATA_PROGRAM_PUBKEY
    : args?.pnft?.payerRuleSet && args?.pnft?.nameForRuleSet
    ? await findRuleSetPDA(args.pnft.payerRuleSet, args.pnft.nameForRuleSet)
    : metadataAccount.programmableConfig?.ruleSet;

  const creators = metadataAccount.data.creators;

  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(400000),
  });
  instructions.push(modifyComputeUnits);
  console.log(
    anchorRawBNsAndPubkeysToNumsAndStrings({
      account: {
        nftPairBox: accounts.nftPairBox,

        pair: accounts.pair,
        user: accounts.userPubkey,

        fundsSolVault: solFundsVault,
        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,

        nftMint: accounts.nftMint,
        vaultNftTokenAccount: accounts.vaultNftTokenAccount,

        nftUserTokenAccount: userNftTokenAccount,
        assetReceiver: accounts.assetReceiver,
        protocolFeeReceiver: accounts.protocolFeeReceiver,

        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,
        metadataProgram: METADATA_PROGRAM_PUBKEY,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        ruleSet,
      },
      publicKey: userNftTokenAccount,
    }),
  );

  const creatorAccountMetas: AccountMeta[] = creators
    ? creators
        ?.filter((creator) => creator.share > 0)
        .map((creator) => ({
          pubkey: creator.address,
          isSigner: false,
          isWritable: true,
        }))
    : [];
  instructions.push(
    await program.methods
      .buyNftFromPair(new BN(args.maxAmountToPay), args.skipFailed, null)
      .accountsStrict({
        nftPairBox: accounts.nftPairBox,

        pair: accounts.pair,
        user: accounts.userPubkey,

        fundsSolVault: solFundsVault,
        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,

        nftMint: accounts.nftMint,
        vaultNftTokenAccount: accounts.vaultNftTokenAccount,

        nftUserTokenAccount: userNftTokenAccount,
        assetReceiver: accounts.assetReceiver,
        protocolFeeReceiver: accounts.protocolFeeReceiver,

        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: METADATA_PROGRAM_PUBKEY,
      })
      .remainingAccounts([
        {
          pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        ...creatorAccountMetas,
      ])
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
