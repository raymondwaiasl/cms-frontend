import type { SxProps, ButtonProps } from '@mui/material';

interface componentTheme {
  primary: ButtonProps;
  'primary-small': ButtonProps;
  'secondary-small': ButtonProps;
  secondary: ButtonProps;
  danger: ButtonProps;
  'danger-outlined': ButtonProps;
  'danger-small': ButtonProps;
}

const btnStyle: componentTheme = {
  primary: {
    variant: 'contained',

    sx: {
      backgroundColor: '#255390',
      color: 'white',
      borderColor: '#255390',
      padding: '12px 24px',
      borderRadius: '80px',
      textTransform: 'none',
      ['&:not(:last-child)']: {
        marginRight: '0.5rem',
      },
    },
  },
  secondary: {
    variant: 'outlined',

    sx: {
      borderColor: '#255390',
      color: '#255390',
      padding: '12px 24px',
      borderRadius: '80px',
      textTransform: 'none',
      ['&:not(:last-child)']: {
        marginRight: '0.5rem',
      },
    },
  },
  'primary-small': {
    variant: 'contained',
    sx: {
      backgroundColor: '#255390',
      color: 'white',
      borderColor: '#255390',
      padding: '6px 12px',
      borderRadius: '80px',
    },
  },
  'secondary-small': {
    variant: 'outlined',

    sx: {
      color: '#255390',
      padding: '6px 12px',
      borderColor: '#255390',
      borderRadius: '80px',
      textTransform: 'none',
    },
  },
  danger: {
    variant: 'contained',
    color: 'error',
    sx: {
      padding: '6px 12px',
      borderRadius: '80px',
      textTransform: 'none',
    },
  },
  'danger-outlined': {
    variant: 'outlined',
    color: 'error',
    sx: {
      padding: '6px 12px',
      borderRadius: '80px',
      textTransform: 'none',
    },
  },
  'danger-small': {
    variant: 'contained',
    color: 'error',
    sx: {
      padding: '6px 12px',
      borderRadius: '80px',
      textTransform: 'none',
    },
  },
};

export default btnStyle;
