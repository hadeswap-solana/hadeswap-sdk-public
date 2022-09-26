import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
  FEE_PREFIX,
} from '../../../../../constants';

import { getMetaplexMetadataPda, returnAnchorProgram } from '../../../../../helpers';

type WithdrawLiquidityFromBuyOrdersPairTokenized = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    pair: web3.PublicKey;

    lpTokenMint: web3.PublicKey;

    userPubkey: web3.PublicKey;

    liquidityProvisionOrderToWithdraw: web3.PublicKey;
    liquidityProvisionOrderToReplace: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawLiquidityFromBuyOrdersPairTokenized: WithdrawLiquidityFromBuyOrdersPairTokenized = async ({
  programId,
  connection,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const userLpTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.lpTokenMint);

  instructions.push(
    await program.methods
      .withdrawLiquidityFromBuyOrdersPairTokenized()
      .accounts({
        liquidityProvisionOrderToWithdraw: accounts.liquidityProvisionOrderToWithdraw,
        liquidityProvisionOrderToReplace: accounts.liquidityProvisionOrderToReplace,

        pair: accounts.pair,
        user: accounts.userPubkey,
        fundsSolVault: solFundsVault,
        feeSolVault: feeSolVault,

        lpTokenMint: accounts.lpTokenMint,
        userLpTokenAccount: userLpTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

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
