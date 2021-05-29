/***
helpers for various tasks

*/
var crypto = require('crypto')
var config = require('../config')
var helpers = {};

// create hash
helpers.hash = function(str){
  if(typeof(str) =='string' && str.length > 0){
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex')
    return hash;
  }else{
    return false
  }
}
helpers.parseJsonToObject = function(str){
  try{
    return JSON.parse(str)
  }catch(e){
    return {}
  }

}
// create a string of random alphanumeric characters of a given lenght

helpers.createRandomString = function(strLength){
  str = typeof(strLength) == 'number' && strLength > 0 ? strLength:false;
  console.log(strLength)
  if (strLength){
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // start the final string
    var str = ''
    for(let i = 1; i <=strLength; i++){
      //Get a random character from the posible possibleCharacters
      console.log(strLength)
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()* possibleCharacters.length))
      str += randomCharacter

    }
    return str;
  }else{
    return false
  }
}







module.exports = helpers
