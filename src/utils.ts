class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        let [first, ...rest] = str.split(needle)
        return [first, rest.join(needle)]
    }

    static async loadCleanName(userName:string):Promise<string> {
        let cleanNameSetting:IUserName = await Settings.pullSetting(Settings.USER_NAMES, 'userName', userName)
        let cleanName = cleanNameSetting?.shortName
        if(cleanName == null) {
            cleanName = this.cleanName(userName)
            cleanNameSetting = {userName: userName, shortName: cleanName}
            Settings.pushSetting(Settings.USER_NAMES, 'userName', cleanNameSetting)
        }
        return cleanName
    }

    static cleanName(name:string):string {
        let nameArr = name.toLowerCase().split('_') // Split on _
        let namePart = nameArr.reduce((a, b) => a.length > b.length ? a : b) // Reduce to longest word
        namePart = namePart.replace(/[0-9]{2,}/g, '') // Replace big number groups (len: 2+)
        let numToChar:any = {
            0: 'o',
            1: 'i',
            3: 'e',
            4: 'a',
            5: 's',
            6: 'g',
            7: 't'
        }
        var re = new RegExp(Object.keys(numToChar).join("|"),"gi");
        let result = namePart.replace(re, function(matched){ // Replace leet speak with chars
            return numToChar[matched];
        });
        return result.length > 0 ? result : name // If name ended up empty, return original
    }

    static cleanText(text:string):string {
        text = text.toLowerCase()
        let matches = text.match(/(\D)\1{2,}/g) // 2+ len group of non-digits https://stackoverflow.com/a/6306113
        if(matches != null) matches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        return text
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Links: https://stackoverflow.com/a/23571059/2076423
            .replace(/[^\p{L}\p{N}\p{P}\p{Z}{\^\$}]/gu, ''); // Emojis: https://stackoverflow.com/a/63464318/2076423
    }
}