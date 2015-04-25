var
    kind = require('enyo/kind'),
    Animator = require('enyo/Animator'),
    Control = require('enyo/Control'),
    Repeater = require('enyo/Repeater');

var
    Checkbox = require('onyx/Checkbox'),
    Drawer = require('onyx/Drawer'),
    Groupbox = require('onyx/Groupbox'),
    GroupboxHeader = require('onyx/GroupboxHeader'),
    Icon = require('onyx/Icon'),
    IconButton = require('onyx/IconButton'),
    InputDecorator = require('onyx/InputDecorator');

var
    Util = require('./Util');

module.exports = kind({
    name: 'cit.PersonBlock',
    kind: Control,
    classes: 'person-block',
    events: {
        onAddGift: '',
        onEditGift: '',
        onRemoveItem: '',
        onSelectItem: '',
        onEditPerson: '',
        onCollapseChange: '',
        onSelectRow: ''
    },
    published: {
        person: '',
        collapsed: false
    },
    components: [
        {kind: Groupbox, components: [
            {kind: GroupboxHeader, components: [
                {kind: IconButton, src: 'assets/edit-light.png', ontap: 'editTapped'},
                {kind: IconButton,src: 'assets/gift-light.png',  ontap: 'giftTapped'},
                {name: 'name', classes: 'name', ontap: 'headerTapped'}
            ]},
            {name: 'drawer', kind: Drawer, components: [
                {name: 'list', kind: Repeater, onSetupItem: 'setupItem', classes: 'item-list', components: [
                    {name: 'row', kind: InputDecorator, ontap: 'rowTapped', components: [
                        {kind: Icon, src: 'images/search-input-cancel.png', ontap: 'iconTapped'},
                        {kind: Icon, src: 'assets/edit.png', ontap: 'editGiftTapped'},
                        {name: 'cb', kind: Checkbox, onchange: 'checkTapped'},
                        {style: 'display: inline-block', components: [
                            {name: 'item'},
                            {name: 'price'}
                        ]}
                    ]}
                ]},
                {name: 'total', kind: InputDecorator, classes: 'total-row', components: [
                    {name: 'amount', style: 'float: right'},
                    {content: 'Total: '}
                ]}
            ]}
        ]},
        {name: 'animator', kind: Animator, duration: 400, endValue: 0, onStep: 'aniStep', onStop: 'aniStop', onEnd: 'aniStop'}
    ],
    create: function () {
        Control.prototype.create.apply(this, arguments);
        this.personChanged();
        this.collapsedChanged();
    },
    setPerson: function (p) {
        // force personChanged calls
        this.set('person', p, true);
    },
    personChanged: function () {
        if(!this.person) return;

        this.$.name.setContent(this.person.name);
        this.$.list.setCount(this.person.items.length);

        this.calcTotal();
    },
    collapsedChanged: function () {
        this.$.drawer.setOpen(!this.collapsed);
    },
    calcTotal: function () {
        this.$.amount.setContent(Util.calcTotal(this.person.items));
    },
    setupItem: function (source, event) {
        var i = this.person.items[event.index];

        event.item.$.item.setContent(i.name);
        event.item.$.price.setContent(Util.formatCurrency(i.amount));
        event.item.$.cb.setChecked(i.selected);

        if(i.url) {
            event.item.$.item.tag = 'a',
            event.item.$.item.setAttributes({
                href: i.url,
                target: '_blank'
            });
        }
    },
    rowTapped: function (source, event) {
        this.doSelectRow({
            row: this.$.list.itemAtIndex(event.index).children[0],
            index: event.index
        });
    },
    headerTapped: function () {
        var state = !this.$.drawer.getOpen();
        this.$.drawer.setOpen(state);
        this.doCollapseChange({
            person: this.person,
            open: state
        });
    },
    nameTapped: function (source, event) {
        var i = this.person.items[event.index];
        if(i.url) {
            window.open(i.url, '_blank');
        }
    },
    giftTapped: function (source, event) {
        this.doAddGift({person: this.person});
    },
    iconTapped: function (source, event) {
        if(this.removeIndex) {
            this.$.animator.stop();
        }

        this.removeIndex = event.index;

        var c = this.$.list.itemAtIndex(event.index).children[0];
        var bounds = c.getBounds();
        this.$.animator.setStartValue(bounds.height);
        this.$.animator.play();
    },
    checkTapped: function (source, event) {
        var i = this.person.items[event.index];
        i.selected = event.originator.checked;
        this.doSelectItem({item: i, selected: i.selected});
        this.calcTotal();
    },
    editGiftTapped: function (source, event) {
        var i = this.person.items[event.index];
        this.doEditGift({item: i});
        this.$.list.renderRow(event.index);
        this.calcTotal();
    },
    editTapped: function () {
        this.doEditPerson({person: this.person});
    },
    aniStep: function (source, event) {
        this.rowHeight = this.$.animator.value;

        var c = this.$.list.itemAtIndex(this.removeIndex);
        c.$.row.applyStyle('padding-top', '0px');
        c.$.row.applyStyle('padding-bottom', '0px');
        c.$.row.applyStyle('height', this.rowHeight+'px');
    },
    aniStop: function (source, event) {
        // hide the list item (as it seems to reappear just before remove)
        this.$.list.itemAtIndex(this.removeIndex).hide();
        this.removeItem(this.removeIndex);
    },
    removeItem: function (index) {
        this.removeIndex = null;
        var i = this.person.items.splice(index, 1)[0];
        this.doRemoveItem({item: i});
        this.$.list.setCount(this.person.items.length);
        this.calcTotal();
    }
});