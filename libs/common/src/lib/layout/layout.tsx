import Navbar from '../navbar/navbar';
import SidePanel from '../side-panel/side-panel';
import { Box, BoxProps, CssBaseline, Toolbar } from '@mui/material';

const adminItem = [
  { name: 'Home Page', path: '/' },
  { name: 'Context Management', path: '/context' },
  { name: 'Workspace Management', path: '/workspace' },
  { name: 'Table Management', path: '/table' },
  { name: 'Query Form', path: '/queryform' },
  { name: 'Property Page', path: '/propertypage' },
  { name: 'Audit Management', path: '/audit' },
  { name: 'User Admin', path: '/useradmin' },
  { name: 'System Configuration', path: '/systemconfig' },
];

const Layout = ({ children, ...props }: BoxProps) => {
  return (
    <Box sx={{ display: 'flex' }} {...props}>
      <CssBaseline />
      <Navbar />
      <SidePanel items={adminItem} />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
