enyo.kind({
    name:"cit.Model",
    kind:"Component",
    components:[
        {name:"ds", kind:"cit.Parse"},
        {name:"prefs", kind:"cit.Preferences", onPreferencesLoaded:"prefsLoaded"}
    ],
    events:{
        onPreferencesLoaded:"",
        onDataLoaded:"",
        onDataFailed:""
    },
    statics:{
        people:[],
        items:[],
        prefs:{}
    },

    /* Data loading */

    reset:function() {
        cit.Model.people = [];
        cit.Model.items = [];
        cit.Model.prefs = {};
    },
    load:function() {
        this.$.prefs.get();
        this.$.ds.run("retrievePeople", null, enyo.bind(this, "dataReturned"));
    },
    dataReturned:function(source, event) {
        if(event.response) {
            cit.Model.people = event.response.result.people;
            this.loadItemList(cit.Model.people);
            this.doDataLoaded({people:cit.Model.people, items:cit.Model.items});
        } else {
            this.doDataFailed();
        }
    },
    loadItemList:function(people) {
        var items = cit.Model.items = [];
        enyo.forEach(people, function(p) {
            enyo.forEach(p.items, function(i) {
                i.selected && items.push(i);
            });
        });
    },
    prefsLoaded:function(source, event) {
        cit.Model.prefs = event.preferences;

        this.doPreferencesLoaded({preferences:cit.Model.prefs});
    },

    /* Items */

    getItems:function() {
        return cit.Model.items;
    },
    selectItem:function(item, selected, callback) {
        var i = enyo.indexOf(item, cit.Model.items);

        if(selected && i === -1) {
            cit.Model.items.push(item);
        } else if(i >= 0) {
            cit.Model.items.splice(i, 1);
        } else {
            return;
        }

        this.$.ds.update("item", {objectId:item.objectId, selected:selected}, callback);
    },
    saveItem:function(item, callback) {
        if(item.objectId) {
            this.$.ds.update("item", item, enyo.bind(this, "itemUpdated", callback, item));
        } else {       
            item.ACL = item.ACL || {};
            item.ACL[this.$.ds.currentUser().objectId] = {read:true, write:true};

            this.$.ds.add("item", item, enyo.bind(this, "itemAdded", callback, item));
        }
    },
    itemUpdated:function(callback, item, source, event) {
        if(event.response) {
            enyo.mixin(item, event.response);

            if(item.selected) {
                var i = this.findItem(item.objectId);
                if(i) {
                    cit.Model.items[i.index] = item;
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
    itemAdded:function(callback, item, source, event) {
        if(event.response) {
            enyo.mixin(item, event.response);

            var p = this.findPerson(item.person.objectId);
            if(p) {
                p.person.items.push(item)
            }
        }

        callback(source, event);
    },
    removeItem:function(id, callback) {
        this.$.ds.remove("item", id, callback);
    },
    findItem:function(id, items) {
        var items = items || cit.Model.items;
        for(var i=0,n;n=items[i];i++) {
            if(n.objectId == id) {
                return {item:n, index:i}
            }
        }        
    },

    /* People */

    getPeople:function() {
        return cit.Model.people;
    },
    savePerson:function(person, callback) {
        if(person.objectId) {
            this.$.ds.update("person", {objectId:person.objectId, name:person.name}, enyo.bind(this, "personUpdated", callback, person));
        } else {
            person.ACL = person.ACL || {};
            person.ACL[this.$.ds.currentUser().objectId] = {read:true, write:true};

            this.$.ds.add("person", person, enyo.bind(this, "personAdded", callback, person));
        }
    },
    personUpdated:function(callback, person, source, event) {
        if(event.response) {
            enyo.mixin(person, event.response);

            var p = this.findPerson(person.objectId);
            if(p) {
                cit.Model.people[p.index] = person;
            }
        }

        callback(event, event);
    },
    personAdded:function(callback, person, source, event) {
        if(event.response) {
            enyo.mixin(person, event.response);

            person.items = [];
            cit.Model.people.push(person);
        }

        callback(source, event);
    },
    removePerson:function(person, callback) {
        // TODO: remove items as well (perhaps via function)
        var id = (person instanceof Object) ? person.objectId : person;
        this.$.ds.remove("person", id, enyo.bind(this, "personRemoved", callback, id));
    },
    personRemoved:function(callback, id, source, event) {
        if(event.response) {
            var p = this.findPerson(id);
            if(p) {
                cit.Model.people.splice(p.index, 1);
            }

            for(var i=0,n;n=p.person.items[i];i++) {
                if(n.selected) {
                    var r = this.findItem(n.objectId);
                    if(r) {
                        cit.Model.items.splice(r.index, 1);
                    }
                }
            }
        }

        callback(source, event);
    },
    findPerson:function(id) {
        for(var i=0,p;p=cit.Model.people[i];i++) {
            if(p.objectId == id) {
                return {person:p, index:i}
            }
        }
    }
});