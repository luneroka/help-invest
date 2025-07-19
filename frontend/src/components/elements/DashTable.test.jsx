import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashTable from './DashTable'
import { describe, expect, it } from 'vitest'
import { formatAmount } from '../../utils/helpers'

// Mock the formatAmount function from ../../utils/helpers
vi.mock('../../utils/helpers', () => ({
    formatAmount: vi.fn(() => 'formatted(amount)')
}))

describe('DashTable', () => {
    it('shows empty message when displayTotalEstate is 0', () => {
        render(
            <DashTable
                portfolioSummary={{}}
                displayTotalEstate={0}
                loading={false}
                error=''
            />
        )
        expect(
            screen.getByText(/aucune donnée de portefeuille disponible./i)
        ).toBeInTheDocument
    })

    it ('shows laoding message when loading is true', () => {
        render(
            <DashTable
                portfolioSummary={{}}
                displayTotalEstate={100}
                loading={true}
                error=''
            />
        )
        expect(
            screen.getByText(/Chargement des données du portefeuille.../i)
        ).toBeInTheDocument()
    })

    it('shows error message when error is set', () => {
        const errorMsg = 'Erreur de chargement'
        render(
            <DashTable
                portfolioSummary={{
                    Épargne: {
                        total_balance: 1000,
                        sub_categories: { 'Livret A': 1000 }
                    }
                }}
                displayTotalEstate={1000}
                loading={false}
                error={errorMsg}
            />
        )
        expect(screen.getByText(errorMsg)).toBeInTheDocument()
    })

    it('renders all categories and subcategories correctly', () => {
        const mockData = {
            Épargne: {
                total_balance: 15000,
                sub_categories: {
                    'Livret A': 5000,
                    'Assurance Vie': 10000,
                },
            },
            Actions: {
                total_balance: 8000,
                sub_categories: {
                    'PEA': 3000,
                    'Compte-Titres': 5000,
                },
            },
        }
        render(
            <DashTable
                portfolioSummary={mockData}
                displayTotalEstate={23000}
                loading={false}
                error=''
            />
        )

        // Check that category labels are there
        expect(screen.getByText('Épargne')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()

        // Check that all subcategories appear
        expect(screen.getByText('Livret A')).toBeInTheDocument()
        expect(screen.getByText('Assurance Vie')).toBeInTheDocument()
        expect(screen.getByText('PEA')).toBeInTheDocument()
        expect(screen.getByText('Compte-Titres')).toBeInTheDocument()

        // Check that the total number of categories is correct
        expect(screen.getByText('2 catégories')).toBeInTheDocument()
    })
    it('calls formatAmount for subcategories and category totals', () => {
        const mockData = {
            Épargne: {
                total_balance: 15000,
                sub_categories: {
                    'Livret A': 5000,
                    'Assurance Vie': 10000,
                },
            },
            Actions: {
                total_balance: 8000,
                sub_categories: {
                    'PEA': 3000,
                    'Compte-Titres': 5000,
                },
            },
        }
        // Clear any previous calls
        formatAmount.mockClear()
        render(
            <DashTable
                portfolioSummary={mockData}
                displayTotalEstate={23000}
                loading={false}
                error=''
            />
        )
        // Should be called for each subcategory and each category total
        // Subcategories: 4 times, Totals: 2 times
        expect(formatAmount).toHaveBeenCalledWith(15000)
        expect(formatAmount).toHaveBeenCalledWith(8000)
        expect(formatAmount).toHaveBeenCalledWith(5000)
        expect(formatAmount).toHaveBeenCalledWith(10000)
        expect(formatAmount).toHaveBeenCalledWith(3000)
        expect(formatAmount).toHaveBeenCalledWith(5000)
        // Should be called 6 times in total (2 totals + 4 subcategories)
        expect(formatAmount).toHaveBeenCalledTimes(6)
    })
})

