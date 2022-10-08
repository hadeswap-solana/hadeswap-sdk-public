import { web3 } from '@project-serum/anchor';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../helpers';
import { NftValidationWhitelistType } from '../../../types';

type ValidateNft = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;
  accounts: {
    userPubkey: web3.PublicKey;
    classicValidationWhitelist: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const validateNft: ValidateNft = async ({ programId, connection, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const nftValidationAdapter = web3.Keypair.generate();
  instructions.push(
    await program.methods
      .validateNft()
      .accounts({
        nftValidationAdapter: nftValidationAdapter.publicKey,
        validationWhitelist: accounts.classicValidationWhitelist,
        user: accounts.userPubkey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [nftValidationAdapter];
  await sendTxn(transaction, signers);
  return { account: nftValidationAdapter.publicKey, instructions, signers };
};
