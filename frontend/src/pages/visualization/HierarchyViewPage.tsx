import React, { useState, useEffect } from 'react';
import { Select, Tree, Spin, Alert, Typography, Space, Tooltip } from 'antd';
import {
  ProjectOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  DownOutlined, // For expand/collapse icon if customizing
} from '@ant-design/icons';
import { projectService } from '../../services/projectService';
import { Project as ProjectType } from '../../types/project'; // Renamed to avoid conflict
import { Requirement as RequirementType, RequirementVersion } from '../../types/requirement';
import { TestPoint as TestPointType, TestCase } from '../../types/testManagement';
import { AntTreeNode } from '../../types/visualization';

const { Title } = Typography;
const { Option } = Select;

const HierarchyViewPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<AntTreeNode[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingProjects(true);
    projectService.getProjects({ limit: 1000 })
      .then(data => setProjects(data))
      .catch(err => {
        setError('Failed to load projects.');
        message.error('Failed to load projects.');
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  const getNodeIcon = (type?: AntTreeNode['type']) => {
    switch (type) {
      case 'project': return <ProjectOutlined />;
      case 'requirement': return <FileTextOutlined />;
      case 'requirement_version': return <DatabaseOutlined />;
      case 'test_point': return <ExperimentOutlined />;
      case 'test_case': return <FileDoneOutlined />;
      default: return undefined;
    }
  };

  const transformToTreeData = (projectData: any): AntTreeNode[] => {
    if (!projectData) return [];
    const rootNode: AntTreeNode = {
      title: <Space>{getNodeIcon('project')} {projectData.name}</Space>,
      key: `project-${projectData.id}`,
      type: 'project',
      data: projectData,
      children: (projectData.requirements_tree || []).map((req: any) => ({
        title: <Space>{getNodeIcon('requirement')} {req.title}</Space>,
        key: `req-${req.id}`,
        type: 'requirement',
        data: req,
        children: (req.versions_tree || []).map((ver: any) => ({
          title: <Space>{getNodeIcon('requirement_version')} {ver.version_string}</Space>,
          key: `ver-${ver.id}`,
          type: 'requirement_version',
          data: ver,
          children: (ver.test_points_tree || []).map((tp: any) => ({
            title: <Space>{getNodeIcon('test_point')} {tp.name}</Space>,
            key: `tp-${tp.id}`,
            type: 'test_point',
            data: tp,
            children: (tp.test_cases_tree || []).map((tc: any) => ({
              title: <Space>{getNodeIcon('test_case')} {tc.title}</Space>,
              key: `tc-${tc.id}`,
              type: 'test_case',
              data: tc,
              isLeaf: true,
            })),
          })),
        })),
      })),
    };
    return [rootNode];
  };

  useEffect(() => {
    if (selectedProjectId) {
      setLoadingHierarchy(true);
      setError(null);
      setTreeData([]); // Clear previous tree
      projectService.getProjectHierarchy(selectedProjectId)
        .then(data => {
          setTreeData(transformToTreeData(data));
        })
        .catch(err => {
          setError(`Failed to load hierarchy for project ${selectedProjectId}.`);
          message.error(`Failed to load hierarchy: ${err.message}`);
        })
        .finally(() => setLoadingHierarchy(false));
    } else {
      setTreeData([]); // Clear tree if no project selected
    }
  }, [selectedProjectId]);

  return (
    <div>
      <Title level={2}>Project Hierarchy View</Title>
      <Select
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Select a Project to View Hierarchy"
        onChange={(value) => setSelectedProjectId(value)}
        loading={loadingProjects}
        showSearch
        optionFilterProp="children"
        value={selectedProjectId}
        allowClear
      >
        {projects.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
      </Select>

      {error && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}

      {loadingHierarchy && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Spin size="large" tip="Loading project hierarchy..." />
        </div>
      )}

      {!loadingHierarchy && selectedProjectId && treeData.length === 0 && !error && (
         <Alert message="No data to display for the selected project, or the project is empty." type="info" />
      )}

      {!loadingHierarchy && treeData.length > 0 && (
        <Tree
          showLine={{showLeafIcon: false}}
          treeData={treeData}
          defaultExpandAll={false} // Set to true if you want all nodes expanded initially
          // switcherIcon={<DownOutlined />} // Example for custom expand/collapse icon
          onSelect={(selectedKeys, info) => {
            console.log('Selected Tree Node:', selectedKeys, info.node.data); // Log original data
            // Future: Display details of the selected node in a side panel
          }}
          height={600} // Virtual scrolling enabled if height is set
          className="draggable-tree" // For potential future drag-n-drop styling
          blockNode // Makes the entire node width clickable
        />
      )}
       {!selectedProjectId && !loadingHierarchy && <Alert message="Please select a project to visualize its hierarchy." type="info" showIcon />}
    </div>
  );
};

export default HierarchyViewPage;

// Import message for error display
import { message } from 'antd';
