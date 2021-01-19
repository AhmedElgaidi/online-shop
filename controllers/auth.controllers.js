const crypto = require('crypto')// node.js module for doing cryptographic actions, which
// we'll use it to generate a token for reset password controller
// import fs module, so we can embed our html for sending our email(html) to user
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const ourFile = path.dirname(process.mainModule.filename) + '/views/auth/resetPasswordForMailing.ejs';

const bcrypt = require('bcrypt');

// importing nodemailer module for sending emails
const nodemailer = require('nodemailer');

// Let's intialize our transporter(tells nodemailer how emails will be deliverd)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'elbotanistelbotanist@gmail.com',
        pass: '<Ana/Elhacker/>'
    }
});

// Our mongoose model
const User = require('../models/User');

// Naming convention by MDN
// (1) login_get
// (2) login_post
// (3) signup_get
// (4) signup_post
// (5) logout_get
// (6) resetPassword_get
// (7) resetPassword_post
// (8) newPassword_get
// (9) newPassword_post

//================================

// (1)
const login_get = (req, res, next) => {
    // for not always have the message div in our view
    // (1)
    let errorMessage = req.flash('error'); // flash gives an array of messages
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        // so it doesn't display any div
        errorMessage = null;
    }
    // (2)
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    } else {
        successMessage = null;
    }
    res.render('auth/login', {
        title: 'Log In Page',
        path: '/login',
        errorMessage,
        successMessage
    });
};

// (2)
const login_post = (req, res, next) => {
    // Let's set cookie
    // We'll not establish this on our own, there is available packages to do this
    // res.setHeader('Set-Cookie', 'isLoggedIn=true;HttpOnly')
    // HttpOnly parameter is an aditional security layer, to prevent js code to collect our 
    // cookies from the browser, so it prevent our website from injection attacks
    // 
    // console.log(req.session)
    // req.session.loggedIn = true
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            // check the user
            if(!user) {// we don't has this user in our db
                // send message to user
                // key: messageValue
                req.flash('error', 'Invalid email or password !');
                return res.redirect('/login')
            }
            // if we have the email in our db
            // let's check the password
            // bcrypt returns promise, so we can chain
            bcrypt
                .compare(password, user.password)// returns either true or false
                .then(matched => { // 
                    if(matched) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                          req.flash('success', 'Successfully logged in');
                          res.redirect('/admin/products');
                        });
                    }
                    req.flash('error', 'Invalid email or password !');
                    return res.redirect('/login');
                })
                // something happens when comparing the hash and the password func.
                // cuz it always returns a boolean value (true, false)
                // either it matched or not
                .catch(err => console.log(err));
        })

};

// (3)
const signup_get = (req, res, next) => {
    // for not always have the message div in our view
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        // so it doesn't display any div
        errorMessage = null;
    }
    res.render('auth/signup', {
        title: 'Sign Up Page',
        path: '/signup',
        errorMessage
    });
};

// (4)
const signup_post = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if(user) {
                req.flash('error', "E-mail is already taken, please choose another one")
                return res.redirect('/signup');
            }
            // We could hash the password here in our controller, or in our mongoose model
            // by using pre hook before saving to db
            return bcrypt.hash(password, 12) // 12 => refers to salt rounds (async func., returns promise)
            // this promise returns hashedPassword, that we can use in another then() chain
                .then(hashedPassword => {
                    // Or
                    // const user = user.create({email, password, cart: {items: []}});
                    const user = new User( {
                        email,
                        password: hashedPassword,
                        cart: {
                            items: []
                        }
                    });
                    return user.save()// so we can chain another then()
                })
                .then(result => {
                    req.flash('success', 'Now, use your credential to log in')
                    res.redirect('/login');
                    const mailOptions = {
                        from: 'elbotanistelbotanist@gmail.com',
                        to: email,
                        subject: 'After signing up',
                        html: '<h1>Welcome</h1><h3> you successfully signed up!</h3>'
                    };
                    // return transporter.sendMail(mailOptions, (error, info) => {
                    //     if(error) {
                    //         console.log(error);
                    //     } else {
                    //         console.log('Email sent: ', info.response);
                    //     }
                    // })
                    // .catch(err => console.log(err.message));
                })
        })
        .catch(err => {
            console.log(err.message)
        })
};

// (5)
const logout_get = (req, res, next) => {
    req.session.destroy(err => {
        return res.redirect('/products');
    });
};

// (6)
const resetPassword_get = (req, res, next) => {
    // (1)
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        // so it doesn't display any div
        errorMessage = null;
    }
    // (2)
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    } else {
        successMessage = null;
    }
    res.render('auth/reset', {
        title: 'Reset Password Page',
        path: '/reset',
        errorMessage,
        successMessage
    });
};

// (7)
const resetPassword_post = (req, res, next) => {
    // use crypto module method 
    // randomBytes(size of bytes of generated string, cb called once it's done)
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            console.log(error);
        }
        // we pass 'hex' to change the data form hexadecimal value to normal ASCII chars
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if(!user) {
                    req.flash('error', 'We don\'t have this email, check the spelling if you are sure!' );
                    return res.redirect('/reset-password');
                }
                // if we have this email in db
                user.resetToken = token;
                // Date.now() resturns time in ms  //from hours to ms =>  h * M * S * ms
                user.resetTokenExpiration = Date.now() + (1 * 60 * 60 * 1000); // 1h
                // let's chain this, so we can chain another then() to ensure that user is saved
                return user.save();// update it now
            })
            .then(result => {
                req.flash('success', 'Check your mail box !')
                res.redirect('/login');
                let templateString = fs.readFileSync(ourFile, 'utf-8');
                let html = ejs.render(templateString, { token });
                const mailOptions = {
                    from: 'elbotanistelbotanist@gmail.com',
                    to: req.body.email,
                    subject: 'Password Reset',
                    html: html
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                    console.log(err);
                    } else {
                    console.log('Message sent: ' + info.response);
                    }
                })
            })
    })
};

// (8)
const newPassword_get = (req, res, next) => {
    // first, i need that there's a token
    const token = req.params.token;
    // We need to be sure that the time is higher than the current date
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date() } })
    .then(user => {
        // (1)
        let errorMessage = req.flash('error');
        if(errorMessage.length > 0) {
            errorMessage = errorMessage[0];
        } else {
            // so it doesn't display any div
            errorMessage = null;
        }
        // (2)
        let successMessage = req.flash('success');
        if(successMessage.length > 0) {
            successMessage = successMessage[0];
        } else {
            successMessage = null;
        }
        res.render('auth/newPassword', {
            title: 'New Password Page',
            path: '/new-password',
            errorMessage,
            successMessage,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => console.log(err));
};

// (9)
const newPassword_post = (req, res, next) => {
    const { userId, password: newPassword, passwordToken } = req.body;
    let resetUser;
    User.findOne({
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() }
    })
    .then(user => {
        resetUser = user
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.passwordToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        req.flash('success', 'Use your new password !')
        res.redirect('/login');
    })
    .catch(err => console.log(err));

};

//=================================

// Export my controllers
module.exports = {
    login_get,
    login_post,
    signup_get,
    signup_post,
    logout_get,
    resetPassword_get,
    resetPassword_post,
    newPassword_get,
    newPassword_post
};