import { Paper, Stack, TextField, Typography, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { useApi } from 'libs/common/src/lib/hooks';
import { DateTime } from 'luxon';
import { useCallback, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';

const columns: GridColDef[] = [
  {
    field: 'misAuditOperation',
    headerName: 'Audit Operation',
    minWidth: 170,
  },
  {
    field: 'misAuditTime',
    headerName: 'Audit Time',
    minWidth: 170,
    align: 'right',
  },
  {
    field: 'misAuditMethod',
    headerName: 'Audit Method',
    minWidth: 300,
    align: 'right',
  },
  {
    field: 'misAuditParams',
    headerName: 'Audit Params',
    minWidth: 300,
    align: 'right',
  },
  {
    field: 'misAuditIp',
    headerName: 'Audit IP',
    minWidth: 170,
    align: 'right',
  },
  {
    field: 'createTime',
    headerName: 'Create Time',
    minWidth: 170,
    align: 'right',
  },
];

const AuditLog = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });
  const auditUser = useRef('');
  const auditOperation = useRef('');
  //const auditCreateTime= useRef('');
  const [auditCreateTime, setAuditCreateTime] = useState<string>('');
  const client = useApi();
  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {},
  });

  const handleSortModelChange = useCallback((sortModel: any) => {
    // Here you save the data you need from the st model
    const [options] = sortModel;
    setSortingOptions(
      options ?? {
        field: '',
        sort: '',
      }
    );
  }, []);

  const {
    data: auditLogData,
    isLoading,
    refetch,
  } = useQuery(
    ['All audit', page, pageSize, sortingOptions],
    async () => {
      const { data: auditLogData } = await client.auditManage.getAllAudit({
        auditCreateTime: auditCreateTime,
        auditOperation: auditOperation.current,
        auditUser: auditUser.current,
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return auditLogData;
    },
    {
      keepPreviousData: true,
    }
  );

  const submitHandling = (data: any) => {
    refetch();
  };

  return (
    <div>
      <Typography variant="h5">Audit Page</Typography>
      <form onSubmit={handleSubmit(submitHandling)}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            id="standard-basic"
            variant="standard"
            onChange={(e: any) => {
              auditUser.current = e.target.value;
            }}
            label="Audit User"
          />

          <TextField
            id="standard-basic"
            variant="standard"
            onChange={(e: any) => {
              auditOperation.current = e.target.value;
            }}
            label="Audit Operation"
          />

          <DatePicker
            label="Create Date"
            inputFormat="yyyy-MM-dd"
            value={auditCreateTime ? auditCreateTime : DateTime.now().toFormat('yyyy-MM-dd')}
            onChange={(newValue: DateTime | null | undefined) => {
              if (newValue) {
                newValue.toFormat('yyyy-MM-dd');
                setAuditCreateTime(newValue.toFormat('yyyy-MM-dd'));
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  variant="standard"
                  {...params}
                  sx={{ marginBottom: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              );
            }}
          />
          <Button
            style={{ marginLeft: '60px' }}
            disableElevation
            variant="contained"
            type="submit"
            //   onClick={() => {
            //     refetch();
            //   }}
          >
            Search
          </Button>
        </Stack>
      </form>

      <Paper
        sx={{
          height: '1000px',
          '& .MuiDataGrid-cell--editing': {
            bgcolor: 'rgb(255,215,115, 0.19)',
            color: '#1a3e72',
            '& .MuiInputBase-root': {
              height: '100%',
            },
          },
          '& .Mui-error': {
            bgcolor: (theme) => `rgb(126,10,15, ${theme.palette.mode === 'dark' ? 0 : 0.1})`,
            color: (theme) => (theme.palette.mode === 'dark' ? '#ff4343' : '#750f0f'),
          },
        }}
      >
        <DataGrid
          getRowHeight={() => 'auto'}
          rows={auditLogData?.data ?? []}
          rowCount={auditLogData?.total ?? 0}
          disableColumnMenu
          pagination
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          getRowId={(row) => row.misAuditId}
          columns={columns}
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          sx={{
            [`&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell`]: {
              px: '0',
              wordBreak: 'break-word',
              whiteSpace: 'normal !important',
            },
            [`&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell`]: {
              py: 2,
              wordBreak: 'break-word',
              whiteSpace: 'normal !important',
            },
            '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
              px: '0',
              whiteSpace: 'normal',
            },
          }}
        />
      </Paper>
    </div>
  );
};

export default AuditLog;
