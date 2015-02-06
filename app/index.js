process.env.UV_THREADPOOL_SIZE = 8;

var fs = require('fs');
var gulp = require('gulp');
var colors = require('colors');
var _ = require('lodash');
var async = require('async');

var cameras_ = [];

/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec;

var Cameras = require('./components/cameras.js');
var cameras;

/* Image folders */
global.RAW_IMG_FOLDER = __dirname+'/images';
global.APPROVED_FOLDER = '/Volumes/c/'; //__dirname+'/../../approved';
global.HEARTED_FOLDER = '/Volumes/c/'; //__dirname+'/../../hearted';

if (!fs.existsSync(global.RAW_IMG_FOLDER)) fs.mkdirSync(global.RAW_IMG_FOLDER);
if (!fs.existsSync(global.APPROVED_FOLDER)) fs.mkdirSync(global.APPROVED_FOLDER);
if (!fs.existsSync(global.HEARTED_FOLDER)) fs.mkdirSync(global.HEARTED_FOLDER);

var Images = require(__dirname+'/models/images');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gphoto2');

//if mac osx prep cameras by ensuring no photo software is running or connected.
//
var killAll = exec('killall PTPCamera gphoto2',function (error, stdout, stderr) {
    var setupComplete = false; //camera setup

    cameras = Cameras(global,function(e){
      if(e){
        return console.log("camera setup failed: ".red + e);
        //TODO: socket.emit('error', e);
      }
      console.log("camera setup complete".green);
      setupComplete = true;
    });
});

/* Gulp Watcher */
var watchr = require('watchr');
var fileCounter = 0;
watchr.watch({
  path:'./app/images/',
  listener:  function(changeType,filePath,fileCurrentStat,filePreviousStat){
    switch(changeType){
      case 'create':
        console.log('File Added: '.green+filePath);
        var img = new Images();
        img.path = filePath.substr(filePath.lastIndexOf('/')+1);
        img.save(function(){
          io.sockets.emit('new-image',img);
          fileCounter++;
          if (fileCounter == cameras_.length){
            fileCounter = 0;
            io.sockets.emit('finished', null);
          }
        });
        break;
      default: //console.log('a change event occured:',arguments);
        console.log('changeType: '+changeType+' filePath: '+filePath);
        break;
    }
  }
});

/* Simple Express and Socket to pass info. */
app.use(express.static('./public'));
app.use('/images',express.static(global.RAW_IMG_FOLDER));
app.listen(process.env.PORT || 8080);
server.listen(8081);
console.log('\n--------------\nApp Running on port '.cyan+(process.env.PORT || 8080)+'\n--------------\n'.cyan);

io.on('connection',function(socket){

  if(!setupComplete) socket.emit('loading', null);

  fs.readdir(global.RAW_IMG_FOLDER,function(err,files){
    //checkout /images for all image files, (exclude DS_Store);
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
        console.log('Approved.');
      });
    });
  });

  socket.on('heart',function(data){
    console.log('Heart: '+JSON.stringify(data));
    Images.findById(data._id,function(err,image){
      image.heart(function(err,_img){
        //TODO Add socket emit to update all connections.
        console.log('Hearted.');
      });
    });
  });

  socket.on('snap',function(data){
    console.log('Snap Photo! '.green+JSON.stringify(data));
    //gphoto.takePhotos();
    cameras.takePhotos(function(e){});
  });
});
