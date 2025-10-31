import productsSlice from "@/features/products/productsSlice"
import usersSlice from "@/features/users/usersSlice"
import cartReducer, { cartCheckouted, cartItemsRemoved, persistCart, productAdded, quantityAdjusted, quantityDecreased, quantityIncreased, selectAllCartItem } from "@/features/cart/cartSlice"
import uiConfirmReducer, { acceptConfirm, cancelConfirm, openConfirm } from "@/features/ui/uiConfirmSlice"
import statusOverlayReducer from "@/features/ui/statusOverlaySlice"
import authReducer from "@/features/auth/authSlice"

import { Action, configureStore, createListenerMiddleware, isAnyOf, ThunkAction } from "@reduxjs/toolkit"

export const confirmListener = createListenerMiddleware()

export const cartAutosaveListener = createListenerMiddleware()

const store = configureStore({
    reducer: {
        cart: cartReducer,
        uiConfirm: uiConfirmReducer,
        statusOverlay: statusOverlayReducer,
        auth: authReducer,
        [productsSlice.reducerPath]: productsSlice.reducer,
        [usersSlice.reducerPath]: usersSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .prepend(confirmListener.middleware)
        .prepend(cartAutosaveListener.middleware)
        .concat(productsSlice.middleware)
        .concat(usersSlice.middleware),
})

export function askConfirm(
    dispatch: AppDispatch,
    payload: { title: string; description?: string; confirmText?: string; cancelText?: string }
): Promise<boolean> {
    // Start listening BEFORE opening, to avoid race conditions
    return new Promise<boolean>((resolve) => {
        const stop = confirmListener.startListening({
            matcher: isAnyOf(acceptConfirm, cancelConfirm),
            effect: (action, listenerApi) => {
                stop()                          // stop this one-shot listener
                resolve(acceptConfirm.match(action)) // true if accepted, false if cancelled
            },
        })
        dispatch(openConfirm(payload))
    })
}

cartAutosaveListener.startListening({
    matcher: isAnyOf(quantityAdjusted, quantityDecreased, quantityIncreased, productAdded, cartItemsRemoved, cartCheckouted),
    effect: async (_action, api) => {
        api.cancelActiveListeners()

        await api.delay(600)

        const state = api.getState() as RootState
        const items = selectAllCartItem(state)
        const userId = state.auth.userId

        try {
            await api.dispatch(persistCart({ items, userId } as any)).unwrap()
        } catch (err) {

        }
    }
})

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
// Export a reusable type for handwritten thunks
export type AppThunk = ThunkAction<void, RootState, unknown, Action>

export default store