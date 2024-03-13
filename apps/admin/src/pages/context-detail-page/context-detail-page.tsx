import { SelectedItemList } from '../../components';
import type { DataItem } from '../../components/molecules/SelectedItemList/SelectedItemList';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import route from 'apps/admin/src/router/route';
import { ContextDetail } from 'libs/common/src/lib/api';
import { useApi } from 'libs/common/src/lib/hooks';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ContextDetailPage = () => {
  const client = useApi();
  const history = useHistory();
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);

  const [includeList, setIncludeList] = useState<DataItem[]>([]);
  const [excludeList, setExcludeList] = useState<DataItem[]>([]);
  const [contextDetail, setContextDetail] = useState<ContextDetail>();

  // react hook form
  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<{
    misContextName: string;
    misContextRoleId: string;
    list: {
      includeList?: Array<any>;
    };
  }>({
    mode: 'onSubmit',
    defaultValues: {
      misContextName: contextDetail?.misContextName,
      misContextRoleId: contextDetail?.misContextRoleId,
      list: {},
    },
  });
  const UpdateContext = useMutation(client.context.updateContext, {
    onSuccess: () => {
      history.push(route.context);
      toast('Update Successfully', {
        type: 'success',
      });
    },
  });
  const AddContext = useMutation(client.context.addContext, {
    onSuccess: () => {
      history.push(route.context);
      toast('Add Successfully', {
        type: 'success',
      });
    },
  });
  const submitHandling = (data: any) => {
    if (data.list.includeList.length === 0) {
      setError('list', { message: 'Selected Workspace list cannot be empty' });
      return;
    }
    if (paramId) {
      UpdateContext.mutate({
        contextId: paramId,
        contextName: data.misContextName,
        roleId: data.misContextRoleId,
        wsId: data.list.includeList.map((item: any) => item.id).toString() as string,
      });
    } else {
      AddContext.mutate({
        contextName: data.misContextName,
        roleId: data.misContextRoleId,
        wsId: data.list.includeList.map((item: any) => item.id).toString() as string,
      });
    }
  };
  useQuery(
    ['context detail', paramId],
    async () => {
      const { data: response } = await client.context.getContextDetail({
        misContextId: paramId ?? '',
      });
      return response;
    },
    {
      enabled: !!paramId,
      onSuccess(data) {
        setIncludeList(
          data.rightList?.map(({ misWorkspaceId: id, misWorkspaceName: name }) => ({
            id,
            name,
          }))
        );

        setExcludeList(
          data.leftList?.map(({ misWorkspaceId: id, misWorkspaceName: name }) => ({
            id,
            name,
          }))
        );

        setContextDetail({
          misContextId: data.misContext?.misContextId,
          misContextName: data.misContext?.misContextName,
          misRoleName: data.misContext?.misRoleName,
          misContextRoleId: data.misContext?.misContextRoleId,
        });
      },
    }
  );

  const workspaceList = useQuery(
    'workspace list',
    async () => {
      const { data: response } = await client.context.getWorkSpaceList();
      return response;
    },
    {
      enabled: !paramId,
      onSuccess: (data) => {
        setIncludeList([]);
        setExcludeList(
          data?.map(({ misWorkspaceId: id, misWorkspaceName: name }: any) => ({
            id,
            name,
          }))
        );
      },
    }
  );

  const { data: roles } = useQuery('role list', async () => {
    const { data: response } = await client.context.getRoleList();
    return response;
  });

  useEffect(() => {
    if (contextDetail) {
      reset({
        misContextName: contextDetail?.misContextName,
        misContextRoleId: contextDetail?.misContextRoleId,
        list: {},
      });
    }
  }, [contextDetail]);

  return (
    <>
      <div>
        <Typography variant="h6">Context Config</Typography>
      </div>
      <form
        onSubmit={handleSubmit(submitHandling, () => {
          if (getValues('list') && getValues('list').includeList?.length === 0) {
            setError('list', {
              message: 'Selected Workspace list cannot be empty',
            });
          }
        })}
      >
        <Stack direction="row" spacing={2} mb={2}>
          <Controller
            name="misContextName"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
              <TextField
                aria-label="context-name"
                InputLabelProps={{ shrink: !!value || isDirty }}
                variant="standard"
                error={!!errors.misContextName}
                onChange={onChange}
                value={value ?? contextDetail?.misContextName}
                label="Context Name"
                FormHelperTextProps={{
                  'aria-label': 'contextName-error',
                }}
                helperText={errors?.misContextName?.message as string}
              />
            )}
          />
          <Controller
            name="misContextRoleId"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 200 }}
                error={!!errors.misContextRoleId}
              >
                <InputLabel shrink={!!value}>User Role</InputLabel>
                <Select
                  notched={!!value}
                  data-cy="select"
                  displayEmpty
                  renderValue={(newVal) =>
                    roles?.find((item) => item.misRoleId === newVal)?.misRoleName ??
                    roles?.find((item) => item.misRoleId === contextDetail?.misContextRoleId)
                      ?.misRoleName
                  }
                  labelId="user-role-selection"
                  id="demo-simple-select"
                  value={value ?? contextDetail?.misContextRoleId}
                  defaultValue={contextDetail?.misContextRoleId ?? ''}
                  onChange={onChange}
                  readOnly={!!paramId}
                >
                  {roles?.map((item) => {
                    return (
                      <MenuItem key={item.misRoleId} value={item.misRoleId}>
                        {item.misRoleName}
                      </MenuItem>
                    );
                  })}
                </Select>
                <FormHelperText aria-label="role-error">
                  {errors?.misContextRoleId?.message as string}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
        <SelectedItemList
          getIncludeList={includeList}
          getExcludeList={excludeList}
          error={errors.list?.message}
          hasSelectAll={false}
          height="50vh"
          confirmBtnProps={{ type: 'submit' }}
          onCloseAction={() => history.goBack()}
          onConfirmAction={(data) => setValue('list', data)}
        />
      </form>
    </>
  );
};

export default ContextDetailPage;
