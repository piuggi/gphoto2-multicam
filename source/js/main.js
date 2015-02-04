

$(document).ready(function(){

  $('#take-photo').click(function(e){
    // processingModal.show();
    $('#processingDialog').modal('show');
    socket.emit('snap',{snap: 0});
  });

});
