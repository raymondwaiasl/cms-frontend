import { BiChart, SelectedItemList } from '../../components';
import type { DataItem } from '../../components/molecules/SelectedItemList/SelectedItemList';
import { Height, Inbox as InboxIcon, Mail as MailIcon, Preview } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import route from 'apps/admin/src/router/route';
import { BiToolInfo2 } from 'libs/common/src/lib/api';
import { DefaultViewData, GraphicsTypeData, BiConfigType } from 'libs/common/src/lib/constant';
import { useApi } from 'libs/common/src/lib/hooks';
import type { DateTime } from 'luxon';
import { useMemo } from 'react';
import 'react-grid-layout/css/styles.css';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const BiToolDetailPage = () => {
  const client = useApi();
  const history = useHistory();
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);

  const submitHandling = (data: any) => {
    if (paramId) {
      UpdateBiTool.mutate({
        misBiConfigId: paramId,
        misBiConfigName: data.misBiConfigName,
        misBiConfigTypeId: data.misBiConfigTypeId,
        misBiConfigType: data.misBiConfigType,
        misTypeName: data.misTypeName,
        misBiConfigGraphicType: data.misBiConfigGraphicType,
        misBiConfigColumnHor: data.misBiConfigColumnHor,
        misBiConfigColumnVet: data.misBiConfigColumnVet,
        misBiConfigDefView: data.misBiConfigDefView,
      });
    } else {
      AddBiTool.mutate({
        misBiConfigName: data.misBiConfigName,
        misBiConfigTypeId: data.misBiConfigTypeId,
        misBiConfigType: data.misBiConfigType,
        misTypeName: data.misTypeName,
        misBiConfigGraphicType: data.misBiConfigGraphicType,
        misBiConfigColumnHor: data.misBiConfigColumnHor,
        misBiConfigColumnVet: data.misBiConfigColumnVet,
        misBiConfigDefView: data.misBiConfigDefView,
      });
    }
  };

  const { data: tableData } = useQuery(['GetTableData'], async () => {
    const { data: response } = await client.biTool.queryTableData();
    return response;
  });

  const { data: biToolInfoDetail } = useQuery(
    ['BiInfoQuery', paramId],
    async () => {
      const { data: response } = await client.biTool.getBiTool({
        misBiConfigId: paramId ?? '',
      });
      return response;
    },
    {
      enabled: !!paramId,
      onSuccess(data) {
        reset({
          misBiConfigId: data.misBiConfigId,
          misBiConfigName: data.misBiConfigName,
          misBiConfigType: data.misBiConfigType,
          misBiConfigTypeId: data.misBiConfigTypeId,
          misBiConfigGraphicType: data.misBiConfigGraphicType,
          misBiConfigColumnHor: data.misBiConfigColumnHor,
          misBiConfigColumnVet: data.misBiConfigColumnVet,
          misBiConfigDefView: data.misBiConfigDefView,
        });
      },
    }
  );

  const UpdateBiTool = useMutation(client.biTool.editBiTool, {
    onSuccess: () => {
      history.push(route.biToolConfig);
      toast('Update Successfully', {
        type: 'success',
      });
    },
  });

  const AddBiTool = useMutation(client.biTool.addBiTool, {
    onSuccess: () => {
      history.push(route.biToolConfig);
      toast('Add Successfully', {
        type: 'success',
      });
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BiToolInfo2>({
    mode: 'onSubmit',
    defaultValues: {
      misBiConfigId: biToolInfoDetail?.misBiConfigId,
      misBiConfigName: biToolInfoDetail?.misBiConfigName,
      misBiConfigType: biToolInfoDetail?.misBiConfigType,
      misBiConfigTypeId: biToolInfoDetail?.misBiConfigTypeId,
      misBiConfigColumnHor: biToolInfoDetail?.misBiConfigColumnHor,
      misBiConfigColumnVet: biToolInfoDetail?.misBiConfigColumnVet,
      misBiConfigGraphicType: biToolInfoDetail?.misBiConfigGraphicType,
      misBiConfigDefView: biToolInfoDetail?.misBiConfigDefView,
    },
  });

  const misBiConfigTypeId = useMemo(
    () => watch('misBiConfigTypeId') ?? biToolInfoDetail?.misBiConfigTypeId,
    [watch('misBiConfigTypeId'), biToolInfoDetail?.misBiConfigTypeId]
  );

  const misBiConfigType = watch('misBiConfigType');

  const { data: columnData } = useQuery(
    ['GetTableColumnData', misBiConfigTypeId],
    async () => {
      const { data: columnData } = await client.biTool.queryColumnData({
        misBiConfigTypeId: misBiConfigTypeId,
      });
      return columnData;
    },
    {
      enabled: !!misBiConfigTypeId,
      onSuccess: () => {
        //setValue('misBiConfigColumnHor', biToolInfoDetail?.misBiConfigColumnHor);
      },
    }
  );

  const { data: allData, mutate } = useMutation(client.biTool.countTableColumnData);
  const { data: allDataByDate, mutate: mutateByDate } = useMutation(
    client.biTool.countTableColumnDataByDate
  );

  const { data: allDataByWorkFlow, mutate: mutateByWorkFlow } = useMutation(
    client.biTool.countWorkFlowData
  );
  const { data: allDataByWorkFlowDate, mutate: mutateByWorkFlowDate } = useMutation(
    client.biTool.countWorkFlowDataByDate
  );

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <form onSubmit={handleSubmit(submitHandling)}>
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 3,
            minWidth: '300px',
            minHeight: '700px',
            padding: 3,
          }}
        >
          <h4>{'Dashboard Config'}</h4>
          <Controller
            name="misBiConfigName"
            control={control}
            rules={{
              required: 'This Widget Name is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                InputLabelProps={{ shrink: !!value || isDirty }}
                error={!!errors.misBiConfigName}
                onChange={onChange}
                value={value}
                fullWidth
                label="Widget Name"
                sx={{ width: '200px', marginTop: 2 }}
                helperText={errors.misBiConfigName?.message as string}
              />
            )}
          />

          <Controller
            name="misBiConfigType"
            control={control}
            rules={{
              required: 'This config type is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <FormControl variant="standard" sx={{ width: '200px' }}>
                <InputLabel shrink={!!value}>Config Type</InputLabel>
                <Select
                  displayEmpty
                  notched={!!value}
                  renderValue={(newVal) =>
                    BiConfigType?.find((item: any) => item.key === newVal)?.value ??
                    BiConfigType?.find(
                      (item: any) => item.key === biToolInfoDetail?.misBiConfigType
                    )?.value
                  }
                  error={!!errors.misBiConfigType}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? biToolInfoDetail?.misBiConfigType}
                  defaultValue={biToolInfoDetail?.misBiConfigType ?? ''}
                  onChange={onChange}
                >
                  {BiConfigType?.map((item: any) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                {!!errors.misBiConfigType && (
                  <FormHelperText error>{errors?.misBiConfigType.message as string}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {misBiConfigType === 'defined_table' && (
            <>
              <Controller
                name="misBiConfigTypeId"
                control={control}
                rules={{
                  required: 'This table is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel shrink={!!value}>Table</InputLabel>
                    <Select
                      displayEmpty
                      notched={!!value}
                      renderValue={(newVal) =>
                        tableData?.find((item: any) => item.misTypeId === newVal)?.misTypeName ??
                        tableData?.find(
                          (item: any) => item.misTypeId === biToolInfoDetail?.misBiConfigTypeId
                        )?.misTypeName
                      }
                      error={!!errors.misBiConfigTypeId}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? biToolInfoDetail?.misBiConfigTypeId}
                      defaultValue={biToolInfoDetail?.misBiConfigTypeId ?? ''}
                      onChange={onChange}
                    >
                      {tableData?.map((item: any) => {
                        return (
                          <MenuItem key={item.misTypeId} value={item.misTypeId}>
                            {item.misTypeName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.misBiConfigTypeId && (
                      <FormHelperText error>
                        {errors?.misBiConfigTypeId.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="misBiConfigColumnHor"
                control={control}
                rules={{
                  required: 'This Horizontal Column is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel shrink={!!value}>Horizontal Column</InputLabel>
                    <Select
                      displayEmpty
                      notched={!!value}
                      renderValue={(newVal) =>
                        columnData?.find((item: any) => item.key === newVal)?.value ??
                        columnData?.find(
                          (item: any) => item.key === biToolInfoDetail?.misBiConfigColumnHor
                        )?.value
                      }
                      autoWidth
                      error={!!errors.misBiConfigColumnHor}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? biToolInfoDetail?.misBiConfigColumnHor}
                      onChange={onChange}
                      defaultValue={biToolInfoDetail?.misBiConfigColumnHor ?? ''}
                    >
                      {columnData?.map((item: any) => {
                        return (
                          <MenuItem key={item.key} value={item.key}>
                            {item.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.misBiConfigColumnHor && (
                      <FormHelperText error>
                        {errors?.misBiConfigColumnHor.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="misBiConfigColumnVet"
                control={control}
                rules={{
                  required: 'This Vertical Column is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel shrink={!!value}>Vertical Column</InputLabel>
                    <Select
                      displayEmpty
                      notched={!!value}
                      renderValue={(newVal) =>
                        columnData?.find((item: any) => item.value === newVal)?.value ??
                        columnData?.find(
                          (item: any) => item.value === biToolInfoDetail?.misBiConfigColumnVet
                        )?.value
                      }
                      autoWidth
                      error={!!errors.misBiConfigColumnVet}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? biToolInfoDetail?.misBiConfigColumnVet}
                      defaultValue={biToolInfoDetail?.misBiConfigColumnVet ?? ''}
                      onChange={onChange}
                    >
                      {columnData?.map((item: any) => {
                        return (
                          <MenuItem key={item.key} value={item.value}>
                            {item.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.misBiConfigColumnVet && (
                      <FormHelperText error>
                        {errors?.misBiConfigColumnVet.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </>
          )}

          <Controller
            name="misBiConfigDefView"
            control={control}
            rules={{
              required: 'This default view is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl variant="standard" sx={{ width: '200px' }}>
                <InputLabel id="demo-simple-select-standard-label" shrink={!!value}>
                  Default View
                </InputLabel>
                <Select
                  displayEmpty
                  renderValue={(newVal) =>
                    DefaultViewData?.find((item: any) => item.key === newVal)?.value ??
                    DefaultViewData?.find(
                      (item: any) => item.key === biToolInfoDetail?.misBiConfigDefView
                    )?.value
                  }
                  autoWidth
                  error={!!errors.misBiConfigDefView}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? biToolInfoDetail?.misBiConfigDefView}
                  onChange={onChange}
                >
                  {DefaultViewData?.map((item: any) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                {!!errors.misBiConfigDefView && (
                  <FormHelperText error>
                    {errors?.misBiConfigDefView.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="misBiConfigGraphicType"
            control={control}
            rules={{
              required: 'This Graphics Type is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl variant="standard" sx={{ width: '200px' }}>
                <InputLabel id="demo-simple-select-standard-label" shrink={!!value}>
                  Graphics Type
                </InputLabel>
                <Select
                  displayEmpty
                  renderValue={(newVal) =>
                    GraphicsTypeData?.find((item: any) => item.key === newVal)?.value ??
                    GraphicsTypeData?.find(
                      (item: any) => item.key === biToolInfoDetail?.misBiConfigGraphicType
                    )?.value
                  }
                  autoWidth
                  error={!!errors.misBiConfigGraphicType}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={value ?? biToolInfoDetail?.misBiConfigGraphicType}
                  onChange={onChange}
                >
                  {GraphicsTypeData?.map((item: any) => {
                    return (
                      <MenuItem key={item.key} value={item.key}>
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </Select>
                {!!errors.misBiConfigGraphicType && (
                  <FormHelperText error>
                    {errors?.misBiConfigGraphicType.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

          <br></br>
          <Stack direction="row" spacing={2} mb={2}>
            <Button variant="contained" type="submit" size="small">
              Submit
            </Button>
            <Button
              size="small"
              style={{ marginLeft: '20px' }}
              variant="contained"
              onClick={() => {
                if (watch('misBiConfigType') == 'defined_table') {
                  if (
                    watch('misBiConfigGraphicType') === '4' ||
                    watch('misBiConfigGraphicType') === '5'
                  ) {
                    return mutateByDate({
                      tableId: watch('misBiConfigTypeId'),
                      columnId: watch('misBiConfigColumnHor'),
                    });
                  }
                  return mutate({
                    tableId: watch('misBiConfigTypeId'),
                    columnId: watch('misBiConfigColumnHor'),
                  });
                }
                if (watch('misBiConfigType') == 'mis_workflow') {
                  if (
                    watch('misBiConfigGraphicType') === '4' ||
                    watch('misBiConfigGraphicType') === '5'
                  ) {
                    return mutateByWorkFlowDate();
                  }
                  return mutateByWorkFlow();
                }
              }}
            >
              Preview
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
          <Box sx={{ height: '300px' }}>
            <BiChart
              misBiConfigId={watch('misBiConfigId')}
              misBiConfigName={watch('misBiConfigName')}
              misBiConfigTypeId={watch('misBiConfigTypeId')}
              misBiConfigColumnHor={watch('misBiConfigColumnHor')}
              misBiConfigColumnVet={watch('misBiConfigColumnVet')}
              misBiConfigGraphicType={watch('misBiConfigGraphicType')}
              misBiConfigDefView={watch('misBiConfigDefView')}
              allData={
                watch('misBiConfigType') === 'defined_table'
                  ? watch('misBiConfigGraphicType') === '4' ||
                    watch('misBiConfigGraphicType') === '5'
                    ? allDataByDate?.data
                    : allData?.data ?? []
                  : watch('misBiConfigGraphicType') === '4' ||
                    watch('misBiConfigGraphicType') === '5'
                  ? allDataByWorkFlowDate?.data
                  : allDataByWorkFlow?.data ?? []
              }
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BiToolDetailPage;
