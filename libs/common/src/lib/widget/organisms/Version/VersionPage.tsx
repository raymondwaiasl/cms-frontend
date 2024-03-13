import { downloadInput } from '../../../api';
import { Button, TextField } from '@mui/material';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
// import { message } from 'antd';
import FileSaver from 'file-saver';
import { AutoLinkInfo } from 'libs/common/src/lib/api/contentService';
import { useDialog, useApi, useWidget } from 'libs/common/src/lib/hooks';
// import { useSnackbar } from 'notistack';
import { useState, useRef } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast, Id } from 'react-toastify';
import SparkMD5 from 'spark-md5';

let contentList: Array<Blob> = []; //文件流数组
let filesTotalSize = 0; //文件总大小
let filesPages = 1; //分几片下载
let filesCurrentPage = 0; //第几片
let chunkDownSize: number = 1024 * 1024 * 50; // 单个分段大小
let downloadStatus: number = 0; //0 未启动，1 正在下载 2 暂停
//分片上传参数
const chunkSize: any = 5 * 1024 * 1024; //以5MB为一个分片
let succeed: any = 0;
let currentIndex: any = 0;
let shardCount: any = 0;
let size: any = 0;
const VersionPage = () => {
  const [folderName, setFolderName] = useState<string>('');
  const toastId = useRef<Id | null>(null);
  const queryClient = useQueryClient();
  const client = useApi();
  const { openDialog } = useDialog();
  const [rowCount, setRowCount] = useState<number>();
  const [versionPageData, setVersionPageData] = useState<AutoLinkInfo[]>([]);
  const [delId, setDelId] = useState('');
  //分片上传参数
  const { data } = useWidget<{ recordId: string }>('Version');
  let typeIdUp: any = useRef();
  let recordIdUp: any = useRef();
  let versionNoUp: any = useRef();
  let fileLocationUp: any = useRef();
  let fileSizeUp: any = useRef();
  //分片下载参数
  const [percent, setPercent] = useState<number | undefined>(0); //进度条
  let typeId: any = useRef();
  let recordId: any = useRef();
  let versionCurrentId: any = useRef();
  let downFile: any = useRef();
  let fileSizeCurrent: any = useRef();

  const downBigFile = async (
    isDisabled: any,
    misTypeId: any,
    misRecordId: any,
    versionId: any,
    cmsFileLocation: any,
    fileSize: any
  ) => {
    typeId.current = misTypeId;
    recordId.current = misRecordId;
    versionCurrentId.current = versionId;
    downFile.current = cmsFileLocation;
    if (parseInt(fileSize) / 1024 / 1024 <= 40) {
      downloadFileFunction.mutate(
        {
          isDisabled: true,
          misTypeId: misTypeId,
          misRecordId: misRecordId,
          versionId: versionId,
          downFile: cmsFileLocation,
        },
        {
          onSuccess: (file: any) => {
            //let cmsFileLocation = cmsFileLocation;
            let index = cmsFileLocation.indexOf('/');
            //根据第一个点的位置 获得第二个点的位置
            index = cmsFileLocation.indexOf('/', index + 1);
            let fileName = cmsFileLocation.substring(index + 1);
            const a = document.createElement('a');
            a.download = fileName;
            a.href = URL.createObjectURL(file);
            a.addEventListener('click', (e) => {
              setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
            });
            a.click();
          },
        }
      );
    } else {
      fileSizeCurrent.current = fileSize;
      downloadChunkFile(filesCurrentPage);
    }
  };

  const downloadChunkFile = async (num: any, currSize = 0) => {
    downloadStatus = 1;
    //let { chunkSize} =chunkDownSize,
    let range;
    if (num) {
      //构建分片下载字节范围
      let end = Math.min(num * chunkDownSize + 1, filesTotalSize - 1);
      range = `bytes=${(num - 1) * chunkDownSize + 2}-${end}`;
      // }
    } else {
      // 第一次0-1方便获取总数，计算下载进度，每段下载字节范围区间
      range = 'bytes=0-1';
    }
    console.log('range===' + range);
    const { data: response, ...props } = await client.versionManage.downloadChunkFile(
      {
        range,
        isDisabled: true,
        misTypeId: typeId.current ?? '',
        misRecordId: recordId.current ?? '',
        versionId: versionCurrentId.current ?? '',
        downFile: downFile.current ?? '',
        fileSize: fileSizeCurrent.current ?? '',
      },
      (evt) => {
        //console.log(evt)
        console.log(chunkSize, filesTotalSize);
        // 0.1,
        //let propress = evt?.progress*100.toFixed(2);
        const percent = Math.floor(((evt.loaded + currSize) / filesTotalSize) * 100);
        console.log(percent);
        if (toastId.current === null) {
          toastId.current = toast('Download in Progress', {
            progress: percent / 100,
            autoClose: false,
            hideProgressBar: false,
            theme: 'light',
          });
        } else {
          toast.update(toastId.current, {
            render: `Download in Progress ${Math.round(percent)}%`,
            type: 'default',
            progress: percent / 100,
            hideProgressBar: false,
            theme: 'light',
          });
        }
        //setPercent(Math.round(evt.progress?evt.progress*100:0))
        //console.log(percent)
      }
    );

    if (props.status === 200 || props.status === 206) {
      console.log(filesTotalSize);
      if (filesTotalSize === 0) {
        // 获取文件总大小，方便计算下载百分比
        //filesTotalSize = props.headers['content-range'].split('/')[1];
        filesTotalSize = parseInt(fileSizeCurrent.current ?? '0');
        // 计算总共页数，向上取整
        filesPages = Math.ceil(filesTotalSize / chunkDownSize);
        console.log('filesPages====' + filesPages);
      }

      contentList.push(response); // 文件流数组
      console.log('contentList====' + contentList + '==response===' + response);
      // 递归获取文件数据
      if (downloadStatus === 1 && filesCurrentPage < filesPages) {
        downloadChunkFile(++filesCurrentPage, response.size + currSize);
        return;
      }
      console.log('filesCurrentPage====' + filesCurrentPage);
      if (downloadStatus === 2) {
        //暂停
        return;
      }
      //设置下载完成
      downloadStatus: 0;
      //构造一个blob对象来处理数据
      const blob = new Blob(contentList, { type: props.headers['content-type'] });
      // 文件名称
      let disposition = decodeURI(props.headers['content-disposition']);
      // 从响应头中获取文件名称
      let fileName = decodeURIComponent(
        disposition.substring(disposition.indexOf('filename=') + 9, disposition.length)
      );
      //保存文件
      FileSaver.saveAs(blob, fileName);
      toastId.current && toast.done(toastId.current);
      // message.success('下载完成！');
    } else {
      // message.error('下载失败！');
    }
  };

  const downloadFileFunction = useMutation({
    mutationFn: (data: downloadInput) =>
      client.versionManage.downloadFileFunction(data, (evt) => {
        console.log(evt);
        setPercent(evt.progress);
        console.log(percent);
      }),
  });

  const versionColumns: GridColDef[] = [
    {
      field: 'cmsVersionNo',
      headerName: 'Version',
      minWidth: 270,
    },
    {
      field: 'cmsCreationDate',
      headerName: 'Create Date',
      minWidth: 230,
    },
    {
      field: 'cmsUserName',
      headerName: 'Create By',
      minWidth: 150,
    },
    {
      field: 'versionStatus',
      headerName: 'status',
      minWidth: 150,
    },
    {
      field: 'action',
      headerName: 'Action',
      type: 'actions',
      headerAlign: 'left',
      width: 450,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.versionStatus == '已锁') {
          return <></>;
        } else {
          return (
            <>
              <TextField
                type="file"
                id="checkIn"
                onChange={(e) =>
                  handleUpLoad(
                    e,
                    params.row.misTypeId,
                    params.row.misRecordId,
                    params.row.cmsVersionNo,
                    params.row.cmsFileLocation
                  )
                }
              ></TextField>
              &nbsp;&nbsp;{' '}
              <Button
                onClick={(e: any) => {
                  downBigFile(
                    true,
                    params.row.misTypeId,
                    params.row.misRecordId,
                    params.row.cmsVersionId,
                    params.row.cmsFileLocation,
                    params.row.fileSize
                  );

                  toastId.current = toast.loading('Request Download');
                }}
                color="secondary"
              >
                Check out
              </Button>{' '}
              &nbsp;&nbsp;
              <Button
                startIcon={<AiOutlineDelete />}
                variant="outlined"
                size="small"
                color="error"
                sx={{ marginLeft: (theme) => theme.spacing(1) }}
                onClick={() => {
                  openDialog('deleteDialog', {
                    title: 'Delete Autolink',
                    message: `Are you sure to delete ${params.row.cmsUserName} ?`,
                    confirmAction: () =>
                      DeleteVersion.mutate({
                        cmsVersionId: params.row.cmsVersionId as string,
                        misTypeId: params.row.misTypeId as string,
                        misRecordId: params.row.misRecordId as string,
                      }),
                  });
                }}
              >
                DELETE
              </Button>
            </>
          );
        }
      },
    },
  ];

  const DeleteVersion = useMutation(client.versionManage.delVersion, {
    onSuccess: () => {
      queryClient.invalidateQueries(['versionDetail', pageState, sortModel]);
      toast('Delete successfully', {
        type: 'success',
      });
    },
  });

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

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

  const { data: userPageData, isLoading } = useQuery(
    ['versionDetail', pageState, sortModel, data?.recordId ?? ''],
    async () => {
      const { data: response } = await client.versionManage.getAllVersion({
        recordId: data?.recordId ?? '',
        pageState,
        sortModel,
      });
      return response;
    },
    {
      keepPreviousData: true,
    }
  );

  const handleUpLoad = async (
    event: any,
    misTypeId: any,
    misRecordId: any,
    cmsVersionNo: any,
    cmsFileLocation: any
  ) => {
    typeIdUp.current = misTypeId;
    recordIdUp.current = misRecordId;
    versionNoUp.current = cmsVersionNo;
    fileLocationUp.current = cmsFileLocation;

    let fileValue: any = event.target.files[0];
    //file如果大于500M切割分片上传，小于500M直接上传
    if (fileValue.size / 1024 / 1024 >= 500) {
      fileSizeUp.current = fileValue.size.toString();
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice = File.prototype.slice;
      let currentChunk = 0;
      let chunks = Math.ceil(fileValue.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();
      let start = currentChunk * chunkSize;
      let end = start + chunkSize >= fileValue.size ? fileValue.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(fileValue, start, end));
      fileReader.onload = (e) => {
        if (currentChunk < chunks) {
          currentChunk++;
          let start = currentChunk * chunkSize;
          let end = start + chunkSize >= fileValue.size ? fileValue.size : start + chunkSize;
          fileReader.readAsArrayBuffer(blobSlice.call(fileValue, start, end));
        } else {
          let md5 = spark.end();
          isUploadFun(fileValue, md5);
        }
      };
    } else {
      const { data: response } = await client.versionManage.UpLoadCheckFile({
        files: fileValue,
        misTypeId: misTypeId,
        misRecordId: misRecordId,
        cmsVersionNo: cmsVersionNo,
        cmsFileLocation: cmsFileLocation,
      });
      //}
      //updateWidget('Rendition',{ typeId: misTypeId, recordId: misRecordId });
      queryClient.invalidateQueries(['versionDetail', pageState, sortModel]);
      toast('uploadFile successfully', {
        type: 'success',
      });
    }
  };
  const isUploadFun = async (file: any, md5: any) => {
    const { data: response } = await client.versionManage.isUpload({
      identifiler: md5,
    });
    if (response == 'true') {
      console.log('文件上传已完成!');
    } else {
      repeatupload(file, md5, response);
    }
  };

  const repeatupload = async (file: any, filemd5: any, uploadedChunks: any) => {
    size = file.size; //总大小
    shardCount = Math.ceil(size / chunkSize); //总片数

    for (let i = 0; i < shardCount; i++) {
      let chunkNumber = i + 1;
      if (
        uploadedChunks != '' &&
        uploadedChunks != null &&
        uploadedChunks.indexOf(chunkNumber) >= 0
      ) {
        console.log(chunkNumber + '分片已存在');
        //如果分片存在就不用上传了
        //uploadChunks(file.name, filemd5, size);
        continue;
      }
      upload(file, filemd5, uploadedChunks, chunkNumber);
    }
  };

  const upload = async (file: any, filemd5: any, uploadedChunks: any, chunkNumber: any) => {
    //计算每一片的起始与结束位置
    let start = (chunkNumber - 1) * chunkSize,
      end = Math.min(size, start + chunkSize);
    //构造一个表单，FormData是HTML5新增的
    let form = new FormData();
    //按大小切割文件段
    let data = file.slice(start, end);
    form.append('chunkNumber', chunkNumber); //文件块编号，从1开始
    form.append('totalChunks', shardCount);
    form.append('identifier', filemd5);
    form.append('chunkSize', chunkSize);
    form.append('currentChunkSize', data.size);
    form.append('relativePath', file.name);
    form.append('filename', file.name);
    form.append('totalSize', size);
    form.append('total', shardCount); //总片数
    form.append('upfile', data);
    const { data: response } = await client.versionManage.uploadBigFile(form);
    if (response == 'true') {
      uploadChunks(file.name, filemd5, size);
    }
  };

  const uploadChunks = async (filename: any, identifier: any, totalSize: any) => {
    ++succeed; //改变界面
    if (succeed > shardCount) {
      succeed = shardCount;
    }
    if (succeed == shardCount) {
      mergeFile(filename, identifier, totalSize);
    }
    ++currentIndex;
    if (currentIndex > shardCount) {
      currentIndex = shardCount;
    }
  };

  const mergeFile = async (filename: any, identifier: any, totalSize: any) => {
    const { data: response } = await client.versionManage.mergeChumksFile({
      filename: filename,
      identifier: identifier,
      totalSize: totalSize,
      misTypeId: typeIdUp.current ?? '',
      misRecordId: recordIdUp.current ?? '',
      cmsVersionNo: versionNoUp.current ?? '',
      cmsFileLocation: fileLocationUp.current ?? '',
      fileSize: fileSizeUp.current ?? '',
    });
    queryClient.invalidateQueries(['versionDetail', pageState, sortModel]);
    toast.success('uploadFile successfully');
  };

  /*const downloadFileFun = async (
    isDisabled: boolean,
    misTypeId: any,
    misRecordId: any,
    versionId: any,
    cmsFileLocation: any
  ) => {
    let index = cmsFileLocation.indexOf('/');
    //根据第一个点的位置 获得第二个点的位置
    index = cmsFileLocation.indexOf('/', index + 1);
    let fileName = cmsFileLocation.substring(index + 1);
    const { data: response } = await downloadFile({
      isDisabled: true,
      misTypeId: misTypeId,
      misRecordId: misRecordId,
      versionId: versionId,
      downFile: cmsFileLocation,
    });
    //if(response.size>0){
    const blob = new Blob([response]);
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    a.click();
    //}
  };*/
  return (
    <div>
      <DataGrid
        autoHeight
        rows={userPageData?.data ?? []}
        loading={isLoading}
        rowsPerPageOptions={[10, 30, 50, 70, 100]}
        pagination={true}
        page={pageState.page - 1}
        pageSize={pageState?.pageSize ?? 0}
        paginationMode="server"
        columns={versionColumns}
        disableColumnMenu
        onPageChange={(newPage) => {
          setPageState((old) => ({ ...old, page: newPage + 1 }));
        }}
        onPageSizeChange={(newPageSize) =>
          setPageState((old) => ({ ...old, pageSize: newPageSize }))
        }
        sortingMode="server"
        onSortModelChange={handleSortChange}
        getRowId={(row) => row.cmsVersionId}
      />
    </div>
  );
};

export default VersionPage;
