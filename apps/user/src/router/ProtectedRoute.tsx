import { UserContext } from 'libs/common/src/lib/context';
import { ReactNode, useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

const ProtectedRoute = ({ children, ...routeProps }: ProtectedRouteProps) => {
  const {
    properties: { token },
  } = useContext(UserContext);
  return token ? (
    <Route {...routeProps}>{children}</Route>
  ) : (
    <Redirect
      to={{
        pathname: '/login',
        state: {
          from: location?.pathname,
        },
      }}
    />
  );
};
export default ProtectedRoute;

export type ProtectedRouteProps = {} & RouteProps;
