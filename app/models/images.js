var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Images = mongoose.Schema({

  path: String,
  approved: { type: Boolean, default: false },
  hearted: { type: Boolean, default: false }

});

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
