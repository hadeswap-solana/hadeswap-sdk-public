import { web3 } from '@project-serum/anchor';
import { BN } from '../../../../../..';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../../../helpers';
import { EMPTY_PUBKEY, ENCODER, FEE_PREFIX, NFTS_OWNER_PREFIX, SOL_FUNDS_PREFIX } from '../../../../../constants';
import { BondingCurveType, PairType } from '../../../../../types';

type ModifyPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    delta: number;
    spotPrice: number;
    fee: number;
  };

  accounts: {
    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const modifyPair: ModifyPair = async ({ programId, connection, args, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });
  const addPriorityFee = web3.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  instructions.push(modifyComputeUnits);
  instructions.push(addPriorityFee);

  instructions.push(
    await program.methods
      .modifyPair({
        delta: new BN(args.delta),
        spotPrice: new BN(args.spotPrice),
        fee: new BN(args.fee),
      })
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
