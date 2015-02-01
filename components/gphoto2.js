var spawn = require('child_process').spawn;
var exec  = require('child_process').exec;
var os = require('os');

var Camera = require('./camera');
/*

  Gphoto2 Shell Connection
  OS X System

*/

// old implimentation
// var tethered={},
//     videoStream={};
//
// tethered.connected = false;
// videoStream.connected = false;

function Gphoto2(options,cb){
  var _gphoto = this;
  this.stuff = 'stuff';

  console.log('gphoto helper starting');

  this.cameras = []; //

  this.settings(options,function(){

  });

  console.log('\n\r'+"Setting Up gPhoto2"+'\n\r');
  // list out operating system.
  console.log('\n\r'+"Operating System: "+os.platform()+'\n\r');

  //if mac osx
  var killAll = exec('killall PTPCamera && killall gphoto2',function (error, stdout, stderr) {
    console.log('killall PTPCamera');
    if(error) console.log(error);
    if(stdout) console.log(stdout);
    if(stderr) console.log(stderr);
    _gphoto.getCameras(function(err){
      if(err) return console.log(err);
      cb();
    });
  });
}
//RETURN Cameras or Method Chaining?
Gphoto2.prototype.getCameras = function(cb){
  var _this = this;
  var autoDetect = exec('gphoto2 --auto-detect',function (_error, _stdout, _stderr) {
    console.log('gphoto2 --auto-detect');
    if(_stderr||_error) return cb([_stderr,_error]);
    if(_stdout) {
      console.log(_stdout);
      //console.log(_stdout.lastIndexOf("-"))

      var cameras = _stdout.substr(_stdout.lastIndexOf("-")+1,_stdout.length-1);
      if(cameras.indexOf('\n') === 0) cameras = cameras.slice(1);
      if(cameras.lastIndexOf('\n') == cameras.length-1) cameras = cameras.slice(0,cameras.lastIndexOf('\n')-1);
      console.log('-----------------------------');
      console.log('Detecting Cameras');
      //console.log(cameras);
      console.log('-----------------------------');
      var _camerasArray = cameras.split(/\n/);
      //console.log(_camerasArray);
      for(var i = 0, len = _camerasArray.length; i<len; i++){
        if(_camerasArray[i] !== '') _this.cameras.push(new Camera(_camerasArray[i],i));
      }
      console.log('-----------------------------');
      console.log('Setup '+_this.cameras.length+' Cameras');
      console.log('-----------------------------');
      return cb();
    }
  });
};

Gphoto2.prototype.settings = function(opts,cb){
  var settings = exec('cat ~/.gphoto/settings',function(error,stdout,stderr){
    console.log('cat ~/.gphoto/settings');
    if(error) console.log(error);
    if(stdout) console.log(stdout);
    if(stderr) console.log(stderr);
  });
};
//TODO add a take number to the process
Gphoto2.prototype.takePhotos = function(){

  for(var i = 0, len = this.cameras.length; i<len; i++) this.cameras[i].captureAndDownload();

};

Gphoto2.prototype.tetherAll = function(){

  for(var i = 0, len = this.cameras.length; i<len; i++) this.cameras[i].tether(function(){});
};
Gphoto2.prototype.tether = function(index){
  this.cameras[index].tether(function(){});
};

Gphoto2.prototype.get = function(obj,cb){

};

Gphoto2.prototype.set = function(obj,cb){

};


/*
**
**   Export the GPhoto2 Module for Including
**
*/

module.exports = Gphoto2;
