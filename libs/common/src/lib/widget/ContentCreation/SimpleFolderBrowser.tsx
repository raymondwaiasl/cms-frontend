import { FolderTree, GetTableColumnData } from '../../api';
import { useApi } from '../../hooks';
import { useDialog, useWidget } from '../../hooks';
import styles from './Dropzone.module.scss';
import FolderItem from './SimpleFolderItem';
import { TabContext, TabList, TreeView, TabPanel } from '@mui/lab';
import {
  Grid,
  Paper,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  RadioGroup,
  TextField,
  Radio,
  Button,
  Checkbox,
  FormHelperText,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ChangeEvent, useEffect, useMemo, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import 'react-dropzone/examples/theme.css';
import { Controller, useForm } from 'react-hook-form';
import { BsChevronRight, BsChevronDown, BsHddRack } from 'react-icons/bs';
import { CgCloseR } from 'react-icons/cg';
import { MdAdd } from 'react-icons/md';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import SparkMD5 from 'spark-md5';

declare global {
  interface File {
    path: string;
    Prototype: File;
  }
}

const SimpleFolderBrowser = () => {
  const queryClient = useQueryClient();
  const { openDialog } = useDialog();
  const { data } = useWidget<{ id: string }>('Content Creation');

  const [nodeList, setNodeList] = useState<string[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);
  const [tableList, setTableList] = useState<any[]>([]);
  const [tableListTemp, setTableListTemp] = useState<any[]>([]);
  const [tableListRender, setTableListRender] = useState<any[]>([]);
  // const [tableName, setTableName] = useState('');
  const [newfolderTree, setNewfolderTree] = useState<any[]>([]);

  const [propIdx, setPropIdx] = useState('');
  const [tabValue, setTabValue] = useState('');
  const [tableColumnDic, setTableColumnDic] = useState<any[]>([]);
  const [tableId, setTableId] = useState('');
  const [folderId, setFolderId] = useState<string>('');

  const [tableDic, setTableDic] = useState<any[]>([]);
  const [tagList, setTagList] = useState<any[]>([]);

  const [isDraggable, setIsDraggable] = useState(false);

  const [isAutoLink, setIsAutoLink] = useState(false);

  const [refresh, setRefresh] = useState(0);

  const chunkSize: any = 5 * 1024 * 1024; //以5MB为一个分片
  let succeed: any = 0;
  let currentIndex: any = 0;
  let shardCount: any = 0;
  let size: any = 0;
  let treeDataCu: any = useRef();
  let tableListCu: any = useRef();
  let folderIdCu: any = useRef();
  let isAllCu: any = useRef();
  let isAutoLinkCu: any = useRef();
  let fileSizeCu: any = useRef();
  const {
    register,
    unregister,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm({
    mode: 'onSubmit',
  });

  // const { fields, append } = useFieldArray({
  //   name: 'tables',
  //   control,
  // });

  // misQfName: yup.string().required('This Field is required'),
  // misQfTableId: yup.string().required('This Field is required'),
  // qfConditions: yup
  //   .array()
  //   .of(
  //     yup.object().shape({
  //       misQfc2ColumnId: yup.string().required('This Field is required'),
  //       misQfc2Condition: yup.string().required('This Field is required'),
  //       misQfc2Value: yup.string().required('This Field is required'),
  //     })
  //   )
  //   .test('test-0', 'test-msg', (valueArr: any, context: any) => {
  //     const errors = [];
  //     for (let i = 0; i < valueArr?.length; i++) {
  //       if (i > 0 && valueArr[i].misRelation === '') {
  //         errors.push(
  //           new ValidationError(
  //             'This Field is required',
  //             valueArr[i],
  //             `qfConditions.${i}.misRelation`
  //           )
  //         );
  //       }
  //     }
  //     if (errors.length === 0) {
  //       return true;
  //     }
  //     return new ValidationError(errors);
  //   }),
  // qfColumns: yup.array().min(1, 'Please select at least one').required('Required'),
  // });

  // react hook form
  // const {
  //   unregister,
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { errors, isValid },
  // } = useForm({
  //   mode: 'onSubmit',
  //   shouldUnregister: true,
  //   resolver: yupResolver(schema),
  //   // defaultValues: {
  //   // misQfName: queryFormDetail?.misQfName,
  //   // misQfTableId: queryFormDetail?.misQfTableId,
  //   // qfConditions: queryFormDetail?.qfConditions,
  //   // qfColumns: queryFormDetail?.qfColumns ?? [],
  //   // },
  // });

  let treeDTO: any[] = [];
  let expendedList: any[] = [];
  // let folderIdSeq: number = 0;
  const [folderIdSeq, setFolderIdSeq] = useState<number>(0);
  const client = useApi();

  // const { updateFolder, deleteFolder, saveFolder, getFolderList } = useApi();
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      addFolderList(acceptedFiles);
      acceptedFiles.map((file) => fileList.push(file));
      setFileList([...fileList]);
    },
  });

  console.log('folderIdSeq~~~~~~~~~~~~~~~~~~~~~~~~~', folderIdSeq);
  console.log('expendedList~~~~~~~~~~~~~~~~~~~~~~~~~', expendedList);

  useEffect(() => {
    console.log('useEffect================================');
    getTableDicOnPage();
    if (data?.id) {
      setFolderId(data.id);
    }
  }, [data?.id, fileList]);

  useEffect(() => {
    resetFields();
    for (let i = 0; i < tableListRender.length; i++) {
      console.log('register--------------', i);
      console.log('fields render-------------', fields);
      if (fields.indexOf('tableId~' + i) === -1) {
        fields.push('tableId~' + i);
      }
      register('tableId~' + i);
    }
    setFields([...fields]);
  }, [tableListRender]);

  const resetFields = () => {
    for (let i = 0; i < tableList.length; i++) {
      let temp = 'tableId~' + i;
      fields.splice(fields.indexOf(temp), 1);
    }
    setFields([...fields]);
  };

  const getTableDicOnPage = async () => {
    const { data: response } = await client.recordManage.getTableName();
    console.log('getTableName    data=======', response);
    setTableDic(response);
  };

  const handleIsDraggable = () => {
    clearErrors();
    setIsDraggable(!isDraggable);
    if (!isDraggable) {
      setTableListRender([tableList[0]]);
      if (tableList[0] != undefined) {
        setTabValue(tableList[0].fileId);
      }
    } else {
      setTableListRender([...tableList]);
      if (tableList[0] != undefined) {
        setTabValue(tableList[0].fileId);
      }
    }
  };
  const handleAutoLink = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoLink(event.target.checked);
    console.log('isAutoLink=====', isAutoLink);
  };

  const renderTree = (items: folderLists[], level: number) => {
    console.log(items);
    return items.map((item) => (
      <FolderItem
        key={item.misFolderId as string}
        nodeId={item.misFolderId as string}
        label={item.misFolderName as string}
        hasChildren={item.children && item.children.length > 0}
        isFileIcon={!(item.children && item.children.length > 0)}
        isReadOnly={true}
        onHandleFolderClick={() => {
          console.log('onHandleFolderClick done tableList', tableList);
          console.log('onHandleFolderClick done fileList', fileList);

          if (isDraggable) {
            if (tableList[0] != undefined) {
              setTableListRender([tableList[0]]);
              setTabValue(tableList[0].fileId);
            }
          } else {
            console.log('tableListTemp =========================', tableListTemp);
            setTableListRender([...tableList]);
            setTabValue(item.misFolderId);
          }
        }}
        onAddFolderClick={() => {
          openDialog('inputDialog', {
            title: `Name your Folder`,
            inputProps: { placeholder: 'New Folder Name' },
            confirmAction: (name: string) => {
              console.log(name);
              setNodeList((curr) => [...curr, item.misFolderId]);
            },
          });
        }}
        onDeleteClick={() =>
          openDialog('deleteDialog', {
            title: `Delete folder`,
            message: `Are you sure to delete ${item.misFolderName}`,
            confirmAction: () => {},
          })
        }
        onRenameClick={(name) => {}}
      >
        {Array.isArray(item.children) && renderTree(item.children, level + 1)}
      </FolderItem>
    ));
  };

  // const [newfolderTree: any[] = [];

  const folderTree = useMemo(() => (newfolderTree ? newfolderTree : []), [newfolderTree]);

  console.log('folderTree===========================', folderIdSeq, folderTree);

  const addFolderList = (acceptedFiles: File[]) => {
    console.log('test===', acceptedFiles[0]);
    let pathList: any[] = [];
    acceptedFiles.forEach((item) => {
      let temp = item.path;
      if (item.path.substring(0, 1) == '/') {
        temp = item.path.substr(1);
      }
      pathList.push(temp);
    });
    pathList.forEach((item) => {
      const nodeArray = item.split('/');
      let children = treeDTO;
      // 循环构建子节点
      for (const i of nodeArray) {
        const node = {
          misFolderName: i,
        };
        if (children.length === 0) {
          children.push(node);
        }
        let isExist = false;
        for (const j in children) {
          if (children[j].misFolderName === node.misFolderName) {
            if (!children[j].children) {
              children[j].children = [];
            }
            children = children[j].children;
            isExist = true;
            break;
          }
        }
        if (!isExist) {
          children.push(node);
          if (!children[children.length - 1].children) {
            children[children.length - 1].children = [];
          }
          children = children[children.length - 1].children;
        }
      }
    });
    console.log('treeDto==========', treeDTO);
    let newTree = [...newfolderTree];

    addFolderPath(treeDTO, '');
    addFolderId(treeDTO, folderIdSeq, nodeList);
    for (let t of treeDTO) {
      newTree.push(t);
    }
    setNewfolderTree([...newTree]);
    console.log('newfolderTree==========', newfolderTree);
    treeDTO = [];

    // const uploads = fileList;
    // return uploads.map((file, index) => (
    //   <li key={file.name}>
    //     <MenuItem onClick={() => handleClick(file.path, index)}>
    //       {file.path}
    //     </MenuItem>
    //   </li>
    // ));
  };

  const addFolderId = (items: any[], number: number, list: any[]) => {
    for (let i of items) {
      // folderIdSeq = folderIdSeq + 1;
      number = number + 1;
      console.log('folderIdSeq: ' + number);
      i['misFolderId'] = number + '';
      console.log('----------', number, i, items);
      list.push(number + '');
      if (i.children?.length > 0) {
        addFolderId(i.children, number, list);
      } else {
        tableList.push({
          fileId: i.misFolderId,
          tableId: '',
          folder_id: data?.id ?? '',
          path: i.path.substring(0, 1) == '/' ? i.path.substr(1) : i.path,
          tableColumns: [],
          tags: [],
        });
        tableListTemp.push({
          fileId: i.misFolderId,
          tableId: '',
          folder_id: data?.id ?? '',
          path: i.path.substring(0, 1) == '/' ? i.path.substr(1) : i.path,
          tableColumns: [],
          tags: [],
        });

        if (tableList.length === 1) {
          console.log('setTabValue -----------------------------');
          setTabValue(i.misFolderId);
        }

        setFolderIdSeq(number);
        setNodeList([...list]);
        setTableList([...tableList]);
        setTableListTemp([...tableListTemp]);
        if (isDraggable) {
          setTableListRender([tableList[0]]);
        } else {
          setTableListRender([...tableList]);
        }
      }
    }
  };

  const addFolderPath = (items: any, name: string) => {
    for (let i of items) {
      i['path'] = name + '/' + i.misFolderName;
      if (i.children?.length > 0) {
        addFolderPath(i.children, i.path);
      }
    }
  };

  const [fields, setFields] = useState<string[]>([]);
  const handleChange = (event: SelectChangeEvent, temp: any, idx: any) => {
    // setTableId(event.target.value);
    // let temp = tableList.filter((i) => i.fileId === propIdx)[0];
    // if (temp != undefined) {
    //   temp['tableId'] = event.target.value;
    //   console.log('tableList========', tableList);
    //   fetchColData(temp);
    // }
    temp['tableId'] = event.target.value;

    console.log('requtData data=======', temp);
    console.log('fields handleChange=======', fields);

    fetchColData(temp, idx);
  };

  const getTableColumns = async (value: string) => {
    const { data: response } = await client.recordManage.getTableColumn({ id: value });
    return response;
  };

  const toPropertyPage = async (propData: any) => {
    if (propData['tableId'] != null) {
      // setTableName(propData['tableId']);
      // fetchColData(propData);
    } else {
    }
  };
  const clearLastInputContent = (tableItem: any) => {
    console.log('clearLastInputContent===============================');
  };
  //保存表单数据
  const handleTextValue = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    tableItem: any
  ) => {
    // let temp = tableList.filter((i) => i.fileId === propIdx)[0];
    if (tableItem != undefined) {
      tableItem[key] = e.target.value;
      console.log('tableList========', tableList);
      setTableList([...tableList]);
    }
  };
  //ChangeEvent<HTMLInputElement>
  const handleRadioValue = (e: string, key: string, tableItem: any) => {
    // let temp = tableList.filter((i) => i.fileId === propIdx)[0];
    if (tableItem != undefined) {
      tableItem[key] = e;
      console.log('tableList========', tableList);
      setTableList([...tableList]);
    }
  };
  //SelectChangeEvent
  const handleSelectValue = (e: SelectChangeEvent, key: string, tableItem: any) => {
    // let temp = tableList.filter((i) => i.fileId === propIdx)[0];
    if (tableItem != undefined) {
      tableItem[key] = e.target.value;
      console.log('tableList========', tableList);
      setTableList([...tableList]);
    }
  };

  const handleComBoxValue = (e: string, key: string, tableItem: any) => {
    // let temp = tableList.filter((i) => i.fileId === propIdx)[0];
    if (tableItem != undefined) {
      tableItem[key] = e;
      console.log('tableList========', tableList);
      setTableList([...tableList]);
    }
  };

  const inputHandling = (
    value: any,
    onChange: (evt: any) => void,
    error: any,
    { misColumnInputType, misColumnName, misColumnLabel, columnLs }: GetTableColumnData,
    tableItem: any
  ) => {
    console.log(misColumnInputType);
    console.log('inputHandling value================== ', value);
    if (misColumnInputType === '1') {
      return (
        <TextField
          variant="standard"
          error={!!errors[misColumnName + '~' + value]}
          helperText={!!errors[misColumnName + '~' + value] ? error?.message ?? '' : ''}
          value={tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : ''}
          // value={value}
          label={misColumnLabel}
          id={'id-' + misColumnLabel}
          onChange={(evt) => {
            console.log('errors[misColumnName]===========', errors[misColumnName]);
            console.log('errors===========', errors);
            onChange(evt);
            handleTextValue(evt, misColumnName, tableItem);
          }}
        />
      );
    }
    if (misColumnInputType === '2' && columnLs.length > 0) {
      return (
        <FormControl error={!!error?.message} variant="standard">
          <InputLabel id="demo-simple-select-label">{misColumnLabel}</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id={'id-' + misColumnLabel}
            value={tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : ''}
            displayEmpty
            label="Age"
            onChange={(evt) => {
              onChange(evt);
              handleSelectValue(evt, misColumnName, tableItem);
            }}
          >
            {columnLs.map((item) => (
              <MenuItem key={item.key} value={`${item.key}=${item.value}`}>
                {item.value}
              </MenuItem>
            ))}
          </Select>
          {!!errors[misColumnName + '~' + value]?.message && (
            <FormHelperText>{error.message}</FormHelperText>
          )}
        </FormControl>
      );
    }
    if (misColumnInputType === '3') {
      return (
        <FormControl error={!!error?.message} variant="standard">
          <FormLabel>{misColumnLabel}</FormLabel>
          <FormGroup>
            {columnLs.map((item) => (
              <FormControlLabel
                control={
                  <Checkbox
                    id={'id-' + misColumnLabel}
                    value={tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : ''}
                    checked={
                      `${item.key}=${item.value}` ===
                      (tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : '')
                    }
                    onChange={() => {
                      onChange(`${item.key}=${item.value}`);
                      handleComBoxValue(`${item.key}=${item.value}`, misColumnName, tableItem);
                    }}
                  />
                }
                label={item.value}
              />
            ))}
          </FormGroup>
          {!!errors[misColumnName + '~' + value]?.message && (
            <FormHelperText>{error.message}</FormHelperText>
          )}
        </FormControl>
      );
    }
    if (misColumnInputType === '4') {
      return (
        <FormControl error={!!error?.message} variant="standard">
          <FormLabel>{misColumnLabel}</FormLabel>

          {columnLs.map((item) => (
            <FormControlLabel
              control={
                <Radio
                  id={'id-' + misColumnLabel}
                  checked={
                    `${item.key}=${item.value}` ===
                    (tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : '')
                  }
                  onChange={() => {
                    onChange(`${item.key}=${item.value}`);
                    handleRadioValue(`${item.key}=${item.value}`, misColumnName, tableItem);
                  }}
                />
              }
              label={item.value}
            />
          ))}
          {!!errors[misColumnName + '~' + value]?.message && (
            <FormHelperText>{error.message}</FormHelperText>
          )}
        </FormControl>
      );
    }
    return (
      <TextField
        variant="standard"
        error={!!errors[misColumnName + '~' + value]}
        helperText={error?.message ?? ''}
        value={tableItem[misColumnName] !== undefined ? tableItem[misColumnName] : ''}
        label={misColumnLabel}
        id={'id-' + misColumnLabel}
        onChange={(evt) => {
          onChange(evt);
          handleTextValue(evt, misColumnName, tableItem);
        }}
      />
    );
  };

  const fetchColData = async (requtData: any, idx: any) => {
    console.log('fields fetchColData=======', fields);
    console.log('fetchColData 123', requtData.tableId);
    console.log(
      'fetchColData  requtData.tableColumns========================',
      requtData.tableColumns
    );

    // for (let c of requtData.tableColumns) {
    //   let t = c.misColumnName + '~' + idx;
    //   // fields = fields.filter(item => item != t);

    // }
    if (requtData.tableColumns.length > 0) {
      for (let c of requtData.tableColumns) {
        let temp = c.misColumnName + '~' + idx;
        fields.splice(fields.indexOf(temp), 1);
        // fields = fields.filter(item => item != temp);
        Reflect.deleteProperty(requtData, c.misColumnName);
        // requtData[c.misColumnName] = undefined;
        // unregister(temp);
      }
    }

    const { data: response } = await client.recordManage.getTableColumn({ id: requtData.tableId });
    console.log('data=======', response);

    if (response.length > 0) {
      for (let { columns } of response) {
        for (let r of columns) {
          let temp = r.misColumnName + '~' + idx;
          if (fields.indexOf(temp) === -1) {
            fields.push(temp);
          }
        }
      }
    }
    console.log('data fields=======', fields);
    setFields([...fields]);
    requtData.tableColumns = response;
    setTableList([...tableList]);
    if (isDraggable) {
      setTableListRender([tableList[0]]);
    } else {
      setTableListRender([...tableList]);
    }
  };

  const toTagPage = (propData: any) => {
    if (propData['tags'] != undefined) {
      setTagList([...propData['tags']]);
    } else {
      propData['tags'] = [];
      setTagList([]);
    }
  };

  const addTag = (tags: any) => {
    tags.push({
      cmsTag: '',
    });
    setTableListRender([...tableListRender]);
    // let temp = tableList.filter((i) => i.fileId === tableId)[0];
    // if (temp != undefined) {
    //   if (temp['tags'] != undefined) {
    //     temp['tags'].push({
    //       cmsTag: '',
    //     });
    //   } else {
    //     temp['tags'] = [
    //       {
    //         cmsTag: '',
    //       },
    //     ];
    //   }
    //   setTagList([...temp['tags']]);
    // }
  };

  const onChangeTag = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tag: any) => {
    tag.cmsTag = e.target.value;
    // let temp = tableList.filter((i) => i.fileId === tableId)[0];
    // if (temp != undefined) {
    //   if (temp['tags'] != undefined) {
    //     temp['tags'][idx].cmsTag = e.target.value;
    //     console.log('tableList========', tableList);
    //     setTagList([...temp['tags']]);
    //     setTableList([...tableList]);
    //   }
    // }
  };

  const closeTag = (tags: any, i: number) => {
    tags.splice(i, 1);
    setTableListRender([...tableListRender]);
    // let temp = tableList.filter((i) => i.fileId === tableId)[0];
    // if (temp != undefined) {
    //   if (temp['tags'] != undefined) {
    //     temp['tags'].splice(idx, 1);
    //     setTagList([...temp['tags']]);
    //   }
    // }
  };

  // const packageHtml = (typeId: string, labelName: string, columnName: string, columnLs: any[]) => {
  //   if (tableList.length === 0) {
  //     return <></>;
  //   } else {
  //     if (typeId == '1') {
  //       // console.log('tableList[' + i + ']======', tableList[i]);
  //       return (
  //         <TextField
  //           id={columnName}
  //           label={labelName}
  //           onChange={(e) => saveFormData(e, columnName)}
  //           value={
  //             Object.keys(tableList.filter((i) => i.fileId === propId)[0]).indexOf(columnName) > -1
  //               ? tableList.filter((i) => i.fileId === propId)[0][columnName]
  //               : ''
  //           }
  //         />
  //       );
  //     } else if (typeId == '2') {
  //       // labelList['comColumnName'] = columnName;
  //       const contextData = (
  //         <FormControl className={styles['formControl']}>
  //           <InputLabel id="demo-simple-select-helper-label">{labelName}</InputLabel>
  //           <Select
  //             labelId="demo-simple-select-helper-label"
  //             id="demo-simple-select-helper"
  //             value={
  //               Object.keys(tableList.filter((i) => i.fileId === propId)[0]).indexOf(columnName) >
  //               -1
  //                 ? tableList.filter((i) => i.fileId === propId)[0][columnName]
  //                 : ''
  //             }
  //             onChange={(e) => handleComBox(e, columnName)}
  //           >
  //             {columnLs.map((table) => (
  //               <MenuItem value={table.key + '=' + table.value}>{table.value}</MenuItem>
  //             ))}
  //           </Select>
  //         </FormControl>
  //       );
  //       return contextData;
  //     } else if (typeId == '4') {
  //       // labelList['radioColumnName'] = columnName;
  //       const radioData = (
  //         <FormControl component="fieldset">
  //           <FormLabel component="legend">{labelName}</FormLabel>
  //           <RadioGroup
  //             row
  //             aria-label="gender"
  //             name="gender1"
  //             value={
  //               Object.keys(tableList.filter((i) => i.fileId === tableId)[0]).indexOf(columnName) >
  //               -1
  //                 ? tableList.filter((i) => i.fileId === propId)[0][columnName]
  //                 : ''
  //             }
  //             onChange={(e) => handleRadioValue(e, columnName)}
  //           >
  //             {columnLs.map((table) => (
  //               <FormControlLabel
  //                 value={table.key + '=' + table.value}
  //                 control={<Radio />}
  //                 label={table.value}
  //               />
  //             ))}
  //           </RadioGroup>
  //         </FormControl>
  //       );
  //       return radioData;
  //     } else {
  //       return <></>;
  //     }
  //   }
  // };

  // const { getTableName, getTableColumn, upLoadFiles } = useApi();
  useQuery('Content Creation', () => {
    console.log('test useQuery');
    reset();
    treeDTO = [];
    expendedList = [];
    // setTableName('');
    setFields([]);
    setTableColumnDic([]);
    setTableList([]);
    setTableListRender([]);
    setFolderIdSeq(0);
    setTableId('');
    setNodeList([]);
    setFileList([]);
    setIsDraggable(false);
    setIsAutoLink(false);
    setNewfolderTree([]);
    setTableDic([]);
    setTagList([]);
  });
  const UploadFiles = useMutation(client.contentService.uploadFiles, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Browser');
      queryClient.invalidateQueries('Record table');
      queryClient.invalidateQueries('Content Creation');
    },
  });

  const handleUpload = async () => {
    console.log('erorrs============================', errors);
    console.log('fields handleUpload============================', fields);
    if (!folderId) {
      return;
    }

    const watchFields = watch(fields);

    for (let i = 0; i < fields.length; i++) {
      console.log('key', fields[i]);
      console.log('watchFields key', watchFields[i]);
      if (watchFields[i] === undefined) {
        console.log('key index==============', fields[i].substring(fields[i].indexOf('~') + 1));
        let idx = Number(fields[i].substring(fields[i].indexOf('~') + 1));
        if (isDraggable) {
          if (idx === 0) {
            setTabValue(tableList[idx].fileId);
            return;
          }
        } else {
          setTabValue(tableList[idx].fileId);
          return;
        }
      }
    }
    console.log('success============================');
    const formData = new FormData();
    //fileList.map((item) => formData.append('files', item));
    //formData.append('treeData', JSON.stringify(folderTree));
    //formData.append('tableList', JSON.stringify(tableList));
    //formData.append('folderId', data?.id ?? '');
    //formData.append('isAll', isDraggable ? 'true' : 'false');
    //formData.append('isAutoLink', isAutoLink ? 'true' : 'false');
    treeDataCu.current = JSON.stringify(folderTree);
    tableListCu.current = JSON.stringify(tableList);
    folderIdCu.current = data?.id ?? '';
    isAllCu.current = isDraggable ? 'true' : 'false';
    isAutoLinkCu.current = isAutoLink ? 'true' : 'false';
    console.log(tableList[0].tableId + '====' + tableList[0].recordId);
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].size / 1024 / 1024 <= 500) {
        formData.append('files', fileList[i]);
        formData.append('treeData', JSON.stringify(folderTree));
        formData.append('tableList', JSON.stringify(tableList));
        formData.append('folderId', data?.id ?? '');
        formData.append('isAll', isDraggable ? 'true' : 'false');
        formData.append('isAutoLink', isAutoLink ? 'true' : 'false');
        UploadFiles.mutate(formData);
      } else {
        fileSizeCu.current = fileList[i].size.toString();
        let fileReader = new FileReader();
        let time = new Date().getTime();
        let blobSlice = File.prototype.slice;
        let currentChunk = 0;
        let chunks = Math.ceil(fileList[i].size / chunkSize);
        let spark = new SparkMD5.ArrayBuffer();
        let start = currentChunk * chunkSize;
        let end = start + chunkSize >= fileList[i].size ? fileList[i].size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(fileList[i], start, end));
        fileReader.onload = (e) => {
          if (currentChunk < chunks) {
            currentChunk++;
            let start = currentChunk * chunkSize;
            let end = start + chunkSize >= fileList[i].size ? fileList[i].size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(fileList[i], start, end));
          } else {
            let md5 = spark.end();
            isUploadFun(fileList[i], md5);
          }
        };
      }
    }
    //UploadFiles.mutate(formData);

    // console.log('upLoadFiles response======', response);

    // setNodeList([]);
    // setFileList([]);
    // setIsDraggable(false);
    // setIsAutoLink(false);
    // setNewfolderTree([]);
    // setDic([]);
    // setTableName('');
    // setColData([]);
    // setTagList([]);
  };

  const handleTabsChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
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
      if (uploadedChunks != null && uploadedChunks.indexOf(chunkNumber) >= 0) {
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
  };

  const mergeFile = async (filename: any, identifier: any, totalSize: any) => {
    mergeBigChumksFile.mutate({
      filename: filename,
      identifier: identifier,
      totalSize: totalSize,
      treeData: treeDataCu.current ?? '',
      tableList: tableListCu.current ?? '',
      folderId: folderIdCu.current ?? '',
      isAll: isAllCu.current ?? '',
      isAutoLink: isAutoLinkCu.current ?? '',
      fileSize: fileSizeCu.current ?? '',
    });
  };
  const mergeBigChumksFile = useMutation(client.contentService.mergeContentChumksFile, {
    onSuccess: () => {
      queryClient.invalidateQueries('Folder Browser');
      queryClient.invalidateQueries('Record table');
      queryClient.invalidateQueries('Content Creation');
    },
  });

  return (
    <Paper
      sx={{
        height: '100%',
        backgroundColor: 'white',
        padding: '10px',
        overflowY: 'auto',
        borderRadius: '12px',
      }}
      component={'form'}
      onSubmit={handleSubmit(handleUpload)}
    >
      <section className={styles['container']}>
        <div className={styles['dropzone']} {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
        <aside>
          <h4>
            ---------------------------------------------------------------------------------------
          </h4>
        </aside>
        <Grid container className={styles['root']} spacing={2}>
          <Grid item xs={12}>
            <Grid container justifyContent="left" spacing={12}>
              <Grid key={0} item>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>
                <TreeView
                  defaultExpandIcon={<BsChevronRight />}
                  defaultCollapseIcon={<BsChevronDown />}
                  expanded={nodeList}
                  onNodeToggle={(evt, ids) => setNodeList(ids)}
                  sx={{
                    height: '100%',
                    flexGrow: 1,
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '12px',
                  }}
                >
                  {renderTree(folderTree, 0)}
                </TreeView>
                {/* <FormControl error={!!errors.tables}>
                  <div>
                    {fields?.map((option: any,index) => {
                      return (
                        <Controller
                          name={`tables.${index}.tableId`}
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              //focused={!!paramId}
                              id="standard-basic"
                              variant="standard"
                              error={!!errors.tables?.[index]?.tableId}
                              onChange={onChange}
                              defaultValue={option.tableId}
                              value={value}
                              label="Value"
                              helperText={errors?.tables?.[index]?.tableId?.message as string}
                            />
                          )}
                        />
                      );
                    })}
                  </div>
                  <FormHelperText>{errors?.tables?.message as string}</FormHelperText>
                </FormControl> */}
                {/* {fields.map((field, index) => {
                  return (
                    <Stack direction="row" spacing={2} mb={3} key={field.id}>
                      <Controller
                        name={`tables.${index}.tableId`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            //focused={!!paramId}
                            id="standard-basic"
                            variant="standard"
                            error={!!errors.tables?.[index]?.tableId}
                            onChange={onChange}
                            defaultValue={field.tableId}
                            value={value}
                            label="Value"
                            helperText={errors?.tables?.[index]?.tableId?.message as string}
                          />
                        )}
                      />
                    </Stack>
                  )
                })} */}
              </Grid>
              <Grid key={1} item>
                <Typography variant="h6" gutterBottom>
                  Properties
                </Typography>
                <Box sx={{ width: '100%', minWidth: 220 }}>
                  <FormGroup sx={{ alignItems: 'flex-end' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={() => handleIsDraggable()}
                          checked={isDraggable}
                          size="small"
                        />
                      }
                      label={'All'}
                    />
                  </FormGroup>
                  <TabContext value={tabValue}>
                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList onChange={handleTabsChange} aria-label="lab API tabs example">
                        {tableList.map((item) => (
                          <Tab label={item.path} value={item.fileId} />
                        ))}
                      </TabList>
                    </Box> */}
                    {tableListRender.map((item, index) => (
                      <TabPanel value={item.fileId}>
                        {tableDic && (
                          // <FormControl variant="standard" sx={{ marginBottom: 3 }}>
                          //   <InputLabel id="demo-simple-select-label">Table</InputLabel>
                          //   <Select
                          //     labelId="demo-simple-select-label"
                          //     id="demo-simple-select"
                          //     value={tableId}
                          //     // defaultValue={''}
                          //     // displayEmpty
                          //     onChange={(evt) => {
                          //       unregister(tableColumnDic?.map((item) => item.misColumnName));
                          //       handleChange(evt);
                          //     }}
                          //   >
                          //     <MenuItem key={'none'} value=''>
                          //       None
                          //     </MenuItem>
                          //     {Array.isArray(tableDic) &&
                          //       tableDic.map((item) => (
                          //         <MenuItem key={item.key} value={item.key}>
                          //           {item.value}
                          //         </MenuItem>
                          //       ))}
                          //   </Select>
                          // </FormControl>
                          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            {/* <InputLabel id="demo-simple-select-standard-label">Table</InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={item.tableId}
                              onChange={(evt) => {
                                // unregister(tableColumnDic?.map((item) => item.misColumnName));
                                handleChange(evt, item);
                              }}
                              label="Table"
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {tableDic.map((table) => (
                                <MenuItem value={table.key}>{table.value}</MenuItem>
                              ))}
                            </Select> */}
                            <Controller
                              name={'tableId~' + index}
                              rules={{ required: 'This field is required' }}
                              control={control}
                              render={({ field: { onChange }, fieldState: { error } }) => {
                                console.log('register-------------', index);
                                console.log('render errors-------------', errors);
                                let keys: string[] = Object.keys(errors);
                                if (keys.length > 0) {
                                  console.log('render errors keys-------------', keys);
                                  //
                                  let idx = Number(keys[0].substring(keys[0].indexOf('~') + 1));
                                  setTabValue(tableList[idx].fileId);
                                  // clearErrors();
                                }
                                return (
                                  <FormControl error={!!error?.message} variant="standard">
                                    <InputLabel id="demo-simple-select-label">Table</InputLabel>
                                    <Select
                                      labelId="demo-simple-select-label"
                                      id={'id-tableId~' + index}
                                      value={item.tableId !== undefined ? item.tableId : ''}
                                      displayEmpty
                                      label="Age"
                                      onChange={(evt) => {
                                        onChange(evt);
                                        handleChange(evt, item, index);
                                      }}
                                    >
                                      {/* <MenuItem value="">
                                        <em>None</em>
                                      </MenuItem> */}
                                      {tableDic.map((table) => (
                                        <MenuItem value={table.key}>{table.value}</MenuItem>
                                      ))}
                                    </Select>
                                    {!!errors['tableId~' + index]?.message && (
                                      <FormHelperText>{error?.message}</FormHelperText>
                                    )}
                                  </FormControl>
                                );
                              }}
                            />
                          </FormControl>
                        )}
                        {folderId && (
                          <Paper
                            // component={'form'}
                            sx={{ display: 'flex', flexDirection: 'column', padding: 3 }}
                            // onSubmit={handleSubmit(handleUpload)}
                          >
                            {item.tableColumns?.map((column: GetTableColumnData) => (
                              <Controller
                                key={column.misColumnId}
                                name={column.misColumnName + '~' + index}
                                rules={{ required: 'This field is required' }}
                                control={control}
                                render={({ field: { value, onChange }, fieldState: { error } }) => {
                                  return inputHandling(index, onChange, error, column, item);
                                }}
                              />
                            ))}
                          </Paper>
                        )}
                        <div></div>
                        <FormGroup row>
                          <Typography variant="h6" gutterBottom>
                            Tag
                          </Typography>
                        </FormGroup>
                        <FormGroup row>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MdAdd />}
                            onClick={() => addTag(item.tags)}
                          >
                            Add Tag
                          </Button>
                        </FormGroup>
                        {item.tags?.map((tag: any, idx: number) => (
                          <FormGroup row>
                            <TextField
                              label=""
                              variant="outlined"
                              defaultValue={tag.cmsTag}
                              onChange={(e) => onChangeTag(e, tag)}
                            />
                            <CgCloseR onClick={() => closeTag(item.tags, idx)} />
                          </FormGroup>
                        ))}
                      </TabPanel>
                    ))}
                    {/* <TabPanel value="1">Item One</TabPanel>
                    <TabPanel value="2">Item Two</TabPanel>
                    <TabPanel value="3">Item Three</TabPanel> */}
                  </TabContext>
                  {/*
                  <FormGroup>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                      <InputLabel id="demo-simple-select-standard-label">Table</InputLabel>
                      <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={tableName}
                        onChange={handleChange}
                        label="Table"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {dic.map((table) => (
                          <MenuItem value={table.key}>{table.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FormGroup>
                  <FormGroup row>
                    {tableName === '' ? (
                      <></>
                    ) : colData.length === 0 ? (
                      <></>
                    ) : (
                      colData.map((table) =>
                        packageHtml(
                          table.misColumnInputType,
                          table.misColumnLabel,
                          table.misColumnName,
                          table.columnLs
                        )
                      )
                    )}
                  </FormGroup> */}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </section>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={isAutoLink} onChange={(e) => handleAutoLink(e)} />}
          label="Auto Link"
        />
      </FormGroup>
      {/* <Button variant="contained" sx={{ float: 'right' }} onClick={() => handleUpload()}>
        Save
      </Button> */}
      <Button variant="contained" type="submit" sx={{ marginY: 2, width: '100px', float: 'right' }}>
        Submit
      </Button>
    </Paper>
  );
};

export default SimpleFolderBrowser;

interface folderLists extends FolderTree {
  children?: FolderTree[];
}
