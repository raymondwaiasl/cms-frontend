import { FolderTree } from '../../api';
import { useApi, useDialog, useWidget } from '../../hooks';
import { list_to_tree } from '../../utils/functions';
import FolderSelector from './FolderSelector';
import IconSelector from './IconSelector';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  SvgIconProps,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { ElementType, FC, useEffect, useMemo, useState } from 'react';
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
} from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const levelIcon: { [key: string]: ElementType<SvgIconProps> } = {
  '3': HiUserGroup,
  '4': FiUser,
};

const level: { [key: string]: 'ORGANIZATION' | 'ROLE' | 'GROUP' | 'USER' } = {
  root: 'ORGANIZATION',
  '2': 'ROLE',
  '3': 'GROUP',
  '4': 'USER',
};

const RoleManagementDialog: FC = () => {
  const client = useApi();
  const queryClient = useQueryClient();
  const { updateWidget } = useWidget();
  const { isOpen, closeCurrentDialog, data } = useDialog<{
    name?: string;
    id: string;
    isAdministrator?: string;
    defaultFolderId?: string;
    isOrgnanization?: boolean;
    nodeId: string;
    level: 'root' | '2' | '3' | '4';
  }>('roleMgmt');
  console.log(data);
  const materialTheme = useTheme();
  const fullScreen = useMediaQuery(materialTheme.breakpoints.down('sm'));

  const [groupName, setGroupName] = useState('');
  const [initialGroupName, setInitialGroupName] = useState('');
  const [isAdmin, setIsAdmin] = useState('N');
  const [defaultFolderId, setDefaultFolderId] = useState('');
  const [defaultFolderPath, setDefaultFolderPath] = useState('');
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const [includeList, setIncludeList] = useState<Role[]>([]);
  const [initialIncludeList, setInitialIncludeList] = useState<Role[]>([]);
  const [initialExcludeList, setInitialExcludeList] = useState<Role[]>([]);
  console.log(data);
  const reset = () => {
    setIncludeList(initialIncludeList);
    setExcludeList(initialExcludeList);
    setGroupName(initialGroupName);
    setIsAdmin(data?.isAdministrator ?? 'N');
    const path = findNodePath('0015000000000584', folderTree);
    console.log('path====================', path);
    setDefaultFolderPath(path);
  };
  const updateRole = useMutation(client.userService.updateMemberByRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
      closeActionHandling();
    },
  });
  const AddRole = useMutation(client.userPermission.insertMemberByRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
      closeActionHandling();
    },
  });
  const AddGroup = useMutation(client.userPermission.insertMemberByGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
      closeActionHandling();
    },
  });
  const updateGroup = useMutation(client.userService.updateMemberByGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('Org Chart');
      queryClient.invalidateQueries('Member');
      closeActionHandling();
    },
  });
  const closeActionHandling = () => {
    reset();
    closeCurrentDialog();
  };
  const queryData = useQuery(
    ['include', data?.id],
    async () => {
      const { data: userData } = await client.userService.getMemberInfoByGroup({
        id: data?.id ?? '',
      });
      return userData;
    },
    {
      onSuccess: (data) => {
        setInitialIncludeList(data.includeUsers.map((item) => ({ ...item, checked: false })));
        setIncludeList(data.includeUsers.map((item) => ({ ...item, checked: false })));
        setExcludeList(data.excludeUsers.map((item) => ({ ...item, checked: false })));
        setInitialExcludeList(data.excludeUsers.map((item) => ({ ...item, checked: false })));
      },
    }
  );
  useEffect(() => {
    console.log(data);
    if (data?.name) {
      setGroupName(data.name);
      setInitialGroupName(data.name);
      setIsAdmin(data?.isAdministrator ?? 'N');
      setDefaultFolderId(data?.defaultFolderId ?? '');
      const path = findNodePath(data?.defaultFolderId ?? '', folderTree);
      console.log('path====================', path);
      setDefaultFolderPath(path);
    }
  }, [data]);

  const { data: folderData } = useQuery(
    'folderData',
    async () => {
      const { data: response } = await client.folderService.getFolderList();
      return response;
    },
    {
      initialData: queryClient.getQueryData('folderData'),
    }
  );
  const folderTree = useMemo(
    () =>
      folderData
        ? list_to_tree(
            folderData.map((item) => ({ ...item, name: item.misFolderName })),
            'misFolderParentId',
            'misFolderId'
          )
        : [],
    [folderData]
  );

  const handleFolderChange = (value: string, path: string) => {
    console.log('handleFolderChange-value===', value);
    console.log('handleFolderChange-path===', path);
    setDefaultFolderId(value);
    setDefaultFolderPath(path);
  };

  const handleCloseChange = () => {
    console.log('===handleCloseChange===');
  };

  const handleSelectChange = (icon: string) => {
    console.log('===handleSelectChange===', icon);
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

  return (
    <Dialog
      open={isOpen}
      onClose={closeActionHandling}
      fullWidth
      // {...props}
      PaperProps={{
        sx: {
          padding: '40px',
          borderRadius: '20px',
          minWidth: '680px',
          maxWidth: '800px',
          overflowX: 'auto',
        },
      }}
    >
      {/* <DialogTitle id="scroll-dialog-title">
        {data?.isOrgnanization ? 'Role' : 'Group'} {data?.id ? 'Management' : 'Addition'}
      </DialogTitle> */}

      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: '700' }}>
          {data?.isOrgnanization ? 'Role' : 'Group'} {data?.id ? 'Management' : 'Addition'}
        </Typography>
        <IconButton onClick={() => closeCurrentDialog()}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={`${data?.isOrgnanization ? 'Role' : 'Group'} Name`}
          variant="filled"
          size="small"
          value={groupName}
          onChange={(evt) => setGroupName(evt.target.value)}
          sx={{ marginBottom: (theme) => theme.spacing(2) }}
        />
        <FormControl
          variant="standard"
          sx={{
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'row',
            marginY: 2,
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1">Default Icon: </Typography>
          <IconSelector onSelect={handleSelectChange} />
        </FormControl>
        <FormControl
          variant="standard"
          sx={{
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'row',
            marginY: 2,
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1">Default Folder：</Typography>
          <FolderSelector
            folderTree={folderTree}
            value={defaultFolderPath}
            defaultNodeId={defaultFolderId}
            onChange={handleFolderChange}
          />
        </FormControl>

        <FormControl
          variant="standard"
          sx={{
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'row',
            marginY: 2,
          }}
        >
          <Typography variant="subtitle1">Administrator：</Typography>
          <FormControlLabel
            checked={isAdmin === 'Y'}
            onChange={() => {
              if (isAdmin === 'Y') {
                setIsAdmin('N');
              } else {
                setIsAdmin('Y');
              }
            }}
            control={<Checkbox />}
            label={isAdmin === 'Y' ? 'Yes' : 'No'}
            labelPlacement="end"
            sx={{ marginY: -1 }}
          />
        </FormControl>
        <Grid container justifyContent="center" sx={{ width: '100%' }} wrap="nowrap">
          <Grid item sx={{ height: 'auto', width: '100%' }}>
            <Paper
              sx={{
                padding: (theme) => theme.spacing(2),
                height: '100%',
                minWidth: '100px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {excludeList.length > 0 &&
                excludeList.map((listItem, index) => (
                  <FormControlLabel
                    key={listItem.id}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 0.5,
                          pr: 0,
                        }}
                      >
                        <Box
                          component={levelIcon[listItem.type ?? 'user']}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                          {listItem.name}
                        </Typography>
                      </Box>
                    }
                    control={
                      <Checkbox
                        defaultChecked={listItem.checked}
                        onClick={(event) => {
                          console.log(event);
                          if (listItem.checked) {
                            setExcludeList(() => {
                              excludeList[index] = {
                                ...excludeList[index],
                                checked: false,
                              };
                              return excludeList;
                            });
                          } else {
                            setExcludeList(() => {
                              excludeList[index] = {
                                ...excludeList[index],
                                checked: true,
                              };
                              return excludeList;
                            });
                          }
                        }}
                      />
                    }
                  />
                ))}
            </Paper>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="column"
              sx={{
                padding: (theme) => theme.spacing(2),
                gap: (theme) => theme.spacing(2),
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setExcludeList((current) => [
                    ...current,
                    ...includeList.map((listItem) => ({
                      id: listItem.id,
                      name: listItem.name,
                      type: listItem.type,
                    })),
                  ]);
                  setIncludeList([]);
                }}
              >
                <BsChevronDoubleLeft />
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const excludeSelectionList = includeList
                    .filter((listItem) => listItem.checked)
                    .map((listItem) => ({
                      ...listItem,
                      checked: false,
                    }));
                  setIncludeList(
                    includeList
                      .filter((listItem) => !listItem.checked)
                      .map((listItem) => ({
                        ...listItem,
                        checked: false,
                      }))
                  );
                  setExcludeList((curr) => [...curr, ...excludeSelectionList]);
                }}
              >
                <BsChevronLeft />
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const includeSelectionList = excludeList
                    .filter((listItem) => listItem.checked)
                    .map((listItem) => ({
                      ...listItem,
                      checked: false,
                    }));
                  setExcludeList(
                    excludeList
                      .filter((listItem) => !listItem.checked)
                      .map((listItem) => ({
                        ...listItem,
                        checked: false,
                      }))
                  );
                  setIncludeList((curr) => [...curr, ...includeSelectionList]);
                }}
              >
                <BsChevronRight />
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIncludeList((curr) => [
                    ...curr,
                    ...excludeList.map((listItem) => ({
                      ...listItem,
                      checked: false,
                    })),
                  ]);
                  setExcludeList([]);
                }}
              >
                <BsChevronDoubleRight />
              </Button>
            </Grid>
          </Grid>
          <Grid item sx={{ height: 'auto', width: '100%' }}>
            <Paper
              sx={{
                padding: (theme) => theme.spacing(2),
                height: '100%',
                minWidth: '100px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {!!includeList.length &&
                includeList.map((listItem, index) => (
                  <FormControlLabel
                    key={listItem.id}
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 0.5,
                          pr: 0,
                        }}
                      >
                        <Box
                          component={levelIcon[listItem.type ?? 'user']}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                          {listItem.name}
                        </Typography>
                      </Box>
                    }
                    control={
                      <Checkbox
                        defaultChecked={listItem.checked}
                        onClick={(event) => {
                          if (listItem.checked) {
                            setIncludeList(() => {
                              includeList[index] = {
                                ...includeList[index],
                                checked: false,
                              };
                              return includeList;
                            });
                          } else {
                            setIncludeList(() => {
                              includeList[index] = {
                                ...includeList[index],
                                checked: true,
                              };
                              return includeList;
                            });
                          }
                        }}
                      />
                    }
                  />
                ))}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          disableElevation
          variant="contained"
          onClick={() => {
            if (data?.id) {
              if (data?.isOrgnanization) {
                updateRole.mutate({
                  roleId: data.id,
                  memberIds: includeList.map((item) => item.id).toString(),
                  roleName: groupName,
                });
              }
              if (!data?.isOrgnanization) {
                updateGroup.mutate({
                  memberIds: includeList.map((item) => item.id).toString(),
                  groupId: data?.id ?? '',
                  groupName: groupName,
                  isAdmin: isAdmin,
                  defaultFolderId: defaultFolderId,
                });
              }
            }
            if (!data?.id) {
              if (data?.isOrgnanization) {
                AddRole.mutate({
                  memberIds: includeList.map((item) => item.id).toString(),
                  roleName: groupName,
                });
              }
              if (!data?.isOrgnanization) {
                AddGroup.mutate({
                  memberIds: includeList.map((item) => item.id).toString(),
                  groupName: groupName,
                  isAdmin: isAdmin,
                  defaultFolderId: defaultFolderId,
                  nodeId: data?.nodeId ?? '',
                  level: data?.level ?? '',
                });
              }
            }
            closeActionHandling();
          }}
          startIcon={<FaSave />}
        >
          Save
        </Button>
        <Button onClick={closeActionHandling}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleManagementDialog;

export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

export type confirmProps = {
  excludeList: Role[];
  includeList: Role[];
  groupName: string;
};

interface folderLists extends FolderTree {
  children?: FolderTree[];
}
