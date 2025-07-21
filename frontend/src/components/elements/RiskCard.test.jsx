import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RiskCard from './RiskCard'
import * as requestModule from '../../utils/authorizedRequest'

describe('RiskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and displays current risk profile', async () => {
    vi.spyOn(requestModule, 'authorizedRequest').mockResolvedValueOnce({
      data: {
        success: true,
        user: { risk_profile: 'prudent' },
      },
    })

    render(
      <BrowserRouter>
        <RiskCard />
      </BrowserRouter>
    )

    expect(await screen.findByText(/PRUDENT/i)).toBeInTheDocument()
  })

  it('redirects to /connexion on fetch 401 error', async () => {
    vi.spyOn(requestModule, 'authorizedRequest').mockRejectedValueOnce({
      response: { status: 401 },
    })

    render(
      <BrowserRouter>
        <RiskCard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/connexion')
    })
  })

  it('renders select options and updates risk profile on change', async () => {
    vi.spyOn(requestModule, 'authorizedRequest').mockResolvedValueOnce({
      data: {
        success: true,
        user: { risk_profile: 'prudent' },
      },
    })

    render(
      <BrowserRouter>
        <RiskCard />
      </BrowserRouter>
    )

    const select = await screen.findByRole('combobox', { name: /modifiez votre profil de risque/i })

    await userEvent.selectOptions(select, 'équilibré')
    expect(select.value).toBe('équilibré')
  })

  it('submits the form and updates current profile', async () => {
    vi.spyOn(requestModule, 'authorizedRequest')
      .mockResolvedValueOnce({
        data: { success: true, user: { risk_profile: 'prudent' } },
      })
      .mockResolvedValueOnce({
        data: { success: true, user: { risk_profile: 'dynamique' } },
      })

    render(
      <BrowserRouter>
        <RiskCard />
      </BrowserRouter>
    )

    const select = await screen.findByRole('combobox', { name: /modifiez votre profil de risque/i })
    await userEvent.selectOptions(select, 'dynamique')

    const button = screen.getByRole('button', { name: /confirmer/i })
    await userEvent.click(button)

    await waitFor(() => {
      const profileContainer = screen.getByText(/votre profil de risque actuel/i).parentElement
      expect(within(profileContainer).getByText(/DYNAMIQUE/i)).toBeInTheDocument()
    })
  })

  it('displays error message if API submission fails', async () => {
    vi.spyOn(requestModule, 'authorizedRequest')
      .mockResolvedValueOnce({
        data: { success: true, user: { risk_profile: 'prudent' } },
      })
      .mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Erreur de mise à jour' },
        },
      })

    render(
      <BrowserRouter>
        <RiskCard />
      </BrowserRouter>
    )

    const select = await screen.findByRole('combobox', { name: /modifiez votre profil de risque/i })
    await userEvent.selectOptions(select, 'dynamique')

    const button = screen.getByRole('button', { name: /confirmer/i })
    await userEvent.click(button)

    expect(await screen.findByText(/erreur de mise à jour/i)).toBeInTheDocument()
  })
})