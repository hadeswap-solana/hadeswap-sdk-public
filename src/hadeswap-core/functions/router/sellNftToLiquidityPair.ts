import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
  FEE_PREFIX,
  AUTHORIZATION_RULES_PROGRAM,
} from '../../constants';

import {
  anchorRawBNsAndPubkeysToNumsAndStrings,
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadataPda,
  returnAnchorProgram,
} from '../../helpers';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { AccountMeta } from '@solana/web3.js';

type SellNftToLiquidityPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    minAmountToGet: number;
    skipFailed: boolean;
    proof?: Buffer[];
    pnft?: {
      nameForRuleSet?: string;
      payerRuleSet?: web3.PublicKey;
    };
  };
  accounts: {
    nftValidationAdapter: web3.PublicKey;
    nftValidationAdapterV2?: web3.PublicKey;

    pair: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
    protocolFeeReceiver: web3.PublicKey;
    assetReceiver: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const sellNftToLiquidityPair: SellNftToLiquidityPair = async ({
  programId,
  connection,
  args,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const nftPairBox = web3.Keypair.generate();

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const newVaultTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);
  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const ownerTokenRecord = findTokenRecordPda(accounts.nftMint, userNftTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.nftMint, newVaultTokenAccount);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);
  const metadataInfo = getMetaplexMetadataPda(accounts.nftMint);
  const metadataAccount = await Metadata.fromAccountAddress(connection, metadataInfo);

  const ruleSet = !args?.pnft
    ? METADATA_PROGRAM_PUBKEY
    : args?.pnft?.payerRuleSet && args?.pnft?.nameForRuleSet
    ? await findRuleSetPDA(args.pnft.payerRuleSet, args.pnft.nameForRuleSet)
    : metadataAccount.programmableConfig?.ruleSet;

  const creators = metadataAccount.data.creators;

  const creatorAccountMetas: AccountMeta[] = creators
    ? creators
        ?.filter((creator) => creator.share > 0)
        .map((creator) => ({
          pubkey: creator.address,
          isSigner: false,
          isWritable: true,
        }))
    : [];
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(400000),
  });
  instructions.push(modifyComputeUnits);
  console.log(
    anchorRawBNsAndPubkeysToNumsAndStrings({
      account: {
        nftPairBox: nftPairBox.publicKey,
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        user: accounts.userPubkey,
        nftMint: accounts.nftMint,

        nftUserTokenAccount: userNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,

        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,
        newVaultTokenAccount: newVaultTokenAccount,
        protocolFeeReceiver: accounts.protocolFeeReceiver,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        fundsSolVault: solFundsVault,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,
        metadataProgram: METADATA_PROGRAM_PUBKEY,
        ruleSet,
      },
      publicKey: userNftTokenAccount,
    }),
  );
  instructions.push(
    await program.methods
      .sellNftToLiquidityPair(new BN(args.minAmountToGet), args.skipFailed, args.proof ? args.proof : [], null)
      .accountsStrict({
        nftPairBox: nftPairBox.publicKey,
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        user: accounts.userPubkey,
        nftMint: accounts.nftMint,

        nftUserTokenAccount: userNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,

        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,
        newVaultTokenAccount: newVaultTokenAccount,
        protocolFeeReceiver: accounts.protocolFeeReceiver,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        fundsSolVault: solFundsVault,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,
        metadataProgram: METADATA_PROGRAM_PUBKEY,
      })
      .remainingAccounts(
        accounts.nftValidationAdapterV2
          ? [
              {
                pubkey: accounts.nftValidationAdapterV2,
                isSigner: false,
                isWritable: false,
              },
              {
                pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
              ...creatorAccountMetas,
            ]
          : [
              {
                pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
              ...creatorAccountMetas,
            ],
      )
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);
  const signers = [nftPairBox];
  await sendTxn(transaction, signers);

  return { account: nftPairBox.publicKey, instructions, signers };
};
