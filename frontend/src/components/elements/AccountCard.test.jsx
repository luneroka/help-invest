// AccountCard.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountCard from './AccountCard'
import { BrowserRouter } from 'react-router-dom'
import * as firebaseAuth from 'firebase/auth'

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth')
  return {
    ...actual,
    getAuth: vi.fn(),
    EmailAuthProvider: { credential: vi.fn() },
    reauthenticateWithCredential: vi.fn(),
    updatePassword: vi.fn(),
  }
})

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('AccountCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders password change form', () => {
    render(
      <BrowserRouter>
        <AccountCard />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText(/mot de passe actuel/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/nouveau mot de passe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirmer le mot de passe/i)).toBeInTheDocument()
  })

  it('shows error if password confirmation does not match', async () => {
    const user = { email: 'test@example.com' }
    firebaseAuth.getAuth.mockReturnValue({ currentUser: user })

    render(
      <BrowserRouter>
        <AccountCard />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/mot de passe actuel/i), {
      target: { value: 'oldpass' }
    })
    fireEvent.change(screen.getByPlaceholderText(/nouveau mot de passe/i), {
      target: { value: 'newpass' }
    })
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'wrongpass' }
    })

    fireEvent.click(screen.getByRole('button', { name: /modifier/i }))

    await screen.findByText(/les mots de passe ne correspondent pas/i)
  })

  it('redirects to /connexion on successful password change', async () => {
    const user = { email: 'test@example.com' }
    const credentialMock = {}

    firebaseAuth.getAuth.mockReturnValue({ currentUser: user })
    firebaseAuth.EmailAuthProvider.credential.mockReturnValue(credentialMock)
    firebaseAuth.reauthenticateWithCredential.mockResolvedValue()
    firebaseAuth.updatePassword.mockResolvedValue()

    render(
      <BrowserRouter>
        <AccountCard />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/mot de passe actuel/i), {
      target: { value: 'oldpass' }
    })
    fireEvent.change(screen.getByPlaceholderText(/nouveau mot de passe/i), {
      target: { value: 'newpass' }
    })
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'newpass' }
    })

    fireEvent.click(screen.getByRole('button', { name: /modifier/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/connexion')
    })
  })

  it('shows delete confirmation modal when clicked', () => {
    render(
      <BrowserRouter>
        <AccountCard />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /supprimer le compte/i }))
    expect(screen.getByText(/confirmez avec votre mot de passe/i)).toBeInTheDocument()
  })
})