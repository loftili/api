module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    consumer_key: {
      type: 'string',
      required: true,
      size: 15 
    },

    consumer_secret: {
      type: 'string',
      required: true,
      size: 40
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj['consumer_secret'];
      delete obj['consumer_key'];
      return obj;
    }

  }

};
