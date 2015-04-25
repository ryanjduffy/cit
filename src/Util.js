module.exports = {
    formatCurrency: function (amount) {
        amount = parseFloat(amount);
        if (!!amount) {
            return Math.round(amount*100).toString().replace(/(\d*)(\d{2})$/, '$$$1.$2');
        } else {
            return ''
        }        
    },
    calcTotal: function (items) {
        var total = 0;
        for (var i = 0, n; n = items[i]; i++) {
            if (n.selected) {
                var price = parseFloat(n.amount);
                if(!isNaN(price)) {
                    total += price;
                }
            }
        }

        if (total) {
            return this.formatCurrency(total);
        } else {
            return '$0.00';
        }
    }
};