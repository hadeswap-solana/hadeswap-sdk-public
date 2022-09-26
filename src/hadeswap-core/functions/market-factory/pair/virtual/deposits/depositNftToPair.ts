import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  METADATA_PROGRAM_PUBKEY,
  NFTS_OWNER_PREFIX,
  SOL_FUNDS_PREFIX,
} from '../../../../../constants';

import { getMetaplexMetadataPda, returnAnchorProgram } from '../../../../../helpers';

type DepositNftToPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    nftValidationAdapter: web3.PublicKey;
    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const depositNftToPair: DepositNftToPair = async ({ programId, connection, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const nftPairBox = web3.Keypair.generate();

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const vaultNftTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);

  const editionId = getMetaplexMetadataPda(accounts.nftMint);

  instructions.push(
    await program.methods
      .depositNftToPair()
      .accounts({
        nftPairBox: nftPairBox.publicKey,
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,

        nftsOwner: nftsOwner,
        nftMint: accounts.nftMint,
        nftUserTokenAccount: userNftTokenAccount,
        vaultTokenAccount: vaultNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        editionInfo: editionId,
        metadataProgram: METADATA_PROGRAM_PUBKEY,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [nftPairBox];
  await sendTxn(transaction, signers);
  return { account: nftPairBox.publicKey, instructions, signers };
};
