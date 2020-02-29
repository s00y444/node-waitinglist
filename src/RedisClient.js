const redis   = require('redis')
let redisClient = redis.createClient()


class RedisClient {

  static getAll (redisKey) {
    return new Promise((resolve,reject) => {
      redisClient.hgetall(redisKey,(err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }

  static deleteValue ({redisKey,key}) {
    return new Promise((resolve,reject) => {
      redisClient.hdel(redisKey,key,(err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }

  static set (redisKey,data) {
    return new Promise((resolve,reject) => {
      redisClient.hmset(redisKey,data,(err,r) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }

  static getByKey (redisKey,key)  {
    return new Promise((resolve,reject) => {
      redisClient.hget(redisKey,key, (err,data) => {
        if(err) reject(err)
        resolve(data)
      })
    })
  }
}

module.exports = RedisClient;
