import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Layout from '../layout/Layout'
import IndexHeader from '../../components/headers/IndexHeader'
import MainHeader from '../headers/MainHeader'

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/risk-profile`,
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        setIsLoggedIn(true)
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // User is not logged in
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout header={<IndexHeader />}>
        <div className='flex justify-center items-center min-h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout header={isLoggedIn ? <MainHeader /> : <IndexHeader />}>
      <div className='flex flex-col gap-8 lg:flex-row lg:items-start'>
        <div className='flex flex-col gap-4 w-full max-w-[850px]'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-responsive-h1'>Bienvenue sur HelpInvest !</h1>
            <p className='text-body italic text-responsive-body'>
              Votre assistant virtuel pour suivre et optimiser votre
              portefeuille.
            </p>
          </div>

          <div className='text-pretty text-responsive-body'>
            <strong>Avertissement : </strong>Cet outil est un guide d'aide à la
            décision. Il ne remplace pas un conseiller financier. Les marchés
            sont volatils et les performances passées ne garantissent pas les
            résultats futurs.
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-responsive-h3'>Pourquoi HelpInvest ?</h3>
            <p className='text-pretty text-responsive-body'>
              Que vous soyez débutant ou expérimenté, l'application vous offre
              une vue claire de vos investissements, regroupés au même endroit.
              En mettant régulièrement à jour vos données, vous pourrez :
            </p>
            <ul className='list-disc list-inside pl-4 text-responsive-body'>
              <li>Visualiser la répartition de votre portefeuille,</li>
              <li>Évaluer sa cohérence avec votre profil de risque,</li>
              <li>Recevoir des recommandations personnalisées.</li>
            </ul>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-responsive-h3'>Comment ça fonctionne ?</h3>
            <ol className='list-decimal list-inside pl-4 text-responsive-body'>
              <li>
                <Link
                  to='/inscription'
                  className='link-default link-default:hover'
                >
                  Créez un compte
                </Link>{' '}
                ou{' '}
                <Link
                  to='/connexion'
                  className='link-default link-default:hover'
                >
                  connectez-vous
                </Link>
                .
              </li>
              <li>
                Choisissez votre profil de risque (par défaut : Équilibré).
              </li>
              <li>
                Ajoutez vos investissements par catégorie et sous-catégorie (ex.
                : Épargne {'>'} Livret A {'>'} 19 000€).
              </li>
              <li>
                Suivez l’évolution de votre portefeuille via un tableau de bord
                clair et visuel.
              </li>
              <li>Ajustez vos investissements pour garder un bon équilibre.</li>
            </ol>
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='text-responsive-h3'>
              Une structure inspirée de la pyramide de Maslow
            </h3>
            <ul className='list-disc list-inside pl-4 text-responsive-body'>
              <li>
                <strong>Épargne : </strong>Sécurisez votre liquidité.
              </li>
              <li>
                <strong>Immobilier : </strong>Bâtissez votre patrimoine.
              </li>
              <li>
                <strong>Marchés financiers : </strong>Recherchez rendement et
                diversification.
              </li>
              <li>
                <strong>Autres : </strong>Investissements alternatifs (Private
                Equity, or physique, etc.).
              </li>
            </ul>
          </div>

          <p className='text-responsive-body'>
            Inscrivez-vous dès maintenant pour prendre le contrôle de votre
            avenir financier !
          </p>
        </div>

        <div className='flex flex-col gap-4 justify-start w-full max-w-[700px]'>
          <img
            src='../../public/pyramide.png'
            alt=''
            className='w-full origin-top'
          />
          <div className='items-end'>
            <p className='text-caption px-2 py-1 text-end'>
              Illustration : Guillaume Simonin - La pyramide du patrimoine.
              <br />
              Le guide visuel d'éducation financière, Maxima 2024.
              <br />
              Utilisée à titre illustratif, tous droits réservés à l'auteur.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
