import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import usdu_img from '../../assets/images/usdu.png';

import { message } from '@/components/Message';
import WalletConnector from '@/components/WalletConnector';
import {
  chainId,
  contractAbis,
  contractsDeployedAddress,
  explore,
} from '@/constants';
import { useGlobalData } from '@/provider/GlobalDataProvider';
import { ITroveData, ITroveSimple, Multicall } from '@/types';
import { multicall } from '@/utils/ethers';
import { shortenAddress } from '@/utils/format';
import { FallbackProvider } from '@ethersproject/providers';
import { LoadingButton } from '@mui/lab';
import { ethers } from 'ethers';
import { upperFirst } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import './index.css';

interface IRedeemTableItem extends ITroveSimple {
  newDebt: number;
}

const Trove = () => {
  const globalData = useGlobalData();
  const [activeTab, setActiveTab] = useState<string>('');
  const [troves, setTroves] = useState<ITroveData[]>([]);
  const [currentTrove, setCurrentTrove] = useState<ITroveData>();
  const [redeemDebt, setRedeemDebt] = useState<number>();
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [isShowErrorMsg, setIsShowErrorMsg] = useState<boolean>(false);
  const [isOperationLoading, setIsOperationLoading] = useState<boolean>(false);

  const signer = useSigner();
  const account = useAccount();
  const provider = useProvider<FallbackProvider>();

  const errorMsgCode = {
    InsufficientDebt: 'Insufficient debt balance',
  };

  const disabledOperation = useMemo(() => {
    if (isShowErrorMsg) return true;
  }, [isShowErrorMsg, currentTrove]);

  const redeemComputedData = useMemo(() => {
    const data = {
      redemptionFeeAmount: '0.0000',
      expectedCollateralReceived: '0.0000',
      valueofCollateralReceived: '0.0000',
    };

    if (!currentTrove) return data;
    if (!((redeemDebt as number) > 0)) return data;

    const { systemDebt, collPrice, redeemRate } = currentTrove as ITroveData;
    const maxCollValue = systemDebt / collPrice;
    let canRedeemColl = (redeemDebt as number) / collPrice;

    if ((redeemDebt as number) > systemDebt) canRedeemColl = maxCollValue;

    data.redemptionFeeAmount = (canRedeemColl * (redeemRate / 100)).toFixed(4);
    data.expectedCollateralReceived = (
      canRedeemColl *
      (1 - redeemRate / 100)
    ).toFixed(4);
    data.valueofCollateralReceived = (
      canRedeemColl *
      (1 - redeemRate / 100) *
      collPrice
    ).toFixed(4);

    return data;
  }, [currentTrove, redeemDebt]);

  const redeemedDebtTroveIndex = useMemo(() => {
    if (!((redeemDebt as number) > 0) || !currentTrove?.allTroves.length)
      return -1;

    let count = 0;
    const findIndex = currentTrove?.allTroves.findIndex((item) => {
      count += item.debt;

      if (count >= (redeemDebt as number)) return true;
    });

    return findIndex;
  }, [redeemDebt, currentTrove]);

  const tableData = useMemo(() => {
    let count = 0;
    let flag = false;

    const newTableData: IRedeemTableItem[] = [];

    currentTrove?.allTroves.forEach((item, index) => {
      const data: IRedeemTableItem = {
        ...item,
        newDebt: 0,
      };

      if (index === redeemedDebtTroveIndex) {
        data.newDebt =
          parseInt(String((item.debt + count - (redeemDebt as number)) * 100)) /
          100;
        flag = true;
      } else if (!flag) {
        count += item.debt;
      }

      newTableData.push(data);
    });

    return newTableData;
  }, [redeemedDebtTroveIndex, redeemDebt, currentTrove]);

  const redeemOperation = async () => {
    const findPartialRedemption = tableData[redeemedDebtTroveIndex];
    let lowerAddress = ethers.constants.AddressZero;
    let upperAddress = ethers.constants.AddressZero;

    // if (redeemedDebtTroveIndex === 0) {
    //   upperAddress = tableData[redeemedDebtTroveIndex + 1].owner;
    // } else if (redeemedDebtTroveIndex === tableData.length - 1) {
    //   lowerAddress = tableData[redeemedDebtTroveIndex - 1].owner;
    // } else {
    //   upperAddress = tableData[redeemedDebtTroveIndex + 1].owner;
    //   lowerAddress = tableData[redeemedDebtTroveIndex - 1].owner;
    // }

    const { firstRedemptionHint, partialRedemptionHintNICR } =
      await getNomimalCR();

    sendOperation(
      [
        ethers.utils.parseEther(String(redeemDebt || 0)),
        firstRedemptionHint,
        upperAddress,
        lowerAddress,
        partialRedemptionHintNICR,
        0,
        ethers.utils.parseEther(
          String(((currentTrove?.redeemRate as number) + 0.01) / 100),
        ),
      ],
      'redeemCollateral',
    );
  };

  const handleOperation = () => {
    redeemOperation();
  };

  const handleSwitchTab = (newTab: string) => {
    setActiveTab(newTab);

    const findTrove = troves.find((item) => item.troveManager === newTab);

    if (!findTrove) return;

    setCurrentTrove(findTrove);
  };

  const handleMax = (max: number) => {
    setRedeemDebt(max);

    if (!currentTrove) return;

    const { systemDebt } = currentTrove as ITroveData;

    if (max > systemDebt) setRedeemDebt(systemDebt);
  };

  const onInputChange = (newValue: number) => {
    setRedeemDebt(newValue);
  };

  async function sendOperation(params: any[], method: string) {
    const contract = new ethers.Contract(
      currentTrove?.troveManager as string,
      contractAbis.troveManager,
      signer.data as any,
    );

    setIsOperationLoading(true);

    try {
      const gasLimit = await contract.estimateGas[method](...params);
      const tx = await contract[method](...params, {
        gasLimit,
      });

      console.log(`${explore}/tx/${tx.hash}`);

      await tx.wait();

      message.success(`${upperFirst(method)} successful`);

      updateData();
    } catch (error: any) {
      console.error(`${upperFirst(method)} failed`, error);
      message.error(error.toString());
    }

    setIsOperationLoading(false);
  }

  async function getNomimalCR(): Promise<any> {
    const calls: Multicall[] = [
      {
        address: contractsDeployedAddress.MultiCollateralHintHelpers,
        abi: contractAbis.multiCollateralHintHelpers,
        method: 'getRedemptionHints',
        params: [
          currentTrove?.troveManager,
          ethers.utils.parseEther(String(redeemDebt)),
          ethers.utils.parseEther(String(currentTrove?.collPrice)),
          0,
        ],
      },
    ];

    return new Promise((resolve) => {
      const request = async () => {
        try {
          const [res] = await multicall({
            chainId,
            provider,
            calls,
            isStrict: false,
          });

          resolve(res);
        } catch (error: any) {
          console.error('❌get init data error', error.toString());
          setTimeout(request, 1000);
        }
      };

      request();
    });
  }

  function updateData() {
    setRedeemDebt(0);
    globalData.getSystemData();
  }

  useEffect(() => {
    const { sortedTroves = [] } = globalData.trovesData;

    if (!activeTab && sortedTroves.length) {
      setActiveTab(sortedTroves[0].troveManager);
      setCurrentTrove(sortedTroves[0]);
    }

    setTroves(globalData.trovesData.sortedTroves);
  }, [globalData]);

  return (
    <Box className="mt-3 grid grid-cols-2  sm:grid-cols-1 xs:grid-cols-1 gap-2">
      <Box className="flex justify-center ">
        <Box className="grow max-w-30 overflow-hidden">
          <Box className=" flex h-3.125 border border-solid border-tabColor">
            {troves.map((item) => {
              return (
                <Box
                  key={item.troveManager}
                  className={`flex-1 flex justify-center items-center duration-200 cursor-pointer trove-manager-tab-active-hover ${
                    activeTab === item.troveManager
                      ? 'trove-manager-tab-active'
                      : ''
                  }`}
                  onClick={() => handleSwitchTab(item.troveManager)}
                >
                  {item.collName}
                </Box>
              );
            })}
          </Box>

          <Box className="mt-1.25">
            <Typography className="mb-0.5 font-bold">USDU</Typography>
            <TextField
              type="number"
              variant="outlined"
              className="w-full"
              placeholder="Enter an amount"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <img className="mr-0.25 w-1.25 h-1.25" src={usdu_img} />
                      <Typography className=" font-semibold">USDU</Typography>
                    </Stack>
                  </InputAdornment>
                ),
              }}
              value={redeemDebt}
              onChange={(e: any) => onInputChange(e.target.value)}
            ></TextField>
            {/* balance info and max button */}
            {globalData.accountData ? (
              <Box className="mt-1 flex items-center justify-end">
                <Typography className="mr-1 text-0.875 font-bold">
                  Balance:{' '}
                  {globalData.accountData?.balances.debtToken as number}
                </Typography>
                <Button
                  variant="contained"
                  className=" font-semibold"
                  size="small"
                  onClick={() =>
                    handleMax(
                      globalData.accountData?.balances.debtToken as number,
                    )
                  }
                >
                  Max
                </Button>
              </Box>
            ) : (
              <></>
            )}
          </Box>

          {isShowErrorMsg ? (
            <Box className="mt-1.25">
              <Box className="mt-0.75 px-1.25 py-1 text-red-600 text-0.75 border border-solid border-red-600">
                {errorMsg}
              </Box>
            </Box>
          ) : (
            <></>
          )}

          <Box className="mt-0.75">
            <Box className="flex justify-between items-center h-3.125">
              <Typography component="span">
                {currentTrove?.collName} Price
              </Typography>
              <Typography component="span">
                <Typography component="span">
                  {currentTrove?.collPrice}{' '}
                </Typography>
                <Typography component="span">USD</Typography>
              </Typography>
            </Box>
            <Box className="flex justify-between items-center h-2.375">
              <Typography component="span">Redemption Fee</Typography>
              <Typography component="span">
                <Typography component="span">
                  {currentTrove?.redeemRate}
                </Typography>
                <Typography component="span">%</Typography>
              </Typography>
            </Box>
            <Box className="flex justify-between items-center h-2.375">
              <Typography component="span">Redemption Fee Amount</Typography>
              <Typography component="span">
                <Typography component="span">
                  {redeemComputedData.redemptionFeeAmount}{' '}
                </Typography>
                <Typography component="span">wstETH</Typography>
              </Typography>
            </Box>
            <Box className="flex justify-between items-center h-2.375">
              <Typography component="span">
                Expected Collateral Received
              </Typography>
              <Typography component="span">
                <Typography component="span">
                  {redeemComputedData.expectedCollateralReceived}{' '}
                </Typography>
                <Typography component="span">wstETH</Typography>
              </Typography>
            </Box>
            <Box className="flex justify-between items-center h-2.375">
              <Typography component="span">
                Value of Collateral Received
              </Typography>
              <Typography component="span">
                <Typography component="span">
                  {redeemComputedData.valueofCollateralReceived}{' '}
                </Typography>
                <Typography component="span">USD</Typography>
              </Typography>
            </Box>
            <Box className="flex justify-between items-center h-2.375">
              <Typography component="span">Actual Redemption Amount</Typography>
              <Typography component="span">
                <Typography component="span">{redeemDebt || 0} </Typography>
                <Typography component="span">USDU</Typography>
              </Typography>
            </Box>

            <Box className="mt-2.5 h-2.5 cursor-pointer">
              <WalletConnector
                unConnectChildren={
                  <Button fullWidth variant="contained" size="large">
                    <Typography className="font-bold">
                      Connect Wallet
                    </Typography>
                  </Button>
                }
              >
                <LoadingButton
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={disabledOperation}
                  loading={isOperationLoading}
                  onClick={() => handleOperation()}
                >
                  <Typography className="font-bold">
                    {upperFirst('Redeem')}
                  </Typography>
                </LoadingButton>
              </WalletConnector>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="flex  justify-center">
        <Box className="grow max-w-30 overflow-hidden">
          <TableContainer
            component={Paper}
            className="bg-transparent border border-solid border-primary"
          >
            <Table aria-label="Valut CR" className="">
              <TableHead>
                <TableRow>
                  <TableCell className="text-white border-transparent bg-secondary">
                    Owner
                  </TableCell>
                  <TableCell
                    className="text-white border-transparent bg-secondary"
                    align="right"
                  >
                    CR
                  </TableCell>
                  <TableCell
                    className="text-white border-transparent bg-secondary"
                    align="right"
                  >
                    Debt
                  </TableCell>
                  <TableCell
                    className="text-white border-transparent bg-secondary"
                    align="right"
                  >
                    New Debt
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData?.map((item, index) => (
                  <TableRow
                    key={item.owner + item.debt}
                    className={
                      index === redeemedDebtTroveIndex
                        ? 'bg-yellow-500'
                        : index < redeemedDebtTroveIndex
                        ? 'bg-red-500'
                        : ''
                    }
                  >
                    <TableCell
                      className="text-white border-transparent bg-secondary"
                      component="th"
                      scope="row"
                    >
                      {shortenAddress(item.owner)}
                    </TableCell>
                    <TableCell
                      className="text-white border-transparent bg-secondary"
                      align="right"
                    >
                      {item.cr}%
                    </TableCell>
                    <TableCell
                      className="text-white border-transparent bg-secondary"
                      align="right"
                    >
                      {item.debt}
                    </TableCell>
                    <TableCell
                      className="text-white border-transparent bg-secondary"
                      align="right"
                    >
                      {item.newDebt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Trove;
