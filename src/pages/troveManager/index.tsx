import { FallbackProvider } from '@ethersproject/providers';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  InputAdornment,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { upperFirst } from 'lodash';
import eth_img from '../../assets/images/eth.png';
import usdu_img from '../../assets/images/usdu.png';

import { message } from '@/components/Message';
import WalletConnector from '@/components/WalletConnector';
import {
  chainId,
  contractAbis,
  contractsDeployedAddress,
  explore,
  recoveryModeTCR,
} from '@/constants';
import { useGlobalData } from '@/provider/GlobalDataProvider';
import { IAccountTrove, IGlobalData, ITroveData, Multicall } from '@/types';
import { Decimal } from '@/utils/decimal';
import { multicall } from '@/utils/ethers';
import findHints from '@/utils/hints';
import { Link, useParams } from '@umijs/max';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useProvider, useSigner } from 'wagmi';
import './index.css';

interface IFormData {
  coll: number | undefined;
  debt: number | undefined;
}

interface IMaxCanOperationAmount {
  withdraw: number;
  borrow: number;
  repay: number;
}

enum TROVE_OPERATION {
  OpenTrove = 'open Trove',
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Borrow = 'borrow',
  Repay = 'repay',
  Approve = 'approve',
  CloseTrove = 'closeTrove',
}

enum TAB {
  Collateral = 'Collateral',
  USDU = 'USDU',
  Close = 'Close',
}

const Trove = () => {
  const globalData: IGlobalData = useGlobalData();
  const [currentTrove, setCurrentTrove] = useState<ITroveData>();
  const [accountTrove, setAccountTrove] = useState<IAccountTrove>();
  const [currentCR, setCurrentCR] = useState<number>(recoveryModeTCR);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [operation, setOperation] = useState<TROVE_OPERATION>(
    TROVE_OPERATION.OpenTrove,
  );
  const [activeTab, setActiveTab] = useState<TAB>(TAB.Collateral);
  const [allowance, setAllowance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [formData, setFormData] = useState<IFormData>({
    coll: undefined,
    debt: undefined,
  });
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [maxCanOperationAmount, setMaxCanOperationAmount] =
    useState<IMaxCanOperationAmount>({
      withdraw: 0,
      borrow: 0,
      repay: 0,
    });
  const routeParams = useParams();
  const provider = useProvider<FallbackProvider>();
  const account = useAccount();
  const connectedChainId = useChainId();
  const signer = useSigner();

  const [existTrove, setExistTrove] = useState<boolean>(false);
  const [isShowErrorMsg, setIsShowErrorMsg] = useState<boolean>(false);
  const [isOperationLoading, setIsOperationLoading] = useState<boolean>(false);

  const errorMsgCode = {
    InvalidCR:
      'Opening an account with a Collateral Ratio of less than 150% is at risk of liquidation during recovery mode.',
    InvalidDebt: "Trove's net debt must be greater than minimum",
    InsufficientColl: 'Insufficient collateral balance',
    InsufficientDebt: 'Insufficient debt balance',
    ExceedWithdraw: `Withdraw exceeds maximum value of Recovery Mode 150%`,
    ExceedBorrow: 'Borrow exceeds maximum value of Recovery Mode 150%',
    ExceedRepay: 'Repay exceeds maximum value of Recovery Mode 150%',
  };

  const isNeedApprove = useMemo(() => {
    if (
      ![TROVE_OPERATION.OpenTrove, TROVE_OPERATION.Deposit].includes(operation)
    )
      return false;

    if (!formData.coll) return false;

    if (allowance.lte(ethers.utils.parseEther(String(formData.coll as number))))
      return true;

    return false;
  }, [operation, formData.coll, allowance]);

  const disabledOperation = useMemo(() => {
    if (isNeedApprove) return false;
    if (isShowErrorMsg) return true;

    switch (operation) {
      case TROVE_OPERATION.OpenTrove:
        return (
          !((formData.coll as number) > 0) ||
          !formData.debt ||
          formData.debt <= 0 ||
          currentCR < (currentTrove as ITroveData)?.mcr
        );
      case TROVE_OPERATION.Deposit:
      case TROVE_OPERATION.Withdraw:
        return !((formData.coll as number) > 0);
      case TROVE_OPERATION.Borrow:
      case TROVE_OPERATION.Repay:
        return !((formData.debt as number) > 0);
      case TROVE_OPERATION.CloseTrove:
        break;
      default:
        break;
    }
  }, [isShowErrorMsg, formData, isNeedApprove, currentCR, currentTrove]);

  const approveOperation = async () => {
    const contract = new ethers.Contract(
      (currentTrove as ITroveData)?.collateral,
      contractAbis.erc20,
      signer.data as any,
    );

    setIsOperationLoading(true);

    try {
      const gasLimit = await contract.estimateGas.approve(
        contractsDeployedAddress.BorrowerOperations,
        ethers.constants.MaxInt256,
      );
      const tx = await contract.approve(
        contractsDeployedAddress.BorrowerOperations,
        ethers.constants.MaxInt256,
        {
          gasLimit,
        },
      );

      console.log(`${explore}/tx/${tx.hash}`);

      await tx.wait();

      await getInitData();

      message.success('Operation successful');
    } catch (error: any) {
      console.error('❌approve error', error);
      message.error(error.toString());
    }

    setIsOperationLoading(false);
  };

  const openTroveOperation = async () => {
    const { parseEther } = ethers.utils;

    setIsOperationLoading(true);

    try {
      const hints = await findHints(
        account.address as string,
        {
          trove_manager: currentTrove?.troveManager || '',
          sorted_troves: currentTrove?.sortedTroves || '',
          minimumNetDebt: globalData.minNetDebt || 1800,
        },
        {
          borrowDebt: new BigNumber(
            parseEther(String(formData.debt)).toString(),
          ),
          depositColl: new BigNumber(
            parseEther(String(formData.coll)).toString(),
          ),
        },
        provider,
      );

      sendOperation(
        [
          currentTrove?.troveManager,
          account.address,
          parseEther('1'),
          parseEther(String(formData.coll)),
          parseEther(String(formData.debt)),
          ...hints,
        ],
        'openTrove',
      );
    } catch (error) {
      message.error('Opps, Something error, please try again...');
    }
  };

  const depositOperation = async () => {
    const { parseEther } = ethers.utils;

    setIsOperationLoading(true);

    try {
      const hints = await findHints(
        account.address as string,
        {
          trove_manager: currentTrove?.troveManager || '',
          sorted_troves: currentTrove?.sortedTroves || '',
          minimumNetDebt: globalData.minNetDebt || 1800,
        },
        {
          depositColl: new BigNumber(
            parseEther(String(formData.coll)).toString(),
          ),
        },
        provider,
      );

      sendOperation(
        [
          currentTrove?.troveManager,
          account.address,
          parseEther(String(formData.coll)),
          ...hints,
        ],
        'addColl',
      );
    } catch (error) {
      message.error('Opps, Something error, please try again...');
    }
  };

  const withdrawOperation = async () => {
    const { parseEther } = ethers.utils;

    setIsOperationLoading(true);

    try {
      const hints = await findHints(
        account.address as string,
        {
          trove_manager: currentTrove?.troveManager || '',
          sorted_troves: currentTrove?.sortedTroves || '',
          minimumNetDebt: globalData.minNetDebt || 1800,
        },
        {
          withdrawColl: new BigNumber(
            parseEther(String(formData.coll)).toString(),
          ),
        },
        provider,
      );

      await sendOperation(
        [
          currentTrove?.troveManager,
          account.address,
          parseEther(String(formData.coll)),
          ...hints,
        ],
        'withdrawColl',
      );
    } catch (error) {
      message.error('Opps, Something error, please try again...');
    }
  };

  const borrowOperation = async () => {
    const { parseEther } = ethers.utils;

    setIsOperationLoading(true);

    try {
      const hints = await findHints(
        account.address as string,
        {
          trove_manager: currentTrove?.troveManager || '',
          sorted_troves: currentTrove?.sortedTroves || '',
          minimumNetDebt: globalData.minNetDebt || 1800,
        },
        {
          borrowDebt: new BigNumber(
            parseEther(String(formData.debt)).toString(),
          ),
        },
        provider,
      );

      sendOperation(
        [
          currentTrove?.troveManager,
          account.address,
          ethers.utils.parseEther('1'),
          parseEther(String(formData.debt)),
          ...hints,
        ],
        'withdrawDebt',
      );
    } catch (error) {
      message.error('Opps, Something error, please try again...');
    }
  };

  const repayOperation = async () => {
    const { parseEther } = ethers.utils;

    setIsOperationLoading(true);

    try {
      const hints = await findHints(
        account.address as string,
        {
          trove_manager: currentTrove?.troveManager || '',
          sorted_troves: currentTrove?.sortedTroves || '',
          minimumNetDebt: globalData.minNetDebt || 1800,
        },
        {
          repayDebt: new BigNumber(
            parseEther(String(formData.debt)).toString(),
          ),
        },
        provider,
      );

      sendOperation(
        [
          currentTrove?.troveManager,
          account.address,
          parseEther(String(formData.debt)),
          ...hints,
        ],
        'repayDebt',
      );
    } catch (error) {
      message.error('Opps, Something error, please try again...');
    }
  };

  const closeOperation = async () => {
    sendOperation([currentTrove?.troveManager, account.address], 'closeTrove');
  };

  const handleOperation = (op: TROVE_OPERATION) => {
    switch (op) {
      case TROVE_OPERATION.Approve:
        approveOperation();
        break;
      case TROVE_OPERATION.OpenTrove:
        openTroveOperation();
        break;
      case TROVE_OPERATION.Deposit:
        depositOperation();
        break;
      case TROVE_OPERATION.Withdraw:
        withdrawOperation();
        break;
      case TROVE_OPERATION.Borrow:
        borrowOperation();
        break;
      case TROVE_OPERATION.Repay:
        repayOperation();
        break;
      case TROVE_OPERATION.CloseTrove:
        closeOperation();
        break;
      default:
        break;
    }
  };

  const handleMax = (max: number, key = 'coll') => {
    setFormData((oldValue) =>
      Object.assign({}, oldValue, {
        [key]: max,
      }),
    );
  };

  const handleSwitchTab = (newTab: TAB) => {
    setActiveTab(newTab);

    switch (newTab) {
      case TAB.Collateral:
        setOperation(TROVE_OPERATION.Deposit);
        break;
      case TAB.USDU:
        setOperation(TROVE_OPERATION.Borrow);
        break;
      case TAB.Close:
        setOperation(TROVE_OPERATION.CloseTrove);
        setFormData({
          coll: accountTrove?.collateral,
          debt:
            (accountTrove?.debt as number) -
            (currentTrove?.debtGasCompensation as number),
        });
        break;
      default:
        break;
    }
  };

  const handleSwitchSeconaryTab = (newTab: TROVE_OPERATION) => {
    setOperation(newTab);
    setFormData({
      coll: 0,
      debt: 0,
    });
  };

  const onInputChange = (newValue: number, key: string) => {
    setFormData((oldValue) =>
      Object.assign({}, oldValue, {
        [key]: newValue,
      }),
    );

    const coll = key === 'coll' ? newValue : formData.coll;
    const debt = key === 'debt' ? newValue : formData.debt;

    let newTotalDebt = totalDebt;

    if (key === 'debt') {
      newTotalDebt =
        Number(debt) +
          (currentTrove?.debtGasCompensation as number) +
          (debt || 0) * (currentTrove?.mintFee as number) || 0;
      setTotalDebt(newTotalDebt);
    }

    setCurrentCR(
      Math.round(
        (((coll as number) * (currentTrove?.collPrice as number)) /
          newTotalDebt) *
          100,
      ) || 0,
    );
  };

  const onCurrentCRChange = (e: Event, newCR: number | number[]) => {
    if (typeof newCR !== 'number') return;

    setCurrentCR(newCR);

    const { coll } = formData;

    if (!((coll as number) > 0)) return;

    const collValue = (coll as number) * (currentTrove?.collPrice as number);
    const newTotalDebt = collValue / (newCR / 100);
    const newDebt = parseInt(
      String(
        (newTotalDebt - (currentTrove?.debtGasCompensation as number)) /
          (1 + (currentTrove?.mintFee as number)),
      ),
    );

    setFormData({
      coll,
      debt: newDebt,
    });
  };

  function updateData() {
    setFormData({
      coll: 0,
      debt: 0,
    });

    globalData.getSystemData();
  }

  async function sendOperation(params: any[], method: string) {
    const contract = new ethers.Contract(
      contractsDeployedAddress.BorrowerOperations,
      contractAbis.borrowerOperations,
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

  async function getInitData() {
    if (!account.address) return;
    if (!currentTrove) return;
    if (connectedChainId !== chainId) return message.error('Error Network');

    const calls: Multicall[] = [
      {
        address: currentTrove.collateral,
        abi: contractAbis.erc20,
        method: 'allowance',
        params: [account.address, contractsDeployedAddress.BorrowerOperations],
      },
    ];

    const request = async () => {
      try {
        const [allowance] = await multicall({
          chainId,
          provider,
          calls,
          isStrict: false,
        });

        setAllowance(allowance);
      } catch (error: any) {
        console.error('❌get init data error', error.toString());
        setTimeout(request, 1000);
      }
    };

    request();
  }

  function calCanOperationAmount(findAccountTM?: IAccountTrove) {
    //cal max can withdraw coll
    const useTrove = findAccountTM || accountTrove;
    const {
      collateral,
      debt,
      trove: { collPrice, debtGasCompensation },
    } = useTrove as IAccountTrove;
    const debtTokenBalance = globalData.accountData?.balances?.debtToken;
    const recoveryModeTCRParse = recoveryModeTCR / 100;
    const remainingMintable = (currentTrove?.maxSystemDebt as number) - debt;

    const newData: IMaxCanOperationAmount = {
      withdraw: 0,
      borrow: 0,
      repay: 0,
    };

    newData.withdraw =
      parseInt(
        String((collateral - (debt * recoveryModeTCRParse) / collPrice) * 100),
      ) / 100;

    const withdrawValue = (newData.withdraw * collPrice) / recoveryModeTCRParse;
    newData.borrow = parseInt(
      String(
        withdrawValue > remainingMintable ? remainingMintable : withdrawValue,
      ),
    );

    if (debtTokenBalance) {
      const maxDebtCanRepay =
        debt - globalData.minNetDebt - debtGasCompensation;
      newData.repay =
        debtTokenBalance > maxDebtCanRepay ? maxDebtCanRepay : debtTokenBalance;
    }

    newData.withdraw = newData.withdraw < 0 ? 0 : newData.withdraw;
    newData.borrow = newData.borrow < 0 ? 0 : newData.borrow;
    newData.repay = newData.repay < 0 ? 0 : newData.repay;

    setMaxCanOperationAmount(newData);
  }

  useEffect(() => {
    getInitData();

    const timer = setInterval(getInitData, 10 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [connectedChainId, account.address, currentTrove]);

  useEffect(() => {
    const tm = routeParams.trove_manager;

    if (!tm) return message.error('Invalid trove');

    const findTM = globalData.trovesData.troves[tm as string];

    if (!findTM) return;

    setCurrentTrove(findTM);

    const findAccountTM = globalData.accountData?.trovesData.find(
      (item) => item.trove.troveManager === (tm as string),
    );

    if (findAccountTM) {
      //'nonExistent' | 'active' | 'closedByOwner' | 'closedByLiquidation' | 'closedByRedemption' 0 - 4
      if (findAccountTM.status !== 1) {
        setExistTrove(false);
      } else {
        setExistTrove(true);
        calCanOperationAmount(findAccountTM);
      }
    } else {
      setExistTrove(false);
    }

    setAccountTrove(findAccountTM);
  }, [routeParams, globalData]);

  useEffect(() => {
    setActiveTab(TAB.Collateral);

    if (!existTrove) {
      setOperation(TROVE_OPERATION.OpenTrove);
    } else {
      setOperation(TROVE_OPERATION.Deposit);

      calCanOperationAmount();
    }
  }, [existTrove]);

  useEffect(() => {
    setIsShowErrorMsg(false);

    //openTrove
    if (!existTrove) {
      if (currentCR < recoveryModeTCR) {
        setErrorMsg(errorMsgCode['InvalidCR']);
        setIsShowErrorMsg(true);
      } else if (
        (formData.debt as number) > 0 &&
        (formData.debt as number) < globalData.minNetDebt
      ) {
        setErrorMsg(errorMsgCode['InvalidDebt']);
        setIsShowErrorMsg(true);
      }
    } else {
      const { coll, debt } = formData;

      switch (operation) {
        case TROVE_OPERATION.Deposit:
          if (
            (coll as number) >
            (globalData.accountData?.balances[
              accountTrove?.trove.collateral as string
            ] as number)
          ) {
            setErrorMsg(errorMsgCode['InsufficientColl']);
            setIsShowErrorMsg(true);
          }
          break;
        case TROVE_OPERATION.Withdraw:
          if ((coll as number) > maxCanOperationAmount.withdraw) {
            setErrorMsg(errorMsgCode['ExceedWithdraw']);
            setIsShowErrorMsg(true);
          }
          break;
        case TROVE_OPERATION.Borrow:
          if ((debt as number) > maxCanOperationAmount.borrow) {
            setErrorMsg(errorMsgCode['ExceedBorrow']);
            setIsShowErrorMsg(true);
          }
          break;
        case TROVE_OPERATION.Repay:
          if ((debt as number) > maxCanOperationAmount.repay) {
            setErrorMsg(errorMsgCode['ExceedRepay']);
            setIsShowErrorMsg(true);
          }
          break;
        case TROVE_OPERATION.CloseTrove:
          if (
            (debt as number) >
            (globalData.accountData?.balances.debtToken as number)
          ) {
            setErrorMsg(errorMsgCode['InsufficientDebt']);
            setIsShowErrorMsg(true);
          }
          break;
        default:
          break;
      }
    }
  }, [
    currentCR,
    formData,
    operation,
    maxCanOperationAmount,
    accountTrove,
    globalData,
  ]);

  return (
    <Box>
      <Box className="mt-1">
        <Link to="/trove">
          <Button
            startIcon={<ArrowRightAltIcon className="rotate-180" />}
            variant="text"
            className="font-bold"
          >
            Go back to Collateral Selection
          </Button>
        </Link>
      </Box>

      <Box className="mt-3 grid grid-cols-2  sm:grid-cols-1 xs:grid-cols-1 gap-2">
        <Box className="flex justify-center">
          <Box className="grow max-w-30 overflow-hidden">
            {!existTrove ? (
              <></>
            ) : (
              <>
                <Box className="flex h-3.125 border border-solid border-tabColor">
                  <Box
                    className={`flex-1 flex justify-center items-center duration-200 cursor-pointer trove-manager-tab-active-hover ${
                      activeTab === TAB.Collateral
                        ? 'trove-manager-tab-active'
                        : ''
                    }`}
                    onClick={() => handleSwitchTab(TAB.Collateral)}
                  >
                    Collateral
                  </Box>
                  <Box
                    className={`flex-1 flex justify-center items-center duration-200 cursor-pointer trove-manager-tab-active-hover ${
                      activeTab === TAB.USDU ? 'trove-manager-tab-active' : ''
                    }`}
                    onClick={() => handleSwitchTab(TAB.USDU)}
                  >
                    USDU
                  </Box>
                  <Box
                    className={`flex-1 flex justify-center items-center duration-200 cursor-pointer trove-manager-tab-active-hover ${
                      activeTab === TAB.Close ? 'trove-manager-tab-active' : ''
                    }`}
                    onClick={() => handleSwitchTab(TAB.Close)}
                  >
                    Close
                  </Box>
                </Box>

                {activeTab === TAB.Collateral ? (
                  <Box className="mt-0.5 flex justify-center h-2 ">
                    <Box
                      className={`flex justify-center items-center duration-200 w-6 h-full border border-solid border-tabColor cursor-pointer trove-manager-tab-active-hover ${
                        operation === TROVE_OPERATION.Deposit
                          ? 'trove-manager-tab-active'
                          : ''
                      }`}
                      onClick={() =>
                        handleSwitchSeconaryTab(TROVE_OPERATION.Deposit)
                      }
                    >
                      Deposit
                    </Box>
                    <Box
                      className={`flex justify-center items-center duration-200 w-6 h-full border border-solid border-tabColor cursor-pointer trove-manager-tab-active-hover ${
                        operation === TROVE_OPERATION.Withdraw
                          ? 'trove-manager-tab-active'
                          : ''
                      }`}
                      onClick={() =>
                        handleSwitchSeconaryTab(TROVE_OPERATION.Withdraw)
                      }
                    >
                      Withdraw
                    </Box>
                  </Box>
                ) : (
                  <></>
                )}

                {activeTab === TAB.USDU ? (
                  <Box className="mt-0.5 flex justify-center h-2 ">
                    <Box
                      className={`flex justify-center items-center duration-200 w-6 h-full border border-solid border-tabColor cursor-pointer trove-manager-tab-active-hover ${
                        operation === TROVE_OPERATION.Borrow
                          ? 'trove-manager-tab-active'
                          : ''
                      }`}
                      onClick={() =>
                        handleSwitchSeconaryTab(TROVE_OPERATION.Borrow)
                      }
                    >
                      Borrow
                    </Box>
                    <Box
                      className={`flex justify-center items-center duration-200 w-6 h-full border border-solid border-tabColor cursor-pointer trove-manager-tab-active-hover ${
                        operation === TROVE_OPERATION.Repay
                          ? 'trove-manager-tab-active'
                          : ''
                      }`}
                      onClick={() =>
                        handleSwitchSeconaryTab(TROVE_OPERATION.Repay)
                      }
                    >
                      Repay
                    </Box>
                  </Box>
                ) : (
                  <></>
                )}
              </>
            )}

            {operation === TROVE_OPERATION.OpenTrove ? (
              <>
                <Box>
                  <Typography className="mb-0.5 font-bold">
                    Collateral
                  </Typography>
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
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={eth_img}
                            />
                            <Typography className=" font-semibold">
                              {currentTrove?.collName}
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.coll}
                    onChange={(e: any) => onInputChange(e.target.value, 'coll')}
                  ></TextField>
                  {/* balance info and max button */}
                  {globalData.accountData ? (
                    <Box className="mt-1 flex items-center justify-end">
                      <Typography className="mr-1 text-0.875 font-bold">
                        Balance:{' '}
                        {
                          globalData.accountData?.balances[
                            currentTrove?.collateral as string
                          ]
                        }
                      </Typography>
                      <Button
                        variant="contained"
                        className=" font-semibold"
                        size="small"
                        onClick={() =>
                          handleMax(
                            globalData.accountData?.balances[
                              currentTrove?.collateral as string
                            ] as number,
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

                <Box className="mt-1.25">
                  <Typography className="mb-0.5 font-bold">Borrow</Typography>
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
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={usdu_img}
                            />
                            <Typography className=" font-semibold">
                              USDU
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.debt}
                    onChange={(e: any) => onInputChange(e.target.value, 'debt')}
                  ></TextField>
                </Box>

                <Box className="mt-1.25">
                  <Box className="flex justify-between">
                    <Typography component="span">Collateral Ratio</Typography>
                    <Typography component="span">{currentCR}%</Typography>
                  </Box>
                  <Box className="relative mt-0.625">
                    <Slider
                      aria-label="Temperature"
                      defaultValue={recoveryModeTCR}
                      value={currentCR}
                      valueLabelDisplay="auto"
                      step={10}
                      min={110}
                      max={500}
                      onChange={onCurrentCRChange}
                    />
                  </Box>
                  {isShowErrorMsg ? (
                    <Box className="mt-0.75 px-1.25 py-1 text-red-600 text-0.75 border border-solid border-red-600">
                      {errorMsg}
                    </Box>
                  ) : (
                    <></>
                  )}
                </Box>

                <Box className="mt-0.75">
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      Liquidation Reserve
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {currentTrove?.debtGasCompensation}{' '}
                      </Typography>
                      <Typography component="span">USDU</Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">New Debt</Typography>
                    <Typography component="span">
                      <Typography component="span">{formData.debt} </Typography>
                      <Typography component="span">USDU</Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Borrowing Fee</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {currentTrove?.mintFee}%
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="my-0.5 border border-solid border-tabColor"></Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Your Total debt</Typography>
                    <Typography component="span">
                      <Typography component="span">{totalDebt} </Typography>
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
                        onClick={() =>
                          handleOperation(
                            isNeedApprove ? TROVE_OPERATION.Approve : operation,
                          )
                        }
                      >
                        <Typography className="font-bold">
                          {upperFirst(
                            isNeedApprove ? TROVE_OPERATION.Approve : operation,
                          )}
                        </Typography>
                      </LoadingButton>
                    </WalletConnector>
                  </Box>
                </Box>
              </>
            ) : activeTab === TAB.Collateral ? (
              <>
                <Box className="mt-1.25">
                  <Typography className="mb-0.5 font-bold">
                    Collateral
                  </Typography>
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
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={eth_img}
                            />
                            <Typography className=" font-semibold">
                              {currentTrove?.collName}
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.coll}
                    onChange={(e: any) => onInputChange(e.target.value, 'coll')}
                  ></TextField>
                  {globalData.accountData ? (
                    <Box className="mt-1 flex items-center justify-end">
                      <Typography className="mr-1 text-0.875 font-bold">
                        {operation === TROVE_OPERATION.Deposit
                          ? 'Balance'
                          : 'Can Withdraw'}
                        :{' '}
                        {operation === TROVE_OPERATION.Deposit
                          ? globalData.accountData?.balances[
                              currentTrove?.collateral as string
                            ]
                          : maxCanOperationAmount.withdraw}
                      </Typography>
                      <Button
                        variant="contained"
                        className=" font-semibold"
                        size="small"
                        onClick={() =>
                          handleMax(
                            operation === TROVE_OPERATION.Deposit
                              ? (globalData.accountData?.balances[
                                  currentTrove?.collateral as string
                                ] as number)
                              : maxCanOperationAmount.withdraw,
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
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      {currentTrove?.collName} Collateral
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.collateral}{' '}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">USDU Debt</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.debt}{' '}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Colla.Ratio</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.cr}%
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Liquidation Price</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.liquidationPrice}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Mint Fee</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {currentTrove?.mintFee}%
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      Liquidation Reserve
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {currentTrove?.debtGasCompensation} USDU
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      Remaining Mintable USDU
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {(currentTrove?.maxSystemDebt as number) -
                          (accountTrove?.debt as number)}{' '}
                        USDU
                      </Typography>
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
                        onClick={() => handleOperation(operation)}
                      >
                        <Typography className="font-bold">
                          {upperFirst(operation)}
                        </Typography>
                      </LoadingButton>
                    </WalletConnector>
                  </Box>
                </Box>
              </>
            ) : activeTab === TAB.USDU ? (
              <>
                <Box className="mt-1.25">
                  <Typography className="mb-0.5 font-bold">
                    {operation === TROVE_OPERATION.Borrow ? 'Borrow' : 'Repay'}
                  </Typography>
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
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={usdu_img}
                            />
                            <Typography className=" font-semibold">
                              USDU
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.debt}
                    onChange={(e: any) => onInputChange(e.target.value, 'debt')}
                  ></TextField>
                </Box>
                {globalData.accountData ? (
                  <Box className="mt-1 flex items-center justify-end">
                    <Typography className="mr-1 text-0.875 font-bold">
                      {operation === TROVE_OPERATION.Borrow
                        ? 'Can Borrow'
                        : 'Can Repay'}
                      :{' '}
                      {operation === TROVE_OPERATION.Borrow
                        ? maxCanOperationAmount.borrow
                        : maxCanOperationAmount.repay}
                    </Typography>
                    <Button
                      variant="contained"
                      className=" font-semibold"
                      size="small"
                      onClick={() =>
                        handleMax(
                          operation === TROVE_OPERATION.Borrow
                            ? maxCanOperationAmount.borrow
                            : maxCanOperationAmount.repay,
                          'debt',
                        )
                      }
                    >
                      Max
                    </Button>
                  </Box>
                ) : (
                  <></>
                )}

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
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      {currentTrove?.collName} Collateral
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.collateral}{' '}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">USDU Debt</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.debt}{' '}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Colla.Ratio</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.cr}%
                      </Typography>
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Liquidation Price</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {accountTrove?.liquidationPrice}
                      </Typography>
                    </Typography>
                  </Box>
                  {operation === TROVE_OPERATION.Borrow ? (
                    <Box className="flex justify-between items-center h-2.375">
                      <Typography component="span">Mint Fee</Typography>
                      <Typography component="span">
                        <Typography component="span">
                          {currentTrove?.mintFee}%
                        </Typography>
                      </Typography>
                    </Box>
                  ) : (
                    <></>
                  )}
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">
                      Liquidation Reserve
                    </Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {currentTrove?.debtGasCompensation} USDU
                      </Typography>
                    </Typography>
                  </Box>

                  {operation === TROVE_OPERATION.Borrow ? (
                    <Box className="flex justify-between items-center h-2.375">
                      <Typography component="span">
                        Remaining Mintable USDU
                      </Typography>
                      <Typography component="span">
                        <Typography component="span">
                          {(currentTrove?.maxSystemDebt as number) -
                            (accountTrove?.debt as number)}{' '}
                          USDU
                        </Typography>
                      </Typography>
                    </Box>
                  ) : (
                    <></>
                  )}

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
                        onClick={() => handleOperation(operation)}
                      >
                        <Typography className="font-bold">
                          {upperFirst(operation)}
                        </Typography>
                      </LoadingButton>
                    </WalletConnector>
                  </Box>
                </Box>
              </>
            ) : activeTab === TAB.Close ? (
              <>
                <Box className="mt-1.25">
                  <Typography className="mb-0.5 font-bold">
                    Total Collateral
                  </Typography>
                  <TextField
                    type="number"
                    variant="outlined"
                    className="w-full"
                    placeholder="Enter an amount"
                    disabled
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={eth_img}
                            />
                            <Typography className=" font-semibold">
                              {currentTrove?.collName}
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.coll}
                  ></TextField>
                </Box>

                <Box className="mt-1.25">
                  <Typography className="mb-0.5 font-bold">
                    Total Debt
                  </Typography>
                  <TextField
                    type="number"
                    variant="outlined"
                    className="w-full"
                    placeholder="Enter an amount"
                    disabled
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <img
                              className="mr-0.25 w-1.25 h-1.25"
                              src={usdu_img}
                            />
                            <Typography className=" font-semibold">
                              USDU
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.debt}
                  ></TextField>
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
                  <Box className="flex justify-between items-center h-2.375">
                    <Typography component="span">Wallet Balance</Typography>
                    <Typography component="span">
                      <Typography component="span">
                        {globalData.accountData?.balances.debtToken}{' '}
                      </Typography>
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
                        onClick={() => handleOperation(operation)}
                      >
                        <Typography className="font-bold">
                          {upperFirst(operation)}
                        </Typography>
                      </LoadingButton>
                    </WalletConnector>
                  </Box>
                </Box>
              </>
            ) : (
              <></>
            )}
          </Box>
        </Box>

        <Box className="flex  justify-center">
          <Box className="grow max-w-30 overflow-hidden">
            <Box className="mb-0.75">System Statisics</Box>
            <Box className="pl-1.875 pr-1.25 py-1 border border-solid border-primary bg-secondary">
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">Minium Collat Ratio</Typography>
                <Typography component="span">
                  <Typography component="span">{currentTrove?.mcr} </Typography>
                  <Typography component="span">%</Typography>
                </Typography>
              </Box>
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">Total USDU Mintable</Typography>
                <Typography component="span">
                  <Typography component="span">
                    {Decimal.from(
                      currentTrove?.maxSystemDebt as number,
                    ).shorten()}
                  </Typography>
                </Typography>
              </Box>
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">USDU Minted</Typography>
                <Typography component="span">
                  <Typography component="span">
                    {Decimal.from(currentTrove?.systemDebt as number).shorten()}
                  </Typography>
                </Typography>
              </Box>
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">Pool TVL</Typography>
                <Typography component="span">
                  <Typography component="span">
                    $
                    {Decimal.from(
                      (currentTrove?.collPrice as number) *
                        (currentTrove?.systemColl as number),
                    ).shorten()}
                  </Typography>
                </Typography>
              </Box>
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">Recovery Mode</Typography>
                <Typography component="span">
                  <Typography component="span">No</Typography>
                </Typography>
              </Box>
              <Box className="flex justify-between items-center h-3.125">
                <Typography component="span">ETH Price</Typography>
                <Typography component="span">
                  <Typography component="span">
                    {globalData.coinPrice}{' '}
                  </Typography>
                  <Typography component="span">USD</Typography>
                </Typography>
              </Box>
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Trove;
