const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  global.io = io

  io.on('connection', (socket) => {
    socket.on('join', ({ userId, role }) => {
      if (userId) {
        socket.join(`user:${userId}`)
        console.log(`[Socket] User ${userId} (${role}) joined room user:${userId}`)
      }
      if (role) socket.join(`role:${role}`)
    })

    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`)
        console.log(`[Socket] Joined order room: order:${orderId}`)
      }
    })
  })

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
