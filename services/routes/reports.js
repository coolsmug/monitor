const express = require("express");
const router = express.Router();
const Learner = require("../models/leaners");
const Session = require("../models/session");
const Section = require("../models/section");
const Subject = require("../models/subject");
const passport = require('passport');
const Currentclass = require('../models/current_class');
const Staff = require('../models/staff.js');
const ThirdSection = require('../models/third._term_section')



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

  const ITEMS_PER_PAGE = 1; // Adjust this value based on the number of items you want per page

  router.get("/learners/:page", ensureAuthenticated, async (req, res) => {
      try {
          const page = parseInt(req.params.page) || 1;
          const output = req.query.output;
          const  input = req.query.input;
  
          const query = {
              "$or": [
                  { "gender": input },
                  { "email": input },
                  { "genotype": input },
                  { "blood_group": input },
                  { "religion": input },
                  { "state": input },
                  { "lg": input },
                  { "tribe": input }
              ],
              "$and": [
                  { "status": true },
                  { "schoolId": req.user._id },
                  { "classes": output }
              ]
          };
  
          const totalItems = await Learner.countDocuments(query);
          const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
          const learners = await Learner.find(query)
              .sort({ roll_no: 1 })
              .skip((page - 1) * ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE)
              .exec();
  
          const users = await Currentclass.find().sort({ roll_no: 1 }).exec();
  
          res.render('report', {
              learner: learners,
              users: users,
              currentPage: page,
              totalPages: totalPages,
              user: req.user,
              output,
              input
          });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });
  

router.get('/alumni/:page',  ensureAuthenticated, async(req, res) => {

    var perPage = 9;
    var page = req.params.page || 1 
    await Learner.find( { status : false, schoolId: req.user._id } )
                    .select("roll_no classes arm first_name last_name gender status img date_enrolled date_ended class_code ")
                    .sort({ roll_no : 1 })
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .exec((err, user) => {
                        Learner.count( { schoolId: req.user._id })
                                .where("status")
                                .equals(false)
                                .exec((errOne, count) => {
                            if(errOne) throw new Error(errOne)
                            res.render('alumni_page', {
                                user : req.user,
                                users : user,
                                current: page,
                                pages: Math.ceil(count / perPage)
                            })
                        })
                       
                    })
})

router.patch('/user-status/:id', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await Learner.findByIdAndUpdate(id, { status }, { new: true });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });


module.exports = router
