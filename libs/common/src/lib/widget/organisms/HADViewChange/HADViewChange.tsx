import type {
  ActivityOptionData,
  ApproveTaskInput,
  DelegateTaskInput,
  GetTableData,
  ProcessData,
  ProcessDetail,
  QfColumns,
  QfConditions,
  QueryFormDetailCrossRef,
} from '../../../api';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { DefaultFolderId } from '../../../constant';
import { useApi, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import btnStyle from '../../../style/btnStyle';
import icon from '../../../style/icon/iconHandler';
import { WidgetProps } from '../../type';
import { yupResolver } from '@hookform/resolvers/yup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  Badge,
  Chip,
  ToggleButtonGroup,
  Typography,
  DialogTitle,
} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import { GridLinkOperator } from '@mui/x-data-grid';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { SortModel } from 'libs/common/src/lib/api/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

const HADViewChange = () => {
  const client = useApi();
  // const store = useRecoilValue(dataStore);
  const { data, updateWidget, updateWidgets, config } = useWidget<
    {
      workflowId: string;
      workflowStatus: string;
    },
    RecordListProps
  >('HAD View Change');
  const { openOverlay } = useOverlay();
  const queryClient = useQueryClient();
  const [workflowId, setWorkflowId] = useState<string>('');
  const [workflowActivityId, setWorkflowActivityId] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('');
  const [perId, setPerId] = useState('');
  const [toPerId, setToPerId] = useState('');
  const [position, setPosition] = useState('');
  const [userList, setUserList] = useState<User[]>([]);
  const [typeId, setTypeId] = useState<string>('');
  const [tab, setTab] = useState<number>(0);
  const [recordId, setRecordId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchRecordInput, setSearchRecordInput] = useState<string>('');
  const [propertyId, setPropertyId] = useState<string>('');
  const open = Boolean(anchorEl);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
  });

  useQuery(
    'showRecordId',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'showRecordId',
      });
      return response;
    },

    {
      enabled: true,
      onSuccess: (data) => {
        setColumnVisibilityModel({
          id: data?.misSysConfigValue === 'true' ? true : false,
        });
      },
    }
  );
  useQuery(
    ['defaultTableId', config.misWidgetId],
    async () => {
      const { data: searchResponse } = await client.widget.getWidgetById({
        id: config.misWidgetId ?? '',
      });
      return searchResponse;
    },
    {
      onSuccess: (result) => {
        console.log("result===", result)
        if (null != result) {
          if (null != result.misWidgetConfig) {

            var obj = JSON.parse(result.misWidgetConfig);
            console.log("result obj===", obj.propertyId)
            setPropertyId(obj.propertyId as string);
          }
        }
      },
    }
  );

  const editTableRef = useRef([{}]);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  useEffect(() => {
    setWorkflowStatus(data?.workflowStatus);
  }, [data?.workflowStatus]);
  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setUserList(userData.map((item) => ({ ...item, checked: false })));
  };

  const approveTask = useMutation((data: ApproveTaskInput) => client.myInbox.approveTask(data), {
    onSuccess: () => {
      setWorkflowId('');
      setWorkflowActivityId('');
      setPerId('');
      setToPerId('');
      setApproveComment('');
      setWorkflowStatus('');
      updateWidgets({
        'HAD View Change': {
          workflowId: '',
        },
      });
      queryClient.invalidateQueries('Workflow Tree View');
      queryClient.invalidateQueries('HAD Record List');
      queryClient.invalidateQueries('HAD View Change');
    },
  });
  const delegateTask = useMutation((data: DelegateTaskInput) => client.myInbox.delegateTask(data), {
    onSuccess: () => {
      setWorkflowId('');
      setWorkflowActivityId('');
      setPerId('');
      setToPerId('');
      setApproveComment('');
      setWorkflowStatus('');
      updateWidgets({
        'HAD View Change': {
          workflowId: '',
        },
      });
      queryClient.invalidateQueries('Workflow Tree View');
      queryClient.invalidateQueries('HAD Record List');
      queryClient.invalidateQueries('HAD View Change');
    },
  });

  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const [dataGridSortModel, setDataGridSortModel] = useState<GridSortItem[]>([]);

  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(
      newSortModel.map((item) => ({
        field: item.field || '',
        sort: item.sort || '',
      }))
    );
    setDataGridSortModel(newSortModel);
  }, []);
  // getHADViewChang
  const { data: simpleSearch, isLoading: isSimpleSearchLoading } = useQuery(
    ['HAD View Change', data?.workflowId, sortModel, page, pageSize],
    async () => {
      const { data: simpleSearchResponse } = await client.simpleSearch.getHADViewChange({
        nodeId: data?.workflowId ?? '',
        sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return simpleSearchResponse;
    },
    {
      enabled: !!data?.workflowId,
      onSuccess: (data) => {
        setWorkflowId(data.workflowId);
        setWorkflowActivityId(data.workflowActivityId);
        setPerId(data.userId);
        setPosition(data.position);
        setTypeId(data.typeId);
        setRecordId(data.recordId);
        for (let u of userList) {
          if (u.id === data.userId) {
            u.checked = true;
          }
        }
        // updateTab(1);
        // updateWidget('Data Export', { misQfTableId: data?.searchParams?.typeId });
      },
    }
  );

  const simpleSearchColumns: GridColDef[] = useMemo(
    () =>
      simpleSearch?.columnList
        ? simpleSearch?.columnList.map(
          (item) =>
            item && {
              field: item?.misColumnName ?? item?.misColumnLabel,
              headerName: item?.misColumnLabel,
              valueFormatter: ({ value }) =>
                item.misColumnType === '4'
                  ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                  : value,
              flex: item?.misColumnWidth,
              minWidth: 120,
            }
        )
        : [],
    [simpleSearch?.columnList]
  );

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {simpleSearchColumns.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
  );

  const simpleSearchRows = useMemo(
    () =>
      simpleSearch?.recordList
        ? simpleSearch?.recordList.map((item) => {
          return item
            .filter((item, index, arr) => index !== arr.length)
            .reduce(
              (prev, nex, index, arr) => ({ ...prev, [simpleSearchColumns[index].field]: nex }),
              {
                id: item[0],
              }
            );
        })
        : [],
    [simpleSearchColumns, simpleSearch?.recordList]
  );

  const [rowCount, setRowCount] = useState(0);
  useEffect(() => {
    setRowCount((prevRowCount) =>
      simpleSearch?.total !== undefined ? simpleSearch?.total : prevRowCount
    );
  }, [simpleSearch?.total, setRowCount]);

  const updateTab = (tab: number) => {
    updateWidget('Record List', { tab });
    setTab(tab);
  };

  useEffect(() => {
    client.folderService.getDefaultFolder().then((res) => {
      const defaultFolder = res.data;
      console.log(defaultFolder);
      if (defaultFolder) {
        updateWidget('Record List', { id: defaultFolder.misFolderId });
      }
    });
  }, []);

  const actionHandler = ({
    key,
    type,
    configId,
  }: {
    key: availableBtn;
    type?: 'SIDEBAR' | 'DIALOG';
    configId?: string;
  }) => {
    console.log(key);
    switch (key) {
      case 'SEARCH':
        return openOverlay({
          key: 'Search Form',
          type: type || 'SIDEBAR',
          data: { id: data?.workflowId },
          configId,
        });
      case 'Create':
        return openOverlay({
          key: 'Record Creation',
          type: type || 'DIALOG',
          data: {
            id: data?.workflowId,
            tableId: data?.workflowId,
          },
          configId,
        });
      case 'EXPORT':
        return openOverlay({ key: 'Data Export', type: type || 'DIALOG', configId });
    }
  };

  const handleApprove = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    if (toPerId !== '' && toPerId !== undefined) {
      approveTask.mutate({
        workflowId: workflowId,
        workflowActivityId: workflowActivityId,
        userId: perId,
        toUserId: toPerId,
        approveDate: aDate,
        comment: approveComment,
      });
    } else {
      approveTask.mutate({
        workflowId: workflowId,
        workflowActivityId: workflowActivityId,
        userId: perId,
        approveDate: aDate,
        comment: approveComment,
      });
    }
  };
  const handleDelegate = () => {
    const aDate = DateTime.fromMillis(new Date().getTime()).toFormat('dd-MM-yyyy hh:mm:ss');
    delegateTask.mutate({
      workflowId: workflowId,
      workflowActivityId: workflowActivityId,
      fromUserId: perId,
      toUserId: toPerId,
      delegateDate: aDate,
      comment: approveComment,
    });
  };

  return (
    <>
      <Paper
        sx={{
          minHeight: '100%',
          padding: 2,
          marginTop: 1,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {/* <Button
          {...btnStyle.primary}
          sx={{ ...btnStyle.primary.sx, marginBottom: '20px' }}
          startIcon={<SearchIcon />}
          onClick={() => {
            openOverlay({ key: 'Search Form', type: 'SIDEBAR', data: { folderId } });
          }}
        >
          Search
        </Button> */}
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 3,
            flexWrap: 'wrap',
            marginTop: config?.config?.btn?.main ? 1 : 0,
            gap: 2,
          }}
        >
          <Box
            sx={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center' }}
          ></Box>
          <Box>
            {config?.config?.btn?.right &&
              config.config.btn.right.slice(0, 2).map((item, index) => (
                <Button
                  {...btnStyle[item.theme]}
                  startIcon={icon[item.name as keyof typeof icon]}
                  onClick={() => {
                    actionHandler({ key: item.name as availableBtn, configId: item.configId });
                  }}
                >
                  {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                </Button>
              ))}
            {config?.config?.btn?.right && config?.config?.btn?.right.length > 3 && (
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {config.config.btn.right.slice(2).map((item, index) => (
                  <MenuItem
                    key={item.configId}
                    onClick={() => {
                      actionHandler({ key: item.name as availableBtn, configId: item.configId });
                      handleClose();
                    }}
                  >
                    {icon[item.name as keyof typeof icon]}
                    {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
        </Box> */}
        <DataGrid
          filterModel={{
            items: [],
            quickFilterValues: searchRecordInput.split(','),
            quickFilterLogicOperator: GridLinkOperator.Or,
          }}
          components={{
            NoRowsOverlay: DataNotFound,
          }}
          autoHeight={true}
          getRowHeight={() => 'auto'}
          sx={{
            backgroundColor: 'white',
            border: 'none',
            ['.MuiDataGrid-columnHeaders']: {
              backgroundColor: '#EDEDEB',
            },
            ['.MuiButtonBase-root.Mui-checked']: {
              color: '#8C8C8C',
            },
            ['.MuiDataGrid-cell']: {
              border: 'none',
              minHeight: '52px!important',
            },
            ['.MuiDataGrid-row.Mui-selected']: {
              backgroundColor: '#eaeaea',
              [':hover']: {
                backgroundColor: '#eaeaea',
              },
            },
          }}
          loading={isSimpleSearchLoading}
          columns={simpleSearchColumns}
          rows={simpleSearchRows}
          rowCount={rowCount}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          // checkboxSelection
          onSelectionModelChange={(item) => {
            setRecordId(item.join(','));
          }}
          onRowClick={(param) => {
            // updateWidgets({
            //   Properties: {
            //     // ...store['Properties'],
            //     typeId: simpleSearch?.tableId,
            //     recordId: param.row.id,
            //   },
            // });
            // openOverlay({
            //   key: 'Properties',
            //   type: 'SIDEBAR',
            //   data: {
            //     typeId: simpleSearch?.tableId,
            //     recordId: param.row.id,
            //   },
            // });
          }}
          pageSize={pageSize}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          sortModel={dataGridSortModel}
        />
        <Stack direction="row" spacing={2} mb={3} mt={3}>
          {workflowStatus !== '' ? (
            <>
              <Button
                // disableElevation
                disabled={workflowActivityId === ''}
                variant="contained"
                onClick={() => {
                  setIsDistributeDialogOpen(true);
                }}
              >
                {'Distribute'}
              </Button>
              <Button
                // disableElevation
                disabled={workflowActivityId === ''}
                variant="contained"
                onClick={() => {
                  setIsApproveDialogOpen(true);
                }}
              >
                {workflowStatus === 'a2' ? 'Submit' : 'Approve'}
              </Button>
              <Button
                // disableElevation
                disabled={workflowActivityId === ''}
                variant="contained"
                onClick={() => {
                  updateWidgets({
                    Properties: {
                      typeId: typeId,
                      recordId: recordId,
                      propertyId: propertyId,
                      isDraft: 'yes',
                    },
                  });
                  openOverlay({
                    key: 'Properties',
                    type: 'SIDEBAR',
                    data: {
                      typeId: typeId,
                      recordId: recordId,
                      propertyId: propertyId,
                      isDraft: 'yes',
                    },
                  });
                }}
              >
                {'Detail'}
              </Button>
            </>
          ) : (
            <></>
          )}
        </Stack>
        {/* <CustomFooter /> */}
      </Paper>
      <Dialog open={isApproveDialogOpen}>
        <DialogTitle>{workflowStatus === 'a2' ? 'Confirm Verify' : 'Confirm Approve'}</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            paddingTop: 3,
          }}
        >
          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <Typography color="text.primary" variant="h6">
              {workflowStatus === 'a2'
                ? 'Confirm to verify this record?'
                : 'Confirm to approve this record?'}
            </Typography>
          </Stack>
          {position !== 'last' ? (
            <Stack direction="row" spacing={6} mb={3} mt={3}>
              <FormControl variant="standard" sx={{ width: 200 }}>
                <InputLabel id="demo-simple-select-standard-label">To User</InputLabel>
                <Select
                  displayEmpty
                  labelId="toUserId"
                  id="toUserId"
                  onChange={(evt) => setToPerId(evt.target.value as string)}
                >
                  {userList?.map((item) => {
                    return (
                      <MenuItem key={item.id} value={item.id} disabled={item.checked}>
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <></>
          )}
          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <TextField
              id="approveComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={3}
              defaultValue=""
              onChange={(evt) => setApproveComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleApprove();
              setIsApproveDialogOpen(false);
            }}
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setToPerId('');
              setApproveComment('');
              setIsApproveDialogOpen(false);
            }}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDistributeDialogOpen}>
        <DialogTitle>Distribute</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            paddingTop: 3,
          }}
        >
          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <Typography color="text.primary" variant="h6">
              Please to distribute
            </Typography>
          </Stack>
          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <FormControl variant="standard" sx={{ width: 200 }}>
              <InputLabel id="demo-simple-select-standard-label">Distribute To</InputLabel>
              <Select
                displayEmpty
                labelId="toUserId"
                id="toUserId"
                onChange={(evt) => setToPerId(evt.target.value as string)}
              >
                {userList?.map((item) => {
                  return (
                    <MenuItem key={item.id} value={item.id} disabled={item.checked}>
                      {item.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={6} mb={3} mt={3}>
            <TextField
              id="approveComment"
              label="Comment"
              sx={{ width: '600px' }}
              multiline
              rows={3}
              defaultValue=""
              onChange={(evt) => setApproveComment(evt.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              handleDelegate();
              setIsDistributeDialogOpen(false);
            }}
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setToPerId('');
              setApproveComment('');
              setIsDistributeDialogOpen(false);
            }}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HADViewChange;
export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

export type RecordListProps = {
  row: {
    click: {
      showOverlay: boolean;
    };
  };
  default: {
    folderId: string;
  };
} & WidgetProps<btnProps>;

type btnProps = {
  name: availableBtn;
  configId: string;
  theme: btnTheme;
};

type availableBtn = 'SEARCH' | 'Create' | 'EXPORT';

type btnTheme = 'primary' | 'secondary' | 'danger';

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
