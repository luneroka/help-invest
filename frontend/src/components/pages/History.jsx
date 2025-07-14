import { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { formatAmount } from '../../utils/helpers'
import { RiDeleteBin6Line } from 'react-icons/ri'

function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sample data
  const sampleData = [
    {
      category_name: 'Épargne',
      sub_category: 'PEA',
      amount: 20000,
      timestamp: '07-07-2025 16:32:48'
    },
    {
      category_name: 'Actions',
      sub_category: 'Crypto',
      amount: 140000,
      timestamp: '31-06-2025 16:32:48'
    },
    {
      category_name: 'Immobilier',
      sub_category: 'Immobilier Locatif',
      amount: 27000,
      timestamp: '31-12-2025 16:32:48'
    }
  ]

  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        // const response = await fetch('/api/transactions');
        // const data = await response.json();

        // Simulate loading delay
        setTimeout(() => {
          setTransactions(sampleData)
          setLoading(false)
        }, 1000)
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setError('Erreur lors du chargement des opérations.')
        setLoading(false)
      }
    }

    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDeleteTransaction = () => {}

  if (loading) {
    return (
      <Layout header={<MainHeader />}>
        <h2>Historique des opérations</h2>
        <div className='flex flex-col items-center justify-center min-h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Chargement des opérations...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout header={<MainHeader />}>
        <div className='flex flex-col items-center justify-center min-h-64'>
          <div className='text-red-600 text-center'>
            <p className='text-lg font-semibold'>Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout header={<MainHeader />}>
      <h2>Historique des opérations</h2>
      <div className=''>
        {transactions.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-600 text-lg'>Aucune opération trouvée</p>
            <p className='text-gray-500 mt-2'>
              Vos futures opérations apparaîtront ici
            </p>
          </div>
        ) : (
          <div className=''>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-semibold'>
                      Catégorie
                    </th>
                    <th className='text-left py-3 px-4 font-semibold'>
                      Compte
                    </th>
                    <th className='text-left py-3 px-4 font-semibold'>
                      Montant
                    </th>
                    <th className='text-left py-3 px-4 font-semibold'>
                      Horodatage
                    </th>
                    <th className='text-center py-3 px-4 font-semibold'>
                      Supprimer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.timestamp}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='py-3 px-4 text-small'>
                        {transaction.category_name}
                      </td>
                      <td className={'py-3 px-4 text-small'}>
                        {transaction.sub_category}
                      </td>
                      <td className='py-3 px-4 text-small'>
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className='py-3 px-4 text-small'>
                        {transaction.timestamp}
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <button
                          className='text-red-600 hover:text-red-800 transition-colors cursor-pointer'
                          onClick={() =>
                            handleDeleteTransaction(transaction.timestamp)
                          }
                        >
                          <RiDeleteBin6Line className='text-lg' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length > 0 && (
              <div className='mt-4 text-center text-caption'>
                {transactions.length} opération
                {transactions.length > 1 ? 's' : ''} trouvée
                {transactions.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default History
