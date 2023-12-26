if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const ejs = require('ejs');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const methodOverride = require('method-override');
require("./services/config/passport")(passport);
const multer = require('multer');
const sharp = require("sharp");
const grid = require("gridfs-stream");
const Learner = require("./services/models/leaners");
const Schoolname = require("./services/models/school.name");
const SharpMulter  =  require("sharp-multer");
const cloudinary = require('cloudinary').v2;



const PORT = process.env.PORT || 5000;
const SECRET = process.env.SESSION_SECRET;
const connectDB = require('./services/database/connection');
connectDB();

const app = express();
app.use(morgan('tiny'));
app.use(cors());
 

//bodyParser
app.set("view engine", "ejs");
app.use(express.urlencoded( { extended : false } ));
app.use(express.json());
app.use(flash());

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
// app.use(nocache())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});


// cloudinary

const upload = multer({ dest: 'uploads/' });
app.use(upload.single('img'));



app.use(function(req, res, next) {
  if(!req.user)
  res.header('Cache-Control', 'no-cache', 'private', 'no-store', 'must-revalidate', 'max-stale=0', 'post-check=0', 'pre-check=0')
  next()
})

//load Assest
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))


app.use((error, req, res, next) => {
  console.log("This is the rejected field ->", error.field);
});


app.use( (req, res, next) =>{

res.header("Access-Control-Allow-origin", "*" , "fonts.googleapis.com", "fonts.gstatic.com")

res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE")

res.header("Access-Control-Allow-Headers", "Origin",

"X-Requested-With", "Content-Type", "Accept")

next()
});

app.use('/', require('./services/routes/index'))
app.use("/admin", require("./services/routes/admin"));
app.use('/learner', require("./services/routes/learners"))
app.use("/session", require("./services/routes/session"));
app.use("/result", require("./services/routes/result.js"))
app.use('/school', require('./services/routes/school.route'))
app.use('/third_term_exam', require('./services/routes/third_term_exam') );
app.use("/reports", require('./services/routes/reports'))

app.get('/edit-profile', async(req, res) => {
  if(req.query.id) {
      const id = req.query.id;
      await Learner.findById(id)
          .then((user) => {
              if(!user){ res.status(404).send({ message : `oops! user with this ${id} not found`})}
              if(user){ res.render('upload_image', { user: user })}
          })
          .catch((err) => {
              res.status(500).send( { message: `oops! user with this ${id} not found`})
          });
  }
})

//setting up Multer//

// const storage =  
//  SharpMulter ({
//               destination:(req, file, callback) =>callback(null, "uploads"),
//               imageOptions:{
//                fileFormat: "jpg",
//                quality: 50,
//                resize: { width: 170, 
//                 height: 170  },
//                  }
//            });

// const upload = multer({ storage });

// app.post('/edit-profile/:id', upload.single("image"), async(req, res) => {
//   const id = req.params.id;
//      await Learner.findById(id)
//             .then((user) => {
              
//                 user.img = {
//                   data: fs.readFileSync(
//                       path.join( __dirname + "/uploads/" + req.file.filename)
//                   ),
//                   contentType: "image/png",
//                 };
//               user
//                 .save()
//                 .then(() => {
//                   res.json("User Image Uploaded...")
//                 })
//                 .catch((err) => res.status(400).json(`Error${err}`))

//             })
//             .catch((err) => res.status(400).json(`Error${err}`))
// })





const server = app.listen(PORT, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`server running and listening at http:/%s, %%s, ${host}, ${port}`);

})

