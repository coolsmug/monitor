const Learner = require("../models/leaners");
const Exam = require('../models/exam');
const Session = require('../models/session');
const Section = require('../models/section');
const Subject = require('../models/subject');
const Currentclass = require('../models/current_class');
const Miscellaneous = require('../models/miscellaneous');
const Proprietor = require('../models/proprietor');
const Staff = require('../models/staff.js');
const Staffstatement = require("../models/staff.statetment");
const ThirdSection = require('../models/third._term_section');
const Examing = require("../models/third_exam")
const Schoolname = require("../models/school.name")
const passport = require('passport');
const { session } = require("passport");
const Voucher = require("../models/token");
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const bcrypt = require('bcrypt');


const studentLogin = async (req, res, next) => {
  passport.authenticate("learner-login", async (err, user, info) => {
      if (err) {
          return next(err);
      } else {
          if (user) {
              const userSchool = await Schoolname.findOne({ _id: user.schoolId }).exec();

              if (userSchool) {
                  if (userSchool.fees === "pending" && userSchool.expiry > Date.now()) {
                      req.logIn(user, function (err) {
                          if (err) {
                              return next(err);
                          }
                          req.flash('success_msg', 'You are welcome ' + req.user.first_name);
                          return res.redirect("/learner/student-profile");
                      });
                  } else if (userSchool.fees === "pending" && userSchool.expiry < Date.now()) {
                      req.logout((err) => {
                          if (err) {
                              return next(err);
                          }
                          req.flash('error_msg', 'Your School trial session has ended');
                          return res.redirect('/');
                      });
                  }else if(userSchool.status === false ){
                    req.logOut(function (err) {
                      if (err) {
                          return next(err);
                      }
                      req.flash('error_msg', 'Your school has been Suspended temporarily');
                      res.redirect('/')
                  });
                  } else if (userSchool.fees === "paid") {
                      req.logIn(user, function (err) {
                          if (err) {
                              return next(err);
                          }
                          req.flash('success_msg', 'You are welcome');
                          return res.redirect("/learner/student-profile");
                      });
                  } else {
                      req.flash('error_msg', "Invalid fees status");
                      return res.redirect('/');
                  }
              } else {
                  req.logOut(function (err) {
                      if (err) {
                          return next(err);
                      }
                      req.flash('error_msg', 'not tally info');
                      res.redirect('/')
                  });
              }
          } else {
              req.logOut(function (err) {
                  if (err) {
                      return next(err);
                  }
                  req.flash('error_msg', 'Wrong login details');
                  res.redirect('/');
              });
          }
      }
  })(req, res, next);
};


const studentProfile = async ( req , res ) => {
    try {
        
        const session = await Session.find( { schoolId : req.user.schoolId } ).exec();

        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.setHeader('Expires', '-1');
        res.setHeader('Pragma', 'no-cache');
        
          res.render('student_profile', {
            user: req.user,
            session,
            
        
          })

    } catch (err) {
        res.status(500).send('Internal server error' + " " + err.message);
        console.log(err.message);
    }
};

const learnerLogout = async ( req , res ) => {
    try {
        
        req.logOut(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success_msg', 'Session Terminated');
            res.redirect('/')
        })

    } catch (err) {
        res.status(500).send('Internal server error' + " " + err.message);
        console.log(err.message);
    }
};

function generateRandomCode(length, characters) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

const learnerCheckResultFirstSecondTerm = async ( req , res ) => {
    try {
        const { name, admin_no, classof, roll_no, code } = req.query;
    
        if (!(name && admin_no && classof && roll_no && code)) {
          return res.render('success', { title: "No query parameters provided: Information missing" });
        }
    
        const alphaCode = generateRandomCode(2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const numerCode = generateRandomCode(6, '12345678901234567890123456789012345678901234567890123456789012345678901234567890');
        const year = new Date().getFullYear();
        const resultSerialNumber = `monresult${numerCode}/${alphaCode}-${year}`;

        const learner = await Learner.findOne({ roll_no: admin_no }).exec(); // Ensure .exec() is used to actually execute the query

        if (!learner) {
          // Handle case where learner document is not found
          return res.render('success', { title: "Learner not found" });
        }

        const learnerId = learner._id;  
    
        const voucherId = await Schoolname.findOne( { _id : req.user.schoolId } ).exec()
       
        const pin = await Voucher.findOne( { code, schoolId : voucherId._id } ).exec();
        
        if (!pin) {
          return res.render('success', { title: "Invalid voucher not identified with your school Identity. As any Fraud Activities are punishable" });
        }

        const pinToString = pin.userid ? pin.userid.toString() : '';
        const learnerToString = learnerId ? learnerId.toString() : '';
        console.log(pinToString);
        console.log(learnerToString);    
    
        if (pin && pin.expiry > Date.now()) {
          if (pin.usage_count >= 3 ) {
            return res.render('success', { title: "Oops! This pin has reached its usage limit" });
          }
    
          if (pinToString != learnerToString && pin.used == true) {
            return res.render('success', { title: "This pin has been assigned to a learner" });
          }
    
          const exam = await Exam.find({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
          const misc = await Miscellaneous.findOne({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
          const users = await Learner.findById(learnerId).exec();
          const section = await Section.findOne({ roll_no, name, classof, schoolId: voucherId._id }).exec();
          const session = await Session.findOne({ classof, schoolId: voucherId._id }).exec();
    
          if (exam) {
            await Voucher.updateOne({ code }, { $set: { userid: learner._id, used: true }, $inc: { usage_count: 1 } });
            return res.render("term_result", { exam, misc, users, section, session, user : voucherId , resultSerialNumber });
          } else {
            return res.render('success', { title: "One or more required database queries failed" });
          }
        } else {
          
            return res.render('success', { title: "Oops! The pin you entered has expired" });
          
        }
      } catch (error) {
        console.error(error);
        return res.render('success', { title: "An error occurred. Please try again later." });
      }
};


const checkThirdTermResult = async ( req , res ) => {
    try {
        const { name, admin_no, classof, roll_no, code } = req.query;
    
        if (!(name && admin_no && classof && roll_no && code)) {
          return res.render('success', { title: "No query parameters provided: Information missing" });
        }
    
        const alphaCode = generateRandomCode(2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const numerCode = generateRandomCode(6, '12345678901234567890123456789012345678901234567890123456789012345678901234567890');
        const year = new Date().getFullYear();
        const resultSerialNumber = `monresult${numerCode}/${alphaCode}-${year}`;

        const learner = await Learner.findOne({ roll_no: admin_no }).exec();

        if (!learner) {
          // Handle case where learner document is not found
          return res.render('success', { title: "Learner not found" });
        }

        const learnerId = learner._id;
    
        const voucherId = await Schoolname.findOne( { _id : req.user.schoolId } ).exec();
    
        const pin = await Voucher.findOne({ code, schoolId: voucherId._id }).exec();

        if (!pin) {
          return res.render('success', { title: "Invalid voucher not identified with your school Identity. As any Fraud Activities are punishable" });
        }

        const pinToString = pin.userid ? pin.userid.toString() : '';
        const learnerToString = learnerId ? learnerId.toString() : '';
        console.log(pinToString);
        console.log(learnerToString);
    
        if (pin && pin.expiry > Date.now()) {
          if (pin.usage_count >= 3) {
            return res.render('success', { title: "Oops! This pin has reached its usage limit" });
          }
    
          if (pinToString != learnerToString && pin.used == true) {
            return res.render('success', { title: "This pin has been assigned to a learner" });
          }
    
          const exam = await Examing.find({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
          const misc = await Miscellaneous.findOne({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
          const users = await Learner.findById(learnerId).exec();
          const section = await ThirdSection.findOne({ roll_no, name, classof, schoolId: voucherId._id }).exec();
          const session = await Session.findOne({ classof, schoolId: voucherId._id }).exec();
    
          if (exam) {
            await Voucher.updateOne({ code }, { $set: { userid: learner._id, used: true }, $inc: { usage_count: 1 } });
            return res.render("third_term_result", { exam, misc, users, section, session, user: voucherId, resultSerialNumber });
          } else {
            return res.render('success', { title: "One or more required database queries failed" });
          }
        } else {
          
            return res.render('success', { title: "Oops! The pin you entered has expired" });
          
        }
      } catch (error) {
        console.error(error);
        return res.render('success', { title: "An error occurred. Please try again later." });
      }
};


const changePassword = async ( req , res ) => {
   try {
    
    const {passwords, email, passwording} = req.body;
    let errors = [];

    if (!passwords || !email || !passwording) {
      errors.push( { msg: "Please fill in the field"} );
    }

    if ( passwording.length < 6) {
      errors.push({ msg: "password atleast 6 character" });
    }

    if ( passwords.length < 6) {
      errors.push({ msg: "Your previous password is incorrect!" });
    }

    if ( passwording == passwords) {
      errors.push({ msg: "Password provided are the same use different password" });
    }
    if (errors.length > 0) {
     await Learner.find().exec((errOne, user) => {
        if(errOne) throw new Error(errOne)
        res.render('upload_image', {
          errors: errors,
          email: email,
          passwords : passwords,
          passwording: passwording,
          user : req.user,
        })
      })
    
    } else{
      Learner.findOne({ email : email}).exec((err, user) => {

        if (!user) {
              errors.push( { msg : "Oops! no User associated with that email"});
              Learner.find().exec((errOne, user) => {
                if(errOne) throw new Error(errOne)
                res.render('upload_image', {
                  errors: errors,
                  email: email,
                  passwords : passwords,
                  passwording: passwording,
                  user : req.user,
                })
              })
        } if(user) {
          Learner.find()
          .where('password')
          .equals(passwords)
          .exec((err, user)=> {
            if(!user){
              errors.push( { msg : "Oops! Password Incorrect"});
              Learner.find().exec((errOne, user) => {
                if(errOne) throw new Error(errOne)
                res.render('upload_image', {
                  errors: errors,
                  email: email,
                  passwords : passwords,
                  passwording: passwording,
                  user : req.user,
                })
              })
          }else {
            Learner.findOne({ email : email})
              .then((user) => {
                user.password = passwording;
                bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(user.password, salt,
                    (err, hash) => {
                        if (err) throw err;

                        user.password = hash;

                        user
                        .save()
                            .then((value) => {
                                console.log(value)
                                req.flash(
                                  "success_msg",
                                  "Password Changed Successfully!"
                                );
                                res.redirect(`/learner/edit-profile?id=${user._id}`);
                            })
                            .catch(value => console.log(value))
                    }))
               
              })
          }})
                    

        }
      })
                
    }

   } catch (err) {
    res.status(500).send('Internal server error' + " " + err.message);
    console.log(err.message);
   }
};


const getEditLearnerPassword = async ( req, res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
      
        if( req.query.id ) {
            const id = req.query.id;
            await Learner.findById(id)
                .then((user) => {
                    if(!user){ res.status(404).send({ message : `oops! user with this ${id} not found`})}
                    if(user){ res.render('upload_image', { user: user })}
                })
                .catch((err) => {
                    res.status(500).send( { message: `oops! user with this ${id} not found`})
                });
        }
    } catch (err) {
        res.status(500).send('Internal server error' + " " + err.message);
        console.log(err.message);
    }
};




module.exports = {
    studentLogin,
    studentProfile,
    learnerLogout,
    learnerCheckResultFirstSecondTerm,
    checkThirdTermResult,
    changePassword,
    getEditLearnerPassword
}