import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import { createContext, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

const initialState: ResponsiveType = {
  breakpoints: null,
  currentWidth: 0,
};

const ContainerContext = createContext(initialState);

const WidgetContainer: FC<PaperProps> = ({ children, ...props }) => {
  const [currentWidth, setCurrentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef?.current?.offsetWidth) {
      setCurrentWidth(containerRef?.current?.offsetWidth);
    }
  }, [containerRef?.current?.offsetWidth]);

  return (
    <Paper ref={containerRef} {...props}>
      <ContainerContext.Provider
        value={{
          breakpoints: 'sm',
          currentWidth,
        }}
      >
        {children}
      </ContainerContext.Provider>
    </Paper>
  );
};

export default WidgetContainer;

export type ResponsiveType = {
  breakpoints?: 'sm' | 'md' | 'lg' | null;
  currentWidth: number;
};
