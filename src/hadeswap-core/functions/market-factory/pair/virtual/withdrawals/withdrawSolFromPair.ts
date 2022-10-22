import { BN, web3 } from '@project-serum/anchor';
import { EMPTY_PUBKEY, ENCODER, SOL_FUNDS_PREFIX } from '../../../../../constants';

import { returnAnchorProgram } from '../../../../../helpers';

type WithdrawSolFromPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    amountOfOrders: number;
  };

  accounts: {
    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawSolFromPair: WithdrawSolFromPair = async ({ programId, connection, accounts, args, sendTxn }) => {
  const encoder = new TextEncoder();
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [encoder.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(
      100000000,
      // * (args.amountOfOrders / 10) + 1
    ),
  });
  const addPriorityFee = web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  instructions.push(modifyComputeUnits);
  instructions.push(addPriorityFee);

  instructions.push(
    await program.methods
      .withdrawSolFromPair(new BN(args.amountOfOrders))
      .accounts({
        pair: accounts.pair,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,
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
