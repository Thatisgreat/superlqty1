import {
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
import { useNavigate } from '@umijs/max';
import React, { useMemo } from 'react';
import { Link } from 'umi';

import { useGlobalData } from '@/provider/GlobalDataProvider';
import { Decimal } from '@/utils/decimal';
interface IStatictisRow {
  children?: React.ReactNode;
}

const StatictisRow: React.FC<IStatictisRow> = ({ children }) => {
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

const Earn = () => {
  const navigate = useNavigate();

  const globalData = useGlobalData();

  const {
    earnsData: { sp, lps },
    accountData,
  } = globalData;

  console.log('globalData', globalData);

  const handleJumpToManager = (address: string) => {
    navigate(`/earn/${address}`);
  };

  const spShow = useMemo(() => {
    return {
      ...sp,
      ...accountData?.earnsData?.sp,
    };
  }, [sp, accountData]);

  const lpsShow = useMemo(() => {
    return lps.map((item) => {
      const findUserLp = accountData?.earnsData?.lps?.find(
        (uitem) =>
          uitem.depositContract.toLocaleLowerCase() ===
          item.depositContract.toLocaleLowerCase(),
      );

      return {
        ...item,
        ...findUserLp,
      };
    });
  }, [lps, accountData]);

  return (
    <Box className="text-white">
      {/* SP Pool */}
      <Box className="mt-1.125">
        <Typography className="py-0.75 font-bold" component="h2">
          Stability Pool
        </Typography>
        <Box>
          <TableContainer>
            <Table
              sx={{ minWidth: 650, tableLayout: 'fixed' }}
              aria-label="Stability Pool Table"
            >
              <TableHead sx={{ bgcolor: 'color.#3F4147/80' }}>
                <TableRow>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    Pool
                  </TableCell>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    TVL
                  </TableCell>
                  {/* <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    24H ARP
                  </TableCell>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    7Days ARP
                  </TableCell> */}
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    ARP
                  </TableCell>

                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    Your Deposits
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: 'color.darkBg', opacity: '0.8' }}>
                <TableRow>
                  <StatictisRow>USDU</StatictisRow>
                  <StatictisRow>
                    ${Decimal.from(spShow.tvl).shorten()}
                  </StatictisRow>
                  <StatictisRow>{spShow.apr}%</StatictisRow>
                  {/* <StatictisRow>300%</StatictisRow> */}
                  <StatictisRow>
                    {Decimal.from(spShow.yourDeposits).shorten()}
                  </StatictisRow>
                  <StatictisRow>
                    {Decimal.from(spShow.earned).shorten()}
                  </StatictisRow>
                  <StatictisRow>
                    <Link to={`/earn/${spShow.depositContract}`}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        className="font-bold"
                      >
                        Manage
                      </Button>
                    </Link>
                  </StatictisRow>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* LP Pools */}
      <Box>
        <Typography className="py-0.75 font-bold" component="h2">
          LP Pools
        </Typography>
        <Box>
          <TableContainer>
            <Table
              sx={{ minWidth: 650, tableLayout: 'fixed' }}
              aria-label="Stability Pool Table"
            >
              <TableHead sx={{ bgcolor: 'color.#3F4147/80' }}>
                <TableRow>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    Pool
                  </TableCell>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    TVL
                  </TableCell>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    ARP
                  </TableCell>
                  {/* <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    24H ARP
                  </TableCell>
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    7Days ARP
                  </TableCell> */}
                  <TableCell
                    sx={{ color: 'color.#DDE1E7', fontWeight: 'bold' }}
                    className="border-0"
                    align="center"
                  >
                    Your Deposits
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: 'color.darkBg', opacity: '0.8' }}>
                {lpsShow.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <StatictisRow>
                        <Stack alignItems="center" spacing={0.25}>
                          <Typography>{item.pool}</Typography>
                          <Typography className="text-0.75">
                            {item.source}
                          </Typography>
                        </Stack>
                      </StatictisRow>
                      <StatictisRow>
                        ${Decimal.from(item.tvl).shorten()}
                      </StatictisRow>
                      <StatictisRow>{item.apr}%</StatictisRow>
                      {/* <StatictisRow>300%</StatictisRow> */}
                      <StatictisRow>
                        {Decimal.from(item.yourDeposits).shorten()}
                      </StatictisRow>
                      <StatictisRow>
                        {Decimal.from(item.earned).shorten()}
                      </StatictisRow>
                      <StatictisRow>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          className="font-bold"
                          onClick={() => {
                            handleJumpToManager(item.depositContract);
                          }}
                        >
                          Manage
                        </Button>
                      </StatictisRow>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Earn;
