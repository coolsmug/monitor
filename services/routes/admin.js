const express = require('express');
const adminRoute = express.Router();




const { adminEnsureLoggedIn } = require('../middleware/authentication');

const {
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
} = require("../controller/admin");

adminRoute.route('/registerLearner').post( adminEnsureLoggedIn, registerLearner);
adminRoute.route('/update-learner').get(adminEnsureLoggedIn, getUpdateLearnerPage);
adminRoute.route('/update-learner/:id').post(adminEnsureLoggedIn, updateLearner);       
adminRoute.route('/delete-learner/:id').patch( adminEnsureLoggedIn, deleteLearner);
adminRoute.route('/user-status/:id').patch(adminEnsureLoggedIn, learnersStatus);
adminRoute.route('/learner-detail').get(adminEnsureLoggedIn, learnersDetails);
adminRoute.route('/upload-image/:id').post(adminEnsureLoggedIn, uploadLearnerImage);
adminRoute.route('/admin_dashboard').get(adminEnsureLoggedIn, adminDashboardQuery);
adminRoute.route('/learners-cbt').get(adminEnsureLoggedIn, getAllLearnerCbt);

adminRoute.route('/admin_login').post(adminLogin);
adminRoute.route('/logout').post(adminlogOut);
adminRoute.route('/create-voucher').post(adminEnsureLoggedIn, voucherPrinting);
adminRoute.route('/get-gen-voucher/:page').get(adminEnsureLoggedIn, getVoucherPage);
adminRoute.route('/voucher-payment').get(adminEnsureLoggedIn, getVoucherPaymentPage);
adminRoute.route('/pay').post(adminEnsureLoggedIn, payStackPayment);
adminRoute.route('/callback').get(adminEnsureLoggedIn, payStackCallBack);
adminRoute.route('/create-learner').get(adminEnsureLoggedIn, getHomePageLearenrReg);
adminRoute.route('/add_proprietor').post(adminEnsureLoggedIn, registerProprietorStatement);
adminRoute.route('/update-proprietor').get(adminEnsureLoggedIn, getProprietorUpdatePage);
adminRoute.route('/update-proprietor/:id').put(adminEnsureLoggedIn, updateProprietor);
adminRoute.route('/delete_proprietor/:id').delete(adminEnsureLoggedIn, deleteProprietor);
adminRoute.route('/add_staffs').post(adminEnsureLoggedIn, createStaff);
adminRoute.route('/update-staff').get(adminEnsureLoggedIn, getUpdateStaffUpdatePage);
adminRoute.route('/update-staff/:id').put(adminEnsureLoggedIn, updateStaff);
adminRoute.route('/delete_staff/:id').delete(adminEnsureLoggedIn, deleteStaff);
adminRoute.route('/staff-status/:id').patch(adminEnsureLoggedIn, staffStatus);
adminRoute.route('/staffdetail').get(adminEnsureLoggedIn, staffDetails);
adminRoute.route('/allocate_class').post(adminEnsureLoggedIn, allocateStaffClass);
adminRoute.route('/disallocate/:id').get(adminEnsureLoggedIn, disallocateStaffClass);
adminRoute.route('/add_staffs_statement').post(adminEnsureLoggedIn, createStaffStatement);
adminRoute.route('/update-staff-statement').get(adminEnsureLoggedIn, getUpdateStatementPage);
adminRoute.route('/update-staff-statement/:id').put(adminEnsureLoggedIn, updateStaffState);
adminRoute.route('/delete_staff-statement/:id').delete(adminEnsureLoggedIn, deleteStaffState);
adminRoute.route('/update-school').get(adminEnsureLoggedIn, getSchoolUpdatePage);
adminRoute.route('/update-school/:id').put(adminEnsureLoggedIn, updateSchool);
adminRoute.route('/school-detail').get(adminEnsureLoggedIn, getSchoolDetail);
adminRoute.route('/upload-school-image/:id').post(adminEnsureLoggedIn, uploadSchoolLogo);
adminRoute.route('/add_session').post(adminEnsureLoggedIn, addSession);
adminRoute.route('/update-session').get(adminEnsureLoggedIn, getUpdateSesstionpPage);
adminRoute.route('/update-session/:id').put(adminEnsureLoggedIn, updateSession);
adminRoute.route('/deletes/:id').delete(adminEnsureLoggedIn, deleteSession);
adminRoute.route('/add_section').put(adminEnsureLoggedIn, addSection);
adminRoute.route('/update-section').get(adminEnsureLoggedIn, getUpdateSectionPage);
adminRoute.route('/update-section/:id').put(adminEnsureLoggedIn, updateSection);
adminRoute.route('/deleted/:id').delete(adminEnsureLoggedIn, deleteSection);
adminRoute.route('/add_third_section').post(adminEnsureLoggedIn, addThirdTermSection);
adminRoute.route('/update-third').get(adminEnsureLoggedIn, getUpdateThirdSectionPage);
adminRoute.route('/update-third/:id').put(adminEnsureLoggedIn, updateThirdSection);
adminRoute.route('/deletedthird/:id').delete(adminEnsureLoggedIn, deleteThirdSection);
adminRoute.route('/add_subject').post(adminEnsureLoggedIn, addSubject);
adminRoute.route('/update-subject').get(adminEnsureLoggedIn, getUpdateSubjectPage);
adminRoute.route('/update-subject/:id').put(adminEnsureLoggedIn, updateSubject);
adminRoute.route('/delete-subject/:id').delete(adminEnsureLoggedIn, deleteSubject);
adminRoute.route('/add_current_class').post(adminEnsureLoggedIn, addClass);
adminRoute.route('/update-currentclass').get(adminEnsureLoggedIn, getUpdateClassPage);
adminRoute.route('/update-currentclass/:id').put(adminEnsureLoggedIn, updateClass);
adminRoute.route('/delete_currentclass/:id').delete(adminEnsureLoggedIn, deleteClass);
adminRoute.route('/school-status/:id').patch(adminEnsureLoggedIn, schoolStatus);
adminRoute.route('/manage_all').get(adminEnsureLoggedIn, manageAll);
adminRoute.route('/create_staff').get(adminEnsureLoggedIn, createStaffPage);
adminRoute.route('/school_management').get(adminEnsureLoggedIn, createProprietorPage);
adminRoute.route('/all-staffs').get(adminEnsureLoggedIn, getAllStaffs);
adminRoute.route('/create-staff-statement').get(adminEnsureLoggedIn, getCreateStaffStatePage);
adminRoute.route('/create-currentclass').get(adminEnsureLoggedIn, getCreateClassPage);
adminRoute.route('/create-subject').get(adminEnsureLoggedIn, getCreateSubjectPage);
adminRoute.route('/create-session').get(adminEnsureLoggedIn, getCreateSessionPage);
adminRoute.route('/create-section').get(adminEnsureLoggedIn, getCreateSectionPage);
adminRoute.route('/error').get(adminEnsureLoggedIn, getPaymentErrorPage);
adminRoute.route('/all-session/:page').get(adminEnsureLoggedIn, getAllSession);
adminRoute.route('/all-section/:page').get(adminEnsureLoggedIn, getAllSection);
adminRoute.route('/all-thirdsection/:page').get(adminEnsureLoggedIn, getAllThirdSecton);
adminRoute.route('/all-learner/:page').get(adminEnsureLoggedIn, getAllLearner);
adminRoute.route('/all-subject/:page').get(adminEnsureLoggedIn, getAllSubject);
adminRoute.route('/all-currentclass/:page').get(adminEnsureLoggedIn, getAllClasses);
adminRoute.route('/learners/:page').get(adminEnsureLoggedIn, LearnersReport);
adminRoute.route('/alumni/:page').get(adminEnsureLoggedIn, getAlumniPage);
adminRoute.route('/olduser-status').patch(adminEnsureLoggedIn, oldLearnersStautusUpdate);
adminRoute.route('/promotion/:id').post(adminEnsureLoggedIn, promoteSingleLearner);
adminRoute.route('/promotionall').post(adminEnsureLoggedIn, promoteAllLearner);
adminRoute.route('/promote').get(adminEnsureLoggedIn, getPromotePage);
adminRoute.route('/check_result').get(adminEnsureLoggedIn, checkResultFirstAndSecond);
adminRoute.route('/result').get(adminEnsureLoggedIn, getFirstAndSecondResult);
adminRoute.route('/result_third_term').get(adminEnsureLoggedIn, getThirdResult);
adminRoute.route('/check_third_result').get(adminEnsureLoggedIn, chseckThirdTermResult);
adminRoute.route('/update-print-status').post(adminEnsureLoggedIn, onPrintAtti);
adminRoute.route('/create-cbt/:page').get(adminEnsureLoggedIn, getCreateTestForCbt);
adminRoute.route('/register-test').post(adminEnsureLoggedIn, createCbTest);
adminRoute.route('/get-questions-page/:id').get(adminEnsureLoggedIn, getGetCbtQuestion);
adminRoute.route('/create-question/:testId').post(adminEnsureLoggedIn, createCbtQuestion);
adminRoute.route('/update-questions-page/:id').put(adminEnsureLoggedIn, updateQuestion);
adminRoute.route('/delete-question/:id').delete(adminEnsureLoggedIn, deleteQuestions);
adminRoute.route('/update-tests-page/:id').put(adminEnsureLoggedIn, updateCBT);
adminRoute.route('/delete-test/:id').delete(adminEnsureLoggedIn, deleteCBTs);






module.exports = adminRoute;
