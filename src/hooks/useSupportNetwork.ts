import { chainId } from '@/constants';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

const useSupportNetwork = () => {
  const connectedChainId = useChainId();
  return useMemo(() => {
    return chainId === connectedChainId;
  }, [connectedChainId]);
};

export default useSupportNetwork;
