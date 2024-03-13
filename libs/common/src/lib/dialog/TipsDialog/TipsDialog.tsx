import { useDialog } from '../../hooks';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { FC } from 'react';

const TipsDialog: FC<TipsDialogProps> = ({
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
  }>('tipsDialog');
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
          {data?.deleteBtnTitle ?? 'OK'}
        </LoadingButton>
        
      </DialogActions>
    </Dialog>
  );
};

export default TipsDialog;

export type TipsDialogProps = {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirmAction?: () => void;
  onCloseAction?: () => void;
};
