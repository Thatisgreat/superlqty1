import { ethers } from 'ethers';
import Multicall from '@/utils/multicall';
import { Multicall as MulticallInterface } from '@/types/index';

const multicallInstance = new Multicall();

export default ethers;

export const setCustomMulticallAddress = (chainId: number, mulAddr: string) => multicallInstance.setMulticallAddress(chainId, mulAddr);

export interface MuticallParams {
  provider: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider,
  calls: MulticallInterface[],
  chainId?: number,
  isStrict?: boolean
}

export const multicall = async function({
  provider,
  calls,
  chainId = 1,
  isStrict = true
}: MuticallParams) {
  if (!provider) return Promise.reject('no provider');
  if (!calls.length) return Promise.reject('no calls');
  if (!chainId) return Promise.reject('no chainId');
  
  return multicallInstance.call({
    provider,
    chainId,
    calls,
    isStrict
  });
};


