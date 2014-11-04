module.exports = {

  attributes: {

    user: {
      model: 'user',
      required: true
    },

    device: {
      model: 'device',
      required: true
    },

    level: {
      type: 'integer',
      required: true
    }

  }

};

