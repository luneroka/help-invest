import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MainHeader from './MainHeader'
import { describe, expect, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// 1. Mock Firebase signOut
vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(),
    signOut: vi.fn(() => Promise.resolve())
  }
})

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

describe('MainHeader logout flow', () => {
  it('calls signOut and redirects to /connexion on logout click', async () => {
    const user = userEvent.setup()

    // Capture the mocked signOut
    const { signOut } = await import('firebase/auth')

    render(
      <BrowserRouter>
        <MainHeader />
      </BrowserRouter>
    )

    const logoutButton = screen.getAllByText('Déconnexion')[0]
    await user.click(logoutButton)

    expect(signOut).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/connexion')
  })
})

// 2. Mobile menu toggle
describe('MainHeader mobile menu toggle', () => {
    it('toggle the mobile menu when hamburger button is clicked', async () => {
        const user = userEvent.setup()

        await render(
            <BrowserRouter>
                <MainHeader />
            </BrowserRouter>
        )

        // By default, the mobile menu should NOT be present
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument()

        // Click the hamburger button
        const toggleButton = screen.getByRole('button', {
            name: '',
        }) // the icon-only button has no accessible name
        await act(() => user.click(toggleButton))

        // Now the mobile menu should be visible
        expect(screen.getByRole('navigation')).toBeInTheDocument()

        // Click again to close it
        await act(() => user.click(toggleButton))

        // It should be hidden again
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
})