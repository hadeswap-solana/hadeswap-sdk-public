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

type WithdrawLiquidityFromSellOrdersPairTokenized = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  accounts: {
    pair: web3.PublicKey;
    userPubkey: web3.PublicKey;
    lpTokenMint: web3.PublicKey;

    nftMintFirst: web3.PublicKey;
    nftPairBoxFirst: web3.PublicKey;
    nftMintSecond: web3.PublicKey;
    nftPairBoxSecond: web3.PublicKey;

    liquidityProvisionOrderToWithdraw: web3.PublicKey;
    liquidityProvisionOrderToReplace: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawLiquidityFromSellOrdersPairTokenized: WithdrawLiquidityFromSellOrdersPairTokenized = async ({
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

  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const userNftTokenAccountFirst = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMintFirst);
  const vaultNftTokenAccountFirst = await findAssociatedTokenAddress(nftsOwner, accounts.nftMintFirst);

  const userNftTokenAccountNftMintSecond = await findAssociatedTokenAddress(
    accounts.userPubkey,
    accounts.nftMintSecond,
  );
  const vaultNftTokenAccountSecond = await findAssociatedTokenAddress(nftsOwner, accounts.nftMintSecond);
  const userLpTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.lpTokenMint);

  instructions.push(
    await program.methods
      .withdrawLiquidityFromSellOrdersPairTokenized()
      .accounts({
        liquidityProvisionOrderToWithdraw: accounts.liquidityProvisionOrderToWithdraw,
        liquidityProvisionOrderToReplace: accounts.liquidityProvisionOrderToReplace,

        pair: accounts.pair,
        user: accounts.userPubkey,

        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,

        nftPairBoxFirst: accounts.nftPairBoxFirst,
        nftMintFirst: accounts.nftMintFirst,
        nftUserTokenAccountFirst: userNftTokenAccountFirst,
        vaultNftTokenAccountFirst: vaultNftTokenAccountFirst,

        nftPairBoxSecond: accounts.nftPairBoxSecond,
        nftMintSecond: accounts.nftMintSecond,
        nftUserTokenAccountSecond: userNftTokenAccountNftMintSecond,
        vaultNftTokenAccountSecond: vaultNftTokenAccountSecond,

        lpTokenMint: accounts.lpTokenMint,
        userLpTokenAccount: userLpTokenAccount,

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
