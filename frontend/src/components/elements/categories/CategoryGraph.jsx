import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatAmount } from '../../../utils/helpers';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function CategoryGraph({
  categoryName,
  categorySummary,
  displayTotalCategory,
  loading,
  error,
  viewMode = 'graph',
  onViewModeChange,
}) {
  if (displayTotalCategory === 0) {
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

  // Calculate total value from the formatted display total
  const totalCategory = Object.values(categorySummary).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Prepare chart data from categorySummary
  const chartData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value,
    percentage: value / totalCategory,
  }));

  // Sort by value (descending) for better visual hierarchy
  chartData.sort((a, b) => b.value - a.value);

  // Generate colors - using a nice color palette for epargne categories
  const colors = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  // Chart.js data configuration
  const data = {
    labels: chartData.map((item) => item.name),
    datasets: [
      {
        data: chartData.map((item) => item.value),
        backgroundColor: colors.slice(0, chartData.length),
        borderColor: 'transparent',
        borderWidth: 2,
        hoverBackgroundColor: colors
          .slice(0, chartData.length)
          .map((color) => color + 'CC'),
        hoverBorderWidth: 3,
      },
    ],
  };

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create our own legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            return ` ${formatAmount(value)}`;
          },
        },
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value) => {
          const percentage = ((value / totalCategory) * 100).toFixed(0);
          return percentage > 5 ? `${percentage}%` : ''; // Only show percentage if > 5%
        },
      },
    },
  };

  return (
    <div className='bg-white-100 shadow-lg overflow-hidden h-full relative'>
      {error && (
        <div className='px-4 md:px-6 py-3 bg-alerts-warning-light border-l-4 border-alerts-warning'>
          <p className='text-sm text-alerts-warning-dark'>{error}</p>
        </div>
      )}
      <div className='flex flex-col h-full'>
        {/* Chart Container */}
        <div className='flex flex-col items-center gap-4 md:gap-6 flex-1 p-4 md:p-6'>
          {/* Pie Chart */}
          <div
            className='flex-shrink-0 w-full h-full'
            style={{ minHeight: '300px', maxHeight: '400px' }}
          >
            <Pie data={data} options={options} />
          </div>

          {/* Legends */}
          <div className='flex flex-wrap gap-x-4 gap-y-1 justify-center'>
            {chartData.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full flex-shrink-0'
                  style={{ backgroundColor: colors[index] }}
                />
                <span className='text-xs md:text-sm text-black-75'>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with view switch */}
        <div className='px-3 md:px-6 py-3 md:py-4 bg-white-100 border-t border-black-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm text-black-50'>
                {Object.keys(categorySummary).length} comptes
              </span>
              <span className='text-xs md:text-sm font-semibold text-black-85'>
                Total {categoryName} : {displayTotalCategory}
              </span>
            </div>
            <div className='flex items-center bg-white-100 rounded-md border border-black-25 overflow-hidden'>
              <button
                onClick={() => onViewModeChange && onViewModeChange('table')}
                className={`px-3 py-1 text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-theme-primary text-white'
                    : 'text-black-75 hover:text-black-100 hover:bg-black-5'
                }`}
              >
                Table
              </button>
              <div className='w-px h-4 bg-black-25'></div>
              <button
                onClick={() => onViewModeChange && onViewModeChange('graph')}
                className={`px-3 py-1 text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-theme-primary text-white'
                    : 'text-black-75 hover:text-black-100 hover:bg-black-5'
                }`}
              >
                Graph
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryGraph;
