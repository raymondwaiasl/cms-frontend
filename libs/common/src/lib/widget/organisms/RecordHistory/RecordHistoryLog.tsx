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
import { toast } from 'react-toastify';

const RecordHistoryLog = () => {
  const client = useApi();
  const { data, updateWidgets } = useWidget<{
    typeId: string;
    recordId: string;
  }>('Record History Log');

  const { data: tableColumn, isLoading } = useQuery(
    ['Record History Log', data?.recordId],
    async () => {
      const { data: tableResponse } = await client.recordService.getRecordHistoryLogByRecId({
        typeId: data?.typeId as string,
        recordId: data?.recordId as string,
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
                ? DateTime.fromMillis(value).toFormat('yyyy-MM-dd HH:mm:ss')
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

  const [id1, setId1] = useState<string>();
  const [id2, setId2] = useState<string>();
  const [len, setLen] = useState<number>(0);

  const handleComparison = () => {
    if (len === 2) {
      updateWidgets({
        'Record Comparison': {
          typeId: data?.typeId,
          id1: id1,
          id2: id2,
        },
      });
    } else {
      toast.info('Please select two records');
    }
  };

  return (
    <>
      <DataGrid
        components={{
          NoRowsOverlay: DataNotFound,
        }}
        autoHeight
        loading={isLoading}
        columns={columns}
        rows={rows}
        onSelectionModelChange={(item) => {
          console.log('item===', item.length);
          console.log('item===', item[0]);
          setLen(item.length);
          setId1(item[0] as string);
          setId2(item[1] as string);
        }}
        onRowClick={(param) => {}}
      />
    </>
  );
};

export default RecordHistoryLog;

export interface User {
  id: string;
  name: string;
  checked?: boolean;
}
