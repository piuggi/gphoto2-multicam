var fs = require('fs');
var gulp = require('gulp');
var colors = require('colors');
var _ = require('lodash');
var async = require('async');

var _gphoto2 = require('gphoto2');
var _GPhoto = new _gphoto2.GPhoto2();

/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Images = require(__dirname+'/models/images');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gphoto2');

// var Gphoto2 = require(__dirname+'/components/gphoto2');

if (!fs.existsSync(__dirname+'/images')) fs.mkdirSync(__dirname+'/images');

/* Gulp Watcher */
var watchr = require('watchr');
watchr.watch({
    path:'./app/images/',
    listener:  function(changeType,filePath,fileCurrentStat,filePreviousStat){
            switch(changeType){
              case 'create':
                console.log('File Added: '.green+filePath);
                var img = new Images();
                img.path = filePath.substr(filePath.lastIndexOf('/')+1);
                img.save(function(){
                  io.sockets.emit('images',[img]);
                });
                break;
              default:
                //console.log('a change event occured:',arguments);
                console.log('changeType: '+changeType+' filePath: '+filePath);
                break;
            }
        }

});


//var gphoto = new Gphoto2({},function(){
  //auto tether
  //gphoto.tetherAll();
//});

/* Simple Express and Socket to pass info. */
app.use(express.static('./public'));
app.use('/images',express.static(__dirname +'/images'));
app.listen(process.env.PORT || 8080);
server.listen(8081);
console.log('App Running on port'+(process.env.PORT || 8080));

io.on('connection',function(socket){
  fs.readdir(__dirname+'/images',function(err,files){
    //checkout /images for all image files, (exclude DS_Store);
    Images.findOrCreate(_.without(files, ".DS_Store"),function(err,_images){
      if(err) return socket.emit('error',err);
      return socket.emit('images',_images);
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
    async.each(cameras_, function(cam, cb){
      console.log("take picture on cam: "+JSON.stringify(cam));
      cam.takePicture({
        targetPath: '/tmp/foo.XXXXXX'
      }, function (er, tmpname) {
        var filePath =  __dirname + '/images/'+new Date().getMinutes()+"."+new Date().getSeconds()+'_cam_'+cam.id+'.jpg'
        fs.renameSync(tmpname, filePath.toString());
        cb(er);
      });
    }, function(e){
      console.log(">> completed snap".green);
    });
  });
});


// List cameras / assign list item to variable to use below options
var cameras_ = [];
_GPhoto.list(function (list) {
  if (list.length === 0) return;
  // var camera = list[0];
  cameras_ = list;
  for(var i=0; i<list.length; i++){
    var thisCam = list[i];
    thisCam.id=i;
    cameras_[i] = thisCam;
    console.log('Found Camera '.cyan+i, 'model'.gray, thisCam.model, 'on port'.gray, thisCam.port);
  }


//--- get configuration tree of camera[0]
  //camera.getConfig(function (er, settings) {
    //console.log(settings);
  //});

//--- take and save a picture
//   camera.takePicture({
//   targetPath: '/tmp/foo.XXXXXX'
// }, function (er, tmpname) {
//   fs.renameSync(tmpname, __dirname + '/picture.jpg');
// });

});
