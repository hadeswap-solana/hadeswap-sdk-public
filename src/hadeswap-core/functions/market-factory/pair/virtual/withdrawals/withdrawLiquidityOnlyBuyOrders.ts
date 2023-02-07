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
import { Keypair } from '@solana/web3.js';

type WithdrawLiquidityOnlyBuyOrders = (params: {
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

// Virtual
// if only buy orders
export const withdrawLiquidityOnlyBuyOrders: WithdrawLiquidityOnlyBuyOrders = async ({
  programId,
  connection,
  args,
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
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(400000),
  });
  instructions.push(modifyComputeUnits);
  instructions.push(
    await program.methods
      .withdrawLiquidityOnlyBuyOrders(new BN(args.amountOfOrders))
      .accountsStrict({
        pair: accounts.pair,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,
        fundsSolVault: solFundsVault,
        feeSolVault: feeSolVault,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .remainingAccounts([{ pubkey: Keypair.generate().publicKey, isSigner: false, isWritable: false }])
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
