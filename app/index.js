process.env.UV_THREADPOOL_SIZE = 8;
var fs = require('fs');
var gulp = require('gulp');
var colors = require('colors');
var _ = require('lodash');
var async = require('async');

var _gphoto2 = require('gphoto2');
var _GPhoto = new _gphoto2.GPhoto2();
var cameras_ = [];

/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Images = require(__dirname+'/models/images');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gphoto2');

var Gphoto2_CP = require(__dirname+'/components/gphoto2');
var gphoto_CP_Init = new Gphoto2_CP({},function(){
  //auto tether
  //gphoto.tetherAll();
  initCameras();
});

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




/* Simple Express and Socket to pass info. */
app.use(express.static('./public'));
app.use('/images',express.static(__dirname +'/images'));
app.listen(process.env.PORT || 8080);
server.listen(8081);
console.log('\n--------------\nApp Running on port '.cyan+(process.env.PORT || 8080)+'\n--------------\n'.cyan);

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
    takePhotos();
  });
});


function initCameras(){
  // List cameras / assign list item to variable to use below options

  _GPhoto.list(function (list) {
    if (list.length === 0){
      console.log(" >>> NO CAMERAS FOUND <<< ".red.inverse);
      return;
    }
    // var camera = list[0];
    cameras_ = list;
    // for(var i=0; i<list.length; i++){
    var id=0;
    async.eachSeries(list, function(_thisCam, cb){
      var thisCam = _thisCam;
      thisCam.id=id;
      cameras_[id] = thisCam;
      console.log('Found Camera '.cyan+id, 'model'.gray, thisCam.model, 'on port'.gray, thisCam.port);
      id++;
      cb();
      //--- get configuration tree of camera[0]
      // thisCam.getConfig(function (er, settings) {
      // console.log(settings);
      // id++;
      // if(er){
      //   console.log("ERROR - cam.getConfig: "+er);
      // }
      // cb(er);
      // });
      //take a picture with this cam.
      // _thisCam.takePicture({download: true}, function (er, data) {
      //   fs.writeFileSync(__dirname + '/picture-'+id.toString()+'.jpg', data);

      // });

    }, function(_e){
      if(_e) console.log("camera setup error: ".red + _e);
      console.log("camera setup complete".green);
      takePhotos();
    });

    // }


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
}


function takePhotos(){
  async.each(cameras_, function(cam, cb){
    console.log("take picture on cam: "+JSON.stringify(cam));
    cam.takePicture({
      targetPath: '/tmp/foo.XXXXXX'
      }, function (er, tmpname) {
        var filePath =  __dirname + '/images/'+new Date().getMinutes()+"."+new Date().getSeconds()+'_cam_'+cam.id+'.jpg';
        if(!tmpname) cb("snap error: tmpname is undefined, camera: ".red + cam.id);

        //--- synchronous
        // fs.renameSync(tmpname, filePath.toString());
        // cb(er);

        //--- asynchronous
        fs.rename(tmpname, filePath.toString(), function(_er){
          if(_er) return cb(_er);
          cb(er);
        });
      });
    }, function(e){
    if(e) return console.log("error taking snap: ".red + e);
    console.log(">> completed snap".green);
  });
}
