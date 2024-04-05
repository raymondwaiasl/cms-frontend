import Layout from '../components/layout/layout';
import { DashboardPage, LoginPage, ForgotPwdPage, ResetPwdPage, MyProfile } from '../pages';
import ChangePassword from '../pages/login-page/change-password';
import ProtectedRoute from './ProtectedRoute';
import { useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';

const BrowserRouter = () => {
  return (
    <Router basename='/user'>
      <Switch>
        <Route exact path={['/', '/login']} render={() => <LoginPage />} />
        <Route exact path={['/forgot']} render={() => <ForgotPwdPage />} />
        <Route exact path={['/reset']} render={() => <ResetPwdPage />} />
        <Layout>
          <ProtectedRoute exact path="/dashboard">
            <DashboardPage />
          </ProtectedRoute>
          <ProtectedRoute exact path="/dashboard/:id">
            <DashboardPage />
          </ProtectedRoute>
          <ProtectedRoute exact path={'/myProfile/:userId'}>
            <MyProfile />
          </ProtectedRoute>
          <ProtectedRoute exact path={'/changePassword'}>
            <ChangePassword />
          </ProtectedRoute>
        </Layout>
      </Switch>
    </Router>
  );
};

export default BrowserRouter;
