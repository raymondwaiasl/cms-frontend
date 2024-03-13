import { useDialog } from '../..//hooks';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  TextFieldProps,
  Typography,
  IconButton,
} from '@mui/material';
import { FC, HTMLAttributes, useRef, useState } from 'react';

const InputDialog: FC<InputDialogProps> = ({ isOpen, title, onCloseAction, onConfirmAction }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    title: string;
    inputProps?: TextFieldProps;
    confirmAction: (data: any) => void;
  }>('inputDialog');
  console.log(isDialogOpen);
  return (
    <Dialog
      open={isOpen || isDialogOpen}
      PaperProps={{
        sx: {
          padding: '40px',
          borderRadius: '20px',
          minWidth: '680px',
          maxWidth: '800px',
          overflowX: 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
          {title ?? data?.title}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TextField
          value={inputValue}
          helperText={error}
          error={!!error}
          onChange={(evt) => setInputValue(evt.target.value)}
          {...data?.inputProps}
        />
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => {
            if (!inputValue) {
              setError('Folder name cannot be empty');
              return;
            }
            data?.confirmAction && data.confirmAction(inputValue);
            onConfirmAction && onConfirmAction();
            closeCurrentDialog();
          }}
        >
          Confirm
        </Button>
        <Button
          onClick={() => {
            closeCurrentDialog();
            onCloseAction && onCloseAction();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InputDialog;

export type InputDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirmAction?: () => void;
  onCloseAction?: () => void;
};
