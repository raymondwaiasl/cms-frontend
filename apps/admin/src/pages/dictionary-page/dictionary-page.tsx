import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import route from 'apps/admin/src/router/route';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const DictionaryPage = () => {
  const client = useApi();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const dicColumns: GridColDef[] = [
    {
      field: 'key',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'value',
      headerName: 'Dictionary Name',
      minWidth: 200,
    },
    {
      field: 'Action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiEdit />}
              onClick={() => {
                history.push({
                  pathname: route.dictionaryDetail,
                  search: `?id=${props.id}`,
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
                  title: 'Delete dictionary',
                  message: `Are you sure to delete ${props.row.value}`,
                  confirmAction: () => deleteDictionary.mutate({ id: props.id as string }),
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSortModelChange = useCallback((sortModel: any) => {
    // Here you save the data you need from the sort model
    const [options] = sortModel;
    setSortingOptions(
      options ?? {
        field: '',
        sort: '',
      }
    );
  }, []);

  const { data: dictionary } = useQuery(
    ['dictionary', page, pageSize, sortingOptions],
    async () => {
      const { data } = await client.dictionary.getAllDicName({
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return data;
    }
  );

  const deleteDictionary = useMutation(client.dictionary.delDictionary, {
    onSuccess: () => {
      queryClient.invalidateQueries(['dictionary', page, pageSize, sortingOptions]);
    },
  });

  const saveDictionaryOnPage = useMutation(client.dictionary.saveDictionary, {
    onSuccess: (data) => {
      setIsDialogOpen(false);
      history.push({
        pathname: route.dictionaryDetail,
        search: `?id=${data?.data?.id}`,
      });
    },
  });

  const rows: GridRowsProp = useMemo(
    () =>
      dictionary?.data?.map((item: any) => ({
        ...item,
      })) ?? [],
    [dictionary?.data]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onSubmit' });

  useEffect(() => {
    setValue('ddPropType', 1);
  }, []);
  return (
    <>
      <Typography variant="h5">Dictionary Page</Typography>
      <Button variant="contained" sx={{ my: 1 }} onClick={() => setIsDialogOpen(true)}>
        Create New
      </Button>

      <DataGrid
        autoHeight
        rows={rows}
        rowCount={dictionary?.total}
        disableColumnMenu
        pagination
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        experimentalFeatures={{ newEditingApi: true }}
        getRowId={(row) => row.key}
        columns={dicColumns}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      />

      <Dialog open={isDialogOpen}>
        <form
          onSubmit={handleSubmit(
            (data) => {
              saveDictionaryOnPage.mutate({
                dicId: '',
                dicName: data.ddName,
                propType: data.ddPropType,
              });
            },
            (error) => {
              console.log(error);
            }
          )}
        >
          <DialogTitle>Create Dictionary</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              paddingTop: 3,
            }}
          >
            <Controller
              name="ddName"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!errors.ddName}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Dictionary Name"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.ddName?.message as string}
                />
              )}
            />
            <Controller
              name="ddPropType"
              control={control}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FormControl error={!!errors?.ddPropType}>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={value}
                    onChange={onChange}
                  >
                    <FormControlLabel value="1" control={<Radio />} label="Enum Properties" />
                    <FormControlLabel value="2" control={<Radio />} label="Sql Properties" />
                  </RadioGroup>
                  <FormHelperText>{errors?.ddPropType?.message as string}</FormHelperText>
                </FormControl>
              )}
            />
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

export default DictionaryPage;
