// Based on backend/app/schemas/test_case.py and related schemas
// Assuming ProjectUser is already defined (e.g., in project.ts or a common types file)
// If not, define or import it:
// export interface ProjectUser { id: string; email: string; }

import { ProjectUser } from './project'; // Assuming ProjectUser is exported from here

// TestPoint types
export interface TestPoint {
  id: number; // Integer ID from backend
  name: string;
  description?: string | null;
  requirement_version_id: number; // Foreign key to RequirementVersion
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  created_by_id?: string | null; // UUID from User model
  creator?: ProjectUser | null; // Populated by backend
  // test_cases?: TestCase[]; // Usually populated on demand
}

export interface TestPointCreate {
  name: string;
  description?: string | null;
  requirement_version_id: number;
  // created_by_id will be set by backend from current_user
}

export interface TestPointUpdate {
  name?: string;
  description?: string | null;
  // requirement_version_id is typically not updatable for a TestPoint
}

// TestCase types
export interface TestCase {
  id: number; // Integer ID from backend
  title: string;
  test_point_id: number; // Foreign key to TestPoint
  steps?: string | null;
  expected_result?: string | null;
  status: string; // e.g., 'new', 'passed', 'failed' - consider an enum/union type
  priority: string; // e.g., 'low', 'medium', 'high' - consider an enum/union type
  type?: string | null; // e.g., 'positive', 'negative' - consider an enum/union type
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  created_by_id?: string | null; // UUID from User model
  reviewed_by_id?: string | null; // UUID from User model
  creator?: ProjectUser | null; // Populated by backend
  reviewer?: ProjectUser | null; // Populated by backend
}

export interface TestCaseCreate {
  title: string;
  test_point_id: number;
  steps?: string | null;
  expected_result?: string | null;
  status?: string; // Defaults can be set in form or backend
  priority?: string;
  type?: string | null;
  // created_by_id will be set by backend
}

export interface TestCaseUpdate {
  title?: string;
  steps?: string | null;
  expected_result?: string | null;
  status?: string;
  priority?: string;
  type?: string | null;
  reviewed_by_id?: string | null; // For assigning a reviewer
}

// Consider creating shared enum/union types for status, priority, type if they are well-defined
export const TestCaseStatus = ['new', 'under_review', 'approved', 'failed', 'passed', 'skipped', 'obsolete'] as const;
export type TestCaseStatusType = typeof TestCaseStatus[number];

export const TestCasePriority = ['low', 'medium', 'high', 'critical'] as const;
export type TestCasePriorityType = typeof TestCasePriority[number];

export const TestCaseType = ['positive', 'negative', 'destructive', 'usability', 'performance', 'security', 'other'] as const;
export type TestCaseTypeType = typeof TestCaseType[number];
