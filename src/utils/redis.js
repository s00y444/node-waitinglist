const redis   = require('redis')
let redisClient = redis.createClient()


class Redis {

  static findAll (redisKey) {
    return new Promise((resolve,reject) => {
      redisClient.hgetall(redisKey,(err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }

  static destroy ({redisKey,key}) {
    return new Promise((resolve,reject) => {  
      redisClient.hdel(redisKey,key,(err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }

  static create (redisKey,data) {
    return new Promise((resolve,reject) => {
      redisClient.hmset(redisKey,data,(err,r) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }
  
  static createOne (redisKey,{key,value}) {
    return new Promise((resolve, reject) => {
      redisClient.hset(redisKey,key,value,(err,res)=>{
        if(err) reject(err)
        resolve(res)
      })
    })
  }

  static findByKey (redisKey,key)  {
    return new Promise((resolve,reject) => {
      redisClient.hget(redisKey,key, (err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }
}

module.exports = Redis;
