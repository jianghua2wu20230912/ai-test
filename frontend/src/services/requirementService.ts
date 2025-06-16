import api from './api'; // Configured Axios instance
import {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementVersion,
  RequirementVersionCreate,
  RequirementVersionUpdate,
} from '../types/requirement';

export const requirementService = {
  // Requirement CRUD
  getRequirements: async (params: { project_id?: number }): Promise<Requirement[]> => {
    const response = await api.get<Requirement[]>('/requirements/', { params });
    return response.data;
  },

  getRequirementById: async (requirementId: number): Promise<Requirement> => {
    const response = await api.get<Requirement>(`/requirements/${requirementId}`);
    return response.data;
  },

  createRequirement: async (data: RequirementCreate): Promise<Requirement> => {
    const response = await api.post<Requirement>('/requirements/', data);
    return response.data;
  },

  updateRequirement: async (requirementId: number, data: RequirementUpdate): Promise<Requirement> => {
    const response = await api.put<Requirement>(`/requirements/${requirementId}`, data);
    return response.data;
  },

  deleteRequirement: async (requirementId: number): Promise<void> => {
    await api.delete(`/requirements/${requirementId}`);
  },

  // Requirement Version CRUD
  getRequirementVersions: async (requirementId: number): Promise<RequirementVersion[]> => {
    const response = await api.get<RequirementVersion[]>(`/requirements/${requirementId}/versions/`);
    return response.data;
  },

  createRequirementVersion: async (requirementId: number, data: RequirementVersionCreate): Promise<RequirementVersion> => {
    // The `requirement_id` is often part of the `data` payload for RequirementVersionCreate as per Pydantic schema,
    // even if it's also in the URL. Ensure backend handles this (e.g., validates they match or prefers one).
    // Our schema `RequirementVersionCreate` includes `requirement_id`.
    if (data.requirement_id !== requirementId) {
        console.warn("Path requirementId and payload requirement_id mismatch. Using path ID for endpoint.");
        // Or throw an error, or align data.requirement_id = requirementId;
        // For now, let backend handle validation.
    }
    const response = await api.post<RequirementVersion>(`/requirements/${requirementId}/versions/`, data);
    return response.data;
  },

  updateRequirementVersion: async (requirementId: number, versionId: number, data: RequirementVersionUpdate): Promise<RequirementVersion> => {
    const response = await api.put<RequirementVersion>(`/requirements/${requirementId}/versions/${versionId}`, data);
    return response.data;
  },

  deleteRequirementVersion: async (requirementId: number, versionId: number): Promise<void> => {
    await api.delete(`/requirements/${requirementId}/versions/${versionId}`);
  },
};
