import { web3 } from '@project-serum/anchor';
import { BN } from '../../../../../..';

import { enumToAnchorEnum, returnAnchorProgram } from '../../../../../helpers';
import { EMPTY_PUBKEY, ENCODER, FEE_PREFIX, NFTS_OWNER_PREFIX, SOL_FUNDS_PREFIX } from '../../../../../constants';
import { BondingCurveType, PairType } from '../../../../../types';

interface InitializePairArgs {
  delta: number;
  spotPrice: number;
  fee: number;
  bondingCurveType: BondingCurveType;
  pairType: PairType;
}

type InitializePair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: InitializePairArgs;

  accounts: {
    hadoMarket: web3.PublicKey;
    userPubkey: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: web3.PublicKey; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const initializePair: InitializePair = async ({ programId, connection, args, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const pair = web3.Keypair.generate();

  const [feeSolVault, feeVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(FEE_PREFIX), pair.publicKey.toBuffer()],
    program.programId,
  );

  const [solFundsVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), pair.publicKey.toBuffer()],
    program.programId,
  );

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), pair.publicKey.toBuffer()],
    program.programId,
  );

  instructions.push(
    await program.methods
      .initializePair(
        {
          feeVaultSeed: feeVaultSeed,
          fundsSolVaultSeed: solVaultSeed,
          nftsSeed: nftsOwnerSeed,
        },
        {
          delta: new BN(args.delta),
          spotPrice: new BN(args.spotPrice),
          fee: new BN(args.fee),
        },
        // 1,
        // 1,
        enumToAnchorEnum(args.bondingCurveType),
        enumToAnchorEnum(args.pairType),
      )
      .accounts({
        pair: pair.publicKey,
        hadoMarket: accounts.hadoMarket,

        user: accounts.userPubkey,

        pairAuthorityAdapterProgram: programId,

        partialAdapterProgram: EMPTY_PUBKEY,
        partialAssetReceiver: EMPTY_PUBKEY,

        feeSolVault: feeSolVault,
        feeTokenAccount: EMPTY_PUBKEY,

        fundsSolVault: solFundsVault,
        fundsTokenAccount: EMPTY_PUBKEY,

        assetReceiver: accounts.userPubkey,
        assetReceiverTokenAccount: EMPTY_PUBKEY,

        nftsOwner: nftsOwner,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction(),
  );

  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [pair];
  await sendTxn(transaction, signers);
  return { account: pair.publicKey, instructions, signers };
};
