/**
  // additional metadata for sjs:bundle:
  @require mho:surface
  @require mho:env
*/

modules = modules.concat([
  {id:'mho:env', name:'env'},
  {id:'mho:surface'}
]);

if (hostenv === 'nodejs') {
  modules = modules.concat([
    {id:'mho:server', include:['Host', 'Route', 'Port']},
    {id:'mho:server', name:'server'},
    {id:'mho:server/route', name:'route'},
    {id:'mho:server/response', name:'response'},
    'mho:server/generator'
  ]);
}
