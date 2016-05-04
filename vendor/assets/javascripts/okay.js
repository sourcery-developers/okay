(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function each(collection, callback) {
  for (var i in collection) {
    callback(collection[i], i);
  }
};

module.exports = each;

},{}],2:[function(require,module,exports){
var emit = require('./emit');
var each = require('./each');
var transforms = require('./transforms');

function EmissionContext(target, data) {
  this.target = target;
  this.data = data;
};

EmissionContext.prototype.context = function() {
  var data;
  var context;
  var target;

  data = this.data;
  target = this.target;
  context = {};

  each(data, function(dataValue, dataKey) {
    each(transforms, function(transform, transformName) {
      if (dataValue == transformName) {
        context[dataKey] = transform(target, dataKey, context);
      }
    });

    if (context[dataKey] == undefined) context[dataKey] = data[dataKey];
  });

  return context;
};

module.exports = EmissionContext;
},{"./each":1,"./emit":3,"./transforms":9}],3:[function(require,module,exports){
var Notifier = require('./notifier');
var each = require('./each');

var callbacks = [];

function emit(emittedData, watchers) {
  var started, ended;

  started = +new Date;
  each(watchers, function(watcher, watcherName) {
    Notifier.dispatch(watcherName, watcher, emittedData);
  });
  ended = +new Date;

  each(callbacks, function(callback) {
    callback(emittedData, ended - started);
  });
};

emit.onEmit = function(callback) {
  callbacks.push(callback);
};

module.exports = emit;

},{"./each":1,"./notifier":5}],4:[function(require,module,exports){
var log = [];

log.DEBUG = false;

log.logEvent = function(e, data) {
  var target;

  if (log.DEBUG) {
    target = e.target;

    return log.log('event', {
      type: e.type,
      class: e.toString(),
      target: {
        tag: target.tagName,
        id: target.id,
        text: target.textContent
      },
      emit: data
    });
  }
};

log.log = function(type, data) {
  var entry;

  if (log.DEBUG) {
    entry = [ type, data ];
    
    log.push(entry);
    return entry;
  }
};

module.exports = log;

},{}],5:[function(require,module,exports){
var each = require('./each');

function Notifier(name, watcher, target, emittedData) {
  this.name = name;
  this.watcher = watcher;
  this.target = target;
  this.emittedData = emittedData;
  this.config = this.getConfig();
}

Notifier.prototype.getConfig = function() {
  var rawOptions, parsedOptions;
  rawOptions = this.target.getAttribute('data-watch-'+this.name);
  parsedOptions = JSON.parse(rawOptions);
  return parsedOptions;
};

Notifier.prototype.update = function() {
  var emittedData = this.emittedData;
  var config = this.config;
  var watcher = this.watcher;
  var target = this.target;
  if (!config) return;

  each(config, function(configValue, configKey) {
    var watcherValue;

    each(configKey.split(','), function(match) {
      each(emittedData, function(dataValue, dataKey) {
        if (watcherValue) return;
        if (match == dataKey) watcherValue = dataValue;
      });
    });

    if (watcherValue != undefined) watcher(target, config[configKey], watcherValue, config);
  });
};

Notifier.dispatch = function(watcherName, watcher, emittedData) {
  var targets, i, ii;

  targets = document.querySelectorAll('[data-watch-'+watcherName+']');

  for (i = 0, ii = targets.length; i < ii; i++) {
    (function() {
      var currentTarget;
      var notify;

      currentTarget = targets[i];
      var notify = function () {
        new Notifier(watcherName, watcher, currentTarget, emittedData).update();
      };

       //Let stack clear.
      setTimeout(notify);
    }());
  }
};

module.exports = Notifier;
},{"./each":1}],6:[function(require,module,exports){
(function() {
  'use strict';
  var Okay, EmissionContext, listener, stack;

  window.Okay = Okay = {};
  if (!Okay) Okay = {};

  var each = require('./each');
  var slice = require('./slice');
  var Timer = require('./timer');
  Okay.emit = require('./emit');

  Okay.emit.onEmit(function(state, elapsed) {
    Okay.log.log('state', { state: state, elapsed: elapsed });
  });

  Okay.watchers = require('./watchers');
  Okay.log = require('./log');
  Okay.timer = new Timer(Okay);

  EmissionContext = require('./emission_context');

  Okay.eventListener = listener = function (e) {var elementInfo = [];
    var emissionJSON, emissionData, possibleTargets, emissionContext, context;

    possibleTargets = e.path ? slice(e.path) : [];
    if (e.currentTarget != document) possibleTargets.unshift(e.currentTarget);
    possibleTargets.unshift(e.target);

    function hasDataset(target) {
      return target && target.dataset && target.dataset.emit;
    }

    each(possibleTargets, function(target) {
      if (!emissionJSON && hasDataset(target)) emissionJSON = target.dataset.emit;
    });

    if (emissionJSON) {
      emissionData = JSON.parse(emissionJSON);
      Okay.log.logEvent(e, emissionData);
      emissionContext = new EmissionContext(e.target, emissionData);
      context = emissionContext.context();

      if (Okay.timer.running === true) {
        Okay.timer.push(context);
      } else {
        Okay.emit(context, Okay.watchers);
      }
    }
  };

  Okay.setEventListeners = function() {
    window.addEventListener('change', listener);
    window.addEventListener('click', listener);
    document.addEventListener('change', listener);
    document.addEventListener('click', listener);
  };

  Okay.clearEventListeners = function() {
    window.removeEventListener('change', listener);
    window.removeEventListener('click', listener);
    document.removeEventListener('change', listener);
    document.removeEventListener('click', listener);
  };

  Okay.setEventListeners();
  Okay.timer.start();
}());

},{"./each":1,"./emission_context":2,"./emit":3,"./log":4,"./slice":7,"./timer":8,"./watchers":10}],7:[function(require,module,exports){
var arrayPrototypeSlice = Array.prototype.slice;

module.exports = function slice(object) {
  return arrayPrototypeSlice.apply(object);
};

},{}],8:[function(require,module,exports){
var each = require('./each');
var slice = require('./slice');

function Timer(Okay, clearEvery) {
  this.Okay = Okay;
  this.stack = [];
  this.running = false;
  this.clearEvery = clearEvery || 10;
}

Timer.prototype.start = function() {
  var timer = this;

  function clear() { timer.clear(); }
  timer.interval = window.setInterval(clear, timer.clearEvery);
  timer.running = true;
};

Timer.prototype.stop = function() {
  window.clearInterval(this.interval);
  this.running = false;
};

Timer.prototype.push = function(item) {
  this.stack.push(item);
};

Timer.prototype.clear = function() {
  var Okay = this.Okay;
  var computedState;

  computedState = Timer.getStateForTimer(this);
  if (computedState) Okay.emit(computedState, Okay.watchers);
};

Timer.getStateForTimer = function(timer) {
  var itemsToClear, computedState;

  itemsToClear = slice(timer.stack);
  timer.stack = [];

  if (itemsToClear.length == 0) return false;

  computedState  = {};
  each(itemsToClear, function(item) {
    each(item, function(val, key) {
      computedState[key] = val;
    });
  });

  return computedState;
};

module.exports = Timer;

},{"./each":1,"./slice":7}],9:[function(require,module,exports){
var transforms = {};

transforms['[checked]'] = function(target) {
  return target.checked;
};

transforms['![checked]'] = function(target) {
  return !target.checked;
};

transforms['[options]'] = function(target, contextKey, context) {
  var selectedOptionValue;
  var options = target.children;

  function updateContextForOption(option) {
    var selected, name;
    selected = option.selected == true;
    name = option.getAttribute('name');
    context[contextKey+'['+name+']'] = selected;
    if (selected) selectedOptionValue = name;
  }

  for (var i = 0, ii = options.length; i < ii; i++) {
    updateContextForOption(options[i]);
  }

  return selectedOptionValue;
};

module.exports = transforms;
},{}],10:[function(require,module,exports){
exports.html = function applyHTML(target, setting, value, config) {
  if (setting == 'append()') {
    target.innerHTML = target.innerHTML + value;
  } else if (setting == 'prepend()') {
    target.innerHTML = value + target.innerHTML;
  } else {
    target.innerHTML = value;
  }
};

exports.class = function applyClass(target, className, value) {
  var method = value ? 'add' : 'remove';
  target.classList[method](className, value);
};

exports.attr = function applyAttr(target, attrName, value) {
  target.removeAttribute(attrName);
  if (value) target.setAttribute(attrName, value);

  if (attrName == 'checked') {
    target.checked = value;
    var event = new Event('change', { bubbles: true, cancelable: false });
    target.dispatchEvent(event);
  }
};

},{}]},{},[6]);
