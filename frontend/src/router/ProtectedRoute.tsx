import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Spin, Row, Col } from 'antd'; // For loading indicator

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, status: authStatus } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // This status check is for the initial app load scenario where we might be verifying an existing token.
  // If auth status is 'loading' (e.g. during initial fetchCurrentUser), show a spinner.
  // This prevents redirecting to login while token validation is in progress.
  if (authStatus === 'loading' && !isAuthenticated && !!token) { // Token exists, but not yet authenticated (maybe validating)
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Spin size="large" tip="Authenticating..." />
        </Col>
      </Row>
    );
  }

  if (!isAuthenticated && authStatus !== 'loading') { // Not authenticated and not currently trying to authenticate
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
