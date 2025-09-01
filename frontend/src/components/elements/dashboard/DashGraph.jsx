import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatAmount } from '../../../utils/helpers';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function DashGraph({ portfolioSummary, loading, error }) {
  // Calculate total and percentages
  const totalPortfolio = Object.values(portfolioSummary).reduce(
    (sum, category) => sum + category.total_balance,
    0
  );

  // Define the desired category order
  const categoryOrder = ['Épargne', 'Immobilier', 'Actions', 'Autres'];

  // Sort the chart data by the defined order
  const chartData = Object.entries(portfolioSummary)
    .sort(([categoryA], [categoryB]) => {
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);

      // If category not found in order, put it at the end
      const orderA = indexA === -1 ? categoryOrder.length : indexA;
      const orderB = indexB === -1 ? categoryOrder.length : indexB;

      return orderA - orderB;
    })
    .map(([name, data]) => ({
      name,
      value: data.total_balance,
      percentage: data.total_balance / totalPortfolio,
    }));

  // Colors for each category (maintain same order as categoryOrder)
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  // Chart.js data configuration
  const data = {
    labels: chartData.map((item) => item.name),
    datasets: [
      {
        data: chartData.map((item) => item.value),
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBackgroundColor: colors.map((color) => color + 'CC'),
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
          size: 18,
        },
        formatter: (value) => {
          const percentage = ((value / totalPortfolio) * 100).toFixed(0);
          return `${percentage}%`;
        },
      },
    },
  };

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
    <div className='bg-white shadow-lg overflow-hidden h-full relative'>
      {error && (
        <div className='px-4 md:px-6 py-3 bg-yellow-50 border-l-4 border-yellow-400'>
          <p className='text-sm text-yellow-700'>{error}</p>
        </div>
      )}
      <div className='flex flex-col items-center gap-4 md:gap-6 h-full p-4 md:p-6'>
        {/* Pie Chart */}
        <div
          className='flex-shrink-0 w-full h-100'
          style={{ minHeight: '300px', maxHeight: '550px' }}
        >
          <Pie data={data} options={options} />
        </div>

        {/* Legends - Below chart on mobile, positioned on desktop */}
        <div className='flex flex-col gap-1 md:absolute md:bottom-4 md:left-4'>
          {chartData.map((item, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full flex-shrink-0'
                style={{ backgroundColor: colors[index] }}
              />
              <span className='text-sm md:text-body text-gray-600'>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashGraph;
