/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, JSON */

/** 
 * @class easyXDM.DomHelper
 * Contains methods for dealing with the DOM
 * @singleton
 */
easyXDM.DomHelper = {
	
    /**
     * Creates a frame and appends it to the DOM.
     * @param {String} url The url the frame should be set to
     * @param {DOMElement} container Its parent element (Optional)
     * @param {Function} onLoad A method that should be called with the frames contentWindow as argument when the frame is fully loaded. (Optional)
     * @param {String} name The id/name the frame should get (Optional)
     * @return The frames DOMElement
     * @type DOMElement
     */
    createFrame: function(url, container, onLoad, name){
        // #ifdef debug
        easyXDM.Debug.trace("creating frame pointing to " + url);
        // #endif
        var frame;
        function loadFn(){
            onLoad(frame.contentWindow);
        }
        if (name && window.attachEvent) {
            // Internet Explorer does not support setting the 
            // name om DOMElements created in Javascript.
            // A workaround is to insert HTML and have the browser parse
            // and instantiate the element.
            var span = document.createElement("span");
            document.body.appendChild(span);
            if (container) {
                span.innerHTML = '<iframe src="' + url + '" id="' + name + '" name="' + name + '"></iframe>';
                frame = span.firstChild;
                container.appendChild(frame);
                document.body.removeChild(span);
            }
            else {
                span.innerHTML = '<iframe style="position:absolute;left:-2000px;" src="' + url + '" id="' + name + '" name="' + name + '"></iframe>';
                frame = span.firstChild;
            }
            
            if (onLoad) {
                frame.loadFn = loadFn;
                this.on(frame, "load", loadFn);
            }
        }
        else {
            frame = document.createElement("IFRAME");
            frame.src = url;
            if (onLoad) {
                frame.loadFn = loadFn;
                this.on(frame, "load", loadFn);
            }
            if (container) {
                container.appendChild(frame);
            }
            else {
                frame.style.position = "absolute";
                frame.style.left = "-2000px";
                document.body.appendChild(frame);
            }
        }
        if (name) {
            frame.id = frame.name = name;
        }
        return frame;
    },
	
    /**
     * Provides a consistent interface for adding eventhandlers
     * @param {Object} target The target to add the event to
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    on: function(target, type, listener, useCapture){
        // Uses memoizing to cache the implementation
        if (window.addEventListener) {
            /**
             * Set on to use the DOM level 2 on
             * https://developer.mozilla.org/en/DOM/element.on
             * @ignore
             * @param {Object} target
             * @param {String} type
             * @param {Function} listener
             */
            easyXDM.DomHelper.on = function(target, type, listener){
                // #ifdef debug
                easyXDM.Debug.trace("adding listener " + type);
                // #endif
                target.addEventListener(type, listener, false);
            };
        }
        else {
            /**
             * Set on to a wrapper around the IE spesific attachEvent
             * http://msdn.microsoft.com/en-us/library/ms536343%28VS.85%29.aspx
             * @ignore
             * @param {Object} object
             * @param {String} sEvent
             * @param {Function} fpNotify
             */
            easyXDM.DomHelper.on = function(object, sEvent, fpNotify){
                // #ifdef debug
                easyXDM.Debug.trace("adding listener " + sEvent);
                // #endif
                object.attachEvent("on" + sEvent, fpNotify);
            };
        }
        easyXDM.DomHelper.on(target, type, listener);
    },
	
    /**
     * Provides a consistent interface for removing eventhandlers
     * @param {Object} target The target to remove the event from
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    un: function(target, type, listener, useCapture){
        // Uses memoizing to cache the implementation
        var un;
        if (window.removeEventListener) {
            /**
             * Set un to use the DOM level 2 un
             * https://developer.mozilla.org/en/DOM/element.un
             * @ignore
             * @param {Object} target
             * @param {String} type
             * @param {Function} listener
             */
            un = function(target, type, listener, useCapture){
                // #ifdef debug
                easyXDM.Debug.trace("removing listener " + type);
                // #endif
                target.removeEventListener(type, listener, useCapture);
            };
        }
        else {
            /**
             * Set un to a wrapper around the IE spesific detachEvent
             * http://msdn.microsoft.com/en-us/library/ms536411%28VS.85%29.aspx
             * @ignore
             * @param {Object} object
             * @param {String} sEvent
             * @param {Function} fpNotify
             */
            un = function(object, sEvent, fpNotify){
                // #ifdef debug
                easyXDM.Debug.trace("removing listener " + type);
                // #endif
                object.detachEvent("on" + sEvent, fpNotify);
            };
        }
        un(target, type, listener);
        easyXDM.DomHelper.un = un;
    },
	
    /**
     * Checks for the precense of the JSON object.
     * If it is not precent it will use the supplied path to load the JSON2 library.
     * This should be called in the documents head right after the easyXDM script tag.
     * http://json.org/json2.js
     * @param {String} path A valid path to json2.js
     */
    requiresJSON: function(path){
        if (typeof JSON == "undefined" || !JSON) {
            // #ifdef debug
            easyXDM.Debug.log("loading external JSON");
            // #endif
            document.write('<script type="text/javascript" src="' + path + '"></script>');
        }
        // #ifdef debug
        else {
            easyXDM.Debug.log("native JSON found");
        }
        // #endif
    }
};
