import { ComponentsContext } from '../context/ComponentsContext';
import { ComponentsType } from '../context/ComponentsContext';
import { useCallback, useContext, useMemo } from 'react';

function useDialog<T = {}>(key?: string): useDialogProps<T> {
  const { dialogs, closeDialog, openDialog, updateDialog } = useContext(ComponentsContext);
  const dialog = useMemo(() => dialogs.find((item) => item.key === key), [dialogs, key]);
  const closeCurrentDialog = useCallback(() => {
    key && closeDialog(key);
  }, [dialogs, key]);

  return {
    isOpen: dialog ? true : false,
    closeCurrentDialog,
    dialogs,
    data: dialog?.data ? dialog.data : undefined,
    closeDialog,
    openDialog,
    updateDialog,
  };
}

export default useDialog;

export type useDialogProps<T> = {
  dialogs: ComponentsType['dialogs'];
  isOpen: boolean;
  closeCurrentDialog: () => void;
  data?: T;
  closeDialog: ComponentsType['closeDialog'];
  updateDialog: ComponentsType['updateDialog'];
  openDialog: ComponentsType['openDialog'];
};

export type useDialogType<T> = (key: string) => useDialogProps<T> | ComponentsType;
