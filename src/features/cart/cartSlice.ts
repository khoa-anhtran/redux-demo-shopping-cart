import { RootState } from "@/app/store";
import { createSlice, createEntityAdapter, EntityState, PayloadAction, createSelector, createAsyncThunk } from "@reduxjs/toolkit";

export type CartItem = {
    id: number,
    quantity: number,
    addedAt: string
}

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'


const cartAdapter = createEntityAdapter<CartItem>({ sortComparer: (a, b) => b.addedAt.localeCompare(a.addedAt) })

export interface CartState extends EntityState<CartItem, number> {
    open: boolean;
    status: FetchStatus;
    selectedItems: number[];
    isSelectAll: boolean;
    error?: string;
}

const initialState: CartState = cartAdapter.getInitialState({ open: false, status: "idle", selectedItems: [], isSelectAll: false })


export const fetchCart = createAsyncThunk<CartItem[], number>(
    'cart/fetch',
    async (userId) => {
        const r = await fetch(`/api/carts/${userId}`)
        if (!r.ok) throw new Error(`GET cart failed: ${r.status}`)

        const data = (await r.json()) as { items: Record<string, Omit<CartItem, 'id'>> }

        return Object.entries(data.items).map(([id, v]) => ({ id: Number(id), quantity: v.quantity, addedAt: v.addedAt }))
    }
)

export const persistCart = createAsyncThunk<void, { items: CartItem[], userId: number }>(
    'cart/persist',
    async ({ items, userId }) => {
        // Example: send the whole cart; adapt to your API shape
        const body = { items: Object.fromEntries(items.map(i => [String(i.id), { quantity: i.quantity, addedAt: i.addedAt }])) }
        const r = await fetch(`/api/carts/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (!r.ok) throw new Error(`PUT cart failed: ${r.status}`)
    }
)

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        quantityIncreased: (state, action: PayloadAction<{ productId: number }>) => {
            const { productId } = action.payload
            state.entities[productId].quantity++
        },
        quantityDecreased: (state, action: PayloadAction<{ productId: number }>) => {
            const { productId } = action.payload
            if (state.entities[productId].quantity == 1)
                cartAdapter.removeOne(state, productId)
            else
                state.entities[productId].quantity--
        },
        quantityAdjusted: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
            const { productId, quantity } = action.payload

            if (quantity == 0)
                cartAdapter.removeOne(state, productId)
            else
                state.entities[productId].quantity = quantity
        },
        productAdded: (state, action: PayloadAction<{ productId: number }>) => {
            const { productId } = action.payload
            if (state.entities[productId])
                state.entities[productId].quantity++
            else
                cartAdapter.addOne(state, { id: productId, addedAt: new Date().toISOString(), quantity: 1 })
        },
        cartToggled: (state, action: PayloadAction) => {
            state.open = !state.open
        },
        cartCheckouted: (state, action: PayloadAction) => {
            const selectedItems = state.selectedItems
            cartAdapter.removeMany(state, selectedItems)
            state.selectedItems = []
            state.isSelectAll = false
        },
        cartItemsRemoved: (state, action: PayloadAction<{ productIds: number[] }>) => {
            const { productIds } = action.payload
            cartAdapter.removeMany(state, productIds)

            state.selectedItems = state.selectedItems.filter(itemId => !productIds.includes(itemId))

            if (state.selectedItems.length == 0)
                state.isSelectAll = false
        },
        itemToggleSelected: (state, action: PayloadAction<{ productId: number }>) => {
            const { productId } = action.payload
            const arr = state.selectedItems
            const i = arr.indexOf(productId)
            if (i >= 0) arr.splice(i, 1)
            else arr.push(productId)

            if (arr.length == state.ids.length)
                state.isSelectAll = true
            else
                state.isSelectAll = false
        },
        allItemsToggleSelected: (state) => {
            if (state.isSelectAll) {
                state.isSelectAll = false
                state.selectedItems = []
            }
            else {
                state.isSelectAll = true
                state.selectedItems = state.ids
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading'
                state.error = undefined
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded'
                cartAdapter.setAll(state, action.payload)
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Failed to fetch cart'
            }).addCase("auth/userLoggedOut", (state) => {
                state.status = 'idle'
                cartAdapter.removeAll(state)
            })
    }
})

export default cartSlice.reducer

export const {
    quantityIncreased,
    quantityAdjusted,
    quantityDecreased,
    cartToggled,
    productAdded,
    cartCheckouted,
    cartItemsRemoved,
    itemToggleSelected,
    allItemsToggleSelected
} = cartSlice.actions

export const { selectById: selectCartItemById,
    selectAll: selectAllCartItem,
    selectIds: selectCartIds }
    = cartAdapter.getSelectors((state: RootState) => state.cart)

export const selectCartOpen = (state: RootState) => state.cart.open

export const selectCartStatus = (state: RootState) => state.cart.status

export const selectCartError = (state: RootState) => state.cart.error

export const selectCartSelectedItems = (state: RootState) => state.cart.selectedItems

export const selectCartIsSelectAll = (state: RootState) => state.cart.isSelectAll

export const selectCartTotalQty = createSelector(
    (s: RootState) => s.cart.ids as Array<string | number>,
    (s: RootState) => s.cart.entities as Record<string | number, { quantity: number }>,
    (ids, entities) => ids.reduce((sum, id) => Number(sum) + Number(entities[id].quantity), 0)
)