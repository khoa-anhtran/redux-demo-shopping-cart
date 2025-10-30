import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from "@testing-library/user-event"

import CartView from "./CartView"
import { cartCheckouted, cartToggled, itemToggleSelected, selectCartTotalQty } from "./cartSlice"
import { AppTestStore, makeProviders, withCart } from "@/test/utils/testStore"

let store: AppTestStore;

const setup = () => {
    const Wrapper = makeProviders(store)
    render(<CartView />, { wrapper: Wrapper })
}

describe("display UI with cart", () => {

    beforeEach(() => {
        store = withCart({
            1: {
                id: 1,
                addedAt: new Date().toISOString(),
                quantity: 4
            },
        },)

        store.dispatch(cartToggled())

        setup()
    })

    test("display cart items when cart sidebar open", async () => {
        expect(await screen.findByText(
            /Essence Mascara Lash Princess/i
        ))
    })

    test("display the number of cart items", async () => {
        const totalItemsElm = screen.getByRole("status", { name: /total items/i })
        const totalQty = selectCartTotalQty(store.getState())

        expect(Number(totalItemsElm.textContent)).toEqual(totalQty)
    })

    test("display checkout btn", async () => {
        expect(screen.getByRole("button", { name: /checkout/i })).toBeInTheDocument()
    })

    test("display close cart btn", async () => {
        const closeBtn = screen.getByLabelText('Close')

        expect(closeBtn).toBeInTheDocument()
    })

    test("display confirm dialog when user click checkout btn", async () => {
        const checkoutBtn = await screen.findByRole("button", { name: /checkout/i })

        act(() => store.dispatch(itemToggleSelected({ productId: 1 })))

        await userEvent.click(checkoutBtn)

        const confirmDialog = await screen.findByRole("dialog", { name: /Confirm Checkout/i })

        expect(confirmDialog).toBeInTheDocument()
    })

    test("display confirm dialog when user click remove cart item", async () => {
        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const removeBtn = within(row).getByRole('button', {
            name: /Remove Item/i,
        })

        await userEvent.click(removeBtn)

        const confirmDialog = await screen.findByRole("dialog", { name: /Confirm Remove Item/i })

        expect(confirmDialog).toBeInTheDocument()
    })

    test("display confirm dialog when user decrease quantity to 0", async () => {
        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const desBtn = within(row).getByRole('button', {
            name: /decrease quantity/i,
        })

        await userEvent.click(desBtn)
        await userEvent.click(desBtn)
        await userEvent.click(desBtn)
        await userEvent.click(desBtn)

        const confirmDialog = await screen.findByRole("dialog", { name: /Confirm Remove Item/i })

        expect(confirmDialog).toBeInTheDocument()
    })

    test("disable checkout button when no item is selected", async () => {
        const checkoutBtn = await screen.findByRole("button", { name: /checkout/i })

        expect(checkoutBtn).toBeDisabled()
    })

    test("disable remove all button when no item is selected", async () => {
        const removeAllBtn = await screen.findByRole("button", { name: /remove all button/i })

        expect(removeAllBtn).toBeDisabled()
    })

    test("disable select all checkbox when no item in cart", async () => {
        const row1 = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const checkbox1 = within(row1).getByRole('checkbox', {
            name: /toggle select item/i,
        })

        await userEvent.click(checkbox1)

        act(() => store.dispatch(cartCheckouted()))

        const selectAllCheckbox = await screen.findByRole("checkbox", { name: /select all items/i })

        expect(selectAllCheckbox).toBeDisabled()
    })

    test("display confirm dialog when user click remove all button", async () => {
        const removeAllBtn = await screen.findByRole("button", { name: /remove all button/i })

        const row1 = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const checkbox1 = within(row1).getByRole('checkbox', {
            name: /toggle select item/i,
        })

        await userEvent.click(checkbox1)

        await userEvent.click(removeAllBtn)

        const confirmDialog = await screen.findByRole("dialog", { name: /Confirm Remove Items/i })

        expect(confirmDialog).toBeInTheDocument()
    })
})

describe("user interact with cart", () => {

    beforeEach(() => {
        store = withCart({
            1: {
                id: 1,
                addedAt: new Date().toISOString(),
                quantity: 4
            },
            2: {
                id: 2,
                addedAt: new Date().toISOString(),
                quantity: 1
            },
        },)

        store.dispatch(cartToggled())

        setup()
    })

    test("close cart dialog when user click cart btn", async () => {

        const closeBtn = screen.getByLabelText('Close')

        await userEvent.click(closeBtn)

        expect(store.getState().cart.open).toBe(false)
    })

    test("close cart dialog when user click outside", async () => {
        const cartDialog = screen.getByRole('dialog')

        await userEvent.click(cartDialog)

        expect(store.getState().cart.open).toBe(false)
    })

    test("increase quantity when user click plus btn", async () => {

        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const incBtn = within(row).getByRole('button', {
            name: /increase quantity/i,
        })

        const qty = within(row).getByTestId('qty-value') // or a role/label if you expose one
        const before = Number(qty.textContent)

        await userEvent.click(incBtn)

        expect(Number(qty.textContent)).toBe(before + 1)
    })

    test("decrease quantity when user click plus btn", async () => {

        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const desBtn = within(row).getByRole('button', {
            name: /decrease quantity/i,
        })

        const qty = within(row).getByTestId('qty-value')

        const before = Number(qty.textContent)

        await userEvent.click(desBtn)

        expect(Number(qty.textContent)).toBe(before - 1)
    })

    test("toggle select item when user check the checkbox", async () => {

        const row = await screen.findByRole('article', { name: /Essence Mascara Lash Princess/i })

        const checkbox = within(row).getByRole('checkbox', {
            name: /toggle select item/i,
        })

        await userEvent.click(checkbox)

        expect(checkbox).toBeChecked();

        expect(store.getState().cart.selectedItems).toContain(1)
    })

    test("toggle select all items when user check the select all checkbox", async () => {

        const selectAllCheckbox = await screen.findByRole('checkbox', { name: /select all items/i })
        const allItems = store.getState().cart.ids

        await userEvent.click(selectAllCheckbox)

        expect(selectAllCheckbox).toBeChecked();

        expect(store.getState().cart.isSelectAll).toBe(true)

        expect(new Set(store.getState().cart.selectedItems)).toEqual(new Set(allItems))
    })

    test("all checkbox must be checked when select all checkbox is checked", async () => {
        const selectAllCheckbox = await screen.findByRole('checkbox', { name: /select all items/i })

        await userEvent.click(selectAllCheckbox)

        const checkboxes = screen.getAllByRole('checkbox', { name: /select item/i })

        checkboxes.forEach(checkbox => expect(checkbox).toBeChecked())
    })



})


