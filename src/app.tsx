import React from 'react';

import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import { WagmiConfig, createClient } from 'wagmi';
import { localhost } from 'wagmi/chains';

import { GlobalDataProvider } from '@/provider/GlobalDataProvider';
import theme from '@/theme';
import { IInitialState } from '@/types';
import { CssBaseline } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import {
  SnackbarUtilsConfigurator,
  StyledMaterialDesignContent,
} from './components/Message';

import { isProd } from './constants';

const config = createClient(
  getDefaultClient({
    // Required API Keys
    walletConnectProjectId: 'b16efb4fd41473c0f45dbad8efa15a00',
    chains: isProd
      ? [
          {
            id: 534352,
            name: 'Scroll',
            network: 'scroll',
            nativeCurrency: {
              decimals: 18,
              name: 'ETH',
              symbol: 'ETH',
            },
            rpcUrls: {
              public: { http: ['https://rpc.scroll.io'] },
              default: { http: ['https://rpc.scroll.io'] },
            },
            blockExplorers: {
              etherscan: { name: 'Scrollscan', url: 'https://scrollscan.com' },
              default: { name: 'Scrollscan', url: 'https://scrollscan.com' },
            },
          },
        ]
      : [localhost],
    // Required
    appName: 'Ultra Liquity',
    // Optional
    appDescription: 'Your App Description',
  }),
);

interface IRootProvider {
  children?: React.ReactNode;
}

const RootProvider: React.FC<IRootProvider> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          Components={{
            success: StyledMaterialDesignContent,
            error: StyledMaterialDesignContent,
          }}
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={3000}
        >
          <SnackbarUtilsConfigurator></SnackbarUtilsConfigurator>
          <WagmiConfig client={config}>
            <ConnectKitProvider>
              <GlobalDataProvider>{children}</GlobalDataProvider>
            </ConnectKitProvider>
          </WagmiConfig>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export async function getInitialState(): Promise<IInitialState> {
  const initState: IInitialState = {};

  return initState;
}

export function rootContainer(container: React.ReactNode) {
  return <RootProvider>{container}</RootProvider>;
}
