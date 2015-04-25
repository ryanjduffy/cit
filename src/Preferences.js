var
    kind = require('enyo/kind'),
    utils = require('enyo/utils'),
    Component = require('enyo/Component');

var
    Parse = require('./Parse');

var Preferences = module.exports = kind({
    name: 'cit.Preferences',
    kind: Component,
    statics: {
        loaded: false,
        preferences: {
            collapsed: {}
        }
    },
    events: {
        onPreferencesLoaded: ''
    },
    components: [
        {name: 'parse', kind: Parse}
    ],
    retrieve: function () {
       if(Preferences.loaded) {
            this.doPreferencesLoaded({preferences: Preferences.preferences});
        } else {
            this.$.parse.search('preferences', {}, this.bindSafely('prefsLoaded'));
        }
    },
    prefsLoaded: function (sender, event) {
        var p = Preferences;
        if(event.response) {
           p.preferences = utils.mixin(p.preferences, event.response.results[0] || {});
           p.loaded = true;
           this.doPreferencesLoaded({preferences: p.preferences});
        } else {
            this.log(event.error);
        }
    },
    store: function (prefs) {
        if(!Preferences.loaded) return;

        prefs = utils.mixin(Preferences.preferences, prefs);

        if(prefs.objectId) {
            // defer the save for a bit so we don't cause too many network hops
            // consider localStorage backup
            this.startJob('save-prefs', this.bindSafely('savePrefs'), 5000);
        } else {
            // save immediately the first time
            this.savePrefs();
        }
    },
    savePrefs: function () {
        var prefs = Preferences.preferences;
        if(prefs.objectId) {
            this.$.parse.update('preferences', prefs, this.bindSafely('prefsUpdated'));
        } else {
            prefs.ACL = {};
            prefs.ACL[this.$.parse.currentUser().objectId] = {read: true, write: true};
            
            this.$.parse.add('preferences', prefs, this.bindSafely('prefsAdded'))
        }
    },
    prefsAdded: function (sender, event) {
        if(event.response) {
            Preferences.preferences.objectId = event.response.objectId
        } else {
            this.log(event.error);
        }
    },
    prefsUpdated: function (sender, event) {
        if(event.error) {
            this.log(event.error);
        }
    }
});