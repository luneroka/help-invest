import { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import MainHeader from '../../headers/MainHeader';
import { formatAmount } from '../../../utils/helpers';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { authorizedRequest } from '../../../utils/authorizedRequest';
import { useNavigate } from 'react-router-dom';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/history?page=${page}&per_page=10`,
      });

      if (response.data.success) {
        setTransactions(response.data.transaction_history);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);

      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError('Erreur lors du chargement des opérations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (
      !window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction?')
    ) {
      return;
    }

    try {
      const response = await authorizedRequest({
        method: 'delete',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/delete-entry`,
        data: { entry_id: transactionId },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message,
        });

        // Refresh the transactions list
        fetchTransactions(currentPage);

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);

      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setMessage({
          type: 'error',
          text:
            error.response?.data?.message || 'Erreur lors de la suppression',
        });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <Layout header={<MainHeader />}>
        <h2>Historique des opérations</h2>
        <div className='flex flex-col items-center justify-center min-h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary'></div>
          <p className='mt-4 text-black-50'>Chargement des opérations...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout header={<MainHeader />}>
        <div className='flex flex-col items-center justify-center min-h-64'>
          <div className='text-alerts-error text-center'>
            <p className='text-lg font-semibold'>Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout header={<MainHeader />}>
      <h2>Historique des opérations</h2>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-3 md:p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-alerts-success-light border border-alerts-success text-alerts-success-dark'
              : 'bg-alerts-error-light border border-alerts-error text-alerts-error-dark'
          }`}
        >
          <p className='text-sm md:text-base'>{message.text}</p>
        </div>
      )}

      <div className=''>
        {transactions.length === 0 ? (
          <div className='text-center py-8 md:py-12'>
            <p className='text-black-50 text-base md:text-lg'>
              Aucune opération trouvée
            </p>
            <p className='text-black-25 mt-2 text-sm md:text-base'>
              Vos futures opérations apparaîtront ici
            </p>
          </div>
        ) : (
          <div className=''>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[600px]'>
                <thead>
                  <tr className='border-b border-black-10'>
                    <th className='text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-xs md:text-sm text-black-75'>
                      Catégorie
                    </th>
                    <th className='text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-xs md:text-sm text-black-75'>
                      Compte
                    </th>
                    <th className='text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-xs md:text-sm text-black-75'>
                      Montant
                    </th>
                    <th className='text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-xs md:text-sm text-black-75'>
                      Date
                    </th>
                    <th className='text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-xs md:text-sm text-black-75'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className='border-b border-black-5 hover:bg-black-5'
                    >
                      <td className='py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-black-85'>
                        <span className='block truncate max-w-[120px] md:max-w-none'>
                          {transaction.category_name}
                        </span>
                      </td>
                      <td className='py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-black-85'>
                        <span className='block truncate max-w-[120px] md:max-w-none'>
                          {transaction.sub_category_name}
                        </span>
                      </td>
                      <td className='py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium'>
                        <span
                          className={`${transaction.amount >= 0 ? 'text-alerts-success' : 'text-alerts-error'}`}
                        >
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className='py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-black-85'>
                        <span className='block truncate'>
                          {new Date(transaction.timestamp).toLocaleDateString(
                            'fr-FR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </td>
                      <td className='py-2 md:py-3 px-2 md:px-4 text-center'>
                        <button
                          className='text-alerts-error hover:text-alerts-error-dark transition-colors cursor-pointer p-1 md:p-2'
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          title='Supprimer'
                        >
                          <RiDeleteBin6Line className='text-base md:text-lg' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transaction Count */}
            {transactions.length > 0 && (
              <div className='mt-3 md:mt-4 text-center'>
                <p className='text-xs md:text-sm text-black-50'>
                  {pagination.total || transactions.length} opération
                  {(pagination.total || transactions.length) > 1
                    ? 's'
                    : ''}{' '}
                  trouvée
                  {(pagination.total || transactions.length) > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className='flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mt-4 md:mt-6'>
          <button
            disabled={!pagination.has_prev}
            onClick={() => fetchTransactions(currentPage - 1)}
            className='w-full sm:w-auto px-4 py-2 text-sm md:text-base bg-theme-primary text-white-100 rounded disabled:bg-black-25 disabled:cursor-not-allowed hover:bg-theme-accent transition-colors cursor-pointer'
          >
            Précédent
          </button>

          <span className='text-xs md:text-sm text-black-50 order-first sm:order-none'>
            Page {pagination.page || 1} sur {pagination.pages || 1}
          </span>

          <button
            disabled={!pagination.has_next}
            onClick={() => fetchTransactions(currentPage + 1)}
            className='w-full sm:w-auto px-4 py-2 text-sm md:text-base bg-theme-primary text-white-100 rounded disabled:bg-black-25 disabled:cursor-not-allowed hover:bg-theme-accent transition-colors cursor-pointer'
          >
            Suivant
          </button>
        </div>
      )}
    </Layout>
  );
}

export default History;
