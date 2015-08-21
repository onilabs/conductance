// This file was originally generated using conductance/tools/google/generate-google-api urlshortener
/**
  @summary URL Shortener API v1 - Lets you create, inspect, and manage goo.gl short URLs
  @desc
    Revision 20150519

    See also https://developers.google.com/url-shortener/v1/getting_started.
*/

@ = require([
  'mho:std',
  {id:'./helpers', name: 'helpers'}
]);

var API_BASE_URL = 'https://www.googleapis.com/urlshortener/v1/';

/**
   @class AnalyticsSnapshot
   @summary Google API JSON structure
   
   @variable AnalyticsSnapshot.browsers
   @summary Array - Top browsers, e.g. "Chrome"; sorted by (descending) click counts. Only present if this data is available.
   
   @variable AnalyticsSnapshot.countries
   @summary Array - Top countries (expressed as country codes), e.g. "US" or "DE"; sorted by (descending) click counts. Only present if this data is available.
   
   @variable AnalyticsSnapshot.longUrlClicks
   @summary String - Number of clicks on all goo.gl short URLs pointing to this long URL.
   
   @variable AnalyticsSnapshot.platforms
   @summary Array - Top platforms or OSes, e.g. "Windows"; sorted by (descending) click counts. Only present if this data is available.
   
   @variable AnalyticsSnapshot.referrers
   @summary Array - Top referring hosts, e.g. "www.google.com"; sorted by (descending) click counts. Only present if this data is available.
   
   @variable AnalyticsSnapshot.shortUrlClicks
   @summary String - Number of clicks on this short URL.
   
   @class AnalyticsSummary
   @summary Google API JSON structure
   
   @variable AnalyticsSummary.allTime
   @summary [::AnalyticsSnapshot] - Click analytics over all time.
   
   @variable AnalyticsSummary.day
   @summary [::AnalyticsSnapshot] - Click analytics over the last day.
   
   @variable AnalyticsSummary.month
   @summary [::AnalyticsSnapshot] - Click analytics over the last month.
   
   @variable AnalyticsSummary.twoHours
   @summary [::AnalyticsSnapshot] - Click analytics over the last two hours.
   
   @variable AnalyticsSummary.week
   @summary [::AnalyticsSnapshot] - Click analytics over the last week.
   
   @class StringCount
   @summary Google API JSON structure
   
   @variable StringCount.count
   @summary String - Number of clicks for this top entry, e.g. for this particular country or browser.
   
   @variable StringCount.id
   @summary String - Label assigned to this top entry, e.g. "US" or "Chrome".
   
   @class Url
   @summary Google API JSON structure
   
   @variable Url.analytics
   @summary [::AnalyticsSummary] - A summary of the click analytics for the short and long URL. Might not be present if not requested or currently unavailable.
   
   @variable Url.created
   @summary String - Time the short URL was created; ISO 8601 representation using the yyyy-MM-dd'T'HH:mm:ss.SSSZZ format, e.g. "2010-10-14T19:01:24.944+00:00".
   
   @variable Url.id
   @summary String - Short URL, e.g. "http://goo.gl/l6MS".
   
   @variable Url.kind
   @summary String - The fixed string "urlshortener#url".
   
   @variable Url.longUrl
   @summary String - Long URL, e.g. "http://www.google.com/". Might not be present if the status is "REMOVED".
   
   @variable Url.status
   @summary String - Status of the target URL. Possible values: "OK", "MALWARE", "PHISHING", or "REMOVED". A URL might be marked "REMOVED" if it was flagged as spam, for example.
   
   @class UrlHistory
   @summary Google API JSON structure
   
   @variable UrlHistory.items
   @summary Array - A list of URL resources.
   
   @variable UrlHistory.itemsPerPage
   @summary Integer - Number of items returned with each full "page" of results. Note that the last page could have fewer items than the "itemsPerPage" value.
   
   @variable UrlHistory.kind
   @summary String - The fixed string "urlshortener#urlHistory".
   
   @variable UrlHistory.nextPageToken
   @summary String - A token to provide to get the next page of results.
   
   @variable UrlHistory.totalItems
   @summary Integer - Total number of short URLs associated with this user (may be approximate).
*/

exports.url = {

  /**
     @function url.get
     @summary  Expands a short URL or gets creation time and analytics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [projection] Additional information to return.
     @setting {String} [shortUrl] The short URL, including the protocol. **Required**
     @return {::Url}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/urlshortener - Manage your goo.gl short URLs
  */
  get: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'url',
      params: params,
      requiredParams: ['shortUrl'],
      pathParams: []
    });
  },
  
  /**
     @function url.insert
     @summary  Creates a new short URL.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {::Url} [resource] Resource that this API call acts on. **Required**
     @return {::Url}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/urlshortener - Manage your goo.gl short URLs
  */
  insert: function(client, params) {
    return client .. @helpers.performRequest({
      method: 'POST',
      url: API_BASE_URL+'url',
      params: params,
      requiredParams: ['resource'],
      pathParams: []
    });
  },
  
  /**
     @function url.list
     @summary  Retrieves a list of URLs shortened by a user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [./oauth/service::OAuthService::APISession] or [./service_account::run]
     @param {Object} [settings] API call parameters
     @setting {optional String} [projection] Additional information to return.
     @setting {optional String} [start-token] Token for requesting successive pages of results.
     @return {::UrlHistory}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/urlshortener - Manage your goo.gl short URLs
  */
  list: function(client, params) {
    return client .. @helpers.performRequest({
      url: API_BASE_URL+'url/history',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};
