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

  const learnerCBTEnsureLoggedIn = (req, res, next) => {
    const testId = req.params.id; // Capture the test ID from the route parameters
  
    if (req.isAuthenticated()) {
      return next(); // Proceed to the next middleware
    } else {
      return res.redirect(`/monitor/cbtcenter/${testId}`); // Redirect to the specified URL with the test ID
    }
  };
  


  module.exports = {
    adminEnsureLoggedIn,
    staffEnsureLoggedIn,
    learnerEnsureLoggedIn,
    learnerCBTEnsureLoggedIn,
  }