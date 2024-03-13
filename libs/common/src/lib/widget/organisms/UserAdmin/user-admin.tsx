import styles from './UserAdmin.module.scss';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridRenderCellParams, GridColDef, GridLinkOperator } from '@mui/x-data-grid';
import cn from 'clsx';
import { SearchUserInput, UserDetail } from 'libs/common/src/lib/api';
import { useApi, useDialog, useWidget } from 'libs/common/src/lib/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SortModel } from 'libs/common/src/lib/api/common';
import {
  AiFillFolderOpen,
  AiOutlineDelete,
  AiFillEye as Visibility,
  AiFillEyeInvisible as VisibilityOff,
} from 'react-icons/ai';
import { BiShow } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { DateTime } from 'luxon';
import { disConnect } from 'echarts';
import btnStyle from '../../../style/btnStyle';
import icon from '../../../style/icon/iconHandler';
import { WidgetProps } from '../../type';

const UserAdminPage = () => {
  const { openDialog } = useDialog();
  const queryClient = useQueryClient();
  const client = useApi();
  const [searchRecordInput, setSearchRecordInput] = useState<string>('');
  const [digit, setDigit] = useState<boolean>(false);
  const [letters, setLetters] = useState<boolean>(false);
  const [upperLowerCase, setUpperLowerCase] = useState<boolean>(false);
  const [specialChar, setSpecialChar] = useState<boolean>(false);
  const [passwordLength, setPasswordLength] = useState<number>(8);
  const [tab, setTab] = useState<number>(0);
  const [folderId, setFolderId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [sortModel, setSortModel] = useState({ field: '', sort: '' });
  const [values, setValues] = useState<string[]>([]);
  const [sortSearchModel, setSortSearchModel] = useState<SortModel[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const [currentWidth, setCurrentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  let path = window.location.pathname;
  const { data, updateWidgets, config } = useWidget<
    {
      id: string;
      nodeId: string;
      simpleSearchParams?: { simpleSearchId: string; searchConditons: string };
      tab: number;
      filterKeyword: string;
    },
    RecordListProps
  >('Query Record List');
  useEffect(() => {
    if (containerRef?.current?.offsetWidth) {
      setCurrentWidth(containerRef?.current?.offsetWidth);
    }
  }, [containerRef?.current?.offsetWidth]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {dicColumns.length === 0 && 'No Relevant Record'}
    </DataNotFoundOverlay>
  );


  useQuery(
    'getPasswordPolicy',
    async () => {
      const { data } = await client.loginService.getPasswordPolicy();
      return data;
    },
    {
      enabled: true,
      onSuccess: (data) => {
        console.log('getPasswordPolicy data========', data);

        setDigit((data.hasDigit as unknown as string) === 'true' ?? false);
        setLetters((data.hasLetters as unknown as string) === 'true' ?? false);
        setUpperLowerCase((data.hasUpperLowerCase as unknown as string) === 'true' ?? false);
        setSpecialChar((data.hasSpecialChar as unknown as string) === 'true' ?? false);
        setPasswordLength((data.passwordLength as unknown as number) ?? 8);
      },
    }
  );

  const { data: dictionary } = useQuery(
    'Type Dic',
    async () => {
      const { data } = await client.dictionary.getDicByDicId({ id: '0049000000000042' });
      return data;
    },
    {
      // initialData: queryClient.getQueryData('Type Dic'),
      enabled: true,
      onSuccess: (data) => {
        console.log('getPasswordPolicy data========', data);


      },
    }
  );
  const isPasswordValid = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const digitConfig = digit === true ? hasDigit : true;
    const lettersConfig = letters === true ? hasUpperCase || hasLowerCase : true;
    const upperLowerCaseConfig = upperLowerCase === true ? hasUpperCase && hasLowerCase : true;
    const specialCharConfig = specialChar === true ? hasSpecialChar : true;
    const lengthConfig = password.length >= passwordLength;
    return (
      digitConfig && lettersConfig && upperLowerCaseConfig && specialCharConfig && lengthConfig
    );
  };
  const { data: simpleSearch, isLoading: isSimpleSearchLoading } = useQuery(
    ['Simple Search', data?.simpleSearchParams, folderId, sortModel, page, pageSize, tab],
    async () => {
      const { data: simpleSearchResponse } = await client.simpleSearch.simpleSearchRecord({
        folderId,
        simpleSearchId: data?.simpleSearchParams?.simpleSearchId ?? '',
        data: data?.simpleSearchParams?.searchConditons ?? '',

        pageState: { page: page, pageSize: pageSize },
        sortModel: []
      });
      return simpleSearchResponse;
    },
    {
      enabled: tab == 2 && !!data?.simpleSearchParams,
      onSuccess: () => { },
    }
  );
  const simpleSearchColumns: GridColDef[] = useMemo(
    () =>
      simpleSearch?.columnList.map(
        (item) =>
          item && {
            field: item?.misColumnName ?? item?.misColumnLabel,
            headerName: item?.misColumnLabel,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
            flex: 2,
            minWidth: 120,
          }
      ) ?? [],
    [simpleSearch?.columnList]
  );
  const dicHQColumns: GridColDef[] =
    [
      {
        field: 'misUserName',
        headerName: 'User Name',
        minWidth: 150,
      },
      {
        field: 'misUserLoginId',
        headerName: 'User Login ID',
        minWidth: 150,
      },
      {
        field: 'misEmail',
        headerName: 'Email',
        minWidth: 200,
      },
      {
        field:'misUserId',
        headerName: 'User ID',
        minWidth: 200,
      },  {
        field:'surnameEng',
        headerName: 'Surname(Eng)',
        minWidth:150
      },{
        field: 'givenNameEng',
        headerName: 'Given Name(Eng)',
        minWidth: 150,

      }, {
        field: 'misUserStatus',
        headerName: 'Status',
        minWidth: 150,

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
                onClick={() => {
                  setIsEditDialogOpen(true);
                  console.log('props.row ========', props.row);
                  reset({
                    ...props.row,
                    isLocked: props.row.locked == true ? 'Y' : 'N',
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
                    title: 'Delete User',
                    message: `Are you sure to delete ${props.row.misUserName} ?`,
                    confirmAction: () => DeleteUser.mutate({ misUserId: props.id as string }),
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

  const dicColumns: GridColDef[] =
    [
      {
        field: 'misUserName',
        headerName: 'User Name',
        minWidth: 150,
      },
      {
        field: 'misUserLoginId',
        headerName: 'User Login ID',
        minWidth: 150,
      },
      {
        field: 'misUserId',
        headerName: 'User ID',
        minWidth: 150,
      },
      {
        field: 'misEmail',
        headerName: 'Email',
        minWidth: 200,
      },
      {
        field:'surnameEng',
        headerName: 'Surname(Eng)',
        minWidth:150
      }, {
        field: 'givenNameEng',
        headerName: 'Given Name(Eng)',
        minWidth: 150,

      }, {
        field: 'misUserStatus',
        headerName: 'Status',
        minWidth: 150,

      },
      {
        field: 'district',
        headerName: 'District',
        minWidth: 150
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
                onClick={() => {
                  setIsEditDialogOpen(true);
                  console.log('props.row ========', props.row);
                  reset({
                    ...props.row,
                    isLocked: props.row.locked == true ? 'Y' : 'N',
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
                    title: 'Delete User',
                    message: `Are you sure to delete ${props.row.misUserName} ?`,
                    confirmAction: () => DeleteUser.mutate({ misUserId: props.id as string }),
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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSearchDialogOpen, setSearchDiaLogOpen] = useState(false);

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });



  const handleSortChange = (newSortModel: any) => {
    console.log(newSortModel);
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
  const {
    data: userPageData,
    isLoading,
    refetch,
  } = useQuery(
    ['useradmin', pageState, sortModel],
    async () => {
      const { data: response } = await client.userAdmin.searchUser({
        misUserName: getValues('misUserName'),
        surnameEng: getValues('surnameEng'),
        givenNameEng: getValues('givenNameEng'),
        otherNameEng: getValues('otherNameEng'),
        misEmail: getValues('misEmail'),
        district: getValues('district') === undefined ? '[]' : getValues('district'),
        tel: getValues('tel'),
        fax: getValues('fax'),
        hq: path,
        misUserStatus: getValues('misUserStatus') === undefined ? 'Y' : getValues('misUserStatus'),
        pageable: {
          pageState,
          sortModel,
        },
      });
      return response;
    },
    {
      keepPreviousData: true,
    }
  );


  const SaveUser = useMutation(client.userAdmin.saveUser, {
    onSuccess: () => {
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries(['useradmin', pageState, sortModel]);
      reset({
        misEmail: '',
        misUserLoginId: '',
        misUserLocation: '',
        misUserName: '',
        position: '',
        misUserPassword: '',
        misUserId: '',
        surnameEng: '',
        givenNameEng: '',
        otherNameEng: '',
        district: '',
        tel: '',
        fax: '',
        misUserStatus: 'Y',
        isAdmin: 'N',
        isLocked: 'N',
      });

      toast('Save successfully', {
        type: 'success',
      });
    },
  });
  const DeleteUser = useMutation(client.userAdmin.delUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['useradmin', pageState, sortModel]);
      toast('Delete successfully', {
        type: 'success',
      });
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserDetail>({ mode: 'onSubmit' });

  const {
    control: searchControl,
    getValues,
    handleSubmit: searchHandleSubmit,
    formState: { errors: searchErrors },
  } = useForm<SearchUserInput>({ mode: 'onSubmit' });

  const isEdit = watch('misUserId');
  path = path.replace("/dashboard/", "")
  if (path === "0018000000000056") {
    path = "District"
  }
  if (path === "0018000000000057") {
    path = "HQ"
  }


  return (
    <>
      <Paper
        sx={{
          height: '100%',
          backgroundColor: 'white',
          padding: '10px',
          overflowY: 'auto',
          borderRadius: '12px',
        }}
      >
        {/* <Typography variant="h5">User Administration</Typography> */}
        {/* <Box
          sx={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center' }}
        ></Box> */}
        <Box display="flex" justifyContent="flex-end" p={2} sx={{
          backgroundColor: '#EDEDEB'
        }}>
          <Button

            variant="contained"
            {...btnStyle['primary']}
            startIcon={icon["SEARCH"]}
            onClick={() => setSearchDiaLogOpen(true)}
          >
            Search
          </Button>

          <Button

            variant="contained"
            {...btnStyle['primary']}
            startIcon={icon["ADD"]}
            onClick={() => setIsEditDialogOpen(true)}
          >
            Create New
          </Button>
          <Button

            variant="contained"
            {...btnStyle['primary']}
            startIcon={icon["EXPORT"]}
          // onClick={() => setIsEditDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
        <DataGrid
          filterModel={{
            items: [],
            quickFilterValues: searchRecordInput.split(','),
            quickFilterLogicOperator: GridLinkOperator.Or,
          }}
          components={{
            NoRowsOverlay: DataNotFound,
          }}
          autoHeight={true}
          getRowHeight={() => 'auto'}
          sx={{
            backgroundColor: 'white',
            border: 'none',
            ['.MuiDataGrid-columnHeaders']: {
              backgroundColor: '#EDEDEB',
            },
            ['.MuiButtonBase-root.Mui-checked']: {
              color: '#8C8C8C',
            },
            ['.MuiDataGrid-cell']: {
              border: 'none',
              minHeight: '52px!important',
            },
            ['.MuiDataGrid-row.Mui-selected']: {
              backgroundColor: '#eaeaea',
              [':hover']: {
                backgroundColor: '#eaeaea',
              },
            },
          }}
          loading={isLoading || isSimpleSearchLoading}
          columns={(path === "HQ" ? dicHQColumns : dicColumns)}
          rows={userPageData?.data ?? []}
          rowsPerPageOptions={[10, 30, 50, 70, 100]}
          rowCount={userPageData?.total ?? 0}
          page={pageState.page - 1}
          pageSize={pageState?.pageSize ?? 0}
          getRowId={(row) => row.misUserId}
          disableColumnMenu
          onPageChange={(newPage) => {
            setPageState((old) => ({ ...old, page: newPage + 1 }));
          }}
          onPageSizeChange={(newPageSize) =>
            setPageState((old) => ({ ...old, pageSize: newPageSize }))
          }
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortChange}
        />
        {/* <DataGrid
          autoHeight
          rows={userPageData?.data ?? []}
          rowCount={userPageData?.total ?? 0}
          loading={isLoading}
          rowsPerPageOptions={[10, 30, 50, 70, 100]}
          page={pageState.page - 1}
          pageSize={pageState?.pageSize ?? 0}
          columns={dicColumns}
          disableColumnMenu
          onPageChange={(newPage) => {
            setPageState((old) => ({ ...old, page: newPage + 1 }));
          }}
          onPageSizeChange={(newPageSize) =>
            setPageState((old) => ({ ...old, pageSize: newPageSize }))
          }
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortChange}
          getRowId={(row) => row.misUserId}
        /> */}

        <Dialog open={isEditDialogOpen} sx={{ [`& .MuiPaper-root`]: { maxWidth: '960px' } }}>
          <form
            onSubmit={handleSubmit((data) => {
              if(path==="HQ"){
                data.district="HQ"
              }
              if(data.misEmail!=null){
                const emailRegex = /@.+$/;
                data.misUserLoginId=data.misEmail.replace(emailRegex,"")
              }else{
                let temp = data.givenNameEng?.charAt(0)??"A";
                let count = data.givenNameEng?.indexOf(" ")??0;
                count += 1;
                temp +=data.givenNameEng?.charAt(count);
                data.misUserLoginId = temp?.toUpperCase()+data.otherNameEng?.toUpperCase() 
              }
              SaveUser.mutate({ ...data });
            })}
          >
            <DialogTitle>{isEdit ? 'Edit User' : 'Create New'}</DialogTitle>
            <DialogContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                paddingX: 6,
              }}
            >
              <Card
                // style={{ ...style, overflowY: 'auto' }}
                sx={{ marginBottom: '10px' }}
                className={cn(undefined, styles.container)}
              >
                <div ref={titleRef} className={styles.title}>
                  {'Personal Information'}
                </div>
                <Paper
                  ref={containerRef}
                  className={styles.wrapper}
                  sx={{
                    height: `calc(100%)`,
                  }}
                >
                  <div className={styles.form}>
                    <Stack
                      spacing={1}
                      direction="row"
                      useFlexGap
                      flexWrap="wrap"
                      justifyContent="flex-start"
                    >
                      <Controller
                        name="surnameEng"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Surname(Eng)"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="givenNameEng"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Given Name(Eng)"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="otherNameEng"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Other Name(Eng)"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="misUserName"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={(e) => {
                              if (!isEdit) {
                                setValue('misUserLoginId', e.target.value);
                              }
                              onChange(e);
                            }}
                            value={value}
                            fullWidth
                            label="User Name(Chin)"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />

                      {(path === "District" || isEdit) ? (<Controller
                        name="district"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            fullWidth
                            variant="standard"
                            sx={{ width: '260px', marginTop: '18px' }}
                          >
                            <InputLabel error={!!errors.district}>District</InputLabel>
                            <Select
                              autoWidth
                              error={!!errors.district}
                              variant="standard"
                              value={value}
                              label="District"
                              onChange={onChange}
                            >
                              {Array.isArray(dictionary) &&
                                dictionary.map((item) => (
                                  <MenuItem key={item.key} value={item.key}>
                                    {item.value}
                                  </MenuItem>
                                ))}
                            </Select>
                            {!!errors.district && (
                              <FormHelperText error>
                                {errors?.district.message as string}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />) : null}

                      <Controller
                        name="tel"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Tel."
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="fax"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserName}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Fax"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserName?.message as string}
                          />
                        )}
                      />

                      <Controller
                        name="misEmail"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Entered value does not match email format',
                          },
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misEmail}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Email"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misEmail?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="position"
                        control={control}
                        // rules={{
                        //   required: 'This Field is required',
                        //   pattern: {
                        //     value: /\S+@\S+\.\S+/,
                        //     message: 'Entered value does not match email format',
                        //   },
                        // }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.position}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Position"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.position?.message as string}
                          />
                        )}
                      />
                      <Controller
                        name="isAdmin"
                        defaultValue={'N'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!errors?.isAdmin}
                            variant="standard"
                            sx={{
                              minWidth: '260px',
                              display: 'flex',
                              flexDirection: 'column',
                              marginY: 2,
                            }}
                          >
                            <Typography variant="caption">Administrator</Typography>
                            <FormControlLabel
                              checked={value === 'Y'}
                              onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                              control={<Checkbox />}
                              label={value === 'Y' ? 'Yes' : 'No'}
                              labelPlacement="end"
                              sx={{ marginY: -1 }}
                            />
                          </FormControl>
                        )}
                      />
                      <Controller
                        name="isLocked"
                        defaultValue={'N'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!errors?.isLocked}
                            variant="standard"
                            sx={{
                              minWidth: '260px',
                              display: 'flex',
                              flexDirection: 'column',
                              marginY: 2,
                            }}
                          >
                            <Typography variant="caption">Locked</Typography>
                            <FormControlLabel
                              checked={value === 'Y'}
                              onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                              control={<Checkbox />}
                              label={value === 'Y' ? 'Lock' : 'Unlock'}
                              labelPlacement="end"
                              sx={{ marginY: -1 }}
                            />
                          </FormControl>
                        )}
                      />
                      <Controller
                        name="misUserStatus"
                        defaultValue={'N'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            error={!!errors?.misUserStatus}
                            variant="standard"
                            sx={{
                              minWidth: '260px',
                              display: 'flex',
                              flexDirection: 'column',
                              marginY: 2,
                            }}
                          >
                            <Typography variant="caption">Status</Typography>
                            <FormControlLabel
                              checked={value === 'Y'}
                              onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                              control={<Checkbox />}
                              label={value === 'Y' ? 'Active' : 'Inactive'}
                              labelPlacement="end"
                              sx={{ marginY: -1 }}
                            />
                          </FormControl>
                        )}
                      />
                      {/* <Controller
                        name="misUserLocation"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserLocation}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            label="Location"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserLocation?.message as string}
                          />
                        )}
                      /> */}
                    </Stack>
                  </div>
                </Paper>
              </Card>
              <Card
                // style={{ ...style, overflowY: 'auto' }}
                sx={{ marginBottom: '10px' }}
                className={cn(undefined, styles.container)}
              >
                <div ref={titleRef} className={styles.title}>
                  {'Login Information'}
                </div>
                <Paper
                  ref={containerRef}
                  className={styles.wrapper}
                  sx={{
                    height: `calc(100%)`,
                  }}
                >
                  <div className={styles.form}>
                    <Stack
                      spacing={1}
                      direction="row"
                      useFlexGap
                      flexWrap="wrap"
                      justifyContent="flex-start"
                    >
                      {isEdit?<Controller
                        name="misUserLoginId"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserLoginId}
                            onChange={onChange}
                            value={value}
                            fullWidth
                            InputProps={{
                              readOnly: true,
                            }}
                            label="Login ID"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserLoginId?.message as string}
                          />
                        )}
                      />:null}
                      <Controller
                        name="misUserPassword"
                        control={control}
                        rules={{
                          required: 'This Field is required',
                          validate: {
                            isPasswordValid: (value) =>
                              isPasswordValid(value) ||
                              (('Password must contain at least ' + passwordLength) as string) +
                              ' characters' +
                              (digit || letters || upperLowerCase || specialChar
                                ? ', including '
                                : '') +
                              (digit ? 'digit ' : '') +
                              ((digit && letters) ||
                                (digit && upperLowerCase) ||
                                (digit && specialChar)
                                ? ','
                                : '') +
                              (letters ? 'letters ' : '') +
                              ((letters && upperLowerCase) || (letters && specialChar)
                                ? ','
                                : '') +
                              (upperLowerCase ? 'uppercase, lowercase ' : '') +
                              (specialChar && upperLowerCase ? ',' : '') +
                              (specialChar ? 'special character' : ''),
                          },
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            error={!!errors.misUserPassword}
                            onChange={onChange}
                            value={value}
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            label="Password"
                            sx={{ width: '260px', marginTop: 2 }}
                            helperText={errors.misUserPassword?.message as string}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={handleTogglePassword}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </div>
                </Paper>
              </Card>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" type="submit">
                {isEdit ? 'Edit' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  reset({
                    misEmail: '',
                    misUserLoginId: '',
                    position: '',
                    misUserLocation: '',
                    misUserName: '',
                    misUserPassword: '',
                    misUserId: '',
                    surnameEng: '',
                    givenNameEng: '',
                    otherNameEng: '',
                    district: '',
                    tel: '',
                    fax: '',
                    misUserStatus: 'Y',
                    isAdmin: 'N',
                    isLocked: 'N',
                  });
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={isSearchDialogOpen} sx={{ [`& .MuiPaper-root`]: { maxWidth: '960px' } }}>
          <form
            onSubmit={searchHandleSubmit(
              () => {
                refetch();
                setSearchDiaLogOpen(false);
              },
              (error) => {
                console.log(error);
              }
            )}
          >
            <DialogContent sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              paddingX: 6,
            }}
            >
              <Stack>
                <div className={styles.searchform}>
                  <Stack
                    spacing={1}
                    direction="row"
                    useFlexGap
                    flexWrap="wrap"
                    justifyContent="flex-start"
                  >
                    <Controller
                      name="surnameEng"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Surname(Eng)"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="givenNameEng"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Given Name(Eng)"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="otherNameEng"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Other Name(Eng)"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="misUserName"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="User Name(Chin)"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="misEmail"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Email"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="fax"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Fax"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    <Controller
                      name="tel"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          error={!!searchErrors.misUserName}
                          onChange={onChange}
                          value={value}
                          fullWidth
                          label="Tel"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                          helperText={searchErrors.misUserName?.message as string}
                        />
                      )}
                    />
                    {path == "District" ? (<Controller
                      name="district"
                      control={searchControl}
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <FormControl
                          variant="standard"
                          sx={{ width: '260px', marginTop: 2 }}
                          size="small"
                        >
                          {/* <InputLabel id="demo-simple-select-label">{misColumnLabel}</InputLabel> */}
                          <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={(Array.isArray(dictionary) && dictionary?.map((c) => c)) || []}
                            getOptionLabel={(option) => option.value}
                            filterSelectedOptions
                            value={values}
                            disableCloseOnSelect
                            size="small"
                            onChange={(e, newValues) => {
                              setValues(newValues);
                              console.log(
                                JSON.stringify(newValues.map((item) => "'" + item.key + "'"))
                              );
                              console.log(JSON.stringify(newValues.map((item) => item.key)));
                              console.log(newValues.map((item) => item.key));

                              onChange(JSON.stringify(newValues.map((item) => item.key)));
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label={'District'} placeholder={'District'} />
                            )}
                          />
                        </FormControl>
                      )}
                    />) : null}

                    <Controller
                      name="misUserStatus"
                      control={searchControl}
                      defaultValue="Y"
                      rules={{}}
                      render={({ field: { onChange, value } }) => (
                        <FormControl>
                          <FormLabel id="row-radio-label">Status</FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby="row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                          >
                            <FormControlLabel
                              value="Y"
                              control={
                                <Radio size="small" onChange={onChange} checked={value === 'Y'} />
                              }
                              label="Active"
                            />
                            <FormControlLabel
                              value="N"
                              control={<Radio size="small" onChange={onChange} />}
                              label="Inactive"
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                  </Stack>
                  <Stack
                    spacing={1}
                    direction="row"
                    useFlexGap
                    flexWrap="wrap"
                    justifyContent="flex-start"
                  >
                    <Button variant="contained" sx={{ my: 1 }} type="submit">
                      Search
                    </Button>
                    <Button variant="contained" sx={{ my: 1 }} onClick={() => {
                      setSearchDiaLogOpen(false);
                    }}>
                      Cancel
                    </Button>
                  </Stack>
                </div>
              </Stack>

            </DialogContent>

          </form>
        </Dialog>
      </Paper>
    </>
  );
};
export type RecordListProps = {
  row: {
    click: {
      showOverlay: boolean;
    };
  };
  default: {
    folderId: string;
  };
} & WidgetProps<btnProps>;

type btnProps = {
  name: availableBtn;
  configId: string;
  theme: btnTheme;
  misSimpleSearchId: string;
  misSimpleSearchName: string;
  misDefaultTableId: string;
  propertyId: string;
  detail: string;
};
type btnTheme = 'primary' | 'secondary' | 'danger';
type availableBtn = 'SEARCH' | 'QUICK' | 'BASIC' | 'ADVANCE' | 'Create' | 'EXPORT';

export default UserAdminPage;
