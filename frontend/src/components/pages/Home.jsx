import React from 'react'
import Layout from '../layout/Layout'
import IndexHeader from '../../components/headers/IndexHeader'

function Home() {
  return (
    <Layout header={<IndexHeader />}>
      <div className="flex items-start">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <h1>Bienvenue sur HelpInvest !</h1>
            <p className="text-body italic">Votre assistant virtuel pour suivre et optimiser votre portefeuille.</p>
          </div>

          <div>
            <strong>Avertissement : </strong>Cet outil est un guide d’aide à la décision.
            Il ne remplace pas un conseiller financier.
            Les marchés sont volatils et les performances passées ne garantissent pas les résultats futurs.
          </div>

          <div className="flex flex-col gap-2">
            <h3>Pourquoi HelpInvest ?</h3>
            <p>Que vous soyez débutant ou expérimenté, l’application vous offre une vue claire de vos investissements,
              regroupés au même endroit. En mettant régulièrement à jour vos données, vous pourrez :</p>
            <ul className="list-disc list-inside pl-4">
              <li>Visualiser la répartition de votre portefeuille,</li>
              <li>Évaluer sa cohérence avec votre profil de risque,</li>
              <li>Recevoir des recommandations personnalisées.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3>Comment ça fonctionne ?</h3>
            <ol className="list-decimal list-inside pl-4">
              <li>Créez un compte ou connectez-vous.</li>
              <li>Choisissez votre profil de risque (par défaut : Équilibré).</li>
              <li>Ajoutez vos investissements par catégorie et sous-catégorie (ex. : Actions {'>'} AMZN {'>'} 12 000 €).</li>
              <li>Suivez l’évolution de votre portefeuille via un tableau de bord clair et visuel.</li>
              <li>Ajustez vos investissements pour garder un bon équilibre.</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            <h3>Une structure inspirée de la pyramide de Maslow</h3>
            <ul className="list-disc list-inside pl-4">
              <li><strong>Épargne : </strong>Sécurisez votre liquidité.</li>
              <li><strong>Immobilier : </strong>Bâtissez votre patrimoine.</li>
              <li><strong>Marchés financiers : </strong>Recherchez rendement et diversification.</li>
              <li><strong>Autres : </strong>Investissements alternatifs (Private Equity, or physique, etc.).</li>
            </ul>
          </div>

          <p>Inscrivez-vous dès maintenant pour reprendre le contrôle sur votre avenir financier !</p>
        </div>

        <div className="flex flex-col items-center justify-start w-full relative">
          <img src="../../public/Pyramide_finance.png" alt="" className="w-full scale-85 origin-top" />
          <p className="text-caption px-2 py-1 absolute bottom-0 right-0 m-2 w-1/2">
            Illustration : Guillaume Simonin - La pyramide du patrimoine.<br />
            Le guide visuel d’éducation financière, Maxima 2024.<br />
            Utilisée à titre illustratif, tous droits réservés à l’auteur.
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Home