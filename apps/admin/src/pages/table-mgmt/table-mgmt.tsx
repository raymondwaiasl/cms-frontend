import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  Stack,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

let groupPerData: any = {};
const TableMgmt = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const history = useHistory();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onSubmit' });
  const client = useApi();

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState({
    field: '',
    sort: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: tableData } = useQuery(
    [
      'table Mgmt',
      {
        pageState: { page: page + 1, pageSize },
        sortModel,
      },
    ],
    async () => {
      const { data } = await client.type.getAllTypes({
        pageState: { page: page + 1, pageSize },
        sortModel,
      });
      return data;
    }
  );
  const DeleteType = useMutation(client.type.deleteType, {
    onSuccess: () => {
      queryClient.invalidateQueries('table Mgmt');
    },
  });
  const { data: groupData } = useQuery(
    [
      'group Mgmt',
      {
        pageState: { page: page + 1, pageSize },
        sortModel,
      },
    ],
    async () => {
      const { data } = await client.userService.queryAllGroupData({
        pageState: { page: page + 1, pageSize },
        sortModel,
      });
      return data;
    }
  );
  const AddType = useMutation(client.type.addNewType, {
    onSuccess: () => {
      queryClient.invalidateQueries('table Mgmt');
      reset();
    },
  });
  const AddTypeAndDraf = useMutation(client.type.addNewTypeAndDraf, {
    onSuccess: () => {
      queryClient.invalidateQueries('table Mgmt');
      reset();
    },
  });

  const handleChange = (e: any, checkValue: any) => {
    groupPerData[checkValue] = e.target.checked;
    console.log('======' + JSON.stringify(groupPerData));
  };

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

  const columns: GridColDef[] = [
    { field: 'misTypeId', headerName: 'S/N', flex: 1, minWidth: 150 },
    {
      field: 'misTypeLabel',
      headerName: 'Table Label',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'misTypeName',
      headerName: 'Table Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Action',
      type: 'actions',
      headerAlign: 'left',
      headerName: 'Action',
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() =>
                history.push({
                  pathname: '/table/edit',
                  search: `?id=${props.id}&misTypeLabel=${props.row.misTypeLabel}&misTypeName=${props.row.misTypeName}`,
                })
              }
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
                  message: `Are you sure to delete ${props.row.misTypeName}`,
                  confirmAction: () => DeleteType.mutate({ id: props.id as string }),
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

  const columnsGroupPer: GridColDef[] = [
    { field: 'id', headerName: 'S/N', flex: 1, minWidth: 150 },
    {
      field: 'name',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Access',
      headerName: 'Access',
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Checkbox
              onChange={(e) => handleChange(e, 'Access' + props.row.id)}
              name={'Access' + props.row.id}
            />
          </>
        );
      },
    },
    {
      field: 'DirectCreat',
      headerName: 'Direct Create',
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Checkbox
              onChange={(e) => handleChange(e, 'Create' + props.row.id)}
              name={'Create' + props.row.id}
            />
          </>
        );
      },
    },
    {
      field: 'DirectEdit',
      headerName: 'Direct Edit',
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Checkbox
              onChange={(e) => handleChange(e, 'Edit' + props.row.id)}
              name={'Edit' + props.row.id}
            />
          </>
        );
      },
    },
    {
      field: 'DirectDelete',
      headerName: 'Direct Delete',
      flex: 1,
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Checkbox
              onChange={(e) => handleChange(e, 'Delete' + props.row.id)}
              name={'Delete' + props.row.id}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <Typography variant="h5">Table Management</Typography>
      <Button variant="contained" sx={{ marginY: 1 }} onClick={() => setIsDialogOpen(true)}>
        Create New
      </Button>
      <Paper>
        <DataGrid
          autoHeight
          rows={tableData?.data ?? []}
          rowCount={tableData?.total ?? 0}
          pagination
          experimentalFeatures={{ newEditingApi: true }}
          getRowId={(row) => row.misTypeId}
          columns={columns}
          page={page}
          paginationMode="server"
          sortingMode="server"
          pageSize={pageSize}
          onSortModelChange={handleSortChange}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </Paper>
      <Dialog open={isDialogOpen}>
        <form
          onSubmit={handleSubmit((data) => {
            const { misTypeLabel, misTypeName, draftTable } = data;
            console.log(groupPerData + '===' + JSON.stringify(groupPerData) != '{}');
            if (draftTable == 'N' || JSON.stringify(groupPerData) == '{}') {
              toast('please select draft table  and group permission', {
                type: 'warning',
              });
            } else {
              AddTypeAndDraf.mutate({
                misTypeId: '',
                groupPerData: JSON.stringify(groupPerData),
                misTypeLabel,
                misTypeName,
                draftTable,
                typeGpPermissionId:'',
              });
              setIsDialogOpen(false);
              groupPerData = {};
            }
          })}
        >
          <DialogTitle>Create Table</DialogTitle>
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
              name="misTypeLabel"
              control={control}
              rules={{
                required: 'This Field is required',
                maxLength: {
                  value: 40,
                  message: 'Input value has exceed 40 character',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.labelName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Label"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.labelName?.message as string}
                />
              )}
            />
            <Controller
              name="misTypeName"
              control={control}
              rules={{
                required: 'This Field is required',
                maxLength: {
                  value: 40,
                  message: 'Input value has exceed 40 character',
                },
                pattern: {
                  value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                  message: 'Table name could not contain special characeter',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.misTypeName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  helperText={errors.misTypeName?.message as string}
                  label="Table Name"
                  sx={{ marginY: 2, minWidth: '300px' }}
                />
              )}
            />
            <Typography variant="caption">
              <span>*</span>Once table name created, It cannot be changed later
            </Typography>
            <Stack direction="row" mb={1}>
              <Controller
                name="draftTable"
                defaultValue={'N'}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControl
                    id="draftTable"
                    error={!!errors?.draftTable}
                    variant="standard"
                    sx={{ width: '200px', display: 'flex', flexDirection: 'column', marginY: 2 }}
                  >
                    <Typography variant="caption">Draft Table</Typography>
                    <FormControlLabel
                      checked={value === 'Y'}
                      onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                      control={<Checkbox />}
                      label={''}
                    />
                  </FormControl>
                )}
              />
            </Stack>

            <Paper>
              <DataGrid
                autoHeight
                rows={groupData?.data ?? []}
                rowCount={groupData?.total ?? 0}
                pagination
                experimentalFeatures={{ newEditingApi: true }}
                getRowId={(row) => row.id}
                columns={columnsGroupPer}
                page={page}
                paginationMode="server"
                sortingMode="server"
                pageSize={pageSize}
                onSortModelChange={handleSortChange}
                rowsPerPageOptions={[5, 10, 25]}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              />
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              Create
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                reset();
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

export default TableMgmt;
