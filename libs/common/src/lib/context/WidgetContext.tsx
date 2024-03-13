import { Widget } from './ComponentsContext';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

const initialState: WidgetType = {
  id: '',
  breakpoint: '',
  width: 0,
  configId: undefined,
  config: {},
  closeOverlay: () => {},
  title: '',
  widgetId: '',
  editMode: false,
};

const WidgetContext = createContext<WidgetType>(initialState);

const WidgetContextProvider = ({
  children,
  id,
  breakpoint,
  width,
  configId,
  config = {},
  title,
  editMode = false,
  widgetId,
  closeOverlay = () => {},
}: WidgetContextProviderProps) => {
  const [containerWidth, setContainerWidth] = useState(width);
  useEffect(() => {
    if (width) setContainerWidth(width);
  }, [width]);
  const widgetContextValue = useMemo(
    () => ({
      id,
      breakpoint,
      config,
      width: containerWidth,
      configId,
      closeOverlay,
      title,
      widgetId,
      editMode,
    }),
    [id, breakpoint, width, configId, title, widgetId, editMode]
  );
  return <WidgetContext.Provider value={widgetContextValue}>{children}</WidgetContext.Provider>;
};

export { WidgetContext, WidgetContextProvider };

export type WidgetContextProviderProps<T = {}> = {
  children: ReactNode;
  id: string;
  widgetId?: string;
  breakpoint?: string;
  width?: number;
  configId?: string;
  title: string;
  closeOverlay?: () => void;
  config?: T;
  editMode?: boolean;
};

export type WidgetType = {
  id: string;
  widgetId?: string;
  title: string;
  breakpoint?: string;
  width?: number;
  closeOverlay?: () => void;
  configId?: string;
  config?: { [key: string]: any };
  editMode?: boolean;
};
