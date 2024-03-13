import { useApi, useDialog, useWidget } from '../../../hooks';
import btnStyle from '../../../style/btnStyle';
import { Box, Button, Paper, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { useCallback, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

const Report = () => {
  const { data, updateWidget } = useWidget<{ id: string }>('Report');

  const client = useApi();
  const [templateId, setTemplateId] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortingOptions, setSortingOptions] = useState<{ field: string; sort: string }>({
    field: '',
    sort: '',
  });
  const { openDialog } = useDialog();
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

  const { data: templateList } = useQuery(['Template'], async () => {
    const { data: templateData } = await client.report.getTemplate();
    return templateData;
  });

  const { data: reportData } = useQuery(
    ['ReportList', { sortingOptions, page, pageSize }],
    async () => {
      const { data: reportData } = await client.report.getReports({
        pageState: { page: page + 1, pageSize },
        sortModel: sortingOptions,
      });
      return reportData;
    }
  );

  const exportInventory = useMutation(client.report.exportInventoryReport, {
    onSuccess: () => {},
  });

  const exportStatistic = useMutation(client.report.exportStatisticsReport, {
    onSuccess: () => {},
  });

  const downloadReport = useMutation(client.report.downloadReport, {});

  const columns: GridColDef[] = [
    {
      field: 'misReportId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'misReportName',
      headerName: 'Report Name',
      minWidth: 300,
      renderCell: (params: any) => {
        const onClick = (e: any) => {
          downloadReport.mutate(
            { misReportId: params.row.misReportId },
            {
              onSuccess: (file) => {
                const a = document.createElement('a');
                a.download = params.row.misReportPath;
                a.href = URL.createObjectURL(file);
                a.addEventListener('click', (e) => {
                  setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
                });
                a.click();
              },
            }
          );
        };
        return (
          <a href="javascript:;" onClick={onClick}>
            {params.row.misReportName}
          </a>
        );
      },
    },
    {
      field: 'misReportDate',
      headerName: 'Generation Date',
      minWidth: 300,
      type: 'date',
      valueFormatter: (params: any) =>
        DateTime.fromMillis(params.value).toFormat('dd/MM/yyyy HH:mm:ss'),
    },
    {
      field: 'misReportUserId',
      headerName: 'Generate by User',
      type: 'actions',
      headerAlign: 'left',
      minWidth: 300,
    },
  ];

  const exportReport = async (data: any) => {
    //console.log(data);
    const isStatistics = data.indexOf('Statistics') > -1;
    openDialog('reportDialog', {
      isStatistics,
      onConfirmAction: (newData: any) => {
        console.log(newData);
      },
    });
  };

  const generateReport = async (data: any) => {
    if (data.templateId == '0056000000000001') {
      exportStatistic.mutate(data);
    }

    if (data.templateId == '0056000000000002') {
      exportInventory.mutate(data);
    }
    //generateReport.mutate({ templateId: data.templateId });
  };

  return (
    <Paper
      sx={{
        minHeight: '100%',
        padding: 2,
        marginTop: 2,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <Button
          {...btnStyle.primary}
          style={{ textTransform: 'none' }}
          onClick={() => {
            const isStatistics = false;
            openDialog('reportDialog', {
              isStatistics,
              onConfirmAction: (newData: any) => {
                generateReport(newData);
              },
            });
          }}
        >
          Generate
        </Button>
      </Box>

      <DataGrid
        autoHeight
        sx={{
          backgroundColor: 'white',
          border: 'none',
          ['.MuiDataGrid-columnHeaders']: {
            backgroundColor: '#e2e9e4',
          },
          ['.MuiButtonBase-root.Mui-checked']: {
            color: '#577267',
          },
          ['.MuiDataGrid-cell']: {
            border: 'none',
          },
          ['.MuiDataGrid-row.Mui-selected']: {
            backgroundColor: 'rgba(226, 233, 228,0.4)',
            [':hover']: {
              backgroundColor: 'rgba(226, 233, 228,0.5)',
            },
          },
        }}
        rows={reportData?.data ?? []}
        rowCount={reportData?.total ?? 0}
        disableColumnMenu
        pagination
        paginationMode="server"
        sortingMode="server"
        onSortModelChange={handleSortModelChange}
        getRowId={(row) => row.misReportId}
        columns={columns}
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      />
    </Paper>
  );
};

export default Report;
