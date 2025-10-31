import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
    userId: number | null;
    name: string | null;
    token?: string;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | undefined;
}

const initialState: AuthState = {
    userId: null,
    name: null,
    token: undefined,
    status: 'idle',
    error: undefined,
}

export const userLogined = createAsyncThunk<AuthResponse, { email: string; password: string }>(
    'auth/login',
    async ({ email, password }) => {
        const r = await fetch('/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (!r.ok) return r.json().then(err => { throw new Error(err) })

        return (await r.json()) as AuthResponse
    }
)

export const userRegistered = createAsyncThunk<AuthResponse, { email: string; password: string }>(
    'auth/register',
    async ({ email, password }) => {
        const r = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!r.ok) return r.json().then(err => { throw new Error(err) })

        return (await r.json()) as AuthResponse
    }
)

export type AuthResponse = {
    accessToken: string;
    user: {
        id: number;
        email: string;
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLoggedOut: (state) => {
            state.userId = null;
            state.name = null;
            state.token = undefined;
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(userLogined.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(userLogined.fulfilled, (state, action) => {
                const { accessToken, user } = action.payload;
                const { email, id } = user

                state.token = accessToken
                state.userId = id
                state.name = email
                state.status = 'succeeded'
            })
            .addCase(userLogined.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(userRegistered.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(userRegistered.fulfilled, (state, action) => {
                const { accessToken, user } = action.payload;
                const { email, id } = user

                state.token = accessToken
                state.userId = id
                state.name = email
                state.status = 'succeeded'
            })
            .addCase(userRegistered.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

export const { userLoggedOut } = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;

export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;


export default authSlice.reducer;