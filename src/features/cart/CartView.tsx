import { useSelector } from "react-redux"
import { allItemsToggleSelected, cartCheckouted, cartItemsRemoved, cartToggled, fetchCart, itemToggleSelected, quantityAdjusted, quantityDecreased, quantityIncreased, selectAllCartItem, selectCartIsSelectAll, selectCartOpen, selectCartSelectedItems, selectCartStatus, selectCartTotalQty } from "./cartSlice"
import { Product, useGetProductsQuery } from "../products/productsSlice"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AppDispatch, askConfirm } from "@/app/store"
import { showSuccess } from "../ui/statusOverlaySlice"
import { roundTo } from "@/utils/math.helper"
import { useAppDispatch } from "@/app/hook"


const CartView = () => {
    const dispatch = useAppDispatch()

    const open = useSelector(selectCartOpen)
    const status = useSelector(selectCartStatus)
    const cartItems = useSelector(selectAllCartItem)
    const totalQty = useSelector(selectCartTotalQty)
    const selectedItems = useSelector(selectCartSelectedItems)
    const isSelectAll = useSelector(selectCartIsSelectAll)

    const { data: products, isFetching, error, isError } = useGetProductsQuery()

    const totalValues = useMemo(() => {
        if (products) {
            return selectedItems.reduce((sum, si) => {
                const item = cartItems.find(item => item.id == si)!
                const qty = item.quantity ?? 0
                const price = products[item.id].price ?? 0
                return sum + qty * price
            }, 0)
        }

        return 0;
    }, [products, selectedItems, cartItems])

    const previouslyFocused = useRef<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const isLoading = useRef(false)


    useEffect(() => {
        if (status == "idle" && !isLoading.current) {
            isLoading.current = true
            dispatch(fetchCart())
        }
    }, [status, dispatch])

    // lock scroll & manage focus
    useEffect(() => {
        if (!open) return;

        previouslyFocused.current = document.activeElement as HTMLElement | null;

        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        // focus first focusable inside dialog
        const id = window.setTimeout(() => {
            const el = modalRef.current;
            if (!el) return;
            const firstFocusable = el.querySelector<HTMLElement>(
                'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        }, 0);

        return () => {
            window.clearTimeout(id);
            document.documentElement.style.overflow = prevOverflow;
            previouslyFocused.current?.focus();
        };
    }, [open]);

    const onIncrease = useCallback((productId: number) => {
        dispatch(quantityIncreased({ productId }))
    }, [dispatch, quantityIncreased])

    const onDecrease = useCallback(async (productId: number, currentQty: number) => {
        if (currentQty == 1) {
            const isConfirmed = await askConfirm(dispatch as AppDispatch, {
                title: 'Confirm Remove Item',
                description: 'This cannot be undone.',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
            })

            if (isConfirmed) {
                dispatch(cartItemsRemoved({ productIds: [productId] }))
                dispatch(showSuccess('Done', 'Remove successfully'))
            }
        } else
            dispatch(quantityDecreased({ productId }))

    }, [dispatch, quantityDecreased])

    const onSelectItem = useCallback((productId: number) => {
        dispatch(itemToggleSelected({ productId }))
    }, [dispatch, itemToggleSelected])

    const onSelectAllItems = useCallback(() => {
        dispatch(allItemsToggleSelected())
    }, [dispatch, allItemsToggleSelected])

    const onClickCloseCart = useCallback(() => {
        dispatch(cartToggled())
    }, [dispatch, cartToggled])

    const onCheckout = useCallback(async () => {
        const isConfirmed = await askConfirm(dispatch as AppDispatch, {
            title: 'Confirm Checkout',
            description: 'This cannot be undone.',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
        })

        if (isConfirmed) {
            dispatch(cartCheckouted())

            dispatch(showSuccess('Done', 'Checkout successfully'))

        }
    }, [dispatch, cartCheckouted, askConfirm])

    const onRemoveCartItems = useCallback(async (productIds: number[]) => {
        const isConfirmed = await askConfirm(dispatch as AppDispatch, {
            title: 'Confirm Remove Items',
            description: 'This cannot be undone.',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
        })

        if (isConfirmed) {
            dispatch(cartItemsRemoved({ productIds }))
            dispatch(showSuccess('Done', 'Remove successfully'))
        }
    }, [dispatch, cartCheckouted, askConfirm])

    let content

    if (isFetching) {
        content = <div>Loading ...</div>
    }

    if (isError) {
        content = <div>{error.toString()}</div>
    }

    if (products) {
        if (cartItems.length == 0)
            content = <p className="empty">Cart is empty</p>
        else
            content = <div className="cart-items">{cartItems.map(item => {
                const product = products[item.id]

                if (!product)
                    throw new Error("Loi product voi cart ko khop id")

                return <CartItem
                    key={product.id}
                    product={product}
                    onRemoveCartItem={(id) => onRemoveCartItems([id])}
                    onDecrease={onDecrease}
                    onIncrease={onIncrease}
                    onSelectItem={onSelectItem}
                    quantity={item.quantity}
                    isSelected={selectedItems.includes(item.id)}
                />
            })}</div>
    }

    return <div
        className={`cart-modal ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={onClickCloseCart}
        ref={modalRef}>
        <div className="cart-modal__overlay"></div>
        <aside className="cart-modal__panel" onClick={(e) => {
            e.stopPropagation()
        }}>
            <header className="cart-modal__header">
                <button className="cart-close" aria-label="Close" onClick={onClickCloseCart}>✕</button>
                <div id="cart-title" className="cart-title">Cart (<span role="status" aria-live="polite" aria-label="total items">{totalQty}</span>)
                </div>
            </header>

            <div className="cart-modal__body">
                <div className="cart-actions">
                    <div className="cart-actions__inp">
                        <input
                            type="checkbox"
                            name=""
                            id="selectAllItems"
                            role="checkbox"
                            aria-label="select all items"
                            disabled={cartItems.length === 0}
                            checked={isSelectAll}
                            onChange={onSelectAllItems} />
                        <label htmlFor="selectAllItems">Select All</label>
                    </div>
                    <div>
                        <button
                            className={`remove-all-btn ${selectedItems.length == 0 ? "is-disabled" : ""}`}
                            role="button" aria-label="remove all button"
                            disabled={selectedItems.length == 0}
                            onClick={() => onRemoveCartItems(selectedItems)}
                        >Remove All</button>
                    </div>
                </div>
                {content}
            </div>

            <footer className="cart-modal__footer">
                <div className="total">
                    <span className="label">Total:</span>
                    <span
                        className="amount"
                        role="status"
                        aria-live="polite"
                        aria-label="total values">
                        {roundTo(totalValues, 2).toLocaleString()}
                    </span>
                    <span className="currency"> $</span>
                </div>
                <button className={`checkout-btn ${selectedItems.length == 0 ? "is-disabled" : ""} `} onClick={onCheckout} disabled={selectedItems.length == 0}>Checkout</button>
            </footer>
        </aside>
    </div>
}

type CartItemProps = {
    product: Product;
    quantity: number;
    onDecrease: (id: number, qty: number) => void;
    onIncrease: (id: number) => void;
    onSelectItem: (id: number) => void;
    onRemoveCartItem: (id: number) => void;
    isSelected: boolean
}

const CartItem = ({ product, onDecrease, onIncrease, onRemoveCartItem, quantity, onSelectItem, isSelected }: CartItemProps) => {
    return <article className="cart-item" role="article" aria-label={product.title} key={product.id}>
        <div className="cart-item__checkbox">
            <input type="checkbox" name="" id="" role="checkbox" aria-label="toggle select item" checked={isSelected} onChange={() => onSelectItem(product.id)} />
        </div>

        <div className="cart-item__media">
            <img src={product?.thumbnail} alt={product.title} />
        </div>

        <div className="cart-item__info">
            <h3 className="cart-item__title">{product.title}</h3>
            <div className="cart-item__price">
                {product?.price}<span className="currency"> $</span>
            </div>
        </div>

        <div className="cart-item__qty" aria-label="Quantity">
            <button
                className="btn"
                type="button"
                aria-label="Decrease quantity"
                data-testid="qty-dec"
                onClick={() => onDecrease(product.id, quantity)}
            >−</button>

            <div className="value" aria-live="polite" data-testid="qty-value">{quantity}</div>

            <button
                className="btn"
                type="button"
                aria-label="Increase quantity"
                data-testid="qty-inc"
                onClick={() => onIncrease(product.id)}
            >+</button>
        </div>

        <button
            className="cart-item__remove"
            type="button"
            aria-label="Remove Item"
            onClick={() => onRemoveCartItem(product.id)}
        >✕</button>
    </article>
}


export default CartView