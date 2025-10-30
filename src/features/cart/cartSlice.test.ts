import { configureStore, Store } from '@reduxjs/toolkit'
import cartReducer, { cartCheckouted, CartItem, cartItemsRemoved, CartState, cartToggled, itemToggleSelected, productAdded, quantityAdjusted, quantityDecreased, quantityIncreased } from './cartSlice' // your createApi file
import { AppTestStore, withCart } from '@/test/utils/testStore';

describe("cart slice action tests", () => {
    let store: AppTestStore;

    beforeEach(() => {
        store = withCart({
            1: {
                id: 1,
                addedAt: new Date().toISOString(),
                quantity: 4
            },
            4:
            {
                id: 4,
                addedAt: new Date().toISOString(),
                quantity: 10
            },
        },)
    })

    test('get cart state', () => {
        const state = store.getState()

        expect(state.cart.entities["1"].quantity).toEqual(4)
    })

    test('increase quantity', () => {
        const state = store.getState()

        const lastQuantity = state.cart.entities["1"].quantity
        store.dispatch(quantityIncreased({ productId: 1 }))

        expect(store.getState().cart.entities["1"].quantity).toEqual(lastQuantity + 1)
    })

    test('decrease quantity', () => {
        const state = store.getState()

        const lastQuantity = state.cart.entities["1"].quantity
        store.dispatch(quantityDecreased({ productId: 1 }))

        expect(store.getState().cart.entities["1"].quantity).toEqual(lastQuantity - 1)
    })

    test('decrease quantity when quantity is equal 1', () => {
        store.dispatch(quantityAdjusted({ productId: 1, quantity: 1 }))
        store.dispatch(quantityDecreased({ productId: 1 }))

        expect(store.getState().cart.entities["1"]).toBeUndefined()
    })

    test('adjust quantity', () => {
        store.dispatch(quantityAdjusted({ productId: 1, quantity: 5 }))

        expect(store.getState().cart.entities["1"].quantity).toEqual(5)
    })

    test('adjust quantity when quantity is equal 0', () => {
        store.dispatch(quantityAdjusted({ productId: 1, quantity: 0 }))

        expect(store.getState().cart.entities["1"]).toBeUndefined()
    })

    test('add product when product is not exist in cart', () => {
        store.dispatch(productAdded({ productId: 2 }))

        expect(store.getState().cart.entities["2"]).not.toBeUndefined()
    })

    test('add product when product is exist in cart', () => {
        const lastQty = store.getState().cart.entities["1"].quantity

        store.dispatch(productAdded({ productId: 1 }))

        expect(store.getState().cart.entities["1"].quantity).toEqual(lastQty + 1)
    })

    test('products must not in cart when remove product from cart', () => {
        store.dispatch(cartItemsRemoved({ productIds: [1] }))

        expect(store.getState().cart.ids).not.toContain([1])
    })

    test('product must not in cart and selectd items when remove product from cart', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))
        store.dispatch(cartItemsRemoved({ productIds: [1] }))

        expect(store.getState().cart.selectedItems).not.toContain(1)
    })

    test('toggle open cart', () => {
        const lastOpenState = store.getState().cart.open
        store.dispatch(cartToggled())

        expect(store.getState().cart.open).toEqual(!lastOpenState)
    })

    test('remove all selected items when checkout cart', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))

        const selectedItems = store.getState().cart.selectedItems

        store.dispatch(cartCheckouted())

        expect(store.getState().cart.selectedItems.length).toEqual(0)

        expect(store.getState().cart.ids).not.toContain(selectedItems)

    })

    test('check toggle an item', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))

        expect(store.getState().cart.selectedItems).toContain(1)

        store.dispatch(itemToggleSelected({ productId: 1 }))

        expect(store.getState().cart.selectedItems).not.toContain(1)
    })

    test('set isSelectAll true when all items are checked manual', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))
        store.dispatch(itemToggleSelected({ productId: 4 }))

        expect(store.getState().cart.isSelectAll).toEqual(true)
    })

    test('set isSelectAll false when any item is unchecked manual', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))
        store.dispatch(itemToggleSelected({ productId: 4 }))

        expect(store.getState().cart.isSelectAll).toEqual(true)

        store.dispatch(itemToggleSelected({ productId: 4 }))
        expect(store.getState().cart.isSelectAll).toEqual(false)
    })

    test('set isSelectAll false when all items are removed', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))
        store.dispatch(itemToggleSelected({ productId: 4 }))

        store.dispatch(cartItemsRemoved({ productIds: [1, 4] }))

        expect(store.getState().cart.isSelectAll).toEqual(false)
    })

    test('set isSelectAll false when all items are checkouted', () => {
        store.dispatch(itemToggleSelected({ productId: 1 }))
        store.dispatch(itemToggleSelected({ productId: 4 }))

        store.dispatch(cartCheckouted())

        expect(store.getState().cart.isSelectAll).toEqual(false)
    })
})

