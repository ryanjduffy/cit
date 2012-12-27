enyo.kind({
    name:"cit.LoginPopup",
    kind:"onyx.Popup",
    classes:"login-popup",
    centered:true,
    floating:true,
    modal:true,
    autoDismiss:false,
    scrim:true,
    events:{
        onLogin:""
    },
    handlers:{
        onLogin:"resetFields",
        onShow:"resetFields"
    },
    components:[
        {kind:"onyx.Groupbox", components:[
            {kind:"onyx.GroupboxHeader", content:"Login"},
            {kind:"onyx.InputDecorator", components:[
                {name:"username", kind:"onyx.Input", placeholder:"Email", selectOnFocus:true, type:"email", attributes:{"x-palm-disable-auto-cap":"true"}, onkeyup:"keyup"}
            ]},
            {kind:"onyx.InputDecorator", components:[
                {name:"password", kind:"onyx.Input", placeholder:"Password", selectOnFocus:true, type:"password", onkeyup:"keyup"}
            ]}
        ]},
        {name:"message", classes:"message"},
        {classes:"buttons", components:[
            {name:"login", kind:"onyx.Button", content:"Login", classes:"onyx-blue", ontap:"loginUser"},
            {name:"create", kind:"onyx.Button", content:"Create Account", classes:"onyx-affirmative", ontap:"createUser"}
        ]},
        {name:"model", kind:"cit.Parse"}
    ],
    keyup:function(source, event) {
        if(event.which == 13) {
            this.loginUser();
        }
    },
    createUser:function() {
        var username = this.$.username.getValue(),
            password = this.$.password.getValue();

        if(username && password) {
            this.enableButtons(false);
            this.$.model.createUser(username, password, {email:username}, enyo.bind(this, "userCreated", username));
        }
    },
    // have to bind username in because parse doesn't return it on creates, just logins
    userCreated:function(username, source, event) {
        if(event.response) {
            enyo.mixin(event.response, {username:username});
            
            this.hide();
            this.doLogin({user:event.response});
        } else {
            this.$.message.setContent(event.error);
            this.log(event.code, event.error);
        }
    },
    loginUser:function() {
        var username = this.$.username.getValue(),
            password = this.$.password.getValue();

        if(username && password) {
            this.enableButtons(false);
            this.$.model.login(username, password, enyo.bind(this, "userLoggedIn"));
        }
    },
    userLoggedIn:function(source, event) {
        if(event.response) {
            this.hide();
            this.doLogin({user:event.response});
        } else {
            this.$.password.focus();
            this.$.message.setContent("Login failed. Please try again.");
            this.log(event.code, event.error);
        }
    },
    enableButtons:function(enabled) {
        this.$.login.setDisabled(!enabled);
        this.$.create.setDisabled(!enabled);
    },
    resetFields:function() {
        this.$.username.setValue("");
        this.$.password.setValue("");
        this.$.message.setContent("");

        this.$.username.focus();
        this.enableButtons(true);
    }
});