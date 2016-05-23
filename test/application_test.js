var rewire = require('rewire');
var Application = rewire('../src/application');
var Timer = require('../src/timer');
var assert = require('assert');
var mockFunction = require('./mock-function');

describe('Application', function() {
  var document, window, application, Emitter;

  function fakeEventTarget() {
    return {
      addEventListener: mockFunction(),
      removeEventListener: mockFunction()
    }
  };

  before(function() {
    document = fakeEventTarget();
    window = fakeEventTarget();
    Emitter = { fromEvent: mockFunction() };
    Application.__set__('document', document);
    Application.__set__('window', window);
    Application.__set__('Emitter', Emitter);
    application = new Application();
  });

  describe('#initialize', function() {
    it('initializes a timer', function() {
      assert.equal(application.timer.constructor, Timer);
      assert.equal(application.timer.running, false);
    });

    it('initializes a defines application.listener', function() {
      var event = 'fake event';
      assert.equal(typeof application.listener, 'function');

      application.processEvent = mockFunction();
      application.listener(event);
      assert.equal(application.call.calls[0].this, application);
      assert.equal(application.call.calls[0].arguments[0], event);
    });
  });

  describe('#processEvent', function() {
    it('')
  });

  describe('#setEventListeners', function() {
    function assertAddedEventListeners(target) {
      var addEventListenerCalls = target.addEventListener.calls;
      assert.equal(addEventListenerCalls.length, 2);
      assert.equal(addEventListenerCalls[0].arguments[0], 'change');
      assert.equal(addEventListenerCalls[0].arguments[1], application.listener);
      assert.equal(addEventListenerCalls[1].arguments[0], 'click');
      assert.equal(addEventListenerCalls[1].arguments[1], application.listener);
    }
    it('adds event listeners to document and window', function() {
      application.setEventListeners();
      assertAddedEventListeners(document);
      assertAddedEventListeners(window);
    });
  });

  describe('#clearEventListeners', function() {
    function assertClearedEventListeners(target) {
      var removeEventListenerCalls = target.removeEventListener.calls;
      assert.equal(removeEventListenerCalls.length, 2);
      assert.equal(removeEventListenerCalls[0].arguments[0], 'change');
      assert.equal(removeEventListenerCalls[0].arguments[1], application.listener);
      assert.equal(removeEventListenerCalls[1].arguments[0], 'click');
      assert.equal(removeEventListenerCalls[1].arguments[1], application.listener);
    }
    it('removes event listeners to document and window', function() {
      application.clearEventListeners();
      assertClearedEventListeners(document);
      assertClearedEventListeners(window);
    });
  });
});