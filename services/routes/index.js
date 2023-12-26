const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;

const { session } = require("passport");
const axios = require('axios');
const fetch = require('node-fetch');
let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;
const School = require("../models/school.name");


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
    
    const forwardAuthenticated = function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/home-page');  
    }



router.get('/', async(req, res) => {
   await res.render('login')
} )

router.get('/home-page', ensureAuthenticated ,(req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache'); 
  
  res.render('home', { user: req.user})
});


// staff logni--------------------------------

router.post("/staff_login", forwardAuthenticated, (req, res, next) => {
  passport.authenticate("staff-login", (err, user, info)=> {
    if (err) {
     return next(err) 
    } else{
      if(user) {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
        
          req.flash('success_msg', 'You are welcome'+ req.user.first_name);
          res.redirect("/home-page");
          
        });
       
      }
      if (!user) {
        req.logOut(function (err) {
          if (err) {
              return next(err);
          }
          req.flash('success_msg', 'Your session terminated and Access Denied');
          res.redirect('/')
      })
      }
    }
  
    req.flash('success_msg', 'You are welcome');
  })(req, res, next);
});

router.post('/logout',  ensureAuthenticated, (req, res, next) => {
  req.logOut(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success_msg', 'Your Session Terminated, see you next time');
      res.redirect('/')
  });
   

});

State.getStatesOfCountryByName = function(countryName) {
  // Find the country object by name
  const country = Country.getAllCountries().find(c => c.name === countryName);
  if (country) {
    // Get the states of the country by passing the country isoCode
    return this.getStatesOfCountry(country.isoCode);
  }
  return [];
};

City.getCitiesOfStateByName = function(countryName, stateName) {
  const country = Country.getAllCountries().find(c => c.name === countryName);
  if (country) {
    const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === stateName);
    if (state) {
      return this.getCitiesOfState(country.isoCode, state.isoCode);
    }
  }
  return [];
};



router.get('/monitor', async(req, res) => {
 
  // Render the form with the list of countries

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let alphaCode = '';
                for (let i = 0; i < 2; i++) {
                  alphaCode += alpha.charAt(Math.floor(Math.random() * alpha.length));
                }

                const numer = "12345678901234567890123456789012345678901234567890123456789012345678901234567890";
                let numerCode = '';
                for (let i = 0; i < 3; i++) {
                  numerCode += numer.charAt(Math.floor(Math.random() * numer.length));
                }

                var day = new Date();
                var year = day.getFullYear();

                const schoolId = `MON${numerCode}/${alphaCode}-${year}`

  await res.render('monitor-home-page', { schoolId });
})

router.get('/states/:countryName', async(req, res) => {
          const countryName = req.params.countryName;
          const states = State.getStatesOfCountryByName(countryName);
          await res.json(states); 
});

router.get('/cities/:countryName/:stateName', (req, res) => {
        const countryName = req.params.countryName;
        const stateName = req.params.stateName;
        const cities = City.getCitiesOfStateByName(countryName, stateName);
        res.json(cities);
});
// 08089413851

// Route handler for submitting the form
router.post('/submit', async(req, res) => {{
                
                const {school_id, school_name, email, password, password_2} = req.body;
                  let errors = [];

                  if(!school_id || !school_name || !email || !password || !password_2){
                    errors.push( { msg: "Please fill in all fields" } )
                  }

                  if(password !== password_2) {
                    errors.push( { msg : "Password dont macth" } )
                    }
                  if (password.length < 8) {
                    errors.push({ msg: "password atleast 8 character" });
                  }

                  if(errors.length > 0){
                    const countries = Country.getAllCountries()
                    res.render("monitor-home-page", {
                      errors: errors,
                      school_id: school_id,
                      school_name: school_name,
                      email: email, 
                      password: password, 
                      password_2: password, 
                    })
                  } else {
                    await School.findOne({email: email}).exec((err, school) => {
                      if(school) {
                        errors.push ( { msg: "Oops! User already associated with this Email" });
                            
                        res.render("monitor-home-page", {
                          errors: errors,
                          school_id: school_id,
                          school_name: school_name,
                          email: email, 
                          password: password, 
                          password_2: password, 

                        })
                      } else {
                        const currentDate = new Date();
                        var fourteen = new Date(currentDate.getTime() + (100 * 24 * 60 * 60 * 1000));
                        const newSchool = new School({
                          school_id: school_id,
                          school_name: school_name,
                          email: email, 
                          password: password,
                          expiry: fourteen,
                          
                          
                        });

                        bcrypt.genSalt(10, (err, salt)=> {
                          bcrypt.hash(newSchool.password, salt,
                            (err, hash) => {
                              if(err) throw err;

                              newSchool.password = hash;

                              newSchool
                                  .save()
                                  .then((savedUser) => {
                                    req.flash(
                                      "success_msg",
                                      `Successfully Registered,
                                      ${savedUser.school_id } 
                                      is your ID,
                                      copy it before clicking OK.
                                      You have only ${fourteen} days trial`
                                    
                                    )
                                    res.redirect(`/registration-step2?userId=${savedUser._id}`)
                                  })
                                  .catch( error => console.log(error))
                            })
                        })
                      }
                    })
                  }


}})


router.get('/registration-step2', async (req, res) => {
  try {
    const countries = Country.getAllCountries()
      const userId = req.query.userId
      await res.render("registerTwo", {userId, countries} )
  } catch (error) {
      console.log(error)
  }
})

router.post('/monitor-step2-registration', async (req, res) => {
  const userId = req.body.userId || req.query.userId;

  try {
    
      const updatedUser = await School.findByIdAndUpdate(
          userId,
          {
            school_motto: req.body.school_motto,
            country: req.body.country, 
            state: req.body.state, 
            city: req.body.city,
            
          },
          { new: true } // To return the updated document
      );

      if (!updatedUser) {
          // Handle the case where the user with the given ID was not found
          return res.redirect(`/registration-step2?error=true&userId=${userId}`);
      }

      res.redirect(`/registration-step3?userId=${userId}`);
  } catch (error) {
      console.error(error);
      res.redirect(`/registration-step2?error=true&userId=${userId}`);
  }
});

router.get('/registration-step3', (req, res) => {
  const userId = req.query.userId;
  res.render('registrationThree', { userId });
});

router.post('/step3', async (req, res) => {
  const userId = req.body.userId || req.query.userId;

  try {
      const updatedUser = await School.findByIdAndUpdate(
          userId,
          {
            address: req.body.address, 
            address2: req.body.address2, 
            phone_no: req.body.phone_no,
            phone_no2: req.body.phone_no2,
            website: req.body.website,
          },
          { new: true } // To return the updated document
      );

      if (!updatedUser) {
          // Handle the case where the user with the given ID was not found
          res.redirect(`/registration-step3?error=true&userId=${userId}`);
      }

      res.redirect(`/admin/admin_dashboard`);
  } catch (error) {
      console.error(error);
      res.redirect(`/registration-step3?error=true&userId=${userId}`);
  }
});



module.exports = router