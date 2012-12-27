enyo.kind({
    name:"cit.PersonBlock",
    classes:"person-block",
    events:{
        onAddGift:"",
        onEditGift:"",
        onRemoveItem:"",
        onSelectItem:"",
        onEditPerson:"",
        onCollapseChange:"",
        onSelectRow:""
    },
    published:{
        person:"",
        collapsed:false
    },
    components:[
        {kind:"onyx.Groupbox", components:[
            {kind:"onyx.GroupboxHeader", components:[
                {kind:"onyx.IconButton", src:"assets/edit-light.png", ontap:"editTapped"},
                {kind:"onyx.IconButton",src:"assets/gift-light.png",  ontap:"giftTapped"},
                {name:"name", classes:"name", ontap:"headerTapped"}
            ]},
            {name:"drawer", kind:"onyx.Drawer", components:[
                {name:"list", kind:"Repeater", onSetupItem:"setupItem", classes:"item-list", components:[
                    {name:"row", kind:"onyx.InputDecorator", ontap:"rowTapped", components:[
                        {kind:"onyx.Icon", src:"lib/onyx/images/search-input-cancel.png", ontap:"iconTapped"},
                        {kind:"onyx.Icon", src:"assets/edit.png", ontap:"editGiftTapped"},
                        {name:"cb", kind:"onyx.Checkbox", onchange:"checkTapped"},
                        {style:"display:inline-block", components:[
                            {name:"item"},
                            {name:"price"}
                        ]}
                    ]}
                ]},
                {name:"total", kind:"onyx.InputDecorator", classes:"total-row", components:[
                    {name:"amount", style:"float:right"},
                    {content:"Total: "}
                ]}
            ]}
        ]},
        {name:"animator", kind:"Animator", duration:400, endValue:0, onStep:"aniStep", onStop:"aniStop", onEnd:"aniStop"}
    ],
    create:function() {
        this.inherited(arguments);
        this.personChanged();
        this.collapsedChanged();
    },
    setPerson:function(p) {
        // force personChanged calls
        this.setPropertyValue("person", p, "personChanged");
    },
    personChanged:function() {
        if(!this.person) return;

        this.$.name.setContent(this.person.name);
        this.$.list.setCount(this.person.items.length);

        this.calcTotal();
    },
    collapsedChanged:function() {
        this.$.drawer.setOpen(!this.collapsed);
    },
    calcTotal:function() {
        this.$.amount.setContent(cit.Util.calcTotal(this.person.items));
    },
    setupItem:function(source, event) {
        var i = this.person.items[event.index];

        event.item.$.item.setContent(i.name);
        event.item.$.price.setContent(cit.Util.formatCurrency(i.amount));
        event.item.$.cb.setChecked(i.selected);

        if(i.url) {
            event.item.$.item.tag = "a",
            event.item.$.item.setAttributes({
                href:i.url,
                target:"_blank"
            });
        }
    },
    rowTapped:function(source, event) {
        this.doSelectRow({
            row:this.$.list.itemAtIndex(event.index).children[0],
            index:event.index
        });
    },
    headerTapped:function() {
        var state = !this.$.drawer.getOpen();
        this.$.drawer.setOpen(state);
        this.doCollapseChange({open:state})
    },
    nameTapped:function(source, event) {
        var i = this.person.items[event.index];
        if(i.url) {
            window.open(i.url, "_blank");
        }
    },
    giftTapped:function(source, event) {
        this.doAddGift({person:this.person});
    },
    iconTapped:function(source, event) {
        if(this.removeIndex) {
            this.$.animator.stop();
        }

        this.removeIndex = event.index;

        var c = this.$.list.itemAtIndex(event.index).children[0];
        var bounds = c.getBounds();
        this.$.animator.setStartValue(bounds.height);
        this.$.animator.play();
    },
    checkTapped:function(source, event) {
        var i = this.person.items[event.index];
        i.selected = source.getChecked();
        this.doSelectItem({item:i, selected:i.selected});
        this.calcTotal();
    },
    editGiftTapped:function(source, event) {
        var i = this.person.items[event.index];
        this.doEditGift({item:i});
        this.$.list.renderRow(event.index);
        this.calcTotal();
    },
    editTapped:function() {
        this.doEditPerson({person:this.person});
    },
    aniStep:function(source, event) {
        this.rowHeight = this.$.animator.value;

        var c = this.$.list.itemAtIndex(this.removeIndex);
        c.$.row.applyStyle("padding-top", "0px");
        c.$.row.applyStyle("padding-bottom", "0px");
        c.$.row.applyStyle("height", this.rowHeight+"px");
    },
    aniStop:function(source, event) {
        // hide the list item (as it seems to reappear just before remove)
        this.$.list.itemAtIndex(this.removeIndex).hide();
        this.removeItem(this.removeIndex);
    },
    removeItem:function(index) {
        this.removeIndex = null;
        var i = this.person.items.splice(index, 1)[0];
        this.doRemoveItem({item:i});
        this.$.list.setCount(this.person.items.length);
        this.calcTotal();
    }
});