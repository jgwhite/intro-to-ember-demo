import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'code-club/tests/helpers/start-app';

let application;
let firebase;

module('Acceptance: Authentication', {
  beforeEach: function() {
    firebase = new MockFirebase();
    application = startApp({ firebase });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('success', function(assert) {
  visit('/');
  fillIn('input[type="email"]', 'test@example.com');
  fillIn('input[type="password"]', 'testpassword');
  click('button[type="submit"]');
  andThen(() => {
    assert.ok(find(':contains("Logged in")').length,
      'expected to see "Logged in"');
  });
});
