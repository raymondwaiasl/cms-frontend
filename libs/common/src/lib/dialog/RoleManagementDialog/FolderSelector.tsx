import { FolderTree } from '../../api';
import styles from './FolderSelector.module.scss';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { TreeView, TreeItem } from '@mui/lab';
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
import React, { useEffect, useState } from 'react';
import { AiFillFolder, AiFillFolderOpen, AiOutlineCheck } from 'react-icons/ai';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';

interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
}
interface FolderSelectorProps {
  folderTree: folderLists[];
  value: string;
  defaultNodeId: string;
  onChange: (value: string, path: string) => void;
}
const FolderSelector: React.FC<FolderSelectorProps> = ({
  folderTree,
  value,
  defaultNodeId,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleNodeSelect = (event: React.ChangeEvent<{}>, nodeId: string) => {
    const path = findNodePath(nodeId, folderTree);
    setSelectedPath(path);
    setSelectedNodeId(nodeId);
  };
  const handleDoubleClick = (event: React.MouseEvent<HTMLLIElement>, nodeId: string) => {
    event.stopPropagation();
    const path = findNodePath(nodeId, folderTree);
    setSelectedPath(path);
    setSelectedNodeId(nodeId);
    handleClose();
    onChange(nodeId, path);
  };
  const handleConfirm = () => {
    onChange(selectedNodeId, selectedPath);
    handleClose();
  };
  const renderTree = (nodes: folderLists[]) => {
    return nodes.map((item) => (
      <TreeItem
        key={item.misFolderId}
        nodeId={item.misFolderId}
        label={
          <React.Fragment>
            <ListItemIcon sx={{ display: 'flex', alignItems: 'center', color: 'black' }}>
              {expandedNodes.includes(item.misFolderId) ? <AiFillFolderOpen /> : <AiFillFolder />}
              <Typography variant="inherit">{item.misFolderName}</Typography>
            </ListItemIcon>
          </React.Fragment>
        }
        // defaultExpanded={selectedNodeId === item.misFolderId}

        // defaultChecked={selectedNodeId === item.misFolderId}
        onDoubleClick={(e) => handleDoubleClick(e, item.misFolderId)}
      >
        {Array.isArray(item.children) ? renderTree(item.children) : null}
      </TreeItem>
    ));
  };

  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const handleNodeToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setExpandedNodes(nodeIds);
  };

  function findNodePath(nodeId: string, nodes: folderLists[], path: string = ''): string {
    for (const node of nodes) {
      const newPath = path === '' ? node.misFolderName : `${path} > ${node.misFolderName}`;
      if (node.misFolderId === nodeId) {
        return newPath;
      }
      if (node.children) {
        const childPath = findNodePath(nodeId, node.children, newPath);
        if (childPath !== '') {
          return childPath;
        }
      }
    }
    return '';
  }

  useEffect(() => {
    setSelectedPath(value);
    setSelectedNodeId(defaultNodeId);
  }, [value]);

  return (
    <>
      {/* <input type="text" value={value} readOnly onClick={handleOpen} /> */}
      <FormControl>
        {/* <input type="text" value={selectedPath} readOnly /> */}
        <TextField
          id="outlined-basic"
          label=""
          variant="outlined"
          size="small"
          value={selectedPath}
        />
        {/* <MenuItem value={value}>{selectedPath}</MenuItem> */}
      </FormControl>
      <IconButton aria-label="delete" onClick={handleOpen}>
        <FolderOpenOutlinedIcon />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Folder Path</DialogTitle>
        <DialogContent>
          <TreeView
            // defaultCollapseIcon={<AiFillFolderOpen />}
            // defaultExpandIcon={<AiFillFolder />}
            defaultExpandIcon={<BsChevronRight />}
            defaultCollapseIcon={<BsChevronDown />}
            // className={styles.folderTree}
            onNodeSelect={handleNodeSelect}
            expanded={expandedNodes}
            onNodeToggle={handleNodeToggle}
            defaultSelected={selectedNodeId}
          >
            {renderTree(folderTree)}
          </TreeView>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedPath} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default FolderSelector;

interface folderLists extends FolderTree {
  children?: FolderTree[];
}
