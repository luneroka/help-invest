import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedRequest } from '../../utils/authorizedRequest';
import { formatAmount } from '../../utils/helpers';
import Layout from '../layout/Layout';
import MainHeader from '../headers/MainHeader';
import EpargneGraph from '../elements/epargne/EpargneGraph';
import EpargneTable from '../elements/epargne/EpargneTable';

function Epargne() {
  const [epargneData, setEpargneData] = useState({});
  const [totalEpargne, setTotalEpargne] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  let navigate = useNavigate();

  useEffect(() => {
    fetchEpargneData();
  }, []);

  const fetchEpargneData = async () => {
    try {
      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/epargne`,
      });

      if (response.data.success) {
        setEpargneData(response.data.epargne_summary || {});
        setTotalEpargne(response.data.total_epargne || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError("Impossible de charger les données d'épargne");
        setEpargneData({});
        setTotalEpargne(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const epargneSummary = Object.keys(epargneData).length > 0 ? epargneData : {};
  const displayTotalEpargne = totalEpargne > 0 ? formatAmount(totalEpargne) : 0;

  return (
    <Layout header={<MainHeader />}>
      <h2>Épargne</h2>

      {displayTotalEpargne === 0 ? (
        <div className='text-left'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      ) : (
        <div className='flex flex-col xl:flex-row gap-8 xl:gap-16 justify-between'>
          <div className='w-full xl:w-1/2'>
            <div className='h-full mb-8 xl:mb-16'>
              <EpargneGraph
                epargneSummary={epargneSummary}
                loading={loading}
                error={error}
              />
            </div>
          </div>
          <div className='w-full xl:w-1/2'>
            <EpargneTable
              epargneSummary={epargneSummary}
              displayTotalEpargne={displayTotalEpargne}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Epargne;
