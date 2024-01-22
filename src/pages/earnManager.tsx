import {
  GT,
  LP_TOKEN_LIST,
  _LiquityContract,
  _TypedLiquityContract,
  chainId,
  contractAbis,
  contractsDeployedAddress,
  explore,
} from '@/constants';

import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { upperFirst } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import CoinImageUrl from '@/assets/images/coin_usd.png';
import { message } from '@/components/Message';
import WalletConnector from '@/components/WalletConnector';
import {
  EthersSigner,
  IERC20,
  LPDepositToken,
  StabilityPool,
} from '@/constants/contracts/types';
import useSupportNetwork from '@/hooks/useSupportNetwork';
import { useGlobalData } from '@/provider/GlobalDataProvider';
import { Multicall } from '@/types';
import { Decimal } from '@/utils/decimal';
import { multicall } from '@/utils/ethers';
import { decimalify } from '@/utils/format';
import { FallbackProvider } from '@ethersproject/providers';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigate, useParams } from '@umijs/max';
import { useAccount, useProvider, useSigner } from 'wagmi';

enum EARN_OPERATION {
  deposit = 'deposit',
  withdraw = 'withdraw',
  approve = 'approve',
  claimRewards = 'claimRewards',
  exit = 'exit',
}

const EarnManager = () => {
  const routeParams = useParams();
  const navigate = useNavigate();
  const account = useAccount();
  const provider = useProvider<FallbackProvider>();
  const signer = useSigner();
  const isSupportNetwork = useSupportNetwork();
  const globalData = useGlobalData();

  // console.log('[EarnManager] -> [globalData]:', globalData);

  const {
    accountData,
    earnsData: { sp, lps },
  } = globalData;

  const [operation, setoperation] = useState<string>(EARN_OPERATION.deposit); //deposit|withdraw

  const [balanceAmount, setbalanceAmount] = useState<Decimal>(Decimal.from(0));

  const [depositedAmount, setdepositAmount] = useState<Decimal>(Decimal.ZERO);

  const [depositAllowance, setdepositAllowance] = useState<Decimal>(
    Decimal.from(2000),
  );

  const [inputAmount, setinputAmount] = useState<string>('');

  const [
    isApproveOrDepositOrWithdrawLoading,
    setisApproveOrDepositOrWithdrawLoading,
  ] = useState<boolean>(false);
  const [isClaimRewardLoading, setisClaimRewardLoading] =
    useState<boolean>(false);

  const [isShowClaimRewardsDialog, setisShowClaimRewardsDialog] =
    useState<boolean>(false);

  const isNeedApprove = useMemo(() => {
    if (operation !== EARN_OPERATION.deposit) return false;

    if (depositAllowance.isZero) return true;

    if (!inputAmount) return false;

    if (Decimal.from(inputAmount).gt(depositAllowance)) return true;

    return false;
  }, [operation, inputAmount, depositAllowance]);

  const balanceShow = useMemo(() => {
    return operation === EARN_OPERATION.deposit
      ? balanceAmount.toString()
      : depositedAmount.toString();
  }, [operation, balanceAmount, depositedAmount]);

  //classify deposit contract type: sp | lp
  const classifyDepositContract = useMemo(() => {
    const depositContract = routeParams?.contract || '';
    const spDepositContract = contractsDeployedAddress.StabilityPool;

    if (!depositContract || !ethers.utils.isAddress(depositContract))
      return false;

    if (
      spDepositContract.toLocaleLowerCase() ===
      depositContract.toLocaleLowerCase()
    ) {
      return {
        type: 'sp',
        ...sp,
        ...accountData?.earnsData?.sp,
      };
    }

    const findLpDepositContractByConstants = LP_TOKEN_LIST.find(
      (item) =>
        item.deposit_contract.toLocaleLowerCase() ===
        depositContract.toLocaleLowerCase(),
    );

    if (!findLpDepositContractByConstants) return false;

    //find in global data lps
    const findLpDepositContract = lps.find(
      (item) =>
        item.depositContract.toLocaleLowerCase() ===
        depositContract.toLocaleLowerCase(),
    );

    //find in user data lps
    const findLpDepositContractByUserData = accountData?.earnsData?.lps?.find(
      (item) =>
        item.depositContract.toLocaleLowerCase() ===
        depositContract.toLocaleLowerCase(),
    );

    return {
      type: 'lp',
      ...{
        apr: 0,
        tvl: 0,

        depositContract: findLpDepositContractByConstants.deposit_contract,
        lpToken: findLpDepositContractByConstants.lp_token,

        pool: findLpDepositContractByConstants.name,
        source: findLpDepositContractByConstants.source,
        earned: 0,
        yourDeposits: 0,
      },
      ...findLpDepositContract,
      ...findLpDepositContractByUserData,
    };
  }, [sp, lps, accountData, routeParams]);

  const errorTip = useMemo(() => {
    if (!inputAmount || isNeedApprove) return { isShow: false, msg: '' };

    if (operation === EARN_OPERATION.deposit) {
      if (Decimal.from(inputAmount).gt(balanceAmount))
        return { isShow: true, msg: 'Insufficient Balance' };
    } else if (operation === EARN_OPERATION.withdraw) {
      if (Decimal.from(inputAmount).gt(depositedAmount))
        return { isShow: true, msg: 'Insufficient Balance' };
    }

    return { isShow: false, msg: '' };
  }, [operation, inputAmount, balanceAmount, depositedAmount, isNeedApprove]);

  const disabledOperation = useMemo(() => {
    if (isNeedApprove) return false;

    return errorTip.isShow || !inputAmount || Decimal.from(inputAmount).isZero;
  }, [errorTip, inputAmount, isNeedApprove]);

  //get page level data
  const getInitData = async () => {
    if (!account.address) return;

    if (!isSupportNetwork) return;

    const depositContractAbi =
      (classifyDepositContract as any)?.type === 'sp'
        ? contractAbis.stabilityPool
        : contractAbis.lpTokenStaking;

    const depositContractAddress = (classifyDepositContract as any)
      ?.depositContract;

    const tokenAbi = contractAbis.erc20;

    const tokenAddress = (classifyDepositContract as any).lpToken;

    if (!tokenAddress || !depositContractAddress) return;

    const calls: Multicall[] = [
      //lp token balance
      {
        address: tokenAddress,
        abi: tokenAbi,
        method: 'balanceOf',
        params: [account.address],
      },
      //lp token allowance : user -> deposit pool
      {
        address: tokenAddress,
        abi: tokenAbi,
        method: 'allowance',
        params: [account.address, depositContractAddress],
      },
    ];

    // console.log('calls', calls);

    const request = async () => {
      try {
        const [balance, allowance] = await multicall({
          chainId,
          provider,
          calls,
          isStrict: false,
        });

        setbalanceAmount(decimalify(balance));
        setdepositAllowance(decimalify(allowance));

        // console.log('balance', balance);
        // console.log('allowance', allowance);
      } catch (error: any) {
        console.error('❌get init data error', error.toString());
        setTimeout(request, 1000);
      }
    };

    request();
  };

  const handleChangeOperation = (newOperation: string) => {
    setoperation(newOperation);

    setinputAmount('');
  };

  const handleMaxAmount = () => {
    const maxAmount =
      operation === EARN_OPERATION.deposit
        ? balanceAmount.toString()
        : depositedAmount.toString();

    // console.log(
    //   '[EarnManager] -> [handleMaxAmount] -> [maxAmount]:',
    //   maxAmount,
    // );

    setinputAmount(maxAmount);
  };

  const handleDepositOrWithdraw = () => {
    if (isNeedApprove) {
      // console.log(
      //   '[EarnManager] -> [handleDepositOrWithdraw] -> [operation]',
      //   EARN_OPERATION.approve,
      // );
      approveAction();
    } else {
      // console.log(
      //   '[EarnManager] -> [handleDepositOrWithdraw] -> [operation]',
      //   operation,
      // );

      if (operation === EARN_OPERATION.deposit) {
        depositAction();
      } else if (operation === EARN_OPERATION.withdraw) {
        withdrawAction();
      }
    }
  };

  const handleClaimRewards = () => {
    claimRewardAction();
  };

  const approveAction = async () => {
    if (isApproveOrDepositOrWithdrawLoading) return;
    setisApproveOrDepositOrWithdrawLoading(true);

    const { lpToken, depositContract, type } = classifyDepositContract as any;

    const contract = new _LiquityContract(
      lpToken,
      contractAbis.erc20,
      signer.data as EthersSigner,
    ) as _TypedLiquityContract as IERC20;

    try {
      const gasLimit = await contract.estimateGas.approve(
        depositContract,
        Decimal.INFINITY.hex,
      );

      const tx = await contract.approve(depositContract, Decimal.INFINITY.hex, {
        gasLimit,
      });
      console.log(`${explore}/tx/${tx.hash}`);

      await tx.wait();

      await getInitData();

      message.success('Approve successful');
    } catch (error: any) {
      console.error('❌approve error', error);
      message.error(error?.message || error.toString());
    } finally {
      setisApproveOrDepositOrWithdrawLoading(false);
    }
  };
  const depositAction = async () => {
    if (isApproveOrDepositOrWithdrawLoading) return;
    setisApproveOrDepositOrWithdrawLoading(true);
    const { depositContract, type } = classifyDepositContract as any;
    const { parseUnits } = ethers.utils;

    try {
      if (type === 'sp') {
        let contract = new _LiquityContract(
          depositContract,
          contractAbis.stabilityPool,
          signer.data as EthersSigner,
        ) as _TypedLiquityContract as StabilityPool;
        const gasLimit = await contract.estimateGas.provideToSP(
          parseUnits(inputAmount, 18),
        );

        const tx = await contract.provideToSP(parseUnits(inputAmount, 18), {
          gasLimit,
        });

        console.log(`${explore}/tx/${tx.hash}`);

        await tx.wait();

        await getInitData();
        globalData.getSystemData();

        message.success('Deposit successful');
      } else if (type === 'lp') {
        let contract = new _LiquityContract(
          depositContract,
          contractAbis.lpTokenStaking,
          signer.data as EthersSigner,
        ) as _TypedLiquityContract as LPDepositToken;
        const gasLimit = await contract.estimateGas.deposit(
          account.address as string,
          parseUnits(inputAmount, 18),
        );

        const tx = await contract.deposit(
          account.address as string,
          parseUnits(inputAmount, 18),
          {
            gasLimit,
          },
        );

        console.log(`${explore}/tx/${tx.hash}`);

        await tx.wait();

        await getInitData();
        globalData.getSystemData();

        message.success('Operation successful');
      }

      setinputAmount('');
    } catch (error: any) {
      console.error('deposit error', error);
      message.error(error?.message || error.toString());
    } finally {
      setisApproveOrDepositOrWithdrawLoading(false);
    }
  };
  const withdrawAction = async () => {
    if (isApproveOrDepositOrWithdrawLoading) return;
    setisApproveOrDepositOrWithdrawLoading(true);
    const { depositContract, type } = classifyDepositContract as any;
    const { parseUnits } = ethers.utils;

    try {
      if (type === 'sp') {
        let contract = new _LiquityContract(
          depositContract,
          contractAbis.stabilityPool,
          signer.data as EthersSigner,
        ) as _TypedLiquityContract as StabilityPool;
        const gasLimit = await contract.estimateGas.withdrawFromSP(
          parseUnits(inputAmount, 18),
        );

        const tx = await contract.withdrawFromSP(parseUnits(inputAmount, 18), {
          gasLimit,
        });

        console.log(`${explore}/tx/${tx.hash}`);

        await tx.wait();

        await getInitData();
        globalData.getSystemData();

        message.success('Operation successful');
      } else if (type === 'lp') {
        let contract = new _LiquityContract(
          depositContract,
          contractAbis.lpTokenStaking,
          signer.data as EthersSigner,
        ) as _TypedLiquityContract as LPDepositToken;
        const gasLimit = await contract.estimateGas.withdraw(
          account.address as string,
          parseUnits(inputAmount, 18),
        );

        const tx = await contract.withdraw(
          account.address as string,
          parseUnits(inputAmount, 18),
          {
            gasLimit,
          },
        );

        console.log(`${explore}/tx/${tx.hash}`);

        await tx.wait();

        await getInitData();
        globalData.getSystemData();

        message.success('Withdraw successful');
      }
      setinputAmount('');
    } catch (error: any) {
      console.error('withdraw error', error);
      message.error(error?.message || error.toString());
    } finally {
      setisApproveOrDepositOrWithdrawLoading(false);
    }
  };
  const claimRewardAction = async () => {
    if (isClaimRewardLoading) return;

    setisClaimRewardLoading(true);

    try {
      const { depositContract, type } = classifyDepositContract as any;

      try {
        if (type === 'sp') {
          let contract = new _LiquityContract(
            depositContract,
            contractAbis.stabilityPool,
            signer.data as EthersSigner,
          ) as _TypedLiquityContract as StabilityPool;
          const gasLimit = await contract.estimateGas.claimReward(
            account.address as string,
          );

          const tx = await contract.claimReward(account.address as string, {
            gasLimit,
          });

          console.log(`${explore}/tx/${tx.hash}`);

          await tx.wait();

          // await getInitData();
          globalData.getSystemData();

          message.success('Operation successful');
        } else if (type === 'lp') {
          let contract = new _LiquityContract(
            depositContract,
            contractAbis.lpTokenStaking,
            signer.data as EthersSigner,
          ) as _TypedLiquityContract as LPDepositToken;
          const gasLimit = await contract.estimateGas.claimReward(
            account.address as string,
          );

          const tx = await contract.claimReward(account.address as string, {
            gasLimit,
          });

          console.log(`${explore}/tx/${tx.hash}`);

          await tx.wait();

          await getInitData();
          globalData.getSystemData();

          message.success('Claim Rewards successful');
        }
      } catch (error: any) {
        console.error('claim rewards error', error);
        message.error(error?.message || error.toString());
      } finally {
        setisClaimRewardLoading(false);
      }
    } catch (error) {}
  };

  useEffect(() => {
    // console.log(
    //   '[EarnManager] -> [useEffect] -> [classifyDepositContract]',
    //   classifyDepositContract,
    // );

    if (!classifyDepositContract) return navigate('/earn');

    setdepositAmount(Decimal.from(classifyDepositContract.yourDeposits));

    // if (!isSupportNetwork) {
    //   console.log('[EarnManager] Unsupported network');
    //   return;
    // }

    getInitData();

    const timer = setInterval(getInitData, 12 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [classifyDepositContract, account.address, isSupportNetwork, routeParams]);

  return (
    <Box sx={{ color: 'color.white' }}>
      <Box className="mt-1">
        <Link to="/earn">
          <Button
            startIcon={<ArrowRightAltIcon className="rotate-180" />}
            variant="text"
            className="font-bold"
          >
            Go back to Pool Selection
          </Button>
        </Link>
      </Box>

      <Box className="mt-3 grid grid-cols-2  sm:grid-cols-1 xs:grid-cols-1 gap-2">
        {/* left: deposit&withdraw operation */}
        <Box className="flex justify-center">
          <Box className="grow max-w-30">
            {/* switch operation */}
            <Stack
              className="border border-solid border-primary p-[1px]"
              direction="row"
              spacing={0}
              alignItems="center"
            >
              <Box
                className={`grow h-3  cursor-pointer  ${
                  operation === EARN_OPERATION.deposit
                    ? 'bg-primary text-black'
                    : ''
                }`}
                onClick={() => {
                  handleChangeOperation(EARN_OPERATION.deposit);
                }}
              >
                <Typography className=" text-center leading-3 font-bold">
                  Deposit
                </Typography>
              </Box>
              <Box
                className={`grow h-3  cursor-pointer  ${
                  operation === EARN_OPERATION.withdraw
                    ? 'bg-primary text-black'
                    : ''
                }`}
                onClick={() => {
                  handleChangeOperation(EARN_OPERATION.withdraw);
                }}
              >
                <Typography className="text-center leading-3 font-bold">
                  Withdraw
                </Typography>
              </Box>
            </Stack>
            {/* amount input */}
            <Box className="mt-1.5">
              <Typography className="mb-0.5 font-bold">
                {upperFirst(operation)}
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
                          src={CoinImageUrl}
                        />
                        <Typography className=" font-semibold">
                          {classifyDepositContract
                            ? classifyDepositContract.pool
                            : ''}
                        </Typography>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
                value={inputAmount}
                onChange={(event) => {
                  setinputAmount(event.target.value);
                }}
              ></TextField>
              {/* balance info and max button */}
              <Box className="mt-1 flex items-center justify-end">
                <Typography className="mr-1 text-0.875 font-bold">
                  Balance: {balanceShow}
                </Typography>
                <Button
                  variant="contained"
                  className=" font-semibold"
                  size="small"
                  onClick={handleMaxAmount}
                >
                  Max
                </Button>
              </Box>
              {/* input error tips */}
              {errorTip.isShow && (
                <Box className="mt-1.25 border border-solid border-error px-1.25 py-1">
                  <Typography className="text-0.875 font-semibold text-error">
                    {errorTip.msg || ''}
                  </Typography>
                </Box>
              )}
              <WalletConnector
                unConnectChildren={
                  <Button
                    className="mt-2"
                    fullWidth
                    variant="contained"
                    size="large"
                  >
                    <Typography className="font-bold">
                      Connect Wallet
                    </Typography>
                  </Button>
                }
              >
                {/* Operation auction */}
                <LoadingButton
                  className="mt-2"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={disabledOperation}
                  loading={isApproveOrDepositOrWithdrawLoading}
                  onClick={() => {
                    handleDepositOrWithdraw();
                  }}
                >
                  <Typography className="font-bold">
                    {upperFirst(
                      isNeedApprove ? EARN_OPERATION.approve : operation,
                    )}
                  </Typography>
                </LoadingButton>
              </WalletConnector>
            </Box>
          </Box>
        </Box>
        {/* right: statistic dashboard & claim reward operation */}
        <Box className="flex justify-center">
          <Box className="grow max-w-30">
            {/* dashboard title */}
            <Typography className="mb-1 font-bold">
              {classifyDepositContract
                ? `${classifyDepositContract.source} ${classifyDepositContract.pool}`
                : ''}{' '}
              Pool Statistics
            </Typography>
            {/* dashboard statistics */}
            <Box className="rounded-[2px] border border-solid border-primary bg-secondary">
              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                className="py-1 px-1.25 "
              >
                <Typography className="leading-none text-0.875 font-semibold">
                  APR
                </Typography>
                <Typography className="leading-none text-0.875 font-semibold">
                  {Decimal.from(
                    classifyDepositContract ? classifyDepositContract.apr : '0',
                  ).toString(2)}{' '}
                  %
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                className="py-1 px-1.25 "
              >
                <Typography className="leading-none text-0.875 font-semibold">
                  TVL
                </Typography>
                <Typography className="leading-none text-0.875 font-semibold">
                  {Decimal.from(
                    classifyDepositContract ? classifyDepositContract.tvl : '0',
                  ).shorten()}
                </Typography>
              </Stack>
              {/* <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                className="py-1 px-1.25 "
              >
                <Typography className="leading-none text-0.875 font-semibold">
                  Total Deposit
                </Typography>
                <Typography className="leading-none text-0.875 font-semibold">
                  {Decimal.from(123123123).shorten()}
                </Typography>
              </Stack> */}
              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                className="py-1 px-1.25 "
              >
                <Typography className="leading-none text-0.875 font-semibold">
                  Your Deposit
                </Typography>
                <Typography className="leading-none text-0.875 font-semibold">
                  {Decimal.from(
                    classifyDepositContract
                      ? classifyDepositContract.yourDeposits
                      : '0',
                  ).toString(2)}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                className="py-1 px-1.25 "
              >
                <Typography className="leading-none text-0.875 font-semibold">
                  Claimable Reward
                </Typography>
                <Typography className="leading-none text-0.875 font-semibold">
                  {Decimal.from(
                    classifyDepositContract
                      ? classifyDepositContract.earned
                      : '0',
                  ).toString(2)}{' '}
                  {GT}
                </Typography>
              </Stack>
            </Box>
            {/* operation button */}
            {account.address && classifyDepositContract ? (
              <LoadingButton
                className="mt-2"
                fullWidth
                variant="contained"
                size="large"
                disabled={Decimal.from(classifyDepositContract.earned).isZero}
                loading={isClaimRewardLoading}
                onClick={() => {
                  handleClaimRewards();
                }}
              >
                <Typography className="font-bold">
                  {Decimal.from(classifyDepositContract.earned).isZero
                    ? 'No Claimable'
                    : 'Claim Rewards'}
                </Typography>
              </LoadingButton>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
      {/* <Box>
        <Typography>Balance:{balanceAmount.toString()}</Typography>
        <Typography>Allowance:{depositAllowance.toString()}</Typography>
        <Typography>DepositedAmount:{depositedAmount.toString()}</Typography>
      </Box> */}
    </Box>
  );
};

export default EarnManager;
