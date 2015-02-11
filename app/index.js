process.env.UV_THREADPOOL_SIZE = 8;

var fs = require('fs');
var gulp = require('gulp');
var colors = require('colors');
var _ = require('lodash');
var async = require('async');

//var cameras_ = [];

/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec;

var Cameras = require('./components/cameras.js');

var cameras = 'test';

global.TAKES = 0; /*** THIS NEEDS TO GO ***/

/* Image folders */
global.RAW_IMG_FOLDER = __dirname+'/images';
global.SCALED_IMG_FOLDER = __dirname+'/scaled-images';
global.REMOTE_PATH = '/Volumes/livingroom';//'/Users/chris';//'/Volumes/livingroom';
global.APPROVED_FOLDER = global.REMOTE_PATH+'/Desktop/NIKE_PUBLIC/approved';//'/Volumes/c/'; //__dirname+'/../../approved';
global.HEARTED_FOLDER  = global.REMOTE_PATH+'/Desktop/NIKE_PUBLIC/hearted';//'/Volumes/c/'; //__dirname+'/../../hearted';
global.SOCIAL_FOLDER   =  global.REMOTE_PATH+'/Desktop/NIKE_PUBLIC/social';

if (!fs.existsSync(global.RAW_IMG_FOLDER)) fs.mkdirSync(global.RAW_IMG_FOLDER);
if (!fs.existsSync(global.SCALED_IMG_FOLDER)) fs.mkdirSync(global.SCALED_IMG_FOLDER);
if (!fs.existsSync(global.APPROVED_FOLDER)) fs.mkdirSync(global.APPROVED_FOLDER);
if (!fs.existsSync(global.HEARTED_FOLDER)) fs.mkdirSync(global.HEARTED_FOLDER);
if (!fs.existsSync(global.SOCIAL_FOLDER)) fs.mkdirSync(global.SOCIAL_FOLDER);

var Images = require(__dirname+'/models/images');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gphoto2');

var setupComplete = false; //camera setup

//if mac osx prep cameras by ensuring no photo software is running or connected.
Images.find({},'take',{sort:{take:-1}},function(err,_images){
  //grab TAKES NUMBER
  if(_images.length === 0) global.TAKES = 0;
  else global.TAKES = _images[0].take;

  var killAll = exec('killall PTPCamera gphoto2',function (error, stdout, stderr) {
    cameras = Cameras(function(e){
      if(e){
        return console.log("camera setup failed: ".red + e);
        //TODO: socket.emit('error', e);
      }
      console.log("camera setup complete".green);
      setupComplete = true;
      //setup the websockets with our camera data.
      //start socket.io server now as well.
      setupSockets();
      server.listen(8081);
    });
  });
});

/* Gulp Watcher */
var watchr = require('watchr');
var fileCounter = 0;
watchr.watch({
  path:'./app/images/',
  listener:  function(changeType,filePath,fileCurrentStat,filePreviousStat){
    console.log('filePreviousStat: '.cyan+filePreviousStat);
    console.log('fileCurrentStat: '.cyan+fileCurrentStat);
    console.log('changeType: '.cyan+changeType);
    console.log('File Added: '.green+filePath);
    switch(changeType){
      case 'create':
        console.log('File Added: '.green+filePath);
        var img = new Images();
        img.path = filePath.substr(filePath.lastIndexOf('/')+1);
        img.save(function(){
          imageProcessHandler(img, function(e){
            io.sockets.emit('new-image',img);
            fileCounter++;
            console.log("fileCounter: "+fileCounter);
            console.log("cameras.cameras_.length: "+cameras.cameras_.length);
            if (fileCounter == cameras.cameras_.length){
              console.log("socket.emit: finished");
              fileCounter = 0;
              io.sockets.emit('finished', null);
            }
          });
        });
        break;
      default: //console.log('a change event occured:',arguments);
        console.log('changeType: '+changeType+' filePath: '+filePath);
        break;
    }
  }
});

var imageProcessHandler = function(img, cb){

  async.parallel([
      function(callback){
        img.copyFile('social', callback);
      },
      function(callback){
        img.copyFile('scale', callback);
      }
  ],
  function(err, results){
    cb(err);
  });
};

/* Simple Express and Socket to pass info. */
app.use(express.static('./public'));
app.use('/images',express.static(global.RAW_IMG_FOLDER));
app.use('/scaled-images',express.static(global.SCALED_IMG_FOLDER));

app.listen(process.env.PORT || 8080);
// server.listen(8081); //moving for test.
console.log('\n--------------\nApp Running on port '.cyan+(process.env.PORT || 8080)+'\n--------------\n'.cyan);

var setupSockets = function(){
  //console.log(cameras);
  io.on('connection', function(socket){
    console.log('socket connection created.'.yellow);
    if(!setupComplete) socket.broadcast.emit('loading', null);
    // fs.readdir(global.RAW_IMG_FOLDER,function(err,files){
    fs.readdir(global.SCALED_IMG_FOLDER,function(_err,files){
      //checkout /images for all image files, (exclude DS_Store);

      //return console.log("error: ".red+_err);

      Images.findOrCreate(_.without(files, ".DS_Store"),function(err,_images){
        if(err) return socket.emit('error',err);
        return socket.emit('init',_images);
      });
    });

    /* Socket API */
    socket.on('approve',function(data){
      console.log('Approve: '+JSON.stringify(data));
      Images.findById(data._id,function(err,image){
        image.approve(function(err,_img){
          //TODO Add socket emit to update all connections.
          socket.broadcast.emit('approved',image);
          console.log('Approved.');
        });
      });
    });

    socket.on('heart',function(data){
      console.log('Heart: '+JSON.stringify(data));
      Images.findById(data._id,function(err,image){
        image.heart(function(err,_img){
          //TODO Add socket emit to update all connections.
          socket.broadcast.emit('hearted',image);
          console.log('Hearted.');
        });
      });
    });

    socket.on('snap',function(data){
      console.log('Snap Photo! '.green+JSON.stringify(data));
      cameras.takePhotos(function(e){});
    });
  });
};
