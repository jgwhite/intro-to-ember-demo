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
  firebase.authWithPassword = ({ email, password }, callback) => {
    assert.equal(email, 'test@example.com');
    assert.equal(password, 'testpassword');

    const authData = { uid: 'test-data' };

    firebase.changeAuthState(authData);
    firebase.flush();

    callback(null, authData);
  };
  andThen(() => {
    assert.ok(find(':contains("Logged in")').length,
      'expected to see "Logged in"');
  });
});

test('success', function(assert) {
  visit('/');
  fillIn('input[type="email"]', 'test@example.com');
  fillIn('input[type="password"]', 'testpassword');
  click('button[type="submit"]');
  firebase.authWithPassword = ({ email, password }, callback) => {
    assert.equal(email, 'test@example.com');
    assert.equal(password, 'testpassword');

    const error = new Error('Invalid password');

    callback(error);
  };
  andThen(() => {
    assert.ok(find(':contains("Invalid password")').length,
      'expected to see "Invalid password"');
  });
});
