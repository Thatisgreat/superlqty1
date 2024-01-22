import { useGlobalData } from '@/provider/GlobalDataProvider';
import { IGlobalData } from '@/types';
import { Decimal } from '@/utils/decimal';
import { Box, Typography } from '@mui/material';
import { NavLink } from 'umi';
import troveColl from '../../assets/images/trove_coll.png';
import troveInfo from '../../assets/images/trove_info.png';
import troveStart from '../../assets/images/trove_start.png';
import './index.css';

const Trove = () => {
  const globalData: IGlobalData = useGlobalData();

  return (
    <Box className="overflow-hidden  text-white">
      <Box className="mt-3.125 text-1.875 text-center">Collateral</Box>
      <Box className="my-4">
        <Box className="grid grid-cols-2 gap-y-5 md:grid-cols-1 sm:grid-cols-1 xs:grid-cols-1">
          {globalData.trovesData.sortedTroves.map((item) => (
            <Box
              className="justify-self-center  w-37.5"
              key={item.troveManager}
            >
              <Box className="flex items-center">
                <Box className="flex flex-col text-center">
                  <img className="w-8.125 h-8.125" src={troveColl} alt="" />
                  <Typography component="span" className="mt-1.25">
                    {item.collName}
                  </Typography>
                </Box>
                <Box
                  className="relative ml-1.5 w-25.25 h-12.5 bg-center bg-cover"
                  style={{ backgroundImage: 'url(' + troveInfo + ')' }}
                >
                  <Box className="px-1.5">
                    <Box className="flex justify-between items-center h-3.125">
                      <Typography component="span">
                        Collateral USD Price
                      </Typography>
                      <Typography component="span">
                        $ {item.collPrice} USD
                      </Typography>
                    </Box>
                    <Box className="flex justify-between items-center h-3.125">
                      <Typography component="span">Collateral TVL</Typography>
                      <Typography component="span">
                        $
                        {Decimal.from(
                          item.collPrice * item.systemColl,
                        ).shorten()}
                      </Typography>
                    </Box>
                    <Box className="flex justify-between items-center h-3.125">
                      <Typography component="span">Minted USDU</Typography>
                      <Typography component="span">
                        {Decimal.from(item.systemDebt).shorten()}
                      </Typography>
                    </Box>
                  </Box>

                  <NavLink to={`/trove/${item.troveManager}`} caseSensitive>
                    <Box className="absolute left-1.875 bottom-0 w-21.5 h-2.5 cursor-pointer">
                      <Box
                        className="flex justify-center items-center m-auto w-full h-full bg-center bg-cover text-black font-bold"
                        style={{ backgroundImage: 'url(' + troveStart + ')' }}
                      >
                        Open Trove
                      </Box>
                    </Box>
                  </NavLink>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Trove;
