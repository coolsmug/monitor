const School = require("../models/school.name");

module.exports = async function subdomainRouter(req, res, next) {
  const host = req.headers.host;
  // const mainDomain = "monitrex.work";
    const mainDomain = "localhost:2022";

  if (!host.endsWith(mainDomain)) {
    return next();
  }

  const subdomain = host.replace(`.${mainDomain}`, "");

  if (subdomain && subdomain !== "www") {
    const school = await School.findOne({ subdomain });
    if (school) {
      req.school = school;
    }
  }

  next();
};
