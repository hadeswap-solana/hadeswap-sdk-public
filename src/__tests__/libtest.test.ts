import { base64, bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { helpers, utils } from '../hadeswap-core';
import { getAllProgramAccounts } from '../hadeswap-core/functions/getters';
import { calculatePricesArray } from '../hadeswap-core/helpers';
import { BondingCurveType, OrderType, PairType } from '../hadeswap-core/types';
import { hadeswap, anchor } from './../index';
// @ts-ignore
jest.setTimeout(1000000000);
const devnetConnection =
  // mainnetConnection;
  new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');

const NEW_DEVNET_PROGRAM = new anchor.web3.PublicKey('21ASy6z4z2UhZ2HtbjWbaCdccjKmQHZ6mDSyjwB9HfZk');
const MAINNET_PROGRAM = new anchor.web3.PublicKey('21ASy6z4z2UhZ2HtbjWbaCdccjKmQHZ6mDSyjwB9HfZk');
// 6wPYbuGRXZjVw2tCeTxwRiQU7AzFDTeFEKuUFpJZpcix
// @ts-ignore
test('Examples', async () => {
  // console.log('tests are working');
  // await testInitializeMarketAndAddToWhitelistAndClose();
  // await getSpecificAccountsScript();
  // await getAllProgramAccountsScript(); //HMU45XvYcCGhQqHPiyEsPWP6ASNn9wVYu3njCpi6s3kf
  // await createClassicAuthorityAdapterScript();
  // await finalizeHadoMarketScript();
  // await addToWhitelistToMarketScript(); //E5TMWE2x6BhSEmcEHTKX8PjdCDzjo2DvT5ehWRpRcNX5
  // await createTokenToNftPairScript();
  // await addSolDepositToTokenToNftPairScript();
  // await createNftToTokenPairScript();
  // await putPairOnMarketScript();
  // await createNftValidationAdapter();
  // await depositNftToPairScript();
  // await depositLiquidityScript();
  // testBuyOrdersSeriesSum();
  // testNextSpotPrice();
  // testViktorsNextSpotPrice();
  // await createLiquidityPairScript();
  // await getMarketData();
  // await testCartManagerCrossPairRebalancing();
  // await testCartManagerSellOrders();
  // await testCartManagerBuyAndSellOrders();
  // await initializeHadoMarketScript();
  // await modifyPairScript();
  // testCalculatePricesArray();
  // getStartingSpotPriceByCurrentAndDelta();
  // await getActivityScript();
});

const getStartingSpotPriceByCurrentAndDelta = () => {
  const current = 1 * 1e9;
  const delta = 0.1 * 1e9;
  const mathCounter = -1;
  const needed_starting_spot_price = helpers.calculateNextSpotPrice({
    orderType: OrderType.Buy,
    delta,
    bondingCurveType: BondingCurveType.Linear,
    spotPrice: current,
    counter: -mathCounter - 1,
  });
  console.log('next_price: ', needed_starting_spot_price);
  // if(mathCounter >= 0) {
  //   for(let i = 0; i < mathCounter; i++) {

  //   }

  // }
};

const testCalculatePricesArray = () => {
  const starting_spot_price = 1.5 * 1e9;
  const delta = 500;
  const pricesArray = calculatePricesArray({
    starting_spot_price,
    delta,
    amount: 4,
    bondingCurveType: BondingCurveType.Exponential,
    orderType: OrderType.Sell,
    counter: 0 + 1,
  });
  console.log('pricesArray: ', pricesArray);

  const pricesArray2 = calculatePricesArray({
    starting_spot_price: 1e9,
    delta,
    amount: 4,
    bondingCurveType: BondingCurveType.Exponential,
    orderType: OrderType.Sell,
    counter: 0 + 1,
  });
  console.log('pricesArray2: ', pricesArray2);
  // const currentCounter = 0;
  // const buyOrdersQuantity = 2;
  // const pricesArray2 = calculatePricesArray({
  //   starting_spot_price,
  //   delta,
  //   amount: 2,
  //   bondingCurveType: BondingCurveType.Linear,
  //   orderType: OrderType.Sell,
  //   counter: buyOrdersQuantity * -1 + 1,
  // });
  // console.log('pricesArray2: ', pricesArray2);
};

const testViktorsNextSpotPrice = () => {
  const source_price = 1 * 1e9;
  const price1 = helpers.calculateNextSpotPrice({
    orderType: OrderType.Buy,
    spotPrice: source_price,
    counter: -1,
    delta: 200000000,
    bondingCurveType: BondingCurveType.Linear,
  });
  // const price2 = helpers.calculateNextSpotPrice({
  //   orderType: OrderType.Sell,
  //   spotPrice: source_price,
  //   counter: 2,
  //   delta: 1000,
  //   bondingCurveType: BondingCurveType.Linear,
  // });
  console.log('price1: ', price1);
  // console.log('price2: ', price2);
};

const bruteforceSolAddress = () => {
  const desiredPrefix = 'hade';
  let currentKeypair = new anchor.web3.Keypair();
  while (currentKeypair.publicKey.toBase58().slice(0, desiredPrefix.length) !== desiredPrefix) {
    currentKeypair = new anchor.web3.Keypair();
    // console.log('current: ', currentKeypair.publicKey.toBase58());
  }

  console.log('found: ', currentKeypair.publicKey.toBase58());
  console.log('secretRaw: ', JSON.stringify(currentKeypair.secretKey));

  console.log('secret: ', JSON.stringify(Array.from(currentKeypair.secretKey)));
};

const getTradeActivitiesBySignaturesScript = async () => {
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');

  const allActivity = await utils.getTradeActivitiesBySignatures({
    signatures: ['127yn36siMSdvUJnH7s1iRNnCuq1143fRYxUb4Ax9hwfZXdpLuPEQQ8Svqh7krxTTvoUQNMnyhyLjQ732J1KunS7'],
    connection: devnetConnection,
  });
  console.log(allActivity);
};

// Make getActivityBySignature
const getActivityScript = async () => {
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');

  const allActivity = await utils.getTradeActivities({
    programId,
    //   fromThisSignature,
    untilThisSignature: '127yn36siMSdvUJnH7s1iRNnCuq1143fRYxUb4Ax9hwfZXdpLuPEQQ8Svqh7krxTTvoUQNMnyhyLjQ732J1KunS7',
    connection: devnetConnection,
  });
  console.log(allActivity);
};

// const testCartManagerBuyOrders = async () => {
//   const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
//   const allAccounts = await hadeswap.functions.getters.getAllProgramAccounts(programId, devnetConnection);

//   console.log('source pair: ', allAccounts.nftSwapPairs[2]);

//   const mockState: utils.cartManager.CartState = {
//     pairsInActionMapState: {},
//     ordersInCartByPairMapState: {},
//     nftToOrderMapState: {},
//   };

//   console.log('mockState: ', { ...mockState, pairs: null });

//   const buyOrdersCount = 3;
//   for (let i = 0; i < buyOrdersCount; i++)
//     utils.cartManager.addToCart(
//       OrderType.Buy,
//       allAccounts.nftPairBoxes[i].nftMint,
//       allAccounts.nftSwapPairs[1],
//       mockState,
//     );

//   console.log('mockStateAfter addCart: ', { ...mockState, pairs: null });
//   const removeOrdersCount = 2;

//   for (let i = 0; i < removeOrdersCount; i++)
//     utils.cartManager.removeFromCart(allAccounts.nftPairBoxes[i].nftMint, mockState);

//   console.log('mockStateAfter removeCart: ', {
//     ...mockState,
//     pairs: null,
//   });
//   console.log('ordersInCartByPairMapState:', mockState.ordersInCartByPairMapState);
// };

const testBuyOrdersSeriesSum = () => {
  const sum = helpers.getSumOfOrdersSeries({
    amountOfOrders: 5,
    orderType: OrderType.Sell,
    spotPrice: 2 * 1e9,
    counter: 0,
    delta: 1000,
    bondingCurveType: BondingCurveType.Linear,
  });

  console.log('sum: ', sum);
};

const testNextSpotPrice = () => {
  // const price1 = helpers.next_spot_price({
  //   orderType: OrderType.Sell,
  //   spot_price: 2 * 1e9,
  //   delta: 1000,
  //   bondingCurveType: BondingCurveType.Linear,
  // });
  // const price2 = helpers.next_spot_price({
  //   orderType: OrderType.Buy,
  //   spot_price: price1,
  //   delta: 1000,
  //   bondingCurveType: BondingCurveType.Linear,
  // });
  // console.log('price1: ', price1);
  // console.log('price2: ', price2);
};

const initializeHadoMarketScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/production_admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = MAINNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());

  const { account: hadoMarket } = await hadeswap.functions.marketFactory.hadoMarket.initializeHadoMarket({
    programId,
    connection: devnetConnection,
    accounts: {
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });

  console.log('hadoMarket: ', hadoMarket.toBase58());
};

const getSpecificAccountsScript = async () => {
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());

  const allAccounts = await hadeswap.functions.getters.getSpecificAccounts('nftSwapPair', programId, devnetConnection);
  console.log('allAccounts: ', allAccounts);
};

// Fees don't play in next spot price math.

// sell spot price: 1e9
// fee 5%.
// User is charged 1e9 + 5% (1e9 + (1e9 * FEES / BASE_POINTS))

// buy spot price: 1e9
// fee 5%.
// User is charged 1e9 + 5% (1e9 + (1e9 * FEES / BASE_POINTS))

const getAllProgramAccountsScript = async () => {
  const programId = NEW_DEVNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());

  const allAccounts = await hadeswap.functions.getters.getAllProgramAccounts(programId, devnetConnection);
  console.log(allAccounts.hadoMarkets);
};

const addToWhitelistToMarketScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/production_admin.json');
  const connection = devnetConnection;
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await connection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = MAINNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const whitelistType = hadeswap.types.NftValidationWhitelistType.Creator;
  const hadoMarket = new anchor.web3.PublicKey('3jPjhb8Wco9hzifkw2DLfvo2QftST88xnh5riTmACWdp');

  const whitelisted_address = new anchor.web3.PublicKey('HMf3GQCYM7F55k37GwxfyPRmFyjHv28fJAcPxUtikDvq');
  const { account: whitelistPubkey } = await hadeswap.functions.marketFactory.hadoMarket.addClassicWhitelistToMarket({
    programId,
    connection: connection,
    args: {
      whitelistType,
    },
    accounts: {
      hadoMarket: hadoMarket,
      whitelisted_address: whitelisted_address,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });

  console.log('whitelistPubkey: ', whitelistPubkey.toBase58());
};

const finalizeHadoMarketScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/production_admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = MAINNET_PROGRAM;
  //  new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const hadoMarket = new anchor.web3.PublicKey('3jPjhb8Wco9hzifkw2DLfvo2QftST88xnh5riTmACWdp');

  await hadeswap.functions.marketFactory.hadoMarket.finishHadoMarket({
    programId,
    connection: devnetConnection,
    accounts: {
      hadoMarket: hadoMarket,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const modifyPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');

  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  // const allAccounts = await getAllProgramAccounts(programId, devnetConnection);

  // const pair = new anchor.web3.PublicKey('4bPfjZ4dDFo81k4LzYg333k3LAjX7ZVP6Hqm1yQiWAjU');
  // const authorityAdapter = allAccounts.authorityAdapters.find(
  //   (authority) => authority.authorityOwner === userKeypair.publicKey.toBase58() && authority.pair === pair.toBase58(),
  // ).publicKey;

  // await hadeswap.functions.marketFactory.pair.virtual.mutations.modifyPair({
  //   programId,
  //   connection: devnetConnection,
  //   args: {
  //     spotPrice: 1 * 1e9,
  //     delta: 0.1 * 1e9,
  //     fee: 0,
  //   },
  //   accounts: {
  //     pair: pair,
  //     authorityAdapter: authorityAdapter,
  //     userPubkey: userKeypair.publicKey,
  //   },
  //   sendTxn: sendTxnUserDevnet,
  // });
};

const createLiquidityPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = NEW_DEVNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const hadoMarket = new anchor.web3.PublicKey('Hd2Rx5cEvFojpBFTHeHXfk1tMNrbSKt1dhNK78LCXPqH');

  await hadeswap.functions.marketFactory.pair.virtual.mutations.initializePair({
    programId,
    connection: devnetConnection,
    args: {
      spotPrice: 1 * 1e9,
      delta: 0.2 * 1e9,
      bondingCurveType: hadeswap.types.BondingCurveType.Linear,
      fee: 0,
      pairType: hadeswap.types.PairType.LiquidityProvision,
    },
    accounts: {
      hadoMarket: hadoMarket,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const createTokenToNftPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const hadoMarket = new anchor.web3.PublicKey('4iJDy7TMzev2qtgrrdZtL3DmEivoY3MPVdebEw3zfkDA');

  await hadeswap.functions.marketFactory.pair.virtual.mutations.initializePair({
    programId,
    connection: devnetConnection,
    args: {
      spotPrice: 1.6 * 1e9,
      delta: 0.1 * 1e9,
      bondingCurveType: hadeswap.types.BondingCurveType.Linear,
      fee: 0,
      pairType: hadeswap.types.PairType.TokenForNFT,
    },
    accounts: {
      hadoMarket: hadoMarket,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const createNftToTokenPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const hadoMarket = new anchor.web3.PublicKey('4iJDy7TMzev2qtgrrdZtL3DmEivoY3MPVdebEw3zfkDA');

  await hadeswap.functions.marketFactory.pair.virtual.mutations.initializePair({
    programId,
    connection: devnetConnection,
    args: {
      spotPrice: 2.2 * 1e9,
      delta: 0.2 * 1e9,
      bondingCurveType: hadeswap.types.BondingCurveType.Linear,
      fee: 0,
      pairType: hadeswap.types.PairType.NftForToken,
    },
    accounts: {
      hadoMarket: hadoMarket,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const createClassicAuthorityAdapterScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = NEW_DEVNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const pair = new anchor.web3.PublicKey('NxoovcU7NEdVWJuYi8NnuLxJobrEtFYxMUxkU9Vw4Wy');

  await hadeswap.functions.marketFactory.pair.virtual.mutations.createClassicAuthorityAdapter({
    programId,
    connection: devnetConnection,
    accounts: {
      pair: pair,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const createNftValidationAdapter = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/production_admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = MAINNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const classicValidationWhitelist = new anchor.web3.PublicKey('3YeRHNoxSvYkVrcghbybkG2CtqysnrVhDxSNVcyTEUPs');

  await hadeswap.functions.marketFactory.hadoMarket.validateNft({
    programId,
    connection: devnetConnection,
    accounts: {
      classicValidationWhitelist: classicValidationWhitelist,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const addSolDepositToTokenToNftPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const allAccounts = await getAllProgramAccounts(programId, devnetConnection);

  const pair = new anchor.web3.PublicKey('FsE3egxUv3eiLDNLT6m4bu6s72dMTjGfYc4Xhk7Yd9rq');
  const authorityAdapter = allAccounts.authorityAdapters.find(
    (authority) => authority.authorityOwner === userKeypair.publicKey.toBase58() && authority.pair === pair.toBase58(),
  ).publicKey;
  await hadeswap.functions.marketFactory.pair.virtual.deposits.depositSolToPair({
    programId,
    connection: devnetConnection,
    args: {
      amountOfOrders: 6,
    },
    accounts: {
      pair: pair,
      authorityAdapter,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const depositLiquidityScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = NEW_DEVNET_PROGRAM;
  // new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');

  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const allAccounts = await getAllProgramAccounts(programId, devnetConnection);

  const pair = new anchor.web3.PublicKey('NxoovcU7NEdVWJuYi8NnuLxJobrEtFYxMUxkU9Vw4Wy');

  const pairAccount = allAccounts.nftSwapPairs.find((pairAcc) => pairAcc.publicKey === pair.toBase58());
  const hadoMarket = new anchor.web3.PublicKey(pairAccount.hadoMarket);
  const authorityAdapter = allAccounts.authorityAdapters.find(
    (authority) => authority.authorityOwner === userKeypair.publicKey.toBase58() && authority.pair === pair.toBase58(),
  ).publicKey;

  // new anchor.web3.PublicKey('9EAdh1Sh3KuThgeyf7VuEPxVKaeYPkBQpctfzCgksjKU');

  const nftValidationAdapter = allAccounts.nftValidationAdapters.find(
    (validationAdapter) => validationAdapter.hadoMarket === hadoMarket.toBase58(),
  ).publicKey;
  //  new anchor.web3.PublicKey('AXFc36FRHsEiiGbmFVAzoSTRmfBCERCkzaARWtd3yPCt');
  const nftMint = new anchor.web3.PublicKey('jRCcvxuoM1B6U94j5p5e93sjmcP8roKvjPfNC4C4YLf');

  await hadeswap.functions.marketFactory.pair.virtual.deposits.depositLiquidityToPair({
    programId,
    connection: devnetConnection,

    accounts: {
      nftValidationAdapter: nftValidationAdapter,
      nftMint: nftMint,
      pair: pair,
      authorityAdapter,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const depositNftToPairScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const allAccounts = await getAllProgramAccounts(programId, devnetConnection);

  const pair = new anchor.web3.PublicKey('2cvYDXuM9XzEZ64bnuvMu59Cc8q3SkHjC6LpeaQpgJqJ');

  const pairAccount = allAccounts.nftSwapPairs.find((pairAcc) => pairAcc.publicKey === pair.toBase58());
  const hadoMarket = new anchor.web3.PublicKey(pairAccount.hadoMarket);
  const authorityAdapter = allAccounts.authorityAdapters.find(
    (authority) => authority.authorityOwner === userKeypair.publicKey.toBase58() && authority.pair === pair.toBase58(),
  ).publicKey;
  const nftValidationAdapter = allAccounts.nftValidationAdapters.find(
    (validationAdapter) => validationAdapter.hadoMarket === hadoMarket.toBase58(),
  ).publicKey;
  const nftMint = new anchor.web3.PublicKey('9H2ixNYCakXGviTUCUfDvdeu5UnUG5YEm1GGrW9v5TTs');

  await hadeswap.functions.marketFactory.pair.virtual.deposits.depositNftToPair({
    programId,
    connection: devnetConnection,

    accounts: {
      nftValidationAdapter: nftValidationAdapter,
      nftMint: nftMint,
      pair: pair,
      authorityAdapter,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};

const putPairOnMarketScript = async () => {
  const userKeypair = await createKeypairFromFile(__dirname + '/keys/admin.json');
  const sendTxnUserDevnet = async (txn, signers) =>
    void (await devnetConnection.sendTransaction(txn, [userKeypair, ...signers]).catch((err) => console.log(err)));
  const programId = NEW_DEVNET_PROGRAM;
  // \new anchor.web3.PublicKey('DFsZgwKM3SvkvMwVRPQhhEnkYZCS1hZ2g2u6ehmAWjyc');
  // console.log('userKeypair: ', userKeypair.publicKey.toBase58());
  const allAccounts = await getAllProgramAccounts(programId, devnetConnection);

  const pair = new anchor.web3.PublicKey('NxoovcU7NEdVWJuYi8NnuLxJobrEtFYxMUxkU9Vw4Wy');
  const authorityAdapter = allAccounts.authorityAdapters.find(
    (authority) => authority.authorityOwner === userKeypair.publicKey.toBase58() && authority.pair === pair.toBase58(),
  ).publicKey;

  await hadeswap.functions.marketFactory.pair.virtual.mutations.putPairOnMarket({
    programId,
    connection: devnetConnection,
    accounts: {
      pair: pair,
      authorityAdapter,
      userPubkey: userKeypair.publicKey,
    },
    sendTxn: sendTxnUserDevnet,
  });
};
const lazyFs = () => {
  const fs = require('fs/promises');
  return fs;
};
const createKeypairFromFile = async (filePath: string) => {
  const secretKeyString = await lazyFs().readFile(filePath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return anchor.web3.Keypair.fromSecretKey(secretKey);
};
