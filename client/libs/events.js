(function () {
  'use strict';

  var csInterface = new CSInterface();

  csInterface.addEventListener('console', function(evt) {
    console.log('Host > ' + evt.data);
  });

  csInterface.addEventListener('mighty.rollcall', function(evt) {
    dispatchEvent('mighty.rollanswer', extFolder())
  });

  function dispatchEvent(name, data) {
  	var event = new CSEvent(name, 'APPLICATION');
  	event.data = data;
  	csInterface.dispatchEvent(event);
  }

}());
