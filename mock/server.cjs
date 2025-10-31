const jsonServer = require('json-server')
const auth = require('json-server-auth')

const path = require('node:path')
// const auth = require('json-server-auth') // if you use it

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

// /!\ Bind the router db to the app
server.db = router.db

// You must apply the auth middleware before the router
server.use(auth)

server.use(middlewares)

// Add custom routes before JSON Server router
server.use('/api', router)

server.use(router)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`[API] json-server 0.17 running at http://localhost:${PORT}`)
})
