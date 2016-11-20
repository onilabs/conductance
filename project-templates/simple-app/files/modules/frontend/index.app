/**
   @summary Main entry point into application; orchestrates session and main ui ([./main::]).
   @template-title ℧ app
   @template-fluid true
*/

require('/hubs');

@ = require([
  'mho:app',
  'mho:std',
  {id:'lib:app-info', name:'app_info'}
]);

@mainContent .. @appendContent(
  @PageHeader(@app_info.name)
);

while (1) {
  @withAPI('./main.api') {
    |api|
    require('./main').main(api);
  }
}
