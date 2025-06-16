// Based on backend/app/schemas/ai_generation.py

// Request to analyze requirement text and suggest test points
export interface AIRequirementAnalysisRequest {
  requirement_text: string;
  requirement_id?: number | null; // Optional: ID of an existing Requirement or RequirementVersion
  project_id?: number | null;     // Optional: ID of an existing Project context
}

// Request to generate test cases for a specific test point
export interface AITestCaseGenerationRequest {
  test_point_id: number;
  num_suggestions?: number;
  test_case_type?: string | null; // e.g., 'positive', 'negative', 'boundary'
}

// Response types will be TestPoint[] and TestCase[]
// from '../types/testManagement'
// No new response types needed here if backend mock AI returns existing structures.
