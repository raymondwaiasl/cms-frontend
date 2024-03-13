import AcUnitIcon from '@mui/icons-material/AcUnit';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import AddIcon from '@mui/icons-material/Add';
import BalanceIcon from '@mui/icons-material/Balance';
import BuildIcon from '@mui/icons-material/Build';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  MenuItem,
  TextField,
  ListItemIcon,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

interface IconSelectorProps {
  onSelect: (icon: string) => void;
}
const IconSelector: React.FC<IconSelectorProps> = ({ onSelect }) => {
  const icons = ['AccessAlarmIcon', 'AcUnitIcon', 'BalanceIcon', 'BuildIcon', 'BusinessIcon'];
  const [open, setOpen] = useState(false);
  const handleIconSelect = (icon: string) => {
    onSelect(icon);
    handleClose();
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton aria-label="delete" onClick={handleOpen}>
        <AddIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Icon</DialogTitle>
        <DialogContent>
          {icons.map((icon) => {
            switch (icon) {
              case 'AccessAlarmIcon':
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <AccessAlarmIcon />
                  </IconButton>
                );
              case 'AcUnitIcon':
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <AcUnitIcon />
                  </IconButton>
                );
              case 'BalanceIcon':
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <BalanceIcon />
                  </IconButton>
                );
              case 'BuildIcon':
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <BuildIcon />
                  </IconButton>
                );
              case 'BusinessIcon':
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <BusinessIcon />
                  </IconButton>
                );

              default:
                return (
                  <IconButton key={icon} onClick={() => handleIconSelect(icon)}>
                    <BusinessIcon />
                  </IconButton>
                );
            }
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default IconSelector;
