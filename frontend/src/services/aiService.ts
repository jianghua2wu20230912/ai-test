import api from './api'; // Configured Axios instance
import { AIRequirementAnalysisRequest, AITestCaseGenerationRequest } from '../types/aiGeneration';
import { TestPoint, TestCase } from '../types/testManagement'; // For response types

export const aiService = {
  generateTestPointsFromText: async (data: AIRequirementAnalysisRequest): Promise<TestPoint[]> => {
    const response = await api.post<TestPoint[]>('/ai/generate-test-points-from-text', data);
    // The backend mock endpoint should return a list of objects matching the TestPoint structure.
    // These will have dummy IDs (e.g., -1, -2) as they are not persisted yet.
    return response.data;
  },

  generateTestCasesFromTestPoint: async (data: AITestCaseGenerationRequest): Promise<TestCase[]> => {
    const response = await api.post<TestCase[]>('/ai/generate-test-cases-from-test-point', data);
    // Similar to test points, these will be mock TestCases with dummy IDs.
    return response.data;
  },
};
