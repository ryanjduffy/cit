enyo.kind({
    name:"cit.Preferences",
    kind:"Component",
    statics:{
        loaded:false,
        preferences:{
            collapsed:{}
        }
    },
    events:{
        onPreferencesLoaded:""
    },
    components:[
        {name:"parse", kind:"cit.Parse"}
    ],
    get:function() {
       if(cit.Preferences.loaded) {
            this.doPreferencesLoaded({preferences:cit.Preferences.preferences});
        } else {
            this.$.parse.search("preferences", {}, enyo.bind(this, "prefsLoaded"));
        }
    },
    prefsLoaded:function(sender, event) {
        var p = cit.Preferences;
        if(event.response) {
           p.preferences = enyo.mixin(p.preferences, event.response.results[0] || {});
           p.loaded = true;
           this.doPreferencesLoaded({preferences:p.preferences});
        } else {
            this.log(event.error);
        }
    },
    store:function(prefs) {
        if(!cit.Preferences.loaded) return;

        prefs = enyo.mixin(cit.Preferences.preferences, prefs);

        if(prefs.objectId) {
            // defer the save for a bit so we don't cause too many network hops
            // consider localStorage backup
            enyo.job("save-prefs", enyo.bind(this, "savePrefs"), 5000);
        } else {
            // save immediately the first time
            this.savePrefs();
        }
    },
    savePrefs:function() {
        var prefs = cit.Preferences.preferences;
        if(prefs.objectId) {
            this.$.parse.update("preferences", prefs, enyo.bind(this, "prefsUpdated"));
        } else {
            prefs.ACL = {};
            prefs.ACL[this.$.parse.currentUser().objectId] = {read:true, write:true};
            
            this.$.parse.add("preferences", prefs, enyo.bind(this, "prefsAdded"))
        }
    },
    prefsAdded:function(sender, event) {
        if(event.response) {
            cit.Preferences.preferences.objectId = event.response.objectId
        } else {
            this.log(event.error);
        }
    },
    prefsUpdated:function(sender, event) {
        if(event.error) {
            this.log(event.error);
        }
    }
});