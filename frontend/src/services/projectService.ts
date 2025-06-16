import api from './api'; // Configured Axios instance
import { Project, ProjectCreate, ProjectUpdate } from '../types/project';

export const projectService = {
  getProjects: async (params?: { skip?: number; limit?: number }): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects/', { params });
    return response.data;
  },

  getProjectById: async (projectId: number): Promise<Project> => { // Project ID is number
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData: ProjectCreate): Promise<Project> => {
    // owner_id is handled by the backend using the authenticated user's token
    const response = await api.post<Project>('/projects/', projectData);
    return response.data;
  },

  updateProject: async (projectId: number, projectData: ProjectUpdate): Promise<Project> => { // Project ID is number
    const response = await api.put<Project>(`/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId: number): Promise<void> => { // Project ID is number
    await api.delete(`/projects/${projectId}`);
    // Delete typically returns 204 No Content, so no response data to return
  },

  // New function to fetch the entire hierarchy for a project
  getProjectHierarchy: async (projectId: number): Promise<Project> => {
    // This function will fetch the project and its nested children.
    // For now, it just returns the project. The transformation logic
    // in the component will need to make subsequent calls or this function
    // needs to be expanded to fetch all data.
    // Let's assume for now the component will make subsequent calls based on this initial project data.
    // A more advanced backend might provide a single endpoint for the full hierarchy.

    // Fetch main project details
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error("Project not found");

    // Dynamically import other services to avoid circular dependencies if any
    const { requirementService } = await import('./requirementService');
    const { testManagementService } = await import('./testManagementService');

    // Fetch requirements for the project
    const requirements = await requirementService.getRequirements({ project_id: projectId });

    const projectWithHierarchy: Project & { requirements_tree?: any[] } = { ...project, requirements_tree: [] };

    for (const req of requirements) {
      const versions = await requirementService.getRequirementVersions(req.id);
      const reqWithVersions: any = { ...req, versions_tree: [] };

      for (const ver of versions) {
        const testPoints = await testManagementService.getTestPoints({ requirement_version_id: ver.id });
        const verWithTestPoints: any = { ...ver, test_points_tree: [] };

        for (const tp of testPoints) {
          const testCases = await testManagementService.getTestCases({ test_point_id: tp.id });
          verWithTestPoints.test_points_tree.push({ ...tp, test_cases_tree: testCases });
        }
        reqWithVersions.versions_tree.push(verWithTestPoints);
      }
      projectWithHierarchy.requirements_tree?.push(reqWithVersions);
    }

    return projectWithHierarchy as Project; // Cast as Project, though it has extra _tree fields
  },
};
