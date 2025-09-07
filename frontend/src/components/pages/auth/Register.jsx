import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PasswordChecklist from 'react-password-checklist';
import Layout from '../../layout/Layout';
import AuthHeader from '../../headers/AuthHeader';
// Import Firebase Auth
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { authorizedRequest } from '../../../utils/authorizedRequest';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  let navigate = useNavigate();

  // Local state for password visibility and values
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [confirmationPasswordVisibility, setConfirmationPasswordVisibility] =
    useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password confirmation check
    if (formData.password !== formData.confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    const auth = getAuth();
    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      // Sync user with backend after Firebase registration
      const user = auth.currentUser;
      if (user) {
        await authorizedRequest({
          method: 'post',
          url: `${import.meta.env.VITE_API_BASE_URL}/api/sync-user`,
          data: {
            displayName: user.displayName || '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      navigate('/connexion');
    } catch (error) {
      console.error('Signup error:', error);
      // Firebase error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else if (error.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle password view
  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  const toggleConfirmationPasswordVisibility = () => {
    setConfirmationPasswordVisibility((prev) => !prev);
  };

  return (
    <Layout header={<AuthHeader />}>
      <div className='flex flex-col flex-1 items-center min-h-full min-w-[300px] xs:min-w-[500px]'>
        <h2>Inscrivez-vous</h2>

        <div className='card'>
          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
            {/* Error display */}
            {error && (
              <div className='text-alerts-error text-sm mb-4'>{error}</div>
            )}

            {/* Email Input */}
            <div className='flex flex-col gap-2'>
              <label htmlFor='email' className='block text-black-75 text-small'>
                Adresse email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                placeholder='Adresse email'
                className='input-field input-field:focus w-full placeholder:text-black-50 text-black-85'
                autoComplete='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Passwords */}
            <div className='flex flex-col gap-4 sm:gap-2'>
              <label
                htmlFor='password'
                className='block text-black-75 text-small'
              >
                Mot de passe
              </label>

              {/* Password input */}
              <div className='relative w-full'>
                <input
                  type={passwordVisibility ? 'text' : 'password'}
                  name='password'
                  id='password'
                  placeholder='Mot de passe'
                  className='input-field w-full placeholder:text-black-50 text-black-85'
                  autoComplete='new-password'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility()}
                  className='cursor-pointer absolute right-3 inset-y-0 my-auto text-black-50'
                >
                  {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Confirmation input */}
              <div className='relative w-full'>
                <input
                  type={confirmationPasswordVisibility ? 'text' : 'password'}
                  name='confirmation'
                  id='confirmation'
                  placeholder='Confirmer le mot de passe'
                  className='input-field w-full placeholder:text-black-50 text-black-85'
                  autoComplete='new-password'
                  value={formData.confirmation}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type='button'
                  onClick={() => toggleConfirmationPasswordVisibility()}
                  className='cursor-pointer absolute right-3 inset-y-0 my-auto text-black-50'
                >
                  {confirmationPasswordVisibility ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className='password-checklist-container'>
                <PasswordChecklist
                  rules={['capital', 'number', 'specialChar', 'minLength']}
                  minLength={8}
                  value={formData.password}
                  valueAgain={formData.confirmation}
                  messages={{
                    capital: 'Doit contenir au moins 1 lettre majuscule.',
                    number: 'Doit contenir au moins 1 caractère numérique.',
                    specialChar:
                      'Doit contenir au moins 1 caractère spécial (@, $, !, %, *, ?, &).',
                    minLength: 'Doit contenir au moins 8 caractères.',
                  }}
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type='submit'
              className='btn-primary w-full'
              disabled={loading}
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <hr className='border-black-25' />

          {/* Redirect To Login */}
          <p className='text-black-75 text-small'>
            Déjà inscrit ?{' '}
            <span className='link-default underline link-default:hover'>
              <Link to='/connexion'>Connectez-vous</Link>
            </span>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Register;
