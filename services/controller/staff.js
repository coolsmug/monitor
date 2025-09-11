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
const Position = require("../models/positionFirstTerm");
const Submission = require("../models/submit");



const getSessionForstaff = async ( req , res ) => {
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
};


const getClassForstaff = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

        if (req.query.sessionId) {
          const sessionId = req.query.sessionId;
    
          
            const classId = req.user.classId
            const classes = await Promise.all(classId.map(async (clasId) => {
              const sclass = await Currentclass.findById(clasId).select("roll_no name class_code arm _id").sort({ roll_no: 1 });
              return sclass
            }))
           

         console.log(classes)
          const session = await Session.findById(sessionId).exec();
          const user = req.user;
         
          if (classes && session && user) {
            res.render('classes', {
              classes,
              session,
              user,
              
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
};


const getLearnerExamForstaff = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

        if (req.query.sessionId && req.query.classId) {
          const sessionId = req.query.sessionId;
          const classId = req.query.classId;
    
          const users = await Learner.find({
            classId : classId,
            schoolId: req.user.schoolId,
            status: true,
            deletes: false,
          })
            .select("_id roll_no first_name last_name middle_name classes class_code arm img")
            .sort({ roll_no: 1 })
            .exec();
    
          const classed = await Currentclass.findOne({
           _id : classId,
            schoolId: req.user.schoolId,
          }).exec();
    
          const session = await Session.findById(sessionId).exec();
          const user = req.user;
    
          if (users && classed && session) {
            res.render('learner_result_edit', {
              users,
              classed,
              session,
              user,
            });
          } else {
            res.render("error404.ejs", { title: "Oops! Data not complete to view this page" });
          }
        } else {
          res.render("error404.ejs", { title: "Oops! Request Id not found" });
        }
      } catch (err) {
        console.error("Error in learner-test-exam route:", err);
        res.render("error404.ejs", { title: "Error 500: 'Internal Server Error'" });
        
      }
};


const getSectionTextExam = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

        if (req.query.userId && req.query.sessionId && req.query.classId) {
          const userId = req.query.userId;
          const sessionId = req.query.sessionId;
          const classId = req.query.classId;
          const classOf = req.query.classof;
    
          const section = await Section.find({ classof: classOf, schoolId: req.user.schoolId })
            .select("roll_no name classof _id")
            .sort({ roll_no: 1 })
            .exec();
    
          const users = await Learner.findById(userId).select("_id, first_name last_name middle_name").exec();
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
};


//-----------------------Creating Exam --------------------------------------

const createExam = async (req, res) => {
  try {
      let { roll_no, student_name, subjects, _learner, classofs, term } = req.body;

      if (!roll_no || !student_name || !subjects || !_learner || !classofs || !term) {
          return res.status(400).json({ message: "Please fill in all fields" });
      }

      // Parse subjects JSON string
      subjects = JSON.parse(subjects);

      if (!Array.isArray(subjects)) {
          return res.status(400).json({ message: "Subjects must be an array" });
      }

      // Create multiple exam records
      const exams = subjects.map(subject => ({
          roll_no,
          student_name,
          name: subject,
          classofs,
          term,
          _learner
      }));

      // Save all exams at once
      await Exam.insertMany(exams);

      res.status(200).json({ message: "Exams Added Successfully", exams });

  } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};




const updateExam = async ( req , res ) => {
    try {
        
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
            exam.editted_name = req.body.editted_name;
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

    } catch (error) {
        if(err) 
        console.log(err.message)
        res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
};


const deleteExam = async ( req , res ) => {
    try {
        
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

    } catch (err) {
        if(err) 
        console.log(err.message)
        res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
};


const getExamSpace = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


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
          const misc = await Miscellaneous.findOne({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss }).exec();
          const position = await Position.findOne({ learnerId: userId, term: name, classofs: classofss }).exec();
          const exams = await Exam.find({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss }).exec();
          const submit = await Submission.find( { userId: userId, session: session.name, term: section.name } ).exec();
    
          res.render('exam_fill', {
            exam: exams,
            users: users,
            user: req.user,
            classed: classed,
            session: session,
            section: section,
            subject: subjects,
            misc: misc,
            position: position,
            submit: submit,
           
          });
        } else {
          res.render("error404.ejs", { title: "Oops! Request Id not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
};


const getMiscellaneous = async ( req , res ) => {
    try {
        
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
        
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

    } catch (err) {
        if(err) 
        console.log(err.message)
        res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
}


const getError = async ( req , res ) => {
    await res.render('error5')
};


const registerMiscell = async ( req , res ) => {
    
        try {
            const { roll_no, student_name, classofs, _learner, term } = req.body;
      
            // Check if there is an existing Miscellaneous record with the same criteria
            const existingMisc = await Miscellaneous.findOne({ _learner: _learner, term: term, roll_no: roll_no });
      
            if (existingMisc) {
                // If an existing Miscellaneous record is found, display a message indicating it
                req.flash("error_msg", "Miscellaneous already exists");
                res.redirect("/staff/error"); // Redirect to an error page or handle as per your requirement
            } else {
                // If no existing Miscellaneous record is found, create a new one
                const miscell = new Miscellaneous({
                    roll_no: roll_no,
                    student_name: student_name,
                    classofs: classofs,
                    _learner: _learner,
                    term: term,
                    schoolId: req.user.schoolId,
                    user: req.user
                });
      
                // Save the new Miscellaneous record
                miscell.save()
                    .then((value) => {
                        console.log(value);
                        req.flash("success_msg", "Miscellaneous Added Successfully!");
                        res.render("success", { title: "Miscellaneous Added Successfully!" });
                    })
                    .catch((error) => {
                        console.error(error);
                        req.flash("error_msg", "An error occurred while saving the Miscellaneous record");
                        res.redirect("/staff/error"); // Redirect to an error page or handle as per your requirement
                    });
            }
        } catch (error) {
            console.error(error);
            req.flash("error_msg", "An error occurred");
            res.redirect("/staff/error"); // Redirect to an error page or handle as per your requirement
        }
    
};

const updateMiscellaneous = async ( req , res ) => {
    try {
        
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
                       

    } catch (err) {
        if(err) 
        console.log(err.message)
        res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
    }
};

//-----------------staff routes  ---------------------------------------

const getLearnerResultEdit = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');

    if (req.query.id) {
      await res.render('learner_result_edit', {user: req.user})
  }
    
  } catch (err) {
    res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
  }
   
};


const staffLogin = async ( req , res, next) => {
    passport.authenticate("staff-login", async (err, user, info)=> {
      if (err) {
        return next(err);
    } else {
        if (user && user.status == true) {
            const userSchool = await Schoolname.findOne({ _id: user.schoolId }).exec();
            
            if (userSchool) {
                if (userSchool.fees === "pending" && userSchool.expiry > Date.now()) {
                    req.logIn(user, function (err) {
                        if (err) {
                            return next(err);
                        }
                        req.flash('success_msg', 'You are welcome ' + req.user.first_name);
                        return res.redirect("/staff/staff-route");
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
                        return res.redirect("/staff/staff-route");;
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

const getStaffdashboard = async ( req , res) => {

  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');

  res.render('home', { user: req.user})
    
  } catch (error) {
  
      res.status(500).send('Internal Server Error' + ' ' + error);
  }
    
};


//---------------------------------Exam--------------------------------------------------------
const registerPosition = async ( req , res ) => {
  try {
    const { classofs, learnerId, term, classId} = req.body;
    const newPosition = await Position.findOne({ learnerId: learnerId, term: term, classofs: classofs, classId: classId });
    if(newPosition) {
      req.flash("error_msg", "Position already created for this Learner");
      res.redirect("/staff/error");
    } else {
      const position = new Position({
        classofs: classofs,
        learnerId: learnerId,
        classId: classId,
        term: term,
        schoolId: req.user.schoolId,
        user: req.user
    });

    position.save()
            .then((value) => {
              console.log(value);
                        req.flash("success_msg", "Position Added Successfully!");
                        res.render("success", { title: "Position Added Successfully!" });
            }) .catch((error) => {
              console.error(error);
              req.flash("error_msg", "An error occurred while saving the Learner position");
              res.redirect("/staff/error"); // Redirect to an error page or handle as per your requirement
          });

    }
  } catch (err) {
  
    req.flash("error_msg", "An error occurred");
    res.redirect("/staff/error"); 
  }
};

const updatePosition = async (req, res) => {
  try {
    const id = req.params.id;
    const { total_score } = req.body;

    // Find the position document by its ID
    const position = await Position.findById(id);

    if (!position) {
      // If position not found, return a 404 error
      return res.status(404).json({ error: "Position not found" });
      console.log('data not found')
    }

    // Update the total_score field
   
    position.total_score = total_score;

    // Save the updated position document
    await position.save();

    // Send a success response
    res.status(200).json({ message: "Position updated successfully" });
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};


const deletePosition = async (req, res) => {
  try {
    const id = req.params.id;
    const position = await Position.findByIdAndDelete(id);

    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.status(200).json({ message: "Position deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};



const updateLearnerPosition = async (req, res) => {
  try {
    const { name, classof, classId } = req.query;

    // Fetch all position documents sorted by total_score in descending order
    const positions = await Position.find({ term: name, classofs: classof, classId: classId })
      .sort({ total_score: -1 })
      .exec();

    if (!positions.length) {
      return res.status(404).json({ error: "No positions found" });
    }

    // Initialize variables to track position and previous score
    let currentPosition = 1;
    let prevScore = positions[0].total_score;

    // Loop through each position document to update the position field
    positions.forEach((position, index) => {
      // Compare the current learner's score with the previous learner's score
      if (position.total_score < prevScore) {
        // If the score is less than the previous score, update the position
        currentPosition = index + 1;
      }
      // Update the position field
      position.position = currentPosition;
      // Update the previous score for the next iteration
      prevScore = position.total_score;
    });

    // Save all updated position documents back to the database
    await Promise.all(positions.map(position => position.save()));

    // Send a success response
    res.status(200).json({ message: "Positions updated successfully" });
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};


const registerThirdTermExam = async (req, res) => {
  try {
    const { roll_no, student_name, exam_name, _learner, classofs, term, total_over_all, subjects } = req.body;
    let errors = [];

    if (!roll_no || !student_name || !exam_name || !_learner || !classofs || !term || !total_over_all || !subjects) {
      errors.push({ msg: "Please fill in all fields" });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Subjects must be an array and cannot be empty" });
    }
   
    const exams = subjects.map(subject => ({
      roll_no: roll_no,
      student_name: student_name,
      name: subject,  // Keeping "name" inside map for subject names
      classofs: classofs,
      term: term,
      _learner: _learner,
      total_over_all: total_over_all,
    }));

    await Examing.insertMany(exams);
    res.status(200).json({ message: "Exams Added Successfully", exams });

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};

const updateThirdTermExam = async ( req , res ) => {
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
   }else if ( isNaN(multiple) ) {
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
       exam.editted_name = req.body.editted_name;
       exam.term_total = total;
       exam.per_over_all = toFixed(multiple, 2);
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
       res.status(500).send("Error: " + err);
       console.log(err)
     });
};

const getThirdTermExam = async ( req , res ) => {
  try {


    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');

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
      const sessions = await Session.findById(sessionId).exec();
      const sections = await ThirdSection.findById(sectionId).exec();
      const misc = await Miscellaneous.findOne({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss }).exec();
      const position = await Position.findOne({ learnerId: userId, term: name, classofs: classofss }).exec();
      const exams = await Examing.find({ _learner: userId, term: name, roll_no: roll_nos, classofs: classofss }).sort({roll_no: 1});
      const submit = await Submission.find( { userId: userId, session: sessions.name, term: sections.name } ).exec();
    

      res.render('third_exam_fill', {
        exams: exams,
        users: users,
        user: req.user,
        classed: classed,
        sessions: sessions,
        sections: sections,
        subjects: subjects,
        misc: misc,
        position: position,
        submit: submit,
      });
    } else {
      res.render("success", { title: "Oops! Request Id not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteThirdTermExam = async ( req , res ) => {
  try {
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
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getThirdTermMisc = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');

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
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
}

const stafflogOut = async ( req , res ) => {
  req.logOut(function (err) {
    if (err) {
        return next(err);
    }
    req.flash('success_msg', 'Session Terminated');
    res.redirect('/')
})
};




module.exports = {
    getSessionForstaff,
    getClassForstaff,
    getLearnerExamForstaff,
    getSectionTextExam,
    createExam,
    updateExam,
    deleteExam,
    getExamSpace,
    getMiscellaneous,
    getError,
    registerMiscell,
    updateMiscellaneous,
    getLearnerResultEdit,
    staffLogin,
    getStaffdashboard,
    registerThirdTermExam,
    updateThirdTermExam,
    getThirdTermExam,
    deleteThirdTermExam,
    getThirdTermMisc,
    stafflogOut,
    registerPosition,
    updatePosition,
    updateLearnerPosition,
    deletePosition,
};
  