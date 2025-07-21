import { vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Transactions from './Transactions'
import { describe, expect, it, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { authorizedRequest } from '../../utils/authorizedRequest'

// Default mock for authorizedRequest resolves successfully
vi.mock('../../utils/authorizedRequest', () => ({
  authorizedRequest: vi.fn(() =>
    Promise.resolve({
      data: {
        success: true,
        message: 'Investissement réussi !',
        categoryName: 'Épargne',
        subCategory: 'Livret A',
        amount: 1000
      }
    })
  )
}))

// Add mock for useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

describe('Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correct success message after successful investment', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    )

    const investirHeading = screen.getByRole('heading', { name: /investir/i })
    const investirFormContainer = investirHeading.closest('.card')
    expect(investirFormContainer).toBeInTheDocument()

    const amountInput = within(investirFormContainer).getByLabelText(/montant/i)
    const categorySelect = within(investirFormContainer).getByLabelText(/catégorie/i)
    const subcategorySelect = within(investirFormContainer).getByLabelText(/compte/i)
    const submitButton = within(investirFormContainer).getByRole('button', { name: /investir/i })

    const categoryOption = document.createElement('option')
    categoryOption.value = 'Épargne'
    categoryOption.text = 'Épargne'
    categorySelect.appendChild(categoryOption)

    const subcategoryOption = document.createElement('option')
    subcategoryOption.value = 'Livret A'
    subcategoryOption.text = 'Livret A'
    subcategorySelect.appendChild(subcategoryOption)

    await user.type(amountInput, '1000')
    await user.selectOptions(categorySelect, 'Épargne')
    await user.selectOptions(subcategorySelect, 'Livret A')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/succès|investissement réussi|réussi/i)
      ).toBeInTheDocument()
    })
  })

  it('renders correct success message after successful withdrawal', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    )

    const retirerHeading = screen.getByRole('heading', { name: /retirer/i })
    const retirerFormContainer = retirerHeading.closest('.card')
    expect(retirerFormContainer).toBeInTheDocument()

    const amountInput = within(retirerFormContainer).getByLabelText(/montant/i)
    const categorySelect = within(retirerFormContainer).getByLabelText(/catégorie/i)
    const subcategorySelect = within(retirerFormContainer).getByLabelText(/compte/i)
    const submitButton = within(retirerFormContainer).getByRole('button', { name: /retirer/i })

    const categoryOption = document.createElement('option')
    categoryOption.value = 'Épargne'
    categoryOption.text = 'Épargne'
    categorySelect.appendChild(categoryOption)

    const subcategoryOption = document.createElement('option')
    subcategoryOption.value = 'Livret A'
    subcategoryOption.text = 'Livret A'
    subcategorySelect.appendChild(subcategoryOption)

    await user.type(amountInput, '500')
    await user.selectOptions(categorySelect, 'Épargne')
    await user.selectOptions(subcategorySelect, 'Livret A')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/succès|retrait réussi|réussi/i)
      ).toBeInTheDocument()
    })
  })

  it('redirects to /connexion on 401 error during transaction', async () => {
    // Mock authorizedRequest to reject with 401 error
    vi.mocked(authorizedRequest).mockRejectedValueOnce({
      response: { status: 401 }
    })

    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    )

    // Fill and submit the Investir form
    const investirHeading = screen.getByRole('heading', { name: /investir/i })
    const investirFormContainer = investirHeading.closest('.card')
    const amountInput = within(investirFormContainer).getByLabelText(/montant/i)
    const categorySelect = within(investirFormContainer).getByLabelText(/catégorie/i)
    const subcategorySelect = within(investirFormContainer).getByLabelText(/compte/i)
    const submitButton = within(investirFormContainer).getByRole('button', { name: /investir/i })

    // Add options to selects
    const categoryOption = document.createElement('option')
    categoryOption.value = 'Épargne'
    categoryOption.text = 'Épargne'
    categorySelect.appendChild(categoryOption)

    const subcategoryOption = document.createElement('option')
    subcategoryOption.value = 'Livret A'
    subcategoryOption.text = 'Livret A'
    subcategorySelect.appendChild(subcategoryOption)

    await userEvent.type(amountInput, '1000')
    await userEvent.selectOptions(categorySelect, 'Épargne')
    await userEvent.selectOptions(subcategorySelect, 'Livret A')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/connexion')
    })
  })
})