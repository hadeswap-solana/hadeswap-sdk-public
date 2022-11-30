import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import { EMPTY_PUBKEY, ENCODER, FEE_PREFIX, NFTS_OWNER_PREFIX, SOL_FUNDS_PREFIX } from '../../constants';

import { returnAnchorProgram } from '../../helpers';

type BuyNftFromPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    maxAmountToPay: number;
    skipFailed: boolean;
  };

  accounts: {
    nftPairBox: web3.PublicKey;
    nftMint: web3.PublicKey;
    vaultNftTokenAccount: web3.PublicKey;
    assetReceiver: web3.PublicKey;
    protocolFeeReceiver: web3.PublicKey;

    pair: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const buyNftFromPair: BuyNftFromPair = async ({ programId, connection, accounts, args, sendTxn }) => {
  const encoder = new TextEncoder();
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);

  instructions.push(
    await program.methods
      .buyNftFromPair(new BN(args.maxAmountToPay), args.skipFailed)
      .accounts({
        nftPairBox: accounts.nftPairBox,

        pair: accounts.pair,
        user: accounts.userPubkey,

        fundsSolVault: solFundsVault,
        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,

        nftMint: accounts.nftMint,
        vaultNftTokenAccount: accounts.vaultNftTokenAccount,

        nftUserTokenAccount: userNftTokenAccount,
        assetReceiver: accounts.assetReceiver,
        protocolFeeReceiver: accounts.protocolFeeReceiver,

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
