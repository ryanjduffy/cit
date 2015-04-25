var
    kind = require('enyo/kind'),
    utils = require('enyo/utils');

var
    Button = require('onyx/Button'),
    Groupbox = require('onyx/Groupbox'),
    GroupboxHeader = require('onyx/GroupboxHeader'),
    Input = require('onyx/Input'),
    InputDecorator = require('onyx/InputDecorator'),
    Popup = require('onyx/Popup');

var
    Parse = require('./Parse');

module.exports = kind({
    name: 'cit.LoginPopup',
    kind: Popup,
    classes: 'login-popup',
    centered: true,
    floating: true,
    modal: true,
    autoDismiss: false,
    scrim: true,
    events: {
        onLogin: ''
    },
    handlers: {
        onLogin: 'resetFields',
        onShow: 'resetFields'
    },
    components: [
        {kind: Groupbox, components: [
            {kind: GroupboxHeader, content: 'Login'},
            {kind: InputDecorator, components: [
                {name: 'username', kind: Input, placeholder: 'Email', selectOnFocus: true, type: 'email', attributes: {'x-palm-disable-auto-cap': 'true'}, onkeyup: 'keyup'}
            ]},
            {kind: InputDecorator, components: [
                {name: 'password', kind: Input, placeholder: 'Password', selectOnFocus: true, type: 'password', onkeyup: 'keyup'}
            ]}
        ]},
        {name: 'message', classes: 'message'},
        {classes: 'buttons', components: [
            {name: 'login', kind: Button, content: 'Login', classes: 'onyx-blue', ontap: 'loginUser'},
            {name: 'create', kind: Button, content: 'Create Account', classes: 'onyx-affirmative', ontap: 'createUser'}
        ]},
        {name: 'model', kind: Parse}
    ],
    keyup: function (source, event) {
        if(event.which == 13) {
            this.loginUser();
        }
    },
    createUser: function () {
        var username = this.$.username.getValue(),
            password = this.$.password.getValue();

        if(username && password) {
            this.enableButtons(false);
            this.$.model.createUser(username, password, {email: username}, this.bindSafely('userCreated', username));
        }
    },
    // have to bind username in because parse doesn't return it on creates, just logins
    userCreated: function (username, source, event) {
        if(event.response) {
            utils.mixin(event.response, {username: username});
            
            this.hide();
            this.doLogin({user: event.response});
        } else {
            this.$.message.setContent(event.error);
            this.log(event.code, event.error);
        }
    },
    loginUser: function () {
        var username = this.$.username.getValue(),
            password = this.$.password.getValue();

        if(username && password) {
            this.enableButtons(false);
            this.$.model.login(username, password, this.bindSafely('userLoggedIn'));
        }
    },
    userLoggedIn: function (source, event) {
        if(event.response) {
            this.hide();
            this.doLogin({user: event.response});
        } else {
            this.$.password.focus();
            this.$.message.setContent('Login failed. Please try again.');
            this.log(event.code, event.error);
        }
    },
    enableButtons: function (enabled) {
        this.$.login.setDisabled(!enabled);
        this.$.create.setDisabled(!enabled);
    },
    resetFields: function () {
        this.$.username.setValue('');
        this.$.password.setValue('');
        this.$.message.setContent('');

        this.$.username.focus();
        this.enableButtons(true);
    }
});