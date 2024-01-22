export interface IERC20Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export interface ILPToken {
  name: string;
  source: string;
  lp_token: string;
  deposit_contract: string;
  pool_type: string; //maybe convex and curve
  lp_price_reserve: boolean;

  token0?: IERC20Token;
  token1?: IERC20Token;
}

export const tokenETHLPToken = '0x96a301c324a3cf57ddd5dedeb1f7a325d8081723';

export const LP_TOKEN_LIST: ILPToken[] = [

  // {
  //   name: 'mkUSD/PRISMA',
  //   source: 'Convex',
  //   lp_token: '0x067079c14B85169e6a29703769dadDef90816f4C',
  //   pool_type: 'convex',
  //   deposit_contract: '0x48c5e00c63e327F73F789E300472F1744AAa7e34',
  //   lp_price_reserve: false 
  // },
  // {
  //   name: 'mkUSD/PRISMA',
  //   source: 'Curve',
  //   lp_token: '0x067079c14B85169e6a29703769dadDef90816f4C',
  //   pool_type: 'curve',
  //   deposit_contract: '0xa9aA35B5481A7B7936d1680911D478F7A639fE48',
  //   lp_price_reserve: false
  // },
  // {
  //   name: 'PRISMA/ETH',
  //   source: 'Convex',
  //   lp_token: '0xb34e1a3D07f9D180Bc2FDb9Fd90B8994423e33c1',
  //   pool_type: 'convex',
  //   deposit_contract: '0x685E852E4c18c2c554a1D25c1197684fd9593145',
  //   lp_price_reserve: true
  // },


  {
    name: 'PRISMA/ETH',
    source: 'Syncswap',
    lp_token: tokenETHLPToken,
    pool_type: 'syncswap',
    deposit_contract: '0x64E61D0DC4F1Eba6EB7C92eEEd67e9D0B2Ce64ce',
    lp_price_reserve: true
  },
];

export const recoveryModeTCR = 150;
