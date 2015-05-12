import Ember from 'ember';
const { inject } = Ember;

export default Ember.Route.extend({
  firebase: inject.service(),

  beforeModel: function() {
    const firebase = this.get('firebase');

    if (!firebase.getAuth()) {
      this.replaceWith('authenticate');
    }
  }
});
