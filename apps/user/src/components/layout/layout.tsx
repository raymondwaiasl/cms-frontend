import { WorkspaceContext } from '../../context/WorkspaceContext';
import Navbar from '../atoms/Navbar/navbar';
import SidePanel from '../atoms/Sidebar/SidePanel';
import TopPanel from '../atoms/Sidebar/TopPanel';
import styles from './layout.module.scss';
import { Box, BoxProps, CssBaseline, Toolbar } from '@mui/material';
import { useApi } from 'libs/common/src/lib/hooks';
import { useContext } from 'react';
import { useRef, useState, useEffect, useMemo, createContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';

const Layout = ({ children, ...props }: BoxProps) => {
  const navbarRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const client = useApi();
  const { setBreadcrumbs } = useContext(WorkspaceContext);
  const [mainBoxMarginTop, setMainBoxMarginTop] = useState(0);
  // const [menuPanelMarginTop, setMenuPanelMarginTop] = useState(0);
  // const [isVertical, setIsVertical] = useState(false);

  const { data } = useQuery(
    'userContext',
    async () => {
      const { data: response } = await client.userService.getContextByUserId();
      return response;
    },
    {
      initialData: queryClient.getQueryData('userContext'),
    }
  );

  const { data: direction, isLoading } = useQuery(
    'sysconfig.user.menu.direction',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'user.menu.direction',
      });
      return response;
    },

    {
      initialData: queryClient.getQueryData('sysconfig.user.menu.direction'),
      staleTime: Infinity,
    }
  );
  const isVertical = useMemo(
    () => (direction?.misSysConfigValue ?? 'v').toLocaleLowerCase().startsWith('v'),
    [direction]
  );
  // useEffect(() => {
  //   // setIsVertical();
  // }, [direction]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setMenuPanelMarginTop(navbarRef.current?.clientHeight || 0);
  //   }, 3000);
  // }, [isVertical]);

  useEffect(() => {
    if (topPanelRef.current && data && data?.length > 0) {
      console.log('running');
      setMainBoxMarginTop(isVertical ? 0 : topPanelRef.current?.clientHeight ?? 0);
    }
  }, [isVertical, topPanelRef.current, data]);

  return (
    <Box {...props} className={styles.container}>
      <Navbar ref={navbarRef} />
      <CssBaseline />
      <Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
        {!isLoading && (
          <>
            <CssBaseline />
            {isVertical ? (
              <SidePanel items={data ?? []} />
            ) : (
              <TopPanel items={data ?? []} ref={topPanelRef} />
            )}
          </>
        )}
        <Box
          component="main"
          className={styles.mainContent}
          sx={{ paddingTop: !isVertical ? `${mainBoxMarginTop}px` : 0 }}
        >
          <Toolbar />
          <LayoutContext.Provider
            value={useMemo(() => ({ headerHeight: mainBoxMarginTop }), [mainBoxMarginTop])}
          >
            {children}
          </LayoutContext.Provider>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

export const LayoutContext = createContext({ headerHeight: 0 });
