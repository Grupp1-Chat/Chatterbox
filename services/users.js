const users = []

//Join user to chat
function userJoin(id, username, room){
    console.log("kör join")
    const user = {id, username, room}
    users.push(user)
    console.log("user array: "+users)
    
    return user
}

//Get current user
function getCurrentUser(id) {
    return users.find(user=> user.id === id)
}

//User leave
function userLeave(id){
    console.log("kör leave")
    const index = users.findIndex(user => user.id === id)
    console.log("index: " + index)
    console.log("users i leave:" + users)
    return index !== -1 ? users.splice(index, 1)[0] : console.log("fel i leave")
}

//Get room users
function getRoomUsers(room){
    return users.filter(user =>user.room === room)
}

module.exports = {userJoin, getCurrentUser, userLeave, getRoomUsers}
