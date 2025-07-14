import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { formatAmount } from '../../utils/helpers'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

function DashGraph() {
  // Mock data matching DashTable structure
  const mockPortfolioSummary = {
    Épargne: {
      total_balance: 200000,
      sub_categories: {
        'Livret A/LDDS': 5000,
        'Assurance-Vie': 8000,
        'PEL/CEL': 2000,
        Espèces: 5000,
        PEA: 150000,
        'PEE/PERCO': 30000
      }
    },
    Immobilier: {
      total_balance: 287500,
      sub_categories: {
        'Immobilier de Jouissance': 200000,
        SCPI: 50000,
        'Immobilier locatif': 32000,
        'Crowdfunding Immobilier': 5500
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

  // Calculate total and percentages
  const totalPortfolio = Object.values(mockPortfolioSummary).reduce(
    (sum, category) => sum + category.total_balance,
    0
  )

  const chartData = Object.entries(mockPortfolioSummary).map(
    ([name, data]) => ({
      name,
      value: data.total_balance,
      percentage: data.total_balance / totalPortfolio
    })
  )

  // Colors for each category
  const colors = ['#10B981', '#3B82F6', '#F59E0B']

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
        hoverBorderWidth: 3
      }
    ]
  }

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We'll create our own legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed
            return ` ${formatAmount(value)}`
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 18
        },
        formatter: (value) => {
          const percentage = ((value / totalPortfolio) * 100).toFixed(0)
          return `${percentage}%`
        }
      }
    }
  }

  return (
    <div className='bg-white shadow-lg overflow-hidden h-full relative'>
      <div className='flex flex-col lg:flex-row items-center gap-6 h-full'>
        {/* Pie Chart */}
        <div className='flex-shrink-0 flex-1' style={{ minHeight: '450px' }}>
          <Pie data={data} options={options} />
        </div>
      </div>
      {/* Legends */}
      <div className='absolute bottom-4 left-4'>
        <div className='flex flex-col gap-1'>
          {chartData.map((item, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: colors[index] }}
              />
              <span className='text-body text-gray-600'>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashGraph
