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
            console.log(req.user)

            const perPage = 10;
            const page = req.params.page || 1;
           
            const sessions = await Session.find( { schoolId: req.user.schoolId } )
                .select("roll_no name classof schoolId")
                .skip((perPage * page) - perPage)
                .sort({ roll_no: 1 })
                .limit(perPage);
    
            const count = await Session.countDocuments( { schoolId: req.user.schoolId } );

            console.log("Sessions found:", sessions);

    
            res.render('session_route', {
                user: req.user,
                session: sessions,
                current: page,
                pages: Math.ceil(count / perPage)
            });
        } catch (err) {
            console.error("Error in Session.find:", err);
            next(err);
        }
    });

router.get("/current_class/:page",ensureAuthenticated , async(req, res) => {

if (req.query.id) {
    const id = req.query.id
    var perPage = 4
    var page = req.params.page || 1

   await Currentclass
            .find( { schoolId: req.user.schoolId } )
            .select("roll_no name class_code arm")
            .skip((perPage * page) - perPage)
            .sort({roll_no : 1})
            .limit(perPage)
            .exec(function(err, classes) {
                Currentclass.count( { schoolId: req.user.schoolId } ).exec(function(errone, count) {
                    if (errone) throw new Error(errone)
                    Session.findById(id).exec((errtwo, session)=> {
                        if(errtwo) throw new Error(errtwo)
                        res.render('classes', {
                            classes: classes,
                            session: session,
                            user: req.user,
                            current: page,
                            pages: Math.ceil(count / perPage)
                })
                    })
                   
                })
        })
    }
})

router.get("/learner-test-exam/:page",ensureAuthenticated, async(req, res) => {

    if (req.query.id) {
        const id = req.query.id
        const arms = req.query.arm
        const classCode = req.query.class_code
        var perPage = 9
        var page = req.params.page || 1
    
       await Learner
                .find({ class_code:classCode, arm: arms, schoolId: req.user.schoolId, "status": true })
                .select("roll_no first_name last_name middle_name classes class_code arm")
                .skip((perPage * page) - perPage)
                .sort({roll_no : 1})
                .limit(perPage)
                .exec(function(err, users) {
                    Learner.count( { schoolId: req.user.schoolId } ).exec(function(errone, count) {
                        if (errone) throw new Error(errone)
                        Currentclass.findOne({class_code:classCode, arm: arms, schoolId: req.user.schoolId})
                                .exec((errtwo, classed)=> {
                            if(errtwo) throw new Error(errtwo)
                            Session.findById(id).exec((errthree, session)=> {
                                if(errthree) throw new Error(errthree)
                                res.render('learner_result_edit', {
                                    users: users,
                                    classed: classed,
                                    session: session,
                                    current: page,
                                    user: req.user,
                                    pages: Math.ceil(count / perPage)
                        })
                            })
                           
                        })
                       
                    })
            })
        }
    })

    router.get("/section-test-exam",ensureAuthenticated, async(req, res) => {

        if (req.query.id) {
            const id = req.query.id
            const classOf = req.query.classof

        await Section
                    .find({ classof : classOf, schoolId: req.user.schoolId })
                    .select("roll_no name classof")
                    .sort({ roll_no : 1 })
                    .exec((err, section) => {
                       if(err) throw new Error(err)
                       Learner.findById(id).exec((errOne, users)=> {
                        if(errOne) throw Error(errOne)
                        Currentclass.findById(id).exec((errTwo, classed) => {
                            if(errTwo) throw Error(errTwo)
                            Session.findById(id).exec((errThree, session) => {
                                if(errThree) throw Error(errThree)
                            ThirdSection
                                .find({  classof : classOf, schoolId: req.user.schoolId })
                                .select("roll_no name classof")
                                .sort({ roll_no : 1 })
                                .exec((errone, third) => {
                                    if(errone) throw new Error(errone)
                                    res.render('section', {
                                        users: users,
                                        user: req.user,
                                        classed: classed,
                                        session: session,
                                        section: section,
                                        third : third
                                    })
                                }) 
                               
                            })
                        })
                       })
                    })

          
    
            }
        })

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
                       .select("name class_code arm") 
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
            res.render('success')
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
                        res.render("success", { title : "Exam Added Successfully!"})
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
router.get("/exam-pace", ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        const id = req.query.id;
        const name = req.query.name;
        const roll_nos = req.query.roll_no;
        const classofss = req.query.classof;

        try {
            const subjects = await Subject.find({ schoolId: req.user.schoolId }).select("name");
            const users = await Learner.findById(id);
            const classed = await Currentclass.findById(id);
            const session = await Session.findById(id);
            const section = await Section.findById(id);
            const misc = await Miscellaneous.find({ _leaner: id, term: name, roll_no: roll_nos, classofs: classofss });
            const exams = await Exam.find({ _leaner: id, term: name, roll_no: roll_nos, classofs: classofss });

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
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
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
        const prop = await Proprietor.find({schoolId: req.user.schoolId}).exec();
        const scomment = await Staffstatement.find( { schoolId: req.user.schoolId } ).exec()
        
        res.render('miscellaneous_fill', {
            misc: misc,
            user: req.user,
            prop:  prop,
            scomment: scomment,
        }) 
      
}
})

router.post('/register_miscellaneous',ensureAuthenticated, async(req, res) => {

    const { roll_no, student_name, classofs, _learner, term } = req.body;

     Miscellaneous.findOne({_learner: _learner, term: term, roll_no: roll_no, classofs: classofs, student_name: student_name })
                        .exec((err, misc)=> {
                            if (!misc) {
                               
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
                            } if(misc) {
                                    res.render("success", { title : `${misc.student_name}'s miscellaneous already created` } )
                            }else{
                                res.render("success", { title : err})
                            }
                        })
                
                   
                   

})

router.post('/update_miscellaneous/:id', async(req, res) => {

    const id = req.params.id;

    const { pun, att_in_cl,
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


router.get('/check_result',ensureAuthenticated, async (req, res) => {

    if (req.query) {
      const { name, _learner, classof, roll_no, code } = req.query;
  
      try {
        const pin = await Voucher.findOne({ code: code });
  
        if (pin && pin.expiry > Date.now()) {
  
          if (pin.usage_count >= 30) {
            return res.render('success', { title: "Oops! this pin has reached its usage limit" });
          }
  
          if (pin.userid != _learner && pin.used == true) {
            return res.render('success', { title: "This pin has been assigned to a learner" });
          }
  
          const exam = await Exam.find({ _learner: _learner, term: name, classofs: classof, roll_no: roll_no }).exec();
          const misc = await Miscellaneous.findOne({ _learner: _learner, term: name, classofs: classof, roll_no: roll_no } ).exec();
          const users = await Learner.findOne({ _id: _learner }).exec();
          const section = await Section.findOne({ roll_no : roll_no, name : name , schoolId: req.user.schoolId } ).exec();
          const session = await Session.findOne({ classof: classof, schoolId: req.user.schoolId }).exec();
  
          if (exam && misc && users && session && section) {
            await Voucher.updateOne({ code: code }, { $set: { userid: _learner, used: true }, $inc: { usage_count: 1 } });
            return res.render("term_result", { exam, misc, users, section, session, user: req.user  });
          } else {
            return res.render('success', { title: "One or more required database queries failed" });
          }
        }
        else {
          if (!pin) {
            return res.render('success', { title: "Invalid voucher" });
          } else {
            return res.render('success', { title: "Oops! The pin you entered has expired" });
          }
        }
      } catch (error) {
        console.log(error);
        return res.render('success', { title: error.message });
      }
    } else {
      return res.render('success', { title: "No query parameters provided: Information missing" });
    }
  });
    
module.exports = router;

