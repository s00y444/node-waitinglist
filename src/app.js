

const express = require('express')
const app     = express()
const server  = require('http').createServer(app)
const io      = require('socket.io').listen(server)

const Redis = require('./utils/redis')
const ManipulateString = require('./helpers/manipulate-string')
const dateTime = require('./helpers/date-time')
const WaitlistService = require('./services/waitlist-service')

const PORT    = process.env.PORT || 9000

const Waitlist = new WaitlistService({
  cache : Redis,
  helpers : {
    string : ManipulateString,
    time  : dateTime
  }
})

const connections = []


io.sockets.on(`connection`,socket => {
  connections.push(socket)
  console.log(`socket connected : ${connections.length}`)

  socket.on('disconnect',(data) => {
    connections.splice(connections.indexOf(socket),1)
    console.log(`socket disconnect ${connections.length}`)
  })  
  
  socket.on('deleteGrantAccess', async data => {
    await Waitlist.deleteGranted(data)
    // await Waitlist.checkGrantAccessIsExpired(data)
    let newGranted = await Waitlist.addToGrantAccess(data)
    socket.emit('onDeleteGrantAccess',{ ...data })
    socket.broadcast.emit('onDeleteGrantAccess',{ redisKey : ManipulateString.changeText({text: data.redisKey,from: 'waitinglist:granted',to : 'waitinglist:queue'}), granted : newGranted})
  })
})

server.listen(PORT , async () => {
    console.log(`Server running port ${PORT}`)
})