// Define a generic user type or import from another type file if available
// For simplicity, using a basic User structure here if needed for 'data' field.
interface BasicUser {
  id: string;
  email: string;
}

// Base type for original data stored in tree nodes, if needed for context/actions
type OriginalData = any; // Can be Project, Requirement, RequirementVersion, TestPoint, TestCase

export interface AntTreeNode {
  title: React.ReactNode; // Can be string or a ReactNode for custom rendering (e.g. with icons)
  key: string;            // Unique key (e.g., "project-1", "req-5", "tp-10")
  children?: AntTreeNode[];
  isLeaf?: boolean;

  // Custom properties for styling, icons, or actions
  type?: 'project' | 'requirement' | 'requirement_version' | 'test_point' | 'test_case' | 'root'; // 'root' for a top-level wrapper if needed
  data?: OriginalData;   // Store the original object if needed for onSelect or other actions

  // Ant Design specific properties if needed, e.g., icon, checkable, selectable, disabled etc.
  icon?: React.ReactNode;
  disabled?: boolean;
  selectable?: boolean;
}
