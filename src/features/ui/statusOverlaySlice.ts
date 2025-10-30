import { RootState } from '@/app/store'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

export type StatusKind = 'success' | 'error' | 'info' | 'loading'

export type StatusOverlayState = {
    open: boolean
    kind: StatusKind
    title: string
    message?: string
    primaryText: string // ignored in loading
}

const initialState: StatusOverlayState = {
    open: false,
    kind: 'info',
    title: '',
    message: '',
    primaryText: 'OK',
}

type ShowPayload = Partial<StatusOverlayState> & { open?: boolean }

const statusOverlaySlice = createSlice({
    name: 'statusOverlay',
    initialState,
    reducers: {
        show(state, { payload }: PayloadAction<ShowPayload>) {
            state.open = true
            state.kind = payload.kind ?? state.kind
            state.title = payload.title ?? state.title
            state.message = payload.message
            state.primaryText = payload.primaryText ?? 'OK'
        },
        hide(state) {
            Object.assign(state, initialState)
        },
        set(state, { payload }: PayloadAction<ShowPayload>) {
            Object.assign(state, { ...state, ...payload })
        },
    },
})

export const { show, hide, set } = statusOverlaySlice.actions

export default statusOverlaySlice.reducer

export const showLoading = (title = 'Loading…', message?: string): PayloadAction<ShowPayload> =>
    show({ kind: 'loading', title, message, primaryText: 'OK' })

export const showSuccess = (title = 'Success', message?: string, primaryText = 'OK'): PayloadAction<ShowPayload> =>
    show({ kind: 'success', title, message, primaryText })

export const showError = (title = 'Error', message?: string, primaryText = 'OK'): PayloadAction<ShowPayload> =>
    show({ kind: 'error', title, message, primaryText })

export const showInfo = (title = 'Info', message?: string, primaryText = 'OK'): PayloadAction<ShowPayload> =>
    show({ kind: 'info', title, message, primaryText })

export const selectStatusOverlay = (state: RootState) => state.statusOverlay