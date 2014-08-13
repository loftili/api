module.exports = {
	
  register: function(req, res, next) {
    sails.log('linking!');
    return res.status(200).send('yay!');
  }

};

