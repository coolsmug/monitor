var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;
const express = require('express');
const router = express.Router();
const Learner = require("../models/leaners");
const Exam = require('../models/exam');
const Session = require('../models/session');
const Section = require('../models/section');
const Subject = require('../models/subject');
const Currentclass = require('../models/current_class');
const Miscellaneous = require('../models/miscellaneous');
const Proprietor = require('../models/proprietor');
const Staff = require('../models/staff.js');
const Staffstatement = require("../models/staff.statetment")
const bcrypt = require('bcrypt');
const ThirdSection = require('../models/third._term_section');
const Examing = require("../models/third_exam")
const Schoolname = require("../models/school.name")
const passport = require('passport');
const { session } = require("passport");
const Voucher = require("../models/token");
const fs = require("fs");
const path = require("path");
const multer = require('multer');
// const { configurePassport } = require('../config/passport');
// const passports = configurePassport();


    /**
     * Ensuring authentication
     */
   const ensureAuthenticated = function(req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/');

    }

    const forwardAuthenticated = function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/learner/student-profile');     
    }

    //dashboard security login 
    const ensureAuthenticateds = function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/');
    
    }
  
    const forwardAuthenticateds = function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/learner/student-profile');     
    }




router.post('/register', ensureAuthenticateds, (req, res) => {

    const { roll_no, classes, arm, first_name, last_name, password, 
        password2, email, date_enrolled, date_ended, gender,class_code, learnerRollNo } = req.body;

    let errors = []
    
    
    console.log(`Roll_No: ${roll_no} Class: ${classes} FirstName: ${first_name} 
    LastName: ${last_name} Email: ${email} Password: ${password} 
    Password 2: ${password2} Date_enrolled: ${date_enrolled}
     Date_ended: ${date_ended} Arm:${arm} Gender: ${gender} Class code:${class_code}`);

    if(!roll_no || !classes || !arm || !first_name || !last_name || !email || !password 
        || !password2 || !date_enrolled || !date_ended || !class_code || !gender) {
        errors.push( { msg: "Please fill in all fields" } );
    }

    if(password !== password2) {
        errors.push( { msg : "Password dont macth" } )
    }

      if (password.length < 8) {
        errors.push({ msg: "password atleast 8 character" });
      }
      if(date_enrolled > date_ended || date_enrolled == date_ended) {
        errors.push({ msg: "date enrolled must not be greater than date graduated or equal" });
        
      }

    if(errors.length > 0) {
      Currentclass.find( {  schoolId: req.user._id } )
                  .select("name class_code arm")
                  .exec((err, current) => {
                    if(err) throw new Error
                    res.render('create_learners', {
                      errors: errors,
                      roll_no : roll_no,
                      first_name: first_name,
                      last_name : last_name,
                      password : password,
                      password2 : password2,
                      email : email,
                      date_enrolled: date_enrolled,
                      date_ended: date_ended,
                      classes: classes,
                      arm: arm,
                      gender: gender,
                      class_code: class_code,
                      current: current,
                      user: req.user,
                      learnerRollNo,
                     
                  })
                  })
      
    } else {
        Learner.findOne({ email: email, schoolId: req.user._id} ).exec((err, user) => {
            console.log(user) 
            if(user) {
                errors.push ( { msg: "Oops! User already associated with this Email" });
                    Currentclass.find()
                    .select("name class_code arm")
                    .exec((err, current) => {
                      if(err) throw new Error
                      res.render('create_learners', {
                        errors: errors,
                        roll_no : roll_no,
                        first_name: first_name,
                        last_name : last_name,
                        password : password,
                        password2 : password2,
                        email : email,
                        date_enrolled: date_enrolled,
                        date_ended: date_ended,
                        classes: classes,
                        arm: arm,
                        gender: gender,
                        class_code: class_code,
                        current: current,
                        user: req.user,
                        learnerRollNo,
                       
                    })
                    })

            }else if(!user){
                Learner.findOne( { roll_no: roll_no, schoolId: req.user._id } ).exec((err, number) => {
                    console.log(number)
                    if(number) {
                         errors.push ( { msg: "a user already associated with this roll number" });
                    Currentclass.find()
                    .select("name class_code arm")
                    .exec((err, current) => {
                      if(err) throw new Error
                      res.render('create_learners', {
                        errors: errors,
                        roll_no : roll_no,
                        first_name: first_name,
                        last_name : last_name,
                        password : password,
                        password2 : password2,
                        email : email,
                        date_enrolled: date_enrolled,
                        date_ended: date_ended,
                        classes: classes,
                        arm: arm,
                        gender: gender,
                        class_code: class_code,
                        current: current,
                        user: req.user,
                        learnerRollNo,
                        
                       
                    })
                    })
                    }else {
                const newUser = new Learner({
                    roll_no: roll_no,
                    first_name: first_name,
                    last_name: last_name,
                    email: email, 
                    password: password,
                    date_enrolled: date_enrolled,
                    date_ended: date_ended,
                    classes: classes, 
                    gender: gender,
                    status: true,
                    arm: arm,
                    class_code: class_code,
                    schoolId: req.user._id  
                  });

                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt,
                        (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;

                            newUser.save()
                                .then((value) => {
                                    console.log(value)
                                    req.flash(
                                      "success_msg",
                                      "A Learner Registered !"
                                    );
                                    res.redirect("/admin/create-learner");
                                })
                                .catch(value => console.log(value))
                        }))
                
            }
                }) 
            } 
        })
    }

})

router.post("/login", forwardAuthenticated, (req, res, next) => {
  passport.authenticate("learner-login", (err, user, info)=> {
    if (err) {
     return next(err) 
    } else{
      if(user) {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
        
          req.flash('success_msg', 'You are welcome'+ req.user.first_name);
          res.redirect("/learner/student-profile");
          
        })
       
      }
      if (!user) {
        req.logOut(function (err) {
          if (err) {
              return next(err);
          }
          req.flash('success_msg', 'Your Session Terminated');
          res.redirect('/')
      })
      }
    }
   
    
  
    req.flash('success_msg', 'You are welcome');
  })(req, res, next);
});


router.get('/student-profile', ensureAuthenticated, (req, res, next) => {

  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
    console.log(req);
    res.render('student_profile', {
      user: req.user
  
    })

})



router.post('/logout',  ensureAuthenticated, (req, res, next) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Session Terminated');
        res.redirect('/')
    })
     

})


router.get('/check_result', ensureAuthenticated, async(req, res) => {

  if(req.query){
    const {name, _learner, classof, roll_no, code} = req.query;

    await Voucher.findOne( { code : code }).exec((err, pin)=> {
        if(err){ console.log(err);  return; }
        if(pin && pin.expiry > Date.now()) {

        if (pin.usage_count >= 5){
        res.render('success', { title : "this pin has reach it usage limit" } )
            return;
        }
    
                if(pin.userid != _learner && pin.used == true) {
                    res.render('success', { title: "this pin has been assign to a learner" } )
                }
                else {
            Voucher.updateOne( { code : code }, { $set: {userid : _learner, used: true }, $inc: { usage_count: 1 }},  (err, pin)=> {
                if(err){
                    console.log(err);
                    return res.render('success', { title : err });
                } else {
                Exam
                    .find()
                    .where("_learner")
                    .equals(_learner)
                    .where("term")
                    .equals(name)
                    .where("classofs")
                    .equals(classof)
                    .where("roll_no")
                    .equals(roll_no)
                    .exec((err1, exam) => {
                        if(err1) throw new Error(err1)
        Miscellaneous.findOne()
                    .where("_learner")
                    .equals(_learner)
                    .where("term")
                    .equals(name)
                    .where("classofs")
                    .equals(classof)
                    .where("roll_no")
                    .equals(roll_no)
                    .exec((err2, misc) => {
                        if(err2) throw new Error(err2)
            Learner.findOne()
                    .where("_id")
                    .equals(_learner)
                    .exec((err3, user) => {
                        if(err3) throw new Error(err3)
        Schoolname.findOne()
                    .exec((err4, sname) => {
                        if(err4) throw new Error(err4)
            Section.findOne()
                    .where("roll_no")
                    .equals(roll_no)
                    .where("name")
                    .equals(name)
                    .exec((err5, section) => {
                        if(err5) throw new Error(err5)
            Session.findOne()
                    .where("classof")
                    .equals(classof) 
                    .exec((err6, session) => {
                        if(err6) throw new Error(err6)
                        res.render("term_result", {
                            exam:exam,
                            misc: misc,
                            user: user,
                            sname: sname,
                            section: section,
                            session: session,
                           
                        })

                    })          
                    })    
                    })
            
                    })

                    })
                    })
                }
            })
       
        }
        
    }
    else {
        res.render('success', { title : "Invalid voucher" } );
      }
    } )
}
}
)

router.get('/check_results', async(req, res) => {

  if(req.query){
    const {name, _learner, classof, roll_no, code} = req.query;

    await Voucher.findOne( { code : code }).exec((err, pin)=> {
        if(err){ console.log(err);  return; }
        if(pin && pin.expiry > Date.now()) {

        if (pin.usage_count >= 5){
        res.render('success', { title : "this pin has reach it usage limit" } )
            return;
        }
    
                if(pin.userid != _learner && pin.used == true) {
                    res.render('success', { title: "this pin has been assign to a learner" } )
                }
                else {
            Voucher.updateOne( { code : code }, { $set: {userid : _learner, used: true }, $inc: { usage_count: 1 }},  (err, pin)=> {
                if(err){
                    console.log(err);
                    return res.render('success', { title : err });
                } else {
                  Examing
                  .find()
                  .where("_learner")
                  .equals(_learner)
                  .where("term")
                  .equals(name)
                  .where("classofs")
                  .equals(classof)
                  .where("roll_no")
                  .equals(roll_no)
                  .exec((errOne, exam)=> {
                      if(errOne) throw new Error(errOne)
              Miscellaneous.findOne()
                      .where("_learner")
                      .equals(_learner)
                      .where("term")
                      .equals(name)
                      .where("classofs")
                      .equals(classof)
                      .where("roll_no")
                      .equals(roll_no)
                      .exec((errtwo, misc)=> {
                          if(errtwo) throw new Error(errtwo)
                          Learner.findOne()
                              .where("_id")
                              .equals(_learner)
                              .exec((errthree, user) => {
                                  if(errthree) throw new Error(errthree)
                                  Schoolname.findOne()
                                              .exec((errfour, sname) => {
                                                  if(errfour) throw new Error(errfour)
                                             ThirdSection.findOne()
                                                  .where("roll_no")
                                                  .equals(roll_no)
                                                  .where("name")
                                                  .equals(name)
                                                  .exec((errfive, section) => {
                                                      if(errfive) throw new Error(errfive)
                                                      Session.findOne()
                                                              .where("classof")
                                                              .equals(classof)
                                                              .exec((errsix, session) => {
                                                                  if (errsix) throw new Error(errsix)
                                                                      res.render("third_term_result", {
                                                                          exam:exam,
                                                                          misc: misc,
                                                                          user: user,
                                                                          sname: sname,
                                                                          section: section,
                                                                          session: session,
                                                                          
                                                                      })
                                                                  
                                                              })
                                                  })
                                                 
                                              })
         
                              })
                          
                      })
                     
                  })
                }
            })
       
        }
            // })
        // })
        // }
    }
    else {
        res.render('success', { title : "Invalid voucher" } );
      }
    } )
}
}
)


router.post('/change-password', async(req, res) => {

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
          user : user,
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
                  user : user,
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
                  user : user,
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
                                res.redirect(`http://localhost:2022/edit-profile?id=${user._id}`);
                            })
                            .catch(value => console.log(value))
                    }))
               
              })
          }})
                    

        }
      })
                
    }
    
  
      
})




module.exports = router