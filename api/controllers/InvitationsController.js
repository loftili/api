module.exports = (function() {

  var InvitationsController = {};

  InvitationsController.create = function(req, res, next) {
    var user_id = parseInt(req.session.userid),
        target_email = req.body.email;

    if(!(user_id >= 0) || !target_email)
      return req.status(401).send('members only');

    function finish(err, invitation) {
      if(err) {
        sails.log('[InvitationsController][create] errored during manager send');
        return res.status(404).send('');
      }

      sails.log('[InvitationsController][create] successfully sent invite');
      return res.status(200).json(invitation);
    }

    function foundUser(err, user) {
      if(err) {
        sails.log('[InvitationsController][create] errored during manager send');
        return res.status(404).send('');
      }

      if(!user) {
        InvitationsManager.send({from: user_id, to: target_email}, finish);
      } else {
        return res.status(422).send('');
      }
    }

    User.findOne({email: target_email}, foundUser);
  };

  InvitationsController.find = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10);

    if(!(user_id >= 0))
      return res.status(404).send('');

    function foundInvites(err, invites) {
      if(err) {
        sails.log('[InvitationsController] failed to find invitations');
        return res.status(404).send('');
      }

      return res.status(200).json(invites);
    }

    Invitation.find({from: user_id}, foundInvites);
  };

  InvitationsController.destroy = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        invite_id = parseInt(req.params.id, 10);

    if(!(user_id >= 0) || !(invite_id >= 0))
      return res.status(404).send('');

    function finish(err) {
      if(err) {
        sails.log('[InvitationsController][destroy] failed destroying');
        return res.status(404).send('');
      }

      sails.log('[InvitationsController][destroy] finished destroying');
      return res.status(200).send('');
    }

    function found(err, invite) {
      if(err || !invite) {
        sails.log('[InvitationsController][destroy] unable to find requested invite');
        return res.status(404).send('');
      }

      sails.log('[InvitationsController][destroy] found the invite, destroying');
      invite.destroy(finish);
    }

    sails.log('[InvitationsController][destroy] looking up invite['+invite_id+'] from['+user_id+']');
    Invitation.findOne({id: invite_id, from: user_id}, found);
  };

  return InvitationsController;

})();
