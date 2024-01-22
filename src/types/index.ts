export interface IInitialState { }

export interface ITroveSimple {
    owner: string;
    debt: number;
    coll: number;
    cr: number;
}

export interface ITroveData {
    collateral: string;
    troveManager: string;

    collPrice: number;
    systemColl: number;
    systemDebt: number;

    mcr: number;
    mintFee: number;
    borrowInterestRate: number;
    debtGasCompensation: number;
    maxSystemDebt: number;

    sortedTroves: string;
    collName: string;

    allTroves: ITroveSimple[],
    redeemRate: number,
}

export interface ITroves {
    sortedTroves: ITroveData[],
    troves: Record<string, ITroveData>
}

export interface IEarn {
    pool: string;
    source: string;
    tvl: number;
    apr: number;
    yourDeposits: number;
    earned: number;
    lpToken: string;
    lpPrice: number;
    depositContract: string;
}

export interface IEarns {
    sp: IEarn;
    lps: IEarn[]
}


export interface IAccountTrove {
    trove: ITroveData;
    postionAt: number;
    debt: number;
    debtFront: number; //This is how much debt would need to be redeemed before your Vault can be redeemed against assuming mkUSD was under peg
    collateral: number;
    cr: number;
    liquidationPrice: number;
    //'nonExistent' | 'active' | 'closedByOwner' | 'closedByLiquidation' | 'closedByRedemption' 0 - 4
    status: number;
}

export interface AccountLP {
    lpToken: string;
    depositContract: string;
    yourDeposits: number;
    earned: number;
}

export interface IAccountData {
    balances: Record<string, number>;
    trovesData: IAccountTrove[];
    earnsData: {
        sp: AccountLP,
        lps: AccountLP[]
    }
}


export interface IGlobalData {
    coinPrice: number;
    tokenPrice: number;
    minNetDebt: number;
    trovesData: ITroves;
    earnsData: IEarns;
    accountData: IAccountData | null;
    getSystemData: () => void;
}





export interface Multicall {
    address: string,
    abi: any[],
    method: string,
    params: any[]
}