import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

const initialState: WorkspaceType = {
  title: '',
  breadCrumbs: [],
};

const WorkspaceContext = createContext(initialState);

const WorkspaceContextProvider = ({ children }: WorkspaceContextProviderProps) => {
  const [pageTitle, setPageTitle] = useState('');
  const [breadCrumbs, setBreadCrumbs] = useState<Array<{ to: string; name: string }>>([]);
  const setTitle = (newTitle: string) => setPageTitle(newTitle);
  const setBreadcrumbs = (newBreadCrumbs: Array<{ to: string; name: string }>) => {
    console.log(newBreadCrumbs);

    setBreadCrumbs(newBreadCrumbs);
  };
  console.log(breadCrumbs);
  const WorkspaceContextValue = useMemo(
    () => ({
      title: pageTitle,
      setTitle,
      breadCrumbs,
      setBreadcrumbs,
    }),
    [pageTitle, breadCrumbs, setBreadCrumbs]
  );

  return (
    <WorkspaceContext.Provider value={WorkspaceContextValue}>{children}</WorkspaceContext.Provider>
  );
};

export { WorkspaceContext, WorkspaceContextProvider };

export type WorkspaceContextProviderProps = {
  children: ReactNode;
};

export type WorkspaceType = {
  setTitle?: (newTitle: string) => void;
  setBreadcrumbs?: (newBreadCrumbs: Array<{ to: string; name: string }>) => void;
  title: string;
  breadCrumbs: Array<{ to: string; name: string }>;
};
