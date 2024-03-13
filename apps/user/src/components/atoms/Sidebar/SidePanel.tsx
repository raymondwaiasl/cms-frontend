import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Menu from '@mui/icons-material/Menu';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Paper,
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { WorkspaceContext } from 'apps/user/src/context/WorkspaceContext';
import { useApi } from 'libs/common/src/lib/hooks';
import { useState, useRef, useContext } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

const SidePanel = (props: any) => {
  const routeMatch = useRouteMatch<{ id: string }>({
    path: ['/dashboard/:id', '/dashboard'],
    strict: true,
    sensitive: true,
  });
  const client = useApi();
  const { setBreadcrumbs } = useContext(WorkspaceContext);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const history = useHistory();
  const { items, marginTop } = props;
  const [open, setIsOpen] = useState<Array<string>>([]);

  function buildMenuTree(
    nodes: any,
    depth: number,
    parent: Array<{ to: string; name: string }> = []
  ) {
    console.log(parent);
    if (nodes.length > 0)
      return nodes.map((node: any, index: any) => (
        <>
          <Stack
            sx={{
              marginBottom: '12px',
              ['&:hover']: {
                color: 'white',
              },
            }}
          >
            <ListItemButton
              // selected={current === node.id}
              sx={{
                pl: 2 * depth,
                backgroundColor: (theme) =>
                  routeMatch?.params.id === node.id ? '#255390' : undefined,
                borderRadius: '80px',
                ['&:hover']: {
                  backgroundColor: '#255390',
                  color: 'white',
                  ['.MuiListItemText-root']: {
                    color: 'white',
                  },
                },
              }}
              onClick={() => {
                //这里一定要push,否则不折叠，为什么？本来想着如果是父级菜单就不push
                if (node.children.length === 0) {
                  history.push(node.to);
                  setBreadcrumbs && setBreadcrumbs([...parent, { to: node.to, name: node.name }]);
                }
                setIsOpen((curr) =>
                  curr.includes(node.id)
                    ? curr.filter((item) => item !== node.id)
                    : [...curr, node.id]
                );
              }}
            >
              <ListItemText
                primary={node.name}
                sx={{
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  color:
                    depth > 1
                      ? undefined
                      : routeMatch?.params.id === node.id ||
                        (node.children.length > 0 &&
                          node.children
                            .map((item: { id: string }) => item.id)
                            .includes(routeMatch?.params.id))
                      ? 'white'
                      : '#8c8c8c',
                  // ['&:hover']: {
                  //   color: 'white',
                  // }
                }}
              />
              {node.children.length > 0 &&
                (open.includes(node.id) ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            {node.children.length > 0 && (
              <Collapse in={open.includes(node.id)} timeout="auto" unmountOnExit>
                <List>{buildMenuTree(node.children, depth + 1, parent)}</List>
              </Collapse>
            )}
          </Stack>
        </>
      ));
  }
  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          height: '100%',
          width: isSidePanelOpen ? 'auto' : '50px',
          backgroundColor: '#F3F6F5',
          border: 'none',
          color: '#ffffff',
          transition: 'all 1s',
          position: 'initial',
        },
      }}
      sx={{
        flexShrink: 0,
      }}
    >
      <Toolbar ref={toolbarRef} />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          position: 'relative',
          borderRadius: '0 80px 80px 0',
          width: isSidePanelOpen ? 'auto' : '50px',
          bottom: 0,
          padding: isSidePanelOpen ? '40px' : 0,
          backgroundColor: '#2B3A35',
          color: '#ffffff',
        }}
      >
        <List sx={{ width: isSidePanelOpen ? 'auto' : '0', opacity: isSidePanelOpen ? 1 : 0 }}>
          {items.length > 0 && buildMenuTree(items, 1, [items[0]])}
        </List>
        <IconButton
          sx={{
            position: 'absolute',
            top: 0,
            left: 10,
            marginTop: '-20px',
            padding: 0,
            minWidth: 0,

            height: '100px',
            color: 'white',

            // [`& .MuiButton-startIcon`]: { margin: 0 },
          }}
          onClick={(e) => setIsSidePanelOpen(!isSidePanelOpen)}
        >
          <Menu />
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default SidePanel;
