import { DefaultFolderId } from '../../../constant';
import {
  Typography,
  Button,
  TextField,
  FormControl,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { typeItem } from 'libs/common/src/lib/api';
import { useApi, useWidget } from 'libs/common/src/lib/hooks';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

const AutoLinkPage = () => {
  const [checked, setChecked] = React.useState(true);
  const [levelData, setLevelData] = React.useState([]) as any[];
  const [levelOneData, setLevelOneData] = React.useState('');
  const [conditionData, setConditionData] = React.useState([]) as any[];
  //const [typeData, setTypeData] = React.useState<typeItem[]>([]);
  const [typeColumnData, setTypeColumnData] = React.useState([]);
  const [selectTable, setSelectTable] = React.useState('');
  const [selectColumn1, setSelectColumn1] = React.useState('');
  const [OneConditionName, setOneConditionName] = React.useState('');
  const [OneFilter, setOneFilter] = React.useState('');
  const [OneConditionValue, setOneConditionValue] = React.useState('');
  const queryClient = useQueryClient();
  const client = useApi();

  const { data, updateWidget, updateWidgets } = useWidget<{
    id: string;
  }>('autolinkpage');

  const folderId = useMemo(() => data?.id ?? DefaultFolderId, [data?.id, DefaultFolderId]);

  const { data: typeData, isLoading } = useQuery(
    'AutoLinkPage',
    async () => {
      const { data: response } = await client.autolinkManage.queryAllTypesNoWith();
      return response;
    },
    {
      placeholderData: [],
    }
  );

  const handleSelectColumn1 = (event: any) => {
    setSelectColumn1(event.target.value);
    setLevelOneData('1');
  };
  const handleSelectColumn = (event: any, index: any) => {
    levelData[index].columnId = event.target.value;
    levelData[index].level = index;
    setLevelData([...levelData]);
  };

  const handleDel = (e: any, item: any) => {
    levelData.splice(item, 1);
    setLevelData([...levelData]);
  };
  const handleAdd = (e: any) => {
    levelData.push({
      level: '',
      columnId: '',
    });
    setLevelData([...levelData]);
  };
  const handleDelCondition = (e: any, item: any) => {
    conditionData.splice(item, 1);
    setConditionData([...conditionData]);
  };
  const handleAddCondition = (e: any) => {
    conditionData.push({
      condRadio: '',
      condColumnId: '',
      condFilter: '',
      condValue: '',
    });
    setConditionData([...conditionData]);
  };
  const handleOneConditionName = (event: any) => {
    setOneConditionName(event.target.value);
  };
  const handleConditionName = (event: any, index: any) => {
    conditionData[index].condColumnId = event.target.value;
    setConditionData([...conditionData]);
  };
  const handleOneConditionValue = (event: any) => {
    setOneConditionValue(event.target.value);
  };
  const handleConditionValue = (event: any, index: any) => {
    conditionData[index].condValue = event.target.value;
    setConditionData([...conditionData]);
  };
  const handleRadio = (e: any, index: any) => {
    conditionData[index].condRadio = e.target.value;
    setConditionData([...conditionData]);
  };

  const saveAutoLinkFunction = async () => {
    //let ac=localStorage.getItem('folderId');

    //let abc={data?.id};
    //let requestData = { selectTable:selectTable,checked:checked,selectColumn1:selectColumn1,levelData:levelData,OneConditionName:OneConditionName,OneFilter:OneFilter,OneConditionValue:OneConditionValue,conditionData:conditionData};
    const { data: resData } = await client.autolinkManage.saveAutoLink({
      selectTable: selectTable,
      checked: checked,
      selectColumn1: selectColumn1,
      levelData: levelData,
      OneConditionName: OneConditionName,
      OneFilter: OneFilter,
      OneConditionValue: OneConditionValue,
      conditionData: conditionData,
      folderId: folderId ?? '',
    });
    if (resData.data == 'save success data') {
      queryClient.invalidateQueries('Folder Browser');
      queryClient.invalidateQueries('AutoLinkPage');
      queryClient.invalidateQueries('autolinkDetail');
    }
  };

  const cancelContext = () => {};
  const handleOneFilter = (event: any) => {
    setOneFilter(event.target.value);
  };
  const handleFilter = (event: any, index: any) => {
    conditionData[index].condFilter = event.target.value;
    setConditionData([...conditionData]);
  };
  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      misTypeId: '',
    },
  });

  const misTypeId =
    useWatch({
      control,
      name: 'misTypeId',
    }) ?? '';

  const queryTypeColumn = useCallback(async () => {
    console.log('misTypeId===', misTypeId);
    if (misTypeId) {
      setSelectTable(misTypeId);
      const { data: response } = await client.autolinkManage.queryColumnByTypeId({
        id: misTypeId,
      });
      setTypeColumnData(response);
    }
  }, [misTypeId]);

  useEffect(() => {
    queryTypeColumn();
  }, [queryTypeColumn]);

  return (
    <div>
      <FormControl>
        <tr>
          Table &nbsp;&nbsp;
          <Controller
            name="misTypeId"
            control={control}
            rules={{
              required: 'This Field is required',
            }}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={value}
                onChange={onChange}
              >
                {typeData?.map((column: any) => (
                  <MenuItem value={column.misTypeId + '-' + column.misTypeName}>
                    {column.misTypeLabel}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </tr>
        <tr>
          <Button variant="contained" color="primary" onClick={(e) => handleAdd(e)}>
            AddLevel
          </Button>
        </tr>
        <form noValidate autoComplete="off">
          <tr>
            level1 &nbsp;&nbsp;
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={selectColumn1}
              onChange={handleSelectColumn1}
            >
              {typeColumnData.map((column: any) => (
                <MenuItem value={column.misColumnId + '-' + column.misColumnName}>
                  {column.misColumnLabel}
                </MenuItem>
              ))}
            </Select>
          </tr>
        </form>
        {levelData.map((condition: any, index: any) => {
          return (
            <form noValidate autoComplete="off">
              <tr>
                level{index + 2} &nbsp;&nbsp;
                <Select
                  labelId="demo-simple-select-helper-label"
                  id={index + 'selectId'}
                  value={condition.columnId}
                  onChange={(e) => handleSelectColumn(e, index)}
                >
                  {typeColumnData.map((column: any) => (
                    <MenuItem value={column.misColumnId + '-' + column.misColumnName}>
                      {column.misColumnLabel}
                    </MenuItem>
                  ))}
                </Select>
                &nbsp;&nbsp;
                <Button variant="contained" color="primary" onClick={(e) => handleDel(e, index)}>
                  -
                </Button>
              </tr>
            </form>
          );
        })}
        <tr>
          <Button variant="contained" color="primary" onClick={(e) => handleAddCondition(e)}>
            AddCondition
          </Button>
        </tr>
        <form noValidate autoComplete="off">
          <tr>
            Conditions1
            <Select
              labelId="demo-simple-select-helper-label"
              id={'selectId'}
              value={OneConditionName}
              onChange={handleOneConditionName}
            >
              {typeColumnData.map((column: any) => (
                <MenuItem value={column.misColumnId}>{column.misColumnLabel}</MenuItem>
              ))}
            </Select>
            &nbsp;&nbsp;
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={OneFilter}
              onChange={handleOneFilter}
            >
              <MenuItem value={'0'}>is</MenuItem>
              <MenuItem value={'1'}>is not</MenuItem>
              <MenuItem value={'2'}>contains</MenuItem>
              <MenuItem value={'3'}>greater</MenuItem>
              <MenuItem value={'4'}>less</MenuItem>
            </Select>
            &nbsp;&nbsp;
            <TextField
              id="standard-basic"
              label="conditionValue"
              name="conditionValue"
              value={OneConditionValue}
              onChange={handleOneConditionValue}
            />
          </tr>
        </form>
        {conditionData.map((condition: any, index: any) => {
          return (
            <form noValidate autoComplete="off">
              <tr>
                <RadioGroup
                  row
                  aria-label="gender"
                  name="gender1"
                  value={condition.condRadio}
                  onChange={(e) => handleRadio(e, index)}
                >
                  <FormControlLabel value="1" control={<Radio />} label="And" />
                  <FormControlLabel value="2" control={<Radio />} label="Or" />
                </RadioGroup>
              </tr>
              <tr>
                Conditions{index + 2}
                <Select
                  labelId="demo-simple-select-helper-label"
                  id={index + 'selectId'}
                  value={condition.condColumnId}
                  onChange={(e) => handleConditionName(e, index)}
                >
                  {typeColumnData.map((column: any) => (
                    <MenuItem value={column.misColumnId}>{column.misColumnLabel}</MenuItem>
                  ))}
                </Select>
                &nbsp;&nbsp;
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={condition.condFilter}
                  onChange={(e) => handleFilter(e, index)}
                >
                  <MenuItem value={'0'}>is</MenuItem>
                  <MenuItem value={'1'}>is not</MenuItem>
                  <MenuItem value={'2'}>contains</MenuItem>
                  <MenuItem value={'3'}>greater</MenuItem>
                  <MenuItem value={'4'}>less</MenuItem>
                </Select>
                &nbsp;&nbsp;
                <TextField
                  id="standard-basic"
                  label="conditionValue"
                  name="conditionValue"
                  value={condition.condValue}
                  onChange={(e) => handleConditionValue(e, index)}
                />
                &nbsp;&nbsp;
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => handleDelCondition(e, index)}
                >
                  -
                </Button>
              </tr>
            </form>
          );
        })}
        &nbsp;
        <tr>
          <Button variant="contained" color="primary" size="small" onClick={saveAutoLinkFunction}>
            Save
          </Button>
          <Button
            style={{ marginLeft: '20px' }}
            variant="contained"
            size="small"
            onClick={cancelContext}
          >
            Cancel
          </Button>
        </tr>
      </FormControl>
    </div>
  );
};
export default AutoLinkPage;
