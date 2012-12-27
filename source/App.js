enyo.kind({
	name: "cit.App",
	fit: true,
    handlers:{
        onAddGift:"addGift",
        onEditGift:"editGift",
        onRemoveItem:"removeItem",
        onSelectItem:"itemSelected",
        onEditPerson:"editPerson",
        onPreferenceChanged:"preferenceChanged"
    },
	components:[
        {name:"panels", kind:"Panels", arrangerKind:"CollapsingArranger", classes:"enyo-fit", realtimeFit:true, draggable:false, components:[
    		{kind:"FittableRows", classes:"panel people", components:[
                {name:"personList", kind:"cit.PersonList", fit:true},
                {kind:"onyx.Toolbar", components:[
                    {kind:"onyx.MenuDecorator", classes:"account-menu", components:[
                        {content:"Account"},
                        {kind:"onyx.Menu", components:[
                            {name:"userMenu"},
                            {classes:"onyx-menu-divider"},
                            {content:"Logout", ontap:"logout"}
                        ]}
                    ]},
                    {kind:"onyx.Button", content:"Add Person", ontap:"addPerson", classes:"add-person-button"},
                    {kind:"onyx.Button", content:"Purchased Gifts", ontap:"showPurchased", classes:"show-purchased-button"}
                ]}
            ]},
            {kind:"FittableRows", classes:"panel list", components:[
                {name:"itemList", kind:"cit.PurchasedGifts", fit:true},
                {kind:"onyx.Toolbar", components:[
                    {kind:"onyx.Button", content:"Gift Lists", ontap:"showGiftLists", classes:"show-giftlists-button"},
                    {kind:"onyx.PickerDecorator", classes:"sort-picker", onChange:"sortChanged", components:[
                        {content:"By Name"},
                        {kind:"onyx.Picker", components:[
                            {content:"By Name", value:"Name"},
                            {content:"By Purchase Date", value:"Date"},
                            {content:"By Price", value:"Price"}
                        ]}
                    ]},
                ]}
            ]}
        ]},
        {name:"loading", kind:"cit.LoadingPopup", onRetry:"fetchData"},
        {name:"login", kind:"cit.LoginPopup", onLogin:"userLogin"},
        {name:"addGift", kind:"cit.AddGiftPopup", onSaveItem:"giftAdded", onUpdateItem:"giftUpdated"},
        {name:"addPerson", kind:"cit.AddPersonPopup", onSave:"personAdded", onDelete:"personDeleted"},
        {name:"model", kind:"cit.Model", onDataLoaded:"dataLoaded", onDataFailed:"dataFailed", onPreferencesLoaded:"prefsLoaded"},
        {name:"prefs", kind:"cit.Preferences", onPreferencesLoaded:"prefsLoaded"}
	],
    create:function() {
        this.inherited(arguments);
        this.people = [];
        this.sortField = "Name";
    },
    rendered:function() {
        this.inherited(arguments);
        this.resized(); // fixes fittables

        enyo.asyncMethod(this, function() {
            if(Parse.RestClient.currentUser()) {
                this.fetchData();
            } else {
                this.$.login.show();
            }
        });
    },
    userLogin:function(source, event) {
        this.fetchData();
    },
    logout:function() {
        Parse.RestClient.setUser();

        this.$.model.reset();
        this.$.personList.setPeople(this.$.model.getPeople());
        this.$.itemList.setItems(this.$.model.getItems());

        this.$.login.show();
    },
    fetchData:function() {
        this.$.userMenu.setContent(Parse.RestClient.currentUser().username);

        this.$.loading.show();
        this.$.model.load();
    },
    dataLoaded:function(source, event) {
        this.$.personList.setPeople(event.people);
        this.$.itemList.setItems(event.items);

        this.$.loading.hide();
    },
    dataFailed:function(source, event) {
        this.$.loading.retry();
    },
    prefsLoaded:function(source, event) {
        this.prefs = event.preferences;
        this.$.personList.setPrefs(this.prefs);
    },

    /* Person Popup */
    addPerson:function() {
        this.$.addPerson.setPerson();
        this.$.addPerson.show();
    },
    editPerson:function(source, event) {
        this.$.addPerson.setPerson(event.person);
        this.$.addPerson.show();
    },
    personAdded:function(source, event) {
        this.refreshPersonList();
    },
    personDeleted:function(source, event) {
        this.refreshPersonList();
        this.refreshItemList();
    },

    /* Gift Popup */
    addGift:function(source, event) {
        this.$.addGift.newGift(event.person.objectId);
    },
    editGift:function(source, event) {
        this.$.addGift.editGift(event.item);
    },
    giftAdded:function(source, event) {
        var p = this.$.model.findPerson(event.item.person.objectId);
        if(p) {
            this.$.personList.refresh(p.index);
        }
    },
    giftUpdated:function(source, event) {
        var p = this.$.model.findPerson(event.item.person.objectId);
        if(p) {
            this.$.personList.refresh(p.index);
        }

        if(event.item.selected) {
            this.refreshItemList();
        }
    },

    /* Global Event Handlers */
    preferenceChanged:function(source, event) {
        this.prefs[event.preference] = this.prefs[event.preference] || {};
        this.prefs[event.preference][event.key] = event.value;
        this.$.prefs.store(this.prefs);
    },
    removeItem:function(source, event) {
        this.$.model.removeItem(event.item.objectId);
        this.refreshItemList();
    },
    itemSelected:function(source, event) {
        this.$.model.selectItem(event.item, event.selected);
        this.refreshItemList();
    },

    /* Toolbar Buttons */
    showPurchased:function() {
        this.$.panels.setIndex(1);
    },
    showGiftLists:function() {
        this.$.panels.setIndex(0);
    },
    sortChanged:function(source, event) {
        this.$.itemList.setSort(event.selected.value);
    },

    /* Utility */

    refreshPersonList:function() {
        this.$.personList.refresh();
    },
    refreshItemList:function() {
        this.$.itemList.refresh();
    }
});