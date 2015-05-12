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
