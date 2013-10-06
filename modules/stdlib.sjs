@ = require.merge('sjs:object', 'sjs:sys');

var modules = [
  {id:'sjs:object', exclude: ['get']},
  'sjs:array',
  'sjs:sequence',
  'sjs:compare',
  'sjs:debug',
  'sjs:function',
  'sjs:cutil',
  'sjs:quasi',
  {id:'sjs:assert', name:'assert'},
  {id:'sjs:logging', include:['print','debug','verbose','info','warn','error']},
  {id:'sjs:string', exclude: ['contains']},
  {id:'sjs:events', exclude: ['Stream', 'Queue']},
  {id:'sjs:sys', exclude: ['executable']},
  {id:'sjs:url', name: 'url'},
  
  {id:'mho:observable', exclude: ['at']},
  {id:'mho:surface'},
  {id:'mho:surface/bootstrap', exclude: ['Label', 'Submit']},
];

if (@hostenv === 'nodejs') {
  modules = modules.concat([
    'sjs:nodejs/fs',
    {id:'sjs:nodejs/child-process', exclude: ['wait']},
    'mho:server/env'
  ]);
}

exports .. @extend(require.merge.apply(require, modules));

