if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Learner = require("../models/leaners");
const Session = require("../models/session");
const Section = require("../models/section");
const Subject = require("../models/subject");
const Exam = require('../models/exam');
const Examing = require('../models/third_exam');
const Currentclass = require('../models/current_class');
const Staff = require('../models/staff.js');
const ThirdSection = require('../models/third._term_section');
const VoucherPayment = require("../models/voucher_payment.js");
const Voucher = require("../models/token");
const Proprietor = require("../models/proprietor");
const Staffstatement = require("../models/staff.statetment");
const Event = require('../models/event');
const Blog = require('../models/blog');
const School = require("../models/school.name");
const Classes = require('../models/current_class');
const Miscellaneous = require('../models/miscellaneous')
const bcrypt = require('bcrypt');
const PAYSTACK = process.env.PAYSTACK_SECRET_KEY;
const paystack = require('paystack')(PAYSTACK);
const passport = require('passport');
const { session } = require("passport");
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Position = require("../models/positionFirstTerm");
const CBT = require('../models/test');
const Question = require('../models/question');
const Submission = require('../models/submit');



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file uploads
const uploads = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 3 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});


const uploadEventImage = uploads.single('pageImage');
const uploadLearnerImages = uploads.single('img');
const uploadSchoolImages = uploads.single('img');
const uploadStaffImages = uploads.single('img');
const uploadEventImg   = uploads.single('img');
const uploadBlogImg   = uploads.single('img');
const uploadBlogImage   = uploads.single('img');


// search

const getSearchPage = async ( req, res ) => {
  try {
    await res.render('search', { user: req.user})
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error');
  }
}

const searchLearners = async ( req , res ) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Create a case-insensitive regex for searching
    const searchRegex = new RegExp(search, 'i');

    // Build the query for searching across multiple fields
    const query = {
      $or: [
        { roll_no: searchRegex },
        { arm: searchRegex },
        { classes: searchRegex },
        { first_name: searchRegex },
        { middle_name: searchRegex },
        { last_name: searchRegex },
        { gender: searchRegex },
        { age: searchRegex },
        { email: searchRegex },
        { blood_group: searchRegex },
        { genotype: searchRegex },
        { religion: searchRegex },
        { state: searchRegex },
        { lg: searchRegex },
        { tribe: searchRegex },
      ],
    };

    const filter = Object.assign({ status: true, deletes: false, schoolId : req.user._id }, query);
    // Pagination options
    const learners = await Learner.find( filter )
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

      const filters = Object.assign({ status: true, deletes: false, schoolId : req.user._id }, query);
    const total = await Learner.countDocuments(filters);

    res.json({
      learners,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// All codes on Learners------------------------------------//
const registerLearner = async ( req, res ) => {
    try {
        
    const { roll_no, classId, arm, classes, first_name, last_name, password, 
        password2, email, date_enrolled, date_ended, gender, learnerRollNo } = req.body;

    let errors = []

    if(!roll_no || !classId || !arm || !classes || !first_name || !last_name || !email || !password 
        || !password2 || !date_enrolled || !date_ended || !gender) {
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
      // Format errors array into a string
      req.flash('error_msg', "Error registration: " + errors[0].msg);

      // Redirect with error message
      res.redirect('/admin/create-learner');
      
    } else {
        Learner.findOne({ email: email, schoolId: req.user._id} ).exec((err, user) => {
            console.log(user) 
            if(user) {
               req.flash ( 'error_msg', "Oops! User already associated with this Email" );
                    
                      res.redirect('/admin/create-learner')
                  

            }else if(!user){
                Learner.findOne( { roll_no: roll_no, schoolId: req.user._id } ).exec((err, number) => {
                    console.log(number)
                    if(number) {
                      req.flash ( 'error_msg', "Learner already exist with this Admin number" );
                    
                      res.redirect('/admin/create-learner')
                    }else {
                const newUser = new Learner({
                    roll_no: roll_no,
                    first_name: first_name,
                    last_name: last_name,
                    email: email, 
                    password: password,
                    date_enrolled: date_enrolled,
                    date_ended: date_ended,
                    classId: classId,
                    classes: classes,
                    arm: arm,
                    gender: gender,
                    status: true,
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
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};


const getUpdateLearnerPage = async ( req, res ) => {
    try {
        if (req.query.id) {
          const id = req.query.id;
          const users = await Learner.findById(id);
          
          if (!users) {
            return res.status(404).send({ message: "User not found" });
          }
    
          const classId = users.classId;
          const learnerCurrentClass = await Currentclass.findOne({ _id: classId });
          const learnerClass = await Currentclass.find({ schoolId: req.user._id });
          
          res.render("edit_learner", {
            users: users,
            user: req.user,
            learnerClass,
            learnerCurrentClass
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error retrieving User id" });
      }
};


const updateLearner = async ( req, res ) => {
    try {
        
        const id = req.params.id;

   await Learner.findById(id)
                          .then((user) => {
                            function getAge(dateString) {
                              var today = new Date()
                              var birthDate = new Date(dateString)
                              var age = today.getFullYear() - birthDate.getFullYear()
                              var m = today.getMonth() - birthDate.getMonth()
                              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--
                              }
                              req.body.age = age--
                              return req.body.age
                             
                            }
                            getAge(req.body.dob);
                            user.roll_no = req.body.roll_no; 
                            user.classId = req.body.classId;
                            user.arm = req.body.arm;
                            user.classes = req.body.classes;
                            user.first_name = req.body.first_name; 
                            user.last_name = req.body.last_name; 
                            user.middle_name =  req.body.middle_name;
                            user.email = req.body.email;
                            user.gender = req.body.gender; 
                            user.age = req.body.age; 
                            user.parent_number =  req.body.parent_number;
                            user.dob =  req.body.dob; 
                            user.date_enrolled = req.body.date_enrolled; 
                            user.date_ended = req.body.date_ended; 
                            user.blood_group = req.body.blood_group; 
                            user.genotype = req.body.genotype;
                            user.religion = req.body.religion;
                            user.state = req.body.state;
                            user.lg = req.body.lg;
                            user.tribe = req.body.tribe;
                            user
                                .save()
                                .then(() => {
                                  res.json("Learner Data Updated Successfully...");
                                })
                                .catch((err) => {
                                res.status(400).json("Error:" + err)
                                console.log(err)
                              }
                                );
                          }).catch((err) => {
                            res.status(400).json("Error: " + err);
                            console.log(err)
                          });
                        
  
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error' + ' ' + error);
    }
};


const deleteLearner =  async ( req , res ) => {

    try {
      const id = req.params.id;
       const { deletes } = req.body; 
      const switchDelete = await Learner.findByIdAndUpdate(id, { deletes }, { new: true });
      if (!switchDelete) return res.status(404).send('switch not found');
      res.send(switchDelete);
    } catch (err) {
      res.status(500).send(err.message);
    }
};


const learnersStatus = async ( req , res ) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const switchDoc = await Learner.findByIdAndUpdate(id, { status }, { new: true });
        if (!switchDoc) return res.status(404).send('switch not found');
        res.send(switchDoc);
      } catch (err) {
        res.status(500).send(err.message);
      }
};

const learnersDetails = async ( req , res ) => {
    if(req.query.id) {
        const id = req.query.id;
    
       await Learner.findById(id).exec((err, user) => {
          if(err) throw new Error(err)
            //  res.status(404).send({ message: "User not found" });
              res.render('learner_detail', { 
                users : user,
                user: req.user,
              });
           
           
          
        })
      }
};

const uploadLearnerImage = async (req, res) => {
  try {
      // Process file upload
      uploadLearnerImages(req, res, async (learner) => {
          if (learner) {

          const id = req.params.id;
          const user = await Learner.findById(id);

          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }

          // Check if a file is provided
          if (!req.file) {
              return res.status(400).json({ error: 'No file provided' });
          }

          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);

          // Check if the Cloudinary upload was successful
          if (!result || !result.secure_url) {
              return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
          }

          // Update user's img field with the Cloudinary URL and public ID
          user.img = {
              url: result.secure_url,
              publicId: result.public_id // Save the public ID if needed for future deletions
          };

          await user.save();

          req.flash('success_msg', 'Image uploaded successfully');
          return res.redirect('/admin/update-learner?id=' + id);
        }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//-----------------------------------admindashboard query --------------------------------

const adminDashboardQuery = async ( req , res ) => {
  try {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

      
Learner.countDocuments({ schoolId: req.user._id, status: true, deletes: false, }, (errOne, learnerCount) => {
  if (errOne) {
    throw new Error(errOne);
  }

  Subject.countDocuments({ schoolId: req.user._id }, (errTwo, subjectCount) => {
    if (errTwo) {
      throw new Error(errTwo);
    }

    Section.countDocuments({ schoolId: req.user._id }, (errThree, sectionCount) => {
      if (errThree) {
        throw new Error(errThree);
      }

      Currentclass.countDocuments({ schoolId: req.user._id }, (errFour, currentClassCount) => {
        if (errFour) {
          throw new Error(errFour);
        }

        Session.countDocuments({ schoolId: req.user._id }, (errFive, sessionCount) => {
          if (errFive) {
            throw new Error(errFive);
          }

          Staff.countDocuments({ schoolId: req.user._id, status: true }, (errSix, staffCount) => {
            if (errSix) {
              throw new Error(errSix);
            }

            res.render("admin_dashboard", {
              result: learnerCount,
              resultone: subjectCount,
              resulttwo: sectionCount,
              resultthree: staffCount,
              resultfour: currentClassCount,
              resultfive: sessionCount,
              user: req.user,
            });
          });
        });
      });
    });
  });
});
  } catch (error) {
      console.log(error)
      res.status(500).send('Internal Server Error' + ' ' + error);
  }
};


const adminLogin = async ( req , res, next ) => {
  passport.authenticate('admin-login', (err, admin, info) => {
    if (err) {
      return next(err);
    }
    if (!admin) {
      req.flash('error_msg', "wrong info")
      return res.redirect('/');

    }  if (admin && admin.fees === "pending" && admin.expiry > Date.now()) {
      
      if(admin.status === false ){
       
         req.flash('error_msg', "Your School is Temporarily Suspended. Contact the Developer")
          return res.redirect('/');
      } 
      if(admin.verified  === false ){
        req.flash('error_msg', "Your Email is not Verified yet.")
          return res.redirect('/');
      } else {
           req.logIn(admin, function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success_msg', 'You are welcome');
        return res.redirect('/admin/admin_dashboard');
      });
    }

    }else if (admin.fees === "paid")  {

        if(admin.status === false ){
         req.flash('error_msg', "Your School is Temporarily Suspended. Contact the Developer")
          return res.redirect('/');
      } 
          else if(admin.verified  === false ){
         req.flash('error_msg', "Your Email is not Verified yet.")
          return res.redirect('/');
      } else {
           req.logIn(admin, function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success_msg', 'You are welcome');
        return res.redirect('/admin/admin_dashboard');
      });
    
      }

    
    } else if (admin.fees === "pending" && admin.expiry < Date.now())  {
           req.logOut(function (err) {
          if (err) {
              return next(err);
          }
          req.flash('error_msg', `Your Trial verison has ended Please Contact the developer`);
          res.redirect('/')
      });
    }
    // Checking if user has not paid and trial session is still active
   
  })(req, res, next);
}



const adminlogOut = async ( req , res ) => {
  req.logOut(function (err) {
    if (err) {
        return next(err);
    }
    req.flash('success_msg', 'Session Terminated');
    res.redirect('/')
})
};

//--------------------------Voucher Creation--------------------------------//

const voucherPrinting = async ( req , res ) => {
  try {
    const { pin } = req.body;

    let errors = [];

    if(!pin) {
      errors.push( { msg : "Please fill in your PIN" } )
    }

    if( pin.length < 6  ||   pin.length > 6) {
      errors.push( { msg : "Oops! Incomplete PIN atleast six" } )
    }

    if( pin.length > 6) {
      errors.push( { msg : "Oops! PIN length is more than six" } )
    }

    if(errors.length > 0 ){
      req.flash('error_msg', "Error registration: " + errors[0].msg);
      res.redirect('/admin/get-gen-voucher/1');
    
    }else{
     VoucherPayment.findOne( { pin : pin } ).exec((err, pins) => {
        if (err) {console.log (err); return; }
        if(pins) {
              if ( pins.used == true ) {
                
                req.flash('error_msg', `This PIN: "${pins.pin}" has been used, kindly pay for a new PIN` );
                res.redirect('/admin/get-gen-voucher/1');
               
              }else {
                VoucherPayment.updateOne( { pin : pin }, { used : true }, (err, pins) => {
                  if(err) {
                    console.log(err);
                    return res.render('success', { title : err });
                  } else{
                    const myDocument = () => {
                      var y = [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                        1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,
                        5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                        1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,
                        7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0];
                      var txt = '';
                      var x = y.sort(function(){return 0.5 - Math.random()})
                    
                      for (var i = 110; i < x.length; i++){
                            txt += x[i]
                      }
                      var day = new Date();
                      var year = day.getFullYear();
                      const currentDate = new Date();
                      var fourteen = new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000));
                      var codes = txt
                      const serial = `mon${codes}${year}`;
                    
                    //---------------------code for voucher---------//
                    
                      var cd = [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                        1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,
                        5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                        1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,
                        7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0];
                      var txts = '';
                      var cod = cd.sort(function(){return 0.5 - Math.random()})
                    
                      for (var a = 106; a < cod.length; a++){
                            txts += cod[a]
                      }
                      const coded = txts
                      console.log(coded)
                    
                      const vouchers = [
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
                        {code: coded, expiry: fourteen, serial_no: serial, usage_count: 0, used: false, schoolId: req.user._id,},
      
                      ];
                        vouchers.forEach( async function(vouch){
                          Voucher.findOne({code: coded, serial_no: serial, schoolId: req.user._id}).exec((err, vouchs) => {
                            if(coded && serial){
                              var y = [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                                1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,
                                5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                                1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,
                                7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0];
                              var txt = '';
                              var x = y.sort(function(){return 0.5 - Math.random()})
                    
                              for (var i = 110; i < x.length; i++){
                              txt += x[i]
                              }
                              var day = new Date();
                              var year = day.getFullYear();
                              const currentDate = new Date();
                              var fourteen = new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000));
                              var codes = txt
                              const serial = `mon${codes}${year}`;
                    //---------------------code for voucher---------//
                              var cd = [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                                1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,
                                5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,
                                1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,
                                7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0];
                              var txts = '';
                              var cod = cd.sort(function(){return 0.5 - Math.random()})
                      
                              for (var a = 106; a < cod.length; a++){
                                    txts += cod[a]
                              }
                              const coded = txts
                              const newVoucher = new Voucher({
                                code : coded,
                                serial_no: serial,
                                expiry : fourteen,
                                usage_count : 0,
                                used : false,
                                schoolId: req.user._id,
                                
                              })
                    
                              newVoucher
                                    .save()
                                    .then((vou) => {
                                      res.redirect('/admin/get-gen-voucher/1');
                                      // if(vou) res.status(200).send('vou')
                                      console.log(vou)
                                    }).catch((err)=> console.error(err.message))
                            
                              
                            } else if(!coded) {
                              Voucher.create(vouch, (err, vouch) => {
                                if (err) throw new Error(err)
                                res.redirect('/admin/get-gen-voucher/1');
                              })
                            }
                          })
                        })
                    
                    }
                    
                    myDocument()
                  }
                })
              }
        } else {
         
          req.flash('error_msg', `This PIN: ${pin} you provided is Invalid` );
          res.redirect('/admin/get-gen-voucher/1');
        }

      })
    }

  
    
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getVoucherPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    var perPage = 10
    var page = req.params.page || 1
      await Voucher.find( { used: false, print: false, schoolId: req.user._id } )
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .exec((err, vouch) => {
                      Voucher.count({used: false, print: false, schoolId: req.user._id})
                             .exec((errOne, count) => {
                                if(errOne) throw new Error(err)
                                if(err) throw new Error(err)
                          res.render('get_token', {
                            vouch : vouch,
                            current: page,
                            user: req.user,
                            pages: Math.ceil(count / perPage)
                          })
                      })
                     
                    })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getVoucherPaymentPage = async ( req, res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

    await res.render('payment', {user: req.user})
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const onPrintAtti = async ( req , res ) => {
  try {
    const { voucherCodes } = req.body;
    // Update 'print' field of vouchers with the provided codes to true
    await Voucher.updateMany({ code: { $in: voucherCodes } }, { $set: { print: true } });
    res.sendStatus(200);
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
}

//-------------------------------payment method --------------------------------------//
const payStackPayment = async ( req, res ) => {
  try {
  
    const email = req.body.email;
    const amount = req.body.amount * 100; // Paystack amount is in kobo (1/100 of a naira)
    let errors = []

    if (!email || !amount) {
      errors.push( { msg: "Please input Your Email" } );
    }
    if(amount < 250000) {
      errors.push( { msg: "You can not pay less than the encrypted amount" } );
    }
    if(errors.length > 0){
      res.render('payment', {
        errors: errors,
        email: email,
        amount: amount,
        user: req.user,
      })
    }if(email !== req.user.email){
      errors.push( { msg: "Email not tally with the Your Email" } );
      res.render('payment', {
        errors: errors,
        email: email,
        amount: amount,
        user: req.user,
      })
    }else{
      const payment = await paystack.transaction.initialize({
        email: email,
        amount: amount,
        metadata: {
          custom_fields: [
            {
              display_name: "Generated Code",
              variable_name: "generated_code",
            }
          ]
        },
        callback_url: "https://monitorschoolmanagent.com.ng/admin/callback",
      });
      res.redirect(payment.data.authorization_url);
    }
   
  } catch (error) {
    console.log(error);
    res.redirect('/admin/error');
  }
}

const payStackCallBack = async ( req , res ) => {
  try {
         
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let voucherCode = '';
    for (let i = 0; i < 6; i++) {
      voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  const codes = voucherCode
  const reference = req.query.reference;
  const payment = await paystack.transaction.verify(reference);
  if (payment.data.status === 'success') {
    const email = payment.data.customer.email;
    const amount = payment.data.amount / 100; // convert from kobo to naira
    const pin = codes; // custom code generation function
    const order = new VoucherPayment({
      email: email,
      amount: amount,
      reference: reference,
      pin: pin,
      status: 'paid',
    });
    await order.save();
    res.render('success', { title: `Congratulations! your #2500 payment was successfull, 
    Copy this code: "${order.pin}" to purchase Vouchers`, user: req.user, });
  } else {
    res.redirect('/error');
  }
} catch (error) {
  console.log(error);
  res.redirect('/admin/error');
}
};

const getHomePageLearenrReg = async ( req , res ) => {
   try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      const alpha = '1234567890';
      let alphaCode = '';
      
      while (alphaCode.length < 2) {
        const randomChar = alpha.charAt(Math.floor(Math.random() * alpha.length));
        if (!alphaCode.includes(randomChar)) {
          alphaCode += randomChar;
        }
      }
      
      console.log(alphaCode);
      

    const learnerId = req.user._id
    const learner = await Learner.count( { schoolId : req.user._id } ).exec();
    console.log(learner)
    // const numer = "1234567890";
    let totalNumber = '';
    if(learner < 10 ) {
      totalNumber = "00"
    }else if ( learner > 9 && learner < 100){
      totalNumber = "0"
    }
  
    let zeroCount = totalNumber;
    let numerCode = `${zeroCount}${learner + 1}`;
    // for (let i = 0; i < 2; i++) {
    //   numerCode += numer.charAt(Math.floor(Math.random() * numer.length));
    // }
  
    var day = new Date();
    var year = day.getFullYear().toString(); // Convert year to a string
    var justTwo = year.split("");
    var one = justTwo[2];
    var two = justTwo[3];
    const OneTwo = one + two;
   
    const schoolName = req.user.school_name
    const userSchool = schoolName.split('');
    const schoolAbb = userSchool[0] + userSchool[1] + userSchool[2];
    const schoolAbbToUpper = schoolAbb.toUpperCase()
  
    const learnerRollNo = `${OneTwo}/${alphaCode}${schoolAbbToUpper}${numerCode}`;
    const learnerEmail = `${OneTwo}.${alphaCode}${schoolAbbToUpper}${numerCode}`;
      await Currentclass
              .find({schoolId: req.user._id} )
              .select("_id name arm")
              .exec((err, current) => {
                if(err) throw new Error(err)
                res.render('create_learners', {
                  current: current,
                  user: req.user,
                  learnerRollNo,
                  learnerEmail,
                })
              
              })
  
   } catch (err) {
    console.log(err.message)
    res.status(500).send( 'Internal Server Error' + ' ' + err.message);
   }
}


//----------------------------creating , updating and deleting in admin------------------------------------

const registerProprietorStatement = async ( req, res ) => {
  try {
    const { full_name, excellent, very_good, good, pass, poor, vpoor } = req.body;
    let errors = [];
    console.log(`Full_name: ${full_name} excellent: ${excellent} very_good ${very_good} good: ${good} pass: ${pass} poor: ${poor} V.poor ${vpoor} `)
   
    if(!full_name || !excellent || !very_good || !good || !pass || !poor || !vpoor) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(errors.length > 0) {
        res.render('create_proprietor', {
          errors: errors,
            full_name: full_name,
            excellent: excellent,
            very_good: very_good,
            good: good,
            pass: pass,
            poor: poor,
            vpoor: vpoor,
            user: req.user,
        })
    }  else {
    
                const newProprietor = new Proprietor({
                    full_name: full_name,
                    excellent: excellent,
                    very_good: very_good,
                    good: good,
                    pass: pass,
                    poor: poor,
                    vpoor: vpoor,
                    schoolId: req.user._id,
                    
                })
                newProprietor.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "Statement Added !"
                                    );
                        res.redirect('/admin/school_management')
                    })
                    .catch(value => console.log(value))
            }
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getProprietorUpdatePage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

    
    if (req.query.id) {
      const id = req.query.id;
      await Proprietor.findById(id)
        .then((comment) => {
          if (!comment) {
             res.status(404).send({ message: "Section not found" });
          } else {
            res.render("edit_proprietor", { comment : comment, user: req.user });
          }
        })
        .catch((err) => {
          res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
        });
    }

  } catch (err) {
    
  }
};

const updateProprietor = async ( req , res ) => {
  try {
    const id = req.params.id;
      await Proprietor.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(comment => {
          if(!comment)
          {  
            res.status(404).send({message: `Cannot Update proprietor with ID:${id} Maybe session not present`})
           
          } else {
            res.send(comment)
    
          }
        })
        .catch((err) => {
          res.render("error404", {title: "Error 500:. Error updating data" + ' ' + err})
        });
    
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
  }
};

const deleteProprietor = async ( req , res ) => {
  try {
    const id = req.params.id;
    await Proprietor.findByIdAndDelete(id)
    .then((data) => {
     if (!data) {
       res
         .status(404)
         .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
     } else {
       res.send({
         message: "Proprietor Statement was deleted successfully!",
       });
     }
   })
   .catch((err) => {
     res.render("error404", {title: "Error 500:. Error retrieving id" + ' ' + err})
   });
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
  }
};

const createStaff = async ( req , res ) => {
  try {
    const { roll, name, email, mobile_phone, address, password, password_2 } = req.body;
    let errors = [];
    console.log( `ROll: ${ roll } Name: ${ name }` )
   
    if(!name ||!roll ||!email ||!mobile_phone ||!address || !password || !password_2 ) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(password !== password_2) {
      errors.push( { msg : "Password dont macth" } )
  } 
  if (password.length < 8) {
    errors.push({ msg: "password atleast 8 character" });
  }

    if(errors.length > 0) {
        res.render('student', {
          errors: errors,
          roll: roll,
           name: name,
           email: email,
           mobile_phone: mobile_phone,
           address: address,
           password : password,
           password_2 : password_2,
           user: req.user,
        })
    }  else {
    
                const newStaff = new Staff({
                  roll: roll,
                  name: name,
                  status: true,
                  email: email,
                  address: address,
                  password: password,
                  mobile_phone: mobile_phone,
                  schoolId: req.user._id,
                    
                })

                bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(newStaff.password, salt,
                    (err, hash) => {
                        if (err) throw err;

                        newStaff.password = hash;

                        newStaff.save()
                            .then((value) => {
                                console.log(value)
                                req.flash(
                                  "success_msg",
                                  "A staff Registered !"
                                );
                                res.redirect('/admin/create_staff')
                            })
                            .catch(value => console.log(value))
                    }))
      
            }

  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getUpdateStaffUpdatePage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    if (req.query.id) {
      const id = req.query.id;
      Staff.findById(id)
        .then((staff) => {
          if (!staff) {
             res.status(404).send({ message: "Section not found" });
          } else {
            res.render("staffs", { staff : staff, user: req.user });
          }
        })
        .catch((err) => {
          res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
        });
    }
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};


// staff image
const editStaffImage = (req, res) => {
  try {
      // Process file upload
      uploadStaffImages(req, res, async (staff) => {
          if (staff) {

          const id = req.params.id;
          const user = await Staff.findById(id);

          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }

          // Check if a file is provided
          if (!req.file) {
             
              return res.render("error404", {title: "Error 400:. oops! No file provided" + ' ' + error})
              
          }

          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);

          // Check if the Cloudinary upload was successful
          if (!result || !result.secure_url) {
              return res.render("error404", {title: "Error 500:. oops! Error uploading image to Cloudinary" + ' ' + error})
          }

          // Update user's img field with the Cloudinary URL and public ID
          user.img = {
              url: result.secure_url,
              publicId: result.public_id // Save the public ID if needed for future deletions
          };

          await user.save();

          req.flash('success_msg', 'Image uploaded successfully');
          return res.redirect('/admin/update-staff?id=' + id);
        }
      });
  } catch (error) {
      console.error(error);
    
      res.render("error404", {title: "Error 500:. oops! Internal Server Error" + ' ' + error})
  }
};



const updateStaff = async ( req , res ) => {
  try {
    const id = req.params.id;
    Staff.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(comment => {
        if(!comment)
        {  
          res.status(404).send({message: `Cannot Update Class with ID:${id} Maybe session not present`})
         
        } else {
          res.send(comment)
  
        }
      })
      .catch(err => {
           res.status(500).send({message:"Error Updating Staff information" + err})
      })
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
}

const deleteStaff = async ( req , res ) => {
  try {
    const id = req.params.id;
    await Staff.findByIdAndDelete(id)
    .then((data) => {
     if (!data) {
       res
         .status(404)
         .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
     } else {
       res.send({
         message: "Statement was deleted successfully!",
       });
     }
   })
   .catch((err) => {
     res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + err})
   });
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
}

const staffStatus = async ( req , res ) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await Staff.findByIdAndUpdate(id, { status }, { new: true });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + err.message})
    }
  } catch (err) {
    if(err) 
    console.log(err.message)
    
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
}


const staffDetails = async ( req , res ) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      
      const staff = await Staff.findById(id);
      if (!staff) {
        return res.render("error404", { title: "Error 500: Oops! Section not found", user: req.user });
      }
      const classes = await Classes.find({ schoolId: req.user._id }).select("_id name arm");
      const classesIds = staff.classId; // Array of class ids allocated to the staff

      // Fetch details of allocated classes
      const allocatedClasses = await Promise.all(classesIds.map(async (classId) => {
        const sclass = await Classes.findById(classId).select("name _id arm");
        return sclass;
      }));
     

      res.render("staffs-details", {
        staff,
        user: req.user,
        classes,
        allocatedClasses, // Pass allocatedClasses to the view
      });
    } else {
      res.render("error404", {
        title: "Internal Server Error",
        user: req.user,

      });
    }
  } catch (error) {
    console.log(error);
    res.render("error404", {
      title: "Internal Server Error"+ error,
      user: req.user,
    });
  }
}

const allocateStaffClass = async ( req , res ) => {
  
    try {
      const { classID } = req.body;
      const id = req.query.id;
      
      // Check if classID is provided and valid
      if (!classID) {
        req.flash("error_msg", "Class ID is required");
        return res.redirect(`/admin/staffdetail?id=${id}`);
      }
  
      const staff = await Staff.findById(id);
  
      if (!staff) {
        req.flash("error_msg", "Staff not found");
        return res.redirect(`/admin/staffdetail?id=${id}`);
      }
  
      // Check if classID exists in your database or any other necessary validation
  
      // Push classID to the staff's classId array
      staff.classId.push(classID);
      await staff.save();
  
      req.flash("success_msg", "Class allocated successfully");
      res.redirect(`/admin/staffdetail?id=${staff._id}`);
    } catch (error) {
      console.log(error);
      req.flash("error_msg", "Failed to allocate class");
      res.redirect(`/admin/staffdetail?id=${id}`);
    }
 
};


const disallocateStaffClass = async ( req , res ) => {
  const staffId = req.params.id;
  const classNameToRemove = req.query.classed;

  try {
    await Staff.updateOne({ _id: staffId }, { $pull: { classId: classNameToRemove } });
   
    req.flash("success_msg", "Class disallocated successfully");
    res.redirect(`/admin/staffdetail?id=${staffId}`);
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to disallocate class");
    res.status(500).send("Server error" + ' ' + err);
  }
};


const createStaffStatement = async ( req , res ) => {
  try {
    
    const {excellent, very_good, good, pass, poor, vpoor} = req.body;
let errors = [];
console.log(`excellent: ${excellent} very_good: ${very_good} good: ${good} pass: ${pass} poor: ${poor} vpoor: ${vpoor}`)

if(!excellent || !very_good || !good || !pass || !poor || !vpoor) {
    errors.push( { msg : "Please fill in all fields"});
}

if(errors.length > 0) {
    res.render('staff_statement', {
      errors: errors,
     excellent:excellent,
      very_good: very_good,
       good: good,
       pass: pass,
       poor: poor,
       vpoor: vpoor,
       user: req.user,
    })
}  else {

            const newStaffStatement = new Staffstatement({
              excellent:excellent,
              very_good: very_good,
              good: good,
              pass: pass,
              poor: poor,
              vpoor: vpoor,
              schoolId: req.user._id
                
            })
            newStaffStatement.save()
                .then((value) => {
                    console.log(value)
                    req.flash(
                        "success_msg",
                        "A Staff Statement Added !"
                                );
                    res.redirect('/admin/create-staff-statement')
                })
                .catch(value => console.log(value))
        }


  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getUpdateStatementPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    if (req.query.id) {
      const id = req.query.id;
     await Staffstatement.findById(id)
      .then((staffs) => {
        if (!staffs) {
           res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + 404})
        } else {
          res.render("edit_staffstatement", { staffs : staffs, user: req.user});
        }
      })
      .catch((err) => {
        res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
      });
      }
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('error_msg', 'Internal Server Error' + ' ' + err.message);
  }
};

const updateStaffState = async ( req , res ) => {
  const id = req.params.id;
  Staffstatement.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then(comment => {
  if(!comment)
  {  
    res.status(404).send({message: `Cannot Update Class with ID:${id} Maybe session not present`})
  
  } else {
    res.send(comment)

  }
  })
  .catch(err => {
    res.status(500).send({message:"Error Updating Staff information" + err})
  })

};

const deleteStaffState = async ( req , res ) => {
  const id = req.params.id;
  await Staffstatement.findByIdAndDelete(id)
  .then((data) => {
    if (!data) {
      res
        .status(404)
        .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
    } else {
      res.send({
        message: "Statement was deleted successfully!",
      });
    }
  })
  .catch((err) => {
    res.status(500).send({
      message: "Could not delete Statement with id=" + id + "with err:" + err,
    });
  });
};

// ---------------------------updating Schools-----------------------------------------------
const getSchoolUpdatePage = async ( req , res ) => {

  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


  if (req.query.id) {
    const id = req.query.id;
    School.findById(id)
    .then((school) => {
      if (!school) {
        res.status(404).send({ message: "Sschool not found" });
      } else {
        res.render("edit_school", { school : school, user: req.user });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving school id" });
    });
    }
};

const updateSchool = async ( req , res ) => {
  const id = req.params.id;
  School.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then(school => {
  if(!school)
  {  
    res.status(404).send({message: `Cannot Update School with ID:${id} Maybe session not present`})
  
  } else {
    res.send(school)

  }
  })
  .catch(err => {
    res.status(500).send({message:"Error Updating School information" + err})
})
};

const getSchoolDetail = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    const Id = req.user._id
    const school = await School.findById({ _id: Id }).exec();
    res.render('school_detail', {school, user: req.user})
  } catch (error) {
    res.render("error404", {title: "Error 404" + ' ' + error})
  }
};

const uploadSchoolLogo = async ( req , res ) => {
  try {
    uploadSchoolImages (req , res, async (school) => {
      if (school) {
        const id = req.params.id;
        const user = await School.findById(id);
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Check if a file is provided
        if (!req.file) {
          return res.status(400).json({ error: 'No file provided' });
        }
    
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);
    
    
        // Check if the Cloudinary upload was successful
        if (!result || !result.secure_url) {
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }
    
        // Update the user's img field with the Cloudinary URL
        user.img = {
          url: result.secure_url,
          publicId: result.public_id  // Save the public ID if you need it for future deletions
        };
    
        await user.save();
        console.log(user.img);
        
    
        req.flash('success_msg', 'Image uploaded successfully');
        return res.redirect('/admin/update-school?id=' + id);
        res.status(200).json( { message: "Image Uploaded" } )
      }
    })
   
  } catch (error) {
    console.error(error);
   
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const schoolStatus = async ( req , res ) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await School.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  };
};


// ------------------add session--------------------------------------//
const addSession = async ( req, res ) => {
    try {
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
    } catch (err) {
      if(err) 
    console.log(err.message)
    res.status(500).send( 'Internal Server Error' + ' ' + err.message);
    }
  };


  const getUpdateSesstionpPage = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      if (req.query.id) {
        const id = req.query.id;
        Session.findById(id)
          .then((session) => {
            if (!session) {
              res.status(404).send({ message: "Session not found" });
            } else {
              res.render("edit_session", { session : session, user: req.user });
            }
          })
          .catch((err) => {
            res.send(500).send({ message: "Error retrieving Session id" });
          });
      }
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const updateSession = async ( req , res ) => {
    try {
      if (!req.body) {
        return res
            .status(400)
            .send( {message : "Data to update can not be empty" })
      }
    
      const id = req.params.id;
      Session.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(session => {
          if(!session)
          {  
            res.status(404).send({message: `Cannot Update Session with ID:${id} Maybe session not present`})
          } else {
            res.send(session)
          }
        })
        .catch(err => {
             res.status(500).send({message:"Error Updating session information" + err})
        })
    } catch (error) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const deleteSession = async ( req , res ) => {
    try {
      const id = req.params.id;
    await Session.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Session was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Session with id=" + id + "with err:" + err,
      });
    });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  
  // --------------------------add, update and delete section--------------------------------------
  const addSection = async ( req , res ) => {
    try {
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
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const getUpdateSectionPage = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      if (req.query.id) {
        const id = req.query.id;
        Section.findById(id)
          .then((section) => {
            if (!section) {
               res.status(404).send({ message: "Section not found" });
            } else {
              res.render("edit_section", { section : section, user: req.user });
            }
          })
          .catch((err) => {
            res.send(500).send({ message: "Error retrieving Session id" });
          });
      }
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const updateSection = async ( req , res ) => {
    try {
      const id = req.params.id;
      Section.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(section => {
          if(!section)
          {  
            res.status(404).send({message: `Cannot Update Section with ID:${id} Maybe session not present`})
           
          } else {
            res.send(section)
    
          }
        })
        .catch(err => {
             res.status(500).send({message:"Error Updating section information" + err})
        })
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const deleteSection = async ( req , res ) => {
    try {
      const id = req.params.id;
      await Section.findByIdAndDelete(id)
      .then((data) => {
       if (!data) {
         res
           .status(404)
           .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
       } else {
         res.send({
           message: "Section was deleted successfully!",
         });
       }
     })
     .catch((err) => {
       res.status(500).send({
         message: "Could not delete Section with id=" + id + "with err:" + err,
       });
     });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  }


  //---------------------------------Add, update and delete third term------------------------
  const addThirdTermSection = async ( req , res ) => {
    try {
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
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const getUpdateThirdSectionPage = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      if (req.query.id) {
        const id = req.query.id;
        ThirdSection.findById(id)
          .then((section) => {
            if (!section) {
               res.status(404).send({ message: "Section not found" });
            } else {
              res.render("edit-third-section", { section : section, user: req.user});
            }
          })
          .catch((err) => {
            res.send(500).send({ message: "Error retrieving Session id" });
          });
      }
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const updateThirdSection = async ( req , res ) => {
    try {
      const id = req.params.id;
      ThirdSection.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(section => {
          if(!section)
          {  
            res.status(404).send({message: `Cannot Update Section with ID:${id} Maybe session not present`})
           
          } else {
            res.send(section)
    
          }
        })
        .catch(err => {
             res.status(500).send({message:"Error Updating section information" + err})
        })
      
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const deleteThirdSection = async ( req , res ) => {
    try {
      const id = req.params.id;
      await ThirdSection.findByIdAndDelete(id)
      .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
        } else {
          res.send({
            message: "Section was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not delete Section with id=" + id + "with err:" + err,
        });
      });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  }


  //-------------------------------add, delete and update Classes-----------------------
  const addClass = async ( req , res ) => {
    try {
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
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const getUpdateClassPage = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      if (req.query.id) {
        const id = req.query.id;
        Currentclass.findById(id)
          .then((classes) => {
            if (!classes) {
               res.status(404).send({ message: "Section not found" });
            } else {
              res.render("edit_current_class", { classes : classes, user: req.user});
            }
          })
          .catch((err) => {
            res.send(500).send({ message: "Error retrieving Session id" });
          });
      }
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const updateClass = async ( req , res ) => {
    try {
      const id = req.params.id;
      Currentclass.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(classes => {
          if(!classes)
          {  
            res.status(404).send({message: `Cannot Update Class with ID:${id} Maybe session not present`})
           
          } else {
            res.send(classes)
    
          }
        })
        .catch(err => {
             res.status(500).send({message:"Error Updating class information" + err})
        })
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const deleteClass = async ( req , res ) => {
    try {
      const id = req.params.id;
      await Currentclass.findByIdAndDelete(id)
      .then((data) => {
       if (!data) {
         res
           .status(404)
           .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
       } else {
         res.send({
           message: "Class was deleted successfully!",
         });
       }
     })
     .catch((err) => {
       res.status(500).send({
         message: "Could not delete Class with id=" + id + "with err:" + err,
       });
     });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  }
  
  // ----------------------------add, update and delete subject----------------------------------------------
  const addSubject = async ( req , res ) => {
    try {
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
                res.render('create_subject', {errors, roll_no, name, category, user: req.user});
            } else if (!claas){
                Subject.findOne( { name: name, schoolId: req.user._id } ).exec((err, names) => {
                    console.log(names)
                    if(names) {
                         errors.push ( { msg: "a Subject already associated with this name" });
                        res.render('create_subject', {errors, roll_no, name, category, user: req.user} );
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
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const getUpdateSubjectPage = async ( req , res ) => {
    try {

      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


      if (req.query.id) {
        const id = req.query.id;
        Subject.findById(id)
          .then((subject) => {
            if (!subject) {
              res.status(404).send({ message: "subject not found" });
            } else {
              res.render("edit_subject", { subject : subject, user: req.user });
            }
          })
          .catch((err) => {
            res.send(500).send({ message: "Error retrieving Session id" });
          });
      }
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const updateSubject = async ( req , res ) => {
    try {
      if (!req.body) {
        return res
            .status(400)
            .send( {message : "Data to update can not be empty" })
      }
    
      const id = req.params.id;
      Subject.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(subject => {
          if(!subject)
          {  
            res.status(404).send({message: `Cannot Update subject with ID:${id} Maybe subject not present`})
          } else {
            res.send(subject)
          }
        })
        .catch(err => {
             res.status(500).send({message:"Error Updating subject information" + err})
        })
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };


  const deleteSubject = async ( req , res ) => {
    try {
      const id = req.params.id;
    await Subject.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Subject was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete subject with id=" + id + "with err:" + err,
      });
    });
    } catch (err) {
      if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  }

//--------------------------get Pages------------------------------------------

const manageAll = async ( req , res ) => {
  
  await Proprietor
  .find({ schoolId: req.user._id })
  .select("full_name excellent very_good good pass vpoor poor")
  .exec(function(err, comment) {
    if (err) throw new Error(err)

    Staffstatement.find({schoolId: req.user._id}).exec((errtwo, sst) => {
      if(errtwo) throw new Error(errtwo)
        res.render('all_schools_setting', {
          comment: comment,
          sst : sst,
          user: req.user,

        }) 
    }) 
  })
};

const createStaffPage = async ( req , res ) => {
  try {
    await 
    res.
        render("student", {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const createProprietorPage = async ( req , res ) => {
  try {
    await 
      res.
        render('create_proprietor', {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getAllStaffs = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await   
    Staff
      .find({ status: true, schoolId: req.user._id })
      .exec((errone, staff) => {
          if(errone) throw new Error(errone)
          res.render(
            "allstaff",
            { 
              user : req.user, 
              staff: staff
            }
          )
        })

  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getCreateStaffStatePage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
        render("staff_statement", {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getCreateClassPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
        render("create_currentclass", {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getCreateSubjectPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
        render('create_subject', {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getCreateSessionPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
        render('create_session', {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getCreateSectionPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
        render('create_section', {user: req.user})
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getPaymentErrorPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    await 
      res.
      render("error404", {title: 'An error occurred while processing your payment'});
  } catch (err) {
    if(err) 
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};


const getAllSession = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    var perPage = 9
    var page = req.params.page || 1

   await  Session
        .find({ schoolId: req.user._id})
        .select("roll_no name date_started date_ended dnow classof ")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, session) {
            Session.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('all_sessions', {
                    session: session,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })
 
  } catch (err) {
    console.log(err.message)
    res.status(500).send( 'Internal Server Error' + ' ' + err.message);
  }
};

const getAllSection = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    var perPage = 9
    var page = req.params.page || 1

    Section
        .find({ schoolId: req.user._id})
        .select("roll_no name date_started date_ended datenow classof")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, section) {
            Section.count({schoolId: req.user._id}).exec(function(err, count) {
                if (err) return next(err)
                res.render('all_sections', {
                    section: section,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getAllThirdSecton = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');


    var perPage = 9
     var page = req.params.page || 1
 
   ThirdSection
         .find( { schoolId: req.user._id } )
         .select("roll_no name date_started date_ended datenow classof")
         .skip((perPage * page) - perPage)
         .sort({roll_no : 1})
         .limit(perPage)
         .exec(function(err, third) {
            ThirdSection.count({schoolId: req.user._id}).exec(function(err, count) {
                 if (err) return next(err)
                 res.render('all_thirdterm', {
                     third: third,
                     current: page,
                     pages: Math.ceil(count / perPage),
                     user: req.user,
                 })
             })
         })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getAllLearner = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

    var perPage = 9
    var page = req.params.page || 1

    await Learner
        .find({ status : true, deletes: false, schoolId: req.user._id })
        .select("roll_no classes arm first_name last_name gender status img date_enrolled date_ended class_code ")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err,learner) {
            Learner.count({schoolId: req.user._id, status : true, deletes: false}).exec(function(err, count) {
                if (err) return next(err)
               
                res.render('all_learners', {
                    learner: learner,
                    user: req.user,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
                
            })
        })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getAllSubject = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

    var perPage = 9
    var page = req.params.page || 1

    await Subject
        .find({ schoolId: req.user._id})
        .select("roll_no name category")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, subject) {
            Subject.count(
              { schoolId: req.user._id }
            ).exec(function(err, count) {
                if (err) return next(err)
                res.render('all_subjects', {
                    subject: subject,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};


const getAllClasses = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

    var perPage = 9
    var page = req.params.page || 1

    await Currentclass
        .find({ schoolId: req.user._id})
        .select("roll_no name arm class_code capacity status")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, classes) {
            Currentclass.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('all_currentclass', {
                    classes: classes,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

const getFirstAndSecondResult = async ( req , res ) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

      res.render('term_result', {user: req.user})
  } catch (error) {
    
    res.status(500).send('Internal Server Error' + ' ' + error);
  }
 
};


const getThirdResult = async ( req , res ) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

      res.render('third_term_result', {user: req.user})
  } catch (error) {
    
    res.status(500).send('Internal Server Error' + ' ' + error);
  }
  
};

//-------------------------------all pages rendering end here-----------------------------

// ---------------------------------Learner's Report--------------------------
const ITEMS_PER_PAGE = 5;
const LearnersReport = async ( req , res ) => {
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
            { "deletes": false },
            { "schoolId": req.user._id },
            { "classId": output },
      
        ]
    };

    const totalItems = await Learner.countDocuments(query);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const learners = await Learner.find(query)
        .sort({ roll_no: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .exec();

    const users = await Currentclass.find({ schoolId: req.user._id}).sort({ roll_no: 1 }).exec();

    res.render('report', {
        learner: learners,
        users: users,
        currentPage: page,
        totalPages: totalPages,
        user: req.user,
        output,
        input,
        
    });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
};

//------------------------alumni Page-------------------------------------------
const getAlumniPage = async ( req , res ) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');


    var perPage = 9;
    var page = req.params.page || 1 
    await Learner.find( { status : false, deletes : false, schoolId: req.user._id } )
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
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};

//--------------------------Old learner status update-------------------------------------
const oldLearnersStautusUpdate = async ( req , res ) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const switchDoc = await Learner.findByIdAndUpdate(id, { status }, { new: true });
      if (!switchDoc) return res.status(404).send('switch not found');
      res.send(switchDoc);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Internal Server Error' + ' ' + err.message);
  }
};


//---------------------------Learners Promotion ------------------------------------------------
const promoteSingleLearner = async (req, res) => {
  try {
    const userId = req.params.id;
    const classId = req.body.id;

    const userClass = await Currentclass.findById(classId);
    if (!userClass) {
      const message = 'Class not found';
      if (req.xhr) return res.status(404).json({ message });
      req.flash('error_msg', message);
      return res.status(404).redirect('/admin/promote');
    }

    if (classId) {
      const user = await Learner.findById(userId);
      if (!user) {
        const message = 'User not found';
        if (req.xhr) return res.status(404).json({ message });
        req.flash('error_msg', message);
        return res.status(404).redirect('/admin/promote');
      }

      user.classId = classId;
      user.classes = userClass.name;
      await user.save();

      const message = 'Learner promoted successfully';
      if (req.xhr) return res.status(200).json({ message });
      req.flash('success_msg', message);
      return res.redirect(`/admin/promote?id=${classId}`);
    } else {
      const message = 'Class ID not provided';
      if (req.xhr) return res.status(400).json({ message });
      req.flash('error_msg', message);
      return res.status(400).redirect('/admin/promote');
    }
  } catch (error) {
    console.error(error);
    const message = 'Internal server error';
    if (req.xhr) return res.status(500).json({ message });
    req.flash('error_msg', message);
    return res.status(500).redirect('/admin/promote');
  }
};



const promoteAllLearner = async (req, res) => {
  try {
    const { classId, newClassId } = req.body; 
    const userClass = await Currentclass.findById(newClassId);

    if (!classId || !newClassId) {
      req.flash('error_msg', 'Both Class ID and New Class ID are required');
      return res.status(400).redirect('/admin/promote');
    }

    // Find all learners with the specified current classId and update to newClassId
    await Learner.updateMany({ classId }, { $set: { classId: newClassId , classes: userClass.name} });

    req.flash('success_msg', 'Learners promoted successfully');
    return res.redirect(`/admin/promote?id=${newClassId}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Internal server error');
    return res.status(500).redirect('/admin/promote');
  }
};


const getPromotePage = async ( req , res  ) => {

  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');

    if (req.query.id) {
      const id = req.query.id;
      const presentClass = await Currentclass.findById(id).exec()
      await Currentclass.find( { schoolId : req.user._id } )
                         .select("name arm _id") 
                         .sort({ roll_no : 1})
                         .exec((err, classed) => {
                              if(err) throw new Error(err)
                              Learner.find( { "classId" : id, "status": true, "deletes": false } )
                                .exec((errOne, users) => {
                                  if(errOne) throw new Error(errOne)
                                  res.render("promoter", {
                                      classed: classed,
                                      users: users,
                                      user: req.user,
                                      presentClass
                                  })
                              })
                             
                         })
     }

    
  } catch (error) {

    res.status(500).send('Internal Server Error' + ' ' + error);
  }
  

};


//-----------------------------checking Result-------------------------------------


const checkResultFirstAndSecond = async ( req , res ) => {
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

    const pin = await Voucher.findOne({ code, schoolId: req.user._id }).exec();

    if (!pin) {
      return res.render('success', { title: "Invalid voucher not identified with your school Identity. As any Fraud Activities are punishable" });
    }

    const pinToString = pin.userid ? pin.userid.toString() : '';
    const learnerToString = learnerId ? learnerId.toString() : '';
    console.log(pinToString);
    console.log(learnerToString);
      
    if (pin && pin.expiry > Date.now()) {
      if (pin.usage_count >= 30 ) {
        return res.render('success', { title: "Oops! This pin has reached its usage limit" });
      }

      if (pinToString != learnerToString && pin.used == true) {
        return res.render('success', { title: "This pin has been assigned to a learner" });
        console.log(true)
    }

      const exam = await Exam.find({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
      const misc = await Miscellaneous.findOne({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
      const users = await Learner.findById(learnerId).exec();
      const section = await Section.findOne({ roll_no, name, classof, schoolId: req.user._id }).exec();
      const session = await Session.findOne({ classof, schoolId: req.user._id }).exec();
      const position = await Position.findOne({learnerId: learnerId, term: name, classofs: classof, classId: learner.classId }).exec()

      if (exam) {
        await Voucher.updateOne({ code }, { $set: { userid: learner._id, used: true }, $inc: { usage_count: 1 } });
        return res.render("term_result", { position, exam, misc, users, section, session, user: req.user, resultSerialNumber });
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

function generateRandomCode(length, characters) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};


const chseckThirdTermResult = async ( req , res ) => {
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

    const pin = await Voucher.findOne({ code, schoolId: req.user._id }).exec();

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
        console.log(true)
    }

      const exam = await Examing.find({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
      const misc = await Miscellaneous.findOne({ _learner: learnerId, term: name, classofs: classof, roll_no }).exec();
      const users = await Learner.findById(learnerId).exec();
      const section = await ThirdSection.findOne({ roll_no, name, classof, schoolId: req.user._id }).exec();
      const session = await Session.findOne({ classof, schoolId: req.user._id }).exec();
      const position = await Position.findOne({learnerId: learnerId, term: name, classofs: classof, classId: learner.classId }).exec();

      if (exam) {
        await Voucher.updateOne({ code }, { $set: { userid: learner._id, used: true }, $inc: { usage_count: 1 } });
        return res.render("third_term_result", { position, exam, misc, users, section, session, user: req.user, resultSerialNumber });
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
};



// ---------------------------------CBT-------------------------------------------------//

const getCreateTestForCbt = async ( req , res) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');


    var perPage = 9;
    var page = req.params.page || 1;
    
    const cbt = await CBT
                          .find( { schoolId : req.user._id} )
                          .skip((perPage * page) - perPage)
                          .limit(perPage)
                          .sort( { title : -1 } )
    const count = await CBT.count( { schoolId : req.user._id} ).exec();
    const session = await Session.find({ schoolId : req.user._id});
    const studentclass = await Currentclass.find( { schoolId : req.user._id } );
    await res.render('createTest', {
      user: req.user, 
      session, 
      studentclass,
      cbt,
      current: page,
      count,
      pages: Math.ceil(count / perPage) })
  } catch (err) {
    console.error(err);
    return res.render('error5', { title: "Internal Server Error." +" "+ err });
  }
}


const updateCBT = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCBT = await CBT.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedCBT) {
      return res.status(404).send({ message: `Cannot update CBT with ID: ${id}. Maybe CBT not found.` });
    }

    res.send(updatedCBT);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error updating CBT information: ${err.message}` });
  }
};


const deleteCBTs = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await CBT.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).send({ message: `Cannot delete CBT with ID ${id}. Maybe the ID is wrong.` });
    }

    res.send({ message: "Question was deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Could not delete CBT with ID ${id}. Error: ${err.message}` });
  }
};

const getGetCbtQuestion = async ( req , res) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');


    const id = req.params.id;
    const cbt = await CBT.findById(id).exec();

    if(!id) {
      return res.render('error404', { title: "Error 505. Page not found." });
    }

    const question = await Question.find( { testId : id }).exec()

    await res.render('cbt-question', {user: req.user, id, question, cbt})
  
  } catch (err) {
    console.error(err);
    return res.render('error5', { title: "Internal Server Error." +" "+ err });
  }
}


const createCbTest = async ( req , res ) => {
  try {
   
  const { title, description, duration, startTime, session, term, type, ca_pos, student_class } = req.body;
  const test = new CBT({ title, description, duration, startTime, session, term, type, ca_pos, student_class, schoolId : req.user._id });

  req.flash(
    "success_msg",
    "Test Registered Successfully!"
  );
  await test.save();
  res.redirect('/admin/create-cbt/1')

  } catch (err) {
    return res.render('error5', { title: "Internal Server Error."+" "+ err  });
  }
};

const createCbtQuestion = async (req, res) => {
  try {
    let { questionText, questionType, options, correctAnswer, instruction} = req.body;
    

    if (typeof options === 'string') {
      options = options.split(',').map(option => option.trim());
    }

    const question = new Question({ 
      questionText, 
      questionType, 
      options, 
      correctAnswer, 
      instruction,
      testId: req.params.testId 
    });
    
    await question.save();
  
    const test = await CBT.findById(req.params.testId);
    test.questions.push(question._id);
    req.flash("success_msg", "Question Registered Successfully!");
    await test.save();
    
    res.redirect(`/admin/get-questions-page/${req.params.testId}`);
  } catch (err) {
    console.error(err);
    return res.render('error5', { title: "Internal Server Error." + " " + err });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = req.body;

    if (typeof updateData.options === 'string') {
      updateData.options = updateData.options.split(',').map(option => option.trim());
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedQuestion) {
      return res.status(404).send({ message: `Cannot update question with ID: ${id}. Maybe question not found.` });
    }

    res.send(updatedQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Error updating question information: ${err.message}` });
  }
};

const getAllLearnerCbt = async (req, res) => {
  try {

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');


    const id = req.query.id;

    if (!id) {
      return res.status(400).render('error5', { title: "Bad Request: Missing learner ID." });
    }

    // Fetch submissions for the learner
    const submit = await Submission.find({ userId: id }).exec();

    // Fetch learner details
    const learner = await Learner.findById(id).exec();

    // Check if learner exists
    if (!learner) {
      return res.status(404).render('error5', { title: "Learner not found." });
    }

    // Render the template with the data
    await res.render('all-cbt-question', {
      user: req.user,
      learner,
      submit,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).render('error5', { title: "Internal Server Error: " + err.message });
  }
};

const deleteQuestions = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Question.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).send({ message: `Cannot delete question with ID ${id}. Maybe the ID is wrong.` });
    }

    res.send({ message: "Question was deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Could not delete question with ID ${id}. Error: ${err.message}` });
  }
};


//----------------------------school website----------------------------------------------\\

//creating Event

const createEvent = async (req, res) => {
  try {
    const { event_name, venue, dates, content } = req.body;
    const errors = [];

    // Validate form fields
    if (!event_name || !venue || !dates || !content) {
      errors.push({ msg: "Please fill in all fields" });
    }

    if (errors.length > 0) {
      const errorMessage = errors[0].msg;
      return res.status(400).json({ message: errorMessage });
    }

    const event = new Event({
      event_name,
      venue,
      dates,
      content,
      schoolId: req.user._id,
    });

    const savedEvent = await event.save();

    // Send redirect URL in JSON
    return res.status(201).json({
      message: 'Event created successfully!',
      redirectUrl: `/admin/update-event?eventId=${savedEvent._id}`,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};


//Get all Events
const getAllEvents = async ( req , res ) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
    
      var perPage = 9;
      var page = req.params.page || 1

      await Event.find( { schoolId : req.user._id } )
                 .select('venue event_name times dates content')
                 .sort( { createdAt : 1 } )
                 .skip( ( perPage * page ) - perPage )
                 .limit( perPage )
                 .exec( ( err , event ) => {
                  Event.count( { schoolId : req.user._id})
                       .exec( ( errOne , count ) => {
                        if( errOne ) throw new Error( errOne )
                        if ( err ) throw new Error(err) 
                          res.render('all_events', {
                            event: event,
                            user: req.user,
                            current: page,
                            pages: Math.ceil( count / perPage )
                        })
                       })
                 })

    
  } catch (err) {
    if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

  const editEventImage = async (req, res) => {
    try {
      // Use Multer middleware to process the uploaded file
      uploadEventImg(req, res, async () => {
        const id = req.params.id;
  
        // Find the event by ID
        const event = await Event.findById(id);
        if (!event) {
          req.flash('error_msg', 'Event not found');
          return res.redirect('/admin/update-event?eventId=' + id);
        }
  
        // Check if a file is provided
        if (!req.file) {
          req.flash('error_msg', 'No file provided');
          return res.redirect('/admin/update-event?eventId=' + id);
        }
  
        try {
          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);
  
          // Ensure the Cloudinary upload was successful
          if (!result || !result.secure_url) {
            req.flash('error_msg', 'Error uploading image to Cloudinary');
            return res.redirect('/admin/update-event?eventId=' + id);
          }
  
          // Update the `img` field in the event document
          event.img = {
            url: result.secure_url,
            publicId: result.public_id, // Save the public ID for future deletions
          };
  
          await event.save();
  
          req.flash('success_msg', 'Image uploaded successfully');
          return res.redirect('/admin/update-event?eventId=' + id);
        } catch (cloudinaryError) {
          console.error('Cloudinary Error:', cloudinaryError);
          req.flash('error_msg', 'An error occurred while uploading the image to Cloudinary');
          return res.redirect('/admin/update-event?eventId=' + id);
        }
      });
    } catch (error) {
      console.error('Server Error:', error);
      req.flash('error_msg', 'Internal Server Error');
      return res.redirect('/admin/update-event');
    }
  };
  
const editEventSecondImage = async (req, res) => {
  try {
    uploadEventImage(req, res, async (events) => {
      if (events) {
        const id = req.params.id;
        const user = await Event.findById(id);

        if (!user) {
          return res.status(404).json({ message: 'Event not found' });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file provided' });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        if (!result || !result.secure_url) {
          return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
        }

        user.pageImage = {
          url: result.secure_url,
          publicId: result.public_id, // Save the public ID if needed for future deletions
        };

        await user.save();

        return res.status(200).json({ message: 'Page image uploaded successfully' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
};


const getEditEventPage = async (req, res) => {
  if (req.query.eventId) { // Ensure the parameter name matches what you're using in redirection
    try {
      const id = req.query.eventId; // Use the correct parameter
      const event = await Event.findById(id); // Use async/await consistently

      if (!event) {
        return res
          .status(404)
          .send({ message: "Oops! Event not found" });
      }

      // Render the edit page with the event and user data
      res.render("edit_event", {
        event: event,
        user: req.user,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Internal server error", error });
    }
  } else {
    // Handle cases where the eventId query parameter is missing
    res
      .status(400)
      .send({ message: "Event ID not provided" });
  }
};


const editEvent = async ( req , res ) => {
  try {
      const {event_name, dates, content, times, venue} = req.body;
       const eventId = req.params.id;
       if (!eventId) {
        throw new TypeError("Invalid event ID");
      }
 
      const event = {
        event_name: event_name,
        venue: venue, 
        dates: dates, 
        content: content, 
    };
 
      const filter = { _id: eventId };
      const update = { $set: event };
      const options = { returnOriginal: false };
 
   const result = await Event.findOneAndUpdate(filter, update, options);
    
      if (!result) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      return res.json("Successfully updated Event");
    
   } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
        return res.status(400).json({ error: error.message });
      }
       console.log (error);
       return res.status(500).send();
   }
};

const deleteEvent = async ( req , res ) => {
  const id = req.params.id;
  await Event.findByIdAndDelete(id)
  .then((data) => {
    if (!data) {
      res
        .status(404)
        .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
    } else {
      res.send({
        message: "Data was deleted successfully!",
      });
    }
  })
  .catch((err) => {
    res.status(500).send({
      message: "Could not delete Data with id=" + id + "with err:" + err,
    });
  });
 
};

 // create BLOG
 const uploadMultipleBlogImage = async (req, res, next) => {
  try {
 
    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
  
  
    req.uploadResults = {
      imgResult,
      img2Result,
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};
// 

const createBlog = async ( req , res ) => {
  try {
      const { author, category, content, headline} = req.body;
      const errors = [];
     
      const {
       imgResult,
       img2Result,
     } = req.uploadResults;
   
      if (!author || !category || !content || !headline) {
          errors.push( { msg : "Please fill in all the fields."} )
      }
      if (errors.length > 0) {
          res.render('create_blog', {
             errors: errors,
             author: author,
             category: category, 
             content: content, 
             headline: headline, 
             user: req.user,
          })
      } else{
         
         const blog = {
             author: author,
             category: category, 
             content: content, 
             headline: headline, 
             schoolId: req.user._id,
             img: {},
             image: {},
         }
   
         
         if (req.files['img']) {
           blog.img = {
             url: imgResult.secure_url,
             publicId: imgResult.public_id,
           }
         }
         if (req.files['image']) {
           blog.image = {
             url: img2Result.secure_url,
             publicId: img2Result.public_id,
           }
         }
   
         Blog.create(blog)
         .then((data) => {
            
             req.flash("success_msg", "Data Registered !");
             res.redirect('/admin/add_blog');
         }).catch((err) => {
             console.log(err)
         }).catch((err) => console.log (err))
     }
  } catch (err) {
    if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  };

// get all Blog

const getAllBlogs = async ( req , res ) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');

      var perPage = 9;
      var page = req.params.page || 1
      await Blog.find( { schoolId: req.user._id } )
                .select('author content  category headline createdAt')
                .sort( { createdAt : 1 } )
                .skip( ( perPage * page ) - perPage )
                .limit( perPage )
                .exec( ( err, blog ) => {
                  Blog.count( { schoolId: req.user._id } )
                      .exec( ( errTwo , count ) => {
                        if( errTwo ) throw new Error( errTwo )
                          if( err ) throw new Error( err )
                          res.render('all_event', {
                              blog: blog,
                              user: req.user,
                              current: page,
                              pages: Math.ceil( count / perPage )
                        })
                      } )
                })
     
    
  } catch (err) {
    if(err) 
      console.log(err.message)
      res.status(500).send('Internal Server Error' + ' ' + err.message);
    }
  }


//Edit Blog
const editBlogImage = async ( req , res ) => {
  try {
      const blogId = req.params.id;

      if (!blogId) {
        throw new TypeError("Invalid blog ID");
      }

      const {
        imgResult,
        img2Result,
      } = req.uploadResults;
  
      const blog = {};
  
      if (req.files['img']) {
        blog.img = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        }
      }
      if (req.files['image']) {
        blog.image = {
          url: img2Result.secure_url,
          publicId: img2Result.public_id,
        }
      }
  
      const filter = { _id: blogId };
      const update = { $set: blog };
      const options = { returnOriginal: false };
  
      const results = await Blog.findOneAndUpdate(filter, update, options);
  
      if (!results) {
        return res.status(404).json({ error: "blog not found" });
      }
      req.flash("success_msg", "Images Uploaded");
      return res.redirect('/admin/update-blog?id=' + blogId);

  } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
        console.log(error);
        return res.status(500).send();
  }
};


const getEditBlogPage = async ( req , res ) => {
  if (req.query.id) {
      try {

        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
      
          const id = req.query.id;
         await Blog.findById(id)
                  .then((blog) => {
                      if (!blog) {
                          res
                          .status(404)
                          .send({ message: "Oop! Property not found" } )
                      }else {
                          res
                          .render(
                              "edit_blog", 
                              {
                                  blog: blog,
                                  user: req.user,
                              }
                              )
                      }
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
};


const editBlog = async ( req , res ) => {
  try {
      const {author, category, content, headline} = req.body;
       const blogId = req.params.id;
       if (!blogId) {
        throw new TypeError("Invalid blog ID");
      }
 
      const blog = {
        author: author,
        category: category, 
        content: content, 
        headline: headline, 
    };
 
      const filter = { _id: blogId };
      const update = { $set: blog };
      const options = { returnOriginal: false };
 
   const result = await Blog.findOneAndUpdate(filter, update, options);
    
      if (!result) {
        return res.status(404).json({ error: "Blog not found" });
      }
  
      return res.json("Successfully updated Blog");
    
   } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
        return res.status(400).json({ error: error.message });
      }
       console.log (error);
       return res.status(500).send();
   }
};

const deleteBlog = async ( req , res ) => {
  const id = req.params.id;
  await Blog.findByIdAndDelete(id)
  .then((data) => {
    if (!data) {
      res
        .status(404)
        .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
    } else {
      res.send({
        message: "Data was deleted successfully!",
      });
    }
  })
  .catch((err) => {
    res.status(500).send({
      message: "Could not delete Data with id=" + id + "with err:" + err,
    });
  });
 
}

// get create Events and Blog
const getAddEvent = async ( req , res) => {
  try {
   
    await res.render('add-event', { user : req.user} )
  } catch (err) {
      res.render('error404', {
        title: `${err}`
      })  
 
  };
  }

const getAddBlog = async ( req , res) => {
  try {
    await res.render('add-blog', { user : req.user } )
  } catch (err) {
    res.render('error404', {
      title: `${err}`
    })  
  }
}



module.exports = {
  //event
    createEvent,
    editEventImage,
    editEventSecondImage,
    getEditEventPage,
    editEvent,
    deleteEvent,
    getAllEvents,
    getAddEvent,
    //blog
    uploadMultipleBlogImage,
    getAllBlogs,
    createBlog,
    deleteBlog,
    editBlog,
    getEditBlogPage,
    editBlogImage,
    getAddBlog,
    //monitor admin
    registerLearner,
    getUpdateLearnerPage,
    updateLearner,
    deleteLearner,
    learnersStatus,
    learnersDetails,
    uploadLearnerImage,
    adminDashboardQuery,
    adminLogin,
    adminlogOut,
    voucherPrinting,
    getVoucherPage,
    getVoucherPaymentPage,
    payStackPayment,
    payStackCallBack,
    getHomePageLearenrReg,
    registerProprietorStatement, 
    getProprietorUpdatePage,
    updateProprietor,
    deleteProprietor,
    //staff
    editStaffImage,
    createStaff,
    getUpdateStaffUpdatePage,
    updateStaff,
    deleteStaff,
    staffStatus,
    staffDetails,
    allocateStaffClass, 
    disallocateStaffClass,
    createStaffStatement,
    getUpdateStatementPage,
    updateStaffState,
    deleteStaffState,
    getSchoolUpdatePage,
    updateSchool,
    getSchoolDetail,
    uploadSchoolLogo,
    addSession,
    getUpdateSesstionpPage,
    updateSession,
    deleteSession,
    addSection,
    getUpdateSectionPage,
    updateSection,
    deleteSection,
    addThirdTermSection,
    getUpdateThirdSectionPage,
    updateThirdSection,
    deleteThirdSection,
    addSubject,
    getUpdateSubjectPage,
    updateSubject,
    deleteSubject,
    addClass,
    getUpdateClassPage,
    updateClass,
    deleteClass,
    schoolStatus,
    manageAll,
    createStaffPage,
    createProprietorPage,
    getAllStaffs,
    getCreateStaffStatePage, 
    getCreateClassPage,
    getCreateSubjectPage,
    getCreateSessionPage,
    getCreateSectionPage,
    getPaymentErrorPage,
    getAllSession,
    getAllSection,
    getAllThirdSecton,
    getAllLearner,
    getAllSubject,
    getAllClasses,
    LearnersReport,
    getAlumniPage,
    oldLearnersStautusUpdate,
    promoteSingleLearner,
    promoteAllLearner,
    getPromotePage,
    checkResultFirstAndSecond,
    getFirstAndSecondResult,
    getThirdResult,
    chseckThirdTermResult,
    onPrintAtti,
    getCreateTestForCbt,
    createCbTest,
    getGetCbtQuestion,
    createCbtQuestion,
    updateQuestion,
    deleteQuestions,
    updateCBT,
    deleteCBTs,
    getAllLearnerCbt,
    getSearchPage,
    searchLearners,
    
}


