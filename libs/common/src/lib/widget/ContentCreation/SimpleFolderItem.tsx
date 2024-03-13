import { TreeItemContentProps, useTreeItem, TreeItemProps, TreeItem } from '@mui/lab';
import { Typography } from '@mui/material';
import cn from 'clsx';
import { forwardRef, useState, useRef, createContext, useContext } from 'react';
import {
  AiFillFolder,
  AiFillFolderOpen,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineFileGif,
} from 'react-icons/ai';
import { FaRegTrashAlt, FaFolderPlus, FaEdit } from 'react-icons/fa';

const CustomContent = forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
  const {
    hasChildren,
    isFileIcon,
    isReadOnly,
    onHandleFolderClick,
    onAddFolderClick,
    onDeleteClick,
    onRenameClick,
  } = useContext(TreeContext);
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
    // event.stopPropagation();
  };

  const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleExpansion(event);
    handleSelection(event);
  };

  const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(event.target);
    handleSelection(event);
  };
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
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
      <div
        onClick={() => {
          onHandleFolderClick(isFileIcon);
          handleSelectionClick;
        }}
        style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}
      >
        {isFileIcon ? (
          <AiOutlineFileGif size={16} />
        ) : expanded ? (
          <AiFillFolderOpen size={16} />
        ) : (
          <AiFillFolder size={16} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
                style={{ width: '100px' }}
                ref={inputRef}
              />
              <AiOutlineCheck
                size={18}
                style={{ marginRight: '5px', zIndex: 10 }}
                onClick={() => {
                  if (inputRef) {
                    onRenameClick(inputRef.current?.value);
                  }
                  setIsEdit(false);
                }}
              />
              <AiOutlineClose
                size={18}
                style={{ marginRight: '5px', zIndex: 10 }}
                onClick={() => setIsEdit(false)}
              />
            </>
          )}

          {isReadOnly ? (
            <></>
          ) : (
            selected &&
            !isEdit && (
              <>
                <FaEdit
                  size={24}
                  style={{ marginRight: '5px', zIndex: 10 }}
                  onClick={() => {
                    setIsEdit(true);
                  }}
                />
                <FaFolderPlus
                  size={24}
                  id="addFolder"
                  style={{ marginRight: '5px', zIndex: 10 }}
                  onClick={() => onAddFolderClick()}
                />
                {!hasChildren && (
                  <FaRegTrashAlt
                    size={24}
                    style={{ marginRight: '5px', zIndex: 10 }}
                    onClick={() => onDeleteClick()}
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
});

const SimpleFolderItem = (props: TreeItemProps & selectionType) => {
  const {
    hasChildren,
    isFileIcon,
    isReadOnly,
    onHandleFolderClick,
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
          isFileIcon,
          isReadOnly,
          onHandleFolderClick,
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

export default SimpleFolderItem;

const initialState: selectionType = {
  hasChildren: false,
  isFileIcon: false,
  isReadOnly: false,
  onHandleFolderClick: () => {},
  onAddFolderClick: () => {},
  onRenameClick: () => {},
  onDeleteClick: () => {},
};
const TreeContext = createContext(initialState);

export type selectionType = {
  hasChildren?: boolean | null;
  isFileIcon?: boolean | null;
  isReadOnly?: boolean | null;
  onHandleFolderClick: (val?: any) => void;
  onAddFolderClick: () => void;
  onRenameClick: (val?: string) => void;
  onDeleteClick: () => void;
};
