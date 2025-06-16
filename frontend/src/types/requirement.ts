// Based on backend/app/schemas/requirement.py

export interface RequirementVersion {
  id: number; // Integer ID from backend
  requirement_id: number; // Foreign key to Requirement
  version_string: string;
  description?: string | null;
  file_path?: string | null; // Assuming this might be added for file uploads later
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  // test_points?: TestPoint[]; // Example if you expand this type
}

export interface Requirement {
  id: number; // Integer ID from backend
  title: string;
  project_id: number; // Foreign key to Project
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  versions?: RequirementVersion[]; // Usually populated on demand or with specific requests
}

// For creating a new requirement
// Based on backend/app/schemas/requirement.py RequirementCreate
export interface RequirementCreate {
  title: string;
  project_id: number; // Must be provided when creating a requirement
}

// For updating an existing requirement
// Based on backend/app/schemas/requirement.py RequirementUpdate
export interface RequirementUpdate {
  title?: string;
  // project_id is typically not updatable for a requirement, or handled via specific logic
}

// For creating a new requirement version
// Based on backend/app/schemas/requirement.py RequirementVersionCreate
export interface RequirementVersionCreate {
  requirement_id: number; // This is part of the schema, but often also in URL path
  version_string: string;
  description?: string | null;
  file_path?: string | null;
}

// For updating an existing requirement version
// Based on backend/app/schemas/requirement.py RequirementVersionUpdate
export interface RequirementVersionUpdate {
  version_string?: string;
  description?: string | null;
  file_path?: string | null;
}
