module.exports = (function() {

  var InvitationsController = {};

  InvitationsController.create = function(req, res, next) {
    var user_id = parseInt(req.session.userid),
        target_email = req.body.email;

    if(!(user_id >= 0) || !target_email)
      return req.status(401).send("members only");

    target_email = (target_email+"").toLowerCase();

    function finish(err, invitation) {
      if(err) {
        sails.log("[InvitationsController][create] errored during manager send");
        return res.status(404).send("");
      }

      sails.log("[InvitationsController][create] successfully sent invite ["+invitation+"]");
      return res.status(200).json(invitation);
    }

    function foundUser(err, user) {
      if(err) {
        sails.log("[InvitationsController][create] errored during manager send");
        return res.status(404).send("");
      }

      if(!user) {
        sails.log("[InvitationsController][create] user target doesnt exist, sending");
        InvitationsManager.send({from: user_id, to: target_email}, finish);
      } else {
        sails.log("[InvitationsController][create] user already a member");
        return res.status(422).send("already a member");
      }
    }

    User.findOne({email: target_email}, foundUser);
  };

  InvitationsController.find = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        token = req.query && req.query.token;

    if(!(user_id >= 0) && !token)
      return res.status(404).send("");

    function foundInvites(err, invites) {
      if(err) {
        sails.log("[InvitationsController] failed to find invitations, err["+err+"]");
        return res.status(404).send("");
      }

      var count = invites.length,
          empty = [];

      for(var i = 0; i < count; i++) {
        var invite = invites[i];

        if(invite.users.length === 0 || user_id >= 0)
          empty.push(invite);
      }

      return res.status(200).json(empty);
    }

    if(!token) {
      Invitation.find({from: user_id}).populate("users").exec(foundInvites);
    } else {
      Invitation.find({token: token}).populate("users").exec(foundInvites);
    }
  };

  InvitationsController.destroy = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        invite_id = parseInt(req.params.id, 10);

    if(!(user_id >= 0) || !(invite_id >= 0))
      return res.status(404).send("");

    function finish(err) {
      if(err) {
        sails.log("[InvitationsController][destroy] failed destroying");
        return res.status(404).send("");
      }

      sails.log("[InvitationsController][destroy] finished destroying");
      return res.status(200).send("");
    }

    function found(err, invite) {
      if(err || !invite) {
        sails.log("[InvitationsController][destroy] unable to find requested invite");
        return res.status(404).send("");
      }

      sails.log("[InvitationsController][destroy] found the invite, destroying");
      invite.destroy(finish);
    }

    sails.log("[InvitationsController][destroy] looking up invite["+invite_id+"] from["+user_id+"]");
    Invitation.findOne({id: invite_id, from: user_id}, found);
  };

  return InvitationsController;

})();
