class ManipulateString {    
    static changeText({text, from, to}) {
        let copiedString = text
        let newString = copiedString.split(from).join(to)
        return newString
    }
}

module.exports = ManipulateString