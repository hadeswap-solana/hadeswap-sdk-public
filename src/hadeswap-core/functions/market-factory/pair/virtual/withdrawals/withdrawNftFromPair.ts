import { BN, web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { findAssociatedTokenAddress } from '../../../../../../common';
import {
  EMPTY_PUBKEY,
  ENCODER,
  NFTS_OWNER_PREFIX,
  METADATA_PROGRAM_PUBKEY,
  AUTHORIZATION_RULES_PROGRAM,
} from '../../../../../constants';

import {
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadata,
  getMetaplexMetadataPda,
  returnAnchorProgram,
} from '../../../../../helpers';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

type WithdrawNftFromPair = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;
  args: {
    pnft?: {
      nameForRuleSet?: string;
      payerRuleSet?: web3.PublicKey;
    };
  };

  accounts: {
    pair: web3.PublicKey;
    authorityAdapter: web3.PublicKey;
    userPubkey: web3.PublicKey;
    nftMint: web3.PublicKey;
    nftPairBox: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawNftFromPair: WithdrawNftFromPair = async ({ programId, connection, args, accounts, sendTxn }) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];

  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const userNftTokenAccount = await findAssociatedTokenAddress(accounts.userPubkey, accounts.nftMint);
  const vaultNftTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.nftMint);

  const ownerTokenRecord = findTokenRecordPda(accounts.nftMint, vaultNftTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.nftMint, userNftTokenAccount);
  const editionInfo = getMetaplexEditionPda(accounts.nftMint);
  const metadataInfo = getMetaplexMetadata(accounts.nftMint);
  const ruleSet = !args?.pnft
    ? METADATA_PROGRAM_PUBKEY
    : args?.pnft?.payerRuleSet && args?.pnft?.nameForRuleSet
    ? await findRuleSetPDA(args.pnft.payerRuleSet, args.pnft.nameForRuleSet)
    : (await Metadata.fromAccountAddress(connection, metadataInfo)).programmableConfig?.ruleSet;
  const modifyComputeUnits = web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(400000),
  });
  instructions.push(modifyComputeUnits);
  instructions.push(
    await program.methods
      .withdrawNftFromPair(null)
      .accountsStrict({
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

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: METADATA_PROGRAM_PUBKEY,
      })
      .remainingAccounts([
        {
          pubkey: ruleSet || METADATA_PROGRAM_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
      ])
      .instruction(),
  );
  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
