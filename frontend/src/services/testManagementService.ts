import api from './api'; // Configured Axios instance
import {
  TestPoint,
  TestPointCreate,
  TestPointUpdate,
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
} from '../types/testManagement';

export const testManagementService = {
  // Test Point CRUD
  getTestPoints: async (params: { requirement_version_id?: number }): Promise<TestPoint[]> => {
    const response = await api.get<TestPoint[]>('/test-points/', { params });
    return response.data;
  },

  getTestPointById: async (testPointId: number): Promise<TestPoint> => { // Added for completeness
    const response = await api.get<TestPoint>(`/test-points/${testPointId}`);
    return response.data;
  },

  createTestPoint: async (data: TestPointCreate): Promise<TestPoint> => {
    const response = await api.post<TestPoint>('/test-points/', data);
    return response.data;
  },

  updateTestPoint: async (testPointId: number, data: TestPointUpdate): Promise<TestPoint> => {
    const response = await api.put<TestPoint>(`/test-points/${testPointId}`, data);
    return response.data;
  },

  deleteTestPoint: async (testPointId: number): Promise<void> => {
    await api.delete(`/test-points/${testPointId}`);
  },

  // Test Case CRUD
  getTestCases: async (params: { test_point_id?: number }): Promise<TestCase[]> => {
    const response = await api.get<TestCase[]>('/test-cases/', { params });
    return response.data;
  },

  getTestCaseById: async (testCaseId: number): Promise<TestCase> => { // Added for completeness
    const response = await api.get<TestCase>(`/test-cases/${testCaseId}`);
    return response.data;
  },

  createTestCase: async (data: TestCaseCreate): Promise<TestCase> => {
    const response = await api.post<TestCase>('/test-cases/', data);
    return response.data;
  },

  updateTestCase: async (testCaseId: number, data: TestCaseUpdate): Promise<TestCase> => {
    const response = await api.put<TestCase>(`/test-cases/${testCaseId}`, data);
    return response.data;
  },

  deleteTestCase: async (testCaseId: number): Promise<void> => {
    await api.delete(`/test-cases/${testCaseId}`);
  },
};
