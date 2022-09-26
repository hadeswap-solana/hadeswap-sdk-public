import { web3 } from '@project-serum/anchor';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../../../helpers';
import { EMPTY_PUBKEY, ENCODER, FEE_PREFIX, NFTS_OWNER_PREFIX, SOL_FUNDS_PREFIX } from '../../../../../constants';
import { findAssociatedTokenAddress } from '../../../../../../common';

type WithdrawLiquidityOrderTokenizedFees = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    pair: web3.PublicKey;
    lpTokenMint: web3.PublicKey;

    userPubkey: web3.PublicKey;
    liquidityProvisionOrder: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawLiquidityOrderTokenizedFees: WithdrawLiquidityOrderTokenizedFees = async ({
  programId,
  connection,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.lpTokenMint);

  instructions.push(
    await program.methods
      .withdrawLiquidityOrderTokenizedFees()
      .accounts({
        liquidityProvisionOrder: accounts.liquidityProvisionOrder,
        pair: accounts.pair,
        user: accounts.userPubkey,
        feeSolVault: feeSolVault,
        userLpTokenAccount: userNftTokenAccount,
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
