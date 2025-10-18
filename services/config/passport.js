// passport-config.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Learner = require("../models/leaners");
const School = require("../models/school.name");
const Staff = require('../models/staff');


module.exports = (passport) => {

  passport.use('learner-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await Learner.findOne({ email, deletes: false });
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.use('admin-login', new LocalStrategy({
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
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.use('staff-login', new LocalStrategy({
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
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, staff);
    } catch (error) {
      return done(error);
    }
  }));

   passport.use('cbt-login', new LocalStrategy({
    usernameField: 'roll_no',
    passwordField: 'first_name'
  }, async (roll_no, first_name, done) => {
    try {
      const cbtlearner = await Learner.findOne({ roll_no, status:true, deletes: false });
      if (!cbtlearner) {
        return done(null, false, { message: 'Incorrect admin_no or first_name.' });
      }
      const isValid = await Learner.findOne({ first_name, status:true, deletes: false });
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, cbtlearner);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Learner.findById(id);
      if (user) {
        done(null, user);
        return;
      }
      const admin = await School.findById(id);
      if (admin) {
        done(null, admin);
        return;
      }
      const staff = await Staff.findById(id);
      if (staff) {
        done(null, staff);
        return;
      }
       const cbtlearner = await Learner.findById(id);
       if (cbtlearner) {
        done(null, cbtlearner);
        return;
      }
      done(new Error('User not found.'));
    } catch (error) {
      done(error);
    }
  });
}


