var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');

var Images = mongoose.Schema({

  path: String,
  approved: { type: Boolean, default: false },
  hearted: { type: Boolean, default: false },
  take: Number,
  camera: Number
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


Images.methods.copyFile = function(copyType, cb){

  var rawPath = global.RAW_IMG_FOLDER+'/'+this.path;
  var outputPath = (copyType === 'approve')? global.APPROVED_FOLDER : global.HEARTED_FOLDER;
  outputPath += ('/'+this.path);

  fs.readFile(rawPath, function (err, data) {
      if (err) return cb(err);
      fs.writeFile(outputPath, data, function (_err) {
          if (_err) return cb(_err);
          cb(null);
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
