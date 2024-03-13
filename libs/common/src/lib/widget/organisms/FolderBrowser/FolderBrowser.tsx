import { FolderTree } from '../../../api';
import { useApi, useDialog, useWidget } from '../../../hooks';
import { list_to_tree } from '../../../utils/functions';
// import dataStore from '../../../store/dataStore';
import FolderItem from '../../molecules/FolderItem/FolderItem';
import styles from './FolderBrowser.module.scss';
import { TreeView } from '@mui/lab';
import { useMemo, useState, useEffect } from 'react';
import { BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRecoilValue } from 'recoil';

const FolderBrowser = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { openDialog } = useDialog();
  const { updateWidgets, updateWidget } = useWidget();
  const [currId, setCurrId] = useState('');
  const AddFolder = useMutation(client.folderService.saveFolder, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Browser');
    },
  });

  const DeleteFolder = useMutation(client.folderService.deleteFolder, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Browser');
    },
  });
  const UpdateFolder = useMutation(client.folderService.updateFolder, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Browser');
    },
  });
  const [nodeList, setNodeList] = useState<string[]>([]);

  const updateSelect = (id: string) => {
    setCurrId(id);
    updateWidgets({
      Permission: { id, isFolder: true },
      'Record Creation': { id },
      'Search Form': { folderId: id },
      'Record List': { id },
      Properties: {
        id,
        name: data?.find((item) => item.misFolderId === id)?.misFolderName ?? '',
      },
      'Data Import': {
        id,
      },
      'Data Export': {
        folderId: id,
      },
    });

    // updateWidget('Permission', { id, isFolder: true });
    // updateWidget('Record Creation', { id });
    // updateWidget('Search Form', {folderId: id});
    // updateWidget('Properties', { id, name: data?.find((item) => item.misFolderId === id)?.misFolderName ?? '',});
    // updateWidget('Data Import', {id});

    // updateWidget('Record List', {id},);
    // updateWidget('Data Export', { folderId: id});
  };

  const renderTree = (items: folderLists[], level: number) => {
    return items.map((item) => (
      <FolderItem
        key={item.misFolderId as string}
        nodeId={item.misFolderId as string}
        label={item.misFolderName as string}
        hasChildren={item.children && item.children.length > 0}
        onAddFolderClick={() => {
          openDialog('inputDialog', {
            title: `Name your Folder`,
            inputProps: { placeholder: 'New Folder Name' },
            confirmAction: (name: string) => {
              console.log(name);
              AddFolder.mutate({
                misFolderParentId: item.misFolderId,
                misFolderName: name ?? '',
              });
              setNodeList((curr) => [...curr, item.misFolderId]);
            },
          });
        }}
        onDeleteClick={() =>
          openDialog('deleteDialog', {
            title: `Delete folder`,
            message: `Are you sure to delete ${item.misFolderName}`,
            confirmAction: () => {
              DeleteFolder.mutate({ id: item.misFolderId });
            },
          })
        }
        onRenameClick={(name) =>
          UpdateFolder.mutate({
            id: item.misFolderId,
            name: name ?? '',
          })
        }
      >
        {Array.isArray(item.children) && renderTree(item.children, level + 1)}
      </FolderItem>
    ));
  };

  const { data } = useQuery('Folder Browser', async () => {
    const { data: response } = await client.folderService.getFolderList();
    return response;
  });
  const folderTree = useMemo(() => {
    const result = data
      ? list_to_tree(
          data.map((item) => ({ ...item, name: item.misFolderName })),
          'misFolderParentId',
          'misFolderId'
        )
      : [];
    client.folderService.getDefaultFolder().then((result) => {
      const defaultFolder = result.data;
      if (defaultFolder) {
        //如果目前的folderlist中包含defaultFolder
        if (data?.filter((f) => f.misFolderId == defaultFolder.misFolderId)?.length ?? 0 > 0) {
          //设置选中
          updateSelect(defaultFolder.misFolderId);
          //fn -> 找到父级id
          const findParentId = (id: string) => {
            return data?.filter((f) => f.misFolderId == id)?.[0].misFolderParentId;
          };
          var parentId: string | undefined = defaultFolder.misFolderParentId;
          while (parentId) {
            //展开所有的父级id
            setNodeList([...nodeList, parentId]);
            parentId = findParentId(parentId);
          }
        }
      }
    });
    return result;
  }, [data]);

  return (
    <TreeView
      defaultExpandIcon={<BsChevronRight />}
      defaultCollapseIcon={<BsChevronDown />}
      expanded={nodeList}
      onNodeToggle={(evt, ids) => setNodeList(ids)}
      className={styles.folderTree}
      selected={currId}
      onNodeSelect={async (evt: any, id: string) => {
        updateSelect(id);
        setCurrId(id);
        updateWidgets({
          Permission: { id, isFolder: true },
          'Record Creation': { id },
          'Search Form': { folderId: id },
          'Record List': { id },
          Properties: {
            id,
            name: data?.find((item) => item.misFolderId === id)?.misFolderName ?? '',
          },
          'Data Import': {
            id,
          },
          'Data Export': {
            folderId: id,
          },
        });
      }}
    >
      <TreeView
        defaultExpandIcon={<BsChevronRight />}
        defaultCollapseIcon={<BsChevronDown />}
        expanded={nodeList}
        onNodeToggle={(evt, ids) => setNodeList(ids)}
        sx={{
          height: '100%',
          flexGrow: 1,
          overflowY: 'auto',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '12px',
        }}
        onNodeSelect={async (evt: any, id: string) => {
          console.log(evt);
          // if (currId !== id) {
          setCurrId(id);
          updateWidgets({
            Permission: { id, isFolder: true },
            'Record Creation': { id },
            'Record List': { id },
            Properties: {
              id,
              name: data?.find((item) => item.misFolderId === id)?.misFolderName ?? '',
            },
            'Data Import': {
              id,
            },
            'Data Export': {
              folderId: id,
            },

            'Content Creation': { id },
            autolinkfun: {
              id,
              folderName: data?.find((item) => item.misFolderId === id)?.misFolderName ?? '',
            },
          });
        }}
      >
        {renderTree(folderTree, 0)}
      </TreeView>
    </TreeView>
  );
};

export default FolderBrowser;

interface folderLists extends FolderTree {
  children?: FolderTree[];
}
