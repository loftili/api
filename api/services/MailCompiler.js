var crypto = require('crypto'),
    jade = require('jade'),
    path = require('path'),
    juice = require('juice2'),
    sass = require('node-sass');

module.exports = (function() {

  var MailCompiler = {},
      STYLE_PATH = path.join(__dirname, '..', '..', 'views', 'email', 'style.sass');

  MailCompiler.compile = function(viewname, params, callback) {
    var template_path = path.join(__dirname, '..', '..', 'views', 'email', viewname),
        template_fn = jade.compileFile(template_path, {}),
        email_html = template_fn(params);

    function sendMail(err, html) {
      if(err) {
        sails.log('[MailCompiler] unable to juice content err['+err+']');
        return callback('juice fail', null);
      }

      return callback(null,  html);
    }

    function hasStyle(result) {
      juice.juiceContent(email_html, {url: 'http://', extraCss: result.css}, sendMail);
    }

    sass.render({
      file: STYLE_PATH,
      success: hasStyle,
      error: hasStyle
    });
  };

  return MailCompiler;

})();
