import MainLayout from '../components/molecules/Layout/Layout';
import {
  AduitLog,
  ContextDetailPage,
  ContextPage,
  Dictionary,
  DictionaryDetail,
  EditTablePage,
  HomePage,
  LoginPage,
  NewWorkspace,
  PropertyDetailPage,
  PropertyPage,
  QueryForm,
  QueryFormDetail,
  SystemConfig,
  TableMgmt,
  UserAdmin,
  WorkspaceMgmt,
  TableRefPage,
  StoragePage,
  StorageDetailPage,
  BiToolPage,
  BiToolDetailPage,
  WidgetMgmt,
  WidgetMgmtDetail,
  DemoPage,
  SimpleSearchMgmt,
  EditSimpleSearch,
  MyProfile,
  ViewRelationData,
  WelcomeEditor,
  WelcomeView,
} from '../pages';
import ProtectedRoute from './ProtectedRoute';
import route from './route';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const BrowserRouter = () => {
  return (
    <Router basename="/admin">
      <Switch>
        <Route path={route.login} render={() => <LoginPage />} />
        <MainLayout>
          {/* <ProtectedRoute exact path={route.home}>
            <HomePage />
          </ProtectedRoute> */}
          <ProtectedRoute exact path={'/demo'}>
            <DemoPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={[route.context, route.home]}>
            <ContextPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.contextDetail}>
            <ContextDetailPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.workspace}>
            <WorkspaceMgmt />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.workspaceDetail}>
            <NewWorkspace />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.widgetMgmt}>
            <WidgetMgmt />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.widgetMgmtDetail}>
            <WidgetMgmtDetail />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.table}>
            <TableMgmt />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.tableDetail}>
            <EditTablePage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.tableReference}>
            <TableRefPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.queryForm}>
            <QueryForm />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.queryFormDetail}>
            <QueryFormDetail />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.propertyPage}>
            <PropertyPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.propertyPageDetail}>
            <PropertyDetailPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.audit}>
            <AduitLog />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.useradmin}>
            <UserAdmin />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.dictionary}>
            <Dictionary />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.dictionaryDetail}>
            <DictionaryDetail />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.systemConfig}>
            <SystemConfig />
          </ProtectedRoute>
          <ProtectedRoute exact path={route.storage}>
            <StoragePage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.storageDetail}>
            <StorageDetailPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.biToolConfig}>
            <BiToolPage />
          </ProtectedRoute>
          <ProtectedRoute exact path={route.welcomeConfig}>
            <WelcomeEditor />
          </ProtectedRoute>
          <ProtectedRoute exact path={route.welcomeView}>
            <WelcomeView />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.biToolDetail}>
            <BiToolDetailPage />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.simpleSearch}>
            <SimpleSearchMgmt />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.simpleSearchDetail}>
            <EditSimpleSearch />
          </ProtectedRoute>

          <ProtectedRoute exact path={route.myProfile + ':userId'}>
            <MyProfile />
          </ProtectedRoute>
          <ProtectedRoute exact path={route.viewRelationData}>
            <ViewRelationData />
          </ProtectedRoute>
        </MainLayout>
      </Switch>
    </Router>
  );
};

export default BrowserRouter;
