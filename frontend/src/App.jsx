import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Dashboard from './components/pages/Dashboard'
import Login from './components/pages/Login'
import Register from './components/pages/Register'
import Transactions from './components/pages/Transactions'
import History from './components/pages/History'
import Profil from './components/pages/Profil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/connexion' element={<Login />} />
        <Route path='/inscription' element={<Register />} />
        <Route path='/profil' element={<Profil />} />
        <Route path='/opérations' element={<Transactions />} />
        <Route path='/historique' element={<History />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
