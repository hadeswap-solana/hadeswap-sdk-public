import { web3 } from '@project-serum/anchor';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../helpers';
import { NftValidationWhitelistType } from '../../../types';

type AddClassicWhitelistToMarket = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    whitelistType: NftValidationWhitelistType;
  };
  accounts: {
    userPubkey: web3.PublicKey;
    hadoMarket: web3.PublicKey;
    whitelisted_address: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const addClassicWhitelistToMarket: AddClassicWhitelistToMarket = async ({
  programId,
  connection,
  accounts,
  args,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const validationWhitelist = web3.Keypair.generate();
  instructions.push(
    await program.methods
      .addClassicWhitelistToMarket(enumToAnchorEnum(args.whitelistType))
      .accounts({
        validationWhitelist: validationWhitelist.publicKey,
        hadoMarket: accounts.hadoMarket,
        user: accounts.userPubkey,
        whitelistedAddress: accounts.whitelisted_address,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [validationWhitelist];
  await sendTxn(transaction, signers);
  return { account: validationWhitelist.publicKey, instructions, signers };
};
