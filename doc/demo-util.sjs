@ = require(['mho:std', 'mho:app']);

var CodeResult = (code,result) -> @Row([@Col('md-6', @Pre(code)), @Col('md-6', result )]);
exports.CodeResult = CodeResult;
