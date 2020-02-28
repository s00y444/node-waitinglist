const redis   = require('redis')
let redisClient = redis.createClient()

exports.getData = ({redisKey}) => {
  redisClient.hgetall(redisKey,(err,data) => {
    if(err) console.log(err)
    console.log(data)
  });
}

exports.deleteValue = ({ redisKey, key }) => {
   redisClient.hdel(redisKey,key,(err,data) => {
    if(err) console.log(err)
    return data
  })
}

exports.setData = (redisKey,data) => {
  redisClient.hmset(redisKey,data,(err,r) => {
    if(err) console.log(err)
    return r
  })
}
