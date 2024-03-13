import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

const SidePanel = (props: any) => {
  const routeMatch = useRouteMatch({
    path: ['/:param', '/'],
    strict: true,
    sensitive: true,
  });
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const history = useHistory();
  const { items } = props;

  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="logo"
        onClick={() => setIsSidePanelOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="permanent"
        sx={{
          width: 200,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {items.map((item: any, index: any) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  selected={routeMatch?.url === item.path}
                  onClick={() => history.push(item.path)}
                >
                  <ListItemText
                    primary={item.name}
                    sx={{
                      color: (theme) =>
                        routeMatch?.url === item.path ? theme.palette.primary.main : undefined,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default SidePanel;
