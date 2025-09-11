if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
};
const bcrypt = require('bcrypt');
const passport = require('passport');
const { session } = require("passport");
const axios = require('axios');
const fetch = require('node-fetch');
let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;
const School = require("../models/school.name");
const Learner = require('../models/leaners');
const Staff = require('../models/staff');
const Recovery = require('../models/emailRecovery');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const Verification = require('../models/verificationCode');
const CBT = require('../models/test');
const Question = require('../models/question');
const Submission = require('../models/submit')

const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

State.getStatesOfCountryByName = function(countryName) {
    // Find the country object by name
    const country = Country.getAllCountries().find(c => c.name === countryName);
    if (country) {
      // Get the states of the country by passing the country isoCode
      return this.getStatesOfCountry(country.isoCode);
    }
    return [];
  };
  
  City.getCitiesOfStateByName = function(countryName, stateName) {
    const country = Country.getAllCountries().find(c => c.name === countryName);
    if (country) {
      const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === stateName);
      if (state) {
        return this.getCitiesOfState(country.isoCode, state.isoCode);
      }
    }
    return [];
  };

  const getMonitorHomePage = async ( req , res ) => {
    try {
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let alphaCode = '';
        for (let i = 0; i < 2; i++) {
          alphaCode += alpha.charAt(Math.floor(Math.random() * alpha.length));
        }

        const numer = "12345678901234567890123456789012345678901234567890123456789012345678901234567890";
        let numerCode = '';
        for (let i = 0; i < 3; i++) {
          numerCode += numer.charAt(Math.floor(Math.random() * numer.length));
        }

        var day = new Date();
        var year = day.getFullYear();

        const schoolId = `MON${numerCode}/${alphaCode}-${year}`

            await res.render('monitor-home-page', { schoolId });
    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  };

  const getStateCoutryName = async ( req , res ) => {
    try {
        const countryName = req.params.countryName;
        const states = State.getStatesOfCountryByName(countryName);
        await res.json(states);
    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  };

  
  const getCitiesCountryStateName = async ( req , res ) => {
    try {
        const countryName = req.params.countryName;
        const stateName = req.params.stateName;
        const cities = City.getCitiesOfStateByName(countryName, stateName);
        res.json(cities);
    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  };



  const submitSchoolReg = async ( req , res ) => {
    try {
        const {school_id, school_name, email, password, password_2} = req.body;
        let errors = [];

        if(!school_id || !school_name || !email || !password || !password_2){
          errors.push( { msg: "Please fill in all fields" } )
        }

        if(password !== password_2) {
          errors.push( { msg : "Password dont macth" } )
          }
        if (password.length < 8) {
          errors.push({ msg: "password atleast 8 character" });
        }

        if(errors.length > 0){
          const countries = Country.getAllCountries();

          const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let alphaCode = '';
          for (let i = 0; i < 2; i++) {
            alphaCode += alpha.charAt(Math.floor(Math.random() * alpha.length));
          }
  
          const numer = "12345678901234567890123456789012345678901234567890123456789012345678901234567890";
          let numerCode = '';
          for (let i = 0; i < 3; i++) {
            numerCode += numer.charAt(Math.floor(Math.random() * numer.length));
          }
  
          var day = new Date();
          var year = day.getFullYear();
  
          const schoolId = `MON${numerCode}/${alphaCode}-${year}`;

          res.render("monitor-home-page", {
            errors: errors,
            school_id: school_id,
            school_name: school_name,
            email: email, 
            password: password, 
            password_2: password,
            schoolId: schoolId,
          })
        } else {
          await School.findOne({email: email}).exec((err, school) => {
            if(school) {
              const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let alphaCode = '';
          for (let i = 0; i < 2; i++) {
            alphaCode += alpha.charAt(Math.floor(Math.random() * alpha.length));
          }
  
          const numer = "12345678901234567890123456789012345678901234567890123456789012345678901234567890";
          let numerCode = '';
          for (let i = 0; i < 3; i++) {
            numerCode += numer.charAt(Math.floor(Math.random() * numer.length));
          }
  
          var day = new Date();
          var year = day.getFullYear();
  
          const schoolId = `MON${numerCode}/${alphaCode}-${year}`;
          
              errors.push ( { msg: "Oops! User already associated with this Email" });
                  
              res.render("monitor-home-page", {
                errors: errors,
                school_id: school_id,
                school_name: school_name,
                email: email, 
                password: password, 
                password_2: password,
                schoolId:schoolId,

              })
            } else {
              const currentDate = new Date();
              var fourteen = new Date(currentDate.getTime() + (100 * 24 * 60 * 60 * 1000));
              const newSchool = new School({
                school_id: school_id,
                school_name: school_name,
                email: email, 
                password: password,
                expiry: fourteen,
                
                
              });

              bcrypt.genSalt(10, (err, salt)=> {
                bcrypt.hash(newSchool.password, salt,
                  (err, hash) => {
                    if(err) throw err;

                    newSchool.password = hash;

                    newSchool
                        .save()
                        .then((savedUser) => {
                          req.flash(
                            "success_msg",
                            `Successfully Registered,
                            ${savedUser.school_id } 
                            is your ID,
                            copy it before clicking OK.
                            You have only ${fourteen} days trial`
                          
                          )
                          res.redirect(`/registration-step2?userId=${savedUser._id}`)
                        })
                        .catch( error => console.log(error))
                  })
              })
            }
          })
        }

    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  }


  const getRegistrationTwo = async ( req , res ) => {
    try {
        const countries = Country.getAllCountries()
        const userId = req.query.userId
        await res.render("registerTwo", {userId, countries} )
    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  };

  const postRegistrationTwo = async ( req , res ) => {
    const userId = req.body.userId || req.query.userId;

    try {
      
        const updatedUser = await School.findByIdAndUpdate(
            userId,
            {
              school_motto: req.body.school_motto,
              country: req.body.country, 
              state: req.body.state, 
              city: req.body.city,
              
            },
            { new: true } // To return the updated document
        );
  
        if (!updatedUser) {
            // Handle the case where the user with the given ID was not found
            return res.redirect(`/registration-step2?error=true&userId=${userId}`);
        }
  
        res.redirect(`/registration-step3?userId=${userId}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/registration-step2?error=true&userId=${userId}`);
    }
  };

  const getRegistrationThree = async ( req , res ) => {
    try {
        const userId = req.query.userId;
        res.render('registrationThree', { userId });
    } catch (err) {
        if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  };

  const postRegistrationThree = async ( req , res ) => {
    const userId = req.body.userId || req.query.userId;

    try {
        const updatedUser = await School.findByIdAndUpdate(
            userId,
            {
              address: req.body.address, 
              address2: req.body.address2, 
              phone_no: req.body.phone_no,
              phone_no2: req.body.phone_no2,
              website: req.body.website,
            },
            { new: true } // To return the updated document
        );
  
        if (!updatedUser) {
            // Handle the case where the user with the given ID was not found
            res.redirect(`/registration-step3?error=true&userId=${userId}`);
        }
        else {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let voucherCode = '';
          for (let i = 0; i < 6; i++) {
            voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
          };
          var day = new Date();
          var year = day.getFullYear();
          const currentDate = new Date();
          var fourteen = new Date(currentDate.getTime() + (1 * 24 * 60 * 60 * 1000));
  
  
          const code = await new Verification({ 
            recovery: voucherCode,
            expiry: fourteen,
            user_email: updatedUser.email,
          }).save();
          const html = `
            <html>
              <head>
                <style>
                  /* Define your CSS styles here */
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    color: #333;
                  }
                  h2 {
                    color: #ff0000;
                  }
                  p {
                    line-height: 1.5;
                  }
                </style>
              </head>
              <body>
                <img src="https://res.cloudinary.com/dj6xdawqc/image/upload/v1713521761/monitor_gkgov5.png" alt="Company Logo">
                <h2>Monitor School Management App Recovery Code</h2>
                <p>Copy the code to recover your Password within 24hrs before it expire.</p>
                <p>${code.recovery}</p>
              </body>
            </html>
          `;
          const mailOptions = {
            from: 'monitorschoolmanagementapp@gmail.com',
            to: updatedUser.email,
            subject: 'Use the below Code to verify your Email',
            html: html
          };
          const smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
              user:'monitorschoolmanagementapp@gmail.com',
              pass:GMAIL_PASSWORD,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 1000,
          };
          const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
          await transporter.sendMail(mailOptions);
  
          req.flash('success_msg', 'Verification Code has been sent to the Email you provided. If not found in your inbox check your Spam mail');
          res.redirect(`/go-verify?userId=${userId}`);
        }

       
    } catch (error) {
        console.error(error);
         res.redirect(`/registration-step3?error=true&userId=${userId}`);
    }
  };

  const emailVerification = async ( req , res ) => {
    try {
      const userId = req.query.userId;
      res.render('verify', { userId });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
  }

  const verifyEmailWithCode = async (req, res) => {
    try {
      const userId = req.body.userId || req.query.userId;
      const { recovery } = req.body;
      let errors = [];
  
      if (!recovery) {
        errors.push({ msg: "Please fill in all fields" });
      }
  
      if (errors.length > 0) {
        req.flash('error_msg', "Error registration: " + errors[0].msg);
        return res.redirect(`/go-verify?error=true&userId=${userId}`);
      }
  
      const verify = await Verification.findOne({ recovery }).exec();
      const school = await School.findById(userId).exec();
  
      if (!verify) {
        errors.push({ msg: "Invalid verification code" });
      }
  
      if (!school) {
        errors.push({ msg: "Oops! School not found" });
      }
  
      if (verify && school && verify.isUsed === true) {
        errors.push({ msg: "Oops! Code already used" });
      }
  
      if (verify && school && verify.expiry < Date.now()) {
        errors.push({ msg: "Oops! Code is expired. Try getting a new code" });
    }

      if (verify && school && verify.user_email !== school.email ) {
        errors.push({ msg: "invalid code" });
      }
  
      if (errors.length > 0) {
        req.flash('error_msg', errors[0].msg);
        return res.redirect(`/go-verify?error=true&userId=${userId}`);
      }
  
      verify.isUsed = true;
      school.verified = true;
  
      await verify.save();
      await school.save();
  
      req.flash('success_msg', 'Your email is verified. Please log in.');
      res.redirect('/admin/admin_dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', "An error occurred while processing your request. Please try again later.");
      res.redirect(`/go-verify?userId=${userId}`);
    }
  };
  
  const getLoginPage = async (req , res) => {
    await res.render('login')
  }

  const logOuts = async ( req , res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Your Session Terminated, see you next time');
        res.redirect('/')
    });
  };


  // ---------------------------Change Password----------------------------- //

  const getForgetPasswordPAge =  async (req, res) => {
    try {
      await 
      res.render('forget_password')
    } catch (error) {
      console.log(error)
    }
  };


  const getRecoverPasswordPage = async (req, res) => {
    try {
      await 
      res.render('recover_password')
    } catch (error) {
      console.log(error)
    }
  };
  

  const resetPassword = async ( req , res ) => {
    const { email, userType } = req.body; // Add userType field to identify the type of user

    let errors = [];
  
    if (!email || !userType) { // Ensure userType is provided
      errors.push({ msg: "Please fill in all fields" });
    }
  
    if (errors.length > 0) {
      res.render('forget_password', {
        errors: errors,
        email: email,
      });
    } else {
      try {
        let user;
        switch (userType) { // Select model based on userType
          case 'School':
            user = await School.findOne({ email: email });
            break;
          case 'Staff':
            user = await Staff.findOne({ email: email });
            break;
          case 'Learner':
            user = await Learner.findOne({ email: email });
            break;
          default:
            errors.push({ msg: "Invalid user type" });
            res.render('forget_password', {
              errors: errors,
              email: email,
            });
            return; // Exit function if userType is invalid
        }
  
        if (!user) {
          errors.push({ msg: "Oops! no User associated with that email" });
          res.render('forget_password', {
            errors: errors,
            email: email,
          });
        } else {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let voucherCode = '';
          for (let i = 0; i < 6; i++) {
            voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
          };

          var day = new Date();
          var year = day.getFullYear();
          const currentDate = new Date();
          var fourteen = new Date(currentDate.getTime() + (1 * 24 * 60 * 60 * 1000));


          const code = await new Recovery({ 
            recovery: "M-" + voucherCode,
            expiry: fourteen,
            user_email: email,
          }).save();
          const html = `
            <html>
              <head>
                <style>
                  /* Define your CSS styles here */
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    color: #333;
                  }
                  h2 {
                    color: #ff0000;
                  }
                  p {
                    line-height: 1.5;
                  }
                </style>
              </head>
              <body>
                <img src="https://res.cloudinary.com/dj6xdawqc/image/upload/v1713521761/monitor_gkgov5.png" alt="Company Logo">
                <h2>Monitor School Management App Email Passsword Recovery Code</h2>
                <p>Copy the code to recover your Password within 24hrs before it expire.</p>
                <p>${code.recovery}</p>
              </body>
            </html>
          `;
          const mailOptions = {
            from: 'monitorschoolmanagementapp@gmail.com',
            to: user.email,
            subject: 'Use the below Code to recover your Password',
            html: html
          };
          const smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
              user: 'monitorschoolmanagementapp@gmail.com',
              pass: GMAIL_PASSWORD,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 1000,
          };
          const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
          await transporter.sendMail(mailOptions);
          req.flash('success_msg', 'Recovery Code has been sent to the Email you provided. If not found in your inbox check your Spam mail');
          res.redirect('/recover-password');
        }
    } catch (err) {
      console.log(err);
      res.render('forget_password', {
        errors: [{ msg: "An error occurred while processing your request. Please try again later." }],
        email: email,
      });
    }
  }
  }


  const recoverGmailPassword = async (req, res) => {
    const { email, recoveryCode, newPassword, userType } = req.body;
    let errors = [];
  
    if (!email || !recoveryCode || !newPassword || !userType) {
      errors.push({ msg: "Please fill in all fields" });
    }
  
    if (errors.length > 0) {
      res.render('recover_password', {
        errors: errors,
        email: email,
        recoveryCode: recoveryCode,
        newPassword: newPassword,
        userType: userType,
      });
    } else {
      try {
        // Find the recovery code in the database
        const recovery = await Recovery.findOne({ recovery: recoveryCode });
        if (!recovery) {
          // If the recovery code doesn't exist, show an error message
          errors.push({ msg: "Invalid recovery code" });
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
            userType: userType,
          });
        } else if (recovery.isUsed) {
          // If the recovery code has already been used, show an error message
          errors.push({ msg: "This recovery code has already been used." });
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
            userType: userType,
          });
        } else if (recovery.user_email !== email) {

          errors.push({ msg: "code is invalid." });
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
            userType: userType,
          });
        }else if (recovery.expiry < Date.now()) {

          errors.push({ msg: "code has expired." });
          res.render('recover_password', {
            errors: errors,
            email: email,
            recoveryCode: recoveryCode,
            newPassword: newPassword,
            userType: userType,
          });
        }  else {
          // If the recovery code exists and hasn't been used, update the user's password in the database
          let user;
          switch (userType) {
            case 'School':
              user = await School.findOne({ email: email });
              break;
            case 'Staff':
              user = await Staff.findOne({ email: email });
              break;
            case 'Learner':
              user = await Learner.findOne({ email: email });
              break;
            default:
              errors.push({ msg: "Invalid user type" });
              res.render('recover_password', {
                errors: errors,
                email: email,
                recoveryCode: recoveryCode,
                newPassword: newPassword,
                userType: userType,
              });
              return; // Exit function if userType is invalid
          }
  
          if (!user) {
            // If the user doesn't exist, show an error message
            errors.push({ msg: "No user associated with that email" });
            res.render('recover_password', {
              errors: errors,
              email: email,
              recoveryCode: recoveryCode,
              newPassword: newPassword,
              userType: userType,
            });
          } else {
            // Generate salt and hash the new password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
  
            // Update the user's password in the database
            user.password = hash;
            await user.save();
  
            // Update the recovery code in the database to show that it has been used
            recovery.isUsed = true;
            await recovery.save();
  
            // Redirect the user to the login page with a success message
            req.flash('success_msg', 'Your password has been reset. Please log in.');
            res.redirect('/');
          }
        }
      } catch (err) {
        console.error(err);
        errors.push({ msg: "An error occurred while processing your request. Please try again later." });
        res.render('recover_password', {
          errors: errors,
          email: email,
          recoveryCode: recoveryCode,
          newPassword: newPassword,
          userType: userType,
        });
      }
    }
  };

  //  ------------------------------CBT-----------------------------------//

  const getQusetions = async ( req , res ) => {
    try {
     
      const id = req.params.id;
  
      const cbTest = await CBT.findById(id).exec();
      const schoolId = cbTest.schoolId;
      const school = await School.findById(schoolId);
      if(!cbTest) {
        return res.render('error404', { title: "Error 505. Page not found." });
      }

      res.render('cbtTestRoute', {
        cbTest,
        school,

      })

    } catch (err) {
      console.error(err);
      return res.render('error5', { title: "Internal Server Error." +" "+ err });
    }
  };


  const getGetCbtQuestion = async (req, res) => {
    try {
      
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
      
      const id = req.params.id;
      const test = await CBT.findById(id).populate('questions').exec();
  
      if (!test) {
        return res.render('error404', { title: "Error 404. Test not found." });
      }

      const question = await Question.find( { testId : id }).exec();
      if (!question ) {
        return res.render('error404', { title: "Error 404. Test not found." });
      }
  
      return res.render('cbt-center', { user: req.user, test, question });
  
    } catch (err) {
      console.error(err);
      return res.render('error5', { title: "Internal Server Error. " + err });
    }
  };


  const transformAnswers = (body) => {
    const transformed = {};
    
    for (const key in body) {
      if (key.startsWith('answers[') && key.endsWith('][]')) {
        const questionId = key.slice(8, -3);
        if (!transformed.answers) {
          transformed.answers = {};
        }
        if (!transformed.answers[questionId]) {
          transformed.answers[questionId] = [];
        }
        transformed.answers[questionId].push(body[key]);
      } else if (key.startsWith('answers[')) {
        const questionId = key.slice(8, -1);
        if (!transformed.answers) {
          transformed.answers = {};
        }
        transformed.answers[questionId] = body[key];
      } else {
        transformed[key] = body[key];
      }
    }
    
    return transformed;
  };
  
 const submitExam = async (req, res, next) => {
  try {
    // Debugging: Log the entire request body
    console.log("Request Body:", req.body);

    // Transform the request body into a usable format
    const transformedBody = transformAnswers(req.body);
    console.log("Transformed Body:", transformedBody);

    const { answers } = transformedBody;
    if (!answers) {
      return res.status(400).send("Answers are required");
    }

    // Fetch the test and its questions
    const test = await CBT.findById(req.params.testId).populate("questions");
    if (!test) {
      return res.status(404).send("Test not found");
    }

    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(403).send("User not authenticated");
    }

    console.log("Submitted answers:", answers);

    let score = 0;
    const answeredQuestions = [];

    // Helper function for normalization
    const normalize = (val) => {
      if (typeof val === "string") return val.trim().toLowerCase();
      if (typeof val === "number") return String(val);
      return String(val).trim().toLowerCase();
    };

    // Evaluate answers
    for (let question of test.questions) {
  const questionId = question._id.toString();

  if (answers[questionId] !== undefined) {
    let userAnswer = answers[questionId];
    let correctAnswer = question.correctAnswer;

    const normalize = (val) => {
      if (typeof val === "string") return val.trim().toLowerCase();
      if (typeof val === "number") return String(val);
      return String(val).trim().toLowerCase();
    };

    if (Array.isArray(userAnswer)) {
      if (Array.isArray(correctAnswer)) {
        // ✅ Partial scoring for multiple answers
        const normalizedCorrect = correctAnswer.map(normalize);
        const normalizedUser = userAnswer.map(normalize);

        const matched = normalizedUser.filter(ans => normalizedCorrect.includes(ans));
        const partialScore = matched.length / normalizedCorrect.length;

        score += partialScore; // add fractional score
      } else {
        // Correct answer is single value
        if (userAnswer.some(ans => normalize(ans) === normalize(correctAnswer))) {
          score += 1;
        }
      }
    } else {
      if (Array.isArray(correctAnswer)) {
        // Single user answer vs multiple correct → still allow partial
        const normalizedCorrect = correctAnswer.map(normalize);
        if (normalizedCorrect.includes(normalize(userAnswer))) {
          score += 1 / normalizedCorrect.length; // give fractional credit
        }
      } else {
        // Both are single values
        if (normalize(userAnswer) === normalize(correctAnswer)) {
          score += 1;
        }
      }
    }

    answeredQuestions.push(question._id);
  }
}


    // Save submission
    const submission = new Submission({
      userId: req.user._id,
      testId: test._id,
      answers,
      score,
      session: test.session,
      term: test.term,
      subject: test.title,
      type: test.type,
      ca_pos: test.ca_pos,
      submittedAt: new Date(),
    });

    await submission.save();

    // Track user participation in test
    const userExamId = req.user._id;
    if (!Array.isArray(test.userId)) {
      test.userId = [];
    }
    if (!test.userId.includes(userExamId.toString())) {
      test.userId.push(userExamId);
    }
    await test.save();

    // End session and show score
    req.logOut(function (err) {
      if (err) return next(err);

      req.flash("success_msg", "Session Terminated");
      res.render("success", {
        title: `Your score is ${score} out of ${test.questions.length}`,
      });
    });
  } catch (err) {
    console.error("Error in submitExam:", err);
    res.render("error5", { title: "Internal Server Error. " + err.message });
  }
};



  const studentLogin = async (req, res, next) => {
    const testId = req.params.id; // Capture testId here
  
    passport.authenticate("learner-login", async (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        req.logout(function (err) {
          if (err) {
            return next(err);
          }
          req.flash('error_msg', 'Wrong login details');
          return res.redirect(`/cbtcenter/${testId}`);
        });
      } else {
        const userSchool = await School.findOne({ _id: user.schoolId }).exec();
        if (!userSchool) {
          req.logout(function (err) {
            if (err) {
              return next(err);
            }
            req.flash('error_msg', 'You are not Authorised for this session');
            return res.redirect(`/cbtcenter/${testId}`);
          });
        }else {

          const test = await CBT.findById(testId).exec();

          if (test.userId.includes(user._id.toString())) {
            req.logout((err) => {
              if (err) {
                return next(err);
              }
              req.flash('error_msg', 'You have already completed this test.');
              return res.redirect(`/cbtcenter/${testId}`);
            });
          } else {
            const handleLogin = (redirectUrl) => {
              req.logIn(user, function (err) {
                if (err) {
                  return next(err);
                }
                req.flash('success_msg', 'You are welcome');
                return res.redirect(redirectUrl);
              });
            };
    
            if (userSchool.fees === "pending" && userSchool.expiry > Date.now()) {
              handleLogin(`/cbt-portal/${testId}`);
            } else if (userSchool.fees === "pending" && userSchool.expiry < Date.now()) {
              req.logout((err) => {
                if (err) {
                  return next(err);
                }
                req.flash('error_msg', 'You are not Authorised for this session');
                return res.redirect(`/cbtcenter/${testId}`);
              });
            } else if (userSchool.status === false) {
              req.logout(function (err) {
                if (err) {
                  return next(err);
                }
                req.flash('error_msg', 'You are not Authorised for this session');
                return res.redirect(`/cbtcenter/${testId}`);
              });
            } else if (userSchool.fees === "paid") {
              handleLogin(`/cbt-portal/${testId}`);
            } else {
              req.flash('error_msg', "You are not Authorised for this session");
              return res.redirect(`/cbtcenter/${testId}`);
            }
          }
        } 
      }
    })(req, res, next);
  };

  const adminlogOut = async ( req , res ) => {
    const testId = req.params.id; 
    req.logOut(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success_msg', 'Session Terminated');
      res.redirect(`/cbtcenter/${testId}`);
  })
  };
  

  
  
  


module.exports = {
   
    getMonitorHomePage,
    getStateCoutryName,
    getCitiesCountryStateName,
    submitSchoolReg,
    getRegistrationTwo,
    postRegistrationTwo,
    getRegistrationThree,
    postRegistrationThree,
    getLoginPage,
    logOuts,
    getForgetPasswordPAge,
    getRecoverPasswordPage,
    resetPassword,
    recoverGmailPassword,
    emailVerification,
    verifyEmailWithCode,
    getQusetions,
    getGetCbtQuestion,
    studentLogin,
    adminlogOut,
    submitExam,
}
