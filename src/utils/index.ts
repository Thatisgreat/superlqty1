import { ethers } from 'ethers';

export function parseETHAmountToNumber(
  data: ethers.BigNumber,
  remain: number = 2,
) {
  return Number(
    (
      parseInt(ethers.utils.formatEther(data.mul(Math.pow(10, remain)))) /
      Math.pow(10, remain)
    ).toFixed(remain),
  );
}
