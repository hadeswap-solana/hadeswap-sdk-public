import { web3 } from '@project-serum/anchor';
import { OrderType, PairType } from '../types';

export const getTradeActivities = async ({
  programId,
  fromThisSignature,
  untilThisSignature,
  limit,
  connection,
}: {
  programId: web3.PublicKey;
  fromThisSignature?: string;
  untilThisSignature?: string;
  limit?: number;
  connection: web3.Connection;
}) => {
  const LIMIT = 100;
  let allSignaturesInfos: web3.ConfirmedSignatureInfo[] = [];
  const currentLastSignatureInfo = (
    await connection.getConfirmedSignaturesForAddress2(
      programId,
      {
        limit: 1,
      },
      'confirmed',
    )
  )[0];

  let currentLastSignature = currentLastSignatureInfo.signature;

  let newSignatureInfosLatestToPast = await connection.getConfirmedSignaturesForAddress2(
    programId,
    {
      limit: LIMIT,
      before: fromThisSignature || currentLastSignature,
      until: untilThisSignature,
    },
    'confirmed',
  );

  if (newSignatureInfosLatestToPast.length > 0)
    currentLastSignature = newSignatureInfosLatestToPast[newSignatureInfosLatestToPast.length - 1].signature;

  allSignaturesInfos = [...allSignaturesInfos, ...newSignatureInfosLatestToPast, currentLastSignatureInfo].filter(
    (signatureInfo) => !signatureInfo.err,
  );

  while (newSignatureInfosLatestToPast.length === LIMIT) {
    newSignatureInfosLatestToPast = await connection.getConfirmedSignaturesForAddress2(
      programId,
      {
        limit: LIMIT,
        before: currentLastSignature,
        until: untilThisSignature,
      },
      'confirmed',
    );

    currentLastSignature = newSignatureInfosLatestToPast.filter((signatureInfo) => signatureInfo)[
      newSignatureInfosLatestToPast.length - 1
    ].signature;

    allSignaturesInfos = [...allSignaturesInfos, ...newSignatureInfosLatestToPast].filter(
      (signatureInfo) => !signatureInfo.err,
    );

    if (limit !== undefined && allSignaturesInfos.length >= limit) {
      break;
    }
  }
  // allSignaturesInfos = allSignaturesInfos.filter((signatureInfo) => !signatureInfo.err);

  // console.log('allSignaturesInfos: ', allSignaturesInfos[allSignaturesInfos.length - 1]);

  const tradeTransactions: web3.ParsedTransactionWithMeta[] = await getTradeTransactionsFromSignatures({
    signatures: allSignaturesInfos
      .filter((signatureInfo) => signatureInfo)
      .map((signatureInfo) => signatureInfo.signature),
    connection,
  });

  let allTradeActivities: TradeActivity[] = [];
  for (let tradeTxn of tradeTransactions) {
    const tradeActivities = await parseTransactionInfoToTradeActivities({ tradeTxn, connection, programId });
    allTradeActivities = [...allTradeActivities, ...tradeActivities];
  }

  return allTradeActivities;
};

export const getTradeActivitiesBySignatures = async ({
  signatures,
  connection,
  programId,
}: {
  signatures: string[];
  connection: web3.Connection;
  programId: web3.PublicKey;
}): Promise<TradeActivity[]> => {
  const tradeTransactions: web3.ParsedTransactionWithMeta[] = await getTradeTransactionsFromSignatures({
    signatures,
    connection,
  });

  let allTradeActivities: TradeActivity[] = [];
  for (let tradeTxn of tradeTransactions) {
    const tradeActivities = await parseTransactionInfoToTradeActivities({ tradeTxn, connection, programId });
    allTradeActivities = [...allTradeActivities, ...tradeActivities];
  }

  return allTradeActivities;
};

export const getTradeTransactionsFromSignatures = async ({
  signatures,
  connection,
}: {
  signatures: string[];
  connection: web3.Connection;
}): Promise<web3.ParsedTransactionWithMeta[]> => {
  const tradeTransactions: web3.ParsedTransactionWithMeta[] = [];
  let count = 0;
  for (let signature of signatures) {
    try {
      const currentTransactionInfo: web3.ParsedTransactionWithMeta | null = await connection.getParsedTransaction(
        signature,
        'confirmed',
      );

      if (
        !currentTransactionInfo ||
        !currentTransactionInfo.meta ||
        currentTransactionInfo.meta.err !== null ||
        !isTradeTransactionInfo(currentTransactionInfo as any)
      ) {
        continue;
      }
      tradeTransactions.push(currentTransactionInfo as any);
    } catch (err) {
      console.log(err);
    }
  }
  return tradeTransactions;
};

const isTradeTransactionInfo = (currentTransactionInfo: web3.ParsedTransactionWithMeta): boolean => {
  return currentTransactionInfo.meta?.logMessages?.find(isTradeInstructionLog) !== undefined;
};

export const parseTransactionInfoToTradeActivities = async ({
  tradeTxn,
  connection,
  programId,
}: {
  tradeTxn: web3.ParsedTransactionWithMeta;
  connection: web3.Connection;
  programId: web3.PublicKey;
}): Promise<TradeActivity[]> => {
  const tradeLogs: string[] = tradeTxn.meta?.logMessages?.reduce(
    (tradeLogs, log) => (isTradeInstructionLog(log) ? [...tradeLogs, log] : tradeLogs),
    [] as string[],
  ) as any;

  const innerInstructions: web3.ParsedInnerInstruction[] = tradeTxn.meta?.innerInstructions as any;
  const programInstructions: web3.PartiallyDecodedInstruction[] = tradeTxn.transaction.message.instructions.filter(
    (ix) =>
      ix.programId.toBase58() !== 'ComputeBudget111111111111111111111111111111' &&
      ix.programId.toBase58() === programId.toBase58(),
  ) as any;
  // console.log('innerInstructions: ', innerInstructions);
  // console.log('programInstructions: ', programInstructions);

  const tradeActivities: TradeActivity[] = [];

  for (let i = 0; i < innerInstructions.length; i++) {
    const currentInnerInstruction = innerInstructions[i];
    const currentProgramInstruction = programInstructions[i];
    const currentLog = tradeLogs[i];

    const currentSignature = tradeTxn.transaction.signatures[0];
    const blockTime = tradeTxn.blockTime;

    if (!TRADE_TRANSACTION_PARSERS[currentLog]) continue;
    const parsedTradeActivity = await TRADE_TRANSACTION_PARSERS[currentLog]({
      innerInstruction: currentInnerInstruction,
      programInstruction: currentProgramInstruction,
      signature: currentSignature,
      blockTime,
      connection,
    });

    if (!parsedTradeActivity) continue;
    tradeActivities.push(parsedTradeActivity);
  }

  return tradeActivities;
};

const isTradeInstructionLog = (log: string) =>
  log === TradeInstruction.BuyNftFromPair ||
  log === TradeInstruction.SellNftToTokenToNftPair ||
  log === TradeInstruction.SellNftToLiquidityPair;

export interface TradeActivity {
  timestamp: number;
  signature: string;
  pair: string;
  orderType: OrderType;
  pairType: PairType | null;

  nftMint: string;
  solAmount: number;

  userMaker: string | null;
  userTaker: string;
}

enum TradeInstruction {
  BuyNftFromPair = 'Program log: Instruction: BuyNftFromPair',
  SellNftToTokenToNftPair = 'Program log: Instruction: SellNftToTokenToNftPair',
  SellNftToLiquidityPair = 'Program log: Instruction: SellNftToLiquidityPair',
}

const TRADE_TRANSACTION_PARSERS = {
  [TradeInstruction.BuyNftFromPair]: async ({
    innerInstruction,
    programInstruction,
    signature,
    blockTime,
    connection,
  }: {
    innerInstruction: web3.ParsedInnerInstruction;
    programInstruction: web3.PartiallyDecodedInstruction;
    signature: string;
    blockTime: number;
    connection: web3.Connection;
  }): Promise<TradeActivity> => {
    const solAmount = getTransferAmountFromInnerInstructions(innerInstruction);
    const orderType = OrderType.Buy;
    const pair = programInstruction.accounts[1];
    const userTaker = programInstruction.accounts[2];
    const userMaker = programInstruction.accounts[9];
    const nftMint = programInstruction.accounts[6];

    return {
      timestamp: blockTime,
      signature: signature,
      pair: pair ? pair.toBase58() : '',
      orderType: orderType,
      pairType: null,
      nftMint: nftMint ? nftMint.toBase58() : '',
      solAmount: solAmount,
      userMaker: userMaker ? userMaker.toBase58() : '',
      userTaker: userTaker ? userTaker.toBase58() : '',
    };
  },
  [TradeInstruction.SellNftToTokenToNftPair]: async ({
    innerInstruction,
    programInstruction,
    signature,
    blockTime,
    connection,
  }: {
    innerInstruction: web3.ParsedInnerInstruction;
    programInstruction: web3.PartiallyDecodedInstruction;
    signature: string;
    blockTime: number;
    connection: web3.Connection;
  }): Promise<TradeActivity> => {
    const solAmount = getTransferAmountFromInnerInstructions(innerInstruction);
    const orderType = OrderType.Sell;
    const pair = programInstruction.accounts[0];
    const userTaker = programInstruction.accounts[2];
    const userMaker = programInstruction.accounts[7];
    const nftMint = programInstruction.accounts[3];

    return {
      timestamp: blockTime,
      signature: signature,
      pair: pair ? pair.toBase58() : '',
      orderType: orderType,
      pairType: PairType.TokenForNFT,
      nftMint: nftMint ? nftMint.toBase58() : '',
      solAmount: solAmount,
      userMaker: userMaker ? userMaker.toBase58() : '',
      userTaker: userTaker ? userTaker.toBase58() : '',
    };
  },
  [TradeInstruction.SellNftToLiquidityPair]: async ({
    innerInstruction,
    programInstruction,
    signature,
    blockTime,
    connection,
  }: {
    innerInstruction: web3.ParsedInnerInstruction;
    programInstruction: web3.PartiallyDecodedInstruction;
    signature: string;
    blockTime: number;
    connection: web3.Connection;
  }): Promise<TradeActivity> => {
    // try {
    const solAmount = getTransferAmountFromInnerInstructions(innerInstruction);
    const orderType = OrderType.Sell;
    const pair = programInstruction.accounts[1];
    const userTaker = programInstruction.accounts[3];
    // const userMaker = programInstruction.accounts[7];
    const nftMint = programInstruction.accounts[4];

    return {
      timestamp: blockTime,
      signature: signature,
      pair: pair ? pair.toBase58() : '',
      orderType: orderType,
      pairType: PairType.LiquidityProvision,
      nftMint: nftMint ? nftMint.toBase58() : '',
      solAmount: solAmount,
      userMaker: null,
      userTaker: userTaker ? userTaker.toBase58() : '',
    };
    // } catch(err) }
  },
};

const getTransferAmountFromInnerInstructions = (innerInstruction: web3.ParsedInnerInstruction) => {
  return innerInstruction.instructions
    .filter((instruction) => (instruction as any).program === InnerProgramTypes.System)
    .filter((instruction: any) => instruction.parsed.type === InnerInstructionTypes.Transfer)
    .reduce((amount, instruction: any) => {
      return amount + instruction.parsed.info.lamports;
    }, 0);
};

enum InnerProgramTypes {
  System = 'system',
  SplToken = 'spl-token',
}

enum InnerInstructionTypes {
  Transfer = 'transfer',
}
