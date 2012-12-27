enyo.kind({
    name:"cit.AddGiftPopup",
    kind:"onyx.Popup",
    classes:"add-gift-popup",
    centered:true,
    floating:true,
    modal:true,
    scrim:true,
    events:{
        onSaveItem:"",
        onUpdateItem:""
    },
    handlers:{
        onShow:"resetFields"
    },
    components:[
        {kind:"onyx.Groupbox", components:[
            {name:"header", kind:"onyx.GroupboxHeader", content:"Add a Gift"},
            {kind:"onyx.InputDecorator", components:[
                {name:"name", kind:"onyx.Input", placeholder:"Name of Gift", selectOnFocus:true}
            ]},
            {kind:"onyx.InputDecorator", components:[
                {name:"url", kind:"onyx.Input", placeholder:"URL", type:"url"}
            ]},
            {kind:"onyx.InputDecorator", layoutKind:"FittableColumnsLayout", components:[
                {content:"$", style:"color:#000;padding-right:3px;"},
                {name:"amount", kind:"onyx.Input", placeholder:"Price", fit:true, style:"width:auto"}
            ]}
        ]},
        {name:"message", classes:"message"},
        {classes:"buttons", components:[
            {name:"save", kind:"onyx.Button", content:"Save", classes:"onyx-affirmative", ontap:"save"},
            {kind:"onyx.Button", content:"Cancel", classes:"onyx-gray", ontap:"hide"}
        ]},
        {name:"model", kind:"cit.Model"}
    ],
    newGift:function(personId) {
        this.item = {
            name:"",
            amount:"",
            url:"",
            person:{"__type":"Pointer","className":"person","objectId":personId},
        };
        
        this.show();
        this.$.header.setContent("Add a Gift");
    },
    editGift:function(item) {
        this.item = item;

        this.show();
        this.$.header.setContent("Edit Gift");

        this.$.name.setValue(this.item.name || "");
        this.$.url.setValue(this.item.url || "");
        this.$.amount.setValue(this.item.amount || "");
    },
    setup:function() {
        this.item = this.item || {};

        this.$.name.setValue(this.item.name || "");
        this.$.url.setValue(this.item.url || "");
        this.$.amount.setValue(this.item.amount || "");
    },
    save:function() {
        var name = this.$.name.getValue(),
            url = this.$.url.getValue(),
            amount = this.$.amount.getValue();

        amount = amount.replace(/[^\d\.]/ig, "");

        if(name) {
            this.item.name = name;
            this.item.amount = amount;
            this.item.url = url;

            this.$.save.setDisabled(true);

            this.$.model.saveItem(this.item, enyo.bind(this, "saved"));
        }
    },
    saved:function(source, event) {
        if(event.response) {
            this.hide();
            this.doSaveItem({item:this.item});
        } else {
            this.$.message.setContent(event.error);
        }
    },
    resetFields:function() {
        this.$.name.setValue("");
        this.$.url.setValue("");
        this.$.amount.setValue("");

        this.$.save.setDisabled(false);

        this.$.name.focus();
    }
});