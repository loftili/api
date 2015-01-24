module.exports = {

  attributes: {

    from: {
      model: 'user',
      required: true
    },

    token: {
      type: 'string',
      required: true,
      size: 10
    },

    to: {
      type: 'email',
      required: true
    },

    state: {
      type: 'integer',
      defaultsTo: 0
    },

    users: {
      collection: 'UserInvitation',
      via: 'invitation'
    }

  }

};
