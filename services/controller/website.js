if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const nodemailer = require('nodemailer');
const Event = require('../models/event');
const Blog = require('../models/blog');
const Aschool = require('../models/school.name');
const Staff = require('../models/staff.js');
const LearnerOfTheWeek = require('../models/learner_of_the_week');
const TeacherOfTheMonth = require('../models/teacher_of_the_month');
const Learner = require('../models/leaners');
const Teacher = require('../models/staff');
const Subject = require('../models/subject');
const Carear = require('../models/carear');

const getSchoolHomePage = async (req, res) => {
    try {
      const school = req.school;
  
      if (!school) {
        return res.status(404).send('School not found');

      }

        

      const learnerIdentity = await LearnerOfTheWeek.findOne({ skoolId: school._id });
      const teacherIdentity = await TeacherOfTheMonth.findOne({ skoolId: school._id });

       const learnerReal = learnerIdentity
      ? await Learner.find({ roll_no: learnerIdentity.rollno })
      : [];

    const teacherReal = teacherIdentity
      ? await Teacher.find({ roll: teacherIdentity.teacherId })
      : [];

      const [event, blog, allschool, learner, teacher, staff, oneBlog, allBlog] = await Promise.all([
        Event.find({ schoolId: school._id, event_type: 'Upcoming', event_status : 'Active' }).sort({ createdAt: -1 }).limit(3),
        Blog.find({ schoolId: school._id, status: "published", isFeatured: true }).sort({ createdAt: -1 }).limit(3),
        Aschool.find( { verified : true, status : true, fees : 'paid'}).select('img').sort( { createdAt : -1 } ),
        LearnerOfTheWeek.find({ skoolId: school._id }).sort({ createdAt: -1 }).limit(1),
        TeacherOfTheMonth.find({ skoolId: school._id }).sort({ createdAt: -1 }).limit(1),
        Teacher.find({ schoolId : school._id, status : true, isStaff: true}).sort({ roll : 1 }),
        Blog.find({ schoolId: school._id, status: "published"}).sort({ createdAt: -1 }).limit(1),
        Blog.find({ schoolId: school._id, status: "published"}).skip(1).sort({ createdAt: -1 }).limit(3),

      ]);

      const {
        school_name,
        school_motto,
        website,
        country,
        state,
        city,
        address,
        address2,
        phone_no,
        phone_no2,
        email,
        img,
        about,
        mission,
        vision,
        opening_hour,
        closing_hour,
        opening_day,
        closing_day,
        career,
       
      } = school;

       console.log(school_name)
  
      res.render('website/index-2', {
        title: school_name,
        school_name,
        school_motto,
        website,
        country,
        state,
        city,
        address,
        address2,
        phone_no,
        phone_no2,
        email,
        img,
        about,
        mission,
        vision,
        opening_hour,
        closing_hour,
        opening_day,
        closing_day,
        career,
        event,
        blog,
        allschool,
        learner : learner[0] || null,
        teacher : teacher[0] || null,
        learnerReal : learnerReal[0] || null,
        teacherReal : teacherReal[0] || null,
        staff,
        oneBlog : oneBlog[0] || null, 
        allBlog,
        
      });
  
    } catch (err) {
      console.error('Error fetching school data:', err);
      res.render('website/index-2', {
        error: 'An error occurred while fetching school data.'
      });
    }
  };



// page link routes

const getAbout = async (req, res) => {
  try{
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,
    } = school;

  

    const [event, blog, aschool,totalSubject, totalLearner, totalPastLearner, totalTeacher, staffs] = await Promise.all([
      Event.find({ schoolId: school._id, event_status: 'active' }).sort({ createdAt: -1 }).limit(3),
      Blog.find({ schoolId: school._id, status: "published", isFeatured: true }).sort({ createdAt: -1 }).limit(3),
      Aschool.find( { verified : true, status : true, fees : 'paid'}).select('img').sort( { created : 1 } ),
      Subject.countDocuments({ schoolId: school._id }),
      Learner.countDocuments({ schoolId: school._id, status: true, deletes: false }),
      Learner.countDocuments({ schoolId: school._id, status: false, deletes: false }),
      Teacher.countDocuments({ schoolId: school._id, status: true }),
      Teacher.find({ schoolId : school._id, status : true, isStaff: true}).sort({ roll : 1 }),
    ]);

     await res.render("website/about", {
      title: school_name,school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,totalSubject,
      totalLearner,totalTeacher,totalPastLearner,event, blog, aschool, staffs,
     } )

  } catch(error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
}


const getTeacherPage = async ( req , res ) => {
  try {
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,
    } = school;

    const [teacher] = await Promise.all([
      Staff.find({ schoolId: school._id, isStaff: true, status: true }).sort({ numbering: 1 })

    ]);

     await res.render("website/teachers", {
      school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,
     } )
    
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
};

const getBlogs = async ( req , res ) => {
  try {
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,
    } = school;

    const [blog] = await Promise.all([
      Blog.find({ schoolId: school._id }).sort({ createdAt: -1 })

    ]);

     await res.render("website/blog", {
      school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,
     } )
    
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
};


const contactUs = async (req, res) => {
  try {
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,subdomain
    } = school;

     await res.render("website/contact-2", {
      school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,subdomain
     } )
    
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
};

const getAllEvents = async (req, res) => {
  try {
    const school = req.school;

     if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,
    } = school;
    
    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 4; 
    const skip = (page - 1) * limit;

    const totalEvents = await Event.countDocuments({
      schoolId: school._id,
    });

    const eventList = await Event.find({
      schoolId: school._id,
    })
      .sort({ event_status: -1 })
      .skip(skip)
      .limit(limit);

      console.log(eventList)
    const totalPages = Math.ceil(totalEvents / limit);
    res.render("website/events", {
      school_name, school_motto, website, country, state,
      city, address, address2, phone_no, phone_no2, email, img,
      about, mission, vision, opening_hour, closing_hour, opening_day,
      closing_day, eventList,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};  


const getSingleEvent = async (req, res) => {
  try {
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,
    } = school;

    const { slug, dates } = req.params
    
    const event = await Event.findOne({ slug: slug, dates: dates, event_status: 'Active' });

    if (!event) {
      return res.status(404).send('Event not found');
    }

     await res.render("website/events-singel", {
      school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,event,
     } )
    
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
}


const getSingleBlog = async (req, res) => {
  try {
    const school = req.school;
  
    if (!school) {
      return res.status(404).send('School not found');
    }
 const {school_name,school_motto,website,country,state,city,address,address2,phone_no,
      phone_no2,email,img,about,mission,vision,opening_hour,closing_hour,opening_day,closing_day,subdomain
    } = school;
    
    const { slug, id } = req.params
    
    const blog = await Blog.findOne({ slug: slug, _id: id });
    const blogs = await Blog.find({ schoolId: school._id, status: "published" });
    const blogFew = await Blog.find({ schoolId: school._id, status: "published" }).sort({ createdAt: -1 }).limit(5);

    if (!blog) {
      return res.status(404).send('Blog not found');
    }

     await res.render("website/blog-singel", {
      school_name,school_motto,website,country,state,
      city,address,address2,phone_no,phone_no2,email,img,about,mission,
      vision,opening_hour,closing_hour,opening_day,closing_day,blog,blogs,blogFew,subdomain
     } )
    
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
  }
}


// Controller with pagination
const getBlogByCategory = async (req, res) => {
  try {
    const school = req.school;
    if (!school) {
      return res.status(404).send("School not found");
    }

    const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day,
    } = school;

    const { category } = req.params;

    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 3; 
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({
      schoolId: school._id,
      category,
      status: "published",
    });

    const blog = await Blog.find({
      schoolId: school._id,
      category,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const blogs = await Blog.find({
      schoolId: school._id,
      status: "published",
    });
    const blogFew = await Blog.find({
      schoolId: school._id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const totalPages = Math.ceil(totalBlogs / limit);

    res.render("website/blog", {
      school_name, school_motto, website, country, state,
      city, address, address2, phone_no, phone_no2, email, img,
      about, mission, vision, opening_hour, closing_hour, opening_day,
      closing_day, blog, blogs, blogFew,
      currentPage: page,
      totalPages,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getBlogByAll = async (req, res) => {
  try {
    const school = req.school;
    if (!school) {
      return res.status(404).send("School not found");
    }

    const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day,
    } = school;

    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 3; 
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({
      schoolId: school._id,
      status: "published",
    });

    const blog = await Blog.find({
      schoolId: school._id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const blogs = await Blog.find({
      schoolId: school._id,
      status: "published",
    });
    const blogFew = await Blog.find({
      schoolId: school._id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const totalPages = Math.ceil(totalBlogs / limit);

    res.render("website/blogs", {
      school_name, school_motto, website, country, state,
      city, address, address2, phone_no, phone_no2, email, img,
      about, mission, vision, opening_hour, closing_hour, opening_day,
      closing_day, blog, blogs, blogFew,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getSingleTeachers = async (req, res) => {
  try {
    const school = req.school;
    const { id, name } = req.params;

    if (!school) {
      return res.status(404).send("School not found");
    }
    const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day,
    } = school;

    const teacher = await Staff.findOne({ _id: id, schoolId: school._id, isStaff: true, status: true, name: name });

    if (!teacher) {
      return res.status(404).send("Teacher not found");
    }
    res.render("website/teachers-singel", {

      title: teacher.name,
      teacher, school_name, school_motto, website, country, state,
      city, address, address2, phone_no, phone_no2, email, img,
      about, mission, vision, opening_hour, closing_hour, opening_day,
      closing_day,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const school = req.school;
    if (!school) {
      return res.status(404).send("School not found");
    }

    const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day,
    } = school;


    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const totalStaff = await Teacher.countDocuments({
      schoolId: school._id,
      isStaff: true,
      status: true,
    })

    const staffing = await Teacher.find({
      schoolId: school._id,
      isStaff: true,
      status: true,
    })
      .sort({ roll: 1 })
      .skip(skip)
      .limit(limit);

    const totalStaffs = Math.ceil(totalStaff / limit);


     res.render("website/teachers", {

      school_name, school_motto, website, country, state,
      city, address, address2, phone_no, phone_no2, email, img,
      about, mission, vision, opening_hour, closing_hour, opening_day,
      closing_day,
      currentPage: page,
      totalStaffs,
      staffing,
      title: staffing.name,
      
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }

}





const sendEmail = async (req, res) => {
  try {
    // Match the frontend form fields
    const { name, email, subject, message, mobile } = req.body;
    const school = req.school;

    // Validation
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }
    if (!name || !email || !subject || !message || !mobile) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const schoolEmail = school.email;
    if (!schoolEmail) {
      return res.status(500).json({ error: "School email is not configured" });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "monitorschoolmanagementapp@gmail.com",
        pass: process.env.GMAIL_PASSWORD, // use Gmail App Password here
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Send email
    await transporter.sendMail({
      from: "monitorschoolmanagementapp@gmail.com", // verified sender
      replyTo: email, // so school can reply directly to user
      to: schoolEmail,
      subject: subject,
      text: `
        From: ${name} <${email}>
        Mobile: ${mobile}
        
        Message:
        ${message}
      `,
    });

    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
};

const getCarear = async (req, res) => {
  try {
     const school = req.school;
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }
   const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day, career
    } = school;

    const [aschool, totalSubject, totalLearner, totalPastLearner, totalTeacher, staff] = await Promise.all([
     
      Aschool.find( { verified : true, status : true, fees : 'paid'}).select('img').sort( { created : 1 } ),
      Subject.countDocuments({ schoolId: school._id }),
      Learner.countDocuments({ schoolId: school._id, status: true, deletes: false }),
      Learner.countDocuments({ schoolId: school._id, status: false, deletes: false }),
      Teacher.countDocuments({ schoolId: school._id, status: true }),
      Teacher.find({ schoolId : school._id, status : true, isStaff: true}).sort({ roll : 1 }),
    ]);

    const carear = await Carear.find({ status : true, schoolId: school._id  }).sort({ created : -1 } ).exec()
    res.render('website/job', {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day, carear,career, aschool, totalSubject, totalLearner, totalPastLearner, totalTeacher, staff
    })
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }

    
}


const getTeacherOfTheMonthPage = async ( req , res ) => {
  try {

      const school = req.school;
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }


    const { teacherId, slug } = req.params;

    const teachers = await TeacherOfTheMonth.findOne( { skoolId : school._id, slug : slug, teacherId : teacherId} ).exec();

    const teacher = teachers ? await Teacher.findOne({ admin_no: teachers.teacherId }) : [];

    
   const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day
    } = school;

     res.render('website/teacher-of-the-week', {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day, teachers, teacher
    })
  } catch (error) {
     console.error("Error:", error);
    return res.status(500).json({ error: "Oops! Internal Server Error" });
  }
};

const getlearnerOfTheMonthPage = async ( req , res ) => {
  try {

      const school = req.school;
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

     const { rollno, slug } = req.params;
    const teachers = await LearnerOfTheWeek.findOne( { skoolId : school._id, slug: slug, rollno : rollno } ).exec();
    console.log(teachers.rollno)
    const teacher = teachers
      ? await Learner.findOne({ roll_no : teachers.rollno })
      : [];

     

   const {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day
    } = school;


     res.render('website/learner-of-the-week', {
      school_name, school_motto, website, country, state, city, address, address2,
      phone_no, phone_no2, email, img, about, mission, vision,
      opening_hour, closing_hour, opening_day, closing_day, teachers, teacher
    })
  } catch (error) {
     console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}




module.exports = {
    getSchoolHomePage,
    getAbout,
    // getEventPage,
    getTeacherPage,
    getBlogs,
    contactUs,
    getSingleEvent,
    getSingleBlog,
    getBlogByCategory,
    getBlogByAll,
    getSingleTeachers,
    getAllStaff,
    getAllEvents,
    sendEmail,
    getCarear,
    getTeacherOfTheMonthPage,
    getlearnerOfTheMonthPage
}