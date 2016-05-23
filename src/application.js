var Timer = require('./timer');

function Application() {
  var application = this;

  this.timer = new Timer();

  this.listener = function(e) {
    application.call(e);
  };
};

Application.prototype.processEvent = function() {
  var emitter, timer;

  if (Okay.timer.running === true) timer = Okay.timer;
  emitter = Emitter.fromEvent(e, timer, Okay.watchers);
  emitter.call();
};

Application.prototype.setEventListeners = function() {
  var listener = this.listener;
  window.addEventListener('change', listener);
  window.addEventListener('click', listener);
  document.addEventListener('change', listener);
  document.addEventListener('click', listener);
};

Application.prototype.clearEventListeners = function() {
  var listener = this.listener;
  window.removeEventListener('change', listener);
  window.removeEventListener('click', listener);
  document.removeEventListener('change', listener);
  document.removeEventListener('click', listener);
};

module.exports = Application;
