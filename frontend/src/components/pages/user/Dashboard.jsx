import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../../utils/helpers';
import Layout from '../../layout/Layout';
import MainHeader from '../../headers/MainHeader';
import DashTable from '../../elements/dashboard/DashTable';
import DashGraph from '../../elements/dashboard/DashGraph';
import { authorizedRequest } from '../../../utils/authorizedRequest';

function Dashboard() {
  const [portfolioData, setPortfolioData] = useState({});
  const [totalEstate, setTotalEstate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  let navigate = useNavigate();

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`,
      });

      if (response.data.success) {
        setPortfolioData(response.data.portfolio_summary || {});
        setTotalEstate(response.data.total_estate || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError('Impossible de charger les données du portefeuille');
        setPortfolioData({});
        setTotalEstate(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const portfolioSummary =
    Object.keys(portfolioData).length > 0 ? portfolioData : {};
  const displayTotalEstate = totalEstate > 0 ? formatAmount(totalEstate) : 0;

  return (
    <Layout header={<MainHeader />}>
      <h2>Répartition du Patrimoine</h2>

      {displayTotalEstate === 0 ? (
        <div className='text-left'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      ) : (
        <div className='flex flex-col xl:flex-row gap-8 xl:gap-16 justify-between'>
          <div className='w-full xl:w-1/2'>
            <div className='h-full mb-8 xl:mb-16'>
              <DashGraph
                portfolioSummary={portfolioSummary}
                loading={loading}
                error={error}
              />
            </div>
          </div>
          <div className='w-full xl:w-1/2'>
            <DashTable
              portfolioSummary={portfolioSummary}
              displayTotalEstate={displayTotalEstate}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;
