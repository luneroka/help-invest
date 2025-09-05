import { formatAmount } from '../../../utils/helpers';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedRequest } from '../../../utils/authorizedRequest';
import {
  IoIosAddCircleOutline,
  IoIosAddCircle,
  IoIosRemoveCircleOutline,
  IoIosRemoveCircle,
} from 'react-icons/io';

function CategoryTable({
  categoryName,
  categorySummary,
  displayTotalCategory,
  loading,
  error,
  viewMode = 'table',
  onViewModeChange,
  onDataUpdate, // New prop to trigger data refresh
}) {
  const [hoveredIcons, setHoveredIcons] = useState({});
  const [activeInput, setActiveInput] = useState(null); // Format: { subCategory, type: 'add'|'remove' }
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleIconClick = (subCategory, type) => {
    setActiveInput({ subCategory, type });
    setInputValue('');
  };

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(inputValue);

    if (!isNaN(amount) && amount > 0) {
      setIsSubmitting(true);

      try {
        const endpoint =
          activeInput.type === 'add' ? '/api/invest' : '/api/withdraw';

        const response = await authorizedRequest({
          method: 'post',
          url: `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
          data: {
            categoryName: categoryName,
            subCategory: activeInput.subCategory,
            amount: amount,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          // Success - trigger data refresh
          if (onDataUpdate) {
            onDataUpdate();
          }

          // Reset states
          setActiveInput(null);
          setInputValue('');
          setHoveredIcons({});
        }
      } catch (error) {
        console.error('Transaction error:', error);

        if (error.response?.status === 401) {
          navigate('/connexion');
        } else {
          // You might want to show an error message to the user
          console.error(
            'Error:',
            error.response?.data?.message || 'Une erreur est survenue'
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Invalid amount - just close the input
      setActiveInput(null);
      setInputValue('');
      setHoveredIcons({});
    }
  };

  const handleInputCancel = () => {
    // Reset both input state and hover state
    setActiveInput(null);
    setInputValue('');
    setHoveredIcons({});
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleInputCancel();
    }
  };

  if (displayTotalCategory === 0) {
    return (
      <div className='bg-white shadow-lg overflow-hidden'>
        <div className='p-6 text-center'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='bg-white shadow-lg overflow-hidden'>
        <div className='p-6 text-center'>
          <span className='text-gray-500'>
            Chargement des données du portefeuille...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-lg overflow-hidden'>
      {error && (
        <div className='px-4 md:px-6 py-3 bg-yellow-50 border-l-4 border-yellow-400'>
          <p className='text-sm text-yellow-700'>{error}</p>
        </div>
      )}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 table-fixed'>
          <thead className='bg-theme-primary text-white sticky top-0 z-10'>
            <tr>
              <th className='w-2/5 px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider'>
                Compte
              </th>
              <th className='w-2/5 px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium uppercase tracking-wider'>
                Montant
              </th>
              <th className='w-1/5 px-3 md:px-6 py-2 md:py-3 text-center text-xs font-medium uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className='overflow-y-auto max-h-[400px] md:max-h-[550px]'>
        <table className='min-w-full table-fixed'>
          <tbody className='bg-white divide-y divide-gray-200'>
            {categorySummary &&
              Object.entries(categorySummary).map(
                ([subCategory, amount], index) => (
                  <tr
                    key={subCategory}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <td className='w-2/5 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap'>
                      <span className='text-xs md:text-sm text-gray-900 font-medium truncate block'>
                        {subCategory}
                      </span>
                    </td>
                    <td className='w-2/5 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-right'>
                      <span className='text-xs md:text-sm font-medium text-gray-900'>
                        {formatAmount(amount)}
                      </span>
                    </td>
                    <td className='w-1/5 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap'>
                      {activeInput &&
                      activeInput.subCategory === subCategory ? (
                        <form
                          onSubmit={handleInputSubmit}
                          className='flex items-center justify-center w-full'
                        >
                          <div className='flex items-center gap-1 w-full max-w-20'>
                            <input
                              type='number'
                              step='0.01'
                              min='0'
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={handleInputKeyDown}
                              onBlur={handleInputCancel}
                              placeholder='Montant'
                              disabled={isSubmitting}
                              className={`flex-1 px-2 py-1 text-xs border rounded ${
                                activeInput.type === 'add'
                                  ? 'border-alerts-success focus:ring-alerts-success'
                                  : 'border-alerts-error focus:ring-alerts-error'
                              } focus:outline-none focus:ring-1 ${
                                isSubmitting
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              autoFocus
                            />
                            <span
                              className={`text-xs flex-shrink-0 ${
                                activeInput.type === 'add'
                                  ? 'text-alerts-success'
                                  : 'text-alerts-error'
                              }`}
                            >
                              €
                            </span>
                          </div>
                        </form>
                      ) : (
                        <div className='flex gap-2 justify-center'>
                          {hoveredIcons[`${subCategory}-add`] ? (
                            <IoIosAddCircle
                              className='size-6 text-alerts-success cursor-pointer transition-all duration-200'
                              onClick={() =>
                                handleIconClick(subCategory, 'add')
                              }
                              onMouseLeave={() =>
                                setHoveredIcons((prev) => ({
                                  ...prev,
                                  [`${subCategory}-add`]: false,
                                }))
                              }
                            />
                          ) : (
                            <IoIosAddCircleOutline
                              className='size-6 text-alerts-success cursor-pointer transition-all duration-200'
                              onClick={() =>
                                handleIconClick(subCategory, 'add')
                              }
                              onMouseEnter={() =>
                                setHoveredIcons((prev) => ({
                                  ...prev,
                                  [`${subCategory}-add`]: true,
                                }))
                              }
                            />
                          )}
                          {hoveredIcons[`${subCategory}-remove`] ? (
                            <IoIosRemoveCircle
                              className='size-6 text-alerts-error cursor-pointer transition-all duration-200'
                              onClick={() =>
                                handleIconClick(subCategory, 'remove')
                              }
                              onMouseLeave={() =>
                                setHoveredIcons((prev) => ({
                                  ...prev,
                                  [`${subCategory}-remove`]: false,
                                }))
                              }
                            />
                          ) : (
                            <IoIosRemoveCircleOutline
                              className='size-6 text-alerts-error cursor-pointer transition-all duration-200'
                              onClick={() =>
                                handleIconClick(subCategory, 'remove')
                              }
                              onMouseEnter={() =>
                                setHoveredIcons((prev) => ({
                                  ...prev,
                                  [`${subCategory}-remove`]: true,
                                }))
                              }
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>

      <div className='px-3 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <span className='text-xs md:text-sm text-gray-600'>
              {categorySummary ? Object.keys(categorySummary).length : 0}{' '}
              comptes
            </span>
            <span className='text-xs md:text-sm font-semibold text-gray-800'>
              Total {categoryName} : {displayTotalCategory}
            </span>
          </div>
          <div className='flex items-center bg-white rounded-md border border-gray-300 overflow-hidden'>
            <button
              onClick={() => onViewModeChange && onViewModeChange('table')}
              className={`px-3 py-1 text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-theme-primary text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
            <div className='w-px h-4 bg-gray-300'></div>
            <button
              onClick={() => onViewModeChange && onViewModeChange('graph')}
              className={`px-3 py-1 text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-theme-primary text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryTable;
