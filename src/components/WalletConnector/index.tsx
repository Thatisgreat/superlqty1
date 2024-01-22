import { Box, Typography } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import React from 'react';

type WalletConnectorProps = {
  children?: React.ReactNode;
  unConnectChildren?: React.ReactNode;
};

const WalletConnector: React.FC<WalletConnectorProps> = ({
  children,
  unConnectChildren,
}) => {
  return (
    <ConnectKitButton.Custom>
      {(connectKit) =>
        connectKit.isConnected ? (
          children
        ) : (
          <Box onClick={connectKit.show}>
            {unConnectChildren ?? (
              <Box className="px-1.25 py-0.375 flex items-center justify-center bg-secondary border border-primary border-solid cursor-pointer rounded-0.25">
                <Typography>Connect Wallet</Typography>
              </Box>
            )}
          </Box>
        )
      }
    </ConnectKitButton.Custom>
  );
};

export default WalletConnector;
