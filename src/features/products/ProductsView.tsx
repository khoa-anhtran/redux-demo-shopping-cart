import { useDispatch } from "react-redux"
import { Product, useGetProductsQuery } from "./productsSlice"
import { productAdded } from "../cart/cartSlice"
import { useEffect, useRef, useState } from "react"
import { hide, showError, showLoading, showSuccess } from "../ui/statusOverlaySlice"

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: () => void }) => {
    return <article className="product-card" role="article" aria-label={product.title}>
        <div className="product-card__media">
            <img src={product.thumbnail} alt={product.title} role="image" />
        </div>
        <div className="product-card__body">
            <h3 className="product-card__title">{product.title}</h3>
            <div className="product-card__price">
                {product.price}<span className="currency"> $</span>
            </div>
        </div>
        <button className="product-card__actions" onClick={onAddToCart}>Add to cart</button>
    </article>
}

const ProductsView = () => {
    const { data: products, isFetching, isError, error, isSuccess } = useGetProductsQuery()
    const dispatch = useDispatch()

    const onAddToCart = (productId: number) => {
        dispatch(productAdded({ productId }))
        dispatch(showSuccess('Done', 'Your product have added'))
    }

    const shownLoading = useRef(false)

    useEffect(() => {
        if (isFetching) {
            if (!shownLoading.current) {
                dispatch(showLoading('Loading …'))
                shownLoading.current = true
            }
        } else {
            if (shownLoading.current) {
                dispatch(hide())
                shownLoading.current = false
            }
        }
    }, [isFetching, dispatch])

    useEffect(() => {
        if (isError) {
            dispatch(hide())
            const msg =
                (error as any)?.error ??
                (error as any)?.data?.message ??
                (error as Error)?.message ??
                'Something went wrong'
            dispatch(showError('Failed to load products', msg))
        }
    }, [isError, error, dispatch])


    if (isSuccess) {
        return <section className="product-section">
            <div className="grid">
                {Object.values(products).map(product =>
                    <ProductCard product={product} key={product.id}
                        onAddToCart={() => onAddToCart(product.id)}
                    />)}
            </div>
        </section>
    }


    return <section className="product-section"></section>

}

export default ProductsView