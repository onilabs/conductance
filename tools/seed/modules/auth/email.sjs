var { @get } = require('sjs:object');
var nm = require('nodejs:nodemailer');

exports.wrap = function(transport) {
	// stratified wrapper around transport.sendMail()
	return {
		send: function(opts) {
			waitfor(var err, rv) {
				transport.sendMail(opts, resume);
			}
			if(err) throw err;
			return rv;
		},
	};
}

exports.mailgunTransport = function() {
	var smtpTransport = require('nodejs:nodemailer-smtp-transport');
	var transporter = smtpTransport({
		service: 'mailgun',
		//debug: true,
		auth: {
			user: 'postmaster@' + process.env .. @get('MAILGUN_SERVER'),
			pass: process.env .. @get('MAILGUN_PASSWORD'),
		},
	});

	var transport = nm.createTransport(transporter);
	// use when `debug` is true above:
	//transport.on('log', l -> console.warn(l));
	return exports.wrap(transport);
};
