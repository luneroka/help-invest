import { formatAmount } from '../../../utils/helpers';

function DashTable({ portfolioSummary, displayTotalEstate, loading, error }) {
  if (displayTotalEstate === 0) {
    return (
      <div className='bg-white-100 shadow-lg overflow-hidden'>
        <div className='p-6 text-center'>
          <span className='text-black-50'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='bg-white-100 shadow-lg overflow-hidden'>
        <div className='p-6 text-center'>
          <span className='text-black-50'>
            Chargement des données du portefeuille...
          </span>
        </div>
      </div>
    );
  }

  // Define the desired category order
  const categoryOrder = ['Épargne', 'Immobilier', 'Actions', 'Autres'];

  // Sort portfolio entries by the defined order
  const sortedPortfolioEntries = Object.entries(portfolioSummary).sort(
    ([categoryA], [categoryB]) => {
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);

      // If category not found in order, put it at the end
      const orderA = indexA === -1 ? categoryOrder.length : indexA;
      const orderB = indexB === -1 ? categoryOrder.length : indexB;

      return orderA - orderB;
    }
  );

  return (
    <div className='shadow-lg overflow-hidden'>
      {error && (
        <div className='px-4 md:px-6 py-3 bg-yellow-50 border-l-4 border-yellow-400'>
          <p className='text-sm text-yellow-700'>{error}</p>
        </div>
      )}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-black-10 table-fixed'>
          <thead className='bg-theme-primary text-white sticky top-0 z-10'>
            <tr>
              <th className='w-1/3 px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider'>
                Catégorie
              </th>
              <th className='w-1/3 px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider'>
                Compte
              </th>
              <th className='w-1/3 px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium uppercase tracking-wider'>
                Montant
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className='overflow-y-auto max-h-[400px] md:max-h-[550px]'>
        <table className='min-w-full table-fixed'>
          <tbody className='divide-y divide-black-10'>
            {sortedPortfolioEntries.map(([category, data], categoryIndex) => {
              const subEntries = Object.entries(data.sub_categories);
              return subEntries.map(([subCategory, amount], index) => (
                <tr
                  key={`${category}-${subCategory}`}
                  className={`hover:bg-black-5 transition-colors duration-150 ${
                    categoryIndex % 2 === 0 ? '' : ''
                  }`}
                >
                  {index === 0 && (
                    <td
                      rowSpan={subEntries.length}
                      className='w-1/3 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap border-r border-black-10 align-top hover:text-black-100'
                    >
                      <div className='flex flex-col max-w-full'>
                        <span className='text-xs md:text-body font-bold text-black-85 truncate'>
                          {category}
                        </span>
                        <span className='text-xs md:text-small font-medium text-theme-primary mt-1'>
                          {formatAmount(data.total_balance)}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className='w-1/3 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hover:text-black-100'>
                    <span className='text-xs md:text-sm text-black-75 truncate block'>
                      {subCategory}
                    </span>
                  </td>
                  <td className='w-1/3 px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-right hover:text-black-100'>
                    <span className='text-xs md:text-sm font-medium text-black-85'>
                      {formatAmount(amount)}
                    </span>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className='px-3 md:px-6 py-3 md:py-4 bg-white-100 border-t border-black-10'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
          <span className='text-xs md:text-sm text-black-50'>
            {sortedPortfolioEntries.length} catégories
          </span>
          <span className='text-xs md:text-sm font-semibold text-black-85'>
            Total Patrimoine : {displayTotalEstate}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashTable;
