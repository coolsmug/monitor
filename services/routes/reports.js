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


// router.get("/reports", async(req, res) => {
//     await res.render('report')
// })

// router.get("/learners", async(req, res) => {
//     if (req.query) {
        
//     const { these } = req.query;
//     await Learner.find({
//         $or: [
//            {first_name: { $regex: these, $options: "i" }},
//            {last_name: { $regex: these, $options: "i" }},
//            {middle_name: { $regex: these, $options: "i" }},
//            {gender: { $regex: these, $options: "i" }},
//            {blood_group: { $regex: these, $options: "i" }},
//            {genotype: { $regex: these, $options: "i" }},
          
//         ],
//     }).exec((err, user) => {
//                     if (err) {
//                         throw new Error(err)
//                         res.status(404).json("Error receiving:"+ err)
//                     }else if(user){
//                         res.render("report", { user: user })
//                     }else if(!user) {
//                         res.status(301).json("User not found or Maybe you should check your spelling")
//                     }
//                 })
//             }
// })


// router.get("/learners", async(req, res) => {
//     if (req.query) {

//     const { input } = req.query;
//     await Learner.aggregate(
       
//         [
//             {
//               '$match': {
//                 'gender': input,
//                 'status': 'Active'
//               }
//             }
//           ]
//         //    {last_name: { $regex: these, $options: "i" }},
//         //    {middle_name: { $regex: these, $options: "i" }},
//         //    {gender: { $regex: these, $options: "i" }},
//         //    {blood_group: { $regex: these, $options: "i" }},
//         //    {genotype: { $regex: these, $options: "i" }},
//     ).exec((err, user) => {
//                     if (err) {
//                         throw new Error(err)
//                         res.status(404).json("Error receiving:"+ err)
//                     }else if(user){
//                         res.render("report", { user: user })
//                     }else if(!user) {
//                         res.status(301).json("User not found or Maybe you should check your spelling")
//                     }
//                 })
//             }
// })

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

router.get("/learners", async(req, res) => {
    if (req.query) {
       
        const { input } = req.query;
        const { output } = req.query;
        await Learner
        .find({
            "$or": [{ "gender": input},
            {"email": input},
            {"genotype" : input}, 
            {"blood_group": input},
            {"religion" : input}, 
            {"state" : input}, 
            {"lg" : input}, 
            {"tribe" : input}],

            "$and": [
                {"status" : true},
                { "classes" : output}
            ]
        })
        .exec((err, user, input) => {
             if(err) throw new Error(err)
            Currentclass.find()
                    .sort({roll_no : 1})
                    .exec((err1, users) => {
                        res.render('report', {
                            user : user,
                            users : users,
                    })
            
        })
    })
}
})

router.get('/alumni/:page', async(req, res) => {

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
                                user : user,
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
