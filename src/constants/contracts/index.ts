import { JsonFragment, LogDescription } from '@ethersproject/abi';
import { Log } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';

import {
  CallOverrides,
  Contract,
  ContractFunction,
  ContractInterface,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
} from '@ethersproject/contracts';

import borrowerOperationsAbi from './abi/BorrowerOperations.json';
import debtTokenAbi from './abi/DebtToken.json';
import factoryAbi from './abi/Factory.json';
import gasPoolAbi from './abi/GasPool.json';
import liquidationManagerAbi from './abi/LiquidationManager.json';
import multiCollateralHintHelpersAbi from './abi/MultiCollateralHintHelpers.json';
import multiTroveGetterAbi from './abi/MultiTroveGetter.json';
import priceFeedAbi from './abi/PriceFeed.json';

import feeReceiverAbi from './abi/FeeReceiver.json';
import prismaCoreAbi from './abi/PrismaCore.json';
import prismaTokenAbi from './abi/PrismaToken.json';
import prismaVaultAbi from './abi/PrismaVault.json';
import sortedTrovesAbi from './abi/SortedTroves.json';
import stabilityPoolAbi from './abi/StabilityPool.json';
import tokenLockerAbi from './abi/TokenLocker.json';
import troveManagerAbi from './abi/TroveManager.json';
import troveManagerGettersAbi from './abi/TroveManagerGetters.json';
import LPDepositTokenAbi from './abi/LPDepositToken.json';
import erc20ABI from './abi/ERC20.json';


import localDeployed from './depolyment/local.json';
import mainnetDepolyed from './depolyment/mainnet.json';

import {
  BorrowerOperations,
  DebtToken,
  Factory,
  FeeReceiver,
  GasPool,
  LiquidationManager,
  MultiCollateralHintHelpers,
  MultiTroveGetter,
  PriceFeed,
  PrismaCore,
  PrismaToken,
  PrismaVault,
  SortedTroves,
  StabilityPool,
  TokenLocker,
  TroveManager,
  TroveManagerGetters,
  IERC20,
  LPDepositToken,
} from './types/contract';

import { EthersProvider, EthersSigner } from './types';

export interface _TypedLogDescription<T> extends Omit<LogDescription, 'args'> {
  args: T;
}

type BucketOfFunctions = Record<string, (...args: unknown[]) => never>;

// Removes unsafe index signatures from an Ethers contract type
export type _TypeSafeContract<T> = Pick<
  T,
  {
    [P in keyof T]: BucketOfFunctions extends T[P] ? never : P;
  } extends {
    [_ in keyof T]: infer U;
  }
    ? U
    : never
>;

type EstimatedContractFunction<
  R = unknown,
  A extends unknown[] = unknown[],
  O = Overrides,
> = (
  overrides: O,
  adjustGas: (gas: BigNumber) => BigNumber,
  ...args: A
) => Promise<R>;

type CallOverridesArg = [overrides?: CallOverrides];

type TypedContract<T extends Contract, U, V> = _TypeSafeContract<T> &
  U & {
    [P in keyof V]: V[P] extends (...args: infer A) => unknown
      ? (...args: A) => Promise<ContractTransaction>
      : never;
  } & {
    readonly callStatic: {
      [P in keyof V]: V[P] extends (...args: [...infer A, never]) => infer R
        ? (...args: [...A, ...CallOverridesArg]) => R
        : never;
    };

    readonly estimateGas: {
      [P in keyof V]: V[P] extends (...args: infer A) => unknown
        ? (...args: A) => Promise<BigNumber>
        : never;
    };

    readonly populateTransaction: {
      [P in keyof V]: V[P] extends (...args: infer A) => unknown
        ? (...args: A) => Promise<PopulatedTransaction>
        : never;
    };

    readonly estimateAndPopulate: {
      [P in keyof V]: V[P] extends (
        ...args: [...infer A, infer O | undefined]
      ) => unknown
        ? EstimatedContractFunction<PopulatedTransaction, A, O>
        : never;
    };
  };

const buildEstimatedFunctions = <T>(
  estimateFunctions: Record<string, ContractFunction<BigNumber>>,
  functions: Record<string, ContractFunction<T>>,
): Record<string, EstimatedContractFunction<T>> =>
  Object.fromEntries(
    Object.keys(estimateFunctions).map((functionName) => [
      functionName,
      async (overrides, adjustEstimate, ...args) => {
        if (overrides.gasLimit === undefined) {
          const estimatedGas = await estimateFunctions[functionName](
            ...args,
            overrides,
          );

          overrides = {
            ...overrides,
            gasLimit: adjustEstimate(estimatedGas),
          };
        }

        return functions[functionName](...args, overrides);
      },
    ]),
  );

export class _LiquityContract extends Contract {
  readonly estimateAndPopulate: Record<
    string,
    EstimatedContractFunction<PopulatedTransaction>
  >;

  constructor(
    addressOrName: string,
    contractInterface: ContractInterface,
    signerOrProvider?: EthersSigner | EthersProvider,
  ) {
    super(addressOrName, contractInterface, signerOrProvider);

    // this.estimateAndCall = buildEstimatedFunctions(this.estimateGas, this);
    this.estimateAndPopulate = buildEstimatedFunctions(
      this.estimateGas,
      this.populateTransaction,
    );
  }

  extractEvents(logs: Log[], name: string): _TypedLogDescription<unknown>[] {
    return logs
      .filter((log) => log.address === this.address)
      .map((log) => this.interface.parseLog(log))
      .filter((e) => e.name === name);
  }
}

/** @internal */
export type _TypedLiquityContract<T = unknown, U = unknown> = TypedContract<
  _LiquityContract,
  T,
  U
>;

/** @internal */
export interface _LiquityContracts {
  borrowerOperations: BorrowerOperations;
  debtToken: DebtToken;
  factory: Factory;
  gasPool: GasPool;
  liquidationManager: LiquidationManager;
  multiCollateralHintHelpers: MultiCollateralHintHelpers;
  multiTroveGetter: MultiTroveGetter;
  priceFeed: PriceFeed;
  prismaCore: PrismaCore;
  prismaToken: PrismaToken;
  stabilityPool: StabilityPool;
  troveManagerGetters: TroveManagerGetters;
  tokenLocker: TokenLocker;
  prismaVault: PrismaVault;
  feeReceiver: FeeReceiver;
  sortedTroves: SortedTroves;
  troveManager: TroveManager;
  lpTokenStaking: LPDepositToken;
  erc20: IERC20;
}

type LiquityContractsKey = keyof _LiquityContracts;

/** @internal */
export type _LiquityContractAddresses = Record<LiquityContractsKey, string>;

type LiquityContractAbis = Record<LiquityContractsKey, JsonFragment[]>;

export const contractAbis: LiquityContractAbis = {
  borrowerOperations: borrowerOperationsAbi,
  debtToken: debtTokenAbi,
  factory: factoryAbi,
  gasPool: gasPoolAbi,
  liquidationManager: liquidationManagerAbi,
  multiTroveGetter: multiTroveGetterAbi,
  multiCollateralHintHelpers: multiCollateralHintHelpersAbi,
  priceFeed: priceFeedAbi,
  prismaCore: prismaCoreAbi,
  prismaToken: prismaTokenAbi,
  sortedTroves: sortedTrovesAbi,
  troveManager: troveManagerAbi,
  stabilityPool: stabilityPoolAbi,
  troveManagerGetters: troveManagerGettersAbi,
  tokenLocker: tokenLockerAbi,
  prismaVault: prismaVaultAbi,
  feeReceiver: feeReceiverAbi,
  lpTokenStaking: LPDepositTokenAbi,
  erc20: erc20ABI,
};

export const isProd = process.env.NODE_ENV !== 'development';
// export const envData = !isProd ? localDeployed : mainnetDepolyed;
export const envData = !isProd ? localDeployed : mainnetDepolyed;

export const contractsDeployedAddress = envData.addresses;
export const chainId = envData.chain.chainId;
export const explore = envData.chain.explore;


// const mapLiquityContracts = <T, U>(
//   contracts: Record<LiquityContractsKey, T>,
//   f: (t: T, key: LiquityContractsKey) => U,
// ) =>
//   Object.fromEntries(
//     Object.entries(contracts).map(([key, t]) => [
//       key,
//       f(t, key as LiquityContractsKey),
//     ]),
//   ) as Record<LiquityContractsKey, U>;

// /** @internal */
// export interface _LiquityDeploymentJSON {
//   readonly chainId: number;
//   readonly addresses: _LiquityContractAddresses;
// }

// /** @internal */
// export const _connectToContracts = (
//   signerOrProvider: EthersSigner | EthersProvider,
//   { addresses }: _LiquityDeploymentJSON,
// ): _LiquityContracts => {
//   const abi = getAbi();

//   return mapLiquityContracts(
//     addresses,
//     (address, key) =>
//       new _LiquityContract(
//         address,
//         abi[key],
//         signerOrProvider,
//       ) as _TypedLiquityContract,
//   ) as _LiquityContracts;
// };
