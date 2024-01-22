import { chainId, contractAbis, contractsDeployedAddress } from '@/constants';
import { AddressZero } from '@ethersproject/constants';
import BigNumber from 'bignumber.js';

const MINUTE_DECAY_FACTOR = new BigNumber('0.999037758833783000');
const maxNumberOfTrialsAtOnce = 2500;
const DEFAULT_BORROWING_FEE_DECAY_TOLERANCE_MINUTES = 10;
const NOMINAL_COLLATERAL_RATIO_PRECISION = new BigNumber(1e20);

import { Multicall } from '@/types';
import { FallbackProvider } from '@ethersproject/providers';
import ethers, { multicall } from './ethers';

const randomInteger = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

interface HintTroveParams {
  trove_manager: string;
  sorted_troves: string;
  minimumNetDebt: number;
}

interface HintOperationParams {
  borrowDebt?: BigNumber;
  repayDebt?: BigNumber;
  depositColl?: BigNumber;
  withdrawColl?: BigNumber;
}

async function findHints(
  owner: string,
  trove: HintTroveParams,
  operations: HintOperationParams,
  provider: FallbackProvider,
) {
  const {
    borrowDebt = new BigNumber(0),
    repayDebt = new BigNumber(0),
    depositColl = new BigNumber(0),
    withdrawColl = new BigNumber(0),
  } = operations;

  console.log(borrowDebt);
  console.log(repayDebt);
  console.log(depositColl);
  console.log(withdrawColl);

  const calls: Multicall[] = [
    {
      address: trove.trove_manager,
      abi: contractAbis.troveManager,
      method: 'Troves',
      params: [owner],
    },
    {
      address: trove.trove_manager,
      abi: contractAbis.troveManager,
      method: 'rewardSnapshots',
      params: [owner],
    },
    {
      address: trove.trove_manager,
      abi: contractAbis.troveManager,
      method: 'L_collateral',
      params: [],
    },
    {
      address: trove.trove_manager,
      abi: contractAbis.troveManager,
      method: 'L_debt',
      params: [],
    },
  ];

  const result = await multicall({
    chainId,
    provider,
    calls,
    isStrict: false,
  });

  console.log('[1] result:', result);

  const account = result[0];
  const currentDebt = new BigNumber(account[0].toString());
  const currentColl = new BigNumber(account[1].toString());
  const stake = new BigNumber(account[2].toString());

  const snapshot = result[1];
  const snapshotColl = new BigNumber(snapshot[0].toString());
  const snapshotDebt = new BigNumber(snapshot[1].toString());

  const coll = result[2];
  const debt = result[3];

  const totalColl = new BigNumber(coll.toString());
  const totalDebt = new BigNumber(debt.toString());

  const reColl = totalColl.isGreaterThan(snapshotColl)
    ? totalColl.minus(snapshotColl).multipliedBy(stake).dividedBy(1e18)
    : new BigNumber(0);

  const reDebt = totalDebt.isGreaterThan(snapshotDebt)
    ? totalDebt.minus(snapshotDebt).multipliedBy(stake).dividedBy(1e18)
    : new BigNumber(0);

  const newColl = reColl.plus(currentColl);
  const newDebt = reDebt.plus(currentDebt);

  const newAccount = {
    address: owner,
    status: Number(account[3]),
    coll: newColl,
    debt: newDebt,
    stake: stake,
  };

  console.log(1);

  const currentBorrowingRate = await currentMintFee(
    0,
    trove.trove_manager,
    provider,
  );

  console.log(2);

  let netDebt = newAccount.debt.minus(repayDebt);

  if (!borrowDebt.isZero()) {
    const borrowDebtAmount = calculateTotalDebtAmount(
      new BigNumber(0),
      currentBorrowingRate.dividedBy(1e18),
      borrowDebt,
    );
    netDebt = netDebt.plus(borrowDebtAmount.multipliedBy(1e18));
  }

  let netDecayedDebtAmount = new BigNumber(0);
  let decayedBorrowingRate = new BigNumber(0);

  if (!borrowDebt.isZero()) {
    decayedBorrowingRate = await currentMintFee(
      60 * DEFAULT_BORROWING_FEE_DECAY_TOLERANCE_MINUTES,
      trove.trove_manager,
      provider,
    );
    netDecayedDebtAmount = calculateTotalDebtAmount(
      new BigNumber(0),
      decayedBorrowingRate,
      borrowDebt,
    );

    if (netDecayedDebtAmount.plus(netDebt).isLessThan(trove.minimumNetDebt)) {
      throw new Error(
        `Trove's debt might fall below ${trove.minimumNetDebt} ` +
          `within ${DEFAULT_BORROWING_FEE_DECAY_TOLERANCE_MINUTES} minutes`,
      );
    }
  }

  const nominalCollateralRatio = calculateNominalCollateralRatio(
    newAccount.coll.plus(depositColl).minus(withdrawColl),
    netDebt,
    NOMINAL_COLLATERAL_RATIO_PRECISION,
  );

  console.log('nominalCollateralRatio', nominalCollateralRatio.toString());

  const hints = await findHintsForNominalCollateralRatio(
    nominalCollateralRatio,
    trove.sorted_troves,
    trove.trove_manager,
    owner,
    provider,
  );

  console.log('finnal result hints', hints);

  const [upperhint, lowerhint] = hints;
  return hints;
}

async function findHintsForNominalCollateralRatio(
  nominalCollateralRatio: BigNumber,
  sortedTrovesAddress: string,
  troveMangerAddress: string,
  ownAddress: string,
  provider: FallbackProvider,
) {
  const hintHelpers = new ethers.Contract(
    contractsDeployedAddress.MultiCollateralHintHelpers,
    contractAbis.multiCollateralHintHelpers,
    provider,
  );

  const sortedTroves = new ethers.Contract(
    sortedTrovesAddress,
    contractAbis.sortedTroves,
    provider,
  );

  const calls: Multicall[] = [
    {
      address: troveMangerAddress,
      abi: contractAbis.troveManager,
      method: 'getTroveOwnersCount',
      params: [],
    },
    {
      address: sortedTrovesAddress,
      abi: contractAbis.sortedTroves,
      method: 'getFirst',
      params: [],
    },
  ];

  const result = await multicall({
    chainId,
    provider,
    calls,
    isStrict: false,
  });

  console.log('findHintsForNominalCollateralRatio result', result);

  const numberOfTroves = Number(result[0]);

  console.log('numberOfTroves', numberOfTroves);

  const last = result[1];

  if (!numberOfTroves) return [AddressZero, AddressZero];

  if (nominalCollateralRatio.eq(maxUint256BigNumber()))
    return [AddressZero, last];

  const totalNumberOfTrials = Math.ceil(10 * Math.sqrt(numberOfTroves));

  const [firstTrials, ...restOfTrials] = generateTrials(totalNumberOfTrials);

  const collectApproxHint = (
    {
      latestRandomSeed,
      results,
    }: {
      latestRandomSeed: BigNumber | number;
      results: { diff: BigNumber; hintAddress: string }[];
    },
    numberOfTrials: number,
  ) =>
    hintHelpers
      .getApproxHint(
        troveMangerAddress,
        toHex(nominalCollateralRatio),
        numberOfTrials,
        latestRandomSeed,
      )
      .then(({ latestRandomSeed, ...result }: any) => ({
        latestRandomSeed,
        results: [...results, result],
      }));

  const { results } = await restOfTrials.reduce(
    (p, numberOfTrials) =>
      p.then((state: any) => collectApproxHint(state, numberOfTrials)),
    collectApproxHint(
      { latestRandomSeed: randomInteger(), results: [] },
      firstTrials,
    ),
  );

  const { hintAddress } = results.reduce((a: any, b: any) =>
    a.diff.lt(b.diff) ? a : b,
  );

  const positions = await sortedTroves.findInsertPosition(
    toHex(nominalCollateralRatio),
    hintAddress,
    hintAddress,
  );

  let prev = positions['0'];
  let next = positions['1'];

  if (ownAddress) {
    // In the case of reinsertion, the address of the Trove being reinserted is not a usable hint,
    // because it is deleted from the list before the reinsertion.
    // "Jump over" the Trove to get the proper hint.

    if (prev === ethers.utils.getAddress(ownAddress)) {
      prev = await sortedTroves.getPrev(prev);
    } else if (next === ethers.utils.getAddress(ownAddress)) {
      next = await sortedTroves.getNext(next);
    }
  }

  // Don't use `address(0)` as hint as it can result in huge gas cost.
  // (See https://github.com/liquity/dev/issues/600).
  if (prev === AddressZero) {
    prev = next;
  } else if (next === AddressZero) {
    next = prev;
  }

  return [prev, next];
}
async function currentMintFee(
  time: number,
  troveManagerAddress: string,
  provider: FallbackProvider,
) {
  const calls: Multicall[] = [
    {
      address: contractsDeployedAddress.BorrowerOperations,
      abi: contractAbis.borrowerOperations,
      method: 'fetchBalances',
      params: [],
    },
    {
      address: contractsDeployedAddress.BorrowerOperations,
      abi: contractAbis.borrowerOperations,
      method: 'CCR',
      params: [],
    },
    {
      address: troveManagerAddress,
      abi: contractAbis.troveManager,
      method: 'lastFeeOperationTime',
      params: [],
    },
    {
      address: troveManagerAddress,
      abi: contractAbis.troveManager,
      method: 'baseRate',
      params: [],
    },
    {
      address: troveManagerAddress,
      abi: contractAbis.troveManager,
      method: 'borrowingFeeFloor',
      params: [],
    },
    {
      address: troveManagerAddress,
      abi: contractAbis.troveManager,
      method: 'maxBorrowingFee',
      params: [],
    },
  ];

  console.log('currentMintFee Calls', calls);

  const results = await multicall({
    chainId,
    provider,
    calls,
    isStrict: false,
  });

  const currentBlock = await provider.getBlock('latest');
  const blockTimestamp = Number(currentBlock.timestamp);

  const [
    systemBalances,
    ccr,
    lastFeeOperationTime,
    baseRateWithoutDecay,
    borrowingFeeFloor,
    maxBorrowingRate,
  ] = results.map((result: any, key: number) =>
    key === 0 ? result : new BigNumber(result.toString()),
  );

  let totalCollateralPriced = new BigNumber(0);
  let totalDebt = new BigNumber(0);

  const collateralLength = systemBalances.collaterals.length;
  for (let i = 0; i < collateralLength; i++) {
    const collateralTotal = new BigNumber(
      systemBalances.collaterals[i].toString(),
    ).multipliedBy(new BigNumber(systemBalances.prices[i].toString()));
    totalCollateralPriced = totalCollateralPriced.plus(collateralTotal);
    totalDebt = totalDebt.plus(systemBalances.debts[i].toString());
  }

  const recoveryMode = !totalDebt.isZero()
    ? totalCollateralPriced.dividedBy(totalDebt).isLessThan(ccr)
    : false;

  const currentBorrowingRate = decayBorrowingRate(
    blockTimestamp + time,
    recoveryMode,
    lastFeeOperationTime,
    MINUTE_DECAY_FACTOR,
    baseRateWithoutDecay,
    borrowingFeeFloor,
    maxBorrowingRate,
  );

  console.log('currentMintFee currentBorrowingRate', currentBorrowingRate);

  return currentBorrowingRate;
}

// Decay borrow rate at time
function decayBorrowingRate(
  timestamp: number,
  recoveryMode: boolean,
  lastFeeOperation: number,
  minuteDecayFactor: BigNumber,
  baseRateWithoutDecay: BigNumber,
  minBorrowingRate: BigNumber,
  maxBorrowingRate: BigNumber,
) {
  const baseRate = baseRateAtTime(
    timestamp,
    lastFeeOperation,
    minuteDecayFactor,
    baseRateWithoutDecay,
  );
  return recoveryMode
    ? new BigNumber(0)
    : borrowingRate(baseRate, minBorrowingRate, maxBorrowingRate);
}

// Base rate at time
function baseRateAtTime(
  timestamp: number,
  lastFeeOperation: number,
  minuteDecayFactor: BigNumber,
  baseRateWithoutDecay: BigNumber,
) {
  const millisecondsSinceLastFeeOperation = Math.max(
    timestamp - lastFeeOperation,
    0, // Clamp negative elapsed time to 0, in case the client's time is in the past.
    // We will calculate slightly higher than actual fees, which is fine.
  );

  const minutesSinceLastFeeOperation = Math.floor(
    millisecondsSinceLastFeeOperation / 60000,
  );

  return minuteDecayFactor
    .pow(minutesSinceLastFeeOperation)
    .multipliedBy(baseRateWithoutDecay);
}

// Calculate the current borrowing rate.
function borrowingRate(
  baseRate: BigNumber,
  minBorrowingRate: BigNumber,
  maxBorrowingRate: BigNumber,
) {
  return BigNumber.min(minBorrowingRate.plus(baseRate), maxBorrowingRate);
}

export function calculateTotalDebtAmount(
  gasCompensation: BigNumber,
  borrowingRate: BigNumber,
  debtAmount: BigNumber,
) {
  const fee = debtAmount.dividedBy(1e18).multipliedBy(borrowingRate);
  const debtAmountWithFee = debtAmount.dividedBy(1e18).plus(fee);
  return gasCompensation.plus(debtAmountWithFee);
}

// Calculate Trove's nominal collateralization ratio
export function calculateNominalCollateralRatio(
  collateralAmount: BigNumber,
  debtAmount: BigNumber,
  precision: BigNumber,
) {
  return collateralAmount.multipliedBy(precision).dividedBy(debtAmount);
}

function maxUint256BigNumber() {
  return new BigNumber(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );
}

function toHex(n: BigNumber) {
  BigNumber.config({ DECIMAL_PLACES: 0 });
  const ret = '0x' + n.toString(16);
  BigNumber.config({ DECIMAL_PLACES: 18 });
  return ret;
}

function* generateTrials(totalNumberOfTrials: number) {
  if (!(Number.isInteger(totalNumberOfTrials) && totalNumberOfTrials > 0))
    throw new Error(`totalNumberOfTrials must be a integer and bigger than 0`);

  while (totalNumberOfTrials) {
    const numberOfTrials = Math.min(
      totalNumberOfTrials,
      maxNumberOfTrialsAtOnce,
    );
    yield numberOfTrials;

    totalNumberOfTrials -= numberOfTrials;
  }
}

export default findHints;
