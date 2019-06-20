var path = require('path');
var fs = require('fs');
module.exports = function(req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
  }
  if (path.extname(req.url) === '' && (req.url.split('/').filter((el)=>''!==el).length > 1)) {
    res.statusCode = 404;
    res.end(fs.readFileSync('404.html'));
  } else {
    next();
  }
}