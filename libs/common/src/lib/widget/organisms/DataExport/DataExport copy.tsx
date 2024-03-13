import { ImportExcelDataInput, SaveSearchFormInput } from '../../../api';
import { PageState, SortModel } from '../../../api/common';
import { useApi, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useQuery } from 'react-query';
import { Id, toast } from 'react-toastify';
import Xlsx from 'xlsx';

const DataExport = () => {
  const currentToast = useRef<Id>();
  const client = useApi();
  const ExportXls = useMutation(client.exportService.ExportXls, {
    onMutate: () => {
      currentToast.current = toast.loading('Exporting file');
    },
  });
  const ExportXlsx = useMutation(client.exportService.ExportXlsx);
  const ExportCsv = useMutation(client.exportService.ExportCsv, {
    onMutate: () => {
      currentToast.current = toast.loading('Exporting file');
    },
  });

  const SimpleSearchExport = useMutation(client.exportService.SimpleSearchExport, {
    onMutate: () => {
      currentToast.current = toast.loading('Exporting file');
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ImportExcelDataInput>();
  const { data } = useWidget<{
    folderId: string;
    id: string;
    misQfTableId: string;
    simpleSearchId: string;
    searchConditons: string;
    sortModel: SortModel[];
    pageState: PageState;
  }>('Data Export');
  const { data: searchFormData } = useWidget<{ getFormValues: Function }>('Search Form');
  const { data: recordListData } = useWidget<{ tab: number }>('Record List');
  // const downloadHandling = (name: string, type: string, data: Blob) => {
  //   let dlink = document.createElement('a');
  //   dlink.download = name ? `${name}.${type}` : `untitled.${type}`;
  //   dlink.href = window.URL.createObjectURL(data);
  //   console.log(dlink);
  //   dlink.onclick = function (e) {
  //     setTimeout(function () {
  //       URL.revokeObjectURL(dlink?.href);
  //     }, 1500);
  //   };

  //   dlink.click();
  //   dlink.remove();
  // };

  const { data: defaultFolderId } = useQuery('defaultFolderId', async () => {
    return (await client.folderService.getDefaultFolder()).data.misFolderId;
  });

  const onSubmitHandling = (inputData: ImportExcelDataInput) => {
    debugger;
    const searchFormValues = searchFormData?.getFormValues ? searchFormData?.getFormValues() : {};
    const folderId = data?.folderId || defaultFolderId;

    console.log('data.simpleSearchId', data.simpleSearchId);
    console.log('data.searchConditons', data.searchConditons);
    console.log('data.tab', recordListData?.tab);

    if (data.simpleSearchId && recordListData?.tab == 2) {
      return SimpleSearchExport.mutate(
        {
          simpleSearchId: data?.simpleSearchId ?? '',
          data: data?.searchConditons ?? '',
          sortModel: data?.sortModel,
          pageState: data?.pageState,
        },
        {
          onSuccess: async (data) => {
            const convertedData = await data.arrayBuffer();
            console.log(convertedData);
            const workbook = Xlsx.read(convertedData);
            Xlsx.writeFile(workbook, `${inputData.excelName ?? 'untitled'}.${inputData.excelType}`);
            toast.update(currentToast?.current as Id, {
              type: toast.TYPE.SUCCESS,
              render: 'File ready',
              isLoading: false,
              closeButton: true,
              autoClose: 2000,
            });
          },
        }
      );
    }
    if (folderId && (recordListData?.tab == 0 ? data?.id : data?.misQfTableId)) {
      return ExportCsv.mutate(
        {
          ...searchFormValues,
          typeId: recordListData?.tab == 0 ? data?.id : searchFormValues?.misQfTableId,
          folderId: folderId,
          exportType: recordListData?.tab,
        },
        {
          onSuccess: async (data) => {
            const convertedData = await data.arrayBuffer();
            console.log(convertedData);
            const workbook = Xlsx.read(convertedData);
            Xlsx.writeFile(workbook, `${inputData.excelName ?? 'untitled'}.${inputData.excelType}`);
            toast.update(currentToast?.current as Id, {
              type: toast.TYPE.SUCCESS,
              render: 'File ready',
              isLoading: false,
              closeButton: true,
              autoClose: 2000,
            });
          },
        }
      );
    }
    toast.error('Missing folder id or');
  };
  const fileExtension = useMemo(() => {
    console.log(watch('excelType'));
    switch (watch('excelType')) {
      case 'xls':
        return '.xls';
      case 'xlsx':
        return '.xlsx';
      case 'csv':
        return '.csv';
      default:
        return '';
        break;
    }
  }, [watch('excelType')]);

  return (
    <form onSubmit={handleSubmit(onSubmitHandling)}>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Controller
          control={control}
          name="excelType"
          defaultValue=""
          rules={{
            required: 'This field is required',
          }}
          render={({ field: { onChange, value } }) => (
            <FormControl sx={{ marginBottom: 3 }} error={!!errors?.excelType}>
              <InputLabel>Spreadsheet Type</InputLabel>
              <Select
                value={value}
                label="spreadsheet type"
                onChange={onChange}
                displayEmpty
                fullWidth
              >
                <MenuItem value={'xls'}>Excel 2003 or Before (.xls)</MenuItem>
                <MenuItem value={'xlsx'}>Excel 2007 or Later (.xlsx)</MenuItem>
                <MenuItem value={'csv'}>CSV (.csv)</MenuItem>
              </Select>
              {!!errors?.excelType && <FormHelperText>{errors.excelType.message}</FormHelperText>}
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
              variant="outlined"
              autoComplete="off"
              fullWidth
              label="File Name"
              sx={{ marginBottom: '40px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ width: '35px' }}>
                    {fileExtension}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Button
            {...btnStyle['primary']}
            type="submit"
            
          >
            Save
          </Button>
          <Button {...btnStyle['secondary']} style={{ marginLeft: '20px' }} onClick={() => reset()}>
            Reset
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default DataExport;
