import { createContext, ReactNode, useMemo, useState } from 'react';

const initialState: selectionType = {
  selection: null,
  setSelection: () => {
    console.log('hi');
  },
};
const SelectionContext = createContext(initialState);
const SelectionContextProvider = ({ children }: SelectionContextProviderProps) => {
  const [selection, setSelection] = useState<any>();

  const setSelectionObj = (selectionObj: any) => setSelection(selectionObj);

  const selectionContextValue = useMemo(
    () => ({
      selection,
      setSelection: setSelectionObj,
    }),
    [selection]
  );
  return (
    <SelectionContext.Provider value={selectionContextValue}>{children}</SelectionContext.Provider>
  );
};

export type selectionType = {
  selection?: any | null;
  setSelection: (selction: any) => void;
};
export type SelectionContextProviderProps = {
  children: ReactNode;
};

export { SelectionContext, SelectionContextProvider };
