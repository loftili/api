module.exports = {

  tableName: "user_invitation",

  attributes: {

    user: {
      model: "User"
    },

    invitation: {
      model: "Invitation", 
      columnName: "invitation" 
    }

  }

};
