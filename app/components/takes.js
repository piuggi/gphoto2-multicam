var takes = 0;
var bSetup = false;
function Takes(){
  console.log('New Takes Connection.');
  console.log('Current Takes: %s',takes);
}

Takes.prototype.set =function(current){
  console.log('Takes.set');
  bSetup = true;
  takes = current;
};

Takes.prototype.inc = function(){
  takes++;
};

Takes.prototype.current = function(){
  if(bSetup) return takes;
  return null;
};

module.exports = Takes;
