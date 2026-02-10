import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import LoginPage from '@/pages/Login';
import ErrorPage from '@/pages/ErrorPage';

// Dash pages
import {
  DashboardPage,
  SessionsPage,
  SessionDetailPage,
  ApiKeysPage,
  UsersPage,
  BillingPage,
  SettingsPage,
} from '@/pages/dash';

// Console pages
import {
  ConsoleDashboard,
  ConsoleSessionsPage,
  ConsoleSessionDetailPage,
  OrganizationsPage,
  OrganizationDetailPage,
  OnboardClientPage,
} from '@/pages/console';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Client Dashboard routes (/dash)
  {
    path: '/dash',
    element: <Layout mode="dash" />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'sessions',
        element: <SessionsPage />,
      },
      {
        path: 'sessions/:id',
        element: <SessionDetailPage />,
      },
      {
        path: 'api-keys',
        element: <ApiKeysPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'billing',
        element: <BillingPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  // ICP Console routes (/console)
  {
    path: '/console',
    element: <Layout mode="console" />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ConsoleDashboard />,
      },
      {
        path: 'sessions',
        element: <ConsoleSessionsPage />,
      },
      {
        path: 'sessions/:id',
        element: <ConsoleSessionDetailPage />,
      },
      {
        path: 'organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'organizations/:id',
        element: <OrganizationDetailPage />,
      },
      {
        path: 'onboard-client',
        element: <OnboardClientPage />,
      },
    ],
  },
  // Catch-all: redirect unknown routes to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
