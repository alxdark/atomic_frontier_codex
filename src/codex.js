(function(_) {
    
    var mobile = ('ontouchstart' in document.documentElement),
        startEvent = (mobile) ? "touchstart" : "mousedown",
        endEvent = (mobile) ? "touchend" : "mouseup";
    
    var diceResults = [
        "Critical Failure (No, and...)",
        "Critical Failure (No, and...)",
        "Critical Failure (No, and...)",
        "Failure (No)",
        "Failure (No)",
        "Failure (No, but...)",
        "Failure (No, but...)",
        "Success (Yes, but...)",
        "Success (Yes, but...)",
        "Success (Yes, but...)",
        "Success (Yes)",
        "Success (Yes)",
        "Critical Success (Yes, and...)"
    ];
    
    radio('message').subscribe(function(message) {
        humane.log(message);
    });
    
    ko.bindingHandlers.tap = {
        'init': function(element, valueAccessor, allBindingsAccessor, viewModel) {
            ko.utils.registerEventHandler(element, startEvent, function (event) {
                event.preventDefault();
            });
            ko.utils.registerEventHandler(element, endEvent, function (event) {
                event.preventDefault();
                var handlerFunction = valueAccessor();
                handlerReturnValue = handlerFunction.call(viewModel, viewModel, event);
            });
        }
    };
    
    var tabs = document.querySelector("#tabs");
    var tabbar = document.querySelector("#tabbar");
    var cards = document.querySelectorAll('.card');
    var forEach = Array.prototype.forEach;
    
    forEach.call(cards, function(card) {
        var sectionId = card.querySelector("div:first-child").id;
        setSection(card, sectionId);
    });
    
    function setSection(card, sectionId) {
        if (sectionId) {
            var cardId = card.id.split("-")[0];
            var sections = card.querySelectorAll(".card > div");
            forEach.call(sections, function(section, i) {
                section.style.display = (section.id === sectionId) ? 'block' : 'none';
            });
            var select = document.querySelector("#tabbar ." + cardId + " select");
            if (select) {
                select.value = sectionId;
            }
        }
    }
    
    function swapTo(tabId, sectionId) {
        tabs.className = tabId;
        tabbar.className = tabId;
        forEach.call(cards, function(card) {
            if (card.id === tabId+"-card") {
                card.style.display = "block";
                setSection(card, sectionId);
            } else {
                card.style.display = "none";
            }
        });
    }
    
    function getMonths() {
        return ["January","February","March","April","May","June","July","August","September",
                "October","November","December"];
    }
    function addIfSet(opts, field, value) {
        if (value && value.toLowerCase() !== "either" && value.toLowerCase() !== "any") {
            opts[field] = value;
        }
    }
    function getSimplerProfs() {
        // Removes the individual branches and replaces with a generic soldier category, adds "Any" 
        // which currently ends up as first in list, which is correct
        return ["Any", "Soldier"].concat(_.without(window.c_profs, "Air Force","Marine","Army","Navy","Coast Guard")).sort(); 
    }
    
    var Panel = _.define({
        init: function(element) {
            this.element = element;
            this.closed = true;
            this.toggle = this.toggle.bind(this);
        },
        toggle: function() {
            if (this.closed) {
                window.scrollTo(0,1);
                this.element.classList.add('panelOpen');
                this.closed = false;
            } else {
                this.element.classList.remove('panelOpen');
                this.closed = true;
            }
        },
        close: function() {
            this.element.classList.remove('panelOpen');
            this.closed = true;
        }
    });
    
    var AppBarViewModel = _.define({
        init: function() {
        },
        tab: function(view, event) {
            swapTo(event.target.className);
        },
        changeSection: function(view, event) {
            var card = document.getElementById(event.target.parentNode.className+"-card");
            var id = event.target.value.toLowerCase();
            swapTo(event.target.parentNode.className, id);
            event.target.blur();
        },
        swapSection: function(view, event) {
            var id = event.target.textContent.toLowerCase(),
                items = event.target.parentNode.parentNode.querySelectorAll('li');
            for (var i=0; i < items.length; i++) {
                var item = items[i];
                item.classList.toggle("selected", item.classList.contains(id));
            }
            swapTo('history', id);
        }
    });
    
    var RulesModelView = _.define({
        init: function() {
            var d = new Date();
            d.setFullYear(1965);
            this.date = d.toLocaleDateString();
        },
        today: function() {
            return this.date;
        },
        weather: function() {
            var w = localStorage.getItem(this.date);
            if (!w) {
                w = atomic.createWeather().toString().toLowerCase();
                localStorage.setItem(this.date, w);
            }
            return w;
        }
    });
    
    var BaseBuilder = _.define({
        init: function(type) {
            this.panel = new Panel(document.querySelector('#'+type+'_panel'));
            this.output = "<p>No "+type+" created yet.</p>";
            this.type = type;
            ko.track(this, ['output']);
        },
        create: function() {
            this.panel.close();
            this.output = "<p>Working...</p>";
            setTimeout(function() {
                this.model = this.makeCall();
                var str = _.isString(this.model);
                var html = (str) ? this.model : this.model.toHTML();
                var string = (str) ? this.model : this.model.toString();
                this.output = html;
                radio('history').broadcast({type: this.type, text: string});
                window.scrollTo(0,1);
            }.bind(this), 1);
        },
        makeCall: function() {
            throw new Error("create() must be subclassed.");
        },
        save: function() {
            if (this.model) {
                var string = (_.isString(this.model)) ? this.model : this.model.toString();
                radio('save').broadcast({ type: this.type, text: string});
                radio('message').broadcast("Saved " + this.type);
            }
            this.model = null;
        }
    });
    
    var CharacterBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'character');
            this.genders = ['Either','Male','Female'];
            this.selectedGender = 'Either';
            this.professions = getSimplerProfs();
            this.selectedProfessions = 'Any';
            ko.track(this, ['genders','selectedGender','professions','selectedProfession']);
        },
        makeCall: function() {
            var opts = {};
            addIfSet(opts, "gender", this.selectedGender.toLowerCase());
            addIfSet(opts, "profession", this.selectedProfession.toLowerCase());
            return atomic.createCharacter(opts);
        }
    });
    var EncounterBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'encounter');
        },
        makeCall: function() {
            return atomic.createEncounter();
        }
    });
    var GangBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'gang');
            this.gangTypes = ['Any'].concat(atomic.getGangTypes());
            this.selectedType = 'Any';
            this.count = '';
            ko.track(this, ['gangTypes','selectedType','count']);
        },
        makeCall: function() {
            var opts = {};
            addIfSet(opts, "kind", this.selectedType.toLowerCase());
            if (/^\d+$/.test(this.count)) {
                opts.count = parseInt(this.count,10);
            }
            return atomic.createGang(opts);            
        }
    });
    var LootBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'loot');
            this.locations = ['Any'].concat(window.c_locations);
            this.selectedLocation = 'Any';
            this.professions = getSimplerProfs();
            this.selectedProfession = 'Any';
            this.totalValue = 20;
            ko.track(this, ['locations','selectedLocation','professions','selectedProfession','totalValue']);
        },
        onChange: function(view, event) {
            // You don't get meaningful results unless only one of these is set.
            var coll = event.target.name;
            ["selectedLocation","selectedProfession"].forEach(function(prop) {
                if (prop !== coll) {
                   this[prop] = "Any";
                }
            }, this);
        },
        makeCall: function() {
            if (this.totalValue < 1 || this.totalValue > 500) {
                this.totalValue = 20;
                radio('message').broadcast("Value out of range, using the default value of 20.");
            }
            var args = [parseInt(this.totalValue,10)];
            if (this.selectedLocation !== "Any") {
                args.push(this.selectedLocation.toLowerCase());
            } else if (this.selectedProfession !== "Any") {
                args.push("kit:"+ion.toTag(this.selectedProfession));    
            }
            return atomic.createBag.apply(atomic, args);
        }
    });
    var ContainersBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'container');
            this.containers = ["Any"].concat(atomic.getContainerTypes());
            this.selectedContainer = "Any";
            ko.track(this, ['containers','selectedContainer']);
        },
        makeCall: function() {
            var type = this.selectedContainer;
            if (type === "Any") {
                type = _.random(atomic.getContainerTypes());
            }
            return atomic.createContainer(type);
        }
    });
    var StoreBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'store');
        },
        makeCall: function() {
            return atomic.createStore();
        }
    });
    var WeatherBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'weather');
            this.months = getMonths();
            this.selectedMonth = getMonths()[new Date().getMonth()];
            ko.track(this, ['months','selectedMonth']);
        },
        makeCall: function() {
            return atomic.createWeather(this.selectedMonth.substring(0,3));
        }
    });
    var CorporationViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'corporation');
            ko.track(this);
        },
        makeCall: function() {
            return atomic.createCorporateName();
        }
    });
    var TownsBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'town');
            var caps = atomic.getLandformTypes().map(_.sentenceCase);
            this.geographies = ["Any"].concat(caps);
            this.selectedGeography = "Any";
            ko.track(this, ['geographies','selectedGeography']);
        },
        makeCall: function() {
            return atomic.createPlaceName(this.selectedGeography.toLowerCase());
        }
    });
    var FamilyBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'family');
            this.professions = getSimplerProfs();
            this.selectedProfession = 'Any';
            this.generations = [1,2,3,4];
            this.selectedGeneration = 2;
            ko.track(this, ['professions','generations','selectedGeneration','selectedProfession']);
        },
        makeCall: function() {
            var parent = {};
            addIfSet(parent, "profession", this.selectedProfession);
            
            return atomic.createFamily({
                "generations": parseInt(this.selectedGeneration, 10),
                "parent": parent
            });
        }
    });
    var RelationshipBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'relationship');
            this.relationships = ['Any'].concat(atomic.getRelationships());
            this.selectedRelation = 'Any';
            this.professions = getSimplerProfs();
            this.selectedProfessions = 'Any';
            ko.track(this, ['relationships','selectedRelation', 'professions','selectedProfession']);
        },
        makeCall: function() {
            var obj = {};
            addIfSet(obj, "older", this.selectedRelation);
            addIfSet(obj, "profession", this.selectedProfession);
            return atomic.createRelationship(obj);
        }
    });
   
    var DiceViewModel = _.define({
        init: function() {
            this.container = document.querySelector(".well.dice");
            this.mod = 0;
            this.output = "";
            this.descr = "";
            ko.track(this, ['mod','output','descr']);
        },
        setMod: function(a, event) {
            // Ew. Ick. Jesus Christ.
            [].slice.call(event.target.parentNode.parentNode.querySelectorAll(".btn")).forEach(function(sib) {
                sib.classList.remove( sib.getAttribute('data-active') );
            });
            event.target.classList.add( event.target.getAttribute('data-active') );
            this.mod = parseInt(event.target.textContent, 10);
        },
        roll: function() {
            if (this.locked) {
                return;
            }
            var roll1 = _.roll(6),
                roll2 = _.roll(6),
                result = roll1+roll2+this.mod,
                text = (this.mod !== 0) ? 
                    _.format("{0} + {1} + {2} = {3}", roll1, roll2, this.mod, result) :
                    _.format("{0} + {1} = {2}", roll1, roll2, result),
                descr = diceResults[_.bounded(result,0,12)];
            this.updateUI(text, descr);
        },
        combatRoll: function() {
            if (this.locked) {
                return;
            }
            var roll1 = _.roll(6),
                roll2 = _.roll(6),
                result = roll1+roll2+this.mod,
                text = (this.mod !== 0) ? 
                    _.format("{0} + {1} + {2} = {3}", roll1, roll2, this.mod, result) :
                    _.format("{0} + {1} = {2}", roll1, roll2, result),
                descr = null;
            if (roll1 === 1 && roll1 === roll2) {
                descr = "Critical Miss";
            } else if (roll1 === 6 && roll1 === roll2) {
                descr = "Critical Hit";
            } else if (result >= 7) {
                descr = "Hit";
            } else {
                descr = "Miss";
            }
            if (roll1 === roll2 && roll1 !== 1 && roll1 !== 6) {
                descr += " (Use " + roll1 + "x ammo)";
            }
            this.updateUI(text, descr);
        },
        updateUI: function(text, descr) {
            this.locked = true;
            this.container.classList.add("bounceIn");
            this.output = text;
            this.descr = descr;
            radio('history').broadcast({type: 'dice', text: text + ": " + descr});
            setTimeout(function() {
                this.container.classList.remove("bounceIn");
                this.locked = false;
            }.bind(this), 1100);
        }
    });
    
    var HistoryViewModel = _.define({
        init: function() {
            radio('history').subscribe(this.addToHistory.bind(this));
            radio('save').subscribe(this.addToSaved.bind(this));

            var codex = JSON.parse(localStorage.getItem('history')) || {};
            this.historyItems = codex.historyItems || [];
            this.savedItems = codex.savedItems || [];
            ko.track(this, ['historyItems','savedItems']);
        },
        persist: function(data) {
            localStorage.setItem('history', JSON.stringify(data));
        },
        addToHistory: function(event) {
            while (this.historyItems.length >= 20) {
                this.historyItems.pop();
            }
            this.historyItems.unshift(event.text);
            this.persist(ko.toJS(this));
        },
        addToSaved: function(event) {
            this.savedItems.unshift(event.text);
            this.persist(ko.toJS(this));
        },
        save: function(data, event) {
            var view = ko.contextFor(event.target).$parent;
            if (view.savedItems.indexOf(data) === -1) {
                view.historyItems.remove(data);
                view.addToSaved({ type: '', text: data });
                radio('message').broadcast("Saved");
            } else {
                radio('message').broadcast("Already saved");
            }
        },
        remove: function(data, event) {
            if (confirm("Are you sure?")) {
                var view = ko.contextFor(event.target).$parent;
                view.savedItems.remove(data);
                view.persist(ko.toJS(view));
            }
        },
        removeHistory: function(data, event) {
            if (confirm("Are you sure?")) {
                var view = ko.contextFor(event.target).$parent;
                view.historyItems.remove(data);
                view.persist(ko.toJS(view));
            }
        },
        email: function(data, event) {
            document.location = "mailto:?subject="+ encodeURIComponent("Data from The Codex") +"&body=" + encodeURIComponent(data);
        }
    });
    
    function bind(view, selector) {
        view = new view();
        var root = document.querySelector(selector);
        ko.applyBindings(view, root);
    }
    
    window.addEventListener('load', function() {
        bind(AppBarViewModel, "#tabgroup");
        bind(RulesModelView, "#rules-card");
        bind(CharacterBuilderViewModel, "#character");
        bind(EncounterBuilderViewModel, "#encounter");
        bind(GangBuilderViewModel, "#gang");
        bind(LootBuilderViewModel, "#loot");
        bind(ContainersBuilderViewModel, "#container");
        bind(WeatherBuilderViewModel, "#weather");
        bind(TownsBuilderViewModel, "#town");
        bind(CorporationViewModel, "#corporation");
        bind(FamilyBuilderViewModel, "#family");
        bind(RelationshipBuilderViewModel, "#relationship");
        bind(StoreBuilderViewModel, "#store");
        bind(DiceViewModel, "#dice-card");
        bind(HistoryViewModel, "#history-card", "history");
        swapTo('builders', 'store');
        
        setTimeout(function() {
            document.body.style.opacity = 1.0;
        }, 200);
    }, true);

})(ion); 
