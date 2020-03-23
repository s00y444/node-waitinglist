class WaitlistService  {

    constructor({cache,helpers}) {
        this.cache = cache
        this.helpers = { ...helpers }    

    }
    
    async checkGrantedIsReady  ({redisKey,concurrent}){
        const granted   = await this.cache.findAll(redisKey)
      
        let totalGranted =  granted == null || undefined ? 0 : Object.keys(granted).length
      
        if(totalGranted < concurrent) {
          return true
        }else{
          return false
        }
      
      }

     async checkCurrentAvailible ({redisKey,concurrent}) {

        let granted = await this.cache.findAll(redisKey)
        
        let totalGranted = granted == null || undefined ? 0 : Object.keys(granted).length
      
        // console.log(totalGranted)
        return concurrent - totalGranted
      }

     async addToGrantAccess ({redisKey,concurrent,minute}) {
        let isReady = await this.checkGrantedIsReady({redisKey,concurrent})
        if(isReady) {
          let keyQueue = await this.helpers.string.changeText({text: redisKey,to : 'waitinglist:queue'})
          let granted = await this.cache.findAll(redisKey)
          let queue   = await this.cache.findAll(keyQueue)
      
          let avoidNullGranted = granted == null || undefined ? {} : granted
      
          let keys = queue !== null ? Object.keys(queue) : {}
          
          let availible = await this.checkCurrentAvailible({redisKey,concurrent})
          if(queue !== null) {
            for(let i = 0; i < availible; i++) {
              if(keys[i] !== undefined) {
                avoidNullGranted[keys[i]] = await this.helpers.time.generateTimeExpire(minute)
                await this.cache.destroy({redisKey: keyQueue,key:keys[i]})
              }
            }
      
            let newGranted = await this.cache.create(redisKey,avoidNullGranted)
            return newGranted
          }
        }
      }

      async deleteGranted ({redisKey,key}) {
          return this.cache.destroy({redisKey,key})
      }

      async getQueue () {
        return this.cache.findAll('waitinglist:queue') 
      }

      async checkGrantAccessIsExpired({redisKey}) {
        let check = await this.cache.findAll(redisKey)
        let timeExp = check !== null || check !== undefined ? Object.values(check) : []
        let keys = check !== null || check !== undefined ? Object.keys(check) : []
        let dateNow = Date.now()
        for (let i = 0; i < timeExp.length; i++) {
          let dateExp = new Date(timeExp[i]).getTime()
          if(redisKey !== null || redisKey !== undefined) {
            if(dateNow >= dateExp) {
              let deleteAccess = await this.cache.destroy({redisKey, key: keys[i]})
            }
          }
        }
      }

     async checkPosition({redisKey,key}){
      let check = await this.cache.findAll(redisKey)
      let listQueue = check == null ? [] : Object.keys(check)
      return listQueue
     }

     async delQueue(key){
       if(key !== undefined && key !== null) {
         return this.cache.destroy({redisKey:'waitinglist:queue',key})
       }
     }

     async addQueue(data) {
       return this.cache.createOne('waitinglist:queue',{key:data, value: 'onqueue'});
     }

     async checkIsExistInQueue(key) {
      let data = await this.cache.findByKey('waitinglist:queue',key);
      return data
     }
}

module.exports = WaitlistService