module.exports = {

  attributes: {

    client: {
      model: "client",
      required: true
    },

    token: {
      type: "string",
      required: true,
      size: 9
    },

    user: {
      model: "user",
      required: true
    }

  }

}
