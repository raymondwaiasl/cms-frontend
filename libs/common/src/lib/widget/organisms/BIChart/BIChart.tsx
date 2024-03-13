import { Card, Link } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ReactEcharts from 'echarts-for-react';
import { DefaultFolderId, GraphicsTypeData } from 'libs/common/src/lib/constant';
import { WidgetContext } from 'libs/common/src/lib/context/WidgetContext';
import { useApi, useWidget } from 'libs/common/src/lib/hooks';
import { DateTime } from 'luxon';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

const BIChart: FC<BiChartProps> = ({
  misBiConfigId,
  misBiConfigName,
  misBiConfigTypeId,
  misBiConfigColumnHor,
  misBiConfigColumnVet,
  misBiConfigGraphicType,
  misBiConfigDefView,
  allData = [],
}) => {
  const { configId, title } = useContext(WidgetContext);
  const client = useApi();
  const { updateWidget } = useWidget();
  const [startDate, setStartDate] = useState<string | null>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string | null>('');
  const columns: GridColDef[] = [
    {
      field: 'columnName',
      headerName: 'Column Name',
      minWidth: 170,
      renderCell: (params: any) => {
        return (
          <Link
            aria-label="context-link"
            component="button"
            variant="body2"
            onClick={() => {
              updateWidget('Record List', {
                id: DefaultFolderId,
                searchParams: {
                  DefaultFolderId,
                  qfColumns: [],
                  qfConditions: [
                    {
                      misQfId: '',
                      misQfc2ColumnId: biToolInfoDetail.misBiConfigColumnHor ?? '',
                      misQfc2Condition: '1',
                      misQfc2Id: '',
                      misQfc2Value: params.row.columnName,
                      misRelation: '',
                    },
                  ],
                  typeId: biToolInfoDetail.misBiConfigTypeId ?? '',
                },
              });
            }}
          >
            {params.row.columnName}
          </Link>
        );
      },
    },
    {
      field: 'countData',
      headerName: 'Count Data',
      minWidth: 170,
      align: 'right',
    },
  ];
  const onclick = {
    click: (e: any) => {
      if (e.componentSubType === 'bar' || e.componentSubType === 'pie') {
        updateWidget('Record List', {
          id: DefaultFolderId,
          searchParams: {
            DefaultFolderId,
            qfColumns: [],
            qfConditions: [
              {
                misQfId: '',
                misQfc2ColumnId: biToolInfoDetail.misBiConfigColumnHor ?? '',
                misQfc2Condition: '1',
                misQfc2Id: '',
                misQfc2Value: e.name,
                misRelation: '',
              },
            ],
            typeId: biToolInfoDetail.misBiConfigTypeId ?? '',
          },
        });
      }
    },
  };

  const { data: biToolInfoDetail } = useQuery(
    ['BiInfoQuery', configId],
    async () => {
      const { data: response } = await client.biTool.getBiTool({
        misBiConfigId: configId ?? '',
      });
      return response;
    },
    {
      enabled: !!configId,
    }
  );

  const { data: columnData } = useQuery(
    ['columnData', biToolInfoDetail],
    async () => {
      const { data: response } =
        biToolInfoDetail?.misBiConfigType === 'defined_table'
          ? biToolInfoDetail?.misBiConfigGraphicType === '4' ||
            biToolInfoDetail?.misBiConfigGraphicType === '5'
            ? await client.biTool.countTableColumnDataByDate({
                tableId: biToolInfoDetail.misBiConfigTypeId ?? '',
                columnId: biToolInfoDetail.misBiConfigColumnHor ?? '',
              })
            : await client.biTool.countTableColumnData({
                tableId: biToolInfoDetail.misBiConfigTypeId ?? '',
                columnId: biToolInfoDetail.misBiConfigColumnHor ?? '',
              })
          : biToolInfoDetail?.misBiConfigGraphicType === '4' ||
            biToolInfoDetail?.misBiConfigGraphicType === '5'
          ? await client.biTool.countWorkFlowDataByDate()
          : await client.biTool.countWorkFlowData();
      return response;
    },
    {
      enabled:
        (biToolInfoDetail?.misBiConfigType === 'defined_table' &&
          !!biToolInfoDetail?.misBiConfigTypeId &&
          !!biToolInfoDetail?.misBiConfigColumnHor) ||
        biToolInfoDetail?.misBiConfigType === 'mis_workflow',
      onSuccess: (data) => {},
    }
  );
  const getOption = useMemo(() => {
    let chartData = columnData || allData;
    const graphType = biToolInfoDetail?.misBiConfigGraphicType ?? misBiConfigGraphicType;
    const name = biToolInfoDetail?.misBiConfigName ?? misBiConfigName;
    if (misBiConfigDefView === 'D') return {};
    if (chartData && (graphType === '1' || graphType === '2')) {
      return {
        title: {
          text: name,
        },
        tooltip: {},
        toolbox: {
          feature: {
            dataView: {
              show: true,
            },
          },
        },
        xAxis: {
          data: chartData.map((i) => i.columnName),
        },
        yAxis: {},
        series: [
          {
            type: GraphicsTypeData.find((item) => item.key === graphType)?.code,
            data: chartData.map((i) => i.countData),
          },
        ],
      };
    }
    if (chartData && graphType === '3') {
      return {
        title: {
          text: name,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },

        legend: {
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: name,
            type: GraphicsTypeData.find((item) => item.key === graphType)?.code,
            data: chartData.map((item) => ({
              value: item.countData,
              name: item.columnName,
            })),
          },
        ],
      };
    }
    if (chartData && graphType === '4') {
      return {
        title: {
          text: name,
          left: 'center',
        },
        grid: { top: 8, right: 8, bottom: 24, left: 36, containLabel: true },
        tooltip: {
          trigger: 'item',
        },
        xAxis: {
          max: 'dataMax',
          axisLabel: {
            show: true,
          },
        },
        yAxis: {
          type: 'category',
          name: '',
          inverse: true,
          axisLabel: {
            rotate: -90,
            show: true,
            fontSize: 14,
          },
          animationDuration: 300,
          animationDurationUpdate: 300,
        },

        series: [
          {
            realtimeSort: true,
            seriesLayoutBy: 'column',
            type: 'bar',
            label: {
              show: true,
              precision: 1,
              position: 'right',
              valueAnimation: true,
            },

            encode: {
              x: 'countData',
              y: 'columnName',
              label: ['columnName', 'countData'],
              itemName: 'date',
              tooltip: ['countData'],
            },
          },
        ],
        dataset: {
          dimernsions: Object.keys(chartData[0] || {}),
          source: chartData?.filter((item) => item.date === currentDate),
        },
        animationDuration: 300,
        animationDurationUpdate: 300,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
        graphic: {
          elements: [
            {
              type: 'text',
              right: 0,
              bottom: 30,
              style: {
                text: startDate
                  ? DateTime.fromISO(currentDate ?? '').toISODate() ?? ''
                  : DateTime.now().toISODate(),
                font: 'bolder 20px monospace',
                fill: 'rgba(100, 100, 100, 0.25)',
              },
              z: 100,
            },
          ],
        },
      };
    }
    if (chartData && graphType === '5') {
      const filter = chartData
        .filter((item) => item.date === currentDate)
        .map((item) => ({
          id: `dataset_${item.columnName}`,
          fromDatasetIndex: 0,
          transform: {
            type: 'filter',
            config: {
              and: [
                { dimension: 'date', gte: currentDate, parser: 'time' },
                { dimension: 'columnName', '=': item.columnName },
              ],
            },
          },
        }));
      return {
        animationDuration: 10000,
        dataset: [
          {
            dimernsions: Object.keys(chartData[0] ?? {}),
            source: chartData,
          },
          ...filter,
        ],

        title: {
          text: name,
        },
        tooltip: {
          order: 'valueDesc',
          trigger: 'axis',
        },
        xAxis: {
          name: 'date',
          axisLabel: {
            show: true,
          },
          type: 'category',
          nameLocation: 'middle',
        },
        yAxis: {
          name: '',
        },
        grid: {
          right: 140,
        },
        series: chartData.map((item) => ({
          type: 'line',
          datasetId: `dataset_${item.columnName}`,
          showSymbol: false,
          name: item.columnName,
          endLabel: {
            show: true,
            formatter: function (params: any) {
              return `${params.data.columnName} ${params.data.countData}`;
            },
          },
          labelLayout: {
            moveOverlap: 'shiftY',
          },
          emphasis: {
            focus: 'series',
          },
          encode: {
            x: 'date',
            y: 'countData',
            label: ['columnName', 'countData'],
            itemName: 'date',
            tooltip: ['countData'],
          },
        })),
      };
    }
    return {};
  }, [
    misBiConfigGraphicType,
    misBiConfigId,
    misBiConfigName,
    allData.length,
    misBiConfigDefView,
    columnData?.length,
    currentDate,
    startDate,
  ]);
  const timerIncrement = (timer: any, date: string) => {
    if (DateTime.fromISO(date ?? '').toMillis() >= DateTime.fromISO(endDate ?? '').toMillis()) {
      clearInterval(timer as any);
      return;
    }
    setCurrentDate((prev) => {
      console.log(DateTime.fromISO(prev).plus({ days: 1 }).toISODate() ?? '');
      return DateTime.fromISO(prev).plus({ days: 1 }).toISODate() ?? '';
    });
  };
  useEffect(() => {
    const timer =
      (biToolInfoDetail?.misBiConfigGraphicType ?? misBiConfigGraphicType) === '4'
        ? setInterval(() => {
            timerIncrement(timer, currentDate ?? '');
          }, 300)
        : null;

    return () => (timer ? clearInterval(timer as any) : undefined);
  }, [biToolInfoDetail?.misBiConfigGraphicType, misBiConfigGraphicType, currentDate]);
  useEffect(() => {
    const chartData = columnData || allData;
    const startingDate = chartData?.reduce((prev: string | null, next) => {
      if (!prev) {
        return next.date ?? null;
      }

      return DateTime.fromISO(prev).toMillis() > DateTime.fromISO(next?.date ?? '').toMillis()
        ? next.date ?? ''
        : prev;
    }, null);
    if (chartData) {
      setStartDate(startingDate ?? null);
      setCurrentDate(startingDate ?? '');
      setEndDate(
        chartData.reduce((prev: string | null, next) => {
          if (!prev) {
            return next.date ?? null;
          }

          return DateTime.fromISO(prev).toMillis() < DateTime.fromISO(next?.date ?? '').toMillis()
            ? next.date ?? ''
            : prev;
        }, null)
      );
    }
  }, [columnData?.length, allData.length]);
  return (
    <Card sx={{ padding: 3, height: '100%' }}>
      {(misBiConfigDefView === 'G' || biToolInfoDetail?.misBiConfigDefView === 'G') && (
        <ReactEcharts
          option={getOption}
          style={{ width: '100%', height: '100%', minWidth: '550px' }}
          onEvents={onclick}
        />
      )}
      {(misBiConfigDefView === 'D' || biToolInfoDetail?.misBiConfigDefView === 'D') && (
        <DataGrid
          rows={columnData ?? allData}
          columns={columns}
          getRowId={(row) => row.columnName}
          autoHeight
        />
      )}
    </Card>
  );
};

export default BIChart;

export type BiChartProps = {
  misBiConfigId?: string;
  misBiConfigName?: string;
  misBiConfigTypeId?: string;
  misBiConfigColumnHor?: string;
  misBiConfigColumnVet?: string;
  misBiConfigGraphicType?: string;
  misBiConfigDefView?: string;
  allData?: Array<{ countData: number; columnName: string; date?: string }>;
};
