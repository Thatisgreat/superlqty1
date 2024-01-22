import { ethers } from 'ethers';

interface Network {
  chainId: number;
  name: string;
}

interface Call {
  address: string;
  abi: any[];
  method: string;
  params: any[];
}

interface Calls {
  chainId: number;
  provider:
    | ethers.providers.JsonRpcProvider
    | ethers.providers.FallbackProvider;
  calls: Call[];
  isStrict: boolean;
}

export const multicallABI = [
  {
    constant: true,
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
      { internalType: 'bool', name: 'strict', type: 'bool' },
    ],
    name: 'aggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct Multicall.Return[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getEthBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
export const multicallContractMap: any = {
  1: '0x5eb3fa2dfecdde21c950813c665e9364fa609bd2', //ETH
  56: '0x7F14bc487e63DDB4655e898CcaAff53e1B36262F', //BSC
  66: '0xcdbbbf1dfc46f8bb799699d22c41205cc1627adf', //Ok
  128: '0xcdbbbf1dfc46f8bb799699d22c41205cc1627adf', //Heco
  137: '0x663fc157456c6315053b434783fef65221f75d1a', //Polygon
  250: '0x232da5cd7a7f006564b21769f1457d36cb669b79', //FTM
  43114: '0x663fc157456c6315053b434783fef65221f75d1a', //AVAX
  42161: '0x71f2b84cde0a773e2b7d9a05b4363992ec9ee335', //Arbitrum
  31337: '0x5eb3fa2dfecdde21c950813c665e9364fa609bd2', //HardHat
  1337: '0x9342D3814CeF43efA4b711f8062eA2c65087ca09', //HardHat
  534352: '0x9342D3814CeF43efA4b711f8062eA2c65087ca09', //Scroll
};

class Multicall {
  private multicallContractMap: any = multicallContractMap;

  private chainId: number = 1;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private network: Network = { chainId: 1, name: 'unknown' };

  async setChainId(chainId: number) {
    const { provider } = this;

    if (chainId) {
      this.network = { chainId, name: 'unknown' };
      this.chainId = chainId;
    } else {
      const network = await (
        provider as ethers.providers.JsonRpcProvider
      ).getNetwork();
      const { chainId: networkChainId } = network;

      this.network = network;
      this.chainId = networkChainId;
    }
  }

  setMulticallAddress(chainId: number, address: string) {
    this.multicallContractMap[chainId] = address;
  }

  getMulticallAddress(chainId: number): string {
    return this.multicallContractMap[chainId];
  }

  async call({ chainId, provider, calls = [], isStrict = true }: Calls) {
    const { multicallContractMap } = this;

    if (!chainId) return Promise.reject('error chainId');

    if (!calls.length) return [];

    const multicall = multicallContractMap[chainId];

    if (!multicall) return Promise.reject('error multicall');

    const callBytes = calls.map((call) => {
      const { address, abi, method, params } = call;
      const iface = new ethers.utils.Interface(abi);
      const callData = iface.encodeFunctionData(method, params);

      return {
        target: address,
        callData,
      };
    });

    const contract = new ethers.Contract(multicall, multicallABI, provider);

    const res = await contract.aggregate(callBytes, isStrict);

    const callResult = res.returnData.map((item: any, index: number) => {
      const { abi, method } = calls[index];
      const abiCoder = new ethers.utils.AbiCoder();
      const findOutput = abi.find((citem) => citem.name === method).outputs;

      const params = abiCoder.decode(findOutput, item.data);

      return findOutput.length === 1 ? params[0] : params;
    });

    return callResult;
  }
}

export default Multicall;
