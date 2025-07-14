import React from 'react'

function DashTable() {
  const mockPortfolioSummary = {
    Épargne: {
      total_balance: 65000,
      sub_categories: {
        'Livret A/LDDS': 5000,
        'Assurance-Vie': 8000,
        'PEL/CEL': 2000
      }
    },
    Immobilier: {
      total_balance: 287500,
      sub_categories: {
        'Immobilier de Jouissance': 200000,
        SCPI: 50000,
        'Immobilier locatif': 32000
      }
    },
    Actions: {
      total_balance: 95000,
      sub_categories: {
        Actions: 25000,
        Obligations: 10000,
        Crypto: 60000
      }
    }
  }

  const formatEUR = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className='bg-white shadow-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-theme-primary text-white sticky top-0 z-10'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                Catégorie
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                Compte
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider'>
                Montant
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className='overflow-y-auto max-h-[550px]'>
        <table className='min-w-full'>
          <tbody className='bg-white divide-y divide-gray-200'>
            {Object.entries(mockPortfolioSummary).map(
              ([category, data], categoryIndex) => {
                const subEntries = Object.entries(data.sub_categories)
                return subEntries.map(([subCategory, amount], index) => (
                  <tr
                    key={`${category}-${subCategory}`}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    {index === 0 && (
                      <td
                        rowSpan={subEntries.length}
                        className='px-6 py-4 whitespace-nowrap border-r border-gray-200'
                      >
                        <div className='flex flex-col'>
                          <span className='text-sm font-bold text-gray-900'>
                            {category}
                          </span>
                          <span className='text-xs text-gray-500 mt-1'>
                            Total:{' '}
                            <span className='font-medium text-green-600'>
                              {formatEUR(data.total_balance)}
                            </span>
                          </span>
                        </div>
                      </td>
                    )}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-700'>
                        {subCategory}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right'>
                      <span className='text-sm font-medium text-gray-900'>
                        {formatEUR(amount)}
                      </span>
                    </td>
                  </tr>
                ))
              }
            )}
          </tbody>
        </table>
      </div>

      <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>
            {Object.keys(mockPortfolioSummary).length} catégories
          </span>
          <span className='text-sm font-semibold text-gray-800'>
            Total Patrimoine :{' '}
            {formatEUR(
              Object.values(mockPortfolioSummary).reduce(
                (sum, cat) => sum + cat.total_balance,
                0
              )
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashTable
