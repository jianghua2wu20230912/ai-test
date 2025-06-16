import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Select,
  Typography,
  Space,
  Popconfirm,
  message,
  Spin,
  Alert,
  Row,
  Col,
  Collapse,
  Tooltip,
  Tag,
  Modal, // Added Modal for AI
  Form,  // Added Form for AI
  Input  // Added Input for AI
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, DatabaseOutlined, RobotOutlined } from '@ant-design/icons'; // Added RobotOutlined
import { projectService } from '../../services/projectService';
import { requirementService } from '../../services/requirementService';
import { aiService } from '../../services/aiService'; // Import AI Service
import { Project } from '../../types/project';
import { Requirement, RequirementCreate, RequirementUpdate, RequirementVersion, RequirementVersionCreate, RequirementVersionUpdate } from '../../types/requirement';
import RequirementForm from '../../components/requirements/RequirementForm';
import RequirementVersionForm from '../../components/requirements/RequirementVersionForm';
import { TestPoint } from '../../types/testManagement'; // For AI TP suggestions
import dayjs from 'dayjs';

const { Title, Text } = Typography;
// const { Panel } = Collapse; // Not used

const RequirementListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [requirementVersions, setRequirementVersions] = useState<Record<number, RequirementVersion[]>>({}); // Store versions per requirement ID

  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [loadingRequirements, setLoadingRequirements] = useState<boolean>(false);
  const [loadingVersions, setLoadingVersions] = useState<Record<number, boolean>>({}); // Loading state per requirement for its versions

  const [error, setError] = useState<string | null>(null);

  const [isReqModalVisible, setIsReqModalVisible] = useState<boolean>(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [reqFormLoading, setReqFormLoading] = useState<boolean>(false);

  const [isVersionModalVisible, setIsVersionModalVisible] = useState<boolean>(false);
  const [editingVersion, setEditingVersion] = useState<RequirementVersion | null>(null);
  const [currentRequirementForVersion, setCurrentRequirementForVersion] = useState<Requirement | null>(null);
  const [versionFormLoading, setVersionFormLoading] = useState<boolean>(false);

  // AI - Generate Test Points from Text states
  const [isAITPModalVisible, setIsAITPModalVisible] = useState<boolean>(false);
  const [aiTPRequirementText, setAiTPRequirementText] = useState<string>('');
  const [aiTPSuggestions, setAiTPSuggestions] = useState<TestPoint[]>([]);
  const [aiTPLoading, setAiTPLoading] = useState<boolean>(false);
  const [selectedReqForAITP, setSelectedReqForAITP] = useState<Requirement | null>(null);


  // Fetch projects
  useEffect(() => {
    const fetchProjectsList = async () => {
      setLoadingProjects(true);
      try {
        const data = await projectService.getProjects({ limit: 1000 }); // Fetch all projects for dropdown
        setProjects(data);
      } catch (err) {
        message.error('Failed to fetch projects');
        setError('Could not load projects. Please try again.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjectsList();
  }, []);

  // Fetch requirements when selectedProjectId changes
  const fetchRequirements = useCallback(async () => {
    if (!selectedProjectId) {
      setRequirements([]);
      return;
    }
    setLoadingRequirements(true);
    setError(null);
    try {
      const data = await requirementService.getRequirements({ project_id: selectedProjectId });
      setRequirements(data);
      setRequirementVersions({}); // Clear old versions when project or requirements list changes
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch requirements');
      setError('Could not load requirements for the selected project.');
    } finally {
      setLoadingRequirements(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchRequirements();
    } else {
      setRequirements([]); // Clear requirements if no project is selected
      setRequirementVersions({});
    }
  }, [selectedProjectId, fetchRequirements]);

  // Fetch versions for a specific requirement
  const fetchVersionsForRequirement = async (requirementId: number) => {
    setLoadingVersions(prev => ({ ...prev, [requirementId]: true }));
    try {
      const versionsData = await requirementService.getRequirementVersions(requirementId);
      setRequirementVersions(prev => ({ ...prev, [requirementId]: versionsData }));
    } catch (err: any) {
      message.error(`Failed to fetch versions for requirement ${requirementId}: ${err.message}`);
    } finally {
      setLoadingVersions(prev => ({ ...prev, [requirementId]: false }));
    }
  };

  // Requirement Modal Handlers
  const handleCreateRequirement = () => {
    if (!selectedProjectId) {
      message.error("Please select a project first.");
      return;
    }
    setEditingRequirement(null);
    setIsReqModalVisible(true);
  };

  const handleEditRequirement = (req: Requirement) => {
    setEditingRequirement(req);
    setIsReqModalVisible(true);
  };

  const handleDeleteRequirement = async (reqId: number) => {
    setLoadingRequirements(true); // Or a specific deleting state
    try {
      await requirementService.deleteRequirement(reqId);
      message.success('Requirement deleted successfully');
      fetchRequirements();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete requirement');
    } finally {
        setLoadingRequirements(false);
    }
  };

  const handleReqModalCancel = () => {
    setIsReqModalVisible(false);
    setEditingRequirement(null);
  };

  const handleReqModalFinish = async (values: RequirementCreate | RequirementUpdate) => {
    if (!selectedProjectId && !editingRequirement) {
      message.error("Project ID is missing.");
      return;
    }
    setReqFormLoading(true);
    try {
      if (editingRequirement) {
        await requirementService.updateRequirement(editingRequirement.id, values as RequirementUpdate);
        message.success('Requirement updated successfully');
      } else {
        await requirementService.createRequirement(values as RequirementCreate); // RequirementForm passes project_id
        message.success('Requirement created successfully');
      }
      setIsReqModalVisible(false);
      setEditingRequirement(null);
      fetchRequirements();
    } catch (err: any) {
      message.error(err.message || 'Failed to save requirement');
    } finally {
      setReqFormLoading(false);
    }
  };

  // Requirement Version Modal Handlers
  const handleAddVersion = (req: Requirement) => {
    setCurrentRequirementForVersion(req);
    setEditingVersion(null);
    setIsVersionModalVisible(true);
  };

  const handleEditVersion = (version: RequirementVersion, parentReq: Requirement) => {
    setCurrentRequirementForVersion(parentReq);
    setEditingVersion(version);
    setIsVersionModalVisible(true);
  };

  const handleDeleteVersion = async (reqId: number, versionId: number) => {
    setLoadingVersions(prev => ({ ...prev, [reqId]: true }));
    try {
      await requirementService.deleteRequirementVersion(reqId, versionId);
      message.success('Version deleted successfully');
      fetchVersionsForRequirement(reqId);
    } catch (err: any) {
      message.error(err.message || 'Failed to delete version');
    } finally {
      setLoadingVersions(prev => ({ ...prev, [reqId]: false }));
    }
  };

  const handleVersionModalCancel = () => {
    setIsVersionModalVisible(false);
    setEditingVersion(null);
    setCurrentRequirementForVersion(null);
  };

  const handleVersionModalFinish = async (values: RequirementVersionCreate | RequirementVersionUpdate) => {
    if (!currentRequirementForVersion) return;

    setVersionFormLoading(true);
    const reqId = currentRequirementForVersion.id;
    try {
      if (editingVersion) {
        await requirementService.updateRequirementVersion(reqId, editingVersion.id, values as RequirementVersionUpdate);
        message.success('Version updated successfully');
      } else {
        // RequirementVersionForm passes requirement_id
        await requirementService.createRequirementVersion(reqId, values as RequirementVersionCreate);
        message.success('Version created successfully');
      }
      setIsVersionModalVisible(false);
      setEditingVersion(null);
      setCurrentRequirementForVersion(null);
      fetchVersionsForRequirement(reqId);
    } catch (err: any) {
      message.error(err.message || 'Failed to save version');
    } finally {
      setVersionFormLoading(false);
    }
  };

  // --- AI: Generate Test Points from Text Handlers ---
  const handleOpenAITPModal = (req?: Requirement) => {
    setSelectedReqForAITP(req || null); // If called for specific req, pre-fill or use its context
    setAiTPRequirementText(req?.title || ''); // Pre-fill with requirement title if available
    setIsAITPModalVisible(true);
    setAiTPSuggestions([]); // Clear previous suggestions
  };

  const handleAITPGeneration = async () => {
    if (!aiTPRequirementText.trim()) {
      message.warn("Please enter some requirement text to analyze.");
      return;
    }
    setAiTPLoading(true);
    setAiTPSuggestions([]);
    try {
      const requestData: AIRequirementAnalysisRequest = {
        requirement_text: aiTPRequirementText,
        project_id: selectedProjectId, // Pass project context
        requirement_id: selectedReqForAITP?.id, // Pass requirement context if available
      };
      const suggestions = await aiService.generateTestPointsFromText(requestData);
      setAiTPSuggestions(suggestions);
      if (suggestions.length === 0) {
        message.info("AI couldn't generate any test point suggestions from the provided text.");
      }
    } catch (err: any) {
      message.error(err.message || "Failed to generate AI test point suggestions.");
    } finally {
      setAiTPLoading(false);
    }
  };

  const handleAcceptAITPSuggestion = (suggestion: TestPoint) => {
    console.log("Accepted AI TP Suggestion:", suggestion);
    message.success(`Suggestion "${suggestion.name}" accepted (logged to console).`);
    // Future: Pre-fill TestPointForm and open it. This requires a RequirementVersion to be selected/known.
    // This AI feature is generic for text; linking to specific RV would be next step.
  };


  const requirementColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true, render: (text:string) => <Tooltip title={text}><FileTextOutlined style={{marginRight: 8}} />{text}</Tooltip> },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', render: (text: string) => dayjs(text).format('YYYY-MM-DD'), sorter: (a: Requirement, b: Requirement) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix() },
    {
      title: 'Actions', key: 'actions', width: 360, // Increased width for new button
      render: (_: any, record: Requirement) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => { /* Handled by onExpand */ }} size="small" title="Expand to see/load versions">
            Versions
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => handleAddVersion(record)} size="small" title="Add New Version">Add Version</Button>
          <Tooltip title="AI Generate Test Points from this Requirement's text">
             <Button icon={<RobotOutlined />} onClick={() => handleOpenAITPModal(record)} size="small" />
          </Tooltip>
          <Button icon={<EditOutlined />} onClick={() => handleEditRequirement(record)} size="small" title="Edit Requirement">Edit</Button>
          <Popconfirm title="Delete this requirement and all its versions?" onConfirm={() => handleDeleteRequirement(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} danger size="small" title="Delete Requirement">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const versionColumns = (parentReq: Requirement) => [
    { title: 'Version', dataIndex: 'version_string', key: 'version_string', render: (text:string) => <Tag color="cyan">{text}</Tag>},
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (text: string) => <Tooltip title={text}>{text || '-'}</Tooltip> },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'), sorter: (a: RequirementVersion, b: RequirementVersion) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix() },
    { title: 'File', dataIndex: 'file_path', key: 'file_path', render: (text:string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">{text.split('/').pop()}</a> : '-' },
    {
      title: 'Actions', key: 'actions', width: 180,
      render: (_: any, record: RequirementVersion) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => handleEditVersion(record, parentReq)} size="small">Edit</Button>
          <Popconfirm title="Delete this version?" onConfirm={() => handleDeleteVersion(parentReq.id, record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Requirement Management</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            style={{ width: 300 }}
            placeholder="Select a Project to Manage Requirements"
            onChange={(value) => setSelectedProjectId(value)}
            loading={loadingProjects}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            value={selectedProjectId}
            allowClear
          >
            {projects.map(p => <Select.Option key={p.id} value={p.id} label={p.name}>{p.name}</Select.Option>)}
          </Select>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateRequirement}
            disabled={!selectedProjectId || loadingRequirements}
          >
            Create Req.
          </Button>
        </Col>
        <Col>
          <Button
            icon={<RobotOutlined />}
            onClick={() => handleOpenAITPModal()}
            disabled={!selectedProjectId} // Enable if a project is selected, text can be generic
            title="AI Generate Test Points from Custom Text"
          >
            AI Gen TP from Text
          </Button>
        </Col>
      </Row>

      {error && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}

      {selectedProjectId ? (
        <Spin spinning={loadingRequirements}>
          <Table
            columns={requirementColumns}
            dataSource={requirements}
            rowKey="id"
            bordered
            size="middle" // Changed to middle for better readability
            expandable={{
              expandedRowRender: record => (
                <div style={{padding: '10px', margin: '0', backgroundColor: '#fafafa'}}>
                  <Text strong>Versions for: {record.title}</Text>
                  {loadingVersions[record.id] && <Row justify="center" style={{padding: '20px'}}><Spin tip="Loading versions..."/></Row>}
                  {!loadingVersions[record.id] && (!requirementVersions[record.id] || requirementVersions[record.id].length === 0) && <p style={{marginTop: 8}}>No versions found. Click "Add Version" to create one.</p>}
                  {!loadingVersions[record.id] && requirementVersions[record.id] && requirementVersions[record.id].length > 0 &&
                    <Table
                      columns={versionColumns(record)}
                      dataSource={requirementVersions[record.id]}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 5, hideOnSinglePage: true }}
                      style={{marginTop: 8}}
                    />
                  }
                </div>
              ),
              onExpand: (expanded, record) => {
                if (expanded && !requirementVersions[record.id] && !(loadingVersions[record.id] === true) ) { // Check loading state before fetching
                  fetchVersionsForRequirement(record.id);
                }
              }
            }}
            title={() => <Space><DatabaseOutlined /> <Text strong>Requirements for Project: {projects.find(p=>p.id === selectedProjectId)?.name || 'N/A'}</Text></Space>}
          />
        </Spin>
      ) : (
        <Alert message="Please select a project to view its requirements." type="info" showIcon />
      )}

      <RequirementForm
        visible={isReqModalVisible}
        onCancel={handleReqModalCancel}
        onFinish={handleReqModalFinish}
        initialValues={editingRequirement}
        loading={reqFormLoading}
        projectId={selectedProjectId}
      />

      {currentRequirementForVersion && (
        <RequirementVersionForm
          visible={isVersionModalVisible}
          onCancel={handleVersionModalCancel}
          onFinish={handleVersionModalFinish}
          initialValues={editingVersion}
          loading={versionFormLoading}
          requirementId={currentRequirementForVersion.id}
        />
      )}

      {/* AI Test Point Suggestions Modal */}
      <Modal
        title={<Space><RobotOutlined /> AI Generate Test Points from Text</Space>}
        open={isAITPModalVisible}
        onCancel={() => setIsAITPModalVisible(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setIsAITPModalVisible(false)}>Close</Button>,
          <Button key="generate" type="primary" loading={aiTPLoading} onClick={handleAITPGeneration}>Generate</Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Requirement Text to Analyze (or general context):">
            <Input.TextArea
              rows={6}
              value={aiTPRequirementText}
              onChange={e => setAiTPRequirementText(e.target.value)}
              placeholder="Paste requirement text here, or describe the context for which you want test points."
            />
          </Form.Item>
        </Form>
        {aiTPLoading && <Row justify="center" style={{marginTop: 16}}><Spin tip="AI is analyzing..." /></Row>}
        {aiTPSuggestions.length > 0 && !aiTPLoading && (
          <>
            <Text strong style={{marginTop: 16, display: 'block'}}>Generated Suggestions:</Text>
            <Table
              dataSource={aiTPSuggestions}
              rowKey="id" // Mock IDs
              size="small"
              style={{marginTop: 8}}
              columns={[
                { title: 'Suggested Name', dataIndex: 'name', key: 'name', width: '40%' },
                { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (txt:string)=><Tooltip title={txt}>{txt}</Tooltip>},
                { title: 'Action', key: 'action', width: '15%', render: (_, record: TestPoint) =>
                    <Button type="link" size="small" onClick={() => handleAcceptAITPSuggestion(record)}>Use this</Button>
                },
              ]}
              pagination={{pageSize: 3}}
            />
          </>
        )}
        {!aiTPLoading && aiTPSuggestions.length === 0 && aiTPRequirementText && <Alert message="No suggestions generated yet, or an error occurred. Try adjusting the text." type="info" style={{marginTop:16}}/>}
      </Modal>
    </div>
  );
};

export default RequirementListPage;
