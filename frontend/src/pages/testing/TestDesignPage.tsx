import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Select, Typography, Space, Popconfirm, message, Spin, Alert, Row, Col, Tooltip, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExperimentOutlined, FileDoneOutlined, RobotOutlined, QuestionCircleOutlined, MessageOutlined } from '@ant-design/icons'; // Added MessageOutlined
import { projectService } from '../../services/projectService';
import { requirementService } from '../../services/requirementService';
import { testManagementService } from '../../services/testManagementService';
import { aiService } from '../../services/aiService'; // Import AI Service
import { Project } from '../../types/project';
import { Requirement, RequirementVersion } from '../../types/requirement';
import { TestPoint, TestPointCreate, TestPointUpdate, TestCase, TestCaseCreate, TestCaseUpdate } from '../../types/testManagement';
import TestPointForm from '../../components/testing/TestPointForm';
import TestCaseForm from '../../components/testing/TestCaseForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const TestDesignPage: React.FC = () => {
  // Selection States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [versions, setVersions] = useState<RequirementVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  // Data States
  const [testPoints, setTestPoints] = useState<TestPoint[]>([]);
  const [testCases, setTestCases] = useState<Record<number, TestCase[]>>({}); // TC_array per TP_id

  // Loading States
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingTestPoints, setLoadingTestPoints] = useState(false);
  const [loadingTestCases, setLoadingTestCases] = useState<Record<number, boolean>>({});

  // Modal & Form States
  const [isTPModalVisible, setIsTPModalVisible] = useState(false);
  const [editingTP, setEditingTP] = useState<TestPoint | null>(null);
  const [tpFormLoading, setTpFormLoading] = useState(false);

  const [isTCModalVisible, setIsTCModalVisible] = useState(false);
  const [editingTC, setEditingTC] = useState<TestCase | null>(null);
  const [currentTPForTC, setCurrentTPForTC] = useState<TestPoint | null>(null);
  const [tcFormLoading, setTcFormLoading] = useState(false);

  const [isAITCModalVisible, setIsAITCModalVisible] = useState(false);
  const [aiTCSuggestions, setAiTCSuggestions] = useState<TestCase[]>([]);
  const [aiTCLoading, setAiTCLoading] = useState(false);
  const [currentTPForAITC, setCurrentTPForAITC] = useState<TestPoint | null>(null);

  const [pageError, setPageError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => { // Fetch Projects
    setLoadingProjects(true);
    projectService.getProjects({ limit: 1000 }).then(setProjects).catch(err => {
      message.error("Failed to load projects");
      setPageError("Could not load projects.");
    }).finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => { // Fetch Requirements on Project Change
    if (!selectedProjectId) { setRequirements([]); setSelectedRequirementId(null); return; }
    setLoadingRequirements(true); setTestPoints([]); setSelectedVersionId(null); setVersions([]);
    requirementService.getRequirements({ project_id: selectedProjectId }).then(setRequirements)
      .catch(err => message.error("Failed to load requirements for project"))
      .finally(() => setLoadingRequirements(false));
  }, [selectedProjectId]);

  useEffect(() => { // Fetch Versions on Requirement Change
    if (!selectedRequirementId) { setVersions([]); setSelectedVersionId(null); return; }
    setLoadingVersions(true); setTestPoints([]);
    requirementService.getRequirementVersions(selectedRequirementId).then(setVersions)
      .catch(err => message.error("Failed to load versions for requirement"))
      .finally(() => setLoadingVersions(false));
  }, [selectedRequirementId]);

  const fetchTestPoints = useCallback(async () => {
    if (!selectedVersionId) { setTestPoints([]); return; }
    setLoadingTestPoints(true);
    try {
      const data = await testManagementService.getTestPoints({ requirement_version_id: selectedVersionId });
      setTestPoints(data);
      setTestCases({}); // Clear old test cases
    } catch (err) { message.error("Failed to load test points"); }
    finally { setLoadingTestPoints(false); }
  }, [selectedVersionId]);

  useEffect(() => { fetchTestPoints(); }, [fetchTestPoints]);

  const fetchTestCasesForTP = async (tpId: number) => {
    setLoadingTestCases(prev => ({ ...prev, [tpId]: true }));
    try {
      const data = await testManagementService.getTestCases({ test_point_id: tpId });
      setTestCases(prev => ({ ...prev, [tpId]: data }));
    } catch (err) { message.error(`Failed to load test cases for TP ${tpId}`); }
    finally { setLoadingTestCases(prev => ({ ...prev, [tpId]: false })); }
  };

  // --- UI Handlers (Test Point) ---
  const handleCreateTP = () => { if (!selectedVersionId) { message.warn("Select a Requirement Version first."); return; } setEditingTP(null); setIsTPModalVisible(true); };
  const handleEditTP = (tp: TestPoint) => { setEditingTP(tp); setIsTPModalVisible(true); };
  const handleDeleteTP = async (tpId: number) => {
    setLoadingTestPoints(true);
    try { await testManagementService.deleteTestPoint(tpId); message.success("Test Point deleted"); fetchTestPoints(); }
    catch (err) { message.error("Failed to delete Test Point"); setLoadingTestPoints(false); }
  };
  const handleTPModalFinish = async (values: TestPointCreate | TestPointUpdate) => {
    if (!selectedVersionId && !editingTP) { message.error("Requirement Version ID missing."); return; }
    setTpFormLoading(true);
    try {
      if (editingTP) {
        await testManagementService.updateTestPoint(editingTP.id, values as TestPointUpdate);
        message.success("Test Point updated");
      } else {
        await testManagementService.createTestPoint(values as TestPointCreate); // Form passes req_ver_id
        message.success("Test Point created");
      }
      setIsTPModalVisible(false); fetchTestPoints();
    } catch (err) { message.error("Failed to save Test Point"); }
    finally { setTpFormLoading(false); }
  };

  // --- UI Handlers (Test Case) ---
  const handleCreateTC = (tp: TestPoint) => { setCurrentTPForTC(tp); setEditingTC(null); setIsTCModalVisible(true); };
  const handleEditTC = (tc: TestCase, parentTP: TestPoint) => { setCurrentTPForTC(parentTP); setEditingTC(tc); setIsTCModalVisible(true); };
  const handleDeleteTC = async (tcId: number, tpId: number) => {
    setLoadingTestCases(prev => ({ ...prev, [tpId]: true }));
    try { await testManagementService.deleteTestCase(tcId); message.success("Test Case deleted"); fetchTestCasesForTP(tpId); }
    catch (err) { message.error("Failed to delete Test Case"); setLoadingTestCases(prev => ({ ...prev, [tpId]: false }));}
  };
  const handleTCModalFinish = async (values: TestCaseCreate | TestCaseUpdate) => {
    if (!currentTPForTC) return;
    setTcFormLoading(true);
    const tpId = currentTPForTC.id;
    try {
      if (editingTC) {
        await testManagementService.updateTestCase(editingTC.id, values as TestCaseUpdate);
        message.success("Test Case updated");
      } else {
        await testManagementService.createTestCase(values as TestCaseCreate); // Form passes tp_id
        message.success("Test Case created");
      }
      setIsTCModalVisible(false); fetchTestCasesForTP(tpId);
    } catch (err) { message.error("Failed to save Test Case"); }
    finally { setTcFormLoading(false); }
  };
  const handleAIGenerateCases = async (tp: TestPoint) => {
    setCurrentTPForAITC(tp);
    setIsAITCModalVisible(true);
    setAiTCLoading(true);
    setAiTCSuggestions([]); // Clear previous suggestions
    try {
      const suggestions = await aiService.generateTestCasesFromTestPoint({ test_point_id: tp.id, num_suggestions: 5 });
      setAiTCSuggestions(suggestions);
      if (suggestions.length === 0) {
        message.info("AI couldn't generate any suggestions for this test point.");
      }
    } catch (err: any) {
      message.error(err.message || "Failed to generate AI test case suggestions.");
    } finally {
      setAiTCLoading(false);
    }
  };

  const handleAcceptAITCSuggestion = (suggestion: TestCase) => {
    // For now, just log it. Later, this could open the TestCaseForm pre-filled with suggestion.
    console.log("Accepted AI Suggestion:", suggestion);
    message.success(`Suggestion "${suggestion.title}" accepted (logged to console).`);
    // To actually use it:
    // setCurrentTPForTC(currentTPForAITC); // Ensure parent TP is set
    // setEditingTC(suggestion); // This would need a TestCase type, not TestCaseCreate.
    // setIsTCModalVisible(true);
    // setIsAITCModalVisible(false); // Close AI modal
  };


  // --- Column Definitions ---
  const tpColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '25%', render: (txt:string) => <><ExperimentOutlined style={{marginRight:8}}/>{txt}</> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, width: '35%' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', width: '15%', render: (t:string) => dayjs(t).format('YYYY-MM-DD')},
    { title: 'Actions', key: 'actions', width: '25%', render: (_:any, r:TestPoint) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => { /* Handled by onExpand */ }} size="small">Cases</Button>
          <Button icon={<PlusOutlined />} onClick={() => handleCreateTC(r)} size="small">Add TC</Button>
          <Tooltip title="AI Generate Test Cases (Coming Soon!)">
            <Button icon={<RobotOutlined />} onClick={() => handleAIGenerateCases(r)} size="small" />
          </Tooltip>
          <Button icon={<EditOutlined />} onClick={() => handleEditTP(r)} size="small" />
          <Popconfirm title="Delete this Test Point?" onConfirm={() => handleDeleteTP(r.id)}><Button danger icon={<DeleteOutlined />} size="small" /></Popconfirm>
        </Space>
      )},
  ];
  const tcColumns = (tp: TestPoint) => [
    { title: 'Title', dataIndex: 'title', key: 'title', width: '30%', render:(txt:string)=><><FileDoneOutlined style={{marginRight:8}}/>{txt}</>},
    { title: 'Priority', dataIndex: 'priority', key: 'priority', width: '10%', render: (p:string) => <Tag color={p==='high'?'red':p==='medium'?'orange':'green'}>{p?.toUpperCase()}</Tag>},
    { title: 'Status', dataIndex: 'status', key: 'status', width: '15%', render: (s:string) => <Tag>{s?.replace('_',' ').toUpperCase()}</Tag>},
    { title: 'Type', dataIndex: 'type', key: 'type', width: '10%', render: (t:string) => t && <Tag>{t.toUpperCase()}</Tag>},
    { title: 'Actions', key: 'actions', width: '15%', render: (_:any, r:TestCase) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => handleEditTC(r, tp)} size="small" />
          <Popconfirm title="Delete this Test Case?" onConfirm={() => handleDeleteTC(r.id, tp.id)}><Button danger icon={<DeleteOutlined />} size="small" /></Popconfirm>
        </Space>
      )},
  ];

  // --- Render ---
  return (
    <div>
      <Title level={2}>Test Design and Management</Title>
      {pageError && <Alert message={pageError} type="error" closable style={{ marginBottom: 16 }} />}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col><Select style={{ width: 200 }} placeholder="1. Select Project" onChange={v => {setSelectedProjectId(v); setSelectedRequirementId(null); setSelectedVersionId(null);}} loading={loadingProjects} value={selectedProjectId} allowClear>
          {projects.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select></Col>
        <Col><Select style={{ width: 250 }} placeholder="2. Select Requirement" onChange={v => {setSelectedRequirementId(v); setSelectedVersionId(null);}} loading={loadingRequirements} disabled={!selectedProjectId} value={selectedRequirementId} allowClear>
          {requirements.map(r => <Option key={r.id} value={r.id}>{r.title}</Option>)}</Select></Col>
        <Col><Select style={{ width: 200 }} placeholder="3. Select Version" onChange={setSelectedVersionId} loading={loadingVersions} disabled={!selectedRequirementId} value={selectedVersionId} allowClear>
          {versions.map(v => <Option key={v.id} value={v.id}>{v.version_string}</Option>)}</Select></Col>
      </Row>

      {selectedVersionId ? (
        <>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTP} style={{ marginBottom: 16 }} disabled={loadingTestPoints}>Create Test Point</Button>
          <Spin spinning={loadingTestPoints}>
            <Table columns={tpColumns} dataSource={testPoints} rowKey="id" size="middle" bordered
              expandable={{
                expandedRowRender: tp => (
                  <div style={{padding: '10px', margin: '0', backgroundColor: '#fafafa'}}>
                    <Text strong>Test Cases for: {tp.name}</Text>
                    {loadingTestCases[tp.id] && <Row justify="center" style={{padding:'20px'}}><Spin tip="Loading cases..."/></Row>}
                    {!loadingTestCases[tp.id] && (!testCases[tp.id] || testCases[tp.id].length === 0) && <p style={{marginTop:8}}>No test cases found. Click "Add TC" to create.</p>}
                    {!loadingTestCases[tp.id] && testCases[tp.id] && testCases[tp.id].length > 0 &&
                      <Table columns={tcColumns(tp)} dataSource={testCases[tp.id]} rowKey="id" size="small" pagination={{pageSize:5, hideOnSinglePage:true}} style={{marginTop:8}}/>
                    }
                  </div>
                ),
                onExpand: (expanded, record) => { if (expanded && !testCases[record.id] && !loadingTestCases[record.id]) fetchTestCasesForTP(record.id); }
              }}
              title={() => <Space><ExperimentOutlined /> <Text strong>Test Points for Version: {versions.find(v=>v.id===selectedVersionId)?.version_string || 'N/A'}</Text></Space>}
            />
          </Spin>
        </>
      ) : <Alert message="Please select a Project, Requirement, and Version to see and manage Test Points." type="info" showIcon />}

      <TestPointForm visible={isTPModalVisible} onCancel={() => setIsTPModalVisible(false)} onFinish={handleTPModalFinish} initialValues={editingTP} loading={tpFormLoading} requirementVersionId={selectedVersionId} />
      {currentTPForTC && <TestCaseForm visible={isTCModalVisible} onCancel={() => setIsTCModalVisible(false)} onFinish={handleTCModalFinish} initialValues={editingTC} loading={tcFormLoading} testPointId={currentTPForTC.id} />}

      {/* AI Test Case Suggestions Modal */}
      <Modal
        title={<Space><RobotOutlined /> AI Generated Test Case Suggestions for: <Text strong>{currentTPForAITC?.name}</Text></Space>}
        open={isAITCModalVisible}
        onCancel={() => setIsAITCModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsAITCModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {aiTCLoading ? (
          <Row justify="center" align="middle" style={{minHeight: 200}}><Spin tip="AI is thinking..." size="large"/></Row>
        ) : aiTCSuggestions.length > 0 ? (
          <Table
            dataSource={aiTCSuggestions}
            rowKey="id" // Mock IDs are negative, should be unique for the list
            size="small"
            columns={[
              { title: 'Suggested Title', dataIndex: 'title', key: 'title', width: '30%' },
              { title: 'Steps', dataIndex: 'steps', key: 'steps', ellipsis: true, render: (txt:string)=><Tooltip title={txt}>{txt}</Tooltip>},
              { title: 'Expected Result', dataIndex: 'expected_result', key: 'expected_result', ellipsis: true, render: (txt:string)=><Tooltip title={txt}>{txt}</Tooltip>},
              { title: 'Priority', dataIndex: 'priority', key: 'priority', width: '10%', render: (p:string) => <Tag color={p==='high'?'red':p==='medium'?'orange':'green'}>{p?.toUpperCase()}</Tag>},
              { title: 'Type', dataIndex: 'type', key: 'type', width: '10%', render: (t:string) => t && <Tag>{t.toUpperCase()}</Tag>},
              { title: 'Action', key: 'action', width: '10%', render: (_, record: TestCase) =>
                  <Button type="primary" size="small" onClick={() => handleAcceptAITCSuggestion(record)}>Use this</Button>
              },
            ]}
            pagination={{pageSize: 5}}
          />
        ) : (
          <Alert message="No suggestions generated or an error occurred." type="info" />
        )}
      </Modal>
    </div>
  );
};
export default TestDesignPage;
