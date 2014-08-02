module.exports = {

  migrate: 'drop',

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    owner:{
      model: 'user'
    }

  }

};

