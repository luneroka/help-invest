import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashGraph from './DashGraph'
import { describe, expect, it } from 'vitest'

vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="mock-pie-chart" />
}))

describe('DashGraph', () => {
    it('shows loading message when loading is true', () =>{
        render(
            <DashGraph
                portfolioSummary={{}}
                loading={true}
                error=''
            />        
        )
        expect(
            screen.getByText(/Chargement des données du portefeuille/i)
        ).toBeInTheDocument()
    })

    it('shows error message when error is set', () => {
        const errorMsg = 'Erreur de chargement'
        render(
            <DashGraph
                portfolioSummary={{}}
                loading={false}
                error={errorMsg}
            />
        )
        expect(screen.getByText(errorMsg)).toBeInTheDocument()
    })

    it('renders the mocked Pie chart', () => {
        render(
            <DashGraph
                portfolioSummary={{}}
                loading={false}
                error=''
            />
        )
        expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument()
    })

    it('renders mocked legends with correct category names', () => {
        // Mock data with two categories
        const mockPortfolioSummary = {
            'Category A': { total_balance: 100 },
            'Category B': { total_balance: 200 }
        }
        render(
            <DashGraph
                portfolioSummary={mockPortfolioSummary}
                loading={false}
                error=''
            />
        )
        // Legends are rendered as <span> elements with text
        expect(screen.getByText('Category A')).toBeInTheDocument()
        expect(screen.getByText('Category B')).toBeInTheDocument()
    })
})