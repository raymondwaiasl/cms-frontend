import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';

const columns: GridColDef[] = [
  {
    field: 'misSubscriptionMsgId',
    headerName: 'S/N',
    minWidth: 200,
  },
  {
    field: 'misFolderName',
    headerName: 'Name',
    minWidth: 200,
  },
  {
    field: 'misSubscriptionType',
    headerName: 'Type',
    minWidth: 200,
  },
  {
    field: 'misSubEventMsg',
    headerName: 'Message',
    minWidth: 200,
  },
  {
    field: 'misSubscriptionMsgDate',
    headerName: 'Date Time',
    minWidth: 200,
    // valueFormatter: (params) => moment(params.value).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    field: 'action',
    headerName: 'Action',
    type: 'actions',
    headerAlign: 'left',
    width: 200,
    // renderCell: (params) => {
    //   const onClick = (e) => {
    //     e.stopPropagation(); // don't select this row after clicking
    //     // warnDelete(params.row.misSubscriptionMsgId);
    //   };

    //   return (
    //     // <Button onClick={onClick} color="secondary">
    //     //   Delete
    //     // </Button>
    //   );
    // },
  },
];

const mySubscription = () => {
  const [delId, setDelId] = useState('');

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

  const [pageData, setPageData] = useState({
    data: [],
    total: 0,
  });

  const [loading, setLoading] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);

    const sort = sortModel.field !== '' && sortModel.sort !== '' ? sortModel : {};
    const options = { pageState, sort };

    // subscriptionApi.getSubscriptionMsg(options).then((res) => {
    //   setLoading(false);
    //   setPageData({ data: res.data, total: res.total });
    // });
  };

  useEffect(() => {
    fetchData();
  }, [pageState.page, pageState.pageSize, sortModel.field, sortModel.sort]);

  const warnDelete = (params: any) => {
    setDelId(params);
    // if (cRef.current) {
    //   cRef.current.handleOpen();
    // }
  };

  const handleDel = (msgId: string) => {
    // subscriptionApi.delSubscriptionMsg({ msgId }).then((res) => {
    //   if (res) {
    //     fetchData();
    //   }
    // });
  };

  // once row click, set msg status => has read
  const handleRowClick = (params: any) => {
    if (params.row.misSubscriptionMsgHasRead !== 'Y') {
      const msgId = params.row.misSubscriptionMsgId;
      //   subscriptionApi.updateSubscriptionMsgRead({ msgId }).then((res) => {
      //     if (res) {
      //       fetchData();
      //     }
      //   });
    }
  };

  <DataGrid
    autoHeight
    rows={pageData.data}
    rowCount={pageData.total}
    loading={loading}
    rowsPerPageOptions={[10, 30, 50, 70, 100]}
    pagination
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
    getRowId={(row) => row.misSubscriptionMsgId}
    onRowClick={handleRowClick}
    // localeText={localizedTextsMap}

    // set row has read style
    getRowClassName={(params) => {
      if (params.row.misSubscriptionMsgHasRead === 'Y') {
        return 'hasRead';
      }
      return '';
    }}
  />;
};

export default mySubscription;
