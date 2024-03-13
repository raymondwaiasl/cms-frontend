import { useDialog } from '../../hooks';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { FC } from 'react';

const DeleteDialog: FC<DeleteDialogProps> = ({
  isOpen,
  title,
  message,
  onCloseAction,
  onConfirmAction,
}) => {
  const {
    isOpen: isDialogOpen,
    data,
    closeCurrentDialog,
  } = useDialog<{
    title: string;
    message: string;
    isLoading?: boolean;
    isDataReq?: boolean;
    deleteBtnTitle: string;
    confirmAction: () => void;
  }>('deleteDialog');
  console.log(data);
  return (
    <Dialog open={isOpen || isDialogOpen} fullWidth>
      <DialogTitle>{title ?? data?.title}</DialogTitle>
      <DialogContent>{message ?? data?.message}</DialogContent>
      <DialogActions>
        <LoadingButton
          loading={data?.isLoading}
          color="error"
          onClick={() => {
            console.log(data?.confirmAction);
            data?.confirmAction && data.confirmAction();
            onConfirmAction && onConfirmAction();
            !data?.isDataReq && closeCurrentDialog();
          }}
        >
          {data?.deleteBtnTitle ?? 'Delete'}
        </LoadingButton>
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

export default DeleteDialog;

export type DeleteDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirmAction?: () => void;
  onCloseAction?: () => void;
};
