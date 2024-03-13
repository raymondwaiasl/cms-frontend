import route from '../../router/route';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  RadioGroup,
  Radio,
  FormControl,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer } from '@mui/x-data-grid';
import { TableColumn, TableColumnComputeFormula } from 'libs/common/src/lib/api';
import { inputTypeList, typeList, operatorList } from 'libs/common/src/lib/constant';
import { useApi, useDialog } from 'libs/common/src/lib/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { AiOutlineLink } from 'react-icons/ai';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { FaPlus, FaSave } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemsEqual } from '@dnd-kit/sortable/dist/utilities';
import { RestaurantMenuRounded } from '@mui/icons-material';

let groupPerData: any = {};
const EditTablePage = () => {
  const { search } = useLocation();
  const history = useHistory();
  const client = useApi();
  const queryClient = useQueryClient();
  const id = useMemo(() => new URLSearchParams(search).get('id') ?? '', [search]);
  const misTypeName = useMemo(() => new URLSearchParams(search).get('misTypeName') ?? '', [search]);
  const misTypeLable = useMemo(() => new URLSearchParams(search).get('misTypeLable') ?? '', [search]);
  console.log(id+"====="+misTypeName);
  const { openDialog } = useDialog();
  const currentTypeLabel=useRef('');
  const { data: tableProperties, isLoading } = useQuery(
    'Table',
    async () => {
      const { data } = await client.type.selectTypeById({ id });
      return data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        resetTable({
          misTypeLabel: data?.misTypeLabel,
        });
      },
    }
  );
  const { data: dictionary } = useQuery(
    'Type Dic',
    async () => {
      const { data } = await client.type.getDicList();
      return data;
    },
    {
      initialData: queryClient.getQueryData('Type Dic'),
    }
  );
  const UpdateType = useMutation(client.type.updateType, {
    onSettled: () => {
      queryClient.invalidateQueries('Table');
    },
  });
  const UpdateCol = useMutation(client.type.updateColumn, {
    onSettled: () => {
      queryClient.invalidateQueries('Table');
    },
  });
  const AddCol = useMutation(client.type.addNewColumn, {
    onSettled: () => {
      queryClient.invalidateQueries('Table');
    },
  });
  const DelCol = useMutation(client.type.deleteColumn, {
    onSettled: () => {
      queryClient.invalidateQueries('Table');
    },
  });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditPermissionDialogOpen, setIsEditPermissionDialogOpen] = useState(false);
  // const [operatorFilterList,setOperatorFilterList] = useState<Array<{key:string;value:string}>>([]);
  const [allowOperators, setAllowOperators] = useState<Array<String>>([]);
  const [allowColumnId2, setAllowColumnId2] = useState<Array<String>>([]);
  const [isRelationOpen, setIsRelationOpen] = useState(false);
  const [relationData, setRelationData] = useState<Relations[]>();
  const {
    formState: { errors },
    control,
    reset: resetTable,
    handleSubmit: tableSubmit,
  } = useForm<{ misTypeLabel: string,misTypeName:string }>({
    mode: 'onSubmit',
    defaultValues: {
      misTypeLabel: tableProperties?.misTypeLabel,
      misTypeName: misTypeName,
      // misTypeName: '',
      //draftTable: '',
    },
  });

  const {
    formState: { errors: ColumnErrors, isDirty: isColDirty },
    control: columnDataControl,
    watch,
    handleSubmit,
    trigger,
    reset,
  } = useForm<TableColumn>({
    mode: 'onSubmit',
    defaultValues: {
      misColumnId: '',
      misTypeId: tableProperties?.misTypeId,
      
    },
  });

  const {
    formState: { errors: relationErrors },
    control: relationControl,
    handleSubmit: relationSubmit,
    reset: relationReset,
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      relations: relationData ?? [],
    },
  });

  const [sortModel, setSortModel] = useState({
    field: '',
    sort: '',
  });
  const { fields, append, remove } = useFieldArray({
    name: 'relations',
    control: relationControl,
  });
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
  const { data: tableName } = useQuery('table List', async () => {
    const { data: tableResponse } = await client.queryForm.getTypeDic();
    return tableResponse;
  });
  const { data: tablePermission } = useQuery('table permission', async () => {
    const { data: tablePermission } = await client.type.getTypePermission({id:id});
    return tablePermission;
  });
  const watchIsEdit = !!watch('misColumnId');
  const enableDictionary =
    watch('misColumnInputType') === '2' || watch('misColumnInputType') === '4';

  const enableComputeField = watch('misColumnInputType') === '10';
  const enableQuery = watch('misColumnInputType') === '11' || watch('misColumnInputType') === '12';

  const watchColumnID = watch('misColumnId');
  const watchComputeFrom = watch('misColumnComputeFrom');

  const watchMisColumnComputeFormulaMisColumnId1 = watch('misColumnComputeFormula.misColumnId1');
  const watchMisColumnComputeFormulaOperator = watch('misColumnComputeFormula.operator');
  const watchMisColumnComputeFormulaMisColumnId2 = watch('misColumnComputeFormula.misColumnId2');
  useEffect(() => {
    const selectedColumn1 = tableProperties?.misColumnList.filter(
      (c) => c.misColumnId === watchMisColumnComputeFormulaMisColumnId1
    )?.[0];
    if (!selectedColumn1) {
      return;
    }
    /**
      { key: '0', value: 'Boolean', disabled: ['5', '6', '7'] },
      { key: '1', value: 'String', disabled: ['5', '6', '7'] },
      { key: '2', value: 'Integer', disabled: ['5', '6', '7'] },
      { key: '3', value: 'ID', disabled: ['5', '6', '7'] },
      { key: '4', value: 'Date', disabled: ['0', '1', '2', '3', '4'] },
      { key: '5', value: 'Double', disabled: ['5', '6', '7'] },
      +: plus, support string, integer, date (the second value must be an integer)
      -: minus, support integer, date (how many dates between the first date and second date)
      *: multiply, support integer, double
      /: divide, support integer, double
     */
    const plus = true;
    const minus =
      selectedColumn1.misColumnType === '2' ||
      selectedColumn1.misColumnType === '4' ||
      selectedColumn1.misColumnType === '5';
    const multiply = selectedColumn1.misColumnType === '2' || selectedColumn1.misColumnType === '5';
    const divide = selectedColumn1.misColumnType === '2' || selectedColumn1.misColumnType === '5';
    const opts = operatorList
      .filter(
        (o) =>
          (o.key === '+' && plus) ||
          (o.key === '-' && minus) ||
          (o.key === '*' && multiply) ||
          (o.key === '/' && divide)
      )
      .map((o) => o.key);
    setAllowOperators(opts);
    trigger('misColumnComputeFormula.operator');
  }, [watchMisColumnComputeFormulaMisColumnId1]);

  useEffect(() => {
    const current = watchMisColumnComputeFormulaOperator;
    const selectedColumn1 = tableProperties?.misColumnList.filter(
      (c) => c.misColumnId === watchMisColumnComputeFormulaMisColumnId1
    )?.[0];
    setAllowColumnId2([]);
    if (current === '+') {
      if (selectedColumn1?.misColumnType === '4') {
        setAllowColumnId2(
          tableProperties?.misColumnList
            .filter((c) => c.misColumnType === '2')
            .map((c) => c.misColumnId) || []
        );
      } else {
        setAllowColumnId2(tableProperties?.misColumnList.map((c) => c.misColumnId) || []);
      }
    }

    if (current === '-') {
      if (selectedColumn1?.misColumnType === '2' || selectedColumn1?.misColumnType === '5') {
        setAllowColumnId2(
          tableProperties?.misColumnList
            .filter((c) => c.misColumnType === '2' || c.misColumnType === '5')
            .map((c) => c.misColumnId) || []
        );
      } else if (selectedColumn1?.misColumnType === '4') {
        setAllowColumnId2(
          tableProperties?.misColumnList
            .filter((c) => c.misColumnType === '4')
            .map((c) => c.misColumnId) || []
        );
      }
    }

    if (current === '*' || current === '/') {
      setAllowColumnId2(
        tableProperties?.misColumnList
          .filter((c) => c.misColumnType === '2' || c.misColumnType === '5')
          .map((c) => c.misColumnId) || []
      );
    }
    trigger('misColumnComputeFormula.misColumnId2');
  }, [watchMisColumnComputeFormulaOperator]);

  const editTypeAndDraf = useMutation(client.type.editNewTypeAndDraf, {
    onSuccess: () => {
      queryClient.invalidateQueries('table Mgmt');
      queryClient.invalidateQueries('table permission');
      //reset();
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
            setIsEditPermissionDialogOpen(true);
            reset({
              misColumnId: '',
              misTypeId: tableProperties?.misTypeId,
            });
          }}
          sx={{ marginRight: 2 }}
        >
          EDIT TABLE PERMISSION
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FaPlus />}
          onClick={() => {
            setIsDialogOpen(true);
            reset({
              misColumnId: '',
              misTypeId: tableProperties?.misTypeId,
            });
          }}
          sx={{ marginRight: 2 }}
        >
          ADD COLUMN
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AiOutlineLink />}
          onClick={() => history.push({ pathname: route.tableReference, search: `?id=${id}` })}
        >
          CROSS REFERENCE
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FaPlus />}
          onClick={() => {
            setIsRelationOpen(true);
            relationReset({
              relations: [{ tableId: '', isReversive: '' }],
            });
          }}
          sx={{ marginLeft: 2 }}
        >
          Relation
        </Button>
      </GridToolbarContainer>
    );
  };

  const AddRelation = useMutation(client.relation.addRelation, {
    onSuccess: () => {
      toast.success('Relation created successfully');
      setIsRelationOpen(false);
    },
  });
  const submitHandling = async (data: any) => {
    let relation: Relations[] = [];
    let typesId = '';
    for (let field of data.relations) {
      relation.push({
        tableId: field.tableId,
        isReversive: field.isReversive,
      });
      typesId += field.tableId + ',';
    }
    if (typesId.indexOf(id) != -1) {
      toast.error('The relation table cannot be the same as the main table');
      return;
    }
    AddRelation.mutate({
      typeId: id,
      relations: relation,
    });
  };
  const { data: groupData } = useQuery(
    [
      'group Permission',
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

  const handleChange = (e: any, checkValue: any) => {
    groupPerData[checkValue] = e.target.checked;
    const el = document.getElementById(checkValue);
    console.log(el?.spellcheck+'======' + JSON.stringify(groupPerData));
  };

  function getFullName(params: any) {
    if (dictionary) {
      return dictionary?.find((item) => item.key === params.row.misColumnDictionary)?.value ?? '';
    }
    return params.row.misColumnDictionary;
  }
  const columns: GridColDef[] = [
    { field: 'misColumnId', headerName: 'S/N', flex: 2, minWidth: 200 },
    {
      field: 'misColumnLabel',
      headerName: 'Column Label',
      flex: 1,
    },
    {
      field: 'misColumnName',
      headerName: 'Column Name',
      flex: 1,
    },
    {
      field: 'misColumnType',
      headerName: 'Type',
      valueGetter: (param) => typeList[param.row.misColumnType].value ?? '',
      flex: 1,
    },
    {
      field: 'misColumnLength',
      headerName: 'Length',
      flex: 1,
    },
    {
      field: 'misColumnWidth',
      headerName: 'Width',
      flex: 1,
    },
    {
      field: 'misColumnInputType',
      headerName: 'Input Type',
      valueGetter: (param) => inputTypeList[param.row.misColumnInputType].value ?? '',
      flex: 1,
    },
    {
      field: 'misColumnDictionary',
      headerName: 'Data Dictionary',
      valueGetter: getFullName,
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'misColumnAllowSearch',
      headerName: 'Allow Search',
      valueGetter: (param) => (param.row.misColumnAllowSearch === 'Y' ? 'Allowed' : 'Not Allowed'),
      minWidth: 100,
      flex: 1,
    },
    {
      field: 'misColumnAllowEmpty',
      headerName: 'Allow Empty',
      valueGetter: (param) => (param.row.misColumnAllowEmpty === 'Y' ? 'Allowed' : 'Not Allowed'),
      minWidth: 100,
      flex: 1,
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
                reset({ ...props.row });
                setIsDialogOpen(true);
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
                console.log(props);
                openDialog('deleteDialog', {
                  title: 'Delete Column',
                  message: 'Are you sure to delete this column?',
                  confirmAction: () => {
                    DelCol.mutate({ id: props.id as string });
                  },
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
        let isBooean=false;
        tablePermission?.forEach((item, index) => {
          if(props.row.name==item.misGroupName&&item.access=='1'){
            console.log(item.misGroupName+"===="+item.access);
                isBooean=true;  
          }
        });
          return(
            <>
                 <Checkbox defaultChecked={isBooean?true:false}
                  onChange={(e) => handleChange(e, 'Access' + props.row.id)}
                  id={'Access' + props.row.id} ></Checkbox>
                 
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
        let isBooean=false;
        tablePermission?.forEach((item, index) => {
          if(props.row.name==item.misGroupName&&item.directCreate=='1'){
            isBooean=true;
            }
        });
        
          return(
            <>
                 <Checkbox defaultChecked={isBooean?true:false}
                  onChange={(e) => handleChange(e, 'Create' + props.row.id)}
                  name={'Create' + props.row.id} ></Checkbox>
                 
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
        let isBooean=false;
        tablePermission?.forEach((item, index) => {
          if(props.row.name==item.misGroupName&&item.directEdit=='1'){
            isBooean=true;
            
            }
        });
       
          return(
            <>
                 <Checkbox defaultChecked={isBooean?true:false}
                  onChange={(e) => handleChange(e, 'Edit' + props.row.id)}
                  name={'Edit' + props.row.id} ></Checkbox>
                 
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
        let isBooean=false;
        tablePermission?.forEach((item, index) => {
          if(props.row.name==item.misGroupName&&item.directDelete=='1'){
            isBooean=true;
            
            }
        });
       
          return(
            <>
                 <Checkbox defaultChecked={isBooean?true:false}
                  onChange={(e) => handleChange(e, 'Delete' + props.row.id)}
                  name={'Delete' + props.row.id} ></Checkbox>
                 
                </>
          );
        
      },
    },
  ];
  return (
    <>
      <Typography variant="h5">Type Properties</Typography>
      <Stack direction="row" sx={{ marginY: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          component="form"
          onSubmit={tableSubmit((data) => {
            console.log(data);
            UpdateType.mutate({
              misTypeId: tableProperties?.misTypeId ?? '',
              misTypeLabel: data.misTypeLabel,
              misTypeName: tableProperties?.misTypeName ?? '',
            });
          })}
        >
          <Controller
            name="misTypeLabel"
            control={control}
            defaultValue={tableProperties?.misTypeLabel}
            rules={{
              required: 'This Field is required',
              maxLength: {
                value: 40,
                message: 'Input value has exceed 40 character',
              },
            }}
            render={({ field: { onChange, value }, fieldState: { isTouched } }) => (
              <>
                <TextField
                  variant="standard"
                  InputLabelProps={{ shrink: !!value && !isTouched }}
                  error={!!errors.misTypeLabel}
                  onChange={onChange}
                  value={value}
                  label="Label Name"
                  helperText={errors.misTypeLabel?.message as string}
                />
                <IconButton color="primary" type="submit">
                  <FaSave size={20} />
                </IconButton>
              </>
            )}
          />
        </Stack>
        <TextField
          label="Table Name"
          variant="standard"
          InputLabelProps={{ shrink: !!tableProperties?.misTypeName }}
          disabled
          value={tableProperties?.misTypeName}
          sx={{ marginLeft: 5 }}
        />
      </Stack>
      <DataGrid
        autoHeight
        sx={{ overflowX: 'auto' }}
        components={{
          Toolbar: ToolBar,
        }}
        rows={tableProperties?.misColumnList ?? []}
        pagination
        loading={isLoading}
        paginationMode="server"
        getRowId={(row) => row?.misColumnId}
        columns={columns}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      />
      <Dialog open={isDialogOpen} sx={{ [`& .MuiPaper-root`]: { maxWidth: '660px' } }}>
        <form
          onSubmit={handleSubmit(
            (data) => {
              if (!data.misColumnId && tableProperties) {
                AddCol.mutate(data);
              }
              if (data.misColumnId && tableProperties) {
                UpdateCol.mutate(data);
              }
              setIsDialogOpen(false);
            },
            (error) => {
              console.log(error);
            }
          )}
        >
          <DialogTitle>Column Config</DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              paddingX: 6,
            }}
          >
            <Stack
              spacing={2}
              direction="row"
              useFlexGap
              flexWrap="wrap"
              justifyContent="space-between"
            >
              <Controller
                name="misColumnLabel"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                  maxLength: {
                    value: 40,
                    message: 'Input value has exceed 40 character',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    error={!!ColumnErrors.misColumnLabel}
                    variant="standard"
                    onChange={onChange}
                    value={value}
                    defaultValue=""
                    margin="normal"
                    label="Label"
                    helperText={ColumnErrors.misColumnLabel?.message as string}
                    sx={{ width: '260px' }}
                  />
                )}
              />
              <Controller
                name="misColumnName"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                  maxLength: {
                    value: 40,
                    message: 'Input value has exceed 40 character',
                  },
                  pattern: {
                    value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                    message: 'Column name could not contain special characeter',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    disabled={watchIsEdit}
                    error={!!ColumnErrors.misColumnName}
                    onChange={onChange}
                    variant="standard"
                    value={value}
                    margin="normal"
                    helperText={ColumnErrors.misColumnName?.message as string}
                    label="Column Name"
                    sx={{ width: '260px' }}
                  />
                )}
              />
              <Controller
                name="misColumnType"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '260px' }}>
                    <InputLabel id="demo-simple-select-label" error={!!ColumnErrors.misColumnType}>
                      Column Type
                    </InputLabel>
                    <Select
                      autoWidth
                      error={!!ColumnErrors.misColumnType}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      disabled={watchIsEdit}
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        trigger('misColumnInputType');
                      }}
                    >
                      {typeList.map((item) => (
                        <MenuItem key={item.key} value={item.key} sx={{ width: '260px' }}>
                          {item.value}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!ColumnErrors.misColumnType && (
                      <FormHelperText error>
                        {ColumnErrors?.misColumnType.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="misColumnInputType"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                  validate: {
                    inputType_mismatched: (value) =>
                      !typeList
                        .find((item) => item.key === watch('misColumnType'))
                        ?.disabled?.includes(value) ||
                      'Input type is not matched with column data type',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth variant="standard" sx={{ width: '260px' }}>
                    <InputLabel error={!!ColumnErrors.misColumnInputType}>Input Type</InputLabel>
                    <Select
                      error={!!ColumnErrors.misColumnInputType}
                      autoWidth
                      variant="standard"
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        trigger('misColumnInputType');
                      }}
                    >
                      {inputTypeList.map((item) => (
                        <MenuItem
                          key={item.key}
                          value={item.key}
                          disabled={typeList
                            .find((item) => item.key === watch('misColumnType'))
                            ?.disabled?.includes(item?.key)}
                        >
                          {item.value}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!ColumnErrors.misColumnInputType && (
                      <FormHelperText error>
                        {ColumnErrors?.misColumnInputType.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="misColumnLength"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                  validate: {
                    minimum: (value) =>
                      Number(value || 0) >=
                        Number(
                          tableProperties?.misColumnList.find(
                            (item) => item.misColumnId === watchColumnID
                          )?.misColumnLength || 0
                        ) || 'The length of column cannot be smaller than current length or 0',
                    isInteger: (value) =>
                      Number.isInteger(Number(value)) || 'The length must be integer',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    error={!!ColumnErrors.misColumnLength}
                    onChange={onChange}
                    variant="standard"
                    value={value}
                    type="number"
                    margin="normal"
                    helperText={ColumnErrors.misColumnLength?.message as string}
                    label="Length"
                    sx={{ width: '260px' }}
                  />
                )}
              />

              <Controller
                name="misColumnWidth"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                  validate: {
                    minimum: (value) =>
                      Number(value || 0) > 0 || 'The length of column cannot be smaller than 0',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    error={!!ColumnErrors.misColumnWidth}
                    onChange={onChange}
                    variant="standard"
                    value={value}
                    type="number"
                    margin="normal"
                    helperText={ColumnErrors.misColumnWidth?.message as string}
                    label="Width"
                    sx={{ width: '260px' }}
                  />
                )}
              />

              <Controller
                name="misColumnAllowEmpty"
                defaultValue={'N'}
                control={columnDataControl}
                render={({ field: { onChange, value } }) => (
                  <FormControl
                    error={!!ColumnErrors?.misColumnAllowEmpty}
                    variant="standard"
                    sx={{
                      width: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="caption">Allow Empty</Typography>
                    <FormControlLabel
                      checked={value === 'Y'}
                      disabled={watchIsEdit}
                      onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                      control={<Checkbox />}
                      label={value === 'Y' ? 'Allowed' : 'Not Allowed'}
                    />
                  </FormControl>
                )}
              />
              <Controller
                name="misColumnAllowSearch"
                defaultValue={'Y'}
                control={columnDataControl}
                render={({ field: { onChange, value } }) => (
                  <FormControl
                    error={!!ColumnErrors?.misColumnAllowSearch}
                    variant="standard"
                    sx={{
                      width: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                      // marginY: 2,
                    }}
                  >
                    <Typography variant="caption">Allow Search</Typography>
                    <FormControlLabel
                      checked={value === 'Y'}
                      // disabled={watchIsEdit}
                      onChange={() => onChange(value === 'Y' ? 'N' : 'Y')}
                      control={<Checkbox />}
                      label={value === 'Y' ? 'Allowed' : 'Not Allowed'}
                    />
                  </FormControl>
                )}
              />
              {enableDictionary && (
                <Controller
                  name="misColumnDictionary"
                  control={columnDataControl}
                  rules={{
                    required: {
                      value: enableDictionary,
                      message: 'This Field is required',
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <FormControl fullWidth variant="standard" sx={{ width: '260px' }}>
                      <InputLabel error={!!ColumnErrors.misColumnDictionary}>
                        Data Dictionary
                      </InputLabel>
                      <Select
                        autoWidth
                        error={!!ColumnErrors.misColumnDictionary}
                        variant="standard"
                        value={value}
                        label="Data Dictionary"
                        onChange={onChange}
                      >
                        {Array.isArray(dictionary) &&
                          dictionary.map((item) => (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          ))}
                      </Select>
                      {!!ColumnErrors.misColumnDictionary && (
                        <FormHelperText error>
                          {ColumnErrors?.misColumnDictionary.message as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              )}
            </Stack>
            {enableComputeField && (
              <Stack direction={'row'} spacing={2}>
                <Controller
                  name="misColumnComputeFrom"
                  control={columnDataControl}
                  rules={{
                    required: {
                      value: enableComputeField,
                      message: 'This Field is required',
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <FormControl fullWidth variant="standard" sx={{ width: '120px' }}>
                      <Typography variant="caption">Compute From</Typography>
                      <RadioGroup
                        aria-labelledby="compute-type"
                        name="row-radio-buttons-group"
                        value={value}
                        onChange={onChange}
                      >
                        <FormControlLabel value="1" control={<Radio />} label="Formula" />
                        <FormControlLabel value="2" control={<Radio />} label="Query" />
                      </RadioGroup>
                      {!!ColumnErrors.misColumnComputeFrom && (
                        <FormHelperText error>
                          {ColumnErrors?.misColumnComputeFrom.message as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
                <Stack direction={'row'} useFlexGap flexWrap="wrap" spacing={1}>
                  <Controller
                    name="misColumnComputeFormula.misColumnId1"
                    control={columnDataControl}
                    rules={{
                      required: {
                        value:
                          watchComputeFrom === '1' ||
                          !!(
                            watchMisColumnComputeFormulaMisColumnId1 ||
                            watchMisColumnComputeFormulaOperator ||
                            watchMisColumnComputeFormulaMisColumnId2
                          ),
                        message: 'This Field is required',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl variant="standard" sx={{ width: '200px' }}>
                        <InputLabel
                          id="demo-simple-select-label"
                          error={!!ColumnErrors.misColumnComputeFormula?.misColumnId1}
                        >
                          Column
                        </InputLabel>
                        <Select
                          autoWidth
                          error={!!ColumnErrors.misColumnComputeFormula?.misColumnId1}
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          // disabled={watchIsEdit}
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                          }}
                        >
                          {tableProperties?.misColumnList.map((item) => (
                            <MenuItem
                              value={item.misColumnId}
                              key={item.misColumnId}
                              sx={{ width: '200px' }}
                            >
                              {item.misColumnLabel}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!ColumnErrors.misColumnComputeFormula?.misColumnId1 && (
                          <FormHelperText error>
                            {ColumnErrors?.misColumnComputeFormula?.misColumnId1.message as string}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="misColumnComputeFormula.operator"
                    control={columnDataControl}
                    rules={{
                      required: {
                        value:
                          watchComputeFrom === '1' ||
                          !!(
                            watchMisColumnComputeFormulaMisColumnId1 ||
                            watchMisColumnComputeFormulaOperator ||
                            watchMisColumnComputeFormulaMisColumnId2
                          ),
                        message: 'This Field is required',
                      },
                      validate: {
                        not_allowed_value: (v) =>
                          !!!v || allowOperators.includes(v) || 'Not allowed value',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl variant="standard" sx={{ width: '40px' }}>
                        <InputLabel
                          id="misColumnComputeFormula-operator-select-label"
                          error={!!ColumnErrors.misColumnComputeFormula?.operator}
                        >
                          {/* {allowOperators.join(',') + '|' + watchMisColumnComputeFormulaOperator} */}
                        </InputLabel>
                        <Select
                          autoWidth
                          error={!!ColumnErrors.misColumnComputeFormula?.operator}
                          labelId="misColumnComputeFormula-operator-select-label"
                          id="misColumnComputeFormula-operator-select"
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                            trigger('misColumnComputeFormula.operator');
                            trigger('misColumnComputeFormula.misColumnId2');
                          }}
                        >
                          {operatorList.map((item) => (
                            <MenuItem
                              key={item.key}
                              value={item.value}
                              disabled={!allowOperators.includes(item.key)}
                              sx={{ width: '40px' }}
                            >
                              {item.value}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!ColumnErrors.misColumnComputeFormula?.operator && (
                          <FormHelperText error>
                            {ColumnErrors?.misColumnComputeFormula?.operator.message as string}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="misColumnComputeFormula.misColumnId2"
                    control={columnDataControl}
                    rules={{
                      required: {
                        value:
                          watchComputeFrom === '1' ||
                          !!(
                            watchMisColumnComputeFormulaMisColumnId1 ||
                            watchMisColumnComputeFormulaOperator ||
                            watchMisColumnComputeFormulaMisColumnId2
                          ),
                        message: 'This Field is required',
                      },
                      validate: {
                        not_allowed_value: (v) =>
                          !!!v || allowColumnId2.includes(v) || 'Not allowed value',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl variant="standard" sx={{ width: '200px' }}>
                        <InputLabel
                          id="misColumnComputeFormula-misColumnId2-select-label"
                          error={!!ColumnErrors?.misColumnComputeFormula?.misColumnId2}
                        >
                          Column
                        </InputLabel>
                        <Select
                          autoWidth
                          error={!!ColumnErrors?.misColumnComputeFormula?.misColumnId2}
                          labelId="misColumnComputeFormula-misColumnId2-select-label"
                          id="misColumnComputeFormula-misColumnId2-select"
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                            trigger('misColumnComputeFormula.misColumnId2');
                          }}
                        >
                          {tableProperties?.misColumnList.map((item) => (
                            <MenuItem
                              value={item.misColumnId}
                              key={item.misColumnId}
                              disabled={!allowColumnId2.includes(item.misColumnId)}
                              sx={{ width: '200px' }}
                            >
                              {item.misColumnLabel}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!ColumnErrors?.misColumnComputeFormula?.misColumnId2 && (
                          <FormHelperText error>
                            {ColumnErrors?.misColumnComputeFormula?.misColumnId2.message as string}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="misColumnComputeQuery"
                    control={columnDataControl}
                    rules={{
                      required: {
                        value: watchComputeFrom === '2',
                        message: 'This Field is required',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl variant="standard" sx={{ width: '100%' }}>
                        {/* <InputLabel id="demo-simple-select-label" error={!!ColumnErrors.misColumnType}>
                          Column Type
                        </InputLabel> */}
                        <TextField
                          error={!!ColumnErrors.misColumnComputeQuery}
                          variant="standard"
                          onChange={onChange}
                          value={value}
                          defaultValue=""
                          margin="normal"
                          label="Query"
                          helperText={ColumnErrors.misColumnComputeQuery?.message as string}
                          multiline
                          rows={4}
                          sx={{ width: '100%' }}
                        />
                      </FormControl>
                    )}
                  />
                </Stack>
              </Stack>
            )}
            {enableQuery && (
              <Controller
                name="misColumnComputeQuery"
                control={columnDataControl}
                rules={{
                  required: 'This Field is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl variant="standard" sx={{ width: '100%' }}>
                    {/* <InputLabel id="demo-simple-select-label" error={!!ColumnErrors.misColumnType}>
                      Column Type
                    </InputLabel> */}
                    <TextField
                      error={!!ColumnErrors.misColumnComputeQuery}
                      variant="standard"
                      onChange={onChange}
                      value={value}
                      defaultValue=""
                      margin="normal"
                      label="Query"
                      helperText={ColumnErrors.misColumnComputeQuery?.message as string}
                      multiline
                      rows={4}
                      sx={{ width: '100%' }}
                    />
                  </FormControl>
                )}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit" disabled={!isColDirty}>
              {watchIsEdit ? 'Confirm' : 'Create'}
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

      <Dialog open={isRelationOpen} fullWidth>
        <Stack direction="row" spacing={1} mb={2}>
          <FormControl variant="standard" sx={{ marginLeft: 5, marginTop: 3 }}>
            <label>Table Name: {tableProperties?.misTypeName}</label>
          </FormControl>
        </Stack>
        <form onSubmit={relationSubmit(submitHandling)}>
          {fields.map((field, index) => {
            return (
              <Stack direction="row" spacing={2}>
                <Controller
                  name={`relations.${index}.tableId`}
                  control={relationControl}
                  rules={{
                    required: 'This Field is required',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <FormControl variant="standard" sx={{ minWidth: 200, marginLeft: 5 }}>
                      <InputLabel id="demo-simple-select-label">Table</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        renderValue={(value) => {
                          console.log(value);
                          return (
                            (tableName && tableName.find((item) => item.key === value)?.value) ?? ''
                          );
                        }}
                        value={value ?? `relations.${index}.tableId`}
                        // defaultValue={tableName[0].key}
                        onChange={onChange}
                      >
                        {Array.isArray(tableName) &&
                          tableName.map((item) => (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          ))}
                      </Select>
                      <FormHelperText>
                        {relationErrors?.relations?.[index]?.tableId?.message as string}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
                <Controller
                  name={`relations.${index}.isReversive`}
                  control={relationControl}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <FormControlLabel
                        label="Reversive"
                        control={<Checkbox checked={value ? true : false} onChange={onChange} />}
                      />
                    </>
                  )}
                />
                <div>
                  {index == 0 && (
                    <Button
                      style={{ marginLeft: 5, marginTop: 12 }}
                      variant="contained"
                      type="submit"
                      onClick={() =>
                        append({
                          tableId: '',
                          isReversive: '',
                        })
                      }
                    >
                      Add
                    </Button>
                  )}
                  {index !== 0 && (
                    <IconButton
                      aria-label="delete"
                      size="large"
                      onClick={() => remove(index)}
                      style={{ marginLeft: 5, marginTop: 12 }}
                    >
                      <ClearIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </div>
              </Stack>
            );
          })}
          <DialogActions>
            <Button variant="contained" type="submit">
              Save
            </Button>
            <Button
              onClick={() => {
                setIsRelationOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={isEditPermissionDialogOpen}>
        <form
          onSubmit={handleSubmit((data) => {
            console.log(groupPerData + '===' + JSON.stringify(groupPerData) != '{}');
              editTypeAndDraf.mutate({
                misTypeId: tableProperties?.misTypeId ?? '',
                groupPerData: JSON.stringify(groupPerData),
                misTypeLabel:currentTypeLabel.current,
                misTypeName:'',
                draftTable:'',
                typeGpPermissionId:id,
              });
              setIsEditPermissionDialogOpen(false);
              groupPerData = {};
          })}
        >
          <DialogTitle>Edit Table Permission</DialogTitle>
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
                  error={!!errors.misTypeLabel}
                  onChange={(e: any) => {
                    currentTypeLabel.current = e.target.value;
                  }}
                  value={value}
                
                  fullWidth
                  label="Label"
                  sx={{ minWidth: '300px', marginTop: 2 }}
                  helperText={errors.misTypeLabel?.message as string}
                />
              )}
            />
            {/* <Controller
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
            /> */}
            <Typography variant="caption">
              <span>*</span>Once table name created, It cannot be changed later
            </Typography>
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
            
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              Edit
            </Button>
            <Button
              onClick={() => {
                setIsEditPermissionDialogOpen(false);
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

export default EditTablePage;

export interface Relations {
  tableId?: string;
  isReversive?: string;
}
