const adminEnsureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware
  } else {
    return res.redirect('/'); // Redirect to the home page or login page
  }
};


  const staffEnsureLoggedIn = ( req, res , next ) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware
      } else {
        return res.redirect('/'); 
      }
  };

  const learnerEnsureLoggedIn = ( req, res , next ) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware
      } else {
        return res.redirect('/'); 
      }
  };


  module.exports = {
    adminEnsureLoggedIn,
    staffEnsureLoggedIn,
    learnerEnsureLoggedIn,

  }