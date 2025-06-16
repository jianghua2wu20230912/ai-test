// Based on backend/app/schemas/user.py User schema
// and backend/app/schemas/project.py Project schema

// A simplified User type for project context. Match backend User schema for fields you need.
export interface ProjectUser {
  id: string; // UUID from backend (User.id is UUID)
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  // other fields if needed by frontend
}

export interface Project {
  id: number; // Project.id is Integer (from IdMixin)
  name: string;
  description?: string | null;
  owner_id: string; // UUID (Project.owner_id is UUID)
  owner?: ProjectUser | null; // Populated by backend
  members?: ProjectUser[]; // Populated by backend
  created_at: string; // ISO date string (DateTime from backend)
  updated_at: string; // ISO date string (DateTime from backend)
  // requirements: Requirement[]; // Example if you expand this type
}

// Based on backend/app/schemas/project.py ProjectCreate schema
export interface ProjectCreate {
  name: string;
  description?: string | null;
  // owner_id is not part of ProjectCreate schema as it's set by backend from current_user
}

// Based on backend/app/schemas/project.py ProjectUpdate schema
export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  owner_id?: string; // UUID, if changing ownership is allowed
}
