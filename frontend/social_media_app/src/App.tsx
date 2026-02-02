import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import { ProtectedRoute } from './routes/ProtectedRoute'
import Feed from './pages/Feed'
import EditPost from './pages/EditPost'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login page */}
          <Route path='/' element={<Navigate to="/login" replace />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/feed' element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path='/edit/:id' element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
          {/* Catch-all: redirect unknown routes to login */}
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
