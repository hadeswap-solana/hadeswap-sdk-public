import { web3 } from '@project-serum/anchor';
import { BN } from '../../../../../..';

import {
  enumToAnchorEnum,
  findRuleSetPDA,
  findTokenRecordPda,
  getMetaplexEditionPda,
  getMetaplexMetadata,
  returnAnchorProgram,
} from '../../../../../helpers';
import { AUTHORIZATION_RULES_PROGRAM, ENCODER, NFTS_OWNER_PREFIX } from '../../../../../constants';
import { findAssociatedTokenAddress } from '../../../../../../common';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';

type WithdrawOutstandingTokensByAdmin = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;

  args: {
    nameForRuleSet: string;
    payerRuleSet: web3.PublicKey;
  };

  accounts: {
    tokenMint: web3.PublicKey;
    admin: web3.PublicKey;
    pair: web3.PublicKey;
  };

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>;
}) => Promise<{ account: null; instructions: web3.TransactionInstruction[]; signers: web3.Signer[] }>;

export const withdrawOutstandingTokensByAdmin: WithdrawOutstandingTokensByAdmin = async ({
  programId,
  connection,
  args,
  accounts,
  sendTxn,
}) => {
  const program = returnAnchorProgram(programId, connection);
  const instructions: web3.TransactionInstruction[] = [];
  const [nftsOwner, nftsOwnerSeed] = await web3.PublicKey.findProgramAddress(
    [ENCODER.encode(NFTS_OWNER_PREFIX), accounts.pair.toBuffer()],
    program.programId,
  );

  const adminTokenAccount = await findAssociatedTokenAddress(accounts.admin, accounts.tokenMint);
  const pairTokenAccount = await findAssociatedTokenAddress(nftsOwner, accounts.tokenMint);

  const editionId = getMetaplexEditionPda(accounts.tokenMint);
  const metadataInfo = getMetaplexMetadata(accounts.tokenMint);
  const ownerTokenRecord = findTokenRecordPda(accounts.tokenMint, pairTokenAccount);
  const destTokenRecord = findTokenRecordPda(accounts.tokenMint, adminTokenAccount);
  const ruleSet = await findRuleSetPDA(args.payerRuleSet, args.nameForRuleSet);

  instructions.push(
    await program.methods
      .withdrawOutstandingTokensByAdmin(null)
      .accountsStrict({
        pair: accounts.pair,
        nftsOwner: nftsOwner,
        nftMint: accounts.tokenMint,
        user: accounts.admin,
        nftUserTokenAccount: adminTokenAccount,
        vaultNftTokenAccount: pairTokenAccount,

        instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        metadataInfo,
        ownerTokenRecord,
        destTokenRecord,
        editionInfo: editionId,
        authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,

        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,

        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      }).remainingAccounts(
        [
         {
           pubkey: ruleSet,
           isSigner: false,
           isWritable: false,
         },
       ],
     )
      .instruction(),
  );

  const transaction = new web3.Transaction();
  for (let instruction of instructions) transaction.add(instruction);

  const signers = [];
  await sendTxn(transaction, signers);
  return { account: null, instructions, signers };
};
