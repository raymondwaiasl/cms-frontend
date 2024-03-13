import { useApi, useWidget } from '../../../hooks';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useQuery } from 'react-query';

const MySearch = () => {
  const client = useApi();
  const { updateWidget } = useWidget();
  const [sortModel, setSortModel] = useState({ field: '', sort: '' });

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
  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });
  const { data: pageData, isLoading } = useQuery(['My Search', pageState, sortModel], async () => {
    const { data: response } = await client.queryForm.getQueryFormPageable({
      pageState,
      sortModel,
    });
    return response;
  });
  const columns = [
    {
      field: 'misQfId',
      headerName: 'S/N',
      minWidth: 200,
    },
    {
      field: 'misQfName',
      headerName: 'Search Form',
      minWidth: 300,
    },
    {
      field: 'tableLabel',
      headerName: 'Query on Table',
      minWidth: 300,
    },
  ];
  return (
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
      rows={pageData?.data ?? []}
      rowCount={pageData?.total ?? 0}
      loading={isLoading}
      onRowClick={(param: any) => updateWidget('Search Form', { id: param.id })}
      rowsPerPageOptions={[10, 30, 50, 70, 100]}
      pagination={true}
      page={pageState.page - 1}
      pageSize={pageState.pageSize}
      paginationMode="server"
      onPageChange={(newPage) => {
        setPageState((old) => ({ ...old, page: newPage + 1 }));
      }}
      onPageSizeChange={(newPageSize) => setPageState((old) => ({ ...old, pageSize: newPageSize }))}
      columns={columns}
      disableColumnMenu
      sortingMode="server"
      onSortModelChange={handleSortChange}
      getRowId={(row) => row.misQfId}
    />
  );
};

export default MySearch;
