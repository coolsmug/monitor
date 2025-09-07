const express = require('express');
const {
    getSchoolHomePage,
     getAbout,
    //  getEventPage,
     getTeacherPage,
     contactUs,
     getSingleEvent,
     getSingleBlog,
     getBlogByCategory,
     getBlogByAll,
      getSingleTeachers,
      getAllStaff,
      getAllEvents,
      // sendEmail
      sendEmail,
      getCarear,
      getTeacherOfTheMonthPage,
      getlearnerOfTheMonthPage
     
      
} = require('../controller/website')


module.exports = (req, res, next) => {
    const router = express.Router();
  
    router.get("/", getSchoolHomePage);
    router.get("/about-us",  getAbout);
    router.get('/our-staffs', getTeacherPage);
    router.get('/blogs', getBlogByAll);
    router.get('/contact-us', contactUs);
    router.get('/single-event/:dates/:slug', getSingleEvent);
    router.get('/single-blog/:id/:slug', getSingleBlog);
    router.get('/blog-category/:category', getBlogByCategory);
    router.get('/profile/:id/:name', getSingleTeachers);
    router.get('/all-staffs', getAllStaff);
    router.get('/all-events', getAllEvents);
    router.post('/send-email', sendEmail);
    router.get('/carear', getCarear);
    router.get('/icon/:rollno/:slug', getlearnerOfTheMonthPage);
    router.get('/icons/:teacherId/:slug', getTeacherOfTheMonthPage)
    
   
   
  
    return router(req, res, next);
  };
  