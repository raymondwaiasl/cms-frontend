import { Button } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ConfirmationToastProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ message, onConfirm, onCancel }) => {
  const handleConfirm = () => {
    toast.dismiss();
    onConfirm();
  };

  const handleCancel = () => {
    toast.dismiss();
    onCancel();
  };

  return (
    <div>
      <p>{message}</p>
      <Button variant="contained" onClick={handleConfirm}>
        Confirm
      </Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  );
};
export default ConfirmationToast;
