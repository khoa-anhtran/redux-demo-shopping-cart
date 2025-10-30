import { configureStore, Store } from '@reduxjs/toolkit'
import { AppTestStore, makeProviders, withCart } from '@/test/utils/testStore';
import Header from './Header';
import { render, screen } from '@testing-library/react';
import { productAdded, quantityAdjusted, quantityIncreased, selectCartTotalQty } from '@/features/cart/cartSlice';
import { act } from 'react';
import userEvent from '@testing-library/user-event';

describe("cart btn test", () => {
    let store: AppTestStore;

    const setup = () => {
        const Wrapper = makeProviders(store)
        render(<Header />, { wrapper: Wrapper })
    }

    store = withCart({
        1: {
            id: 1,
            addedAt: new Date().toISOString(),
            quantity: 4
        },
    },)

    test('display cart btn in header', () => {
        setup()

        const cartBtn = screen.getByRole('button', { name: /cart/i })

        expect(cartBtn).toBeInTheDocument()
    })

    test('display total quantity in cart', () => {
        setup()

        const badge = screen.getByRole('status', { name: /total quantity/i })
        const totalQty = selectCartTotalQty(store.getState())

        expect(Number(badge.textContent)).toEqual(totalQty)
    })

    test('display updated total quantity in cart when quantity changed', () => {
        setup()

        const badge = screen.getByRole('status', { name: /total quantity/i })
        const lastTotalQty = Number(badge.textContent)

        act(() => store.dispatch(quantityIncreased({ productId: 1 })))

        expect(Number(badge.textContent)).toEqual(lastTotalQty + 1)
    })

    test('display updated total quantity in cart when product added', () => {
        setup()

        const badge = screen.getByRole('status', { name: /total quantity/i })
        const lastTotalQty = Number(badge.textContent)

        act(() => store.dispatch(productAdded({ productId: 2 })))

        expect(Number(badge.textContent)).toEqual(lastTotalQty + 1)
    })

    test('display cart view when click cart btn', async () => {
        setup()

        const cartBtn = screen.getByRole('button', { name: /cart/i })

        await userEvent.click(cartBtn)

        expect(store.getState().cart.open).toBe(true)
    })


})
