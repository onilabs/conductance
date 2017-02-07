// This file was originally generated using conductance/tools/google/generate-google-api calendar

/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */


/**
  @summary Calendar API v3 - Manipulates events and other calendar data.
  @desc
    Revision 20170129

    See also https://developers.google.com/google-apps/calendar/firstapp.
*/

@ = require([
  'mho:std'
]);

/**
   @class Acl
   @summary Google API JSON structure
   
   @variable Acl.etag
   @summary String - ETag of the collection.
   
   @variable Acl.items
   @summary Array - List of rules on the access control list.
   
   @variable Acl.kind
   @summary String - Type of the collection ("calendar#acl").
   
   @variable Acl.nextPageToken
   @summary String - Token used to access the next page of this result. Omitted if no further results are available, in which case nextSyncToken is provided.
   
   @variable Acl.nextSyncToken
   @summary String - Token used at a later point in time to retrieve only the entries that have changed since this result was returned. Omitted if further results are available, in which case nextPageToken is provided.
   
   @class AclRule
   @summary Google API JSON structure
   
   @variable AclRule.etag
   @summary String - ETag of the resource.
   
   @variable AclRule.id
   @summary String - Identifier of the ACL rule.
   
   @variable AclRule.kind
   @summary String - Type of the resource ("calendar#aclRule").
   
   @variable AclRule.role
   @summary String - The role assigned to the scope. Possible values are:  
   - "none" - Provides no access. 
   - "freeBusyReader" - Provides read access to free/busy information. 
   - "reader" - Provides read access to the calendar. Private events will appear to users with reader access, but event details will be hidden. 
   - "writer" - Provides read and write access to the calendar. Private events will appear to users with writer access, and event details will be visible. 
   - "owner" - Provides ownership of the calendar. This role has all of the permissions of the writer role with the additional ability to see and manipulate ACLs.
   
   @variable AclRule.scope
   @summary Object - The scope of the rule.
   
   @class Calendar
   @summary Google API JSON structure
   
   @variable Calendar.description
   @summary String - Description of the calendar. Optional.
   
   @variable Calendar.etag
   @summary String - ETag of the resource.
   
   @variable Calendar.id
   @summary String - Identifier of the calendar. To retrieve IDs call the calendarList.list() method.
   
   @variable Calendar.kind
   @summary String - Type of the resource ("calendar#calendar").
   
   @variable Calendar.location
   @summary String - Geographic location of the calendar as free-form text. Optional.
   
   @variable Calendar.summary
   @summary String - Title of the calendar.
   
   @variable Calendar.timeZone
   @summary String - The time zone of the calendar. (Formatted as an IANA Time Zone Database name, e.g. "Europe/Zurich".) Optional.
   
   @class CalendarList
   @summary Google API JSON structure
   
   @variable CalendarList.etag
   @summary String - ETag of the collection.
   
   @variable CalendarList.items
   @summary Array - Calendars that are present on the user's calendar list.
   
   @variable CalendarList.kind
   @summary String - Type of the collection ("calendar#calendarList").
   
   @variable CalendarList.nextPageToken
   @summary String - Token used to access the next page of this result. Omitted if no further results are available, in which case nextSyncToken is provided.
   
   @variable CalendarList.nextSyncToken
   @summary String - Token used at a later point in time to retrieve only the entries that have changed since this result was returned. Omitted if further results are available, in which case nextPageToken is provided.
   
   @class CalendarListEntry
   @summary Google API JSON structure
   
   @variable CalendarListEntry.accessRole
   @summary String - The effective access role that the authenticated user has on the calendar. Read-only. Possible values are:  
   - "freeBusyReader" - Provides read access to free/busy information. 
   - "reader" - Provides read access to the calendar. Private events will appear to users with reader access, but event details will be hidden. 
   - "writer" - Provides read and write access to the calendar. Private events will appear to users with writer access, and event details will be visible. 
   - "owner" - Provides ownership of the calendar. This role has all of the permissions of the writer role with the additional ability to see and manipulate ACLs.
   
   @variable CalendarListEntry.backgroundColor
   @summary String - The main color of the calendar in the hexadecimal format "#0088aa". This property supersedes the index-based colorId property. To set or change this property, you need to specify colorRgbFormat=true in the parameters of the insert, update and patch methods. Optional.
   
   @variable CalendarListEntry.colorId
   @summary String - The color of the calendar. This is an ID referring to an entry in the calendar section of the colors definition (see the colors endpoint). This property is superseded by the backgroundColor and foregroundColor properties and can be ignored when using these properties. Optional.
   
   @variable CalendarListEntry.defaultReminders
   @summary Array - The default reminders that the authenticated user has for this calendar.
   
   @variable CalendarListEntry.deleted
   @summary Boolean - Whether this calendar list entry has been deleted from the calendar list. Read-only. Optional. The default is False.
   
   @variable CalendarListEntry.description
   @summary String - Description of the calendar. Optional. Read-only.
   
   @variable CalendarListEntry.etag
   @summary String - ETag of the resource.
   
   @variable CalendarListEntry.foregroundColor
   @summary String - The foreground color of the calendar in the hexadecimal format "#ffffff". This property supersedes the index-based colorId property. To set or change this property, you need to specify colorRgbFormat=true in the parameters of the insert, update and patch methods. Optional.
   
   @variable CalendarListEntry.hidden
   @summary Boolean - Whether the calendar has been hidden from the list. Optional. The default is False.
   
   @variable CalendarListEntry.id
   @summary String - Identifier of the calendar.
   
   @variable CalendarListEntry.kind
   @summary String - Type of the resource ("calendar#calendarListEntry").
   
   @variable CalendarListEntry.location
   @summary String - Geographic location of the calendar as free-form text. Optional. Read-only.
   
   @variable CalendarListEntry.notificationSettings
   @summary Object - The notifications that the authenticated user is receiving for this calendar.
   
   @variable CalendarListEntry.primary
   @summary Boolean - Whether the calendar is the primary calendar of the authenticated user. Read-only. Optional. The default is False.
   
   @variable CalendarListEntry.selected
   @summary Boolean - Whether the calendar content shows up in the calendar UI. Optional. The default is False.
   
   @variable CalendarListEntry.summary
   @summary String - Title of the calendar. Read-only.
   
   @variable CalendarListEntry.summaryOverride
   @summary String - The summary that the authenticated user has set for this calendar. Optional.
   
   @variable CalendarListEntry.timeZone
   @summary String - The time zone of the calendar. Optional. Read-only.
   
   @class CalendarNotification
   @summary Google API JSON structure
   
   @variable CalendarNotification.method
   @summary String - The method used to deliver the notification. Possible values are:  
   - "email" - Reminders are sent via email. 
   - "sms" - Reminders are sent via SMS. This value is read-only and is ignored on inserts and updates. SMS reminders are only available for Google Apps for Work, Education, and Government customers.
   
   @variable CalendarNotification.type
   @summary String - The type of notification. Possible values are:  
   - "eventCreation" - Notification sent when a new event is put on the calendar. 
   - "eventChange" - Notification sent when an event is changed. 
   - "eventCancellation" - Notification sent when an event is cancelled. 
   - "eventResponse" - Notification sent when an event is changed. 
   - "agenda" - An agenda with the events of the day (sent out in the morning).
   
   @class Channel
   @summary Google API JSON structure
   
   @variable Channel.address
   @summary String - The address where notifications are delivered for this channel.
   
   @variable Channel.expiration
   @summary String - Date and time of notification channel expiration, expressed as a Unix timestamp, in milliseconds. Optional.
   
   @variable Channel.id
   @summary String - A UUID or similar unique string that identifies this channel.
   
   @variable Channel.kind
   @summary String - Identifies this as a notification channel used to watch for changes to a resource. Value: the fixed string "api#channel".
   
   @variable Channel.params
   @summary Object - Additional parameters controlling delivery channel behavior. Optional.
   
   @variable Channel.payload
   @summary Boolean - A Boolean value to indicate whether payload is wanted. Optional.
   
   @variable Channel.resourceId
   @summary String - An opaque ID that identifies the resource being watched on this channel. Stable across different API versions.
   
   @variable Channel.resourceUri
   @summary String - A version-specific identifier for the watched resource.
   
   @variable Channel.token
   @summary String - An arbitrary string delivered to the target address with each notification delivered over this channel. Optional.
   
   @variable Channel.type
   @summary String - The type of delivery mechanism used for this channel.
   
   @class ColorDefinition
   @summary Google API JSON structure
   
   @variable ColorDefinition.background
   @summary String - The background color associated with this color definition.
   
   @variable ColorDefinition.foreground
   @summary String - The foreground color that can be used to write on top of a background with 'background' color.
   
   @class Colors
   @summary Google API JSON structure
   
   @variable Colors.calendar
   @summary Object - A global palette of calendar colors, mapping from the color ID to its definition. A calendarListEntry resource refers to one of these color IDs in its color field. Read-only.
   
   @variable Colors.event
   @summary Object - A global palette of event colors, mapping from the color ID to its definition. An event resource may refer to one of these color IDs in its color field. Read-only.
   
   @variable Colors.kind
   @summary String - Type of the resource ("calendar#colors").
   
   @variable Colors.updated
   @summary String - Last modification time of the color palette (as a RFC3339 timestamp). Read-only.
   
   @class Error
   @summary Google API JSON structure
   
   @variable Error.domain
   @summary String - Domain, or broad category, of the error.
   
   @variable Error.reason
   @summary String - Specific reason for the error. Some of the possible values are:  
   - "groupTooBig" - The group of users requested is too large for a single query. 
   - "tooManyCalendarsRequested" - The number of calendars requested is too large for a single query. 
   - "notFound" - The requested resource was not found. 
   - "internalError" - The API service has encountered an internal error.  Additional error types may be added in the future, so clients should gracefully handle additional error statuses not included in this list.
   
   @class Event
   @summary Google API JSON structure
   
   @variable Event.anyoneCanAddSelf
   @summary Boolean - Whether anyone can invite themselves to the event (currently works for Google+ events only). Optional. The default is False.
   
   @variable Event.attachments
   @summary Array - File attachments for the event. Currently only Google Drive attachments are supported.
   In order to modify attachments the supportsAttachments request parameter should be set to true.
   There can be at most 25 attachments per event,
   
   @variable Event.attendees
   @summary Array - The attendees of the event. See the Events with attendees guide for more information on scheduling events with other calendar users.
   
   @variable Event.attendeesOmitted
   @summary Boolean - Whether attendees may have been omitted from the event's representation. When retrieving an event, this may be due to a restriction specified by the maxAttendee query parameter. When updating an event, this can be used to only update the participant's response. Optional. The default is False.
   
   @variable Event.colorId
   @summary String - The color of the event. This is an ID referring to an entry in the event section of the colors definition (see the  colors endpoint). Optional.
   
   @variable Event.created
   @summary String - Creation time of the event (as a RFC3339 timestamp). Read-only.
   
   @variable Event.creator
   @summary Object - The creator of the event. Read-only.
   
   @variable Event.description
   @summary String - Description of the event. Optional.
   
   @variable Event.end
   @summary [::EventDateTime] - The (exclusive) end time of the event. For a recurring event, this is the end time of the first instance.
   
   @variable Event.endTimeUnspecified
   @summary Boolean - Whether the end time is actually unspecified. An end time is still provided for compatibility reasons, even if this attribute is set to True. The default is False.
   
   @variable Event.etag
   @summary String - ETag of the resource.
   
   @variable Event.extendedProperties
   @summary Object - Extended properties of the event.
   
   @variable Event.gadget
   @summary Object - A gadget that extends this event.
   
   @variable Event.guestsCanInviteOthers
   @summary Boolean - Whether attendees other than the organizer can invite others to the event. Optional. The default is True.
   
   @variable Event.guestsCanModify
   @summary Boolean - Whether attendees other than the organizer can modify the event. Optional. The default is False.
   
   @variable Event.guestsCanSeeOtherGuests
   @summary Boolean - Whether attendees other than the organizer can see who the event's attendees are. Optional. The default is True.
   
   @variable Event.hangoutLink
   @summary String - An absolute link to the Google+ hangout associated with this event. Read-only.
   
   @variable Event.htmlLink
   @summary String - An absolute link to this event in the Google Calendar Web UI. Read-only.
   
   @variable Event.iCalUID
   @summary String - Event unique identifier as defined in RFC5545. It is used to uniquely identify events accross calendaring systems and must be supplied when importing events via the import method.
   Note that the icalUID and the id are not identical and only one of them should be supplied at event creation time. One difference in their semantics is that in recurring events, all occurrences of one event have different ids while they all share the same icalUIDs.
   
   @variable Event.id
   @summary String - Opaque identifier of the event. When creating new single or recurring events, you can specify their IDs. Provided IDs must follow these rules:  
   - characters allowed in the ID are those used in base32hex encoding, i.e. lowercase letters a-v and digits 0-9, see section 3.1.2 in RFC2938 
   - the length of the ID must be between 5 and 1024 characters 
   - the ID must be unique per calendar  Due to the globally distributed nature of the system, we cannot guarantee that ID collisions will be detected at event creation time. To minimize the risk of collisions we recommend using an established UUID algorithm such as one described in RFC4122.
   If you do not specify an ID, it will be automatically generated by the server.
   Note that the icalUID and the id are not identical and only one of them should be supplied at event creation time. One difference in their semantics is that in recurring events, all occurrences of one event have different ids while they all share the same icalUIDs.
   
   @variable Event.kind
   @summary String - Type of the resource ("calendar#event").
   
   @variable Event.location
   @summary String - Geographic location of the event as free-form text. Optional.
   
   @variable Event.locked
   @summary Boolean - Whether this is a locked event copy where no changes can be made to the main event fields "summary", "description", "location", "start", "end" or "recurrence". The default is False. Read-Only.
   
   @variable Event.organizer
   @summary Object - The organizer of the event. If the organizer is also an attendee, this is indicated with a separate entry in attendees with the organizer field set to True. To change the organizer, use the move operation. Read-only, except when importing an event.
   
   @variable Event.originalStartTime
   @summary [::EventDateTime] - For an instance of a recurring event, this is the time at which this event would start according to the recurrence data in the recurring event identified by recurringEventId. Immutable.
   
   @variable Event.privateCopy
   @summary Boolean - Whether this is a private event copy where changes are not shared with other copies on other calendars. Optional. Immutable. The default is False.
   
   @variable Event.recurrence
   @summary Array - List of RRULE, EXRULE, RDATE and EXDATE lines for a recurring event, as specified in RFC5545. Note that DTSTART and DTEND lines are not allowed in this field; event start and end times are specified in the start and end fields. This field is omitted for single events or instances of recurring events.
   
   @variable Event.recurringEventId
   @summary String - For an instance of a recurring event, this is the id of the recurring event to which this instance belongs. Immutable.
   
   @variable Event.reminders
   @summary Object - Information about the event's reminders for the authenticated user.
   
   @variable Event.sequence
   @summary Integer - Sequence number as per iCalendar.
   
   @variable Event.source
   @summary Object - Source from which the event was created. For example, a web page, an email message or any document identifiable by an URL with HTTP or HTTPS scheme. Can only be seen or modified by the creator of the event.
   
   @variable Event.start
   @summary [::EventDateTime] - The (inclusive) start time of the event. For a recurring event, this is the start time of the first instance.
   
   @variable Event.status
   @summary String - Status of the event. Optional. Possible values are:  
   - "confirmed" - The event is confirmed. This is the default status. 
   - "tentative" - The event is tentatively confirmed. 
   - "cancelled" - The event is cancelled.
   
   @variable Event.summary
   @summary String - Title of the event.
   
   @variable Event.transparency
   @summary String - Whether the event blocks time on the calendar. Optional. Possible values are:  
   - "opaque" - The event blocks time on the calendar. This is the default value. 
   - "transparent" - The event does not block time on the calendar.
   
   @variable Event.updated
   @summary String - Last modification time of the event (as a RFC3339 timestamp). Read-only.
   
   @variable Event.visibility
   @summary String - Visibility of the event. Optional. Possible values are:  
   - "default" - Uses the default visibility for events on the calendar. This is the default value. 
   - "public" - The event is public and event details are visible to all readers of the calendar. 
   - "private" - The event is private and only event attendees may view event details. 
   - "confidential" - The event is private. This value is provided for compatibility reasons.
   
   @class EventAttachment
   @summary Google API JSON structure
   
   @variable EventAttachment.fileId
   @summary String - ID of the attached file. Read-only.
   For Google Drive files, this is the ID of the corresponding Files resource entry in the Drive API.
   
   @variable EventAttachment.fileUrl
   @summary String - URL link to the attachment.
   For adding Google Drive file attachments use the same format as in alternateLink property of the Files resource in the Drive API.
   
   @variable EventAttachment.iconLink
   @summary String - URL link to the attachment's icon. Read-only.
   
   @variable EventAttachment.mimeType
   @summary String - Internet media type (MIME type) of the attachment.
   
   @variable EventAttachment.title
   @summary String - Attachment title.
   
   @class EventAttendee
   @summary Google API JSON structure
   
   @variable EventAttendee.additionalGuests
   @summary Integer - Number of additional guests. Optional. The default is 0.
   
   @variable EventAttendee.comment
   @summary String - The attendee's response comment. Optional.
   
   @variable EventAttendee.displayName
   @summary String - The attendee's name, if available. Optional.
   
   @variable EventAttendee.email
   @summary String - The attendee's email address, if available. This field must be present when adding an attendee. It must be a valid email address as per RFC5322.
   
   @variable EventAttendee.id
   @summary String - The attendee's Profile ID, if available. It corresponds to theid field in the People collection of the Google+ API
   
   @variable EventAttendee.optional
   @summary Boolean - Whether this is an optional attendee. Optional. The default is False.
   
   @variable EventAttendee.organizer
   @summary Boolean - Whether the attendee is the organizer of the event. Read-only. The default is False.
   
   @variable EventAttendee.resource
   @summary Boolean - Whether the attendee is a resource. Read-only. The default is False.
   
   @variable EventAttendee.responseStatus
   @summary String - The attendee's response status. Possible values are:  
   - "needsAction" - The attendee has not responded to the invitation. 
   - "declined" - The attendee has declined the invitation. 
   - "tentative" - The attendee has tentatively accepted the invitation. 
   - "accepted" - The attendee has accepted the invitation.
   
   @variable EventAttendee.self
   @summary Boolean - Whether this entry represents the calendar on which this copy of the event appears. Read-only. The default is False.
   
   @class EventDateTime
   @summary Google API JSON structure
   
   @variable EventDateTime.date
   @summary String - The date, in the format "yyyy-mm-dd", if this is an all-day event.
   
   @variable EventDateTime.dateTime
   @summary String - The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.
   
   @variable EventDateTime.timeZone
   @summary String - The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Europe/Zurich".) For recurring events this field is required and specifies the time zone in which the recurrence is expanded. For single events this field is optional and indicates a custom time zone for the event start/end.
   
   @class EventReminder
   @summary Google API JSON structure
   
   @variable EventReminder.method
   @summary String - The method used by this reminder. Possible values are:  
   - "email" - Reminders are sent via email. 
   - "sms" - Reminders are sent via SMS. These are only available for Google Apps for Work, Education, and Government customers. Requests to set SMS reminders for other account types are ignored. 
   - "popup" - Reminders are sent via a UI popup.
   
   @variable EventReminder.minutes
   @summary Integer - Number of minutes before the start of the event when the reminder should trigger. Valid values are between 0 and 40320 (4 weeks in minutes).
   
   @class Events
   @summary Google API JSON structure
   
   @variable Events.accessRole
   @summary String - The user's access role for this calendar. Read-only. Possible values are:  
   - "none" - The user has no access. 
   - "freeBusyReader" - The user has read access to free/busy information. 
   - "reader" - The user has read access to the calendar. Private events will appear to users with reader access, but event details will be hidden. 
   - "writer" - The user has read and write access to the calendar. Private events will appear to users with writer access, and event details will be visible. 
   - "owner" - The user has ownership of the calendar. This role has all of the permissions of the writer role with the additional ability to see and manipulate ACLs.
   
   @variable Events.defaultReminders
   @summary Array - The default reminders on the calendar for the authenticated user. These reminders apply to all events on this calendar that do not explicitly override them (i.e. do not have reminders.useDefault set to True).
   
   @variable Events.description
   @summary String - Description of the calendar. Read-only.
   
   @variable Events.etag
   @summary String - ETag of the collection.
   
   @variable Events.items
   @summary Array - List of events on the calendar.
   
   @variable Events.kind
   @summary String - Type of the collection ("calendar#events").
   
   @variable Events.nextPageToken
   @summary String - Token used to access the next page of this result. Omitted if no further results are available, in which case nextSyncToken is provided.
   
   @variable Events.nextSyncToken
   @summary String - Token used at a later point in time to retrieve only the entries that have changed since this result was returned. Omitted if further results are available, in which case nextPageToken is provided.
   
   @variable Events.summary
   @summary String - Title of the calendar. Read-only.
   
   @variable Events.timeZone
   @summary String - The time zone of the calendar. Read-only.
   
   @variable Events.updated
   @summary String - Last modification time of the calendar (as a RFC3339 timestamp). Read-only.
   
   @class FreeBusyCalendar
   @summary Google API JSON structure
   
   @variable FreeBusyCalendar.busy
   @summary Array - List of time ranges during which this calendar should be regarded as busy.
   
   @variable FreeBusyCalendar.errors
   @summary Array - Optional error(s) (if computation for the calendar failed).
   
   @class FreeBusyGroup
   @summary Google API JSON structure
   
   @variable FreeBusyGroup.calendars
   @summary Array - List of calendars' identifiers within a group.
   
   @variable FreeBusyGroup.errors
   @summary Array - Optional error(s) (if computation for the group failed).
   
   @class FreeBusyRequest
   @summary Google API JSON structure
   
   @variable FreeBusyRequest.calendarExpansionMax
   @summary Integer - Maximal number of calendars for which FreeBusy information is to be provided. Optional.
   
   @variable FreeBusyRequest.groupExpansionMax
   @summary Integer - Maximal number of calendar identifiers to be provided for a single group. Optional. An error will be returned for a group with more members than this value.
   
   @variable FreeBusyRequest.items
   @summary Array - List of calendars and/or groups to query.
   
   @variable FreeBusyRequest.timeMax
   @summary String - The end of the interval for the query.
   
   @variable FreeBusyRequest.timeMin
   @summary String - The start of the interval for the query.
   
   @variable FreeBusyRequest.timeZone
   @summary String - Time zone used in the response. Optional. The default is UTC.
   
   @class FreeBusyRequestItem
   @summary Google API JSON structure
   
   @variable FreeBusyRequestItem.id
   @summary String - The identifier of a calendar or a group.
   
   @class FreeBusyResponse
   @summary Google API JSON structure
   
   @variable FreeBusyResponse.calendars
   @summary Object - List of free/busy information for calendars.
   
   @variable FreeBusyResponse.groups
   @summary Object - Expansion of groups.
   
   @variable FreeBusyResponse.kind
   @summary String - Type of the resource ("calendar#freeBusy").
   
   @variable FreeBusyResponse.timeMax
   @summary String - The end of the interval.
   
   @variable FreeBusyResponse.timeMin
   @summary String - The start of the interval.
   
   @class Setting
   @summary Google API JSON structure
   
   @variable Setting.etag
   @summary String - ETag of the resource.
   
   @variable Setting.id
   @summary String - The id of the user setting.
   
   @variable Setting.kind
   @summary String - Type of the resource ("calendar#setting").
   
   @variable Setting.value
   @summary String - Value of the user setting. The format of the value depends on the ID of the setting. It must always be a UTF-8 string of length up to 1024 characters.
   
   @class Settings
   @summary Google API JSON structure
   
   @variable Settings.etag
   @summary String - Etag of the collection.
   
   @variable Settings.items
   @summary Array - List of user settings.
   
   @variable Settings.kind
   @summary String - Type of the collection ("calendar#settings").
   
   @variable Settings.nextPageToken
   @summary String - Token used to access the next page of this result. Omitted if no further results are available, in which case nextSyncToken is provided.
   
   @variable Settings.nextSyncToken
   @summary String - Token used at a later point in time to retrieve only the entries that have changed since this result was returned. Omitted if further results are available, in which case nextPageToken is provided.
   
   @class TimePeriod
   @summary Google API JSON structure
   
   @variable TimePeriod.end
   @summary String - The (exclusive) end of the time period.
   
   @variable TimePeriod.start
   @summary String - The (inclusive) start of the time period.
*/

exports.acl = {

  /**
     @function acl.delete
     @summary  Deletes an access control rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [ruleId] ACL rule identifier. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl/{ruleId}',
      params: params,
      requiredParams: ['calendarId', 'ruleId'],
      pathParams: ['calendarId', 'ruleId']
    });
  },
  
  /**
     @function acl.get
     @summary  Returns an access control rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [ruleId] ACL rule identifier. **Required**
     @return {::AclRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl/{ruleId}',
      params: params,
      requiredParams: ['calendarId', 'ruleId'],
      pathParams: ['calendarId', 'ruleId']
    });
  },
  
  /**
     @function acl.insert
     @summary  Creates an access control rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::AclRule} [resource] Data of [::AclRule] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {::AclRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function acl.list
     @summary  Returns the rules in the access control list for the calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional Boolean} [showDeleted] Whether to include deleted ACLs in the result. Deleted ACLs are represented by role equal to "none". Deleted ACLs will always be included if syncToken is provided. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. All entries deleted since the previous list request will always be in the result set and it is not allowed to set showDeleted to False.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::Acl}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function acl.patch
     @summary  Updates an access control rule. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::AclRule} [resource] Data of [::AclRule] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [ruleId] ACL rule identifier. **Required**
     @return {::AclRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl/{ruleId}',
      params: params,
      requiredParams: ['calendarId', 'ruleId'],
      pathParams: ['calendarId', 'ruleId']
    });
  },
  
  /**
     @function acl.update
     @summary  Updates an access control rule.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::AclRule} [resource] Data of [::AclRule] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [ruleId] ACL rule identifier. **Required**
     @return {::AclRule}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl/{ruleId}',
      params: params,
      requiredParams: ['calendarId', 'ruleId'],
      pathParams: ['calendarId', 'ruleId']
    });
  },
  
  /**
     @function acl.watch
     @summary  Watch for changes to ACL resources.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional Boolean} [showDeleted] Whether to include deleted ACLs in the result. Deleted ACLs are represented by role equal to "none". Deleted ACLs will always be included if syncToken is provided. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. All entries deleted since the previous list request will always be in the result set and it is not allowed to set showDeleted to False.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/acl/watch',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  }
};


exports.calendarList = {

  /**
     @function calendarList.delete
     @summary  Deletes an entry on the user's calendar list.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendarList.get
     @summary  Returns an entry on the user's calendar list.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {::CalendarListEntry}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendarList.insert
     @summary  Adds an entry to the user's calendar list.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::CalendarListEntry} [resource] Data of [::CalendarListEntry] structure
     @setting {optional Boolean} [colorRgbFormat] Whether to use the foregroundColor and backgroundColor fields to write the calendar colors (RGB). If this feature is used, the index-based colorId field will be set to the best matching option automatically. Optional. The default is False.
     @return {::CalendarListEntry}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function calendarList.list
     @summary  Returns entries on the user's calendar list.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [minAccessRole] The minimum access role for the user in the returned entries. Optional. The default is no restriction.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional Boolean} [showDeleted] Whether to include deleted calendar list entries in the result. Optional. The default is False.
     @setting {optional Boolean} [showHidden] Whether to show hidden entries. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. If only read-only fields such as calendar properties or ACLs have changed, the entry won't be returned. All entries deleted and hidden since the previous list request will always be in the result set and it is not allowed to set showDeleted neither showHidden to False.
  To ensure client state consistency minAccessRole query parameter cannot be specified together with nextSyncToken.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::CalendarList}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function calendarList.patch
     @summary  Updates an entry on the user's calendar list. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::CalendarListEntry} [resource] Data of [::CalendarListEntry] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Boolean} [colorRgbFormat] Whether to use the foregroundColor and backgroundColor fields to write the calendar colors (RGB). If this feature is used, the index-based colorId field will be set to the best matching option automatically. Optional. The default is False.
     @return {::CalendarListEntry}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendarList.update
     @summary  Updates an entry on the user's calendar list.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::CalendarListEntry} [resource] Data of [::CalendarListEntry] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Boolean} [colorRgbFormat] Whether to use the foregroundColor and backgroundColor fields to write the calendar colors (RGB). If this feature is used, the index-based colorId field will be set to the best matching option automatically. Optional. The default is False.
     @return {::CalendarListEntry}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendarList.watch
     @summary  Watch for changes to CalendarList resources.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [minAccessRole] The minimum access role for the user in the returned entries. Optional. The default is no restriction.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional Boolean} [showDeleted] Whether to include deleted calendar list entries in the result. Optional. The default is False.
     @setting {optional Boolean} [showHidden] Whether to show hidden entries. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. If only read-only fields such as calendar properties or ACLs have changed, the entry won't be returned. All entries deleted and hidden since the previous list request will always be in the result set and it is not allowed to set showDeleted neither showHidden to False.
  To ensure client state consistency minAccessRole query parameter cannot be specified together with nextSyncToken.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList/watch',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.calendars = {

  /**
     @function calendars.clear
     @summary  Clears a primary calendar. This operation deletes all events associated with the primary calendar of an account.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  clear: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/clear',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendars.delete
     @summary  Deletes a secondary calendar. Use calendars.clear for clearing all events on primary calendars.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendars.get
     @summary  Returns metadata for a calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {::Calendar}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendars.insert
     @summary  Creates a secondary calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Calendar} [resource] Data of [::Calendar] structure
     @return {::Calendar}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function calendars.patch
     @summary  Updates metadata for a calendar. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Calendar} [resource] Data of [::Calendar] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {::Calendar}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function calendars.update
     @summary  Updates metadata for a calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Calendar} [resource] Data of [::Calendar] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @return {::Calendar}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  }
};


exports.channels = {

  /**
     @function channels.stop
     @summary  Stop watching resources through this channel
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  stop: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/channels/stop',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.colors = {

  /**
     @function colors.get
     @summary  Returns the color definitions for calendars and events.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
  
     @return {::Colors}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/colors',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.events = {

  /**
     @function events.delete
     @summary  Deletes an event.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [eventId] Event identifier. **Required**
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the deletion of the event. Optional. The default is False.
     @return {void}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  'delete': function(client, params) {
    return client.performRequest({
      method: 'DELETE',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}',
      params: params,
      requiredParams: ['calendarId', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.get
     @summary  Returns an event.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [eventId] Event identifier. **Required**
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional String} [timeZone] Time zone used in the response. Optional. The default is the time zone of the calendar.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}',
      params: params,
      requiredParams: ['calendarId', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.import
     @summary  Imports an event. This operation is used to add a private copy of an existing event to a calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Event} [resource] Data of [::Event] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Boolean} [supportsAttachments] Whether API client performing operation supports event attachments. Optional. The default is False.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  import: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/import',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function events.insert
     @summary  Creates an event.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Event} [resource] Data of [::Event] structure
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the creation of the new event. Optional. The default is False.
     @setting {optional Boolean} [supportsAttachments] Whether API client performing operation supports event attachments. Optional. The default is False.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  insert: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function events.instances
     @summary  Returns instances of the specified recurring event.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [eventId] Recurring event identifier. **Required**
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Integer} [maxResults] Maximum number of events returned on one result page. By default the value is 250 events. The page size can never be larger than 2500 events. Optional.
     @setting {optional String} [originalStart] The original start time of the instance in the result. Optional.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional Boolean} [showDeleted] Whether to include deleted events (with status equals "cancelled") in the result. Cancelled instances of recurring events will still be included if singleEvents is False. Optional. The default is False.
     @setting {optional String} [timeMax] Upper bound (exclusive) for an event's start time to filter by. Optional. The default is not to filter by start time. Must be an RFC3339 timestamp with mandatory time zone offset.
     @setting {optional String} [timeMin] Lower bound (inclusive) for an event's end time to filter by. Optional. The default is not to filter by end time. Must be an RFC3339 timestamp with mandatory time zone offset.
     @setting {optional String} [timeZone] Time zone used in the response. Optional. The default is the time zone of the calendar.
     @return {::Events}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  instances: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}/instances',
      params: params,
      requiredParams: ['calendarId', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.list
     @summary  Returns events on the specified calendar.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional String} [iCalUID] Specifies event ID in the iCalendar format to be included in the response. Optional.
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Integer} [maxResults] Maximum number of events returned on one result page. By default the value is 250 events. The page size can never be larger than 2500 events. Optional.
     @setting {optional String} [orderBy] The order of the events returned in the result. Optional. The default is an unspecified, stable order.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional String} [privateExtendedProperty] Extended properties constraint specified as propertyName=value. Matches only private properties. This parameter might be repeated multiple times to return events that match all given constraints.
     @setting {optional String} [q] Free text search terms to find events that match these terms in any field, except for extended properties. Optional.
     @setting {optional String} [sharedExtendedProperty] Extended properties constraint specified as propertyName=value. Matches only shared properties. This parameter might be repeated multiple times to return events that match all given constraints.
     @setting {optional Boolean} [showDeleted] Whether to include deleted events (with status equals "cancelled") in the result. Cancelled instances of recurring events (but not the underlying recurring event) will still be included if showDeleted and singleEvents are both False. If showDeleted and singleEvents are both True, only single instances of deleted events (but not the underlying recurring events) are returned. Optional. The default is False.
     @setting {optional Boolean} [showHiddenInvitations] Whether to include hidden invitations in the result. Optional. The default is False.
     @setting {optional Boolean} [singleEvents] Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. All events deleted since the previous list request will always be in the result set and it is not allowed to set showDeleted to False.
  There are several query parameters that cannot be specified together with nextSyncToken to ensure consistency of the client state.
  
  These are: 
  - iCalUID 
  - orderBy 
  - privateExtendedProperty 
  - q 
  - sharedExtendedProperty 
  - timeMin 
  - timeMax 
  - updatedMin If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @setting {optional String} [timeMax] Upper bound (exclusive) for an event's start time to filter by. Optional. The default is not to filter by start time. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but will be ignored.
     @setting {optional String} [timeMin] Lower bound (inclusive) for an event's end time to filter by. Optional. The default is not to filter by end time. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but will be ignored.
     @setting {optional String} [timeZone] Time zone used in the response. Optional. The default is the time zone of the calendar.
     @setting {optional String} [updatedMin] Lower bound for an event's last modification time (as a RFC3339 timestamp) to filter by. When specified, entries deleted since this time will always be included regardless of showDeleted. Optional. The default is not to filter by last modification time.
     @return {::Events}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function events.move
     @summary  Moves an event to another calendar, i.e. changes an event's organizer.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier of the source calendar where the event currently is on. **Required**
     @setting {String} [destination] Calendar identifier of the target calendar where the event is to be moved to. **Required**
     @setting {String} [eventId] Event identifier. **Required**
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the change of the event's organizer. Optional. The default is False.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  move: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}/move',
      params: params,
      requiredParams: ['calendarId', 'destination', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.patch
     @summary  Updates an event. This method supports patch semantics.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Event} [resource] Data of [::Event] structure
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [eventId] Event identifier. **Required**
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the event update (e.g. attendee's responses, title changes, etc.). Optional. The default is False.
     @setting {optional Boolean} [supportsAttachments] Whether API client performing operation supports event attachments. Optional. The default is False.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  patch: function(client, params) {
    return client.performRequest({
      method: 'PATCH',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}',
      params: params,
      requiredParams: ['calendarId', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.quickAdd
     @summary  Creates an event based on a simple text string.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the creation of the event. Optional. The default is False.
     @setting {String} [text] The text describing the event to be created. **Required**
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  quickAdd: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/quickAdd',
      params: params,
      requiredParams: ['calendarId', 'text'],
      pathParams: ['calendarId']
    });
  },
  
  /**
     @function events.update
     @summary  Updates an event.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Event} [resource] Data of [::Event] structure
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {String} [eventId] Event identifier. **Required**
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Boolean} [sendNotifications] Whether to send notifications about the event update (e.g. attendee's responses, title changes, etc.). Optional. The default is False.
     @setting {optional Boolean} [supportsAttachments] Whether API client performing operation supports event attachments. Optional. The default is False.
     @return {::Event}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
  */
  update: function(client, params) {
    return client.performRequest({
      method: 'PUT',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}',
      params: params,
      requiredParams: ['calendarId', 'eventId'],
      pathParams: ['calendarId', 'eventId']
    });
  },
  
  /**
     @function events.watch
     @summary  Watch for changes to Events resources.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {optional Boolean} [alwaysIncludeEmail] Whether to always include a value in the email field for the organizer, creator and attendees, even if no real email is available (i.e. a generated, non-working value will be provided). The use of this option is discouraged and should only be used by clients which cannot handle the absence of an email address value in the mentioned places. Optional. The default is False.
     @setting {String} [calendarId] Calendar identifier. To retrieve calendar IDs call the calendarList.list method. If you want to access the primary calendar of the currently logged in user, use the "primary" keyword. **Required**
     @setting {optional String} [iCalUID] Specifies event ID in the iCalendar format to be included in the response. Optional.
     @setting {optional Integer} [maxAttendees] The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned. Optional.
     @setting {optional Integer} [maxResults] Maximum number of events returned on one result page. By default the value is 250 events. The page size can never be larger than 2500 events. Optional.
     @setting {optional String} [orderBy] The order of the events returned in the result. Optional. The default is an unspecified, stable order.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional String} [privateExtendedProperty] Extended properties constraint specified as propertyName=value. Matches only private properties. This parameter might be repeated multiple times to return events that match all given constraints.
     @setting {optional String} [q] Free text search terms to find events that match these terms in any field, except for extended properties. Optional.
     @setting {optional String} [sharedExtendedProperty] Extended properties constraint specified as propertyName=value. Matches only shared properties. This parameter might be repeated multiple times to return events that match all given constraints.
     @setting {optional Boolean} [showDeleted] Whether to include deleted events (with status equals "cancelled") in the result. Cancelled instances of recurring events (but not the underlying recurring event) will still be included if showDeleted and singleEvents are both False. If showDeleted and singleEvents are both True, only single instances of deleted events (but not the underlying recurring events) are returned. Optional. The default is False.
     @setting {optional Boolean} [showHiddenInvitations] Whether to include hidden invitations in the result. Optional. The default is False.
     @setting {optional Boolean} [singleEvents] Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves. Optional. The default is False.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then. All events deleted since the previous list request will always be in the result set and it is not allowed to set showDeleted to False.
  There are several query parameters that cannot be specified together with nextSyncToken to ensure consistency of the client state.
  
  These are: 
  - iCalUID 
  - orderBy 
  - privateExtendedProperty 
  - q 
  - sharedExtendedProperty 
  - timeMin 
  - timeMax 
  - updatedMin If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @setting {optional String} [timeMax] Upper bound (exclusive) for an event's start time to filter by. Optional. The default is not to filter by start time. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but will be ignored.
     @setting {optional String} [timeMin] Lower bound (inclusive) for an event's end time to filter by. Optional. The default is not to filter by end time. Must be an RFC3339 timestamp with mandatory time zone offset, e.g., 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z. Milliseconds may be provided but will be ignored.
     @setting {optional String} [timeZone] Time zone used in the response. Optional. The default is the time zone of the calendar.
     @setting {optional String} [updatedMin] Lower bound for an event's last modification time (as a RFC3339 timestamp) to filter by. When specified, entries deleted since this time will always be included regardless of showDeleted. Optional. The default is not to filter by last modification time.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/watch',
      params: params,
      requiredParams: ['calendarId'],
      pathParams: ['calendarId']
    });
  }
};


exports.freebusy = {

  /**
     @function freebusy.query
     @summary  Returns free/busy information for a set of calendars.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::FreeBusyRequest} [resource] Data of [::FreeBusyRequest] structure
     @return {::FreeBusyResponse}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  query: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/freeBusy',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};


exports.settings = {

  /**
     @function settings.get
     @summary  Returns a single user setting.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {String} [setting] The id of the user setting. **Required**
     @return {::Setting}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  get: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/users/me/settings/{setting}',
      params: params,
      requiredParams: ['setting'],
      pathParams: ['setting']
    });
  },
  
  /**
     @function settings.list
     @summary  Returns all user settings for the authenticated user.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::Settings}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  list: function(client, params) {
    return client.performRequest({
      url: 'https://www.googleapis.com/calendar/v3/users/me/settings',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  },
  
  /**
     @function settings.watch
     @summary  Watch for changes to Settings resources.
     @param {GoogleAPIClient} [api_client] API client as obtained by [../oauth/service::OAuthService::APISession] or [../service_account/service::run]
     @param {Object} [settings] API call parameters
     @setting {::Channel} [resource] Data of [::Channel] structure
     @setting {optional Integer} [maxResults] Maximum number of entries returned on one result page. By default the value is 100 entries. The page size can never be larger than 250 entries. Optional.
     @setting {optional String} [pageToken] Token specifying which result page to return. Optional.
     @setting {optional String} [syncToken] Token obtained from the nextSyncToken field returned on the last page of results from the previous list request. It makes the result of this list request contain only entries that have changed since then.
  If the syncToken expires, the server will respond with a 410 GONE response code and the client should clear its storage and perform a full synchronization without any syncToken.
  Learn more about incremental synchronization.
  Optional. The default is to return all entries.
     @return {::Channel}
     @desc
       #### Scopes
       This API call requires authorization with (at least one of) the following scope(s):
       
        * https://www.googleapis.com/auth/calendar - Manage your calendars
        * https://www.googleapis.com/auth/calendar.readonly - View your calendars
  */
  watch: function(client, params) {
    return client.performRequest({
      method: 'POST',
      url: 'https://www.googleapis.com/calendar/v3/users/me/settings/watch',
      params: params,
      requiredParams: [],
      pathParams: []
    });
  }
};
