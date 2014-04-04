// Knockout JavaScript library v3.0.0
// (c) Steven Sanderson - http://knockoutjs.com/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function(){
var DEBUG=true;
(function(undefined){
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    var window = this || (0, eval)('this'),
        document = window['document'],
        navigator = window['navigator'],
        jQuery = window["jQuery"],
        JSON = window["JSON"];
(function(factory) {
    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        var target = module['exports'] || exports; // module.exports is for Node.js
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        define(['exports'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['ko'] = {});
    }
}(function(koExports){
// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
var ko = typeof koExports !== 'undefined' ? koExports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
ko.exportSymbol = function(koPath, object) {
	var tokens = koPath.split(".");

	// In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
	// At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
	var target = ko;

	for (var i = 0; i < tokens.length - 1; i++)
		target = target[tokens[i]];
	target[tokens[tokens.length - 1]] = object;
};
ko.exportProperty = function(owner, publicName, object) {
  owner[publicName] = object;
};
ko.version = "3.0.0";

ko.exportSymbol('version', ko.version);
ko.utils = (function () {
    var objectForEach = function(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(prop, obj[prop]);
            }
        }
    };

    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
    var knownEvents = {}, knownEventTypesByEventName = {};
    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    objectForEach(knownEvents, function(eventType, knownEventsForType) {
        if (knownEventsForType.length) {
            for (var i = 0, j = knownEventsForType.length; i < j; i++)
                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    });
    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
    // If there is a future need to detect specific versions of IE10+, we will amend this.
    var ieVersion = document && (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        ) {}
        return version > 4 ? version : undefined;
    }());
    var isIe6 = ieVersion === 6,
        isIe7 = ieVersion === 7;

    function isClickOnCheckableElement(element, eventType) {
        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
        if (eventType.toLowerCase() != "click") return false;
        var inputType = element.type;
        return (inputType == "checkbox") || (inputType == "radio");
    }

    return {
        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

        arrayForEach: function (array, action) {
            for (var i = 0, j = array.length; i < j; i++)
                action(array[i]);
        },

        arrayIndexOf: function (array, item) {
            if (typeof Array.prototype.indexOf == "function")
                return Array.prototype.indexOf.call(array, item);
            for (var i = 0, j = array.length; i < j; i++)
                if (array[i] === item)
                    return i;
            return -1;
        },

        arrayFirst: function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate.call(predicateOwner, array[i]))
                    return array[i];
            return null;
        },

        arrayRemoveItem: function (array, itemToRemove) {
            var index = ko.utils.arrayIndexOf(array, itemToRemove);
            if (index >= 0)
                array.splice(index, 1);
        },

        arrayGetDistinctValues: function (array) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++) {
                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
                    result.push(array[i]);
            }
            return result;
        },

        arrayMap: function (array, mapping) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                result.push(mapping(array[i]));
            return result;
        },

        arrayFilter: function (array, predicate) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate(array[i]))
                    result.push(array[i]);
            return result;
        },

        arrayPushAll: function (array, valuesToPush) {
            if (valuesToPush instanceof Array)
                array.push.apply(array, valuesToPush);
            else
                for (var i = 0, j = valuesToPush.length; i < j; i++)
                    array.push(valuesToPush[i]);
            return array;
        },

        addOrRemoveItem: function(array, value, included) {
            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
            if (existingEntryIndex < 0) {
                if (included)
                    array.push(value);
            } else {
                if (!included)
                    array.splice(existingEntryIndex, 1);
            }
        },

        extend: function (target, source) {
            if (source) {
                for(var prop in source) {
                    if(source.hasOwnProperty(prop)) {
                        target[prop] = source[prop];
                    }
                }
            }
            return target;
        },

        objectForEach: objectForEach,

        objectMap: function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        },

        emptyDomNode: function (domNode) {
            while (domNode.firstChild) {
                ko.removeNode(domNode.firstChild);
            }
        },

        moveCleanedNodesToContainerElement: function(nodes) {
            // Ensure it's a real array, as we're about to reparent the nodes and
            // we don't want the underlying collection to change while we're doing that.
            var nodesArray = ko.utils.makeArray(nodes);

            var container = document.createElement('div');
            for (var i = 0, j = nodesArray.length; i < j; i++) {
                container.appendChild(ko.cleanNode(nodesArray[i]));
            }
            return container;
        },

        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        },

        setDomNodeChildren: function (domNode, childNodes) {
            ko.utils.emptyDomNode(domNode);
            if (childNodes) {
                for (var i = 0, j = childNodes.length; i < j; i++)
                    domNode.appendChild(childNodes[i]);
            }
        },

        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
            if (nodesToReplaceArray.length > 0) {
                var insertionPoint = nodesToReplaceArray[0];
                var parent = insertionPoint.parentNode;
                for (var i = 0, j = newNodesArray.length; i < j; i++)
                    parent.insertBefore(newNodesArray[i], insertionPoint);
                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
                    ko.removeNode(nodesToReplaceArray[i]);
                }
            }
        },

        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
            //
            // Rules:
            //   [A] Any leading nodes that have been removed should be ignored
            //       These most likely correspond to memoization nodes that were already removed during binding
            //       See https://github.com/SteveSanderson/knockout/pull/440
            //   [B] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
            //       and include any nodes that have been inserted among the previous collection

            if (continuousNodeArray.length) {
                // The parent node can be a virtual element; so get the real parent node
                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

                // Rule [A]
                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
                    continuousNodeArray.splice(0, 1);

                // Rule [B]
                if (continuousNodeArray.length > 1) {
                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
                    // Replace with the actual new continuous node set
                    continuousNodeArray.length = 0;
                    while (current !== last) {
                        continuousNodeArray.push(current);
                        current = current.nextSibling;
                        if (!current) // Won't happen, except if the developer has manually removed some DOM elements (then we're in an undefined scenario)
                            return;
                    }
                    continuousNodeArray.push(last);
                }
            }
            return continuousNodeArray;
        },

        setOptionNodeSelectionState: function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (ieVersion < 7)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        },

        stringTrim: function (string) {
            return string === null || string === undefined ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        },

        stringTokenize: function (string, delimiter) {
            var result = [];
            var tokens = (string || "").split(delimiter);
            for (var i = 0, j = tokens.length; i < j; i++) {
                var trimmed = ko.utils.stringTrim(tokens[i]);
                if (trimmed !== "")
                    result.push(trimmed);
            }
            return result;
        },

        stringStartsWith: function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        },

        domNodeIsContainedBy: function (node, containedByNode) {
            if (node === containedByNode)
                return true;
            if (node.nodeType === 11)
                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
            if (containedByNode.contains)
                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
            if (containedByNode.compareDocumentPosition)
                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
            return !!node;
        },

        domNodeIsAttachedToDocument: function (node) {
            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
        },

        anyDomNodeIsAttachedToDocument: function(nodes) {
            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
        },

        tagNameLower: function(element) {
            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
            return element && element.tagName && element.tagName.toLowerCase();
        },

        registerEventHandler: function (element, eventType, handler) {
            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
            if (!mustUseAttachEvent && typeof jQuery != "undefined") {
                if (isClickOnCheckableElement(element, eventType)) {
                    // For click events on checkboxes, jQuery interferes with the event handling in an awkward way:
                    // it toggles the element checked state *after* the click event handlers run, whereas native
                    // click events toggle the checked state *before* the event handler.
                    // Fix this by intecepting the handler and applying the correct checkedness before it runs.
                    var originalHandler = handler;
                    handler = function(event, eventData) {
                        var jQuerySuppliedCheckedState = this.checked;
                        if (eventData)
                            this.checked = eventData.checkedStateBeforeEvent !== true;
                        originalHandler.call(this, event);
                        this.checked = jQuerySuppliedCheckedState; // Restore the state jQuery applied
                    };
                }
                jQuery(element)['bind'](eventType, handler);
            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
                element.addEventListener(eventType, handler, false);
            else if (typeof element.attachEvent != "undefined") {
                var attachEventHandler = function (event) { handler.call(element, event); },
                    attachEventName = "on" + eventType;
                element.attachEvent(attachEventName, attachEventHandler);

                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
                // so to avoid leaks, we have to remove them manually. See bug #856
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    element.detachEvent(attachEventName, attachEventHandler);
                });
            } else
                throw new Error("Browser doesn't support addEventListener or attachEvent");
        },

        triggerEvent: function (element, eventType) {
            if (!(element && element.nodeType))
                throw new Error("element must be a DOM node when calling triggerEvent");

            if (typeof jQuery != "undefined") {
                var eventData = [];
                if (isClickOnCheckableElement(element, eventType)) {
                    // Work around the jQuery "click events on checkboxes" issue described above by storing the original checked state before triggering the handler
                    eventData.push({ checkedStateBeforeEvent: element.checked });
                }
                jQuery(element)['trigger'](eventType, eventData);
            } else if (typeof document.createEvent == "function") {
                if (typeof element.dispatchEvent == "function") {
                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
                    var event = document.createEvent(eventCategory);
                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                    element.dispatchEvent(event);
                }
                else
                    throw new Error("The supplied element doesn't support dispatchEvent");
            } else if (typeof element.fireEvent != "undefined") {
                // Unlike other browsers, IE doesn't change the checked state of checkboxes/radiobuttons when you trigger their "click" event
                // so to make it consistent, we'll do it manually here
                if (isClickOnCheckableElement(element, eventType))
                    element.checked = element.checked !== true;
                element.fireEvent("on" + eventType);
            }
            else
                throw new Error("Browser doesn't support triggering events");
        },

        unwrapObservable: function (value) {
            return ko.isObservable(value) ? value() : value;
        },

        peekObservable: function (value) {
            return ko.isObservable(value) ? value.peek() : value;
        },

        toggleDomNodeCssClass: function (node, classNames, shouldHaveClass) {
            if (classNames) {
                var cssClassNameRegex = /\S+/g,
                    currentClassNames = node.className.match(cssClassNameRegex) || [];
                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
                    ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
                });
                node.className = currentClassNames.join(" ");
            }
        },

        setTextContent: function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            // We need there to be exactly one child: a text node.
            // If there are no children, more than one, or if it's not a text node,
            // we'll clear everything and create a single text node.
            var innerTextNode = ko.virtualElements.firstChild(element);
            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
                ko.virtualElements.setDomNodeChildren(element, [document.createTextNode(value)]);
            } else {
                innerTextNode.data = value;
            }

            ko.utils.forceRefresh(element);
        },

        setElementName: function(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        },

        forceRefresh: function(node) {
            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
            if (ieVersion >= 9) {
                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
                var elem = node.nodeType == 1 ? node : node.parentNode;
                if (elem.style)
                    elem.style.zoom = elem.style.zoom;
            }
        },

        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
            if (ieVersion) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        },

        range: function (min, max) {
            min = ko.utils.unwrapObservable(min);
            max = ko.utils.unwrapObservable(max);
            var result = [];
            for (var i = min; i <= max; i++)
                result.push(i);
            return result;
        },

        makeArray: function(arrayLikeObject) {
            var result = [];
            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
                result.push(arrayLikeObject[i]);
            };
            return result;
        },

        isIe6 : isIe6,
        isIe7 : isIe7,
        ieVersion : ieVersion,

        getFormFields: function(form, fieldName) {
            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
            var isMatchingField = (typeof fieldName == 'string')
                ? function(field) { return field.name === fieldName }
                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
            var matches = [];
            for (var i = fields.length - 1; i >= 0; i--) {
                if (isMatchingField(fields[i]))
                    matches.push(fields[i]);
            };
            return matches;
        },

        parseJson: function (jsonString) {
            if (typeof jsonString == "string") {
                jsonString = ko.utils.stringTrim(jsonString);
                if (jsonString) {
                    if (JSON && JSON.parse) // Use native parsing where available
                        return JSON.parse(jsonString);
                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
                }
            }
            return null;
        },

        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
            if (!JSON || !JSON.stringify)
                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
        },

        postJson: function (urlOrForm, data, options) {
            options = options || {};
            var params = options['params'] || {};
            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
            var url = urlOrForm;

            // If we were given a form, use its 'action' URL and pick out any requested field values
            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
                var originalForm = urlOrForm;
                url = originalForm.action;
                for (var i = includeFields.length - 1; i >= 0; i--) {
                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
                    for (var j = fields.length - 1; j >= 0; j--)
                        params[fields[j].name] = fields[j].value;
                }
            }

            data = ko.utils.unwrapObservable(data);
            var form = document.createElement("form");
            form.style.display = "none";
            form.action = url;
            form.method = "post";
            for (var key in data) {
                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
                var input = document.createElement("input");
                input.name = key;
                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
                form.appendChild(input);
            }
            objectForEach(params, function(key, value) {
                var input = document.createElement("input");
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            options['submitter'] ? options['submitter'](form) : form.submit();
            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
        }
    }
}());

ko.exportSymbol('utils', ko.utils);
ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
ko.exportSymbol('utils.extend', ko.utils.extend);
ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
ko.exportSymbol('utils.postJson', ko.utils.postJson);
ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
ko.exportSymbol('utils.range', ko.utils.range);
ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

if (!Function.prototype['bind']) {
    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
    Function.prototype['bind'] = function (object) {
        var originalFunction = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function () {
            return originalFunction.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    function getAll(node, createIfNotFound) {
        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
        if (!hasExistingDataStore) {
            if (!createIfNotFound)
                return undefined;
            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
            dataStore[dataStoreKey] = {};
        }
        return dataStore[dataStoreKey];
    }

    return {
        get: function (node, key) {
            var allDataForNode = getAll(node, false);
            return allDataForNode === undefined ? undefined : allDataForNode[key];
        },
        set: function (node, key, value) {
            if (value === undefined) {
                // Make sure we don't actually create a new domData key if we are actually deleting a value
                if (getAll(node, false) === undefined)
                    return;
            }
            var allDataForNode = getAll(node, true);
            allDataForNode[key] = value;
        },
        clear: function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        },

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

ko.utils.domNodeDisposal = new (function () {
    var domDataKey = ko.utils.domData.nextKey();
    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

    function getDisposeCallbacksCollection(node, createIfNotFound) {
        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
            allDisposeCallbacks = [];
            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
        }
        return allDisposeCallbacks;
    }
    function destroyCallbacksCollection(node) {
        ko.utils.domData.set(node, domDataKey, undefined);
    }

    function cleanSingleNode(node) {
        // Run all the dispose callbacks
        var callbacks = getDisposeCallbacksCollection(node, false);
        if (callbacks) {
            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
            for (var i = 0; i < callbacks.length; i++)
                callbacks[i](node);
        }

        // Also erase the DOM data
        ko.utils.domData.clear(node);

        // Special support for jQuery here because it's so commonly used.
        // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
        // so notify it to tear down any resources associated with the node & descendants here.
        if ((typeof jQuery == "function") && (typeof jQuery['cleanData'] == "function"))
            jQuery['cleanData']([node]);

        // Also clear any immediate-child comment nodes, as these wouldn't have been found by
        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
        if (cleanableNodeTypesWithDescendants[node.nodeType])
            cleanImmediateCommentTypeChildren(node);
    }

    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
        var child, nextChild = nodeWithChildren.firstChild;
        while (child = nextChild) {
            nextChild = child.nextSibling;
            if (child.nodeType === 8)
                cleanSingleNode(child);
        }
    }

    return {
        addDisposeCallback : function(node, callback) {
            if (typeof callback != "function")
                throw new Error("Callback must be a function");
            getDisposeCallbacksCollection(node, true).push(callback);
        },

        removeDisposeCallback : function(node, callback) {
            var callbacksCollection = getDisposeCallbacksCollection(node, false);
            if (callbacksCollection) {
                ko.utils.arrayRemoveItem(callbacksCollection, callback);
                if (callbacksCollection.length == 0)
                    destroyCallbacksCollection(node);
            }
        },

        cleanNode : function(node) {
            // First clean this node, where applicable
            if (cleanableNodeTypes[node.nodeType]) {
                cleanSingleNode(node);

                // ... then its descendants, where applicable
                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
                    // Clone the descendants list in case it changes during iteration
                    var descendants = [];
                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
                    for (var i = 0, j = descendants.length; i < j; i++)
                        cleanSingleNode(descendants[i]);
                }
            }
            return node;
        },

        removeNode : function(node) {
            ko.cleanNode(node);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        }
    }
})();
ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
ko.exportSymbol('cleanNode', ko.cleanNode);
ko.exportSymbol('removeNode', ko.removeNode);
ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
(function () {
    var leadingCommentRegex = /^(\s*)<!--(.*?)-->/;

    function simpleHtmlParse(html) {
        // Based on jQuery's "clean" function, but only accounting for table-related elements.
        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = ko.utils.stringTrim(html).toLowerCase(), div = document.createElement("div");

        // Finds the first match from the left column, and returns the corresponding "wrap" data from the right column
        var wrap = tags.match(/^<(thead|tbody|tfoot)/)              && [1, "<table>", "</table>"] ||
                   !tags.indexOf("<tr")                             && [2, "<table><tbody>", "</tbody></table>"] ||
                   (!tags.indexOf("<td") || !tags.indexOf("<th"))   && [3, "<table><tbody><tr>", "</tr></tbody></table>"] ||
                   /* anything else */                                 [0, "", ""];

        // Go to html and back, then peel off extra wrappers
        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
        if (typeof window['innerShiv'] == "function") {
            div.appendChild(window['innerShiv'](markup));
        } else {
            div.innerHTML = markup;
        }

        // Move to the right depth
        while (wrap[0]--)
            div = div.lastChild;

        return ko.utils.makeArray(div.lastChild.childNodes);
    }

    function jQueryHtmlParse(html) {
        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
        if (jQuery['parseHTML']) {
            return jQuery['parseHTML'](html) || []; // Ensure we always return an array and never null
        } else {
            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
            var elems = jQuery['clean']([html]);

            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
            if (elems && elems[0]) {
                // Find the top-most parent element that's a direct child of a document fragment
                var elem = elems[0];
                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
                    elem = elem.parentNode;
                // ... then detach it
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }

            return elems;
        }
    }

    ko.utils.parseHtmlFragment = function(html) {
        return typeof jQuery != 'undefined' ? jQueryHtmlParse(html)   // As below, benefit from jQuery's optimisations where possible
                                            : simpleHtmlParse(html);  // ... otherwise, this simple logic will do in most common cases.
    };

    ko.utils.setHtml = function(node, html) {
        ko.utils.emptyDomNode(node);

        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
        html = ko.utils.unwrapObservable(html);

        if ((html !== null) && (html !== undefined)) {
            if (typeof html != 'string')
                html = html.toString();

            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
            // for example <tr> elements which are not normally allowed to exist on their own.
            // If you've referenced jQuery we'll use that rather than duplicating its code.
            if (typeof jQuery != 'undefined') {
                jQuery(node)['html'](html);
            } else {
                // ... otherwise, use KO's own parsing logic.
                var parsedNodes = ko.utils.parseHtmlFragment(html);
                for (var i = 0; i < parsedNodes.length; i++)
                    node.appendChild(parsedNodes[i]);
            }
        }
    };
})();

ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

ko.memoization = (function () {
    var memos = {};

    function randomMax8HexChars() {
        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
    }
    function generateRandomId() {
        return randomMax8HexChars() + randomMax8HexChars();
    }
    function findMemoNodes(rootNode, appendToArray) {
        if (!rootNode)
            return;
        if (rootNode.nodeType == 8) {
            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
            if (memoId != null)
                appendToArray.push({ domNode: rootNode, memoId: memoId });
        } else if (rootNode.nodeType == 1) {
            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
                findMemoNodes(childNodes[i], appendToArray);
        }
    }

    return {
        memoize: function (callback) {
            if (typeof callback != "function")
                throw new Error("You can only pass a function to ko.memoization.memoize()");
            var memoId = generateRandomId();
            memos[memoId] = callback;
            return "<!--[ko_memo:" + memoId + "]-->";
        },

        unmemoize: function (memoId, callbackParams) {
            var callback = memos[memoId];
            if (callback === undefined)
                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
            try {
                callback.apply(null, callbackParams || []);
                return true;
            }
            finally { delete memos[memoId]; }
        },

        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
            var memos = [];
            findMemoNodes(domNode, memos);
            for (var i = 0, j = memos.length; i < j; i++) {
                var node = memos[i].domNode;
                var combinedParams = [node];
                if (extraCallbackParamsArray)
                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
                if (node.parentNode)
                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
            }
        },

        parseMemoText: function (memoText) {
            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
            return match ? match[1] : null;
        }
    };
})();

ko.exportSymbol('memoization', ko.memoization);
ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttling means two things:

        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
        target['throttleEvaluation'] = timeout;

        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
        //     so the target cannot change value synchronously or faster than a certain rate
        var writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'notify': function(target, notifyWhen) {
        target["equalityComparer"] = notifyWhen == "always" ?
            null :  // null equalityComparer means to always notify
            valuesArePrimitiveAndEqual;
    }
};

var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
function valuesArePrimitiveAndEqual(a, b) {
    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

function applyExtenders(requestedExtenders) {
    var target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            var extenderHandler = ko.extenders[key];
            if (typeof extenderHandler == 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

ko.subscription = function (target, callback, disposeCallback) {
    this.target = target;
    this.callback = callback;
    this.disposeCallback = disposeCallback;
    ko.exportProperty(this, 'dispose', this.dispose);
};
ko.subscription.prototype.dispose = function () {
    this.isDisposed = true;
    this.disposeCallback();
};

ko.subscribable = function () {
    this._subscriptions = {};

    ko.utils.extend(this, ko.subscribable['fn']);
    ko.exportProperty(this, 'subscribe', this.subscribe);
    ko.exportProperty(this, 'extend', this.extend);
    ko.exportProperty(this, 'getSubscriptionsCount', this.getSubscriptionsCount);
}

var defaultEvent = "change";

ko.subscribable['fn'] = {
    subscribe: function (callback, callbackTarget, event) {
        event = event || defaultEvent;
        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

        var subscription = new ko.subscription(this, boundCallback, function () {
            ko.utils.arrayRemoveItem(this._subscriptions[event], subscription);
        }.bind(this));

        if (!this._subscriptions[event])
            this._subscriptions[event] = [];
        this._subscriptions[event].push(subscription);
        return subscription;
    },

    "notifySubscribers": function (valueToNotify, event) {
        event = event || defaultEvent;
        if (this.hasSubscriptionsForEvent(event)) {
            try {
                ko.dependencyDetection.begin();
                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
                    // In case a subscription was disposed during the arrayForEach cycle, check
                    // for isDisposed on each subscription before invoking its callback
                    if (subscription && (subscription.isDisposed !== true))
                        subscription.callback(valueToNotify);
                }
            } finally {
                ko.dependencyDetection.end();
            }
        }
    },

    hasSubscriptionsForEvent: function(event) {
        return this._subscriptions[event] && this._subscriptions[event].length;
    },

    getSubscriptionsCount: function () {
        var total = 0;
        ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
            total += subscriptions.length;
        });
        return total;
    },

    extend: applyExtenders
};


ko.isSubscribable = function (instance) {
    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
};

ko.exportSymbol('subscribable', ko.subscribable);
ko.exportSymbol('isSubscribable', ko.isSubscribable);

ko.dependencyDetection = (function () {
    var _frames = [];

    return {
        begin: function (callback) {
            _frames.push(callback && { callback: callback, distinctDependencies:[] });
        },

        end: function () {
            _frames.pop();
        },

        registerDependency: function (subscribable) {
            if (!ko.isSubscribable(subscribable))
                throw new Error("Only subscribable things can act as dependencies");
            if (_frames.length > 0) {
                var topFrame = _frames[_frames.length - 1];
                if (!topFrame || ko.utils.arrayIndexOf(topFrame.distinctDependencies, subscribable) >= 0)
                    return;
                topFrame.distinctDependencies.push(subscribable);
                topFrame.callback(subscribable);
            }
        },

        ignore: function(callback, callbackTarget, callbackArgs) {
            try {
                _frames.push(null);
                return callback.apply(callbackTarget, callbackArgs || []);
            } finally {
                _frames.pop();
            }
        }
    };
})();
ko.observable = function (initialValue) {
    var _latestValue = initialValue;

    function observable() {
        if (arguments.length > 0) {
            // Write

            // Ignore writes if the value hasn't changed
            if (!observable['equalityComparer'] || !observable['equalityComparer'](_latestValue, arguments[0])) {
                observable.valueWillMutate();
                _latestValue = arguments[0];
                if (DEBUG) observable._latestValue = _latestValue;
                observable.valueHasMutated();
            }
            return this; // Permits chained assignments
        }
        else {
            // Read
            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
            return _latestValue;
        }
    }
    if (DEBUG) observable._latestValue = _latestValue;
    ko.subscribable.call(observable);
    observable.peek = function() { return _latestValue };
    observable.valueHasMutated = function () { observable["notifySubscribers"](_latestValue); }
    observable.valueWillMutate = function () { observable["notifySubscribers"](_latestValue, "beforeChange"); }
    ko.utils.extend(observable, ko.observable['fn']);

    ko.exportProperty(observable, 'peek', observable.peek);
    ko.exportProperty(observable, "valueHasMutated", observable.valueHasMutated);
    ko.exportProperty(observable, "valueWillMutate", observable.valueWillMutate);

    return observable;
}

ko.observable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};

var protoProperty = ko.observable.protoProperty = "__ko_proto__";
ko.observable['fn'][protoProperty] = ko.observable;

ko.hasPrototype = function(instance, prototype) {
    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
    if (instance[protoProperty] === prototype) return true;
    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
};

ko.isObservable = function (instance) {
    return ko.hasPrototype(instance, ko.observable);
}
ko.isWriteableObservable = function (instance) {
    // Observable
    if ((typeof instance == "function") && instance[protoProperty] === ko.observable)
        return true;
    // Writeable dependent observable
    if ((typeof instance == "function") && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
        return true;
    // Anything else
    return false;
}


ko.exportSymbol('observable', ko.observable);
ko.exportSymbol('isObservable', ko.isObservable);
ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
ko.observableArray = function (initialValues) {
    initialValues = initialValues || [];

    if (typeof initialValues != 'object' || !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.extend(result, ko.observableArray['fn']);
    return result.extend({'trackArrayChanges':true});
};

ko.observableArray['fn'] = {
    'remove': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var removedValues = [];
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        for (var i = 0; i < underlyingArray.length; i++) {
            var value = underlyingArray[i];
            if (predicate(value)) {
                if (removedValues.length === 0) {
                    this.valueWillMutate();
                }
                removedValues.push(value);
                underlyingArray.splice(i, 1);
                i--;
            }
        }
        if (removedValues.length) {
            this.valueHasMutated();
        }
        return removedValues;
    },

    'removeAll': function (arrayOfValues) {
        // If you passed zero args, we remove everything
        if (arrayOfValues === undefined) {
            var underlyingArray = this.peek();
            var allValues = underlyingArray.slice(0);
            this.valueWillMutate();
            underlyingArray.splice(0, underlyingArray.length);
            this.valueHasMutated();
            return allValues;
        }
        // If you passed an arg, we interpret it as an array of entries to remove
        if (!arrayOfValues)
            return [];
        return this['remove'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'destroy': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        this.valueWillMutate();
        for (var i = underlyingArray.length - 1; i >= 0; i--) {
            var value = underlyingArray[i];
            if (predicate(value))
                underlyingArray[i]["_destroy"] = true;
        }
        this.valueHasMutated();
    },

    'destroyAll': function (arrayOfValues) {
        // If you passed zero args, we destroy everything
        if (arrayOfValues === undefined)
            return this['destroy'](function() { return true });

        // If you passed an arg, we interpret it as an array of entries to destroy
        if (!arrayOfValues)
            return [];
        return this['destroy'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'indexOf': function (item) {
        var underlyingArray = this();
        return ko.utils.arrayIndexOf(underlyingArray, item);
    },

    'replace': function(oldItem, newItem) {
        var index = this['indexOf'](oldItem);
        if (index >= 0) {
            this.valueWillMutate();
            this.peek()[index] = newItem;
            this.valueHasMutated();
        }
    }
};

// Populate ko.observableArray.fn with read/write functions from native arrays
// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
        this.valueHasMutated();
        return methodCallResult;
    };
});

// Populate ko.observableArray.fn with read-only functions from native arrays
ko.utils.arrayForEach(["slice"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        var underlyingArray = this();
        return underlyingArray[methodName].apply(underlyingArray, arguments);
    };
});

ko.exportSymbol('observableArray', ko.observableArray);
var arrayChangeEventName = 'arrayChange';
ko.extenders['trackArrayChanges'] = function(target) {
    // Only modify the target observable once
    if (target.cacheDiffForKnownOperation) {
        return;
    }
    var trackingChanges = false,
        cachedDiff = null,
        pendingNotifications = 0,
        underlyingSubscribeFunction = target.subscribe;

    // Intercept "subscribe" calls, and for array change events, ensure change tracking is enabled
    target.subscribe = target['subscribe'] = function(callback, callbackTarget, event) {
        if (event === arrayChangeEventName) {
            trackChanges();
        }
        return underlyingSubscribeFunction.apply(this, arguments);
    };

    function trackChanges() {
        // Calling 'trackChanges' multiple times is the same as calling it once
        if (trackingChanges) {
            return;
        }

        trackingChanges = true;

        // Intercept "notifySubscribers" to track how many times it was called.
        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
        target['notifySubscribers'] = function(valueToNotify, event) {
            if (!event || event === defaultEvent) {
                ++pendingNotifications;
            }
            return underlyingNotifySubscribersFunction.apply(this, arguments);
        };

        // Each time the array changes value, capture a clone so that on the next
        // change it's possible to produce a diff
        var previousContents = [].concat(target.peek() || []);
        cachedDiff = null;
        target.subscribe(function(currentContents) {
            // Make a copy of the current contents and ensure it's an array
            currentContents = [].concat(currentContents || []);

            // Compute the diff and issue notifications, but only if someone is listening
            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
                var changes = getChanges(previousContents, currentContents);
                if (changes.length) {
                    target['notifySubscribers'](changes, arrayChangeEventName);
                }
            }

            // Eliminate references to the old, removed items, so they can be GCed
            previousContents = currentContents;
            cachedDiff = null;
            pendingNotifications = 0;
        });
    }

    function getChanges(previousContents, currentContents) {
        // We try to re-use cached diffs.
        // The only scenario where pendingNotifications > 1 is when using the KO 'deferred updates' plugin,
        // which without this check would not be compatible with arrayChange notifications. Without that
        // plugin, notifications are always issued immediately so we wouldn't be queueing up more than one.
        if (!cachedDiff || pendingNotifications > 1) {
            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, { 'sparse': true });
        }

        return cachedDiff;
    }

    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
        // Only run if we're currently tracking changes for this observable array
        // and there aren't any pending deferred notifications.
        if (!trackingChanges || pendingNotifications) {
            return;
        }
        var diff = [],
            arrayLength = rawArray.length,
            argsLength = args.length,
            offset = 0;

        function pushDiff(status, value, index) {
            diff.push({ 'status': status, 'value': value, 'index': index });
        }
        switch (operationName) {
            case 'push':
                offset = arrayLength;
            case 'unshift':
                for (var index = 0; index < argsLength; index++) {
                    pushDiff('added', args[index], offset + index);
                }
                break;

            case 'pop':
                offset = arrayLength - 1;
            case 'shift':
                if (arrayLength) {
                    pushDiff('deleted', rawArray[offset], offset);
                }
                break;

            case 'splice':
                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
                    endAddIndex = startIndex + argsLength - 2,
                    endIndex = Math.max(endDeleteIndex, endAddIndex);
                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
                    if (index < endDeleteIndex)
                        pushDiff('deleted', rawArray[index], index);
                    if (index < endAddIndex)
                        pushDiff('added', args[argsIndex], index);
                }
                break;

            default:
                return;
        }
        cachedDiff = diff;
    };
};
ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
    var _latestValue,
        _hasBeenEvaluated = false,
        _isBeingEvaluated = false,
        _suppressDisposalUntilDisposeWhenReturnsFalse = false,
        readFunction = evaluatorFunctionOrOptions;

    if (readFunction && typeof readFunction == "object") {
        // Single-parameter syntax - everything is on this "options" param
        options = readFunction;
        readFunction = options["read"];
    } else {
        // Multi-parameter syntax - construct the options according to the params passed
        options = options || {};
        if (!readFunction)
            readFunction = options["read"];
    }
    if (typeof readFunction != "function")
        throw new Error("Pass a function that returns the value of the ko.computed");

    function addSubscriptionToDependency(subscribable) {
        _subscriptionsToDependencies.push(subscribable.subscribe(evaluatePossiblyAsync));
    }

    function disposeAllSubscriptionsToDependencies() {
        ko.utils.arrayForEach(_subscriptionsToDependencies, function (subscription) {
            subscription.dispose();
        });
        _subscriptionsToDependencies = [];
    }

    function evaluatePossiblyAsync() {
        var throttleEvaluationTimeout = dependentObservable['throttleEvaluation'];
        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
            clearTimeout(evaluationTimeoutInstance);
            evaluationTimeoutInstance = setTimeout(evaluateImmediate, throttleEvaluationTimeout);
        } else
            evaluateImmediate();
    }

    function evaluateImmediate() {
        if (_isBeingEvaluated) {
            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
            return;
        }

        if (disposeWhen && disposeWhen()) {
            // See comment below about _suppressDisposalUntilDisposeWhenReturnsFalse
            if (!_suppressDisposalUntilDisposeWhenReturnsFalse) {
                dispose();
                _hasBeenEvaluated = true;
                return;
            }
        } else {
            // It just did return false, so we can stop suppressing now
            _suppressDisposalUntilDisposeWhenReturnsFalse = false;
        }

        _isBeingEvaluated = true;
        try {
            // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
            // Then, during evaluation, we cross off any that are in fact still being used.
            var disposalCandidates = ko.utils.arrayMap(_subscriptionsToDependencies, function(item) {return item.target;});

            ko.dependencyDetection.begin(function(subscribable) {
                var inOld;
                if ((inOld = ko.utils.arrayIndexOf(disposalCandidates, subscribable)) >= 0)
                    disposalCandidates[inOld] = undefined; // Don't want to dispose this subscription, as it's still being used
                else
                    addSubscriptionToDependency(subscribable); // Brand new subscription - add it
            });

            var newValue = evaluatorFunctionTarget ? readFunction.call(evaluatorFunctionTarget) : readFunction();

            // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
            for (var i = disposalCandidates.length - 1; i >= 0; i--) {
                if (disposalCandidates[i])
                    _subscriptionsToDependencies.splice(i, 1)[0].dispose();
            }
            _hasBeenEvaluated = true;

            if (!dependentObservable['equalityComparer'] || !dependentObservable['equalityComparer'](_latestValue, newValue)) {
                dependentObservable["notifySubscribers"](_latestValue, "beforeChange");

                _latestValue = newValue;
                if (DEBUG) dependentObservable._latestValue = _latestValue;
                dependentObservable["notifySubscribers"](_latestValue);
            }
        } finally {
            ko.dependencyDetection.end();
            _isBeingEvaluated = false;
        }

        if (!_subscriptionsToDependencies.length)
            dispose();
    }

    function dependentObservable() {
        if (arguments.length > 0) {
            if (typeof writeFunction === "function") {
                // Writing a value
                writeFunction.apply(evaluatorFunctionTarget, arguments);
            } else {
                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
            }
            return this; // Permits chained assignments
        } else {
            // Reading the value
            if (!_hasBeenEvaluated)
                evaluateImmediate();
            ko.dependencyDetection.registerDependency(dependentObservable);
            return _latestValue;
        }
    }

    function peek() {
        if (!_hasBeenEvaluated)
            evaluateImmediate();
        return _latestValue;
    }

    function isActive() {
        return !_hasBeenEvaluated || _subscriptionsToDependencies.length > 0;
    }

    // By here, "options" is always non-null
    var writeFunction = options["write"],
        disposeWhenNodeIsRemoved = options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
        disposeWhenOption = options["disposeWhen"] || options.disposeWhen,
        disposeWhen = disposeWhenOption,
        dispose = disposeAllSubscriptionsToDependencies,
        _subscriptionsToDependencies = [],
        evaluationTimeoutInstance = null;

    if (!evaluatorFunctionTarget)
        evaluatorFunctionTarget = options["owner"];

    dependentObservable.peek = peek;
    dependentObservable.getDependenciesCount = function () { return _subscriptionsToDependencies.length; };
    dependentObservable.hasWriteFunction = typeof options["write"] === "function";
    dependentObservable.dispose = function () { dispose(); };
    dependentObservable.isActive = isActive;

    ko.subscribable.call(dependentObservable);
    ko.utils.extend(dependentObservable, ko.dependentObservable['fn']);

    ko.exportProperty(dependentObservable, 'peek', dependentObservable.peek);
    ko.exportProperty(dependentObservable, 'dispose', dependentObservable.dispose);
    ko.exportProperty(dependentObservable, 'isActive', dependentObservable.isActive);
    ko.exportProperty(dependentObservable, 'getDependenciesCount', dependentObservable.getDependenciesCount);

    // Add a "disposeWhen" callback that, on each evaluation, disposes if the node was removed without using ko.removeNode.
    if (disposeWhenNodeIsRemoved) {
        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
        // we'll prevent disposal until "disposeWhen" first returns false.
        _suppressDisposalUntilDisposeWhenReturnsFalse = true;

        // Only watch for the node's disposal if the value really is a node. It might not be,
        // e.g., { disposeWhenNodeIsRemoved: true } can be used to opt into the "only dispose
        // after first false result" behaviour even if there's no specific node to watch. This
        // technique is intended for KO's internal use only and shouldn't be documented or used
        // by application code, as it's likely to change in a future version of KO.
        if (disposeWhenNodeIsRemoved.nodeType) {
            disposeWhen = function () {
                return !ko.utils.domNodeIsAttachedToDocument(disposeWhenNodeIsRemoved) || (disposeWhenOption && disposeWhenOption());
            };
        }
    }

    // Evaluate, unless deferEvaluation is true
    if (options['deferEvaluation'] !== true)
        evaluateImmediate();

    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
    if (disposeWhenNodeIsRemoved && isActive()) {
        dispose = function() {
            ko.utils.domNodeDisposal.removeDisposeCallback(disposeWhenNodeIsRemoved, dispose);
            disposeAllSubscriptionsToDependencies();
        };
        ko.utils.domNodeDisposal.addDisposeCallback(disposeWhenNodeIsRemoved, dispose);
    }

    return dependentObservable;
};

ko.isComputed = function(instance) {
    return ko.hasPrototype(instance, ko.dependentObservable);
};

var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
ko.dependentObservable[protoProp] = ko.observable;

ko.dependentObservable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};
ko.dependentObservable['fn'][protoProp] = ko.dependentObservable;

ko.exportSymbol('dependentObservable', ko.dependentObservable);
ko.exportSymbol('computed', ko.dependentObservable); // Make "ko.computed" an alias for "ko.dependentObservable"
ko.exportSymbol('isComputed', ko.isComputed);

(function() {
    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

    ko.toJS = function(rootObject) {
        if (arguments.length == 0)
            throw new Error("When calling ko.toJS, pass the object you want to convert.");

        // We just unwrap everything at every level in the object graph
        return mapJsObjectGraph(rootObject, function(valueToMap) {
            // Loop because an observable's value might in turn be another observable wrapper
            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
                valueToMap = valueToMap();
            return valueToMap;
        });
    };

    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
        var plainJavaScriptObject = ko.toJS(rootObject);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
        visitedObjects = visitedObjects || new objectLookup();

        rootObject = mapInputCallback(rootObject);
        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
        if (!canHaveProperties)
            return rootObject;

        var outputProperties = rootObject instanceof Array ? [] : {};
        visitedObjects.save(rootObject, outputProperties);

        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
            var propertyValue = mapInputCallback(rootObject[indexer]);

            switch (typeof propertyValue) {
                case "boolean":
                case "number":
                case "string":
                case "function":
                    outputProperties[indexer] = propertyValue;
                    break;
                case "object":
                case "undefined":
                    var previouslyMappedValue = visitedObjects.get(propertyValue);
                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
                        ? previouslyMappedValue
                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
                    break;
            }
        });

        return outputProperties;
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (rootObject instanceof Array) {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);

            // For arrays, also respect toJSON property for custom mappings (fixes #278)
            if (typeof rootObject['toJSON'] == 'function')
                visitorCallback('toJSON');
        } else {
            for (var propertyName in rootObject) {
                visitorCallback(propertyName);
            }
        }
    };

    function objectLookup() {
        this.keys = [];
        this.values = [];
    };

    objectLookup.prototype = {
        constructor: objectLookup,
        save: function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            if (existingIndex >= 0)
                this.values[existingIndex] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        },
        get: function(key) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
        }
    };
})();

ko.exportSymbol('toJS', ko.toJS);
ko.exportSymbol('toJSON', ko.toJSON);
(function () {
    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
    ko.selectExtensions = {
        readValue : function(element) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    if (element[hasDomDataExpandoProperty] === true)
                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
                    return ko.utils.ieVersion <= 7
                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
                        : element.value;
                case 'select':
                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
                default:
                    return element.value;
            }
        },

        writeValue: function(element, value) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    switch(typeof value) {
                        case "string":
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
                                delete element[hasDomDataExpandoProperty];
                            }
                            element.value = value;
                            break;
                        default:
                            // Store arbitrary object using DomData
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
                            element[hasDomDataExpandoProperty] = true;

                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
                            element.value = typeof value === "number" ? value : "";
                            break;
                    }
                    break;
                case 'select':
                    if (value === "")
                        value = undefined;
                    if (value === null || value === undefined)
                        element.selectedIndex = -1;
                    for (var i = element.options.length - 1; i >= 0; i--) {
                        if (ko.selectExtensions.readValue(element.options[i]) == value) {
                            element.selectedIndex = i;
                            break;
                        }
                    }
                    // for drop-down select, ensure first is selected
                    if (!(element.size > 1) && element.selectedIndex === -1) {
                        element.selectedIndex = 0;
                    }
                    break;
                default:
                    if ((value === null) || (value === undefined))
                        value = "";
                    element.value = value;
                    break;
            }
        }
    };
})();

ko.exportSymbol('selectExtensions', ko.selectExtensions);
ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
ko.expressionRewriting = (function () {
    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

    function getWriteableValue(expression) {
        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
            return false;
        var match = expression.match(javaScriptAssignmentTarget);
        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
    }

    // The following regular expressions will be used to split an object-literal string into tokens

        // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function parseObjectLiteral(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = ko.utils.stringTrim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [], toks = str.match(bindingToken), key, values, depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        if (key)
                            result.push(values ? {key: key, value: values.join('')} : {'unknown': key});
                        key = values = depth = 0;
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!values)
                        continue;
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(bindingToken);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key must be a single token; if it's a string, trim the quotes
                } else if (!key && !values) {
                    key = (c === 34 || c === 39) /* '"', "'" */ ? tok.slice(1, -1) : tok;
                    continue;
                }
                if (values)
                    values.push(tok);
                else
                    values = [tok];
            }
        }
        return result;
    }

    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
    var twoWayBindings = {};

    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
        bindingOptions = bindingOptions || {};

        function processKeyValue(key, val) {
            var writableVal;
            function callPreprocessHook(obj) {
                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
            }
            if (!callPreprocessHook(ko['getBindingHandler'](key)))
                return;

            if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
                // For two-way bindings, provide a write method in case the value
                // isn't a writable observable.
                propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
            }

            // Values are wrapped in a function so that each value can be accessed independently
            if (makeValueAccessors) {
                val = 'function(){return ' + val + ' }';
            }
            resultStrings.push("'" + key + "':" + val);
        }

        var resultStrings = [],
            propertyAccessorResultStrings = [],
            makeValueAccessors = bindingOptions['valueAccessors'],
            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
        });

        if (propertyAccessorResultStrings.length)
            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + "}");

        return resultStrings.join(",");
    }

    return {
        bindingRewriteValidators: [],

        twoWayBindings: twoWayBindings,

        parseObjectLiteral: parseObjectLiteral,

        preProcessBindings: preProcessBindings,

        keyValueArrayContainsKey: function(keyValueArray, key) {
            for (var i = 0; i < keyValueArray.length; i++)
                if (keyValueArray[i]['key'] == key)
                    return true;
            return false;
        },

        // Internal, private KO utility for updating model properties from within bindings
        // property:            If the property being updated is (or might be) an observable, pass it here
        //                      If it turns out to be a writable observable, it will be written to directly
        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
        // value:               The value to be written
        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
        //                      it is !== existing value on that writable observable
        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
            if (!property || !ko.isObservable(property)) {
                var propWriters = allBindings.get('_ko_property_writers');
                if (propWriters && propWriters[key])
                    propWriters[key](value);
            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
                property(value);
            }
        }
    };
})();

ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
// all bindings could use an official 'property writer' API without needing to declare that they might). However,
// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
// as an internal implementation detail in the short term.
// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
(function() {
    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
    // of that virtual hierarchy
    //
    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
    // without having to scatter special cases all over the binding and templating code.

    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
    // So, use node.text where available, and node.nodeValue elsewhere
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

    function isStartComment(node) {
        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function getVirtualChildren(startComment, allowUnbalanced) {
        var currentNode = startComment;
        var depth = 1;
        var children = [];
        while (currentNode = currentNode.nextSibling) {
            if (isEndComment(currentNode)) {
                depth--;
                if (depth === 0)
                    return children;
            }

            children.push(currentNode);

            if (isStartComment(currentNode))
                depth++;
        }
        if (!allowUnbalanced)
            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
        return null;
    }

    function getMatchingEndComment(startComment, allowUnbalanced) {
        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
        if (allVirtualChildren) {
            if (allVirtualChildren.length > 0)
                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
            return startComment.nextSibling;
        } else
            return null; // Must have no matching end comment, and allowUnbalanced is true
    }

    function getUnbalancedChildTags(node) {
        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
        var childNode = node.firstChild, captureRemaining = null;
        if (childNode) {
            do {
                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
                    captureRemaining.push(childNode);
                else if (isStartComment(childNode)) {
                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
                        childNode = matchingEndComment;
                    else
                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
                } else if (isEndComment(childNode)) {
                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
                }
            } while (childNode = childNode.nextSibling);
        }
        return captureRemaining;
    }

    ko.virtualElements = {
        allowedBindings: {},

        childNodes: function(node) {
            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
        },

        emptyNode: function(node) {
            if (!isStartComment(node))
                ko.utils.emptyDomNode(node);
            else {
                var virtualChildren = ko.virtualElements.childNodes(node);
                for (var i = 0, j = virtualChildren.length; i < j; i++)
                    ko.removeNode(virtualChildren[i]);
            }
        },

        setDomNodeChildren: function(node, childNodes) {
            if (!isStartComment(node))
                ko.utils.setDomNodeChildren(node, childNodes);
            else {
                ko.virtualElements.emptyNode(node);
                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
                for (var i = 0, j = childNodes.length; i < j; i++)
                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
            }
        },

        prepend: function(containerNode, nodeToPrepend) {
            if (!isStartComment(containerNode)) {
                if (containerNode.firstChild)
                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
                else
                    containerNode.appendChild(nodeToPrepend);
            } else {
                // Start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
            }
        },

        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
            if (!insertAfterNode) {
                ko.virtualElements.prepend(containerNode, nodeToInsert);
            } else if (!isStartComment(containerNode)) {
                // Insert after insertion point
                if (insertAfterNode.nextSibling)
                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
                else
                    containerNode.appendChild(nodeToInsert);
            } else {
                // Children of start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
            }
        },

        firstChild: function(node) {
            if (!isStartComment(node))
                return node.firstChild;
            if (!node.nextSibling || isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        nextSibling: function(node) {
            if (isStartComment(node))
                node = getMatchingEndComment(node);
            if (node.nextSibling && isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        hasBindingValue: isStartComment,

        virtualNodeBindingValue: function(node) {
            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
            return regexMatch ? regexMatch[1] : null;
        },

        normaliseVirtualElementDomStructure: function(elementVerified) {
            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
            // that are direct descendants of <ul> into the preceding <li>)
            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
                return;

            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
            // must be intended to appear *after* that child, so move them there.
            var childNode = elementVerified.firstChild;
            if (childNode) {
                do {
                    if (childNode.nodeType === 1) {
                        var unbalancedTags = getUnbalancedChildTags(childNode);
                        if (unbalancedTags) {
                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
                            var nodeToInsertBefore = childNode.nextSibling;
                            for (var i = 0; i < unbalancedTags.length; i++) {
                                if (nodeToInsertBefore)
                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
                                else
                                    elementVerified.appendChild(unbalancedTags[i]);
                            }
                        }
                    }
                } while (childNode = childNode.nextSibling);
            }
        }
    };
})();
ko.exportSymbol('virtualElements', ko.virtualElements);
ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
(function() {
    var defaultBindingAttributeName = "data-bind";

    ko.bindingProvider = function() {
        this.bindingCache = {};
    };

    ko.utils.extend(ko.bindingProvider.prototype, {
        'nodeHasBindings': function(node) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName) != null;   // Element
                case 8: return ko.virtualElements.hasBindingValue(node); // Comment node
                default: return false;
            }
        },

        'getBindings': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext);
            return bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
        },

        'getBindingAccessors': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext);
            return bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, {'valueAccessors':true}) : null;
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'getBindingsString': function(node, bindingContext) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
                default: return null;
            }
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
            try {
                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
                return bindingFunction(bindingContext, node);
            } catch (ex) {
                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
                throw ex;
            }
        }
    });

    ko.bindingProvider['instance'] = new ko.bindingProvider();

    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
        return cache[cacheKey]
            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
    }

    function createBindingsStringEvaluator(bindingsString, options) {
        // Build the source for a function that evaluates "expression"
        // For each scope variable, add an extra level of "with" nesting
        // Example result: with(sc1) { with(sc0) { return (expression) } }
        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
        return new Function("$context", "$element", functionBody);
    }
})();

ko.exportSymbol('bindingProvider', ko.bindingProvider);
(function () {
    ko.bindingHandlers = {};

    // The following element types will not be recursed into during binding. In the future, we
    // may consider adding <template> to this list, because such elements' contents are always
    // intended to be bound in a different context from where they appear in the document.
    var bindingDoesNotRecurseIntoElementTypes = {
        // Don't want bindings that operate on text nodes to mutate <script> contents,
        // because it's unexpected and a potential XSS issue
        'script': true
    };

    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
    ko['getBindingHandler'] = function(bindingKey) {
        return ko.bindingHandlers[bindingKey];
    };

    // The ko.bindingContext constructor is only called directly to create the root context. For child
    // contexts, use bindingContext.createChildContext or bindingContext.extend.
    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {

        // The binding context object includes static properties for the current, parent, and root view models.
        // If a view model is actually stored in an observable, the corresponding binding context object, and
        // any child contexts, must be updated when the view model is changed.
        function updateContext() {
            // Most of the time, the context will directly get a view model object, but if a function is given,
            // we call the function to retrieve the view model. If the function accesses any obsevables (or is
            // itself an observable), the dependency is tracked, and those observables can later cause the binding
            // context to be updated.
            var dataItem = isFunc ? dataItemOrAccessor() : dataItemOrAccessor;

            if (parentContext) {
                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
                // parent context is updated, this context will also be updated.
                if (parentContext._subscribable)
                    parentContext._subscribable();

                // Copy $root and any custom properties from the parent context
                ko.utils.extend(self, parentContext);

                // Because the above copy overwrites our own properties, we need to reset them.
                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
                if (subscribable) {
                    self._subscribable = subscribable;
                }
            } else {
                self['$parents'] = [];
                self['$root'] = dataItem;

                // Export 'ko' in the binding context so it will be available in bindings and templates
                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
                // See https://github.com/SteveSanderson/knockout/issues/490
                self['ko'] = ko;
            }
            self['$rawData'] = dataItemOrAccessor;
            self['$data'] = dataItem;
            if (dataItemAlias)
                self[dataItemAlias] = dataItem;

            // The extendCallback function is provided when creating a child context or extending a context.
            // It handles the specific actions needed to finish setting up the binding context. Actions in this
            // function could also add dependencies to this binding context.
            if (extendCallback)
                extendCallback(self, parentContext, dataItem);

            return self['$data'];
        }
        function disposeWhen() {
            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
        }

        var self = this,
            isFunc = typeof(dataItemOrAccessor) == "function",
            nodes,
            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
        // the context object.
        if (subscribable.isActive()) {
            self._subscribable = subscribable;

            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
            subscribable['equalityComparer'] = null;

            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
            nodes = [];
            subscribable._addNode = function(node) {
                nodes.push(node);
                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
                    ko.utils.arrayRemoveItem(nodes, node);
                    if (!nodes.length) {
                        subscribable.dispose();
                        self._subscribable = subscribable = undefined;
                    }
                });
            };
        }
    }

    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
    // any obsevables, the new child context will automatically get a dependency on the parent context.
    // But this does not mean that the $data value of the child context will also get updated. If the child
    // view model also depends on the parent view model, you must provide a function that returns the correct
    // view model on each update.
    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
            // Extend the context hierarchy by setting the appropriate pointers
            self['$parentContext'] = parentContext;
            self['$parent'] = parentContext['$data'];
            self['$parents'] = (parentContext['$parents'] || []).slice(0);
            self['$parents'].unshift(self['$parent']);
            if (extendCallback)
                extendCallback(self);
        });
    };

    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
    // when an observable view model is updated.
    ko.bindingContext.prototype['extend'] = function(properties) {
        return new ko.bindingContext(this['$rawData'], this, null, function(self) {
            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
        });
    };

    // Returns the valueAccesor function for a binding value
    function makeValueAccessor(value) {
        return function() {
            return value;
        };
    }

    // Returns the value of a valueAccessor function
    function evaluateValueAccessor(valueAccessor) {
        return valueAccessor();
    }

    // Given a function that returns bindings, create and return a new object that contains
    // binding value-accessors functions. Each accessor function calls the original function
    // so that it always gets the latest value and all dependencies are captured. This is used
    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
    function makeAccessorsFromFunction(callback) {
        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
            return function() {
                return callback()[key];
            };
        });
    }

    // Given a bindings function or object, create and return a new object that contains
    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
    function makeBindingAccessors(bindings, context, node) {
        if (typeof bindings === 'function') {
            return makeAccessorsFromFunction(bindings.bind(null, context, node));
        } else {
            return ko.utils.objectMap(bindings, makeValueAccessor);
        }
    }

    // This function is used if the binding provider doesn't include a getBindingAccessors function.
    // It must be called with 'this' set to the provider instance.
    function getBindingsAndMakeAccessors(node, context) {
        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
    }

    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
        var validator = ko.virtualElements.allowedBindings[bindingName];
        if (!validator)
            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
    }

    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
        var currentChild,
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
            provider = ko.bindingProvider['instance'],
            preprocessNode = provider['preprocessNode'];

        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
        // trigger insertion of <template> contents at that point in the document.
        if (preprocessNode) {
            while (currentChild = nextInQueue) {
                nextInQueue = ko.virtualElements.nextSibling(currentChild);
                preprocessNode.call(provider, currentChild);
            }
            // Reset nextInQueue for the next loop
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
        }

        while (currentChild = nextInQueue) {
            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
            nextInQueue = ko.virtualElements.nextSibling(currentChild);
            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
        }
    }

    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
        var shouldBindDescendants = true;

        // Perf optimisation: Apply bindings only if...
        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
        var isElement = (nodeVerified.nodeType === 1);
        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
        if (shouldApplyBindings)
            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
            //    hence bindingContextsMayDifferFromDomParentElement is false
            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
            //    hence bindingContextsMayDifferFromDomParentElement is true
            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
        }
    }

    var boundElementDomDataKey = ko.utils.domData.nextKey();


    function topologicalSortBindings(bindings) {
        // Depth-first sort
        var result = [],                // The list of key/handler pairs that we will return
            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
            if (!bindingsConsidered[bindingKey]) {
                var binding = ko['getBindingHandler'](bindingKey);
                if (binding) {
                    // First add dependencies (if any) of the current binding
                    if (binding['after']) {
                        cyclicDependencyStack.push(bindingKey);
                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
                            if (bindings[bindingDependencyKey]) {
                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
                                } else {
                                    pushBinding(bindingDependencyKey);
                                }
                            }
                        });
                        cyclicDependencyStack.pop();
                    }
                    // Next add the current binding
                    result.push({ key: bindingKey, handler: binding });
                }
                bindingsConsidered[bindingKey] = true;
            }
        });

        return result;
    }

    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
        if (!sourceBindings) {
            if (alreadyBound) {
                throw Error("You cannot apply bindings multiple times to the same element.");
            }
            ko.utils.domData.set(node, boundElementDomDataKey, true);
        }

        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
        // we can easily recover it just by scanning up the node's ancestors in the DOM
        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
            ko.storedBindingContextForNode(node, bindingContext);

        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
        var bindings;
        if (sourceBindings && typeof sourceBindings !== 'function') {
            bindings = sourceBindings;
        } else {
            var provider = ko.bindingProvider['instance'],
                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

            if (sourceBindings || bindingContext._subscribable) {
                // When an obsevable view model is used, the binding context will expose an observable _subscribable value.
                // Get the binding from the provider within a computed observable so that we can update the bindings whenever
                // the binding context is updated.
                var bindingsUpdater = ko.dependentObservable(
                    function() {
                        bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
                        // Register a dependency on the binding context
                        if (bindings && bindingContext._subscribable)
                            bindingContext._subscribable();
                        return bindings;
                    },
                    null, { disposeWhenNodeIsRemoved: node }
                );

                if (!bindings || !bindingsUpdater.isActive())
                    bindingsUpdater = null;
            } else {
                bindings = ko.dependencyDetection.ignore(getBindings, provider, [node, bindingContext]);
            }
        }

        var bindingHandlerThatControlsDescendantBindings;
        if (bindings) {
            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
            // the latest binding value and registers a dependency on the binding updater.
            var getValueAccessor = bindingsUpdater
                ? function(bindingKey) {
                    return function() {
                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
                    };
                } : function(bindingKey) {
                    return bindings[bindingKey];
                };

            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
            function allBindings() {
                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
            }
            // The following is the 3.x allBindings API
            allBindings['get'] = function(key) {
                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
            };
            allBindings['has'] = function(key) {
                return key in bindings;
            };

            // First put the bindings into the right order
            var orderedBindings = topologicalSortBindings(bindings);

            // Go through the sorted bindings, calling init and update for each
            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
                // so bindingKeyAndHandler.handler will always be nonnull.
                var handlerInitFn = bindingKeyAndHandler.handler["init"],
                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
                    bindingKey = bindingKeyAndHandler.key;

                if (node.nodeType === 8) {
                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
                }

                try {
                    // Run init, ignoring any dependencies
                    if (typeof handlerInitFn == "function") {
                        ko.dependencyDetection.ignore(function() {
                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

                            // If this binding handler claims to control descendant bindings, make a note of this
                            if (initResult && initResult['controlsDescendantBindings']) {
                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                bindingHandlerThatControlsDescendantBindings = bindingKey;
                            }
                        });
                    }

                    // Run update in its own computed wrapper
                    if (typeof handlerUpdateFn == "function") {
                        ko.dependentObservable(
                            function() {
                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
                            },
                            null,
                            { disposeWhenNodeIsRemoved: node }
                        );
                    }
                } catch (ex) {
                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
                    throw ex;
                }
            });
        }

        return {
            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
        };
    };

    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
    ko.storedBindingContextForNode = function (node, bindingContext) {
        if (arguments.length == 2) {
            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
            if (bindingContext._subscribable)
                bindingContext._subscribable._addNode(node);
        } else {
            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
        }
    }

    function getBindingContext(viewModelOrBindingContext) {
        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
            ? viewModelOrBindingContext
            : new ko.bindingContext(viewModelOrBindingContext);
    }

    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(node);
        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
    };

    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
        var context = getBindingContext(viewModelOrBindingContext);
        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
    };

    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    // Retrieving binding context from arbitrary nodes
    ko.contextFor = function(node) {
        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
        switch (node.nodeType) {
            case 1:
            case 8:
                var context = ko.storedBindingContextForNode(node);
                if (context) return context;
                if (node.parentNode) return ko.contextFor(node.parentNode);
                break;
        }
        return undefined;
    };
    ko.dataFor = function(node) {
        var context = ko.contextFor(node);
        return context ? context['$data'] : undefined;
    };

    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
    ko.exportSymbol('applyBindings', ko.applyBindings);
    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
    ko.exportSymbol('contextFor', ko.contextFor);
    ko.exportSymbol('dataFor', ko.dataFor);
})();
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['attr'] = {
    'update': function(element, valueAccessor, allBindings) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
        ko.utils.objectForEach(value, function(attrName, attrValue) {
            attrValue = ko.utils.unwrapObservable(attrValue);

            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
            // when someProp is a "no value"-like value (strictly null, false, or undefined)
            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
            if (toRemove)
                element.removeAttribute(attrName);

            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
            // property for IE <= 8.
            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
                attrName = attrHtmlToJavascriptMap[attrName];
                if (toRemove)
                    element.removeAttribute(attrName);
                else
                    element[attrName] = attrValue;
            } else if (!toRemove) {
                element.setAttribute(attrName, attrValue.toString());
            }

            // Treat "name" specially - although you can think of it as an attribute, it also needs
            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
            // entirely, and there's no strong reason to allow for such casing in HTML.
            if (attrName === "name") {
                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
            }
        });
    }
};
(function() {

ko.bindingHandlers['checked'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        function checkedValue() {
            return allBindings['has']('checkedValue')
                ? ko.utils.unwrapObservable(allBindings.get('checkedValue'))
                : element.value;
        }

        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (click) and changes in checkedValue.
            var isChecked = element.checked,
                elemValue = useCheckedValue ? checkedValue() : isChecked;

            // When we're first setting up this computed, don't change any model state.
            if (!shouldSet) {
                return;
            }

            // We can ignore unchecked radio buttons, because some other radio
            // button will be getting checked, and that one can take care of updating state.
            if (isRadio && !isChecked) {
                return;
            }

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            if (isValueArray) {
                if (oldElemValue !== elemValue) {
                    // When we're responding to the checkedValue changing, and the element is
                    // currently checked, replace the old elem value with the new elem value
                    // in the model array.
                    if (isChecked) {
                        ko.utils.addOrRemoveItem(modelValue, elemValue, true);
                        ko.utils.addOrRemoveItem(modelValue, oldElemValue, false);
                    }

                    oldElemValue = elemValue;
                } else {
                    // When we're responding to the user having checked/unchecked a checkbox,
                    // add/remove the element value to the model array.
                    ko.utils.addOrRemoveItem(modelValue, elemValue, isChecked);
                }
            } else {
                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
            }
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (checked) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (isValueArray) {
                // When a checkbox is bound to an array, being checked represents its value being present in that array
                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
            } else if (isCheckbox) {
                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
                element.checked = modelValue;
            } else {
                // For radio buttons, being checked means that the radio button's value corresponds to the model value
                element.checked = (checkedValue() === modelValue);
            }
        };

        var isCheckbox = element.type == "checkbox",
            isRadio = element.type == "radio";

        // Only bind to check boxes and radio buttons
        if (!isCheckbox && !isRadio) {
            return;
        }

        var isValueArray = isCheckbox && (ko.utils.unwrapObservable(valueAccessor()) instanceof Array),
            oldElemValue = isValueArray ? checkedValue() : undefined,
            useCheckedValue = isRadio || isValueArray,
            shouldSet = false;

        // IE 6 won't allow radio buttons to be selected unless they have a name
        if (isRadio && !element.name)
            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

        // Set up two computeds to update the binding:

        // The first responds to changes in the checkedValue value and to element clicks
        ko.dependentObservable(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "click", updateModel);

        // The second responds to changes in the model value (the one associated with the checked binding)
        ko.dependentObservable(updateView, null, { disposeWhenNodeIsRemoved: element });

        shouldSet = true;
    }
};
ko.expressionRewriting.twoWayBindings['checked'] = true;

ko.bindingHandlers['checkedValue'] = {
    'update': function (element, valueAccessor) {
        element.value = ko.utils.unwrapObservable(valueAccessor());
    }
};

})();var classesWrittenByBindingKey = '__ko__cssValue';
ko.bindingHandlers['css'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (typeof value == "object") {
            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
            });
        } else {
            value = String(value || ''); // Make sure we don't try to store or set a non-string value
            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
            element[classesWrittenByBindingKey] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    }
};
ko.bindingHandlers['enable'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && element.disabled)
            element.removeAttribute("disabled");
        else if ((!value) && (!element.disabled))
            element.disabled = true;
    }
};

ko.bindingHandlers['disable'] = {
    'update': function (element, valueAccessor) {
        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
    }
};
// For certain common events (currently just 'click'), allow a simplified data-binding syntax
// e.g. click:handler instead of the usual full-length event:{click:handler}
function makeEventHandlerShortcut(eventName) {
    ko.bindingHandlers[eventName] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
        }
    }
}

ko.bindingHandlers['event'] = {
    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var eventsToHandle = valueAccessor() || {};
        ko.utils.objectForEach(eventsToHandle, function(eventName) {
            if (typeof eventName == "string") {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor()[eventName];
                    if (!handlerFunction)
                        return;

                    try {
                        // Take all the event args, and prefix with the viewmodel
                        var argsForHandler = ko.utils.makeArray(arguments);
                        viewModel = bindingContext['$data'];
                        argsForHandler.unshift(viewModel);
                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
                    if (!bubble) {
                        event.cancelBubble = true;
                        if (event.stopPropagation)
                            event.stopPropagation();
                    }
                });
            }
        });
    }
};
// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
ko.bindingHandlers['foreach'] = {
    makeTemplateValueAccessor: function(valueAccessor) {
        return function() {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

            // If unwrappedValue is the array, pass in the wrapped value on its own
            // The value will be unwrapped and tracked within the template binding
            // (See https://github.com/SteveSanderson/knockout/issues/523)
            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
            ko.utils.unwrapObservable(modelValue);
            return {
                'foreach': unwrappedValue['data'],
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        };
    },
    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
    },
    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
ko.virtualElements.allowedBindings['foreach'] = true;
var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
var hasfocusLastValue = '__ko_hasfocusLastValue';
ko.bindingHandlers['hasfocus'] = {
    'init': function(element, valueAccessor, allBindings) {
        var handleElementFocusChange = function(isFocused) {
            // Where possible, ignore which event was raised and determine focus state using activeElement,
            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
            // from calling 'blur()' on the element when it loses focus.
            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
            element[hasfocusUpdatingProperty] = true;
            var ownerDoc = element.ownerDocument;
            if ("activeElement" in ownerDoc) {
                var active;
                try {
                    active = ownerDoc.activeElement;
                } catch(e) {
                    // IE9 throws if you access activeElement during page load (see issue #703)
                    active = ownerDoc.body;
                }
                isFocused = (active === element);
            }
            var modelValue = valueAccessor();
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
            element[hasfocusLastValue] = isFocused;
            element[hasfocusUpdatingProperty] = false;
        };
        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
    },
    'update': function(element, valueAccessor) {
        var value = !!ko.utils.unwrapObservable(valueAccessor()); //force boolean to compare with last value
        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
            value ? element.focus() : element.blur();
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]); // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
        }
    }
};
ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
ko.bindingHandlers['html'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
    }
};
var withIfDomDataKey = ko.utils.domData.nextKey();
// Makes a binding like with or if
function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
    ko.bindingHandlers[bindingKey] = {
        'init': function(element) {
            ko.utils.domData.set(element, withIfDomDataKey, {});
            return { 'controlsDescendantBindings': true };
        },
        'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var withIfData = ko.utils.domData.get(element, withIfDomDataKey),
                dataValue = ko.utils.unwrapObservable(valueAccessor()),
                shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
                isFirstRender = !withIfData.savedNodes,
                needsRefresh = isFirstRender || isWith || (shouldDisplay !== withIfData.didDisplayOnLastUpdate);

            if (needsRefresh) {
                if (isFirstRender) {
                    withIfData.savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                }

                if (shouldDisplay) {
                    if (!isFirstRender) {
                        ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(withIfData.savedNodes));
                    }
                    ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
                } else {
                    ko.virtualElements.emptyNode(element);
                }

                withIfData.didDisplayOnLastUpdate = shouldDisplay;
            }
        }
    };
    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings[bindingKey] = true;
}

// Construct the actual binding handlers
makeWithIfBinding('if');
makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
makeWithIfBinding('with', true /* isWith */, false /* isNot */,
    function(bindingContext, dataValue) {
        return bindingContext['createChildContext'](dataValue);
    }
);
ko.bindingHandlers['options'] = {
    'init': function(element) {
        if (ko.utils.tagNameLower(element) !== "select")
            throw new Error("options binding applies only to SELECT elements");

        // Remove all existing <option>s.
        while (element.length > 0) {
            element.remove(0);
        }

        // Ensures that the binding processor doesn't try to bind the options
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor, allBindings) {
        function selectedOptions() {
            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
        }

        var selectWasPreviouslyEmpty = element.length == 0;
        var previousScrollTop = (!selectWasPreviouslyEmpty && element.multiple) ? element.scrollTop : null;

        var unwrappedArray = ko.utils.unwrapObservable(valueAccessor());
        var includeDestroyed = allBindings.get('optionsIncludeDestroyed');
        var captionPlaceholder = {};
        var captionValue;
        var previousSelectedValues;
        if (element.multiple) {
            previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
        } else {
            previousSelectedValues = element.selectedIndex >= 0 ? [ ko.selectExtensions.readValue(element.options[element.selectedIndex]) ] : [];
        }

        if (unwrappedArray) {
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // If caption is included, add it to the array
            if (allBindings['has']('optionsCaption')) {
                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
                // If caption value is null or undefined, don't show a caption
                if (captionValue !== null && captionValue !== undefined) {
                    filteredArray.unshift(captionPlaceholder);
                }
            }
        } else {
            // If a falsy value is provided (e.g. null), we'll simply empty the select element
            unwrappedArray = [];
        }

        function applyToObject(object, predicate, defaultValue) {
            var predicateType = typeof predicate;
            if (predicateType == "function")    // Given a function; run it against the data value
                return predicate(object);
            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
                return object[predicate];
            else                                // Given no optionsText arg; use the data value itself
                return defaultValue;
        }

        // The following functions can run at two different times:
        // The first is when the whole array is being updated directly from this binding handler.
        // The second is when an observable value for a specific array entry is updated.
        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
        var itemUpdate = false;
        function optionForArrayItem(arrayEntry, index, oldOptions) {
            if (oldOptions.length) {
                previousSelectedValues = oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
                itemUpdate = true;
            }
            var option = document.createElement("option");
            if (arrayEntry === captionPlaceholder) {
                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
                ko.selectExtensions.writeValue(option, undefined);
            } else {
                // Apply a value to the option element
                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

                // Apply some text to the option element
                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
                ko.utils.setTextContent(option, optionText);
            }
            return [option];
        }

        function setSelectionCallback(arrayEntry, newOptions) {
            // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
            // That's why we first added them without selection. Now it's time to set the selection.
            if (previousSelectedValues.length) {
                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

                // If this option was changed from being selected during a single-item update, notify the change
                if (itemUpdate && !isSelected)
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
            }
        }

        var callback = setSelectionCallback;
        if (allBindings['has']('optionsAfterRender')) {
            callback = function(arrayEntry, newOptions) {
                setSelectionCallback(arrayEntry, newOptions);
                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
            }
        }

        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, null, callback);

        // Determine if the selection has changed as a result of updating the options list
        var selectionChanged;
        if (element.multiple) {
            // For a multiple-select box, compare the new selection count to the previous one
            // But if nothing was selected before, the selection can't have changed
            selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
        } else {
            // For a single-select box, compare the current value to the previous value
            // But if nothing was selected before or nothing is selected now, just look for a change in selection
            selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
                ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
                : (previousSelectedValues.length || element.selectedIndex >= 0);
        }

        // Ensure consistency between model value and selected option.
        // If the dropdown was changed so that selection is no longer the same,
        // notify the value or selectedOptions binding.
        if (selectionChanged)
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);

        // Workaround for IE bug
        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
            element.scrollTop = previousScrollTop;
    }
};
ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");

        var newValue = ko.utils.unwrapObservable(valueAccessor());
        if (newValue && typeof newValue.length == "number") {
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                ko.utils.setOptionNodeSelectionState(node, isSelected);
            });
        }
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
ko.bindingHandlers['style'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor() || {});
        ko.utils.objectForEach(value, function(styleName, styleValue) {
            styleValue = ko.utils.unwrapObservable(styleValue);
            element.style[styleName] = styleValue || ""; // Empty string removes the value, whereas null/undefined have no effect
        });
    }
};
ko.bindingHandlers['submit'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (typeof valueAccessor() != "function")
            throw new Error("The value for a submit binding must be a function");
        ko.utils.registerEventHandler(element, "submit", function (event) {
            var handlerReturnValue;
            var value = valueAccessor();
            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
            finally {
                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;
                }
            }
        });
    }
};
ko.bindingHandlers['text'] = {
	'init': function() {
		// Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
		// It should also make things faster, as we no longer have to consider whether the text node might be bindable.
        return { 'controlsDescendantBindings': true };
	},
    'update': function (element, valueAccessor) {
        ko.utils.setTextContent(element, valueAccessor());
    }
};
ko.virtualElements.allowedBindings['text'] = true;
ko.bindingHandlers['uniqueName'] = {
    'init': function (element, valueAccessor) {
        if (valueAccessor()) {
            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
            ko.utils.setElementName(element, name);
        }
    }
};
ko.bindingHandlers['uniqueName'].currentIndex = 0;
ko.bindingHandlers['value'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        // Always catch "change" event; possibly other events too if asked
        var eventsToCatch = ["change"];
        var requestedEventsToCatch = allBindings.get("valueUpdate");
        var propertyChangedFired = false;
        if (requestedEventsToCatch) {
            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                requestedEventsToCatch = [requestedEventsToCatch];
            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
        }

        var valueUpdateHandler = function() {
            propertyChangedFired = false;
            var modelValue = valueAccessor();
            var elementValue = ko.selectExtensions.readValue(element);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
        }

        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
            ko.utils.registerEventHandler(element, "blur", function() {
                if (propertyChangedFired) {
                    valueUpdateHandler();
                }
            });
        }

        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
            // This is useful, for example, to catch "keydown" events after the browser has updated the control
            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
            var handler = valueUpdateHandler;
            if (ko.utils.stringStartsWith(eventName, "after")) {
                handler = function() { setTimeout(valueUpdateHandler, 0) };
                eventName = eventName.substring("after".length);
            }
            ko.utils.registerEventHandler(element, eventName, handler);
        });
    },
    'update': function (element, valueAccessor) {
        var valueIsSelectOption = ko.utils.tagNameLower(element) === "select";
        var newValue = ko.utils.unwrapObservable(valueAccessor());
        var elementValue = ko.selectExtensions.readValue(element);
        var valueHasChanged = (newValue !== elementValue);

        if (valueHasChanged) {
            var applyValueAction = function () { ko.selectExtensions.writeValue(element, newValue); };
            applyValueAction();

            if (valueIsSelectOption) {
                if (newValue !== ko.selectExtensions.readValue(element)) {
                    // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
                    // because you're not allowed to have a model value that disagrees with a visible UI selection.
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                } else {
                    // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                    // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                    // to apply the value as well.
                    setTimeout(applyValueAction, 0);
                }
            }
        }
    }
};
ko.expressionRewriting.twoWayBindings['value'] = true;
ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};
// 'click' is just a shorthand for the usual full-length event:{click:handler}
makeEventHandlerShortcut('click');
// If you want to make a custom template engine,
//
// [1] Inherit from this class (like ko.nativeTemplateEngine does)
// [2] Override 'renderTemplateSource', supplying a function with this signature:
//
//        function (templateSource, bindingContext, options) {
//            // - templateSource.text() is the text of the template you should render
//            // - bindingContext.$data is the data you should pass into the template
//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
//            //     and bindingContext.$root available in the template too
//            // - options gives you access to any other properties set on "data-bind: { template: options }"
//            //
//            // Return value: an array of DOM nodes
//        }
//
// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
//
//        function (script) {
//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
//        }
//
//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

ko.templateEngine = function () { };

ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options) {
    throw new Error("Override renderTemplateSource");
};

ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
    throw new Error("Override createJavaScriptEvaluatorBlock");
};

ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem)
            throw new Error("Cannot find template with ID " + template);
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    return this['renderTemplateSource'](templateSource, bindingContext, options);
};

ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
    // Skip rewriting if requested
    if (this['allowTemplateRewriting'] === false)
        return true;
    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
};

ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    var rewritten = rewriterCallback(templateSource['text']());
    templateSource['text'](rewritten);
    templateSource['data']("isRewritten", true);
};

ko.exportSymbol('templateEngine', ko.templateEngine);

ko.templateRewriting = (function () {
    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

    function validateDataBindValuesForRewriting(keyValueArray) {
        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
        for (var i = 0; i < keyValueArray.length; i++) {
            var key = keyValueArray[i]['key'];
            if (allValidators.hasOwnProperty(key)) {
                var validator = allValidators[key];

                if (typeof validator === "function") {
                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
                    if (possibleErrorMessage)
                        throw new Error(possibleErrorMessage);
                } else if (!validator) {
                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
                }
            }
        }
    }

    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
        validateDataBindValuesForRewriting(dataBindKeyValueArray);
        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
        // extra indirection.
        var applyBindingsToNextSiblingScript =
            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
    }

    return {
        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
                templateEngine['rewriteTemplate'](template, function (htmlString) {
                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
                }, templateDocument);
        },

        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
            });
        },

        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
            return ko.memoization.memoize(function (domNode, bindingContext) {
                var nodeToBind = domNode.nextSibling;
                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
                }
            });
        }
    }
})();


// Exported only because it has to be referenced by string lookup from within rewritten template
ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
(function() {
    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
    //
    // Two are provided by default:
    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
    //                                           without reading/writing the actual element text content, since it will be overwritten
    //                                           with the rendered template output.
    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
    // Template sources need to have the following functions:
    //   text() 			- returns the template text from your storage location
    //   text(value)		- writes the supplied template text to your storage location
    //   data(key)			- reads values stored using data(key, value) - see below
    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
    //
    // Optionally, template sources can also have the following functions:
    //   nodes()            - returns a DOM element containing the nodes of this template, where available
    //   nodes(value)       - writes the given DOM element to your storage location
    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
    //
    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

    ko.templateSources = {};

    // ---- ko.templateSources.domElement -----

    ko.templateSources.domElement = function(element) {
        this.domElement = element;
    }

    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
        var tagNameLower = ko.utils.tagNameLower(this.domElement),
            elemContentsProperty = tagNameLower === "script" ? "text"
                                 : tagNameLower === "textarea" ? "value"
                                 : "innerHTML";

        if (arguments.length == 0) {
            return this.domElement[elemContentsProperty];
        } else {
            var valueToWrite = arguments[0];
            if (elemContentsProperty === "innerHTML")
                ko.utils.setHtml(this.domElement, valueToWrite);
            else
                this.domElement[elemContentsProperty] = valueToWrite;
        }
    };

    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
        if (arguments.length === 1) {
            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
        } else {
            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
        }
    };

    // ---- ko.templateSources.anonymousTemplate -----
    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

    var anonymousTemplatesDomDataKey = ko.utils.domData.nextKey();
    ko.templateSources.anonymousTemplate = function(element) {
        this.domElement = element;
    }
    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            if (templateData.textData === undefined && templateData.containerData)
                templateData.textData = templateData.containerData.innerHTML;
            return templateData.textData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {textData: valueToWrite});
        }
    };
    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            return templateData.containerData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {containerData: valueToWrite});
        }
    };

    ko.exportSymbol('templateSources', ko.templateSources);
    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
})();
(function () {
    var _templateEngine;
    ko.setTemplateEngine = function (templateEngine) {
        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
            throw new Error("templateEngine must inherit from ko.templateEngine");
        _templateEngine = templateEngine;
    }

    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
            nextInQueue = ko.virtualElements.nextSibling(node);
            action(node, nextInQueue);
        }
    }

    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

        if (continuousNodeArray.length) {
            var firstNode = continuousNodeArray[0],
                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
                parentNode = firstNode.parentNode,
                provider = ko.bindingProvider['instance'],
                preprocessNode = provider['preprocessNode'];

            if (preprocessNode) {
                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
                    var nodePreviousSibling = node.previousSibling;
                    var newNodes = preprocessNode.call(provider, node);
                    if (newNodes) {
                        if (node === firstNode)
                            firstNode = newNodes[0] || nextNodeInRange;
                        if (node === lastNode)
                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
                    }
                });

                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
                // first node needs to be in the array).
                continuousNodeArray.length = 0;
                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
                    return;
                }
                if (firstNode === lastNode) {
                    continuousNodeArray.push(firstNode);
                } else {
                    continuousNodeArray.push(firstNode, lastNode);
                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
                }
            }

            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
            // whereas a regular applyBindings won't introduce new memoized nodes
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.applyBindings(bindingContext, node);
            });
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
            });

            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
        }
    }

    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
                                        : null;
    }

    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
        options = options || {};
        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
        var templateDocument = firstTargetNode && firstTargetNode.ownerDocument;
        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

        // Loosely check result is an array of DOM nodes
        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
            throw new Error("Template engine must return an array of DOM nodes");

        var haveAddedNodesToParent = false;
        switch (renderMode) {
            case "replaceChildren":
                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "replaceNode":
                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "ignoreTargetNode": break;
            default:
                throw new Error("Unknown renderMode: " + renderMode);
        }

        if (haveAddedNodesToParent) {
            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
            if (options['afterRender'])
                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
        }

        return renderedNodesArray;
    }

    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
        options = options || {};
        if ((options['templateEngine'] || _templateEngine) == undefined)
            throw new Error("Set a template engine before calling renderTemplate");
        renderMode = renderMode || "replaceChildren";

        if (targetNodeOrNodeArray) {
            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
                function () {
                    // Ensure we've got a proper binding context to work with
                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
                        ? dataOrBindingContext
                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));

                    // Support selecting template as a function of the data being rendered
                    var templateName = typeof(template) == 'function' ? template(bindingContext['$data'], bindingContext) : template;

                    var renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);
                    if (renderMode == "replaceNode") {
                        targetNodeOrNodeArray = renderedNodesArray;
                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
                    }
                },
                null,
                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
            );
        } else {
            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
            return ko.memoization.memoize(function (domNode) {
                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
            });
        }
    };

    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
        var arrayItemContext;

        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
        var executeTemplateForArrayItem = function (arrayValue, index) {
            // Support selecting template as a function of the data being rendered
            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
                context['$index'] = index;
            });
            var templateName = typeof(template) == 'function' ? template(arrayValue, arrayItemContext) : template;
            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
        }

        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
            if (options['afterRender'])
                options['afterRender'](addedNodesArray, arrayValue);
        };

        return ko.dependentObservable(function () {
            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

        }, null, { disposeWhenNodeIsRemoved: targetNode });
    };

    var templateComputedDomDataKey = ko.utils.domData.nextKey();
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
            oldComputed.dispose();
        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }

    ko.bindingHandlers['template'] = {
        'init': function(element, valueAccessor) {
            // Support anonymous templates
            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
            if (typeof bindingValue == "string" || bindingValue['name']) {
                // It's a named template - clear the element
                ko.virtualElements.emptyNode(element);
            } else {
                // It's an anonymous template - store the element contents, then clear the element
                var templateNodes = ko.virtualElements.childNodes(element),
                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            }
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var templateName = ko.utils.unwrapObservable(valueAccessor()),
                options = {},
                shouldDisplay = true,
                dataValue,
                templateComputed = null;

            if (typeof templateName != "string") {
                options = templateName;
                templateName = ko.utils.unwrapObservable(options['name']);

                // Support "if"/"ifnot" conditions
                if ('if' in options)
                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
                if (shouldDisplay && 'ifnot' in options)
                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);

                dataValue = ko.utils.unwrapObservable(options['data']);
            }

            if ('foreach' in options) {
                // Render once for each data point (treating data set as empty if shouldDisplay==false)
                var dataArray = (shouldDisplay && options['foreach']) || [];
                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
            } else if (!shouldDisplay) {
                ko.virtualElements.emptyNode(element);
            } else {
                // Render once for this single data point (or use the viewModel if no data was provided)
                var innerBindingContext = ('data' in options) ?
                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
            }

            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        }
    };

    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
            return null; // Named templates can be rewritten, so return "no error"
        return "This template engine does not support anonymous templates nested within its templates";
    };

    ko.virtualElements.allowedBindings['template'] = true;
})();

ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
ko.exportSymbol('renderTemplate', ko.renderTemplate);

ko.utils.compareArrays = (function () {
    var statusNotInOld = 'added', statusNotInNew = 'deleted';

    // Simple calculation based on Levenshtein distance.
    function compareArrays(oldArray, newArray, options) {
        // For backward compatibility, if the third arg is actually a bool, interpret
        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
        oldArray = oldArray || [];
        newArray = newArray || [];

        if (oldArray.length <= newArray.length)
            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
        else
            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
    }

    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
        var myMin = Math.min,
            myMax = Math.max,
            editDistanceMatrix = [],
            smlIndex, smlIndexMax = smlArray.length,
            bigIndex, bigIndexMax = bigArray.length,
            compareRange = (bigIndexMax - smlIndexMax) || 1,
            maxDistance = smlIndexMax + bigIndexMax + 1,
            thisRow, lastRow,
            bigIndexMaxForRow, bigIndexMinForRow;

        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
            lastRow = thisRow;
            editDistanceMatrix.push(thisRow = []);
            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
            bigIndexMinForRow = myMax(0, smlIndex - 1);
            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
                if (!bigIndex)
                    thisRow[bigIndex] = smlIndex + 1;
                else if (!smlIndex)  // Top row - transform empty array into new array via additions
                    thisRow[bigIndex] = bigIndex + 1;
                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
                else {
                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
                }
            }
        }

        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
                notInSml.push(editScript[editScript.length] = {     // added
                    'status': statusNotInSml,
                    'value': bigArray[--bigIndex],
                    'index': bigIndex });
            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
                notInBig.push(editScript[editScript.length] = {     // deleted
                    'status': statusNotInBig,
                    'value': smlArray[--smlIndex],
                    'index': smlIndex });
            } else {
                --bigIndex;
                --smlIndex;
                if (!options['sparse']) {
                    editScript.push({
                        'status': "retained",
                        'value': bigArray[bigIndex] });
                }
            }
        }

        if (notInSml.length && notInBig.length) {
            // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
            // smlIndexMax keeps the time complexity of this algorithm linear.
            var limitFailedCompares = smlIndexMax * 10, failedCompares,
                a, d, notInSmlItem, notInBigItem;
            // Go through the items that have been added and deleted and try to find matches between them.
            for (failedCompares = a = 0; (options['dontLimitMoves'] || failedCompares < limitFailedCompares) && (notInSmlItem = notInSml[a]); a++) {
                for (d = 0; notInBigItem = notInBig[d]; d++) {
                    if (notInSmlItem['value'] === notInBigItem['value']) {
                        notInSmlItem['moved'] = notInBigItem['index'];
                        notInBigItem['moved'] = notInSmlItem['index'];
                        notInBig.splice(d,1);       // This item is marked as moved; so remove it from notInBig list
                        failedCompares = d = 0;     // Reset failed compares count because we're checking for consecutive failures
                        break;
                    }
                }
                failedCompares += d;
            }
        }
        return editScript.reverse();
    }

    return compareArrays;
})();

ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);

(function () {
    // Objective:
    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
    //   previously mapped - retain those nodes, and just insert/delete other ones

    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
    // You can use this, for example, to activate bindings on those nodes.

    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
        // Map this array value inside a dependentObservable so we re-map when any dependency changes
        var mappedNodes = [];
        var dependentObservable = ko.dependentObservable(function() {
            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

            // On subsequent evaluations, just replace the previously-inserted DOM nodes
            if (mappedNodes.length > 0) {
                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
                if (callbackAfterAddingNodes)
                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
            }

            // Replace the contents of the mappedNodes array, thereby updating the record
            // of which nodes would be deleted if valueToMap was itself later removed
            mappedNodes.splice(0, mappedNodes.length);
            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
    }

    var lastMappingResultDomDataKey = ko.utils.domData.nextKey();

    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
        // Compare the provided array against the previous one
        array = array || [];
        options = options || {};
        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

        // Build the new mapping result
        var newMappingResult = [];
        var lastMappingResultIndex = 0;
        var newMappingResultIndex = 0;

        var nodesToDelete = [];
        var itemsToProcess = [];
        var itemsForBeforeRemoveCallbacks = [];
        var itemsForMoveCallbacks = [];
        var itemsForAfterAddCallbacks = [];
        var mapData;

        function itemMovedOrRetained(editScriptIndex, oldPosition) {
            mapData = lastMappingResult[oldPosition];
            if (newMappingResultIndex !== oldPosition)
                itemsForMoveCallbacks[editScriptIndex] = mapData;
            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
            mapData.indexObservable(newMappingResultIndex++);
            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
            newMappingResult.push(mapData);
            itemsToProcess.push(mapData);
        }

        function callCallback(callback, items) {
            if (callback) {
                for (var i = 0, n = items.length; i < n; i++) {
                    if (items[i]) {
                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
                            callback(node, i, items[i].arrayEntry);
                        });
                    }
                }
            }
        }

        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
            movedIndex = editScriptItem['moved'];
            switch (editScriptItem['status']) {
                case "deleted":
                    if (movedIndex === undefined) {
                        mapData = lastMappingResult[lastMappingResultIndex];

                        // Stop tracking changes to the mapping for these nodes
                        if (mapData.dependentObservable)
                            mapData.dependentObservable.dispose();

                        // Queue these nodes for later removal
                        nodesToDelete.push.apply(nodesToDelete, ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode));
                        if (options['beforeRemove']) {
                            itemsForBeforeRemoveCallbacks[i] = mapData;
                            itemsToProcess.push(mapData);
                        }
                    }
                    lastMappingResultIndex++;
                    break;

                case "retained":
                    itemMovedOrRetained(i, lastMappingResultIndex++);
                    break;

                case "added":
                    if (movedIndex !== undefined) {
                        itemMovedOrRetained(i, movedIndex);
                    } else {
                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
                        newMappingResult.push(mapData);
                        itemsToProcess.push(mapData);
                        if (!isFirstExecution)
                            itemsForAfterAddCallbacks[i] = mapData;
                    }
                    break;
            }
        }

        // Call beforeMove first before any changes have been made to the DOM
        callCallback(options['beforeMove'], itemsForMoveCallbacks);

        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
            // Get nodes for newly added items
            if (!mapData.mappedNodes)
                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

            // Put nodes in the right place if they aren't there already
            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
                if (node !== nextNode)
                    ko.virtualElements.insertAfter(domNode, node, lastNode);
            }

            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
            if (!mapData.initialized && callbackAfterAddingNodes) {
                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
                mapData.initialized = true;
            }
        }

        // If there's a beforeRemove callback, call it after reordering.
        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
        // Perhaps we'll make that change in the future if this scenario becomes more common.
        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

        // Finally call afterMove and afterAdd callbacks
        callCallback(options['afterMove'], itemsForMoveCallbacks);
        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);

        // Store a copy of the array items we just considered so we can difference it next time
        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);
    }
})();

ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
ko.nativeTemplateEngine = function () {
    this['allowTemplateRewriting'] = false;
}

ko.nativeTemplateEngine.prototype = new ko.templateEngine();
ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options) {
    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

    if (templateNodes) {
        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
    } else {
        var templateText = templateSource['text']();
        return ko.utils.parseHtmlFragment(templateText);
    }
};

ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
(function() {
    ko.jqueryTmplTemplateEngine = function () {
        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
        // doesn't expose a version number, so we have to infer it.
        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
        // which KO internally refers to as version "2", so older versions are no longer detected.
        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
            if ((typeof(jQuery) == "undefined") || !(jQuery['tmpl']))
                return 0;
            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
            try {
                if (jQuery['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
                    return 2; // Final version of jquery.tmpl
                }
            } catch(ex) { /* Apparently not the version we were looking for */ }

            return 1; // Any older version that we don't support
        })();

        function ensureHasReferencedJQueryTemplates() {
            if (jQueryTmplVersion < 2)
                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
        }

        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
            return jQuery['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
        }

        this['renderTemplateSource'] = function(templateSource, bindingContext, options) {
            options = options || {};
            ensureHasReferencedJQueryTemplates();

            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                var templateText = templateSource['text']() || "";
                // Wrap in "with($whatever.koBindingContext) { ... }"
                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

                precompiled = jQuery['template'](null, templateText);
                templateSource['data']('precompiled', precompiled);
            }

            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
            var jQueryTemplateOptions = jQuery['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
            resultNodes['appendTo'](document.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

            jQuery['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
            return resultNodes;
        };

        this['createJavaScriptEvaluatorBlock'] = function(script) {
            return "{{ko_code ((function() { return " + script + " })()) }}";
        };

        this['addTemplate'] = function(templateName, templateMarkup) {
            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
        };

        if (jQueryTmplVersion > 0) {
            jQuery['tmpl']['tag']['ko_code'] = {
                open: "__.push($1 || '');"
            };
            jQuery['tmpl']['tag']['ko_with'] = {
                open: "with($1) {",
                close: "} "
            };
        }
    };

    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

    // Use this one by default *only if jquery.tmpl is referenced*
    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
})();
}));
}());
})();

/*!
 * Knockout ES5 plugin - https://github.com/SteveSanderson/knockout-es5
 * Copyright (c) Steve Sanderson
 * MIT license
 */

(function(global, undefined) {
    'use strict';

    // Model tracking
    // --------------
    //
    // This is the central feature of Knockout-ES5. We augment model objects by converting properties
    // into ES5 getter/setter pairs that read/write an underlying Knockout observable. This means you can
    // use plain JavaScript syntax to read/write the property while still getting the full benefits of
    // Knockout's automatic dependency detection and notification triggering.
    //
    // For comparison, here's Knockout ES3-compatible syntax:
    //
    //     var firstNameLength = myModel.user().firstName().length; // Read
    //     myModel.user().firstName('Bert'); // Write
    //
    // ... versus Knockout-ES5 syntax:
    //
    //     var firstNameLength = myModel.user.firstName.length; // Read
    //     myModel.user.firstName = 'Bert'; // Write

    // `ko.track(model)` converts each property on the given model object into a getter/setter pair that
    // wraps a Knockout observable. Optionally specify an array of property names to wrap; otherwise we
    // wrap all properties. If any of the properties are already observables, we replace them with
    // ES5 getter/setter pairs that wrap your original observable instances. In the case of readonly
    // ko.computed properties, we simply do not define a setter (so attempted writes will be ignored,
    // which is how ES5 readonly properties normally behave).
    //
    // By design, this does *not* recursively walk child object properties, because making literally
    // everything everywhere independently observable is usually unhelpful. When you do want to track
    // child object properties independently, define your own class for those child objects and put
    // a separate ko.track call into its constructor --- this gives you far more control.
    function track(obj, propertyNames) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('When calling ko.track, you must pass an object as the first parameter.');
        }

        var ko = this,
            allObservablesForObject = getAllObservablesForObject(obj, true);
        propertyNames = propertyNames || Object.getOwnPropertyNames(obj);

        propertyNames.forEach(function(propertyName) {
            // Skip properties that are already tracked
            if (propertyName in allObservablesForObject) {
                return;
            }

            var origValue = obj[propertyName],
                isArray = origValue instanceof Array,
                observable = ko.isObservable(origValue) ? origValue
                                              : isArray ? ko.observableArray(origValue)
                                                        : ko.observable(origValue);

            Object.defineProperty(obj, propertyName, {
                configurable: true,
                enumerable: true,
                get: observable,
                set: ko.isWriteableObservable(observable) ? observable : undefined
            });

            allObservablesForObject[propertyName] = observable;

            if (isArray) {
                notifyWhenPresentOrFutureArrayValuesMutate(ko, observable);
            }
        });

        return obj;
    }

    // Lazily created by `getAllObservablesForObject` below. Has to be created lazily because the
    // WeakMap factory isn't available until the module has finished loading (may be async).
    var objectToObservableMap;

    // Gets or creates the hidden internal key-value collection of observables corresponding to
    // properties on the model object.
    function getAllObservablesForObject(obj, createIfNotDefined) {
        if (!objectToObservableMap) {
            objectToObservableMap = weakMapFactory();
        }

        var result = objectToObservableMap.get(obj);
        if (!result && createIfNotDefined) {
            result = {};
            objectToObservableMap.set(obj, result);
        }
        return result;
    }

    // Computed properties
    // -------------------
    //
    // The preceding code is already sufficient to upgrade ko.computed model properties to ES5
    // getter/setter pairs (or in the case of readonly ko.computed properties, just a getter).
    // These then behave like a regular property with a getter function, except they are smarter:
    // your evaluator is only invoked when one of its dependencies changes. The result is cached
    // and used for all evaluations until the next time a dependency changes).
    //
    // However, instead of forcing developers to declare a ko.computed property explicitly, it's
    // nice to offer a utility function that declares a computed getter directly.

    // Implements `ko.defineProperty`
    function defineComputedProperty(obj, propertyName, evaluatorOrOptions) {
        var ko = this,
            computedOptions = { owner: obj, deferEvaluation: true };

        if (typeof evaluatorOrOptions === 'function') {
            computedOptions.read = evaluatorOrOptions;
        } else {
            if ('value' in evaluatorOrOptions) {
                throw new Error('For ko.defineProperty, you must not specify a "value" for the property. You must provide a "get" function.');
            }

            if (typeof evaluatorOrOptions.get !== 'function') {
                throw new Error('For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".');
            }

            computedOptions.read = evaluatorOrOptions.get;
            computedOptions.write = evaluatorOrOptions.set;
        }

        obj[propertyName] = ko.computed(computedOptions);
        track.call(ko, obj, [propertyName]);
        return obj;
    }

    // Array handling
    // --------------
    //
    // Arrays are special, because unlike other property types, they have standard mutator functions
    // (`push`/`pop`/`splice`/etc.) and it's desirable to trigger a change notification whenever one of
    // those mutator functions is invoked.
    //
    // Traditionally, Knockout handles this by putting special versions of `push`/`pop`/etc. on observable
    // arrays that mutate the underlying array and then trigger a notification. That approach doesn't
    // work for Knockout-ES5 because properties now return the underlying arrays, so the mutator runs
    // in the context of the underlying array, not any particular observable:
    //
    //     // Operates on the underlying array value
    //     myModel.someCollection.push('New value');
    //
    // To solve this, Knockout-ES5 detects array values, and modifies them as follows:
    //  1. Associates a hidden subscribable with each array instance that it encounters
    //  2. Intercepts standard mutators (`push`/`pop`/etc.) and makes them trigger the subscribable
    // Then, for model properties whose values are arrays, the property's underlying observable
    // subscribes to the array subscribable, so it can trigger a change notification after mutation.

    // Given an observable that underlies a model property, watch for any array value that might
    // be assigned as the property value, and hook into its change events
    function notifyWhenPresentOrFutureArrayValuesMutate(ko, observable) {
        var watchingArraySubscription = null;
        ko.computed(function () {
            // Unsubscribe to any earlier array instance
            if (watchingArraySubscription) {
                watchingArraySubscription.dispose();
                watchingArraySubscription = null;
            }

            // Subscribe to the new array instance
            var newArrayInstance = observable();
            if (newArrayInstance instanceof Array) {
                watchingArraySubscription = startWatchingArrayInstance(ko, observable, newArrayInstance);
            }
        });
    }

    // Listens for array mutations, and when they happen, cause the observable to fire notifications.
    // This is used to make model properties of type array fire notifications when the array changes.
    // Returns a subscribable that can later be disposed.
    function startWatchingArrayInstance(ko, observable, arrayInstance) {
        var subscribable = getSubscribableForArray(ko, arrayInstance);
        return subscribable.subscribe(observable);
    }

    // Lazily created by `getSubscribableForArray` below. Has to be created lazily because the
    // WeakMap factory isn't available until the module has finished loading (may be async).
    var arraySubscribablesMap;

    // Gets or creates a subscribable that fires after each array mutation
    function getSubscribableForArray(ko, arrayInstance) {
        if (!arraySubscribablesMap) {
            arraySubscribablesMap = weakMapFactory();
        }

        var subscribable = arraySubscribablesMap.get(arrayInstance);
        if (!subscribable) {
            subscribable = new ko.subscribable();
            arraySubscribablesMap.set(arrayInstance, subscribable);

            var notificationPauseSignal = {};
            wrapStandardArrayMutators(arrayInstance, subscribable, notificationPauseSignal);
            addKnockoutArrayMutators(ko, arrayInstance, subscribable, notificationPauseSignal);
        }

        return subscribable;
    }

    // After each array mutation, fires a notification on the given subscribable
    function wrapStandardArrayMutators(arrayInstance, subscribable, notificationPauseSignal) {
        ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'].forEach(function(fnName) {
            var origMutator = arrayInstance[fnName];
            arrayInstance[fnName] = function() {
                var result = origMutator.apply(this, arguments);
                if (notificationPauseSignal.pause !== true) {
                    subscribable.notifySubscribers(this);
                }
                return result;
            };
        });
    }

    // Adds Knockout's additional array mutation functions to the array
    function addKnockoutArrayMutators(ko, arrayInstance, subscribable, notificationPauseSignal) {
        ['remove', 'removeAll', 'destroy', 'destroyAll', 'replace'].forEach(function(fnName) {
            // Make it a non-enumerable property for consistency with standard Array functions
            Object.defineProperty(arrayInstance, fnName, {
                enumerable: false,
                value: function() {
                    var result;

                    // These additional array mutators are built using the underlying push/pop/etc.
                    // mutators, which are wrapped to trigger notifications. But we don't want to
                    // trigger multiple notifications, so pause the push/pop/etc. wrappers and
                    // delivery only one notification at the end of the process.
                    notificationPauseSignal.pause = true;
                    try {
                        // Creates a temporary observableArray that can perform the operation.
                        result = ko.observableArray.fn[fnName].apply(ko.observableArray(arrayInstance), arguments);
                    }
                    finally {
                        notificationPauseSignal.pause = false;
                    }
                    subscribable.notifySubscribers(arrayInstance);
                    return result;
                }
            });
        });
    }

    // Static utility functions
    // ------------------------
    //
    // Since Knockout-ES5 sets up properties that return values, not observables, you can't
    // trivially subscribe to the underlying observables (e.g., `someProperty.subscribe(...)`),
    // or tell them that object values have mutated, etc. To handle this, we set up some
    // extra utility functions that can return or work with the underlying observables.

    // Returns the underlying observable associated with a model property (or `null` if the
    // model or property doesn't exist, or isn't associated with an observable). This means
    // you can subscribe to the property, e.g.:
    //
    //     ko.getObservable(model, 'propertyName')
    //       .subscribe(function(newValue) { ... });
    function getObservable(obj, propertyName) {
        if (!obj || typeof obj !== 'object') {
            return null;
        }

        var allObservablesForObject = getAllObservablesForObject(obj, false);
        return (allObservablesForObject && allObservablesForObject[propertyName]) || null;
    }

    // Causes a property's associated observable to fire a change notification. Useful when
    // the property value is a complex object and you've modified a child property.
    function valueHasMutated(obj, propertyName) {
        var observable = getObservable(obj, propertyName);

        if (observable) {
            observable.valueHasMutated();
        }
    }

    // Module initialisation
    // ---------------------
    //
    // When this script is first evaluated, it works out what kind of module loading scenario
    // it is in (Node.js or a browser `<script>` tag), stashes a reference to its dependencies
    // (currently that's just the WeakMap shim), and then finally attaches itself to whichever
    // instance of Knockout.js it can find.

    // A function that returns a new ES6-compatible WeakMap instance (using ES5 shim if needed).
    // Instantiated by prepareExports, accounting for which module loader is being used.
    var weakMapFactory;

    // Extends a Knockout instance with Knockout-ES5 functionality
    function attachToKo(ko) {
        ko.track = track;
        ko.getObservable = getObservable;
        ko.valueHasMutated = valueHasMutated;
        ko.defineProperty = defineComputedProperty;
    }

    // Determines which module loading scenario we're in, grabs dependencies, and attaches to KO
    function prepareExports() {
        if (typeof module !== 'undefined') {
            // Node.js case - load KO and WeakMap modules synchronously
            var ko = require('knockout'),
                WM = require('weakmap');
            attachToKo(ko);
            weakMapFactory = function() { return new WM(); };
            module.exports = ko;
        } else if ('ko' in global) {
            // Non-module case - attach to the global instance, and assume a global WeakMap constructor
            attachToKo(global.ko);
            weakMapFactory = function() { return new global.WeakMap(); };
        }
    }

    prepareExports();

})(this);

/*! WeakMap shim
 * (The MIT License)
 *
 * Copyright (c) 2012 Brandon Benvie <http://bbenvie.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the 'Software'), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included with all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY  CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Original WeakMap implementation by Gozala @ https://gist.github.com/1269991
// Updated and bugfixed by Raynos @ https://gist.github.com/1638059
// Expanded by Benvie @ https://github.com/Benvie/harmony-collections

// This is the version used by knockout-es5. Modified by Steve Sanderson as follows:
// [1] Deleted weakmap.min.js (it's not useful as it would be out of sync with weakmap.js now I'm editing it)
// [2] Since UglifyJS strips inline function names (and you can't disable that without disabling name mangling
//     entirely), insert code that re-adds function names

void function(global, undefined_, undefined){
  var getProps = Object.getOwnPropertyNames,
      defProp  = Object.defineProperty,
      toSource = Function.prototype.toString,
      create   = Object.create,
      hasOwn   = Object.prototype.hasOwnProperty,
      funcName = /^\n?function\s?(\w*)?_?\(/;


  function define(object, key, value){
    if (typeof key === 'function') {
      value = key;
      key = nameOf(value).replace(/_$/, '');
    }
    return defProp(object, key, { configurable: true, writable: true, value: value });
  }

  function nameOf(func){
    return typeof func !== 'function'
          ? '' : '_name' in func
          ? func._name : 'name' in func
          ? func.name : toSource.call(func).match(funcName)[1];
  }

  function namedFunction(name, func) {
    // Undo the name-stripping that UglifyJS does
    func._name = name;
    return func;
  }

  // ############
  // ### Data ###
  // ############

  var Data = (function(){
    var dataDesc = { value: { writable: true, value: undefined } },
        datalock = 'return function(k){if(k===s)return l}',
        uids     = create(null),

        createUID = function(){
          var key = Math.random().toString(36).slice(2);
          return key in uids ? createUID() : uids[key] = key;
        },

        globalID = createUID(),

        storage = function(obj){
          if (hasOwn.call(obj, globalID))
            return obj[globalID];

          if (!Object.isExtensible(obj))
            throw new TypeError("Object must be extensible");

          var store = create(null);
          defProp(obj, globalID, { value: store });
          return store;
        };

    // common per-object storage area made visible by patching getOwnPropertyNames'
    define(Object, namedFunction('getOwnPropertyNames', function getOwnPropertyNames(obj){
      var props = getProps(obj);
      if (hasOwn.call(obj, globalID))
        props.splice(props.indexOf(globalID), 1);
      return props;
    }));

    function Data(){
      var puid = createUID(),
          secret = {};

      this.unlock = function(obj){
        var store = storage(obj);
        if (hasOwn.call(store, puid))
          return store[puid](secret);

        var data = create(null, dataDesc);
        defProp(store, puid, {
          value: new Function('s', 'l', datalock)(secret, data)
        });
        return data;
      }
    }

    define(Data.prototype, namedFunction('get', function get(o){ return this.unlock(o).value }));
    define(Data.prototype, namedFunction('set', function set(o, v){ this.unlock(o).value = v }));

    return Data;
  }());


  var WM = (function(data){
    var validate = function(key){
      if (key == null || typeof key !== 'object' && typeof key !== 'function')
        throw new TypeError("Invalid WeakMap key");
    }

    var wrap = function(collection, value){
      var store = data.unlock(collection);
      if (store.value)
        throw new TypeError("Object is already a WeakMap");
      store.value = value;
    }

    var unwrap = function(collection){
      var storage = data.unlock(collection).value;
      if (!storage)
        throw new TypeError("WeakMap is not generic");
      return storage;
    }

    var initialize = function(weakmap, iterable){
      if (iterable !== null && typeof iterable === 'object' && typeof iterable.forEach === 'function') {
        iterable.forEach(function(item, i){
          if (item instanceof Array && item.length === 2)
            set.call(weakmap, iterable[i][0], iterable[i][1]);
        });
      }
    }


    function WeakMap(iterable){
      if (this === global || this == null || this === WeakMap.prototype)
        return new WeakMap(iterable);

      wrap(this, new Data);
      initialize(this, iterable);
    }

    function get(key){
      validate(key);
      var value = unwrap(this).get(key);
      return value === undefined_ ? undefined : value;
    }

    function set(key, value){
      validate(key);
      // store a token for explicit undefined so that "has" works correctly
      unwrap(this).set(key, value === undefined ? undefined_ : value);
    }

    function has(key){
      validate(key);
      return unwrap(this).get(key) !== undefined;
    }

    function delete_(key){
      validate(key);
      var data = unwrap(this),
          had = data.get(key) !== undefined;
      data.set(key, undefined);
      return had;
    }

    function toString(){
      unwrap(this);
      return '[object WeakMap]';
    }

    // Undo the function-name stripping that UglifyJS does
    get._name = 'get';
    set._name = 'set';
    has._name = 'has';
    toString._name = 'toString';

    try {
      var src = ('return '+delete_).replace('e_', '\\u0065'),
          del = new Function('unwrap', 'validate', src)(unwrap, validate);
    } catch (e) {
      var del = delete_;
    }

    var src = (''+Object).split('Object');
    var stringifier = namedFunction('toString', function toString(){
      return src[0] + nameOf(this) + src[1];
    });

    define(stringifier, stringifier);

    var prep = { __proto__: [] } instanceof Array
      ? function(f){ f.__proto__ = stringifier }
      : function(f){ define(f, stringifier) };

    prep(WeakMap);

    [toString, get, set, has, del].forEach(function(method){
      define(WeakMap.prototype, method);
      prep(method);
    });

    return WeakMap;
  }(new Data));

  var defaultCreator = Object.create
    ? function(){ return Object.create(null) }
    : function(){ return {} };

  function createStorage(creator){
    var weakmap = new WM;
    creator || (creator = defaultCreator);

    function storage(object, value){
      if (value || arguments.length === 2) {
        weakmap.set(object, value);
      } else {
        value = weakmap.get(object);
        if (value === undefined) {
          value = creator(object);
          weakmap.set(object, value);
        }
      }
      return value;
    }

    return storage;
  }


  if (typeof module !== 'undefined') {
    module.exports = WM;
  } else if (typeof exports !== 'undefined') {
    exports.WeakMap = WM;
  } else if (!('WeakMap' in global)) {
    global.WeakMap = WM;
  }

  WM.createStorage = createStorage;
  if (global.WeakMap)
    global.WeakMap.createStorage = createStorage;
}((0, eval)('this'));

/**
 Radio.js - Chainable, Dependency Free Publish/Subscribe for Javascript
 http://radio.uxder.com
 Author: Scott Murphy 2011
 twitter: @hellocreation, github: uxder
 
 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:
 
 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
(function (name, global, definition) {
	if (typeof module !== 'undefined') module.exports = definition(name, global);
	else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
	else global[name] = definition(name, global);
})('radio', this, function (name, global) {

	"use strict";

	/**
	 * Main Wrapper for radio.$ and create a function radio to accept the channelName
	 * @param {String} channelName topic of event
	 */
	function radio(channelName) {
		radio.$.channel(channelName);
		return radio.$;
	}

	radio.$ = {
		version: '0.2',
		channelName: "",
		channels: [],
		/**
		 * Broadcast (publish)
		 * Iterate through all listeners (callbacks) in current channel and pass arguments to subscribers
		 * @param arguments data to be sent to listeners
		 * @example
		 *    //basic usage
		 *    radio('channel1').broadcast('my message'); 
		 *    //send an unlimited number of parameters
		 *    radio('channel2').broadcast(param1, param2, param3 ... );
		 */
		broadcast: function() {
			var i, c = this.channels[this.channelName],
				l = c.length,
				subscriber, callback, context;
			//iterate through current channel and run each subscriber
			for (i = 0; i < l; i++) {
				subscriber = c[i];
				//if subscriber was an array, set the callback and context.
				if ((typeof(subscriber) === 'object') && (subscriber.length)) {
					callback = subscriber[0];
					//if user set the context, set it to the context otherwise, it is a globally scoped function
					context = subscriber[1] || global;
				}
				callback.apply(context, arguments);
			}
			return this;
		},

		/**
		 * Create the channel if it doesn't exist and set the current channel/event name
		 * @param {String} name the name of the channel
		 * @example
		 *    radio('channel1');
		 */
		channel: function(name) {
			var c = this.channels;
			//create a new channel if it doesn't exists
			if (!c[name]) c[name] = [];
			this.channelName = name;
			return this;
		},

		/**
		 * Add Subscriber to channel
		 * Take the arguments and add it to the this.channels array.
		 * @param {Function|Array} arguments list of callbacks or arrays[callback, context] separated by commas
		 * @example
		 *      //basic usage
		 *      var callback = function() {};
		 *      radio('channel1').subscribe(callback); 
		 *
		 *      //subscribe an endless amount of callbacks
		 *      radio('channel1').subscribe(callback, callback2, callback3 ...);
		 *
		 *      //adding callbacks with context
		 *      radio('channel1').subscribe([callback, context],[callback1, context], callback3);
		 *     
		 *      //subscribe by chaining
		 *      radio('channel1').subscribe(callback).radio('channel2').subscribe(callback).subscribe(callback2);
		 */
		subscribe: function() {
			var a = arguments,
				c = this.channels[this.channelName],
				i, l = a.length,
				p, ai = [];

			//run through each arguments and subscribe it to the channel
			for (i = 0; i < l; i++) {
				ai = a[i];
				//if the user sent just a function, wrap the fucntion in an array [function]
				p = (typeof(ai) === "function") ? [ai] : ai;
				if ((typeof(p) === 'object') && (p.length)) c.push(p);
			}
			return this;
		},

		/**
		 * Remove subscriber from channel
		 * Take arguments with functions and unsubscribe it if there is a match against existing subscribers.
		 * @param {Function} arguments callbacks separated by commas
		 * @example
		 *      //basic usage
		 *      radio('channel1').unsubscribe(callback); 
		 *      //you can unsubscribe as many callbacks as you want
		 *      radio('channel1').unsubscribe(callback, callback2, callback3 ...);
		 *       //removing callbacks with context is the same
		 *      radio('channel1').subscribe([callback, context]).unsubscribe(callback);
		 */
		unsubscribe: function() {
			var a = arguments,
				i, j, c = this.channels[this.channelName],
				l = a.length,
				cl = c.length,
				offset = 0,
				jo;
			//loop through each argument
			for (i = 0; i < l; i++) {
				//need to reset vars that change as the channel array items are removed
				offset = 0;
				cl = c.length;
				//loop through the channel
				for (j = 0; j < cl; j++) {
					jo = j - offset;
					//if there is a match with the argument and the channel function, unsubscribe it from the channel array
					if (c[jo][0] === a[i]) {
						//unsubscribe matched item from the channel array
						c.splice(jo, 1);
						offset++;
					}
				}
			}
			return this;
		}
	};

	return radio;
});

/**
 * humane.js
 * Humanized Messages for Notifications
 * @author Marc Harter (@wavded)
 * @example
 *   humane.log('hello world');
 * See more usage examples at: http://wavded.github.com/humane-js/
 */

;!function (name, context, definition) {
   if (typeof module !== 'undefined') module.exports = definition(name, context)
   else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition)
   else context[name] = definition(name, context)
}('humane', this, function (name, context) {
   var win = window
   var doc = document

   var ENV = {
      on: function (el, type, cb) {
         'addEventListener' in win ? el.addEventListener(type,cb,false) : el.attachEvent('on'+type,cb)
      },
      off: function (el, type, cb) {
         'removeEventListener' in win ? el.removeEventListener(type,cb,false) : el.detachEvent('on'+type,cb)
      },
      bind: function (fn, ctx) {
         return function () { fn.apply(ctx,arguments) }
      },
      isArray: Array.isArray || function (obj) { return Object.prototype.toString.call(obj) === '[object Array]' },
      config: function (preferred, fallback) {
         return preferred != null ? preferred : fallback
      },
      transSupport: false,
      useFilter: /msie [678]/i.test(navigator.userAgent), // sniff, sniff
      _checkTransition: function () {
         var el = doc.createElement('div')
         var vendors = { webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' }

         for (var vendor in vendors)
            if (vendor + 'Transition' in el.style) {
               this.vendorPrefix = vendors[vendor]
               this.transSupport = true
            }
      }
   }
   ENV._checkTransition()

   var Humane = function (o) {
      o || (o = {})
      this.queue = []
      this.baseCls = o.baseCls || 'humane'
      this.addnCls = o.addnCls || ''
      this.timeout = 'timeout' in o ? o.timeout : 2500
      this.waitForMove = o.waitForMove || false
      this.clickToClose = o.clickToClose || false
      this.timeoutAfterMove = o.timeoutAfterMove || false 
      this.container = o.container

      try { this._setupEl() } // attempt to setup elements
      catch (e) {
        ENV.on(win,'load',ENV.bind(this._setupEl, this)) // dom wasn't ready, wait till ready
      }
   }

   Humane.prototype = {
      constructor: Humane,
      _setupEl: function () {
         var el = doc.createElement('div')
         el.style.display = 'none'
         if (!this.container){
           if(doc.body) this.container = doc.body;
           else throw 'document.body is null'
         }
         this.container.appendChild(el)
         this.el = el
         this.removeEvent = ENV.bind(function(){ if (!this.timeoutAfterMove){this.remove()} else {setTimeout(ENV.bind(this.remove,this),this.timeout);}},this)
         this.transEvent = ENV.bind(this._afterAnimation,this)
         this._run()
      },
      _afterTimeout: function () {
         if (!ENV.config(this.currentMsg.waitForMove,this.waitForMove)) this.remove()

         else if (!this.removeEventsSet) {
            ENV.on(doc.body,'mousemove',this.removeEvent)
            ENV.on(doc.body,'click',this.removeEvent)
            ENV.on(doc.body,'keypress',this.removeEvent)
            ENV.on(doc.body,'touchstart',this.removeEvent)
            this.removeEventsSet = true
         }
      },
      _run: function () {
         if (this._animating || !this.queue.length || !this.el) return

         this._animating = true
         if (this.currentTimer) {
            clearTimeout(this.currentTimer)
            this.currentTimer = null
         }

         var msg = this.queue.shift()
         var clickToClose = ENV.config(msg.clickToClose,this.clickToClose)

         if (clickToClose) {
            ENV.on(this.el,'click',this.removeEvent)
            ENV.on(this.el,'touchstart',this.removeEvent)
         }

         var timeout = ENV.config(msg.timeout,this.timeout)

         if (timeout > 0)
            this.currentTimer = setTimeout(ENV.bind(this._afterTimeout,this), timeout)

         if (ENV.isArray(msg.html)) msg.html = '<ul><li>'+msg.html.join('<li>')+'</ul>'

         this.el.innerHTML = msg.html
         this.currentMsg = msg
         this.el.className = this.baseCls
         if (ENV.transSupport) {
            this.el.style.display = 'block'
            setTimeout(ENV.bind(this._showMsg,this),50)
         } else {
            this._showMsg()
         }

      },
      _setOpacity: function (opacity) {
         if (ENV.useFilter){
            try{
               this.el.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity*100
            } catch(err){}
         } else {
            this.el.style.opacity = String(opacity)
         }
      },
      _showMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-animate'
         }
         else {
            var opacity = 0
            this.el.className = this.baseCls+' '+addnCls+' '+this.baseCls+'-js-animate'
            this._setOpacity(0) // reset value so hover states work
            this.el.style.display = 'block'

            var self = this
            var interval = setInterval(function(){
               if (opacity < 1) {
                  opacity += 0.1
                  if (opacity > 1) opacity = 1
                  self._setOpacity(opacity)
               }
               else clearInterval(interval)
            }, 30)
         }
      },
      _hideMsg: function () {
         var addnCls = ENV.config(this.currentMsg.addnCls,this.addnCls)
         if (ENV.transSupport) {
            this.el.className = this.baseCls+' '+addnCls
            ENV.on(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)
         }
         else {
            var opacity = 1
            var self = this
            var interval = setInterval(function(){
               if(opacity > 0) {
                  opacity -= 0.1
                  if (opacity < 0) opacity = 0
                  self._setOpacity(opacity);
               }
               else {
                  self.el.className = self.baseCls+' '+addnCls
                  clearInterval(interval)
                  self._afterAnimation()
               }
            }, 30)
         }
      },
      _afterAnimation: function () {
         if (ENV.transSupport) ENV.off(this.el,ENV.vendorPrefix ? ENV.vendorPrefix+'TransitionEnd' : 'transitionend',this.transEvent)

         if (this.currentMsg.cb) this.currentMsg.cb()
         this.el.style.display = 'none'

         this._animating = false
         this._run()
      },
      remove: function (e) {
         var cb = typeof e == 'function' ? e : null

         ENV.off(doc.body,'mousemove',this.removeEvent)
         ENV.off(doc.body,'click',this.removeEvent)
         ENV.off(doc.body,'keypress',this.removeEvent)
         ENV.off(doc.body,'touchstart',this.removeEvent)
         ENV.off(this.el,'click',this.removeEvent)
         ENV.off(this.el,'touchstart',this.removeEvent)
         this.removeEventsSet = false

         if (cb && this.currentMsg) this.currentMsg.cb = cb
         if (this._animating) this._hideMsg()
         else if (cb) cb()
      },
      log: function (html, o, cb, defaults) {
         var msg = {}
         if (defaults)
           for (var opt in defaults)
               msg[opt] = defaults[opt]

         if (typeof o == 'function') cb = o
         else if (o)
            for (var opt in o) msg[opt] = o[opt]

         msg.html = html
         if (cb) msg.cb = cb
         this.queue.push(msg)
         this._run()
         return this
      },
      spawn: function (defaults) {
         var self = this
         return function (html, o, cb) {
            self.log.call(self,html,o,cb,defaults)
            return self
         }
      },
      create: function (o) { return new Humane(o) }
   }
   return new Humane()
})

;(function() {
    window.ion = window.ion || {};

    var DIE_PARSER  = /\d+d\d+/g,
        FORMAT_PARSER = /\{[^\|}]+\}/g,
        RANDOM_STRING = /\{[^\{\}]*\|[^\{\}]*\}/g,
        STARTS_WITH_VOWEL = /^[aeiouAEIOU]/,
        STARTS_WITH_THE = /^[tT]he\s/,
        SMALL_WORDS = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i,
        PARENS = /(\{[^\}]*\})/g,
        CONS_Y = /[BCDFGHIJKLMNPQRSTVWXZbcdfghijklmnpqrstvwxz]y$/;
    
    function basicPluralize(string) {
        if (/[x|s]$/.test(string)) {
            return (string + "es");
        } else if (CONS_Y.test(string)) {
            return string.substring(0,string.length-1) + "ies";
        }
        return (string + "s");
    }
    function copy(target, source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
        return target;
    }
    
    // clever, then you do slice(arguments), requires the bind function though
    // (which I already assume is present).
    // var slice = Function.prototype.call.bind(Array.prototype.slice);
    
    var slice = Array.prototype.slice,
        indexOf = Array.prototype.indexOf,
        filter = Array.prototype.filter,
        map  = Array.prototype.map,
        forEach = Array.prototype.forEach;
    
    // The utility methods are really just here to avoid having a dependency on 
    // any common library like underscore.js or sugar.js.
    // Array.isArray. Would take more space to use that than this.
    ['Array','Function','String','Date','RegExp','Boolean','Number','Object'].forEach(function(type) {
        window.ion['is'+type] = function(obj) {
            return Object.prototype.toString.call(obj) === "[object "+type+"]";
        };
    });
    
    copy(window.ion, {
        /* ======================================= */
        /* UTIL METHODS */
        /* ======================================= */
        isUndefined: function(v) {
            return (typeof v === "undefined");
        },
        
        extend: copy,
        
        identity: function(o) {
            return o;
        },
        transform: function(f) {
            return f();
        },
        contains: function(array, obj) {
            return (array) ? indexOf.call(array, obj) > -1 : false;
        },
        find: function(array, func, context) {
            for (var i=0; i < array.length; i++) {
                if (func.call(context || window, array[i])) {
                    return array[i];
                }
            }
            return null;
        },
        keys: function(obj) {
            return (ion.isObject(obj)) ? Object.keys(obj) : [];
        },
        values: function(obj) {
            return ion.keys(obj).map(function(key) {
                return obj[key];
            });
        },
        /**
         * Execute a function N times. Each iteration of the function, it receives the 
         * arguments `i` for the current iteration (starting at zero), and `N` for the 
         * total number of times the function will be excuted.
         * 
         *      _.times(4, function(i,n) {
         *          console.log(i,"of",n,"iterations");
         *      });
         *      => "0 of 4 iterations"
         *      => "1 of 4 iterations"
         *      => "2 of 4 iterations"
         *      => "3 of 4 iterations"
         * 
         * @param count {Number} the number of times to execute the function.
         * @param func {Function} the function to execute. Receives two parameters, `i` 
         *      (zero-based index of the iteration) and `N` (total number of iterations 
         *      to be performed).
         * @param [context] {Object} object bound to the function when executed 
         */
        times: function(count, func, context) {
            for (var i=0; i < count; i++) {
                func.call(context || window, i, count);
            }
        },
        last: function(array) {
            return (array && array.length) ? array[array.length-1] : null;
        },
        unique: function(array) {
            if (arguments.length === 0 || array.length === 0) { return []; }
            var seen = [];
            filter.call(array, function(element) {
                if (seen.indexOf(element) === -1) {
                    return !!seen.push(element);
                }
            });
            return seen;
        },
        intersection: function(a, b) {
            if (arguments.length !== 2) { return []; }
            // allows arguments objects to be passed to this method
            a = slice.call(a,0);
            b = slice.call(b,0);
            // This is critical to db.find(); optimizing
            var results = [];
            for (var i=0; i < a.length; i++) {
                if (b.indexOf(a[i]) > -1 && results.indexOf(a[i]) === -1) {
                    results[results.length] = a[i];
                }
            }
            return results;
            /*
            return ion.unique(a.filter(function(element) {
                return b.indexOf(element) > -1;
            }));
            */
        },
        union: function(a, b) {
            if (arguments.length !== 2) { return []; }
            // allows arguments objects to be passed to this method
            a = slice.call(a,0);
            b = slice.call(b,0);
            return ion.unique(a.concat(b));
        },
        without: function(array) {
            //if (array.length === 0 || arguments.length === 0) { return []; }
            //array = slice.call(arguments,0);
            var args = slice.call(arguments, 1);
            return filter.call((array || []), function(value) {
                return (args.indexOf(value) === -1);
            });
        },
        // Here's that scary use of object-orientation in JS that your parents told you about
        define: function(parent, methods) {
            if (arguments.length === 1) { // parent is optional
                methods = parent;
                parent = null;
            }
            var F = (methods.init || function() {});
            if (parent) {
                var C = function() {}; // don't call parent constructor
                C.prototype = parent.prototype;
                F.prototype = new C();
            }
            if (methods.properties) {
                for (var methName in methods.properties) {
                    Object.defineProperty(F.prototype, methName, {
                        enumerable: false,
                        configurable: false,
                        get: methods.properties[methName]
                    });
                }
                delete methods.properties;
            }
            delete methods.init;
            for (var prop in methods) {
                F.prototype[prop] = methods[prop];
            }
            F.prototype.constructor = F;
            return F;
        },
        /**
         * Bound the value n by the minimum and maximum values:
         * 
         *     ion.bounded(-2, 0)
         *     => 0
         *     ion.bounded(32, 1, 100)
         *     => 32
         *     ion.bounded(120, 1, 100)
         *     => 100
         *     
         * @static
         * @method bounded
         * @for ion
         *     
         * @param n {Number}
         * @param min {Number}
         * @param [max] {Number}
         * @return {Number} The number n or the min or max value if the n value falls outside of that range.
         */
        bounded: function(n, min, max) {
            max = max || Number.MAX_VALUE; // have to have a min
            return (n < min) ? min : (n > max) ? max : n;
        },
        /**
         * Sum the values of the array (must be numbers).
         * 
         * @static
         * @method sum
         * @for ion
         * 
         * @param array {Array} array of number values
         * @return {Number} the sum of the values in the array
         */
        sum: function(array) {
            return (array || []).reduce(function(memo, num) {
                if (typeof num === "number") {memo += num;}
                return memo; 
            }, 0);
        },
        
        /* ======================================= */
        /* STRING METHODS */
        /* ======================================= */
        
        /**
         * Put an indefinite article in front of the word based on whether or not it 
         * starts with a vowel.
         * 
         *     ion.article("walkie talkie")
         *     => "a walkie talkie"
         *     ion.article("album")
         *     => "an album"
         *     
         * @static
         * @method article
         * @for ion
         *     
         * @param string {String} String to prefix with an indefinite article
         * @return {String} The string with "a" or "an" in front of it.
         */
        article: function(string) {
            return (STARTS_WITH_THE.test(string)) ? string : STARTS_WITH_VOWEL.test(string) ? ("an " + string) : ("a " + string);
        },
        /**
         * Format a string with parameters. There are many ways to supply values to this method:
         * 
         *     ion.format("This {0} a {1}.", ["is", "test"]);
         *     => "This is a test."
         *     ion.format("This {0} a {1}.", "is", "test");
         *     => "This is a test."
         *     ion.format("This {verb} a {noun}.", {"verb": "is", "noun": "test"})
         *     => "This is a test."
         *     
         * @static
         * @method format
         * @for ion
         * 
         * @param template {String} template string
         * @param values+ {Object} An array, a set of values, or an object with key/value pairs that 
         * will be substituted into the template.
         * @return {String} the formatted string
         */
        format: function(string, obj) {
            if (typeof obj == "undefined") {
                return string;
            }
            if (arguments.length > 2 || typeof obj !== "object") {
                obj = slice.call(arguments);
                string = obj.shift();
            }
            // Selects {a} sequences with no pipe (these are multiple selection strings, not substitutions)
            return string.replace(FORMAT_PARSER, function(token){
                var prop = token.substring(1, token.length-1);
                return (typeof obj[prop] == "function") ? obj[prop]() : obj[prop];
            });
        },
        /**
         * Pluralizes a string (usually a noun), if the count is greater than one. If 
         * it's a single item, an indefinite article will be added (see example below 
         * for cases where it should not be added, "uncountables"). The string should 
         * note the method of pluralizing the string in curly braces if it is not a 
         * simple noun that is pluralized using "s", "es" or "aries". For example: 
         * 
         *     ion.pluralize("shoe", 3)
         *     => "3 shoes"
         *     ion.pluralize("status", 2)
         *     => "2 statuses"
         *     ion.pluralize("bag{s} of flour", 1)
         *     => "a bag of flour"
         *     ion.pluralize("bag{s} of flour", 2)
         *     => "2 bags of flour"
         *     // Note suppression of the indefinite article!
         *     ion.pluralize("{|suits of }makeshift metal armor")
         *     => "makeshift metal armor"
         *     ion.pluralize("{|suits of }makeshift metal armor", 4)
         *     => "4 suits of makeshift metal armor"
         * 
         * @static
         * @method pluralize
         * @for ion
         * 
         * @param name {String} A string name following the rules described above
         * @param [count=1] {Number} The number of these items
         * @return {String} the correct singular or plural value
         */
        /**
         * Items can also be used with this method.
         *  
         *     var item = new Item("quarry");
         *     ion.pluralize(item, 3)
         *     => "3 quarries"
         * 
         * @static
         * @method pluralize
         * @for ion
         * 
         * @param item {Item} An item with a string name following the rules described above
         * @param [count=1] {Number} The number of these items
         * @return {String} the correct singular or plural value
         */        
        pluralize: function(string, count) {
            string = (string instanceof ion.models.Item) ? string.name : string;
            count = (count || 1);
            var obj = {singular: "", plural: ""},
                addArticle = string.substring(0,2) !== "{|";
            
            if (count > 1) {
                obj.plural += (count + " ");
            }
            if (string.indexOf("{") === -1) {
                obj.singular = string;
                obj.plural += basicPluralize(string);
            } else {
                string.split(PARENS).forEach(function(element, index) {
                    if (element.indexOf("{") === -1) {
                        obj.singular += element;
                        obj.plural += element;
                    } else if (element.indexOf("|") === -1){
                        obj.plural += element.substring(1, element.length-1);
                    } else {
                        var parts = element.substring(1, element.length-1).split("|");
                        obj.singular += parts[0];
                        obj.plural += parts[1];
                    }
                });
            }
            if (addArticle) { 
                obj.singular = ion.article(obj.singular); 
            }
            return (count === 1) ? obj.singular : obj.plural;
        },        
        /**
         * Convert a string to sentence case (only the first letter capitalized). 
         * 
         *     ion.sentenceCase("antwerp benedict");
         *     => "Antwerp benedict"
         *     ion.sentenceCase("antwerp-Benedict");
         *     => "Antwerp-benedict"
         *     ion.sentenceCase("bead to a small mouth");
         *     => "Bead to a small mouth"
         * 
         * @static
         * @method sentenceCase
         * @for ion
         *     
         * @param string {String}
         * @return {String} in sentence case
         */
        sentenceCase: function(string) {
            if (ion.isString(string)) {
                return string.substring(0,1).toUpperCase() + string.substring(1);
            }
            return string;
        },
        /**
         * Convert string to title case. There's a long list of rules for this 
         * kind of capitalization, see: [this link][0].
         * 
         * *To Title Case 2.1 - http://individed.com/code/to-title-case/<br>
         * Copyright 2008-2013 David Gouch. Licensed under the MIT License.*
         * 
         * [0]: http://daringfireball.net/2008/05/title_case
         * 
         *     ion.titleCase("antwerp benedict");
         *     => "Antwerp Benedict"
         *     ion.titleCase("antwerp-Benedict");
         *     => "Antwerp-Benedict"
         *     ion.titleCase("bead to a small mouth");
         *     => "Bead to a Small Mouth"
         *     
         * @static
         * @method titleCase
         * @for ion
         * 
         * @param string {String} string to title case
         * @return {String} in title case
         */
        titleCase: function(string) {
            return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
                if (index > 0 && index + match.length !== title.length &&
                        match.search(SMALL_WORDS) > -1 && title.charAt(index - 2) !== ":" &&
                        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                        title.charAt(index - 1).search(/[^\s-]/) < 0) {
                    return match.toLowerCase();
                }
                if (match.substr(1).search(/[A-Z]|\../) > -1) {
                    return match;
                }
                return match.charAt(0).toUpperCase() + match.substr(1);
            });
        },
        /**
         * Convert a string to a valid tag by removing spaces and converting 
         * to lower-case letters.
         * 
         * @method toTag
         * @for ion
         */
        toTag: function(string) {
            if (!ion.isString(string)) { return string; }
            return string.toLowerCase().replace(/\s/g,'');
        },
        /**
         * Format the elements of an array into a list phrase.
         * 
         *     ion.toList(['Apples', 'Bananas', 'Oranges'], function(value) {
         *         return "*"+value;
         *     });
         *     => "*Apples, *Bananas, and *Oranges"
         *     
         * @static
         * @method toList
         * @for ion
         * 
         * @param array {Array} The array to format
         * @param func {Function} An optional function to format the elements of the array in the returned string.
         * @return {String} the array formatted as a list.
         */
        toList: function(array, func) {
            func = func || function(s) { return s.toString(); };
            var len = array.length;
            if (len === 0) {
                return "";
            } else if (len === 1) {
                return func(array[0]);
            } else if (len === 2) {
                return func(array[0]) + " and " + func(array[1]);
            } else {
                var arr = array.map(func);
                arr[arr.length-1] = "and " + arr[arr.length-1];
                return arr.join(", ");
            }
        },          
        
        /* ======================================= */
        /* RANDOM METHODS */
        /* ======================================= */
        
        /**
         * Return a random element from the array. Does not change the array. Or, if supplied a 
         * string, return a single instance of a string with several variant values, indicated 
         * with the syntax "{option1|option2|option3} static value". Or, if supplied a number, 
         * returns a value between one and N, where N is the number (same as `ion.roll()`).
         * 
         *     ion.random(['A','B','C']);
         *     => 'A'
         * 
         *     ion.random("{Big|Bad|Black} Dog");
         *     => 'Bad Dog'
         *     
         *     ion.random(8);
         *     => 3
         * 
         * @static
         * @method random
         * @for ion
         * 
         * @param string {String|Array|Number} A string with optional variants, or an array from 
         *      which to select an element, or a number, N, for a random number between 1-N.
         * @return {Object} a single randomized instance, based on the value passed in
         */
        random: function(value) {
            if (ion.isString(value)) {
                return value.replace(RANDOM_STRING, function(token) {
                    return ion.random( token.substring(1, token.length-1).split("|") );
                });
            } else if (ion.isArray(value)) {
                return (value.length) ? value[ ~~(Math.random()*value.length) ] : null;    
            } else if (ion.isNumber(value)) {
                return ion.roll(value);
            }
            throw new Error("Invalid value: " + value);
        },
        /**
         * Returns a random number between one and N:
         * 
         *     ion.roll(8)
         *     => 4
         * 
         * @static
         * @method roll
         * @for ion
         * 
         * @param number {Number} the maximum value to return
         * @return {Number} a value from 1 to N
         */
        /**
         * Returns a random number based on a die roll string. Math operations are supported:
         * 
         *     ion.roll("3d6+2")
         *     => 9
         *     ion.roll("(2d4*10)+500")
         *     => 540
         * 
         * @static
         * @method roll
         * @for ion
         * 
         * @param notation {String} a notation for a dice roll
         * @return {Number} a die roll value
         */
        /**
         * Returns a random number based on a number of die and their faces, with an optional 
         * modifier value:
         * 
         *     ion.roll(2,6) // "2d6"
         *     => 12
         *     ion.roll(3,6,-2) // "3d6-2"
         *     => 10
         * 
         * @static
         * @method roll
         * @for ion
         * 
         * @param numberDie {Number} the number of die to roll 
         * @param facesDie {Number} the number of faces on the die (e.g. "6" for a regular six-sided die)
         * @param [modifier] {Number} an amount to add or subtract from the result.
         * @return {Number} a die roll value, "XdY+Z" where x = numberDie, y = facesDie, and z = modifier (optional)
         */
        roll: function(value) {
            if (arguments.length === 3) { // 2, 6, -10 == "2d6-10"
                return ion.roll(ion.format("{0}d{1}+{2}", arguments[0], arguments[1], arguments[2]));
            } else if (arguments.length === 2) { // 3 6 == "3d6"
                return ion.roll(ion.format("{0}d{1}", arguments[0], arguments[1]));
            } else if (typeof value === "number") {
                return (value > 0) ? ~~( Math.random()*value ) + 1 : 0;
            } else if (typeof value === "string") {
                // Finds and extracts dice notation, rolls the die, and then puts the 
                // result into the full expression. Then evals that to do the math. 
                value = value.replace(DIE_PARSER, function(value) {
                    var split = value.split("d"),
                        rolls = parseInt(split[0],10),
                        face = parseInt(split[1],10),
                        result = 0;
                    for (var i=0; i < rolls; i++) {
                        result += ~~( Math.random()*face ) + 1;
                    }
                    return result;
                });
                try { return eval(value); } 
                catch(e) { return 0; }
            }
            throw new Error("Invalid value: " + value);
        },
        /**
         * Select a value from a number of "strategy" values. Will keep unwrapping 
         * the value until it finds a primitive like a string, number, or boolean. 
         * 
         *     ion.select("A")
         *     => "A"
         *     ion.select(["A","B","C"])
         *     => "C"
         *     ion.select(function() {
         *         return ["A","B","C"];
         *     });
         *     => "B"
         * 
         * @static
         * @method select
         * @for ion
         * 
         * @param value {Object} An array or function
         * @return {Object} If an array, returns a random element of that array; if a function 
         * returns the result of that function, recursively until finding a primitive value.
         */
        select: function(value) {
            if (ion.isArray(value)) {
                return ion.select(ion.random(value));
            } else if (ion.isFunction(value)) {
                return ion.select(value());
            }
            return value;
        },
        /**
         * Randomly shuffle the position of the elements in an array (uses Fisher-Yates shuffle). `ion.random()` 
         * is usually more efficient, but if you need to iterate through a set of values in a random order, 
         * without traversing the same element more than once, `ion.shuffle()` is a better way to randomize 
         * your data.
         * 
         *     var array = ['A','B','C']
         *     ion.shuffle(array);
         *     => 
         *     array;
         *     => ['C','A','B']
         * 
         * @static
         * @method shuffle
         * @for ion
         * 
         * @param array {Array} The array to shuffle (in place)
         */
        shuffle: function(array) {
            var j, temp;
            for (var i = array.length-1; i > 0; i--) {
                j = ~~( Math.random() * ( i + 1 ) );
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        },
        /**
         * Test against a percentage that something will occur.
         * 
         *     if (ion.test(80)) {
         *         // Happens 80% of the time.
         *     }
         *     
         * @static
         * @method test
         * @for ion
         *  
         * @param percentage {Number} The percentage chance that the function returns true
         * @return {Boolean} true if test passes, false otherwise
         */
        test: function(percentage) {
            if (percentage < 0 || percentage > 100) {
                throw new Error("Percentage must be between 0 and 100");
            }
            return ion.roll(100) <= percentage;
        },
        /**
         * Generate a whole random number, on a normal (Gaussian, "bell curve")
         * distribution. For example, you might wish to create a youth gang
         * where the members are mostly 18, but with outliers that are much
         * younger or older. This random number generator will give more useful 
         * results than `ion.random()` if you do not want the numbers to be evenly 
         * distributed.
         * 
         * @static
         * @method gaussian
         * @for ion
         * 
         * @param stdev {Number} The amount of variance from the mean, where about
         *   68% of the numbers will be a number +/- this amount.
         * @param [mean=0] {Number} The mean around which random numbers will be
         *   generated.
         * @return a random number
         */
        gaussian: function(stdev, mean) {
            var x = 0, y = 0, rds, c, m = mean || 0;
            // Uses Box-Muller transform: http://www.protonfish.com/jslib/boxmuller.shtml
            // Two values get generated. You could cache the y value, but the time savings 
            // is trivial and this causes issues when mocking randomness for the tests. So don't.
            do {
                x = Math.random()*2-1;
                y = Math.random()*2-1;
                rds = (x*x) + (y*y);
            } while (rds === 0 || rds > 1);
            c = Math.sqrt(-2*Math.log(rds)/rds);
            return Math.round((x*c)*stdev) + m;
        },
        /**
         * As the gaussian random number method, but it will not return negative
         * numbers (without disturbing the rest of the distribution). 
         * 
         * @static
         * @method nonNegativeGaussian
         * @for ion
         * 
         * @param stdev {Number} The amount of variance from the mean, where about
         *  68% of the numbers will be a number +/- this amount.
         * @param [mean=0] {Number} The mean around which random numbers will be
         *  generated.
         * @returns a random, non-negative number (can include zero)
         */
        nonNegativeGaussian: function(stdev, mean) {
            var value;
            do {
                value = ion.gaussian(stdev, mean);
            } while (value < 0);
            return value;
        },
        // TODO: This still doesn't remove some of the logic around setting up valid parameter
        // objects, which is surprisingly complicated.
        // TODO: REMOVEME
        addIfSet: function(obj, field, value, values, throwError) {
            obj = obj || {};
            if (ion.isUndefined(value) || value === null || value === "") {
                return;
            }
            if (ion.isString(value) && (value.toLowerCase() === "either" || value.toLowerCase() === "any")) {
                return;
            }
            if (values && !ion.contains(values, value)) {
                if (throwError) {
                    throw new Error("Value '"+value+"' not in values: " + values.join(', '));
                }
                return;
            }
            obj[field] = value;
            return obj;
        }
    });
})();

/**
 * This constructor returns a function that can be called with many different parameter
 * signatures to create toString() and toHTML() output (these different parameters are 
 * documented as different "methods").
 * 
 *     var b = ion.Builder();
 *     b("p", {class: 'foo'}, "Some text in the paragraph tag.");
 *     b.toString();
 *     => "<p class='foo'>Some text in the paragraph tag.</p>");
 * 
 * @class ion.Builder
 */
ion.Builder = (function() {

    var map = Array.prototype.map;

    /**
     * Passes each element of the array to the function, which is passed three parameters: 
     * the builder, the item in the list, and the item's index in the list.
     * 
     *     builder(list, function(b, item, index) {
     *         b("#"+index + " " +item.name);
     *     });
     * 
     * @function
     * @param array {Array}
     * @param func {Function}
     * @chainable
     */
    function each(array, func) {
        var oldContext = this.context;
        (array || []).forEach(function(item, index) {
            this.context = item;
            func.call(this.context, this, item, index);
        }, this);
        this.context = oldContext;
    }
    /**
     * Appends the string. If there are additional values appended afterwards, they
     * are interpolated as if the string was a format string (see `ion.format()`).
     * 
     * @function
     * @param string {String}
     * @chainable
     */
    function format() {
        if (arguments.length === 1) {
            this.str += arguments[0];
        } else if (arguments[1]) {
            this.str += ion.format.apply(this.context, arguments);
        }
    }
    /**
     * If the expression is true, execute the true function, otherwise execute the 
     * false function, in either case, the function will be passed one parameter: 
     * the builder.
     * 
     *     builder(!!this.parent, function(b) {
     *         b("Only added if this.parent was present");
     *     }, function(b) {
     *         b("Only added if this.parent was NOT present");
     *     });
     *     
     * @function
     * @param expr {Boolean}
     * @param trueFn {Function}
     * @param falseFn {Function}
     * @chainable
     */
    function either(expr, trueFn, falseFn) {
        if (expr) {
            trueFn.call(this.context, this);
        } else {
            falseFn.call(this.context, this);
        }
    }
    /**
     * If the expression is true, execute the function. The function is passed one 
     * parameter: the builder.
     * 
     *     builder(!!this.parent, function(b) {
     *         b("Only added if this.parent was present");
     *     });
     * 
     * @function
     * @param expr {Boolean}
     * @param func {Function}
     * @chainable
     */
    function when(expr, func) {
        if (expr) {
            func.call(this.context, this);
        }
    }
    /**
     * Adds an HTML tag, and then calls the supplied function to create 
     * content nested in the tag. The function is passed one argument: 
     * the builder.
     * 
     *     builder("p", {class: "person"}, function(b) {
     *         b(character.toString();
     *     });
     * 
     * @function
     * @param name {String} the tag name
     * @param attrs {Object} name/value attribute pairs
     * @param func {Function} a callback function
     * @chainable
     */
    function tag(name, attrs, func) {
        this.str += "<"+name;
        for (var attr in attrs) {
            this.str += ' '+attr+'="'+attrs[attr]+'"';
        }
        this.str += ">";
        func.call(this.context, this);
        this.str += "</"+name+">";
    }
    /**
     * Adds an HTML tag, and then calls the supplied function to create 
     * content nested in the tag. The function is passed one argument: 
     * the builder.
     * 
     *     builder("p", {class: "person"}, character.toString());
     * 
     * @function
     * @param name {String} the tag name
     * @param attrs {Object} name/value attribute pairs
     * @param string {String} a string to add as the content of the tag
     * @chainable
     */
    function simpletag(name, attrs, string) {
        this.str += "<"+name;
        for (var attr in attrs) {
            this.str += ' '+attr+'="'+attrs[attr]+'"';
        }
        this.str += ">"+string+"</"+name+">";
    }
    /**
     * If the expression evaluates as true, appends the string.
     * 
     *     builder(!!this.parent, "Only added if this.parent was present");
     * 
     * @function
     * @param expr {Boolean}
     * @param string {String}
     * @chainable
     */
    function append(expr, string) {
        if (expr) {
            this.str += string;
        }
    }
    /**
     * Add the string, pluralized.
     * 
     *     builder("plum", 3).toString()
     *     => "3 plums"
     * 
     * @function
     * @param string {String}
     * @param count {Number}
     * @chainable
     */
    function plural(string, count) {
        this.str += ion.pluralize(string, count);
    }
    function toString() {
        return this.str;
    }
    
    return function(ctx) {
        if (!ctx) {
            throw new Error("No context obj to Builder"); 
        }
        var bldr = function() {
            var arglist = map.call(arguments, function(arg) {
                if (arg instanceof Array) return 'a';
                return (typeof arg).substring(0,1);
            }).join('');
            switch(arglist) {
            case 'af': each.apply(bldr, arguments); break;
            case 'bf': when.apply(bldr, arguments); break;
            case 'bff': either.apply(bldr, arguments); break;
            case 'bs': append.apply(bldr, arguments); break;           
            case 'sof': tag.apply(bldr, arguments); break;
            case 'sos': simpletag.apply(bldr, arguments); break;
            case 'sn': plural.apply(bldr, arguments); break;
            default: format.apply(bldr, arguments);            
            }
            return bldr;
        };
        bldr.context = ctx;
        bldr.str = "";
        bldr.toString = toString;
        return bldr;
    };
    
})();

(function(ion) {
    
    ion.dice = ion.dice || {};

    function sum() {
        this.value = [].reduce.call(this, function(sum, die) { return sum + die.value; }, 0);
    }
    
    ion.dice.Die = ion.define({
        /**
         * ***If you want to roll some dice to get a number, use the `ion.roll()` utility method. 
         * It is simpler and more flexible.***
         * 
         * If you are modeling a game where you need to record the value of each 
         * die rolled, you will need to model each individual die, and that is 
         * the purpose of this class. It models a die with a number of faces and 
         * a color. The die is always oriented such that one face is "up", or 
         * the selected value of the die. 
         *  
         * Rolling changes this face up side, randomly, as you'd expect if you 
         * rolled a die.
         * 
         * @class ion.dice.Die
         * @constructor
         * @param faces {Number} The number of faces on a white die
         * @param [color=white] {String} The color of the die
         */
        init: function(faces, color) {
            /**
             * The number of polyhedral faces on the die.
             * @property faces {Number} 
             */
            this.faces = faces;
            /**
             * The color of the die.
             * @property {String} [color="white"]
             */
            this.color = color;
            /**
             * The value of the face up side of the die.
             * @property {Number} value
             */
            this.roll();
        },
        /**
         * Roll the die
         *
         * @method roll
         * @return {Number} the new face of the die after rolling
         */
        roll: function() {
            this.value = ion.roll(this.faces);
            return this.value;
        },
        /**
         * The symbol to represent the face up of the die 
         *
         * @method symbol
         * @return {String} the symbol for the face up of the die
         */
        symbol: function() {
            return this.value.toString();
        },
        /**
         * A string description of the die.
         *     var die = new ion.dice.Die(20, "blue");
         *     die.toString();
         *     => "[blue 20]"
         *
         * @method
         * @return {String}
         */
        toString: function() {
            return ion.format("[{0} {1}]", this.color, this.symbol());
        }
    });

    /**
     * Models a fudge die. This is a six-sided die with two blank sides, two "+" 
     * symbols, and two "-" symbols on its faces. These translate into the values 
     * -1, 0 or 1. 
     * @class ion.dice.FudgeDie
     * @extends ion.dice.Die
     */
    ion.dice.FudgeDie = ion.define(ion.dice.Die, {
        /**
         * @class ion.dice.FudgeDie
         * @constructor
         */
        init: function(color) {
            ion.dice.Die.call(this, 6, color);
        },
        roll: function() {
            this.value = ion.roll(3)-2;
            return this.value;
        },
        symbol: function() {
            return (this.value === -1) ? "-" : ((this.value === 1) ? "+" : " ");
        }
    });
    
    /**
     * ***If you want to roll some dice to get a number, use the `ion.roll()` utility method. 
     * It is simpler and more flexible.***
     * 
     * A set of dice. Helps to roll an entire set of dice, get the sum of the 
     * dice, and so forth.
     * 
     * @class ion.dice.Dice
     * @constructor
     * @param [dice]* {ion.dice.Die} One or more dice to include in this set of dice. 
     * Or, can be an array of dice or dice objects. (Correct?)
     */
    ion.dice.Dice = ion.define({
        init: function() {
            this.length = 0;
            for (var i=0; i < arguments.length; i++) {
                var arg = arguments[i];
                if (arg instanceof ion.dice.Dice || ion.isArray(arg)) {
                    for (var j=0; j < arg.length; j++) {
                        this[this.length++] = arg[j];
                    }
                } else {
                    this[this.length++] = arguments[i];
                }
            }
            sum.call(this);
        },
        /**
         * Add a die to this set of dice.
         *
         * @method push
         * @param die {ion.dice.Die} A die to add to the set of dice.
         */
        push: function(die) {
            this[this.length++] = die;
            sum.call(this);
        },
        /**
         * Roll this set of dice.
         *
         * @method roll
         * @return {Number} The new sum of all the die after rolling
         */
        roll: function() {
            [].map.call(this, function(obj) { return obj.roll(); });
            sum.call(this);
            return this.value;
        },
        /**
         * @method toString
         * @return {String} A string describing the dice rolled.
         */
        toString: function() {
            return [].map.call(this, function(obj) { return obj.toString(); }).join(' ');
        }
    });
    
})(ion);
(function(ion) {
    ion.tables = ion.tables || {};
    
    ion.tables.Table = ion.define({
        /**
         * A table of stuff you select by rolling 1d100.
         * 
         *     var table = new ion.tables.Table();
         *     table.add(50, "heads")
         *     table.add(50, "tails");
         *     table.get();
         *     => "heads"
         *     
         * @class ion.tables.Table 
         *
         * @constructor
         * @param inFunction {Function} A function to run on values supplied to the add method. For 
         *  example, you might create a function to convert item names to true Item objects, as a 
         *  convenience when building the table.
         */
        init: function(outFunction) {
            this.outFunction = outFunction || ion.identity;
            this.rows = [];
            this.sum = 0;
        },
        /**
         * Add something to this table. You can either specify the specific percentage that this 
         * element should be selected, or you can provide the range of die roll numbers (this 
         * latter approach is easier when you're adapting an existing pen-and-paper table).
         * 
         * The percentages must add up to 100% (or 100 on 1d100).
         * 
         *     var table = new ion.tables.Table();
         *     table.add(50, object); // will occur 50% of the time
         *     table.add(1, 70, object); // Will occur 70% of the time, on a roll of 1 to 70
         *
         * @method add
         * @param percentOrStartRoll {Number} % chance occurrence of 100%, or the start number on 1d100
         * @param [endRoll] {Number} 
         * @param object  {Object} Element to add to the table, can be any type
         */
        add: function() {
            var start, end, object, chance;
            if (arguments.length === 3) {
                start = arguments[0];
                end = arguments[1];
                object = arguments[2];
                chance = (end-start)+1;
                if (start < 1 || start > 100 || end < 1 || end > 100) {
                    throw new Error("Dice ranges must be from 1 to 100");
                }
            } else {
                chance = arguments[0];
                object = arguments[1];
                if (chance < 1 || chance > 100) {
                    throw new Error("Dice ranges must be from 1 to 100");
                }
            }
            if (typeof object === "undefined") {
                throw new Error("Object is undefined");
            }
            this.rows.push({chance: chance, object: object});
            this.sum += chance;
            return this;
        },
        /**
         * Get an item from the table, based on percentages.
         *
         * @method get
         * @return {Object} An item from the table
         */
        get: function() {
            if (Math.round(this.sum) !== 100) {
                throw Error("Table elements do not add up to 100%, but rather to " + Math.round(this.sum));
            }
            var result = ion.roll(100);
            for (var i=0, len = this.rows.length; i < len; i++) {
                if (result <= this.rows[i].chance) {
                    return this.outFunction(this.rows[i].object);
                }
                result -= this.rows[i].chance;
            }
        },
        /**
         * @method size
         * @return {Number} the number of items in the table.
         */
        size: function() {
            return this.rows.length;
        }
    });
    
})(ion);

(function(ion) {
    
    ion.tables.RarityTable = ion.define(ion.tables.Table, {
        /**
         * A table of elements that occur based on the rarity keywords "common", "uncommon" and "rare".
         * Unless you set `useStrict` to false, you must specify at least one value for each frequency,
         * or you will raise an exception when you try and retrieve a value.
         * 
         * If all three frequencies are provided, common values are returned about 65% of the time, 
         * uncommon values 30% of the time, and rare values 5% of the time. If `useStrict` is set to 
         * false and some categories are missing, the categories are adjusted in a logical way to 
         * cover the gap. For example, rare will be returned more often if common or uncommon are missing; 
         * less often when paired with uncommon than common, and 100% of the time if both common and 
         * uncommon are missing.
         * 
         *     var table = new ion.tables.RarityTable();
         *     table.add("common", "A");
         *     table.add("uncommon", "B");
         *     table.add("rare", "B");
         *     table.get();
         *     => "A"
         * 
         * @class ion.tables.RarityTable
         * @extends ion.tables.Table
         * 
         * @constructor
         * @param [outFunction] {Function} A function to run on values supplied to the add method before 
         * they are returned. If no function is supplied, the value itself is returned.
         * @param [useStrict=true] {boolean} Should this table throw an error if something is not 
         * supplied for all three frequency categories? 
         */
        init: function(outFunction, useStrict) {
            this.common = [];
            this.uncommon = [];
            this.rare = [];
            if (arguments.length === 1) {
                useStrict = outFunction;
            }
            outFunction = ion.isFunction(outFunction) ? outFunction : ion.identity;
            this.useStrict = ion.isBoolean(useStrict) ? useStrict : true;
            ion.tables.Table.call(this, outFunction);
        },
        /**
         * Add a value to the table with the frequency `common`, `uncommon` or `rare`. 
         * Common occurs about 65% of the time, uncommon about 30% of the time, and 
         * rare occurs 5% of the time. (Items in each bucket are equally weighted for 
         * selection). These percentages are adjusted if the table is created with 
         * strict mode disabled, and items are not placed in each of the three categories.
         * 
         * @method add
         * @param frequency {String} `common`, `uncommon` or `rare`
         * @param object {Object} the object to put into the table
         * @return {ion.tables.RarityTable}
         * 
         */
        add: function(frequency, object) {
            switch(frequency) {
            case "common":
            case "uncommon":
            case "rare":
                this[frequency].push(object);
                this.rows.push(object); // referenced as a public property 
                break;
            default:
                throw new Error(frequency + " is not valid (use rare, uncommon, common)");
            }
            return this;
        },
        /**
         * Returns a value from the table based on the rarity keywords frequency of occurrence.
         * If the table is created in strict mode, and at least one value hasn't been supplied 
         * for each of the three frequencies, an exception will be thrown.
         * 
         * @method get
         * @return {Object}
         */
        get: function() {
            // Unless useStrict is on, it's an error not to include items in each category. 
            if (this.useStrict && (this.rare.length === 0 || this.common.length === 0 || this.uncommon.length === 0)) {
                throw new Error("RarityTable must have at least one common, uncommon, and rare element");
            }
            var common = ((this.common.length) ? 65 : 0),
                uncommon = ((this.uncommon.length) ? 30 : 0),
                rare = ((this.rare.length) ? 5 : 0),
                roll = ion.roll(common+uncommon+rare);
            
            if (roll <= common && common !== 0) {
                return this.outFunction(ion.random(this.common));
            } else if (roll <= (common+uncommon) && uncommon !== 0) {
                return this.outFunction(ion.random(this.uncommon));
            } else if (roll <= (common+uncommon+rare) && rare !== 0) {
                return this.outFunction(ion.random(this.rare));
            }
            return null;
        }
    });
})(ion);
    


(function(ion) {
    
    ion.tables.HashTable = ion.define({
        /**
         * A table of elements you select by key. Similar to a JavaScript object, but with a couple 
         * of additional conveniences for building tables.  
         * 
         *     var table = new ion.tables.HashTable(function(value) {
         *         return ion.roll(value);
         *     });
         *     table.put("a", "b", "c", "3d6");
         *     table.put("d", "4d6");
         *     
         *     table.get("b");
         *     => 12
         * 
         * @class ion.tables.HashTable
         * 
         * @constructor
         * @param [outFunction] {Function} A function to run on values supplied to the put method 
         * before they are returned. If no function is supplied, the value itself is returned.
         */
        init: function(outFunction) {
            this.outFunction = outFunction || ion.identity;
            this.hash = {};
        },
        /**
         * Add something to this table, under one or more keys.
         * 
         *     var table = new ion.tables.HashTable();
         *     table.put(1,2,3, "A");
         *     table.put(4,5, "B");
         *     table.get(4);
         *     => "B"
         *
         * @method put
         * 
         * @param keys* {Object} keys under which the value will be returned (1 or more). The 
         * key "default" will be used to return a value for any key that is not in the table.
         * @param value {Object} Something to add to the table, can be any type
         */
        put: function() {
            var value = arguments[arguments.length-1];
            for (var i=0; i < arguments.length-1; i++) {
                this.hash[arguments[i]] = value;
            }
            return this;
        },
        /**
         * Get an item from the table, based on a key.
         * 
         * @method get
         *
         * @param key {Object} the key of the item to return
         * @return {Object} An item from the table, or null if the key isn't present
         */
        get: function(key) {
            var values = this.hash[key];
            if (values) {
                return this.outFunction(values);
            } else if (this.hash["default"]) {
                return this.outFunction(this.hash["default"]);
            }
            return null;
        }
    });
    
})(ion);

ion.models = ion.models || {};

ion.models.Model = ion.define({
    /**
     * The base class of model entities in the library. 
     * 
     * Model objects can be converted to JSON and persisted, then reconstituted 
     * back into model classes. 
     * 
     * @class ion.models.Model
     * @constructor
     * @param  data {Object} The JSON used to initialize the properties of this model.
     */
    init: function(data) {
        this.tags = [];
        if (ion.isObject(data)) {
            for (var prop in data) {
                this[prop] = data[prop];    
            }
        }
        this.type = "ion.models.Model";
    },
    /**
     * Does this model have the tag?
     * 
     * @method is
     * @param tag {String} the tag to verify
     * @return {Boolean} true if the tag exists for this item, false otherwise
     */
    is: function(tag) {
        return this.tags.indexOf(tag) !== -1;
    },
    /**
     * Does this model have the tag?
     * 
     * @method has
     * @param tag {String} the tag to verify
     * @return {Boolean} true if the tag exists for this item, false otherwise
     */
    has: function(tag) {
        return this.tags.indexOf(tag) !== -1;
    },
    /**
     * Does this model _not_ contain the tag?
     * 
     * @method not
     * @param tag {String} the tag that should _not_ be present for this item
     * @return {Boolean} true if it doesn't exist, false otherwise
     */
    not: function(tag) {
        return this.tags.indexOf(tag) === -1;
    },
    /**
     * Given a prefix like `ammo` or `media`, will return the specific tag for this 
     * item, such as `ammo:22` or `media:35mm`. 
     * 
     * @method typeOf
     * @param prefix {String} the prefix to match
     * @return {String} the first tag found that matches this prefix
     */
    typeOf: function(p) {
        var prefix = p+":";
        return this.tags.filter(function(tag) {
            return (tag.indexOf(prefix) > -1);
        })[0];
    },
    /**
     * Create a deep copy of this model item, maintaining the correct subclass, 
     * nested objects, etc. 
     * 
     * @method clone
     * @return {ion.models.Model} clone
     */
    clone: function() {
        return ion.models.Model.create(JSON.stringify(this));
    }
});
/**
 * Given a JSON object, convert it back to a graph of Ionosphere model objects. This method 
 * does assume that the library is available at the known location of `window.ion`. You can 
 * also pass a JSON string to this method. This method is used to recreate JSON that has 
 * been persisted, among other things.
 * 
 * @param json {Object} a json object to convert to a model object. Can also be a string object. 
 */
ion.models.Model.create = function(object, nested) {
    if (nested !== true && ion.isString(object)) {
        object = JSON.parse(object);
    }
    if (ion.isObject(object) || ion.isArray(object)) {
        if (object.type) {
            var ref = window;
            /*jshint -W083 */ // Because JSHint is being a butt
            object.type.split('.').forEach(function(path) {
                ref = ref[path];
            });
            object = new ref(object);
        }
        for (var prop in object) {
            object[prop] = ion.models.Model.create(object[prop], true);    
        }
    }
    return object;
};
ion.models.IonSet = ion.define({
    /**
     * A set data structure. This is going to be built into future versions of JavaScript, 
     * so this object follows that API where feasible.
     * 
     * @class ion.models.IonSet
     * @param [array] {Array} initial items for set
     */
    init: function(array) {
        this.hash = {};
        for (var i=0; i < (array || []).length; i++) {
            this.add(array[i]);
        }
    },
    /**
     * Remove all items from the set.
     * 
     * @method clear
     */
    clear: function() {
        this.hash = {};
    },
    /**
     * Add a value to the set. The set will only contain one value with the same 
     * `toString()` presentation, so most primitives will be unique in the set. For 
     * objects, the object will need to produce a unique `toString()` value (there 
     * is no `hashValue()` for JavaScript objects).
     * 
     * @method add
     * @param value {Object} The value to add to the set
     */
    add: function(value) {
        this.hash[(value).toString()] = value;
    },
    /**
     * Remove a value from the set (as in adding, the value is found through its 
     * `toString()` representation).
     * 
     * @method remove
     * @param value {Object} The value to remove
     */
    remove: function(value) { // Delete in proposed API but that's a reserved keyword
        delete this.hash[(value).toString()];
    },
    /**
     * Is this value in the set?
     * @method has
     * @return {Boolean} true if the object (as represented by its `toString()` value) is in the set, false otherwise.
     */
    has: function(value) {
        return typeof (this.hash[(value).toString()]) !== "undefined";
    },
    /**
     * Number of items in the set
     * @method size
     * @return {Number} The number of items in the set
     */
    size: function() {
        return ion.keys(this.hash).length;
    },
    /**
     * Return items of set as an array
     * @method toArray
     * @return {Array} The contents of this set as an array
     */
    toArray: function() {
        return ion.values(this.hash);
    }
});

ion.models.Item = ion.define(ion.models.Model, {
    /**
     * An item. 
     * @class ion.models.Item
     * @extends ion.models.Model
     * 
     * @constructor
     * @param data {String/Object} The name of the object (as registered with `ion.registerItem`),
     * or the properties to set for this item.
     */
    init: function(data) {
        data = ion.isString(data) ? {name: data} : data;
        /**
         * An array of string tags that characterize this item.
         * @property {Array} tags
         */
        this.tags = [];
        /**
         * The name of this item in a pluralization string, e.g. "ox(en)".
         * @property {String} name
         */
        this.name = data.name;
        /**
         * Encumbrance for this item, combining its weight and size.
         * @property {Number} enc
         */
        this.enc = 0;
        /**
         * What someone would pay, in a relevant currency, for this item
         * @property {Number} value 
         */
        this.value = 0;
        ion.models.Model.call(this, data);
        this.type = "ion.models.Item";
    }
});

(function(ion, Item, Model) {

    function sortByName(a,b) {
        return (a.item.name > b.item.name) ? 1 : (a.item.name < b.item.name) ? -1 : 0;
    }
    function findEntry(item) {
        return this.entries.filter(function(entry) {
            return entry.item.name === item.name;
        })[0];
    }
    function itemParam(item) {
        return (typeof item == "string")  ? new Item({name: item}) : item;
    }
    function countParam(count) {
        return (typeof count == "number") ? count : 1;
    }
    function sum(item, field) {
        item = itemParam(item);
        return this.entries.filter(function(entry) {
            return (!item || (item.name === entry.item.name));
        }).reduce(function(sum,entry) {
            var value = (field) ? entry.item[field] : 1;
            return sum + (value*entry.count);
        }, 0);
    }
    
    ion.models.Bag = ion.define(Model, {
        /**
         * An unordered collection of items, including multiples of the same item.
         * 
         * @class ion.models.Bag
         * @extends ion.models.Model
         * @constructor
         * @param [params] {Object} The JSON data to initialize this model.
         */
        init: function(params) {
            Model.call(this, params);
            this.entries = this.entries || [];
            this.type = "ion.models.Bag";
        },
        /*
         * Combine the contents of one bag into another. Does not change the
         * bag passed into this bag. BEWARE: you're duplicating the contents of the
         * bag into another bag when you do this. You should probably throw the other
         * bag away.
         *
         * @method addBag
         * @param {Bag} bag to combine into this bag (it will not be changed or referenced)
        */
        addBag: function(bag) {
            (bag && bag.clone().entries || []).forEach(function(entry) {
                this.add(entry.item, entry.count);
            }, this);
        },
        /*
         * Remove the contents of this bag. Does not change the bag passed into this bag.
         *
         * @method removeBag
         * @param {Bag} bag specifying the items to remove from this bag
         */
        removeBag: function(bag) {
            (bag && bag.clone().entries || []).forEach(function(entry) {
                this.remove(entry.item, entry.count);
            }, this);
        },
        /**
         * Add items to this bag.
         *
         * @method add
         * @param item {String|ion.models.Item} an item to add
         * @param [count=1] {Number} of items to add
         * @return {Number} the number of items after adding
         */
        add: function(item, count) {
            if (!item) {
                throw new Error("No item passed to bag.add()");
            }
            item =  itemParam(item);
            count = countParam(count);
            var entry = findEntry.call(this, item);
    
            if (count < 0) {
                throw new Error("Can't add negative items to bag: " + count);
            }
            if (!entry) {
                entry = {item: item, count: 0};
                this.entries.push(entry);
            }
            entry.count += count;
            return entry.count;
        },
        /**
         * Sort the entries of the bag given a sorting function
         * 
         * @method sort
         * @param func {Function} a sort function
         */
        sort: function(func) {
            this.entries.sort(func || sortByName);
        },
        /**
         * Remove items from this bag. You should examine the bag before removing items,
         * because trying to remove more items than are in the bag will throw exceptions.
         *
         * @method remove
         * @param item {String|ion.models.Item} an item to remove
         * @param [count=1] {Number} of items to remove
         * @return {Number} the number of items after removals
         */
        remove: function(item, count) {
            item = itemParam(item);
            count = countParam(count);
            var entry = findEntry.call(this, item);
    
            if (!entry) {
                throw new Error("Can't remove item that's not in the bag");
            }
            if (count <= 0) {
                throw new Error("Can't remove a negative number of items from bag: " + count);
            }
            if (count > entry.count) {
                throw new Error("Can't remove "+count+" items in bag that has only " + entry.count);
            }
            entry.count -= count;
            if (entry.count === 0) {
                this.entries.splice(this.entries.indexOf(entry), 1);
            }
            return entry.count;
        },
        /**
         * Return this bag, filtered using a filter function, which is passed the item and 
         * the count:
         * 
         *     bag.filter(function(item, count) {
         *         return item.is('food');
         *     }).toString();
         *     => "A stick of beef jerky, a bottle of milk, a pear, and a can of coffee."
         * 
         * @method filter
         * @param func {Function} filter function
         * @returns {ion.models.Bag}
         */
        filter: function(func) {
            var other = new ion.models.Bag();
            for (var i = this.entries.length-1; i >= 0; i--) {
                var entry = this.entries[i];
                if (func.call(this, entry.item, entry.count)) {
                    var item = entry.item, count = entry.count;
                    this.remove(item, count);
                    other.add(item, count);
                }
            }
            return other;
        },
        /**
         * Sum the value of all items in this bag. Can also provide a sum for an individual
         * group of items in the bag.
         *
         * @method value
         * @param [item] {String|ion.models.Item} an item; if supplied, only the value of these items will be returned
         * @return {Number} the total value of the items in the bag
         */
        value: function(item) {
            return sum.call(this, item, "value");
        },
        /**
         * Sum the encumbrance of all items in this bag. Can also provide a sum for an individual
         * group of items in the bag.
         *
         * @method enc
         * @param [item] {String|ion.models.Item} an item; if supplied, only the encumbrance of these items will be returned
         * @return {Number} the total encumbrance of the items in the bag
         */
        enc: function(item) {
            return sum.call(this, item, "enc");
        },
        /**
         * The count of all items in this bag. Can also provide the count of an individual
         * group of items in the bag.
         *
         * @method count
         * @param [item] {String|ion.models.Item} an item; if supplied, only these items will be counted in the bag
         * @return {Number} the total count of the items in the bag
         */
        count: function(item) {
            return sum.call(this, item);
        },
        /**
         * Given a prefix like `ammo` or `media`, will return every item that contains a tag with 
         * this prefix, such as `ammo:22` or `media:35mm`. 
         * 
         * @method typeOf
         * @param prefix {String} the prefix to match
         * @return {Array} all items that match this prefix
         */
        typeOf: function(p) {
            return this.entries.reduce(function(array, entry) {
                if (entry.item.typeOf(p)) {
                    array.push(entry.item);
                }
                return array;
            }, []);
        }
    });

})(ion, ion.models.Item, ion.models.Model);

ion.models.Name = ion.define(ion.models.Model, {
    /**
     * A person's name (given and family name).
     * 
     * @class ion.models.Name
     * @extends ion.models.Model
     * 
     * @constructor
     * @param [data] {Object} A data object initializing properties of a name.
     * @param [data.given] {String} Given or first name
     * @param [data.family] {String} Family or last name
     */
    init: function(data) {
        /**
         * First or given name
         * @property given
         * @type {String}
         */
        /**
         * Last or family name
         * @property family
         * @type {String} 
         */
        /**
         * Nick name. Used currently for gang members, sometimes for traders.
         * @property nickname
         * @type {String}
         */
        ion.models.Model.call(this, data);
        this.type = "ion.models.Name";
    },
    properties: {
        /**
         * A read-only synonym property for the given name.
         * 
         * @property first
         * @type {String}
         */
        first: function() {
            return this.given;
        },
        /**
         * A read-only synonym property for the family name.
         * 
         * @property last
         * @type {String}
         */
        last: function() {
            return this.family;
        }
    },
    /**
     * @method toString
     * @return {String} Full name (first and last)
     */
    toString: function() {
        return (this.nickname) ? this.nickname : ion.format("{given} {family}", this);
    }
});


ion.models.Character =  ion.define(ion.models.Model, {
    /**
     * A player or NPC character. 
     * 
     * @class ion.models.Character
     * @extends ion.models.Model
     * 
     * @constructor
     * @param [params] {Object} parameters
     */
    init: function(params) {
        /**
         * The gender of the character ("male" or "female").
         * @property gender
         * @type {String}
         */
        this.gender = "male";
        /**
         * The age of the character.
         * @property age
         * @type {Number}
         */
        this.age = 0;
        
        /**
         * Title that goes before a character's name, such as "Corporal" or "Doctor".
         * @property honorific
         * @type {String}
         */
        this.honorific = null;
        /**
         * Degree that goes after a character's name, such as "PhD".
         * @property degree
         * @type {String} 
         */
        this.degree = null;
        /**
         * The items carried by this character.
         * @property inventory
         * @type {ion.models.Bag}
         */
        this.inventory = new ion.models.Bag();
        /**
         * A map of trait names to values indicating the attributes, skills, 
         * experience of a character. These represent modifiers that would apply for this character in any 
         * kind of test that occurs in a game. They are also a means of indicating the 
         * experience and history of a character, at a more detailed level than professions.
         * 
         * @property traits
         * @type {Object}  
         */
        /**
         * The status of this character if not normal for some creator, such as "separated", 
         * "divorced" or "deceased". 
         * 
         * @property status
         * @type {String} may be null
         */
        this.traits = {};
        this.history = [];
        ion.models.Model.call(this, params);
        this.type = "ion.models.Character";
    },
    properties: {
        /**
         * Is this character male?
         * 
         * @property male
         * @return {Boolean} True if male, false if female.
         */
        male: function() {
            return (this.gender === "male");
        },
        /**
         * The total number of assigned trait points for this character is 
         * referred to as the character's "points".
         * 
         * @property points
         * @return {Number} The total number of trait points assigned to this character
         */
        points: function() {
            return ion.sum(ion.values(this.traits));
        },
        /**
         * Personal pronoun
         * 
         *     character.gender
         *     => "female"
         *     character.personal
         *     => "she"
         * 
         * property personal
         * @return {String} "he" or "she"
         */
        personal: function() {
            return (this.gender === "male") ? "he" : "she";
        },
        /**
         * Objective pronoun
         * 
         *     character.gender
         *     => "female"
         *     character.objective
         *     => "her"
         * 
         * @property objective
         * @return {String} "him" or "her"
         */
        objective: function() {
            return (this.gender === "male") ? "him" : "her";
        },
        /**
         * Reflexive pronoun (arguably redundant with the personal pronoun, may remove).
         * 
         *     character.gender
         *     => "female"
         *     character.reflexive
         *     => "herself"
         *     
         * @property reflexive
         * @return {String} "himself" or "herself"
         */
        reflexive: function() {
            return (this.gender === "male") ? "himself" : "herself";
        },
        /**
         * Possessive pronoun
         * 
         *     character.gender
         *     => "female"
         *     character.possessive
         *     => "her"
         *     
         * @property possessive
         * @return {String} "his" or "her"
         */
        possessive: function() {
            return (this.gender === "male") ? "his" : "her";
        }
    },
    /**
     * Change a trait by a set number of points.
     * 
     * @method changeTrait 
     * @param traitName {String} The trait to change
     * @param value {Number} The amount to add or subtract. If the value is zero or less 
     * after change, the trait will be removed.
     */
    changeTrait: function(traitName, value) {
        value = value || 0;
        this.traits[traitName] = this.traits[traitName] || 0;
        this.traits[traitName] += value;
        if (this.traits[traitName] <= 0) {
            delete this.traits[traitName];
        }
    },
    /** 
     * Does this charcter have a trait?
     * 
     * @method trait
     * @param traitName {String} The name of the trait
     * @return {Number}
     * the value of the trait, or 0 if the character does not have the trait
     */
    trait: function(traitName) {
        return this.traits[traitName] || 0;
    }
});

(function(ion) {
    
    var MAX_TRAIT_VALUE = 4;
    
    function addTrait(map, name, start) {
        if (!map[name]) {
            map[name] = start;
        }
    }
    
    ion.models.Profession =  ion.define(ion.models.Model, {
        /**
         * An occupation or profession that provides the history, social standing, and 
         * traits of a character.
         * 
         * @class ion.models.Profession
         * @extends ion.models.Model
         * 
         * @constructor 
         * @param [params] {Object}
         *     @param [params.name] {String|Array} the name of the profession
         *     @param [params.traits] {Array} An array of traits the character can accumulate when advancing in this profession
         *     @param [params.honorifics] {Array} An array of eight elements indicating honorifics that are earned 
         *          while advancing in the profession. Each element represents what is earned for two years in the profession. 
         *          Early elements in this array may be null.
         *     @param [params.degrees] {Array} An array of eight elements indicating degrees that are earned while advancing 
         *          in the profession. Each element represents what is earned for two years in the profession. Early elements 
         *          in this array may be null.
         *     @param [params.hints] {Array} An array of string hints to the appearance generator about the effect of the 
         *          profession on the appearance of the character. See {{#crossLink "atomic/createAppearance"}}{{/crossLink}} 
         *          for values and further advice.     
         *     @param [params.seeds] {Array} A list of traits that are "seeded" by this profession. They are set to zero, 
         *          and then more likely to be selected for advancement. These are "core skills" of the profession       
         *     @param [params.histories] {Array} An ordered array of descriptors for the history of the character. The first 
         *          descriptor is used for a character working 1-2 years in the profession, the second for 3-4 years, and so 
         *          forth. These histories may use {format} values, including the **name** of the profession (as selected 
         *          when a character is joined to the profession, if an array was provided for this value); the **rank** 
         *          of the character, or the **years** he or she was in the profession.
         */
        init: function(params) {
            this.names = (params.name) ? [params.name] : [];
            this.seeds = [];
            this.supplements = [];
            this.tags = [];
            this.postprocess = ion.identity;
            ion.models.Model.call(this, params);
            this.type = "ion.models.Profession";
        },
        train: function(character, points) {
            // TODO: Nothing prevents subsequent rounds of training from bringing a trait
            // over four points. Just set one to 4 points, and watch what happens.
            var map = {};
            this.seeds.forEach(function(seed) {
                if (character.trait(seed) < MAX_TRAIT_VALUE) {
                    addTrait(map, seed, 1);
                    points--;
                }
            });

            // Force grouping into a subset of supplemental skills, enough to 
            // assign all the points (at a limit of 4)
            var limit = Math.ceil(points/4) - this.seeds.length + ion.roll("1d2");
            ion.shuffle(this.supplements);
            this.supplements.forEach(function(trait, index) {
                if (index <= limit) {
                    addTrait(map, trait, 0);    
                }
            });
            var names = ion.keys(map);

            // Okay, the starting points, minus the mandatory seed points, can 
            // be less than zero. So test explicitly for that.
            while(points > 0 && names.length) {
                var traitName = ion.random(names);
                // prevents an infinite loop if points exceeds sum of max of all traits, and 
                // also ensures that existing trait values are accounted for when honoring
                // maximum values.
                if ((map[traitName] + character.trait(traitName)) >= MAX_TRAIT_VALUE) {
                    names = ion.without(names, traitName);
                    continue;
                }
                map[traitName]++;
                points--;
            }
            for (var prop in map) {
                if (map[prop] > 0) {
                    character.changeTrait(prop, map[prop]);    
                }
            }
            // All the tags of the profession are carried forward in the character, 
            // and the character can be queried rather than keeping the profession
            // around.
            this.tags.forEach(function(tag) {
                character.tags.push(tag);
            });
            this.postprocess(character);
        }
    });
    
})(ion);

ion.models.Gang =  ion.define(ion.models.Model, {
    /**
     * A gang 
     * 
     * @class ion.models.Gang
     * @extends ion.models.Model
     * 
     * @constructor
     * @param [params] {Object} parameters
     */
    init: function(params) {
        /**
         * @property members
         * @type {Array}
         */
        this.members = [];
        /**
         * @property kind
         * @type String
         */
        ion.models.Model.call(this, params);
        this.type = "ion.models.Gang";
    },
    add: function(character) {
        this.members.push(character);
    }
});

ion.models.Weather = ion.define(ion.models.Model, {
    /**
     * A weather forecast for a day in a month.
     * 
     * @class ion.models.Weather
     * @extends ion.models.Model
     * 
     * @constructor
     * @param data {Object} A data object initializing properties of a name.
     */
    init: function(data) {
        ion.models.Model.call(this, data);
        this.type = "ion.models.Weather";
    }  
});


ion.models.Family = ion.define({
    /**
     * A family. This means (in the context of this game), a set of parents with some kids, 
     * some of whom may themselves be in family objects with kids, etc. One of the building 
     * blocks of encounters and homesteads, at the least.
     * 
     * @class ion.models.Family
     * @extends ion.models.Model
     * @constructor
     * @param [params] {Object} The JSON data to initialize this model.
     */
    init: function(params) {
        /**
         * Unmarried children
         * @property children
         * @type {Array} of `ion.models.Character` instances 
         */
        this.children = [];
        /**
         * Children in families of their own
         * @property couples
         * @type {Array} of `ion.models.Family` instances 
         */
        this.couples = []; // children with spouses, represented by a family object. Removed from children
        ion.models.Model.call(this, params);
        this.type = "ion.models.Family";
    },
    properties: {
        /**
         * The number of all children (including grown children who are
         * now part of a descendant couple).
         * 
         * @property childCount
         * @returns {Number} 
         */
        childCount: function() {
            return (this.children.length + this.couples.length);
        },
        /**
         * The male parent
         * 
         * @property male
         * @type {ion.models.Character}
         */
        male: function() {
            return this.parent.male ? this.parent : this.other;
        },
        /**
         * The female parent
         * 
         * @property female
         * @type{ion.models.Character}
         */
        female: function() {
            return this.parent.male ? this.other : this.parent;
        },
        /**
         * The single parent (if one of the parents has died or the parents are separated).
         * 
         * @property single
         * @type {ion.models.Character} or null if both parents are still part of the family
         */
        single: function() {
            if (this.parent.status && !this.other.status) {
                return this.other;
            } else if (this.other.status && !this.parent.status) {
                return this.parent;
            }
            return null;
        }
    },
    /**
     * Is this person one of the parents of this family? 
     * 
     * @method isParent
     * @param person
     * @returns {Boolean} true if character is a parent, false otherwise
     */
    isParent: function(person) {
        return (person === this.parent || person === this.other);
    }
});

/**
 * Two people in a familial relationship. 
 * 
 * @class ion.models.Relationship
 * @constructor
 * @param older {ion.models.Character} 
 * @param younger {ion.models.Character} 
 * @param relationship {String}  
 */
ion.models.Relationship = function(older, younger, rel) {
    /**
     * The older person in the relationship
     * @property older
     * @type {ion.models.Character} 
     */
    this.older = older;
    /**
     * The younger person in the relationship
     * @property younger
     * @type {ion.models.Character} 
     */
    this.younger = younger;
    /**
     * The name of the relationship between the two people
     * @property relationship
     * @type {String} 
     */
    this.relationship = rel;
};

ion.models.Store =  ion.define(ion.models.Model, {
    /**
     * A Store 
     * 
     * @class ion.models.Store
     * @extends ion.models.Model
     * 
     * @constructor
     * @param [params] {Object} params
     */
    init: function(params) {
        /**
         * Name of the store
         * @property name
         * @type {String}
         */
        this.name = null;
        /**
         * Owner of the store
         * @property owner
         * @type {ion.models.Character}
         */
        this.owner = null;
        /**
         * The cash on hand at the store. Currency (liquidity) is 
         * tight in this game and trades will have to work with limited
         * currency.
         * 
         * @property onhand
         * @type {ion.models.Bag}
         */
        this.onhand = null;
        /**
         * The inventory for sale at this establishment
         * @property inventory
         * @type {ion.models.Bag}
         */
        this.inventory = new ion.models.Bag();
        /**
         * A description of what the merchant will buy from players.
         * @property buys
         * @type {String}
         */
        /**
         * A description of what the merchant sells; may be broader than what 
         * is in inventory if it includes things that are considered irrelevant 
         * to the game, like pottery (this may actually go away however).
         * @property sells
         * @type {Stirng}
         */
        ion.models.Model.call(this, params);
        this.type = "ion.models.Store";
    }

});

(function(ion, m, Builder, Character, Relationship) {

    var r = ion.renderers = {};

    function coupleNames(family, relationship) {
        var single = family.single;
        if (single !== null) {
            return ion.format("{0} ({1}), {2}. ", single.name.toString(), single.age, family.relationship);
        } else {
            return relatedNames(family.male, family.female, family.relationship);
        }
    }
    function relatedNames(char1, char2, relationship) {
        if (char1.name.family === char2.name.family) {
            return ion.format("{0} ({1}) & {2} ({3}) {4} ({5}). ", char1.name.given, char1.age, 
                char2.name.given, char2.age, char1.name.family, relationship);
        } else {
            return ion.format("{0} ({1}) & {2} ({3}). {4}. ", char1.name.toString(), char1.age, 
                char2.name.toString(), char2.age, ion.sentenceCase(relationship));
        }
    }
    function traitsToString(traits) {
        return Object.keys(traits).sort(function(a,b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0 ;
        }).map(function(key) {
            return ion.format("{0} {1}", key, traits[key]);
        }).join(", ");
    }
    function charBasics(b) {
        b("{0} ", this.honorific);
        b(this.name.toString());
        b(", {0}", this.degree);
        b(!this.honorific && !!this.profession, ", " + this.profession);
        b(". ");
        b(!!this.status, function(b) {
            b("{0} (would be {1}). ", ion.sentenceCase(this.status), this.age);
        }, function(b) {
            b("Age {0}. ", this.age+"");
        });
        b("{0}. ", this.appearance);
        b("{0}. ", this.history.join(', '));
        return b;
    }
    function gangName(b) {
        b(!!this.name, function(b) {
            b("The {0} ({1} members): ", this.name, this.members.length);
        }, function(b) {
            b("{0} member {1}: ", this.members.length, this.kind);
        });
        return b;
    }
    function combatantString(b, c) {
        // Remove uninteresting traits from description.
        var traits = {};
        atomic.getCombatTraits().forEach(function(traitName) {
            if (c.trait(traitName) > 0) {
                traits[traitName] = c.trait(traitName);
            }
        });
        return charBasics.call(this, b)
            ("{0}. ", traitsToString(traits))
            ("Possessions: {0}", this.inventory.toString()).toString();
    }
    
    r.characterString = function() {
        var b = Builder(this);
        return charBasics.call(this, b)
            ("{0}. ", traitsToString(this.traits))
            ("Possessions: {0}", this.inventory.toString()).toString();
    };
    r.characterHTML = function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            charBasics.call(this, b);
        });
        b(!!this.inventory.count() || ion.keys(this.traits).length > 0, function(b) {
            b("div", {class: "more"}, function(b) {
                b("p", {}, function(b) {
                    b("{0}. ", traitsToString(this.traits));    
                });
                b(!!this.inventory.count(), function(b) {
                    b("p", {}, function(b) {
                        b("Possessions: {0}", this.inventory.toString());    
                    });
                });
            });
        });
        return b.toString();
    };
    r.familyHTML = function() {
        var b = Builder(this);
        b("div", {class: "family"}, function(b) {
            
            b("p", {}, coupleNames(this));
            b("div", {class:"more"}, function(b) {
                b(!!this.single, function() {
                    b(r.characterHTML.call(this.single));
                }, function() {
                    b(r.characterHTML.call(this.male));
                    b(" ");
                    b(r.characterHTML.call(this.female));
                });
            });
            b(!!this.childCount, function(b) {
                b("div", {class: "children_preamble"}, function(b) {
                    b("{|}{1 |}child{ren}:", this.childCount);
                });
                b("div", {class: "children"}, function(b) {
                    b(this.children, function(b, child) {
                        b("div", {class: "child"}, function(b) {
                            b(r.characterHTML.call(child));    
                        });
                    });
                    b(this.couples, function(b, couple) {
                        b(r.familyHTML.call(couple));
                    });
                });
            });
        });
        return b.toString();
    };
    r.familyString = function() {
        return Builder(this)
            (relatedNames(this.male, this.female, this.relationship))
            (!!this.childCount, function(b) {
                b("{|}{1 |}child{ren}: ", this.childCount);
                b(this.children, function(b, child, index) {
                    b(index > 0, " ")(child.toString());
                });
                b(this.couples, function(b, couple, index) {
                    b(index > 0, " ")(couple.toString());
                });
            }).toString();
    };
    r.relString = function() {
        return relatedNames(this.older, this.younger, this.relationship);
    };
    r.relHTML = function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            b(relatedNames(this.older, this.younger, this.relationship));
        });
        b("div", {class: "more"}, function(b) {
            b("p", {}, function(b) {
                b(r.characterString.call(this.older));
            })(" ");
            b("p", {}, function(b) {
                b(r.characterString.call(this.younger));
            });
        });
        return b.toString();
    };
    r.weatherString = function() {
        return ion.format("Nightly low of {low}°, high of {high}°, {rain}", this);
    };
    r.weatherHTML = function() {
        return '<p class="weather">'+this.toString()+'.</p>';
    };
    r.itemString = function() {
        return ion.pluralize(this.name);
    };
    r.itemHTML = function() {
        return "<p>"+ion.pluralize(this.name)+"</p>";
    };
    r.gangString = function() {
        var b = Builder(this);
        gangName.call(this, b);
        return b(this.members, function(b, m, index) {
            combatantString.call(m, b, m);
        }).toString();
    };
    r.gangHTML = function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            gangName.call(this, b);
        });
        b("div", {class: "more"}, function(b) {
            b(this.members, function(b, m, index) {
                b("p", {}, function(b) {
                    combatantString.call(m, b, m);    
                });
            });
        });
        return b.toString();
    };
    r.bagString = function() {
        var string = "", cash = 0;
        if (this.entries.length) {
            var items = false,
                len = this.entries.filter(function(entry) {
                    return entry.item.not('cash');
                }).length;
            this.entries.forEach(function(entry) {
                if (entry.item.is('cash')) {
                    cash += (entry.item.value*100) * entry.count;
                } else {
                    items = true;
                    string += ion.pluralize(entry.item, entry.count);
                    if (len === 1) {
                        string += '.';
                    } else if (len === 2) {
                        string += ', and ';
                    } else {
                        string += ', ';
                    }
                    len--;
                }
            }, this);
            if (items && cash) {
                string += ' ';
            }
            if (cash) {
                string += "$"+cash.toFixed(0)+" in cash.";
            }
            string = ion.sentenceCase(string);
        }
        if (this.descriptor) {
            string = (this.descriptor + ". " + string);
        }
        return string;
    };
    r.bagHTML = function() {
        return '<p class="bag">'+this.toString()+'</p>';
    };
    r.bagForSaleString = function() {
        var string = "", cash = 0;
        if (this.entries.length) {
            var items = false,
                len = this.entries.filter(function(entry) {
                    return entry.item.not('cash');
                }).length;
            this.entries.forEach(function(entry) {
                if (entry.item.is('cash')) {
                    cash += (entry.item.value*100) * entry.count;
                } else {
                    items = true;
                    string += ion.pluralize(entry.item, entry.count);
                    // begin specific difference with above
                    if (string.substring(string.length-1) === ")") {
                        string = string.substring(0,string.length-1) + ", ";
                    } else {
                        string += " (";
                    }
                    if (entry.count === 1) {
                        string += "¤"+entry.item.value+")";
                    } else {
                        string += "¤"+entry.item.value+" each)";    
                    }
                    // end. encapsulate somehow.
                    if (len === 1) {
                        string += '.';
                    } else if (len === 2) {
                        string += ', and ';
                    } else {
                        string += ', ';
                    }
                    len--;
                }
            }, this);
            if (items && cash) {
                string += ' ';
            }
            if (cash) {
                string += "$"+cash.toFixed(0)+" in cash.";
            }
            string = ion.sentenceCase(string);
        }
        if (this.descriptor) {
            string = (this.descriptor + ". " + string);
        }
        return string;        
    };
    r.storeString = function() {
        var b = Builder(this); // Not as thorough as as the html version
        b(this.name)(". ");
        b("Owner(s): " + this.owner.toString());
        b("Inventory: " + this.inventory.toString())(" ");
        b("Cash on hand: " + this.onhand.toString());
        return b.toString();
    };
    r.storeHTML = function() {
        var b = Builder(this);
        b("p", {class: "title"}, this.name);
        
        b("div", {class: "owner"}, function(b) {
            b("p", {class: "title"}, function(b) { b("Owner(s)"); });
            b(this.owner.toHTML());
            b("p", {}, this.onhand.toString());
        });
        b("p", {class: "title"}, "For Trade");
        b(!!this.policy, function() {
            b("p", {class: "policy"}, this.policy);    
        });
        b("ul", {class: "inventory"}, function(b) {
            b(this.inventory.entries, function(b, entry) {
                var string = ion.pluralize(entry.item.name, entry.count);
                if (string.substring(string.length-1) === ")") {
                    string = string.substring(0,string.length-1) + ", ";
                } else {
                    string += " (";
                }
                if (entry.count === 1) {
                    string += entry.item.value+"T)";
                } else {
                    string += entry.item.value+"T each)";    
                }
                b("li", {}, string);
                /*
                var str = ion.pluralize(entry.item.name, entry.count) + " (" + ion.pluralize("trade", entry.item.value)+" each)";
                b("li", {}, str);
                */
            });
        });
        
        return b.toString();
    };
    
    // Default assignments for debugging, etc.
    m.Bag.prototype.toString = r.bagString;
    m.Bag.prototype.toHTML = r.bagHTML;
    m.Character.prototype.toString = r.characterString;
    m.Character.prototype.toHTML = r.characterHTML;
    m.Family.prototype.toString = r.familyString;
    m.Family.prototype.toHTML = r.familyHTML;
    m.Relationship.prototype.toString = r.relString;
    m.Relationship.prototype.toHTML = r.relHTML;
    m.Item.prototype.toString = r.itemString;
    m.Item.prototype.toHTML = r.itemHTML;
    m.Weather.prototype.toString = r.weatherString;
    m.Weather.prototype.toHTML = r.weatherHTML;
    m.Gang.prototype.toString = r.gangString;
    m.Gang.prototype.toHTML = r.gangHTML;
    m.Store.prototype.toString = r.storeString;
    m.Store.prototype.toHTML = r.storeHTML;
    
})(ion, ion.models, ion.Builder, ion.models.Character, ion.models.Relationship);
(function(ion, RarityTable, Item) {
    
    ion.db = ion.db || {};  
    
    var REMOVE_BRACES = /\{.*\}|\(.*\)/g,
        REMOVE_WHITESPACE = /\W|\s/g;
    
    function matchesTags(terms, model) {
        // Star is not necessary. If you pass no terms in, it still matches.
        var result = ((terms.ands.length === 1 && terms.ands[0] === "*") ||
           ((ion.intersection(model.tags, terms.ands).length === terms.ands.length) &&
            (ion.intersection(model.tags, terms.nots).length === 0))
        );
        if (!result && terms.or) {
            return matchesTags(terms.or, model);
        }
        return result;        
    }
    // This really just loops, matches and returns without knowing anything about it.
    function finder(params) {
        var results = new RarityTable(ion.identity, false);
        for (var i=0, len = this.models.length; i < len; i++) {
            var model = this.models[i];
            if (matchesTags(params.tags, model) && this.matches(params, model)) {
                results.add(model.frequency, model);
            }
        }
        return results;
    }
    function getMemo() {
        return {ands: [], nots: []};
    }
    function split(string) {
        return string.trim().toLowerCase().split(/\s+/);
    }
    function parseTags(arg) {
        var memo = getMemo();
        if (ion.isString(arg) && arg !== "") {
            memo = split(arg).reduce(this.cbTagCollector, memo);
        } /*else if (ion.isArray(arg)) {
            // TODO: This makes no sense to me, it's just consuming the first element
            // of the array. Why is this here, why do tests break without it? 
            var newMemo = parseTags.apply(this, arg);
            memo.ands = memo.ands.concat(newMemo.ands);
        }*/
        return memo.ands;
    }
    function tagCollector(memo, tag) {
        if (tag === "|") {
            var newMemo = getMemo();
            memo.or = newMemo;
            return newMemo;
        }
        if (this.lookupArray) {
            tag = this.lookupArray[parseInt(tag,10)] || tag;
        }
        if (tag.charAt(0) === "-") {
            memo.nots.push(tag.substring(1));
        } else {
            memo.ands.push(tag);
        }
        return memo;
    }
    function buildQuery(params, arg) {
        if (ion.isString(arg) && arg !== "") {
            params = split(arg).reduce(this.cbTagCollector, params);
        } else if (ion.isArray(arg)) {
            for (var i=0; i < arg.length; i++) {
                params = split(arg[i]).reduce(this.cbTagCollector, params);
            }
        }
    }
    function makeSearchName(string) {
        return string.replace(REMOVE_BRACES,'').replace(REMOVE_WHITESPACE,'').toLowerCase();
    }
    function parseQuery() {
        if (!ion.isUndefined(arguments[0]) && arguments[0].ands) {
            return arguments[0];
        }
        var params = getMemo();
        for (var i=0; i < arguments.length; i++) {
            buildQuery.call(this, params, arguments[i]);
        }
        return params;
    }
    function getClustering(tags) {
        var prefix = "cluster:";
        return tags.filter(function(tag) {
            return (tag.indexOf(prefix) > -1);
        })[0].substring(8);
    }

    ion.db.Database = ion.define({
        /**
         * A basic models database that provides a pretty complete ability to search for models 
         * by their tags.
         *  
         * Your model specs that you register with the db can include string tags, such as 
         * "ElectricalEngineering" or "common", but these tags (which are usually declared over and 
         * over in your models specs) quickly increase your JS file size. 
         * 
         *      // kinda bad
         *      db.register("coffee cup!1!.5!common house br");
         * 
         * If you provide an array of tags in the constructor for `Database` or one of its 
         * subclasses, then you can refer to those tags by their index in the same array, which 
         * reduces the size of data files.:
         * 
         *      // potentially better
         *      var db = new ItemDatabase(['uncommon','common','house','br']);
         *      db.register("coffee cup!1!.5!1 3 4");
         * 
         * @class ion.db.Database
         * @constructor
         * 
         * @param tags {Array} an array of tags
         */
        init: function(tags, strategy) {
            this.models = [];
            this.lookupArray = tags || [];
            this.cbTagCollector = tagCollector.bind(this);
        },
        /**
         * @for ion.db.Database
         * @method matches
         * 
         * @param params {Object} conditions to match (tags are handled by the base class, 
         *      but sub-classed DBs can look at other conditions).
         * @param model {ion.models.Model} the model object to examine (will be the type 
         *      handled by the specific database implementation).
         * @return {Boolean} true if it matches, false otherwise
         */
        matches: ion.identity,
        /**
         *  Register models with the database. The exact arguments and format varies by the 
         *  type of model (different models implement this with different subclasses).
         *
         *  @for ion.db.Database
         *  @method register
         *  
         */
        register: ion.identity,
        /**
         * Find a single model in this database.
         * TODO: Documentation is wrong
         * 
         * @for ion.db.Database
         * @method find
         * 
         * @param tags {String} tags to match
         * @return {ion.models.Model} a single model object that matches, returned according 
         *      to its frequency
         */ 
        find: function(params) {
            return this.findAll(params).get();
        },
        /**
         * Find all models that match in the database, returned in a `ion.tables.RarityTable`
         * instance.
         * TODO: Documentation is wrong
         * 
         * @for ion.db.Database
         * @method findAll
         * 
         * @param tags {String} tags to match
         * @return {ion.tables.RarityTable} all matching models in a rarity table.
         */ 
        findAll: function(params) {
            if (ion.isString(params) || ion.isArray(params)) {
                params = {tags: params};
            }
            params.tags = parseQuery.call(this, params.tags);
            return finder.call(this, params);
        }
    });

    ion.db.ItemDatabase = ion.define(ion.db.Database, {
        /**
         * 
         * @class ion.db.ItemDatabase
         * @extends ion.db.Database
         * 
         * @constructor
         * @param tags {Array} an array of tags
         */
        init: function(tags) {
            ion.db.Database.call(this, tags);
        },
        matches: function(params, model) {
            return !((ion.isNumber(params.minValue) && model.value < params.minValue) ||
                     (ion.isNumber(params.maxValue) && model.value > params.maxValue) ||
                     (ion.isNumber(params.minEnc) && model.enc < params.minEnc) ||
                     (ion.isNumber(params.maxEnc) && model.enc > params.maxEnc));
        },
        /**
         * In addition tags, there are some other conditions you can specify for finding an item.
         * 
         * @method find
         * @for ion.db.ItemDatabase
         * 
         * @param [params] {Object}
         *      @param [params.tags] {String} one or more tag strings, either to be matched, or to be 
         *          excluded (if they start with a "-"). Can also be an array of individual tag strings.
         *      @param [params.minValue=0] {Number} the minimum value a matching item can have
         *      @param [params.maxValue=Number.MAX_VALUE] {Number} the maximum value a matching item can have
         *      @param [params.minEnc=0] {Number} the minimum encumbrance a matching item can have
         *      @param [params.maxEnc=Number.MAX_VALUE] {Number} the maximum encumbrance a matching item can have
         * 
         * @return {ion.models.Item} an item that matches the query
         */
        /**
         * In addition tags, there are some other conditions you can specify for finding an item.
         * 
         * @method findAll
         * @for ion.db.ItemDatabase
         * 
         * @param [params] {Object}
         *      @param [params.tags] {String} one or more tag strings, either to be matched, or to be 
         *          excluded (if they start with a "-"). Can also be an array of individual tag strings.
         *      @param [params.minValue=0] {Number} the minimum value a matching item can have
         *      @param [params.maxValue=Number.MAX_VALUE] {Number} the maximum value a matching item can have
         *      @param [params.minEnc=0] {Number} the minimum encumbrance a matching item can have
         *      @param [params.maxEnc=Number.MAX_VALUE] {Number} the maximum encumbrance a matching item can have
         * 
         * @return {Array} an array of all items that matches the query
         */
        /** 
         * Register one or more items (via a short, string-based item specification format) with the 
         * search facilities of the library. Once these items are registered, they can be found through 
         * the `ion.queryForItem()` method; other more complex methods for 
         * creating treasure/loot are based on this functionality. 
         * 
         *     db.register(
         *       "35mm camera!10!.5!common household ammo-35mm", 
         *       "fancy lad cake!1!1!common preserved food luxury"
         *     );
         * 
         * **Specification**
         * 
         * `name1; name2!value!encumbrance!tags`
         * 
         * The first tag must always be `common`, `uncommon` or `rare`. If a `br` tag is included, 
         * this indicates that the item can be found broken, and it will be added to the 
         * database twice (once intact, and once broken).
         * 
         * @method register
         * @for ion.db.ItemDatabase
         * 
         * @param item* {String} One or more item strings
         */        
        register: function() {
            // optimizing on some things, like avoiding push, using for, etc.
            for (var i=0, len = arguments.length; i < len; i++) {
                var string = arguments[i],
                    parts = string.split('!'),
                    names = parts[0].trim().split(/\s*;\s*/),
                    tags = parseTags.call(this, parts[3]),
                    breakable = tags.indexOf("br") > -1,
                    params = {
                        value: parseFloat(parts[1]),
                        enc: parseFloat(parts[2]),
                        frequency: tags.shift()
                    };
                for (var j=0, len2 = names.length; j < len2; j++) {
                    params.name = names[j];
                    
                    params.tags = ion.without(tags, 'br');
                    params.tags.push(makeSearchName(params.name));
                    this.models[this.models.length] = new Item(params);
                }
                
                if (!breakable) { continue; }

                params.tags = params.tags.concat(['br']);
                // creating bags fail if items don't have at least some value.
                //params.value = ~~(params.value/2);
                params.value = Math.max(0.5, ~~(params.value/2));
                for (j=0, len2 = names.length; j < len2; j++) {
                    params.name = "broken " + names[j];
                    params.tags = [makeSearchName(params.name)].concat(tags);
                    this.models[this.models.length] = new Item(params);
                }
            }
        }
    });
    
    ion.db.StoreDatabase = ion.define(ion.db.Database, {
        init: function(params) {
            ion.db.Database.call(this, params);
        },
        register: function() {
            for (var i=0, len = arguments.length; i < len; i++) {
                var parts = arguments[i].split('!'),
                    names = parts[0].trim().split(/\s*;\s*/),
                    policy = parts[1],
                    owner_profession = parts[2],
                    owner_trait = parts[3],
                    bag_query = parts[4],
                    bag_total_value = parseInt(parts[5], 10),
                    tags = parseTags.call(this, parts[6]),
                    frequency = tags.shift();
                
                // So you can search for a store by name (converted to tags)
                for (var j=0; j < names.length; j++) {
                    tags[tags.length] = ion.toTag(names[j]);
                }
                var owner = {};
                if (owner_profession) { owner.profession = owner_profession; }
                if (owner_trait) {
                    owner.traits = {};
                    owner.traits[owner_trait] = ion.roll(3)+1;
                }
                var inventory = { 
                    tags: bag_query, 
                    fillBag: false, 
                    cluster: getClustering(tags) 
                };
                if (!isNaN(bag_total_value)) {
                    inventory.totalValue = bag_total_value; 
                }
                
                this.models[this.models.length] = {
                    frequency: frequency, 
                    names: names, 
                    policy: policy,
                    owner: owner,
                    tags: tags,
                    inventory: inventory
                };
            }
        }
    });
    
    ion.db.ProfessionDatabase = ion.define(ion.db.Database, {
        /**
         * 
         * @class ion.db.ProfessionDatabase
         * @extends ion.db.Database
         * 
         * @constructor
         * @param tags {Array} an array of tags
         */
        init: function(params) {
            ion.db.Database.call(this, params);
        },
        /**
         * Register a profession. Once the professions are registered, they can be found by their 
         * tags by searching the database. The names of the profession are also added as tags, 
         * so "Coast Guard" (as a profession name) could be found with the tag `CoastGuard`.
         * 
         * Each profession has two parameters that are passed in as a couple. The first is the 
         * spec described below; the second is a post-training function that may be called to 
         * do profession-specific alteration of the character. This is a string that is interpreted 
         * as the body of a function that is passed one parameter: `c` for the character object..
         *  
         *     // Tags were registered with db.registerTags(), so they can be referenced
         *     // by index, either base-10 or base-36.
         *     db.register(ion.models.Profession,
         *       "Doctor!46!4d 4h 4i 2u 3r!2 5f 21 2r 2s", "c.honorific = 'Doctor';", 
         *     );
         *     
         * **Specification**
         * 
         * `name1; name2!seed traits!supplemental traits!tags`
         * 
         * Seed traits are traits that members of the profession will always have to some degree 
         * or another. The supplemental traits are other qualities that may be picked up during 
         * participation in the profession. Finally, tags may be associated with the profession. 
         * The first tag must always be `common`, `uncommon` or `rare`.
         * 
         * @method register
         * @for ion.db.ProfessionDatabase
         * 
         * @param class {ion.models.Profession} a profession class or subclass that implements
         *      game-specific training for a character.
         * @param spec {String} one or more strings specifying professions to include.
         * @param function {String} function body of a post-training processing method.
         */        
        register: function() {
            var clazz = arguments[0];
            
            for (var i=1, len = arguments.length; i < len; i += 2) {
                var parts = arguments[i].split('!'),
                    names = parts[0].trim().split(/\s*;\s*/),
                    seeds = parseTags.call(this, parts[1]),
                    traits = parseTags.call(this, parts[2]),
                    tags = parseTags.call(this, parts[3]),
                    freq = tags.shift(),
                    func = arguments[i+1] ? new Function("c", arguments[i+1]) : ion.identity;
                    
                // So you can search for professions by name (converted to tags)
                for (var j=0; j < names.length; j++) {
                    tags[tags.length] = ion.toTag(names[j]);
                }
                this.models[this.models.length] = new clazz({
                    names: names, tags: tags, seeds: seeds, supplements: traits, postprocess: func, frequency: freq
                });
            }
        }
    });
    
    ion.db.EncounterDatabase = ion.define(ion.db.Database, {
        init: function(params) {
            ion.db.Database.call(this, params);
        },
        register: function() {
            for (var i=0, len = arguments.length; i < len; i++) {
                var parts = arguments[i].split('!');
                this.models[this.models.length] = {};
            }
        }
    });
    
})(ion, ion.tables.RarityTable, ion.models.Item);

/**
 * Create game objects for a retro-futuristic postholocaust game, as made popular by the 
 * Fallout video games, or possibly for any 50s science fiction game, such as Cosmic 
 * Patrol. 
 * 
 * @class atomic
 */
var atomic = {};

/**
 * Create game objects for a fantasy/medieval setting, like Dungeons &amp; Dragons or any 
 * dungeon crawler.
 * 
 *  @class fantasy
 */
var fantasy = {
};

ion.models.AtomicProfession = (function(ion, Profession) {
    
    var navyRanks = ["","Seaman", "Petty Officer", "Ensign", "Lieutenant", "Lieutenant Commander", "Commander", "Captain", "Admiral"],
        policeRanks = ["Officer",["Officer","Trooper"],"Detective","Sergeant", ["Captain","Deputy Marshal"], ["Inspector","Marshal"],["Deputy Chief","Undersheriff"],["Chief","Sheriff"]],
        milRanks = ["","Private", "Corporal", "Sergeant", "Lieutenant", "Captain", "Major", "Colonel", "General"];
    
    return ion.define(Profession, {
        /**
         * 
         * A sub-class of profession that handles assigning rank for professions such as 
         * the military and police.
         * 
         * @class ion.models.AtomicProfession
         * @extends ion.models.Profession
         * 
         * @constructor
         * @param params {Object}
         */
        init: function(params) {
            Profession.call(this, params || {});
        },
        /**
         * Assigns rank to the character based on traits.
         * 
         * @method assignRank
         * @for ion.models.AtomicProfession
         */
        assignRank: function(character) {
            var name = this.names[0], rank = null;
            
            // Could use gaussian spread here.
            var level = Math.round(Math.max(character.trait("Military"), character.trait("Government")) * 1.5);
            
            // Could use a table here.
            if (name === "Navy" || name === "Coast Guard") {
                rank = navyRanks[ion.roll(level)];
            } else if (name === "Police") {
                rank = policeRanks[ion.roll(level)];
                if (rank instanceof Array) {
                    rank = ion.random(rank);
                }
            } else {
                rank = milRanks[ion.roll(level)];
            }
            character.honorific = (rank) ? name + ' ' + rank : name;
        }
    });
    
})(ion, ion.models.Profession);


atomic.getPlaces = function() { return ['Agricultural','Automotive','Civic','Criminal','Garage','Hospital','House','Industrial','Institution','Lodging','Military','Office','Public','Research','Restaurant','School','Tourism','Travel']; };
atomic.getLocations = function() { return ['Encampment', 'Roadside', 'Settlement']; };

ion.itemDb = new ion.db.ItemDatabase(['ammo','ammo:22','ammo:30','ammo:308','ammo:357','ammo:38','ammo:44','ammo:45','ammo:fusion','ammo:laser','ammo:pulse','ammo:shell','armor','agricultural','automotive','civic','criminal','garage','hospital','house','industrial','institution','lodging','military','office','public','research','restaurant','school','tourism','travel','br','bundled','heavy','nobr','unique','accessories','body','coat','feet','head','con','con:35mm','con:battery','con:polaroid','food','fresh','meat','prepared','preserved','ration','common','rare','uncommon','female','male','alcohol','camping','cash','clothing','communications','container','currency','drug','explosive','jewelry','medical','pottery','sport','tool','toy','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:personal','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','hand','huge','large','medium','miniscule','small','tiny','historical','luxury','scifi','secured','useful','firearm','melee','pistol','rifle','shotgun','smg']);
ion.itemDb.register(
"$1 bill!.01!0!51 58 62",  
"$1 casino chip!.2!0!53 62",  
"$10 bill!.1!0!53 58 62",  
"$10 casino chip!2!0!53 62",  
"$100 bill!1!0!52 58 62",  
"$20 bill!.2!0!53 58 62",  
"$25 casino chip!5!0!52 62",  
"$5 bill!.05!0!51 58 62",  
"$5 casino chip!1!0!52 62",  
".22 caliber bullet!1!.5!53 0 1",  
".30 caliber bullet!1!.5!53 0 2",  
".357 caliber bullet!1!.5!53 0 4",  
".38 caliber bullet!1!.5!53 0 5",  
".44 caliber bullet!1!.5!53 0 6",  
".45 caliber bullet!1!.5!53 0 7",  
"American flag!1!3!51 15 21 23 25 28 35",  
"Boss of the Plains hat!6!.5!52 59 40 77 86 55 25",  
"Dutch Lad snack cake!6!1!52 45 19 99 49 50",  
"Kit-Cat klock; Tiki statue!1!3!53 19 ",  
"Kooba Kid comic book; Bubbles and Yanks comic book; Volto from Mars comic book; Clutch Cargo comic book!6!.5!52 17 19 80",  
"M1 Rifle; M1 Carbine!12!10!52 2 31 103 87 106",  
"M14 Rifle!12!10!52 3 31 103 87 106",  
"M1911 Pistol!9!3!52 7 31 103 77 87 105",  
"Remington .44 Magnum Pistol; Smith & Wesson .44 Magnum Pistol; Colt .44 Magnum Pistol!9!3!52 6 31 103 71 75 77 79 81 82 84 86 89 105",  
"Remington 870 Shotgun; Winchester 1897 Shotgun; Winchester Model 12 Shotgun!9!10!52 11 31 103 17 19 71 79 81 82 84 86 89 107",  
"Remington Rifle!12!10!52 13 1 31 103 17 19 71 75 76 79 82 83 84 86 89 106",  
"Ruger .22 Pistol!9!3!52 1 31 103 73 79 85 86 88 89 105",  
"Ruger Single Six Revolver!9!3!52 1 31 103 71 79 83 84 86 89 90 105",  
"Smith & Wesson .357 Magnum Pistol; Colt .357 Magnum Pistol!9!3!52 4 31 103 75 77 79 81 82 84 86 88 89 105",  
"Smith & Wesson .38 Special Revolver; Colt Detective Special Revolver!9!3!52 5 31 103 71 72 73 74 77 78 79 81 84 86 88 89 105",  
"Smith & Wesson Service Revolver; Colt Service Pistol!9!3!52 7 31 103 71 72 73 74 78 79 81 84 85 86 89 90 105",  
"Springfield Rifle!12!10!52 2 31 103 71 75 84 87 106",  
"Thompson Submachine Gun; M3 Submachine Gun; Browning Automatic Rifle!12!10!52 7 31 103 87 108",  
"Twinkle Cake!3!1!53 45 19 49 50 28 29 30",  
"Winchester Rifle!12!10!52 13 3 31 103 17 19 71 75 76 79 83 84 86 89 106",  
"apple pie; cherry pie; peach pie!3!3!53 13 45 46 48 ",  
"apple; pear; nectarine; orange; peach{es}; plum!1!.5!51 45 46 86",  
"ashtray!1!1!51 19",  
"axe; pickaxe!3!20!53 13 57 17 33 79 104 69",  
"backpack!11!10!51 61 19 71 84 90 22 23  30 102",  
"bag{s} of sugar!11!3!52 45 19 49 102",  
"bandana; baseball cap!1!.5!51 59 54 40 19 71 72 74 76 78 79 82 83 84 86 88 90 55",  
"baseball bat!3!3!51 17 71 76 82 84 88 90 104 68",  
"baseball; softball; tennis ball!1!1!51 19 25 28  68",  
"batter{y|ies}!3!.5!53 41 43",  
"bayonet!3!1!51 87 104",  
"belt{s} with large silver buckle{s}!3!.5!53 36 59 75 83 55",  
"beret; boonie hat; garrison cap; patrol cap!1!.5!51 59 54 40 87 55 23",  
"boater's straw hat; Panama straw hat!3!.5!53 15 59 40 19 73 76 77 85 86 89 90 22 55 25",  
"bolo tie!1!.5!51 36 59 19 75 83 89 22 55 ",  
"book!3!3!51 98 28",  
"book{s} of cattle brands!1!1!51 83 35",  
"boomerang; bubble gum cigar; frisbee; hula hoop; Hopalong Cassidy cap gun; coonskin cap; slinky!1!3!53 19  70",  
"bottle{s} of milk!1!3!51 45 46 19 86",  
"bottle{s} of scotch; bottle{s} of whiskey; bottle{s} of vodka; bottle{s} of wine!13!10!53 56 63 19 80 99",  
"bowling ball!6!20!52 33 19 25 68",  
"box{es} of .22 ammo (20 rounds)!30!3!52 0 1 32",  
"box{es} of .30 ammo (20 rounds)!30!3!52 0 2 32",  
"box{es} of .308 ammo (20 rounds)!30!3!52 0 3 32",  
"box{es} of .357 ammo (20 rounds)!30!3!52 0 4 32",  
"box{es} of .38 ammo (20 rounds)!30!3!52 0 5 32",  
"box{es} of .44 ammo (20 rounds)!30!3!52 0 6 32",  
"box{es} of .45 ammo (20 rounds)!30!3!52 0 7 32",  
"box{es} of Sugar Jets cereal!3!3!53 45 19 49",  
"box{es} of Velveteena cheese!6!3!53 45 18 19 99 49 27",  
"box{es} of candies!9!3!52 19 99",  
"box{es} of candles!9!3!51 57 17 19 79 84 102",  
"box{es} of chocolates!6!3!52 45 19 99 49",  
"box{es} of hardtack!9!3!53 45 23 50 102",  
"box{es} of matches!3!.5!51 57 16 17 19 80 82 83 84 86 88 69 102",  
"box{es} of shotgun shells (20 shells)!30!3!52 0 11 32",  
"box{|es} of toaster pastries!3!3!53 45 19 49 50",  
"bracelet!10!1!53 65 101",  
"briefcase!1!10!51 31 15 24 25 26",  
"bucket hat; coonskin cap!3!.5!53 59 54 40 71 76 82 84 86 89 90 55",  
"bulletproof vest!11!10!53 12 31 16 81 84 87 102",  
"business suit!1!3!51 37 59 19 77 86 22 55",  
"butcher's kni{fe|ves}!3!3!51 19 86 104 27",  
"camera!3!3!53 31 42 80",  
"canteen; water bottle!1!3!51 80 23",  
"can{s} of Brylcreem!3!1!53 19 80",  
"can{s} of Fido dog food!3!3!51 45 19 47 49",  
"can{s} of Rinso Detergent!1!3!51 19",  
"can{s} of coffee; jar{s} of instant coffee!6!3!52 45 19 99 49",  
"can{s} of milk; can{s} of pork & beans; box{es} of crackers; can{s} of wham!3!3!51 45 19 49",  
"can{|s} of mace; can{|s} of pepper spray!3!1!53 72 73 74 77 78 85 86 88 104",  
"carton{s} of cigarettes!150!3!52 63 99",  
"casualwear outfit!1!3!51 37 59 54 19 86 22 55",  
"ceramic cup; ceramic plate; ceramic bowl; large ceramic bowl; pottery cup; pottery bowl; pottery vase; clay figurine!3!6!53 13 31 33 19 67 29",  
"cigarette lighter!3!.5!51 16 19 80 86 69 102",  
"clipboard!1!3!51 24",  
"coat; overcoat; parka; windbreaker!1!3!51 13 15 59 38 54 18 19 20 21 76 80 81 22 55 24 25 27 ",  
"coffee mug!1!1!51 19 24",  
"coffee pot!1!3!51 19",  
"coil{s} of rope (50 feet)!3!10!53 13 17  69",  
"comb; handkerchief!1!.5!51 19 80",  
"combat helmet!1!.5!51 12 59 54 40 82 84 87 55 23",  
"compass!6!.5!52 57 17",  
"cowboy hat!1!.5!51 13 59 54 40 75 83 55",  
"crowbar; tire iron!3!6!51 17 33 82 84 104 69",  
"crutch{es}!3!10!53 66",  
"dagger!3!1!51 75 82 84 86 87 88 104",  
"day pack!4!10!51 15 61 19 20 71 72 74 78 79 82 84 86 88 90 22 23 28  30 102",  
"day{s} of C rations!11!6!51 45 33 23 49 50 102",  
"death ray!27!3!52 8 31 103 105 26 100",  
"deck{s} of playing cards!6!1!51 16 19 80 102",  
"denim jacket!1!.5!51 59 38 54 72 74 78 88 90 55",  
"doctor's bag!1!10!51 36 59 61 54 18 73 55",  
"duster; buckskin coat; poncho!3!.5!53 13 59 38 54 71 75 82 83 89 55",  
"egg; potato{es}!1!.5!51 45 46",  
"empty fuel can!1!10!51 14 61 17 20 71",  
"fedora; flat cap; porkpie hat!1!.5!51 59 40 19 73 77 85 86 89 90 22 55 25  30",  
"fire axe!3!10!53 14 15 16 18 20 21 72 74 78 79 84 90 104 23",  
"fire extinguisher!1!15!51 14 15 16 33 18 20 21 22 23 24 25 26 28 30",  
"first aid kit!13!10!53 66 102",  
"flashlight!6!1!51 14 31 57 15 43 17 19 20 21 80 26  69 102",  
"floral dress; jumper{s} with {a |}blouse{s}; jumper{s} with {a |}T-shirt{s}; skirt{s} and blouse{s}; prairie skirt{s} and blouse{s}; shirtwaist dress!1!.5!51 37 59 54 72 73 76 77 85 86 89 90",  
"football; tennis racket!1!10!51 19 25 28  68",  
"force field belt!15!1!52 12 31 26 100",  
"gas mask!1!3!53 12 31 81 87 23",  
"geiger counter!11!3!53 31 20 79 84 85 87 26 69 102",  
"gold krugerrand!10!1!53 62 33 101",  
"gravity rifle!36!20!52 8 31 103 33 23 26 106 100",  
"hand grenade!5!1!53 64 82 84 87 23",  
"hard hat{s} with lamp{s}; hard hat!3!.5!53 59 54 40 20 79 55",  
"hockey mask!1!3!53 12 82",  
"hoe; rake; shovel!3!10!53 13 17 86 104 69",  
"holster!3!1!53 36 59 54 75 80 87 55 35",  
"house deed!6!1!52 101",  
"hunting kni{fe|ves}!3!1!51 75 76 77 83 84 86 89 90 104",  
"ice pick!3!20!53 17 33 104 69",  
"jar{s} of Ersatz instant coffee!6!3!52 15 45 19 99 24 49 50 30",  
"jar{s} of Gusto pasta sauce; box{es} of Gusto spaghetti; jar{s} of Gusto olives; box{es} of Gusto bread sticks; can{s} of Gusto ravioli!3!3!51 45 19 49 27",  
"jar{s} of jam!1!1!51 45 46 19 48 27",  
"jug{s} of moonshine!10!10!53 13 63 80",  
"jumpsuit; {|}work coveralls!1!3!51 13 14 37 59 54 20 21 72 74 78 79 84 55",  
"knife; fork; spoon!1!1!51 19 27",  
"lab coat!1!3!51 59 38 54 18 21 73 85 55 26",  
"lariat!1!3!51 83 35",  
"laser pistol!27!3!52 9 31 103 85 87 105 26 100",  
"laser rifle!36!10!52 9 31 103 87 26 106 100",  
"letter sweater!3!.5!53 59 38 54 86 55",  
"loa{f|ves} of bread!1!3!51 45 46 86 48",  
"lockpick set!11!1!52 16 88 69 102",  
"lunchbox{es}!3!10!53 19",  
"magazine!3!3!51 98 30",  
"medical brace!3!10!53 66",  
"metal detector!6!10!52 31 17 84 23  69 35",  
"military helmet!9!3!53 12 84 87 102",  
"motorcycle helmet; football helmet!9!3!53 12 17 82 84 102",  
"motorcycle jacket!11!3!53 59 38 54 17 71 75 82 84 55 102",  
"mouse trap!3!1!53 17 19 69",  
"necklace!12!1!53 65 101",  
"newspaper!3!3!51 14 15 16 17 98 18 19 20 21 22 23 24 25 27 29 30",  
"notebook; journal; sketchbook!6!3!52 14 15 18 19 21 80 23 24 26 28  29 35",  
"pack{s} of chemical light sticks (5 sticks)!8!1!53 57 17 71 74 78 79 81 84 90  69 102",  
"pack{s} of chewing gum; pack{s} of Blackjack chewing gum!6!.5!52 45 80 99 49 50 29 30",  
"pack{s} of cigarettes!13!1!53 63 80 99",  
"pair{s} of safety goggles!6!1!52 59 54 40 20 85 55 26",  
"peaked cap; campaign hat!1!.5!51 15 59 54 40 81 55",  
"pencil; pen!1!1!51 24 28",  
"pipe; chain!3!3!53 17 20 82 104",  
"pitchfork!3!10!53 13 69",  
"plastic cup; glass!1!3!51 31 19 27 28 ",  
"plate!1!3!51 19 27",  
"polaroid camera!3!3!53 31 15 44 19 21 80 22 25 26  29 30",  
"police baton; nightstick!3!3!53 81 104",  
"police uniform!1!3!51 37 15 59 54 81 55",  
"pool table!24!80!52 33 19 102",  
"portable stove!3!3!53 31 57 17 71 84 89 90 68",  
"portable water purification filter!14!3!52 31  69 102",  
"pressure cooker; hot plate!6!10!52 31 19",  
"pulse pistol!27!6!52 10 31 103 33 85 87 105 26 100",  
"pulse rifle!36!20!52 10 31 103 33 87 26 106 100",  
"purse; handbag!1!3!51 15 61 19 22 24 25 30",  
"rabbit's {foot|feet}; {|pairs of }Starlight Casino dice; deck{s} of Elvis Presley playing cards; poker chip{s} from the Sands Casino in Reno; Gideon's bible; pocket crucifix; St. Jude pendant; St. Christopher figurine; Star of David necklace; {|pairs of }Masonic cufflinks; Order of Odd Fellows tie clip; class ring!3!.5!53 80 35",  
"radiation suit!13!10!53 31 59 38 54 20 79 84 87 55 26 102",  
"red Gingham dress; blue Gingham dress; yellow Gingham dress; green Gingham dress; black and white Gingham dress!1!.5!51 37 59 54 72 73 76 77 85 86 89 90",  
"rifle scope!8!1!53 13 31 19 83 86 102",  
"ring!7!.5!53 65 101",  
"road map!1!1!51 14 17 71 75 84 89 90 22 30",  
"roll{s} of 35mm film (24 shots)!6!.5!52 41 42",  
"roll{s} of polaroid film (10 shots)!3!1!53 41 44",  
"safe-cracking kit!20!20!52 31 15 16 84 88 69 102",  
"scalpel!1!1!51 66 69",  
"set{s} of horse tack!1!20!51 13",  
"set{|s} of keys!1!.5!51 14 15 19 20 21 22 23 24 26 28 35",  
"shawl!3!.5!53 13 59 38 54 19 73 76 77 86 89 90",  
"shiv; switchblade!3!1!51 16 82 84 88 104",  
"shotgun shell!1!.5!53 0 11",  
"slab{s} of bacon!3!1!51 45 19 47 49",  
"sleeping bag; tent!1!10!51 57 17 71 84 90",  
"sombrero!6!.5!52 13 59 40 75 83 90 55",  
"stick{s} of beef jerky!3!1!51 45 19 47 49 50",  
"stick{s} of dynamite!3!1!53 64 20 79",  
"straw sun hat!3!.5!53 15 59 54 40 19 73 76 77 85 86 89 90 22 25",  
"stun baton!11!3!52 81 87 104 102",  
"suit{|s} of riot gear!15!20!53 12 31 15 16 81 84 23 102",  
"sword; machete!3!3!52 71 86 87 104",  
"tabletop radio!1!10!51 14 31 15 60 17 19 21 23 ",  
"teargas grenade!3!1!53 15 64 81",  
"thermos!11!3!53 57 17 19 83 84 102",  
"toaster!1!10!51 31 19",  
"toy robot!6!3!52 31 43 19 70",  
"trenchcoat; sports jacket!3!.5!53 59 38 77 55",  
"walkie-talkie!6!3!52 31 15 60 20 21 77 81 84 87 23 26",  
"wanted poster!3!.5!53 71 75 81",  
"will; contract; war bond; passport!1!1!51 101",  
"wrench{es}; hammer!1!3!51 14 17 20 72 78 84  69",  
"{|pairs of }Mary Jane shoes!1!.5!51 15 59 39 54 19 21 72 73 77 85 86 88 89 90 23",  
"{|pairs of }black leather shoes!1!.5!51 15 59 39 54 19 21 71 72 73 74 77 78 81 85 86 87 88 89 90 55 23",  
"{|pairs of }blue suede loafers; {|pairs of }saddle shoes!3!.5!53 59 39 54 86 55",  
"{|pairs of }chaps!1!.5!51 36 13 59 54 83 55",  
"{|pairs of }combat boots!1!.5!51 12 59 39 54 71 75 81 82 84 87 90 55 23",  
"{|pairs of }cowboy boots!1!.5!51 59 39 54 19 71 75 76 77 78 79 82 83 84 86 88 89 90 22 55 ",  
"{|pairs of }dice!3!.5!51 16 19 80 35 102",  
"{|pairs of }dog tags!1!.5!51 87 23 35",  
"{|pairs of }forceps!3!3!53 66 69",  
"{|pairs of }military fatigues!1!3!51 37 59 54 84 87 55 23",  
"{|pairs of }night vision goggles!14!3!52 36 31 59 43 54 81 84 87 55 23 102",  
"{|pairs of }slacks {and a|with} button up shirt{s}!1!.5!51 37 59 19 72 73 85 86 89 90 55",  
"{|pairs of }work boots!1!.5!51 12 59 39 54 71 75 76 79 81 82 84 86 88 90 55 23",  
"{|sets of }football pads!11!10!53 12 17 82 84 102",  
"{|suits of }makeshift metal armor!15!20!52 12 31 16 82 84 102",  
"{|}binoculars!11!3!53 31 19 71 84 87 102",  
"{|}bongos; flute!3!3!53 90 35",  
"{|}brass knuckles!3!1!52 16 82 104",  
"{|}jeans and a T-shirt; {|}jeans and a button up work shirt; {|}jeans and a flannel shirt; {|}jeans and a western shirt!1!.5!51 37 59 54 19 71 72 74 75 76 78 82 83 84 86 88 89 90 55" 
);

ion.profDb = new ion.db.ProfessionDatabase(['post','pre','glasses','injuries','military:tattoo','sailor:tattoo','tattoo','high','low','normal','common','rare','uncommon','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','innate','Agile','Attractive','Cunning','Persuasive','Smart','Strong','Tough','Willpower','Art','Athletics','Bargain','Business','Camouflage','Electrical Repair','Foraging','Forensics','Government','Homesteading','Horseback Riding','Humanities','Law','Maritime','Mathematics','Mechanical Repair','Medicine','Mining','Negotiate','Observation','Research','Scavenging','Spelunking','Tracking','Wayfinding','Archery','Explosives','Firearms','Melee Weapons','Military','Unarmed Combat','Blacksmith','Brewer','Cook','Glassblower','Leatherworker','Potter','Weaver','Woodworker','Chemical Engineering','Civil Engineering','Eletrical Engineering','Mechanical Engineering','Mining Engineering','Nuclear Engineering','Chinese','French','German','Italian','Russian','Spanish','Biology','Chemistry','Geology','Physics','Science','Social Science','Deceive','Forgery','Intimidate','Lockpicking','Pickpocket','Safe Cracking','Stealth','Streetwise','Communications','Computers','Cryptography','Programming','Robotics','Rocketry','Butcher','Carpenter','Clothier','Gunsmith','Machinist','Mason','Plumber','Wagonwright','Driving','Motorcycling','Pilot Aircraft','Trucking']);
ion.profDb.register(ion.models.AtomicProfession,
"Air Force!68 70 122!59 69 71!10 28 4 9 0 1", "this.assignRank(c);",  
"Army!68 70!59 69 71 45!10 28 4 9 0 1", "this.assignRank(c);",  
"Bounty Hunter!68 100!43 45 51 64 65 69 71 104 105 121!12 3 17 8 0", "",  
"Business Executive; Manager!43 44!49 53 55 59 86 87 88 89 90 91!12 9 1", "",  
"Carnie!43 98!60 62 105 120!12 8 1 6", "",  
"Clerk; Sales Clerk; Secretary; Salesman; Hotel Clerk; Motel Clerk; Warehouse Clerk!44!43!10 8 1", "",  
"Coast Guard!54 68 70!59 69 71!11 28 4 9 0 1 5", "this.assignRank(c);",  
"Courier!51 65!66 68 120 121 122 123!12 13 9 0", "",  
"Craftsperson!43!41 44 72 73 74 75 76 77 78 79!10 14 9 0", "",  
"Doctor!57!61 92 93 96 48!11 7 15 0 1", "c.honorific = 'Doctor';",  
"Elementary school teacher; Middle school teacher; high school teacher!61!41 42 52 55 92 93 94 95 96 97!10 2 9 1", "",  
"Engineer!55 61!107 110 111 80 81 82 83 84 85!12 9 1", "",  
"Homesteader; Farmer!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123!10 18 9 0", "",  
"Innate!!33 34 35 36 37 38 39 40!10 32", "",  
"Librarian; Archivist!61!86 87 88 89 90 91 107!12 2 9 1", "",  
"Marine!68 70!59 69 71 65 45!10 28 4 9 0 1 5", "this.assignRank(c);",  
"Mayor; Council Member!43 49!44 60!11 7 19 0", "",  
"Mechanic!46 56!43 106 107 108 109 110 111!10 20 9 0 1", "",  
"Miner!58!46 56 63 67!10 21 8 0 1", "",  
"Navy!54 68 70 122!59 69 71!12 28 9 0 1 5", "this.assignRank(c);",  
"Newspaper Reporter!60 61!49 98 105 106!12 2 9 1", "",  
"Police!68!42 49 59 60 71 100 105!12 22 9 0 1", "this.assignRank(c);",  
"Professor!61!41 52 53 55 57 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 1", "c.degree = 'Ph.D.'",  
"Raider!68 69!45 51 64 66 67 71 98 100 104 121!12 3 23 8 0 6", "",  
"Rancher; Cowhand!51 68!42 43 47 50 60 64 65!10 24 9 0 1", "",  
"Scavenger!62 65!47 60 101 103 66 69 68!10 3 25 9 0", "",  
"Scientist!61!55 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 0 1", "",  
"Settler!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123 105!10 27 9 0", "",  
"Thief!98 100 105!35 101 99 102 103 104 69 108 43!10 29 8 0 1", "",  
"Trader!43 44!35 46 53 56 59 62 91 98 105 106 36!12 2 30 9 0", "",  
"Tradesperson!43!44 112 113 114 115 116 117 118 119!10 14 9 0", "" 
);

ion.storeDb = new ion.db.StoreDatabase(['cluster:low', 'cluster:medium', 'cluster:none', 'common', 'rare', 'uncommon', 'encampment', 'roadside', 'settlement']);
ion.storeDb.register(
"Bar; Tavern; Saloon!By the glass, or some bottles for purchase:!trader!!alcohol -bottleofwine!50!3 2 3 8", 
"Biker Shop!Don't mess with the proprietors.!Biker Gang!!kit:raider | weapon | ammo | drug!100!4 0 4 7", 
"Diner; Cafe; Restaurant; Drive-Thru!A hot meal for 4T, some food for sale:!trader!!prepared food!!4 0 4 7", 
"Diner; Cafe; Restaurant; Eatery!A hot meal for 3T{.|, prefers casino chips.|, prefers currency.|, only accepts currency.}!trader!!prepared food!!3 0 3 8", 
"Mart; Market; Shop; Store!!trader!!food!!3 0 3 6 8", 
"Pottery Shop!!tradesperson!Potter!-br pottery!100!5 0 8 5", 
"Sporting Goods Store!!trader!!sport | camping!!4 1 4 7 8"
);
(function(atomic, ion, db, Bag, IonSet) {

    var containers = {
        "Safe": {
            desc: ["Safecracking+1", "Safecracking", "Safecracking-1", "Safecracking-2", "Safecracking-3", "Safecracking-4"],
            query: { 
                totalValue: "3d8+15", 
                tags: "cash | firearm -scifi | secured | luxury -food", 
                maxEnc: 10, 
                fillBag: false
            }
        },
        "Lockbox": {
            desc: ["Unlocked", "Lockpicking", "Lockpicking-1", "Lockpicking-2"],
            query: {
                totalValue: "2d6+2",
                tags: "cash | secured | firearm -scifi -br | asetofkeys | luxury -food", 
                maxEnc: 3, 
                fillBag: true
            }
        },
        "Trunk": {
            desc: ["Unlocked", "Lockpicking+2, can be broken open", "Lockpicking+3, can be broken open", "Lockpicking+4, can be broken open"],
            query: {
                totalValue: "2d6",
                tags: "clothing | armor | firearm -scifi -br | unique", 
                maxEnc: 10, 
                fillBag: false
            }
        },
        "Cash Register": {
            desc: ["easily opened"],
            query: {
                totalValue: "6d50/100",
                tags: "cash",
                fillBag: true
            }
        },
        "Cash On Hand": {
            desc: ["under the counter", "in a lockbox"],
            query: {
                totalValue: "5d5",
                tags: "currency", 
                fillBag: true,
                maxValue:5
            }
        },
        "Clothes Closet": {
            desc: ["no lock"],
            query: {
                totalValue: "1d8+5",
                tags: "clothing -research -industrial -military", 
                fillBag: false
            }
        }
    };
    // A container of containers.
    // "vault" 
    
    var containerTypes = Object.keys(containers).sort();
    
    // Uses the existing API to get the right frequency of objects, but can lead to many duplicates.
    // of all the fill* methods, this is the only one that respects all the createBag() options, 
    // the rest are specific to creating a believable kit.
    
    function fill(bag, opts) {
        var bagValue = opts.totalValue;
        while (bagValue > 0) {
            // Take the the max value or the bag value, unless they are less than the min value, 
            // then take the min value. For that reason, the item's value has to be tested below
            // to verify it is less than the remaining bag value (if it's not, just quit and return
            // the bag).
            opts.maxValue = Math.max(Math.min(opts.maxValue, bagValue), opts.minValue);

            // Because maxValue changes every query, we can't cache any of this.
            var item = db.find(opts);
            if (item === null || item.value > bagValue) {
                return bag;
            }
            bag.add(item);
            bagValue -= item.value;
        }
        return bag;
    }
    function cluster(value) {
        switch(value) {
        case "low":
            return ion.roll("1d3*2");
        case "medium":
            return ion.roll("2d3*4");
        case "high":
            return ion.roll("3d3*5");
        }
    }
    // Try and create duplicates on purpose
    function stockpile(bag, opts) {
        var bagValue = opts.totalValue;
        while (bagValue > 0) {
            var count = cluster(opts.cluster);
            // Take the the max value or the bag value, unless they are less than the min value, 
            // then take the min value. For that reason, the item's value has to be tested below
            // to verify it is less than the remaining bag value (if it's not, just quit and return
            // the bag).
            opts.maxValue = Math.max(Math.min(opts.maxValue, bagValue), opts.minValue);
            
            // Because maxValue changes every query, we can't cache any of this.
            var item = db.find(opts);
            if (item === null || (item.value*count) > bagValue) {
                return bag;
            }
            bag.add(item, count);
            bagValue -= (item.value * count);
        }
        return bag;
    }
    function fillCurrency(bag, amount) {
        if (amount > 0) {
            var currencies = db.findAll({tags: 'currency', maxValue: amount});
            while(amount > 0) {
                var currency = currencies.get();
                if (currency === null) {
                    return;
                }
                bag.add(currency);
                amount -= currency.value;
            }
        }
    }
    function kitWeapon(bag, kitTag) {
        var weaponType = (ion.test(60)) ? "firearm" : "melee";
        var weapon = db.find([weaponType, kitTag, "-br"]);
        if (weapon) {
            bag.add(weapon);    
            if (weapon.is('firearm')) {
                var ammo = db.find(["ammo", weapon.typeOf('ammo'), "-bundled"]);
                if (ammo) {
                    bag.add(ammo, ion.roll("4d4"));
                }
                if (ion.test(20)) {
                    weapon = db.find(["melee", kitTag, "-scifi"]);
                    if (weapon) {
                        bag.add(weapon);
                    }
                }
            }
        }
    }
    function kitToCount(bag, count, tagsArray) {
        for (var i=0; i < count; i++) {
            var item = db.find(ion.select(tagsArray));
            if (item) {
                bag.add( item );
            }
        }
        return bag;
    }
    function kitUniques(bag, count, tags) {
        var set = new IonSet();
        for (var i=0; i < count; i++) {
            var item = db.find(tags);
            if (item) {
                set.add( item );    
            }
        }
        return setToBag(bag, set);
    }
    function setToBag(bag, set) {
        set.toArray().forEach(function(item) {
            bag.add(item);
        });
        return bag;
    }
    function kitChanceOfFill(bag, gender, kitTag) {
        return function(chance, count, tags) {
            if (ion.test(chance)) {
                kitUniques(bag, count, ion.format(tags, gender, kitTag));
            }
        };
    }
    function createParams(params) {
        params = ion.extend({}, params || {}); 
        params.totalValue = params.totalValue || 20;
        params.fillBag = ion.isBoolean(params.fillBag) ? params.fillBag : true;
        params.minValue = ion.isNumber(params.minValue) ? params.minValue : 0;
        params.maxValue = ion.isNumber(params.maxValue) ? params.maxValue : Number.MAX_VALUE;
        params.minEnc = ion.isNumber(params.minEnc) ? params.minEnc : 0;
        params.maxEnc = ion.isNumber(params.maxEnc) ? params.maxEnc : Number.MAX_VALUE;
        
        if (params.maxValue <= 0 || params.maxEnc <= 0 || 
            params.minValue > params.maxValue || params.minEnc > params.maxEnc) {
            throw new Error('Conditions cannot match any taggable: ' + JSON.stringify(params));
        }
        if (!ion.isUndefined(params.totalValue) && params.totalValue <= 0) {
            throw new Error("Bag value must be more than 0");
        }
        return params;
    }
    
    /**
     * Generate the possessions that would be on the person of an active NPC (e.g. out on patrol, 
     * out for a night on the town, out on a raid or in the middle of criminal activity).  
     * 
     * @static
     * @method createKit
     * @for atomic
     * 
     * @param params {Object}
     *     @param params.profession {String|ion.models.Profession} profession name or instance
     *     @param [params.gender] {String} gender of character (male or female)
     *     
     * @return {ion.models.Bag} A bag of items on the person of that NPC
     */
    atomic.createKit = function(params) {
        var bag = new Bag(),
            kitTag = (ion.isString(params.profession)) ? 
                "kit:"+params.profession : params.profession.typeOf('kit'); 

        kitWeapon(bag, kitTag);

        // Clothes: head, body, feet, and some accessories. By gender and profession.
        var kitFill = kitChanceOfFill(bag, params.gender, kitTag);
        kitFill(100, 1, 'body {0} {1}');
        kitFill(30, 1, 'head {0} {1}');
        kitFill(50, 1, 'coat {0} {1}');
        kitFill(30, 1, 'accessories {0} {1} -br');
        kitFill(100, 1, 'feet {0} {1}');
        kitFill(100, ion.roll("1d3-1"), '{1} -clothing -firearm -melee -br | kit:personal -br');
        
        // OK to have duplicates for this, even desirable (though rare).
        kitToCount(bag, ion.roll("2d3-2"), ['ration','ration','food -fresh']);

        if (bag.value() < 20) {
            fillCurrency(bag, ion.roll(20-bag.value()));
        }
        return bag;
    };
    
    /**
     * Generate a collection of items.
     * 
     *     var bag = atomic.createBag({
     *         totalValue: 500, 
     *         minValue: 10, 
     *         tags: "firearm"
     *     });
     *     bag.toString()
     *     => "2 Browning Automatic Rifles, a M14 Rifle...and a pulse rifle."
     *  
     * @static
     * @method createBag
     * @for atomic
     * 
     * @param [params] {Object}
     *      @param [params.tags] {String} One or more query tags specifying the items in the bag
     *      @param [params.minValue] {Number}
     *      @param [params.maxValue] {Number}
     *      @param [params.minEnc] {Number}
     *      @param [params.maxEnc] {Number}
     *      @param [params.totalValue=20] {Number} The total value of the bag
     *      @param [params.fillBag=true] {Boolean} Should the bag's value be filled with 
     *      currency if it hasn't been filled any other way? Usually currency has a value of 
     *      1 or less, and can cover a gap otherwise caused by search criteria, but this 
     *      isn't always desirable.  
     */
    atomic.createBag = function(params) {
        params = createParams(params); 
        var bag = fill(new Bag(), params);
        if (params.fillBag !== false) {
            fillCurrency(bag, params.totalValue - bag.value());
        }
        return bag;
    };
    
    /**
     * Like creating a bag but with many more repeated items (purposefully repeated, not 
     * accidentally repeated), as if collected for a cache, shop, or storeroom. Honors the 
     * `totalValue` limit (in fact will usually fall short of it), but `fillBag` will always be 
     * treated as false.
     * 
     * @static
     * @method createStockpile
     * @for atomic
     * 
     * @param [params] {Object}
     *      @param [params.tags] {String} One or more query tags specifying the items in the bag
     *      @param [params.cluster="medium"] {String} "low", "medium" or "high". Alters the amount 
     *          of stockpiling from a little to a lot.
     *      @param [params.minValue] {Number}
     *      @param [params.maxValue] {Number}
     *      @param [params.minEnc] {Number}
     *      @param [params.maxEnc] {Number}
     *      @param [params.totalValue=20] {Number} The total value of the stockpile. In practice, 
     *          the stockpile will be worth less than this. Must be at least 20.
     */
    atomic.createStockpile = function(params) {
        params = createParams(params); 
        params.cluster = params.cluster || "medium";
        params.fillBag = false;
        // Have to have at least 20 for totalValue
        if (params.totalValue < 20) {
            params.totalValue = 20;
        }
        var bag, i=0;
        do {
            bag = stockpile(new Bag(), params);
        } while(bag.count() === 0 && i++ < 50);
        return bag;
    };
    
    /**
     * Create a bag with additional properties (representing a container of some kind, like a 
     * lockbox or safe).
     * 
     * @static
     * @method createContainer
     * @for atomic
     * 
     * @param type {String} the container type
     * @return {ion.models.Bag} a bag representing a container 
     * 
     */
    atomic.createContainer = function(type) {
        if (!containers[type]) {
            type = ion.random(containerTypes);
        }
        var container = containers[type];
        var params = ion.extend({}, container.query);
        params.totalValue = ion.roll(params.totalValue);
        
        var bag = atomic.createBag(params);
        if (container.desc) {
            bag.descriptor = ion.format("{0} ({1})", ion.titleCase(type), ion.select(container.desc));    
        }
        return bag;
    };
    /**
     * Get container types. One of these values is a valid type to pass to the 
     * `atomic.createContainer(type)` method.
     * 
     * @static
     * @method getContainerTypes
     * @for atomic
     * 
     * @return {Array} an array of container types 
     */
    atomic.getContainerTypes = function() {
        return containerTypes;
    };
    
    
})(atomic, ion, ion.itemDb, ion.models.Bag, ion.models.IonSet);
(function(atomic, ion) {
    
    var names = {
        "anglo male" : [ "Al", "Andy", "Arnie", "Art", "Austin", "Bart", "Beau", "Ben", "Bert", "Bob", "Brad",
                "Bradley", "Brock", "Bruce", "Bud", "Burt", "Caleb", "Calvin", "Carl", "Cecil", "Chuck", "Clayton",
                "Cliff", "Conrad", "Cooper", "Cyril", "Dakota", "Dallas", "Dalton", "Dan", "Dawson", "Dean", "Destry",
                "Don", "Doug", "Dwain", "Earl", "Ed", "Errol", "Floyd", "Frank", "Fred", "Gage", "Garth", "Gavin",
                "Gene", "Glen", "Grady", "Greg", "Gus", "Guy", "Hal", "Hank", "Harlan", "Holden", "Hoyt", "Hudson",
                "Hugh", "Huxley", "Ian", "Isaac", "Jack", "Jake", "Jason", "Jeremy", "Jerry", "Jethro", "Joe", "John",
                "Johnny", "Ken", "Kirk", "Kurt", "Kyle", "Larson", "Levi", "Lloyd", "Luke", "Lyle", "Mack", "Mark",
                "Marty", "Mason", "Matt", "Max", "Merle", "Nate", "Ned", "Neil", "Nick", "Norm", "Otis", "Pat", "Phil",
                "Ray", "Reed", "Rex", "Rick", "Rod", "Rodger", "Roy", "Russell", "Sam", "Scott", "Slim", "Stan",
                "Stratton", "Ted", "Tim", "Todd", "Tony", "Travis", "Tyler", "Vern", "Wade", "Wally", "Ward", "Wesley",
                "Will", "Wyatt" ],
        "anglo female" : [ "Ada", "Agnes", "Alice", "Amy", "Ann", "Audrey", "Barb", "Becky", "Betty", "Bev", "Carol",
                "Cindy", "Clara", "Darla", "Diane", "Dona", "Doris", "Edith", "Edna", "Eileen", "Ella", "Ellen",
                "Emma", "Emily", "Erma", "Esther", "Ethel", "Eva", "Fay", "Flo", "Flora", "Gail", "Grace", "Gwen",
                "Hazel", "Helen", "Holly", "Ida", "Ilene", "Irene", "Iris", "Irma", "Jan", "Jane", "Janet", "Janis",
                "Jean", "Joan", "Judy", "June", "Kathy", "Kay", "Lena", "Linda", "Lois", "Lorna", "Lucy", "Mabel",
                "Mae", "Mary", "Mavis", "Nina", "Nora", "Norma", "Olga", "Pam", "Patty", "Paula", "Pearl", "Rita",
                "Rose", "Ruth", "Sally", "Sara", "Stella", "Sue", "Sybil", "Tina", "Trudy", "Velma", "Vera", "Viola", 
                "Wanda", "Wilma" ],
        "hispanic male" : [ "Alonso", "Bruno", "Camilo", "Carlos", "Dante", "Diego", "Emilio", "Felipe", "Franco",
                "Iker", "Jacobo", "Javier", "Jorge", "Jose", "Juan", "Julian", "Lucas", "Luis", "Manny", "Manuel",
                "Mario", "Mateo", "Matias", "Miguel", "Pablo", "Pedro", "Rafael", "Samuel", "Sergio", "Tomas", "Elias" ],
        "hispanic female" : [ "Abril", "Alexa", "Alma", "Ana", "Ariana", "Ashley", "Bianca", "Camila", "Carla",
                "Elena", "Emilia", "Isabel", "Jimena", "Julia", "Luana", "Lucia", "Maite", "Malena", "Maria", "Mia",
                "Regina", "Renata", "Sofia", "Sophie", "Valery" ],
        "anglo" : [ "Adams", "Alexander", "Anderson", "Bailey", "Baker", "Barnes", "Bell", "Bennett", "Brooks",
                "Brown", "Bryant", "Butler", "Campbell", "Carter", "Clark", "Cleaver", "Coleman", "Collins", "Cook",
                "Cooper", "Cox", "Davis", "Edwards", "Evans", "Flores", "Foster", "Gray", "Green", "Griffin", "Hall",
                "Harris", "Haskell", "Henderson", "Hill", "Howard", "Hughes", "Jackson", "James", "Jenkins", "Johnson",
                "Jones", "Kelly", "King", "Lewis", "Long", "Martin", "Miller", "Mitchell", "Moore", "Morgan", "Morris",
                "Murphy", "Nelson", "Parker", "Patterson", "Perry", "Peterson", "Phillips", "Powell", "Price", "Reed",
                "Richardson", "Roberts", "Robinson", "Rogers", "Ross", "Russell", "Sanders", "Scott", "Simmons",
                "Smith", "Stewart", "Taylor", "Thomas", "Thompson", "Turner", "Walker", "Ward", "Washington", "Watson",
                "White", "Williams", "Wilson", "Wood", "Wright", "Hayes" ],
        "hispanic" : [ "Aguilar", "Aguirre", "Alvarado", "Alvarez", "Avila", "Barrera", "Cabrera", "Calaveras",
                "Calderon", "Camacho", "Campos", "Cardenas", "Carrillo", "Castaneda", "Castillo", "Castro",
                "Cervantes", "Chavez", "Contreras", "Cortez", "Delacruz", "Deleon", "Diaz", "Dominguez", "Escobar",
                "Espinoza", "Estrada", "Fernandez", "Flores", "Fuentes", "Gallegos", "Garcia", "Garza", "Gomez",
                "Gonzales", "Guerra", "Guerrero", "Gutierrez", "Guzman", "Hernandez", "Herrera", "Ibarra", "Jimenez",
                "Juarez", "Lopez", "Lozano", "Macias", "Marquez", "Martinez", "Medina", "Mejia", "Melendez", "Mendez",
                "Mendoza", "Mercado", "Miranda", "Molina", "Montoya", "Morales", "Moreno", "Navarro", "Ochoa",
                "Orozco", "Ortega", "Ortiz", "Pacheco", "Padilla", "Perez", "Ramirez", "Ramos", "Reyes", "Rivera",
                "Rodriguez", "Romero", "Rosales", "Ruiz", "Salas", "Salazar", "Salinas", "Sanchez", "Sandoval",
                "Santiago", "Serrano", "Silva", "Suarez", "Torres", "Trevino", "Trujillo", "Valdez", "Valencia",
                "Vargas", "Vasquez", "Velasquez", "Velez", "Villarreal", "Zamora" ]
    };
    function getGivenName(gender, race) {
        return ion.random(names[ion.format((race === "hispanic" && ion.test(35)) ? "anglo {0}" : "{1} {0}", gender, race)]);
    }
    function getFamilyName(race) {
        return ion.random(names[race]);
    }
    
    /** 
     * Generate a random name for a mid-century American, of the kind that would be 
     * wandering around an atomic era apocalypse.
     * 
     *     var girl = atomic.createCharacterName({gender: "female"})
     *     girl.toString()
     *     => "Ada King"
     *     girl = atomic.createCharacterName({gender: "female", race: "hispanic"})
     *     girl.toString()
     *     => "Elena Silva" 
     *     
     * @static
     * @method createCharacterName
     * @for atomic
     * 
     * @param [params] {Object}
     *     @param [params.gender] {String} "male" or "female" name. Optional. If not specified, gender is 50/50.
     *     @param [params.race] {String} "anglo" or "hispanic" (Optional. If not specified, 20% of names are Hispanic).
     *     @param [params.given] {String} set the given name to this name
     *     @param [params.family] {String} set the family name to this name
     * @return {ion.models.Name}
     */
    atomic.createCharacterName = function(opts) {
        opts = opts || {};
        // Both of these are already specified in the character constructor and can be overwritten
        // by the caller, but happen here again for convenience.
        var gender = opts.gender || (ion.test(50) ? "male" : "female");
        var race = opts.race || (ion.test(20) ? "hispanic" : "anglo");

        return new ion.models.Name({
            given: opts.given || getGivenName(gender, race),
            family: opts.family || getFamilyName(race)
        });
    };
    
})(atomic, ion);

(function(atomic, ion, Table, RarityTable) {

    // Not thrilled with these, just because they're not easily role-played.
    // TODO: Multiple tattoos, adjectives, etc.
    /*
    var adjectives = [ "Addict", "Agoraphobic", "Ambitious", "Anarchist",
            "Annoying", "Apologetic", "Argumentative", "Arrogant",
            "Authoritarian", "Bad Loser", "Beatnik", "Bitter",
            "Bleeding Heart", "Blind Follower", "Blunt", "Born Again",
            "Brainiac", "Brave", "Brutally Honest", "Buffoon", "Busybody",
            "Cautious", "Charlatan", "Civilised", "Claustrophobic", "Clumsy",
            "Cold", "Competitive", "Complainer", "Confident", "Conformist",
            "Conniver", "Considerate", "Cool Under Fire", "Cowardly",
            "Creative", "Curious", "Curmudgeon", "Cynical", "Defeatist",
            "Determined", "Devil's Advocate", "Diplomatic", "Disorganised",
            "Distracted", "Drunk", "Drunkard", "Easy Going", "Efficient",
            "Egotistical", "Ends Justifies the Means",
            "Fascinated by the Exotic", "Flirt", "Forgiving ", "Freeloader",
            "Friendly", "Generous", "Gentle", "Good Samaritan", "Gossip",
            "Greedy", "Gregarious", "Grouchy", "Happy", "Happy-Go-Lucky",
            "Hard of Hearing", "Hardened", "Hates Robots", "Hedonist",
            "Honest", "Hopeless Romantic", "Hot Tempered", "Idealistic",
            "Ignorant", "Impatient", "Impulsive", "Intellectual",
            "Know-It-All", "Knucklehead", "Lazy", "Liar", "Loud Mouth",
            "Loyal", "Machiavellian", "Manic-Depressive", "Manipulator",
            "Mischievous", "Modest", "Naive", "Neatnik", "Nervous",
            "Non-Committal", "Nosy", "Optimist", "Overanalytical", "Pacifist",
            "Paranoid", "Perfectionist", "Pessimist", "Philosophical",
            "Practical", "Principled", "Progressive", "Proud", "Rationalist",
            "Rebel", "Rebel without a Clue", "Reckless", "Relaxed",
            "Reluctant", "Sarcastic", "Scatter Brain",
            "Seen a Lot of Strange Stuff", "Selfish", "Sensitive", "Serious",
            "Sheltered Upbringing", "Short Tempered", "Show Off", "Shy",
            "Skeptic", "Slapdash", "Slob", "Sour Puss", "Stubborn",
            "Stutterer", "Superstitious", "Suspicious", "Talkative",
            "Tattletale", "Technophobic", "Teetotaler", "Thespian",
            "Traditionalist", "Treacherous", "Trusting", "Uncertain",
            "Unflappable", "Unpredictable", "Unprincipled", "Vengeful",
            "Wallflower", "Weak Willed", "Wisecracker" ];
      */
    
    var sailorTats = [
        'a sailing ship with the words "Homeward Bound" below it',
        'an anchor'
    ];
    var milTats = [
        'an American {flag|eagle}',
        'an eagle carrying an American flag'
    ];
    var tats = [
        'a skull{| in flames| with wings| and crossbones}',
        'a chinese dragon',
        'a {black panther|tiger|lion|wolf}',
        'a mermaid',
        'a snake wrapped around a {cross|rose}',
        'a pair of dice',
        'a four leaf clover with the word "lucky" across it',
        'a heart with the name "{name}" across it',
        'the name "{name}"',
        '{a crystal|an eight} ball',
        'a {star|cross|phoenix|lion|tiger|crown|fish|scorpion|lucky clover|yin-yang symbol}',
        'an {angel|anchor|ankh}',
        'a heart and dagger',
    ];
    var maleTats = [
        'a{ | blonde| brunette| redhead} pin-up {girl|cowgirl}',
        'a pin-up girl {in a sailor\'s suit|in a WAC uniform|in a space suit}',
        'a woman on a clamshell'
    ];
    var femaleTats = [
        'a {butterfly|swallow|dragonfly|rose|fairy|heart|lotus flower}',
        'two intertwined roses'
    ];
    var injuries = [
        'missing a tooth',
        'missing {possessive} {left|right} {ear|foot|hand}',
        'has been burnt on {possessive} {left|right} arm',
        'walks with a limp',
        'wears an eyepatch',
        'cast on {left|right} arm',
        'scar on {possessive} {left|right} arm',
        'scar on {left|right} side of {possessive} {leg|torso|face}'
    ];
    var prosthetics = [
        'hook for a {right|left} hand',
        'artificial {hand|leg|arm}',
        'glass eye'
    ];
    var behaviors = [
        "will {be very loyal to|betray or abandon} the players in a crisis",
        "will trade generously with players",
        "will demand compensation for minor tasks",
        "if angered, will drag the player group into unnecessary fights",
        "will fight to the death if necessary",
        "if left alone, will {drink|gamble} away any money {personal} has",
        "will expect {an equal share in profits|payment} to join the group",
        "smokes (values acquiring tobacco)",
        "values fine wines and liquors",
        "chews gum (values acquiring chewing gum)"
    ];

    // "has a child but avoids the responsibility of being a parent"
    // "will only stay with the party long enough to save money to travel {out west|east}"
    // "if included as a member of the group, will sacrifice or bear any burden"
    // "will start a fight with anyone not pulling their own weight"
    // "hates off-road travel and will fight to avoid it"
    // "always lobbies for one more scavenging trip, just to be sure"
    // 
    
    var statureTable = new Table()
        .add(10, "tall stature")
        .add(10, "short stature")
        .add(5, "short and heavy-set")
        .add(5, "tall and heavy-set")
        .add(70, null);
    
    // Adjusts a smidge for Hispanic hair color, below
    var hairColor = new Table()
        .add(15, "black")
        .add(50, "brown")
        .add(15, "blond")
        .add(3, "red")
        .add(10, "auburn (brownish-red)")
        .add(7, "chestnut (reddish-brown)");

    // Any long hair?
    var maleHairStyle = new Table()
        .add(30, "{0} crew cut haircut")
        .add(25, "{0} side part haircut")
        .add(25, "{0} ivy league haircut")
        .add(20, "{0} pompadour haircut");
    
    // Thank god for Wikipedia:
    // http://en.wikipedia.org/wiki/Hairstyles_in_the_1950s
    // Many of the women's hairstyles == short hair, with crazy names and slight alterations
    var femaleHairStyle = new RarityTable()
        .add('common', "bobbed {0} hair")
        .add('common', "short {curly|straight} {0} hair")
        .add('uncommon', "long {curly|wavy|straight} {0} hair, usually worn {in a ponytail|under a scarf|in a bun}")
        .add('uncommon', "{0} pageboy haircut")
        .add('rare', "long {curly|wavy|straight} {0} hair")
        .add('rare', "cropped {0} hair");
    
    function formatted(collection, character) {
        return ion.random(ion.format(ion.random(collection), character));
    }

    function hairStyle(character, statements) {
        var color = hairColor.get(), string = null;
        if (character.race === "hispanic" && color === "blond") {
            color = ion.random(["brown","black"]);
        }
        if (character.age > 40 && ion.test(character.age)) {
            color = ion.random(["gray","silver","white"]);
        }
        // So, I wanted dudes with mohawks.
        if (character.is('low') && character.male && character.age < 30 && ion.test(25)) {
            string = "{0} mohawk";
        } else {
            string = (character.male) ? maleHairStyle.get() : femaleHairStyle.get();
        }
        statements.push(ion.random(ion.format(string, color)));
    }
    
    function stature(character, app) {
        var stat = statureTable.get();
        if (stat) {
            app.push(stat);    
        }
    }
    
    function markings(character, app) {
        // A little over-elaborated.
        var chanceGlasses = character.has('glasses') ? 70 : 10;
        if (ion.test(chanceGlasses)) {
            if (ion.test(20)) {
                app.push(character.male ? "wears browline glasses" : "wears cat eye glasses");
            } else {
                app.push(ion.test(30) ? "wears horn-rimmed glasses" : "wears glasses");    
            }
        }

        // Totally heterosexist. Write something different and send to me.
        // Also, this is out of all proportion to the value it brings to the table... 
        var chanceTattoos = (character.has('tattoos') || 
            character.has('military:tattoos') || 
            character.has('sailor:tattoos')) ? 30 : 5;
        
        chanceTattoos += (character.male) ? 15 : 0;
        if (ion.test(chanceTattoos)) {
            var tattoo = null,
                name = atomic.createCharacterName({gender: character.male ? "female" : "male"}).given;
            
            if (character.has('military:tattoo') && ion.test(80)) {
                tattoo = milTats;
            } else if (character.has('sailor:tattoo') && ion.test(80)) {
                tattoo = sailorTats;
            } else if (character.male && ion.test(20)) {
                tattoo = maleTats;
            } else if (!character.male && ion.test(20)){
                tattoo = femaleTats;
            } else {
                tattoo = tats;
            }
            tattoo = formatted(tattoo, {name: name});
            
            var string = ion.format("has a tattoo of {0} on {1} {2} {3}",
                tattoo,
                character.possessive,
                ion.random(['left', 'right']),
                ion.random(['shoulder','bicep','forearm','arm']));
            app.push(string);
        }
        
        var injuryChance = character.has('injuries') ? 15 : 3;
        if (ion.test(injuryChance)) {
            app.push(formatted(injuries, character));
        }
        
        var prosthChance = character.has('prosthetics') ? 5 : 1;
        if (ion.test(prosthChance)) {
            app.push(formatted(prosthetics, character));
        }
    }
    function adjective(character, statements) {
        // Do not like the adjectives. Will only use behaviors, and greatly expand them.
        // Adjectives are not enough to describe how an NPC will act in a game.
        if (ion.test(30)) {
            statements.push(formatted(behaviors, character));
        } /*else {
            statements.push(ion.random(adjectives));    
        }*/
    }
    
    /** 
     * Describe a character's appearance and behavior. This description will be different 
     * each time the character is passed to this function.
     * 
     *     atomic.createAppearance(character)
     *     => "Long brown hair, short stature"
     *     
     * @static
     * @method createAppearance
     * @for atomic
     * 
     * @param character {ion.models.Character} The character to describe.
     * @return {String} A description of the appearance and behavior of the character
     */
    atomic.createAppearance = function(character) {
        if (!character) { throw new Error("Character required"); }
        var app = [], 
            statements = []; 
        hairStyle.call(this, character, app);
        stature.call(this, character, app);
        markings.call(this, character, app);
        adjective.call(this, character, statements);
        
        return [app, statements].reduce(function(array, subarray) {
            if (subarray.length) {
                array.push(ion.sentenceCase(subarray.join(', ')));
            }
            return array;
        }, []).join('. ');
    };
    
})(atomic, ion, ion.tables.Table, ion.tables.RarityTable);

(function(atomic, ion, db, Name, Table, Character, IonSet) {

    var innate = db.find('innate'),
        histories = ["Before the collapse, was {0}", "Was {0} up until the war", "Was {0} before the war"];
    
    function nameFromOpts(n, gender, race) {
        if (ion.isString(n)) {
            var parts = n.split(" ");
            return new Name({given: parts[0], family: parts[1]});
        } else if (n instanceof ion.models.Name) {
            var newName = atomic.createCharacterName({ gender: gender, race: race});
            return ion.extend(newName, n);
        } else {
            return atomic.createCharacterName({ gender: gender, race: race});
        }
    }

    function createOpts(params) {
        var opts = ion.extend({}, params);
        opts.gender = opts.gender || ion.random(['male','female']);
        opts.equip = (ion.isBoolean(opts.equip)) ? opts.equip : true;
        opts.race = opts.race ||  atomic.createRace();
        opts.name = nameFromOpts(opts.name, opts.gender, opts.race);
        opts.age = (ion.isNumber(opts.age)) ? ion.bounded(opts.age, 1, 100) : ion.roll("14+3d12");
        if (opts.traits) {
            opts.traits = ion.extend({}, opts.traits);
        }
        if (opts.profession) {
            opts.profession = ion.toTag(opts.profession);
        }
        if (opts.profession === 'soldier') {
            opts.profession = ion.random(['airforce','marine','army','navy'/*,'coast guard'*/]);
        }
        return opts;
    }
    
    
    function traitsForChild(character, opts) {
        delete character.profession;
        delete character.honorific; // this should only exist as a result of training, however.
        // make a child instead.
        if (character.age > 4) {
            innate.train(character, ion.roll("1d3-1"));
            // Calling children "attractive" gets creepy. Avoid.
            delete character.traits.Attractive;    
        }
    }
    
    function traitsForAdult(character, prof, opts) {
        var startingTraitPoints = ion.sum(ion.values(opts.traits)),
            traitPoints = 8 + (~~(opts.age/10)) - startingTraitPoints;
        
        innate.train(character, ion.roll("2d2-1"));

        // 27 is arbitrary, it gives the character a couple of years to have had a profession.
        // For higher-status professions like doctor, cutoff is 30.
        var pre = db.find('pre -innate'),
            prestige = ion.intersection(pre.tags, ["low", "normal", "high"]),
            post = (prof) ? prof : db.find(prestige + ' post -pre -innate'),
            cutoffAge = (pre.is('high')) ? 30 : 27;        
        
        if (post.not('pre') && character.age > cutoffAge) {
            
            var weight = (character.age - 10)/character.age,
                prePoints = Math.floor(traitPoints * weight),
                postPoints = traitPoints-prePoints;
            
            // two profession, pre/post war
            pre.train(character, prePoints);
            if (pre.names[0] !== post.names[0]) {
                var title = (character.honorific) ? character.honorific : ion.select(pre.names),
                    hsy = ion.select(histories);
                character.history.push( ion.format(hsy, ion.article(title.toLowerCase())) );    
            }
            delete character.honorific;
            post.train(character, postPoints);
        } else {
            // just use the post profession
            post.train(character, traitPoints);
        }
        character.profession = ion.select(post.names);
        if (opts.equip) {
            character.inventory = atomic.createKit({profession: post, gender: character.gender});    
        }
    }
    
    /**
     * Get all (post-collapse) professions. These are valid values for the `atomic.createCharacter()` 
     * call's {profession: [name]}. 
     */
    atomic.getProfessions = function() {
        return ion.profDb.findAll('post').rows.map(function(row) {
            return row.names[0];
        }, []).sort();
    };
    
    /**
     * Create a character.
     * 
     *     atomic.createCharacter({profession: 'thief', inventory: false})
     *     => character
     *
     * @static
     * @method createCharacter
     * @for atomic
     * 
     * @param [params] {Object}
     *     @param [params.gender] {String} "male" or "female"
     *     @param [params.name] {String} full name (e.g. "Loren Greene")
     *     @param [params.age] {Number}
     *     @param [params.race] {String} "anglo" or "hispanic" (20% hispanic by default)
     *     @param [params.profession] {String} Name of a profession this character should have in their experience.
     *          Value can be "soldier" for any of the armed services
     *     @param [params.equip=true] {Boolean} Should an inventory be created for this character?
     *     @param [params.traits] {Object} a map of trait names to trait values. These are deducted from the traits
     *          added to the character during generation.
     * @return {ion.models.Character} character
     */
    atomic.createCharacter = function(params) {
        var prof = null, opts = createOpts(params);
        
        if (opts.profession) {
            prof = db.find(opts.profession);
            if (prof === null || prof.not('post')) {
                throw new Error("Invalid profession: " +opts.profession+ " (must be post-war profession)");
            }
        }
        var character = new Character(opts);
        if (character.age < 17) {
            traitsForChild(character, opts);
        } else {
            traitsForAdult(character, prof, opts);
            
            // Not tailored towards children... may eventually be fixed
            character.appearance = atomic.createAppearance( character );
            
            // These are normally hidden for NPCs, but are available for combatant string.
            character.initiative = ion.roll("2d6") + character.trait('Agile');
            character.hp = 10 + character.trait('Tough');
        }
        
        // Hispanic people are likely to speak some Spanish.
        if (character.race === "hispanic") {
            character.changeTrait("Spanish", ion.nonNegativeGaussian(1.5));
        }
        
        return character;
    };
    
    /**
     * Select one of the available races (Anglo 80% of the time, Hispanic 20% of the time).
     * 
     *     atomic.createRace()
     *     => "hispanic"
     * 
     * @static
     * @method createRace
     * @for atomic
     * 
     * @return {String} a race
     */
    atomic.createRace = function() {
        return (ion.test(20) ? "hispanic" : "anglo");
    };
    
})(atomic, ion, ion.profDb, ion.models.Name, ion.tables.Table, ion.models.Character, ion.models.IonSet);

/*
 * TODO: All girl gangs/all boy gangs mostly, with sometimes a connection between the two.

    patrols; no communications or medics in group.

 *
 * TODO: Non-criminal gangs? Like the "Eastside Motorcycle Club" or the "Southside Paladins", etc.?
    "nomadic": [
        "Raiding Parties (Banditry or Plundering)",
        "Scavenging",
        "Ambushes/Highway Robbery (Brigandry)"
    ],
    "street": [
        "Protection Rackets",
        "Burglery & Larceny",
        "Pickpocketing",
        "Scavenging",
        "Extracting tolls for passage or entry"
    ]
    
    Names for military patrols
 */
(function(atomic, ion, db, Gang) {
    var types = {
        'Biker Gang': {
            prof: "raider",
            nicks: 100,
            traits: {"Motorcycling":1},
            count: "3d4-2",
            mil: false,
            names: ["Pagans", "Outlaws", "Bandidos", "Mongols", "Vagos Motorcycle Club", "Free Souls", 
                    "{Grim |}Reapers", "Gypsy Jokers", "Highwaymen", "Iron Horsemen", "Rebels", 
                    "Comanchero", "Devil's Disciples", "Diablos", "Finks", "58s", "Road Devils", 
                    "{Lone |}Legion", "Road {Devils|Knights}", "Skeleton Crew", "Low Riders"]
        },
        'Street Gang': {
            prof: "thief",
            nicks: 100,
            count: "1d4+1",
            mil: false,
            names: ["Magnificents", "Purple Hearts", "Coasters", "Businessmen", "Gladiators", 
                    "{Earls|Dukes|Counts|Barons|Lords}", "Daggers", "Big Dogs", "Young Lords", 
                    "Imperial Hoods", "Bulls", "Lightenings", "Crowns", "Senators", "Hawks", 
                    "Savages", "Lucky Seven", "Gents", "Enchanters"]
        },
        'Raiding Gang': {
            prof: "raider",
            count: "3d4-2",
            nicks: 90
        },
        'Scavenger Party': {
            prof: "scavenger",
            count: "1d4+1",
            nicks: 50
        },
        // TODO: Which isn't a group of working buckeroos. Those guys might have a chuck wagon and the like 
        'Cowboy Posse': {  
            prof: "rancher",
            count: "1d5+1",
            nicks: 20
        },
        'Cattle Rustler Gang': {
            prof: ['rancher','rancher','scavenger','thief'],
            count: "1d3+1",
            nicks: 50
        },
        'Army Patrol': {
            prof: 'army',
            count: "1d3*4",
            mil: 'army',
            nicks: 5
        },
        'Marine Patrol': {
            prof: 'marine',
            count: "1d3*4",
            mil: 'marine',
            nicks: 15
        }
    };
   
    var nicknames = {
        female: [
            '{given} "The {Queen|Vixen|Waitress|Witch}" {family}',
            '"{Ma|Baby Blue Eyes|Fat Girl|Gold Digger|Hot Lips|Monkey Girl|Repo Girl|Roxy|Sweet Cakes|Wild Woman}" ({given} {family})'
        ],
        male: [
            '{given} "{Wild|Repo|Hatchet|Ice} Man" {family}',
            '"{Bugsy|Pa|Bag Man|Monkey Boy|Muscles|Caveman|Maverick|Music Man|Nice Guy|Pretty Boy}" ({given} {family})',
            '{given} "The {Hitman|Sandman|Watchman|Rifleman|Gunman|Trigger Man}" {family}',
            '{given} "{Lil|Fat|Big} {Loco|Man|Boy|Daddy|Tuna} {family}"'
        ],
        both: [
            '"{Big|Fat|Little|Skinny|Greedy|Crazy|Trigger|Two-Finger|Three-Finger|Young|Old|Doc|Lowdown|Rowdy} {given}" {family}',
            '{given} "The {Agitator|Ant|Bag|Banker|Barber|Blast|Bloodhound|Boot|Brain|Brains|Bug|Bull|Burnout|Bystander|Cartridge|Cheater|Clown|Cruiser|Dasher|Dentist|Duke|Fence|Ghost|Reaper|Groundhog|Hammer|Hatchet|Joker|Kid|Killer|Knife|Lead Foot|Machine|Menace|Monster|Mouse|Rat|Prairie Dog|Mouthpiece|Mumbler|Ox|Rabbit|Razor|Rev|Roach|Saint|Show|Shotgun|Snake|Sore|Suit|Trigger|Unwanted|Viper|Waiter|Wall|Watcher|Weasel|Whisperer|Wire|Wolf|Zealot|Zero|Zookeeper|Plumber|Kleaner}" {family}',
            '"{Ammo|Angel|Animal|Baby Face|Babycakes|Baldo|Bananas|Band-Aid|Bats|Beans|Beef|Bench|Bix|Black Eye|Blackjack|Blaze|Bloody|Blue Eyes|Blue Nose|Books|Boxcars|Bugs|Bugsy|Butterfingers|Candles|Coins|Cold Finger|Crackers|Cranky|Creaky|Cue Ball|Cuts|Dasher|Devious|Dice|Digger|Droopy|Eyes|Fangs|Fast Trigger|Flames|Flowers|Foot Long|Framed|Freckles|Free Style|Frosty|Goldie|Greasy Thumb|Great White|Ha-Ha|Half Full|Happy|Hell Raiser|Holy Smoke|Hot Shot|Icepick|Itchy|Jezebel|Kid Blast|Kid Twist|King Kool|Knots|Knuckles|Ladykiller|Lefty|Long Hair|Looney|Lucky|Machine Gun|Maniac|Matches|Midnight|Moneybags|Needles|Nitro|Numbers|Old Creepy|One Arm|Patch-Eye|Payola|Peanuts|Pee Wee|Pinky|Popcorn|Pork \'n Beans|Roadkill|Roulette|Scarface|Scars|Scumbag|Seven Clip|Shades|Shady Eyes|Shaggy|Sharp Edge|Sharpie|Shiny|Shocker|Short Stack|Side Step|Silver Dollar|Skidmarks|Slingshot|Sluggo|Smiley|Smokey|Sneakers|Spanky|Sparkey|Spinner|Squeaky|Squinty|Sticks|Sticky Fingers|Stonewall|Tick Tock|Toothless|Trails|Twinkle Cakes|Two Guns|Two Holes|Wheels|Wild Child}" ({given} {family})'
        ]
    };
    
    var typeKeys = ion.keys(types);
    
    function rankPatrol(service, gang) {
        var prof = db.find(service);
        gang.members.forEach(function(member) {
            member.traits.Military = 0.5; // member.traits.Government
            prof.assignRank(member);
            member.traits.Military = 1; // member.traits.Government
        });
        // By luck, this may still produce a private and not someone of higher military rank.
        var last = ion.last(gang.members), lowRank = gang.members[0].honorific;
        last.traits.Military = 4;
        do {
            prof.assignRank(last);
        } while (last.honorific === lowRank);
        
    }
    function isFoodOrPersonal(item, count) {
        return item.is('food') || item.is('kit:personal');
    }
    function getNicks(c) {
        return nicknames[(ion.test(80)) ? "both" : c.male ? "male" : "female"];
    }
    
    /**
     * Get the list of types that can be used when creating a gang.
     * 
     *     atomic.getGangTypes()
     *     => ["Biker Gang", ... "Marine Patrol"]
     *     
     * @static
     * @method getGangTypes
     * @for atomic
     * 
     * @return {Array} The types of gangs. One of these values is a valid type for 
     *      `atomic.createGang()`
     */
    atomic.getGangTypes = function() {
        return typeKeys.sort();
    };
    
    /**
     * @static
     * @method assignNickname
     * @for atomic
     * 
     * @param character {ion.models.Character} the character to assign a nickname 
     *      to. Nickname is assigned to the character's name.
     * @return {String} the nick name
     */
    atomic.assignNickname = function(character) {
        var nicks = getNicks(character);
        character.name.nickname = ion.format(ion.random(ion.random(nicks)), character.name);
        return character.name.nickame;
    };
    
    /** 
     * Generate a gang (a group of people who are likely to be hostile to the players, and often 
     * returned as part of encounter creation). 
     * 
     *     atomic.createGang({type: 'Scavenger Party', count: 6});
     *     => gang
     *     gang.members.length
     *     => 6
     *     
     * @static
     * @method createGang
     * @for atomic
     *
     * @param [params] {Object} params
     *     @param [params.type] {String} the type of gang. This encapsulates the number, traits, 
     *      and other information about the gang. 
     *     @param [params.count] {Number} the number of members in the gang. If no number is supplied, 
     *      a type-specific default will be used
     * @return {ion.models.Gang} the gang generated      
     */
    atomic.createGang = function(params) {
        params = ion.extend({}, params || {});
        
        var gangType = params.type || ion.random(typeKeys),
            gangSpec = types[gangType]; 
        
        if (ion.isUndefined(gangSpec)) {
            throw new Error("Invalid gang type: " + gangType);
        }
        
        var count = ion.isNumber(params.count) ? params.count : ion.roll(gangSpec.count);
        var opts = {
            kind: gangType,
        };
        if (gangSpec.names) { // TODO: Calling random twice is... odd. And you do it below, too
            opts.name = ion.random(ion.random(gangSpec.names));
        }
        var gang = new Gang(opts);
        
        ion.times(count, function() {
            var c = atomic.createCharacter({
                "profession": ion.select(gangSpec.prof), 
                "traits": gangSpec.traits || {}
            });
            c.initiative = ion.roll("2d6") + c.trait('Agile');
            c.hp = 10 + c.trait('Tough');

            if (ion.test(gangSpec.nicks)) {
                var nicks = getNicks(c);
                c.name.nickname = ion.format(ion.random(ion.random(nicks)), c.name);
            }
            // Remove food and personal items, because, it's dumb when gangs are carrying Twinkle Cakes.
            c.inventory.filter(isFoodOrPersonal);
            gang.add(c);
        });
        if (gangSpec.mil && gang.members.length) {
            rankPatrol(gangSpec.mil, gang);
        }
        gang.members.sort(function(a,b) {
            return a.initiative < b.initiative ? 1 : a.initiative > b.initiative ? -1 : 0;
        });
        return gang;
    };
})(atomic, ion, ion.profDb, ion.models.Gang);

(function(atomic, ion) {

    // This needs to be stubbed-out because encounters depend on location and I want to pull that 
    // out of the metadata, and there's a lot of metadata. I think this could come out of kibble. 
    
    /**
     * Create a location. You can probably specify several levels down the hierarchy, and get 
     * back a full location at and under that level of the hierarchy. So if you say "ruins", 
     * be prepared for a description of an entire city! For now, we're concerned with the 
     * top-level of the hierarchy for encounters.
     */
    atomic.createLocation = function() {
        throw new Error("Not implemented");
    };
    
    atomic.getRootLocations = function() {
        throw new Error("Not implemented");
        // TODO: Some of these are too cryptic to just be tags and be usable, like 'infrastructure'
        /*
        return ["agricultural","extractive","industrial","infrastructure","military","natural",
                "rail","research","road","ruins","rural","settlement","tourism"];
        */
    };

})(atomic, ion);
(function(atomic, ion) {
    
    // TODO: What are the stats for an encounter?
    // TODO: What encounters occur in what general areas? How often?
    // TODO: Any other factor in determining whether an encounter occurs?
    // TODO: Random encounters are different than an encounter generator itself.

    // - name
    // - attacks[name, damage, effect]
    // - traits (Agile, Stealth, Strong, Tough), but also Armor, INI, HP
    // - initiative, armor, HP (are these traits? They are on a different scale)
    
    // Attack: "Sting +1 for 3+2F and Poison" , value = 3, maybe 4 with poison.
    
    // Killer Bee: Sting +1 for 3+2F, Agile 2, Armor 2, INI 10, HP 6, poisonous.
    // 4 Giant Ants: Bite -1 for 4+3F, Armor 5, INI 14, HP 8.
    // Or, one or more people with weapons.
    /*
    function combatPoints(character) {
        var sum = 10; // hp
        atomic.combatantTraits.forEach(function(attr) {
            sum += this.trait(attr);
        }, character);
        return sum;
    }*/
    
    /**
     * Create an encounter
     * 
     * @static
     * @for atomic
     * @method createEncounter
     * @return {ion.models.Gang} always a gang, for now
     */
    atomic.createEncounter = function() {
        return atomic.createGang();
    };

    /**
     * 
     * Get the list of traits that are counted when assessing the combat ability of a 
     * character or creature.
     * 
     * @static
     * @for atomic
     * @method getCombatTraits
     * 
     * @return {Array} array of trait names
     * 
     */
    atomic.getCombatTraits = function() {
        return ["Agile", "Archery", "Athletics", "Cunning", "Driving", "Explosives", 
           "Firearms", "Horseback Riding", "Intimidate", "Medicine", "Melee Weapons", 
           "Military", "Motorcycling", "Stealth", "Strong", "Tough", "Tracking", 
           "Trucking", "Unarmed Combat"];
    };
    
})(atomic, ion);
(function(atomic, ion, RarityTable) {

    function regionByLocation(location) {
        return ion.select( (location === "River" && ion.test(100)) ? water_regional : regional );
    }
    function getName() {
        // I think using the first name may be stupid.
        var name = atomic.createCharacterName();
        return (ion.test(10)) ? name.given : name.family;
    }
    
    // Woods, Forest, are not part of this terrain at all.
    var locative = {
        'Depression': ["Alley", "Arroyo", "Canyon", "Creek", "Gap", "Gulch", "Gully", "Hollow", "Valley"],
        'Flat': ["Flat{|s}", "Prairie", "Meadow{|s}", "Field", "Range", "Plain"],
        'Elevation': ["Bluffs", "Cliff", "Mountain", "Point", "Pass", "Spur", "Ridge", "Butte", "Mesa", "Gap", "Rock", "Hill{|s}", "Summit"],
        'Water': ["Spring{|s}", "Lake", "Pond", "Bar", "Basin", "Creek", "River", "Reservoir", "Rapids", "Stream", "Wetlands", "Falls", "Dam"],
        'Junction': ["Bend", "Junction", "Crossing"]
    },

    descriptive = [ "Adobe", "Antelope", "Ash", "Badger", "Bald", "Battle", "Bear", "Beaver", "Big", "Biscuit",
            "Black", "Blue", "Buck", "{|Big }Oak", "Big Horn", "Bison", "Black", "Bobcat", "Bottom Dollar", "Boulder",
            "Brown", "Brush", "Buffalo", "Bull", "Buzzard's", "Calamity", "Cedar", "Chief", "Cinder", "Clay", "Copper",
            "Cornstalk", "Cotton{|wood}", "Cougar", "Coyote", "Crescent", "Crooked", "Crow", "Deadwood", "Deer",
            "{Bad|Black|Dead|Mad} Dog", "Dream", "Dry", "Eagle", "Elk", "Eureka", "Fox", "Frog", "Gold", "Gold Dust",
            "Goose", "Gopher", "Granite", "Green", "Grinders", "Grouse", "Gypsum", "Hawk", "{Dead|Lame|Happy} Horse",
            "Horseshoe", "Indian", "Iron", "Juniper", "Last Chance", "Limestone", "Little Sheep", "Long", "Lost",
            "{Dead|Blind} Man's", "Mule", "{Big |Little |}Pine{| Flat}", "Prairie Dog", "Rattlesnake", "Red",
            "{Big|Black|Broken|Red} Rock", "Rocky", "Round", "Sage", "Sawmill", "Shady", "Sheep", "Silver", "Skeleton",
            "Slaughter", "Stone", "Tungsten", "Willow", "Wolf", "Young" ],

    real = [ "Alfalfa", "Arrowhead", "Arrowtail", "Big Curve", "{Big|Little} Elk", "Buckeye", "Buzzard's Roost",
            "Casa Diablo", "Deadwood", "Faraday", "Harmony", "Hidden Valley", "Indian Meadows", "Irondale",
            "Leadville", "Palo Verde", "Pea Vine", "Point Blank", "Red-Eye", "Sunshine", "Tanglefoot", "Utopia" ],

    regional = ["North","South","East","West","Old","Little"],
    
    water_regional = "{North|South|East|West} Fork of the",
    
    patterns = new RarityTable(ion.identity, false);
    
    patterns.add('rare', function(type) {
        // East Pond
        return ion.format("{0} {1}", ion.select(regional), ion.select(locative[type]));
    });
    patterns.add('rare', function(type) {
        // West Anderson Junction
        return ion.format("{0} {1} {2}", 
            regionByLocation(location), 
            getName(), 
            ion.select(locative[type]));
    });
    patterns.add('rare', function(type) {
        // West Bison Lake
        return ion.format("{0} {1} {2}", 
            regionByLocation(location), 
            ion.select(descriptive), 
            ion.select(locative[type]));
    });
    patterns.add('rare', function(type) {
        // Ford Trail Pond
        var name = (ion.test(50)) ? ion.select(descriptive) : getName();
        return ion.format("{0} Trail {1}", name, ion.select(locative[type]));
    });
    patterns.add('rare', function(type) {
        // Alfalfa
        return ion.select(real);
    });
    patterns.add('common', function(type) {
        // Red Hollow
        return ion.format("{0} {1}", ion.select(descriptive), ion.select(locative[type]));
    });
    patterns.add('common', function(type) {
        // Williams Crossing
        var name = getName();
        return ion.format("{0} {1}", name, ion.select(locative[type]));
    });
    
    var landforms = ion.keys(locative);
    
    /** 
     * Generate a random place name.
     * 
     *     atomic.createPlaceName("Water");
     *     => "West Rock Springs"
     *     
     * @static
     * @method createPlaceName
     * @for atomic
     * 
     * @param type {String} landform type (see `atomic.getLandformTypes()`)
     * @return {String} name
     */
    atomic.createPlaceName = function(type) {
        type = (landforms.indexOf(type) === -1) ? ion.select(landforms) : type;
        return ion.random(ion.select(patterns.get()(type)));
    };
    
    /**
     * The valid types that can be used when calling the `atomic.createPlaceName()` method.
     * 
     * @static
     * @method getLandformTypes
     * @for atomic
     * 
     * @return {Array} an array of landform types 
     */
    atomic.getLandformTypes = function() {
        return landforms;
    };
})(atomic, ion, ion.tables.RarityTable);

(function(atomic, ion, Weather) {
    
    // From: http://biology.fullerton.edu/dsc/school/climate.html
    // Which is enough to fake it, I think.
    
    // Cloud type classifications
    // http://www.crh.noaa.gov/lmk/?n=cloud_classification

    // Mean monthly temperatures, high and low. r = rainfall, t = thunderstorms
    // 0 - nothing
    // 1 - rain
    // 2 - thunderstorms

    averages = [
        {lo: 34, hi: 61,  mn: 48, rain: 1}, // Jan
        {lo: 40, hi: 69,  mn: 54, rain: 1},
        {lo: 46, hi: 74,  mn: 60, rain: 1}, // Mar
        {lo: 53, hi: 83,  mn: 68, rain: 1},
        {lo: 61, hi: 93,  mn: 77, rain: 0}, // May
        {lo: 70, hi: 103, mn: 86, rain: 0},
        {lo: 77, hi: 109, mn: 93, rain: 2}, // Jul
        {lo: 75, hi: 107, mn: 92, rain: 2},
        {lo: 68, hi: 100, mn: 84, rain: 2}, // Sep
        {lo: 55, hi: 87,  mn: 71, rain: 0},
        {lo: 43, hi: 73,  mn: 57, rain: 1}, // Nov
        {lo: 34, hi: 62,  mn: 48, rain: 1}
    ];
    months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

    /**
     * Weather generator. The weather is based on the Mojave desert so it is hot, sunny and pretty 
     * monotonous.
     *  
     * @static
     * @method createWeather
     * @for atomic
     * 
     * @param month {String} Three-letter abbreviation for the month of the year (Jan-Dec) 
     * for which weather is being generated.
     * 
     * @return {ion.models.Weather} An object describing the weather forecast.
     */
    atomic.createWeather = function(month) {
        var index = ion.isUndefined(month) ? new Date().getMonth() : months.indexOf(month.toLowerCase()),
            monthly = averages[index],
            weather = new Weather({
                low: (monthly.lo + ion.roll("1d10-5")),
                high: (monthly.hi + ion.roll("1d10-5")),
                rain: "clear skies"
            });

        if (monthly.rain === 0 && ion.test(8)) {
            weather.rain = ion.select(["cloudy skies", "high clouds"]);
        } else if (monthly.rain === 1 && ion.test(10)) {
            weather.rain = ion.select(["light rain", "strong winds"]);
        } else if (monthly.rain === 2 && ion.test(10)) {
            weather.rain = "thunderstorms";
        }
        return weather;
    };

})(atomic, ion, ion.models.Weather);

(function(atomic, ion, Table) {

    var e1 = "{Alpha|American|North American|National|General|Universal|International|Consolidated|Central|Western|Eastern|Union}",
        e2 = "{Micro|Radiation|Nuclear|Atomic|Radium|Uranium|Plutonium|Development|X-Ray|Gamma Ray}",
        e3 = "{Engineering|Research|Scientific|Electronics|Instruments|Devices}",
        e4 = "{Laboratory|Laboratories|Corporation|Supply Company|Company|Foundation|Inc.}",
        
        e5 = [ "Raytomic", "Detectron", "Gamma-O-Meter", "Librascope", "Micromatic", "Micro Devices", 
               "Micro Specialties", "Radiaphone", "Radiometric", "Ra-Tektor", "Nucleonics", "Scintillonics", "Tracerlab" ];
    
    var table1 = new Table(ion.transform);
    table1.add(70, function() {
        return ion.random(e1) + " " + ion.random(e2);
    });
    table1.add(15, function() {
        return atomic.createCharacterName({race: "anglo"}).family + " " + ion.random(e2);
    });
    table1.add(15, function() {
        return atomic.createCharacterName({race: "anglo"}).family;
    });
    
    var table2 = new Table(ion.transform);
    
    table2.add(25, function() {
        return " " + ion.random(e3);
    });
    table2.add(25, function() {
        return " " + ion.random(e4);
    });
    table2.add(50, function() {
        return " " + ion.random(e3) + " " + ion.random(e4);
    });
    
    function createName() {
        if (ion.test(90)) {
            return table1.get() + table2.get();    
        } else {
            return ion.random(e5) + " " + ion.random(e4);
        }
    }
    
    /**
     * Creates your typical cold-war sinister mega-corporation name.
     * 
     * @static
     * @for atomic
     * @method createCorporateName
     * 
     * @return {String} company name
     */
    atomic.createCorporateName = function() {
        var name = createName();
        while(name.split(" ").length > 4) {
            console.log("Too long", name);
            name = createName();
        }
        return name;
    };

})(atomic, ion, ion.tables.Table);

(function(atomic, ion, Store, Table, Name) {
     
    /* Merchant types (should be merchant, not shop/store):
     * 
     * bar/tavern/saloon
     * diner
     * food market
     * bathhouse
     * bookstore
     * stables
     * repair shop (electrical items)
     * repair shop (mechanical items)
     * general store
     * pawn shop
     * butcher
     * gunsmith
     * locksmith/blacksmith
     * barbor
     * tattoo parlor
     * brewery/distillery/vineyard
     * liquor store
     * baker
     * icehouse
     * feed store
     * livestock
     * leather store (leatherworker)
     * glassware
     * pottery
     * weaving
     * clothing store
     * furniture/woodworking
     *  - sporting goods store (ammo, camping)
     * biker shop/head shop
     * five and dime store/souvenir shop/drugstore
     * 
     * OLD (pre-war, would these be included?)
     * robot showroom
     * automobile showroom
     * office
     * 
     * Name:
     * - this is always the fun part. Really these are like naming strategies?
     *      Forty-Rod, Tarantula Juice, Taos Lightning, and Coffin Varnish
     *      Saloons: Bull's Head, Holy Moses
     *      
     * Owner:
     * ["gang", "Biker Gang"] or
     * ["character", {profession: "trader", traits: {"pottery":4}] - also include relationships
     * etc.
     * 
     * Frequency:
     * - C/U/R, a very blunt instrument but it's been OK so far
     *      size, frequency and location are interrelated somehow
     * 
     * Location:
     * - roadside, camp, settlement, military, market (open air, e.g. fairgrounds)
     * 
     * Size (allowable sizes for a type, each with a different inventory and different name):
     * 
     * - vendor (single person with like a blanket on the ground)
     * - cart (cart, table, stand, stall)
     * - building (tent, cabin, building)
     * - warehouse (warehouse, depot, building)
     * 
     * Sells: description of what is sold. Not everything that is sold is useful or in the 
     *  inventory that would be generated, if any. e.g. "pottery cart (pots 2 TU each)".
     *   
     * Buys: anything interesting about what the establishment will buy or trade for, and 
     * at what price
     * 
     * Inventory: actually useful stuff for sale with trade units, a bag spec, e.g.
     * {totalValue: <sizeBased>, query: "food | ammo", fillBag: false} - always false.
     * 
     * TESTS
     *  - can't submit "Cash On Hand" as a type.
     *  - can submit another type.
     */
    /*
    var kinds = {
        settlement: ["General Store", "Shop", "Store", "Market", "Mercantile", "Trading Post"]
    };
    */
    
    // The size of the shop matters here. For small shops, you might just use the 
    // merchant's first name. And the kind name would no longer be random like this.
    var nameStrategies = new Table();
    nameStrategies.add(50, function(ownerName, placeName, nameString) {
        return placeName + " " + ion.random(nameString);
    });
    nameStrategies.add(25, function(ownerName, placeName, nameString) { // possessive
        var p = (/[sz]$/.test(ownerName)) ? "'" : "'s";
        return ownerName + p + " " + ion.random(nameString); 
    });
    nameStrategies.add(25, function(ownerName, placeName, nameString) {
        var biz = ion.random(nameString);
        //while (biz === "Shop")  { biz = ion.random(nameString); }
        return ownerName + " " + biz; 
    });
    
    var ownerStrategies = new Table();
    ownerStrategies.add(20, function(config) {
        return atomic.createRelationship(config);
    });
    ownerStrategies.add(65, function(config) {
        var c = atomic.createCharacter(config);
        c.name = atomic.createCharacterName({family: c.name.family, gender: c.gender});
        return c;
    });
    ownerStrategies.add(15, function(config) {
        var c = atomic.createCharacter(config);
        c.name = atomic.createCharacterName({family: c.name.family, gender: c.gender});
        atomic.assignNickname(c);
        return c;
    });
    
    
    /**
     * Create a merchant. Note that there are many parameter options, some mutually 
     * exclusive. You would only pass in an owner's name or the owner character, not both, 
     * for example. Passing in a place name does not guarantee it will be used in the store 
     * name, but if you pass in the store name, it'll be used as is. And so forth.
     * 
     * @static
     * @method createStore
     * @for atomic
     * 
     * @param [params] {Object}
     *     @param [params.name] {String} name of the store
     *     @param [params.placeName] {String} place name where the store is located
     *     @param [params.owner] {ion.models.Character} the store owner
     *     @param [params.value] {Number} value of the store's inventory in trade units
     *     @param [params.tags] {String} tag query for a store type, e.g. "roadside" 
     *          or "settlement" or "stall" 
     *     
     * @return {ion.models.Store} the store
     */
    atomic.createStore = function(params) {
        params = ion.extend({}, params || {});
        params.tags = params.tags || "*";
        
        // Still don't quite have the name/size of store thing down.
        var config = ion.storeDb.find(ion.toTag(params.tags));
        var owner = params.owner;
        if (!owner) {
            if (atomic.getGangTypes().indexOf(config.owner.profession) > -1) { // it's a gang
                owner = atomic.createGang({type: config.owner.profession});
            } else { // it's a character or relationship.
                owner = ownerStrategies.get()(config.owner);
            }
        }
        var ownerName;
        if (owner.name) {
            ownerName = owner.name;
        } else if (owner.kind) {
            ownerName = owner.kind;
        } else if (owner.older) {
            ownerName = owner.older.name.family;
        } else {
            throw new Error("Could not determine an owner name for this type", config);
        }
        
        var name = params.name;
        if (!name) {
            var placeName = params.placeName || atomic.createPlaceName();
            name = nameStrategies.get()(ownerName, placeName, ion.select(config.names));
        }
        var inventory;
        if (config.inventory) {
            if (config.inventory.cluster === "none") {
                inventory = atomic.createBag(config.inventory);
            } else {
                inventory = atomic.createStockpile(config.inventory);
            }
        } else {
            inventory = new ion.models.Bag();
        }
        var onhand = atomic.createContainer("Cash On Hand");

        return new Store({
            name: name,
            policy: config.policy ? ion.random(config.policy) : null,
            owner: owner,
            onhand: onhand,
            inventory: inventory
        });
    };

})(atomic, ion, ion.models.Store, ion.tables.Table, ion.models.Name);
(function(atomic, ion, db, Family, RarityTable) {

    // This creates pretty normal families. As always, the generators are for on-the-spot
    // filler material, and aim for believability. Make up the more unusual families in 
    // your world.
    
    var innate = db.find('innate');
    
    var relationships = {
        grandmother: {g: "female", a: 0, r: ["grandson", "granddaughter"], n: 25},
        grandfather: {g: "male", a: 0, r: ["grandson", "granddaughter"], n: 25},
        aunt: {g: "female", a: 1, r: ["niece", "nephew"], n: 50},
        uncle: {g: "male", a: 1, r: ["niece", "nephew"], n: 50},
        mother: {g: "female", a: 1, r: ["son", "daughter"], n: 80},
        father: {g: "male", a: 1, r: ["son", "daughter"], n: 100}, 
        brother: {g: "male", a: 2, r: ["sister","brother"], n: 100},
        sister: {g: "female", a: 2, r: ["sister", "brother"], n: 100},
        cousin: {g: null, a: 2, r: ["cousin"], n: 25},
        niece: {g: "female", a: 2, r: ["aunt", "uncle"]},
        nephew: {g: "male", a: 2, r: ["aunt", "uncle"]},
        son: {g: "male", a: 2, r: ["mother", "father"]},
        daughter: {g: "female", a: 2, r: ["mother", "father"]},
        grandson: {g: "male", a: 2, r: ["grandmother", "grandfather"]},
        granddaughter: {g: "female", a: 2, r: ["grandmother", "grandfather"]}
    };
    var relNames = [];
    for (var prop in relationships) {
        relationships[prop].name = prop;
        relNames.push(ion.titleCase(prop));
    }
    // You only have to put the older terms in this table because if you're using
    // it, you're randomizing, and the younger will be selected from the older
    var rtable = new RarityTable()
        .add("common", relationships.mother)
        .add("common", relationships.father)
        .add("common", relationships.brother)
        .add("common", relationships.sister)
        .add("uncommon", relationships.aunt)
        .add("uncommon", relationships.uncle)
        .add("uncommon", relationships.cousin)
        .add("rare", relationships.grandmother)
        .add("rare", relationships.grandfather);
    
    function getAdultAge() {
        return 18 + ion.nonNegativeGaussian(7);
    }
    
    function makeFamily(parent, kin) {
        var gender = (parent.male) ? "female" : "male";
        var race = atomic.createRace();
        var other = new ion.models.Character({
            "name": atomic.createCharacterName({gender: gender, race: race}),
            "race": race,
            "profession": getRelatedProfession(kin[0].profession),
            "gender": gender,
            "age": ion.bounded(parent.age+ion.gaussian(3), 18)
        });
        kin.push(other);
        var family = new Family({
            "parent": parent,
            "other": other,
            "relationship": "couple"
        });
        // must be deleted later from all chars, or cannot be turned into JSON and persisted
        parent.family = other.family = family; 

        if (ion.test(80)) {
            family.relationship = "married";
            if (ion.test(90)) { // if married, will share the same last name most of the time.
                family.female.name.family = family.male.name.family;
            }
        }
        return family;
    }
    
    function getChildCount() {
        return ion.nonNegativeGaussian(2.5, 1) || getChildCount();
    }
    
    function makeChildren(family, kin) {
        var childCount = getChildCount();
        if (family.female.age < 40) {
            for (var i=0; i < childCount; i++) {
                makeChild(family, kin);
            }
            // Delay *after* the last child is born.
            var years = ion.nonNegativeGaussian(4,1);
            ageKin(kin, years);
        }
    }

    function makeChild(family, kin) {
        var gender = ion.random(["male","female"]);
        var child = new ion.models.Character({
            "name": atomic.createCharacterName({gender: gender, "race": family.female.race}),
            "race": family.female.race,
            "gender": gender,
            "age": ion.roll("1d3")
        });
        kin.push(child);
        child.name.family = family.male.name.family;
        // This is a gap in the ages of the family.
        ageKin(kin, child.age + ion.roll("1d3-1"));
        family.children.push(child);
        child.family = family;
    }
    
    function ageFamilyUntilChildIsAdult(family, kin) {
        var child = ion.random(family.children);
        if (!child) {
            throw new Error("No child in this family");
        }
        var adultAge = getAdultAge();
        if (child.age >= adultAge) {
            return child;
        }
        ageKin(kin, adultAge - child.age);
        return child;
    }
    
    function ageKin(kin, age) {
        kin.forEach(function(person) {
            person.age += age;
        });
    }
    
    function getRelatedProfession(profession) {
        if (!profession) {
            throw new Error("There should alwasy be a related profession");
        }
        var prestige = ion.intersection(["high","low","normal"], db.find(ion.toTag(profession)).tags);
        return (ion.test(40)) ? profession : db.find(prestige + " -pre -innate").names[0];
    }

    function postProcess(kin) {
        kin.forEach(function(person) {
            // train
            var c = atomic.createCharacter({
                "name": person.name,
                "profession": person.profession || getRelatedProfession(kin[0].profession),
                "age": person.age, 
                "gender": person.gender,
                "equip": false
            });
            ion.extend(person, c);

            // deaths
            var family = person.family;
            delete person.family;
            
            if (family.isParent(person)) {
                if (ion.test(Math.sqrt(person.age))) {
                    person.status = "absent";
                    family.relationship = (family.relationship === "married") ? "divorced" : "separated";
                } else if (ion.test(Math.sqrt(person.age))) {
                    person.status = "deceased";
                    family.relationship = (family.male === person) ? "widow" : "widower"; 
                }
            } else if (ion.test(Math.sqrt(person.age))) {
                person.status = "deceased";
            }
            if (person.profession) {
                person.inventory = atomic.createKit({profession: person.profession});    
            }
        });
    }
    
    function nextGeneration(family, kin, i, gen) {
        makeChildren(family, kin);
        
        if (i < (gen-1)) {
            var parent = ageFamilyUntilChildIsAdult(family, kin);
            
            // TODO:
            // This *almost* works but the aging of family members proceeds through everyone, 
            // it doesn't branch for kin lines that co-exist in time. Need a different way 
            // to age people.
            parents = [parent]; // maybeFindOtherParents(family, parent);
            parents.forEach(function(p) {
                var newFamily = makeFamily(p, kin);
                family.couples.push(newFamily);
                family.children.splice(family.children.indexOf(p), 1);
                nextGeneration(newFamily, kin, i+1, gen);    
            });
        }            
    }
    
    /*
    function maybeFindOtherParents(family, originParent) {
        return [originParent].concat(family.children.filter(function(child) {
            return ion.test(50) && child.age > 20 && child !== originParent;
        }));
    }
    */
    
    /**
     * Create a nuclear family, with a specified number of generations.  
     * 
     * @static
     * @method createFamily
     * @for atomic
     * 
     * @param [params] {Object} params
     *      @param [params.generations=2] {Number} number of generations in the family (one 
     *          generation is a couple, two generations includes their children, three 
     *          their grand-children, above 3 you're going to get a history lesson). 
     *      @param [params.parent] {Object} the parameters to pass to the first character 
     *          created, that will set the profession, race and name of sub-generations. 
     * @returns {ion.models.Family} a family
     */
    atomic.createFamily = function(opts) {
        opts = opts || {};
        opts.generations = opts.generations || 2;
        opts.parent = opts.parent || {};
        opts.parent.age = (opts.parent.age || getAdultAge());

        var parent = atomic.createCharacter(opts.parent), 
            kin = [parent], 
            family = makeFamily(parent, kin),
            root = family;

        if (opts.generations > 1) {
            nextGeneration(family, kin, 1, opts.generations);
        }
        postProcess(kin);
        return root;
    };
    
    /**
     * Get a list of valid relationships. These are the valid values to pass to the 
     * `atomic.createRelationship()` method. 
     * 
     * @static
     * @method getRelationships
     * @for atomic
     * 
     * @return {Array} a list of relationship names
     */
    atomic.getRelationships = function() {
        return relNames.sort();
    };
   
    /**
     * 
     * Creates a pair of characters who are related to each other. Both characters will be 
     * adults (you an adjust the ages and ignore the adult traits, if needed).
     * 
     * @static
     * @method createRelationship
     * @for atomic
     * 
     * @param [params] {Object} params
     *      @param [params.older] {String} name of the older or lateral relationship (e.g. "aunt" or 
     *          "sister").  The younger or lateral relationship is derived from the older term.
     *      @param [params.profession] {String} the profession for the related people
     *      @param [params.familyName] {String} the last name to share between relations
     *      @param [params.equip] {Boolean} should these characters be equipped?
     */
    atomic.createRelationship = function(params) {
        params = ion.extend({}, params || {});
        params.equip = ion.isBoolean(params.equip) ? params.equip : true;
        var olderRel = (params.older) ? relationships[params.older.toLowerCase()] : rtable.get();
        var youngerRel = relationships[ ion.random(olderRel.r) ];
        
        // Order the terms:
        var youngerAge, olderAge,
            ageDiff = Math.abs(olderRel.a - youngerRel.a);
        
        do {
            youngerAge = getAdultAge();
            olderAge = getAdultAge();
            for (var i=0; i < ageDiff; i++) {
                olderAge += getAdultAge();
            }
        } while(ageDiff > 0 && olderAge-youngerAge < (18*ageDiff));
        
        var older = atomic.createCharacter({
                age: olderAge, 
                gender: olderRel.g, 
                profession: params.profession,
                equip: params.equip
            }),
            younger = atomic.createCharacter({
                age: youngerAge, 
                race: ion.test(olderRel.n) ? older.race : atomic.createRace(),
                gender: youngerRel.g, 
                profession: params.profession,
                equip: params.equip
            }),
            relName = (olderRel === youngerRel) ? (olderRel.name + "s") : (olderRel.name+" and "+youngerRel.name);
            
        if (params.familyName) {
            older.name.family = params.familyName;    
        }    
        if (ion.test(olderRel.n)) {
            younger.name.family = older.name.family;
        }
        return new ion.models.Relationship(older, younger, relName);
    };
    
})(atomic, ion, ion.profDb, ion.models.Family, ion.tables.RarityTable);

(function() {
    
    var MORE = " More&hellip;";
    var LESS = " Less&hellip;";
    
    function clickHandler(more) {
        return function(e) {
            var alt = (more.style.display === "none") ? "block" : "none";
            more.style.display = alt;
            e.target.innerHTML = (alt === "block") ? LESS : MORE;
        };       
    }
    
    window.updateMoreLinks = function() {
        var mores = document.querySelectorAll(".more");
        for (var i=0; i < mores.length; i++) {
            var more = mores[i];
            more.style.display = 'none'; 
            if (more.__processed) { continue; }

            var a = document.createElement("a");
            a.innerHTML = MORE;
            a.addEventListener("click", clickHandler(more));
            
            var previous = more.previousElementSibling;
            previous.appendChild(a);
        }
    };
    
})();
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
        return ["Any", "Soldier"].concat(_.without(atomic.getProfessions(), "Air Force","Marine","Army","Navy","Coast Guard")).sort(); 
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
                
                updateMoreLinks();
                
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
            this.places = ['Any'].concat(atomic.getPlaces());
            this.selectedPlace = 'Any';
            this.professions = getSimplerProfs();
            this.selectedProfession = 'Any';
            this.totalValue = 20;
            ko.track(this, ['places','selectedPlace','professions','selectedProfession','totalValue']);
        },
        onChange: function(view, event) {
            // You don't get meaningful results unless only one of these is set.
            var coll = event.target.name;
            ["selectedPlace","selectedProfession"].forEach(function(prop) {
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
            var opts = {tags: [], totalValue: parseInt(this.totalValue,10)};
            if (this.selectedPlace !== "Any") {
                opts.tags.push(this.selectedPlace.toLowerCase());
            } else if (this.selectedProfession !== "Any") {
                opts.tags.push("kit:"+ion.toTag(this.selectedProfession));    
            }
            return atomic.createBag(opts);
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
            return atomic.createContainer(type);
        }
    });
    var StoreBuilderViewModel = _.define(BaseBuilder, {
        init: function() {
            BaseBuilder.call(this, 'store');
            this.locations = ['Any'].concat(atomic.getLocations());
            this.selectedLocation = 'Any';
            ko.track(this, ['locations','selectedLocation']);
        },
        makeCall: function() {
            var opts = {};
            if (this.selectedLocation !== 'Any') {
                opts.tags = this.selectedLocation;
            }
            return atomic.createStore(opts);
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
            return atomic.createPlaceName(this.selectedGeography);
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
