module.exports = {

  attributes: {

    client: {
      model: 'client',
      required: true
    },

    token: {
      type: 'string',
      required: true
    },

    user: {
      model: 'user',
      required: true
    }

  }

}
