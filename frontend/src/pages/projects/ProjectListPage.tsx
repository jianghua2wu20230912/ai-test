import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Typography,
  Space,
  Popconfirm,
  message,
  Spin,
  Alert,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { projectService } from '../../services/projectService';
import { Project, ProjectCreate, ProjectUpdate } from '../../types/project';
import ProjectForm from '../../components/projects/ProjectForm'; // Import the form
import { useAppSelector } from '../../store/hooks'; // To get current user for owner display comparison
import dayjs from 'dayjs'; // For date formatting

const { Title } = Typography;

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const currentUser = useAppSelector((state) => state.auth.user);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || 'Failed to fetch projects');
      message.error(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalVisible(true);
  };

  const handleDelete = async (projectId: number) => {
    setLoading(true); // Indicate loading state for the table/page
    try {
      await projectService.deleteProject(projectId);
      message.success('Project deleted successfully');
      fetchProjects(); // Refresh list
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      message.error(err.message || 'Failed to delete project');
      setLoading(false); // Reset loading only on error, fetchProjects will reset it on success
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
  };

  const handleModalFinish = async (values: ProjectCreate | ProjectUpdate) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingProject && editingProject.id) {
        await projectService.updateProject(editingProject.id, values as ProjectUpdate);
        message.success('Project updated successfully');
      } else {
        await projectService.createProject(values as ProjectCreate);
        message.success('Project created successfully');
      }
      setIsModalVisible(false);
      setEditingProject(null);
      fetchProjects(); // Refresh list
    } catch (err: any) {
      console.error('Failed to save project:', err);
      let errorMessage = 'Failed to save project.';
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage); // Display error within the modal or page
      message.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Project, b: Project) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <Tooltip title={text}>{text || '-'}</Tooltip>
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: Project['owner']) => (
        <Tag icon={<UserOutlined />} color={owner?.id === currentUser?.id ? "blue" : "default"}>
          {owner?.email || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a: Project, b: Project) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={loading} size="small">
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={loading}
          >
            <Button icon={<DeleteOutlined />} danger disabled={loading} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && projects.length === 0) { // Initial full page load
    return <Row justify="center" align="middle" style={{ minHeight: '200px' }}><Spin size="large" /></Row>;
  }

  return (
    <div>
      <Title level={2}>Project Management</Title>
      {error && !loading && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
        disabled={loading}
      >
        Create Project
      </Button>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        loading={loading}
        bordered
      />
      <ProjectForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
        initialValues={editingProject}
        loading={formLoading}
      />
    </div>
  );
};

export default ProjectListPage;
