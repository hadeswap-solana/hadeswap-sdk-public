import { web3 } from '@project-serum/anchor';

import { returnAnchorProgram } from '../../../../../helpers';

type CreateClassicAuthorityAdapter = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;
  authorityAdapterKp?: web3.Keypair;

  accounts: {
    userPubkey: web3.PublicKey;
    pair: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const createClassicAuthorityAdapter: CreateClassicAuthorityAdapter = async ({
  programId,
  connection,
  authorityAdapterKp,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const authorityAdapter = authorityAdapterKp ?? web3.Keypair.generate();
  instructions.push(
    await program.methods
      .createClassicAuthorityAdapter()
      .accountsStrict({
        pair: accounts.pair,
        authorityAdapter: authorityAdapter.publicKey,
        user: accounts.userPubkey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [authorityAdapter];
  await sendTxn(transaction, signers);
  return { account: authorityAdapter.publicKey, instructions, signers };
};
