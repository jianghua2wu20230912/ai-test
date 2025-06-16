import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import ProjectListPage from '../pages/projects/ProjectListPage';
import RequirementListPage from '../pages/requirements/RequirementListPage';
import TestDesignPage from '../pages/testing/TestDesignPage';
// import KnowledgeBasePage from '../pages/KnowledgeBasePage'; // To be replaced or kept
import HierarchyViewPage from '../pages/visualization/HierarchyViewPage'; // New import
import AIGenerationPage from '../pages/AIGenerationPage';
import CollaborationPage from '../pages/CollaborationPage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/auth/LoginPage'; // Import LoginPage
import RegisterPage from '../pages/auth/RegisterPage'; // Import RegisterPage

// Placeholder for a NotFoundPage
const NotFoundPage = () => <h1>404 - Page Not Found</h1>;

const protectedAppRoutes: RouteObject[] = [
  {
    path: "/",
    // Wrap AppLayout with ProtectedRoute. All children will be protected.
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: "projects", element: <ProjectListPage /> },
      { path: "requirements", element: <RequirementListPage /> },
      { path: "test-cases", element: <TestDesignPage /> },
      // { path: "knowledge-base", element: <KnowledgeBasePage /> },
      { path: "hierarchy-view", element: <HierarchyViewPage /> }, // New route
      { path: "ai-generation", element: <AIGenerationPage /> },
      { path: "collaboration", element: <CollaborationPage /> },
      { path: "settings", element: <SettingsPage /> },
      // Any new routes under AppLayout will also be protected
    ],
  },
];

const publicRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedAppRoutes,
  // A general catch-all not found for paths not matching public or protected layouts
  // If AppLayout itself should handle its own internal 404 for its children, that's separate.
  { path: "*", element: <ProtectedRoute><NotFoundPage /></ProtectedRoute> }
  // Or, if NotFoundPage should be public: { path: "*", element: <NotFoundPage /> }
  // For now, let's assume NotFound for a protected path context.
]);

export default router;
