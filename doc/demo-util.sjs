@ = require(['mho:std', 'mho:app']);

var CodeResult = (code,result) -> @Row([@Col('sm-6', @Pre(code)), @Col('sm-6', result )]);
exports.CodeResult = CodeResult;
