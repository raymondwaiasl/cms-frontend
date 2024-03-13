import type {
  ActivityOptionData,
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
  List,
  ListItem,
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
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import { GridLinkOperator } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { SortModel } from 'libs/common/src/lib/api/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Item from '../TaskDetail/ItemComponent';

const schema = yup.object().shape({
  //wfProcessName: yup.string().required('This Field is required'),
  processActivities: yup.array().of(
    yup.object().shape({
      wfProcessActivitiesActivity1Id: yup.string().required('This Field is required'),
      wfProcessActivitiesActivity2Id: yup.string().required('This Field is required'),
    })
  ),
});
const Publication = () => {
  const client = useApi();
  const { data, updateWidgets, config } = useWidget<
    {
      id: string;
      nodeId: string;
      simpleSearchParams?: { simpleSearchId: string; searchConditons: string };
      tab: number;
      filterKeyword: string;
    },
    RecordListProps
  >('Publication');
  const [AutoResult, setAutoResult] = useState<string>('');
  const [ManualResult, setManualResult] = useState<string>('');
  const { openOverlay } = useOverlay();
  const [typeId, setTypeId] = useState<string>('');
  const [tab, setTab] = useState<number>(0);
  const [folderId, setFolderId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchRecordInput, setSearchRecordInput] = useState<string>('');
  const open = Boolean(anchorEl);
  const disolveSwitch = useRef(false);
  const demolishSwitch = useRef(false);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [PublicationDialogOpen, setPublicationDialogOpen] = useState(false);
  const [RemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [processDate, setProcessDate] = useState<string>('');
  const [processContent, setProcessContent] = useState<string>('');
  const bulidProcessId = useRef('DemolishCreateProcess');
  const editProcessId = useRef('');
  const toUserId = useRef('');
  const [processDetail, setProcessDetail] = useState<ProcessDetail>();
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const [personIdList, setPersonIdList] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false,
  });
  useEffect(() => {
    if (data.tab) {
      setTab(data.tab);
    }
  }, [data.tab]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
    defaultValues: {
      wfProcessId: processDetail?.wfProcessId,
      wfProcessName: processDetail?.wfProcessName,
      wfProcessHasNotification: processDetail?.wfProcessHasNotification,
      wfProcessNotificationSubject: processDetail?.wfProcessNotificationSubject,
      wfProcessNotificationContent: processDetail?.wfProcessNotificationContent,
      wfProcessCompletionStratedge: processDetail?.wfProcessCompletionStratedge,
      processActivities: processDetail?.processActivities,
      performerUser: personIdList,
      supervisor: '',
      toUserId: '',
      processDate: DateTime.now().toFormat('yyyy-MM-dd'),
    },
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
  const handleClose = () => {
    setAnchorEl(null);
  };
  const updateTypeRecord = useMutation(client.recordManage.updateTypeRecord, {
    onSuccess: () => { },
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
  useEffect(() => {
    getUserList();
    setTab(0);
    client.folderService.getDefaultFolder().then((res) => {
      const defaultFolder = res.data.misFolderId;
      if (defaultFolder) {
        setFolderId(defaultFolder);
      }
    });
  }, []);

  const { data: tableColumn, isLoading,refetch } = useQuery(
    ['Record table', folderId, typeId, sortModel, page, pageSize, tab],
    async () => {
      const { data: tableResponse } = await client.recordService.getQueryRecordList({
        typeId: '',
        folderId: '',
        widgetId: config.misWidgetId,
        sortModel: sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return tableResponse;
    },
    {
      onSuccess: () => { },
    }
  );
  const { data: searchResponse } = useQuery(
    ['defaultTableId', config.misWidgetId],
    async () => {
      const { data: searchResponse } = await client.widget.getWidgetById({
        id: config.misWidgetId ?? '',
      });
      return searchResponse;
    },
    {
      onSuccess: (result) => {
        if (null != result) {
          if (null != result.misWidgetConfig) {
            var obj = JSON.parse(result.misWidgetConfig);
            if (obj.btn.right) {
              for (let i = 0; i < obj.btn.right.length; i++) {
                if ('Create' == obj.btn.right[i].name) {
                  setTypeId(obj.btn.right[i].misDefaultTableId);
                }
                if (obj.btn.right[i].detail) {
                  if (
                    obj.btn.right[i].detail.toLowerCase().indexOf('building_organization') != -1
                  ) {
                    disolveSwitch.current = true;
                    demolishSwitch.current = false;
                  } else if (
                    obj.btn.right[i].detail.toLowerCase().indexOf('building_record') != -1
                  ) {
                    demolishSwitch.current = true;
                    disolveSwitch.current = false;
                  } else {
                    disolveSwitch.current = false;
                    demolishSwitch.current = false;
                  }
                }
              }
            }
          }
        }
      },
    }
  );


  const initWorkflow = useMutation(client.workflow.initWorkflow, {
    onSuccess: (data) => {
      if ((data.status = 200)) {
        submitWorkflow.mutate({
          comment: processContent,
          workflowId: data.data,
          userId: toUserId.current,
          submissionDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
        });
      }
    },
  });
  const submitWorkflow = useMutation(client.workflow.submitWorkflow, {
    onSuccess: (data) => { },
  });
  const columns: GridColDef[] = useMemo(
    () =>
      tableColumn?.columnList.map(
        (item) =>
          item && {
            field: item?.misColumnName ?? item?.misColumnLabel,
            headerName: item?.misColumnLabel,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
            flex: 2,
            minWidth: 120,
          }
      ) ?? [],
    [tableColumn?.columnList]
  );
  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {columns.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
  );

  const rows = useMemo(
    () =>
      tableColumn?.recordList.map((item) => {
        return item
          .filter((item, index, arr) => index !== arr.length)
          .reduce((prev, nex, index, arr) => ({ ...prev, [columns[index].field]: nex }), {
            id: item[0],
          });
      }) ?? [],
    [columns, tableColumn?.recordList]
  );

  const { data: simpleSearch, isLoading: isSimpleSearchLoading,refetch:refetchSearchResult } = useQuery(
    ['Simple Search', data?.simpleSearchParams, folderId, sortModel, page, pageSize, tab],
    async () => {
      const { data: simpleSearchResponse } = await client.simpleSearch.simpleSearchRecord({
        folderId,
        simpleSearchId: data?.simpleSearchParams?.simpleSearchId ?? '',
        data: data?.simpleSearchParams?.searchConditons ?? '',
        sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return simpleSearchResponse;
    },
    {
      enabled: tab == 2 && !!data?.simpleSearchParams,
      onSuccess: () => { },
    }
  );
  const simpleSearchColumns: GridColDef[] = useMemo(
    () =>
      simpleSearch?.columnList.map(
        (item) =>
          item && {
            field: item?.misColumnName ?? item?.misColumnLabel,
            headerName: item?.misColumnLabel,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
            flex: 2,
            minWidth: 120,
          }
      ) ?? [],
    [simpleSearch?.columnList]
  );
  const simpleSearchRows = useMemo(
    () =>
      simpleSearch?.recordList.map((item) => {
        return item
          .filter((item, index, arr) => index !== arr.length)
          .reduce(
            (prev, nex, index, arr) => ({ ...prev, [simpleSearchColumns[index].field]: nex }),
            {
              id: item[0],
            }
          );
      }) ?? [],
    [simpleSearchColumns, simpleSearch?.recordList]
  );

  const [rowCount, setRowCount] = useState(0);
  useEffect(() => {
    if (tab == 2) {
      setRowCount((prevRowCount) =>
        simpleSearch?.total !== undefined ? simpleSearch?.total : prevRowCount
      );
    } else {
      setRowCount((prevRowCount) =>
        tableColumn?.total !== undefined ? tableColumn?.total : prevRowCount
      );
    }
  }, [tab, tableColumn?.total, simpleSearch?.total, setRowCount]);

  const actionHandler = ({
    key,
    type,
    configId,
    misSimpleSearchId,
    misDefaultTableId,
  }: {
    key: availableBtn;
    type?: 'SIDEBAR' | 'DIALOG';
    configId?: string;
    misSimpleSearchId?: string;
    misDefaultTableId?: string;
  }) => {
    console.log(key);
    console.log('data?.nodeId', data?.nodeId);
    switch (key) {
      case 'SEARCH':
        return openOverlay({
          key: 'Search Form',
          type: type || 'SIDEBAR',
          data: { id: data?.nodeId },
          configId,
        });
      case 'QUICK':
        return openOverlay({
          key: 'Simple Search',
          type: type || 'SIDEBAR',
          data: { misSimpleSearchId: misSimpleSearchId },
          configId,
        });
      case 'BASIC':
        return openOverlay({
          key: 'Simple Search',
          type: type || 'SIDEBAR',
          data: { misSimpleSearchId: misSimpleSearchId },
          configId,
        });
      case 'ADVANCE':
        return openOverlay({
          key: 'Simple Search',
          type: type || 'SIDEBAR',
          data: { misSimpleSearchId: misSimpleSearchId },
          configId,
        });
      case 'Create':
        return openOverlay({
          key: 'Record Creation',
          type: type || 'DIALOG',
          data: {
            id: folderId,
            tableId: misDefaultTableId,
          },
          configId,
        });
      case 'EXPORT':
        return openOverlay({ key: 'Data Export', type: type || 'DIALOG', configId });
    }
  };

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setExcludeList(userData.map((item) => ({ ...item, type: '4', checked: false })));
  };

  const setDisolveAndDmeo = (evt: any) => {
    client.type.selectTypeById({ id: evt }).then((res) => {
      console.log("=====" + res.data);
      if (res.data.misTypeName.toLowerCase().indexOf('building_organization') != -1) {
        disolveSwitch.current = true;
        demolishSwitch.current = false;
      } else if (res.data.misTypeName.toLowerCase().indexOf('building_record') != -1) {
        demolishSwitch.current = true;
        disolveSwitch.current = false;
      } else {
        disolveSwitch.current = false;
        demolishSwitch.current = false;
      }
    })
  };

  const Publication = async(recordId : string) => {
    console.log("Publication");
      const { data } = await client.publication.publicRecord({
        "recordId": recordId
      });
    tab === 2? refetchSearchResult(): refetch();
      
    console.log("now the table not prepared");
    //  return data;
  }

  const Remove = async(recordId : string) => {
    console.log("Remove");
      // const { data } = await client.publication.removeRecord({
      //   "recordId": recordId
      // });
      const { data } = await client.publication.scheduleRecord({
        
      });
      tab === 2? refetchSearchResult(): refetch();
      
    console.log("Remove the record from queue");
    //  return data;
  }

  const getResult = useQuery("JobResult", async()=> await client.publication.publicResult({
   
  })
  ,
  {
    onSuccess: (result) => {
      console.log(result);
      if(  result.data.length > 0){
        if(result.data.length === 2 ){
          if(result.data[0].Recorded_Date > result.data[1].Recorded_Date){
            setAutoResult(result.data[0].Log_Detail);
            setManualResult(result.data[1].Log_Detail);
          }
          else{
            setAutoResult(result.data[1].Log_Detail);
            setManualResult(result.data[1].Log_Detail);
          }
        }else if (result.data.length === 1){
          if(result.data[0].Publication_Type = "Auto"){
            setAutoResult(result.data[0].Log_Detail);
          }else{
            setAutoResult(result.data[1].Log_Detail);
            setManualResult(result.data[1].Log_Detail);
          }
        }
        
      }
      
      
      
    }
  }

  )
  
  return (
    <>
    <Paper
      sx={{
        minHeight: '100%',
        padding: 2,
        marginTop: 2,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >
        <Box
          sx={{
            display: 'grid',
            gap: 0,
            gridTemplateAreas: `"header header header"
            "auto Acontent Acontent"
            "manual Mcontent Mcontent"`,
          }}
        >
          <ListItem sx={{gridArea:'header', bgcolor: '#AAAAAA'}}>Last Publication Execution Summary</ListItem>
          <ListItem sx={{gridArea:'auto', bgcolor: '#BBBBBB'}}>Last Manual/Auto Execution</ListItem>
          <ListItem sx={{gridArea:'Acontent', bgcolor: '#CCCCCC'}}>{AutoResult==""? ManualResult : AutoResult }</ListItem>
          <ListItem sx={{gridArea:'manual', bgcolor: '#BBBBBB'}}>Last Manual Execution</ListItem>
          <ListItem sx={{gridArea:'Mcontent', bgcolor: '#CCCCCC'}}>{ManualResult}</ListItem>

        </Box>
    </Paper>
      <Paper
        sx={{
          minHeight: '100%',
          padding: 2,
          marginTop: 2,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >


        {config?.config?.btn?.main && (
          <Button
            {...btnStyle[config?.config?.btn?.main.theme ?? 'primary']}
            startIcon={icon[config?.config?.btn?.main.name as keyof typeof icon]}
            onClick={() => {
              actionHandler({
                key: config?.config?.btn?.main?.name as availableBtn,
                configId: config?.config?.btn?.main?.configId,
              });
            }}
          >
            {config?.config?.btn?.main.name[0].toUpperCase() +
              config?.config?.btn?.main.name.substring(1).toLowerCase()}
          </Button>
        )}


        <Box
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
              config.config.btn.right.slice(0, 5).map(
                (item, index) =>
                  !item.detail && (
                    <Button
                      {...btnStyle[item.theme]}
                      startIcon={icon[item.name as keyof typeof icon]}
                      onClick={() => {
                        actionHandler({
                          key: item.name as availableBtn,
                          configId: item.configId,
                          misSimpleSearchId: item.misSimpleSearchId ?? '',
                          misDefaultTableId: item.misDefaultTableId ?? '',
                        });
                      }}
                    >
                      {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                    </Button>
                  )
              )}
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
                {config.config.btn.right.slice(2).map(
                  (item, index) =>
                    !item.detail && (
                      <MenuItem
                        key={item.configId}
                        onClick={() => {
                          actionHandler({
                            key: item.name as availableBtn,
                            configId: item.configId,
                            misSimpleSearchId: item.misSimpleSearchId ?? '',
                            misDefaultTableId: item.misDefaultTableId ?? '',
                          });
                          handleClose();
                        }}
                      >
                        {icon[item.name as keyof typeof icon]}
                        {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                      </MenuItem>
                    )
                )}
              </Menu>
            )}
          </Box>
        </Box>


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
          loading={isLoading || isSimpleSearchLoading}
          columns={tab === 2 ? simpleSearchColumns : columns}
          rows={tab === 2 ? simpleSearchRows : rows}
          rowCount={rowCount}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          checkboxSelection
          onSelectionModelChange={(item) => {
            setRecordId(item.join(','));
          }}
          onRowClick={(param) => {
            updateWidgets({
              Properties: {
                typeId: typeId,
                recordId: param.row.id,
              },
            });
            openOverlay({
              key: 'Properties',
              type: 'SIDEBAR',
              data: {
                typeId: typeId,
                recordId: param.row.id,
              },
            });
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


        &nbsp;&nbsp;
        {demolishSwitch.current && (
          <Button
            disableElevation
            {...btnStyle.primary}
            style={{ marginTop: '10px' }}
            onClick={() => {
              setPublicationDialogOpen(true);
            }}
          >
            Immediate Publish 
          </Button>
        )}

        &nbsp;&nbsp;
        {demolishSwitch.current && (
          <Button
            disableElevation
            {...btnStyle.primary}
            style={{ marginTop: '10px' }}
            onClick={() => {
              setRemoveDialogOpen(true);
            }}
          >
            Remove from Queue
          </Button>
        )}

      <Dialog open={RemoveDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                setRemoveDialogOpen(false);
                let records = "'"+ recordId.split(',').join('\',\'') + "'";
                console.log(records);
                Remove(records);
                
                toast.success('Record operation successfully');
              },
              (error) => { }
            )}
          >
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >

            <Stack direction="row" spacing={2} mb={3} mt={3}>
              <p>Confirm to Remove Records? </p>
            </Stack>

          </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                Yes
              </Button>
              <Button
                onClick={() => {
                  setRemoveDialogOpen(false);
                }}
              >
                No
              </Button>
            </DialogActions>
          </form>
        </Dialog>




        <Dialog open={PublicationDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                setPublicationDialogOpen(false);
                let records = "'"+ recordId.split(',').join('\',\'') + "'";
                console.log(records);
                Publication(records);
                
                toast.success('Record operation successfully');
              },
              (error) => { }
            )}
          >
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >

            <Stack direction="row" spacing={2} mb={3} mt={3}>
              <p>Confirm to Synchronize Building Data to Public Website! </p>
            </Stack>

          </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                Yes
              </Button>
              <Button
                onClick={() => {
                  setPublicationDialogOpen(false);
                }}
              >
                No
              </Button>
            </DialogActions>
          </form>
        </Dialog>

      </Paper>
    </>
  );
};

export default Publication;
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
  misSimpleSearchId: string;
  misDefaultTableId: string;
  detail: string;
};

type availableBtn = 'SEARCH' | 'QUICK' | 'BASIC' | 'ADVANCE' | 'Create' | 'EXPORT';

type btnTheme = 'primary' | 'secondary' | 'danger';
