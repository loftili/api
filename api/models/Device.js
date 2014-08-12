module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    hostname: {
      type: 'string'
    },

    status: {
      type: 'boolean'
    },

    ip_addr: {
      type: 'string',
      regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    },

    permissions: {
      collection: 'devicepermission',
      via: 'device'
    }

  }

};

