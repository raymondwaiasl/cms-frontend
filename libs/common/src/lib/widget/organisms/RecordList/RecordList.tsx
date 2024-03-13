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
// import styles from './RecordList.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
// import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import dataStore from '../../../store/dataStore';
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
import { DatePicker } from '@mui/x-date-pickers';
import route from 'apps/admin/src/router/route';
import { SortModel } from 'libs/common/src/lib/api/common';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const schema = yup.object().shape({
  //wfProcessName: yup.string().required('This Field is required'),
  processActivities: yup.array().of(
    yup.object().shape({
      wfProcessActivitiesActivity1Id: yup.string().required('This Field is required'),
      wfProcessActivitiesActivity2Id: yup.string().required('This Field is required'),
    })
  ),
});
const RecordList = () => {
  const client = useApi();
  // const store = useRecoilValue(dataStore);
  const history = useHistory();
  const { data, updateWidget, updateWidgets, config } = useWidget<
    {
      id: string;
      searchParams?: {
        qfColumns: QfColumns[];
        typeId: string;
        qfConditions: QfConditions[];
        crossRef: QueryFormDetailCrossRef[];
      };
      simpleSearchParams?: { simpleSearchId: string; searchConditons: string };
      tab: number;
      filterKeyword: string;
    },
    RecordListProps
  >('Record List');
  useEffect(() => {
    console.log(data.filterKeyword);
    setSearchRecordInput(data.filterKeyword ?? '');
  }, [data.filterKeyword]);
  const { openOverlay } = useOverlay();
  const folderId = useMemo(
    () => data?.id || DefaultFolderId,
    [data?.id, DefaultFolderId, config.misDefaultTable]
  );
  useEffect(() => {
    if (config.misDefaultTable) {
      setTypeId(config.misDefaultTable);
      updateWidget('Data Export', { id: config.misDefaultTable });
    }
  }, [config.misDefaultTable]);
  const queryClient = useQueryClient();
  const [typeId, setTypeId] = useState<string>('');
  const [tab, setTab] = useState<number>(0);
  const [recordId, setRecordId] = useState<string>('');
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHadDeleteDialogOpen, setIsHadDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  // const [supervisor, setSupervisor] = useState<string>('');
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const [personIdList, setPersonIdList] = useState<string[]>([]);
  const [processDetail, setProcessDetail] = useState<ProcessDetail>();
  const [activityList, setActivityList] = useState<ActivityOptionData[]>();
  const [activity2List, setActivity2List] = useState<ActivityOptionData[]>();
  const [processNameList, setProcessNameList] = useState<ProcessData[]>([]);
  const [pageSize, setPageSize] = useState(30);
  const [page, setPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchRecordInput, setSearchRecordInput] = useState<string>('');
  const open = Boolean(anchorEl);
  const isDemoAndDiss = useRef('');
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
        console.log(data?.misSysConfigKey + '========' + data?.misSysConfigValue);

        setColumnVisibilityModel({
          id: data?.misSysConfigValue === 'true' ? true : false,
        });
      },
    }
  );

  const [editData, setEditData] = useState([]) as any[];
  const editTableRef = useRef([{}]);
  const [editColumnName, setEditColumnName] = useState([]) as any[];
  const welcomeData = useRef('');
  const [processDate, setProcessDate] = useState<string>('');
  const [processContent, setProcessContent] = useState<string>('');
  const bulidProcessId = useRef('Demolish Process');
  const deleteProcessId = useRef('');
  const toUserId = useRef('');
  const handleClose = () => {
    setAnchorEl(null);
  };
  // const [processId, setProcessId] = useState<string>('');
  console.log(data);
  useEffect(() => {
    if (data.tab) {
      setTab(data.tab);
    }
  }, [data.tab]);
  const [processId, setProcessId] = useState<string>('');

  const [workflowSwitch, setWorkflowSwitch] = useState<boolean>(false);
  const disolveSwitch = useRef(false);
  const demolishSwitch = useRef(true);
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
  const { fields, append, remove } = useFieldArray({
    name: 'processActivities',
    control,
  });
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
  const fetchDataById = async (id: any) => {
    console.log('fetchDataById:' + id);
    //setProcessId(id);
    const { data: response } = await client.workflow.getProcessDetail({ id });
    let userIds: string[] = [];
    for (let p of response.processPeople) {
      userIds.push(p.wfProcessPersonUserId);
    }
    setPersonIdList([...userIds]);
    console.log('response.wfProcessId:' + response.wfProcessId);
    setProcessDetail({
      wfProcessId: response.wfProcessId,
      wfProcessName: response.wfProcessName,
      wfProcessCompletionStratedge: response.wfProcessCompletionStratedge,
      wfProcessHasNotification: response.wfProcessHasNotification,
      wfProcessNotificationSubject: response.wfProcessNotificationSubject,
      wfProcessNotificationContent: response.wfProcessNotificationContent,
      processActivities: response.processActivities,
      processPeople: response.processPeople,
    });
  };
  const getWorkflowSwitch = async () => {
    const { data: response } = await client.sysConfig.getWorkflowSwitch();
    console.log('response===========================' + response);
    setWorkflowSwitch(response);
  };

  useEffect(() => {
    // getActivityListOnPage();
    getWorkflowSwitch();
    getUserList();
    refreshActivity2List();
    if (processDetail) {
      console.log('processDetail:' + processDetail);
      reset({
        wfProcessId: processDetail?.wfProcessId,
        wfProcessName: processDetail?.wfProcessName,
        wfProcessHasNotification: processDetail?.wfProcessHasNotification,
        wfProcessNotificationSubject: processDetail?.wfProcessNotificationSubject,
        wfProcessNotificationContent: processDetail?.wfProcessNotificationContent,
        wfProcessCompletionStratedge: processDetail?.wfProcessCompletionStratedge,
        processActivities: processDetail?.processActivities,
        performerUser: personIdList,
      });
    }
  }, [processDetail]);
  useEffect(() => {
    if (data.searchParams === null) {
      setTab(0);
    }
    if (data.simpleSearchParams != null) {
      setTab(2);
    }
  }, [data.searchParams, data.simpleSearchParams]);
  const getActivityListOnPage = async () => {
    const { data: response } = await client.workflow.getAllActivities({
      pageState: { page: 1, pageSize: 30 },
      sortModel: {
        field: '',
        sort: '',
      },
    });
    let list: ActivityOptionData[] = [];
    let list2: ActivityOptionData[] = [];
    list2.push({
      wfActivityId: 'N',
      wfActivityName: 'Nothing',
      wfActivityType: 'A',
      isDisable: false,
      creatorBy: '',
      creationDate: '',
    });
    list2.push({
      wfActivityId: 'T',
      wfActivityName: 'Terminate',
      wfActivityType: 'A',
      isDisable: false,
      creatorBy: '',
      creationDate: '',
    });
    for (let r of response.data) {
      list.push({
        wfActivityId: r.wfActivityId,
        wfActivityName: r.wfActivityName,
        wfActivityType: r.wfActivityType,
        isDisable: false,
        creatorBy: r.creatorBy,
        creationDate: r.creationDate,
      });
    }
    setActivityList([...list]);
  };
  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setExcludeList(userData.map((item) => ({ ...item, type: '4', checked: false })));
  };
  const refreshActivity2List = () => {
    let list2: ActivityOptionData[] = [];
    list2.push({
      wfActivityId: 'N',
      wfActivityName: 'Nothing',
      wfActivityType: 'A',
      isDisable: false,
      creatorBy: '',
      creationDate: '',
    });
    list2.push({
      wfActivityId: 'T',
      wfActivityName: 'Terminate',
      wfActivityType: 'A',
      isDisable: false,
      creatorBy: '',
      creationDate: '',
    });
    for (let i = 1; i <= 10; i++) {
      list2.push({
        wfActivityId: i + '',
        wfActivityName: 'Step ' + i,
        wfActivityType: 'A',
        isDisable: false,
        creatorBy: '',
        creationDate: '',
      });
    }
    setActivity2List([...list2]);
  };
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
    onSuccess: (data) => {},
  });

  const { data: dictData } = useQuery(
    'dic type',
    async () => {
      const { data: dictResponse } = await client.queryForm.getTypeDic();
      return dictResponse;
    },
    {
      initialData: () => queryClient.getQueryData<GetTableData[]>('dic type'),
      onSuccess: (data) => {
        if (!!data[0]) {
          if (!config.misDefaultTable) {
            updateWidget('Data Export', { id: data[0].key });
            setTypeId(data[0].key);
          }
          updateTab(0);
        }
      },
    }
  );

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
  const { data: tableColumn, isLoading } = useQuery(
    ['Record table', folderId, typeId, sortModel, page, pageSize, tab],
    async () => {
      if (config.misWidgetId) {
        const { data: tableResponse } = await client.recordService.getDefaultRecordList({
          typeId: typeId,
          folderId: folderId,
          widgetId: config.misWidgetId,
          sortModel: sortModel,
          pageState: { page: page, pageSize: pageSize },
        });
        return tableResponse;
      } else {
        const { data: tableResponse } = await client.recordService.getFolderRecordList({
          typeId,
          folderId,
          sortModel,
          pageState: { page: page, pageSize: pageSize },
        });
        return tableResponse;
      }
    },
    {
      enabled: tab == 0 && !!folderId && !!typeId,
      onSuccess: () => {
        setTab(0);
      },
    }
  );
  const { data: searchColumn, isLoading: isSearchLoading } = useQuery(
    ['Search table', data?.searchParams, folderId, typeId, sortModel, page, pageSize, tab],
    async () => {
      const { data: searchResponse } = await client.recordService.searchRecord({
        folderId,
        qfColumns: data?.searchParams?.qfColumns ?? [],
        typeId: data?.searchParams?.typeId ?? '',
        qfConditions: data?.searchParams?.qfConditions ?? [],
        crossRef: data?.searchParams?.crossRef ?? [],
        sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return searchResponse;
    },
    {
      enabled: tab == 1 && !!folderId && !!data?.searchParams,
      onSuccess: () => {
        // updateTab(1);
        updateWidget('Data Export', { misQfTableId: data?.searchParams?.typeId });
      },
    }
  );

  const { data: simpleSearch, isLoading: isSimpleSearchLoading } = useQuery(
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
      enabled: tab == 2 && !!folderId && !!data?.simpleSearchParams,
      onSuccess: () => {
        // updateTab(1);
        // updateWidget('Data Export', { misQfTableId: data?.searchParams?.typeId });
        console.log(
          'data?.simpleSearchParams?.searchConditons ===',
          data?.simpleSearchParams?.searchConditons
        );
        updateWidget('Data Export', {
          simpleSearchId: data?.simpleSearchParams?.simpleSearchId ?? '',
          searchConditons: (data?.simpleSearchParams?.searchConditons as string) ?? '',
          sortModel,
          pageState: { page: page, pageSize: pageSize },
        });
      },
    }
  );

  const renderHyperlinkCell = (params: GridRenderCellParams<any, any, any>) => {
    let issuer = '';
    let url = '';
    let openMethod = '';
    let valid = false;
    let target = '_blank';
    let openMethodMap: { [key: string]: string } = {
      '1': 'newwindow',
      '2': '_blank',
      '3': '_parent',
    };
    let features: string = '';
    try {
      const obj = JSON.parse(params.value);
      issuer = obj.issuer;
      url = obj.url;
      openMethod = obj.openMethod;
      target = openMethodMap[openMethod] || target;
      if (issuer && url && openMethod) {
        valid = true;
      }
      if (target === 'newwindow') {
        features = 'width=600,height=400';
      }
    } catch (error) {}

    if (!valid) {
      return <></>;
    }

    return (
      <Button
        size="small"
        endIcon={<OpenInNewIcon />}
        color={'inherit'}
        onClick={(e) => {
          window.open(url, target, features);
          // e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        {issuer}
      </Button>
    );
  };
  const renderRepeatingFieldCell = (params: GridRenderCellParams<any, any, any>) => {
    const values: Array<string> = [];
    if (params.value) {
      try {
        const parse = JSON.parse(params.value);
        if (parse instanceof Array) {
          (parse as Array<string>).forEach((s) => values.push(s));
        }
      } catch (err) {}
    }
    return (
      <List
        dense={true}
        sx={{ ['& .MuiListItem-root']: { paddingLeft: '4px', paddingRight: '0px' } }}
        // direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        component={Stack}
      >
        {values.map((v) => {
          return (
            <ListItem>
              <Chip label={v} variant="outlined" />
            </ListItem>
          );
        })}
      </List>
    );
  };
  const columns: GridColDef[] = useMemo(
    () =>
      tableColumn?.columnList.map((item) => {
        const newItem: GridColDef = item && {
          field: item?.misColumnName,
          headerName: item?.misColumnLabel,
          valueFormatter: ({ value }) =>
            item.misColumnType === '4' ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd') : value,
          flex: item?.misColumnWidth,
          minWidth: 120,
        };
        if (item.misColumnInputType === '13') {
          newItem.renderCell = renderHyperlinkCell;
          newItem.minWidth = 400;
        }
        if (item.misColumnInputType === '12') {
          newItem.renderCell = renderRepeatingFieldCell;
          newItem.minWidth = 400;
        }
        return newItem;
      }) ?? [],
    [tableColumn?.columnList]
  );
  const searchColumns: GridColDef[] = useMemo(
    () =>
      searchColumn?.columnList.map(
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
      ) ?? [],
    [searchColumn?.columnList]
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
            flex: item?.misColumnWidth,
            minWidth: 120,
          }
      ) ?? [],
    [simpleSearch?.columnList]
  );

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {!typeId && 'Please Select a table'}
      {rows.length === 0 && 'No Relevant Record'}
      {tab === 1 && searchColumns.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
  );
  const rows = useMemo(() => {
    const tmp =
      tableColumn?.recordList.map((item) =>
        item.reduce((prev, nex, index, arr) => ({ ...prev, [columns[index].field]: nex }), {
          id: item[0],
        })
      ) ?? [];
    console.log(tmp);
    return tmp;
  }, [columns, tableColumn?.recordList]);
  const searchRows = useMemo(
    () =>
      searchColumn?.recordList.map((item) => {
        return item
          .filter((item, index, arr) => index !== arr.length - 1)
          .reduce((prev, nex, index, arr) => ({ ...prev, [searchColumns[index].field]: nex }), {
            id: item[0],
          });
      }) ?? [],
    [searchColumns, searchColumn?.recordList]
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
    // console.log('-------------------------------------------------------');
    // console.log('tab:' + tab)
    // console.log('searchColumn?.total:' + tab)
    // console.log('tableColumn?.total:' + tab)
    // console.log('-------------------------------------------------------');
    // setRowCount(
    //   (prevRowCount) =>
    //   tab == 1 ?
    //     (tableColumn?.total !== undefined ? tableColumn?.total : prevRowCount) :
    //     (searchColumn?.total !== undefined ? searchColumn?.total : prevRowCount)
    // );
    if (tab == 1) {
      setRowCount((prevRowCount) =>
        searchColumn?.total !== undefined ? searchColumn?.total : prevRowCount
      );
    } else if (tab == 2) {
      setRowCount((prevRowCount) =>
        simpleSearch?.total !== undefined ? simpleSearch?.total : prevRowCount
      );
    } else {
      setRowCount((prevRowCount) =>
        tableColumn?.total !== undefined ? tableColumn?.total : prevRowCount
      );
    }
  }, [tab, searchColumn?.total, tableColumn?.total, simpleSearch?.total, setRowCount]);

  const handleOpen = (event: any) => {
    setIsDialogOpen(true);
    getActivityListOnPage();
    getProcessNameList();
    setProcessDetail({
      wfProcessId: '',
      wfProcessName: '',
      wfProcessCompletionStratedge: '',
      wfProcessHasNotification: '',
      wfProcessNotificationSubject: '',
      wfProcessNotificationContent: '',
      processActivities: [],
      processPeople: [],
    });
    setPersonIdList([]);
  };

  const handleEditOpen = (event: any) => {
    //setIsEditDialogOpen(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOpen = (event: any) => {
    //deleteTableData.mutate({  tableId: typeId,recordId:recordId });
    //handleOpen(event);
    deleteProcessId.current = 'processDeleteRecord';
    getActivityListOnPage();
    getProcessNameList();
    setProcessDetail({
      wfProcessId: '',
      wfProcessName: '',
      wfProcessCompletionStratedge: '',
      wfProcessHasNotification: '',
      wfProcessNotificationSubject: '',
      wfProcessNotificationContent: '',
      processActivities: [],
      processPeople: [],
    });
    setPersonIdList([]);
    setIsHadDeleteDialogOpen(true);
  };
  const handlePreview = async () => {
    const { data: response } = await client.recordManage.getRelationData({
      tableId: typeId ? typeId : '',
      recordId: recordId,
    });
    welcomeData.current = response;
    console.log('=======' + welcomeData.current);
    setIsPreviewDialogOpen(true);
  };
  // history.push({
  //   pathname: route.viewRelationData,
  //   search: `?id=${typeId}`,
  // });
  const handleEditChange = (key: any, e: any) => {
    console.log(e.target.id + '===' + e.target.name + '===e.target.value====' + e.target.value);
    const ab: any = e.target.id + '';
    let recordLs: { [key: string]: string } = {};
    recordLs[ab] = e.target.value;
    recordLs['id'] = recordId;
    editTableRef.current.push(recordLs);

    if (!editColumnName.includes(e.target.id)) {
      setEditColumnName(editColumnName.concat(e.target.id));
    }
  };
  const handleEditSubmit = async () => {
    const { data: response } = await client.recordManage.isHasPermission({
      tableId: typeId,
      recordId: recordId,
      editTableRef: editColumnName,
    });
    if (response == 'two') {
      toast.warning('no permission to edit data');
      setIsEditDialogOpen(false);
    } else {
      updateTable.mutate({ editData: editTableRef.current.slice(-1)[0], typeId: typeId });
    }

    setEditColumnName('');
  };
  const updateTable = useMutation(client.recordManage.updateTableData, {
    onSuccess: () => {
      // updateWidget('table column');
      //queryClient.invalidateQueries('Record table');
      setIsEditDialogOpen(false);
      toast.success('Record update successfully');
      handleOpen(event);
    },
  });
  const updateTypeRecord = useMutation(client.recordManage.updateTypeRecord, {
    onSuccess: () => {},
  });

  const deleteTableData = useMutation(client.recordManage.deleteTableData, {
    onSuccess: (data) => {
      // updateWidget('table column');
      //queryClient.invalidateQueries('Record table');
      console.log('data====' + data);
      toast.success('Record update successfully');
      if (data.data == '2') {
        handleOpen(event);
      }
    },
  });
  const handlePrint = async () => {
    const { data: response } = await client.recordManage.printTableData({
      tableId: typeId,
      recordId: recordId,
    });
    if (response == 'print success') {
      toast.success('print successfully');
    } else {
      toast.warn('print fail');
    }
  };
  const getProcessNameList = async () => {
    const { data } = await client.workflow.getAllProcess({
      pageState: { page: page + 1, pageSize },
      sortModel: {
        field: '',
        sort: '',
      },
    });
    setProcessNameList(data.data);
  };
  const updateFields = () => {
    for (let i = 0; i < fields?.length; i++) {
      fields[i].wfProcessActivitiesStep = i + '';
    }
  };
  const updateTab = (tab: number) => {
    updateWidget('Record List', { tab });
    setTab(tab);
  };
  const exportPDFContent = useMutation(client.recordManage.exportPDFContent, {});

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
    misSimpleSearchId,
  }: {
    key: availableBtn;
    type?: 'SIDEBAR' | 'DIALOG';
    configId?: string;
    misSimpleSearchId?: string;
  }) => {
    console.log(key);
    switch (key) {
      case 'SEARCH':
        return openOverlay({
          key: 'Search Form',
          type: type || 'SIDEBAR',
          data: { folderId },
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
            tableId: tab === 1 ? data?.searchParams?.typeId : typeId,
          },
          configId,
        });
      case 'EXPORT':
        return openOverlay({ key: 'Data Export', type: type || 'DIALOG', configId });
    }
  };

  const setDisolveAndDmeo = (evt: any) => {
    client.type.selectTypeById({ id: evt }).then((res) => {
        console.log("====="+res.data);
        if(res.data.misTypeName.toLowerCase().indexOf('building_organization') != -1){
          disolveSwitch.current = true;
          demolishSwitch.current = false;
        }else if(res.data.misTypeName.toLowerCase().indexOf('building_record') != -1){
          demolishSwitch.current = true;
            disolveSwitch.current = false;
          } else {
            disolveSwitch.current = false;
            demolishSwitch.current = false;
          }
    })};

  const checkDemoAndDiss=(typeId:any,recordId:any,demo:any)=>{
    client.type.checkDemoAndDiss({ typeId:typeId,recordId:recordId,demo:demo }).then((res) => {
      if(res.data){
        setBuildDialogOpen(false);
        toast.success('Record operation successfully');
        //demo=='dissolve'?bulidProcessId.current = 'processBuildingRecod':bulidProcessId.current = 'Demolish Process';
      }else{
        setBuildDialogOpen(true);
        demo=='dissolve'?bulidProcessId.current = 'DissolveCreateProcess':bulidProcessId.current = 'DemolishCreateProcess';

      }
    });
  };

  // const CustomFooter = () => {
  //   // const apiRef = useGridApiContext();
  //   // const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  //   // const page = useGridSelector(apiRef, gridPageSelector);
  //   // const visibleRowCount = useGridSelector(apiRef, gridVisibleRowCountSelector);
  //   // const rowCount = useGridSelector(apiRef, gridRowCountSelector);
  //   return (
  //     <Box
  //       sx={{
  //         p: 1,
  //         display: 'flex',
  //         width: '100%',
  //         justifyContent: 'space-between',
  //         alignItems: 'center',
  //       }}
  //     >
  //       <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
  //         <div>Rows per page: </div>
  //         <Select
  //           variant="outlined"
  //           disableInjectingGlobalStyles
  //           value={pageSize}
  //           displayEmpty
  //           IconComponent={ExpandMoreIcon}
  //           onChange={(evt) => {
  //             setPageSize(Number(evt.target.value));
  //           }}
  //           sx={{
  //             borderRadius: '0',
  //             padding: '10px 14px',
  //             marginLeft: '14px',
  //             backgroundColor: 'white',
  //             ['.MuiSelect-select']: {
  //               padding: '0 24px 0 0 !important',
  //             },
  //           }}
  //           MenuProps={{
  //             sx: {
  //               ['.MuiMenu-paper']: {
  //                 padding: '1rem 0.5rem',
  //                 borderRadius: '20px',
  //                 marginTop: '1rem',
  //               },
  //             },
  //           }}
  //         >
  //           {[10, 25, 50, 100].map((item) => (
  //             <MenuItem key={item} value={item} sx={{ padding: '12px 24px' }}>
  //               {item}
  //             </MenuItem>
  //           ))}
  //         </Select>
  //       </Box>
  //       <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
  //         <IconButton onClick={() => setPage((cur) => cur - 1)} disabled={page === 0}>
  //           <ChevronLeftIcon />
  //         </IconButton>
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             background: 'white',
  //             padding: '10px 24px',
  //             alignItems: 'center',
  //             border: '2px solid #eaeaea',
  //           }}
  //         >
  //           <input
  //             type="text"
  //             style={{ width: '20px', border: 'none', fontSize: '16px' }}
  //             value={'1'}
  //           />{' '}
  //           <div style={{ margin: '0 5px 0 2px' }}>/</div>
  //           <div> 15</div>
  //         </Box>
  //         <IconButton onClick={() => setPage((cur) => cur + 1)}>
  //           <ChevronRightIcon />
  //         </IconButton>
  //       </Box>
  //     </Box>
  //   );
  // };

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
        {config?.config?.btn?.main && (
          <Button
            {...btnStyle[config?.config?.btn?.main.theme ?? 'primary']}
            startIcon={icon[config?.config?.btn?.main.name as keyof typeof icon]}
            onClick={() => {
              actionHandler({
                key: config?.config?.btn?.main?.name as availableBtn,
                configId: config?.config?.btn?.main?.configId,
                misSimpleSearchId: config?.config?.btn?.main?.misSimpleSearchId ?? '',
              });
            }}
          >
            {config?.config?.btn?.main.name[0].toUpperCase() +
              config?.config?.btn?.main.name.substring(1).toLowerCase()}
          </Button>
        )}
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
          >
            {tab != 2 && dictData && (
              <FormControl variant="standard">
                <Select
                  disabled={tab === 1}
                  variant="outlined"
                  value={tab === 1 ? data?.searchParams?.typeId : typeId}
                  displayEmpty
                  IconComponent={ExpandMoreIcon}
                  renderValue={(value) => {
                    return (dictData && dictData.find((item) => item.key === value)?.value) ?? '';
                  }}
                  onChange={(evt) => {
                    setDisolveAndDmeo(evt.target.value);
                    setTypeId(evt.target.value);
                    updateWidget('Data Export', { id: evt.target.value });
                  }}
                  sx={{
                    borderRadius: '0',
                    padding: '0',
                    backgroundColor: 'white',
                    ['.MuiSelect-select']: {
                      padding: '14px 42px 14px 14px !important',
                    },
                  }}
                  MenuProps={{
                    sx: {
                      ['.MuiMenu-paper']: {
                        padding: '1rem 0.5rem',
                        borderRadius: '20px',
                        marginTop: '1rem',
                      },
                    },
                  }}
                >
                  {Array.isArray(dictData) &&
                    dictData.map((item) => (
                      <MenuItem key={item.key} value={item.key} sx={{ padding: '12px 24px' }}>
                        {item.value}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
            <ToggleButtonGroup
              sx={{ marginLeft: 2 }}
              // orientation="vertical"
              value={tab}
              exclusive
              onChange={(evt, val) => setTab(val)}
            >
              <ToggleButton value={0} aria-label="list">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value={2} aria-label="search" disabled={!data.simpleSearchParams}>
                <SearchIcon />
                Simple Search
              </ToggleButton>
              <ToggleButton value={1} aria-label="search" disabled={!data.searchParams}>
                <SearchIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box>
            {/* <TextField
              label="Keyword Here"
              variant="outlined"
              // onChange={e => setSearchKeyWord(e.target.value)}
              value={searchRecordInput}
              onChange={(e) => setSearchRecordInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                style: { height: 50, borderRadius: 0 },
              }}
            /> */}
            {config?.config?.btn?.right &&
              config.config.btn.right.slice(0, 5).map((item, index) => (
                <Button
                  {...btnStyle[item.theme]}
                  startIcon={icon[item.name as keyof typeof icon]}
                  onClick={() => {
                    actionHandler({
                      key: item.name as availableBtn,
                      configId: item.configId,
                      misSimpleSearchId: item.misSimpleSearchId ?? '',
                    });
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
                      actionHandler({
                        key: item.name as availableBtn,
                        configId: item.configId,
                        misSimpleSearchId: item.misSimpleSearchId ?? '',
                      });
                      handleClose();
                    }}
                  >
                    {icon[item.name as keyof typeof icon]}
                    {item.name[0].toUpperCase() + item.name.substring(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Menu>
            )}
            {/* <AddIcon />
            <Button
              {...btnStyle.primary}
              startIcon={<SearchIcon />}
              onClick={() => {
                openOverlay('Search Form', 'SIDEBAR', { folderId });
              }}
            >
              Search
            </Button>
            <Button
              {...btnStyle.secondary}
              endIcon={<ExitToAppIcon />}
              onClick={() => {
                openOverlay('Data Export', 'DIALOG');
              }}
            >
              Export
            </Button>
            <Button
              {...btnStyle.secondary}
              startIcon={<AddIcon />}
              onClick={() => {
                openOverlay('Record Creation', 'DIALOG', {
                  id: folderId,
                  tableId: tab === 1 ? data?.searchParams?.typeId : typeId,
                });
              }}
            >
              Add
            </Button> */}
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
          loading={isLoading || isSearchLoading || isSimpleSearchLoading}
          columns={tab === 1 ? searchColumns : tab === 2 ? simpleSearchColumns : columns}
          rows={tab === 1 ? searchRows : tab === 2 ? simpleSearchRows : rows}
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
                // ...store['Properties'],
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
                recordId: param.row.id,
              },
              Permission: {
                // ...store['Permission'],
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
                recordId: param.row.id,
                isFolder: false,
              },
              'Record History': {
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
                recordId: param.row.id,
              },
              'Record Audit Detail': {
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
                recordId: param.row.id,
              },
              Rendition: {
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
                recordId: param.row.id,
              },
              Version: { typeId, recordId: param.row.id },
              GIS: {
                geoData: param.row.map ? param.row.map : null,
                typeId: tab === 1 ? data?.searchParams?.typeId : typeId,
                folderId,
                targetedKey: 'map',
                coordinate: param.row.map
                  ? JSON.parse(param.row.map).geometry.coordinates[0][0][0]
                  : null,
              },
            });
            openOverlay({
              key: 'Properties',
              type: 'SIDEBAR',
              data: {
                typeId:
                  tab === 1
                    ? data?.searchParams?.typeId
                    : tab === 2
                    ? simpleSearch?.tableId
                    : typeId,
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
        {/* <CustomFooter /> */}
        {workflowSwitch && (
          <Button
            disableElevation
            {...btnStyle.primary}
            style={{ marginTop: '10px' }}
            onClick={handleOpen}
          >
            workflow
          </Button>
        )}
        &nbsp;&nbsp;
        {disolveSwitch.current && (
          <Button
            disableElevation
            {...btnStyle.primary}
            style={{ marginTop: '10px' }}
            onClick={() => {
              setBuildDialogOpen(true);
              bulidProcessId.current = 'processBuildingRecod';
            }}
          >
            Dissolve
          </Button>
        )}
        &nbsp;&nbsp;
        {demolishSwitch.current && (
          <Button
            disableElevation
            {...btnStyle.primary}
            style={{ marginTop: '10px' }}
            onClick={() => {
              setBuildDialogOpen(true);
              bulidProcessId.current = 'Demolish Process';
            }}
          >
            Demolish
          </Button>
        )}
        &nbsp;&nbsp;
        <Button
          disableElevation
          {...btnStyle.primary}
          style={{ marginTop: '10px' }}
          onClick={handleEditOpen}
        >
          edit
        </Button>
        {/* &nbsp;&nbsp;
        <Button
          disableElevation
          {...btnStyle.primary}
          style={{ marginTop: '10px' }}
          onClick={handleDeleteOpen}
        >
          delete
        </Button>
        &nbsp;&nbsp;
        <Button
          disableElevation
          {...btnStyle.primary}
          style={{ marginTop: '10px' }}
          onClick={handlePreview}
        >
          preview
        </Button>
        &nbsp;&nbsp;
        <Button
          disableElevation
          {...btnStyle.primary}
          style={{ marginTop: '10px' }}
          onClick={(e: any) => {
            //exportPDFContent(html);
            exportPDFContent.mutate(
              {
                typeId: typeId,
                recordId: recordId,
              },
              {
                onSuccess: (file: any) => {
                  let fileName = 'exportPDF.pdf';
                  const a = document.createElement('a');
                  a.download = fileName;
                  a.href = URL.createObjectURL(file);
                  a.addEventListener('click', (e) => {
                    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
                  });
                  a.click();
                },
              }
            );
          }}
        >
          export pdf
        </Button>
        &nbsp;&nbsp;
        <Button
          disableElevation
          {...btnStyle.primary}
          style={{ marginTop: '10px' }}
          onClick={handlePrint}
        >
          print
        </Button> */}
        <Dialog open={isDialogOpen}>
          <form
            onSubmit={handleSubmit((data) => {
              let attachments: any = [];
              if (tab === 2) {
                if (recordId != '') {
                  let records = recordId.split(',');
                  for (let i = 0; i < records.length; ++i) {
                    attachments.push({ typeId: simpleSearch?.tableId, recId: records[i] });
                  }
                }
              } else {
                if (recordId != '') {
                  let records = recordId.split(',');
                  for (let i = 0; i < records.length; ++i) {
                    attachments.push({ typeId: typeId, recId: records[i] });
                  }
                }
              }
              initWorkflow.mutate({
                processName: data.wfProcessName,
                attachments: attachments,
                supervisor: data.supervisor,
                initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
              });
              setIsDialogOpen(false);
            })}
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
              <Stack direction="row" spacing={2} mb={2}>
                <Controller
                  name="wfProcessName"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl variant="standard" focused sx={{ minWidth: '231px' }}>
                      <InputLabel id="demo-simple-select-standard-label">Process Name</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={processDetail?.wfProcessId}
                        onChange={(e) => {
                          onChange(e);
                          fetchDataById(e.target.value);
                        }}
                      >
                        {processNameList.map((listItem, index) => (
                          <MenuItem key={listItem.wfProcessId} value={listItem.wfProcessId}>
                            {listItem.wfProcessName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
              <Stack direction="row" spacing={2} mb={3}>
                <Typography variant="h6">
                  Activity if Approve&emsp;&emsp;&nbsp;&nbsp;&nbsp;
                </Typography>
                <Typography variant="h6">Activity if Reject&emsp;&emsp;&nbsp;&nbsp;</Typography>
                <Typography variant="h6">Performance Pledge（Days）</Typography>
              </Stack>
              {fields.map((field, index) => {
                {
                  updateFields();
                }
                return (
                  <div key={field.id}>
                    <Stack direction="row" spacing={2} mb={3} key={field.id}>
                      <Controller
                        name={`processActivities.${index}.wfProcessActivitiesActivity1Id`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            //focused={!!paramId}
                            variant="standard"
                            sx={{ minWidth: 180 }}
                            error={
                              !!errors.processActivities?.[index]?.wfProcessActivitiesActivity1Id
                            }
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Step&emsp;{index + 1}
                            </InputLabel>
                            <Select
                              displayEmpty
                              labelId="demo-simple-select-label"
                              disabled
                              id="demo-simple-select"
                              renderValue={(newVal) =>
                                activityList?.find((item) => item.wfActivityId === newVal)
                                  ?.wfActivityName ??
                                activityList?.find(
                                  (item) =>
                                    item.wfActivityId ===
                                    `qfConditions.${index}.wfProcessActivitiesActivity1Id`
                                )?.wfActivityName
                              }
                              value={
                                value ?? `processActivities.${index}.wfProcessActivitiesActivity1Id`
                              }
                              defaultValue={
                                `processActivities.${index}.wfProcessActivitiesActivity1Id` ?? ''
                              }
                              onChange={(e) => {
                                fields[index].wfProcessActivitiesActivity1Id = e.target.value;
                                fields[index].wfProcessActivitiesStep = index + '';
                                console.log('idx========', index);
                                console.log(
                                  'wfProcessActivitiesStep========',
                                  fields[index].wfProcessActivitiesStep
                                );
                                onChange(e);
                              }}
                            >
                              {activityList?.map((item) => {
                                return (
                                  <MenuItem
                                    key={item.wfActivityId}
                                    value={item.wfActivityId}
                                    disabled={item.isDisable}
                                  >
                                    {item.wfActivityName}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <FormHelperText>
                              {
                                errors?.processActivities?.[index]?.wfProcessActivitiesActivity1Id
                                  ?.message as string
                              }
                            </FormHelperText>
                          </FormControl>
                        )}
                      />

                      <Controller
                        name={`processActivities.${index}.wfProcessActivitiesActivity2Id`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            //focused={!!paramId}
                            variant="standard"
                            sx={{ m: 1, minWidth: 180 }}
                            error={
                              !!errors.processActivities?.[index]?.wfProcessActivitiesActivity2Id
                            }
                          >
                            <InputLabel id="demo-simple-select-standard-label"></InputLabel>
                            <Select
                              disabled
                              displayEmpty
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              renderValue={(newVal) =>
                                activity2List?.find((item) => item.wfActivityId === newVal)
                                  ?.wfActivityName ??
                                activity2List?.find(
                                  (item) =>
                                    item.wfActivityId ===
                                    `qfConditions.${index}.wfProcessActivitiesActivity2Id`
                                )?.wfActivityName
                              }
                              value={
                                value ?? `processActivities.${index}.wfProcessActivitiesActivity2Id`
                              }
                              defaultValue={
                                `processActivities.${index}.wfProcessActivitiesActivity2Id` ?? ''
                              }
                              onChange={(e) => {
                                fields[index].wfProcessActivitiesActivity2Id = e.target.value;
                                onChange(e);
                              }}
                            >
                              {activity2List?.map((item) => {
                                return (
                                  <MenuItem key={item.wfActivityId} value={item.wfActivityName}>
                                    {item.wfActivityName}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <FormHelperText>
                              {
                                errors?.processActivities?.[index]?.wfProcessActivitiesActivity2Id
                                  ?.message as string
                              }
                            </FormHelperText>
                          </FormControl>
                        )}
                      />

                      <Controller
                        name={`processActivities.${index}.wfProcessActivitiesPledge`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            //focused={!!paramId}
                            id="standard-basic"
                            variant="standard"
                            error={!!errors.processActivities?.[index]?.wfProcessActivitiesPledge}
                            onChange={onChange}
                            defaultValue={field.wfProcessActivitiesPledge}
                            value={value}
                            label="Value"
                            disabled
                            helperText={
                              errors?.processActivities?.[index]?.wfProcessActivitiesPledge
                                ?.message as string
                            }
                          />
                        )}
                      />
                    </Stack>
                  </div>
                );
              })}
              <Stack direction="row" spacing={2} mb={3} mt={3}>
                <Controller
                  name="performerUser"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      variant="standard"
                      sx={{ minWidth: '231px' }}
                      error={!!errors.performerUser}
                    >
                      <InputLabel id="demo-multiple-checkbox-label">Performer User</InputLabel>
                      <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={value}
                        onChange={onChange}
                        disabled
                        input={<OutlinedInput label="performerUser" />}
                        renderValue={(selected) =>
                          selected
                            .map(
                              (selectedId: string) =>
                                excludeList.find((listItem) => listItem.id === selectedId)?.name ??
                                ''
                            )
                            .join(', ')
                        }
                        MenuProps={MenuProps}
                      >
                        {excludeList.map((listItem) => (
                          <MenuItem key={listItem.id} value={listItem.id}>
                            <Checkbox checked={value.indexOf(listItem.id) > -1} />
                            <ListItemText primary={listItem.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
              <Stack direction="row" spacing={2} mb={3} mt={3}>
                <Controller
                  name="supervisor"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      variant="standard"
                      focused
                      sx={{ minWidth: '231px' }}
                      error={!!errors.supervisor}
                    >
                      <InputLabel id="demo-simple-select-standard-label">SuperVisor</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        onChange={onChange}
                      >
                        {excludeList.map((listItem, index) => (
                          <MenuItem key={listItem.id} value={listItem.name}>
                            {listItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                Submit
              </Button>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={isEditDialogOpen}>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >
            {tableColumn?.tableListData
              ?.filter((item, index, arr) => item.id == recordId)
              .map((item, index) =>
                Object.keys(item)
                  .filter((key) => !key.includes('id'))
                  .map((k) => (
                    <TextField
                      id={k}
                      label={k}
                      defaultValue={`${item[k]}`}
                      onChange={(e) => handleEditChange(k, e)}
                    />
                  ))
              )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleEditSubmit}>
              Submit
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={isPreviewDialogOpen}>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              paddingTop: 10,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: welcomeData.current }}></div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsPreviewDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={buildDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                let attachments: any = [];
                if (recordId != '') {
                  let records = recordId.split(',');
                  for (let i = 0; i < records.length; ++i) {
                    attachments.push({ typeId: typeId, recId: records[i] });
                  }
                }
                toUserId.current = data.toUserId;

                updateTypeRecord.mutate({
                  demo:isDemoAndDiss.current,
                  tableId: typeId,
                  recordId: recordId,
                  processContent: processContent,
                  processDate: DateTime.now().toFormat('yyyy-MM-dd'),
                });
                initWorkflow.mutate({
                  processName: bulidProcessId.current,
                  attachments: attachments,
                  //supervisor: data.supervisor,
                  initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
                });
                setBuildDialogOpen(false);
                toast.success('Record operation successfully');
              },
              (error) => {}
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
                <TextField
                  id="processContent"
                  label="ProcessContent"
                  sx={{ width: '600px' }}
                  multiline
                  rows={4}
                  defaultValue=""
                  onChange={(evt) => setProcessContent(evt.target.value)}
                />
              </Stack>
              <Stack direction="row" spacing={2} mb={3} mt={3}>
                <Controller
                  name="processDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      variant="standard"
                      focused
                      sx={{ minWidth: '231px' }}
                      error={!!errors.processDate}
                    >
                      <DatePicker
                        label="Process Date"
                        inputFormat="yyyy-MM-dd"
                        value={processDate ? processDate : DateTime.now().toFormat('yyyy-MM-dd')}
                        onChange={(newValue: DateTime | null | undefined) => {
                          if (newValue) {
                            newValue.toFormat('yyyy-MM-dd');
                            setProcessDate(newValue.toFormat('yyyy-MM-dd'));
                          }
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              variant="standard"
                              {...params}
                              sx={{ marginBottom: 2 }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  )}
                />
              </Stack>
              <Stack direction="row" spacing={2} mb={3} mt={3}>
                <Controller
                  name="toUserId"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      variant="standard"
                      focused
                      sx={{ minWidth: '231px' }}
                      error={!!errors.toUserId}
                    >
                      <InputLabel id="demo-simple-select-standard-label">ToUser</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        onChange={onChange}
                      >
                        {excludeList.map((listItem, index) => (
                          <MenuItem key={listItem.id} value={listItem.id}>
                            {listItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                Submit
              </Button>
              <Button
                onClick={() => {
                  setBuildDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={isHadDeleteDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                let attachments: any = [];
                if (recordId != '') {
                  let records = recordId.split(',');
                  for (let i = 0; i < records.length; ++i) {
                    attachments.push({ typeId: typeId, recId: records[i] });
                  }
                }
                toUserId.current = data.toUserId;
                initWorkflow.mutate({
                  processName: deleteProcessId.current,
                  attachments: attachments,
                  //supervisor: data.supervisor,
                  initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
                });
                setIsHadDeleteDialogOpen(false);
              },
              (error) => {}
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
                <Controller
                  name="toUserId"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      variant="standard"
                      focused
                      sx={{ minWidth: '231px' }}
                      error={!!errors.toUserId}
                    >
                      <InputLabel id="demo-simple-select-standard-label">ToUser</InputLabel>
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        onChange={onChange}
                      >
                        {excludeList.map((listItem, index) => (
                          <MenuItem key={listItem.id} value={listItem.id}>
                            {listItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                Submit
              </Button>
              <Button
                onClick={() => {
                  setIsHadDeleteDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </>
  );
};

export default RecordList;
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
};

type availableBtn = 'SEARCH' | 'QUICK' | 'BASIC' | 'ADVANCE' | 'Create' | 'EXPORT';

type btnTheme = 'primary' | 'secondary' | 'danger';
