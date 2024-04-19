
const express = require('express');
const learnerRouter = express.Router();
const { learnerEnsureLoggedIn } = require('../middleware/authentication')

const {
  studentLogin,
  studentProfile,
  learnerLogout,
  learnerCheckResultFirstSecondTerm,
  checkThirdTermResult,
  changePassword,
  getEditLearnerPassword
} = require('../controller/learner');


learnerRouter.route('/login').post( studentLogin );
learnerRouter.route('/student-profile').get( learnerEnsureLoggedIn, studentProfile );
learnerRouter.route('/logout').post( learnerLogout );
learnerRouter.route('/check_result').get( learnerEnsureLoggedIn, learnerCheckResultFirstSecondTerm );
learnerRouter.route('/check_results').get( learnerEnsureLoggedIn, checkThirdTermResult );
learnerRouter.route('/change-password').post( learnerEnsureLoggedIn, changePassword );
learnerRouter.route('/edit-profile').get( learnerEnsureLoggedIn, getEditLearnerPassword );











module.exports = learnerRouter;