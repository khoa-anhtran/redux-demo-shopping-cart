import { useDispatch } from 'react-redux'
import './App.css'
import Header from './component/Header'
import CartView from './features/cart/CartView'
import ProductsView from './features/products/ProductsView'
import MyConfirmDialog from './features/ui/MyConfirmDialog'
import MyStatusOverlay from './features/ui/MyStatusOverlay'

function App() {
  const dispatch = useDispatch()


  return (
    <>
      <Header></Header>
      <ProductsView />
      <CartView />
      <MyConfirmDialog />
      <MyStatusOverlay />
    </>
  )
}

export default App
