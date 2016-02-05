module.exports = {

  attributes: {

    name: {
      type: "string",
      required: true
    },

    artist: {
      model: "artist"
    }
    
  }

};

