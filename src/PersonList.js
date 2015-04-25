var
    kind = require('enyo/kind'),
    Repeater = require('enyo/Repeater'),
    Scroller = require('enyo/Scroller');

var
    PersonBlock = require('./PersonBlock');

module.exports = kind({
    name: 'cit.PersonList',
    kind: Scroller,
    published: {
        people: '',
        prefs: ''
    },
    events: {
        onPreferenceChanged: ''
    },
    components: [
        {name: 'list', kind: Repeater, onSetupItem: 'setupPersonBlock', components: [
            {name: 'pb', kind: PersonBlock, onCollapseChange: 'personCollapsed', onSelectRow: 'rowSelected'}
        ]}
    ],
    create: function () {
        Scroller.prototype.create.apply(this, arguments);
        this.peopleChanged();
        this.selectedRow = null;
    },
    peopleChanged: function () {
        this.people = this.people || [];

        this.$.list.setCount(this.people.length);
    },
    prefsChanged: function () {
        this.refresh();
    },
    refresh: function (index) {
        this.selectedRow = null;

        if(index === undefined) {
            this.peopleChanged();
        } else {
            this.$.list.renderRow(index);
        }
    },
    setupPersonBlock: function (source, event) {
        // hack for bubbled onSetupItem
        if(this.$.list !== event.originator) return;

        var p = this.people[event.index];
        if(this.prefs && this.prefs.collapsed[p.objectId]) {
            event.item.$.pb.setCollapsed(true);
        }

        event.item.$.pb.setPerson(p);
    },
    personCollapsed: function (source, event) {
        this.doPreferenceChanged({
            preference: 'collapsed',
            key: event.person.objectId,
            value: !event.open
        });
    },
    rowSelected: function (source, event) {
        if(this.selectedRow) {
            this.selectedRow.removeClass('selected');
        }

        // allow deselection by tapping same row again
        if(this.selectedRow !== event.row) {
            this.selectedRow = event.row;
            this.selectedRow.addClass('selected');
        } else {
            this.selectedRow = null;
        }
    }
});