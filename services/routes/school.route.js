if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express");
const router = express.Router();
const Proprietor = require("../models/proprietor")
const Staffstatement = require("../models/staff.statetment");
const School = require("../models/school.name");
const Staff = require('../models/staff');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { session } = require("passport");
const cloudinary = require('cloudinary').v2;
const file = require('../models/cloudinary')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/');

}

const forwardAuthenticated = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/home-page');  
}

router.get("/school_management",  ensureAuthenticated, async(req, res) => {
    await res.render('create_proprietor', {user: req.user})
  })


router.post('/add_proprietor',  ensureAuthenticated, (req, res) => {
    const { full_name, excellent, very_good, good, pass, poor, vpoor } = req.body;
    let errors = [];
    console.log(`Full_name: ${full_name} excellent: ${excellent} very_good ${very_good} good: ${good} pass: ${pass} poor: ${poor} V.poor ${vpoor} `)
   
    if(!full_name || !excellent || !very_good || !good || !pass || !poor || !vpoor) {
        errors.push( { msg : "Please fill in all fields"});
    }
    
    if(errors.length > 0) {
        res.render('create_proprietor', {
          errors: errors,
            full_name: full_name,
            excellent: excellent,
            very_good: very_good,
            good: good,
            pass: pass,
            poor: poor,
            vpoor: vpoor,
            user: req.user,
        })
    }  else {
    
                const newProprietor = new Proprietor({
                    full_name: full_name,
                    excellent: excellent,
                    very_good: very_good,
                    good: good,
                    pass: pass,
                    poor: poor,
                    vpoor: vpoor,
                    schoolId: req.user._id,
                    
                })
                newProprietor.save()
                    .then((value) => {
                        console.log(value)
                        req.flash(
                            "success_msg",
                            "Statement Added !"
                                    );
                        res.redirect('/school/school_management')
                    })
                    .catch(value => console.log(value))
            }
})

router.get("/manage_all",ensureAuthenticated, async(req, res, next) => {

        await Proprietor
            .find({ schoolId: req.user._id })
            .select("full_name excellent very_good good pass vpoor poor")
            .exec(function(err, comment) {
              if (err) throw new Error(err)
            Staff.find({ status: true, schoolId: req.user._id }).exec((errone, staff) => {
              if(errone) throw new Error(errone)
              Staffstatement.find({schoolId: req.user._id}).exec((errtwo, sst) => {
                if(errtwo) throw new Error(errtwo)
                  res.render('all_schools_setting', {
                    comment: comment,
                    staff: staff,
                    sst : sst,
                    user: req.user,

                  })
               
               
              })
            })
             
            })
})
    
router.get("/update-proprietor",ensureAuthenticated, (req, res) => {
      if (req.query.id) {
        const id = req.query.id;
        Proprietor.findById(id)
          .then((comment) => {
            if (!comment) {
               res.status(404).send({ message: "Section not found" });
            } else {
              res.render("edit_proprietor", { comment : comment, user: req.user });
            }
          })
          .catch((err) => {
            res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
          });
      }
    });
    
    router.put("/update-proprietor/:id",ensureAuthenticated, (req, res) => {
     
      const id = req.params.id;
      Proprietor.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(comment => {
          if(!comment)
          {  
            res.status(404).send({message: `Cannot Update proprietor with ID:${id} Maybe session not present`})
           
          } else {
            res.send(comment)
    
          }
        })
        .catch((err) => {
          res.render("error404", {title: "Error 500:. Error updating data" + ' ' + err})
        });
    
    })
    
    router.delete("/delete_proprietor/:id", async(req, res) => {
      const id = req.params.id;
       await Proprietor.findByIdAndDelete(id)
       .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
        } else {
          res.send({
            message: "Proprietor Statement was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        res.render("error404", {title: "Error 500:. Error retrieving id" + ' ' + err})
      });
        
    });



    // ***************************************************************************STAFFS ROUTE________________________________??//
 
  //dashboard security login 

    router.get('/create-staff',ensureAuthenticated, async(req, res) => {
        await res.render("student", {user: req.user})
    })

    router.post('/add_staffs',ensureAuthenticated, (req, res) => {
      const { roll, name, email, password, password_2 } = req.body;
      let errors = [];
      console.log( `ROll: ${ roll } Name: ${ name }` )
     
      if(!name ||!roll ||!email || !password || !password_2 ) {
          errors.push( { msg : "Please fill in all fields"});
      }
      
      if(password !== password_2) {
        errors.push( { msg : "Password dont macth" } )
    } 
    if (password.length < 8) {
      errors.push({ msg: "password atleast 8 character" });
    }

      if(errors.length > 0) {
          res.render('student', {
            errors: errors,
            roll: roll,
             name: name,
             email: email,
             password : password,
             password_2 : password_2,
             user: req.user,
          })
      }  else {
      
                  const newStaff = new Staff({
                    roll: roll,
                    name: name,
                    status: true,
                    email: email,
                    password: password,
                    schoolId: req.user._id,
                      
                  })

                  bcrypt.genSalt(10, (err, salt) =>
                  bcrypt.hash(newStaff.password, salt,
                      (err, hash) => {
                          if (err) throw err;

                          newStaff.password = hash;

                          newStaff.save()
                              .then((value) => {
                                  console.log(value)
                                  req.flash(
                                    "success_msg",
                                    "A staff Registered !"
                                  );
                                  res.redirect('/school/create-staff')
                              })
                              .catch(value => console.log(value))
                      }))


                 
                      
              }
  })

router.get("/update-staff",ensureAuthenticated, (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    Staff.findById(id)
      .then((staff) => {
        if (!staff) {
           res.status(404).send({ message: "Section not found" });
        } else {
          res.render("staffs", { staff : staff, user: req.user });
        }
      })
      .catch((err) => {
        res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
      });
  }
});

router.put("/update-staff/:id", ensureAuthenticated, (req, res) => {
 
  const id = req.params.id;
  Staff.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(comment => {
      if(!comment)
      {  
        res.status(404).send({message: `Cannot Update Class with ID:${id} Maybe session not present`})
       
      } else {
        res.send(comment)

      }
    })
    .catch(err => {
         res.status(500).send({message:"Error Updating Staff information" + err})
    })

})

router.delete("/delete_staff/:id", async(req, res) => {
  const id = req.params.id;
   await Staff.findByIdAndDelete(id)
   .then((data) => {
    if (!data) {
      res
        .status(404)
        .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
    } else {
      res.send({
        message: "Statement was deleted successfully!",
      });
    }
  })
  .catch((err) => {
    res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + err})
  });
    
});

// staff status update//

router.patch('/staff-status/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await Staff.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + err.message})
  }
});

// ***********************************School Setting like School name and Address*********************//

router.get('/create-staff-statement',ensureAuthenticated, async(req, res) => {
  await res.render("staff_statement", {user: req.user})
})

router.post('/add_staffs_statement', ensureAuthenticated,(req, res) => {
const {excellent, very_good, good, pass, poor, vpoor} = req.body;
let errors = [];
console.log(`excellent: ${excellent} very_good: ${very_good} good: ${good} pass: ${pass} poor: ${poor} vpoor: ${vpoor}`)

if(!excellent || !very_good || !good || !pass || !poor || !vpoor) {
    errors.push( { msg : "Please fill in all fields"});
}

if(errors.length > 0) {
    res.render('staff_statement', {
      errors: errors,
     excellent:excellent,
      very_good: very_good,
       good: good,
       pass: pass,
       poor: poor,
       vpoor: vpoor,
       user: req.user,
    })
}  else {

            const newStaffStatement = new Staffstatement({
              excellent:excellent,
              very_good: very_good,
              good: good,
              pass: pass,
              poor: poor,
              vpoor: vpoor,
              schoolId: req.user._id
                
            })
            newStaffStatement.save()
                .then((value) => {
                    console.log(value)
                    req.flash(
                        "success_msg",
                        "A Staff Statement Added !"
                                );
                    res.redirect('/school/create-staff-statement')
                })
                .catch(value => console.log(value))
        }
})

router.get("/update-staff-statement",ensureAuthenticated, (req, res) => {
if (req.query.id) {
const id = req.query.id;
Staffstatement.findById(id)
.then((staffs) => {
  if (!staffs) {
     res.render("error404", {title: "Error 500:. oops! Section not found" + ' ' + 404})
  } else {
    res.render("edit_staffstatement", { staffs : staffs, user: req.user});
  }
})
.catch((err) => {
  res.render("error404", {title: "Error 500:. Error retrieving Session id" + ' ' + err})
});
}
});

router.put("/update-staff-statement/:id",ensureAuthenticated, (req, res) => {

  const id = req.params.id;
  Staffstatement.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then(comment => {
  if(!comment)
  {  
    res.status(404).send({message: `Cannot Update Class with ID:${id} Maybe session not present`})
  
  } else {
    res.send(comment)

  }
  })
  .catch(err => {
    res.status(500).send({message:"Error Updating Staff information" + err})
  })

})

router.delete("/delete_staff-statement/:id", async(req, res) => {
  const id = req.params.id;
  await Staffstatement.findByIdAndDelete(id)
  .then((data) => {
    if (!data) {
      res
        .status(404)
        .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
    } else {
      res.send({
        message: "Statement was deleted successfully!",
      });
    }
  })
  .catch((err) => {
    res.status(500).send({
      message: "Could not delete Statement with id=" + id + "with err:" + err,
    });
  });

});
    
//*******************************School Address, Email, Telephone************** */


router.get("/update-school",ensureAuthenticated, (req, res) => {
  if (req.query.id) {
  const id = req.query.id;
  School.findById(id)
  .then((school) => {
    if (!school) {
      res.status(404).send({ message: "Sschool not found" });
    } else {
      res.render("edit_school", { school : school, user: req.user });
    }
  })
  .catch((err) => {
    res.status(500).send({ message: "Error retrieving school id" });
  });
  }
});

router.put("/update-school/:id",ensureAuthenticated, (req, res) => {

  const id = req.params.id;
  School.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then(school => {
  if(!school)
  {  
    res.status(404).send({message: `Cannot Update School with ID:${id} Maybe session not present`})
  
  } else {
    res.send(school)

  }
  })
  .catch(err => {
    res.status(500).send({message:"Error Updating School information" + err})
})

})

// router.delete("/delete_school/:id", async(req, res) => {
//     const id = req.params.id;
//     await School.findByIdAndDelete(id)
//     .then((data) => {
//       if (!data) {
//         res
//           .status(404)
//           .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
//       } else {
//         res.send({
//           message: "Statement was deleted successfully!",
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: "Could not delete Statement with id=" + id + "with err:" + err,
//       });
//     });

// });

router.get("/school-detail", ensureAuthenticated, async (req, res) => {
  try {
    const Id = req.user._id
    const school = await School.findById({ _id: Id }).exec();
    res.render('school_detail', {school, user: req.user})
  } catch (error) {
    res.render("error404", {title: "Error 404" + ' ' + error})
  }
});



router.post('/upload-image/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await School.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if a file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result);


    // Check if the Cloudinary upload was successful
    if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }

    // Update the user's img field with the Cloudinary URL
    user.img = {
      url: result.secure_url,
      publicId: result.public_id  // Save the public ID if you need it for future deletions
    };

    await user.save();
    console.log(user.img);
    

    req.flash('success_msg', 'Image uploaded successfully');
    return res.redirect('/school/update-school?id=' + id);
    res.status(200).json( { message: "Image Uploaded" } )
  } catch (error) {
    console.error(error);
   
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.patch('/school-status/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await School.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


module.exports = router;