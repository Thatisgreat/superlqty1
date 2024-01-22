import { Log } from '@ethersproject/abstract-provider';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
import {
  CallOverrides,
  EventFilter,
  Overrides,
  PayableOverrides,
} from '@ethersproject/contracts';

import { _TypedLiquityContract, _TypedLogDescription } from '../index';

interface BorrowerOperationsCalls {
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DEBT_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  checkRecoveryMode(
    TCR: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  debtToken(_overrides?: CallOverrides): Promise<string>;
  factory(_overrides?: CallOverrides): Promise<string>;
  getCompositeDebt(
    _debt: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  isApprovedDelegate(
    owner: string,
    caller: string,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  minNetDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  troveManagersData(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{ collateralToken: string; index: number }>;
}

interface BorrowerOperationsTransactions {
  addColl(
    troveManager: string,
    account: string,
    _collateralAmount: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
  adjustTrove(
    troveManager: string,
    account: string,
    _maxFeePercentage: BigNumberish,
    _collDeposit: BigNumberish,
    _collWithdrawal: BigNumberish,
    _debtChange: BigNumberish,
    _isDebtIncrease: boolean,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
  closeTrove(
    troveManager: string,
    account: string,
    _overrides?: Overrides,
  ): Promise<void>;
  configureCollateral(
    troveManager: string,
    collateralToken: string,
    _overrides?: Overrides,
  ): Promise<void>;
  fetchBalances(_overrides?: Overrides): Promise<{
    collaterals: BigNumber[];
    debts: BigNumber[];
    prices: BigNumber[];
  }>;
  getGlobalSystemBalances(
    _overrides?: Overrides,
  ): Promise<{ totalPricedCollateral: BigNumber; totalDebt: BigNumber }>;
  getTCR(_overrides?: Overrides): Promise<BigNumber>;
  openTrove(
    troveManager: string,
    account: string,
    _maxFeePercentage: BigNumberish,
    _collateralAmount: BigNumberish,
    _debtAmount: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
  removeTroveManager(
    troveManager: string,
    _overrides?: Overrides,
  ): Promise<void>;
  repayDebt(
    troveManager: string,
    account: string,
    _debtAmount: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
  setDelegateApproval(
    _delegate: string,
    _isApproved: boolean,
    _overrides?: Overrides,
  ): Promise<void>;
  setMinNetDebt(
    _minNetDebt: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  withdrawColl(
    troveManager: string,
    account: string,
    _collWithdrawal: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
  withdrawDebt(
    troveManager: string,
    account: string,
    _maxFeePercentage: BigNumberish,
    _debtAmount: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface BorrowerOperations
  extends _TypedLiquityContract<
    BorrowerOperationsCalls,
    BorrowerOperationsTransactions
  > {
  readonly filters: {
    BorrowingFeePaid(
      borrower?: string | null,
      collateralToken?: null,
      amount?: null,
    ): EventFilter;
    CollateralConfigured(
      troveManager?: null,
      collateralToken?: null,
    ): EventFilter;
    DelegateApprovalSet(
      caller?: string | null,
      delegate?: string | null,
      isApproved?: null,
    ): EventFilter;
    TroveManagerRemoved(troveManager?: null): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'BorrowingFeePaid',
  ): _TypedLogDescription<{
    borrower: string;
    collateralToken: string;
    amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'CollateralConfigured',
  ): _TypedLogDescription<{ troveManager: string; collateralToken: string }>[];
  extractEvents(
    logs: Log[],
    name: 'DelegateApprovalSet',
  ): _TypedLogDescription<{
    caller: string;
    delegate: string;
    isApproved: boolean;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'TroveManagerRemoved',
  ): _TypedLogDescription<{ troveManager: string }>[];
}

interface DebtTokenCalls {
  DEBT_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  DEFAULT_PAYLOAD_SIZE_LIMIT(_overrides?: CallOverrides): Promise<BigNumber>;
  FLASH_LOAN_FEE(_overrides?: CallOverrides): Promise<BigNumber>;
  NO_EXTRA_GAS(_overrides?: CallOverrides): Promise<BigNumber>;
  PT_SEND(_overrides?: CallOverrides): Promise<number>;
  allowance(
    owner: string,
    spender: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  circulatingSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  decimals(_overrides?: CallOverrides): Promise<number>;
  domainSeparator(_overrides?: CallOverrides): Promise<string>;
  estimateSendFee(
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _useZro: boolean,
    _adapterParams: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<{ nativeFee: BigNumber; zroFee: BigNumber }>;
  factory(_overrides?: CallOverrides): Promise<string>;
  failedMessages(
    arg0: BigNumberish,
    arg1: BytesLike,
    arg2: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  flashFee(
    token: string,
    amount: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  gasPool(_overrides?: CallOverrides): Promise<string>;
  getConfig(
    _version: BigNumberish,
    _chainId: BigNumberish,
    arg2: string,
    _configType: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  getTrustedRemoteAddress(
    _remoteChainId: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  isTrustedRemote(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  lzEndpoint(_overrides?: CallOverrides): Promise<string>;
  maxFlashLoan(token: string, _overrides?: CallOverrides): Promise<BigNumber>;
  minDstGasLookup(
    arg0: BigNumberish,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  name(_overrides?: CallOverrides): Promise<string>;
  nonces(owner: string, _overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  payloadSizeLimitLookup(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  permitTypeHash(_overrides?: CallOverrides): Promise<string>;
  precrime(_overrides?: CallOverrides): Promise<string>;
  stabilityPoolAddress(_overrides?: CallOverrides): Promise<string>;
  supportsInterface(
    interfaceId: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  token(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  troveManager(arg0: string, _overrides?: CallOverrides): Promise<boolean>;
  trustedRemoteLookup(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  useCustomAdapterParams(_overrides?: CallOverrides): Promise<boolean>;
  version(_overrides?: CallOverrides): Promise<string>;
}

interface DebtTokenTransactions {
  approve(
    spender: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  burn(
    _account: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  burnWithGasCompensation(
    _account: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  enableTroveManager(
    _troveManager: string,
    _overrides?: Overrides,
  ): Promise<void>;
  flashLoan(
    receiver: string,
    token: string,
    amount: BigNumberish,
    data: BytesLike,
    _overrides?: Overrides,
  ): Promise<boolean>;
  forceResumeReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  increaseAllowance(
    spender: string,
    addedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  lzReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  mint(
    _account: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  mintWithGasCompensation(
    _account: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  nonblockingLzReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  permit(
    owner: string,
    spender: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  renounceOwnership(_overrides?: Overrides): Promise<void>;
  retryMessage(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: PayableOverrides,
  ): Promise<void>;
  returnFromPool(
    _poolAddress: string,
    _receiver: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  sendFrom(
    _from: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _refundAddress: string,
    _zroPaymentAddress: string,
    _adapterParams: BytesLike,
    _overrides?: PayableOverrides,
  ): Promise<void>;
  sendToSP(
    _sender: string,
    _amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setConfig(
    _version: BigNumberish,
    _chainId: BigNumberish,
    _configType: BigNumberish,
    _config: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setMinDstGas(
    _dstChainId: BigNumberish,
    _packetType: BigNumberish,
    _minGas: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setPayloadSizeLimit(
    _dstChainId: BigNumberish,
    _size: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setPrecrime(_precrime: string, _overrides?: Overrides): Promise<void>;
  setReceiveVersion(
    _version: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setSendVersion(_version: BigNumberish, _overrides?: Overrides): Promise<void>;
  setTrustedRemote(
    _srcChainId: BigNumberish,
    _path: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setTrustedRemoteAddress(
    _remoteChainId: BigNumberish,
    _remoteAddress: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setUseCustomAdapterParams(
    _useCustomAdapterParams: boolean,
    _overrides?: Overrides,
  ): Promise<void>;
  transfer(
    recipient: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferFrom(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface DebtToken
  extends _TypedLiquityContract<DebtTokenCalls, DebtTokenTransactions> {
  readonly filters: {
    Approval(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): EventFilter;
    MessageFailed(
      _srcChainId?: null,
      _srcAddress?: null,
      _nonce?: null,
      _payload?: null,
      _reason?: null,
    ): EventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null,
    ): EventFilter;
    ReceiveFromChain(
      _srcChainId?: BigNumberish | null,
      _to?: string | null,
      _amount?: null,
    ): EventFilter;
    RetryMessageSuccess(
      _srcChainId?: null,
      _srcAddress?: null,
      _nonce?: null,
      _payloadHash?: null,
    ): EventFilter;
    SendToChain(
      _dstChainId?: BigNumberish | null,
      _from?: string | null,
      _toAddress?: null,
      _amount?: null,
    ): EventFilter;
    SetMinDstGas(
      _dstChainId?: null,
      _type?: null,
      _minDstGas?: null,
    ): EventFilter;
    SetPrecrime(precrime?: null): EventFilter;
    SetTrustedRemote(_remoteChainId?: null, _path?: null): EventFilter;
    SetTrustedRemoteAddress(
      _remoteChainId?: null,
      _remoteAddress?: null,
    ): EventFilter;
    SetUseCustomAdapterParams(_useCustomAdapterParams?: null): EventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'Approval',
  ): _TypedLogDescription<{
    owner: string;
    spender: string;
    value: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'MessageFailed',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _srcAddress: string;
    _nonce: BigNumber;
    _payload: string;
    _reason: string;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'OwnershipTransferred',
  ): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(
    logs: Log[],
    name: 'ReceiveFromChain',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _to: string;
    _amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'RetryMessageSuccess',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _srcAddress: string;
    _nonce: BigNumber;
    _payloadHash: string;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SendToChain',
  ): _TypedLogDescription<{
    _dstChainId: number;
    _from: string;
    _toAddress: string;
    _amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SetMinDstGas',
  ): _TypedLogDescription<{
    _dstChainId: number;
    _type: number;
    _minDstGas: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SetPrecrime',
  ): _TypedLogDescription<{ precrime: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetTrustedRemote',
  ): _TypedLogDescription<{ _remoteChainId: number; _path: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetTrustedRemoteAddress',
  ): _TypedLogDescription<{ _remoteChainId: number; _remoteAddress: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetUseCustomAdapterParams',
  ): _TypedLogDescription<{ _useCustomAdapterParams: boolean }>[];
  extractEvents(
    logs: Log[],
    name: 'Transfer',
  ): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}

interface FactoryCalls {
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  borrowerOperations(_overrides?: CallOverrides): Promise<string>;
  debtToken(_overrides?: CallOverrides): Promise<string>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  liquidationManager(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  sortedTrovesImpl(_overrides?: CallOverrides): Promise<string>;
  stabilityPool(_overrides?: CallOverrides): Promise<string>;
  troveManagerCount(_overrides?: CallOverrides): Promise<BigNumber>;
  troveManagerImpl(_overrides?: CallOverrides): Promise<string>;
  troveManagers(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
}

interface FactoryTransactions {
  deployNewInstance(
    collateral: string,
    priceFeed: string,
    customTroveManagerImpl: string,
    customSortedTrovesImpl: string,
    params: {
      minuteDecayFactor: BigNumberish;
      redemptionFeeFloor: BigNumberish;
      maxRedemptionFee: BigNumberish;
      borrowingFeeFloor: BigNumberish;
      maxBorrowingFee: BigNumberish;
      interestRateInBps: BigNumberish;
      maxDebt: BigNumberish;
      MCR: BigNumberish;
    },
    _overrides?: Overrides,
  ): Promise<void>;
  setImplementations(
    _troveManagerImpl: string,
    _sortedTrovesImpl: string,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface Factory
  extends _TypedLiquityContract<FactoryCalls, FactoryTransactions> {
  readonly filters: {
    NewDeployment(
      collateral?: null,
      priceFeed?: null,
      troveManager?: null,
      sortedTroves?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'NewDeployment',
  ): _TypedLogDescription<{
    collateral: string;
    priceFeed: string;
    troveManager: string;
    sortedTroves: string;
  }>[];
}

interface GasPoolCalls {}

interface GasPoolTransactions {}

export interface GasPool
  extends _TypedLiquityContract<GasPoolCalls, GasPoolTransactions> {
  readonly filters: {};
}

interface LiquidationManagerCalls {
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DEBT_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperations(_overrides?: CallOverrides): Promise<string>;
  factory(_overrides?: CallOverrides): Promise<string>;
  stabilityPool(_overrides?: CallOverrides): Promise<string>;
}

interface LiquidationManagerTransactions {
  batchLiquidateTroves(
    troveManager: string,
    _troveArray: string[],
    _overrides?: Overrides,
  ): Promise<void>;
  enableTroveManager(
    _troveManager: string,
    _overrides?: Overrides,
  ): Promise<void>;
  liquidate(
    troveManager: string,
    borrower: string,
    _overrides?: Overrides,
  ): Promise<void>;
  liquidateTroves(
    troveManager: string,
    maxTrovesToLiquidate: BigNumberish,
    maxICR: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface LiquidationManager
  extends _TypedLiquityContract<
    LiquidationManagerCalls,
    LiquidationManagerTransactions
  > {
  readonly filters: {
    Liquidation(
      _liquidatedDebt?: null,
      _liquidatedColl?: null,
      _collGasCompensation?: null,
      _debtGasCompensation?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'Liquidation',
  ): _TypedLogDescription<{
    _liquidatedDebt: BigNumber;
    _liquidatedColl: BigNumber;
    _collGasCompensation: BigNumber;
    _debtGasCompensation: BigNumber;
  }>[];
}

interface MultiCollateralHintHelpersCalls {
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DEBT_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperations(_overrides?: CallOverrides): Promise<string>;
  computeCR(
    _coll: BigNumberish,
    _debt: BigNumberish,
    _price: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  computeNominalCR(
    _coll: BigNumberish,
    _debt: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getApproxHint(
    troveManager: string,
    _CR: BigNumberish,
    _numTrials: BigNumberish,
    _inputRandomSeed: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<{
    hintAddress: string;
    diff: BigNumber;
    latestRandomSeed: BigNumber;
  }>;
  getRedemptionHints(
    troveManager: string,
    _debtAmount: BigNumberish,
    _price: BigNumberish,
    _maxIterations: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<{
    firstRedemptionHint: string;
    partialRedemptionHintNICR: BigNumber;
    truncatedDebtAmount: BigNumber;
  }>;
}

interface MultiCollateralHintHelpersTransactions {}

export interface MultiCollateralHintHelpers
  extends _TypedLiquityContract<
    MultiCollateralHintHelpersCalls,
    MultiCollateralHintHelpersTransactions
  > {
  readonly filters: {};
}

interface MultiTroveGetterCalls {
  getMultipleSortedTroves(
    troveManager: string,
    _startIdx: BigNumberish,
    _count: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<
    {
      owner: string;
      debt: BigNumber;
      coll: BigNumber;
      stake: BigNumber;
      snapshotCollateral: BigNumber;
      snapshotDebt: BigNumber;
    }[]
  >;
}

interface MultiTroveGetterTransactions {}

export interface MultiTroveGetter
  extends _TypedLiquityContract<
    MultiTroveGetterCalls,
    MultiTroveGetterTransactions
  > {
  readonly filters: {};
}

interface PriceFeedCalls {
  MAX_PRICE_DEVIATION_FROM_PREVIOUS_ROUND(
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  RESPONSE_TIMEOUT_BUFFER(_overrides?: CallOverrides): Promise<BigNumber>;
  TARGET_DIGITS(_overrides?: CallOverrides): Promise<BigNumber>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  oracleRecords(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{
    chainLinkOracle: string;
    decimals: number;
    heartbeat: number;
    sharePriceSignature: string;
    sharePriceDecimals: number;
    isFeedWorking: boolean;
    isEthIndexed: boolean;
  }>;
  owner(_overrides?: CallOverrides): Promise<string>;
  priceRecords(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{
    scaledPrice: BigNumber;
    timestamp: number;
    lastUpdated: number;
    roundId: BigNumber;
  }>;
}

interface PriceFeedTransactions {
  fetchPrice(_token: string, _overrides?: Overrides): Promise<BigNumber>;
  setOracle(
    _token: string,
    _chainlinkOracle: string,
    _heartbeat: BigNumberish,
    sharePriceSignature: BytesLike,
    sharePriceDecimals: BigNumberish,
    _isEthIndexed: boolean,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface PriceFeed
  extends _TypedLiquityContract<PriceFeedCalls, PriceFeedTransactions> {
  readonly filters: {
    NewOracleRegistered(
      token?: null,
      chainlinkAggregator?: null,
      isEthIndexed?: null,
    ): EventFilter;
    PriceFeedStatusUpdated(
      token?: null,
      oracle?: null,
      isWorking?: null,
    ): EventFilter;
    PriceRecordUpdated(token?: string | null, _price?: null): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'NewOracleRegistered',
  ): _TypedLogDescription<{
    token: string;
    chainlinkAggregator: string;
    isEthIndexed: boolean;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'PriceFeedStatusUpdated',
  ): _TypedLogDescription<{
    token: string;
    oracle: string;
    isWorking: boolean;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'PriceRecordUpdated',
  ): _TypedLogDescription<{ token: string; _price: BigNumber }>[];
}

interface PrismaCoreCalls {
  OWNERSHIP_TRANSFER_DELAY(_overrides?: CallOverrides): Promise<BigNumber>;
  feeReceiver(_overrides?: CallOverrides): Promise<string>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  ownershipTransferDeadline(_overrides?: CallOverrides): Promise<BigNumber>;
  paused(_overrides?: CallOverrides): Promise<boolean>;
  pendingOwner(_overrides?: CallOverrides): Promise<string>;
  priceFeed(_overrides?: CallOverrides): Promise<string>;
  startTime(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface PrismaCoreTransactions {
  acceptTransferOwnership(_overrides?: Overrides): Promise<void>;
  commitTransferOwnership(
    newOwner: string,
    _overrides?: Overrides,
  ): Promise<void>;
  revokeTransferOwnership(_overrides?: Overrides): Promise<void>;
  setFeeReceiver(_feeReceiver: string, _overrides?: Overrides): Promise<void>;
  setGuardian(_guardian: string, _overrides?: Overrides): Promise<void>;
  setPaused(_paused: boolean, _overrides?: Overrides): Promise<void>;
  setPriceFeed(_priceFeed: string, _overrides?: Overrides): Promise<void>;
}

export interface PrismaCore
  extends _TypedLiquityContract<PrismaCoreCalls, PrismaCoreTransactions> {
  readonly filters: {
    FeeReceiverSet(feeReceiver?: null): EventFilter;
    GuardianSet(guardian?: null): EventFilter;
    NewOwnerAccepted(oldOwner?: null, owner?: null): EventFilter;
    NewOwnerCommitted(
      owner?: null,
      pendingOwner?: null,
      deadline?: null,
    ): EventFilter;
    NewOwnerRevoked(owner?: null, revokedOwner?: null): EventFilter;
    Paused(): EventFilter;
    PriceFeedSet(priceFeed?: null): EventFilter;
    Unpaused(): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'FeeReceiverSet',
  ): _TypedLogDescription<{ feeReceiver: string }>[];
  extractEvents(
    logs: Log[],
    name: 'GuardianSet',
  ): _TypedLogDescription<{ guardian: string }>[];
  extractEvents(
    logs: Log[],
    name: 'NewOwnerAccepted',
  ): _TypedLogDescription<{ oldOwner: string; owner: string }>[];
  extractEvents(
    logs: Log[],
    name: 'NewOwnerCommitted',
  ): _TypedLogDescription<{
    owner: string;
    pendingOwner: string;
    deadline: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'NewOwnerRevoked',
  ): _TypedLogDescription<{ owner: string; revokedOwner: string }>[];
  extractEvents(logs: Log[], name: 'Paused'): _TypedLogDescription<{}>[];
  extractEvents(
    logs: Log[],
    name: 'PriceFeedSet',
  ): _TypedLogDescription<{ priceFeed: string }>[];
  extractEvents(logs: Log[], name: 'Unpaused'): _TypedLogDescription<{}>[];
}

interface PrismaTokenCalls {
  DEFAULT_PAYLOAD_SIZE_LIMIT(_overrides?: CallOverrides): Promise<BigNumber>;
  NO_EXTRA_GAS(_overrides?: CallOverrides): Promise<BigNumber>;
  PT_SEND(_overrides?: CallOverrides): Promise<number>;
  allowance(
    owner: string,
    spender: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  circulatingSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  decimals(_overrides?: CallOverrides): Promise<number>;
  domainSeparator(_overrides?: CallOverrides): Promise<string>;
  estimateSendFee(
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _useZro: boolean,
    _adapterParams: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<{ nativeFee: BigNumber; zroFee: BigNumber }>;
  failedMessages(
    arg0: BigNumberish,
    arg1: BytesLike,
    arg2: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  getConfig(
    _version: BigNumberish,
    _chainId: BigNumberish,
    arg2: string,
    _configType: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  getTrustedRemoteAddress(
    _remoteChainId: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  isTrustedRemote(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  locker(_overrides?: CallOverrides): Promise<string>;
  lzEndpoint(_overrides?: CallOverrides): Promise<string>;
  maxTotalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  minDstGasLookup(
    arg0: BigNumberish,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  name(_overrides?: CallOverrides): Promise<string>;
  nonces(owner: string, _overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  payloadSizeLimitLookup(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  permitTypeHash(_overrides?: CallOverrides): Promise<string>;
  precrime(_overrides?: CallOverrides): Promise<string>;
  supportsInterface(
    interfaceId: BytesLike,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  token(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  trustedRemoteLookup(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  useCustomAdapterParams(_overrides?: CallOverrides): Promise<boolean>;
  vault(_overrides?: CallOverrides): Promise<string>;
  version(_overrides?: CallOverrides): Promise<string>;
}

interface PrismaTokenTransactions {
  approve(
    spender: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  forceResumeReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  increaseAllowance(
    spender: string,
    addedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  lzReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  mintToVault(
    _totalSupply: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  nonblockingLzReceive(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  permit(
    owner: string,
    spender: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  renounceOwnership(_overrides?: Overrides): Promise<void>;
  retryMessage(
    _srcChainId: BigNumberish,
    _srcAddress: BytesLike,
    _nonce: BigNumberish,
    _payload: BytesLike,
    _overrides?: PayableOverrides,
  ): Promise<void>;
  sendFrom(
    _from: string,
    _dstChainId: BigNumberish,
    _toAddress: BytesLike,
    _amount: BigNumberish,
    _refundAddress: string,
    _zroPaymentAddress: string,
    _adapterParams: BytesLike,
    _overrides?: PayableOverrides,
  ): Promise<void>;
  setConfig(
    _version: BigNumberish,
    _chainId: BigNumberish,
    _configType: BigNumberish,
    _config: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setMinDstGas(
    _dstChainId: BigNumberish,
    _packetType: BigNumberish,
    _minGas: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setPayloadSizeLimit(
    _dstChainId: BigNumberish,
    _size: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setPrecrime(_precrime: string, _overrides?: Overrides): Promise<void>;
  setReceiveVersion(
    _version: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setSendVersion(_version: BigNumberish, _overrides?: Overrides): Promise<void>;
  setTrustedRemote(
    _srcChainId: BigNumberish,
    _path: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setTrustedRemoteAddress(
    _remoteChainId: BigNumberish,
    _remoteAddress: BytesLike,
    _overrides?: Overrides,
  ): Promise<void>;
  setUseCustomAdapterParams(
    _useCustomAdapterParams: boolean,
    _overrides?: Overrides,
  ): Promise<void>;
  transfer(
    to: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferFrom(
    from: string,
    to: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
  transferToLocker(
    sender: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
}

export interface PrismaToken
  extends _TypedLiquityContract<PrismaTokenCalls, PrismaTokenTransactions> {
  readonly filters: {
    Approval(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): EventFilter;
    MessageFailed(
      _srcChainId?: null,
      _srcAddress?: null,
      _nonce?: null,
      _payload?: null,
      _reason?: null,
    ): EventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null,
    ): EventFilter;
    ReceiveFromChain(
      _srcChainId?: BigNumberish | null,
      _to?: string | null,
      _amount?: null,
    ): EventFilter;
    RetryMessageSuccess(
      _srcChainId?: null,
      _srcAddress?: null,
      _nonce?: null,
      _payloadHash?: null,
    ): EventFilter;
    SendToChain(
      _dstChainId?: BigNumberish | null,
      _from?: string | null,
      _toAddress?: null,
      _amount?: null,
    ): EventFilter;
    SetMinDstGas(
      _dstChainId?: null,
      _type?: null,
      _minDstGas?: null,
    ): EventFilter;
    SetPrecrime(precrime?: null): EventFilter;
    SetTrustedRemote(_remoteChainId?: null, _path?: null): EventFilter;
    SetTrustedRemoteAddress(
      _remoteChainId?: null,
      _remoteAddress?: null,
    ): EventFilter;
    SetUseCustomAdapterParams(_useCustomAdapterParams?: null): EventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'Approval',
  ): _TypedLogDescription<{
    owner: string;
    spender: string;
    value: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'MessageFailed',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _srcAddress: string;
    _nonce: BigNumber;
    _payload: string;
    _reason: string;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'OwnershipTransferred',
  ): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(
    logs: Log[],
    name: 'ReceiveFromChain',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _to: string;
    _amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'RetryMessageSuccess',
  ): _TypedLogDescription<{
    _srcChainId: number;
    _srcAddress: string;
    _nonce: BigNumber;
    _payloadHash: string;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SendToChain',
  ): _TypedLogDescription<{
    _dstChainId: number;
    _from: string;
    _toAddress: string;
    _amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SetMinDstGas',
  ): _TypedLogDescription<{
    _dstChainId: number;
    _type: number;
    _minDstGas: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SetPrecrime',
  ): _TypedLogDescription<{ precrime: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetTrustedRemote',
  ): _TypedLogDescription<{ _remoteChainId: number; _path: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetTrustedRemoteAddress',
  ): _TypedLogDescription<{ _remoteChainId: number; _remoteAddress: string }>[];
  extractEvents(
    logs: Log[],
    name: 'SetUseCustomAdapterParams',
  ): _TypedLogDescription<{ _useCustomAdapterParams: boolean }>[];
  extractEvents(
    logs: Log[],
    name: 'Transfer',
  ): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}

interface SortedTrovesCalls {
  contains(_id: string, _overrides?: CallOverrides): Promise<boolean>;
  data(
    _overrides?: CallOverrides,
  ): Promise<{ head: string; tail: string; size: BigNumber }>;
  findInsertPosition(
    _NICR: BigNumberish,
    _prevId: string,
    _nextId: string,
    _overrides?: CallOverrides,
  ): Promise<[string, string]>;
  getFirst(_overrides?: CallOverrides): Promise<string>;
  getLast(_overrides?: CallOverrides): Promise<string>;
  getNext(_id: string, _overrides?: CallOverrides): Promise<string>;
  getPrev(_id: string, _overrides?: CallOverrides): Promise<string>;
  getSize(_overrides?: CallOverrides): Promise<BigNumber>;
  isEmpty(_overrides?: CallOverrides): Promise<boolean>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
  validInsertPosition(
    _NICR: BigNumberish,
    _prevId: string,
    _nextId: string,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
}

interface SortedTrovesTransactions {
  insert(
    _id: string,
    _NICR: BigNumberish,
    _prevId: string,
    _nextId: string,
    _overrides?: Overrides,
  ): Promise<void>;
  reInsert(
    _id: string,
    _newNICR: BigNumberish,
    _prevId: string,
    _nextId: string,
    _overrides?: Overrides,
  ): Promise<void>;
  remove(_id: string, _overrides?: Overrides): Promise<void>;
  setAddresses(
    _troveManagerAddress: string,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface SortedTroves
  extends _TypedLiquityContract<SortedTrovesCalls, SortedTrovesTransactions> {
  readonly filters: {
    NodeAdded(_id?: null, _NICR?: null): EventFilter;
    NodeRemoved(_id?: null): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'NodeAdded',
  ): _TypedLogDescription<{ _id: string; _NICR: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'NodeRemoved',
  ): _TypedLogDescription<{ _id: string }>[];
}

interface StabilityPoolCalls {
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  P(_overrides?: CallOverrides): Promise<BigNumber>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  SCALE_FACTOR(_overrides?: CallOverrides): Promise<BigNumber>;
  SUNSET_DURATION(_overrides?: CallOverrides): Promise<BigNumber>;
  accountDeposits(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{ amount: BigNumber; timestamp: BigNumber }>;
  claimableReward(
    _depositor: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  collateralGainsByDepositor(
    depositor: string,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  collateralTokens(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  currentEpoch(_overrides?: CallOverrides): Promise<BigNumber>;
  currentScale(_overrides?: CallOverrides): Promise<BigNumber>;
  debtToken(_overrides?: CallOverrides): Promise<string>;
  depositSnapshots(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{
    P: BigNumber;
    G: BigNumber;
    scale: BigNumber;
    epoch: BigNumber;
  }>;
  depositSums(
    arg0: string,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  emissionId(_overrides?: CallOverrides): Promise<BigNumber>;
  epochToScaleToG(
    arg0: BigNumberish,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  epochToScaleToSums(
    arg0: BigNumberish,
    arg1: BigNumberish,
    arg2: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  factory(_overrides?: CallOverrides): Promise<string>;
  getCompoundedDebtDeposit(
    _depositor: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getDepositorCollateralGain(
    _depositor: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber[]>;
  getTotalDebtTokenDeposits(_overrides?: CallOverrides): Promise<BigNumber>;
  getWeek(_overrides?: CallOverrides): Promise<BigNumber>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  indexByCollateral(
    collateral: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  lastCollateralError_Offset(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  lastDebtLossError_Offset(_overrides?: CallOverrides): Promise<BigNumber>;
  lastPrismaError(_overrides?: CallOverrides): Promise<BigNumber>;
  lastUpdate(_overrides?: CallOverrides): Promise<number>;
  liquidationManager(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  periodFinish(_overrides?: CallOverrides): Promise<number>;
  rewardRate(_overrides?: CallOverrides): Promise<BigNumber>;
  vault(_overrides?: CallOverrides): Promise<string>;
}

interface StabilityPoolTransactions {
  claimCollateralGains(
    recipient: string,
    collateralIndexes: BigNumberish[],
    _overrides?: Overrides,
  ): Promise<void>;
  claimReward(recipient: string, _overrides?: Overrides): Promise<BigNumber>;
  enableCollateral(_collateral: string, _overrides?: Overrides): Promise<void>;
  offset(
    collateral: string,
    _debtToOffset: BigNumberish,
    _collToAdd: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  provideToSP(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  startCollateralSunset(
    collateral: string,
    _overrides?: Overrides,
  ): Promise<void>;
  vaultClaimReward(
    claimant: string,
    arg1: string,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
  withdrawFromSP(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
}

export interface StabilityPool
  extends _TypedLiquityContract<StabilityPoolCalls, StabilityPoolTransactions> {
  readonly filters: {
    CollateralGainWithdrawn(
      _depositor?: string | null,
      _collateral?: null,
    ): EventFilter;
    CollateralOverwritten(
      oldCollateral?: null,
      newCollateral?: null,
    ): EventFilter;
    DepositSnapshotUpdated(
      _depositor?: string | null,
      _P?: null,
      _G?: null,
    ): EventFilter;
    EpochUpdated(_currentEpoch?: null): EventFilter;
    G_Updated(_G?: null, _epoch?: null, _scale?: null): EventFilter;
    P_Updated(_P?: null): EventFilter;
    RewardClaimed(
      account?: string | null,
      recipient?: string | null,
      claimed?: null,
    ): EventFilter;
    S_Updated(idx?: null, _S?: null, _epoch?: null, _scale?: null): EventFilter;
    ScaleUpdated(_currentScale?: null): EventFilter;
    StabilityPoolDebtBalanceUpdated(_newBalance?: null): EventFilter;
    UserDepositChanged(
      _depositor?: string | null,
      _newDeposit?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'CollateralGainWithdrawn',
  ): _TypedLogDescription<{ _depositor: string; _collateral: BigNumber[] }>[];
  extractEvents(
    logs: Log[],
    name: 'CollateralOverwritten',
  ): _TypedLogDescription<{ oldCollateral: string; newCollateral: string }>[];
  extractEvents(
    logs: Log[],
    name: 'DepositSnapshotUpdated',
  ): _TypedLogDescription<{
    _depositor: string;
    _P: BigNumber;
    _G: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'EpochUpdated',
  ): _TypedLogDescription<{ _currentEpoch: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'G_Updated',
  ): _TypedLogDescription<{
    _G: BigNumber;
    _epoch: BigNumber;
    _scale: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'P_Updated',
  ): _TypedLogDescription<{ _P: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'RewardClaimed',
  ): _TypedLogDescription<{
    account: string;
    recipient: string;
    claimed: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'S_Updated',
  ): _TypedLogDescription<{
    idx: BigNumber;
    _S: BigNumber;
    _epoch: BigNumber;
    _scale: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'ScaleUpdated',
  ): _TypedLogDescription<{ _currentScale: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'StabilityPoolDebtBalanceUpdated',
  ): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'UserDepositChanged',
  ): _TypedLogDescription<{ _depositor: string; _newDeposit: BigNumber }>[];
}

interface TroveManagerCalls {
  BOOTSTRAP_PERIOD(_overrides?: CallOverrides): Promise<BigNumber>;
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DEBT_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  L_collateral(_overrides?: CallOverrides): Promise<BigNumber>;
  L_debt(_overrides?: CallOverrides): Promise<BigNumber>;
  MAX_INTEREST_RATE_IN_BPS(_overrides?: CallOverrides): Promise<BigNumber>;
  MCR(_overrides?: CallOverrides): Promise<BigNumber>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  SUNSETTING_INTEREST_RATE(_overrides?: CallOverrides): Promise<BigNumber>;
  Troves(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{
    debt: BigNumber;
    coll: BigNumber;
    stake: BigNumber;
    status: number;
    arrayIndex: BigNumber;
    activeInterestIndex: BigNumber;
  }>;
  accountLatestMint(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{ amount: number; week: number; day: number }>;
  activeInterestIndex(_overrides?: CallOverrides): Promise<BigNumber>;
  baseRate(_overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  borrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  claimableReward(
    account: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  collateralToken(_overrides?: CallOverrides): Promise<string>;
  dailyMintReward(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  debtToken(_overrides?: CallOverrides): Promise<string>;
  defaultedCollateral(_overrides?: CallOverrides): Promise<BigNumber>;
  defaultedDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  emissionId(
    _overrides?: CallOverrides,
  ): Promise<{ debt: number; minting: number }>;
  getBorrowingFee(
    _debt: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getBorrowingFeeWithDecay(
    _debt: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getBorrowingRate(_overrides?: CallOverrides): Promise<BigNumber>;
  getBorrowingRateWithDecay(_overrides?: CallOverrides): Promise<BigNumber>;
  getCurrentICR(
    _borrower: string,
    _price: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getEntireDebtAndColl(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<{
    debt: BigNumber;
    coll: BigNumber;
    pendingDebtReward: BigNumber;
    pendingCollateralReward: BigNumber;
  }>;
  getEntireSystemColl(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getNominalICR(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getPendingCollAndDebtRewards(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<[BigNumber, BigNumber]>;
  getRedemptionFeeWithDecay(
    _collateralDrawn: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getRedemptionRate(_overrides?: CallOverrides): Promise<BigNumber>;
  getRedemptionRateWithDecay(_overrides?: CallOverrides): Promise<BigNumber>;
  getTotalActiveCollateral(_overrides?: CallOverrides): Promise<BigNumber>;
  getTotalActiveDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getTotalMints(
    week: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<number[]>;
  getTroveCollAndDebt(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<{ coll: BigNumber; debt: BigNumber }>;
  getTroveFromTroveOwnersArray(
    _index: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<string>;
  getTroveOwnersCount(_overrides?: CallOverrides): Promise<BigNumber>;
  getTroveStake(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getTroveStatus(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getWeek(_overrides?: CallOverrides): Promise<BigNumber>;
  getWeekAndDay(_overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  hasPendingRewards(
    _borrower: string,
    _overrides?: CallOverrides,
  ): Promise<boolean>;
  interestPayable(_overrides?: CallOverrides): Promise<BigNumber>;
  interestRate(_overrides?: CallOverrides): Promise<BigNumber>;
  lastActiveIndexUpdate(_overrides?: CallOverrides): Promise<BigNumber>;
  lastCollateralError_Redistribution(
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  lastDebtError_Redistribution(_overrides?: CallOverrides): Promise<BigNumber>;
  lastFeeOperationTime(_overrides?: CallOverrides): Promise<BigNumber>;
  lastUpdate(_overrides?: CallOverrides): Promise<number>;
  liquidationManager(_overrides?: CallOverrides): Promise<string>;
  maxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  maxRedemptionFee(_overrides?: CallOverrides): Promise<BigNumber>;
  maxSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  minuteDecayFactor(_overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  paused(_overrides?: CallOverrides): Promise<boolean>;
  periodFinish(_overrides?: CallOverrides): Promise<number>;
  priceFeed(_overrides?: CallOverrides): Promise<string>;
  redemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  rewardIntegral(_overrides?: CallOverrides): Promise<BigNumber>;
  rewardIntegralFor(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  rewardRate(_overrides?: CallOverrides): Promise<BigNumber>;
  rewardSnapshots(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{ collateral: BigNumber; debt: BigNumber }>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  sunsetting(_overrides?: CallOverrides): Promise<boolean>;
  surplusBalances(arg0: string, _overrides?: CallOverrides): Promise<BigNumber>;
  systemDeploymentTime(_overrides?: CallOverrides): Promise<BigNumber>;
  totalCollateralSnapshot(_overrides?: CallOverrides): Promise<BigNumber>;
  totalStakes(_overrides?: CallOverrides): Promise<BigNumber>;
  totalStakesSnapshot(_overrides?: CallOverrides): Promise<BigNumber>;
  vault(_overrides?: CallOverrides): Promise<string>;
}

interface TroveManagerTransactions {
  addCollateralSurplus(
    borrower: string,
    collSurplus: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  applyPendingRewards(
    _borrower: string,
    _overrides?: Overrides,
  ): Promise<{ coll: BigNumber; debt: BigNumber }>;
  claimCollateral(_receiver: string, _overrides?: Overrides): Promise<void>;
  claimReward(receiver: string, _overrides?: Overrides): Promise<BigNumber>;
  closeTrove(
    _borrower: string,
    _receiver: string,
    collAmount: BigNumberish,
    debtAmount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  closeTroveByLiquidation(
    _borrower: string,
    _overrides?: Overrides,
  ): Promise<void>;
  collectInterests(_overrides?: Overrides): Promise<void>;
  decayBaseRateAndGetBorrowingFee(
    _debt: BigNumberish,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
  decreaseDebtAndSendCollateral(
    account: string,
    debt: BigNumberish,
    coll: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  fetchPrice(_overrides?: Overrides): Promise<BigNumber>;
  finalizeLiquidation(
    _liquidator: string,
    _debt: BigNumberish,
    _coll: BigNumberish,
    _collSurplus: BigNumberish,
    _debtGasComp: BigNumberish,
    _collGasComp: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  getEntireSystemBalances(
    _overrides?: Overrides,
  ): Promise<[BigNumber, BigNumber, BigNumber]>;
  movePendingTroveRewardsToActiveBalances(
    _debt: BigNumberish,
    _collateral: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  notifyRegisteredId(
    _assignedIds: BigNumberish[],
    _overrides?: Overrides,
  ): Promise<boolean>;
  openTrove(
    _borrower: string,
    _collateralAmount: BigNumberish,
    _compositeDebt: BigNumberish,
    NICR: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _isRecoveryMode: boolean,
    _overrides?: Overrides,
  ): Promise<{ stake: BigNumber; arrayIndex: BigNumber }>;
  redeemCollateral(
    _debtAmount: BigNumberish,
    _firstRedemptionHint: string,
    _upperPartialRedemptionHint: string,
    _lowerPartialRedemptionHint: string,
    _partialRedemptionHintNICR: BigNumberish,
    _maxIterations: BigNumberish,
    _maxFeePercentage: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setAddresses(
    _priceFeedAddress: string,
    _sortedTrovesAddress: string,
    _collateralToken: string,
    _overrides?: Overrides,
  ): Promise<void>;
  setParameters(
    _minuteDecayFactor: BigNumberish,
    _redemptionFeeFloor: BigNumberish,
    _maxRedemptionFee: BigNumberish,
    _borrowingFeeFloor: BigNumberish,
    _maxBorrowingFee: BigNumberish,
    _interestRateInBPS: BigNumberish,
    _maxSystemDebt: BigNumberish,
    _MCR: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  setPaused(_paused: boolean, _overrides?: Overrides): Promise<void>;
  setPriceFeed(
    _priceFeedAddress: string,
    _overrides?: Overrides,
  ): Promise<void>;
  startSunset(_overrides?: Overrides): Promise<void>;
  updateBalances(_overrides?: Overrides): Promise<void>;
  updateTroveFromAdjustment(
    _isRecoveryMode: boolean,
    _isDebtIncrease: boolean,
    _debtChange: BigNumberish,
    _netDebtChange: BigNumberish,
    _isCollIncrease: boolean,
    _collChange: BigNumberish,
    _upperHint: string,
    _lowerHint: string,
    _borrower: string,
    _receiver: string,
    _overrides?: Overrides,
  ): Promise<[BigNumber, BigNumber, BigNumber]>;
  vaultClaimReward(
    claimant: string,
    arg1: string,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
}

export interface TroveManager
  extends _TypedLiquityContract<TroveManagerCalls, TroveManagerTransactions> {
  readonly filters: {
    BaseRateUpdated(_baseRate?: null): EventFilter;
    CollateralSent(_to?: null, _amount?: null): EventFilter;
    LTermsUpdated(_L_collateral?: null, _L_debt?: null): EventFilter;
    LastFeeOpTimeUpdated(_lastFeeOpTime?: null): EventFilter;
    Redemption(
      _attemptedDebtAmount?: null,
      _actualDebtAmount?: null,
      _collateralSent?: null,
      _collateralFee?: null,
    ): EventFilter;
    RewardClaimed(
      account?: string | null,
      recipient?: string | null,
      claimed?: null,
    ): EventFilter;
    SystemSnapshotsUpdated(
      _totalStakesSnapshot?: null,
      _totalCollateralSnapshot?: null,
    ): EventFilter;
    TotalStakesUpdated(_newTotalStakes?: null): EventFilter;
    TroveIndexUpdated(_borrower?: null, _newIndex?: null): EventFilter;
    TroveSnapshotsUpdated(_L_collateral?: null, _L_debt?: null): EventFilter;
    TroveUpdated(
      _borrower?: string | null,
      _debt?: null,
      _coll?: null,
      _stake?: null,
      _operation?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'BaseRateUpdated',
  ): _TypedLogDescription<{ _baseRate: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'CollateralSent',
  ): _TypedLogDescription<{ _to: string; _amount: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'LTermsUpdated',
  ): _TypedLogDescription<{ _L_collateral: BigNumber; _L_debt: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'LastFeeOpTimeUpdated',
  ): _TypedLogDescription<{ _lastFeeOpTime: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'Redemption',
  ): _TypedLogDescription<{
    _attemptedDebtAmount: BigNumber;
    _actualDebtAmount: BigNumber;
    _collateralSent: BigNumber;
    _collateralFee: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'RewardClaimed',
  ): _TypedLogDescription<{
    account: string;
    recipient: string;
    claimed: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'SystemSnapshotsUpdated',
  ): _TypedLogDescription<{
    _totalStakesSnapshot: BigNumber;
    _totalCollateralSnapshot: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'TotalStakesUpdated',
  ): _TypedLogDescription<{ _newTotalStakes: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'TroveIndexUpdated',
  ): _TypedLogDescription<{ _borrower: string; _newIndex: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'TroveSnapshotsUpdated',
  ): _TypedLogDescription<{ _L_collateral: BigNumber; _L_debt: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'TroveUpdated',
  ): _TypedLogDescription<{
    _borrower: string;
    _debt: BigNumber;
    _coll: BigNumber;
    _stake: BigNumber;
    _operation: number;
  }>[];
}

interface TroveManagerGettersCalls {
  factory(_overrides?: CallOverrides): Promise<string>;
  getActiveTroveManagersForAccount(
    account: string,
    _overrides?: CallOverrides,
  ): Promise<string[]>;
  getAllCollateralsAndTroveManagers(
    _overrides?: CallOverrides,
  ): Promise<{ collateral: string; troveManagers: string[] }[]>;
}

interface TroveManagerGettersTransactions {}

export interface TroveManagerGetters
  extends _TypedLiquityContract<
    TroveManagerGettersCalls,
    TroveManagerGettersTransactions
  > {
  readonly filters: {};
}

interface TokenLockerCalls {
  MAX_LOCK_WEEKS(_overrides?: CallOverrides): Promise<BigNumber>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  allowPenaltyWithdrawAfter(_overrides?: CallOverrides): Promise<BigNumber>;
  deploymentManager(_overrides?: CallOverrides): Promise<string>;
  getAccountActiveLocks(
    account: string,
    minWeeks: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<{
    lockData: { amount: BigNumber; weeksToUnlock: BigNumber }[];
    frozenAmount: BigNumber;
  }>;
  getAccountBalances(
    account: string,
    _overrides?: CallOverrides,
  ): Promise<{ locked: BigNumber; unlocked: BigNumber }>;
  getAccountWeight(
    account: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getAccountWeightAt(
    account: string,
    week: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getTotalWeight(_overrides?: CallOverrides): Promise<BigNumber>;
  getTotalWeightAt(
    week: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  getWeek(_overrides?: CallOverrides): Promise<BigNumber>;
  getWithdrawWithPenaltyAmounts(
    account: string,
    amountToWithdraw: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<{ amountWithdrawn: BigNumber; penaltyAmountPaid: BigNumber }>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  incentiveVoter(_overrides?: CallOverrides): Promise<string>;
  lockToTokenRatio(_overrides?: CallOverrides): Promise<BigNumber>;
  lockToken(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  penaltyWithdrawalsEnabled(_overrides?: CallOverrides): Promise<boolean>;
  prismaCore(_overrides?: CallOverrides): Promise<string>;
  totalDecayRate(_overrides?: CallOverrides): Promise<number>;
  totalUpdatedWeek(_overrides?: CallOverrides): Promise<number>;
}

interface TokenLockerTransactions {
  extendLock(
    _amount: BigNumberish,
    _weeks: BigNumberish,
    _newWeeks: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  extendMany(
    newExtendLocks: {
      amount: BigNumberish;
      currentWeeks: BigNumberish;
      newWeeks: BigNumberish;
    }[],
    _overrides?: Overrides,
  ): Promise<boolean>;
  freeze(_overrides?: Overrides): Promise<void>;
  getAccountWeightWrite(
    account: string,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
  getTotalWeightWrite(_overrides?: Overrides): Promise<BigNumber>;
  lock(
    _account: string,
    _amount: BigNumberish,
    _weeks: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  lockMany(
    _account: string,
    newLocks: { amount: BigNumberish; weeksToUnlock: BigNumberish }[],
    _overrides?: Overrides,
  ): Promise<boolean>;
  setAllowPenaltyWithdrawAfter(
    _timestamp: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  setPenaltyWithdrawalsEnabled(
    _enabled: boolean,
    _overrides?: Overrides,
  ): Promise<boolean>;
  unfreeze(keepIncentivesVote: boolean, _overrides?: Overrides): Promise<void>;
  withdrawExpiredLocks(
    _weeks: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  withdrawWithPenalty(
    amountToWithdraw: BigNumberish,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
}

export interface TokenLocker
  extends _TypedLiquityContract<TokenLockerCalls, TokenLockerTransactions> {
  readonly filters: {
    LockCreated(
      account?: string | null,
      amount?: null,
      _weeks?: null,
    ): EventFilter;
    LockExtended(
      account?: string | null,
      amount?: null,
      _weeks?: null,
      newWeeks?: null,
    ): EventFilter;
    LocksCreated(account?: string | null, newLocks?: null): EventFilter;
    LocksExtended(account?: string | null, locks?: null): EventFilter;
    LocksFrozen(account?: string | null, amount?: null): EventFilter;
    LocksUnfrozen(account?: string | null, amount?: null): EventFilter;
    LocksWithdrawn(
      account?: string | null,
      withdrawn?: null,
      penalty?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'LockCreated',
  ): _TypedLogDescription<{
    account: string;
    amount: BigNumber;
    _weeks: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LockExtended',
  ): _TypedLogDescription<{
    account: string;
    amount: BigNumber;
    _weeks: BigNumber;
    newWeeks: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LocksCreated',
  ): _TypedLogDescription<{
    account: string;
    newLocks: { amount: BigNumber; weeksToUnlock: BigNumber }[];
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LocksExtended',
  ): _TypedLogDescription<{
    account: string;
    locks: {
      amount: BigNumber;
      currentWeeks: BigNumber;
      newWeeks: BigNumber;
    }[];
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LocksFrozen',
  ): _TypedLogDescription<{ account: string; amount: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'LocksUnfrozen',
  ): _TypedLogDescription<{ account: string; amount: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'LocksWithdrawn',
  ): _TypedLogDescription<{
    account: string;
    withdrawn: BigNumber;
    penalty: BigNumber;
  }>[];
}

interface FeeReceiverCalls {
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
}

interface FeeReceiverTransactions {
  setTokenApproval(
    token: string,
    spender: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
  transferToken(
    token: string,
    receiver: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<void>;
}

export interface FeeReceiver
  extends _TypedLiquityContract<FeeReceiverCalls, FeeReceiverTransactions> {
  readonly filters: {};
}

interface PrismaVaultCalls {
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  allocated(arg0: string, _overrides?: CallOverrides): Promise<BigNumber>;
  boostCalculator(_overrides?: CallOverrides): Promise<string>;
  boostDelegation(
    arg0: string,
    _overrides?: CallOverrides,
  ): Promise<{ isEnabled: boolean; feePct: number; callback: string }>;
  claimableBoostDelegationFees(
    claimant: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  claimableRewardAfterBoost(
    account: string,
    receiver: string,
    boostDelegate: string,
    rewardContract: string,
    _overrides?: CallOverrides,
  ): Promise<{ adjustedAmount: BigNumber; feeToDelegate: BigNumber }>;
  deploymentManager(_overrides?: CallOverrides): Promise<string>;
  emissionSchedule(_overrides?: CallOverrides): Promise<string>;
  getClaimableWithBoost(
    claimant: string,
    _overrides?: CallOverrides,
  ): Promise<{ maxBoosted: BigNumber; boosted: BigNumber }>;
  getWeek(_overrides?: CallOverrides): Promise<BigNumber>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  idToReceiver(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<{ account: string; isActive: boolean }>;
  lockWeeks(_overrides?: CallOverrides): Promise<BigNumber>;
  locker(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  prismaToken(_overrides?: CallOverrides): Promise<string>;
  receiverUpdatedWeek(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<number>;
  totalUpdateWeek(_overrides?: CallOverrides): Promise<BigNumber>;
  unallocatedTotal(_overrides?: CallOverrides): Promise<BigNumber>;
  voter(_overrides?: CallOverrides): Promise<string>;
  weeklyEmissions(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
}

interface PrismaVaultTransactions {
  allocateNewEmissions(
    id: BigNumberish,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
  batchClaimRewards(
    receiver: string,
    boostDelegate: string,
    rewardContracts: string[],
    maxFeePct: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  claimBoostDelegationFees(
    receiver: string,
    _overrides?: Overrides,
  ): Promise<boolean>;
  increaseUnallocatedSupply(
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  registerReceiver(
    receiver: string,
    count: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  setBoostCalculator(
    _boostCalculator: string,
    _overrides?: Overrides,
  ): Promise<boolean>;
  setBoostDelegationParams(
    isEnabled: boolean,
    feePct: BigNumberish,
    callback: string,
    _overrides?: Overrides,
  ): Promise<boolean>;
  setEmissionSchedule(
    _emissionSchedule: string,
    _overrides?: Overrides,
  ): Promise<boolean>;
  setInitialParameters(
    _emissionSchedule: string,
    _boostCalculator: string,
    totalSupply: BigNumberish,
    initialLockWeeks: BigNumberish,
    _fixedInitialAmounts: BigNumberish[],
    initialAllowances: { receiver: string; amount: BigNumberish }[],
    _overrides?: Overrides,
  ): Promise<void>;
  setReceiverIsActive(
    id: BigNumberish,
    isActive: boolean,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferAllocatedTokens(
    claimant: string,
    receiver: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferTokens(
    token: string,
    receiver: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
}

export interface PrismaVault
  extends _TypedLiquityContract<PrismaVaultCalls, PrismaVaultTransactions> {
  readonly filters: {
    BoostCalculatorSet(boostCalculator?: null): EventFilter;
    BoostDelegationSet(
      boostDelegate?: string | null,
      isEnabled?: null,
      feePct?: null,
      callback?: null,
    ): EventFilter;
    EmissionScheduleSet(emissionScheduler?: null): EventFilter;
    IncreasedAllocation(
      receiver?: string | null,
      increasedAmount?: null,
    ): EventFilter;
    NewReceiverRegistered(receiver?: null, id?: null): EventFilter;
    ReceiverIsActiveStatusModified(
      id?: BigNumberish | null,
      isActive?: null,
    ): EventFilter;
    UnallocatedSupplyIncreased(
      increasedAmount?: null,
      unallocatedTotal?: null,
    ): EventFilter;
    UnallocatedSupplyReduced(
      reducedAmount?: null,
      unallocatedTotal?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'BoostCalculatorSet',
  ): _TypedLogDescription<{ boostCalculator: string }>[];
  extractEvents(
    logs: Log[],
    name: 'BoostDelegationSet',
  ): _TypedLogDescription<{
    boostDelegate: string;
    isEnabled: boolean;
    feePct: BigNumber;
    callback: string;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'EmissionScheduleSet',
  ): _TypedLogDescription<{ emissionScheduler: string }>[];
  extractEvents(
    logs: Log[],
    name: 'IncreasedAllocation',
  ): _TypedLogDescription<{ receiver: string; increasedAmount: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'NewReceiverRegistered',
  ): _TypedLogDescription<{ receiver: string; id: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'ReceiverIsActiveStatusModified',
  ): _TypedLogDescription<{ id: BigNumber; isActive: boolean }>[];
  extractEvents(
    logs: Log[],
    name: 'UnallocatedSupplyIncreased',
  ): _TypedLogDescription<{
    increasedAmount: BigNumber;
    unallocatedTotal: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'UnallocatedSupplyReduced',
  ): _TypedLogDescription<{
    reducedAmount: BigNumber;
    unallocatedTotal: BigNumber;
  }>[];
}

interface IERC20Calls {
  allowance(
    owner: string,
    spender: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  decimals(_overrides?: CallOverrides): Promise<number>;
  name(_overrides?: CallOverrides): Promise<string>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface IERC20Transactions {
  approve(
    spender: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  decreaseAllowance(
    spender: string,
    subtractedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  increaseAllowance(
    spender: string,
    addedValue: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transfer(
    recipient: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferFrom(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
}

export interface IERC20
  extends _TypedLiquityContract<IERC20Calls, IERC20Transactions> {
  readonly filters: {
    Approval(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): EventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'Approval',
  ): _TypedLogDescription<{
    owner: string;
    spender: string;
    value: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'Transfer',
  ): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}

interface LPDepositTokenCalls {
  PRISMA(_overrides?: CallOverrides): Promise<string>;
  PRISMA_CORE(_overrides?: CallOverrides): Promise<string>;
  allowance(
    arg0: string,
    arg1: string,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  balanceOf(arg0: string, _overrides?: CallOverrides): Promise<BigNumber>;
  claimableReward(
    account: string,
    _overrides?: CallOverrides,
  ): Promise<{ prismaAmount: BigNumber; crvAmount: BigNumber }>;
  decimals(_overrides?: CallOverrides): Promise<BigNumber>;
  emissionId(_overrides?: CallOverrides): Promise<BigNumber>;
  guardian(_overrides?: CallOverrides): Promise<string>;
  lastUpdate(_overrides?: CallOverrides): Promise<number>;
  lpToken(_overrides?: CallOverrides): Promise<string>;
  maxWeeklyEmissionPct(_overrides?: CallOverrides): Promise<number>;
  name(_overrides?: CallOverrides): Promise<string>;
  owner(_overrides?: CallOverrides): Promise<string>;
  periodFinish(_overrides?: CallOverrides): Promise<number>;
  rewardIntegral(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  rewardIntegralFor(
    arg0: string,
    arg1: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  rewardRate(
    arg0: BigNumberish,
    _overrides?: CallOverrides,
  ): Promise<BigNumber>;
  storedExcessEmissions(_overrides?: CallOverrides): Promise<BigNumber>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  vault(_overrides?: CallOverrides): Promise<string>;
}

interface LPDepositTokenTransactions {
  approve(
    _spender: string,
    _value: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  claimReward(
    receiver: string,
    _overrides?: Overrides,
  ): Promise<{ prismaAmount: BigNumber; crvAmount: BigNumber }>;
  deposit(
    receiver: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  fetchRewards(_overrides?: Overrides): Promise<void>;
  initialize(_lpToken: string, _overrides?: Overrides): Promise<void>;
  notifyRegisteredId(
    assignedIds: BigNumberish[],
    _overrides?: Overrides,
  ): Promise<boolean>;
  pushExcessEmissions(_overrides?: Overrides): Promise<void>;
  setMaxWeeklyEmissionPct(
    _maxWeeklyEmissionPct: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transfer(
    _to: string,
    _value: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  transferFrom(
    _from: string,
    _to: string,
    _value: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
  vaultClaimReward(
    claimant: string,
    receiver: string,
    _overrides?: Overrides,
  ): Promise<BigNumber>;
  withdraw(
    receiver: string,
    amount: BigNumberish,
    _overrides?: Overrides,
  ): Promise<boolean>;
}

export interface LPDepositToken
  extends _TypedLiquityContract<
    LPDepositTokenCalls,
    LPDepositTokenTransactions
  > {
  readonly filters: {
    Approval(
      owner?: string | null,
      spender?: string | null,
      value?: null,
    ): EventFilter;
    LPTokenDeposited(
      lpToken?: string | null,
      receiver?: string | null,
      amount?: null,
    ): EventFilter;
    LPTokenWithdrawn(
      lpToken?: string | null,
      receiver?: string | null,
      amount?: null,
    ): EventFilter;
    MaxWeeklyEmissionPctSet(pct?: null): EventFilter;
    MaxWeeklyEmissionsExceeded(
      allocated?: null,
      maxAllowed?: null,
    ): EventFilter;
    RewardClaimed(
      receiver?: string | null,
      prismaAmount?: null,
      crvAmount?: null,
    ): EventFilter;
    Transfer(
      from?: string | null,
      to?: string | null,
      value?: null,
    ): EventFilter;
  };
  extractEvents(
    logs: Log[],
    name: 'Approval',
  ): _TypedLogDescription<{
    owner: string;
    spender: string;
    value: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LPTokenDeposited',
  ): _TypedLogDescription<{
    lpToken: string;
    receiver: string;
    amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'LPTokenWithdrawn',
  ): _TypedLogDescription<{
    lpToken: string;
    receiver: string;
    amount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'MaxWeeklyEmissionPctSet',
  ): _TypedLogDescription<{ pct: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'MaxWeeklyEmissionsExceeded',
  ): _TypedLogDescription<{ allocated: BigNumber; maxAllowed: BigNumber }>[];
  extractEvents(
    logs: Log[],
    name: 'RewardClaimed',
  ): _TypedLogDescription<{
    receiver: string;
    prismaAmount: BigNumber;
    crvAmount: BigNumber;
  }>[];
  extractEvents(
    logs: Log[],
    name: 'Transfer',
  ): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}
