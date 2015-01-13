module.exports = {

  attributes: {

    client: {
      model: 'client',
      required: true
    },

    token: {
      type: 'string',
      required: true,
      size: 40
    },

    user: {
      model: 'user',
      required: true
    }

  }

}
