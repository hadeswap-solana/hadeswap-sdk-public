import { web3 } from '@project-serum/anchor';
import { returnAnchorProgram } from '../../../helpers';

type CreateMerkleTreeWhitelist = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;
  args: {
    root: Buffer;
  };

  accounts: {
    userPubkey: web3.PublicKey;
    hadoMarket: web3.PublicKey;
  };
  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const createMerkleTreeWhitelist: CreateMerkleTreeWhitelist = async ({
  programId,
  connection,
  accounts,
  args,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const nftValidationAdapterV2 = web3.Keypair.generate();
  instructions.push(
    await program.methods
      .addMerkleTreeWhitelist([...args.root])
      .accountsStrict({
        nftValidationAdapter: nftValidationAdapterV2.publicKey,
        hadoMarket: accounts.hadoMarket,
        user: accounts.userPubkey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [nftValidationAdapterV2];
  await sendTxn(transaction, signers);
  return { account: nftValidationAdapterV2.publicKey, instructions, signers };
};
