import { useApi, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import { InputHandling, typeChecking } from '../../../utils';
import GridWrapper from '../GridWrapper/GridWrapper';
import styles from './RecordCreation.module.scss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import throttle from "lodash/throttle";
import { TabPanel, TabContext } from '@mui/lab';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Box,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Dialog,
  DialogContent,
  Stack,
  DialogActions,
  Tab,
  Tabs,
  AppBar,
} from '@mui/material';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import {
  // GetTableColumnData,
  GetTableColumnDataV2,
  GetTableData,
  EffectColumn,
  MisColumnInputType,
} from 'libs/common/src/lib/api/recordService';
// import throttle from "lodash/throttle";
import { Widget } from 'libs/common/src/lib/context';
import { WidgetContextProvider } from 'libs/common/src/lib/context/WidgetContext';
import WidgetHandler from 'libs/common/src/lib/context/WidgetHandler';
import debounce from 'lodash/debounce';
import { DateTime } from 'luxon';
import { useEffect, useState, useRef, useMemo, ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import SimpleBar from 'simplebar-react';

const PositionCreation = () => {
  const client = useApi();

  const { closeCurrentOverlay, data: overlayData } = useOverlay('Record Creation');
  const { data, updateWidget, config } = useWidget<{ id: string; tableId: string }>(
    'Position Creation'
  );
  const queryClient = useQueryClient();

  const {
    unregister,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<Record<string, { input_type: MisColumnInputType; value: string | null }>>({
    shouldUnregister: true,
  });

  const [tableId, setTableId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [tableColumnData, setTableColumnData] = useState<GetTableColumnDataV2[]>([]);
  const [suggestionColumns, setSuggestionColumns] = useState<Record<string, GetTableData[]>>({});
  const checkData = useRef<string>('false');
  const BulkCreateData = useRef<string>('');
  const draftData = useRef<string>('');
  const [tabsId, setTabsId] = useState<string>('');
  const [tabDatas, setTabDatas] = useState<TabData[]>([]);
  let token = sessionStorage.getItem('token');
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
  const [isHadCreateDialogOpen, setIsHadCreateDialogOpen] = useState(false);
  const setUserId = useRef('');
  const createRecId = useRef('');
  const createTypeId = useRef('');
  const createProcessId = useRef('CreateDataProcess');
  const [excludeList, setExcludeList] = useState<Role[]>([]);
  const isAdmin = useRef('N');
  const { data: tableName } = useQuery(
    'record table',
    async () => {
      const { data: tableResponse } = await client.recordManage.getTableName();
      return tableResponse;
    },
    {
      onSuccess(data) {
        console.log(data);

        // setTableId(data[0]?.key ?? '');
      },
    }
  );
  const { data: tabsList, refetch: tabRefetch } = useQuery(
    ['tabs', tableId],
    async () => {
      const { data: tabsResponse } = await client.recordManage.getTabsConf({
        id: tableId,
      });
      return tabsResponse;
    },
    {
      enabled: !!tableId,
      onSuccess(data: any) {
        if (data.length > 0) {
          setTabsId(data[0].typeId);
          setTabDatas(
            data.map((item: any) => {
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
            })
          );
          data.map((item: any) => {
            sessionStorage.removeItem(token + 'cre_' + item.typeId);
            sessionStorage.removeItem(token + 'cre_add_' + item.typeId);
            sessionStorage.removeItem(token + 'cre_save_' + item.typeId);
          });
          updateWidget('Child Record List', {
            typeId: data[0].typeId,
            tab: 0,
            edit: 1,
          });
        } else {
          setTabDatas([]);
        }
      },
    }
  );
  const { refetch } = useQuery(
    ['table column', tableId],
    async () => {
      const { data: tableResponse } = await client.recordManage.getTableColumn({
        id: tableId,
      });
      return tableResponse;
    },
    {
      enabled: !!tableId,

      onSuccess(data) {
        setTableColumnData(data);
      },
    }
  );
  const insertCol = useMutation(client.recordManage.insertTableData, {
    onSuccess: (data: any) => {
      // updateWidget('table column');
      //refetch();
      queryClient.invalidateQueries('Record table');
      //toast.success('Record created successfully');
      reset({});
      //closeCurrentOverlay();
      createRecId.current = data.data.recordId;
      createTypeId.current = data.data.typeId;
      setTableId('');
      setTabDatas([]);
      setTableColumnData([]);
      //isAdmin.current=data.data.isAdmin;
      if (draftData.current == '' && data.data.isAdmin != 'Y') {
        setIsHadCreateDialogOpen(true);
      }else{
        toast.success('Record created successfully');
        closeCurrentOverlay();
      }
    },
  });

  const { data: groupDefaultFolder } = useQuery(
    'groupDefaultFolder',
    async () => {
      const { data: response } = await client.userPermission.getGroupDefaultFolderByGroupId();
      console.log('res================', response);
      return response;
    },
    {
      initialData: queryClient.getQueryData('groupDefaultFolder'),
    }
  );
  const { data: sysDefaultFolder } = useQuery(
    'sysDefaultFolder',
    async () => {
      const { data: response } = await client.sysConfig.findSysConfigByKey({
        misSysConfigKey: 'defaultFolder',
      });
      return response;
    },
    {
      initialData: queryClient.getQueryData('sysDefaultFolder'),
    }
  );
  const processChange = (
    evt: ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
    effect?: EffectColumn[]
  ) => {
    onChange(evt);
    if (effect) {
      debounceResult(effect[0]);
    }
  };
  const execEffect = (effect: Array<EffectColumn>) => {
    effect.forEach((e) => {
      console.log(e);
      const param = e.from.split(',').reduce((prev: { [key: string]: any }, columnName) => {
        prev[columnName] = getValues(columnName).value;
        return prev;
      }, {});
      const target = tableColumnData
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
            // setTableColumnData([...tableColumnData]);
          });
      }
    });
  };
  useEffect(() => {
    getUserList();
    if (data?.id) {
      setFolderId(data.id);
    }
  }, [data?.id]);
  useEffect(() => {
    console.log(data.tableId);

    setTableId(data.tableId ?? (tableName && tableName[0].key));
  }, [data?.tableId]);
  const submitHandling = (formData: any) => {
    console.log("Logging formData");
    console.log(formData);
    let simIds = '';
    let saveValues = '';
    tabDatas.map((item: any) => {
      if (sessionStorage.getItem(token + 'cre_' + item.typeId)) {
        simIds = simIds + item.typeId + '&';
        simIds += sessionStorage.getItem(token + 'cre_' + item.typeId);
        if (simIds != '') {
          simIds += ':';
        }
      }
      if (sessionStorage.getItem(token + 'cre_save_' + item.typeId)) {
        saveValues = saveValues + item.typeId + '%';
        saveValues += sessionStorage.getItem(token + 'cre_save_' + item.typeId);
        if (saveValues != '') {
          saveValues += '@';
        }
      }
    });
    if (!folderId) {
      if (groupDefaultFolder) {
        console.log('groupDefaultFolder================', groupDefaultFolder);
        insertCol.mutate({
          folder_id: groupDefaultFolder ?? '',
          tableId,
          data: formData,
          checkData: checkData.current,
          BulkCreateData: BulkCreateData.current,
          simIds: simIds,
          tabValue: saveValues,
          isDraft: draftData.current,
          saveDraft: draftData.current,
        });
      } else if (sysDefaultFolder) {
        console.log('sysDefaultFolder================', sysDefaultFolder);
        insertCol.mutate({
          folder_id: sysDefaultFolder?.misSysConfigValue ?? '',
          tableId,
          data: formData,
          checkData: checkData.current,
          BulkCreateData: BulkCreateData.current,
          simIds: simIds,
          tabValue: saveValues,
          isDraft: draftData.current,
          saveDraft: draftData.current,
        });
      }
    } else {
      insertCol.mutate({
        folder_id: folderId ?? '',
        tableId,
        data: formData,
        checkData: checkData.current,
        BulkCreateData: BulkCreateData.current,
        simIds: simIds,
        tabValue: saveValues,
        isDraft: draftData.current,
        saveDraft: draftData.current,
      });
    }
  };
  const handleCheckBox = (event: any) => {
    checkData.current = event.target.checked;
    console.log(checkData.current + '=====' + checkData);
  };
  const handleMultiData = (event: any) => {
    BulkCreateData.current = event.target.value;
    console.log(BulkCreateData.current + '=====' + BulkCreateData);
  };

  const initWorkflow = useMutation(client.workflow.initWorkflow, {
    onSuccess: (data) => {
      if ((data.status = 200)) {
        submitWorkflow.mutate({
          comment: '',
          workflowId: data.data,
          userId: setUserId.current,
          submissionDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
        });
      }
    },
  });
  const submitWorkflow = useMutation(client.workflow.submitWorkflow, {
    onSuccess: (data) => {},
  });

  const getUserList = async () => {
    const { data: userData } = await client.userService.getUserInfoByGroup();
    setExcludeList(userData.map((item) => ({ ...item, type: '4', checked: false })));
  };
  return (
    <>
      {tableName && (
        <FormControl variant="standard" className={styles.selector}>
          <InputLabel id="demo-simple-select-label">Table</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={tableId}
            displayEmpty
            renderValue={(value) => {
              console.log(value);
              return (tableName && tableName.find((item) => item.key === value)?.value) ?? '';
            }}
            // defaultValue={tableName[0].key}
            onChange={(evt) => {
              setTableId(evt.target.value);
              unregister(
                tableColumnData?.map((item) => item.columns.map((i) => i.misColumnName)).flat()
              );
              updateWidget('Child Record List', {
                searchParams: null,
                simpleSearchParams: null,
                tab: 0,
                typeId: evt.target.value,
              });
            }}
          >
            {Array.isArray(tableName) &&
              tableName.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.value}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {folderId || sysDefaultFolder || groupDefaultFolder ? (
        <form onSubmit={handleSubmit(submitHandling)}>
          <Box
            sx={{
              ['.MuiPaper-root:last-child']: {
                marginBottom: '1rem !important',
              },
            }}
          >
            {tableColumnData &&
              tableColumnData.map(({ columns, name, misPropertySectionId }) => (
                <Accordion key={misPropertySectionId} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>{name}</AccordionSummary>
                  <AccordionDetails className={styles.form}>
                    {columns
                      ?.filter((c) => c.misColumnInputType != '9')
                      .map((item) => (
                        <Controller
                          key={item.misColumnId}
                          name={item.misColumnName}
                          defaultValue={{
                            input_type: item.misColumnInputType,
                            value: null,
                          }}
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
                          control={control}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <InputHandling
                              misColumnLabel={item.misColumnLabel}
                              suggestionColumns={suggestionColumns[item.misColumnName]}
                              misColumnInputType={item.misColumnInputType}
                              columnLs={item.columnLs}
                              value={value}
                              onChange={(evt) => processChange(evt, onChange, item.effect)}
                              disabled={item.misColumnInputType === '5'}
                              error={error}
                              style={{
                                gridColumn: `span ${item?.colSize}`,
                                gridRow: `span ${item?.rowSize}`,
                                minWidth: '150px',
                              }}
                            />
                          )}
                        />
                      ))}
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>
          <Paper style={{ marginTop: '50px', marginBottom: '20px' }}>
            {tabDatas.length > 0 && (
              <AppBar position="static">
                <Tabs
                  value={tabsId}
                  variant='scrollable'
                  scrollButtons='auto'
                  aria-label="simple tabs example"
                  onChange={(_, val) => {
                    setTabsId(val);
                    updateWidget('Child Record List', {
                      typeId: val,
                      searchParams: null,
                      simpleSearchParams: null,
                      tab: 0,
                    });
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
                    {item.widgets.map((widget) => (
                      // <GridWrapper
                      //   title={widget.title}
                      //   showTitleBar={true}
                      //   key={widget.id}
                      //   widget={widget}
                      // />
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
          {/* <FormControlLabel
            control={<Checkbox onChange={handleCheckBox} name="BulkCreate" />}
            label="Bulk Create"
          /> */}
          {/* <TextField id="standard-basic" label="Multi Data" onChange={handleMultiData} /> */}
          &nbsp;&nbsp;&nbsp;
          <Button variant="contained" type="submit" onClick={() => (draftData.current = '')}>
            Create
          </Button>
          &nbsp;&nbsp;&nbsp;
          {/* <Button
            variant="contained"
            name="Save as Draft"
            type="submit"
            onClick={() => (draftData.current = 'Save as Draft')}
          >
            Save as Draft
          </Button> */}
        </form>
      ) : (
        <Paper
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <AiFillFolderOpen size={40} />
          <Box sx={{ mt: 1 }}>Please Select a Folder</Box>
        </Paper>
      )}
      <Paper>
        <Dialog open={isHadCreateDialogOpen}>
          <form
            onSubmit={handleSubmit(
              (data) => {
                let attachments: any = [];
                attachments.push({ typeId: createTypeId.current, recId: createRecId.current });
                console.log(
                  tabsId +
                    '===' +
                    tableId +
                    '====' +
                    createRecId.current +
                    '====' +
                    setUserId.current
                );
                //toUserId.current = data.toUserId;
                initWorkflow.mutate({
                  processName: createProcessId.current,
                  attachments: attachments,
                  //supervisor: data.supervisor,
                  initiateDate: DateTime.now().toFormat('dd-MM-yyyy HH:mm:ss'),
                });
                setIsHadCreateDialogOpen(false);
                createTypeId.current='';
                toast.success('Record created successfully');
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
                        onChange={(e: any) => {
                          console.log('e.target.value====' + e.target.value);
                          setUserId.current = e.target.value;
                        }}
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
                  setIsHadCreateDialogOpen(false);
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

export default PositionCreation;

export interface Role {
  id: string;
  name: string;
  type?: string;
  checked?: boolean;
}

export interface TabData {
  typeId: string;
  typeName: string;
  workspaceId: string;
  widgets: Widget[];
}
