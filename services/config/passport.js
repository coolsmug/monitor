const passport = require('passport');
const LearnerStrategy = require('passport-local').Strategy;
const AdminStrategy = require('passport-local').Strategy;
const StaffStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Learner = require("../models/leaners");
const School = require("../models/school.name")
const Staff = require('../models/staff')

module.exports = function (passport) {
  passport.use('learner-login', new LearnerStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await Learner.findOne({ email });
  
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      const isValid = await bcrypt.compare(password, user.password);
  
      if (!isValid) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.use('admin-login', new AdminStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const admin = await School.findOne({ email });
  
      if (!admin) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      const isValid = await bcrypt.compare(password, admin.password);
  
      if (!isValid) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.use('staff-login', new StaffStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const staff = await Staff.findOne({ email });
  
      if (!staff) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      const isValid = await bcrypt.compare(password, staff.password);
  
      if (!isValid) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
  
      return done(null, staff);
    } catch (error) {
      return done(error);
    }
  }
  )
  )

  passport.serializeUser((user, done) => {
      done(null, user.id);
  });

  
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Learner.findById(id);
    const admin = await School.findById(id);
    const staff = await Staff.findById(id);

    if (user) {
      done(null, user);
    } else if (admin) {
      done(null, admin);
    } else if (staff) {
      done(null, staff);
    } else {
      done(new Error('User not found.'));
    }
  } catch (error) {
    done(error);
  }
});
}