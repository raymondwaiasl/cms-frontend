import route from '../../router/route';
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  FormHelperText,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer } from '@mui/x-data-grid';
import { AddTypeRefInput } from 'libs/common/src/lib/api';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AiOutlineArrowLeft, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import { useQuery, useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';

const TableRefPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const history = useHistory();
  const client = useApi();
  const { openDialog } = useDialog();
  const { search } = useLocation();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);
  const tableId = useMemo(() => new URLSearchParams(search).get('id') ?? '', [search]);
  const {
    control,
    reset,
    watch,
    getValues,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<AddTypeRefInput>({
    defaultValues: {
      misCrossRefParentTable: tableId,
      misCrossRefId: '',
    },
  });
  const {
    data: crossTableData,
    refetch,
    isLoading,
  } = useQuery(
    [
      'corss table',
      {
        pageState: { page: page + 1, pageSize },
        sortModel: {
          field: '',
          sort: '',
        },
      },
      tableId,
    ],
    async () => {
      const { data } = await client.typeRefService.getAllTypeRef({
        pageState: { page: page + 1, pageSize },
        sortModel: {
          field: '',
          sort: '',
        },
        tableId,
      });
      return data;
    }
  );
  const { data: tableData } = useQuery(
    [
      'table Mgmt',
      {
        pageState: { page: 1, pageSize: 100 },
        sortModel: {
          field: '',
          sort: '',
        },
      },
    ],
    async () => {
      const { data } = await client.type.getAllTypes({
        pageState: { page: 1, pageSize: 100 },
        sortModel: {
          field: '',
          sort: '',
        },
      });
      return data;
    }
  );
  const { data: currTableProperties } = useQuery(
    ['currentTable', tableId],
    async () => {
      const { data } = await client.type.selectTypeById({ id: tableId });
      console.log(data);
      return data;
    },
    {
      enabled: !!tableId,
    }
  );
  const targetTableId = useMemo(
    () => (tab === 0 ? watch('misCrossRefChildTable') : watch('misCrossRefParentTable')),
    [tab, watch('misCrossRefChildTable'), watch('misCrossRefParentTable')]
  );
  const { data: targetTableProperties } = useQuery(
    ['targetTable', targetTableId],
    async () => {
      const { data } = await client.type.selectTypeById({ id: targetTableId });
      console.log(data);
      return data;
    },
    {
      enabled: !!targetTableId,
    }
  );
  const addTypeRef = useMutation(client.typeRefService.addTypeRef, {
    onSuccess: () => {
      refetch();
    },
  });
  const updateTypeRef = useMutation(client.typeRefService.updateTypeRef, {
    onSuccess: () => {
      refetch();
    },
  });
  const deleteTypeRef = useMutation(client.typeRefService.deleteTypeRef, {
    onSuccess: () => {
      refetch();
    },
  });
  const ToolBar = () => {
    return (
      <GridToolbarContainer sx={{ float: 'right', paddingRight: 1, paddingTop: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FaPlus />}
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          ADD REFERENCE
        </Button>
      </GridToolbarContainer>
    );
  };
  const columns: GridColDef[] = [
    { field: 'misCrossRefId', headerName: 'S/N', flex: 1 },
    {
      field: 'misCrossRefName',
      headerName: 'Cross Reference Name',
      flex: 1,
    },
    {
      field: 'Reference Type',
      headerName: 'Refernce Type',
      flex: 1,
      valueGetter: (params) =>
        params.row.misCrossRefParentTableID === tableId ? 'As Parent' : 'As Child',
    },
    {
      field: 'RefernceTarget',
      headerName: 'Refernce To',
      flex: 1,
      valueGetter: (params) =>
        params.row.misCrossRefParentTableID === tableId
          ? params.row.misCrossRefChildTableLabel
          : params.row.misCrossRefParentTableLabel,
    },
    {
      field: 'misCrossRefParentKeyLabel',
      headerName: 'Parent Key label',
      flex: 1,
    },

    {
      field: 'misCrossRefChildKeyLabel',
      headerName: 'Child Key Label',
      flex: 1,
      minWidth: 100,
    },

    {
      field: 'Operation',
      headerName: 'Operation',
      flex: 2,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AiOutlineEdit />}
              onClick={() => {
                setIsDialogOpen(true);
                reset({
                  misCrossRefId: props.row.misCrossRefId,
                  misCrossRefChildKey: props.row.misCrossRefChildKey,
                  misCrossRefChildTable: props.row.misCrossRefChildTableID,
                  misCrossRefName: props.row.misCrossRefName,
                  misCrossRefParentKey: props.row.misCrossRefParentKey,
                  misCrossRefParentTable: props.row.misCrossRefParentTableID,
                });
              }}
            >
              Edit
            </Button>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              sx={{ marginLeft: (theme) => theme.spacing(1) }}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'delete Table',
                  message: `Are you sure to delete ${props.row.misCrossRefName}`,
                  confirmAction: () => deleteTypeRef.mutate({ id: props.id as string }),
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
  return (
    <>
      <Button startIcon={<AiOutlineArrowLeft />} onClick={() => history.goBack()}>
        Back
      </Button>
      <Typography typography={'h5'}>Cross Reference</Typography>
      <FormControl sx={{ minWidth: '200px', marginY: 2 }}>
        <InputLabel>Current Table</InputLabel>
        <Select
          value={tableId}
          label="Current Table"
          onChange={(evt) => {
            history.replace({ pathname: route.tableReference, search: `?id=${evt.target.value}` });
          }}
          displayEmpty
          renderValue={() =>
            tableData?.data.find((item) => item.misTypeId === tableId)?.misTypeLabel ?? ''
          }
        >
          {tableData?.data.map((item) => (
            <MenuItem
              value={item.misTypeId}
              disabled={item.misTypeId === tableId}
              key={item.misTypeId}
            >
              {item.misTypeLabel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <DataGrid
        rows={crossTableData?.data ?? []}
        paginationMode="server"
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.misCrossRefId}
        components={{
          Toolbar: ToolBar,
        }}
        page={page}
        pagination
        rowCount={crossTableData?.total ?? 0}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 25]}
      />
      <Dialog open={isDialogOpen} fullWidth>
        <DialogTitle>{watch('misCrossRefId') ? 'Edit' : 'Add'} Cross Reference</DialogTitle>
        <form
          onSubmit={handleSubmit(
            (data) => {
              console.log(data);
              if (!data.misCrossRefId) {
                addTypeRef.mutate({
                  ...data,
                });
              }
              if (data.misCrossRefId) {
                updateTypeRef.mutate({ ...data });
              }
              reset();
              setIsDialogOpen(false);
            },
            (err) => {
              console.log(err);
            }
          )}
        >
          <DialogContent
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              paddingX: 6,
              gap: 3,
            }}
          >
            <Controller
              name="misCrossRefName"
              rules={{
                required: {
                  value: true,
                  message: 'Name for cross reference is required',
                },
              }}
              control={control}
              render={({ field: { value, onChange } }) => (
                <TextField
                  variant="standard"
                  fullWidth
                  error={!!errors.misCrossRefName}
                  helperText={errors.misCrossRefName?.message}
                  value={value}
                  onChange={onChange}
                  label="Name"
                  sx={{ minWidth: '200px' }}
                />
              )}
            />
            <Tabs
              value={tab}
              onChange={(evt, val) => {
                reset({
                  misCrossRefParentTable: getValues('misCrossRefChildTable') ?? '',
                  misCrossRefChildTable: getValues('misCrossRefParentTable') ?? '',
                  misCrossRefParentKey: getValues('misCrossRefChildKey') ?? '',
                  misCrossRefChildKey: getValues('misCrossRefParentKey') ?? '',
                  misCrossRefName: getValues('misCrossRefName'),
                });

                setTab(val);
              }}
              centered
              selectionFollowsFocus
              sx={{ width: '100%' }}
            >
              <Tab value={0} label="As Parent" />
              <Tab value={1} label="As Child" />
            </Tabs>
            <Stack justifyContent={'space-between'} sx={{ height: '100%', gap: 2 }}>
              <Controller
                name="misCrossRefParentTable"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Parent table cannot be empty',
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <FormControl sx={{ minWidth: '200px' }} error={!!errors.misCrossRefParentTable}>
                    <InputLabel shrink={!!value}>Parent Table</InputLabel>
                    <Select
                      value={value}
                      label="Parent Table"
                      notched={!!value}
                      onChange={onChange}
                      displayEmpty
                      disabled={tab === 0}
                      renderValue={() =>
                        tableData?.data.find((item) => item.misTypeId === value)?.misTypeLabel ?? ''
                      }
                    >
                      {tableData?.data.map((item) => (
                        <MenuItem
                          value={item.misTypeId}
                          disabled={item.misTypeId === tableId}
                          key={item.misTypeId}
                        >
                          {item.misTypeLabel}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!errors.misCrossRefParentTable && (
                      <FormHelperText>{errors.misCrossRefParentTable?.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="misCrossRefParentKey"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Parent key cannot be empty',
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <FormControl sx={{ minWidth: '200px' }} error={!!errors.misCrossRefParentKey}>
                    <InputLabel shrink={!!value}>Parent Key</InputLabel>
                    <Select
                      value={value}
                      notched={!!value}
                      label="Parent Key"
                      onChange={onChange}
                      displayEmpty
                      renderValue={() =>
                        tab === 0
                          ? currTableProperties?.misColumnList.find(
                              (item) => item.misColumnId === value
                            )?.misColumnLabel ?? ''
                          : targetTableProperties?.misColumnList.find(
                              (item) => item.misColumnId === value
                            )?.misColumnLabel ?? ''
                      }
                    >
                      {tab === 0
                        ? currTableProperties?.misColumnList.map((item) => (
                            <MenuItem value={item.misColumnId} key={item.misColumnId}>
                              {item.misColumnLabel}
                            </MenuItem>
                          ))
                        : targetTableProperties?.misColumnList.map((item) => (
                            <MenuItem value={item.misColumnId} key={item.misColumnId}>
                              {item.misColumnLabel}
                            </MenuItem>
                          ))}
                    </Select>
                    {!!errors.misCrossRefParentKey && (
                      <FormHelperText>{errors.misCrossRefParentKey?.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
            <Stack justifyContent={'space-between'} sx={{ height: '100%', gap: 2 }}>
              <Controller
                name="misCrossRefChildTable"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Child Table cannot be empty',
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <FormControl sx={{ minWidth: '200px' }} error={!!errors.misCrossRefChildTable}>
                    <InputLabel shrink={!!value}>Child Table</InputLabel>
                    <Select
                      value={value}
                      notched={!!value}
                      disabled={tab === 1}
                      label="Child Table"
                      onChange={onChange}
                      displayEmpty
                      renderValue={() =>
                        tableData?.data.find((item) => item.misTypeId === value)?.misTypeLabel ?? ''
                      }
                    >
                      {tableData?.data.map((item) => (
                        <MenuItem
                          value={item.misTypeId}
                          disabled={item.misTypeId === tableId}
                          key={item.misTypeId}
                        >
                          {item.misTypeLabel}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!errors.misCrossRefChildTable && (
                      <FormHelperText>{errors.misCrossRefChildTable?.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="misCrossRefChildKey"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Child Key cannot be empty',
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <FormControl sx={{ minWidth: '200px' }} error={!!errors.misCrossRefChildKey}>
                    <InputLabel shrink={!!value}>Child Key</InputLabel>
                    <Select
                      notched={!!value}
                      value={value}
                      label="Child Key"
                      onChange={onChange}
                      displayEmpty
                      renderValue={() =>
                        tab === 1
                          ? currTableProperties?.misColumnList.find(
                              (item) => item.misColumnId === value
                            )?.misColumnLabel ?? ''
                          : targetTableProperties?.misColumnList.find(
                              (item) => item.misColumnId === value
                            )?.misColumnLabel ?? ''
                      }
                    >
                      {tab === 1
                        ? currTableProperties?.misColumnList.map((item) => (
                            <MenuItem value={item.misColumnId} key={item.misColumnId}>
                              {item.misColumnLabel}
                            </MenuItem>
                          ))
                        : targetTableProperties?.misColumnList.map((item) => (
                            <MenuItem value={item.misColumnId} key={item.misColumnId}>
                              {item.misColumnLabel}
                            </MenuItem>
                          ))}
                    </Select>
                    {!!errors.misCrossRefChildKey && (
                      <FormHelperText>{errors.misCrossRefChildKey?.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit" disabled={!isDirty}>
              {watch('misCrossRefId') ? 'Edit' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                reset({
                  misCrossRefId: '',
                  misCrossRefParentKey: '',
                  misCrossRefChildKey: '',
                  misCrossRefChildTable: '',
                  misCrossRefName: '',
                  misCrossRefParentTable: tableId,
                });
                setTab(0);
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TableRefPage;
