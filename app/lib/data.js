/**
libarry for storing and editing data

*/
var fs = require("fs");

var path = require("path")
var helpers = require('./helpers')
// container for the module to be exported
var lib ={}


// base directory of the data folder
lib.baseDir = path.join(__dirname,'../.data/')
// base directory of the data folder

lib.create = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // convert data to string
      var stringData = JSON.stringify(data);
      // Write to file and close it
      fs.writeFile(fileDescriptor,stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false)
            }else{
              callback('Error closing new file')
            }
          })
        }else{
          callback('Error Writing to new file')
        }
      })
    }else{
      callback('Could not create new file, it may already exist')
    }
  })
}
// read data from a file
lib.read = function(dir,file,callback){
  fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err,data){
    data = helpers.parseJsonToObject(data)
    callback(err,data)
  })
}
lib.update = function(dir,file,data,callback){
  // open the file for Writing
  fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
    if(!err && fileDescriptor){
      // convert to string
      var stringData = JSON.stringify(data);
      // truncate the file
        fs.truncate(fileDescriptor, function(err){
          if(!err){
            // write to the file and close it
            fs.writeFile(fileDescriptor,stringData,function(err){
              if(!err){
                fs.close(fileDescriptor,function(err){
                  if(!err){
                    callback(false)
                  }else{
                    callback('Error closing file')
                  }
                })
              }else{
                callback('Error writing to existing file')
              }
            })
            }else{
            callback("error truncating file")
          }
        })
    }else{
      callback('could not open the file for updating, it may not exist')
    }
  })
}
lib.delete = function(dir,file,callback){
  // unlink the file

  fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
    if(!err){
      callback(false)
    }else{
      console.log(err)
      console.log(lib.baseDir+dir+'/'+file+'.json')
      callback('Error deleting file')
    }
  })
}
module.exports = lib;
