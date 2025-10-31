import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import Header from './component/Header'
import CartView from './features/cart/CartView'
import ProductsView from './features/products/ProductsView'
import MyConfirmDialog from './features/ui/MyConfirmDialog'
import MyStatusOverlay from './features/ui/MyStatusOverlay'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { JSX } from 'react'
import LoginView from './features/auth/LoginView'
import { selectAuth } from './features/auth/authSlice'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<LoginView />} />
      </Routes>
    </>
  )
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const userId = useSelector(selectAuth).userId

  if (!userId) return <Navigate to="/login" replace />
  return children
}


function Home() {
  return <>
    <Header></Header>
    <ProductsView />
    <CartView />
    <MyConfirmDialog />
    <MyStatusOverlay />
  </>
}


export default App
