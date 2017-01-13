@ = require([
  'mho:std',
  'mho:app',
  {id:'mho:services', name:'services'}
]);


@mainContent .. @appendContent(@PageHeader('Application Administration'));

@withAPI('./admin.api') {
  |api|

  @mainContent .. @appendContent(api.getServicesRegistry() .. @services.configUI) {
    ||
    hold();
  }
}
