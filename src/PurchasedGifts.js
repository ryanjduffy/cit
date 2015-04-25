var
    kind = require('enyo/kind'),
    Repeater = require('enyo/Repeater'),
    Scroller = require('enyo/Scroller');

var
    Groupbox = require('onyx/Groupbox'),
    GroupboxHeader = require('onyx/GroupboxHeader'),
    InputDecorator = require('onyx/InputDecorator');

var
    Util = require('./Util');

module.exports = kind({
    name: 'cit.PurchasedGifts',
    kind: Scroller,
    published: {
        items: '',
        sort: 'Name'
    },
    components: [
        {kind: Groupbox, components: [
            {kind: GroupboxHeader, classes: 'purchased-gifts-header', components: [
                {content: 'Purchased Gifts'}
            ]},
            {name: 'itemList', kind: Repeater, fit: true, onSetupItem: 'setupItem', classes: 'item-list', components: [
                {kind: InputDecorator, components: [
                    {name: 'amount', style: 'float: right'},
                    {name: 'name'}
                ]} 
            ]},
            {name: 'total', kind: InputDecorator, classes: 'total-row', components: [
                {name: 'totalAmount', content: '$0.00', style: 'float: right'},
                {content: 'Total'}
            ]} 
        ]}
    ],
    create: function () {
        this.inherited(arguments);
        this.itemsChanged();
    },
    itemsChanged: function () {
        this.items = this.items || [];

        this.items.sort(this['sortBy'+this.sort]);

        this.$.totalAmount.setContent(Util.calcTotal(this.items));
        this.$.itemList.setCount(this.items.length);
        this.$.itemList.resize();
    },
    refresh: function () {
        this.itemsChanged();
    },
    setupItem: function (source, event) {
        // hack for bubbled onSetupItem
        if(this.$.itemList !== source) return;

        var i = this.items[event.index];
        event.item.$.name.setContent(i.name);
        event.item.$.amount.setContent(Util.formatCurrency(i.amount) || '$0.00');
    },
    sortChanged: function () {
        this.refresh();
    },
    sortByName: function (a, b) {
        var na = a.name.toLowerCase();
        var nb = b.name.toLowerCase();

        if(na < nb) {
            return -1;
        } else if(na > nb) {
            return 1
        } else {
            return 0;
        }
    },
    sortByPrice: function (a,b) {
        var na = parseFloat(a.amount) || 0;
        var nb = parseFloat(b.amount) || 0;

        return na-nb;
    },
    sortByDate: function (a, b) {
        var na = new Date(a.updatedAt);
        var nb = new Date(b.updatedAt);

        if(na < nb) {
            return -1;
        } else if(na > nb) {
            return 1
        } else {
            return 0;
        }
    }
});