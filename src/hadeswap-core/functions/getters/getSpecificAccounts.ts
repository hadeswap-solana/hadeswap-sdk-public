import { web3 } from '@project-serum/anchor';
import { anchorRawBNsAndPubkeysToNumsAndStrings, returnAnchorProgram } from '../../helpers';

export const getSpecificAccounts = async (
  accountId: string,
  programId: web3.PublicKey,
  connection: web3.Connection,
): Promise<any[]> => {
  const program = await returnAnchorProgram(programId, connection);

  const anyAccountsRaw = await program.account[accountId].all();
  const anyAccounts = anyAccountsRaw.map((anyAccountRaw) => anchorRawBNsAndPubkeysToNumsAndStrings(anyAccountRaw));

  return anyAccounts;
};
