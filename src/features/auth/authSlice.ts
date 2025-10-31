import { createSlice } from "@reduxjs/toolkit";

export type AuthState = {
    userId: number | null;
    name: string | null;
}

const initialState: AuthState = {
    userId: null,
    name: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLogined: (state, action) => {
            const { userId, name } = action.payload;
            state.userId = userId;
            state.name = name;
        },
        userLoggedOut: (state) => {
            state.userId = null;
            state.name = null;
        }
    }
})

export const { userLogined, userLoggedOut } = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;