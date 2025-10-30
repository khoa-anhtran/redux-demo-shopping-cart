import { RootState } from '@/app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ConfirmPayload = {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
}

export type UIConfirmState = {
    open: boolean
    title: string
    description?: string
    confirmText: string
    cancelText: string
}

const initialState: UIConfirmState = {
    open: false,
    title: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
}

const uiConfirmSlice = createSlice({
    name: 'uiConfirm',
    initialState,
    reducers: {
        openConfirm(state, { payload }: PayloadAction<ConfirmPayload>) {
            state.open = true
            state.title = payload.title
            state.description = payload.description
            state.confirmText = payload.confirmText ?? 'Confirm'
            state.cancelText = payload.cancelText ?? 'Cancel'
        },
        acceptConfirm(state) { state.open = false },
        cancelConfirm(state) { state.open = false },
    },
})

export const { openConfirm, acceptConfirm, cancelConfirm } = uiConfirmSlice.actions

export const selectUIConfirm = (state: RootState) => state.uiConfirm

export default uiConfirmSlice.reducer
