import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Dashboard from './components/pages/Dashboard'
import Login from './components/pages/Login'
import Register from './components/pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
