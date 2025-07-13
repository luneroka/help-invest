import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PasswordChecklist from 'react-password-checklist';
import Layout from '../layout/Layout'
import AuthHeader from '../headers/AuthHeader'

function Register() {
    // Local state for password visibility and values
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmationPasswordVisibility, setConfirmationPasswordVisibility] =
        useState(false);
    const [password, setPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');

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

                <div className="card">

                    {/* Form */}
                    <form className="flex flex-col gap-8">

                        {/* Email Input */}
                        <div className='flex flex-col gap-2'>
                            <label
                                htmlFor='username'
                                className='block text-small'
                            >
                                Nom d'utilisateur
                            </label>
                            <input
                                type='text'
                                name='username'
                                id='username'
                                placeholder="Nom d'utilisateur"
                                className="input-field input-field:focus w-full"
                                autoComplete='username'
                            />
                        </div>

                        {/* Passwords */}
                        <div className='flex flex-col gap-2'>
                            <label
                                htmlFor='password'
                                className='block text-small'
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field w-full"
                                    autoComplete='current-password'
                                />
                                <button
                                    type='button'
                                    onClick={() => togglePasswordVisibility()}
                                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                                >
                                    {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            {/* Confirmation input */}
                            <div className='relative w-full'>
                                <input
                                    type={confirmationPasswordVisibility ? 'text' : 'password'}
                                    required
                                    placeholder='Confirmer le mot de passe'
                                    value={confirmationPassword}
                                    onChange={(e) => setConfirmationPassword(e.target.value)}
                                    className="input-field w-full"
                                    autoComplete='new-password'
                                />
                                <button
                                    type='button'
                                    onClick={() => toggleConfirmationPasswordVisibility()}
                                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                                >
                                    {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <div className='password-checklist-container'>
                                <PasswordChecklist
                                    rules={[
                                        'capital',
                                        'number',
                                        'specialChar',
                                        'minLength',
                                    ]}
                                    minLength={8}
                                    value={password}
                                    valueAgain={confirmationPassword}
                                    messages={{
                                        capital: 'Doit contenir au moins 1 lettre majuscule.',
                                        number: 'Doit contenir au moins 1 caractère numérique.',
                                        specialChar: 'Doit contenir au moins 1 caractère spécial (@, $, !, %, *, ?, &).',
                                        minLength: 'Doit contenir au moins 8 caractères.',
                                    }}
                                />
                            </div>
                        </div>


                        {/* Register Button */}
                        <button
                            type='submit'
                            className='btn-primary w-full'
                        >
                            S'inscrire
                        </button>
                    </form>

                    <hr className='border-gray-300' />

                    {/* Redirect To Login */}
                    <p className='text-small'>
                        Déjà inscrit ?{' '}
                        <span className='link-default underline link-default:hover'>
                            <Link to='/connexion'>Connectez-vous ici</Link>
                        </span>.
                    </p>

                    {/* Copyrights */}
                    <p className='text-xs text-center text-caption'>
                        &copy;2025 HelpInvest. Tous droits réservés.
                    </p>
                </div>
            </div>
        </Layout>
    )
}

export default Register