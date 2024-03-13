import styles from './FolderItem.module.scss';
import { TreeItem, TreeItemContentProps, TreeItemProps, useTreeItem } from '@mui/lab';
import { Typography } from '@mui/material';
import cn from 'clsx';
import { createContext, forwardRef, MouseEventHandler, useContext, useRef, useState } from 'react';
import { AiFillFolder, AiFillFolderOpen, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { FaEdit, FaFolderPlus, FaRegTrashAlt } from 'react-icons/fa';

const CustomContent = forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
  const { hasChildren, showEditIcons, onAddFolderClick, onDeleteClick, onRenameClick } =
    useContext(TreeContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEdit, setIsEdit] = useState(false);

  const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);
  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleExpansion(event);
    handleSelection(event);
  };

  const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleSelection(event);
  };

  return (
    <div
      className={cn(className, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
    >
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <div onClick={handleSelectionClick} className={styles.folderContainer}>
        {expanded ? <AiFillFolderOpen size={16} /> : <AiFillFolder size={16} />}
        <div className={styles.folderContainerName}>
          {!isEdit ? (
            <Typography component="div" className={classes.label}>
              {label}
            </Typography>
          ) : (
            <>
              <input
                type="text"
                defaultValue={label as string}
                aria-label="file name"
                className={classes.label}
                ref={inputRef}
              />
              <AiOutlineCheck
                size={18}
                className={styles.folderContainerIcon}
                onClick={() => {
                  if (inputRef) {
                    onRenameClick(inputRef.current?.value);
                  }
                  setIsEdit(false);
                }}
              />
              <AiOutlineClose
                size={18}
                className={styles.folderContainerIcon}
                onClick={() => setIsEdit(false)}
              />
            </>
          )}

          {showEditIcons && selected && !isEdit && (
            <>
              <FaEdit
                size={24}
                className={styles.folderContainerIcon}
                onClick={() => {
                  setIsEdit(true);
                }}
              />
              <FaFolderPlus
                size={24}
                id="addFolder"
                className={styles.folderContainerIcon}
                onClick={() => onAddFolderClick()}
              />
              {!hasChildren && (
                <FaRegTrashAlt
                  size={24}
                  className={styles.folderContainerIcon}
                  onClick={() => onDeleteClick()}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const FolderItem = (props: TreeItemProps & selectionType) => {
  const {
    hasChildren,
    showEditIcons,
    onAddFolderClick,
    onDeleteClick,
    onRenameClick,
    ...otherProps
  } = props;
  return (
    <>
      <TreeContext.Provider
        value={{
          hasChildren,
          showEditIcons: showEditIcons === false ? false : true,
          onAddFolderClick,
          onDeleteClick,
          onRenameClick,
        }}
      >
        <TreeItem ContentComponent={CustomContent} {...otherProps} />
      </TreeContext.Provider>
    </>
  );
};

export default FolderItem;

const initialState: selectionType = {
  hasChildren: false,
  showEditIcons: false,
  onAddFolderClick: () => {},
  onRenameClick: () => {},
  onDeleteClick: () => {},
};
const TreeContext = createContext(initialState);

export type selectionType = {
  hasChildren?: boolean | null;
  showEditIcons?: boolean | null;
  onAddFolderClick: () => void;
  onRenameClick: (val?: string) => void;
  onDeleteClick: () => void;
};
