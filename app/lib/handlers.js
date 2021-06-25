/**
request handlers
*/
// Dependencies
var _data = require('./data')
var helpers = require('./helpers')
// define handlers
var handlers = {};

//users
handlers.users = function(data,callback){

  var acceptableMethods = ["post","get","put","delete"]
  if(acceptableMethods.indexOf(data.method) > -1){

    handlers._users[data.method](data,callback)
  }else{
    callback(405)
  }
}

// tokens
handlers.tokens = function(data,callback){
  var acceptableMethods = ["post","get","put","delete"]
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback)
  }else{
    callback(405)
  }
}
handlers._tokens = {}
// tokens - post
// required data: phone,password
// optional data: none
handlers._tokens.post = function(data,callback){
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length ==10 ? data.payload.phone: false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password: false;

  if(phone && password){
    //  look up the user who matches phone number
    _data.read('users',phone,function(err,userData){

      if(!err && userData){
        // hash and compare passowrd

        var hashedPassword = helpers.hash(password)
        console.log(hashedPassword)
        console.log(typeof userData)
        if(hashedPassword == userData.hashedPassword){
          // if valid, create a new token with a random name, set expiration date 1 hr in the future
          var tokenId = helpers.createRandomString(20);
        var expires = Date.now() + 1000 * 60 * 60
        var tokenObject = {
          'phone':phone,
          'id':tokenId,
          'expires':expires
        }
        // store the token
        _data.create('tokens',tokenId,tokenObject,function(err){
          if(!err){
            callback(200,tokenObject);
          }else{
            callback(500,{'Error':'Could not create the new token'})
          }
        })


        }else{

          callback(400,{'Error':'Password did not match the specified user'})
        }
      }else{
        callback(400,{'Error':'Could not find the specified user'})
      }
    })
  }else{
    callback(400,{'Error':'Missing required fields'})
  }

}
//Tokens - put
// required data: id, extended
handlers._tokens.put = function(data,callback){
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length ==20 ? data.payload.id: false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true: false;
    if(id && extend){
      _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
          //check to ensure token isnt expired
          if(tokenData.expires > Date.now()){
            // set the expiration an hour from now
            tokenData.expires = Date.now() + 1000 * 60 * 60;
            // store new updates
            _data.update('tokens', id, tokenData, function(err){
              if(!err){
                callback(200)
              }else{
                callback(500,{'Error': 'Could not update the token\'s expiration'})
              }
            })
          }else{
            callback(400,{'Error':'The token has already expired, and cannot be extended'})
          }
        }else{
          callback(400,{'Error':'Specified token does not exist'})
        }
      })
    }else{
      callback(400,{'Error': 'Missing required field or are invalid'})
    }
}
// required data is an id
// required data : id
handlers._tokens.get = function(data,callback){
  //Check the sent id is valid
  var id = typeof(data.queryStringObject.id) == 'string' ? data.queryStringObject.id.trim(): false;

  if(id){
    _data.read('tokens',id,function(err,tokenData){
      console.log(err)
      if(!err &&tokenData ){
        // reMove the hashedPassword from the user object before returning it to the user

        callback(200,tokenData);
      }else{
        callback(404)
      }
    })
  }else{
    callback(400,{'Error':'Missing required field'})
  }
}
handlers._tokens.delete = function(data,callback){
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20? data.queryStringObject.id.trim(): false;

  if(id){
    _data.read('tokens',id,function(err,data){
      if(!err &&data ){
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          }else{
            console.log(err)
            callback(500,{'Error':'could not delete the specified token'})
          }
        })
      }else{
        callback(400,{'Error':'Could not find the specified token'})
      }
    })
  }else{
    callback(400,{'Error':'Missing required field'})
  }
}
//container fot the users submethods
handlers._users = {}
// users post
// required data: firstname, lastName, phone, password, tosAgreement
handlers._users.post = function(data,callback){

  // check that all the required fields are filled oute
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName: false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName: false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length ==10 ? data.payload.phone: false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password: false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement ==true ? true: false;
console.log(typeof(data.payload.tosAgreement))
 console.log(firstName,lastName,phone,password,tosAgreement)

  if(firstName && lastName && password && phone && tosAgreement){
    //  make sure that the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // hash the password
        var hashedPassword = helpers.hash(password);
        // create user object
        if(hashedPassword){
        var userObject = {
          firstName,
          lastName,
          phone,
          hashedPassword,
          tosAgreement:true
        }
        // store the user
        _data.create('users',phone,userObject,function(err){
          if(!err){
            callback(200)
          }else{
            console.log(err)
            callback(500,{'Error':'Could not create the new user'})
          }
        })
      }else{
        callback(500,{'Error':'could not hash the user\'s passowrd'})
      }
        }else{
        // user already exists
        callback(400,{'Error':'A user with that phone number already exists'})
      }
    })
  }else{
    callback(400,{'Error': 'Missing required fields'})
  }
}
// users get
// only let an authenticated user access their object
handlers._users.get = function(data,callback){
  // check that the phone number provided is valid

  var phone = typeof(data.queryStringObject.phone) == 'string' ? data.queryStringObject.phone: false;
  //console.log(phone)
  if(phone){
    // get the token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;

    // verify that the given token is valid from the phone Number
    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
      if(tokenIsValid){
        _data.read('users',phone,function(err,data){
          if(!err &&data ){
            // reMove the hashedPassword from the user object before returning it to the user
            delete data.hashedPassword;
            callback(200,data);
          }else{
            callback(404)
          }
        })
      }else{
        callback(403,{'Error':'Missing required token in header or token is invalid'})
      }
    })


  }else{
    callback(400,{'Error':'Missing required field'})
  }
}
// users put
handlers._users.put = function(data,callback){
  var phone = typeof(data.payload.phone) == 'string' ? data.payload.phone: false;

  // check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName: false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName: false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password: false;

  // Error if the phone is invalid
  if(phone){
    // Error if nothing is sent to upddate
    if(firstName || lastName || password){
      // look up the users
      var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;

      handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
        if(tokenIsValid){
          _data.read('users',phone,function(err,userData){
            if(!err && userData){
              // update the neccessary fields
              if(firstName){
                userData.firstName = firstName;
              }
              if(lastName){
                userData.lastName = lastName;
              }
              if(password){
                userData.hashedPassword = helpers.hash(password);
              }
              // store the new updates
              _data.update('users',phone,userData,function(err){
                if(!err){
                  callback(200);
                }else{
                  console.log(err)
                  callback(500,{'500':'Could not update the user data'})
                }
              })
            }else{
              callback(400,{'Error':'The specified user does not exist'})
            }
          })
        }else{
          callback(403,{'Error':'Missing required token in header or token is invalid'})
        }
      })

    }else{
      callback(400,{'Error':'Missing fields to update'})
    }

  }else{
    callback(400,{'Error':'Missing required field'})
  }

}
// users delete
// required data,firstName,lastName,password
// @todo only let an authenticated user update their own object
handlers._users.delete = function(data,callback){
  // check for the required field
  // check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' ? data.queryStringObject.phone: false;
  console.log(phone.trim())
  if(phone){
    var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;

    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
      if(tokenIsValid){
        _data.read('users',phone,function(err,data){
          if(!err &&data ){
            _data.delete('users',phone,function(err){
              if(!err){
                callback(200);
              }else{
                console.log(err)
                callback(500,{'Error':'could not delete the specified user'})
              }
            })
          }else{
            callback(400,{'Error':'Could not find the specified user'})
          }
        })
      }else{
        callback(403,{'Error':'Missing required token in header or token is invalid'})
      }
    })

  }else{
    callback(400,{'Error':'Missing required field'})
  }
}
//  verify if  a given token id is currently valid foa a given user
handlers._tokens.verifyToken = function(id,phone,callback){
  _data.read('tokens', id, function(err,tokenData){
    if(!err && tokenData){
      // check the token data for the given user and has not expired
      if(tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true)
      }else{
        callback(false)
      }
    }else{
      callback(false)
    }
  })
}
//check
handlers.checks = function(data,callback){
  var acceptableMethods = ["post","get","put","delete"]
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._checks[data.method](data,callback)
  }else{
    callback(405)
  }
}
//container fo all the checs methods
handlers._checks = {}

//checks - post
//Required data: protool, usrl, method, successCodes, timeout Seconds
handlers._checks.post = function(data,callback){
  // validate inputs
var protocol = typeof(data.queryStringObject.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.queryStringObject.protocol: false;
var method = typeof(data.queryStringObject.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.queryStringObject.method: false;
var url = typeof(data.queryStringObject.url) == 'string' && data.queryStringObject.url.trim().length > 0 ? data.queryStringObject.url: false;
var successCodes = typeof(data.queryStringObject.successCodes) == 'object' && data.queryStringObject.successCodes instanceOf Array && data.payload.successCodes.length > 0? data.queryStringObject.successCodes: false;

}

// ping handler
handlers.ping = function(data,callback){
  callback(200);

}
// not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};




module.exports = handlers
