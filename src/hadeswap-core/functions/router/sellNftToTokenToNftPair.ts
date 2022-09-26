import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import { EMPTY_PUBKEY, ENCODER, NFTS_OWNER_PREFIX, METADATA_PROGRAM_PUBKEY, SOL_FUNDS_PREFIX } from '../../constants';

import { getMetaplexMetadataPda, returnAnchorProgram } from '../../helpers';

type SellNftToTokenToNftPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    minAmountToGet: number;
    skipFailed: boolean;
  };

  accounts: {
    nftValidationAdapter: web3.PublicKey;
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

  const editionId = getMetaplexMetadataPda(accounts.nftMint);
  instructions.push(
    await program.methods
      .sellNftToTokenToNftPair(new BN(args.minAmountToGet), args.skipFailed)
      .accounts({
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        user: accounts.userPubkey,
        nftMint: accounts.nftMint,
        nftUserTokenAccount: userNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        editionInfo: editionId,

        assetReceiver: accounts.assetReceiver,
        protocolFeeReceiver: accounts.protocolFeeReceiver,
        assetReceiverTokenAccount: assetReceiverTokenAccount,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        fundsSolVault: solFundsVault,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
