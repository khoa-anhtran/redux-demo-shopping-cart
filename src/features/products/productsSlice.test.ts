import { configureStore } from '@reduxjs/toolkit'
import productsSlice from './productsSlice' // your createApi file

function makeStore() {
    return configureStore({
        reducer: { [productsSlice.reducerPath]: productsSlice.reducer },
        middleware: gDM => gDM().concat(productsSlice.middleware),
    })
}

test('calls the correct API endpoint', async () => {
    const store = makeStore()

    // Build a real Response
    const body = JSON.stringify([{ id: 1, title: 'Mouse' }])
    const resp = new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })

    const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(resp)

    const result = await store
        .dispatch(productsSlice.endpoints.getProducts.initiate())
        .unwrap()

    // Assert the request
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.calls[0][0].url).toBe('/api/products')
    const init = fetchSpy.mock.calls[0][1] as RequestInit | undefined
    expect(init?.method ?? 'GET').toBe('GET')

    // Assert transformed data (if you used transformResponse)
    expect(result).toEqual({ 1: { id: 1, title: 'Mouse' } })

    fetchSpy.mockRestore()
})
