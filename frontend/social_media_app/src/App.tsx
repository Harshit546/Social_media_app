import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path='/edit/:id' element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
