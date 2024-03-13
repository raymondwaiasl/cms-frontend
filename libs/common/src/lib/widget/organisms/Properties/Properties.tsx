import { SaveSubscriptionInput } from '../../../api';
import { TaskCommentDto, SaveTaskCommentInput } from '../../../api/myInboxList';
import { DataField } from '../../../api';
import { useApi, useDialog, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import { InputHandling, typeChecking } from '../../../utils';
import { DatePicker } from '@mui/x-date-pickers';
import styles from './properties.module.scss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { TabPanel, TabContext } from '@mui/lab';

import {
  Box,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  DialogActions,
  ListItemText,
  ListItem,
  ListItemAvatar,
  List,
  Avatar,
  Divider,
  TextField,
} from '@mui/material';
import cn from 'clsx';
import { GetTableData, EffectColumn } from 'libs/common/src/lib/api/recordService';
import { Widget } from 'libs/common/src/lib/context';
import { WidgetContextProvider } from 'libs/common/src/lib/context/WidgetContext';
import WidgetHandler from 'libs/common/src/lib/context/WidgetHandler';
import WidgetPreViewHandler from 'libs/common/src/lib/context/WidgetPreViewHandler';
import debounce from 'lodash-es/debounce';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useEffect, useMemo, useState, SyntheticEvent, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillFolderOpen, AiOutlineFileText } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import SimpleBar from 'simplebar-react';
import {exportPDFUtil} from "../../../utils/exportPDFUtil";


const PropertiesWidget = () => {
  const client = useApi();
  const queryClient = useQueryClient();
  const [props, setProps] = useState({ recordId: '', typeId: '', isDraft: '', propertyId: '' });
  const { closeCurrentOverlay } = useOverlay('Properties');
  const [suggestionColumns, setSuggestionColumns] = useState<Record<string, GetTableData[]>>({});
  const [tabsId, setTabsId] = useState<string>('');
  const [tabDatas, setTabDatas] = useState<TabData[]>([]);
  let token = sessionStorage.getItem('token');
  const [isHadDeleteDialogOpen, setIsHadDeleteDialogOpen] = useState(false);
  const toUserId = useRef('');
  const deleteProcessId = useRef('');
  const [showElem, setShowElem] = useState<string>('none');
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const createRecId = useRef('');
  const createTypeId = useRef('');
  const createTypeLabel = useRef('Demolish');
  const createIsDraft = useRef('');
  const createPropertyId = useRef('');
  const isHasPermission = useRef(false);
  const [isHadEditDialogOpen, setIsHadEditDialogOpen] = useState(false);
  const simData = useRef('');
  const saveRefData = useRef('');
  const saveTableData = useRef({});
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const isGoWf = useRef(false);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const isDemoAndDiss = useRef('');
  const bulidProcessId = useRef('DemolishCreateProcess');
  const [processContent, setProcessContent] = useState<string>('');
  const [processDate, setProcessDate] = useState<string>('');
  const useDebounce = (callback: (...args: any) => void, wait: number) => {
    const ref = useRef<(...args: any) => void>();

    useEffect(() => {
      ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
      const func = (...args: any) => {
        ref.current?.(args);
      };

      return debounce(func, wait);
    }, []);

    return debouncedCallback;
  };
  const debounceResult = useDebounce((args) => execEffect(args), 1500);
  const {
    data: properties,
    widgetIndex,
    updateWidget,
  } = useWidget<{
    id: string;
    typeId: string | null;
    recordId: string | null;
    propertyId: string | null;
    name: string;
    isDraft: string;
  }>('Properties');
  const [tab, setTab] = useState('');
  useEffect(() => {
    createTypeId.current = properties.typeId ?? '';
    createRecId.current = properties?.recordId ?? '';
    createIsDraft.current = properties.isDraft ?? '';
    createPropertyId.current = properties.propertyId ?? '';
    setProps({ recordId: properties?.recordId ?? '', typeId: properties.typeId ?? '', isDraft: properties.isDraft ?? '', propertyId: properties.propertyId ?? '' });
  }, [properties]);
  const {
    data: recordProperties,
    remove,
    isLoading: isPropertiesLoading,
    isFetching,
  } = useQuery(
    ['Properties', props],
    async () => {
      const { data } = props?.isDraft === '' ? await client.recordService.getProperties({
        tableId: props?.typeId ?? '',
        recordId: props?.recordId ?? '',
        propertyId: props?.propertyId ?? '',
      }) : await client.recordService.getDraftProperties({
        tableId: props?.typeId ?? '',
        recordId: props?.recordId ?? '',
        propertyId: props?.propertyId ?? '',
        isDraft: props?.isDraft ?? '',
      });
      return data;
    },
    {
      staleTime: 2000,
      enabled: !!props?.typeId && !!props?.recordId,
      onSuccess: (data) => {

        removePropertiesRef();
        const val =
          data.refTableList.length < (widgetIndex < 0 ? 0 : widgetIndex)
            ? data.refTableList.length
            : widgetIndex < 0
              ? 0
              : widgetIndex;
        setTab(
          val === 0
            ? ''
            : data?.refTableList[val - 1].availableTable
              ? data?.refTableList[val - 1].misCrossRefId
              : ''
        );
        createTypeLabel.current=data?.tableLabel=="Building Records"?"Demolish":"Dissolve";
        
      },
    }
  );

  const { data: propertiesData } = useQuery('table List', async () => {
    const { data: tableResponse } = await client.recordService.getTableAndRefTab({
      tableId: createTypeId.current,
      recordId: createRecId.current,
      isDraft: createIsDraft.current,
      propertyId: createPropertyId.current,
    });
    return tableResponse;
  });

  const tableAvailable = useMemo(
    () =>
      !!recordProperties?.refTableList.find((item) => item.misCrossRefId === tab)?.availableTable,
    [recordProperties?.refTableList, tab]
  );
  const {
    data: recordRefProperties,
    isLoading,
    isFetching: isRefFetching,
    remove: removePropertiesRef,
  } = useQuery(
    [
      'PropertiesRef',
      props,
      tab,
      !!tableAvailable,
    ],
    async () => {
      const { data } = await client.recordService.getRefProperties({
        tableId: props?.typeId ?? '',
        recordId: props?.recordId ?? '',
        misCrossRefId: tab ?? '',
        isChildren,
      });
      return data;
    },
    {
      enabled: !!props?.typeId && !!props?.recordId && !!tab && tableAvailable,
      // keepPreviousData: true,
    }
  );

  const isChildren = useMemo(
    () =>
      recordProperties?.refTableList.find((item) => item.misCrossRefId === tab)
        ?.misCrossRefParentTableID === props?.typeId,
    [recordProperties?.refTableList, tab, props?.typeId]
  );
  const recordData = useMemo(
    () =>
      recordProperties?.columnDataList
        .map((item) => item.columns)
        .flat()
        .reduce((prev: { [key: string]: any }, next) => {
          prev[next.misColumnName] = {
            input_type: next.misColumnInputType,
            value:
              next.misColumnInputType === '6' ||
                next.misColumnInputType === '7' ||
                (next.misColumnInputType === '9' && next.misColumnType === '4')
                ? DateTime.fromMillis(next.value).toFormat('yyyy-MM-dd')
                : next.value,
          };
          return prev;
        }, {}),
    [recordProperties?.columnDataList]
  );
  const execEffect = (effect: Array<EffectColumn>) => {
    effect.forEach((e) => {
      const param = e.from.split(',').reduce((prev: { [key: string]: any }, columnName) => {
        prev[columnName] = getValues(columnName).value;
        return prev;
      }, {});
      const target = recordProperties?.columnDataList
        .flatMap((item) => item.columns)
        .find((c) => c.misColumnName === e.target);
      if (target) {
        client.recordManage
          .calcColumnQueryResult({
            misColumnId: target.misColumnId,
            param,
          })
          .then(async (resp) => {
            const {
              data: { result },
            } = resp;
            const newColumnLs = result.map((str) => ({ key: str, value: str }));
            setSuggestionColumns((prev) => ({ ...prev, [target.misColumnName]: newColumnLs }));
          });
      }
    });
  };

  const recordRefData = useMemo(
    () =>
      recordRefProperties?.columnDataList.reduce((prev: { [key: string]: any }, next) => {
        prev[next.misColumnName] = {
          input_type: next.misColumnInputType,
          value:
            next.misColumnInputType === '6' ||
              next.misColumnInputType === '7' ||
              (next.misColumnInputType === '9' && next.misColumnType === '4')
              ? DateTime.fromMillis(next.value).toFormat('yyyy-MM-dd')
              : next.value,
        };
        return prev;
      }, {}),
    [recordRefProperties?.columnDataList]
  );
  // useEffect(() => {
  //   if (recordRefProperties?.columnDataList) {
  //     recordRefProperties?.columnDataList.forEach((o) => {
  //       if (o.effect) {
  //         o.effect.map((e) => {
  //           const param: { [key: string]: any } = {};
  //           e.from.split(',').forEach((columnName) => {
  //             param[columnName] = recordRefData?.[columnName].value;
  //           });
  //           const target = recordRefProperties.columnDataList.find(
  //             (c) => c.misColumnName === e.target
  //           );
  //           if (target) {
  //             client.recordManage
  //               .calcColumnQueryResult({ misColumnId: target.misColumnId, param: param })
  //               .then((resp) => {
  //                 const newColumnLs = new Array<GetTableData>();
  //                 resp.data.result.forEach((str) => {
  //                   newColumnLs.push({ key: str, value: str });
  //                 });
  //                 target.dictList = newColumnLs;
  //               });
  //           }
  //         });
  //       }
  //     });
  //   }
  // }, [recordRefProperties?.columnDataList]);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const [disabled, setDisabled] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { openDialog } = useDialog();
  useEffect(() => {
    setDisabled(true);
    removePropertiesRef();
  }, [properties]);

  const submitHandling = (data: any) => {
    if (recordProperties) {
      let simIds = '';
      let saveValues = '';
      tabDatas.map((item: any) => {
        if (sessionStorage.getItem(token + 'pro_' + item.typeId)) {
          simIds = simIds + item.typeId + '&';
          simIds += sessionStorage.getItem(token + 'pro_' + item.typeId);
          if (simIds != '') {
            simIds += ':';
          }
        }
        if (sessionStorage.getItem(token + 'pro_save_' + item.typeId)) {
          saveValues = saveValues + item.typeId + '%';
          saveValues += sessionStorage.getItem(token + 'pro_save_' + item.typeId);
          if (saveValues != '') {
            saveValues += '@';
          }
        }
      });
      if (props.isDraft !== '') {
        setIsHadEditDialogOpen(true);
        deleteProcessId.current = 'processEditRecord';
        simData.current = simIds;
        saveTableData.current = data as DataField;
        saveRefData.current = saveValues;
      } else {
        client.type.checkDemoAndDiss({ typeId: createTypeId.current, recordId: createRecId.current, demo: "edit" }).then((res) => {
          if (res.data) {
            if (!tab) {
              SaveProperties.mutate({
                id: recordProperties?.id,
                typeId: recordProperties?.typeId,
                data: data as DataField,
                simIds: simIds,
                tabValue: saveValues,
              });
            }
          } else {
            setIsHadEditDialogOpen(true);
            deleteProcessId.current = 'processEditRecord';
            simData.current = simIds;
            saveTableData.current = data as DataField;
            saveRefData.current = saveValues;
          }
        })
      }

      // const targetedTable = recordProperties?.refTableList.find((i) => i.misCrossRefId === tab);
      // if (tab && !!targetedTable) {
      //   SaveProperties.mutate({
      //     id: recordProperties?.id,
      //     typeId: isChildren
      //       ? targetedTable.misCrossRefChildTableID
      //       : targetedTable.misCrossRefParentTableID,
      //     data: data as DataField,
      //     simIds: simIds,
      //     tabValue: saveValues,
      //   });
      //   //setDisabled(true);
      //   //setIsHadEditDialogOpen(true);
      //   //return;
      // }
    }
  };

  const Unsubscribe = useMutation(client.subscription.unsubscribe, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Subscribe');
      queryClient.invalidateQueries('Properties');
      queryClient.invalidateQueries('PropertiesRef');
      toast('Unsubscribe succesfully');
    },
  });
  const SaveProperties = useMutation(client.recordService.saveProperties, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('Properties');
      queryClient.invalidateQueries('Record table');
      queryClient.invalidateQueries('PropertiesRef');
      toast('Save succesfully', {
        type: 'success',
      });
      closeCurrentOverlay();

    },
  });
  const SaveDraftProperties = useMutation(client.recordService.saveDraftProperties, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('Properties');
      queryClient.invalidateQueries('Record table');
      queryClient.invalidateQueries('PropertiesRef');
      queryClient.invalidateQueries('Workflow Tree View');
      queryClient.invalidateQueries('HAD Record List');
      queryClient.invalidateQueries('HAD View Change');
      toast('Save succesfully', {
        type: 'success',
      });
      closeCurrentOverlay();

    },
  });
  const SubscribeFolder = useMutation(client.subscription.saveSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries(['Folder Subscribe', properties?.id]);
      queryClient.invalidateQueries(['Properties', properties?.recordId, properties?.typeId]);
      queryClient.invalidateQueries('PropertiesRef');
      toast('Subscribe succesfully');
    },
  });
  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTab(
      recordProperties?.refTableList.find((item) => item.misCrossRefId === newValue)?.availableTable
        ? newValue
        : ''
    );
  };
  const handleMenuClick = (newValue: string) => {
    setTab(
      recordProperties?.refTableList.find((item) => item.misCrossRefId === newValue)?.availableTable
        ? newValue
        : ''
    );

    handleClose();
  };

  const DeleteProperties = useMutation(client.recordService.deleteProperties, {
    onSuccess: (data) => {
      if (!tab) {
        remove();
      }
      if (tab) {
        removePropertiesRef();
        setTab('');
      }

      setProps({ recordId: '', typeId: '', isDraft: '', propertyId: '' });
      queryClient.invalidateQueries('Properties');
      queryClient.invalidateQueries('Record table');
      queryClient.invalidateQueries('PropertiesRef');
      toast('Delete succesfully', {
        type: 'success',
      });
      closeCurrentOverlay();
      // if (!data.data) {
      //   let attachments: any = [];
      //   attachments.push({ typeId: createTypeId.current, recId: createRecId.current });
      //   initWorkflow.mutate({
      //     processName: deleteProcessId.current,
      //     attachments: attachments,
      //     //supervisor: data.supervisor,
      //     initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
      //   });
      //   setIsHadDeleteDialogOpen(false);
      //   queryClient.invalidateQueries('Properties');
      //   queryClient.invalidateQueries('Record table');
      //   queryClient.invalidateQueries('PropertiesRef');
      //   toast('Delete succesfully');
      //   closeCurrentOverlay();
      // }
    },
  });

  useEffect(() => {
    if (!tab) reset(recordData);
    if (tab) reset(recordRefData);
  }, [recordData, recordRefData, tab]);

  useEffect(() => {
    client.folderService.getDefaultFolder().then((res) => {
      const defaultFolder = res.data;
      if (defaultFolder) {
        updateWidget('Properties', {
          id: defaultFolder.misFolderId,
          name: defaultFolder.misFolderName,
        });
      }
    });
    client.recordManage
      .isHasPermission({
        tableId: properties?.typeId ?? '',
        recordId: properties?.recordId ?? '',
        editTableRef: [],
      })
      .then((res) => {
        if (res.data == 'two') {
          isHasPermission.current = true;
        }
      });
    getUserList();
  }, []);
  const { data: tabsList } = useQuery(
    ['tabs', props?.typeId],
    async () => {
      const { data: tabsResponse } = await client.recordManage.getTabsData({
        tableId: props?.typeId ?? '',
        recordId: props?.recordId ?? '',
        propertyId: ''
      });
      return tabsResponse;
    },
    {
      enabled: !!props?.typeId,
      onSuccess(data: any) {
        if (data.length > 0) {
          setTabsId(data[0].typeId);
          let tabDatas = data.map((item: any, index: any) => {
            return {
              typeId: item.typeId,
              typeName: item.typeName,
              widgets: item.widgets.map((widget: any) => {
                return {
                  key: widget.misWwAlias as keyof typeof WidgetHandler,
                  title: widget.misWwTitle || widget.misWwAlias,
                  id: widget.layout.i,
                  configId: widget.misBiConfigId,
                  widgetId: widget.misWidgetId,
                };
              }),
            };
          });
          tabDatas.push({
            typeId: 'history',
            typeName: 'history log',
            widgets: [
              {
                key: 'Record History Log',
                title: 'record History log',
                id: 'record History log',
                widgetId: '',
              },
            ],
          });
          setTabDatas(tabDatas);
          data.map((item: any) => {
            sessionStorage.removeItem(token + 'pro_add_' + item.typeId);
            sessionStorage.removeItem(token + 'pro_save_' + item.typeId);
            sessionStorage.setItem(token + 'pro_' + item.typeId, item.records);
          });
          updateWidget('Child Record List', {
            typeId: data[0].typeId,
            searchParams: null,
            simpleSearchParams: null,
            tab: 1,
            parentRecId: props.recordId,
            edit: 0,
          });
        } else {
          setTabDatas([]);
        }
      },
    }
  );
  const initWorkflow = useMutation(client.workflow.initWorkflow, {
    onSuccess: (data) => {
      if ((data.status = 200)) {
        submitWorkflow.mutate({
          comment: '',
          workflowId: data.data,
          userId: toUserId.current,
          submissionDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
        });
      }
    },
  });
  const submitWorkflow = useMutation(client.workflow.submitWorkflow, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('Workflow Tree View');
      queryClient.invalidateQueries('HAD Record List');
      queryClient.invalidateQueries('HAD View Change');
    },
  });

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setExcludeList(userData.map((item) => ({ ...item, type: '4', checked: false })));
  };

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  const { data: taskCommentList } = useQuery(['Task Comment'], async () => {
    const { data: commentList } = await client.myInbox.getCommentByTypeIdAndRecId({
      //id: '0076000000002919',:
      typeId: properties.typeId ?? '',
      recordId: properties.recordId ?? '',
    });
    return commentList;
  });
  function stringAvatar(name: string) {
    if (name.indexOf(' ') > -1) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
      };
    } else {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: `${name.substring(0, 1)}`,
      };
    }
  }

  const handlePreview = () => {
    // const { data: response } = await client.recordManage.getRelationData({
    //   tableId: properties.typeId??'',
    //   recordId: properties.recordId??'',
    // });
    // welcomeData.current = response;
    setIsPreviewDialogOpen(true);
  };
  const handleExportPdf =() => {
        setShowElem("block")
    let timer=setTimeout(
      () => {
        exportPDFUtil("Properties","prewPdf")
        setShowElem("none")
      },
      500
    );
  };
  const exportPDFContent = useMutation(client.recordManage.exportPDFContent, {});
  const handlePrint = async () => {
    const { data: response } = await client.recordManage.printTableData({
      tableId: properties.typeId ?? '',
      recordId: properties.recordId ?? '',
    });
    if (response == 'print success') {
      toast.success('print successfully');
    } else {
      toast.warn('print fail');
    }
  };
  const checkDemoAndDiss=(typeId:any,recordId:any,demo:any)=>{
    client.type.checkDemoAndDiss({ typeId:typeId,recordId:recordId,demo:demo }).then((res) => {
      if(res.data){
        setBuildDialogOpen(true);
        isDemoAndDiss.current=demo;
        
      }else{
        isDemoAndDiss.current=demo;
        isGoWf.current=true;
        demo=='dissolve'?bulidProcessId.current = 'DissolveCreateProcess':bulidProcessId.current = 'DemolishCreateProcess';
        setBuildDialogOpen(true);
      }
     
    })};
    const updateTypeRecord = useMutation(client.recordManage.updateTypeRecord, {
      onSuccess: () => {},
    });
  return (
    <Paper className={cn({ [styles.formContainer]: !isLoading || !isPropertiesLoading })}>
      {(!isLoading || !isPropertiesLoading || !isRefFetching || isFetching) && recordProperties ? (
        <>
          <Stack direction={'row'} alignItems="center" sx={{ marginBottom: 2 }}>
            {recordProperties.refTableList.length > 0 && (
              <Tabs
                value={tab}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                <Tab label="Current Table" value={''} />
                {recordProperties.refTableList.map((item) => (
                  <Tab
                    key={item.misCrossRefId}
                    label={
                      item.misCrossRefParentTableID === recordProperties.typeId
                        ? item.misCrossRefChildTableLabel
                        : item.misCrossRefParentTableLabel
                    }
                    value={item.misCrossRefId}
                    disabled={!item.availableTable}
                  />
                ))}
              </Tabs>
            )}
            {recordProperties.refTableList.length > 3 && (
              <>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={() => handleMenuClick('')} disabled={tab == ''}>
                    Current Table
                  </MenuItem>
                  {recordProperties.refTableList.map((item) => (
                    <MenuItem
                      onClick={() => handleMenuClick(item.misCrossRefId)}
                      disabled={tab === item.misCrossRefId || !item.availableTable}
                    >
                      {item.misCrossRefParentTableID === recordProperties.typeId
                        ? item.misCrossRefChildTableLabel
                        : item.misCrossRefParentTableLabel}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Stack>
          <form onSubmit={handleSubmit(submitHandling)}>
            <Box
              sx={{
                marginBottom: '1rem',
              }}
            >
              {!tab
                ? Array.isArray(recordProperties.columnDataList) &&
                recordProperties.columnDataList.map(({ columns, name, misPropertySectionId }) => (
                  <Accordion key={misPropertySectionId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={styles.form}>
                      {columns.map((item) => (
                        <Controller
                          key={item.misColumnName}
                          name={item.misColumnName}
                          control={control}
                          // rules={{
                          //   required: {
                          //     value: item.misColumnAllowEmpty === 'N',
                          //     message: 'This field is required',
                          //   },
                          //   validate: {
                          //     typeChecking: (value) =>
                          //       typeChecking(
                          //         item.misColumnType,
                          //         value.value,
                          //         item.misColumnAllowEmpty !== 'N'
                          //       ) as string,
                          //   },
                          //   maxLength: {
                          //     value: Number(item.misColumnLength),
                          //     message: `This field is cannot be larger than ${item.misColumnLength}`,
                          //   },
                          // }}
                          defaultValue={{
                            input_type: item.misColumnInputType,
                            value: item.value,
                          }}
                          render={({ field: { value, onChange }, fieldState: { error } }) => {
                            const processChange = (evt: any) => {
                              onChange(evt);
                              const effect = item.effect;
                              if (effect) {
                                debounceResult(effect[0]);
                              }
                            };

                            return (
                              <InputHandling
                                suggestionColumns={suggestionColumns[item.misColumnName]}
                                misColumnLabel={item.misColumnLabel}
                                misColumnInputType={item.misColumnInputType}
                                columnLs={item.dictList}
                                value={value}
                                onChange={processChange}
                                disabled={disabled}
                                error={error}
                                style={{
                                  gridColumn: `span ${item?.col_size}`,
                                  gridRow: `span ${item?.row_size}`,
                                  minWidth: '150px',
                                }}
                              />
                            );
                          }}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))
                : Array.isArray(recordRefProperties?.columnDataList) &&
                !!recordRefProperties?.columnDataList.length &&
                recordRefProperties?.columnDataList.map((item, index) => (
                  <Controller
                    key={item.misColumnName}
                    name={item.misColumnName}
                    control={control}
                    // rules={{
                    //   required: {
                    //     value: item.misColumnAllowEmpty === 'N',
                    //     message: 'This field is required',
                    //   },
                    //   validate: {
                    //     typeChecking: (value) =>
                    //       typeChecking(
                    //         item.misColumnType,
                    //         value.value,
                    //         item.misColumnAllowEmpty === 'N'
                    //       ) as string,
                    //   },
                    //   maxLength: {
                    //     value: Number(item.misColumnLength),
                    //     message: `This field is cannot be larger than ${item.misColumnLength}`,
                    //   },
                    // }}
                    defaultValue={{
                      input_type: item.misColumnInputType,
                      value: item.value,
                    }}
                    render={({ field: { value, onChange }, fieldState: { error } }) => {
                      const execEffect = (effect: Array<EffectColumn>) => {
                        effect.map((e) => {
                          const param: { [key: string]: any } = {};
                          e.from.split(',').forEach((columnName) => {
                            param[columnName] = getValues(columnName).value;
                          });
                          const target = recordRefProperties.columnDataList.find(
                            (c) => c.misColumnName === e.target
                          );
                          if (target) {
                            client.recordManage
                              .calcColumnQueryResult({
                                misColumnId: target.misColumnId,
                                param: param,
                              })
                              .then((resp) => {
                                const newColumnLs = new Array<GetTableData>();
                                resp.data.result.forEach((str) => {
                                  newColumnLs.push({ key: str, value: str });
                                });
                                target.dictList = newColumnLs;
                                setValue(target.misColumnName, getValues(target.misColumnName));
                              });
                          }
                        });
                      };

                      const debouncedExecEffect = useDebounce((args) => {
                        execEffect(args[0]);
                      }, 1500);

                      const processChange = (evt: any) => {
                        onChange(evt);
                        const effect = item.effect;
                        if (effect) {
                          debouncedExecEffect(effect);
                        }
                      };

                      return (
                        <InputHandling
                          misColumnLabel={item.misColumnLabel}
                          misColumnInputType={item.misColumnInputType}
                          columnLs={item.dictList}
                          value={value}
                          onChange={processChange}
                          disabled={disabled}
                          error={error}
                          style={{
                            gridColumn: `span ${item?.col_size}`,
                            gridRow: `span ${item?.row_size}`,
                            minWidth: '150px',
                          }}
                        />
                      );
                    }}
                  />
                ))}
            </Box>
            <Paper style={{ marginTop: '50px', marginBottom: '20px' }}>
              {tabDatas.length > 0 && (
                <AppBar position="static">
                  <Tabs
                    value={tabsId}
                    aria-label="simple tabs example"
                    onChange={(_, val) => {
                      if (val == 'history') {
                        setTabsId(val);
                        updateWidget('Record History Log', {
                          typeId: props.typeId,
                          recordId: props.recordId,
                        });
                      } else {
                        setTabsId(val);
                        updateWidget('Child Record List', {
                          typeId: val,
                          searchParams: null,
                          simpleSearchParams: null,
                          tab: 1,
                          parentRecId: props.recordId,
                        });
                      }
                    }}
                    indicatorColor="secondary"
                    textColor="inherit"
                  >
                    {Array.isArray(tabDatas) &&
                      tabDatas.map((item, index) => (
                        <Tab key={`tab-${index}`} value={item.typeId} label={item.typeName} />
                      ))}
                  </Tabs>
                </AppBar>
              )}

              <TabContext value={tabsId}>
                {Array.isArray(tabDatas) &&
                  tabDatas.map((item, index) => (
                    <TabPanel value={item.typeId}>
                      {item.widgets.length > 0 &&
                        item.widgets.map((widget) => (
                          <WidgetContextProvider {...widget} breakpoint="sm" width={500}>
                            <SimpleBar style={{ maxWidth: `1500px`, maxHeight: `700px` }}>
                              {WidgetHandler[widget.key as keyof typeof WidgetHandler]}
                            </SimpleBar>
                          </WidgetContextProvider>
                        ))}
                    </TabPanel>
                  ))}
              </TabContext>
            </Paper>
            <Box className={styles.buttonSection}>
              {disabled ? (
                <>
                  {/* <Button
                    fullWidth={false}
                    variant="contained"
                    disabled={recordRefProperties?.columnDataList.length === 0}
                    onClick={() => {
                      if (recordProperties.flag) {
                        openDialog('deleteDialog', {
                          title: 'Unsubscribe Record',
                          message: `Are you sure to unsubscribe this record?`,
                          confirmAction: () => {
                            Unsubscribe.mutate({
                              objId: !tab
                                ? recordProperties.id ?? ''
                                : recordRefProperties?.id ?? '',
                            });
                          },
                          deleteBtnTitle: 'Unsubscribe',
                        });
                      }
                      if (!recordProperties.flag) {
                        openDialog('subscribeDialog', {
                          onConfirmAction: (data: Omit<SaveSubscriptionInput, 'id' | 'typeId'>) => {
                            console.log(data);
                            SubscribeFolder.mutate({
                              ...data,
                              id: !tab ? recordProperties.id : recordRefProperties?.id ?? '',
                              typeId: !tab
                                ? recordProperties.typeId
                                : recordRefProperties?.typeId ?? '',
                            });
                          },
                        });
                      }
                    }}
                  >
                    {!tab && (recordProperties.flag ? 'Unsubscribe' : 'Subscribe')}
                    {tab && (recordRefProperties?.flag ? 'Unsubscribe' : 'Subscribe')}
                  </Button> */}
                  <Button
                    variant="contained"
                    type="button"
                    disabled={
                      props?.isDraft !== '' ? false : (
                        !recordProperties.isEdit ||
                        recordRefProperties?.columnDataList.length === 0 ||
                        isHasPermission.current === true
                      )
                    }
                    onClick={(e) => {
                      setDisabled((curr) => !curr);
                      updateWidget('Child Record List', {
                        typeId: tabsId,
                        searchParams: null,
                        simpleSearchParams: null,
                        tab: 1,
                        parentRecId: props.recordId,
                        edit: 1,
                      });
                      e.preventDefault();
                    }}
                  >
                    Edit
                  </Button>
                  <Tooltip
                    title={
                      !tab &&
                        recordProperties.refTableList.length > 0 &&
                        recordProperties.refTableList.some((item) => item.availableTable)
                        ? 'There are linked records prevent to be deleted'
                        : ''
                    }
                    arrow
                    placement="top"
                  >
                    <span>
                      <Button
                        variant="outlined"
                        disabled={
                          !recordProperties.isDelete ||
                          (recordProperties.refTableList.some((item) => item.availableTable) &&
                            !tab)
                        }
                        color="error"
                        onClick={() => {
                          openDialog('deleteDialog', {
                            title: 'Delete Record',
                            message:
                              tab && recordRefProperties?.hasChildrenTable
                                ? 'This table has linked records Are you sure to Delete this record and other linked record?'
                                : 'Are you sure to delete this record?',
                            confirmAction: () => {

                              client.type.checkDemoAndDiss({ typeId: createTypeId.current, recordId: createRecId.current, demo: "delete" }).then((res) => {
                                if (res.data) {
                                  DeleteProperties.mutate({
                                    id: !tab ? recordProperties.id : recordRefProperties?.id ?? '',
                                    typeId: !tab
                                      ? recordProperties.typeId
                                      : recordRefProperties?.typeId ?? '',
                                  })  
                                }else{
                                  isDemoAndDiss.current="delete";
                                  isGoWf.current=true;

                                  deleteProcessId.current = 'processDeleteRecord';
                                  createRecId.current = !tab
                                    ? recordProperties.id
                                    : recordRefProperties?.id ?? '';
                                  createTypeId.current = !tab
                                    ? recordProperties.typeId
                                    : recordRefProperties?.typeId ?? '';
                                  setIsHadDeleteDialogOpen(true);
                                }
                              })


                            },


                          });

                        }}
                      >
                        Delete
                      </Button>
                    </span>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={
                      props?.isDraft !== '' ? false : (!recordProperties.isEdit || recordRefProperties?.columnDataList.length === 0)
                    }
                  >
                    Save
                  </Button>
                  <Button variant="outlined" onClick={() => setDisabled((curr) => !curr)}>
                    Cancel
                  </Button>
                </>
              )}

        <Button
          variant="contained"
          onClick={handlePreview}
        >
          preview
        </Button>
        &nbsp;&nbsp;
        <Button
          variant="contained"
          onClick={handleExportPdf}
        >
          export pdf
        </Button>
      {/*<Button*/}
      {/*    variant="contained"*/}
      {/*    onClick={(e: any) => {*/}
      {/*      //exportPDFContent(html);*/}
      {/*      exportPDFContent.mutate(*/}
      {/*        {*/}
      {/*          typeId: properties.typeId??'',*/}
      {/*          recordId: properties.recordId??'',*/}
      {/*        },*/}
      {/*        {*/}
      {/*          onSuccess: (file: any) => {*/}
      {/*            let fileName = 'exportPDF.pdf';*/}
      {/*            const a = document.createElement('a');*/}
      {/*            a.download = fileName;*/}
      {/*            a.href = URL.createObjectURL(file);*/}
      {/*            a.addEventListener('click', (e) => {*/}
      {/*              setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);*/}
      {/*            });*/}
      {/*            a.click();*/}
      {/*          },*/}
      {/*        }*/}
      {/*      );*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    export pdf*/}
      {/*  </Button>*/}
              
        &nbsp;&nbsp;
        <Button
         variant="contained"
          onClick={handlePrint}
        >
          print
        </Button>
        &nbsp;&nbsp;
        <Button
         variant="contained"
          onClick={() => {checkDemoAndDiss(createTypeId.current,createRecId.current,createTypeLabel.current)}}
        >
          {createTypeLabel.current=='Demolish'?'Demolish':'Dissolve'}
        </Button>


            </Box>
          </form>
        </>
      ) : isLoading || isPropertiesLoading ? (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '150px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack
          direction={'column'}
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: '100px' }}
        >
          <AiOutlineFileText size={40} />
          <Typography sx={{ marginY: 2 }}>Select A Record</Typography>
        </Stack>
      )
      }
      <Accordion key="last approve workflow record" defaultExpanded>
        <Typography sx={{ marginY: 2, fontWeight: 'bold' }}>last approve workflow record</Typography>
        <Box className={styles.buttonSection}>

          <List sx={{ width: '100%', minWidth: 360, bgcolor: 'background.paper' }}>
            {taskCommentList?.map((item: TaskCommentDto) => (
              <>
                <ListItemText
                  sx={{ textAlignLast: 'left' }}
                  secondary={
                    <React.Fragment>
                      {DateTime.fromMillis(item.wfCommentDate as unknown as number).toFormat(
                        'yyyy-MM-dd hh:mm:ss'
                      )}
                    </React.Fragment>
                  }
                />

                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar {...stringAvatar(item.wfCommentCommentator)} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.wfActivityName}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {item.wfCommentCommentator}
                        </Typography>
                        {' — '}
                        {item.wfCommentContent}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </>
            ))}

          </List>
        </Box>
      </Accordion>
    <div id="prewPdf" style={{
      display:showElem,
    }}>
        {Array.isArray(propertiesData?.sectionColumnDTOS) &&
        propertiesData?.sectionColumnDTOS.map(({ columns, name, misPropertySectionId }) => (
          <Accordion key={misPropertySectionId} defaultExpanded>
            <AccordionSummary >
              <Typography sx={{
                'padding': '10px 20px',
                'min-width': '100%',
                'width': 'fit-content',
              }}><strong>{name}</strong></Typography>
            </AccordionSummary>
            <AccordionDetails sx={{
              'overflow-x': 'auto',
              'display': 'grid',
              'grid-template-columns': 'repeat(12, 1fr)',
              'grid-auto-rows': '1fr',
              'gap': '10px',
            }}
            >
              {/*<table >*/}
              {columns.map((item) => (
                <Controller
                  key={item.misColumnName}
                  name={item.misColumnName}
                  control={control}
                  defaultValue={{
                    input_type: item.misColumnInputType,
                    value: item.value,
                  }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => {
                    const processChange = (evt: any) => {
                      onChange(evt);
                      const effect = item.effect;
                      if (effect) {
                        debounceResult(effect[0]);
                      }
                    };

                    return (
                      // <tr>
                      //   <td >
                      //     {item.misColumnLabel}
                      //   </td>
                      //   <td>{value.value}</td>
                      // </tr>

                      // <TextField
                      //   id="outlined-read-only-input"
                      //   // suggestionColumns={suggestionColumns[item.misColumnName]}
                      //   label=
                      //   // misColumnInputType={item.misColumnInputType}
                      //   // columnLs={item.dictList}
                      //   value={value.value}
                      //   // onChange={processChange}
                      //   disabled={disabled}
                      //   // error={error}
                      //   style={{
                      //     // gridColumn: `span ${item?.col_size}`,
                      //     // gridRow: `span ${item?.row_size}`,
                      //     minWidth: '350px',
                      //   }}
                      // />
                    <InputHandling
                        suggestionColumns={suggestionColumns[item.misColumnName]}
                        misColumnLabel={item.misColumnLabel}
                        misColumnInputType={item.misColumnInputType}
                        columnLs={item.dictList}
                        value={value}
                        onChange={processChange}
                        disabled={disabled}
                        error={error}
                        style={{
                          gridColumn: `span ${item?.col_size}`,
                          gridRow: `span ${item?.row_size}`,
                          minWidth: '350px',
                        }}
                      />
                    );
                  }}
                />
              ))}
              {/*</table>*/}

            </AccordionDetails>
          </Accordion>
        ))}
      {tabDatas.length > 0 && Array.isArray(tabDatas) &&
      tabDatas.filter((item) => item.typeName !== 'history log').map((item, index) => (
        <Paper style={{ marginTop: '50px', marginBottom: '20px' }}>
          <AppBar position="static">
            <Tabs
              value={`tabPdf-${index}`}
              aria-label="simple Preview tabs example"
              indicatorColor="secondary"
              textColor="inherit"
            >
              <Tab key={`tabPdf-${index}`} value={`tabPdf-${index}`} label={item.typeName} />
            </Tabs>
          </AppBar>
          {item.widgets.length > 0 &&
          item.widgets.map((widget) => (
            <TabContext value={`tabPdf-${index}`}>
              <TabPanel value={`tabPdf-${index}`}>
                <WidgetContextProvider {...widget} breakpoint="sm" width={500}>
                  <SimpleBar style={{ maxWidth: `1500px`, maxHeight: `700px` }}>
                    {WidgetPreViewHandler[widget.key as keyof typeof WidgetPreViewHandler]}
                  </SimpleBar>
                </WidgetContextProvider>
              </TabPanel>
            </TabContext>
          ))}

          </Paper>
        ))}

      </div>
      <Dialog open={isHadDeleteDialogOpen}>
        <form
          onSubmit={handleSubmit(
            (data) => {
              let attachments: any = [];
              attachments.push({ typeId: createTypeId.current, recId: createRecId.current });
              toUserId.current = data.toUserId;
              updateTypeRecord.mutate({
                demo:isDemoAndDiss.current,
                tableId: createTypeId.current,
                recordId: createRecId.current,
                processContent: processContent,
                processDate: DateTime.now().toFormat('yyyy-MM-dd'),
              });
              initWorkflow.mutate({
                processName: deleteProcessId.current,
                attachments: attachments,
                //supervisor: data.supervisor,
                initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
              });
              // DeleteProperties.mutate({
              //   id: createRecId.current,
              //   typeId: createTypeId.current,
              // })
              isGoWf.current=false;
              setIsHadDeleteDialogOpen(false);

              toast.success('Record operation successfully');
              closeCurrentOverlay();
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
                <TextField
                  id="processContent"
                  label="Reason"
                  sx={{ width: '600px' }}
                  multiline
                  rows={4}
                  defaultValue=""
                  onChange={(evt) => setProcessContent(evt.target.value)}
                />
              </Stack>
              
              <Stack  direction="row" spacing={2} mb={3} mt={3}>
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
                      <InputLabel id="demo-simple-select-standard-label">Submit Verify to</InputLabel>
                      
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        onChange={onChange}
                        disabled={isGoWf.current==true?false:true}
                        title={isGoWf.current==true?"":"has permission no go workflow!"}
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
      <Dialog open={isHadEditDialogOpen}>
        <form
          onSubmit={handleSubmit(
            (data) => {
              let attachments: any = [];
              attachments.push({ typeId: createTypeId.current, recId: createRecId.current });
              toUserId.current = data.toUserId;

              if (!tab) {

                if (props.isDraft === '') {
                  SaveProperties.mutate({
                    id: recordProperties?.id ?? '',
                    typeId: recordProperties?.typeId ?? '',
                    data: saveTableData.current,
                    simIds: simData.current,
                    tabValue: saveRefData.current,
                  });
                } else {
                  deleteProcessId.current = 'CreateDataProcess';
                  SaveDraftProperties.mutate({
                    id: recordProperties?.id ?? '',
                    typeId: recordProperties?.typeId ?? '',
                    data: saveTableData.current,
                    simIds: simData.current,
                    tabValue: saveRefData.current,
                  });
                }

              }
              initWorkflow.mutate({
                processName: deleteProcessId.current,
                attachments: attachments,
                //supervisor: data.supervisor,
                initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
              });
              setIsHadEditDialogOpen(false);
              closeCurrentOverlay();
              //toast('Save succesfully');
            },
            (error) => {
              toast.error('Save fail');

            }
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
                setIsHadEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/*Preview  Dialog*/}
      <Dialog  open={isPreviewDialogOpen}
              sx={{
                ['.css-1t1j96h-MuiPaper-root-MuiDialog-paper']: {
                  'min-width': '700px!important',
                  'max-width': '900px!important',
                  // display: 'block!important',
                },
                ['.prewCancelButton']: {
                  'text-align': 'center',
                  // display: 'block!important',
                },
              }}
      >
          <DialogContent
            sx={{
              display: 'block',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              paddingTop: 10,
            }}
          >
            {Array.isArray(propertiesData?.sectionColumnDTOS) &&
                  propertiesData?.sectionColumnDTOS.map(({ columns, name, misPropertySectionId }) => (
                    <Accordion key={misPropertySectionId} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails className={styles.form}>
                        {columns.map((item) => (
                          <Controller
                            key={item.misColumnName}
                            name={item.misColumnName}
                            control={control}
                            defaultValue={{
                              input_type: item.misColumnInputType,
                              value: item.value,
                            }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => {
                              const processChange = (evt: any) => {
                                onChange(evt);
                                const effect = item.effect;
                                if (effect) {
                                  debounceResult(effect[0]);
                                }
                              };

                              return (
                                <InputHandling
                                  suggestionColumns={suggestionColumns[item.misColumnName]}
                                  misColumnLabel={item.misColumnLabel}
                                  misColumnInputType={item.misColumnInputType}
                                  columnLs={item.dictList}
                                  value={value}
                                  onChange={processChange}
                                  disabled={disabled}
                                  error={error}
                                  style={{
                                    gridColumn: `span ${item?.col_size}`,
                                    gridRow: `span ${item?.row_size}`,
                                    minWidth: '350px',
                                  }}
                                />
                              );
                            }}
                          />
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}

            {tabDatas.length > 0 && Array.isArray(tabDatas) &&
            tabDatas.filter((item) => item.typeName !== 'history log').map((item, index) => (
            <Paper style={{ marginTop: '50px', marginBottom: '20px' }}>
                <AppBar position="static">
                  <Tabs
                    value={`tabPrew-${index}`}
                    aria-label="simple Preview tabs example"
                    indicatorColor="secondary"
                    textColor="inherit"
                  >
                      <Tab key={`tabPrew-${index}`} value={`tabPrew-${index}`} label={item.typeName} />
                  </Tabs>
                </AppBar>
              {item.widgets.length > 0 &&
              item.widgets.map((widget) => (
              <TabContext value={`tabPrew-${index}`}>
                  <TabPanel value={`tabPrew-${index}`}>
                      <WidgetContextProvider {...widget} breakpoint="sm" width={500}>
                        <SimpleBar style={{ maxWidth: `1500px`, maxHeight: `700px` }}>
                          {WidgetPreViewHandler[widget.key as keyof typeof WidgetPreViewHandler]}
                        </SimpleBar>
                      </WidgetContextProvider>
                  </TabPanel>
              </TabContext>
              ))}

            </Paper>
              ))}
            <div className="prewCancelButton" >
              <Button
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                  }}
                >
              Cancel
            </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={buildDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                let attachments: any = [];
                if (createRecId.current != '') {
                  let records = createRecId.current.split(',');
                  for (let i = 0; i < records.length; ++i) {
                    attachments.push({ typeId: createTypeId.current, recId: records[i] });
                  }
                }
                toUserId.current = data.toUserId;

                updateTypeRecord.mutate({
                  demo:isDemoAndDiss.current,
                  tableId: createTypeId.current,
                  recordId: createRecId.current,
                  processContent: processContent,
                  processDate: DateTime.now().toFormat('yyyy-MM-dd'),
                });
                if(isGoWf.current==true){
                  initWorkflow.mutate({
                    processName: bulidProcessId.current,
                    attachments: attachments,
                    //supervisor: data.supervisor,
                    initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
                  });
                }
                isGoWf.current=false;
                setBuildDialogOpen(false);
                toast.success('Record operation successfully');
               
                queryClient.invalidateQueries('Properties');
                queryClient.invalidateQueries('Record table');
                queryClient.invalidateQueries('PropertiesRef');
                closeCurrentOverlay();
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
                  label="Reason"
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
                        label={createTypeLabel.current=='Demolish'?'Demolish Date':'Dissolve Date'}
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
              <Stack  direction="row" spacing={2} mb={3} mt={3}>
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
                      <InputLabel id="demo-simple-select-standard-label">Submit Verify to</InputLabel>
                      
                      <Select
                        displayEmpty
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={value}
                        onChange={onChange}
                        disabled={isGoWf.current==true?false:true}
                        title={isGoWf.current==true?"":"has permission no go workflow!"}
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
    </Paper>
  );
};

export default PropertiesWidget;

export interface TabData {
  typeId: string;
  typeName: string;
  workspaceId: string;
  widgets: Widget[];
  records: string;
}

export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}
