import { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { formatAmount } from '../../utils/helpers'
import { RiDeleteBin6Line } from 'react-icons/ri'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function History() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/history?page=${page}&per_page=10`,
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        setTransactions(response.data.transaction_history)
        setPagination(response.data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)

      if (error.response?.status === 401) {
        navigate('/connexion')
      } else {
        setError('Erreur lors du chargement des opérations')
      }
    } finally {
      setLoading(false)
    }
  }

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
          <div className='text-left py-12'>
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
                      key={transaction.id}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='py-3 px-4 text-small'>
                        {transaction.category_name}
                      </td>
                      <td className={'py-3 px-4 text-small'}>
                        {transaction.sub_category_name}
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
                            handleDeleteTransaction(transaction.id)
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
                {pagination.total || transactions.length} opération
                {(pagination.total || transactions.length) > 1 ? 's' : ''}{' '}
                trouvée
                {(pagination.total || transactions.length) > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className='flex justify-center items-center gap-4 mt-6'>
          <button
            disabled={!pagination.has_prev}
            onClick={() => fetchTransactions(currentPage - 1)}
            className='px-4 py-2 bg-theme-primary text-white rounded disabled:bg-gray-300 cursor-pointer'
          >
            Précédent
          </button>

          <span className='text-sm text-gray-600'>
            Page {pagination.page || 1} sur {pagination.pages || 1}
          </span>

          <button
            disabled={!pagination.has_next}
            onClick={() => fetchTransactions(currentPage + 1)}
            className='px-4 py-2 bg-theme-primary text-white rounded disabled:bg-gray-300 cursor-pointer'
          >
            Suivant
          </button>
        </div>
      )}
    </Layout>
  )
}

export default History
