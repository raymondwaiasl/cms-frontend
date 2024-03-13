import { GetTableData, ImportExcelDataInput } from '../../../api';
import { useApi, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { difference } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RiCloseFill, RiFileExcel2Fill } from 'react-icons/ri';
import { useQuery, useQueryClient } from 'react-query';
import XLSX from 'xlsx';

const DataImport = () => {
  const client = useApi();
  const queryClient = useQueryClient();
  const [currentFile, setCurrentFile] = useState<File>();
  const [isOpen, setIsOpen] = useState(false);
  const [typeId, setTypeId] = useState('');
  const [column, setColumn] = useState<Array<any>>([]);
  const [row, setRow] = useState<Array<any>>([]);
  const { control, handleSubmit, reset, watch, setValue, getValues } =
    useForm<ImportExcelDataInput>({
      defaultValues: {
        excelData: [],
        tableName: '',
        excelType: '',
        excelName: '',
        isOverwrite: '',
        decrypt: '',
        decryptPass: '',
        folderId: '',
        confirmPass: '',
      },
    });
  const { data } = useWidget<{ id: string }>('Data Import');
  console.log(data?.id);
  const onSubmitHandling = (data: any) => {
    console.log(data);
  };
  const { data: dictData } = useQuery(
    'dic type',
    async () => {
      const { data: dictResponse } = await client.queryForm.getTypeDic();
      return dictResponse;
    },
    {
      initialData: () => queryClient.getQueryData<GetTableData[]>('dic type'),
      onSuccess: (data) => {
        console.log(data);
        setTypeId(data[0].key);
      },
    }
  );
  const { data: columnData } = useQuery(
    ['ColumnDic', typeId],
    async () => {
      return (await client.recordManage.getTableColumn({ id: typeId })).data;
    },
    {
      enabled: !!typeId,
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );
  const fileExtension = useMemo(() => {
    console.log(watch('excelType'));
    switch (watch('excelType')) {
      case '1':
        return '.xls';
      case '2':
        return '.xlsx';
      case '3':
        return '.csv';
      default:
        return '';
        break;
    }
  }, [watch('excelType')]);
  console.log(fileExtension);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitHandling)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            margin: 2,
          }}
        >
          {watch('excelData').length > 0 && (
            <div
              style={{
                display: 'flex',
                width: '100%',
                margin: '10px 0',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiFileExcel2Fill
                  style={{
                    marginRight: '5px',
                  }}
                />
                <div>{getValues('excelName')}</div>
              </div>
              <RiCloseFill />
            </div>
          )}
          <Button {...btnStyle.primary} endIcon={<UploadIcon />}>
            Upload
            <input
              hidden
              accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv"
              type="file"
              onChange={(evt) => {
                if (evt.target.files) {
                  const file = evt.target.files[0];
                  console.log(file.type);
                  setValue('excelName', file.name);
                  setCurrentFile(file);
                  const fileReader = new FileReader();

                  fileReader.onload = (event) => {
                    let data = event.target?.result;
                    let workbook = XLSX.read(data, { type: 'binary' });
                    console.log(workbook.Sheets);
                    const excelData = XLSX.utils.sheet_to_json(
                      workbook.Sheets[workbook.SheetNames[0]]
                    ) as Array<any>;
                    console.log(excelData);

                    const previewData = XLSX.utils.sheet_to_json(
                      workbook.Sheets[workbook.SheetNames[0]],
                      { header: 1 }
                    ) as Array<any>;
                    if (excelData.length > 1000) {
                      excelData.slice(0, 1000);
                    }
                    console.log(previewData);
                    // console.log(columnData?.map((item) => item.misColumnName ?? ''));
                    setValue('excelData', excelData);
                    const col = previewData[0];
                    const row = previewData.slice(1).map((r) =>
                      r.reduce((acc: { [key: string]: any }, x: any, i: any) => {
                        acc[previewData[0][i]] = x;
                        return acc;
                      }, {})
                    );

                    const property = [
                      'id',
                      ...(columnData
                        ? columnData
                            ?.map((item) => item.columns)
                            .flat()
                            .map((item) => item.misColumnName)
                        : []),
                    ];

                    console.log(col, property);
                    console.log(difference(previewData[0], property));
                    console.log(
                      excelData.every(
                        (item: { [key: string]: any }) =>
                          item.hasOwnProperty('id') && typeof item['id'] === 'number'
                      )
                    );
                    setColumn(col.map((r: any) => ({ field: r, name: r, flex: 1 })));
                    setRow(row);
                  };
                  fileReader.readAsBinaryString(file);
                }
              }}
            />
          </Button>
          {watch('excelData').length > 0 && (
            <Button {...btnStyle.primary} onClick={() => setIsOpen(true)}>
              Preview
            </Button>
          )}
          {dictData && (
            <FormControl sx={{ marginBottom: 2, marginTop: 2 }}>
              <InputLabel id="demo-simple-select-label">Table</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                variant="outlined"
                value={typeId}
                displayEmpty
                renderValue={(value) => {
                  console.log(value);
                  return (dictData && dictData.find((item) => item.key === value)?.value) ?? '';
                }}
                onChange={(evt) => {
                  setTypeId(evt.target.value);
                  // updateWidget('Data Export', { id: evt.target.value });
                }}
              >
                {Array.isArray(dictData) &&
                  dictData.map((item) => (
                    <MenuItem key={item.key} value={item.key}>
                      {item.value}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          <Controller
            control={control}
            name="excelType"
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <FormControl sx={{ marginBottom: 2 }} variant="standard">
                <InputLabel>Spreadsheet Type</InputLabel>
                <Select
                  value={value}
                  label="spreadsheet type"
                  onChange={onChange}
                  displayEmpty
                  variant="outlined"
                  autoWidth
                >
                  <MenuItem value={'1'}>Excel 2003 or Before (.xls)</MenuItem>
                  <MenuItem value={'2'}>Excel 2007 or Later (.xlsx)</MenuItem>
                  <MenuItem value={'3'}>CSV (.csv)</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="excelName"
            render={({ field: { onChange, value } }) => (
              <TextField
                value={value}
                onChange={onChange}
                autoComplete="off"
                variant="outlined"
                sx={{ marginBottom: 2 }}
                label="File Name"
                InputProps={{
                  endAdornment: <InputAdornment position="end">{fileExtension}</InputAdornment>,
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="isOverwrite"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                sx={{ marginBottom: 1 }}
                control={
                  <Checkbox checked={!!value} onChange={() => onChange(!!value ? '' : '1')} />
                }
                label="Overwrite Existing Data"
              />
            )}
          />

          <Controller
            control={control}
            name="decrypt"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                sx={{ marginBottom: 3 }}
                control={
                  <Checkbox checked={!!value} onChange={() => onChange(!!value ? '' : '1')} />
                }
                label="Decrypt"
              />
            )}
          />
          {watch('decrypt') && (
            <>
              <Controller
                control={control}
                name="decryptPass"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value}
                    variant="standard"
                    onChange={onChange}
                    label="Decrypt Password"
                    autoComplete="new-password"
                    type="password"
                    sx={{ marginBottom: 3 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"></InputAdornment>,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="confirmPass"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value}
                    onChange={onChange}
                    variant="standard"
                    type="password"
                    autoComplete="new-password"
                    label="Confirm Password"
                    sx={{ marginBottom: 3 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"></InputAdornment>,
                    }}
                  />
                )}
              />
            </>
          )}
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <Button {...btnStyle.primary} type="submit">
              Submit
            </Button>
            <Button {...btnStyle} onClick={() => reset()}>
              Reset
            </Button>
          </Box>
        </Box>
      </form>
      <Dialog open={isOpen} fullWidth onClose={() => setIsOpen(false)}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>Data Preview</div>
          <RiCloseFill onClick={() => setIsOpen(false)} size={24} />
        </DialogTitle>
        <DialogContent>
          <DataGrid autoHeight rows={row} columns={column} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataImport;
