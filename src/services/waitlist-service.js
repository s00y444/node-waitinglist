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
          let keyQueue = await this.helpers.string.changeText({text: redisKey,from : 'waitinglist:granted',to : 'waitinglist:queue'})
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
}

module.exports = WaitlistService