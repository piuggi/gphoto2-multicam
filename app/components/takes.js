var takes = 0;
var bSetup = false;
function Takes(){
  console.log('New Takes Connection.');
  console.log('Current Takes: %s',takes);
}

Takes.prototype.set =function(current){
  console.log('Takes.set');
  console.log(current);
  bSetup = true;
  takes = current;
  console.log(takes);
};

Takes.prototype.inc = function(){
  console.log('Takes.set');
  console.log(takes);
  takes++;
  console.log(takes);
};

Takes.prototype.current = function(){
  if(bSetup) return takes;
  return null;
};

module.exports = Takes;
