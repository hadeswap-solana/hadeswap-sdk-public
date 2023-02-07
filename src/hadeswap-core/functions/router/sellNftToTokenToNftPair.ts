import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
  AUTHORIZATION_RULES_PROGRAM,
} from '../../constants';

import {
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadataPda,
  returnAnchorProgram,
} from '../../helpers';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

type SellNftToTokenToNftPair = (params: {
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
    protocolFeeReceiver: web3.PublicKey;
    nftMint: web3.PublicKey;
    assetReceiver: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const sellNftToTokenToNftPair: SellNftToTokenToNftPair = async ({
  programId,
  connection,
  args,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const assetReceiverTokenAccount = await findAssociatedTokenAddress(accounts.assetReceiver, accounts.nftMint);

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const ownerTokenRecord = findTokenRecordPda(accounts.nftMint, userNftTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.nftMint, assetReceiverTokenAccount);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);
  const metadataInfo = getMetaplexMetadataPda(accounts.nftMint);
  const ruleSet = !args?.pnft
    ? METADATA_PROGRAM_PUBKEY
    : args?.pnft?.payerRuleSet && args?.pnft?.nameForRuleSet
    ? await findRuleSetPDA(args.pnft.payerRuleSet, args.pnft.nameForRuleSet)
    : (await Metadata.fromAccountAddress(connection, metadataInfo)).programmableConfig?.ruleSet;
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(400000),
  });
  instructions.push(modifyComputeUnits);
  instructions.push(
    await program.methods
      .sellNftToTokenToNftPair(new BN(args.minAmountToGet), args.skipFailed, args.proof ? args.proof : [], null)
      .accountsStrict({
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        user: accounts.userPubkey,
        nftMint: accounts.nftMint,
        nftUserTokenAccount: userNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,

        assetReceiver: accounts.assetReceiver,
        protocolFeeReceiver: accounts.protocolFeeReceiver,

        assetReceiverTokenAccount: assetReceiverTokenAccount,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        fundsSolVault: solFundsVault,

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
            ]
          : [
              {
                pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
            ],
      )
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
