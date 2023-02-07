import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  SOL_FUNDS_PREFIX,
  AUTHORIZATION_RULES_PROGRAM,
} from '../../../../../constants';

import {
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadataPda,
  returnAnchorProgram,
} from '../../../../../helpers';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

type DepositLiquidityToPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    proof?: Buffer[];
    pnft?: {
      nameForRuleSet?: string;
      payerRuleSet?: web3.PublicKey;
    };
  };

  accounts: {
    nftValidationAdapter: web3.PublicKey;
    nftValidationAdapterV2?: web3.PublicKey;

    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{
  nftPairBox: web3.PublicKey;
  instructions: web3.TransactionInstruction[];
  signers: web3.Signer[];
}>;

export const depositLiquidityToPair: DepositLiquidityToPair = async ({
  programId,
  connection,
  accounts,
  args,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [fundsSolVault, solVaultSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(SOL_FUNDS_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );
  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const nftPairBox = web3.Keypair.generate();

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const vaultNftTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);

  const metadataInfo = getMetaplexMetadataPda(accounts.nftMint);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);
  const ownerTokenRecord = findTokenRecordPda(accounts.nftMint, userNftTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.nftMint, vaultNftTokenAccount);
  const ruleSet = !args?.pnft
    ? METADATA_PROGRAM_PUBKEY
    : args?.pnft?.payerRuleSet && args?.pnft?.nameForRuleSet
    ? await findRuleSetPDA(args.pnft.payerRuleSet, args.pnft.nameForRuleSet)
    : (await Metadata.fromAccountAddress(connection, metadataInfo)).programmableConfig?.ruleSet;
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(
      400000,
      // * (args.amountOfOrders / 10) + 1
    ),
  });
  instructions.push(modifyComputeUnits);
  instructions.push(
    await program.methods
      .depositLiquidityToPair(args.proof ? args.proof : [], null)
      .accountsStrict({
        nftPairBox: nftPairBox.publicKey,
        nftValidationAdapter: accounts.nftValidationAdapter,

        pair: accounts.pair,
        authorityAdapter: accounts.authorityAdapter,
        user: accounts.userPubkey,
        fundsSolVault: fundsSolVault,

        nftsOwner: nftsOwner,
        nftMint: accounts.nftMint,
        nftUserTokenAccount: userNftTokenAccount,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,

        vaultTokenAccount: vaultNftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        metadataProgram: METADATA_PROGRAM_PUBKEY,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .remainingAccounts(
        accounts.nftValidationAdapterV2
          ? [
              {
                pubkey: accounts.nftValidationAdapterV2,
                isSigner: false,
                isWritable: false,
              },
              {
                pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
            ]
          : [
              {
                pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
            ],
      )
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [nftPairBox];
  await sendTxn(transaction, signers);
  return {
    nftPairBox: nftPairBox.publicKey,
    instructions,
    signers,
  };
};
