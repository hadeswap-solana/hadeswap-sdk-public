import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import { EMPTY_PUBKEY, ENCODER, NFTS_OWNER_PREFIX, METADATA_PROGRAM_PUBKEY } from '../../../../../constants';

import { getMetaplexMetadataPda, returnAnchorProgram } from '../../../../../helpers';

type WithdrawNftFromPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftPairBox: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawNftFromPair: WithdrawNftFromPair = async ({ programId, connection, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const vaultNftTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);

  instructions.push(
    await program.methods
      .withdrawNftFromPair()
      .accounts({
        nftPairBox: accounts.nftPairBox,
        pair: accounts.pair,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,
        nftsOwner: nftsOwner,
        nftMint: accounts.nftMint,
        nftUserTokenAccount: userNftTokenAccount,
        vaultNftTokenAccount: vaultNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

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
