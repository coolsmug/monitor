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
const MongoStore = require('connect-mongo');
const subDomainRouter = require("./services/middleware/weburl");




const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET;
const connectDB = require('./services/database/connection');
connectDB();

const app = express();
app.use(morgan('tiny'));
app.use(cors());



//bodyParser
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(flash({ html: true }));

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
      // mongoUrl: 'mongodb://127.0.0.1:27017/Result',
      mongoUrl:'mongodb+srv://monitor:04PYpR1DhwlBSH1S@monitor.ja30o6x.mongodb.net/?retryWrites=true&w=majority&appName=Monitor',
      collectionName: 'sessions'
    }),
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(subDomainRouter);
// app.use(nocache())

app.use((req, res, next) => {
  if (req.school) {
    return require("./services/routes/website")(req, res, next);
  }
  next();
});


app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});


app.use(function(req, res, next) {
  if (!req.user) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  }
  next();
});


//load Assest
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/img', express.static(path.resolve(__dirname, "assets/img")))
app.use('/images', express.static(path.resolve(__dirname, "assets/images")))
app.use('/slider', express.static(path.resolve(__dirname, "assets/images/slider")))
app.use('/about', express.static(path.resolve(__dirname, "assets/images/about")))
app.use('/all-icon', express.static(path.resolve(__dirname, "assets/images/all-icon")))
app.use('/blog', express.static(path.resolve(__dirname, "assets/images/blog")))
app.use('/blog-post', express.static(path.resolve(__dirname, "assets/images/blog/blog-post")))
app.use('/category', express.static(path.resolve(__dirname, "assets/images/category")))
app.use('/course', express.static(path.resolve(__dirname, "assets/images/course")))
app.use('/teacher', express.static(path.resolve(__dirname, "assets/images/course/teacher")))
app.use('/event', express.static(path.resolve(__dirname, "assets/images/event/")))
app.use('/singel-event', express.static(path.resolve(__dirname, "assets/images/event/singel-event")))
app.use('/instructor', express.static(path.resolve(__dirname, "assets/images/instructor")))
app.use('/news', express.static(path.resolve(__dirname, "assets/images/news")))
app.use('/patnar-logo', express.static(path.resolve(__dirname, "assets/images/patnar-logo")))
app.use('/publication', express.static(path.resolve(__dirname, "assets/images/publication")))
app.use('/review', express.static(path.resolve(__dirname, "assets/images/review")))
app.use('/shop-singel', express.static(path.resolve(__dirname, "assets/images/shop-singel")))
app.use('/teachers', express.static(path.resolve(__dirname, "assets/images/teachers")))
app.use('/teacher-2', express.static(path.resolve(__dirname, "assets/images/teachers/teacher-2")))
app.use('/testimonial', express.static(path.resolve(__dirname, "assets/images/testimonial")))
app.use('/your-make', express.static(path.resolve(__dirname, "assets/images/your-make")))
app.use('/fonts', express.static(path.resolve(__dirname, "assets/fonts")))
app.use('/csss', express.static(path.resolve(__dirname, "assets/csss")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))


app.use((error, req, res, next) => {
  console.error("Error:", error.message); // Log the error message
  res.status(error.status || 500).send({ error: error.message }); // Send an error response
});



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*", "fonts.googleapis.com", "fonts.gstatic.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use('/', require('./services/routes/index'));

app.use("/admin", require("./services/routes/admin"));
app.use('/learner', require("./services/routes/learners"));
app.use("/staff", require("./services/routes/staff"));
app.use("/name", require('./services/routes/website'));



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





const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  const { address, port } = server.address();
  console.log(`Server running and listening at http://${address}:${port}`);
});

