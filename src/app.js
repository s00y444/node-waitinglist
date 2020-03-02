

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

  let granted = await RedisClient.getAll(redisKey)

  let totalGranted = granted == null || undefined ? 0 : Object.keys(granted).length

  // console.log(totalGranted)
  return concurrent - totalGranted
}

const generateTimeExpire = (minute) => { 
  let date = new Date()
  let parsedMinute = parseInt(minute)
  date.setMinutes(date.getMinutes() + parsedMinute)
  let m = (date.getMonth() + 1).toString().padStart(2, "0");
  let d = date.getDate().toString().padStart(2, "0");
  let formatedDate = `${date.getFullYear()}-${m}-${d} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  return formatedDate
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

const addToGrantAccess = async ({redisKey,concurrent,minute}) => {
  let keyQueue = await manipulateKeys(redisKey)
  let granted = await RedisClient.getAll(redisKey)
  let queue   = await RedisClient.getAll(keyQueue)

  let avoidNullGranted = granted == null || undefined ? {} : granted

  let keys = queue !== null ? Object.keys(queue) : {}

  let availible = await checkCurrentAvailible({redisKey,concurrent})
  if(queue !== null) {
    for(let i = 0; i < availible; i++) {
      if(keys[i] !== undefined) {
        avoidNullGranted[keys[i]] = await generateTimeExpire(minute)
        await RedisClient.deleteValue({redisKey: keyQueue,key:keys[i]})
      }
    }

    let newGranted = await RedisClient.set(redisKey,avoidNullGranted)
    return newGranted
  }
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
    let newGranted = await addToGrantAccess(data)
    
    socket.emit('onDeleteGrantAccess',{ ...data })
    socket.broadcast.emit('onDeleteGrantAccess',{ redisKey : manipulateKeys(data.redisKey), granted : newGranted })
  })
})

server.listen(PORT , async () => {
    console.log(`Server running port ${PORT}`)
})