const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();


const secret = "csp2-b337-acuna-panahon";

// Function to create and send a password reset email
const sendPasswordResetEmail = (email, resetToken) => {
  // Replace the following with your actual email sending logic
  const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

  const mailOptions = {
    from: 'neil.paypertask@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://your-app/reset-password?token=${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};
























module.exports.createAccessToken = (user) => {

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	return jwt.sign(data, secret, {});

}


module.exports.verify = (req,res, next) => {

	console.log(req.headers.authorization);

	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.send({ auth: "Failed. No token"})
	}
	else{
		console.log(token); 

		token = token.slice(7, token.length); 
	
		console.log(token); 

		jwt.verify(token, secret, function(err, decodedToken){

			if(err){
				return res.send(
				{
					auth: "Failed",
					message: err.message
				});
			}
			else{
				console.log("result from verify method: ");
				console.log(decodedToken);

				req.user = decodedToken;

				next();
			}
		})
	}
}

module.exports.verifyAdmin = (req, res, next) =>{

	if(req.user.isAdmin){
		next();
	}

	else{
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}

}

module.exports.isLoggedIn = (req, res, next) => {

	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}

}
// >>>>>>> neil










// Function to initiate the password reset process and send an email
module.exports.sendPasswordResetEmail = (user) => {
  const resetToken = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
  sendPasswordResetEmail(user.email, resetToken);
  // You may want to store resetToken in your database for later verification
};