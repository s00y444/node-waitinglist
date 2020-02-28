const express = require('express')
const app     = express()
const server  = require('http').createServer(app)
const io      = require('socket.io').listen(server)
const redis   = require('redis')
const { getData, deleteValue,setData } = require('./handlerRedis.js')

let redisClient = redis.createClient()

const PORT    = process.env.PORT || 9000

const connections = []

app.get('/ok' ,(req,res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/debug',function(req,res) {
})

const checkCurrentConcurrent = async (redisKey,concurrent) => {
    let data = await getData(redisKey);
    let currentConcurrent = data == null ? 0 : Object.keys(data).length
    if(currentConcurrent < concurrent) {
      return true
    }
    return false
}

const getTotalAvailibleCurrentConcurrent = async (redisKey,concurrent) => {
  let data = await getData(redisKey);
  let currentConcurrent = data == null ? 0 : Object.keys(data).length

  return concurrent - currentConcurrent
}

const addQueueToGrantAccess = ({redisKey,data,concurrent}) => {
   if(checkCurrentConcurrent(redisKey,concurrent)) {

   }
}


io.sockets.on(`connection`,socket => {
  connections.push(socket)

  console.log(`socket connected : ${connections.length}`)

  socket.on('disconnect',(data) => {
      connections.splice(connections.indexOf(socket),1)
      console.log(`socket disconnect ${connections.length}`)
  })


  socket.on('checkGrantedIsAvailible',data => {
    console.log('granted sedang di jalankan');
    socket.emit('addGranted',data)
  })

  socket.on('deleteGrantAccess', async (data) => {
    const { redisKey, key, concurrent } = data
    await deleteValue(redisKey,key)
    // await addQueueToGrantAccess(data);
    socket.emit('onDeleteGranteAccess', data)
  })
})

server.listen(PORT , () => {
  // console.log(getData('waitinglist:granted'))
  console.log(`Server running on port ${PORT}`)
})// DEBUG:
