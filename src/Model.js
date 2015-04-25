var
    kind = require('enyo/kind'),
    utils = require('enyo/utils'),
    Component = require('enyo/Component');

var
    Parse = require('./Parse'),
    Preferences = require('./Preferences');

var Model = module.exports = kind({
    name: 'cit.Model',
    kind: Component,
    components: [
        {name: 'ds', kind: Parse},
        {name: 'prefs', kind: Preferences, onPreferencesLoaded: 'prefsLoaded'}
    ],
    events: {
        onPreferencesLoaded: '',
        onDataLoaded: '',
        onDataFailed: ''
    },
    statics: {
        people: [],
        items: [],
        prefs: {}
    },

    /* Data loading */

    reset: function () {
        Model.people = [];
        Model.items = [];
        Model.prefs = {};
    },
    load: function () {
        this.$.prefs.retrieve();
        this.$.ds.run('retrievePeople', null, this.bindSafely('dataReturned'));
    },
    dataReturned: function (source, event) {
        if(event.response) {
            Model.people = event.response.result.people;
            this.loadItemList(Model.people);
            this.doDataLoaded({people: Model.people, items: Model.items});
        } else {
            this.doDataFailed();
        }
    },
    loadItemList: function (people) {
        var items = Model.items = [];
        utils.forEach(people, function (p) {
            utils.forEach(p.items, function (i) {
                i.selected && items.push(i);
            });
        });
    },
    prefsLoaded: function (source, event) {
        Model.prefs = event.preferences;

        this.doPreferencesLoaded({preferences: Model.prefs});
    },

    /* Items */

    getItems: function () {
        return Model.items;
    },
    selectItem: function (item, selected, callback) {
        var i = utils.indexOf(item, Model.items);

        if(selected && i === -1) {
            Model.items.push(item);
        } else if(i >= 0) {
            Model.items.splice(i, 1);
        } else {
            return;
        }

        this.$.ds.update('item', {objectId: item.objectId, selected: selected}, callback);
    },
    saveItem: function (item, callback) {
        if(item.objectId) {
            this.$.ds.update('item', item, this.bindSafely('itemUpdated', callback, item));
        } else {       
            item.ACL = item.ACL || {};
            item.ACL[this.$.ds.currentUser().objectId] = {read: true, write: true};

            this.$.ds.add('item', item, this.bindSafely('itemAdded', callback, item));
        }
    },
    itemUpdated: function (callback, item, source, event) {
        if(event.response) {
            utils.mixin(item, event.response);

            if(item.selected) {
                var i = this.findItem(item.objectId);
                if(i) {
                    Model.items[i.index] = item;
                }
            }

            var p = this.findPerson(item.person.objectId);
            if(p) {
                var i = this.findItem(item.objectId, p.items);
                if(i) {
                    p.items[i.index] = item;
                }
            }
        }

        callback(source, event);
    },
    itemAdded: function (callback, item, source, event) {
        if(event.response) {
            utils.mixin(item, event.response);

            var p = this.findPerson(item.person.objectId);
            if(p) {
                p.person.items.push(item)
            }
        }

        callback(source, event);
    },
    removeItem: function (id, callback) {
        this.$.ds.remove('item', id, callback);
    },
    findItem: function (id, items) {
        var items = items || Model.items;
        for(var i=0,n;n=items[i];i++) {
            if(n.objectId == id) {
                return {item: n, index: i}
            }
        }        
    },

    /* People */

    getPeople: function () {
        return Model.people;
    },
    savePerson: function (person, callback) {
        if(person.objectId) {
            this.$.ds.update('person', {objectId: person.objectId, name: person.name}, this.bindSafely('personUpdated', callback, person));
        } else {
            person.ACL = person.ACL || {};
            person.ACL[this.$.ds.currentUser().objectId] = {read: true, write: true};

            this.$.ds.add('person', person, this.bindSafely('personAdded', callback, person));
        }
    },
    personUpdated: function (callback, person, source, event) {
        if(event.response) {
            utils.mixin(person, event.response);

            var p = this.findPerson(person.objectId);
            if(p) {
                Model.people[p.index] = person;
            }
        }

        callback(event, event);
    },
    personAdded: function (callback, person, source, event) {
        if(event.response) {
            utils.mixin(person, event.response);

            person.items = [];
            Model.people.push(person);
        }

        callback(source, event);
    },
    removePerson: function (person, callback) {
        // TODO: remove items as well (perhaps via function)
        var id = (person instanceof Object) ? person.objectId : person;
        this.$.ds.remove('person', id, this.bindSafely('personRemoved', callback, id));
    },
    personRemoved: function (callback, id, source, event) {
        if(event.response) {
            var p = this.findPerson(id);
            if(p) {
                Model.people.splice(p.index, 1);
            }

            for(var i=0,n;n=p.person.items[i];i++) {
                if(n.selected) {
                    var r = this.findItem(n.objectId);
                    if(r) {
                        Model.items.splice(r.index, 1);
                    }
                }
            }
        }

        callback(source, event);
    },
    findPerson: function (id) {
        for(var i=0,p;p=Model.people[i];i++) {
            if(p.objectId == id) {
                return {person: p, index: i}
            }
        }
    }
});