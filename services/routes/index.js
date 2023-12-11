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
      res.redirect('/learner/student-profile');     
    }



router.get('/', forwardAuthenticated, (req, res) => {
    res.render('login')
} )

router.get('/home-page', ensureAuthenticated ,(req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
    console.log(req);
  res.render('home', { user: req.user})
})

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
  const countries = Country.getAllCountries()
  // Render the form with the list of countries
  await res.render('monitor-home-page', { countries });
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

                const schoolId = `${numerCode}/${alphaCode}-${year}`

                const { school_name, country, state, city, address, 
                  address2, phone_no, phone_no2, email, password, password_2, website} = req.body;
                  let errors = [];
                  if(!school_name || !country || !state || !city || !address || !address2 || !phone_no || !phone_no2 || !email || !password || !password_2 || !website){
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
                      school_name: school_name, 
                      country: country, 
                      state: state,
                      city: city,
                      address: address, 
                      address2: address2, 
                      phone_no: phone_no, 
                      phone_no2: phone_no2, 
                      email: email, 
                      password: password, 
                      password_2: password, 
                      website: website,
                      countries

                    })
                  } else {
                    await School.findOne({email: email}).exec((err, school) => {
                      if(school) {
                        errors.push ( { msg: "Oops! User already associated with this Email" });
                            const countries = Country.getAllCountries()
                        res.render("monitor-home-page", {
                          errors: errors,
                          school_name: school_name, 
                          country: country, 
                          state: state, 
                          city: city,
                          address: address, 
                          address2: address2, 
                          phone_no: phone_no, 
                          phone_no2: phone_no2, 
                          email: email, 
                          password: password, 
                          password_2: password, 
                          website: website,
                          countries

                        })
                      } else {
                        const currentDate = new Date();
                        var fourteen = new Date(currentDate.getTime() + (100 * 24 * 60 * 60 * 1000));
                        const newSchool = new School({
                          school_id: schoolId,
                          school_name: school_name, 
                          country: country, 
                          state: state, 
                          city: city,
                          address: address, 
                          address2: address2, 
                          phone_no: phone_no,
                          phone_no2: phone_no2,
                          email: email, 
                          password: password, 
                          website: website,
                          expiry: fourteen,
                        });

                        bcrypt.genSalt(10, (err, salt)=> {
                          bcrypt.hash(newSchool.password, salt,
                            (err, hash) => {
                              if(err) throw err;

                              newSchool.password = hash;

                              newSchool
                                  .save()
                                  .then((value) => {
                                    req.flash(
                                      "success_msg",
                                      `Successfully Registered,
                                      ${newSchool.school_id } 
                                      is your ID,
                                      copy it before clicking OK.
                                      You have only ${fourteen} days trial`
                                    
                                    )
                                    res.redirect('/monitor')
                                  })
                                  .catch( value => console.log(value))
                            })
                        })
                      }
                    })
                  }


}})



module.exports = router