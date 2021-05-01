


module.exports = {
	friendlyName: 'normal user to update his profile',
	description: 'normal user to update his profile',

	inputs: {
		username: {
            type: 'string',
            required: true
        },
        
		email: {
            type: 'string',
            required: true
        },
        age: {
            type: 'number',
              required: true
        },
	},

	exits: {
		invalid: {
			responseType: 'badRequest',
			description: 'The provided inputs contains data are invalid.',
        },
        unauthorized: {
			responseType: 'forbidden',
			description: 'The provided token is invalid',
        },
        success: {
			responseType: 'ok',
			description: 'The provided inputs are valid.',
		},
	 
	},

    fn: async function (inputs, exits) {
       
        let user = this.req.user
		
        if (!user)
            return this.res.errorResponse(sails.config.custom.responseCodes.notFound,
                sails.__('user_not_found'))
        
        if (_.isArray(user))
            user = _.last(user);
        
        console.log("user", user);
        
        //check the user to ensure the unique for email and password
        let attr = {};
        if (inputs.email !== user.email)
            attr.email = inputs.email.toLowerCase();
        
        if (inputs.username !== user.username)
            attr.username = inputs.username.toLowerCase();
         console.log("check the new user unique",attr);
        if (!_.isEmpty(attr)) { 
        let _user = await sails.helpers.findUser.with(attr);

       
        if (_user.length != 0)
            return this.res.errorResponse(sails.config.custom.responseCodes.badRequest, sails.__('email_found'), {
                "message": sails.__('email_found'),
                "path": [
                    "email", "username"
                ]
            })
        }
        
        //init the firestore
        var db = sails.config.globals.firebase.firestore();
        
		const usersRef = db.collection('users');
		

        //update the user new data 
        var updateUser = usersRef.doc(user.docId).set({
            email: inputs.email.toLowerCase(),
            username: inputs.username.toLowerCase(),
			age: inputs.age,
        }, { merge: true }).then(() => {
            
              return this.res.successResponse(sails.config.custom.responseCodes.success
            , sails.__('mission_success'))		
        })
        .catch((error) => {
          return this.res.errorResponse(sails.config.custom.responseCodes.serverError,
              sails.__('server_error'), {error})
        });		 
		 
        
	}
}