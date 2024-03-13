import { Box } from '@mui/material';
import type { FC, ReactNode } from 'react';
import { AiOutlineFileUnknown } from 'react-icons/ai';

const DataNotFoundOverlay: FC<{ children: ReactNode; icon?: ReactNode }> = ({ children, icon }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}
  >
    {!icon ? <AiOutlineFileUnknown size={40} /> : icon}
    <Box sx={{ mt: 1 }}>{children}</Box>
  </div>
);

export default DataNotFoundOverlay;
