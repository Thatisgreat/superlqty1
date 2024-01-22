import CollateralImageUrl from '@/assets/images/collateral_default.png';
import { COIN } from '@/constants';
import { useGlobalData } from '@/provider/GlobalDataProvider';
import { Decimal } from '@/utils/decimal';
import { shortenAddress } from '@/utils/format';
import { AddressZero } from '@ethersproject/constants';
import PersonIcon from '@mui/icons-material/Person';
import {
  Avatar,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'umi';
import { useAccount } from 'wagmi';

interface IStatisticItem {
  title: string;
  amount: string;
}

const StatisticItem: React.FC<IStatisticItem> = ({ title, amount }) => {
  return (
    <Stack
      className="grow-0"
      direction="column"
      spacing={1}
      alignItems="center"
    >
      <Box>
        <Typography
          className="leading-none text-2.5 font-normal"
          component="span"
        >
          {amount}
        </Typography>
        <Typography
          className="leading-none ml-0.25 font-semibold"
          component="span"
        >
          $
        </Typography>
      </Box>
      <Typography className="leading-none font-semibold">{title}</Typography>
    </Stack>
  );
};

interface ITroveManagerItem {
  trove: any;
}

const TroveManagerItem: React.FC<ITroveManagerItem> = ({ trove }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box className="text-center">
        <img
          className="w-7.5 h-7.5"
          src={CollateralImageUrl}
          alt="collateral"
        />
        <Typography className="font-bold">{trove.trove.collName}</Typography>
      </Box>

      <Box className="px-1.5 grow border border-solid border-primary bg-secondary">
        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            USD Price
          </Typography>
          <Typography className="leading-none font-semibold">
            ${trove.trove.collPrice}
          </Typography>
        </Stack>
        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            Position
          </Typography>
          <Typography className="leading-none font-semibold">
            {trove.postionAt}/{trove.trove.allTroves.length}
          </Typography>
        </Stack>

        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            Debt In Front
          </Typography>
          <Typography className="leading-none font-semibold">
            {trove.debtFront}
          </Typography>
        </Stack>

        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            Collat.Ratio
          </Typography>
          <Typography className="leading-none font-semibold">
            {trove.cr}%
          </Typography>
        </Stack>

        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            Liquidation Price
          </Typography>
          <Typography className="leading-none font-semibold">
            ${trove.liquidationPrice}
          </Typography>
        </Stack>

        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">
            Collateral
          </Typography>
          <Typography className="leading-none font-semibold">
            {Decimal.from(trove.collateral).shorten()}
          </Typography>
        </Stack>
        <Stack
          className="py-1"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography className="leading-none font-semibold">Debt</Typography>
          <Typography className="leading-none font-semibold">
            {Decimal.from(trove.debt).shorten()} {COIN}
          </Typography>
        </Stack>

        <Link to={`/trove/${trove.trove.troveManager}`}>
          <Button className="mt-1" variant="contained" fullWidth>
            <Typography className="font-bold">Manager</Typography>
          </Button>
        </Link>
      </Box>
    </Stack>
  );
};

const TroveManagerPanel: React.FC<{ troves: any[] }> = ({ troves = [] }) => {
  const hasData = useMemo(() => {
    return !!(troves && troves.length);
  }, [troves]);

  return hasData ? (
    <Box className="grid grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 gap-x-4 gap-y-4">
      {troves?.map((trove) => {
        return (
          <TroveManagerItem
            key={trove.trove.troveManager}
            trove={trove}
          ></TroveManagerItem>
        );
      })}
    </Box>
  ) : (
    <Box className="flex items-center justify-center">
      <Typography className="font-bold">You have no active Troves.</Typography>
      <Link to="/trove">
        <Button variant="text" size="small">
          <Typography className="">Go to Trove</Typography>
        </Button>
      </Link>
    </Box>
  );
};

interface IEarnManagerItem {
  children?: React.ReactNode;
}

const EarnManagerItem: React.FC<IEarnManagerItem> = ({ children }) => {
  return (
    <TableCell
      sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
      className="border-0"
      align="center"
    >
      {children}
    </TableCell>
  );
};

const EarnManagerPanel: React.FC<{ earns: any[] }> = ({ earns }) => {
  const hasData = useMemo(() => {
    return !!(earns && earns.length);
  }, [earns]);

  return hasData ? (
    <TableContainer>
      <Table
        sx={{ minWidth: 650, tableLayout: 'fixed' }}
        aria-label="SP&LP Table"
      >
        <TableHead sx={{ bgcolor: 'color.#3F4147/80' }}>
          <TableRow>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Deposits
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              APR
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Deposits Amount
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Earned
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Operation
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {earns?.map((item, index) => {
            return (
              <TableRow key={`sp_lp_${index}`}>
                <EarnManagerItem
                  key={`deposit_${item.depositContract}_${index}`}
                >
                  <Typography component="span">{item.pool}</Typography>
                  <Typography component="span" className="ml-0.25 text-0.75">
                    {item.source}
                  </Typography>
                </EarnManagerItem>
                <EarnManagerItem>{item.apr}%</EarnManagerItem>
                <EarnManagerItem>
                  {Decimal.from(item.yourDeposits).shorten()}
                </EarnManagerItem>
                <EarnManagerItem>
                  {Decimal.from(item.earned).shorten()} Ultra
                </EarnManagerItem>
                <EarnManagerItem>
                  <Link to={`/earn/${item.depositContract}`}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      className="font-bold"
                    >
                      Manage
                    </Button>
                  </Link>
                </EarnManagerItem>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Box className="flex items-center justify-center">
      <Typography className="font-bold">You have no deposits.</Typography>
      <Link to="/earn">
        <Button variant="text" size="small">
          <Typography className="">Go to Earn</Typography>
        </Button>
      </Link>
    </Box>
  );
};

const StakeManagerPanel: React.FC = () => {
  return (
    <TableContainer>
      <Table
        sx={{ minWidth: 650, tableLayout: 'fixed' }}
        aria-label="SP&LP Table"
      >
        <TableHead sx={{ bgcolor: 'color.#3F4147/80' }}>
          <TableRow>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Your Locks
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Earned
            </TableCell>
            <TableCell
              sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
              className="border-0"
              align="center"
            >
              Operation
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <EarnManagerItem>{2000} </EarnManagerItem>
            <EarnManagerItem>{2000} USDU</EarnManagerItem>
            <EarnManagerItem>
              <Link to={`/lock`}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  className="font-bold"
                >
                  Manage
                </Button>
              </Link>
            </EarnManagerItem>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

enum PanelType {
  Trove = 'trove',
  Earn = 'earn',
  Stake = 'stake',
}

const PortfolioPage = () => {
  const navigate = useNavigate();

  const account = useAccount();

  const globalData = useGlobalData();

  const { accountData, tokenPrice, coinPrice, earnsData } = globalData;

  const [curPanel, setcurPanel] = useState<string>(PanelType.Trove);

  const isPanelActive = useCallback(
    (panel: string) => {
      return curPanel === panel;
    },
    [curPanel],
  );

  const userTroves = useMemo(() => {
    return accountData?.trovesData || [];
  }, [accountData?.trovesData]);

  const userEarns: any[] = useMemo(() => {
    let earns = [];

    const userSp = accountData?.earnsData?.sp;

    const userLps = accountData?.earnsData?.lps;

    const globalSp = earnsData?.sp;

    const globalLps = earnsData?.lps;

    let combineSp = {};

    if (userSp && userSp.yourDeposits !== 0) {
      combineSp = { ...globalSp, ...userSp };

      earns.push(combineSp);
    }

    if (userLps && userLps.length) {
      earns = earns.concat(
        userLps.map((item) => {
          const findIdGlobal = globalLps.find(
            (gitem) =>
              gitem.depositContract.toLocaleLowerCase() ===
              item.depositContract.toLocaleLowerCase(),
          );

          return {
            ...findIdGlobal,
            ...item,
          };
        }),
      );
    }

    return earns;
  }, [accountData?.earnsData, earnsData]);

  const overallPanelInfo = useMemo(() => {
    const allDebt = userTroves.reduce((total, cur) => {
      return total.add(Decimal.from(cur.debt));
    }, Decimal.ZERO);

    const allCollateral = userTroves.reduce((total, cur) => {
      const value = Decimal.from(cur.collateral).mul(
        Decimal.from(cur.trove.collPrice),
      );

      return total.add(value);
    }, Decimal.ZERO);

    const allPooled = userEarns.reduce((total, cur) => {
      const value = Decimal.from(cur.yourDeposits).mul(
        Decimal.from(cur.lpPrice),
      );

      return total.add(value);
    }, Decimal.ZERO);

    const allClaimableGt = userEarns.reduce((total, cur) => {
      const value = Decimal.from(cur.earned).mul(Decimal.from(tokenPrice));
      return total.add(value);
    }, Decimal.ZERO);

    return {
      debt: allDebt,
      collateral: allCollateral,
      pooled: allPooled,
      claimable: allClaimableGt,
      staked: Decimal.ZERO,
    };
  }, [userTroves, userEarns, tokenPrice, coinPrice]);

  useEffect(() => {
    if (!account.address) return navigate('/');
  }, [account]);

  const handleChangePanel = (panel: string) => {
    if (curPanel === panel) return;
    setcurPanel(panel);
  };

  return (
    <Box>
      {/* Overall information */}
      <Box className="mt-2 py-3 flex items-center justify-between">
        {/* Picture & Address */}
        <Box className=" flex items-center">
          <Avatar
            className="mr-1 w-4.375 h-4.375"
            sx={{ bgcolor: 'color.primary' }}
          >
            <PersonIcon className="w-3 h-3" />
          </Avatar>
          <Typography className="font-bold">
            {shortenAddress(account?.address ?? AddressZero)}
          </Typography>
        </Box>
        {/* statistics */}
        <Box className="ml-7.5 grow grid grid-cols-5">
          <StatisticItem
            title="Debt"
            amount={overallPanelInfo.debt.shorten()}
          ></StatisticItem>
          <StatisticItem
            title="Collateral"
            amount={overallPanelInfo.collateral.shorten()}
          ></StatisticItem>
          <StatisticItem
            title="Pooled"
            amount={overallPanelInfo.pooled.shorten()}
          ></StatisticItem>
          {/* <StatisticItem title="Staked" amount="1234"></StatisticItem> */}
          <StatisticItem
            title="Claimed"
            amount={overallPanelInfo.claimable.shorten()}
          ></StatisticItem>
        </Box>
      </Box>
      {/* Part information */}
      <Box>
        {/* panel switch operation */}
        <Box>
          <Box className="flex items-center border-0 border-b border-solid border-b-primary">
            <Box
              onClick={() => {
                handleChangePanel(PanelType.Trove);
              }}
              className={`w-10  text-center cursor-pointer ${
                isPanelActive(PanelType.Trove) ? 'bg-primary text-black' : ''
              }`}
            >
              <Typography className="py-0.5 leading-none font-semibold">
                Trove
              </Typography>
            </Box>
            <Box
              onClick={() => {
                handleChangePanel(PanelType.Earn);
              }}
              className={`w-10 text-center cursor-pointer ${
                isPanelActive(PanelType.Earn) ? 'bg-primary text-black' : ''
              }`}
            >
              <Typography className="py-0.5 leading-none font-semibold">
                SP & LP
              </Typography>
            </Box>
            {/* <Box
              onClick={() => {
                handleChangePanel(PanelType.Stake);
              }}
              className={`w-10 text-center cursor-pointer ${
                isPanelActive(PanelType.Stake) ? 'bg-primary text-black : ''
              }`}
            >
              <Typography className="py-0.5 leading-none font-semibold">
                Stake
              </Typography>
            </Box> */}
          </Box>
        </Box>
        {/* panel detail */}
        <Box className="py-2">
          {curPanel === PanelType.Trove && (
            <TroveManagerPanel troves={userTroves}></TroveManagerPanel>
          )}
          {curPanel === PanelType.Earn && (
            <EarnManagerPanel earns={userEarns}></EarnManagerPanel>
          )}
          {curPanel === PanelType.Stake && (
            <StakeManagerPanel></StakeManagerPanel>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioPage;
