import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const usersSlice = createApi({
    reducerPath: 'users',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/users' }),
    endpoints: (builder) => ({
        getUsers: builder.query<{ id: number; name: string }[], void>({
            query: () => `/`,
        }),
    }),
})

export const { useGetUsersQuery } = usersSlice;

export default usersSlice;