import { Program, AnchorProvider, web3, BN, utils, Idl } from '@project-serum/anchor';

import { Hadeswap, IDL } from './idl/hadeswap';

import { createFakeWallet } from '../common';
import { BASE_POINTS, EDITION_PREFIX, METADATA_PREFIX, METADATA_PROGRAM_PUBKEY } from './constants';

import { BondingCurveType, OrderType } from './types';
import { PublicKey } from '@solana/web3.js';

type ReturnAnchorProgram = (programId: web3.PublicKey, connection: web3.Connection) => Program<Hadeswap>;
export const returnAnchorProgram: ReturnAnchorProgram = (programId, connection) =>
  new Program<Hadeswap>(
    IDL as any,
    programId,
    new AnchorProvider(connection, createFakeWallet(), AnchorProvider.defaultOptions()),
  );

// export function returnAnchorProgram2(programId: web3.PublicKey, connection: web3.Connection): Program<NftLendingV2> {
//   // let idl = require('./multi_reward_staking.json');
//   const anchorProgram = new Program<NftLendingV2>(
//     IDL as any,
//     programId,
//     new AnchorProvider(connection, createFakeWallet(), AnchorProvider.defaultOptions()),
//   );
//   return anchorProgram;
// }
type GetMetaplexEditionPda = (mintPubkey: web3.PublicKey) => web3.PublicKey;
export const getMetaplexEditionPda: GetMetaplexEditionPda = (mintPubkey) => {
  const editionPda = utils.publicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_PREFIX),
      METADATA_PROGRAM_PUBKEY.toBuffer(),
      new web3.PublicKey(mintPubkey).toBuffer(),
      Buffer.from(EDITION_PREFIX),
    ],
    METADATA_PROGRAM_PUBKEY,
  );
  return editionPda[0];
};

// let seed = &[
//   b"metadata".as_ref(),
//   metadata_program.as_ref(),
//   nft_mint.as_ref(),
// ];
type GetMetaplexMetadataPda = (mintPubkey: web3.PublicKey) => web3.PublicKey;
export const getMetaplexMetadataPda: GetMetaplexMetadataPda = (mintPubkey) => {
  const metaPda = utils.publicKey.findProgramAddressSync(
    [Buffer.from(METADATA_PREFIX), METADATA_PROGRAM_PUBKEY.toBuffer(), new web3.PublicKey(mintPubkey).toBuffer()],
    METADATA_PROGRAM_PUBKEY,
  );
  return metaPda[0];
};

export const anchorRawBNsAndPubkeysToNumsAndStrings = (rawAccount: { account: any; publicKey: PublicKey }) => {
  const copyRawAccount = { ...rawAccount };
  const newAccount = parseRawAccount(rawAccount.account);
  return { ...newAccount, publicKey: copyRawAccount.publicKey.toBase58() };
};

const parseRawAccount = (rawAccount: any) => {
  const copyRawAccount = { ...rawAccount };
  for (let key in copyRawAccount) {
    if (copyRawAccount[key] === null || copyRawAccount[key] === undefined) continue;
    if (copyRawAccount[key].toNumber) {
      copyRawAccount[key] = copyRawAccount[key].toNumber();
    }

    if (copyRawAccount[key].toBase58) {
      copyRawAccount[key] = copyRawAccount[key].toBase58();
    }
    if (typeof copyRawAccount[key] === 'object' && Object.keys(copyRawAccount[key]).length === 1) {
      copyRawAccount[key] = Object.keys(copyRawAccount[key])[0];
    } else if (typeof copyRawAccount[key] === 'object') {
      copyRawAccount[key] = parseRawAccount(copyRawAccount[key]);
    }
  }
  return copyRawAccount;
};

export const enumToAnchorEnum = (anyEnum: any) => ({ [anyEnum]: {} });

export const calculateNextSpotPrice = ({
  orderType,
  spotPrice,
  delta,
  bondingCurveType,
  counter,
}: {
  orderType: OrderType;
  spotPrice: number;
  delta: number;
  bondingCurveType: BondingCurveType;
  counter: number;
}): number => {
  if (bondingCurveType === BondingCurveType.Linear) {
    let current_price = spotPrice; // 1

    const targetCounter = counter + (orderType === OrderType.Buy ? 1 : -1);
    if (targetCounter >= 0) {
      // 0
      for (let i = 0; i < Math.abs(targetCounter); i++) {
        current_price += delta;
      }
    } else {
      for (let i = 0; i < Math.abs(targetCounter); i++) {
        current_price -= delta;
      }
    }
    return current_price;
  } else if (bondingCurveType === BondingCurveType.Exponential) {
    const newCounter = orderType === OrderType.Buy ? counter + 1 : counter - 1;
    let newDelta = newCounter > 0 ? (delta + 1e4) / 1e4 : 1 / ((delta + 1e4) / 1e4);

    return spotPrice * Math.pow(newDelta, Math.abs(newCounter));
  } else if (bondingCurveType === BondingCurveType.XYK) {
    const currentDelta = delta - counter;
    const diffAmount = (counter * spotPrice) / currentDelta;
    const newSpotPrice = spotPrice + diffAmount;

    return orderType === OrderType.Buy ? newSpotPrice / (currentDelta - 1) : newSpotPrice / (currentDelta + 1);
  }
  return 0;
};

export const getSumOfOrdersSeries = ({
  amountOfOrders,
  orderType,
  spotPrice,
  delta,
  bondingCurveType,
  counter,
}: {
  amountOfOrders: number;
  orderType: OrderType;
  spotPrice: number;
  delta: number;
  bondingCurveType: BondingCurveType;
  counter: number;
}): number => {
  let series_sum = 0;
  let currentSpotPrice = spotPrice;

  let newCounter = counter;
  for (let i = 0; i < amountOfOrders; i++) {
    series_sum += currentSpotPrice;
    currentSpotPrice = calculateNextSpotPrice({
      orderType,
      spotPrice: currentSpotPrice,
      delta,
      bondingCurveType,
      counter: newCounter,
    });

    newCounter = orderType === OrderType.Buy ? newCounter + 1 : newCounter - 1;
  }
  return series_sum;
};

// if quantity_of_orders == 0 {
//   return 0;
// }
// counter = counter.checked_add(1).unwrap();
// let mut starting_spot_price = spot_price; // 1
// let mut next_smallest_buy_order_price = spot_price; //1
// let mut sum: u64 = 0; //1

// for _ in 0..(quantity_of_orders) {
//   next_smallest_buy_order_price = BondingCurve::calculate_next_spot_price(
//       bonding_type,
//       delta,
//       starting_spot_price,
//       false,
//       counter,
//   );

//   sum = sum.checked_add(next_smallest_buy_order_price).unwrap();
//   counter = counter.checked_sub(1).unwrap();
// }
// sum

export const calculatePricesArray = ({
  starting_spot_price,
  delta,
  amount,
  bondingCurveType,
  orderType,
  counter,
}: {
  starting_spot_price: number;
  delta: number;
  amount: number;
  bondingCurveType: BondingCurveType;
  orderType: OrderType;
  counter: number;
}) => {
  const array: any = [];
  let newCounter = counter;

  for (let i = 0; i < amount; i++) {
    const next_price = calculateNextSpotPrice({
      orderType,
      delta,
      bondingCurveType,
      spotPrice: starting_spot_price,
      counter: newCounter,
    });
    array.push(next_price);

    newCounter = orderType === OrderType.Buy ? newCounter + 1 : newCounter - 1;
  }

  const total = array.reduce((acc, price) => acc + price, 0);

  return { array, total };
};
