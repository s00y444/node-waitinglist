class DateTime  { 
     static generateTimeExpire (minute) { 
        let date = new Date()
        let parsedMinute = parseInt(minute)
        date.setMinutes(date.getMinutes() + parsedMinute)
        let m = (date.getMonth() + 1).toString().padStart(2, "0");
        let d = date.getDate().toString().padStart(2, "0");
        let formatedDate = `${date.getFullYear()}-${m}-${d} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        return formatedDate
      }
}

module.exports = DateTime