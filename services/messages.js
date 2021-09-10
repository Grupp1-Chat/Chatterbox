const moment = require("moment")

function formatMessage(username, content) {
    
    return {
        username,
        content,
        time: moment().format("HH:mm")
    }

}

console.log(moment().format("HH:mm"))

module.exports = formatMessage