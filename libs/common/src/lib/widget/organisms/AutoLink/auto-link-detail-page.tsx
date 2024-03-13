import { DefaultFolderId } from '../../../constant';
import {
  Button,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DataGrid, GridRowsProp, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { AutoLinkInfo } from 'libs/common/src/lib/api/contentService';
import { useDialog, useApi, useWidget } from 'libs/common/src/lib/hooks';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiShow } from 'react-icons/bi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

const AutoLinkDetail = () => {
  const { openDialog } = useDialog();
  const queryClient = useQueryClient();
  const client = useApi();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [autoLinkInfoDetail, setAutoLinkInfoDetail] = useState<AutoLinkInfo>();
  const { data, updateWidget, updateWidgets } = useWidget<{
    id: string;
  }>('AutolinkDetailpage');

  const folderId = useMemo(() => data?.id ?? DefaultFolderId, [data?.id, DefaultFolderId]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AutoLinkInfo>({
    mode: 'onSubmit',
    defaultValues: {
      cmsAutolinkCondition: autoLinkInfoDetail?.cmsAutolinkCondition,
    },
  });

  const ConditionArr = [
    { key: '0', value: 'is' },
    { key: '1', value: 'is not' },
    { key: '2', value: 'contains' },
    { key: '3', value: 'greater' },
    { key: '4', value: 'less' },
  ];

  const detailColumns: GridColDef[] = [
    {
      field: 'misFolderName',
      headerName: 'Folder Name',
      minWidth: 200,
    },
    {
      field: 'cmsFolderLevel',
      headerName: 'Folder Level',
      minWidth: 200,
    },
    {
      field: 'misColumnLabel',
      headerName: 'Column Name',
      minWidth: 200,
    },
    {
      field: 'cmsAutolinkCondition',
      headerName: 'Auto Link Condition',
      minWidth: 200,
    },
    {
      field: 'cmsAutolinkValue',
      headerName: 'Auto Link Value',
      minWidth: 200,
    },
    {
      field: 'cmsAutolinkConditionRel',
      headerName: 'Auto Link Condition Rel',
      minWidth: 200,
    },
    {
      field: 'Action',
      type: 'actions',
      headerAlign: 'left',
      headerName: 'Action',
      width: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              data-id="editAutoLink555"
              variant="outlined"
              size="small"
              startIcon={<BiShow />}
              onClick={() => {
                setIsEditDialogOpen(true);
                reset({
                  ...props.row,
                });
              }}
              color="primary"
            >
              Edit
            </Button>{' '}
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete Autolink',
                  message: `Are you sure to delete ${props.row.misColumnLabel} ?`,
                  confirmAction: () =>
                    DeleteAutolink.mutate({
                      cmsAutolinkConditionId: props.row.cmsAutolinkConditionId as string,
                      cmsAutolinkLevel: props.row.cmsFolderLevel as string,
                      misColumnId: props.row.misColumnId as string,
                      misFolderId: props.row.misFolderId as string,
                      misTypeId: props.row.misTypeId as string,
                      cmsAutolinkId: props.row.cmsAutolinkId as string,
                    }),
                });
              }}
            >
              DELETE
            </Button>
          </>
        );
      },
    },
  ];

  const DeleteAutolink = useMutation(client.autolinkManage.deleteAutolinkById, {
    onSuccess: () => {
      queryClient.invalidateQueries(['autolinkDetail', pageState, sortModel]);
      toast('Delete successfully', {
        type: 'success',
      });
    },
  });

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState({ field: '', sort: '' });

  const handleSortChange = (newSortModel: any) => {
    if (JSON.stringify(sortModel) !== JSON.stringify(newSortModel[0])) {
      if (newSortModel.length > 0) {
        setSortModel((old) => ({
          ...old,
          field: newSortModel[0].field,
          sort: newSortModel[0].sort,
        }));
      }
    }
  };

  const { data: userPageData, isLoading } = useQuery(
    ['autolinkDetail', pageState, sortModel, folderId],
    async () => {
      const { data: response } = await client.autolinkManage.getAllAutoLink({
        folderId: folderId ?? '',
        typeId: '',
        folderName: folderId ?? '',
        pageState,
        sortModel,
      });
      setAutoLinkInfoDetail({
        cmsAutolinkConditionId: response.cmsAutolinkConditionId,
        misColumnId: response.misColumnId,
        cmsAutolinkId: response.cmsAutolinkId,
        misFolderName: response.misFolderName,
        cmsFolderLevel: response.cmsFolderLevel,
        misColumnLabel: response.misColumnLabel,
        cmsAutolinkCondition: response.cmsAutolinkCondition,
        cmsAutolinkValue: response.cmsAutolinkValue,
        cmsAutolinkConditionRel: response.cmsAutolinkConditionRel,
      });
      return response;
    },
    {
      keepPreviousData: true,
    }
  );

  const editAutoLink = useMutation(client.autolinkManage.editAutoLink, {
    onSuccess: () => {
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries(['autolinkDetail', pageState, sortModel]);
      reset({
        cmsAutolinkConditionId: '',
        misColumnId: '',
        cmsAutolinkCondition: '',
        cmsAutolinkValue: '',
      });
      toast('Save successfully', {
        type: 'success',
      });
    },
  });

  return (
    <div>
      <Button
        variant="contained"
        sx={{ my: 1 }}
        onClick={() => {
          openDialog('autoLinkDialog', {});
        }}
      >
        Create New
      </Button>
      <DataGrid
        autoHeight
        rows={userPageData?.data ?? []}
        loading={isLoading}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={pageState.page - 1}
        pageSize={pageState?.pageSize ?? 0}
        paginationMode="server"
        columns={detailColumns}
        disableColumnMenu
        onPageChange={(newPage) => {
          setPageState((old) => ({ ...old, page: newPage + 1 }));
        }}
        onPageSizeChange={(newPageSize) =>
          setPageState((old) => ({ ...old, pageSize: newPageSize }))
        }
        sortingMode="server"
        onSortModelChange={handleSortChange}
        getRowId={(row) => row.cmsAutolinkConditionId}
      />
      <Dialog open={isEditDialogOpen}>
        <form
          onSubmit={handleSubmit((data) => {
            editAutoLink.mutate({ ...data });
          })}
        >
          <DialogTitle>{'Edit Autolink'}</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 3,
            }}
          >
            <Controller
              name="misFolderName"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.misFolderName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="folder Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.misFolderName?.message as string}
                />
              )}
            />
            <Controller
              name="misColumnLabel"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.misColumnLabel}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="misColumnLabel"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.misColumnLabel?.message as string}
                />
              )}
            />
            <tr>
              <Controller
                name="cmsAutolinkCondition"
                control={control}
                rules={{
                  required: 'This Field is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '200px' }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      autolink condition
                    </InputLabel>
                    <Select
                      displayEmpty
                      renderValue={(newVal) =>
                        ConditionArr?.find((item) => item.value === newVal)?.value ??
                        ConditionArr?.find(
                          (item) => item.value === autoLinkInfoDetail?.cmsAutolinkCondition
                        )?.value
                      }
                      autoWidth
                      error={!!errors.cmsAutolinkCondition}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={value ?? autoLinkInfoDetail?.cmsAutolinkCondition}
                      onChange={onChange}
                    >
                      {ConditionArr?.map((item) => {
                        return (
                          <MenuItem key={item.key} value={item.value}>
                            {item.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!!errors.cmsAutolinkCondition && (
                      <FormHelperText error>
                        {errors?.cmsAutolinkCondition.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="cmsAutolinkValue"
                control={control}
                rules={{
                  required: 'This Field is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    error={!!errors.misColumnLabel}
                    onChange={onChange}
                    value={value}
                    fullWidth
                    label="cmsAutolinkValue"
                    sx={{ minWidth: '300px', marginTop: 2 }}
                    helperText={errors.cmsAutolinkValue?.message as string}
                  />
                )}
              />
            </tr>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              {'Edit'}
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                reset({
                  cmsAutolinkConditionId: '',
                  misColumnId: '',
                  cmsAutolinkCondition: '',
                  cmsAutolinkValue: '',
                });
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default AutoLinkDetail;
