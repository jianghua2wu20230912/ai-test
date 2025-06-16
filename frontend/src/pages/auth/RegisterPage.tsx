import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'; // UserOutlined for consistency, though not strictly needed for email
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLoading, setError, setSuccess, clearAuth } from '../../store/slices/authSlice'; // No token/user set on register success directly
import { authService } from '../../services/authService';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    dispatch(setLoading());
    try {
      // FastAPI Users register endpoint returns the created user.
      // We don't automatically log them in here, just create the account.
      const registeredUser = await authService.registerUser({
        email: values.email,
        password: values.password,
      });
      dispatch(setSuccess()); // Indicate generic success, but not logged in state
      message.success(`Registration successful for ${registeredUser.email}. Please log in.`);
      navigate('/login');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
       if (err.response && err.response.data && err.response.data.detail) {
        // FastAPI Users might return a string or an object for detail on validation errors
        if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail) && err.response.data.detail.length > 0) {
            // Standard FastAPI validation errors
             errorMessage = err.response.data.detail.map((e: any) => `${e.loc.join('.')} - ${e.msg}`).join('; ');
        } else if (typeof err.response.data.detail === 'object') {
            // Handle cases like {"email": "User with this email already exists"}
            errorMessage = Object.entries(err.response.data.detail)
                                 .map(([key, val]) => `${key}: ${val}`)
                                 .join('; ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      dispatch(setError(errorMessage));
      message.error(errorMessage);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 128px)' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <Title level={2} style={{ textAlign: 'center' }}>Register</Title>
          {error && status === 'failed' && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            size="large"
            scrollToFirstError
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your Email!' },
                { type: 'email', message: 'The input is not valid E-mail!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your Password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={status === 'loading'} block>
                Register
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;
