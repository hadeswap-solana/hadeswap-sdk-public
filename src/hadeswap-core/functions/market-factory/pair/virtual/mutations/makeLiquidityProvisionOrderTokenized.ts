import { BN, web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
} from '../../../../../constants';

import { getMetaplexMetadataPda, returnAnchorProgram } from '../../../../../helpers';

type MakeLiquidityProvisionOrderTokenized = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    pair: web3.PublicKey;
    liquidityProvisionOrder: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{
  account: null;
  lpTokenMint: web3.PublicKey;
  instructions: web3.TransactionInstruction[];
  signers: web3.Signer[];
}>;

export const makeLiquidityProvisionOrderTokenized: MakeLiquidityProvisionOrderTokenized = async ({
  programId,
  connection,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const lpTokenMintAccount = web3.Keypair.generate();
  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, lpTokenMintAccount.publicKey);

  instructions.push(
    await program.methods
      .makeLiquidityProvisionOrderTokenized()
      .accounts({
        pair: accounts.pair,
        liquidityProvisionOrder: accounts.liquidityProvisionOrder,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,
        nftsOwner: nftsOwner,
        lpTokenMint: lpTokenMintAccount.publicKey,
        nftUserTokenAccount: userNftTokenAccount,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [lpTokenMintAccount];
  await sendTxn(transaction, signers);
  return { account: null, lpTokenMint: lpTokenMintAccount.publicKey, instructions, signers };
};
