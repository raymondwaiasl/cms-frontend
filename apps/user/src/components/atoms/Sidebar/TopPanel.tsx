import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListSharpIcon from '@mui/icons-material/ListSharp';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useApi } from 'libs/common/src/lib/hooks';
import { useState, forwardRef } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

const TopPanel = forwardRef<HTMLDivElement, any>((props: any, ref) => {
  const routeMatch = useRouteMatch<{ id: string }>({
    path: ['/dashboard/:id', '/dashboard'],
    strict: true,
    sensitive: true,
  });
  const client = useApi();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const history = useHistory();
  const { items, marginTop } = props;
  const [open, setIsOpen] = useState<Array<string>>([]);
  const [current, setCurrent] = useState('');
  const menuWidth = 180;

  function buildMenuTree(nodes: any, depth: number) {
    if (nodes.length > 0)
      return nodes.map((node: any, index: any) => (
        <>
          <Stack>
            <ListItemButton
              selected={current === node.id}
              sx={{ width: menuWidth + 'px' }}
              onMouseEnter={() => {
                if (node.children.length > 0) {
                  // open.set(node.id, true);
                  setIsOpen((curr) => [...curr, node.id]);
                  history.push(node.children.length == 0 ? node.to : routeMatch?.url);
                }
              }}
              onMouseLeave={() => {
                if (node.children.length > 0) {
                  setIsOpen((curr) => curr.filter((item) => item !== node.id));

                  history.push(node.children.length == 0 ? node.to : routeMatch?.url);
                }
              }}
              onClick={() => {
                if (node.children.length == 0) {
                  // setCurrent(node.id);
                  //这里一定要push,否则不折叠，为什么？本来想着如果是父级菜单就不push
                  history.push(node.children.length == 0 ? node.to : routeMatch?.url);
                  // open.set(node.id, !open.get(node.id));
                }
              }}
            >
              <ListItemText
                primary={node.name}
                sx={{
                  color: (theme) =>
                    routeMatch?.params.id === node.id ? theme.palette.primary.main : undefined,
                }}
              />
              {/* { node.children.length > 0 && !open.get(node.id) && <ExpandMore />} */}
              {node.children.length > 0 &&
                (open.includes(node.id) ? <ExpandLess /> : <ExpandMore />)}
              {node.children.length > 0 && (
                <Collapse
                  in={open.includes(node.id)}
                  timeout="auto"
                  unmountOnExit
                  sx={{
                    //第一层子元素向下扩展，大于第一层的子元素向右扩展
                    position: 'absolute',
                    top: depth == 1 ? '100%' : 0,
                    left: depth == 1 ? 0 : menuWidth + 'px',
                    backgroundColor: '#fff',
                  }}
                >
                  <List sx={{ paddingTop: 0 }}>{buildMenuTree(node.children, depth + 1)}</List>
                </Collapse>
              )}
            </ListItemButton>
          </Stack>
        </>
      ));
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: '100%',
            height: 'auto',
            boxSizing: 'border-box',
            overflow: 'visible',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: isSidePanelOpen ? 'block' : 'none', marginTop: marginTop }} ref={ref}>
          <List
            component={Stack}
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            // spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {buildMenuTree(items, 1)}
          </List>
        </Box>
      </Drawer>
    </>
  );
});

export default TopPanel;
