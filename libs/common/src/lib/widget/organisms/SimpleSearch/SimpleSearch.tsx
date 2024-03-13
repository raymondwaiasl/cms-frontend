import { SimpleSearchItem } from '../../../api';
import { useApi, useWidget } from '../../../hooks';
import useOverlay from '../../../hooks/useOverlay';
import { InputHandling } from '../../../utils/searchItemHandling';
import styles from './SimpleSearch.module.scss';
import { Button, Paper } from '@mui/material';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';

// import throttle from "lodash/throttle";

const SimpleSearch = () => {
  const client = useApi();
  const { closeCurrentOverlay, data: overlayData } = useOverlay('Simple Search');
  const { data, updateWidget, config } = useWidget<{ id: string; tableId: string }>(
    'Simple Search'
  );

  const { unregister, control, handleSubmit, reset, getValues } = useForm({
    shouldUnregister: true,
  });
  console.log('data', data);
  const [folderId, setFolderId] = useState<string>('');
  const [searchItems, setSearchItems] = useState<SimpleSearchItem[]>([]);

  useQuery(
    ['Simple Search', config.misSimpleSearchId],
    async () => {
      const { data } = await client.simpleSearch.getSimpleSearchById({
        id:
          'misSimpleSearchId' in overlayData
            ? overlayData?.misSimpleSearchId
            : config.misSimpleSearchId ?? '0067000000000001',
      });
      return data;
    },
    {
      enabled: true,
      onSuccess: (data) => {
        if (data) {
          setSearchItems(
            data.items.map((item) => {
              return {
                id: item.id,
                itemName: item.itemName,
                inputType: item.inputType,
                itemDictionary: item.itemDictionary,
                itemLs: item.itemLs ?? [],
                colSize: item.colSize,
                rowSize: item.rowSize,
              };
            })
          );
        }
      },
    }
  );

  useEffect(() => {
    if (data?.id) {
      setFolderId(data.id);
    }
  }, [data?.id]);

  const submitHandling = (formData: any) => {
    const jsonData = JSON.stringify(formData);
    updateWidget('Record List', {
      simpleSearchParams: {
        simpleSearchId: config.misSimpleSearchId ?? '0067000000000001',
        searchConditons: jsonData,
      },
      tab: 2,
    });
    updateWidget('Query Record List', {
      simpleSearchParams: {
        simpleSearchId:
          'misSimpleSearchId' in overlayData
            ? overlayData?.misSimpleSearchId
            : config.misSimpleSearchId ?? '0067000000000001',
        searchConditons: jsonData,
      },
      tab: 2,
    });
    closeCurrentOverlay();
  };
  return (
    <>
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
        <form onSubmit={handleSubmit(submitHandling)}>
          <div className={styles.form}>
            {searchItems.map((item) => (
              <Controller
                key={item.id}
                name={item.itemName}
                defaultValue={{
                  input_type: item.inputType,
                  value: '',
                }}
                rules={{}}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                  return (
                    <InputHandling
                      misColumnLabel={item.itemName}
                      misColumnInputType={item.inputType}
                      columnLs={item.itemLs}
                      value={value}
                      onChange={onChange}
                      disabled={false}
                      error={error}
                      style={{
                        gridColumn: `span ${item?.colSize}`,
                        gridRow: `span ${item?.rowSize}`,
                        minWidth: '150px',
                      }}
                    />
                  );
                }}
              />
            ))}
          </div>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </form>
      </Paper>
    </>
  );
};

export default SimpleSearch;
