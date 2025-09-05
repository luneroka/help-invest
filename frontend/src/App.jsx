import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Login from './components/pages/auth/Login';
import Register from './components/pages/auth/Register';
import Profile from './components/pages/user/Profile';
import Dashboard from './components/pages/user/Dashboard';
import History from './components/pages/user/History';
import Transactions from './components/pages/Transactions';
import Epargne from './components/pages/categories/Epargne';
import Immo from './components/pages/categories/Immo';
import Autres from './components/pages/categories/Autres';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Actions from './components/pages/categories/Actions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/connexion' element={<Login />} />
          <Route path='/inscription' element={<Register />} />
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path='/profil'
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path='/épargne'
            element={
              <PrivateRoute>
                <Epargne />
              </PrivateRoute>
            }
          />
          <Route
            path='/immo'
            element={
              <PrivateRoute>
                <Immo />
              </PrivateRoute>
            }
          />
          <Route
            path='/actions'
            element={
              <PrivateRoute>
                <Actions />
              </PrivateRoute>
            }
          />
          <Route
            path='/autres'
            element={
              <PrivateRoute>
                <Autres />
              </PrivateRoute>
            }
          />
          <Route
            path='/opérations'
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path='/historique'
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
