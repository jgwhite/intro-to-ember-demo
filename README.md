# An Introduction to Ember.js

Hello!

My name is Jamie and I co-run Ember London. We host monthly meetups and project nights here in town. Our focus is Ember but really Ember is so entwined with everything happening on the web platform right now that we can’t help but cover other topics. Things like:

- Accessibility
- Emerging standards
- Architecture and ops
- Our good friends React and Angular

During the day I work as a developer at With Associates. We’ve been using Ember in real projects since 2012. We love it and we think it’s only getting better.

I also spoke at this year’s EmberConf on everything I’ve learned being involved with the community and getting to work with great people all over the world on open source.

So that’s my Ember credentials out of the way. Hopefully I’ve established that I have at least half a clue what I’m talking about.

Today we’re going to work through building a simple app with the state of the art in Ember tooling and practises.

- It will connect to a real backend service
- We’ll deploy it to production
- And we’ll drive the whole thing with tests

## The App

Let me try to describe the app we’re going to build. Who’s heard of Code Club?  Code Club provide materials and support for volunteers to teach programming to primary school children.

HTML & CSS are a part of the curriculum and it begins with showing the kids that a web page is really just a bunch of text the browser can interpret. This is great and fundamental but the real magic happens when they can put their work online and share it with friends, teachers and parents.

In my experience so far there isn’t any one really perfect platform. The best I’ve found so far is Thimble (part of Mozilla’s WebMaker suite) but even that isn’t entirely suited.

The ideal solution would:

- Be a walled garden of sorts, for the students’ safety
- Have the idea of teacher student relationship built in
- Allow the children to upload assets and edit code in place
- Be friendly to external media (images, videos, etc.)

So if we’re going to build this we don’t want to have to also be its sysadmin.  We want the data and assets to live on a trusted reliable and affordable service.

For this I have chosen Firebase. For those that don’t know it, it’s platform as a service that provide data storage and sync. They offer a free account that perfectly suits our needs.

The plan is to use Firebase as our backend data store and write a rich GUI for it, for the browser, using Ember.

## The Backend

I’ll sign in to my Firebase account, create a new application. Let’s head directly login and auth.

For today’s purposes, we won’t worry about implementing account creation. We’ll assume that some benevolent dictator is doling out user accounts to volunteers.

In the app, we’ll assume that the volunteer authenticates via email and password.  And I’m going to create myself a user account here and now.

Let’s take a look at what email & password authentication looks like using Firebase’s JavaScript library.

Looks we get ourselves an instance of this Firebase constructor and then we call `authWithPassword`. Seems good.

By default Firebase is a little too permissive to let’s lock things down.

I think we know enough about Firebase for now to get started with the UI.

## Step One - Generating our Ember App

At this point Ember is really an ecosystem of different tools.

- Ember Core provides the runtime, routing, data bindings and application structure
- HTMLBars is the templating engine that integrates with Ember
- Ember Data is an ORM that can be taught how to talk to your backend
- Ember CLI is the command line build tooling

All of these things are themselves built out of smaller modules but they’re packaged together in a conventional way that gives you everything you need to build a production-ready app.

As emberjs.com states, installing ember-cli is simply a matter of running:

```sh
npm i -g ember-cli
```

Then to generate our app we run:

```sh
ember new code-club
```

(Duration: 1 min)

While dependencies are installating let’s take a look at ember-cli.com. As you can see it does a lot. It’s main task is to preprocess all your dependencies and compile them down to minified bundles ready to ship to browsers.

It also provides hooks for addons and the community has capitalised upon this by creating almost 1,000 addons to date.

Okay, our app is ready. Here we find the newly generated project structure.

- app, where our application code lives
- bower, for any browser-side dependencies that aren’t yet available through NPM
- everything else is installed via NPM
- public contains purely static assets
- tests contains our testing harness

We can boot the site with:

```sh
ember serve
```

You’ll notice the initial build took ~3 seconds. Subsequent incremental rebuilds are constant time (in theory) and typically under half a second. They’re quick enough that usually if you save a file the browser will have reloaded your app by the time you’ve switched over to it.

We can run the test suite with:

```sh
ember test
```

We can build the app with:

```sh
ember build
```

This is the development, so exactly what we get with `ember serve`. You’ll notice we get a bundle of CSS and JS for our app itself, and separate bundles for dependencies.

We can create a production build like so:

```sh
ember build -e production
```

Notice everything’s substantially smaller, fingerprinted, ready for the primetime.

## Step Two - Firebase Addons

We know we want to use Firebase as our data store and we’ve seen how to authenticate with it. What we’ve not yet seen is how to bring in the client library and how to interface with the store in an Ember-y way.

Well, with a library almost 1,000 addons there’s a pretty good chance we’re covered.

Sure enough, emberfire: the officially supported Ember binding for Firebase.

We install the addon with

```sh
ember install emberfire
```

That warning is a bug in the current release of ember-cli and can be safely ignored.

Let’s take a look at what it’s added.

- Set our application adapter up to be a firebase adapter
- Added the firebase client library to our bower dependencies
- Added content security policy config
- Provided a placeholder value for the firebase URL
- Added the NPM package itself

I’m going to go ahead an plug in our real Firebase URL.

As we test drive the features of this app, we need to decide what the boundaries are. Where does our app end and the environment begin. We need to determine this so we can control this boundaries under test.

For this sort of app the boundaries are the browser’s APIs. When browser events fire, we want to know our app resonds accordingly. We want to know it’s making the right network requests and doing the right thing with the responses.

In our tests we want precise control over these boundaries. We can do this by simulating clicks, touches and key presses and by replacing the native XHR interface with a simulation we can observe and control. There’s a library called Pretender that does just this.

Firebase is going to require a slightly different approach because Firebase talks over WebSockets in a bespoke interchange format. It’s very unlikely we could simulate the WebSockets API and the interchange format without mistakes.

Instead, we can use the Firebase client library itself as the boundary. It’s well-specified and simple and there already exists an official library to help out.

Right now Mockfirebase only ships via Bower, but that’s fine.

```sh
ember install:bower mockfirebase
```

```js
app.import({
  development: 'bower_components/mockfirebase/browser/mockfirebase.js'
});
```

Ember CLI’s module loader and MockFirebase don’t play nice right now, but that’s because the object is available in the window as `MockFirebase` and we can tell JSHint to make an exception.

We’ve not yet worked out how to hook MockFirebase in to the test suite but we’ll figure that out in our first test.

## Step Three - Authentication

As we imagine ourselves using this app, the first thing we imagine ourselves doing is signing in. Let’s write an acceptence test to drive out that feature.

```sh
ember g acceptance-test authentication
```

This test isn’t quite as we want it so let’s adjust it to our needs. Firstly, let’s address this issue of injecting the mock firebase.

We have our `application` instance that we’re booting up and driving around. We want the same thing with our mock firebase so we make a new variable.

```js
let firebase;
```

And in the test setup, make a new instance:

```js
firebase = new MockFirebase();
```

And let’s tell JSHint to make that exception in test test directory:

```js
"MockFirebase"
```

Now we haven’t written any of this yet but it’d be great if we could just pass this firebase object in when we boot the app. As if to say: “don’t use your own Firebase interface, use this instead”.

```js
app = startApp({ firebase: firebase });
```

And let’s save ourselves some bytes with the new shorthand object
syntax:

```js
app = startApp({ firebase });
```

So this how we want things to look. There’s no point really wiring this up until we have a test to verify it. So let’s write one.

Authentication is a fairly well-trodden path, we:

```js
visit('/');
fillIn('input[type="email"]', 'alice@example.com');
fillIn('input[type="password"]', 'testpassword');
clickOn('button[type="submit"]');
andThen(() => {
  assert.ok(find(':contains("Logged in")').length,
    'expected to see "Logged in"');
});
```

Okay, let’s boot the test server:

```sh
ember t -s
```

Our first failure, excellent. No such element `input[type="email"]`. Let’s figure out where to add that.

We could add these field to our application template and, as we see, they do get rid of the failures. However, the way Ember’s routes and templates work is that they are nested. The application template surrounds everything. If we have a route `foo` it will be rendered within the the application template’s outlet and if we have a route `foo/bar` then bar’s template will be rendered within foo’s outlet.

As a result, things we add to the application template are global, they appear everywhere, which obviously isn’t ideal. What we need is a route dedicated to logging users in. Let’s call it `authenticate`.

```sh
ember g route authenticate
```

This gives us a bunch of stuff, including a template. Let’s try adding out field to the template:

```hbs
<input type="email">
```

Our tests don’t change because of course we’re not rendering this route yet.

We can get our assertion to pass by visit `/authenticate` directly but that’s not how users will actually use the site. We want to send them there if they’re already authenticated.

So if we have this route `authenticate` that by definition you only see when you’re not yet authenticated, then we want it to live apart from every other route in the app that does want authentication.

We can do this with the same route nesting approach.

```sh
ember g route authenticated
```

When we arrive, we want the app to try to render the authenticated UI and if it fails, redirect over to `/authenticate`. It’s very simple to make a route the default at any level down, we simply set it’s path to an empty string:

```js
this.route('authenticated', { path: '' });
```

So now what we want to do is perform some kind of check in the authenticated route, before we are allowed to move any further down.

Ember’s routes have a number of hooks that fire as they load. The first to fire is `beforeModel`. This is the perfect place to perform this sort of check.

Firebase has a method, `getAuth` that you can use to ask whether or not the user is currently authenticated. This is where we start to see our potential boundary interface. If we can control what `getAuth` does, we can see how our application behaves.

So we’ll get hold of our firebase service somehow and then redirect if getAuth returns falsey.

```js
beforeModel() {
  const firebase = ?;
  if (!firebase.getAuth()) {
    this.replaceWith('authenticate');
  }
}
```

By the way: If you’re wondering why I’m not using a unit test for this, it’s because I’m fairly confident the acceptance test will give us adequate coverage.

So where do we get `firebase` from? Ember has the notion of services and injections. The idea is that we can register singleton services and inject them just where they’re needed. I won’t explain it conceptually too much, let’s just see it in pratice:

```js
const { inject } = Ember;

firebase = inject.service(),

const firebase = this.get('firebase');
```

As the test informs us, we don’t have a Firebase service yet. The main way to create a service to use `ember g service`. When we use that, pretty much everything is automatic. In our case though, we want to make sure the right Firebase object gets through. So instead we use an initializer to register our service:

```sh
ember g initializer firebase
```

An initializer is a function that gets called at the right moment during application boot. So what should we do here?

We want to register a firebase or mock firebase object as the firebase service. This is what that looks like:

```js
export function initialize(container, application) {
  const firebase = new Firebase(config.firebase);

  application.register('service:firebase', firebase, { instantiate: false });
}
```

And finally we get to the point where we can plumb in our mock firebase.

```js
const firebase = application.firebase || new Firebase(config.firebase);
```

And now we’re rendering our authenticate route. Let’s add in the rest of those missing elements.

```hbs
<input type="email">
<input type="password">
<button type="submit">Log in</button>
```

Okay, now we’re waiting to see our "Logged in" message but of course that button does absolutely nothing. Let’s try wrapping these fields in a form.

```hbs
<form>
  <input type="email">
  <input type="password">
  <button type="submit">Log in</button>
</form>
```

Blimey, now things are going nuts. That’s because the browser is handling the form the only way it knows how: by submitting to the current page.

We want Ember to handle this form, so let’s use an action.

```hbs
<form {{action "authenticate" on="submit"}}>
  <input type="email">
  <input type="password">
  <button type="submit">Log in</button>
</form>
```

Now we’re firing an action but we’re not doing anything with it. Actions may be handled in a few different places. For right now, I’m favouring the route.

```js
export default Ember.Route.extend({
  actions: {
    authenticate() {
    }
  }
});
```

We saw Firebase’s authWithPassword earlier, so let’s put it to use:

```js
import Ember from 'ember';
const { inject } = Ember;

export default Ember.Route.extend({
  firebase: inject.service(),

  actions: {
    authenticate() {
      const email = '';
      const password = '';
      const firebase = this.get('firebase');

      firebase.authWithPassword({ email, password }, error => {
        if (error) {
          throw error;
        } else {
          this.transitionTo('authenticated');
        }
      });
    }
  }
});
```

We’re calling `authWithPassword` on our mock firebase object, which we have complete control over in our test, so let’s exercise that control.

```js
firebase.authWithPassword = ({ email, password }, callback)  => {
  assert.equal(email, 'test@example.com');
  assert.equal(password, 'testpassword');

  const authData = { uid: 'test-uid' };

  firebase.changeAuthState(authData);
  firebase.flush();

  callback(null, authData);
};
```

I’m going to gloss over the mock firebase specific stuff and focus on the bigger picture. The gist is that we simluate successful authentication by changing the state of the mock firebase and calling the callback with no error.

We still have that failing assertion so let’s add that text to the authenticated template and see if we go green.

```hbs
<p>Logged in</p>
{{outlet}}
```

And we’re green! Except we’re not really because it’s pretty apparent we’re not sending the right credentials through. Let’s use our mocked out method to verify them.

```js
assert.equal(email, 'test@example.com');
assert.equal(password, 'testpassword');
```

Okay awesome, these are very precise failures. The question is, how do we get hold of these values? It would be nice if those inputs in the form could be automatically fed back up to us somehow. This is where ember’s data bindings come into play. Let’s switch those static inputs into bound inputs.

```hbs
{{input type="email" value=model.email}}
{{input type="password" value=model.password}}
```

What’s `model` in this context? Every route in the app—that is, every URL—gets to provide data to its template. For this route, that data is going to represent the form we’re filling in. We can use this hook to provide a simple object to hold the credentials we’ll subsequently pass to Firebase.

```js
model() {
  return {};
}
```

Ember takes care of making sure the underlying data and the DOM are kept in sync in both directions. Conceptually though, the truth lives in the data.

We can then scoop these values up in the authenticate handler:

```js
const credentials = this.get('currentModel');
const firebase = this.get('firebase');

firebase.authWithPassword(credentials, error => {
```

But does it *really* work? Well, let’s see...

So that’s not bad. Let’s refine the UI a bit.

Placeholders:

```hbs
{{input type="email" value=model.email placeholder="Email"}}
{{input type="password" value=model.password placeholder="Password"}}
```

Loading:

```hbs
{{input type="email" value=model.credentials.email placeholder="Email"}}
{{input type="password" value=model.credentials.password placeholder="Password"}}

<button type="submit" disabled={{model.isLoading}}>
  {{#if model.isLoading}}
    Logging in…
  {{else}}
    Log in
  {{/if}}
</button>
```

```js
model() {
  return {
    credentials: {}
  };
}
```

```js
authenticate(credentials) {
  const credentials = this.get('currentModel.credentials');
  const firebase = this.get('firebase');

  this.set('currentModel.isLoading', true);

  firebase.authWithPassword(credentials, error => {
    this.set('currentModel.isLoading', false);

    if (error) {
      throw error;
    } else {
      this.transitionTo('authenticated');
    }
  });
}
```

Let’s write a test for the sad path of authentication.

```js
test('failure', function(assert) {
  visit('/');
  fillIn('input[type="email"]', 'test@example.com');
  fillIn('input[type="password"]', 'testpassword');
  click('button[type="submit"]');
  firebase.authWithPassword = ({ email, password }, callback)  => {
    const error = new Error('The specified password is incorrect');
    callback(error);
  };
  andThen(() => {
    assert.ok(find(':contains("The specified password is incorrect")').length,
      'expected to see "The specified password is incorrect"');
  });
});
```

The implementation is dead easy:

```hbs
{{#if model.error}}
  <p>{{model.error}}</p>
{{/if}}
```

## Step Four - Data Down, Actions Up

What we’ve just seen is Ember’s two-way bindings at work. By using those dynamic inputs, we ensure the values on the model and values on the dom are synchronised at all times, in both directions. This is good and bad.

**The good:** it’s very little code and it makes for a good demo.

**The bad:** our model data can change at any time. While we can react to changes using Ember’s key-value observation, we don’t get any context as to *why* the value changed.

The alternative pattern, openly influenced by React, is called “Data down, actions up”. Data still flows down from models to the DOM and Ember takes care of synchronisation. But, wherever possible the values we pass in should not be mutated directly. Instead, mutations should be triggers by *actions*.

Let’s see what that could look like:

First let’s turn those 2-way bound inputs back into regular old html inputs and give them names.

```hbs
<input type="email" name="email" placeholder="Email">
<input type="password" name="password" placeholder="Password">
```

This breaks our tests because the values don’t have a way up to the route.

Wouldn’t it be nice if our form behaved like a real submission, sending us the data with the action. For this, we’ll need a component:

```hbs
{{#x-form on-submit="authenticate"}}
  <input type="email" name="email" placeholder="Email">
  <input type="password" name="password" placeholder="Password">

  <button type="submit">
    {{#if model.isLoading}}
      Logging in…
    {{else}}
      Log in
    {{/if}}
  </button>

  {{#if model.error}}
    <p>{{model.error}}</p>
  {{/if}}
{{/x-form}}
```

Our test informs us there is no such component so we’ll generate one:

```sh
ember g component x-form
```

In here, we’ll capture the submit event, gather up the values, and send them off in an action:

```js
import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',

  submit(event) {
    event.preventDefault();

    const payload = this.buildPayload();

    this.sendAction('on-submit', payload);
  },

  buildPayload() {
    const values = this.$().serializeArray();

    return values.reduce((result, { name, value }) => {
      result[name] = value;
      return result;
    }, {});
  }
});
```

Note the trendy ES6 destructuring :)

This allows us to simplify our action handler:

```js
authenticate(credentials) {
  const firebase = this.get('firebase');
```

And model hook:

```js
model() {
  return {};
}
```

We’ll keep the model around, as it’s a useful way to pass around errors and other bits of state. In Ember 2.0 this hook is becoming the more generic `attrs`.

Go off piste...
