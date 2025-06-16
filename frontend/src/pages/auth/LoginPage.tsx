import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAuthTokens, setUser, setLoading, setError, clearAuth, setSuccess } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: any) => {
    dispatch(setLoading());
    try {
      const tokenData = await authService.loginUser({
        username: values.email, // FastAPI Users uses 'username' for the email field in OAuth2PasswordRequestForm
        password: values.password,
      });
      dispatch(setAuthTokens({ token: tokenData.access_token }));

      // After setting token, fetch user details
      const userData = await authService.fetchCurrentUser();
      dispatch(setUser(userData)); // Assuming UserProfile matches the response
      dispatch(setSuccess());

      message.success('Login successful!');
      navigate('/projects'); // Redirect to a protected page
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.response && err.response.data && err.response.data.detail) {
        if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail) && err.response.data.detail.length > 0) {
            // Handle complex error structures from FastAPI validation if necessary
            errorMessage = err.response.data.detail.map((e: any) => e.msg).join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      dispatch(setError(errorMessage));
      message.error(errorMessage);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)' /* Adjust based on header/footer */ }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
          {error && status === 'failed' && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
          <Form
            name="login"
            onFinish={onFinish}
            initialValues={{ remember: true }}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'The input is not valid E-mail!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email (Username)" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={status === 'loading'} block>
                Log in
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              Or <Link to="/register">register now!</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
