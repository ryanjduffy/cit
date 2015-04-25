var
    kind = require('enyo/kind');

var
    FittableLayout = require('layout/FittableLayout'),
    FittableColumnsLayout = FittableLayout.Columns;

var
    Popup = require('onyx/Popup'),
    Groupbox = require('onyx/Groupbox'),
    GroupboxHeader = require('onyx/GroupboxHeader'),
    InputDecorator = require('onyx/InputDecorator'),
    Button = require('onyx/Button'),
    Input = require('onyx/Input');

var
    Model = require('./Model');

module.exports = kind({
    name: 'cit.AddGiftPopup',
    kind: Popup,
    classes: 'add-gift-popup',
    centered: true,
    floating: true,
    modal: true,
    scrim: true,
    events: {
        onSaveItem: '',
        onUpdateItem: ''
    },
    handlers: {
        onShow: 'resetFields'
    },
    components: [
        {kind: Groupbox, components: [
            {name: 'header', kind: GroupboxHeader, content: 'Add a Gift'},
            {kind: InputDecorator, components: [
                {name: 'name', kind: Input, placeholder: 'Name of Gift', selectOnFocus: true}
            ]},
            {kind: InputDecorator, components: [
                {name: 'url', kind: Input, placeholder: 'URL', type: 'url'}
            ]},
            {kind: InputDecorator, layoutKind: FittableColumnsLayout, components: [
                {content: '$', style: 'color: #000;padding-right: 3px;'},
                {name: 'amount', kind: Input, placeholder: 'Price', fit: true, style: 'width: auto'}
            ]}
        ]},
        {name: 'message', classes: 'message'},
        {classes: 'buttons', components: [
            {name: 'save', kind: Button, content: 'Save', classes: 'onyx-affirmative', ontap: 'save'},
            {kind: Button, content: 'Cancel', classes: 'onyx-gray', ontap: 'hide'}
        ]},
        {name: 'model', kind: Model}
    ],
    newGift: function (personId) {
        this.item = {
            name: '',
            amount: '',
            url: '',
            person: {'__type': 'Pointer','className': 'person','objectId': personId},
        };
        
        this.show();
        this.$.header.setContent('Add a Gift');
    },
    editGift: function (item) {
        this.item = item;

        this.show();
        this.$.header.setContent('Edit Gift');

        this.$.name.setValue(this.item.name || '');
        this.$.url.setValue(this.item.url || '');
        this.$.amount.setValue(this.item.amount || '');
    },
    setup: function () {
        this.item = this.item || {};

        this.$.name.setValue(this.item.name || '');
        this.$.url.setValue(this.item.url || '');
        this.$.amount.setValue(this.item.amount || '');
    },
    save: function () {
        var name = this.$.name.getValue(),
            url = this.$.url.getValue(),
            amount = this.$.amount.getValue();

        amount = amount.replace(/[^\d\.]/ig, '');

        if(name) {
            this.item.name = name;
            this.item.amount = amount;
            this.item.url = url;

            this.$.save.setDisabled(true);

            this.$.model.saveItem(this.item, this.bindSafely('saved'));
        }
    },
    saved: function (source, event) {
        if(event.response) {
            this.hide();
            this.doSaveItem({item: this.item});
        } else {
            this.$.message.setContent(event.error);
        }
    },
    resetFields: function () {
        this.$.name.setValue('');
        this.$.url.setValue('');
        this.$.amount.setValue('');

        this.$.save.setDisabled(false);

        this.$.name.focus();
    }
});