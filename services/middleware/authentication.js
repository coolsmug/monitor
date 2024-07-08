const adminEnsureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware
  } else {
    return res.redirect('/'); // Redirect to the home page or login page
  }
};

const adminForwardAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
 res.redirect('/admin/admin_dashboard');     
}

  const staffEnsureLoggedIn = ( req, res , next ) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware
      } else {
        return res.redirect('/'); 
      }
  };


  const staffForwardAuthenticated = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
   res.redirect('/learner/student-profile');     
  }

  const learnerEnsureLoggedIn = ( req, res , next ) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware
      } else {
        return res.redirect('/'); 
      }
  };


  const learnerForwardAuthenticated = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
   res.redirect('');     
  }

  const learnerCBTEnsureLoggedIn = (req, res, next) => {
    const testId = req.params.id; // Capture the test ID from the route parameters
  
    if (req.isAuthenticated()) {
      return next(); // Proceed to the next middleware
    } else {
      return res.redirect(`/cbtcenter/${testId}`); // Redirect to the specified URL with the test ID
    }
  };


  const learnerCBTForwardAuthenticated = async (req, res, next) => {
    const testId = req.params.id;
    if (!req.isAuthenticated()) {
      return next();
    }
   res.redirect('/cbt-portal/${testId}');     
  }
  


  module.exports = {
    adminEnsureLoggedIn,
    staffEnsureLoggedIn,
    learnerEnsureLoggedIn,
    learnerCBTEnsureLoggedIn,
    learnerCBTForwardAuthenticated,
    learnerForwardAuthenticated,
    staffForwardAuthenticated,
    adminForwardAuthenticated
  }