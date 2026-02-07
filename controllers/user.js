PORT=4000
const bcrypt = require('bcrypt');

const User = require("../models/User");

const auth = require("../auth");

const sendPasswordResetEmail = require('../auth').sendPasswordResetEmail;  // Adjust path accordingly

module.exports.registerUser = (req,res) => {

	if (!req.body.email.includes("@")){
	   	return res.status(400).send({ error: "Email invalid" });
	}

	else if (req.body.mobileNo.length !== 11){
	    return res.status(400).send({ error: "Mobile number invalid" });
	}

	else if (req.body.password.length < 8) {
	    return res.status(400).send({ error: "Password must be atleast 8 characters" });

	} else {

		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		});

		return newUser.save()
				.then((user) => res.status(201).send({ message: "Registered Successfully" }))
				.catch(err => {
					console.error("Error in saving: ", err)
					return res.status(500).send({ error: "Error in save"})
				})
		
	}
};

module.exports.loginUser = (req,res) => {

	if(req.body.email.includes("@")){

		return User.findOne({ email : req.body.email })
		.then(result => {

			if(result == null){

				return res.status(404).send({ error: "No Email Found" });

			} else {

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if (isPasswordCorrect) {

					return res.status(200).send({ access : auth.createAccessToken(result)});

				} else {

					return res.status(401).send({ message: "Email and password do not match" });

				}

			}

		})
		.catch(err => {
					console.error("Error in find: ", err)
					return res.status(500).send({ error: "Error in find"})
				})

	} else {

		return res.status(400).send({error: "Invalid Email"})

	}

	
};

module.exports.getProfile = (req, res) => {

	const userId = req.user.id;

	return User.findById(userId)
	        .then(user => {
	            if (!user) {
	                return res.status(404).send({ error: 'User not found' });
	            }

	            // Exclude sensitive information like password
	            user.password = undefined;

	            return res.status(200).send({ user });
	        })
	        .catch(err => {
	        	console.error("Error in fetching user profile", err)
	        	return res.status(500).send({ error: 'Failed to fetch user profile' })
	        });


};

module.exports.updateAsAdmin = async (req, res) => {
    const { userId } = req.params;

    try {

        const isAdmin = req.user.isAdmin;

        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied. Only admin users can perform this action.' });
        }

        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        userToUpdate.isAdmin = true;

        await userToUpdate.save();

        res.status(200).json({ message: 'User updated as admin successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initiate the password reset process and send the reset email
    sendPasswordResetEmail(user);

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};