import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedRequest } from '../../../utils/authorizedRequest';
import { formatAmount } from '../../../utils/helpers';
import Layout from '../../layout/Layout';
import MainHeader from '../../headers/MainHeader';
import CategoryTable from '../../elements/categories/CategoryTable';
import CategoryGraph from '../../elements/categories/CategoryGraph';

function Autres() {
  const [autresData, setAutresData] = useState({});
  const [totalAutres, setTotalAutres] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  let navigate = useNavigate();

  useEffect(() => {
    fetchAutresData();
  }, []);

  const fetchAutresData = async () => {
    try {
      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/autres`,
      });

      if (response.data.success) {
        setAutresData(response.data.autres_summary || {});
        setTotalAutres(response.data.total_autres || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError('Impossible de charger les données de la catégorie Autres');
        setAutresData({});
        setTotalAutres(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const autresSummary = Object.keys(autresData).length > 0 ? autresData : {};
  const displayTotalAutres = totalAutres > 0 ? formatAmount(totalAutres) : 0;

  return (
    <Layout header={<MainHeader />}>
      <h2>Autres</h2>

      {displayTotalAutres === 0 ? (
        <div className='text-left'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      ) : (
        <div className='w-full'>
          {viewMode === 'table' ? (
            <CategoryTable
              categoryName={'Autres'}
              categorySummary={autresSummary}
              displayTotalCategory={displayTotalAutres}
              loading={loading}
              error={error}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDataUpdate={fetchAutresData}
            />
          ) : (
            <CategoryGraph
              categoryName={'Autres'}
              categorySummary={autresSummary}
              displayTotalCategory={displayTotalAutres}
              loading={loading}
              error={error}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}
        </div>
      )}
    </Layout>
  );
}

export default Autres;
