import { web3 } from '@project-serum/anchor';
import { anchorRawBNsAndPubkeysToNumsAndStrings, returnAnchorProgram } from '../../helpers';

export const getAllProgramAccounts = async (
  programId: web3.PublicKey,
  connection: web3.Connection,
): Promise<{
  hadoMarkets: any[];
  nftSwapPairs: any[];
  nftPairBoxes: any[];
  classicValidationWhitelists: any[];
  nftValidationAdapters: any[];
  authorityAdapters: any[];

  adapterWhitelists: any[];
  protocolSettingsV1: any[];
  protocolAdminMultisigs: any[];
  liquidityProvisionOrders: any[];
}> => {
  const program = await returnAnchorProgram(programId, connection);

  const hadoMarketsRaw = await program.account.hadoMarket.all();
  const hadoMarkets = hadoMarketsRaw.map((hadoMarketRaw) => anchorRawBNsAndPubkeysToNumsAndStrings(hadoMarketRaw));

  const nftSwapPairsRaw = await program.account.nftSwapPair.all();
  const nftSwapPairs = nftSwapPairsRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const classicValidationWhitelistsRaw = await program.account.classicValidationWhitelist.all();
  const classicValidationWhitelists = classicValidationWhitelistsRaw.map((acc) =>
    anchorRawBNsAndPubkeysToNumsAndStrings(acc),
  );

  const nftValidationAdaptersRaw = await program.account.nftValidationAdapter.all();
  const nftValidationAdapters = nftValidationAdaptersRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const authorityAdaptersRaw = await program.account.authorityAdapter.all();
  const authorityAdapters = authorityAdaptersRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const nftPairBoxesRaw = await program.account.nftPairBox.all();
  const nftPairBoxes = nftPairBoxesRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const adapterWhitelistsRaw = await program.account.adapterWhitelist.all();
  const adapterWhitelists = adapterWhitelistsRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const protocolSettingsV1Raws = await program.account.protocolSettingsV1.all();
  const protocolSettingsV1 = protocolSettingsV1Raws.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const protocolAdminMultisigsRaw = await program.account.protocolAdminMultisig.all();
  const protocolAdminMultisigs = protocolAdminMultisigsRaw.map((acc) => anchorRawBNsAndPubkeysToNumsAndStrings(acc));

  const liquidityProvisionOrdersRaw = await program.account.liquidityProvisionOrder.all();
  const liquidityProvisionOrders = liquidityProvisionOrdersRaw.map((acc) =>
    anchorRawBNsAndPubkeysToNumsAndStrings(acc),
  );

  return {
    hadoMarkets,
    nftSwapPairs,
    nftPairBoxes,
    classicValidationWhitelists,
    nftValidationAdapters,
    authorityAdapters,

    adapterWhitelists,
    protocolSettingsV1,
    protocolAdminMultisigs,
    liquidityProvisionOrders,
  };
};
