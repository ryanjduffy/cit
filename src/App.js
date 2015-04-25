var
    kind = require('enyo/kind'),
    utils = require('enyo/utils'),
    Control = require('enyo/Control');

var
    CollapsingArranger = require('layout/CollapsingArranger'),
    FittableRows = require('layout/FittableRows'),
    Panels = require('layout/Panels');

var
    Button = require('onyx/Button'),
    Menu = require('onyx/Menu'),
    MenuDecorator = require('onyx/MenuDecorator'),
    Picker = require('onyx/Picker'),
    PickerDecorator = require('onyx/PickerDecorator'),
    Toolbar = require('onyx/Toolbar');

var
    AddGiftPopup = require('./AddGiftPopup'),
    AddPersonPopup = require('./AddPersonPopup'),
    LoadingPopup = require('./LoadingPopup'),
    LoginPopup = require('./LoginPopup'),
    Model = require('./Model'),
    Parse = require('./Parse'),
    PersonList = require('./PersonList'),
    Preferences = require('./Preferences'),
    PurchasedGifts = require('./PurchasedGifts');

module.exports = kind({
	name: 'cit.App',
    kind: Control,
	fit: true,
    handlers: {
        onAddGift: 'addGift',
        onEditGift: 'editGift',
        onRemoveItem: 'removeItem',
        onSelectItem: 'itemSelected',
        onEditPerson: 'editPerson',
        onPreferenceChanged: 'preferenceChanged'
    },
	components: [
        {name: 'panels', kind: Panels, arrangerKind: CollapsingArranger, classes: 'enyo-fit', realtimeFit: true, draggable: false, components: [
    		{kind: FittableRows, classes: 'panel people', components: [
                {name: 'personList', kind: PersonList, fit: true},
                {kind: Toolbar, components: [
                    {kind: MenuDecorator, classes: 'account-menu', components: [
                        {content: 'Account'},
                        {kind: Menu, components: [
                            {name: 'userMenu'},
                            {classes: 'onyx-menu-divider'},
                            {content: 'Logout', ontap: 'logout'}
                        ]}
                    ]},
                    {kind: Button, content: 'Add Person', ontap: 'addPerson', classes: 'add-person-button'},
                    {kind: Button, content: 'Purchased Gifts', ontap: 'showPurchased', classes: 'show-purchased-button'}
                ]}
            ]},
            {kind: FittableRows, classes: 'panel list', components: [
                {name: 'itemList', kind: PurchasedGifts, fit: true},
                {kind: Toolbar, components: [
                    {kind: Button, content: 'Gift Lists', ontap: 'showGiftLists', classes: 'show-giftlists-button'},
                    {kind: PickerDecorator, classes: 'sort-picker', onChange: 'sortChanged', components: [
                        {content: 'By Name'},
                        {kind: Picker, components: [
                            {content: 'By Name', value: 'Name'},
                            {content: 'By Purchase Date', value: 'Date'},
                            {content: 'By Price', value: 'Price'}
                        ]}
                    ]},
                ]}
            ]}
        ]},
        {name: 'loading', kind: LoadingPopup, onRetry: 'fetchData'},
        {name: 'login', kind: LoginPopup, onLogin: 'userLogin'},
        {name: 'addGift', kind: AddGiftPopup, onSaveItem: 'giftAdded', onUpdateItem: 'giftUpdated'},
        {name: 'addPerson', kind: AddPersonPopup, onSave: 'personAdded', onDelete: 'personDeleted'},
        {name: 'model', kind: Model, onDataLoaded: 'dataLoaded', onDataFailed: 'dataFailed', onPreferencesLoaded: 'prefsLoaded'},
        {name: 'prefs', kind: Preferences, onPreferencesLoaded: 'prefsLoaded'},
        {name: 'parse', kind: Parse}
	],
    create: function () {
        Control.prototype.create.apply(this, arguments);
        this.people = [];
        this.sortField = 'Name';
    },
    rendered: function () {
        Control.prototype.rendered.apply(this, arguments);
        this.resize(); // fixes fittables

        utils.asyncMethod(this, function () {
            if(this.$.parse.currentUser()) {
                this.fetchData();
            } else {
                this.$.login.show();
            }
        });
    },
    userLogin: function(source, event) {
        this.fetchData();
    },
    logout: function () {
        this.$.parse.logout();

        this.$.model.reset();
        this.$.personList.setPeople(this.$.model.getPeople());
        this.$.itemList.setItems(this.$.model.getItems());

        this.$.login.show();
    },
    fetchData: function () {
        this.$.userMenu.setContent(this.$.parse.currentUser().username);

        this.$.loading.show();
        this.$.model.load();
    },
    dataLoaded: function(source, event) {
        this.$.personList.setPeople(event.people);
        this.$.itemList.setItems(event.items);

        this.$.loading.hide();
    },
    dataFailed: function(source, event) {
        this.$.loading.retry();
    },
    prefsLoaded: function(source, event) {
        this.prefs = event.preferences;
        this.$.personList.setPrefs(this.prefs);
    },

    /* Person Popup */
    addPerson: function () {
        this.$.addPerson.setPerson();
        this.$.addPerson.show();
    },
    editPerson: function(source, event) {
        this.$.addPerson.setPerson(event.person);
        this.$.addPerson.show();
    },
    personAdded: function(source, event) {
        this.refreshPersonList();
    },
    personDeleted: function(source, event) {
        this.refreshPersonList();
        this.refreshItemList();
    },

    /* Gift Popup */
    addGift: function(source, event) {
        this.$.addGift.newGift(event.person.objectId);
    },
    editGift: function(source, event) {
        this.$.addGift.editGift(event.item);
    },
    giftAdded: function(source, event) {
        var p = this.$.model.findPerson(event.item.person.objectId);
        if(p) {
            this.$.personList.refresh(p.index);
        }
    },
    giftUpdated: function(source, event) {
        var p = this.$.model.findPerson(event.item.person.objectId);
        if(p) {
            this.$.personList.refresh(p.index);
        }

        if(event.item.selected) {
            this.refreshItemList();
        }
    },

    /* Global Event Handlers */
    preferenceChanged: function(source, event) {
        this.prefs[event.preference] = this.prefs[event.preference] || {};
        this.prefs[event.preference][event.key] = event.value;
        this.$.prefs.store(this.prefs);
    },
    removeItem: function(source, event) {
        this.$.model.removeItem(event.item.objectId);
        this.refreshItemList();
    },
    itemSelected: function(source, event) {
        this.$.model.selectItem(event.item, event.selected);
        this.refreshItemList();
    },

    /* Toolbar Buttons */
    showPurchased: function () {
        this.$.panels.setIndex(1);
    },
    showGiftLists: function () {
        this.$.panels.setIndex(0);
    },
    sortChanged: function(source, event) {
        this.$.itemList.setSort(event.selected.value);
    },

    /* Utility */

    refreshPersonList: function () {
        this.$.personList.refresh();
    },
    refreshItemList: function () {
        this.$.itemList.refresh();
    }
});