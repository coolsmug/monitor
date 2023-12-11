if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express");
const router = express.Router();
const Learner = require("../models/leaners");
const Session = require("../models/session");
const Section = require("../models/section");
const Subject = require("../models/subject");
const passport = require('passport');
const { session } = require("passport");
const Currentclass = require('../models/current_class');
const Staff = require('../models/staff.js');
const ThirdSection = require('../models/third._term_section')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Voucher = require("../models/token");
const VoucherPayment = require("../models/voucher_payment.js")
// const request = require('request');
const PAYSTACK = process.env.PAYSTACK_SECRET_KEY
const paystack = require('paystack')(PAYSTACK);
const Agenda = require('agenda');


   /**
     * Ensuring authentication
     */
   const ensureAuthenticated = function(req, res, next) {
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
    res.redirect('/admin/admin_dashboard');     
  }



  router.post("/admin_login", forwardAuthenticateds, (req, res, next) => {
    passport.authenticate('admin-login', (err, admin, info) => {
      if (err) {
        return next(err);
      }
      if (!admin) {
        req.flash('error_msg', "wrong info")
        return res.redirect('/admin/admin_dashboard');

      }
      // Checking if user has not paid and trial session is still active
      if (admin.fees === "pending" && admin.expiry > Date.now()) {
        req.logIn(admin, function(err) {
          if (err) {
            return next(err);
          }
          req.flash('success_msg', 'You are welcome');
          return res.redirect('/admin/admin_dashboard');
        });
      } else if (admin.fees === "pending" && admin.expiry < Date.now()) {
        // Trial session has expired, log out the user
        req.logout((err) => {
          if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Your trial session has ended. Please subscribe using this page');
        res.redirect('/monitor')
        });
       
       
      } else if (admin.fees === "paid") {
        // User has paid, log in the user
        req.logIn(admin, function(err) {
          if (err) {
            return next(err);
          }
          req.flash('success_msg', 'You are welcome');
          return res.redirect('/admin/admin_dashboard');
        });
      } else {
        // Invalid fee status, redirect to homepage
        req.flash('success_msg', "Invalid fees status")
        return res.redirect('/');
        
      }
    })(req, res, next);
  });
  
  

router.post('/logout',  ensureAuthenticated, (req, res, next) => {
  req.logOut(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success_msg', 'Session Terminated');
      res.redirect('/')
  })
   

})

router.get("/admin_dashboard", ensureAuthenticated, (req, res) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');

  Learner.countDocuments({ schoolId: req.user._id, status: true }, (errOne, learnerCount) => {
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

            Staff.countDocuments({ schoolId: req.user._id }, (errSix, staffCount) => {
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
});


// creating Voucher for result checking ----------------------------------------------------- //


router.post("/create-voucher", ensureAuthenticated, async(req, res) => {
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
          var perPage = 6
          var page = req.params.page || 1
            Voucher.find( { used: false, schoolId: req.user._id } )
                          .skip((perPage * page) - perPage)
                          .limit(perPage)
                          .exec((err, vouch) => {
                            Voucher.count({used: false, schoolId: req.user._id}).exec((errOne, count) => {
                                if(errOne) throw new Error(err)
                                if(err) throw new Error(err)
                                res.render('get_token', {
                                  errors: errors,
                                  pin: pin,
                                  vouch : vouch,
                                  current: page,
                                  pages: Math.ceil(count / perPage)
                                })
                            })
                           
                          })
        }else{
          await VoucherPayment.findOne( { pin : pin } ).exec((err, pins) => {
            if (err) {console.log (err); return; }
            if(pins) {
                  if ( pins.used == true ) {
                    errors.push( { msg : `This PIN: "${pins.pin}" has been used, kindly pay for a new PIN` })
                    var perPage = 6
                    var page = req.params.page || 1
                       Voucher.find( { used: false, schoolId: req.user._id } )
                                    .skip((perPage * page) - perPage)
                                    .limit(perPage)
                                    .exec((err, vouch) => {
                                      Voucher.count({used: false}).exec((errOne, count) => {
                                          if(errOne) throw new Error(err)
                                          if(err) throw new Error(err)
                                          res.render('get_token', {
                                            errors: errors,
                                            pin: pin,
                                            vouch : vouch,
                                            current: page,
                                            pages: Math.ceil(count / perPage)
                                          })
                                      })
                                     
                                    })
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
                          var fourteen = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                          var codes = txt
                          const serial = `MON${codes}${year}`;
                        
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
                                  var fourteen = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                                  var codes = txt
                                  const serial = `MON${codes}${year}`;
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
                                
                                  
                                } else if(!code) {
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
              errors.push( { msg : `This PIN : ${pin} you provided is Invalid` })
              var perPage = 6
              var page = req.params.page || 1
                 Voucher.find( { used: false, schoolId: req.user._id } )
                              .skip((perPage * page) - perPage)
                              .limit(perPage)
                              .exec((err, vouch) => {
                                Voucher.count({used: false}).exec((errOne, count) => {
                                    if(errOne) throw new Error(err)
                                    if(err) throw new Error(err)
                                    res.render('get_token', {
                                      errors: errors,
                                      pin: pin,
                                      vouch : vouch,
                                      current: page,
                                      pages: Math.ceil(count / perPage)
                                    })
                                })
                               
                              })
            }

          })
        }

      
        
      } catch (err) {
        if(err) console.log (err.message)
      }
})

// ---------GET voucher_-------------------------//

router.get('/get-gen-voucher/:page', ensureAuthenticated, async(req, res) => {
  try {
    var perPage = 6
    var page = req.params.page || 1
      await Voucher.find( { used: false, schoolId: req.user._id } )
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .exec((err, vouch) => {
                      Voucher.count({used: false}).exec((errOne, count) => {
                          if(errOne) throw new Error(err)
                          if(err) throw new Error(err)
                          res.render('get_token', {
                            vouch : vouch,
                            current: page,
                            pages: Math.ceil(count / perPage)
                          })
                      })
                     
                    })
  } catch (err) {
    console.log(err.message)
  }
})

// -------------------------Implementing PayStack Gateway----------------------------//
router.get('/voucher-payment',ensureAuthenticated, async(req, res) => {
  await res.render('payment', {user: req.user})
})
router.post('/pay', ensureAuthenticated,
 async (req, res) => {
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
        callback_url: " https://0a4b-102-89-47-136.ngrok-free.app/admin/callback",
      });
      res.redirect(payment.data.authorization_url);
    }
   
  } catch (error) {
    console.log(error);
    res.redirect('/admin/error');
  }
});

router.get('/error', function(req, res) {
  res.render("success", {title: 'An error occurred while processing your payment'});
});

      // ------------------Callback payment --------------------------//

router.get('/callback', ensureAuthenticated, async (req, res) => {
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
      });


// ----------------------------Side bar routes------------------------------------//

router.get('/create-currentclass',ensureAuthenticated, async(req, res) => {
   await res.render("create_currentclass", {user: req.user})
})

router.get("/create-subject",ensureAuthenticated, async(req, res) => {
   await res.render('create_subject', {user: req.user})
})
 


router.get("/create-session", ensureAuthenticated, async(req, res) => {
  await res.render('create_session', {user: req.user})
})

router.get("/create-section", ensureAuthenticated, async(req, res) => {
  await res.render('create_section', {user: req.user})
})

router.get("/create-class", ensureAuthenticated, async(req, res) => {
  await res.render('create_class', {user: req.user})
})


router.get("/create-learner",ensureAuthenticated, async(req, res) => {

    await Currentclass
            .find({schoolId: req.user._id} )
            .select("name class_code arm")
            .exec((err, current) => {
              if(err) throw new Error(err)
              res.render('create_learners', {
                current: current,
                user: req.user,
              })
            
            })

 
   
})
 
// _____________________________________________________update session delete, al-view==========================??//

router.get("/all-session/:page",ensureAuthenticated, async (req, res, next) => {
           
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
 
})

router.get("/update-session", ensureAuthenticated, (req, res) => {
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
});

router.put('/update-session/:id',ensureAuthenticated, (req, res) => {
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
});


router.delete("/deletes/:id", async(req, res) => {
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
   
});


// *******************************update session delete view all ended ____________________________________________

//-------------------------------------------Section started-------------------------------------------------------------//
router.get("/all-section/:page", ensureAuthenticated, (req, res) => {

 var perPage = 9
    var page = req.params.page || 1

    Section
        .find({ schoolId: req.user._id})
        .select("roll_no name date_started date_ended datenow classof")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, section) {
            Section.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('all_sections', {
                    section: section,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })

});

//----------------------------------------------------all third term----------------------------------------------//

router.get("/all-thirdsection/:page", ensureAuthenticated, (req, res) => {

  var perPage = 9
     var page = req.params.page || 1
 
   ThirdSection
         .find({ schoolId: req.user._id})
         .select("roll_no name date_started date_ended datenow classof")
         .skip((perPage * page) - perPage)
         .sort({roll_no : 1})
         .limit(perPage)
         .exec(function(err, third) {
            ThirdSection.count().exec(function(err, count) {
                 if (err) return next(err)
                 res.render('all_thirdterm', {
                     third: third,
                     current: page,
                     pages: Math.ceil(count / perPage),
                     user: req.user,
                 })
             })
         })
 
 });

//-------------------------------------------------------update section--------------------------------//

router.get("/update-section", ensureAuthenticated, (req, res) => {
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
});

router.put('/update-section/:id', ensureAuthenticated, (req, res) => {

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
  
});

router.delete("/deleted/:id", async(req, res) => {
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
});
//------------------------------------update third term-----------------------------------------//
router.get("/update-third", ensureAuthenticated, (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    ThirdSection.findById(id)
      .then((section) => {
        if (!section) {
           res.status(404).send({ message: "Section not found" });
        } else {
          res.render("edit_section", { section : section, user: req.user});
        }
      })
      .catch((err) => {
        res.send(500).send({ message: "Error retrieving Session id" });
      });
  }
});

router.put('/update-third/:id', ensureAuthenticated, (req, res) => {

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
  
});

router.delete("/deletedthird/:id", async(req, res) => {
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
});

// ++++++++++++++++++++Section Update delete all All _____________ end here++++++++++++++++++++=//


// ***********************************************route to get edit update delete learners*****************************

router.get('/all-learner/:page', ensureAuthenticated, async(req, res, next) => {
   
    var perPage = 9
    var page = req.params.page || 1

    await Learner
        .find({ status : true,  schoolId: req.user._id })
        .select("roll_no classes arm first_name last_name gender status img date_enrolled date_ended class_code ")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err,learner) {
            Learner.count().exec(function(err, count) {
                if (err) return next(err)
                console.log(req.user)
                res.render('all_learners', {
                    learner: learner,
                    user: req.user,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
                
            })
        })
    
})

router.get("/update-learner", ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    await Learner.findById(id)
      .then((user) => {
        if (!user) {
          res.status(404).send({ message: "user not found" });
        } else {
          res.render("edit_learner", { user : user , users: req.user});
        }
      })
      .catch((err) => {
        res.send(500).send({ message: "Error retrieving User id" });
      });
  }
});

router.get("/delete/:id", async(req, res) => {
  const id = req.params.id;
    await Learner.findByIdAndDelete(id)
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
    
});

router.post("/update-learner/:id", ensureAuthenticated, async(req, res) => {
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
                            user.classes = req.body.classes; 
                            user.arm = req.body.arm; 
                            user.first_name = req.body.first_name; 
                            user.last_name = req.body.last_name; 
                            user.middle_name =  req.body.middle_name;
                            user.email = req.body.email;
                            user.gender = req.body.gender; 
                            user.age = req.body.age; 
                            user.parent_number =  req.body.parent_number;
                            user.dob =  req.body.dob; 
                            user.class_code = req.body.class_code; 
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
                                  res.json("Miscellaneous Updated...");
                                })
                                .catch((err) => res.status(400).json("Error:" + err));
                          }).catch((err) => {
                            res.status(400).json("Error: " + err);
                          });
                        
  
});


// const agenda = new Agenda();

// agenda.define('increment age', async (job) => {
//     // const { userId } = job.attrs.data;
//     const user = await User.find();
//     user.age += 1;
//     await user.save();
// });

// agenda.every('1 year', 'increment age');
// agenda.start();


router.get('/learner-detail', async(req, res) => {
  if(req.query.id) {
    const id = req.query.id;

   await Learner.findById(id).exec((err, user) => {
      if(err) throw new Error(err)
        //  res.status(404).send({ message: "User not found" });
          res.render('learner_detail', { 
            user : user,
          });
       
       
      
    })
  }
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


router.get('/create-section' ,ensureAuthenticated, (req, res) => {
  if(req.query.id) {
    const id = req.query.id;
    Session.findById(id).exec((err, user) => {
      if(!session) {
         res.status(404).send({ message: "Section not found" });
      }else {
        res.render('create_section', { session : session, user: req.user});
      }
    })
  }
})

// ***********************************************route to get edit update delete learners Ends*****************************

router.get("/all-subject/:page", ensureAuthenticated, async(req, res, next) => {
           

   var perPage = 9
    var page = req.params.page || 1

    await Subject
        .find({ schoolId: req.user._id})
        .select("roll_no name category")
        .skip((perPage * page) - perPage)
        .sort({roll_no : 1})
        .limit(perPage)
        .exec(function(err, subject) {
            Subject.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('all_subjects', {
                    subject: subject,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    user: req.user,
                })
            })
        })
 
})

router.get("/update-subject", ensureAuthenticated, (req, res) => {
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
});

router.put('/update-subject/:id', ensureAuthenticated, (req, res) => {
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
});


router.delete("/delete-subject/:id", async(req, res) => {
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
   
});

// *******************************************************Current class Update, Delete, edit*******************//

router.get("/all-currentclass/:page",ensureAuthenticated, async(req, res, next) => {  
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

})

router.get("/update-currentclass",ensureAuthenticated, (req, res) => {
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
});

router.put("/update-currentclass/:id", ensureAuthenticated, (req, res) => {
 
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

})

router.delete("/delete_currentclass/:id", async(req, res) => {
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
    
});



module.exports = router;
