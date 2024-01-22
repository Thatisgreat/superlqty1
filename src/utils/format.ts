import { BigNumber } from '@ethersproject/bignumber';

import { Decimal } from './decimal';

export const shortenAddress = (address: string) =>
  address.substr(0, 6) + '...' + address.substr(-4);

export const numberify = (bigNumber: BigNumber): number => bigNumber.toNumber();

export const decimalify = (bigNumber: BigNumber): Decimal =>
  Decimal.fromBigNumberString(bigNumber.toHexString());
