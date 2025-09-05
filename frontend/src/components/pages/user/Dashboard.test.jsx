import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { describe, expect, it } from 'vitest';
import { authorizedRequest } from '../../../utils/authorizedRequest';
import { BrowserRouter } from 'react-router-dom';

const navigateMock = vi.fn();

// Mock react-router-dom to provide a mutable navigateMock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock authorizedRequest to simulate an empty portfolio response
vi.mock('../../utils/authorizedRequest', () => ({
  authorizedRequest: vi.fn(() =>
    Promise.resolve({
      data: {
        success: true,
        total_estate: 0,
        portfolio_summary: {},
      },
    })
  ),
}));

describe('Dashboard', () => {
  it('renders empty message when displayTotalEstate is 0', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for useEffect to complete
    await waitFor(() => {
      expect(
        screen.getByText(/aucune donnée de portefeuille disponible/i)
      ).toBeInTheDocument();
    });
  });

  it('renders graph and table when data is loaded', async () => {
    // Override previous mock of authorizedRequest
    vi.mocked(authorizedRequest).mockResolvedValueOnce({
      data: {
        success: true,
        total_estate: 1000,
        portfolio_summary: {
          Épargne: {
            total_balance: 1000,
            sub_categories: {
              'Livret A': 500,
            },
          },
        },
      },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the dashboard content to render
    await waitFor(() => {
      // Should NOT show the empty message
      expect(
        screen.queryByText(/aucune donnée de portefeuille disponible/i)
      ).not.toBeInTheDocument();

      // Should show some content from DashTable
      expect(screen.getAllByText('Épargne').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Livret A').length).toBeGreaterThan(0);
    });
  });

  it('redirects to /connexion on 401 error', async () => {
    navigateMock.mockClear(); // reset mock call history before the test

    vi.mocked(authorizedRequest).mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/connexion');
    });
  });
});
