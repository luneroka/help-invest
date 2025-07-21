import { render, screen, waitFor } from '@testing-library/react'
import History from './History'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../utils/authorizedRequest'
import { BrowserRouter } from 'react-router-dom'

// Mock useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

// Mock authorizedRequest
vi.mock('../../utils/authorizedRequest')

describe('History', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    )
    expect(screen.getByText(/chargement des opérations/i)).toBeInTheDocument()
  })

  it('displays transactions after successful fetch', async () => {
    api.authorizedRequest.mockResolvedValueOnce({
      data: {
        success: true,
        transaction_history: [
          {
            id: 1,
            category_name: 'Épargne',
            sub_category_name: 'Livret A',
            amount: 1000,
            timestamp: new Date().toISOString()
          }
        ],
        pagination: { page: 1, pages: 1 }
      }
    })

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    )

    expect(await screen.findByText('Épargne')).toBeInTheDocument()
    expect(screen.getByText('Livret A')).toBeInTheDocument()
    expect(screen.getByText(/1 opération trouvée/)).toBeInTheDocument()
  })

  it('shows empty message if no transactions', async () => {
    api.authorizedRequest.mockResolvedValueOnce({
      data: {
        success: true,
        transaction_history: [],
        pagination: { page: 1, pages: 1 }
      }
    })

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    )

    expect(await screen.findByText(/aucune opération trouvée/i)).toBeInTheDocument()
  })

  it('displays error message if API fails', async () => {
    api.authorizedRequest.mockRejectedValueOnce(new Error('Server error'))

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    )

    expect(await screen.findByText(/erreur lors du chargement des opérations/i)).toBeInTheDocument()
  })

  it('redirects to /connexion on 401 error', async () => {
    api.authorizedRequest.mockRejectedValueOnce({
      response: { status: 401 }
    })

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/connexion')
    })
  })
})