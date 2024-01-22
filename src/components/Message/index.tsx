import { styled } from '@mui/material';

import {
  MaterialDesignContent,
  OptionsObject,
  ProviderContext,
  VariantType,
  useSnackbar,
} from 'notistack';

interface Props {
  setUseSnackbarRef: (useSnackbar: ProviderContext) => void;
}

const InnerSnackbarUtilsConfigurator = (props: Props) => {
  props.setUseSnackbarRef(useSnackbar());
  return null;
};

let useSnackbarRef: ProviderContext | null = null;

const setUseSnackbarRef = (useSnackbarRefProp: ProviderContext) => {
  useSnackbarRef = useSnackbarRefProp;
};

export const SnackbarUtilsConfigurator = () => {
  return (
    <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />
  );
};

export const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  () => ({
    '&.notistack-MuiContent-success': {
      backgroundColor: '#84cc16',
    },
    '&.notistack-MuiContent-error': {
      backgroundColor: '#FF5C5C',
    },
  }),
);

export const message = {
  success(msg: string, options: OptionsObject = {}) {
    this.toast(msg, 'success', options);
  },
  warning(msg: string, options: OptionsObject = {}) {
    this.toast(msg, 'warning', options);
  },
  info(msg: string, options: OptionsObject = {}) {
    this.toast(msg, 'info', options);
  },
  error(msg: string, options: OptionsObject = {}) {
    this.toast(msg, 'error', options);
  },
  toast(
    msg: string,
    variant: VariantType = 'default',
    options: OptionsObject = {},
  ) {
    (useSnackbarRef as ProviderContext).enqueueSnackbar(msg, {
      ...options,
      variant,
    });
  },
};
