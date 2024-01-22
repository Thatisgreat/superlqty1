import { ILPToken, LP_TOKEN_LIST, tokenETHLPToken } from '@/constants/config';
import {
  chainId,
  contractAbis,
  contractsDeployedAddress,
} from '@/constants/contracts';
import UNIV2PairABI from '@/constants/contracts/abi/Univ2Pair.json';

import {
  IAccountData,
  IAccountTrove,
  IEarn,
  IEarns,
  IGlobalData,
  ITroveData,
  ITroves,
  Multicall,
} from '@/types';
import { parseETHAmountToNumber } from '@/utils';
import ethers, { multicall } from '@/utils/ethers';
import message from '@/utils/message';
import { multicallABI, multicallContractMap } from '@/utils/multicall';
import { FallbackProvider } from '@ethersproject/providers';
import React, { useContext, useEffect, useState } from 'react';
import { useAccount, useChainId, useProvider } from 'wagmi';

interface TroveItem {
  collateral: string;
  troveManager: string;
}

interface TrovesRes {
  troves: TroveItem[];
  ethPrice: number;
  minNetDebt: number;
}

interface GlobalDataProps {
  children?: React.ReactNode;
}

const getInitData = () => ({
  coinPrice: 0,
  tokenPrice: 0,
  minNetDebt: 0,
  trovesData: {
    sortedTroves: [],
    troves: {},
  },
  earnsData: {
    sp: {
      pool: '',
      source: 'Stability Pool',
      tvl: 0,
      apr: 0,
      yourDeposits: 0,
      earned: 0,
      lpToken: '',
      lpPrice: 1,
      depositContract: '',
    },
    lps: [],
  },
  accountData: null,
  getSystemData: () => { },
});

const GlobalDataContext = React.createContext<IGlobalData>(getInitData());

export const GlobalDataProvider: React.FC<GlobalDataProps> = ({ children }) => {
  const [coinPrice, setCoinPrice] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [minNetDebt, setMinNetDebt] = useState<number>(0);
  const [trovesData, setTrovesData] = useState<ITroves>(
    getInitData().trovesData,
  );
  const [earnsData, setEarnsData] = useState<IEarns>(getInitData().earnsData);
  const [accountData, setAccountData] = useState<IAccountData | null>(null);

  const account = useAccount();
  const connectedChainId = useChainId();
  const provider = useProvider<FallbackProvider>();
  let timer: any = null;

  const getSystemData = async () => {
    if (connectedChainId !== chainId) return message.error('Error network');

    const { troves, ethPrice, minNetDebt } = await getTrovesAndETHPrice();

    setCoinPrice(ethPrice);
    setMinNetDebt(minNetDebt);

    const [newTrovesData, newEarnsData] = await Promise.all([
      getTrovesData(troves, ethPrice),
      getEarnsData(ethPrice),
    ]);

    console.log('troveManagers', newTrovesData);
    console.log('earnDatas', newEarnsData);

    if (!account.address) return;

    getAccountData(newTrovesData, newEarnsData);
  };

  //get troves list, contains colls and trovemanagers
  const getTrovesData = async (troves: TroveItem[], ethPrice: number) => {
    const tasks: any = [];

    troves.map(({ collateral, troveManager }) =>
      tasks.push(getTrove(collateral, troveManager, ethPrice)),
    );

    const res: ITroveData[] = await Promise.all(tasks);

    const newTrovesData: ITroves = {
      sortedTroves: [],
      troves: {},
    };

    troves.forEach(({ troveManager }, index) => {
      newTrovesData.troves[troveManager] = res[index];
      newTrovesData.sortedTroves.push(res[index]);
    });

    setTrovesData(newTrovesData);

    return newTrovesData;
  };

  const getEarnsData = async (ethPrice: number) => {
    // const tokenPrice = await getTokenPriceCurve();
    const tokenPrice = await getTokenPriceUni(ethPrice);

    setTokenPrice(tokenPrice);

    const [spData, lpsData] = await Promise.all([
      getSPData(tokenPrice),
      // getLPsDataCurve(tokenPrice, LP_TOKEN_LIST),
      getLPsDataUni(tokenPrice, LP_TOKEN_LIST),
    ]);

    const newEarnsData = {
      sp: spData,
      lps: lpsData,
    };

    setEarnsData(newEarnsData);

    return newEarnsData;
  };

  const getAccountData = async (
    newTrovesData: ITroves,
    newEarnsData: IEarns,
  ) => {
    const address = account.address;
    // const address = '0xbDfA4f4492dD7b7Cf211209C4791AF8d52BF5c50';
    // const address = '0x1362d0ddAa44D70cfF5BdF462111e92D46F99ebc';
    const data: IAccountData = await getAccountBaseInfo(
      address as string,
      newTrovesData.sortedTroves,
      newEarnsData.lps,
    );
    console.log('accountData', data);
    if (!data.trovesData.length) {
      setAccountData(data);
      return;
    }

    data.trovesData = await getAccountTrovesData(
      address as string,
      data.trovesData,
    );

    setAccountData(data);

    return data;
  };

  //get single trove data
  async function getTrovesAndETHPrice(): Promise<TrovesRes> {
    const calls: Multicall[] = [
      {
        address: contractsDeployedAddress.TroveManagerGetters,
        abi: contractAbis.troveManagerGetters,
        method: 'getAllCollateralsAndTroveManagers',
        params: [],
      },
      {
        address: contractsDeployedAddress.PriceFeed,
        abi: contractAbis.priceFeed,
        method: 'priceRecords',
        params: [ethers.constants.AddressZero],
      },
      {
        address: contractsDeployedAddress.BorrowerOperations,
        abi: contractAbis.borrowerOperations,
        method: 'minNetDebt',
        params: [],
      },
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const [troves, ethPrice, minNetDebt] = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          return resolve({
            troves: troves.map(({ collateral, troveManagers }: any) => ({
              collateral,
              troveManager: troveManagers[0],
            })),
            ethPrice: parseETHAmountToNumber(ethPrice.scaledPrice),
            minNetDebt: parseInt(ethers.utils.formatEther(minNetDebt))
          });
        } catch (error: any) {
          console.error('❌get troves error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });
  }

  //get single trove data
  async function getTrove(
    collateral: string,
    troveManager: string,
    ethPrice: number,
  ): Promise<ITroveData> {
    const troveData: ITroveData = {
      collateral,
      troveManager,
      collPrice: 0,
      systemColl: 0,
      systemDebt: 0,
      mcr: 0,
      mintFee: 0,
      borrowInterestRate: 0,
      debtGasCompensation: 0,
      maxSystemDebt: 0,
      sortedTroves: '',
      collName: '',
      allTroves: [],
      redeemRate: 0,
    };

    const calls: Multicall[] = [
      {
        address: contractsDeployedAddress.PriceFeed,
        abi: contractAbis.priceFeed,
        method: 'priceRecords',
        params: [collateral],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'getEntireSystemColl',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'getEntireSystemDebt',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'MCR',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'getBorrowingRate',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'MAX_INTEREST_RATE_IN_BPS',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'DEBT_GAS_COMPENSATION',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'maxSystemDebt',
        params: [],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'sortedTroves',
        params: [],
      },
      {
        address: collateral,
        abi: contractAbis.erc20,
        method: 'symbol',
        params: [],
      },
      {
        address: contractsDeployedAddress.MultiTroveGetter,
        abi: contractAbis.multiTroveGetter,
        method: 'getMultipleSortedTroves',
        params: [
          troveManager,
          0,
          // isProd ? 999999: 1, 
          999999,
        ],
      },
      {
        address: troveManager,
        abi: contractAbis.troveManager,
        method: 'getRedemptionRate',
        params: [],
      },
    ];

    const results: any = await new Promise((resolve) => {
      const request = async () => {
        try {
          const res = await multicall({
            chainId,
            calls,
            provider,
            isStrict: false,
          });

          return resolve(res);
        } catch (error: any) {
          console.error('get trove data error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });

    troveData.collPrice = parseInt(
      (parseETHAmountToNumber(results[0].scaledPrice) * ethPrice).toFixed(2),
    );
    troveData.systemColl = parseETHAmountToNumber(results[1]);
    troveData.systemDebt = parseETHAmountToNumber(results[2]);
    troveData.mcr = parseInt(String(parseETHAmountToNumber(results[3]) * 100));
    troveData.mintFee = parseETHAmountToNumber(results[4], 4);
    troveData.borrowInterestRate = parseETHAmountToNumber(results[5]);
    troveData.debtGasCompensation = parseETHAmountToNumber(results[6]);
    troveData.maxSystemDebt = parseETHAmountToNumber(results[7]);
    troveData.sortedTroves = results[8];
    troveData.collName = results[9];
    troveData.allTroves = results[10]
      .map(({ owner, coll, debt }: any) => {
        const collParse = parseETHAmountToNumber(coll);
        const debtParse = parseETHAmountToNumber(debt);
        const cr =
          parseInt(
            String(((troveData.collPrice * collParse) / debtParse) * 10000),
          ) / 100;

        return {
          owner,
          coll: collParse,
          debt: debtParse,
          cr,
        };
      })
      .reverse();
    troveData.redeemRate = parseETHAmountToNumber(results[11], 4) * 100;

    return troveData;
  }

  //get product token price, cal apr
  async function getTokenPriceCurve(): Promise<number> {
    const calls: Multicall[] = [
      {
        address: '0x9d8108ddd8ad1ee89d527c0c9e928cb9d2bba2d3',
        abi: [
          {
            stateMutability: 'view',
            type: 'function',
            name: 'last_prices',
            inputs: [],
            outputs: [
              {
                name: '',
                type: 'uint256',
              },
            ],
          },
        ],
        method: 'last_prices',
        params: [],
      },
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const [price] = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          return resolve(parseETHAmountToNumber(price, 4));
        } catch (error: any) {
          console.error('❌get token price error', error.toString());
          // setTimeout(request, 1000);
          return resolve(0);
        }
      };

      request();
    });
  }

  //get product token price, cal apr
  async function getTokenPriceUni(ethPrice: number): Promise<number> {
    const calls: Multicall[] = [
      {
        address: tokenETHLPToken,
        abi: UNIV2PairABI,
        method: 'token0',
        params: [],
      },
      {
        address: tokenETHLPToken,
        abi: UNIV2PairABI,
        method: 'getReserves',
        params: [],
      }
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const [token0, { _reserve0, _reserve1 }] = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          const tokenIndex = (token0.toLowerCase() === contractsDeployedAddress.PrismaToken.toLowerCase()) ? 0 : 1;
          const ethReserve = tokenIndex === 0 ? _reserve1 : _reserve0;
          const tokenReserve = tokenIndex === 0 ? _reserve0 : _reserve1;
          const EthValue = Number(ethers.utils.formatEther(ethReserve)) * ethPrice;
          const tokenPrice = EthValue / Number(ethers.utils.formatEther(tokenReserve));

          return resolve(Number(tokenPrice.toFixed(4)));
        } catch (error: any) {
          console.error('❌get token price error', error.toString());
          // setTimeout(request, 1000);
          return resolve(0);
        }
      };

      request();
    });
  }

  //get sp data
  async function getSPData(tokenPrice: number): Promise<IEarn> {
    const spData: IEarn = {
      pool: 'USDU',
      source: 'Stability Pool',
      tvl: 0,
      apr: 0,
      yourDeposits: 0,
      earned: 0,
      lpPrice: 1,
      lpToken: contractsDeployedAddress.DebtToken,
      depositContract: contractsDeployedAddress.StabilityPool,
    };

    const calls: Multicall[] = [
      {
        address: contractsDeployedAddress.DebtToken,
        abi: contractAbis.erc20,
        method: 'balanceOf',
        params: [contractsDeployedAddress.StabilityPool],
      },
      {
        address: contractsDeployedAddress.StabilityPool,
        abi: contractAbis.stabilityPool,
        method: 'rewardRate',
        params: [],
      },
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const [tvl, rewardRate] = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          spData.tvl = parseInt(ethers.utils.formatEther(tvl));
          spData.apr =
            parseInt(
              String(
                ((Number(ethers.utils.formatEther(rewardRate)) * 86400 * 365) /
                  spData.tvl /
                  2) *
                tokenPrice *
                10000,
              ),
            ) / 100 || 0;

          return resolve(spData);
        } catch (error: any) {
          console.error('❌get sp data error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });
  }

  async function getLPsDataCurve(
    tokenPrice: number,
    lps: ILPToken[],
  ): Promise<IEarn[]> {
    if (!lps.length) return [];

    const calls: Multicall[] = [];
    const earns: IEarn[] = [];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          lps.forEach(({ lp_token, deposit_contract }) => {
            calls.push(
              ...[
                {
                  address: deposit_contract,
                  abi: contractAbis.erc20,
                  method: 'totalSupply',
                  params: [],
                },
                {
                  address: deposit_contract,
                  abi: contractAbis.lpTokenStaking,
                  method: 'rewardRate',
                  params: [0],
                },
                {
                  address: lp_token,
                  abi: [
                    {
                      stateMutability: 'view',
                      type: 'function',
                      name: 'minter',
                      inputs: [],
                      outputs: [
                        {
                          name: '',
                          type: 'address',
                        },
                      ],
                      gas: 3000,
                    },
                  ],
                  method: 'minter',
                  params: [],
                },
              ],
            );
          });

          const res = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          const pricesContract: string[] = [];

          lps.forEach(({ lp_token, deposit_contract, name, source }, index) => {
            const earnData: IEarn = {
              pool: name,
              source,
              tvl: 0,
              apr: 0,
              yourDeposits: 0,
              earned: 0,
              lpPrice: 1,
              lpToken: lp_token,
              depositContract: deposit_contract,
            };

            const dataLength = 3;
            const [tvl, rewardRate, minter] = res.slice(
              index * dataLength,
              (index + 1) * dataLength,
            );

            pricesContract.push(minter);

            earnData.tvl = parseInt(ethers.utils.formatEther(tvl));
            earnData.apr =
              (Number(ethers.utils.formatEther(rewardRate)) *
                86400 *
                365 *
                tokenPrice) /
              2;

            earns.push(earnData);
          });

          const lpPrices = await multicall({
            chainId,
            provider,
            calls: pricesContract.map((minter) => ({
              address: minter,
              abi: [
                {
                  stateMutability: 'view',
                  type: 'function',
                  name: 'lp_price',
                  inputs: [],
                  outputs: [
                    {
                      name: '',
                      type: 'uint256',
                    },
                  ],
                },
              ],
              method: 'lp_price',
              params: [],
            })),
            isStrict: false,
          });

          earns.forEach((item, index) => {
            let lpPrice = parseETHAmountToNumber(lpPrices[index], 5);
            lpPrice = lps[index].lp_price_reserve ? (1 / lpPrice) : lpPrice;

            item.tvl = item.tvl * lpPrice;
            item.apr = parseInt(String((item.apr / item.tvl) * 10000)) / 100;
            item.lpPrice = lpPrice;
          });

          return resolve(earns);
        } catch (error: any) {
          console.error('❌get lps data error', error.toString());
          // setTimeout(request, 1000);

          return resolve([]);
        }
      };

      request();
    });
  }

  async function getLPsDataUni(
    tokenPrice: number,
    lps: ILPToken[],
  ): Promise<IEarn[]> {
    if (!lps.length) return [];

    const calls: Multicall[] = [];
    const earns: IEarn[] = [];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          lps.forEach(({ lp_token, deposit_contract }) => {
            calls.push(
              ...[
                {
                  address: deposit_contract,
                  abi: contractAbis.erc20,
                  method: 'totalSupply',
                  params: [],
                },
                {
                  address: deposit_contract,
                  abi: contractAbis.lpTokenStaking,
                  method: 'rewardRate',
                  params: [0],
                },
                {
                  address: lp_token,
                  abi: UNIV2PairABI,
                  method: 'token0',
                  params: [],
                },
                {
                  address: tokenETHLPToken,
                  abi: UNIV2PairABI,
                  method: 'getReserves',
                  params: [],
                },
                {
                  address: tokenETHLPToken,
                  abi: UNIV2PairABI,
                  method: 'totalSupply',
                  params: [],
                }
              ],
            );
          });

          const res = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          lps.forEach(({ lp_token, deposit_contract, name, source }, index) => {
            const earnData: IEarn = {
              pool: name,
              source,
              tvl: 0,
              apr: 0,
              yourDeposits: 0,
              earned: 0,
              lpPrice: 1,
              lpToken: lp_token,
              depositContract: deposit_contract,
            };

            const dataLength = 5;
            const [tvl, rewardRate, token0, { _reserve0, _reserve1 }, totalSupply] = res.slice(
              index * dataLength,
              (index + 1) * dataLength,
            );

            const tokenIndex = (token0.toLowerCase() === contractsDeployedAddress.PrismaToken.toLowerCase()) ? 0 : 1;
            const tokenReserve = tokenIndex === 0 ? _reserve0 : _reserve1;
            const tokenValue = Number(ethers.utils.formatEther(tokenReserve)) * tokenPrice;
            const lpPrice = tokenValue * 2 / Number(ethers.utils.formatEther(totalSupply));

            earnData.tvl = parseInt(String(Number(ethers.utils.formatEther(tvl)) * lpPrice));
            earnData.apr =
              (Number(ethers.utils.formatEther(rewardRate)) * 86400 * 365 * tokenPrice) / 2;
            earnData.apr = parseInt(String((earnData.apr / earnData.tvl) * 10000)) / 100 || 0;
            earnData.lpPrice = lpPrice;

            earns.push(earnData);
          });

          return resolve(earns);
        } catch (error: any) {
          console.error('❌get lps data error', error.toString());
          // setTimeout(request, 1000);

          return resolve([]);
        }
      };

      request();
    });
  }


  async function getAccountBaseInfo(
    address: string,
    troves: ITroveData[],
    lps: IEarn[],
  ): Promise<IAccountData> {
    const trovesLength = troves.length;
    const lpsLength = lps.length;

    const data: IAccountData = {
      balances: {
        coin: 0,
        token: 0,
        debtToken: 0,
      },
      trovesData: [],
      earnsData: {
        sp: {
          lpToken: contractsDeployedAddress.DebtToken,
          depositContract: contractsDeployedAddress.StabilityPool,
          yourDeposits: 0,
          earned: 0,
        },
        lps: [],
      },
    };

    const calls: Multicall[] = [
      //balances
      {
        address: multicallContractMap[chainId],
        abi: multicallABI,
        method: 'getEthBalance',
        params: [address],
      },
      {
        address: contractsDeployedAddress.PrismaToken,
        abi: contractAbis.erc20,
        method: 'balanceOf',
        params: [address],
      },
      {
        address: contractsDeployedAddress.DebtToken,
        abi: contractAbis.erc20,
        method: 'balanceOf',
        params: [address],
      },
      ...troves.map((item) => ({
        address: item.collateral,
        abi: contractAbis.erc20,
        method: 'balanceOf',
        params: [address],
      })),

      //get user troves
      {
        address: contractsDeployedAddress.TroveManagerGetters,
        abi: contractAbis.troveManagerGetters,
        method: 'getActiveTroveManagersForAccount',
        params: [address],
      },

      //earn stake
      {
        address: contractsDeployedAddress.StabilityPool,
        abi: contractAbis.stabilityPool,
        method: 'accountDeposits',
        params: [address],
      },

      ...lps.map((item) => ({
        address: item.depositContract,
        abi: contractAbis.lpTokenStaking,
        method: 'balanceOf',
        params: [address],
      })),

      //earn reward
      {
        address: contractsDeployedAddress.StabilityPool,
        abi: contractAbis.stabilityPool,
        method: 'claimableReward',
        params: [address],
      },
      ...lps.map((item) => ({
        address: item.depositContract,
        abi: contractAbis.lpTokenStaking,
        method: 'claimableReward',
        params: [address],
      })),
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const res = await multicall({
            chainId,
            calls,
            provider,
            isStrict: false,
          });

          const balancesEnd = 3 + trovesLength;
          const accountTrovesEnd = balancesEnd + 1;
          const earnStakeEnd = accountTrovesEnd + 1 + lpsLength;

          const [coinBalance, tokenBalance, debtBalance, ...collBalances] =
            res.slice(0, balancesEnd);
          const [accountTroves] = res.slice(balancesEnd, accountTrovesEnd);
          const [spStaking, ...lpsStakings] = res.slice(
            accountTrovesEnd,
            earnStakeEnd,
          );
          const [spReward, ...lpsRewads] = res.slice(earnStakeEnd);

          //balance data
          data.balances.coin = parseETHAmountToNumber(coinBalance);
          data.balances.token = parseETHAmountToNumber(tokenBalance);
          data.balances.debtToken = parseETHAmountToNumber(debtBalance);
          troves.forEach(
            (item, index) =>
            (data.balances[item.collateral] = parseETHAmountToNumber(
              collBalances[index],
            )),
          );

          //account troves
          if (accountTroves.length) {
            data.trovesData = accountTroves
              .filter((troveAddress: string) =>
                troves.some(
                  (item) =>
                    item.troveManager.toLowerCase() ===
                    troveAddress.toLowerCase(),
                ),
              )
              .map((troveAddress: string) => {
                const trove = troves.find(
                  (item) =>
                    item.troveManager.toLowerCase() ===
                    troveAddress.toLowerCase(),
                );
                return {
                  trove,
                  postionAt: 0,
                  debt: 0,
                  debtFront: 0,
                  collateral: 0,
                  cr: 0,
                  liquidationPrice: 0,
                };
              });
          }

          //account earns
          data.earnsData.sp = {
            lpToken: contractsDeployedAddress.DebtToken,
            depositContract: contractsDeployedAddress.StabilityPool,
            yourDeposits: parseETHAmountToNumber(spStaking.amount),
            earned: parseETHAmountToNumber(spReward),
          };

          lps.forEach((item, index) => {
            const staking = lpsStakings[index];
            const reward = lpsRewads[index];

            if (staking.lte(0)) return;

            data.earnsData.lps.push({
              lpToken: item.lpToken,
              depositContract: item.depositContract,
              yourDeposits: parseETHAmountToNumber(staking),
              earned: parseETHAmountToNumber(reward[0]),
            });
          });

          return resolve(data);
        } catch (error: any) {
          console.error('get account base data error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });
  }

  async function getAccountTrovesData(
    address: string,
    accountTroves: IAccountTrove[],
  ): Promise<IAccountTrove[]> {
    const calls: Multicall[] = [];

    accountTroves.forEach((item) => {
      const {
        trove: { troveManager, allTroves },
      } = item;
      const findPosition = allTroves
        .reverse()
        .findIndex(
          (item, index) => item.owner.toLowerCase() === address.toLowerCase(),
        );

      item.postionAt = allTroves.length - (findPosition - 1);

      for (let i = item.postionAt; i < allTroves.length; i++)
        item.debtFront += allTroves[i].debt;

      calls.push(
        ...[
          {
            address: troveManager,
            abi: contractAbis.troveManager,
            method: 'Troves',
            params: [address],
          },
        ],
      );
    });

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const res = await multicall({
            chainId,
            calls,
            provider,
            isStrict: false,
          });

          const trovesLength = 1;

          accountTroves.forEach((item, index) => {
            const {
              trove: { collPrice, mcr },
            } = item;
            const [{ coll, debt, status }] = res.slice(
              index * trovesLength,
              (index + 1) * trovesLength,
            );

            item.collateral = parseETHAmountToNumber(coll);
            item.debt = parseETHAmountToNumber(debt);
            item.cr =
              parseInt(
                String(((item.collateral * collPrice) / item.debt) * 10000),
              ) / 100;
            item.liquidationPrice = parseInt(String((item.debt * (mcr / 100)) / item.collateral * 100)) / 100;
            item.status = status;
          });

          return resolve(accountTroves);
        } catch (error: any) {
          console.error('get trove data error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });
  }

  //user account data
  useEffect(() => {
    const { address } = account;

    if (!address) setAccountData(null);

    getSystemData();

    timer = setInterval(getSystemData, 30 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [connectedChainId, account.address]);

  return (
    <GlobalDataContext.Provider
      value={{ coinPrice, tokenPrice, minNetDebt, trovesData, earnsData, accountData, getSystemData }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const globalDataContext = useContext(GlobalDataContext);

  return globalDataContext;
};
