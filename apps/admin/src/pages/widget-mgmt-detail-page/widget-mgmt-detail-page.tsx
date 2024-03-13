import BasicSelectedItemList, {
  DataItem,
} from '../../components/molecules/SelectedItemList/BasicSelectedItemList';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ListItem,
  ListItemText,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import { QueryTableDetail, WidgetItem } from 'libs/common/src/lib/api';
import { GraphicsTypeData } from 'libs/common/src/lib/constant';
import { Widget } from 'libs/common/src/lib/context';
import { WidgetContextProvider } from 'libs/common/src/lib/context/WidgetContext';
import WidgetHandler from 'libs/common/src/lib/context/WidgetHandler';
import { useApi } from 'libs/common/src/lib/hooks';
import WidgetContainer from 'libs/common/src/lib/widget/molecules/WidgetContainer/WidgetContainer';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const componentProperties: { key: string; title: string }[] = [
  { key: 'My Inbox', title: 'My Inbox' },
  { key: 'My Outbox', title: 'My Outbox' },
  { key: 'My Subscriptions', title: 'My Subscriptions' },
  { key: 'My Search', title: 'My Search' },
  { key: 'Folder Browser', title: 'Folder Browser' },
  { key: 'Search Form', title: 'Search Form' },
  { key: 'Record List', title: 'Record List' },
  { key: 'Child Record List', title: 'Child Record List' },
  { key: 'Query Record List', title: 'Query Record List' },
  { key: 'Properties', title: 'Properties' },
  { key: 'Org Chart', title: 'Org Chart' },
  { key: 'Member', title: 'Member' },
  { key: 'Record Creation', title: 'Record Creation' },
  { key: 'Had Record Creation', title: 'Had Record Creation' },
  { key: 'Data Dictionary', title: 'Data Dictionary' },
  { key: 'Data Export', title: 'Data Export' },
  { key: 'Report', title: 'Report' },
  { key: 'Permission', title: 'Permission' },
  { key: 'Preference', title: 'Preference' },
  { key: 'Data Import', title: 'Data Import' },
  { key: 'Content Creation', title: 'Content Creation' },
  { key: 'Rendition', title: 'Rendition' },
  { key: 'Version', title: 'Version' },
  { key: 'AutolinkDetailpage', title: 'Autolink' },
  { key: 'GIS', title: 'GIS' },
  { key: 'EmailEditor', title: 'Email Editor' },
  { key: 'Simple Search', title: 'Simple Search' },
  { key: 'Task Comment', title: 'Task Comment' },
  { key: 'Task Detail', title: 'Task Detail' },
  { key: 'Record Comparison', title: 'Record Comparison' },
  { key: 'Record History', title: 'Record History' },
  { key: 'User Admin', title: 'User Admin' },
  { key: 'Position Management', title: 'Position Management' },
  { key: 'Position Creation', title:'Position Creation'},
  { key: 'Publication', title: 'Publication' },
];

const widgetTypes: { key: string; value: string }[] = [
  { key: 'N', value: 'Normal' },
  { key: 'D', value: 'Dialog' },
  { key: 'S', value: 'SideBar' },
];

//const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetMgmtDetail = () => {
  const { search } = useLocation();
  const history = useHistory();
  const client = useApi();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);
  const [includeList, setIncludeList] = useState<DataItem[]>([]);
  const [excludeList, setExcludeList] = useState<DataItem[]>([]);
  const [includeQueryList, setIncludeQueryList] = useState<DataItem[]>([]);
  const [excludeQueryList, setExcludeQueryList] = useState<DataItem[]>([]);
  const [tableList, setTableList] = useState<DataItem[]>([]);
  const [isChange, setIsChange] = useState<boolean>(false);
  const [tableIdList, setTableIdList] = useState<string[]>([]);
  const { data: WidgetDetail } = useQuery(
    ['WidgetItemQuery', paramId],
    async () => {
      const { data: response } = await client.widget.getWidgetById({
        id: paramId ?? '',
      });
      return response;
    },
    {
      enabled: !!paramId,
      onSuccess(data) {
        if (data?.list.includeList) {
          setIncludeList([...data?.list.includeList]);
        }
        if (data?.list.excludeList) {
          setExcludeList([...data?.list.excludeList]);
        }
        if (data?.list.includeQueryList) {
          setIncludeQueryList([...data?.list.includeQueryList]);
        }
        if (data?.list.excludeQueryList) {
          setExcludeQueryList([...data?.list.excludeQueryList]);
        }
        reset({
          misWidgetId: data.misWidgetId,
          misWidgetName: data.misWidgetName,
          misBasicWidget: data.misBasicWidget,
          misWidgetConfig: data.misWidgetConfig,
          misWidgetType: data.misWidgetType,
          misDefaultTable: data.misDefaultTable,
          misSimpleSearchId: data?.misSimpleSearchId,
          misQuerySql: data?.misQuerySql,
          tableIds: data.misDefaultTable ? data.misDefaultTable.split(',') : [],
          list: data.list,
        });
      },
    }
  );
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
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<WidgetItem>({
    mode: 'onSubmit',
    defaultValues: {
      misWidgetId: WidgetDetail?.misWidgetId,
      misWidgetName: WidgetDetail?.misWidgetName,
      misBasicWidget: WidgetDetail?.misBasicWidget,
      misWidgetConfig: WidgetDetail?.misWidgetConfig,
      misWidgetType: WidgetDetail?.misWidgetType,
      misDefaultTable: WidgetDetail?.misDefaultTable,
      misSimpleSearchId: WidgetDetail?.misSimpleSearchId,
      misQuerySql: WidgetDetail?.misQuerySql,
      tableIds: tableIdList,
      list: {},
    },
  });

  const { data: tableData } = useQuery(
    ['GetTableData'],
    async () => {
      const { data: response } = await client.biTool.queryTableData();
      return response;
    },
    {
      enabled:
        watch('misBasicWidget') === 'Record List' ||
        watch('misBasicWidget') === 'Query Record List',
      onSuccess(data) {
        let tablesIds: string[] = [];
        for (let d of data) {
          tablesIds.push(d.misTypeId);
        }
        setTableIdList([...tablesIds]);
        setTableList(
          data.map((item: any) => {
            return {
              id: item.misTypeId,
              name: item.misTypeLabel,
              type: '4',
              checked: false,
            };
          })
        );
      },
    }
  );

  const { data: simpleSearchDic } = useQuery(
    ['GetSimpleSearchDic'],
    async () => {
      const { data: response } = await client.simpleSearch.getSimpleSearchDic();
      return response;
    },
    {
      enabled: watch('misBasicWidget') === 'Simple Search',
    }
  );

  const { data: columnData } = useQuery(
    ['GetColumnData', watch('misDefaultTable')],
    async () => {
      const { data: response } = await client.queryForm.getColumnDic({
        id: watch('misDefaultTable') ?? '',
        // allowSearch:'Y',
      });
      // const array: QueryTableDetail[] = response;
      console.log('response=============', response);
      console.log(' watch-misBasicWidget=============', getValues('list'));

      return response;
    },
    {
      enabled: watch('misBasicWidget') === 'Record List' && isChange,
      onSuccess(data) {
        if (data) {
          setIncludeList([]);
          setExcludeList(
            data?.map(({ key: id, value: name }: any) => ({
              id,
              name,
            }))
          );
        }
      },
    }
  );

  const { data: queryColumnData } = useQuery(
    ['GetQueryColumnData', watch('tableIds')],
    async () => {
      const { data: response } = await client.queryForm.getQueryColumnDic({
        id: watch('tableIds') ? watch('tableIds').join(',') : '',
        // allowSearch:'Y',
      });
      return response;
    },
    {
      enabled: watch('misBasicWidget') === 'Query Record List' && isChange,
      onSuccess(data) {
        if (data) {
          setIncludeQueryList([]);
          setExcludeQueryList(
            data?.map(({ key: id, value: name }: any) => ({
              id,
              name,
            }))
          );
        }
      },
    }
  );
  const submitHandling = (data: any) => {
    if (paramId) {
      EditWidget.mutate({
        misWidgetId: paramId,
        misWidgetName: data.misWidgetName,
        misBasicWidget: data.misBasicWidget,
        misWidgetConfig: data.misWidgetConfig,
        misWidgetType: data.misWidgetType,
        misDefaultTable:
          'Query Record List' === data.misBasicWidget
            ? data.tableIds.join(',')
            : data.misDefaultTable,
        misSimpleSearchId: data.misSimpleSearchId,
        misQuerySql: data.misQuerySql,
        tableIds: data.tableIds.join(','),
        list: data.list,
      });
    } else {
      AddWidget.mutate({
        misWidgetId: data.misWidgetId,
        misWidgetName: data.misWidgetName,
        misBasicWidget: data.misBasicWidget,
        misWidgetConfig: data.misWidgetConfig,
        misWidgetType: data.misWidgetType,
        misDefaultTable:
          'Query Record List' === data.misBasicWidget
            ? data.tableIds.join(',')
            : data.misDefaultTable,
        misSimpleSearchId: data.misSimpleSearchId,
        misQuerySql: data.misQuerySql,
        tableIds: data.tableIds.join(','),
        list: data.list,
      });
    }
  };

  const EditWidget = useMutation(client.widget.editWidget, {
    onSuccess: () => {
      history.push(route.widgetMgmt);
      toast('Update Successfully', {
        type: 'success',
      });
    },
  });

  const AddWidget = useMutation(client.widget.addWidget, {
    onSuccess: () => {
      history.push(route.widgetMgmt);
      toast('Add Successfully', {
        type: 'success',
      });
    },
  });
  const JSONParsing = (val: string) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.log(e);
      return {};
    }
  };
  const basicWidget = {
    key: watch('misBasicWidget') as keyof typeof WidgetHandler,
    title: watch('misBasicWidget'),
    id: watch('misBasicWidget'),
    configId: '',
    config: JSONParsing(watch('misWidgetConfig') ?? '{}'),
    editMode: true,
  };
  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <form
        onSubmit={handleSubmit(submitHandling, () => {
          console.log('lsit', getValues('list'));
          if (getValues('list') && getValues('list')?.includeList?.length === 0) {
            setError('list', {
              message: 'Selected Workspace list cannot be empty',
            });
          } else {
            console.log('lsit1111111', getValues('list'));
            clearErrors('list');
          }
        })}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 3,
            minWidth: '500px',
            minHeight: '700px',
            padding: 3,
          }}
        >
          <h4>{'Widget Config'}</h4>
          <Controller
            name="misWidgetName"
            control={control}
            rules={{
              required: 'This Widget Name is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                id="standard-multiline-static"
                InputLabelProps={{ shrink: !!value || isDirty }}
                error={!!errors.misWidgetName}
                onChange={onChange}
                value={value}
                fullWidth
                label="Widget Name"
                sx={{ width: '200px', marginTop: 2 }}
                helperText={errors.misWidgetName?.message as string}
              />
            )}
          />

          <Controller
            name="misBasicWidget"
            control={control}
            rules={{
              required: 'This config type is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <FormControl variant="standard" sx={{ width: '200px' }}>
                <InputLabel shrink={!!value}>Basic Widget</InputLabel>
                <Select
                  displayEmpty
                  notched={!!value}
                  renderValue={(newVal) =>
                    componentProperties?.find((item: any) => item.key === newVal)?.title ??
                    componentProperties?.find(
                      (item: any) => item.key === WidgetDetail?.misBasicWidget
                    )?.title
                  }
                  error={!!errors.misBasicWidget}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? WidgetDetail?.misBasicWidget}
                  defaultValue={WidgetDetail?.misBasicWidget ?? ''}
                  onChange={onChange}
                >
                  {componentProperties?.map((item: any) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.title}
                      </MenuItem>
                    );
                  })}
                </Select>
                {!!errors.misBasicWidget && (
                  <FormHelperText error>{errors?.misBasicWidget.message as string}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {watch('misBasicWidget') === 'Record List' && (
            <>
              <Controller
                name="misDefaultTable"
                control={control}
                rules={{
                  required: 'This default table is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel shrink={!!value}>Default Table</InputLabel>
                    <Select
                      displayEmpty
                      notched={!!value}
                      renderValue={(newVal) =>
                        tableData?.find((item: any) => item.misTypeId === newVal)?.misTypeLabel ??
                        tableData?.find(
                          (item: any) => item.misTypeId === WidgetDetail?.misDefaultTable
                        )?.misTypeLabel
                      }
                      error={!!errors.misDefaultTable}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? WidgetDetail?.misDefaultTable}
                      defaultValue={WidgetDetail?.misDefaultTable ?? ''}
                      onChange={(e) => {
                        onChange(e);
                        setIsChange(true);
                      }}
                    >
                      {tableData?.map((item: any) => {
                        return (
                          <MenuItem key={item.misTypeId} value={item.misTypeId}>
                            {item.misTypeLabel}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.misDefaultTable && (
                      <FormHelperText error>
                        {errors?.misDefaultTable.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Query Record List' && (
            <>
              <Controller
                name="tableIds"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel id="demo-multiple-checkbox-label">Table</InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        setIsChange(true);
                      }}
                      renderValue={(selected) =>
                        selected
                          .map(
                            (selectedId: string) =>
                              tableList.find((listItem) => listItem.id === selectedId)?.name ?? ''
                          )
                          .join(', ')
                      }
                      MenuProps={MenuProps}
                    >
                      {tableList.map((listItem) => (
                        <MenuItem key={listItem.id} value={listItem.id}>
                          <Checkbox checked={value.indexOf(listItem.id) > -1} />
                          <ListItemText primary={listItem.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Simple Search' && (
            <>
              <Controller
                name="misSimpleSearchId"
                control={control}
                rules={{
                  required: 'This Simple Search is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel shrink={!!value}>Simple Search</InputLabel>
                    <Select
                      displayEmpty
                      notched={!!value}
                      renderValue={(newVal) =>
                        simpleSearchDic?.find((item: any) => item.key === newVal)?.value ??
                        simpleSearchDic?.find(
                          (item: any) => item.key === WidgetDetail?.misSimpleSearchId
                        )?.value
                      }
                      error={!!errors.misSimpleSearchId}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? WidgetDetail?.misSimpleSearchId}
                      defaultValue={WidgetDetail?.misSimpleSearchId ?? ''}
                      onChange={onChange}
                    >
                      {simpleSearchDic?.map((item: any) => {
                        return (
                          <MenuItem key={item.key} value={item.key}>
                            {item.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.misSimpleSearchId && (
                      <FormHelperText error>
                        {errors?.misSimpleSearchId.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </>
          )}
          <Controller
            name="misWidgetType"
            control={control}
            rules={{
              required: 'This widget type is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl variant="standard" sx={{ width: '200px' }}>
                <InputLabel id="demo-simple-select-standard-label" shrink={!!value}>
                  Widget Type
                </InputLabel>
                <Select
                  displayEmpty
                  renderValue={(newVal) =>
                    widgetTypes?.find((item: any) => item.key === newVal)?.value ??
                    widgetTypes?.find((item: any) => item.key === WidgetDetail?.misWidgetType)
                      ?.value
                  }
                  autoWidth
                  error={!!errors.misWidgetType}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? WidgetDetail?.misWidgetType}
                  onChange={onChange}
                >
                  {widgetTypes?.map((item: any) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                {!!errors.misWidgetType && (
                  <FormHelperText error>{errors?.misWidgetType.message as string}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="misWidgetConfig"
            control={control}
            rules={{
              required: 'This Widget Config is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                InputLabelProps={{ shrink: !!value || isDirty }}
                error={!!errors.misWidgetConfig}
                onChange={onChange}
                value={value}
                fullWidth
                label="Widget Config"
                sx={{ width: '200px', marginTop: 2 }}
                helperText={errors.misWidgetConfig?.message as string}
                rows={5}
                multiline
                variant="standard"
              />
            )}
          />
          {watch('misBasicWidget') === 'Query Record List' && (
            <>
              <Controller
                name="misQuerySql"
                control={control}
                render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
                  <TextField
                    InputLabelProps={{ shrink: !!value || isDirty }}
                    error={!!errors.misQuerySql}
                    onChange={onChange}
                    value={value}
                    fullWidth
                    label="Query Sql"
                    sx={{ width: '200px', marginTop: 2 }}
                    helperText={errors.misQuerySql?.message as string}
                    rows={5}
                    multiline
                    variant="standard"
                  />
                )}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Publication' && (
            <>
              <Controller
                name="misQuerySql"
                control={control}
                render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
                  <TextField
                    InputLabelProps={{ shrink: !!value || isDirty }}
                    error={!!errors.misQuerySql}
                    onChange={onChange}
                    value={value}
                    fullWidth
                    label="Query Sql"
                    sx={{ width: '200px', marginTop: 2 }}
                    helperText={errors.misQuerySql?.message as string}
                    rows={5}
                    multiline
                    variant="standard"
                  />
                )}
              />
            </>
          )}

          {watch('misBasicWidget') === 'Position Management' && (
            <>
              <Controller
                name="misQuerySql"
                control={control}
                render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
                  <TextField
                    InputLabelProps={{ shrink: !!value || isDirty }}
                    error={!!errors.misQuerySql}
                    onChange={onChange}
                    value={value}
                    fullWidth
                    label="Query Sql"
                    sx={{ width: '200px', marginTop: 2 }}
                    helperText={errors.misQuerySql?.message as string}
                    rows={5}
                    multiline
                    variant="standard"
                  />
                )}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Record List' && (
            <>
              <Typography variant="inherit">Display Column：</Typography>
              <BasicSelectedItemList
                getIncludeList={includeList}
                getExcludeList={excludeList}
                error={errors.list?.message}
                hasSelectAll={false}
                // height="50vh"
                onChange={(data) => {
                  console.log('data========', data);
                  setValue('list', data);
                }}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Position Management' && (
            <>
              <Controller
                name="misQuerySql"
                control={control}
                render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
                  <TextField
                    InputLabelProps={{ shrink: !!value || isDirty }}
                    error={!!errors.misQuerySql}
                    onChange={onChange}
                    value={value}
                    fullWidth
                    label="Query Sql"
                    sx={{ width: '200px', marginTop: 2 }}
                    helperText={errors.misQuerySql?.message as string}
                    rows={5}
                    multiline
                    variant="standard"
                  />
                )}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Record List' && (
            <>
              <Typography variant="inherit">Display Column：</Typography>
              <BasicSelectedItemList
                getIncludeList={includeList}
                getExcludeList={excludeList}
                error={errors.list?.message}
                hasSelectAll={false}
                // height="50vh"
                onChange={(data) => {
                  console.log('data========', data);
                  setValue('list', data);
                }}
              />
            </>
          )}
          {watch('misBasicWidget') === 'Query Record List' && (
            <>
              <Typography variant="inherit">Display Column：</Typography>
              <BasicSelectedItemList
                getIncludeList={includeQueryList}
                getExcludeList={excludeQueryList}
                error={errors.list?.message}
                hasSelectAll={false}
                // height="50vh"
                onChange={(data) => {
                  console.log('data========', data);
                  setValue('list', data);
                }}
              />
            </>
          )}

          <br></br>
          <Stack direction="row" spacing={2} mb={2}>
            <Button variant="contained" type="submit" size="small">
              Submit
            </Button>

            <Button size="small" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </form>

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'start',
          alignItems: 'center',
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '500px',
            minHeight: '700px',
            padding: 3,
          }}
        >
          <WidgetContainer
            sx={{
              width: `500px`,
            }}
          >
            <WidgetContextProvider {...basicWidget} breakpoint="sm" width={500}>
              <SimpleBar style={{ maxWidth: `500px`, maxHeight: `700px` }}>
                {WidgetHandler[basicWidget.key as keyof typeof WidgetHandler]}
              </SimpleBar>
            </WidgetContextProvider>
          </WidgetContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default WidgetMgmtDetail;
