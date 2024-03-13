import { ComponentsContext } from '../context/ComponentsContext';
import { ComponentsType } from '../context/ComponentsContext';
import configStore from '../store/configStore';
import dataStore from '../store/dataStoreNew';
import useApi from './useNewApi';
import useStore from './useStore';
import { useCallback, useContext, useMemo } from 'react';
import { useMutation } from 'react-query';
import { useRecoilState } from 'recoil';

function useOverlay<T = {}>(key?: keyof typeof dataStore) {
  const { store, data } = useStore(key);
  const client = useApi();
  const dataStorage = store.data;
  const [config, setConfig] = useRecoilState(configStore);
  // const setDataStore = key && store.set[key];
  const getConfig = useMutation(
    async (reqKey: string) => {
      const { data } = await client.widget.getWidgetById({ id: reqKey ?? '' });

      return data;
    },
    {
      onSuccess: (data) => {
        if (key) setConfig((prev) => ({ ...prev, [key]: data }));
      },
    }
  );
  const { overlays, closeOverlay, openOverlay } = useContext(ComponentsContext);
  // const { id: widgetId } = useContext(WidgetContext);
  const openTheOverlay = ({ key, type, data, configId }: IOpenOverlayProps) => {
    if (configId && !config[configId]) {
      getConfig.mutate(configId);
    }
    openOverlay({
      title: data.misSimpleSearchName?data.misSimpleSearchName:key,
      type,
      key,
      configId,
    });
    store.set[key]((curr) => ({ ...curr, ...data }));
  };
  const overlay = useMemo(() => overlays.find((item) => item.key === key), [overlays, key]);
  const closeCurrentOverlay = useCallback(() => {
    key && closeOverlay(key);
  }, [overlays, key]);
  const overlayData = data;

  const overlayProps: useOverlayProps<T> = {
    closeCurrentOverlay,
    openOverlay: openTheOverlay,
    closeOverlay,
    data: overlayData,
    dataStore: dataStorage,
    isOpen: overlay ? true : false,
    resetStore: store.reset,
  };

  return overlayProps;
}

export default useOverlay;

export type useOverlayProps<T> = {
  closeCurrentOverlay: () => void;
  closeOverlay: ComponentsType['closeOverlay'];
  openOverlay: (props: IOpenOverlayProps) => void;
  data: T | { [key: string]: any };
  dataStore?: { [key: string]: any };
  isOpen: boolean;
  resetStore: () => void;
};

export interface IOpenOverlayProps {
  key: keyof typeof dataStore;
  type: 'SIDEBAR' | 'DIALOG';
  data?: any;
  configId?: string;
}
