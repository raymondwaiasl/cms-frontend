import type { WidgetDetail } from '../api/common';
import { ComponentsContext } from '../context/ComponentsContext';
import { ComponentsType } from '../context/ComponentsContext';
import { WidgetContext } from '../context/WidgetContext';
import WidgetHandler from '../context/WidgetHandler';
import configStore from '../store/configStore';
import dataStore from '../store/dataStoreNew';
import useApi from './useNewApi';
import useStore from './useStore';
import { useCallback, useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';

function useWidget<T = {}, P = {}>(key?: keyof typeof dataStore) {
  const { store } = useStore(key);
  const dataStorage = store.data;
  const client = useApi();
  const [config, setConfig] = useRecoilState(configStore);
  const setData = (data: { [key: string]: any }) => {
    if (key) store.set[key]((prev) => ({ ...prev, ...data }));
  };
  const { id, widgetId, config: tempConfig, editMode } = useContext(WidgetContext);
  useQuery(
    ['config', widgetId],
    async () => {
      const { data } = await client.widget.getWidgetById({ id: widgetId ?? '' });

      return data;
    },
    {
      enabled: key && !config[key],
      onSuccess: (data) => {
        if (key) setConfig((prev) => ({ ...prev, [key]: data }));
      },
    }
  );
  const { widgets, closeWidget, setWidgets } = useContext(ComponentsContext);
  const widget = useMemo(() => widgets.find((item) => item.key === key), [widgets, key]);
  const widgetIndex = useMemo(
    () => widgets.filter((item) => item.key === key).findIndex((item) => item.id === id) ?? 0,
    [widgets, key, id]
  );
  const closeCurrentWidget = useCallback(() => closeWidget(id), [widgets, id]);
  const updateTheWidget = (key: keyof typeof dataStore, data: any) => {
    store.set[key]({ ...store.data[key], ...data });
    console.log(store);
  };
  const updateWidgets = (newData: any) => {
    for (let key in newData) {
      if (newData.hasOwnProperty(key) && WidgetHandler.hasOwnProperty(key)) {
        const newKey = key as keyof typeof dataStore;
        updateTheWidget(newKey, newData[key]);
      }
    }
  };
  const widgetData = key ? (store.data[key] as T) : ({} as T);
  const configData =
    !editMode && widgetId && config[widgetId]
      ? {
          ...config[widgetId],
          config: config[widgetId].misWidgetConfig
            ? JSON.parse(config[widgetId].misWidgetConfig)
            : {},
        }
      : ({ config: tempConfig } as widgetConfig<P>);
  const widgetProps: useWidgetProps<T, P> = {
    closeCurrentWidget,
    closeWidget,
    data: widgetData,
    dataStore: dataStorage,
    isOpen: widget ? true : false,
    setData,
    config: configData,
    setWidgets,
    updateWidget: updateTheWidget,
    updateWidgets,
    widgets,
    widgetIndex,
    resetStore: store.reset,
  };

  return widgetProps;
}

export default useWidget;

export type useWidgetProps<T, P> = {
  closeCurrentWidget: () => void;
  closeWidget: ComponentsType['closeWidget'];
  data: T;
  dataStore?: { [key: string]: any };
  setData: (data: { [key: string]: any }) => void;
  isOpen: boolean;
  setWidgets: ComponentsType['setWidgets'];
  updateWidget: (key: keyof typeof dataStore, data: any) => void;
  updateWidgets: (data: any) => void;
  widgetIndex: number;
  config: widgetConfig<P>;
  widgets: ComponentsType['widgets'];
  resetStore: () => void;
};

export type widgetConfig<T> = {
  config: T;
} & Omit<WidgetDetail, 'misWidgetConfig'>;
