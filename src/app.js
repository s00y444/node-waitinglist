

const express = require('express')
const app     = express()
const server  = require('http').createServer(app)
const io      = require('socket.io').listen(server)

const Redis = require('./utils/redis')
const ManipulateString = require('./helpers/manipulate-string')
const dateTime = require('./helpers/date-time')
const WaitlistService = require('./services/waitlist-service')

const PORT    = process.env.PORT || 6000

app.get('/tes',(req,res,next) => {
  res.send({
    ok : 'works'
  })
})

const Waitlist = new WaitlistService({
  cache : Redis,
  helpers : {
    string : ManipulateString,
    time  : dateTime
  }
})

const connections = []
const users = {}


io.use(async function(client,next){
  let query = await client.handshake.query
  let {key,redisKey} = query

  if(redisKey == 'waitinglist:queue') {
    let checkIsExist = await Waitlist.checkIsExistInQueue(key)
    if(checkIsExist == null) {
      await Waitlist.addQueue(key)
    }
  }
 
  next()

})


io.sockets.on(`connection`,socket => {
  connections.push(socket)
  console.log(`socket connected : ${connections.length}`)

  socket.on('disconnect',async (data) => {
    connections.splice(connections.indexOf(socket),1)
    console.log(`socket disconnect ${connections.length}`)

    let key = users[socket.id]
    if(key !== null || key !== undefined) {
      await Waitlist.delQueue(key)
      socket.broadcast.emit('leave',{ redisKey: 'waitinglist:queue' })
      delete users[socket.id]
    }

  })  
  
  socket.on('deleteGrantAccess', async data => {
    await Waitlist.deleteGranted(data)
    // await Waitlist.checkGrantAccessIsExpired(data)
    let manipulateKeys = ManipulateString.changeText({text: data.redisKey,to : 'waitinglist:queue'});
    let newGranted = await Waitlist.addToGrantAccess(data)
    socket.emit('onDeleteGrantAccess',{ ...data })
    socket.emit('checkPosition',{redisKey: manipulateKeys})
    // socket.broadcast.emit('checkPosition',{redisKey: manipulateKeys})
    socket.broadcast.emit('onDeleteGrantAccess',{ redisKey : manipulateKeys, granted : newGranted})
  })

  socket.on('checkPosition', async data => {
    let position = await Waitlist.checkPosition(data)
    let key = data.key

    if(key !== null || key !== undefined) {
      users[socket.id] = key
    }

    socket.emit('onCheckPosition',position)
    socket.broadcast.emit('onCheckPosition',position)
  })

})

server.listen(PORT ,'0.0.0.0', async () => {
    console.log(`Server running port ${PORT}`)
})