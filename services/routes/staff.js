
const express = require('express');
const staffRoute = express.Router();
const { staffEnsureLoggedIn } = require('../middleware/authentication');


const {
    getSessionForstaff,
    getClassForstaff,
    getLearnerExamForstaff,
    getSectionTextExam,
    createExam,
    updateExam,
    deleteExam,
    getExamSpace,
    getMiscellaneous,
    getError,
    registerMiscell,
    updateMiscellaneous,
    getLearnerResultEdit,
    staffLogin,
    getStaffdashboard,
    registerThirdTermExam,
    updateThirdTermExam,
    getThirdTermExam,
    deleteThirdTermExam,
    getThirdTermMisc,
    stafflogOut,
    registerPosition,
    updatePosition,
    updateLearnerPosition,
} = require('../controller/staff');


staffRoute.route('/sessions/:page').get( staffEnsureLoggedIn, getSessionForstaff );
staffRoute.route('/current_class').get( staffEnsureLoggedIn, getClassForstaff );
staffRoute.route('/learner-test-exam/:page').get( staffEnsureLoggedIn, getLearnerExamForstaff );
staffRoute.route('/section-test-exam').get( staffEnsureLoggedIn, getSectionTextExam );
staffRoute.route('/register_exam').post( staffEnsureLoggedIn, createExam );
staffRoute.route('/update-exam/:id').post( staffEnsureLoggedIn, updateExam );
staffRoute.route('/deleteds/:id').delete( staffEnsureLoggedIn, deleteExam );
staffRoute.route('/exam-pace').get( staffEnsureLoggedIn, getExamSpace );
staffRoute.route('/miscellaneous-pace').get( staffEnsureLoggedIn, getMiscellaneous );
staffRoute.route('/error').get(getError);
staffRoute.route('/register_miscellaneous').post( staffEnsureLoggedIn, registerMiscell );
staffRoute.route('/update_miscellaneous/:id').post( staffEnsureLoggedIn, updateMiscellaneous );
staffRoute.route('/classes').get( staffEnsureLoggedIn, getLearnerResultEdit );
staffRoute.route('/staff_login').post( staffLogin );
staffRoute.route('/staff-route').get( staffEnsureLoggedIn, getStaffdashboard );
staffRoute.route('/register_exams').post( staffEnsureLoggedIn, registerThirdTermExam );
staffRoute.route('/update-exams/:id').post( staffEnsureLoggedIn, updateThirdTermExam );
staffRoute.route('/exam-pace-third').get( staffEnsureLoggedIn, getThirdTermExam );
staffRoute.route('/deletedss/:id').delete( staffEnsureLoggedIn, deleteThirdTermExam, );
staffRoute.route('/miscellaneous-pace').get( staffEnsureLoggedIn, getThirdTermMisc);
staffRoute.route('/logout').post( stafflogOut );
staffRoute.route('/register-position').post( staffEnsureLoggedIn, registerPosition );
staffRoute.route('/update-position/:id').put( staffEnsureLoggedIn, updatePosition);
staffRoute.route('/update-learner-position').get( staffEnsureLoggedIn, updateLearnerPosition);




module.exports = staffRoute;

