const express = require('express');
const websiteRoute = express.Router();



const {
    getIndex
} = require('../controller/website')

websiteRoute.route('/name').get(getIndex);

module.exports = websiteRoute