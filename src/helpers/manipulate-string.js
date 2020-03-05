class ManipulateString {    
    static changeText({text,to}) {
        let copiedString = text
        let newString = copiedString.replace(copiedString,to)
        return newString
    }
}

module.exports = ManipulateString
