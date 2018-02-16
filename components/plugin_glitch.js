var request = require('request');
module.exports = function(controller) {

  var seconds = 55;
  var url = process.env.PROJECT_DOMAIN + '.glitch.me';
  function keepalive() {
    request({
      url: process.env.PROJECT_DOMAIN + '.glitch.me',
    }, function(err) {

      setTimeout(function() {
        console.log('info: ** Keeping ' + url + ' alive every ' + seconds + ' seconds.');
        keepalive();
      }, seconds*1000);

    });

  }

  // if this is running on Glitch
  if (process.env.PROJECT_DOMAIN) {

    // Register with studio using the provided domain name
    controller.registerDeployWithStudio(url);

    // make a web call to self every 55 seconds
    // in order to avoid the process being put to sleep.
    keepalive();

  }
}
