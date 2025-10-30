import { rest } from 'msw' // (or http/HttpResponse if you're on MSW v2)

export const handlers = [
    rest.get('/api/products', (_req, res, ctx) =>
        res(
            ctx.status(200),
            ctx.json([
                {
                    id: 1,
                    title: 'Essence Mascara Lash Princess',
                    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
                    price: 9.99,
                },
                {
                    id: 2,
                    title: 'Eyeshadow Palette with Mirror',
                    price: 19.99,
                    thumbnail: "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
                },
            ],)
        )
    ),
]
