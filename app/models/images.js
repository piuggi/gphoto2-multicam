var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');
var lwip = require('lwip');

var Images = mongoose.Schema({

  path: String,
  approved: { type: Boolean, default: false },
  hearted: { type: Boolean, default: false },
  take: Number,
  camera: Number
});

Images.pre('save',function(next){

  this.take = this.path.substr(0,1);
  this.camera = this.path.substr(this.path.indexOf('_')+1,1);
  next();
});

Images.methods.approve = function(cb){
  var self = this;
  self.approved = !self.approved;
  self.copyFile('approve', function(e){
    if(!e) self.save(cb);
    else {
      console.log("image copy error: ".red+e);
      cb(e);
    }
  });
};

Images.methods.heart = function(cb){
  var self = this;
  self.hearted = !self.hearted;
  self.copyFile('heart', function(e){
    if(!e) self.save(cb);
    else {
      console.log("image copy error: ".red+e);
      cb(e);
    }
  });
};

Images.methods.scale = function(cb){
  var self = this;
  self.copyFile('scale', function(e){
    if(!e) self.save(cb);
    else {
      console.log("image copy error: ".red+e);
      cb(e);
    }
  });
};


// Images.methods.copyFile = function(copyType, cb){
//
//   var rawPath = global.RAW_IMG_FOLDER+'/'+this.path;
//   var outputPath = (copyType === 'approve')? global.APPROVED_FOLDER : global.HEARTED_FOLDER;
//   outputPath += ('/'+this.path);
//
//   fs.readFile(rawPath, function (err, data) {
//       if (err) return cb(err);
//       fs.writeFile(outputPath, data, function (_err) {
//           if (_err) return cb(_err);
//           cb(null);
//       });
//   });
// };

Images.methods.copyFile = function(copyType, cb){

  var rawPath = global.RAW_IMG_FOLDER+'/'+this.path;
  var outputPath;

  switch(copyType){
    case 'approve':
      outputPath = global.APPROVED_FOLDER+'/'+this.path;
      break;
    case 'heart':
      outputPath = global.HEARTED_FOLDER+'/'+this.path;
      break;
    case 'scale':
      console.log("copyType: scale");
      outputPath = global.SCALED_IMG_FOLDER+'/'+this.path;
      scaleImage(this, rawPath, outputPath, function(e){
        if(e) return cb(e);
        cb(null);
      });
      break;
    default: //console.log('a change event occured:',arguments);
      console.log('unknown copyType: '+copyType);
      break;
  }

  fs.readFile(rawPath, function (err, data) {
      if (err) return cb(err);
      fs.writeFile(outputPath, data, function (_err) {
          if (_err) return cb(_err);
          cb(null);
      });
  });
};

var scaleImage = function(img, rawPath, outputPath, cb){
  console.log("hit scaleImage: "+img.path);
  lwip.open(rawPath, function(err, image){
    if(err) return console.log("err opening img: "+err); cb(err);
    image.scale(0.1, function(_err, image){
      if(_err) return cb(_err);
      image.toBuffer('jpg', function(e, buffer){
        if(e) return cb(e);
        fs.writeFile(outputPath, buffer, function(_e){
          if(_e) return cb(_e);
          cb(null);
        });
      });
    });
  });
};


Images.statics.findOrCreate = function(files,callback){//function(query, sort, doc, options, callback){
  var self = this;
  this.collection.find({path:{$in:files}}).toArray(function(err,_files){
    var created = false;
    async.each(files,function(file,cb){
      //check for images or create them.
      var _img = _.find(_files,{path:file});
      if(!_img){
        self.create({path:file},function(err,res){
            // _files.push(res);
            created = true;
            return cb();
        });
      } else return cb();
    },function(err){
      //console.log(_files);
      if(created) return self.collection.find({path:{$in:files}}).toArray(callback);
      return callback(err,_files);
    });
  });
};

module.exports = mongoose.model('Images', Images);
