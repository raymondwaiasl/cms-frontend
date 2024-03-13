import { Widget } from '../../../context';
import { WidgetContextProvider } from '../../../context/WidgetContext';
import { WidgetContext } from '../../../context/WidgetContext';
import WidgetHandler from '../../../context/WidgetHandler';
import WidgetContainer from '../../molecules/WidgetContainer/WidgetContainer';
import styles from './GridWrapper.module.scss';
import { Card, Box } from '@mui/material';
import cn from 'clsx';
import React, { forwardRef, HTMLAttributes, useEffect, useRef, useState, useContext } from 'react';
import { CgCloseR } from 'react-icons/cg';

const GridWrapper = forwardRef<HTMLDivElement, GridWrapperProps>(
  (
    {
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      title,
      children,
      component,
      onClose,
      widget,
      componentType = 'NORMAL',
      showTitleBar = true,
      multiWidgetMode = true,
      editMode = false,
      ...props
    },
    ref
  ) => {
    const titleRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    const [width, setWidth] = useState(0);
    useEffect(() => {
      if (multiWidgetMode && titleRef.current?.offsetHeight) {
        setOffset(titleRef.current?.offsetHeight ?? 0);
      }
      if (titleRef.current?.offsetHeight) {
        setWidth(titleRef.current?.offsetWidth ?? 0);
      }
    }, [titleRef.current?.offsetHeight, titleRef.current?.offsetWidth, multiWidgetMode]);
    return (
      <Card
        style={
          multiWidgetMode
            ? style
            : {
                marginBottom: '40px',
              }
        }
        className={cn(className, styles.container)}
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        {multiWidgetMode && children}
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {showTitleBar && (
            <div ref={titleRef} className={styles.title}>
              {widget.title}
              {editMode && <CgCloseR onClick={onClose} />}
            </div>
          )}
          {showTitleBar ? (
            <WidgetContainer
              className={styles.wrapper}
              sx={{
                height: `calc(100% - ${offset}px)`,
              }}
            >
              <WidgetContextProvider {...widget} breakpoint="sm" width={width}>
                <>{WidgetHandler[widget.key as keyof typeof WidgetHandler]}</>
              </WidgetContextProvider>
            </WidgetContainer>
          ) : (
            <>
              <WidgetContextProvider {...widget} breakpoint="sm" width={width}>
                <>{WidgetHandler[widget.key as keyof typeof WidgetHandler]}</>
              </WidgetContextProvider>
            </>
          )}
        </Box>
      </Card>
    );
  }
);

export default GridWrapper;

export type GridWrapperProps = {
  className?: string;
  multiWidgetMode?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  onClose?: (evt: React.MouseEvent) => void;
  component?: React.ReactNode;
  widget: Widget;
  showTitleBar?: boolean;
  editMode?: boolean;
  componentType?: 'DIALOG' | 'SIDEBAR' | 'NORMAL';
} & HTMLAttributes<HTMLDivElement>;
