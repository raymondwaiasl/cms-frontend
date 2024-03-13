import styles from './dictionary-detail-page.module.scss';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiShow } from 'react-icons/bi';
import { FaSave } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const DictionaryDetailPage = () => {
  const { search } = useLocation();
  const paramId = useMemo(() => new URLSearchParams(search).get('id'), [search]);
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const client = useApi();
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const sqlDicColumns = [
    {
      field: 'key',
      headerName: 'Key',
      minWidth: 200,
    },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 200,
    },
  ];

  const dicColumns = [
    {
      field: 'keyId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'key',
      headerName: 'Key',
      minWidth: 200,
    },
    {
      field: 'value',
      headerName: 'Value',
      minWidth: 200,
    },
    {
      field: 'Action',
      type: 'actions',
      headerAlign: 'left',
      headerName: 'Action',
      minWidth: 200,
      renderCell: (props: GridRenderCellParams) => {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BiShow />}
              className={styles.actionButton}
              onClick={() => {
                setIsDialogOpen(true);
                setIsEdit(true);
                setPropsValue(props.row.key, props.row.value, props.row.keyId);
              }}
              color="primary"
            >
              Edit
            </Button>
            <Button
              startIcon={<AiOutlineDelete />}
              variant="outlined"
              size="small"
              color="error"
              className={styles.actionButton}
              onClick={() => {
                openDialog('deleteDialog', {
                  title: 'Delete dictionary',
                  message: `Are you sure to delete ${props.row.value}`,
                  confirmAction: () =>
                    deleteDictionaryDetail.mutate({
                      keyId: props.id as string,
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

  const { data: dictionaryDetail } = useQuery(
    ['dictionaryDetail', paramId, page, pageSize, sortingOptions],
    async () => {
      const { data: dictionaryDetail } = await client.dictionary.getDictionaryDetail({
        id: paramId ?? '',
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return dictionaryDetail;
    }
  );

  const updateDictionary = useMutation(client.dictionary.updateDictionary, {
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries(['dictionaryDetail', paramId, page, pageSize, sortingOptions]);
      dicReset({ key: '', value: '' });
    },
  });

  const addDicDetail = useMutation(client.dictionary.addDicItem, {
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries(['dictionaryDetail', paramId, page, pageSize, sortingOptions]);
      dicReset({ key: '', value: '' });
    },
  });

  const updateDicDetail = useMutation(client.dictionary.updateDicItem, {
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries(['dictionaryDetail', paramId, page, pageSize, sortingOptions]);
    },
  });

  const deleteDictionaryDetail = useMutation(client.dictionary.delDictionaryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries(['dictionaryDetail', paramId, page, pageSize, sortingOptions]);
    },
  });

  const saveDicDetail = (data: any) => {
    if (isEdit) {
      updateDicDetail.mutate({
        dicId: paramId ?? '',
        keyId: data.keyId,
        key: data.key,
        value: data.value,
      });
    } else {
      addDicDetail.mutate({
        dicId: paramId ?? '',
        keyId: '',
        key: data.key,
        value: data.value,
      });
    }
  };

  const rows: GridRowsProp = useMemo(
    () =>
      dictionaryDetail?.pageData?.data?.map((item: any) => ({
        ...item,
      })) ?? [],
    [dictionaryDetail?.pageData.data]
  );

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<{ dicName: string; propSql?: string }>({
    mode: 'onSubmit',
    defaultValues: {
      dicName: dictionaryDetail?.dicName ?? '',
    },
  });

  const {
    control: dicControl,
    reset: dicReset,
    setValue: dicSetValue,
    handleSubmit: dicSubmit,
    formState: { errors: dicErrors },
  } = useForm<{ key: string; value: string; keyId: string }>({
    mode: 'onSubmit',
    defaultValues: {},
  });

  const setPropsValue = (key: string, value: string, keyId: string) => {
    dicSetValue('key', key);
    dicSetValue('value', value);
    dicSetValue('keyId', keyId);
  };

  useEffect(() => {
    if (dictionaryDetail?.dicName) {
      reset({ dicName: dictionaryDetail?.dicName });
    }
  }, [dictionaryDetail?.dicName]);

  const verifyPropSql = async (sql: string) => {
    if (!sql) {
      setError('propSql', { type: 'custom', message: 'This Field is required' });
      return false;
    }
    if (sql.length > 2000) {
      setError('propSql', { type: 'custom', message: 'Input value has exceed 2000 character' });
      return false;
    }

    clearErrors('propSql');
    return true;
  };
  return (
    <>
      <Typography variant="h5">Dictionary Properties</Typography>
      <Stack direction="row" className={styles.toolbar}>
        <Stack
          direction="row"
          alignItems="center"
          component="form"
          onSubmit={handleSubmit((data) => {
            updateDictionary.mutate({
              dicId: paramId ?? '',
              dicName: data.dicName,
            });
          })}
        >
          <Controller
            name="dicName"
            control={control}
            defaultValue={dictionaryDetail?.dicName}
            rules={{
              required: 'This Field is required',
              maxLength: {
                value: 40,
                message: 'Input value has exceed 40 character',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextField
                  autoFocus
                  variant="standard"
                  error={!!errors.dicName}
                  onChange={onChange}
                  value={value}
                  label="Dictionary Name"
                  helperText={errors.dicName?.message as string}
                />
                <IconButton color="primary" type="submit">
                  <FaSave size={20} />
                </IconButton>
              </>
            )}
          />
        </Stack>
        <Button
          variant="contained"
          sx={{ my: 1 }}
          onClick={() => {
            setIsDialogOpen(true);
            setIsEdit(false);
          }}
        >
          Create New
        </Button>
      </Stack>
      {dictionaryDetail?.propType == 2 && (
        <Stack
          direction="row"
          sx={{ position: 'relative' }}
          component="form"
          onSubmit={handleSubmit((data) => {
            if (isValid) {
              client.dictionary.verifyPropSql({ sql: data.propSql }).then((result: any) => {
                if (result.msg) {
                  setError('propSql', { type: 'custom', message: result.msg });
                } else {
                  clearErrors('propSql');
                  updateDictionary.mutate({
                    dicId: paramId ?? '',
                    propSql: data.propSql,
                  });
                }
              });
            }
          })}
        >
          <Controller
            name="propSql"
            control={control}
            defaultValue={dictionaryDetail?.propSql}
            rules={{
              validate: (value) => verifyPropSql(value ?? ''),
            }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextField
                  variant="standard"
                  error={!!errors.propSql}
                  onChange={onChange}
                  value={value}
                  label="Property Sql"
                  helperText={errors.propSql?.message as string}
                  multiline
                  rows={4}
                  fullWidth
                  onBlur={() => {
                    // verifyPropSql(value ?? '');
                  }}
                  sx={{ width: '1000px' }}
                />
                <IconButton
                  disabled={!isValid}
                  color="primary"
                  type="submit"
                  sx={{ height: '36px', position: 'absolute', left: '1000px', bottom: 0 }}
                >
                  <FaSave size={20} />
                </IconButton>
              </>
            )}
          />
        </Stack>
      )}
      <DataGrid
        autoHeight
        rows={rows}
        rowCount={dictionaryDetail?.pageData?.total}
        disableColumnMenu
        pagination
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        experimentalFeatures={{ newEditingApi: true }}
        getRowId={(row) => row.keyId}
        columns={dictionaryDetail?.propType == 2 ? sqlDicColumns : dicColumns}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      />

      <Dialog open={isDialogOpen}>
        <form
          onSubmit={dicSubmit((data) => {
            saveDicDetail(data);
          })}
        >
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} Dictionary Properties</DialogTitle>
          <DialogContent className={styles.dialogContainer}>
            <Controller
              name="key"
              control={dicControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!dicErrors.key}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Column key"
                  className={styles.dialogContainerInput}
                  helperText={dicErrors.key?.message as string}
                />
              )}
            />
            <Controller
              name="value"
              control={dicControl}
              rules={{
                required: 'This Field is required',
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  error={!!dicErrors.value}
                  onChange={onChange}
                  value={value}
                  fullWidth
                  label="Column value"
                  className={styles.dialogContainerInput}
                  helperText={dicErrors.value?.message as string}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              {isEdit ? 'Edit' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                dicReset({ key: '', value: '' });
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

export default DictionaryDetailPage;
