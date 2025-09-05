import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Transactions from './components/pages/Transactions';
import History from './components/pages/History';
import Profile from './components/pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Epargne from './components/pages/Epargne';
import Immo from './components/pages/Immo';

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
            path='/epargne'
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
