/**
  // metadata for sjs:bundle:
  @require sjs:object
  @require sjs:array
  @require sjs:sequence
  @require sjs:compare
  @require sjs:debug
  @require sjs:function
  @require sjs:cutil
  @require sjs:quasi
  @require sjs:assert
  @require sjs:logging
  @require sjs:string
  @require sjs:events
  @require sjs:sys
  @require sjs:url

  @require mho:observable
  @require mho:surface
  @require mho:client/env
*/
@ = require(['sjs:object', 'sjs:sys']);

var modules = [
  {id:'sjs:object'},
  {id:'sjs:array', exclude: ['contains']},
  'sjs:sequence',
  'sjs:compare',
  'sjs:debug',
  {id: 'sjs:function', name:'fn'},
  'sjs:cutil',
  'sjs:quasi',
  {id:'sjs:assert', name:'assert'},
  {id:'sjs:logging', include:['print','debug','verbose','info','warn','error']},
  {id:'sjs:logging', name:'logging'},
  {id:'sjs:string', exclude: ['contains']},
  {id:'sjs:events', exclude: ['Stream', 'Queue']},
  {id:'sjs:sys', exclude: ['executable']},
  {id:'sjs:url', name: 'url'},
  
  {id:'mho:observable', exclude: ['at', 'get']},
  {id:'mho:observable', name: 'observable'},
  {id:'mho:surface'}
];

if (@hostenv === 'nodejs') {
  modules = modules.concat([
    'sjs:nodejs/stream',
    {id:'nodejs:path', name: 'path'},
    {id:'sjs:nodejs/fs', name: 'fs'},
    {id:'sjs:nodejs/child-process', name: 'childProcess'},
    {id:'mho:server/env', name:'env'},
    {id:'mho:server', include:['Host', 'Route', 'Port']},
    {id:'mho:server', name:'server'},
    {id:'mho:server/routes', name:'routes'},
    'mho:server/response',
    'mho:server/generator',
  ]);
} else {
  modules = modules.concat([
    {id: 'mho:client/env', name: 'env'},
    {id: 'sjs:xbrowser/dom', name: 'dom'},
    {id: 'sjs:xbrowser/dom', include: ['preventDefault','stopEvent', 'eventTarget']},
  ]);
}

exports .. @extend(require(modules));

// GENERATED DOCS: (do not edit below this line)
/**
@noindex
@function get
@alias sjs:object::get
@function getOwn
@alias sjs:object::getOwn
@function getPath
@alias sjs:object::getPath
@function has
@alias sjs:object::has
@function hasOwn
@alias sjs:object::hasOwn
@function keys
@alias sjs:object::keys
@function ownKeys
@alias sjs:object::ownKeys
@function values
@alias sjs:object::values
@function ownValues
@alias sjs:object::ownValues
@function propertyPairs
@alias sjs:object::propertyPairs
@function ownPropertyPairs
@alias sjs:object::ownPropertyPairs
@function pairsToObject
@alias sjs:object::pairsToObject
@function extend
@alias sjs:object::extend
@function merge
@alias sjs:object::merge
@function clone
@alias sjs:object::clone
@function override
@alias sjs:object::override
@function construct
@alias sjs:object::construct
@function Constructor
@alias sjs:object::Constructor
@function isArrayLike
@alias sjs:array::isArrayLike
@function remove
@alias sjs:array::remove
@function cycle
@alias sjs:array::cycle
@function flatten
@alias sjs:array::flatten
@function union
@alias sjs:array::union
@function difference
@alias sjs:array::difference
@function haveCommonElements
@alias sjs:array::haveCommonElements
@function cmp
@alias sjs:array::cmp
@class Sequence
@alias sjs:sequence::Sequence
@class Stream
@alias sjs:sequence::Stream
@function toStream
@alias sjs:sequence::toStream
@function isStream
@alias sjs:sequence::isStream
@function isSequence
@alias sjs:sequence::isSequence
@function generate
@alias sjs:sequence::generate
@function each
@alias sjs:sequence::each
@function consume
@alias sjs:sequence::consume
@function toArray
@alias sjs:sequence::toArray
@class SequenceExhausted
@alias sjs:sequence::SequenceExhausted
@function first
@alias sjs:sequence::first
@function at
@alias sjs:sequence::at
@function slice
@alias sjs:sequence::slice
@function join
@alias sjs:sequence::join
@function sort
@alias sjs:sequence::sort
@function sortBy
@alias sjs:sequence::sortBy
@function reverse
@alias sjs:sequence::reverse
@function count
@alias sjs:sequence::count
@function take
@alias sjs:sequence::take
@function takeWhile
@alias sjs:sequence::takeWhile
@function skip
@alias sjs:sequence::skip
@function skipWhile
@alias sjs:sequence::skipWhile
@function filter
@alias sjs:sequence::filter
@function partition
@alias sjs:sequence::partition
@function map
@alias sjs:sequence::map
@function transform
@alias sjs:sequence::transform
@function concat
@alias sjs:sequence::concat
@function pack
@alias sjs:sequence::pack
@function unpack
@alias sjs:sequence::unpack
@function combine
@alias sjs:sequence::combine
@function groupBy
@alias sjs:sequence::groupBy
@function zip
@alias sjs:sequence::zip
@function zipLongest
@alias sjs:sequence::zipLongest
@function indexed
@alias sjs:sequence::indexed
@function intersperse
@alias sjs:sequence::intersperse
@function reduce
@alias sjs:sequence::reduce
@function reduce1
@alias sjs:sequence::reduce1
@function find
@alias sjs:sequence::find
@function contains
@alias sjs:sequence::contains
@function all
@alias sjs:sequence::all
@function any
@alias sjs:sequence::any
@function integers
@alias sjs:sequence::integers
@function fib
@alias sjs:sequence::fib
@function buffer
@alias sjs:sequence::buffer
@function each.par
@alias sjs:sequence::each.par
@function map.par
@alias sjs:sequence::map.par
@function transform.par
@alias sjs:sequence::transform.par
@function find.par
@alias sjs:sequence::find.par
@function filter.par
@alias sjs:sequence::filter.par
@function all.par
@alias sjs:sequence::all.par
@function any.par
@alias sjs:sequence::any.par
@function equals
@alias sjs:compare::equals
@function eq
@alias sjs:compare::eq
@function shallowEquals
@alias sjs:compare::shallowEquals
@function shallowEq
@alias sjs:compare::shallowEq
@function describeEquals
@alias sjs:compare::describeEquals
@function inspect
@alias sjs:debug::inspect
@function prompt
@alias sjs:debug::prompt
@variable fn
@alias sjs:function
@class StratumAborted
@alias sjs:cutil::StratumAborted
@function waitforAll
@alias sjs:cutil::waitforAll
@function waitforFirst
@alias sjs:cutil::waitforFirst
@class Semaphore
@alias sjs:cutil::Semaphore
@class Condition
@alias sjs:cutil::Condition
@class Queue
@alias sjs:cutil::Queue
@function breaking
@alias sjs:cutil::breaking
@class Quasi
@alias sjs:quasi::Quasi
@function isQuasi
@alias sjs:quasi::isQuasi
@function joinQuasis
@alias sjs:quasi::joinQuasis
@function mapQuasi
@alias sjs:quasi::mapQuasi
@function toQuasi
@alias sjs:quasi::toQuasi
@variable assert
@alias sjs:assert
@function print
@alias sjs:logging::print
@function debug
@alias sjs:logging::debug
@function verbose
@alias sjs:logging::verbose
@function info
@alias sjs:logging::info
@function warn
@alias sjs:logging::warn
@function error
@alias sjs:logging::error
@variable logging
@alias sjs:logging
@function isString
@alias sjs:string::isString
@function sanitize
@alias sjs:string::sanitize
@function supplant
@alias sjs:string::supplant
@function startsWith
@alias sjs:string::startsWith
@function endsWith
@alias sjs:string::endsWith
@function strip
@alias sjs:string::strip
@function lstrip
@alias sjs:string::lstrip
@function rstrip
@alias sjs:string::rstrip
@function split
@alias sjs:string::split
@function rsplit
@alias sjs:string::rsplit
@function padRight
@alias sjs:string::padRight
@function padLeft
@alias sjs:string::padLeft
@function padBoth
@alias sjs:string::padBoth
@function unindent
@alias sjs:string::unindent
@function capitalize
@alias sjs:string::capitalize
@function utf16ToUtf8
@alias sjs:string::utf16ToUtf8
@function utf8ToUtf16
@alias sjs:string::utf8ToUtf16
@function octetsToBase64
@alias sjs:string::octetsToBase64
@function base64ToOctets
@alias sjs:string::base64ToOctets
@class Emitter
@alias sjs:events::Emitter
@class HostEmitter
@alias sjs:events::HostEmitter
@function wait
@alias sjs:events::wait
@function when
@alias sjs:events::when
@variable hostenv
@alias sjs:sys::hostenv
@function getGlobal
@alias sjs:sys::getGlobal
@function eval
@alias sjs:sys::eval
@variable version
@alias sjs:sys::version
@function argv
@alias sjs:sys::argv
@variable url
@alias sjs:url
@variable observable
@alias mho:observable
@function read
@alias sjs:nodejs/stream::read
@hostenv nodejs
@function readAll
@alias sjs:nodejs/stream::readAll
@hostenv nodejs
@function write
@alias sjs:nodejs/stream::write
@hostenv nodejs
@function pump
@alias sjs:nodejs/stream::pump
@hostenv nodejs
@class ReadableStringStream
@alias sjs:nodejs/stream::ReadableStringStream
@hostenv nodejs
@class WritableStringStream
@alias sjs:nodejs/stream::WritableStringStream
@hostenv nodejs
@variable path
@alias nodejs:path
@hostenv nodejs
@variable fs
@alias sjs:nodejs/fs
@hostenv nodejs
@variable childProcess
@alias sjs:nodejs/child-process
@hostenv nodejs
@variable env
@summary Exports either [::server/env] or [::client/env] depending on whether the current hostenv is nodejs or xbrowser, respectively.
@class Host
@alias mho:server::Host
@hostenv nodejs
@class Route
@alias mho:server::Route
@hostenv nodejs
@class Port
@alias mho:server::Port
@hostenv nodejs
@variable server
@alias mho:server
@hostenv nodejs
@variable routes
@alias mho:server/routes
@hostenv nodejs
@class HttpError
@alias mho:server/response::HttpError
@hostenv nodejs
@function isHttpError
@alias mho:server/response::isHttpError
@hostenv nodejs
@function NotFound
@alias mho:server/response::NotFound
@hostenv nodejs
@function ServerError
@alias mho:server/response::ServerError
@hostenv nodejs
@variable dom
@alias sjs:xbrowser/dom
@hostenv xbrowser
@function preventDefault
@alias sjs:xbrowser/dom::preventDefault
@hostenv xbrowser
@function stopEvent
@alias sjs:xbrowser/dom::stopEvent
@hostenv xbrowser
@function eventTarget
@alias sjs:xbrowser/dom::eventTarget
@hostenv xbrowser
*/