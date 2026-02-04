import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import LoginPage from '@/pages/Login';

// Dash pages
import {
  DashboardPage,
  ContractsPage,
  ContractDetailPage,
  ApiKeysPage,
  UsersPage,
  AnalyticsPage,
  BillingPage,
  SettingsPage,
} from '@/pages/dash';

// Console pages
import {
  ConsoleDashboard,
  ConsoleContractsPage,
  ConsoleContractDetailPage,
  OrganizationsPage,
  OrganizationDetailPage,
  ConsoleAnalyticsPage,
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
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'contracts',
        element: <ContractsPage />,
      },
      {
        path: 'contracts/:id',
        element: <ContractDetailPage />,
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
        path: 'analytics',
        element: <AnalyticsPage />,
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
    children: [
      {
        index: true,
        element: <ConsoleDashboard />,
      },
      {
        path: 'contracts',
        element: <ConsoleContractsPage />,
      },
      {
        path: 'contracts/:id',
        element: <ConsoleContractDetailPage />,
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
        path: 'analytics',
        element: <ConsoleAnalyticsPage />,
      },
    ],
  },
]);
