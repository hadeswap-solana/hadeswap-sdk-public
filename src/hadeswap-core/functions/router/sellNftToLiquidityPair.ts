import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
  FEE_PREFIX,
} from '../../constants';

import {
  anchorRawBNsAndPubkeysToNumsAndStrings,
  getMetaplexEditionPda,
  getMetaplexMetadataPda,
  returnAnchorProgram,
} from '../../helpers';

type SellNftToLiquidityPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    minAmountToGet: number;
    skipFailed: boolean;
  };

  accounts: {
    nftValidationAdapter: web3.PublicKey;
    pair: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
    protocolFeeReceiver: web3.PublicKey;
    assetReceiver: web3.PublicKey;

    liquidityProvisionOrder: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const sellNftToLiquidityPair: SellNftToLiquidityPair = async ({
  programId,
  connection,
  args,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const nftPairBox = web3.Keypair.generate();

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const newVaultTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);
  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const metadataInfo = getMetaplexMetadataPda(accounts.nftMint);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);

  instructions.push(
    await program.methods
      .sellNftToLiquidityPair(new BN(args.minAmountToGet), args.skipFailed)
      .accounts({
        nftPairBox: nftPairBox.publicKey,
        nftValidationAdapter: accounts.nftValidationAdapter,
        pair: accounts.pair,
        user: accounts.userPubkey,
        nftMint: accounts.nftMint,

        nftUserTokenAccount: userNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,

        nftsOwner: nftsOwner,
        feeSolVault: feeSolVault,
        newVaultTokenAccount: newVaultTokenAccount,
        protocolFeeReceiver: accounts.protocolFeeReceiver,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        fundsSolVault: solFundsVault,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        liquidityProvisionOrder: accounts.liquidityProvisionOrder,

        metadataInfo: metadataInfo,
        editionInfo: editionInfo,
      })
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);
  const signers = [nftPairBox];
  await sendTxn(transaction, signers);

  return { account: nftPairBox.publicKey, instructions, signers };
};
