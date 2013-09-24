@ = require.merge('sjs:object', 'sjs:sys');

// common exports:
exports .. @extend(require.merge({id:'sjs:object', exclude: ['get']},
                                 'sjs:array', 
                                 'sjs:sequence',
                                 'sjs:compare',
                                 'sjs:debug',
                                 'sjs:function',
                                 'sjs:cutil',
                                 'sjs:quasi',
                                 'sjs:regexp',
                                 {id:'sjs:string', exclude: ['contains']},
                                 {id:'sjs:events', exclude: ['Stream', 'Queue']},
                                 'sjs:sys',
                                 'sjs:url',

                                 {id:'mho:observable', exclude: ['at']},
                                 {id:'mho:surface'}
                                ));

// server-only exports:
if (@hostenv === 'nodejs') {
  exports .. @extend(require.merge('sjs:nodejs/fs',
                                   'mho:server/env'
                                  ))
}