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
const Examing = require("../models/third_exam");
const Schoolname = require("../models/school.name");
const Voucher = require("../models/token");
const passport = require('passport');
const { session } = require("passport");
const multer = require('multer')
const qs = require('qs');
var toFixed = require('tofixed');



    /**
     * Ensuring authentication
     */
   const ensureAuthenticated = function(req, res, next) {
      if (req.isAuthenticated()) {
        return next()
      }
      req.flash('error_msg', 'Your session terminated and Access Denied');
      res.redirect('/');

    }



    router.get("/sessions/:page", ensureAuthenticated, async (req, res, next) => {
        try {
          console.log("Authenticated User:", req.user);
      
          const perPage = 10;
          const page = req.params.page || 1;
      
          const session = await Session.find({ schoolId: req.user.schoolId })
            .select("roll_no name classof schoolId _id")
            .skip((perPage * page) - perPage)
            .sort({ roll_no: 1 })
            .limit(perPage);
      
          console.log("Sessions found:", session);
      
          const count = await Session.countDocuments({ schoolId: req.user.schoolId });
          const user = req.user;
          const current = page;
          const pages = Math.ceil(count / perPage);
      
          res.render('session_route', {
            user,
            session,
            current,
            pages,
          });
        } catch (err) {
          console.error("Error in Session.find:", err);
          res.status(500).send('Internal Server Error');
          // Use 'next(err)' if you want to pass the error to the next error-handling middleware
        }
      });
      



      router.get("/current_class/:page", ensureAuthenticated, async (req, res) => {
        try {
          if (req.query.sessionId) {
            const sessionId = req.query.sessionId;
            const perPage = 4;
            const page = req.params.page || 1;
      
            const classes = await Currentclass.find({ schoolId: req.user.schoolId })
              .select("roll_no name class_code arm _id")
              .skip((perPage * page) - perPage)
              .sort({ roll_no: 1 })
              .limit(perPage)
              .exec();
      
            const count = await Currentclass.countDocuments({ schoolId: req.user.schoolId });
            const session = await Session.findById(sessionId).exec();
            const user = req.user;
            const current = page;
            const pages = Math.ceil(count / perPage);
      
            if (classes && session && user) {
              res.render('classes', {
                classes,
                session,
                user,
                current,
                pages,
              });
            } else {
              res.render("error404.ejs", { title: "Oops! Data not complete to view this page" });
            }
          } else {
            res.render("error404.ejs", { title: "Oops! Request ID not found" });
          }
        } catch (err) {
          console.error("Error in current_class route:", err);
          res.status(500).send('Internal Server Error');
          // Use 'next(err)' if you want to pass the error to the next error-handling middleware
        }
      });
      

      router.get("/learner-test-exam/:page", ensureAuthenticated, async (req, res) => {
        try {
          if (req.query.sessionId && req.query.classId) {
            const sessionId = req.query.sessionId;
            const classId = req.query.classId;
            const arms = req.query.arm;
            const classCode = req.query.class_code;
            const perPage = 9;
            const page = req.params.page || 1;
      
            const users = await Learner.find({
              class_code: classCode,
              arm: arms,
              schoolId: req.user.schoolId,
              status: true,
            })
              .select("_id roll_no first_name last_name middle_name classes class_code arm")
              .skip((perPage * page) - perPage)
              .sort({ roll_no: 1 })
              .limit(perPage)
              .exec();
      
            const classed = await Currentclass.findOne({
              class_code: classCode,
              arm: arms,
              schoolId: req.user.schoolId,
            }).exec();
      
            const session = await Session.findById(sessionId).exec();
            const count = await Learner.count({ schoolId: req.user.schoolId }).exec();
            const current = page;
            const user = req.user;
            const pages = Math.ceil(count / perPage);
      
            if (users && classed && session && count) {
              res.render('learner_result_edit', {
                users,
                classed,
                session,
                current,
                user,
                pages,
              });
            } else {
              res.render("error404.ejs", { title: "Oops! Data not complete to view this page" });
            }
          } else {
            res.render("error404.ejs", { title: "Oops! Request Id not found" });
          }
        } catch (err) {
          console.error("Error in learner-test-exam route:", err);
          res.status(500).send('Internal Server Error');
          // Use 'next(err)' if you want to pass the error to the next error-handling middleware
        }
      });
      


      router.get("/section-test-exam", ensureAuthenticated, async (req, res) => {
        try {
          if (req.query.userId && req.query.sessionId && req.query.classId) {
            const userId = req.query.userId;
            const sessionId = req.query.sessionId;
            const classId = req.query.classId;
            const classOf = req.query.classof;
      
            const section = await Section.find({ classof: classOf, schoolId: req.user.schoolId })
              .select("roll_no name classof _id")
              .sort({ roll_no: 1 })
              .exec();
      
            const users = await Learner.findById(userId).select("_id").exec();
            const classed = await Currentclass.findById(classId).exec();
            const session = await Session.findById(sessionId).exec();
            const third = await ThirdSection.find({ classof: classOf, schoolId: req.user.schoolId })
              .select("roll_no name classof _id")
              .sort({ roll_no: 1 })
              .exec();
      
            const user = req.user;
      
            if (section && users && classed && session && third) {
              res.render('section', {
                users,
                user,
                classed,
                session,
                section,
                third,
              });
            } else {
              res.render("error404.ejs", { title: "Oops! Data not complete to view this page" });
            }
          } else {
            res.render("error404.ejs", { title: "Oops! Request Id not found" });
          }
        } catch (err) {
          console.error("Error in section-test-exam route:", err);
          res.status(500).send('Internal Server Error');
          // Use 'next(err)' if you want to pass the error to the next error-handling middleware
        }
      });
      

// ==============================================================Getting Learners Class through class==============================//

// router.get('/learners-class', async(req, res, next) => {
//     if(req.query.class_code) {
//         const classCode = req.query.class_code;
//         const arms = req.query.arm;

//         await Learner
//                 .find({ class_code:classCode, arm: arms, "status":"Active"})
//                 .select('roll_no classes arm first_name last_name class_code date_enrolled date_ended gender status')
//                 .sort({rol_no : 1})
//                 .exec(function(err, user) {
//                         if (err) return next(err)
//                     Currentclass.find({ class_code:classCode, arm: arms })
//                         .exec((errone, classes) => {
//                             if(errone) return next(errone)
//                             res.render('students_class', {
//                                 user: user,
//                                 classes:classes,
    
//                             });
//                         })
                   
//                 });

//     }
// });

// =============--------------------------Promoting Learners---------------------========================================//


router.post("/promotion/:id",ensureAuthenticated, async(req, res) => {
   
    const arm = req.query.arm;
    const classcode = req.query.class_code;
    const id = req.params.id

    await Learner.findById(id)
                    .then((user) => {
                        user.classes = req.body.name;
                        user.class_code = req.body.class_code;
                        user
                            .save()
                            .then(()=> {
                              
        res.redirect(`/result/promote?class_code=${user.class_code}&arm=${user.arm}`)
                                           
                             
                                // res.json("User promoted successfully!...");
                            })
                            .catch((err) => res.status(400).json("Error:" + err));
                    })
                    .catch((err) => {
                        res.status(400).json("Error: " + err);
                      });

    

})

router.get("/promote", ensureAuthenticated, async(req, res) => {
   if (req.query.class_code) {
    const arm = req.query.arm;
    const classcode = req.query.class_code;
    await Currentclass.find( { schoolId: req.user.schoolId } )
                       .select("name class_code arm _id") 
                       .sort({ roll_no : 1})
                       .exec((err, classed) => {
                            if(err) throw new Error(err)
                            Learner.find({"class_code" : classcode, "arm": arm, "status": true, schoolId: req.user.schoolId}).exec((errOne, users) => {
                                if(errOne) throw new Error(errOne)
                                res.render("promoter", {
                                    classed: classed,
                                    users: users,
                                    user: req.user,
                                })
                            })
                           
                       })
   }

})


router.get('/classes', ensureAuthenticated , async(req, res) => {
    if (req.query.id) {
        await res.render('learner_result_edit', {user: req.user})
    }
   
})

router.get("/result", ensureAuthenticated , async(req, res) => {
    res.render('term_result', {user: req.user})
})

router.get("/result_third_term", ensureAuthenticated , async(req, res) => {
    res.render('third_term_result', {user: req.user})
})



//----------------------------creating Exam first and second---------------------------------//

router.post('/register_exam', ensureAuthenticated, (req, res) => {
        const {roll_no, student_name, name,_learner, classofs, term} = req.body;
        let errors = [];
        console.log(`ROll_NO:${roll_no} Subject Name:${ student_name} Learner: ${_learner} Name: ${name} Session:${classofs} Term: ${term}`)
       
        if( !roll_no || !student_name || !name || !_learner || !classofs || !term) {
            errors.push( { msg : "Please fill in all fields"});
        }
        
        if(errors.length > 0) {
            res.status(500).json( { message : errors } )
        }  else { 
                    const exam = new Exam({
                        roll_no: roll_no,
                        student_name: student_name,
                        name : name,
                        classofs: classofs,
                        term: term,
                        _learner: _learner,
                       
                          
                    })
                    exam.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                          "success_msg",
                          "An Exam Registered !"
                        )

                        res.status(200).json( { message : "Exam Added Successfully"})
                      
                    })
                    .catch(value => console.log(value))
                       
                       
    }
    }
   )

//    ---------------Updating Exam---------------------------  //

router.post("/update-exam/:id", (req, res) => {
    const id = req.params.id;
   Exam.findById(id)
      .then((exam) => {
       let totaled =  Number(req.body.exam_mark_obtain) + Number(req.body.mark_otained_third_ca) +  Number(req.body.mark_otained_second_ca) + Number(req.body.mark_obtained_first_ca);
       var grade = req.body.grade;
       var remarks = req.body.remarks
            if(totaled <= 39.9 ) {
                grade = "F9"
                remarks ="Fail"
            }else if (totaled <= 44.9 && totaled >= 40) {
                grade = "E8"
                remarks = "Pass"
            }else if (totaled <= 49.9 && totaled >= 45) {
                grade = "D7"
                remarks = "Pass"
            }else if (totaled <= 59.9 && totaled >= 50) {
                grade = "C6"
                remarks = "Credit"
            }else if (totaled <= 64.9 && totaled >= 60) {
                grade = "C5"
                remarks = "Credit"
            }else if(totaled <= 69.9 && totaled >= 65) {
                grade = "C4"
                remarks = "Credit"
            }else if(totaled <= 74.9 && totaled >= 70){
                grade = "B3"
                remarks = "Good"
            }else if(totaled <= 79.9 && totaled >= 75){
                grade = "B2"
                remarks = "Very Good"
            }else if (totaled >= 100) {
                grade = "A1+"
                remarks = "Scholar"
            } else {
                grade = "A1"
                remarks = "Excellent"
            }
       exam.name = req.body.name;
       exam.overall_first_ca = req.body.overall_first_ca;
       exam.mark_obtained_first_ca = req.body.mark_obtained_first_ca;
       exam.overall_second_ca = req.body.overall_second_ca;
       exam.mark_otained_second_ca = req.body.mark_otained_second_ca;
       exam.overall_third_ca = req.body.overall_third_ca;
       exam.mark_otained_third_ca = req.body.mark_otained_third_ca;
       exam.exam_overall = req.body.exam_overall;
       exam.exam_mark_obtain = req.body.exam_mark_obtain;
       exam.term_total = totaled;
       exam.grade = grade;
       exam.remarks = remarks;
       exam
          .save()
          .then(() => {
                res.render('success', {title: "Exam Saved successfully!"})

          })
          .catch((err) => res.status(400).json("Error:" + err));
      })
      .catch((err) => {
        res.status(400).json("Error: " + err);
      });
  });

// ---------------------------- Get Exam filling page ___________________--------  //
router.get("/exam-pace", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.query.userId;
      const sessionId = req.query.sessionId;
      const sectionId = req.query.sectionId;
      const classId = req.query.classId;
      const name = req.query.name;
      const roll_nos = req.query.roll_no;
      const classofss = req.query.classof;
  
      if (userId && sessionId && sectionId && classId) {
        const subjects = await Subject.find({ schoolId: req.user.schoolId }).select("name").exec();
        const users = await Learner.findById(userId).exec();
        const classed = await Currentclass.findById(classId).exec();
        const session = await Session.findById(sessionId).exec();
        const section = await Section.findById(sectionId).exec();
        const misc = await Miscellaneous.find({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss }).exec();
        const exams = await Exam.find({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss });
  
        res.render('exam_fill', {
          exam: exams,
          users: users,
          user: req.user,
          classed: classed,
          session: session,
          section: section,
          subject: subjects,
          misc: misc,
        });
      } else {
        res.render("error404.ejs", { title: "Oops! Request Id not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

router.delete('/deleteds/:id', (req, res) => {
    const id = req.params.id;
    Exam.findByIdAndDelete(id)
      .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
        } else {
          res.send({
            message: "Exam was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not delete Exam with id=" + id + "with err:" + err,
        });
      });
  });


//-------------------------------------------creating Miscellaneous and Behavioural /Skilss --------------------------------------//

router.get("/miscellaneous-pace",ensureAuthenticated,  async(req, res) => {

    if (req.query.id) {
        const id = req.query.id;

        const misc = await Miscellaneous.findById(id).exec();
        const prop = await Proprietor.findOne({schoolId: req.user.schoolId}).exec();
        const scomment = await Staffstatement.findOne( { schoolId: req.user.schoolId } ).exec()
        
        res.render('miscellaneous_fill', {
            misc: misc,
            user: req.user,
            prop:  prop,
            scomment: scomment,
        }) 
      
}
})


router.post('/register_miscellaneous',ensureAuthenticated, async(req, res) => {

  try {
    
    const { roll_no, student_name, classofs, _learner, term } = req.body;

    const misc = await Miscellaneous.find({_learner: _learner, term: term, roll_no: roll_no, classofs: classofs, student_name: student_name })
           if(misc) {
            res.status(300).json( { message : `${misc.student_name}'s miscellaneous already created`} )
           } else {
                  const miscell = new Miscellaneous({
                    roll_no: roll_no, 
                    student_name: student_name, 
                    classofs: classofs, 
                    _learner: _learner, 
                    term: term,
                    schoolId: req.user.schoolId,
                })
              
                miscell.save()
                .then((value) => {
                        console.log(value)
                        req.flash(
                        "success_msg",
                        "An Exam Registered !"
                        )
                        res.render("success", { title : "Miscellaneous Added Successfully!"})
                        })
                        .catch(value => console.log(value))
           }        
                           
                           
  } catch (error) {
    res.render("success", { title : error})
  }
                
                   
                   

})

router.post('/update_miscellaneous/:id', async(req, res) => {

    const id = req.params.id;

    const { pun, resumpDay, att_in_cl,
        neat, pol, r_w_s, r_w_l,spirit_o_co,sense_o_r,
        attent,honesty,iniatives,per,h_w,m_s,sport,craft,
        h_o_t, d_and_p,next_t_fee,payable,debt,no_of_t_s_opened,
        total_att,per_att,t_c,t_n,h_t_c
    } = req.body;
   
            await Miscellaneous.findById(id)
                                        .then((misc)=> { 
                                            let totalAtt =  (Number(total_att) / Number(no_of_t_s_opened) ) * 100
                                            misc.pun= pun; 
                                            misc.att_in_cl= att_in_cl;
                                            misc.neat= neat; 
                                            misc.pol= pol; 
                                            misc.r_w_s= r_w_s; 
                                            misc.r_w_l= r_w_l;
                                            misc.spirit_o_co= spirit_o_co;
                                            misc.sense_o_r= sense_o_r;
                                            misc.attent = attent;
                                            misc.honesty = honesty;
                                            misc.iniatives = iniatives;
                                            misc.per = per;
                                            misc.resumpDay = resumpDay;
                                            misc.h_w = h_w;
                                            misc.m_s = m_s;
                                            misc.sport = sport;
                                            misc.craft = craft;
                                            misc.h_o_t = h_o_t; 
                                            misc.d_and_p = d_and_p;
                                            misc.next_t_fee = next_t_fee;
                                            misc.payable = payable;
                                            misc.debt = debt;
                                            misc.no_of_t_s_opened = no_of_t_s_opened;
                                            misc.total_att = total_att;
                                            misc.per_att = toFixed(totalAtt, 1)+"%";
                                            misc.t_c = t_c;
                                            misc.t_n = t_n;
                                            misc.h_t_c = h_t_c;
                                            misc
                                            .save()
                                            .then(() => {
                                                    console.log("user saved successfully")
                                                    res.json("User Update...");
                                            })
                                            .catch((err) => res.status(400).json("Error:" + err));
                                                  
                                        }).catch((err) => {
                                            res.status(400).json("Error: " + err);
                                          });
                   

})


router.get('/check_result', ensureAuthenticated, async (req, res) => {
    try {
      const { name, _learner, classof, roll_no, code } = req.query;
  
      if (!(name && _learner && classof && roll_no && code)) {
        return res.render('success', { title: "No query parameters provided: Information missing" });
      }
  
      const alphaCode = generateRandomCode(2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const numerCode = generateRandomCode(6, '12345678901234567890123456789012345678901234567890123456789012345678901234567890');
      const year = new Date().getFullYear();
      const resultSerialNumber = `monresult${numerCode}/${alphaCode}-${year}`;
  
      const pin = await Voucher.findOne({ code, schoolId: req.user._id });
  
      if (pin && pin.expiry > Date.now()) {
        if (pin.usage_count >= 30) {
          return res.render('success', { title: "Oops! This pin has reached its usage limit" });
        }
  
        if (pin.userid != _learner && pin.used == true) {
          return res.render('success', { title: "This pin has been assigned to a learner" });
        }
  
        const exam = await Exam.find({ _learner, term: name, classofs: classof, roll_no }).exec();
        const misc = await Miscellaneous.findOne({ _learner, term: name, classofs: classof, roll_no }).exec();
        const users = await Learner.findById(_learner).exec();
        const section = await Section.findOne({ roll_no, name, classof, schoolId: req.user._id }).exec();
        const session = await Session.findOne({ classof, schoolId: req.user._id }).exec();
  
        if (exam) {
          await Voucher.updateOne({ code }, { $set: { userid: _learner, used: true }, $inc: { usage_count: 1 } });
          return res.render("term_result", { exam, misc, users, section, session, user: req.user, resultSerialNumber });
        } else {
          return res.render('success', { title: "One or more required database queries failed" });
        }
      } else {
        if (!pin) {
          return res.render('success', { title: "Invalid voucher not identified with your school Identity. As any Fraud Activities are punishable" });
        } else {
          return res.render('success', { title: "Oops! The pin you entered has expired" });
        }
      }
    } catch (error) {
      console.error(error);
      return res.render('success', { title: "An error occurred. Please try again later." });
    }
  });
  
  function generateRandomCode(length, characters) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  
    
module.exports = router;

