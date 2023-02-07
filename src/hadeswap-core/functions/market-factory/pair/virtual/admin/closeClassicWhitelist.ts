import { web3 } from '@project-serum/anchor';
import { BN } from '../../../../../..';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../../../helpers';

type CloseClassicWhitelist = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    validationWhitelist: web3.PublicKey;
    admin: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const closeClassicWhitelist: CloseClassicWhitelist = async ({ programId, connection, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  instructions.push(
    await program.methods
      .closeClassicWhitelist()
      .accountsStrict({
        validationWhitelist: accounts.validationWhitelist,
        admin: accounts.admin,
      })
      .instruction(),
  );

  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
