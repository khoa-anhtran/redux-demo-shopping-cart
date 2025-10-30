import productsSlice, { Product, useGetProductsQuery } from "@/features/products/productsSlice"
import { render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { setupServer } from "msw/node"
import { rest } from "msw"

import { Provider } from "react-redux"
import ProductsView from "./ProductsView"
import { AppTestStore, makeProviders, withCart } from "@/test/utils/testStore"
import userEvent from "@testing-library/user-event"

describe("Product main page test", () => {

    let store: AppTestStore;

    const setup = () => {
        const Wrapper = makeProviders(store)
        render(<ProductsView />, { wrapper: Wrapper })
    }

    beforeEach(() => {
        store = withCart({
            1: {
                id: 1,
                addedAt: new Date().toISOString(),
                quantity: 4
            },
        },)
    })

    test("load data from hook when init", async () => {
        const Wrapper = makeProviders(store)
        const { result } = renderHook(() => useGetProductsQuery(), { wrapper: Wrapper })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data![1].title).toContain('Essence')
    })

    test("display data from hook when init", async () => {
        setup()

        waitFor(() => {
            expect(screen.getByAltText(
                /Essence Mascara Lash Princess/i
            ))

            expect(screen.getByText(/Essence Mascara Lash Princess/i))

            expect(screen.getByText(
                /9.99/
            ))
        })

    })

    test("display add to cart btn", async () => {
        setup()

        const row = await screen.findByRole('article', { name: /Eyeshadow Palette with Mirror/i })
        const addToCartBtn = within(row).getByRole("button", { name: /add to cart/i })

        expect(addToCartBtn).toBeInTheDocument()
    })

    test("add product into cart when click add to cart btn", async () => {
        setup()

        const row = await screen.findByRole('article', { name: /Eyeshadow Palette with Mirror/i })
        const addToCartBtn = within(row).getByRole("button", { name: /add to cart/i })

        expect(store.getState().cart.ids).toContain(1)

        await userEvent.click(addToCartBtn)

        expect(store.getState().cart.ids).toContain(2)
    })

    test("increase quantity of exist product when click add to cart btn", async () => {
        setup()

        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })
        const addToCartBtn = within(row).getByRole("button", { name: /add to cart/i })

        const lastQty = store.getState().cart.entities[1].quantity

        await userEvent.click(addToCartBtn)

        expect(store.getState().cart.entities[1].quantity).toEqual(lastQty + 1)
    })
})


