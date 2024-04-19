const Staff= require('../models/staff.js');
const School = require('../models/school.name');
const passport = require('passport');


const checkIfStaffAuth = async ( req , res, next ) => {

        if (req.isAuthenticated()) {
            
        }
       
}

module.exports = {
    checkIfStaffAuth,
};
