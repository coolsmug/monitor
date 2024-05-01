const express = require('express');
const homepageRoute = express.Router();


const {
  getMonitorHomePage,
  getStateCoutryName,
  getCitiesCountryStateName,
  submitSchoolReg,
  getRegistrationTwo,
  postRegistrationTwo,
  getRegistrationThree,
  postRegistrationThree,
  getLoginPage,
  logOuts,
  getForgetPasswordPAge,
  getRecoverPasswordPage,
  resetPassword,
  recoverGmailPassword,
  emailVerification,
  verifyEmailWithCode,
} = require('../controller/index');

homepageRoute.route('/monitor').get(getMonitorHomePage)
homepageRoute.route('/states/:countryName').get(getStateCoutryName)
homepageRoute.route('/cities/:countryName/:stateName').get(getCitiesCountryStateName)
homepageRoute.route('/submit').post(submitSchoolReg)
homepageRoute.route('/registration-step2').get(getRegistrationTwo)
homepageRoute.route('/monitor-step2-registration').post(postRegistrationTwo)
homepageRoute.route('/registration-step3').get(getRegistrationThree)
homepageRoute.route('/step3').post(postRegistrationThree)
homepageRoute.route('/').get(getLoginPage)
homepageRoute.route('/forget-password').get( getForgetPasswordPAge)
homepageRoute.route('/recover-password').get(getRecoverPasswordPage)
homepageRoute.route('/get-code').post(resetPassword)
homepageRoute.route('/recover-gmail-password').post(recoverGmailPassword)
homepageRoute.route('/go-verify').get(emailVerification)
homepageRoute.route('/verify-email').post(verifyEmailWithCode)








module.exports = homepageRoute;
 





// staff logni--------------------------------



