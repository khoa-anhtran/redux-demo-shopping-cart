import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Product = {
    id: number,
    title: string,
    price: number,
    thumbnail: string
}

const productsSlice = createApi({
    reducerPath: 'products',
    baseQuery: fetchBaseQuery({ baseUrl: "/api/products" }),
    tagTypes: ['Product'],
    endpoints: builder => ({
        getProducts: builder.query<Record<number, Product>, void>({
            query: () => '',
            providesTags: (result = [], error, arg) => [
                'Product',
                ...Object.keys(result).map((id) => ({ type: 'Product', id }) as const)
            ],
            transformResponse: (products: Product[], meta, arg) =>
                Object.fromEntries(products.map(product => [product.id, product])),
        }),
    })
})


export const { useGetProductsQuery } = productsSlice

export default productsSlice