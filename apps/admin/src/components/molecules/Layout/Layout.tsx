import Navbar from '../../atom/Navbar/navbar';
import SidePanel from '../../atom/Sidebar/SidePanel';
// import styles from './Layout.module.scss';
import { Box, BoxProps, CssBaseline, Toolbar } from '@mui/material';

const adminItem = [
  // { name: 'Home Page', path: '/' },
  { name: 'Context Management', path: '/' },
  { name: 'Workspace Management', path: '/workspace' },
  { name: 'Widget Management', path: '/widgetMgmt' },
  { name: 'Table Management', path: '/table' },
  { name: 'Query Form', path: '/queryform' },
  { name: 'Property Page', path: '/propertypage' },
  { name: 'Audit Management', path: '/audit' },
  { name: 'Dictionary', path: '/dictionary' },
  { name: 'User Admin', path: '/useradmin' },
  { name: 'System Configuration', path: '/systemconfig' },
  { name: 'Storage Management', path: '/storage' },
  { name: 'Bi Tool Config', path: '/biToolConfig' },
  { name: 'Simple Search Management', path: '/simpleSearch' },
  { name: 'Welcome Config', path: '/welcomeConfig' },
  { name: 'Welcome View', path: '/welcomeView' },
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
