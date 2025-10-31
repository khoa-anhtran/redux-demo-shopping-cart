import React, { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import type { Store } from '@reduxjs/toolkit'
import cartReducer, { type CartItem, type CartState } from '@/features/cart/cartSlice'
import productsSlice from '@/features/products/productsSlice' // your createApi
import MyConfirmDialog from '@/features/ui/MyConfirmDialog'
import MyStatusOverlay from '@/features/ui/MyStatusOverlay'
import uiReducer from "@/features/ui/uiConfirmSlice"
import statusOverlayReducer from "@/features/ui/statusOverlaySlice"
import authReducer from "@/features/auth/authSlice"

export const confirmListener = createListenerMiddleware()

export function makeStore(preloaded?: Partial<{ cart: CartState }>) {
    return configureStore({
        reducer: {
            cart: cartReducer,
            auth: authReducer,
            uiConfirm: uiReducer,
            statusOverlay: statusOverlayReducer,
            [productsSlice.reducerPath]: productsSlice.reducer
        },
        preloadedState: preloaded as any,
        middleware: (gDM) => gDM().prepend(confirmListener.middleware).concat(productsSlice.middleware),
    })
}

export function withCart(entities: Record<number, CartItem>) {
    return makeStore({
        cart: {
            entities,
            ids: Object.keys(entities).map(Number),
            open: false,
            selectedItems: [],
            isSelectAll: false
        } as unknown as CartState,
    })
}

// Optional: a wrapper for RTL render
export function makeProviders(store: Store) {
    return function Wrapper({ children }: PropsWithChildren) {
        return <Provider store={store}>
            {children}
            <MyConfirmDialog />
            <MyStatusOverlay />
        </Provider>
    }
}

export type AppTestStore = ReturnType<typeof makeStore>
