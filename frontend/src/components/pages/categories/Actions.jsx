import { useEffect, useState } from 'react';
import MainHeader from '../../headers/MainHeader';
import Layout from '../../layout/Layout';
import { useNavigate } from 'react-router-dom';
import { authorizedRequest } from '../../../utils/authorizedRequest';
import { formatAmount } from '../../../utils/helpers';
import CategoryTable from '../../elements/categories/CategoryTable';
import CategoryGraph from '../../elements/categories/CategoryGraph';

function Actions() {
  const [actionsData, setActionsData] = useState({});
  const [totalActions, setTotalActions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  let navigate = useNavigate();

  useEffect(() => {
    fetchActionsData();
  }, []);

  const fetchActionsData = async () => {
    try {
      const response = await authorizedRequest({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL}/api/actions`,
      });

      if (response.data.success) {
        setActionsData(response.data.actions_summary || {});
        setTotalActions(response.data.total_actions || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/connexion');
      } else {
        setError('Impossible de charger les données de la catégorie Actions');
        setActionsData({});
        setTotalActions(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const actionsSummary = Object.keys(actionsData).length > 0 ? actionsData : {};
  const displayTotalActions = totalActions > 0 ? formatAmount(totalActions) : 0;

  return (
    <Layout header={<MainHeader />}>
      <h2>Actions</h2>

      {displayTotalActions === 0 ? (
        <div className='text-left'>
          <span className='text-gray-500'>
            Aucune donnée de portefeuille disponible.
          </span>
        </div>
      ) : (
        <div className='w-full'>
          {viewMode === 'table' ? (
            <CategoryTable
              categoryName={'Actions'}
              categorySummary={actionsSummary}
              displayTotalCategory={displayTotalActions}
              loading={loading}
              error={error}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDataUpdate={fetchActionsData}
            />
          ) : (
            <CategoryGraph
              categoryName={'Actions'}
              categorySummary={actionsSummary}
              displayTotalCategory={displayTotalActions}
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

export default Actions;
