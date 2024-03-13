import OverlayWrapper from '../components/OverlayWrapper/OverlayWrapper';
import dataStore from '../store/dataStoreNew';
import DialogHandler from './DialogHandler';
import WidgetHandler from './WidgetHandler';
import { createContext, ReactNode, useCallback, useMemo, useState } from 'react';

const initialFn = () => {};

const initialState: ComponentsType = {
  widgets: [],
  dialogs: [],
  overlays: [],
  openDialog: initialFn,
  // openWidget: initialFn,
  openOverlay: initialFn,
  closeOverlay: initialFn,
  updateDialog: initialFn,
  closeDialog: initialFn,
  closeWidget: initialFn,
  setWidgets: initialFn,
};

const ComponentsContext = createContext(initialState);

const ComponentsContextProvider = ({ children }: ComponentsContextProviderProps) => {
  const [widgets, setWidgets] = useState<ComponentsType['widgets']>([]);
  const [dialogs, setDialogs] = useState<ComponentsType['dialogs']>([]);
  const [overlays, setOverlays] = useState<ComponentsType['overlays']>([]);
  const findWidget = (key: string) => widgets.find((item) => item.key === key);
  const findDialog = (key: string) => dialogs.find((item) => item.key === key);

  const openDialog: ComponentsType['openDialog'] = (key, data) => {
    console.log(key);
    const dialog = findDialog(key);
    if (!dialog) {
      setDialogs((currDialogs) => [...currDialogs, { key, data }]);
      return;
    }
    if (dialog) {
      const updatedDialogs = dialogs.map((dialog) => {
        if (dialog.key === key) {
          return { ...dialog, data: data };
        }
        return dialog;
      });
      setDialogs([...new Set(updatedDialogs)]);
    }
  };
  const openOverlay: ComponentsType['openOverlay'] = (data) => {
    console.log('config id', data.configId);
    setOverlays((curr) => [...curr, data]);
  };
  const setWidgetsArr = (
    arr: {
      key: keyof typeof WidgetHandler | string;
      title: string;
      id: string;
      configId?: string;
      widgetId: string;
    }[]
  ) => setWidgets(arr.map((item) => ({ ...item })));
  const updateDialog = (key: string, data?: any) => openDialog(key, data);

  const closeDialog: ComponentsType['closeDialog'] = useCallback(
    (key) => {
      setDialogs((currDialogs) => currDialogs.filter((item) => item.key !== key));
    },
    [dialogs]
  );
  const closeWidget: ComponentsType['closeDialog'] = useCallback(
    (key) => {
      setWidgets((currWidgets) => currWidgets.filter((item) => item.id !== key));
    },
    [widgets]
  );
  const closeOverlay: ComponentsType['closeOverlay'] = useCallback(
    (key) => {
      setOverlays((currOverlays) => currOverlays.filter((item) => item.key !== key));
    },
    [widgets]
  );
  console.log(overlays);
  const selectionContextValue = useMemo(
    () => ({
      widgets,
      dialogs,
      overlays,
      setWidgets: setWidgetsArr,
      openDialog,
      closeDialog,
      openOverlay,
      closeOverlay,
      // openWidget,
      closeWidget,
      updateDialog,
    }),
    [widgets, dialogs, overlays]
  );
  return (
    <ComponentsContext.Provider value={selectionContextValue}>
      {children}
      {dialogs.map((item) => DialogHandler[item.key as keyof typeof DialogHandler])}
      {overlays.map((item) => (
        <OverlayWrapper
          key={item.key}
          widgetKey={item.key as keyof typeof dataStore}
          configId={item.configId}
          type={item.type}
          title={item.title}
        />
      ))}
    </ComponentsContext.Provider>
  );
};

export type ComponentsType = {
  widgets: Widget[];
  dialogs: Array<Dialog>;
  overlays: Array<Overlay>;
  openDialog: (key: string, data?: any) => void;
  openOverlay: (data: Overlay) => void;
  closeOverlay: (key: string) => void;
  setWidgets: (
    arr: {
      key: keyof typeof WidgetHandler | string;
      title: string;
      id: string;
      configId?: string;
      widgetId: string;
    }[]
  ) => void;
  // openWidget: (key: string, data?: any) => void;
  updateDialog: (key: string, data?: any) => void;
  closeDialog: (key: string) => void;
  closeWidget: (key: string) => void;
};

export type ComponentsContextProviderProps = {
  children: ReactNode;
};

export interface Widget {
  key: keyof typeof WidgetHandler | string;
  title: string;
  id: string;
  configId?: string;
  widgetId?: string;
}

export type Overlay = {
  type: 'SIDEBAR' | 'DIALOG';
} & Omit<Widget, 'id' | 'widgetId'>;

export interface Dialog {
  key: string;
  data?: any;
}

export { ComponentsContext, ComponentsContextProvider };
