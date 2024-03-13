import { useApi, useDialog, useWidget } from '../../hooks';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { FC, useState } from 'react';
import { useQueryClient } from 'react-query';

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
    deleteBtnTitle: string;
    data?: {
      misTypeId: string;
      misRecordId: string;
    };
    confirmAction: () => void;
  }>('renditionDialog');
  console.log(isDialogOpen);
  const client = useApi(); //upLoadRendition
  const queryClient = useQueryClient();
  const { updateWidget } = useWidget();

  const [fileName, setFileName] = useState<string>('');

  const [fileVo, setFileVo] = useState<File>();

  const handleCapture = ({ target }: any) => {
    console.log('data?.deleteBtnTitle', data?.deleteBtnTitle);
    console.log(target.files[0]);
    setFileName(target.files[0].name);
    setFileVo(target.files[0]);
  };

  const handleUpload = async () => {
    console.log('fileVo=======', fileVo);
    console.log('misTypeId=======', data?.data?.misTypeId);
    console.log('misRecordId=======', data?.data?.misRecordId);
    if (fileVo != undefined) {
      const formData = new FormData();
      formData.append('files', fileVo);
      formData.append('misTypeId', data?.data?.misTypeId ?? '');
      formData.append('misRecordId', data?.data?.misRecordId ?? '');
      const { data: response } = await client.renditionService.uploadRendition(formData);
      queryClient.invalidateQueries('Rendition');
      console.log('upLoadFiles response======', response);
      updateWidget('Rendition', { recordId: data?.data?.misRecordId ?? '' });
      queryClient.invalidateQueries('versionDetail');
    }
  };

  return (
    <Dialog open={isOpen || isDialogOpen} fullWidth>
      <DialogTitle>{title ?? data?.title}</DialogTitle>
      <form
        style={{
          padding: '40px',
          backgroundColor: 'white',
          height: '100%',
          borderRadius: '50px 0 0 50px',
        }}
      >
        <Box
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
        </Box>
        <DialogContent>
          Content: <input type="text" value={fileName} readOnly />
          <Button variant="contained" sx={{ float: 'right' }} component="label">
            ...
            <input hidden accept="image/*" type="file" onChange={handleCapture} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // data?.confirmAction && data.confirmAction();
              // onConfirmAction && onConfirmAction();
              handleUpload();
              closeCurrentDialog();
            }}
          >
            {data?.deleteBtnTitle ?? 'Delete'}
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
      </form>
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
