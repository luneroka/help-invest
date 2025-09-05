import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedRequest } from '../../utils/authorizedRequest';
import { formatAmount } from '../../utils/helpers';
import Layout from '../layout/Layout';
import MainHeader from '../headers/MainHeader';
import CategoryTable from '../elements/categories/CategoryTable';
import CategoryGraph from '../elements/categories/CategoryGraph';

function Immo() {
  const [immoData, setImmoData] = useState({});
  const [totalImmo, setTotalImmo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  let navigate = useNavigate();

  useEffect(() => {
    fetchImmoData();
  }, []);

  const fetchImmoData = async () => {
    try {
      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/immo`,
      });

      if (response.data.success) {
        setImmoData(response.data.immo_summary || {});
        setTotalImmo(response.data.total_immo || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError("Impossible de charger les données d'immo");
        setImmoData({});
        setTotalImmo(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const immoSummary = Object.keys(immoData).length > 0 ? immoData : {};
  const displayTotalImmo = totalImmo > 0 ? formatAmount(totalImmo) : 0;

  return (
    <Layout header={<MainHeader />}>
      <h2>Immobilier</h2>

      {displayTotalImmo === 0 ? (
        <div className='text-left'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      ) : (
        <div className='w-full'>
          {viewMode === 'table' ? (
            <CategoryTable
              categoryName={'Immobilier'}
              categorySummary={immoSummary}
              displayTotalCategory={displayTotalImmo}
              loading={loading}
              error={error}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDataUpdate={fetchImmoData}
            />
          ) : (
            <CategoryGraph
              categoryName={'Immobilier'}
              categorySummary={immoSummary}
              displayTotalImmo={displayTotalImmo}
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

export default Immo;
