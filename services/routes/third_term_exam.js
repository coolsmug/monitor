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
const Voucher = require("../models/token");
const Schoolname = require("../models/school.name");
const passport = require('passport');
var toFixed = require('tofixed');

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

router.post('/register_exams', (req, res) => {
    const {roll_no, student_name, name,_learner, classofs, term, total_over_all} = req.body;
    let errors = [];
    console.log(`ROll_NO:${roll_no} Subject Name:${ student_name} Learner: ${_learner} Name: ${name} Session:${classofs} Term: ${term} total_over_all:${total_over_all}`)
   
    if( !roll_no || !student_name || !name || !_learner || !classofs || !term || !total_over_all) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(errors.length > 0) {
        res.render("success", { title : "Error 405....(go back to the Exam page and try again)"})
    }  else { 
                const exams = new Examing ({
                    roll_no: roll_no,
                    student_name: student_name,
                    name : name,
                    classofs: classofs,
                    term: term,
                    _learner: _learner,
                    total_over_all: total_over_all,
                      
                })
                exams.save()
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

router.post("/update-exams/:id", async(req, res) => {
    const id = req.params.id;
    
   await Examing.findById(id)
      .then((exam) => {
       
     let total =  Number(req.body.exam_mark_obtain) + Number(req.body.mark_otained_third_ca) +  Number(req.body.mark_otained_second_ca) + Number(req.body.mark_obtained_first_ca);
      let multiple =  ((Number(req.body.qone) +  Number(req.body.qtwo) + Number(total))/ Number(req.body.total_over_all)) * 100
      var grade = req.body.grade;
      var remarks = req.body.remarks;

      if(multiple <= 39.9 ) {
        grade = "F9"
        remarks ="Fail"
    }else if (multiple <= 44.9 && multiple >= 40) {
        grade = "E8"
        remarks = "Pass"
    }else if (multiple <= 49.9 && multiple >= 45) {
        grade = "D7"
        remarks = "Pass"
    }else if (multiple <= 59.9 && multiple >= 50) {
        grade = "C6"
        remarks = "Credit"
    }else if (multiple <= 64.9 && multiple >= 60) {
        grade = "C5"
        remarks = "Credit"
    }else if(multiple <= 69.9 && multiple >= 65) {
        grade = "C4"
        remarks = "Credit"
    }else if(multiple <= 74.9 && multiple >= 70){
        grade = "B3"
        remarks = "Good"
    }else if(multiple <= 79.9 && multiple >= 75){
        grade = "B2"
        remarks = "Very Good"
    }else if (multiple >= 100) {
        grade = "A1+"
        remarks = "Scholar"
    }else if (multiple != Number) {
      grade = "NR"
      remarks = "Absent"
  } else {
        grade = "A1"
        remarks = "Excellent"
    }
        exam.name = req.body.name;
        exam.total_over_all = req.body.total_over_all,
        exam.qone = req.body.qone;
        exam.qtwo = req.body.qtwo;
        exam.overall_first_ca = req.body.overall_first_ca;
        exam.mark_obtained_first_ca = req.body.mark_obtained_first_ca;
        exam.overall_second_ca = req.body.overall_second_ca;
        exam.mark_otained_second_ca = req.body.mark_otained_second_ca;
        exam.overall_third_ca = req.body.overall_third_ca;
        exam.mark_otained_third_ca = req.body.mark_otained_third_ca;
        exam.exam_overall = req.body.exam_overall;
        exam.exam_mark_obtain = req.body.exam_mark_obtain;
        exam.term_total = total;
        exam.per_over_all = toFixed(multiple, 2)+"%" ;
        exam.grade = grade;
        exam.remarks = remarks;
        exam
          .save()
          .then(() => {
            console.log("Exam saved successfully")
            res.json("Exam Updated...");
          })
          .catch((err) =>{
            res.status(400).json("Error:" + err)
            console.log(err)
          }
          );
          
      })
      .catch((err) => {
        res.status(400).json("Error: " + err);
        console.log(err)
      });
  });

  router.get("/exam-pace-third", async(req, res) => {

    if (req.query.id) {
        const id = req.query.id;
        const name = req.query.name;
        const roll_nos = req.query.roll_no;
        const classofss = req.query.classof;
        
      await Subject
                .find()
                .select("name")
                .exec((err, subjects) => {
                   if(err) throw new Error(err)
                   Learner.findById(id).exec((errOne, users)=> {
                    if(errOne) throw new Error(errOne)
                    Currentclass.findById(id).exec((errTwo, classeds) => {
                        if(errTwo) throw new Error(errTwo)
                        Session.findById(id).exec((errThree, sessions) => {
                            if(errThree) throw Error(errThree)
                            ThirdSection.findById(id).exec((errfour, sections)=> {
                            if(errfour) throw new Error(errfour)
                            Miscellaneous.find()
                            .where("_learner")
                            .equals(id)
                            .where("term")
                            .equals(name)
                            .where("roll_no")
                            .equals(roll_nos)
                            .where("classofs")
                            .equals(classofss).exec((errAmong, misc) => {
                                if(errAmong) throw new Error(errAmong)
                                Examing.find()
                                .where("_learner")
                                .equals(id)
                                .where("term")
                                .equals(name)
                                .where("roll_no")
                                .equals(roll_nos)
                                .where("classofs")
                                .equals(classofss)
                                .exec((errfive, exams) => {
                                 if(errfive) throw new Error(errfive)
                                 res.render('third_exam_fill', {
                                     exams: exams,
                                     users: users,
                                     classeds: classeds,
                                     sessions: sessions, 
                                     sections: sections,
                                     subjects: subjects,
                                     misc: misc,
                                 })
                                })
                            })
                           })
                        })
                    })
                   })
                })

      

        }
    })

  

router.delete('/deletedss/:id', async(req, res) => {
    const id = req.params.id;
    await Examing.findByIdAndDelete(id)
      .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
        } else {
          res.send({
            message: "User was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not delete User with id=" + id + "with err:" + err,
        });
      });
  })

router.get("/miscellaneous-pace", async(req, res) => {

    if (req.query.id) {
        const id = req.query.id;
        
      await Proprietor
                .findOne()
                .select("excellent very_good good pass poor vpoor")
                .exec((err, prop) => {
                   if(err) throw new Error(err)
                    Staff
                    .find()
                    .select("name")
                    .exec((errfive, staff)=> {
                        if (errfive) throw new Error(errfive)
                        Staffstatement 
                        .findOne()
                        .select("excellent very_good good pass poor vpoor")
                        .exec((errSix, scomment)=> {
                            if (errSix) throw new Error(errSix)
                            Miscellaneous.findById(id)
                            .exec((errSeven, misc) => {
                                if(errSeven) throw new Error(errSeven)
                                res.render('miscellaneous_fill', {
                                    misc: misc,
                                    prop:  prop,
                                    staff: staff,
                                    scomment: scomment,
                                })
                            })

                            })
                         
                           })
                    
                     
    })
}
})



//----------------------------------------------------------Miscellaneous Ends----------------------------------------//

router.get('/check_result', async (req, res) => {

  if (req.query) {
    const { name, _learner, classof, roll_no, code } = req.query;

    try {
      const pin = await Voucher.findOne({ code: code });

      if (pin && pin.expiry > Date.now()) {

        if (pin.usage_count >= 16) {
          return res.render('success', { title: "Oops! this pin has reached its usage limit" });
        }

        if (pin.userid != _learner && pin.used == true) {
          return res.render('success', { title: "This pin has been assigned to a learner" });
        }

        const exam = await Examing.find({ _learner: _learner, term: name, classofs: classof, roll_no: roll_no }).exec();
        const misc = await Miscellaneous.findOne().where("_learner").equals(_learner).where("term").equals(name).where("classofs").equals(classof).where("roll_no").equals(roll_no).exec();
        const user = await Learner.findOne({ _id: _learner }).exec();
        const sname = await Schoolname.findOne().exec();
        const section = await ThirdSection.findOne({ roll_no : roll_no, name : name }).exec();
        const session = await Session.findOne({ classof: classof }).exec();

        if (exam && misc && user && sname && section && section) {
          await Voucher.updateOne({ code: code }, { $set: { userid: _learner, used: true }, $inc: { usage_count: 1 } });
          return res.render("term_result", { exam, misc, user, sname, section, session });
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

