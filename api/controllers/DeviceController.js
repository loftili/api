module.exports = {
	
  destroy: function(req, res) {
    var doomed = req.params.id,
        user = req.session.user;

    if(!doomed)
      return res.status(404).send('');

    if(!user)
      return res.status(401).send('');

    function finish(err, permission) {
      if(err)
        return res.status(400).send('failed to cleanup device permissions');

      return res.status(200).send('');
    }

    function destroyed(err, device) {
      if(err)
        return res.status(400).send('failed to delete device');

      Devicepermission.destroy({device: doomed, user: user}).exec(finish);
    }

    Device.destroy({id: doomed}).exec(destroyed);
  }

};

