import {
  ApproveTaskInput,
  DelegateTaskInput,
  RejectTaskInput,
  TerminateWorkflowInput,
} from '../../../api/myInboxList';
import DataNotFoundOverlay from '../../../components/DataNotFoundOverlay';
import { useApi, useWidget } from '../../../hooks';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { AiFillFolderOpen } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .noRead': {
    fontWeight: 'bold',
  },
}));

const RecordComparison = () => {
  const queryClient = useQueryClient();
  const client = useApi();
  const { data, updateWidgets } = useWidget<{
    typeId: string;
    id1: string;
    id2: string;
  }>('Record Comparison');

  const { data: tableColumn, isLoading } = useQuery(
    ['Record Comparison', data?.typeId, data?.id1, data?.id2],
    async () => {
      const { data: tableResponse } = await client.recordService.getRecordComparisonByRecId({
        typeId: data?.typeId as string,
        id1: data?.id1 as string,
        id2: data?.id2 as string,
      });
      console.log('tableResponse========', tableResponse);
      return tableResponse;
    },
    {
      enabled: !!data?.typeId,
    }
  );

  const DataNotFound = () => (
    <DataNotFoundOverlay icon={<AiFillFolderOpen size={40} />}>
      {rows.length === 0 && 'No Record'}
    </DataNotFoundOverlay>
  );
  const columns: GridColDef[] = useMemo(
    () =>
      tableColumn?.columnList.map(
        (item) =>
          item && {
            field: item?.misColumnName,
            headerName: item?.misColumnLabel,
            minWidth: 150,
            valueFormatter: ({ value }) =>
              item.misColumnType === '4'
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd')
                : value,
          }
      ) ?? [],
    [tableColumn?.columnList]
  );
  const rows = useMemo(
    () =>
      tableColumn?.recordList.map((item) =>
        item.reduce((prev, nex, index, arr) => ({ ...prev, [columns[index].field]: nex }), {
          id: item[0],
        })
      ) ?? [],
    [columns, tableColumn?.recordList]
  );

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    uid: false,
  });

  return (
    <>
      {data?.typeId != '' ? (
        <Paper
          sx={{
            height: '100%',
            backgroundColor: 'white',
            padding: '10px',
            overflowY: 'auto',
            borderRadius: '12px',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5"></Typography>
          </Stack>

          <DataGrid
            components={{
              NoRowsOverlay: DataNotFound,
            }}
            autoHeight
            disableColumnMenu
            loading={isLoading}
            columns={columns}
            rows={rows}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            checkboxSelection
            onSelectionModelChange={(item) => {
              console.log('item===', item.length);
              console.log('item===', item[0]);
            }}
            onRowClick={(param) => {}}
          />
        </Paper>
      ) : (
        <Paper
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Box sx={{ mt: 1 }}>Please Select a Record</Box>
        </Paper>
      )}
    </>
  );
};

export default RecordComparison;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
