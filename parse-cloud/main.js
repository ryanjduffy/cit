Parse.Cloud.define("retrievePeople", function(req, resp) {
    var results = [],
        messages = [],
        people = [],
        items = [],
        _people = [];

    function error(chain, msg) {
        return function() {
            messages.push(msg);
            chain.next();
        }
    }

    // retrieve persons
    function retrievePersons(chain) {
        var query = new Parse.Query("person");
        query.descending("name");
        query.find({
            success:function(r) {
                _people = r;
                for(var i=0,p;p=r[i];i++) {
                    var o = p.toJSON();
                    o.items = [];
                    people.push(o);
                }
                chain.next();
            },
            error:error(chain, "retrievePersons")
        });
    }

    // news feed
    function retrieveItems(chain) {
        var q = new Parse.Query("item").containedIn("person", _people);
        q.ascending("person");
        q.ascending("name");
        q.find({
            success:function(i) {
                items = i;
                chain.next();
            },
            error:error(chain, "retrieveItems")
        });
    }

    function combine(chain) {
        for(var i=0,n;n=items[i];i++) {
            for(var j=0,p;p=people[j];j++) {
                if(p.objectId == n.get("person").id) {
                    messages.push("found");

                    if(p.items) {
                        p.items.push(n);
                    } else {
                        p.items = [n];
                    }

                    break;
                }
            }
        }

        chain.next();
    }

    var CallChain = function() {
        this.noop = function() {};
        this.f = Array.prototype.slice.call(arguments, 0);
        this.index = 0;

        this.next = function() {
            var _f = this.f[++this.index] || this.noop;
            _f(this);
        }

        this.f[0](this);
    }

    function complete() {
        resp.success({
            people:people,
            messages:messages,
            items:items
        });
    }

    new CallChain(retrievePersons, retrieveItems, combine, complete);
});