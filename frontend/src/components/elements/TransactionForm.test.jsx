import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransactionForm from './TransactionForm'
import { describe, expect, it } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { authorizedRequest } from '../../utils/authorizedRequest'

const mockCategories = [
  {
    name: 'Épargne',
    category_name: 'Épargne',
    sub_category: 'Livret A'
  },
  {
    name: 'Actions',
    category_name: 'Actions',
    sub_category: 'PEA'
  }
]

vi.mock('../../utils/authorizedRequest', () => ({
  authorizedRequest: vi.fn(() =>
    Promise.resolve({
      data: {
        success: true,
        all_categories: mockCategories,
        withdraw_categories: mockCategories
      }
    })
  )
}))

describe('TransactionForm', () => {
  it('renders the title prop correctly', async () => {
    render(
      <BrowserRouter>
        <TransactionForm title="Investir" />
      </BrowserRouter>
    )

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: /investir/i })).toBeInTheDocument()
    )
  })

  it('shows validation errors on empty form submit', async () => {
    render(
      <BrowserRouter>
        <TransactionForm title="Investir" />
      </BrowserRouter>
    )

    // Click the submit button
    const button = screen.getByRole('button', { name: /investir/i })
    await userEvent.click(button)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/veuillez entrer un montant valide/i)).toBeInTheDocument()
      expect(screen.getByText(/veuillez sélectionner une catégorie/i)).toBeInTheDocument()
      expect(screen.getByText(/veuillez sélectionner un compte/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with correct data on valid form submit', async () => {
    const mockSubmit = vi.fn()

    render(
      <BrowserRouter>
        <TransactionForm
          title="Investir"
          actionType="invest"
          isLoading={false}
          onSubmit={mockSubmit}
        />
      </BrowserRouter>
    )

    // Wait for categories to load
    await waitFor(() => expect(screen.getByRole('option', { name: 'Épargne' })).toBeInTheDocument())

    const amountInput = screen.getByLabelText(/montant/i)
    const categorySelect = screen.getByLabelText(/catégorie/i)
    const subcategorySelect = screen.getByLabelText(/compte/i)
    const submitButton = screen.getByRole('button', { name: /investir/i })

    // Fill amount
    await userEvent.type(amountInput, '1000')

    // Select category
    await userEvent.selectOptions(categorySelect, 'Épargne')

    // Wait for subcategories to update based on category selection
    await waitFor(() => expect(screen.getByRole('option', { name: 'Livret A' })).toBeInTheDocument())

    // Select subcategory
    await userEvent.selectOptions(subcategorySelect, 'Livret A')

    // Submit form
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        actionType: 'invest',
        category: 'Épargne',
        subCategory: 'Livret A',
        amount: 1000
      })
    })
  })

  it('shows an error when withdrawing more than available balance', async () => {
    const mockSubmit = vi.fn()

    // Mock category with limited balance
    const mockWithdrawCategories = [
      {
        category: 'Épargne',
        sub_category: 'Livret A',
        balance: 500
      }
    ]

    vi.mocked(authorizedRequest).mockResolvedValueOnce({
      data: {
        success: true,
        withdraw_categories: mockWithdrawCategories
      }
    })

    render(
      <BrowserRouter>
        <TransactionForm
          title="Retirer"
          actionType="withdraw"
          isLoading={false}
          onSubmit={mockSubmit}
        />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Épargne' })).toBeInTheDocument()
    })

    const amountInput = screen.getByLabelText(/montant/i)
    const categorySelect = screen.getByLabelText(/catégorie/i)
    const subcategorySelect = screen.getByLabelText(/compte/i)
    const submitButton = screen.getByRole('button', { name: /retirer/i })

    await userEvent.selectOptions(categorySelect, 'Épargne')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /livret a/i })).toBeInTheDocument()
    })
    await userEvent.selectOptions(subcategorySelect, 'Livret A')
    await userEvent.type(amountInput, '1000')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/solde insuffisant/i)).toBeInTheDocument()
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  it('resets subcategory when category changes', async () => {
    render(
      <BrowserRouter>
        <TransactionForm
          title="Investir"
          actionType="invest"
          isLoading={false}
          onSubmit={vi.fn()}
        />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Épargne' })).toBeInTheDocument()
    })

    const categorySelect = screen.getByLabelText(/catégorie/i)
    const subcategorySelect = screen.getByLabelText(/compte/i)

    await userEvent.selectOptions(categorySelect, 'Épargne')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Livret A' })).toBeInTheDocument()
    })
    await userEvent.selectOptions(subcategorySelect, 'Livret A')
    expect(subcategorySelect.value).toBe('Livret A')

    await userEvent.selectOptions(categorySelect, 'Actions')
    expect(subcategorySelect.value).toBe('')
  })
})