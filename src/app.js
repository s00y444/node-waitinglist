

const express = require('express')
const app     = express()
const server  = require('http').createServer(app)
const io      = require('socket.io').listen(server)

const RedisClient = require('./RedisClient.js')


const PORT    = process.env.PORT || 9000

const connections = []

const manipulateKeys = (redisKey) => {
  let newString = redisKey.split('waitinglist:granted').join('waitinglist:queue')
  return newString
}

const checkCurrentAvailible = async ({redisKey,concurrent}) => {

  let keyQueue = manipulateKeys(redisKey)

  let granted = await RedisClient.getAll(redisKey)
  let queue   = await RedisClient.getAll(keyQueue)

  let totalGranted = Object.keys(granted).length

  // console.log(totalGranted)
  return concurrent - totalGranted
}

const checkGrantedIsReady = async ({redisKey,concurrent}) => {
  const granted   = await RedisClient.getAll(redisKey)

  let totalGranted = Object.keys(granted).length

  if(totalGranted < concurrent) {
    return true
  }else{
    return false
  }
}

const addToGrantAccess = async ({redisKey,concurrent}) => {
  let keyQueue = manipulateKeys(redisKey)
  let granted = await RedisClient.getAll(redisKey)
  let queue   = await RedisClient.getAll(keyQueue)

  let keys = queue !== null ? Object.keys(queue) : {}

  let availible = await  checkCurrentAvailible({redisKey,concurrent})

  if(queue !== null) {
    for(let i = 0; i < availible; i++) {
      if(keys[i] !== undefined) {
        granted[keys[i]] = queued[keys[i]]
      }
    }
  }

  let newGranted = await RedisClient.set(redisKey,granted)
  return newGranted
}

io.sockets.on(`connection`,socket => {
  connections.push(socket)

  console.log(`socket connected : ${connections.length}`)

  socket.on('disconnect',(data) => {
    connections.splice(connections.indexOf(socket),1)
    console.log(`socket disconnect ${connections.length}`)
  })

  socket.on('deleteGrantAccess', async data => {
    await RedisClient.deleteValue(data)
    let newGranted = addToGrantAccess(data)

    socket.emit('onDeleteGrantAccess',{ redisKey: data.redisKey, granted : newGranted })

  })
})

server.listen(PORT , async () => {

  console.log(`Server running port ${PORT}`)
})
