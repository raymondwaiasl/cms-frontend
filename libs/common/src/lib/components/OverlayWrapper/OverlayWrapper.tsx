import { WidgetContextProvider } from '../../context/WidgetContext';
import WidgetHandler from '../../context/WidgetHandler';
import useOverlay from '../../hooks/useOverlay';
import dataStore from '../../store/dataStoreNew';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, Drawer, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { useEffect, type FC } from 'react';

const OverlayWrapper: FC<OverlayWrapperProps> = ({ widgetKey, type, title, configId }) => {
  const { isOpen, closeCurrentOverlay } = useOverlay(widgetKey);
  if (type === 'DIALOG')
    return (
      <Dialog
        open={isOpen}
        PaperProps={{
          sx: {
            padding: '40px',
            borderRadius: '20px',
            maxHeight: '600px',
            minWidth: '680px',
            maxWidth: 'fit-content',
            overflowX: 'auto',
          },
        }}
        onClose={closeCurrentOverlay}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '22px', fontWeight: '700' }}>
            {title}
          </Typography>
          <IconButton onClick={closeCurrentOverlay}>
            <CloseIcon />
          </IconButton>
        </Box>
        <WidgetContextProvider closeOverlay={closeCurrentOverlay} title={title} id={widgetKey}>
          {WidgetHandler[widgetKey]}
        </WidgetContextProvider>
      </Dialog>
    );

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      sx={{ transition: 'all 1s' }}
      PaperProps={{
        sx: {
          maxWidth: '90vw',
          minWidth: '40vw',
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
      onClose={closeCurrentOverlay}
      open={isOpen}
    >
      <Toolbar />
      <Box
        sx={{
          padding: '40px',
          backgroundColor: 'white',
          height: '100%',
          overflowY: 'hidden',
          borderRadius: '50px 0 0 50px',
        }}
      >
        <Box sx={{ overflowY: 'auto', maxHeight: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              position: 'sticky',
              backgroundColor: 'white',
              top: 0,
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              zIndex: 10,
            }}
          >
            <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
              {title}
            </Typography>
            <IconButton onClick={closeCurrentOverlay}>
              <CloseIcon />
            </IconButton>
          </Box>
          <WidgetContextProvider
            closeOverlay={closeCurrentOverlay}
            title={title}
            id={widgetKey}
            configId={configId}
          >
            {WidgetHandler[widgetKey]}
          </WidgetContextProvider>
        </Box>
      </Box>
    </Drawer>
  );
};
export type OverlayWrapperProps = {
  type: 'SIDEBAR' | 'DIALOG';
  widgetKey: keyof typeof dataStore;
  title: string;
  configId?: string;
};
export default OverlayWrapper;
