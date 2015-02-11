var colors = require('colors');
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var Takes = require('./takes');

var takes = new Takes();

var _gphoto2 = require('gphoto2');
var _GPhoto = new _gphoto2.GPhoto2();

function Cameras(_cb){
  // List cameras / assign list item to variable to use below options
  //global = _globals;//just in case I misunderstood.
  var self = this;
  this.cameras_;

  _GPhoto.list(function (list) {
    if (list.length === 0){
      console.log(" >>> NO CAMERAS FOUND <<< ".red.inverse);
      //TODO: socket.emit('error', "no cameras found");
      return _cb("no cameras found");
    }
    // var camera = list[0];
    self.cameras_ = list;

    var id=0;
    async.eachSeries(list, function(_thisCam, cb){
      var thisCam = _thisCam;
      thisCam.id=id;
      self.cameras_[id] = thisCam;
      console.log('Found Camera '.cyan+id, 'model'.gray, thisCam.model, 'on port'.gray, thisCam.port);
      id++;
      cb();
    }, function(_e){
      if(_e) return _cb(_e);
      takePhotos(function(er){
        _cb(er);
      });
    });

  });
  return self;
}


Cameras.prototype.takePhotos = takePhotos =  function(_cb){

  var self=this;
  takes.inc();//global.TAKES++;
  var current_take = takes.current();//global.TAKES;

  async.each(this.cameras_, function(cam, cb){
    console.log("take picture on cam: "+JSON.stringify(cam));
    cam.takePicture({
      targetPath: '/tmp/foo.XXXXXX'
      }, function (er, tmpname) {
        console.log("tmpname: "+tmpname);
        if(!tmpname){
          var _thisCamIdx = _.findIndex(self.cameras_, { 'id': cam.id });
          self.cameras_.splice(_thisCamIdx, 1);
          return cb("snap error: tmpname is undefined, camera: ".red + cam.id);
        }

        var now = new Date();
        //var filePath =  global.RAW_IMG_FOLDER+'/'+now.getHours()+'.'+now.getMinutes()+'.'+now.getSeconds()+'.'+now.getMilliseconds()+'_cam_'+cam.id+'.jpg';
        var filePath = global.RAW_IMG_FOLDER+'/'+current_take+'_'+cam.id+'_'+(now.getMonth() + 1) + '' + now.getDate() + '' +  now.getFullYear() +'.'+now.getHours()+'.'+now.getMinutes()+'.'+now.getSeconds()+'.'+now.getMilliseconds()+'.jpg';
        //--- asynchronous file copy
        fs.rename(tmpname, filePath.toString(), function(_er){
          if(_er) return cb(_er);
          cb(er);
        });
      });
    }, function(e){
    if(e) console.log("error taking snap: ".red + e);
    _cb(e);
  });
};

module.exports = Cameras;
