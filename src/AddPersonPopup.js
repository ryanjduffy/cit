var
    kind = require('enyo/kind');

var
    Button = require('onyx/Button'),
    Groupbox = require('onyx/Groupbox'),
    GroupboxHeader = require('onyx/GroupboxHeader'),
    Input = require('onyx/Input'),
    InputDecorator = require('onyx/InputDecorator'),
    Popup = require('onyx/Popup');

var
    Model = require('./Model');

module.exports = kind({
    name: 'cit.AddPersonPopup',
    kind: Popup,
    classes: 'add-person-popup',
    centered: true,
    floating: true,
    modal: true,
    scrim: true,
    published: {
        person: ''
    },
    events: {
        onSave: '',
        onDelete: ''
    },
    handlers: {
        onShow: 'resetFields'
    },
    components: [
        {kind: Groupbox, components: [
            {name: 'header', kind: GroupboxHeader, content: 'Add a Person'},
            {kind: InputDecorator, components: [
                {name: 'name', kind: Input, selectOnFocus: true, placeholder: 'Name'}
            ]}
        ]},
        {name: 'messages', classes: 'messages'},
        {name: 'buttons', classes: 'buttons', components: [
            {name: 'save', kind: Button, content: 'Save', classes: 'onyx-affirmative', ontap: 'save'},
            {name: 'deletePerson', kind: Button, content: 'Delete', classes: 'onyx-negative', showing: false, ontap: 'deletePerson'},
            {name: 'cancel', kind: Button, content: 'Cancel', classes: 'onyx-gray', ontap: 'hide'}
        ]},
        {name: 'model', kind: Model}
    ],
    save: function () {
        var name = this.$.name.getValue();

        if(name) {
            this.person.name = name;
            this.$.model.savePerson(this.person, this.bindSafely('saved'));
            this.enableButtons(false);
        }
    },
    saved: function (source, event) {
        if(event.response) {
            this.hide();
            this.doSave({person: this.person, update: this.editMode});
        } else {
            this.$.messages.setContent('Unable to add a person at this time');
            this.log(event.error);
        }
    },
    deletePerson: function () {
        this.enableButtons(false);
        this.$.model.removePerson(this.person, this.bindSafely('deleted'));
    },
    deleted: function (source, event) {
        if(event.response) {
            this.doDelete({person: this.person});
            this.setPerson();
            this.hide();
        } else {
            this.$.messages.setContent('A problem occurred deleting this person');
            this.log(event.error);
        }
    },
    resetFields: function () {
        this.$.messages.setContent('');
        this.personChanged();
        this.enableButtons(true);

        this.$.name.focus();
    },
    enableButtons: function (enabled) {
        this.$.save.setDisabled(!enabled);
        this.$.deletePerson.setDisabled(!enabled);
        this.$.cancel.setDisabled(!enabled);
    },
    personChanged: function () {
        this.person = this.person || {name: ''};

        this.$.header.setContent(this.person.objectId ? 'Edit Person' : 'Add a Person');
        
        this.$.name.setValue(this.person.name);
        this.$.deletePerson.setShowing(!!this.person.objectId);
    }
});