const email = require('nodemailer');

const transporter = email.createTransport({
  service: 'gmail',
  auth: {
    user: 'devchauhan0212@gmail.com',
    pass: 'rbvg jmnz xmqi juea'
  }
});

const mailOptions = {
    from: 'devchauhan0212@gmail.com',
    to: 'devshaileshbhaichauhan@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

const welcomeEmail = (email,name) => {
    transporter.sendMail({
        from: 'devchauhan0212@gmail.com',
        to: email,
        subject: 'Welcome to the Task App!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`       
    },function (e,info){
        if(e){
            console.log(e);
        }else{
            console.log('Email sent!');
        }
    })
}

const cancelEmail = (email,name) => {
    transporter.sendMail({
        from: 'devchauhan0212@gmail.com',
        to: email,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`       
    },function (e,info){
        if(e){
            console.log(e);
        }else{
            console.log('Email sent!');
        }
    })
}

module.exports = {
    welcomeEmail,
    cancelEmail
}

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });