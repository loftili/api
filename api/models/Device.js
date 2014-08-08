module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    ip_addr: {
      type: 'string',
      regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    },

    owner: {
      model: 'user'
    }

  }

};

