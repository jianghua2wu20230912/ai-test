import React, { useMemo } from 'react'; // Added useMemo
import { Layout, Menu, Typography, theme as antdTheme, Button, Dropdown, Space, message } from 'antd'; // Added Button, Dropdown, Space, message
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import {
  ProjectOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  RobotOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  ApartmentOutlined, // Icon for Hierarchy View
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearAuth, setLoading } from '../store/slices/authSlice'; // Auth actions
import { authService } from '../services/authService'; // AuthService for logout

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const mainMenuItems = [ // Renamed to avoid conflict if other menus are added
  { key: 'projects', label: 'Project Management', path: '/projects', icon: <ProjectOutlined /> },
  { key: 'requirements', label: 'Requirement Management', path: '/requirements', icon: <FileTextOutlined /> },
  { key: 'test-cases', label: 'Test Case Design', path: '/test-cases', icon: <ExperimentOutlined /> },
  // { key: 'knowledge-base', label: 'Knowledge Base', path: '/knowledge-base', icon: <DatabaseOutlined /> }, // Can be removed if HierarchyView replaces it
  { key: 'hierarchy-view', label: 'Hierarchy View', path: '/hierarchy-view', icon: <ApartmentOutlined /> },
  { key: 'ai-generation', label: 'AI Generation', path: '/ai-generation', icon: <RobotOutlined /> },
  { key: 'collaboration', label: 'Collaboration', path: '/collaboration', icon: <TeamOutlined /> },
  { key: 'settings', label: 'Settings', path: '/settings', icon: <SettingOutlined /> },
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth); // Get auth state
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = antdTheme.useToken();

  const handleLogout = async () => {
    dispatch(setLoading());
    try {
      if (token) { // Only call logout if token exists
        await authService.logoutUser();
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      // message.error('Logout failed. Please try again.'); // Optional: inform user
      // Don't let logout API failure prevent client-side clear
    } finally {
      dispatch(clearAuth());
      message.success('Logged out successfully.');
      navigate('/login');
    }
  };

  const userMenuItems = isAuthenticated && user ? [
    { key: 'userEmail', label: user.email || 'User Profile', disabled: true, icon: <UserOutlined /> },
    { key: 'logout', label: 'Logout', onClick: handleLogout, icon: <LogoutOutlined />, danger: true },
  ] : [];

  // Memoize top-level menu items to avoid re-computation on every render
  const topNavItems = useMemo(() =>
    mainMenuItems.map(item => (
      <Menu.Item key={item.key} icon={item.icon}>
        <Link to={item.path}>{item.label}</Link>
      </Menu.Item>
    )),
    [] // No dependencies, these items are static
  );

  // Determine selected key for menu based on current path
  let selectedKey = location.pathname === '/' ? 'projects' : location.pathname.substring(1).split('/')[0];
  if (!mainMenuItems.find(item => item.key === selectedKey)) {
    selectedKey = 'projects';
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', backgroundColor: '#001529' }}>
        <Title level={3} style={{ color: 'white', margin: '0 auto 0 0', flexShrink: 0 }}>
          Intelligent Test Case Platform
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={topNavItems} // Using items prop for AntD v5+ Menu
          style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', borderBottom: 'none' }}
        />
        <Space style={{ marginLeft: '20px' }}>
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }}>
              <Button type="text" style={{ color: 'white' }}>
                <UserOutlined /> <span style={{ marginLeft: 8 }}>{user.email || 'Account'}</span>
              </Button>
            </Dropdown>
          ) : (
            <>
              <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')} style={{ marginLeft: 8 }}>
                Register
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Layout>
        <Sider width={200} collapsible theme="light" style={{ /*backgroundColor: colorBgContainer*/ }}>
          {/* Placeholder for Sider content, e.g., contextual navigation or sub-menu */}
          <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
            Contextual Nav
          </div>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: '16px 0',
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
