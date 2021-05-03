const algoliaAddIndex = (object) => {
  object.objectID = object.id;
  object = _.omit(object, ["password", "id"]);
  return algolia_index.saveObject(object);
};

module.exports = {
  friendlyName: "Create user",
  description: "Create a new user.",

  inputs: {
    username: {
      type: "string",
      required: true,
    },

    email: {
      type: "string",
      required: true,
    },
    age: {
      type: "number",
      required: true,
    },

    password: {
      type: "string",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "The provided inputs contains data are invalid.",
    },
    success: {
      responseType: "ok",
      description: "The provided inputs are valid.",
    },
  },

  fn: async function (inputs, exits) {
    let user = await sails.helpers.findUser.with({
      email: inputs.email.toLowerCase(),
      username: inputs.username.toLowerCase(),
    });

    console.log(user);

    if (user.length !== 0)
      return this.res.badRequest({
        message: sails.__("email_found"),
        data: {
          message: sails.__("email_found"),
          path: ["email", "username"],
        },
      });

    var attr = {
      id: sails.helpers.randomCryptoString({ size: 32 }).execSync(),
      email: inputs.email.toLowerCase(),
      username: inputs.username.toLowerCase(),
      age: inputs.age,
    };

    attr.password = await bcrypt.hash(inputs.password, 10);

    try {
      let docRef = await db.collection("users").add(attr);

      //generate token
      var token = jwt.sign(
        { user: attr, userType: sails.config.globals.userRoles.normalUser },
        sails.config.jwtSecret,
        { expiresIn: sails.config.jwtExpires }
      );

      //insert the user data to algolia index
      const { objectID } = await algoliaAddIndex(attr);

      //clear unused attributes
      attr = _.omit(attr, ["password", "objectID"]);

      return this.res.successResponse({
        message: sails.__("mission_success"),
        data: {
          token: token,
          user: attr,
          userType: sails.config.globals.userRoles.normalUser,
        },
      });
    } catch (error) {
      return this.res.serverError({
        message: sails.__("database_error"),
        data: { error },
      });
    }
  },
};
