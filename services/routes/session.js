const express = require('express');
const router = express.Router();
const Session = require('../models/session');
const Learner = require("../models/leaners");
const Exam = require('../models/exam');
const Section = require('../models/section');
const Subject = require('../models/subject');
const Currentclass = require('../models/current_class');
const ThirdSection = require('../models/third._term_section')
const passport = require("passport");



// ********************************************session Creation **************************//

const ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
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


router.post('/add_session', ensureAuthenticated, (req, res) => {
    const { roll_no, name, date_started, date_ended, roll_nos, names, classof } = req.body;
    let errors = [];

    
    if (!roll_no || !name || !date_started || !date_ended || !classof) {
        errors.push( { msg : "Please fill in all fields"} )
    }

    if (date_started === date_ended) {
        errors.push( { msg : "Enrollment date cannot be the same as graduation date"} )
    }

    if (date_started > date_ended) {
        errors.push( { msg : "Enrollment date cannot be greater than the Graduation date "})
    }
    if (errors.length > 0) {
        res.render('create_session',
        {
            errors: errors,
            roll_no : roll_no,
            name : name,
            date_started : date_started,
            date_ended : date_ended,
            user: req.user,
        })
    }
     else {
        Session.findOne({
            schoolId: req.user._id,
            roll_no: roll_no
        }, (err, existingSession) => {
            if (err) {
                throw new Error(err);
            }
            
            if (existingSession) {
                // A session with the same roll_no already exists
                errors.push( { msg : "A session associated with that Roll No already exist"} );
                res.render('create_session', {errors, roll_no, name, date_started, date_ended, classof, user: req.user })
                // Render the form with the error
                // ...
            } else {
                Session.findOne({
                    schoolId: req.user._id,
                    name: name
                }, (err, existingSessionByName) => {
                    if (err) {
                        throw new Error(err);
                    }
                    
                    if (existingSessionByName) {
                        // A session with the same name already exists
                        errors.push( { msg : "A session associated with that Name already exist"} );
                        res.render('create_session', { errors, roll_no, name, date_started, date_ended, classof, user: req.user })
                        // Render the form with the error
                        // ...
                    } else {
                        Session.findOne({
                            schoolId: req.user._id,
                            date_started: date_started
                        }, (err, existingSessionByDate) => {
                            if (err) {
                                throw new Error(err);
                            }
                            
                            if (existingSessionByDate) {
                                // A session with the same date already exists
                                errors.push( { msg : "A session associated with this date already exist"})
                                res.render('create_session', { errors, roll_no, name, date_started, date_ended, classof, user: req.user })
                                // Render the form with the error
                                // ...
                            } else {
                                const newSession = new Session({
                                    roll_no: roll_no,
                                    name: name,
                                    date_started: date_started,
                                    date_ended: date_ended,
                                    classof: classof,
                                    schoolId: req.user._id,
                                });

                                newSession.save()
                                    .then((value) => {
                                        console.log(value)
                                        req.flash(
                                            "success_msg",
                                            "A Session Added!"
                                        );
                                        res.redirect('/admin/create-session')
                                    })
                                    .catch(value => console.log(value))
                            }
                        });
                    }
                });
            }
        });
    }
});



// ********************************************section Creation **************************//

router.post('/add_section',ensureAuthenticated, (req, res) => {
    const {roll_no, name, date_started, date_ended, classof} = req.body;
    let errors = [];
    console.log(`Roll_no: ${roll_no} Name: ${name} Date Started: ${date_started} Date Ended: ${date_ended} class Of:${classof}`)
   
    if(!roll_no || !name || !date_started || !date_ended ||!classof) {
        errors.push( { msg : "Please fill in all fields"});
    } if(date_started === date_ended) {
        errors.push( { msg : "Both dates cannot be equal" } )
    }
    if(date_started > date_ended) {
        errors.push( { msg: "Date Started cannot be greater than Date Ended classof" })
    }
    
    if(errors.length > 0) {
        res.render('create_section', {
            errors: errors,
            roll_no: roll_no,
            name: name,
            classof: classof,
            date_started: date_started,
            date_ended: date_ended,
            user: req.user,
        })
    }  else {
               
                const newSection = new Section({
                        roll_no : roll_no,
                        name : name,
                        classof: classof,
                        date_started: date_started,
                        date_ended: date_ended,
                        schoolId: req.user._id
                })
                newSection.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "A Term of Section Added !"
                                    );
                        res.redirect('/admin/create-section')
                    })
                    .catch(value => console.log(value))
            }
})

// third term section seperated

router.post('/add_third_section',ensureAuthenticated, (req, res) => {
    const {roll_no, name, date_started, date_ended, classof} = req.body;
    let errors = [];
    console.log(`Roll_no: ${roll_no} Name: ${name} Date Started: ${date_started} Date Ended: ${date_ended} class Of:${classof}`)
   
    if(!roll_no || !name || !date_started || !date_ended ||!classof) {
        errors.push( { msg : "Please fill in all fields"});
    } if(date_started === date_ended) {
        errors.push( { msg : "Both dates cannot be equal" } )
    }
    if(date_started > date_ended) {
        errors.push( { msg: "Date Started cannot be greater than Date Ended classof" })
    }
    
    if(errors.length > 0) {
        res.render('create_section', {
            errors: errors,
            roll_no: roll_no,
            name: name,
            classof: classof,
            date_started: date_started,
            date_ended: date_ended,
            user: req.user,
        })
    }  else {
                const newThirdSection = new ThirdSection({
                        roll_no : roll_no,
                        name : name,
                        classof: classof,
                        date_started: date_started,
                        date_ended: date_ended,
                        schoolId: req.user._id,
                })
                newThirdSection.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "A Third Term Section Added !"
                                    );
                        res.redirect('/admin/create-section')
                    })
                    .catch(value => console.log(value))
            }
})


// ********************************************currentCreation **************************//

router.post('/add_current_class', ensureAuthenticated, (req, res) => {
    const {roll_no, name, arm, class_code, status} = req.body;
    let errors = [];
    console.log(`Roll_no: ${roll_no} Name: ${name} Arm: ${arm} 
    Class_no: ${class_code} Status: ${status} `)
   
    if(!roll_no || !name || !arm || !class_code || !status ) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(errors.length > 0) {
        res.render('create_currentclass', {
            errors: errors,
            roll_no: roll_no,
            name: name,
            arm: arm,
            class_code: class_code,
            status: status,
            user: req.user,
        })
    }  else { Currentclass.findOne( { roll_no: roll_no, schoolId: req.user._id } ).exec((err, classed) => {
        if(classed) {
            errors.push( { msg: "Oops! A Class already associated with that Roll Number"} )
            res.render('create_currentclass', {
                errors: errors,
                roll_no: roll_no,
                name: name,
                arm: arm,
                class_code: class_code,
                status: status,
                user: req.user,
            })
        }else {
                const newCurrentclass = new  Currentclass({
                        roll_no : roll_no,
                        name : name,
                        arm: arm,
                        class_code: class_code,
                        status: status,
                        schoolId: req.user._id,
                        
                })
               newCurrentclass.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "A Current class Added !"
                                    );
                        res.redirect('/admin/create-currentclass')
                    })
                    .catch(value => console.log(value))
        }
    })
                
            }
})

// ********************************************Subkect  Creation **************************//

router.post('/add_subject', ensureAuthenticated, (req, res) => {
    const {roll_no, name, category} = req.body;
    let errors = [];
    console.log(`Roll_no: ${roll_no} Name: ${name} Category: ${category}`)
   
    if(!roll_no || !name || !category) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(errors.length > 0) {
        res.render('create_subject', {
            errors: errors,
            roll_no: roll_no,
            name: name,
            category: category,
            user: req.user,
        })
    } else {
        Subject.findOne({roll_no: roll_no, schoolId: req.user._id }).exec((err, claas) => {
            console.log(claas)
            if(claas) {
                 errors.push ( { msg: "a subject already associated with the roll_no" });
                res.render('create_subject', {errors, roll_no, name, category});
            } else if (!claas){
                Subject.findOne( { name: name, schoolId: req.user._id } ).exec((err, names) => {
                    console.log(names)
                    if(names) {
                         errors.push ( { msg: "a Subject already associated with this name" });
                        res.render('create_subject', {errors, roll_no, name, category} );
                    }else if (!names) {
                             
                const exam = new Exam();
                const session = new Session();
               
                const learner = new Learner()
                const section = new Section();
                const newSubject = new Subject({
                        roll_no : roll_no,
                        name : name,
                        category: category,
                        session: session._id,
                        schoolId: req.user._id,
                        learner: learner._id,
                        exam: exam._id,
                        section: section._id,
                        schoolId: req.user._id 
                })
                newSubject.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "A Subject Added !"
                                    );
                        res.redirect('/admin/create-subject')
                    })
                    .catch(value => console.log(value))
            
                    }
                })
            }
        })
    }
});


module.exports = router
   
   