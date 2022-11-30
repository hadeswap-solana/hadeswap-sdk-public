import { anchorRawBNsAndPubkeysToNumsAndStrings, returnAnchorProgram } from '../../../helpers';
import { AccountsChanged, TransactionAccountParserParams } from './onAccountsChange';

export const TRANSACTION_ACCOUNT_PARSERS = {
  'Program log: Instruction: InitializePair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });
    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },
  'Program log: Instruction: CreateClassicAuthorityAdapter': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const authorityAdapterPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const authorityAdapter = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.authorityAdapter.fetch(authorityAdapterPubkey, 'confirmed'),
      publicKey: authorityAdapterPubkey,
    });
    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [authorityAdapter],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: DepositSolToPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [pair],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: ValidateNft': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const nftValidationAdapterPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const nftValidationAdapter = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftValidationAdapter.fetch(nftValidationAdapterPubkey, 'confirmed'),
      publicKey: nftValidationAdapterPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [nftValidationAdapter],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: DepositNftToPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const nftPairBoxPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const nftPairBox = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkey, 'confirmed'),
      publicKey: nftPairBoxPubkey,
    });
    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });
    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBox],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: InitializeHadoMarket': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const hadoMarketPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const hadoMarket = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.hadoMarket.fetch(hadoMarketPubkey, 'confirmed'),
      publicKey: hadoMarketPubkey,
    });

    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [hadoMarket],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: FinishHadoMarket': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const hadoMarketPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const hadoMarket = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.hadoMarket.fetch(hadoMarketPubkey, 'confirmed'),
      publicKey: hadoMarketPubkey,
    });

    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [hadoMarket],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: AddClassicWhitelistToMarket': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const classicValidationWhitelistPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const classicValidationWhitelist = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.classicValidationWhitelist.fetch(classicValidationWhitelistPubkey, 'confirmed'),
      publicKey: classicValidationWhitelistPubkey,
    });

    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [classicValidationWhitelist],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: DepositLiquidityToPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const liquidityProvisionOrderPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const liquidityProvisionOrder = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkey, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkey,
    });

    const nftPairBoxPubkey = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const nftPairBox = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkey, 'confirmed'),
      publicKey: nftPairBoxPubkey,
    });

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[2];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    // await fetchAndParseLoan({
    //   programId,
    //   connection,
    //   loanPubkey: (transaction.transaction.message.instructions[0] as any).accounts[0],
    // });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBox],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [liquidityProvisionOrder],
    };
  },

  'Program log: Instruction: PutPairOnMarket': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: BuyNftFromPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const nftPairBoxPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const nftPairBox = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkey, 'confirmed'),
      publicKey: nftPairBoxPubkey,
    });
    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBox],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: SellNftToTokenToNftPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: SellNftToLiquidityPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);
    const nftPairBoxPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const nftPairBox = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkey, 'confirmed'),
      publicKey: nftPairBoxPubkey,
    });
    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBox],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: WithdrawSolFromPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: WithdrawNftFromPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const nftPairBoxPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const nftPairBox = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkey, 'confirmed'),
      publicKey: nftPairBoxPubkey,
    });

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[2];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBox],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: WithdrawLiquidityFromBalancedPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const nftPairBoxPubkeyFirst = (transaction.transaction.message.instructions[0] as any).accounts[2];

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[4];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    const liquidityProvisionOrderPubkeyFirst = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const liquidityProvisionOrderFirst = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeyFirst, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeyFirst,
    });

    const liquidityProvisionOrderPubkeySecond = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const liquidityProvisionOrderSecond = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeySecond, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeySecond,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [{ publicKey: nftPairBoxPubkeyFirst.toBase58() }],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [liquidityProvisionOrderFirst, liquidityProvisionOrderSecond],
    };
  },

  'Program log: Instruction: ModifyPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: WithdrawLiquidityFromBuyOrdersPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[3];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    const liquidityProvisionOrderPubkeyFirst = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const liquidityProvisionOrderFirst = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeyFirst, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeyFirst,
    });

    const liquidityProvisionOrderPubkeySecond = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const liquidityProvisionOrderSecond = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeySecond, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeySecond,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [liquidityProvisionOrderFirst, liquidityProvisionOrderSecond],
    };
  },

  'Program log: Instruction: WithdrawLiquidityFromSellOrdersPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[11];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    const liquidityProvisionOrderPubkeyFirst = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const liquidityProvisionOrderFirst = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeyFirst, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeyFirst,
    });

    const liquidityProvisionOrderPubkeySecond = (transaction.transaction.message.instructions[0] as any).accounts[1];
    const liquidityProvisionOrderSecond = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkeySecond, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkeySecond,
    });

    const nftPairBoxPubkeyFirst = (transaction.transaction.message.instructions[0] as any).accounts[2];
    const nftPairBoxFirst = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkeyFirst, 'confirmed'),
      publicKey: nftPairBoxPubkeyFirst,
    });

    const nftPairBoxPubkeySecond = (transaction.transaction.message.instructions[0] as any).accounts[3];
    const nftPairBoxSecond = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftPairBox.fetch(nftPairBoxPubkeySecond, 'confirmed'),
      publicKey: nftPairBoxPubkeySecond,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [pair],
      nftPairBoxes: [nftPairBoxFirst, nftPairBoxSecond],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [liquidityProvisionOrderFirst, liquidityProvisionOrderSecond],
    };
  },

  'Program log: Instruction: WithdrawLiquidityOrderVirtualFees': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const liquidityProvisionOrderPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const liquidityProvisionOrder = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.liquidityProvisionOrder.fetch(liquidityProvisionOrderPubkey, 'confirmed'),
      publicKey: liquidityProvisionOrderPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [liquidityProvisionOrder],
    };
  },

  'Program log: Instruction: CloseVirtualNftSwapPair': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [{ publicKey: pairPubkey.toBase58() }],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },

  'Program log: Instruction: WithdrawVirtualFees': async ({
    transaction,
    programId,
    connection,
  }: TransactionAccountParserParams): Promise<AccountsChanged> => {
    // console.log('propose txn: ', JSON.stringify(transaction));
    const program = await returnAnchorProgram(programId, connection);

    const pairPubkey = (transaction.transaction.message.instructions[0] as any).accounts[0];
    const pair = anchorRawBNsAndPubkeysToNumsAndStrings({
      account: await program.account.nftSwapPair.fetch(pairPubkey, 'confirmed'),
      publicKey: pairPubkey,
    });

    return {
      hadoMarkets: [],
      nftSwapPairs: [],
      nftPairBoxes: [pair],
      classicValidationWhitelists: [],
      nftValidationAdapters: [],
      authorityAdapters: [],

      adapterWhitelists: [],
      protocolSettingsV1: [],
      protocolAdminMultisigs: [],
      liquidityProvisionOrders: [],
    };
  },
};
