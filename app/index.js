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
var setupComplete = false; //camera setup
var gphoto_CP_Init = new Gphoto2_CP({},function(){
  //gphoto.tetherAll();
  initCameras(function(e){
    if(e){
      return console.log("camera setup failed: ".red + e);
      //TODO: socket.emit('error', e);
    }
    console.log("camera setup complete".green);
    setupComplete = true;
  });
});

if (!fs.existsSync(__dirname+'/images')) fs.mkdirSync(__dirname+'/images');

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
                  io.sockets.emit('images',[img]);
                  fileCounter++;
                  if (fileCounter == cameras_.length){
                    fileCounter = 0;
                    io.sockets.emit('finished', null);
                  }
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

  if(!setupComplete) socket.emit('loading', null);

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
    takePhotos(function(e){});
  });
});


function initCameras(_cb){
  // List cameras / assign list item to variable to use below options

  _GPhoto.list(function (list) {
    if (list.length === 0){
      console.log(" >>> NO CAMERAS FOUND <<< ".red.inverse);
      //TODO: socket.emit('error', "no cameras found");
      return _cb("no cameras found");
    }
    // var camera = list[0];
    cameras_ = list;

    var id=0;
    async.eachSeries(list, function(_thisCam, cb){
      var thisCam = _thisCam;
      thisCam.id=id;
      cameras_[id] = thisCam;
      console.log('Found Camera '.cyan+id, 'model'.gray, thisCam.model, 'on port'.gray, thisCam.port);
      id++;
      cb();
    }, function(_e){
      if(_e) return _cb(_e);
      takePhotos(function(er){
        _cb(er);
      });
    });

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

    //--- another take and save a picture
    // _thisCam.takePicture({download: true}, function (er, data) {
    //   fs.writeFileSync(__dirname + '/picture-'+id.toString()+'.jpg', data);
    // });

  });
}


function takePhotos(_cb){
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
    if(e) console.log("error taking snap: ".red + e);
    _cb(e);
  });
}
