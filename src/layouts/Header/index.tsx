import LogoUrl from '@/assets/images/logo.png';
import WalletConnector from '@/components/WalletConnector';
import { shortenAddress } from '@/utils/format';
import message from '@/utils/message';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import KeyboardArrowDownSharpIcon from '@mui/icons-material/KeyboardArrowDownSharp';
import { Box, Popover, Stack, Typography } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';
import React, { useMemo, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link, NavLink } from 'umi';
import { useAccount, useDisconnect } from 'wagmi';
import style from './index.module.css';

import { useGlobalData } from '@/provider/GlobalDataProvider';
import { Decimal, Percent } from '@/utils/decimal';
import { SvgIconPropsColorOverrides } from '@mui/material';

import { recoveryModeTCR } from '@/constants';

const Header: React.FC = () => {
  const globalData = useGlobalData();

  console.log('globalData', globalData);

  //computed system statistics
  const systemStatistics = useMemo(() => {
    const { trovesData } = globalData;

    const totalCollateralValue = trovesData?.sortedTroves?.reduce(
      (total, cur) => {
        return total.add(
          Decimal.from(cur.systemColl).mul(Decimal.from(cur.collPrice)),
        );
      },
      Decimal.ZERO,
    );
    const totalDebt = trovesData?.sortedTroves?.reduce((total, cur) => {
      return total.add(Decimal.from(cur.systemDebt));
    }, Decimal.ZERO);

    return {
      systemCR: totalCollateralValue.div(totalDebt) || Decimal.ZERO,
      totalCollateralValue: totalCollateralValue || Decimal.ZERO,
      totalDebt: totalDebt || Decimal.ZERO,
    };
  }, [globalData]);

  const [isShowSystemStatisticDialog, setisShowSystemStatisticDialog] =
    useState<boolean>(false);

  const handleShowSystemStatistic = () => {
    setisShowSystemStatisticDialog(true);
  };

  const handleCloseSystemStatistic = () => {
    setisShowSystemStatisticDialog(false);
  };

  return (
    <Box className="px-1.25 flex items-center justify-between bg-lightBg">
      {/* left */}
      <Stack direction="row" alignItems="center">
        <Link to="/trove">
          <img className="mr-4 w-8 h-1.75" src={LogoUrl} alt="Ultra Liquity" />
        </Link>
        <Nav></Nav>
      </Stack>
      {/* right */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          onClick={() => {
            console.log(111);
          }}
        >
          <SystemCR ratio={systemStatistics.systemCR}></SystemCR>
        </Box>
        <WalletConnector>
          <ConnectedAccount></ConnectedAccount>
        </WalletConnector>
      </Stack>
    </Box>
  );
};

const Nav: React.FC = () => {
  const navs: { text: string; to: string }[] = [
    { text: 'Trove', to: '/trove' },
    { text: 'Earn', to: '/earn' },
    // { text: 'Lock', to: '/lock' },
    { text: 'Redeem', to: '/redeem' },
  ];

  const baseStyle =
    'relative px-2 py-1.5 text-white text-lg leading-none font-bold no-underline flex-none';

  const activeStyle = `!text-black !bg-primary ${style.container}`;

  return (
    <Stack direction="row">
      {navs.map((nav) => (
        <NavLink
          key={nav.text}
          to={nav.to}
          className={({ isActive }) =>
            isActive ? `${baseStyle} ${activeStyle}` : baseStyle
          }
          caseSensitive
        >
          {nav.text}
        </NavLink>
      ))}
    </Stack>
  );
};

const SystemCR: React.FC<{ ratio: Decimal }> = ({ ratio }) => {
  const ratioLevelStyle: OverridableStringUnion<
    | 'inherit'
    | 'action'
    | 'disabled'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning',
    SvgIconPropsColorOverrides
  > = useMemo(() => {
    if (ratio.gt(Decimal.from(recoveryModeTCR).div(100))) return 'success';
    else if (ratio.gt(1.2)) return 'warning';
    else return 'error';
  }, [ratio]);

  return (
    <Box className="px-1.25 py-0.375 flex items-center justify-center bg-secondary border border-primary border-solid cursor-pointer rounded-1">
      <HeartBrokenIcon
        className="mr-0.25 w-1.5 h-1.5"
        color={ratioLevelStyle}
      ></HeartBrokenIcon>
      <Typography className="text-info">
        {new Percent(ratio).prettify()}
      </Typography>
    </Box>
  );
};

const ConnectedAccount: React.FC = () => {
  console.log('ConnectedAccount Rerender');

  const account = useAccount();
  const { disconnect } = useDisconnect();

  const anchorElRef = useRef(null);

  const [isShowMenu, setisShowMenu] = useState<boolean>(false);

  const handleOpen = async () => {
    setisShowMenu(true);
  };

  const handleClose = () => {
    setisShowMenu(false);
  };

  return (
    <Box ref={anchorElRef}>
      <Box
        className="px-1.25 py-0.375 flex items-center justify-center bg-secondary border border-primary border-solid cursor-pointer rounded-0.25"
        onClick={handleOpen}
      >
        <Typography className="text-primary font-semibold">
          {shortenAddress(account?.address || '')}
        </Typography>
        <KeyboardArrowDownSharpIcon
          color="primary"
          className={`transition-all ${isShowMenu ? 'rotate-180' : ''}`}
        ></KeyboardArrowDownSharpIcon>
      </Box>
      <Popover
        anchorEl={anchorElRef.current}
        open={isShowMenu}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box className="p-1 grid grid-cols-1 gap-1">
          <CopyToClipboard
            text={account?.address || ''}
            onCopy={() => {
              message.success('Copy successfully.');
              handleClose();
            }}
          >
            <Box
              className="flex items-center justify-center cursor-pointer rounded w-18 h-2.5 border border-solid border-primary bg-[rgba(180, 255, 0, 0.10)] hover:bg-secondary"
              onClick={handleClose}
            >
              <Typography className="text-primary">Copy Address</Typography>
            </Box>
          </CopyToClipboard>

          <Link to="/portfolio" className="no-underline">
            <Box
              className="flex items-center justify-center cursor-pointer rounded w-18 h-2.5 border border-solid border-primary bg-[rgba(180, 255, 0, 0.10)] hover:bg-secondary"
              onClick={handleClose}
            >
              <Typography className="text-primary">My portfolio</Typography>
            </Box>
          </Link>

          <Box
            className="flex items-center justify-center cursor-pointer rounded w-18 h-2.5 border border-solid border-primary bg-[rgba(180, 255, 0, 0.10)] hover:bg-secondary"
            onClick={() => {
              handleClose();
              disconnect();
            }}
          >
            <Typography className="text-primary">Disconnect</Typography>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default Header;
