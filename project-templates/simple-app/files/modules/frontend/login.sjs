/* (c) 2013-2014 Oni Labs, http://onilabs.com
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
   @summary UI for user login / registration
*/

@ = require(['mho:std',
             'mho:app',
             {id: 'lib:app-info', name: 'app_info'},
             'backfill:surface-backfill'
             ]);

//----------------------------------------------------------------------
// helpers

/**
   @function obscurePassword
   @summary Derive a hashed password from a cleartext password
   @param {String} [cleartext]
   @desc
     We never use the user's cleartext password, but a hash derived from
     the password. Note that this is just a complementary security
     measure to prevent any casual inspection of a password that the
     user might use elsewhere. A proper salted password will be derived
     from this on the server.
*/
function obscurePassword(cleartext) {
  var sjcl = require('sjs:sjcl');
  return sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash("Oni Conductance App #{cleartext}"), true);
}
exports.obscurePassword = obscurePassword;

 //----------------------------------------------------------------------
 
var LoginCSS = @CSS(`
  @global {
    body {
      padding-top: 40px;
      padding-bottom: 40px;
      background-color: #eee;
    }
  }

  {
    max-width: 330px;
    padding: 15px;
    margin: 0 auto;
  }

  input {
    position: relative;
    padding: 10px;
    font-size: 16px;
    height: auto;
  }

  input:focus {
    z-index:2;
  }

  input[type='text'] {
    margin-bottom: -1px;
    border-bottom-right-radius:0;
    border-bottom-left-radius:0;
  }

  input[type='password'] {
    margin-bottom: 10px;
    border-top-right-radius:0;
    border-top-left-radius:0;
  }

  .checkbox {
    margin-bottom: 10px;
  }

`);

//----------------------------------------------------------------------

exports.doLoginDialog = function(api) {

  var Credentials = @ObservableVar({});

  var CredentialsFilledIn = Credentials ..
    @transform({username,password} ->
             username && username.length >= 4 &&
             password && password.length >= 8) .. @dedupe;

  var Notice = @ObservableVar(undefined);

  var Commands = @Emitter();

  var Keys = element -> element .. @KeyMap(
    {
      'RETURN': {
        filter: -> CredentialsFilledIn .. @current,
        cmd: 'login'
      }
    },
    Commands);

  @mainContent .. @appendContent(
    @field.Field({Value:Credentials}) ::
      @field.FieldMap ::
        @Div .. LoginCSS .. Keys ::
          [
            @H2 :: "Log in to #{app_info.name}",
            @field.Field('username') ..
              @Autofocus ::
                @Div ::
                  [
                    @Input({type:'text',
                            attrs: { placeholder: 'Username' }
                           })
                  ],
            @field.Field('password') ::
              @Div ::
                [
                  @Input({type:'password',
                          attrs: { placeholder: 'Password' }
                         })
                ],
            Notice,
            @Btn('lg primary block', 'Sign in') ..
              @Enabled(CredentialsFilledIn) ..
              @Cmd('login', Commands),

            @Btn('link', 'Forgot username?') ..
              @Cmd('forgot-username', Commands),

            @Btn('link', 'Forgot password?') ..
              @Cmd('forgot-password', Commands),

            @H2 :: 'New User?',
            @Btn('lg block', 'Register') ..
              @Cmd('register', Commands),
            @Btn('lg block', 'Try out anonymously') ..
              @Cmd('anonymous', Commands)
          ]
  ) {
    |node|
    Commands .. @each {
      |command|
      withBusyIndicator {
        |hideBusyIndicator|
        if (command === 'login') {
          var creds = Credentials .. @current;
          creds.password = creds.password .. obscurePassword;
          if (creds .. api.credentialsValid)
            return creds;
          else
            Notice.set('Invalid username or password');
        }
        else if (command === 'anonymous') {
          var creds = {anonymous:true};
          if (creds .. api.credentialsValid)
            return creds;
          else
            Notice.set('Anonymous access currently not allowed');
        }
        else if (command === 'register') {
          hideBusyIndicator();
          var creds = doRegistrationDialog(api);
          if (creds) return creds;
        }
        else if (command === 'forgot-username') {
          hideBusyIndicator();
          // TODO shouldn't this return something ?
          doForgotUsernameDialog(api);
        }
        else if (command === 'forgot-password') {
          hideBusyIndicator();
          // TODO shouldn't this return something ?
          doForgotPasswordDialog(api);
        }
      } /* withBusyIndicator */
    } /* Commands .. @each */
  }
};

//----------------------------------------------------------------------

var isValidEmail = x -> /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(x);

function UsernameWidget(ValidationState) {
  return @field.Field({name:'username', ValidationState:ValidationState}) ::
           @FormGroup ::
             [
               @ControlLabel('Username'),
               @Input()
             ]
}

function EmailWidget(ValidationState) {
  return @field.Field({name:'email', ValidationState:ValidationState}) ..
           @field.Validate(isValidEmail) ::
             @FormGroup ::
               [
                 @ControlLabel('Email'),
                 @Input({type:'email'})
               ]
}

function PasswordWidget(ValidationState, text) {
  return @field.Field({name:'password', ValidationState:ValidationState}) ..
           @field.Validate(x -> x.length >= 8) ::
             @FormGroup ::
               [
                 @ControlLabel("#{text} (8 char min)"),
                 @Input({type:'password'})
               ]
}
exports.PasswordWidget = PasswordWidget;

function FooterWidget(settings) {
  return [
    @Btn('primary', settings.confirmText) ..
      @Enabled(settings.enabled) ..
      // TODO code duplication with Cmd
      @On('click',
          {handle:@dom.preventDefault},
          settings.onConfirm),
    @Btn('default', 'Cancel') ..
      @OnClick(settings.onCancel)
  ];
}

var doSuccessDialog = function (text) {
  @doModal({
    title: text,
    footer: [
      @Btn('default', 'OK') ..
        @Autofocus ..
        @OnClick({ || return false; })
    ]
  }) { || hold(); };
};
exports.doSuccessDialog = doSuccessDialog;

//----------------------------------------------------------------------

var doForgotUsernameDialog = function (api) {
    var Commands = @Emitter();

    var Value = @ObservableVar();

    var EmailValid = @ObservableVar();

    var FilledIn = @observe(EmailValid, function(email) {
      return email.state === 'success';
    });

    var Keys = element -> element .. @KeyMap(
      {
        'RETURN': {
          filter: -> FilledIn .. @current,
          cmd: 'send-email'
        }
      },
      Commands);

    var confirmText = @ObservableVar('Send username to email');

    var success = false;

    @doModal({
      title: 'Forgot username',
      body: @field.Field({Value:Value}) ..
              Keys ..
              @field.FieldMap ::
                @Div ::
                  [
                    EmailWidget(EmailValid) .. 
                      @field.Validate(x -> !api.emailAvailable(x)) ..
                      @Autofocus
                  ],
      footer: FooterWidget({
        enabled: FilledIn,
        confirmText: confirmText,
        onConfirm: function () {
          Commands.emit('send-email');
        },
        onCancel: { || return false; }
      })
    }) { ||
      Commands .. @each { |command|
        if (command == 'send-email') {
          var value = Value ..@current;

          confirmText.set(`$@Icon('send') sending ...`);

          waitfor {
            var rv = api.sendUsernameEmail(value.email);
            // TODO code duplication
            if (rv !== true) {
              // xxx add notice
              console.log('forgot username error:', rv);
              continue;
            }

          } and {
            hold(1500);
          }

          success = true;
          break;
        }
      }
    }

    if (success) {
      doSuccessDialog('Username reminder email sent; please check your inbox!');
    }
  };

//----------------------------------------------------------------------

// TODO code duplication with doForgotUsernameDialog
var doForgotPasswordDialog = function (api) {
    var Commands = @Emitter();

    var Value = @ObservableVar();

    var UsernameValid = @ObservableVar();

    var FilledIn = @observe(UsernameValid, function (username) {
      return username.state === 'success';
    });

    var Keys = element -> element .. @KeyMap(
      {
        'RETURN': {
          filter: -> FilledIn .. @current,
          cmd: 'send-email'
        }
      },
      Commands);

    var confirmText = @ObservableVar('Send email');

    var success = false;

    @doModal({
      title: 'Forgot password',
      body: @field.Field({Value:Value}) ..
              Keys ..
              @field.FieldMap ::
                @Div ::
                  [
                    UsernameWidget(UsernameValid) ..
                      @field.Validate(x -> !api.usernameAvailable(x)) ..
                      @Autofocus,
                  ],
      footer: FooterWidget({
        enabled: FilledIn,
        confirmText: confirmText,
        onConfirm: function () {
          Commands.emit('send-email');
        },
        onCancel: { || return false; }
      })
    }) { ||
      Commands .. @each { |command|
        if (command == 'send-email') {
          var value = Value ..@current;

          confirmText.set(`$@Icon('send') sending ...`);

          waitfor {
            var rv = api.sendPasswordResetEmail(value.username);
            // TODO code duplication
            if (rv !== true) {
              // xxx add notice
              console.log('forgot password error:', rv);
              continue;
            }

          } and {
            hold(1500);
          }

          success = true;
          break;
        }
      }
    }

    if (success) {
      doSuccessDialog('Password reset email sent; please check your inbox!');
    }
  };

//----------------------------------------------------------------------

var doRegistrationDialog =
  function(api) {
    var Registration = @ObservableVar();

    // xxx we want to use the FieldMap's validation_state directly; that
    // will require some work in conductance
    var UsernameValid = @ObservableVar();
    var EmailValid = @ObservableVar();
    var PasswordValid = @ObservableVar();
    var RegistrationFilledIn = @observe(
      UsernameValid, EmailValid, PasswordValid,
      function(username, email, password) {
        return username.state === 'success' &&
          email.state === 'success' &&
          password.state === 'success'
      });


    var Commands = @Emitter();

    var Keys = element -> element .. @KeyMap(
      {
        'RETURN': {
          filter: -> RegistrationFilledIn .. @current,
          cmd: 'register'
        }
      },
      Commands);

    @doModal({
      title: "Register for #{app_info.name}",
      body: @field.Field({Value:Registration}) ..
              Keys ..
              @field.FieldMap /* xxx ..
                                 @field.Validate({password, password_repeat} -> password === password_repeat) */ ::
                @Div ::
                  [
                    UsernameWidget(UsernameValid) ..
                      @field.Validate(api.usernameAvailable) ..
                      @Autofocus,

                    EmailWidget(EmailValid) ..
                      @field.Validate(api.emailAvailable),

                    PasswordWidget(PasswordValid, 'Password'),
/*
                    @field.Field('password_repeat') ::
                        @FormGroup ::
                          [
                            @ControlLabel('Password (repeat)'),
                            @Input({type:'password'})
                          ]
*/
                  ],
      footer: FooterWidget({
        enabled: RegistrationFilledIn,
        confirmText: 'Register',
        onConfirm: function () {
          Commands.emit('register');
        },
        onCancel: { || return false; }
      })
    }) {
      ||
      Commands .. @each {
        |command|
        if (command == 'register') {

          var registration = Registration .. @current;
          registration.password = registration.password .. obscurePassword;

          withBusyIndicator {
            ||
            var rv = api.registerUser(registration);
            if (rv !== true) {
              // xxx add notice
              console.log('registration error:', rv);
              continue;
            }
          }

          return { username: registration.username,
                   password: registration.password
                 };
        }
      }
    }
  };
