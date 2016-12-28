(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils/rb_debughelpers'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils/rb_debughelpers'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.rb_debughelpers);
        global._main = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    if (!window.rb) {
        /**
         * rawblock main object holds classes and util properties and methods to work with rawblock
         * @namespace rb
         */
        window.rb = {};
    }

    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {}

    (function (window, document, _undefined) {
        'use strict';

        /* Begin: global vars end */

        var rb = window.rb;
        var regnameSeparator = /\{-}/g;
        var regSplit = /\s*?,\s*?|\s+?/g;
        var slice = Array.prototype.slice;

        /**
         * The jQuery or dom.js (rb.$) plugin namespace.
         * @external "jQuery.fn"
         * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
         */

        /**
         * Reference to the internally used dom.js or jQuery instance
         * @memberof rb
         */
        if (!rb.$) {
            rb.$ = window.jQuery;
        }

        var $ = rb.$;

        /**
         * Reference to the root element (mostly html element)
         * @memberof rb
         * @type {Element}
         */
        rb.root = document.documentElement;

        /**
         * Reference to the jQueryfied/rb.$ root element
         * @memberof rb
         * @type {jQueryfiedDOMList}
         */
        rb.$root = $(rb.root);

        /**
         * Reference to the jQueryfied/rb.$ window object
         * @memberof rb
         * @type {jQueryfiedDOMList}
         */
        rb.$win = $(window);

        /**
         * Reference to the jQueryfied//rb.$ document object
         * @memberof rb
         * @type {jQueryfiedDOMList}
         */
        rb.$doc = $(document);

        /**
         * Namespace for global template functions. Compiled JavaScript templates should be added to this hash object. (see jst grunt task).
         * @memberof rb
         */
        rb.templates = {};

        rb.statePrefix = 'is-';
        rb.utilPrefix = 'u-';
        rb.jsPrefix = '';
        rb.nameSeparator = '-';
        rb.elementSeparator = '-';
        rb.attrSel = '';

        /* End: global vars end */

        /* Begin: ID/Symbol */
        /**
         * Returns a Symbol or unique String
         * @memberof rb
         * @param {String} description ID or description of the symbol
         * @type {Function}
         * @returns {String|Symbol}
         */
        rb.Symbol = window.Symbol;
        var id = Math.round(Date.now() * Math.random());

        /**
         * Returns a unique id based on Math.random and Date.now().
         * @memberof rb
         * @returns {string}
         */
        rb.getID = function () {
            id += Math.round(Math.random() * 1000);
            return id.toString(36);
        };

        if (!rb.Symbol) {
            rb.Symbol = function (name) {
                name = name || '_';
                return name + rb.getID();
            };
        }

        /* End: ID/Symbol */

        /**
            * Creates a promise with a resolve and a reject method.
            * @returns {Deferred}
            */
        rb.deferred = function () {
            var tmp = {
                isResolved: false,
                isRejected: false,
                isDone: false
            };

            var promise = new Promise(function (resolve, reject) {
                tmp.resolve = function (data) {
                    promise.isResolved = true;
                    promise.isDone = true;
                    return resolve(data);
                };
                tmp.reject = function (data) {
                    promise.isRejected = true;
                    promise.isDone = true;
                    return reject(data);
                };
            });

            Object.assign(promise, tmp);

            return promise;
        };

        /**
         * A jQuery/rb.$ plugin to add or remove state classes.
         * @param state {string}
         * @param [add] {boolean}
         * @returns {jQueryfiedDOMList}
         */
        $.fn.rbToggleState = function (state, add) {
            if (this.length) {
                state = rb.statePrefix + state.replace(regnameSeparator, rb.nameSeparator);
                this[add ? 'addClass' : 'removeClass'](state);
            }
            return this;
        };

        $.fn.rbChangeState = $.fn.rbToggleState;

        /* Begin: getScrollingElement */

        /**
         * @memberof rb
         * @deprecated use `document.scrollingElement` instead
         * @returns {Element} The DOM element that scrolls the viewport (either html or body)
         */
        rb.getScrollingElement = function () {
            return document.scrollingElement;
        };

        /**
            * Alias to `getScrollingElement` can be used to override scrollingElement for project-specific needs.
            * @type function
            * @memberof rb
            */
        rb.getPageScrollingElement = rb.getScrollingElement;

        rb.getScrollingEventObject = function (element) {
            var scrollObj;

            if (!element) {
                element = rb.getPageScrollingElement();
            }

            if (element.matches && element.ownerDocument && element.matches('html, body')) {
                scrollObj = element.ownerDocument.defaultView;
            } else if ('addEventListener' in element) {
                scrollObj = element;
            } else {
                scrollObj = window;
            }
            return scrollObj;
        };
        /* End: getScrollingElement */

        /* Begin: throttle */
        /**
         * Throttles a given function
         * @memberof rb
         * @param {function} fn - The function to be throttled.
         * @param {object} [options] - options for the throttle.
         *  @param {object} options.that=null -  the context in which fn should be called.
         *  @param {boolean} options.write=false -  wether fn is used to write layout.
         *  @param {boolean} options.read=false -  wether fn is used to read layout.
         *  @param {number} options.delay=200 -  the throttle delay.
         *  @param {boolean} options.unthrottle=false -  Wether function should be invoked directly.
         * @returns {function} the throttled function.
         */
        rb.throttle = function (fn, options) {
            var running = void 0,
                that = void 0,
                args = void 0;

            var lastTime = 0;
            var Date = window.Date;

            var _run = function _run() {
                running = false;
                lastTime = Date.now();
                fn.apply(that, args);
            };

            var afterAF = function afterAF() {
                rb.rIC(_run);
            };

            var throttel = function throttel() {
                if (running) {
                    return;
                }

                var delay = options.delay;

                running = true;

                that = options.that || this;
                args = arguments;

                if (options.unthrottle) {
                    _run();
                } else {
                    if (delay && !options.simple) {
                        delay -= Date.now() - lastTime;
                    }
                    if (delay < 0) {
                        delay = 0;
                    }
                    if (!delay && (options.read || options.write)) {
                        getAF();
                    } else {
                        setTimeout(getAF, delay);
                    }
                }
            };

            var getAF = function getAF() {
                rb.rAFQueue(afterAF);
            };

            if (!options) {
                options = {};
            }

            if (!options.delay) {
                options.delay = 200;
            }

            if (options.write) {
                afterAF = _run;
            } else if (!options.read) {
                getAF = _run;
            }

            throttel._rbUnthrotteled = fn;

            return throttel;
        };
        /* End: throttle */

        /* Begin: resize */
        var iWidth, cHeight, installed;
        var docElem = rb.root;

        /**
         *
         * Resize uitility object to listen/unlisten (on/off) for throttled window.resize events.
         * @memberof rb
         * @extends jQuery.Callbacks
         * @property {object} resize
         * @property {Function} resize.on Adds the passed function to listen to the global window.resize
         * @property {Function} resize.off Removes the passed function to unlisten from the global window.resize
         */
        rb.resize = Object.assign(rb.$.Callbacks(), {
            _setup: function _setup() {
                if (!installed) {
                    installed = true;
                    rb.rIC(function () {
                        iWidth = innerWidth;
                        cHeight = docElem.clientHeight;
                    });
                    window.removeEventListener('resize', this._run);
                    window.addEventListener('resize', this._run);
                }
            },
            _teardown: function _teardown() {
                if (installed && !this.has()) {
                    installed = false;
                    window.removeEventListener('resize', this._run);
                }
            },
            on: function on(fn) {
                this.add(fn);
                this._setup();
            },
            off: function off(fn) {
                this.remove(fn);
                this._teardown();
            }
        });

        rb.resize._run = rb.throttle(function () {
            if (iWidth != innerWidth || cHeight != docElem.clientHeight) {
                iWidth = innerWidth;
                cHeight = docElem.clientHeight;

                this.fire();
            }
        }, { that: rb.resize, read: true });

        /* End: resize */

        /* Begin: getCSSNumbers */
        /**
         * Sums up all style values of an element
         * @memberof rb
         * @param element {Element}
         * @param styles {String[]} The names of the style properties (i.e. paddingTop, marginTop)
         * @param onlyPositive {Boolean} Whether only positive numbers should be considered
         * @returns {number} Total of all style values
         * @example
         * var innerWidth = rb.getCSSNumbers(domElement, ['paddingLeft', 'paddingRight', 'width'];
         */
        rb.getCSSNumbers = function (element, styles, onlyPositive) {
            var i, value;
            var numbers = 0;
            var cStyles = rb.getStyles(element);
            if (!Array.isArray(styles)) {
                styles = [styles];
            }

            for (i = 0; i < styles.length; i++) {
                value = $.css(element, styles[i], true, cStyles);

                if (!onlyPositive || value > 0) {
                    numbers += value;
                }
            }

            return numbers;
        };
        /* End: getCSSNumbers */

        /* Begin: memoize */

        /**
         * Simple memoize method
            * @param fn {function}
            * @param [justOne] {boolean}
            * @returns {Function}
            */
        rb.memoize = function (fn, justOne) {
            var cache = {};
            return justOne ? function (argsString) {
                if (argsString in cache) {
                    return cache[argsString];
                }
                cache[argsString] = fn.call(this, argsString);
                return cache[argsString];
            } : function () {
                var args = slice.call(arguments);
                var argsString = args.join(',');
                if (argsString in cache) {
                    return cache[argsString];
                }
                cache[argsString] = fn.apply(this, args);
                return cache[argsString];
            };
        };
        /* End: memoize */

        /* Begin: parseValue */
        rb.parseValue = function () {
            var regNumber = /^-{0,1}\+{0,1}\d+?\.{0,1}\d*?$/;
            /**
             * Parses a String into another type using JSON.parse, if this fails returns the given string
             * @alias rb#parseValue
             * @param {String} attrVal The string to be parsed
             * @returns {String} The parsed string.
             */
            var parseValue = function parseValue(attrVal) {

                if (attrVal == 'true') {
                    attrVal = true;
                } else if (attrVal == 'false') {
                    attrVal = false;
                } else if (attrVal == 'null') {
                    attrVal = null;
                } else if (regNumber.test(attrVal)) {
                    attrVal = parseFloat(attrVal);
                } else if (attrVal.startsWith('{') && attrVal.endsWith('}') || attrVal.startsWith('[') && attrVal.endsWith(']')) {
                    try {
                        attrVal = JSON.parse(attrVal);
                    } catch (e) {
                        //continue
                    }
                }
                return attrVal;
            };
            return parseValue;
        }();
        /* End: parseValue */

        /* Begin: idleCallback */
        rb.rIC = window.requestIdleCallback ? function (fn) {
            return requestIdleCallback(fn, { timeout: 99 });
        } : function (fn) {
            return setTimeout(fn);
        };
        /* End: idleCallback */

        /* Begin: rAF helpers */

        rb.rAFQueue = function () {
            var isInProgress, inProgressStack;
            var fns1 = [];
            var fns2 = [];
            var curFns = fns1;

            var run = function run() {
                inProgressStack = curFns;
                curFns = fns1.length ? fns2 : fns1;

                isInProgress = true;
                while (inProgressStack.length) {
                    inProgressStack.shift()();
                }
                isInProgress = false;
            };

            /**
             * Invokes a function inside a rAF call
             * @memberof rb
             * @alias rb#rAFQueue
             * @param fn {Function} the function that should be invoked
             * @param inProgress {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
             * @param hiddenRaf {boolean} Whether the rAF should also be used if document is hidden.
             */
            return function (fn, inProgress, hiddenRaf) {

                if (inProgress && isInProgress) {
                    fn();
                } else {
                    curFns.push(fn);
                    if (curFns.length == 1) {
                        (hiddenRaf || !document.hidden ? requestAnimationFrame : setTimeout)(run);
                    }
                }
            };
        }();

        /**
         * Generates and returns a new, rAFed version of the passed function, so that the passed function is always called using requestAnimationFrame. Normally all methods/functions, that mutate the DOM/CSSOM, should be wrapped using `rb.rAF` to avoid layout thrashing.
         * @memberof rb
         * @param fn {Function} The function to be rAFed
         * @param options {Object} Options object
         * @param options.that=null {Object} The context in which the function should be invoked. If nothing is passed the context of the wrapper function is used.
         * @param options.queue=false {Object} Whether the fn should be added to an ongoing rAF (i.e.: `false`) or should be queued to the next rAF (i.e.: `true`).
         * @param options.throttle=false {boolean} Whether multiple calls in one frame cycle should be throtteled to one.
         * @returns {Function}
         *
         * @example
         *  class Foo {
        *      constructor(element){
        *          this.element = element;
        *          this.changeLayout = rb.rAF(this.changeLayout);
        *      }
        *
        *      changeLayout(width){
        *          this.element.classList[width > 800 ? 'add' : 'remove']('is-large');
        *      }
        *
        *      measureLayout(){
        *          this.changeLayout(this.element.offsetWidth);
        *      }
        *  }
         */
        rb.rAF = function (fn, options) {
            var running, args, that, inProgress;
            var batchStack = [];
            var run = function run() {
                running = false;
                if (!options.throttle) {
                    while (batchStack.length) {
                        args = batchStack.shift();
                        fn.apply(args[0], args[1]);
                    }
                } else {
                    fn.apply(that, args);
                }
            };
            var rafedFn = function rafedFn() {
                args = arguments;
                that = options.that || this;
                if (!options.throttle) {
                    batchStack.push([that, args]);
                }
                if (!running) {
                    running = true;
                    rb.rAFQueue(run, inProgress);
                }
            };

            if (!options) {
                options = {};
            }

            inProgress = !options.queue;

            if (fn._rbUnrafedFn) {
                rb.log('double rafed', fn);
            }

            rafedFn._rbUnrafedFn = fn;

            return rafedFn;
        };

        /* End: rAF helpers */

        /* Begin: rAFs helper */

        /**
         * Invokes `rb.rAF` on multiple methodNames of on object.
         *
         * @memberof rb
         *
         * @param {Object} obj
         * @param {Object} [options]
         * @param {...String} methodNames
         *
         * @example
         * rb.rAFs(this, {throttle: true}, 'renderList', 'renderCircle');
         */
        rb.rAFs = function (obj) {
            var options;
            var args = slice.call(arguments);

            args.shift();

            if (_typeof(args[0]) == 'object') {
                options = args.shift();
            }

            args.forEach(function (fn) {
                obj[fn] = rb.rAF(obj[fn], options);
            });
        };
        /* End: rAFs helper */

        /* Begin: rbComponent */

        /**
         * A jQuery plugin that returns a component instance by using rb.getComponent.
         * @function external:"jQuery.fn".rbComponent
         * @see rb.getComponent
         * @param [name] {String} The name of the property or method.
         * @param [initialOpts] {Object}
         *
         * @returns {ComponentInstance|jQueryfiedDOMList}
         */
        $.fn.rbComponent = function (name, initialOpts) {
            var ret;
            var elem = this.get(0);

            if (elem) {
                ret = rb.getComponent(elem, name, initialOpts);
            }

            return ret;
        };
        /* End: rbComponent */

        /* Begin: addEasing */
        var BezierEasing;
        var easingMap = {
            ease: '0.25,0.1,0.25,1',
            linear: '0,0,1,1',
            'ease-in': '0.42,0,1,1',
            'ease-out': '0,0,0.58,1',
            'ease-in-out': '0.42,0,0.58,1'
        };
        /**
         * Generates an easing function from a CSS easing value and adds it to the rb.$.easing object. requires npm module: "bezier-easing".
         * @memberof rb
         * @param {String} easing The easing value. Expects a string with 4 numbers separated by a "," describing a cubic bezier curve.
         * @param {String} [name] Human readable name of the easing.
         * @returns {Function} Easing a function
         */
        var regEasingNumber = /([0-9.]+)/g;
        rb.addEasing = function (easing, name) {
            var bezierArgs;
            if (typeof easing != 'string') {
                return;
            }

            if (easingMap[easing]) {
                name = easing;
                easing = easingMap[easing];
            }

            BezierEasing = BezierEasing || rb.BezierEasing || window.BezierEasing;

            if (BezierEasing && !$.easing[easing] && (bezierArgs = easing.match(regEasingNumber)) && bezierArgs.length == 4) {
                bezierArgs = bezierArgs.map(function (str) {
                    return parseFloat(str);
                });

                $.easing[easing] = BezierEasing.apply(this, bezierArgs);

                if (_typeof($.easing[easing]) == 'object' && typeof $.easing[easing].get == 'function') {
                    $.easing[easing] = $.easing[easing].get;
                }

                if (name && !$.easing[name]) {
                    $.easing[name] = $.easing[easing];
                }
            }

            return $.easing[easing] || $.easing.swing || $.easing.linear;
        };
        /* End: addEasing */

        /* Begin: cssSupports */
        var CSS = window.CSS;
        rb.cssSupports = CSS && CSS.supports ? function () {
            return CSS.supports.apply(CSS, arguments);
        } : function () {
            return '';
        };
        /* End: cssSupports */

        /* Begin: rb.events */

        rb.events = {
            _init: function _init() {
                this.proxyKey = rb.Symbol('_fnProxy');
            },
            Event: function Event(type, options) {
                var event;
                if (!options) {
                    options = {};
                }

                if (options.bubbles == null) {
                    options.bubbles = true;
                }

                if (options.cancelable == null) {
                    options.cancelable = true;
                }

                event = new CustomEvent(type, options);

                if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                    if (!event.isDefaultPrevented) {
                        event.isDefaultPrevented = function () {
                            rb.logError('deprecated');
                        };
                    }
                }

                return event;
            },
            dispatch: function dispatch(element, type, options) {
                var event = this.Event(type, options);
                element.dispatchEvent(event);
                return event;
            },
            proxy: function proxy(fn, type, key, _proxy) {
                if (!_proxy) {
                    return fn[this.proxyKey] && fn[this.proxyKey][type] && fn[this.proxyKey][type][key];
                }
                if (!fn[this.proxyKey]) {
                    fn[this.proxyKey] = {};
                }
                if (!fn[this.proxyKey][type]) {
                    fn[this.proxyKey][type] = {};
                }
                if (!fn[this.proxyKey][type][key]) {
                    fn[this.proxyKey][type][key] = _proxy;
                }
                if (fn != _proxy) {
                    this.proxy(_proxy, type, key, _proxy);
                }
            },
            _runDelegate: function _runDelegate(event, target, handler, context, args) {
                if (!target) {
                    return;
                }

                var ret;
                var oldDelegatedTarget = event.delegatedTarget;
                var oldDelegateTarget = event.delegateTarget;

                event.delegatedTarget = target;
                event.delegateTarget = target;

                ret = handler.apply(context, args);

                event.delegatedTarget = oldDelegatedTarget;
                event.delegateTarget = oldDelegateTarget;

                return ret;
            },
            proxies: {
                closest: function closest(handler, selector) {
                    var proxy = rb.events.proxy(handler, 'closest', selector);

                    if (!proxy) {
                        proxy = function proxy(e) {
                            return rb.events._runDelegate(e, e.target.closest(selector), handler, this, arguments);
                        };
                        rb.events.proxy(handler, 'closest', selector, proxy);
                    }

                    return proxy;
                },
                matches: function matches(handler, selector) {
                    var proxy = rb.events.proxy(handler, 'matches', selector);

                    if (!proxy) {
                        proxy = function proxy(e) {
                            return rb.events._runDelegate(e, e.target.matches(selector) ? e.target : null, handler, this, arguments);
                        };
                        rb.events.proxy(handler, 'matches', selector, proxy);
                    }

                    return proxy;
                },
                keycodes: function keycodes(handler, _keycodes) {
                    var keycodesObj;
                    var proxy = rb.events.proxy(handler, 'keycodes', _keycodes);

                    if (!proxy) {
                        proxy = function proxy(e) {
                            if (!keycodesObj) {
                                keycodesObj = _keycodes.trim().split(regSplit).reduce(function (obj, value) {
                                    obj[value] = true;
                                    return obj;
                                }, {});
                            }

                            if (keycodesObj[e.keyCode]) {
                                return handler.apply(this, arguments);
                            }
                        };
                        rb.events.proxy(handler, 'keycodes', _keycodes, proxy);
                    }

                    return proxy;
                },
                once: function once(handler, _once, opts, type) {
                    var proxy = rb.events.proxy(handler, 'conce', '');
                    if (!proxy) {
                        proxy = function proxy(e) {
                            var ret = handler.apply(this, arguments);
                            rb.events.remove(e && e.target || this, type, handler, opts);
                            return ret;
                        };
                        rb.events.proxy(handler, 'conce', '', proxy);
                    }
                    return proxy;
                }
            },
            applyProxies: function applyProxies(handler, opts, type) {
                var proxy;
                if (opts) {
                    for (proxy in opts) {
                        if (this.proxies[proxy] && proxy != 'once') {
                            handler = this.proxies[proxy](handler, opts[proxy], opts, type);
                        }
                    }

                    if ('once' in opts) {
                        handler = this.proxies.once(handler, opts.once, opts, type);
                    }
                }

                return handler;
            },
            special: {}
        };

        rb.events.proxies.delegate = rb.events.proxies.closest;

        [['add', 'addEventListener'], ['remove', 'removeEventListener']].forEach(function (action) {
            /**
             *
             * @name rb.event.add
             *
             * @param element
             * @param type
             * @param handler
             * @param opts
             */
            /**
             *
             * @name rb.event.remove
             *
             * @param element
             * @param type
             * @param handler
             * @param opts
             */
            rb.events[action[0]] = function (element, type, handler, opts) {
                if (!this.special[type] || this.special[type].applyProxies !== false) {
                    handler = rb.events.applyProxies(handler, opts, type);
                }
                if (this.special[type]) {
                    this.special[type][action[0]](element, handler, opts);
                } else {
                    var evtOpts = opts && (opts.capture || opts.passive) ? { passive: !!opts.passive, capture: !!opts.capture } : false;

                    element[action[1]](type, handler, evtOpts);

                    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                        rb.debugHelpers.onEventsAdd(element, type, handler, opts);
                    }
                }
            };
        });

        rb.events._init();

        /* End: rb.events */

        /**
         * Sets focus to an element. Note element has to be focusable
         * @memberof rb
         * @type function
         * @param element The element that needs to get focus.
         * @param [delay] {Number} The delay to focus the element.
         */
        rb.setFocus = function () {
            var element, attempts, abort, focusTimer;
            var scrollableElements = [];
            var regKeyboadElements = /^(?:input|textarea)$/i;
            var btns = { button: 1, submit: 1, reset: 1, image: 1, file: 1 };

            var calcScrollableElements = function calcScrollableElements() {
                var parent = element.parentNode;
                while (parent) {
                    if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) {
                        scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
                    }
                    parent = parent.parentNode;
                }
                parent = document.scrollingElement;
                scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
            };

            var restoreScrollPosition = function restoreScrollPosition() {
                var i;

                for (i = 0; i < scrollableElements.length; i++) {
                    scrollableElements[i][0].scrollTop = scrollableElements[i][1];
                    scrollableElements[i][0].scrollLeft = scrollableElements[i][2];
                }
                scrollableElements = [];
            };

            var setAbort = function setAbort() {
                abort = true;
            };

            var cleanup = function cleanup() {
                element = null;
                attempts = 0;
                abort = false;
                document.removeEventListener('focus', setAbort, true);
                if (focusTimer) {
                    clearTimeout(focusTimer);
                    focusTimer = null;
                }
            };

            var doFocus = function doFocus() {

                if (!element || abort || attempts > 9) {
                    cleanup();
                } else if (rb.getStyles(element).visibility != 'hidden' && (element.offsetHeight || element.offsetWidth)) {
                    rb.isScriptFocus = true;
                    rb.$doc.trigger('rbscriptfocus');
                    calcScrollableElements();

                    if ($.prop(element, 'tabIndex') < 0 && !element.getAttribute('tabindex')) {
                        element.setAttribute('tabindex', '-1');
                        element.classList.add('js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'scriptfocus');
                    }
                    try {
                        element.focus();
                    } catch (e) {
                        //continue
                    }
                    restoreScrollPosition();
                    rb.isScriptFocus = false;
                    cleanup();
                } else {
                    if (attempts == 2) {
                        document.addEventListener('focus', setAbort, true);
                    }
                    attempts++;
                    waitForFocus(150);
                }
            };

            var waitForFocus = function waitForFocus(delay) {
                if (element !== document.activeElement) {
                    focusTimer = setTimeout(doFocus, delay || 40);
                }
            };

            return function (givenElement, delay) {
                if (givenElement && givenElement !== document.activeElement && element !== givenElement) {
                    cleanup();

                    element = givenElement;

                    if (regKeyboadElements.test(element.nodeName) && !btns[element.type]) {
                        doFocus();
                    } else {
                        waitForFocus(delay);
                    }
                }
            };
        }();

        (function () {
            var console = window.console || {};
            var log = console.log && console.log.bind ? console.log : rb.$.noop; //eslint-disable-line no-unused-vars
            var logs = ['error', 'warn', 'info', 'log'].map(function (errorName, errorLevel) {
                var fnName = errorName == 'log' ? 'log' : 'log' + errorName.charAt(0).toUpperCase() + errorName.substr(1);
                return {
                    name: fnName,
                    errorLevel: errorLevel,
                    fn: (console[errorName] && console[errorName].bind ? console[errorName] : rb.$.noop).bind(console)
                };
            });

            /**
             * Adds a log method and a isDebug property to an object, which can be muted by setting isDebug to false.
             * @memberof rb
             * @param obj    {Object}
             * @param [initial] {Boolean}
             */
            rb.addLog = function (obj, initial) {
                var fakeLog = rb.$.noop;

                var setValue = function setValue() {
                    var level = obj.__isDebug;
                    logs.forEach(function (log) {
                        var fn = level !== false && (level === true || level >= log.errorLevel) ? log.fn : fakeLog;

                        obj[log.name] = fn;
                    });
                };

                obj.__isDebug = initial;
                setValue();

                Object.defineProperty(obj, 'isDebug', {
                    configurable: true,
                    enumerable: true,
                    get: function get() {
                        return obj.__isDebug;
                    },
                    set: function set(value) {
                        if (obj.__isDebug !== value) {
                            obj.__isDebug = value;
                            setValue();
                        }
                    }
                });
            };
        })();

        rb.addLog(rb, typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production' ? true : 1);

        if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
            rb.logWarn('rawblock dev mode active. Do not use in production');
        }

        var cbs = [];
        var _setupClick = function setupClick() {
            var clickClass = ['js', 'rb', 'click'].join(rb.nameSeparator);
            var clickSel = '.' + clickClass;
            var applyBehavior = function applyBehavior(clickElem, e) {
                var i, len, attr, found;
                for (i = 0, len = cbs.length; i < len; i++) {
                    attr = clickElem.getAttribute(cbs[i].attr);

                    if (attr != null) {
                        found = true;
                        cbs[i].fn(clickElem, e, attr);
                        break;
                    }
                }

                if (!found) {
                    clickElem.classList.remove(clickClass);
                }
            };
            _setupClick = rb.$.noop;

            document.addEventListener('keydown', function (e) {
                var elem = e.target;
                if ((e.keyCode == 40 || e.keyCode == 32 || e.keyCode == 13) && elem.classList.contains(clickClass)) {
                    applyBehavior(elem, e);
                }
            }, true);

            document.addEventListener('click', function (e) {
                if (e.button) {
                    return;
                }

                var clickElem = e.target.closest(clickSel);

                while (clickElem) {
                    applyBehavior(clickElem, e);

                    clickElem = clickElem.parentNode;
                    if (clickElem && clickElem.closest) {
                        clickElem = clickElem.closest(clickSel);
                    }

                    if (clickElem && !clickElem.closest) {
                        clickElem = null;
                    }
                }
            }, true);

            return clickClass;
        };

        /**
         * Allows to add click listeners for fast event delegation. For elements with the class `js-rb-click` and a data-{name} attribute.
         * @property rb.click.add {Function} add the given name and the function as a delegated click handler.
         * @memberof rb
         * @example
         * //<a class="js-rb-click" data-lightbox="1"></a>
         * rb.click.add('lightbox', function(element, event, attrValue){
        *
        * });
         */
        rb.click = {
            cbs: cbs,
            add: function add(name, fn) {
                cbs.push({
                    attr: 'data-' + name,
                    fn: fn
                });
                if (cbs.length == 1) {
                    this.clickClass = _setupClick();
                }
            }
        };

        var regNum = /:(\d)+\s*$/;
        var regTarget = /^\s*?\.?([a-z0-9_$]+)\((.*?)\)\s*?/i;
        var regPropTarget = /^@(.+)/;

        /**
         * Returns an array of elements based on a string.
         * @memberof rb
         * @param targetStr {String} Either a whitespace separated list of ids ("foo-1 bar-2"), a jQuery traversal method ("next(.input)"), a DOM property prefixed with a '@' ("@form"), a predefined value (window, document, scrollingElement, scrollingEventObject) or a $$() wrapped selector to search the entire document.
         * @param element {Element} The element that should be used as starting point for the jQuery traversal method.
         * @returns {Element[]}
         */
        rb.getElementsByString = function (targetStr, element) {
            var i, len, target, temp, num, match;

            if (targetStr) {
                if (num = targetStr.match(regNum)) {
                    targetStr = targetStr.replace(num[0], '');
                    num = num[1];
                }

                switch (targetStr) {
                    case 'window':
                        target = [window];
                        break;
                    case 'document':
                        target = [document];
                        break;
                    case 'scrollingElement':
                        target = [rb.getPageScrollingElement()];
                        break;
                    case 'scrollingEventObject':
                        target = [rb.getScrollingEventObject()];
                        break;
                    default:
                        if ((match = targetStr.match(regPropTarget)) && match[1] in element) {
                            target = element[match[1]];

                            if ('length' in target && !target.nodeType && target.length - 1 in target) {
                                target = Array.from(target);
                            } else {
                                target = [target];
                            }
                        } else if (match = targetStr.match(regTarget)) {

                            if (match[1] == '$' || match[1] == '$$' || match[1] == 'sel') {
                                target = Array.from(document.querySelectorAll(match[2]));
                            } else if ($.fn[match[1]]) {
                                if (!match[2]) {
                                    match[2] = null;
                                }
                                target = $(element)[match[1]](match[2]).get();
                            }
                        } else {
                            targetStr = targetStr.split(regSplit);
                            target = [];

                            for (i = 0, len = targetStr.length; i < len; i++) {
                                temp = targetStr[i] && document.getElementById(targetStr[i]);
                                if (temp) {
                                    target.push(temp);
                                }
                            }
                        }
                        break;
                }

                if (num && target) {
                    target = target[num] ? [target[num]] : [];
                }
            }

            return target || [];
        };

        rb.elementFromStr = rb.getElementsByString;

        /**
         * Parses data-* attributes and returns an object.
         *
         * @memberof rb
         * @param {Element} element
         * @param {Object} [attrsObject]
         * @param {String} [prefix]
         * @param {String} [exclude]
         * @return {Object}
         */
        rb.parseDataAttrs = function (element, attrsObject, prefix, exclude) {
            var i = void 0,
                name = void 0;
            var attributes = element.attributes;
            var len = attributes.length;

            if (!attrsObject) {
                attrsObject = {};
            }

            prefix = prefix ? prefix + '-' : '';

            prefix = 'data-' + prefix;

            for (i = 0; i < len; i++) {
                name = attributes[i].nodeName;
                if (name != exclude && name.startsWith(prefix)) {
                    attrsObject[$.camelCase(name.replace(prefix, ''))] = rb.parseValue(attributes[i].nodeValue);
                }
            }

            return attrsObject;
        };

        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

        /**
         * Returns the descriptor of a property. Moves up the prototype chain to do so.
         *
         * @memberof rb
         * @static
         *
         * @param {Object} object
         * @param {String} name
         * @returns {Object|undefined}
         */
        rb.getPropertyDescriptor = function getPropertyDescriptor(object, name) {
            var proto = object,
                descriptor;
            if (name in proto) {
                while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))) {
                    proto = Object.getPrototypeOf(proto);
                }
            }
            return descriptor;
        };

        /* begin: html escape */
        // List of HTML entities for escaping.
        var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        };

        // Functions for escaping and unescaping strings to/from HTML interpolation.
        var createEscaper = function createEscaper(map) {
            var escaper = function escaper(match) {
                return map[match];
            };
            // Regexes for identifying a key that needs to be escaped
            var source = '(?:' + Object.keys(map).join('|') + ')';
            var testRegexp = new RegExp(source);
            var replaceRegexp = new RegExp(source, 'g');

            return function (string) {
                string = string == null ? '' : '' + string;
                return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        };

        /**
         * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
         * their corresponding HTML entities.
         *
         * @static
         * @memberOf rb
         * @category String
         * @param {string} [string=''] The string to escape.
         * @returns {string} Returns the escaped string.
         * @example
         *
         * rb.escape('fred, barney, & pebbles');
         * // => 'fred, barney, &amp; pebbles'
         */
        rb.escape = createEscaper(escapeMap);

        /* eslint-disable no-undef */
        if (!window._) {
            window._ = {};
        }
        if (!_.escape) {
            _.escape = rb.escape;
        }
        /* eslint-enable no-undef */
        /* end: html escape */

        /**
         * Returns yes, if condition is true-thy no/empty string otherwise. Can be used inside of [`rb.template`]{@link rb.template}
         * @param condition
         * @param {String} yes
         * @param {String} [no=""]
         * @returns {string}
         */
        rb.if = function (condition, yes, no) {
            return condition ? yes : no || '';
        };
    })(window, document);

    (function (window, document) {
        'use strict';

        var elements = void 0,
            useMutationEvents = void 0,
            liveBatch = void 0,
            initClass = void 0,
            attachedClass = void 0,
            watchCssClass = void 0,
            started = void 0;

        var live = {};
        var removeElements = [];
        var rb = window.rb;
        var $ = rb.$;
        var componentExpando = rb.Symbol('_rbComponent');
        var expando = rb.Symbol('_rbCreated');
        var docElem = rb.root;
        var hooksCalled = {};
        var unregisteredFoundHook = {};
        var componentPromises = {};
        var _CssCfgExpando = rb.Symbol('_CssCfgExpando');

        var extendEvents = function extendEvents(value, args) {
            var prop = void 0;
            var toMerge = args.shift();

            if (toMerge) {
                for (prop in toMerge) {
                    if (!value[prop]) {
                        value[prop] = [];
                    }

                    if (Array.isArray(toMerge[prop])) {
                        value[prop] = toMerge[prop].concat(value[prop]);
                    } else {
                        value[prop].unshift(toMerge[prop]);
                    }
                }
            }

            if (args.length) {
                extendEvents(value, args);
            }

            return value;
        };

        var extendStatics = function extendStatics(Class, proto, SuperClasss, prop) {
            var value;
            var classObj = SuperClasss[prop] == Class[prop] ? null : Class[prop];

            if (prop == 'events') {
                value = extendEvents({}, [SuperClasss[prop], proto[prop], classObj]);
            } else {
                value = $.extend(true, {}, SuperClasss[prop], proto[prop], classObj);
            }

            Object.defineProperty(Class, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: value
            });

            if (proto[prop]) {
                Object.defineProperty(proto, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: null
                });
            }
        };

        var _initClickCreate = function initClickCreate() {
            _initClickCreate = $.noop;
            rb.click.add('module', function (elem) {
                rb.getComponent(elem);
                rb.rAFQueue(function () {
                    elem.classList.remove(rb.click.clickClass);

                    if (!elem.classList.contains(attachedClass)) {
                        elem.classList.add(initClass);
                        live.searchModules();
                    }
                }, true);
                liveBatch.run();
            });
        };

        var _initWatchCss = function initWatchCss() {
            _initWatchCss = $.noop;
            var elements = document.getElementsByClassName(attachedClass);
            var cssElements = document.getElementsByClassName(watchCssClass);

            rb.checkCssCfgs = function () {
                var i = void 0,
                    elem = void 0,
                    component = void 0;
                var len = elements.length;

                for (i = 0; i < len; i++) {
                    elem = elements[i];
                    component = elem && elem[componentExpando];

                    if (component && component.origName && component.parseOptions && rb.hasComponentCssChanged(elem, component.origName)) {
                        component.parseOptions();
                    }
                }

                for (i = 0, len = cssElements.length; i < len; i++) {
                    elem = cssElements[i];

                    component = elem.getAttribute('data-module');

                    if (component && rb.hasComponentCssChanged(elem, component)) {
                        live.import(component, elem, true);
                    }
                }
            };

            rb.resize.on(rb.checkCssCfgs);
        };

        var initObserver = function initObserver() {
            var removeComponents = function () {
                var runs, timer;
                var i = 0;
                var main = function main() {
                    var len, instance, element;
                    var start = Date.now();
                    for (len = live._attached.length; i < len && Date.now() - start < 3; i++) {
                        element = live._attached[i];

                        if (element && (instance = element[componentExpando]) && !docElem.contains(element)) {
                            element.classList.add(initClass);
                            live.destroyComponent(instance, i, element);

                            i--;
                            len--;
                        }
                    }

                    if (i < len) {
                        timer = setTimeout(main, 40);
                    } else {
                        timer = false;
                    }
                    runs = false;
                };
                return function () {
                    if (!runs) {
                        runs = true;
                        i = 0;
                        if (timer) {
                            clearTimeout(timer);
                        }
                        setTimeout(main, 99);
                    }
                };
            }();

            var onMutation = function onMutation(mutations) {
                var i, mutation;
                var len = mutations.length;

                for (i = 0; i < len; i++) {
                    mutation = mutations[i];
                    if (mutation.addedNodes.length) {
                        live.searchModules();
                    }
                    if (mutation.removedNodes.length) {
                        removeComponents();
                    }
                }
            };

            if (!useMutationEvents && window.MutationObserver) {
                new MutationObserver(onMutation).observe(docElem, { subtree: true, childList: true });
            } else {
                docElem.addEventListener('DOMNodeInserted', live.searchModules);
                document.addEventListener('DOMContentLoaded', live.searchModules);
                docElem.addEventListener('DOMNodeRemoved', function () {
                    var mutation = {
                        addedNodes: []
                    };
                    var mutations = [mutation];
                    var run = function run() {
                        onMutation(mutations);
                        mutation.removedNodes = false;
                    };
                    return function (e) {
                        if (!mutation.removedNodes) {
                            mutation.removedNodes = [];
                            setTimeout(run, 9);
                        }
                        if (e.target.nodeType == 1) {
                            mutation.removedNodes.push(e.target);
                        }
                    };
                }());
            }
        };

        var createBatch = function createBatch() {
            var runs;
            var batch = [];
            var run = function run() {
                while (batch.length) {
                    batch.shift()();
                }
                runs = false;
            };
            return {
                run: run,
                add: function add(fn) {
                    batch.push(fn);
                },
                timedRun: function timedRun() {
                    if (!runs) {
                        runs = true;
                        setTimeout(run);
                    }
                }
            };
        };

        var extendOptions = function extendOptions(obj) {
            if (obj) {
                ['statePrefix', 'utilPrefix', 'jsPrefix', 'nameSeparator', 'elementSeparator', 'attrSel'].forEach(function (prefixName) {
                    if (prefixName in obj && typeof obj[prefixName] == 'string') {
                        rb[prefixName] = obj[prefixName];
                    }
                });
            }
        };

        var _mainInit = function mainInit() {

            window.removeEventListener('click', _mainInit, true);
            _mainInit = false;

            extendOptions(rb.cssConfig);

            initClass = ['js', 'rb', 'live'].join(rb.nameSeparator);
            attachedClass = ['js', 'rb', 'attached'].join(rb.nameSeparator);
            watchCssClass = ['js', 'rb', 'watchcss'].join(rb.nameSeparator);

            elements = document.getElementsByClassName(initClass);

            initObserver();

            _initClickCreate();

            _initWatchCss();

            rb.ready.resolve();
        };

        rb._extendEvts = extendEvents;

        rb.ready = rb.deferred();

        rb.live = live;

        live.autoStart = true;

        live.expando = expando;
        live.componentExpando = componentExpando;

        live._failed = {};

        /**
         * List of all component classes registered by `rb.live.register`.
         * @memberof rb
         * @type {{}}
         */
        rb.components = {};
        live._attached = [];
        live.customElements = false;

        live.init = function (options) {
            if (started) {
                return;
            }

            started = true;

            if (options) {
                useMutationEvents = options.useMutationEvents || false;

                extendOptions(options);
            }

            if (_mainInit) {
                window.addEventListener('click', _mainInit, true);
            }

            liveBatch = createBatch();

            live.searchModules._rbUnthrotteled();
        };

        /**
         * Registers a component class with a name and manages its livecycle. An instance of this class will be automatically constructed with the found element as the first argument. If the class has an `attached` or `detached` instance method these methods also will be invoked, if the element is removed or added from/to the DOM. In most cases the given class inherits from [`rb.Component`]{@link rb.Component}. All component classes are added to the `rb.components` namespace.
         *
         * The DOM element/markup of a component class must have a `data-module` attribute with the name as its value. The `data-module` is split by a "/" and only the last part is used as the component name. The part before can be optionally used for [`rb.live.addImportHook`]{@link rb.live.addImportHook}.
         *
         * Usually the element should also have the class `js-rb-live` to make sure it is constructed as soon as it is attached to the document. If the component element has the class `js-rb-click` instead it will be constructed on first click.
         *
         * @memberof rb
         * @param {String} name The name of your component.
         * @param Class {Class} The Component class for your component.
         *
         * @return Class {Class}
         *
         * @example
         * class MyButton {
        *      constructor(element){
        *
        *      }
        * }
         *
         * //<button class="js-rb-live" data-module="my-button"></button>
         * rb.live.register('my-button', MyButton);
         *
         * @example
         * class Time {
        *      constructor(element, _initialDefaultOpts){
        *          this.element = element;
        *      }
        *
        *      attached(){
        *          this.timer = setInterval(() = > {
        *              this.element.innerHTML = new Date().toLocaleString();
        *          }, 1000);
        *      }
        *
        *      detached(){
        *          clearInterval(this.timer);
        *      }
        * }
         *
         * //<span class="js-rb-live" data-module="time"></span>
         * rb.live.register('time', Time);
         *
         */
        live.register = function (name, Class, extend) {
            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                rb.devData.componentsCount++;
            }

            var proto = Class.prototype;
            var superProto = Object.getPrototypeOf(proto);
            var superClass = superProto.constructor;
            var isRbComponent = proto instanceof rb.Component;

            if (isRbComponent) {
                extendStatics(Class, proto, superClass, 'defaults');
                extendStatics(Class, proto, superClass, 'events');

                if (!proto.hasOwnProperty('name')) {
                    proto.name = name;
                }
            }

            if (rb.components[name] && !extend) {
                rb.log(name + ' already exists.');
            }

            rb.components[name] = Class;

            if (componentPromises[name]) {
                componentPromises[name].resolve(Class);
            }

            if (elements && name.charAt(0) != '_') {
                live.searchModules();
            }

            return Class;
        };

        /**
         * Allows to add import callbacks for not yet registered components. The importCallback is only called once per component class name. The names parameter is either the component name or '*' as a wildcard. In case names is an array of strings these are treated as aliases for the same module. (rb-plugins/rb_packageloader automatically adds a wildcard hook.) If only importCallback is passed it will be also treated as a wildcard.
         *
         * There can be only one importHook for a module name.
         *
         * @memberof rb
         *
         * @param {String|String[]} [names] Component name or Component names/aliases for the module.
         * @param {Function} importCallback Callback that should import/require the module.
         *
         * @example
         * //create a short cut.
         * var addImportHook = rb.live.addImportHook;
         *
         * addImportHook('slider', function(moduleName, moduleAttributeValue, reject, element){
        *      //non-standard futuristic import
        *      System.import('./components/slider-v2').catch(reject);
        * });
         *
         * //Add component class with different aliases
         * addImportHook(['accordion', 'tabs', 'panelgroup'], function(){
        *      //webpack require
        *      require.ensure([], function(require){
        *          require('./components/panelgroups/index');
        *      });
        * });
         *
         * //Multiple component aliases with multiple modules
         * addImportHook(['accordion', 'tabs', 'panelgroup', 'slider'], function(){
        *      //AMD or webpack require
        *      require(['./components/slider', './components/panelgroup', './components/panel']);
        * });
         *
         * //dynamic catch all hook
         * addImportHook(function(moduleName, moduleAttributeValue){
        *      //AMD or webpack require
        *      require(['./components/' + moduleAttributeValue]);
        * });
         */
        live.addImportHook = function (names, importCallback) {
            var add = function add(name) {
                if (unregisteredFoundHook[name]) {
                    rb.log('overrides ' + name + ' import hook', names, importCallback);
                }
                unregisteredFoundHook[name] = importCallback;
            };

            if (typeof names == 'function') {
                importCallback = names;
                names = '*';
            }
            if (Array.isArray(names)) {
                names.forEach(add);
            } else {
                add(names);
            }
        };

        live.import = function (moduleId, element, lazy) {
            var hook = unregisteredFoundHook[moduleId] || unregisteredFoundHook['*'];

            if (!componentPromises[moduleId] && (hook || rb.components[moduleId])) {
                componentPromises[moduleId] = rb.deferred();

                if (rb.components[moduleId]) {
                    componentPromises[moduleId].resolve();
                }
            }

            if (!rb.components[moduleId] && hook) {
                if (!hooksCalled[moduleId]) {
                    var cssConfig = element && lazy && rb.parseComponentCss(element, moduleId);

                    if (cssConfig && cssConfig.switchedOff) {
                        if (!element.classList.contains(watchCssClass)) {
                            rb.rAFQueue(function () {
                                element.classList.add(watchCssClass);
                            }, true);
                        }
                    } else {
                        hooksCalled[moduleId] = true;
                        hook(moduleId, moduleId, function () {
                            live._failed[moduleId] = true;
                            componentPromises[moduleId].reject();
                        });
                    }
                }
            } else {
                live._failed[moduleId] = true;
            }

            return componentPromises[moduleId];
        };
        /**
         * Constructs a component class with the given element. Also attaches the attached classes and calls optionally the `attached` callback method. This method is normally only used automatically/internally by the mutation observer.
         *
         * @memberof rb
         * @see rb.getComponent
         *
         * @param element
         * @param liveClass
         * @returns {Object}
         */
        live.create = function (element, liveClass, initialOpts) {
            var instance;

            if (_mainInit) {
                _mainInit();
            }

            if (!(instance = element[componentExpando])) {
                instance = new liveClass(element, initialOpts);
                element[componentExpando] = instance;
            }

            rb.rAFQueue(function () {
                element.classList.add(attachedClass);
                element.classList.remove(watchCssClass);
            }, true);

            if (!element[expando] && instance && (instance.attached || instance.detached)) {

                if (live._attached.indexOf(element) == -1) {
                    live._attached.push(element);
                }
                if (instance.attached) {
                    liveBatch.add(function () {
                        instance.attached();
                    });
                }

                liveBatch.timedRun();
            }
            element[expando] = true;
            instance._created = true;

            return instance;
        };

        live.searchModules = function () {
            var removeInitClass = rb.rAF(function () {
                while (removeElements.length) {
                    removeElements.shift().classList.remove(initClass);
                }
            });
            var failed = function failed(element, id) {
                live._failed[id] = true;
                removeElements.push(element);
                rb.logError('failed', id, element);
            };

            var findElements = rb.throttle(function () {
                var element = void 0,
                    moduleId = void 0,
                    i = void 0,
                    componentPromise = void 0,
                    len = void 0;

                if (_mainInit) {
                    _mainInit();
                }

                len = elements.length;

                if (!len) {
                    return;
                }

                if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                    rb.debugHelpers.onSearchElementsStart();
                }

                for (i = 0; i < len; i++) {
                    element = elements[i];

                    if (element[expando]) {
                        removeElements.push(element);
                        continue;
                    }

                    moduleId = element.getAttribute('data-module') || '';

                    if (!rb.components[moduleId]) {
                        componentPromise = live.import(moduleId, element, true);
                    }

                    if (rb.components[moduleId]) {
                        live.create(element, rb.components[moduleId]);
                        removeElements.push(element);
                    } else if (live._failed[moduleId]) {
                        failed(element, moduleId);
                    } else if (!componentPromise) {
                        failed(element, moduleId);
                    }
                }

                if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                    rb.debugHelpers.onSearchElementsEnd(len);
                }

                removeInitClass();
                liveBatch.run();
            }, { delay: 50, read: true });

            return findElements;
        }();

        live.destroyComponent = function (instance, index, element) {

            if (!element) {
                element = instance.element;
            }

            if (index == null) {
                index = live._attached.indexOf(element);
            }
            element.classList.remove(attachedClass);

            if (element[expando]) {
                delete element[expando];
            }
            if (instance.detached) {
                instance.detached(element, instance);
            }

            live._attached.splice(index, 1);
        };

        rb.hasComponentCssChanged = function (element, _name) {
            return rb.hasPseudoChanged(element, _CssCfgExpando);
        };

        rb.parseComponentCss = function (element, _name) {
            return rb.parsePseudo(element, _CssCfgExpando) || null;
        };

        return live;
    })(window, document);

    (function (window, document, live, _undefined) {
        'use strict';

        var focusClass = void 0,
            focusSel = void 0;
        var rb = window.rb;
        var $ = rb.$;
        var componentExpando = live.componentExpando;
        var regHTMLSel = /\.{(htmlName|name)}(.+?)(?=(\s|$|\+|\)|\(|\[|]|>|<|~|\{|}|,|'|"|:))/g;
        var regName = /\{name}/g;
        var regJsName = /\{jsName}/g;
        var regHtmlName = /\{htmlName}/g;
        var regnameSeparator = /\{-}/g;
        var regElementSeparator = /\{e}/g;
        var regUtilPrefix = /\{u}/g;
        var regStatePrefix = /\{is}/g;
        var handlerOptionsSymbol = rb.Symbol('handlerOptions');

        var _setupEventsByEvtObj = function _setupEventsByEvtObj(that) {
            var eventsObjs, evt, oldCallbacks;
            var delegateEvents = [];
            var evts = that.constructor.events;

            for (evt in evts) {
                eventsObjs = rb.parseEventString(evt);

                /* jshint loopfunc: true */
                (function (eventsObjs, methods) {
                    var handler = function handler() {
                        if (that.options.switchedOff && !handler[handlerOptionsSymbol].neverSwitchOff) {
                            return;
                        }

                        var i = 0;
                        var args = Array.from(arguments);

                        var runSuper = function runSuper() {
                            var method = methods[i];

                            if (typeof method == 'string') {
                                method = that[method];
                            }

                            i++;

                            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                                if (!method) {
                                    rb.logInfo('no super event handler', that, args);
                                }
                            }

                            return method ? method.apply(that, args) : null;
                        };

                        args.push(runSuper);

                        return runSuper();
                    };

                    eventsObjs.forEach(function (eventObj) {
                        var prop, eventName;
                        var opts = {};
                        eventName = that.interpolateName(eventObj.event, true);

                        for (prop in eventObj.opts) {
                            opts[prop] = that.interpolateName(eventObj.opts[prop]);
                        }

                        handler[handlerOptionsSymbol] = opts;

                        if (!opts['@']) {
                            rb.events.add(that.element, eventName, handler, opts);
                        } else {
                            delegateEvents.push([null, eventName, handler, opts]);
                        }
                    });
                })(eventsObjs, evts[evt]);
            }

            if (delegateEvents.length) {
                oldCallbacks = {
                    attached: that.attached,
                    detached: that.detached
                };

                [['attached', 'add'], ['detached', 'remove']].forEach(function (descriptor) {
                    that[descriptor[0]] = function () {
                        var i, len, opts;

                        for (i = 0, len = delegateEvents.length; i < len; i++) {
                            opts = delegateEvents[i][3];

                            if (!delegateEvents[i][0]) {
                                delegateEvents[i][0] = that.getElementsByString(opts['@']) || delegateEvents[i][0];

                                if (delegateEvents[i][0] && delegateEvents[i][0].length < 2) {
                                    delegateEvents[i][0] = delegateEvents[i][0][0];
                                }
                            }

                            if (delegateEvents[i][0]) {
                                if (Array.isArray(delegateEvents[i][0])) {
                                    delegateEvents[i][0].forEach(function (elem) {
                                        // eslint-disable-line no-loop-func
                                        rb.events[descriptor[1]](elem, delegateEvents[i][1], delegateEvents[i][2], opts);
                                    });
                                } else {
                                    rb.events[descriptor[1]](delegateEvents[i][0], delegateEvents[i][1], delegateEvents[i][2], opts);
                                }
                            } else {
                                rb.logInfo('element not found', opts['@'], that);
                            }

                            if (descriptor[0] == 'remove') {
                                delegateEvents[i][0] = null;
                            }
                        }

                        if (oldCallbacks[descriptor[0]]) {
                            return oldCallbacks[descriptor[0]].apply(this, arguments);
                        }
                    };
                });
            }
        };

        var replaceHTMLSel = rb.memoize(function () {
            var replacer = function replacer(full, f1, f2) {
                return '[' + rb.attrSel + '="{htmlName}' + f2 + '"]';
            };
            return function (str) {
                return str.replace(regHTMLSel, replacer);
            };
        }(), true);

        var generateFocusClasses = function generateFocusClasses() {
            focusClass = ['js', 'rb', 'autofocus'].join(rb.nameSeparator);
            focusSel = '.' + focusClass;
        };

        rb.ready.then(generateFocusClasses);

        rb.parseEventString = rb.memoize(function (eventStr) {
            var i, len, data, opts, char;
            var events = [];

            var mode = 1;

            var optsName = '';
            var optsValue = '';
            var openingCount = 0;
            var selector = '';

            for (i = 0, len = eventStr.length; i < len; i++) {
                char = eventStr[i];

                if (!data) {
                    data = {
                        event: '',
                        opts: {}
                    };
                    opts = data.opts;
                }

                if (mode != 3 && mode != 4 && char == ',') {
                    events.push(data);
                    if (mode == 2) {
                        opts[optsName] = optsValue || ' ';
                        optsName = '';
                        optsValue = '';
                    }

                    if (!data.event && opts.event) {
                        data.event = opts.event;
                    }

                    data = null;
                    mode = 1;
                    continue;
                }

                if (mode == 1) {
                    if (char == ':') {
                        mode = 2;
                    } else if (data.event && char == ' ') {
                        mode = 4;
                    } else if (char != ' ') {
                        data.event += char;
                    }
                } else if (mode == 2) {
                    if (char == '(') {
                        mode = 3;
                        openingCount++;
                    } else if (char == ':') {
                        if (optsName) {
                            opts[optsName] = ' ';
                            optsName = '';
                        }
                    } else if (char == ' ') {
                        mode = 4;
                    } else {
                        optsName += char;
                    }
                } else if (mode == 3) {
                    if (char == '(') {
                        openingCount++;
                    } else if (char == ')') {
                        openingCount--;

                        if (!openingCount) {
                            opts[optsName] = optsValue || ' ';
                            optsName = '';
                            optsValue = '';
                            mode = 2;
                            continue;
                        }
                    }

                    optsValue += char;
                } else if (mode == 4) {
                    selector += char;
                }
            }

            if (data) {
                events.push(data);

                if (optsName) {
                    opts[optsName] = optsValue || ' ';
                }

                if (!data.event && opts.event) {
                    data.event = opts.event;
                }

                if (selector) {
                    for (i = 0, len = events.length; i < len; i++) {
                        if (!events[i].opts.closest) {
                            events[i].opts.closest = selector;
                        }
                    }
                }
            }

            return events;
        }, true);

        /**
         * returns the component instance of an element. If the component is not yet initialized it will be initialized.
         *
         * @memberof rb
         * @param {Element} element - DOM element
         * @param {String} [componentName] - optional name of the component (if element has no `data-module="componentName"`).
         * @param {Object} [initialOpts] - only use if component is not initialized otherwise use `setOption`/`setOptions`
         * @returns {Object} A component instance
         */
        rb.getComponent = function (element, componentName, initialOpts) {
            var component = element && element[componentExpando];

            if (!component && element) {

                if (!componentName) {
                    componentName = element.getAttribute('data-module') || '';
                }

                if (rb.components[componentName]) {
                    component = live.create(element, rb.components[componentName], initialOpts);
                }
            }

            if (!component) {
                if (componentName) {
                    live.import(componentName);
                }
                rb.logInfo('component not found', element, componentName);
            }
            return component || null;
        };

        live.getComponent = rb.getComponent;

        /**
         * Component Base1 Class - all UI components should extend this class. This Class adds some neat stuff to parse/change options (is automatically done in constructor), listen and trigger events, react to responsive state changes and establish BEM style classes as also a11y focus management.
         *
         * For the live cycle features see [rb.live.register]{@link rb.live.register}.
         *
         * @alias rb.Component
         *
         * @param element
         * @param [initialDefaults] {Object}
         *
         * @example
         * //<div class="js-rb-live" data-module="my-module"></div>
         * rb.live.register('my-component', class MyComponent extends rb.Component {
         *      static get defaults(){
         *          return {
         *              className: 'toggle-class',
         *          };
         *      }
         *
         *      static get events(){
         *          return {
         *              'click:closest(.change-btn)': 'changeClass',
         *          };
         *      }
         *
         *      constructor(element, initialDefaults){
         *          super(element, initialDefaults);
         *          this.rAFs('changeClass');
         *      }
         *
         *      changeClass(){
         *          this.$element.toggleClass(this.options.className);
         *      }
         * });
         */

        var Component = function () {
            function Component(element, initialDefaults) {
                _classCallCheck(this, Component);

                var origName = this.name;

                /**
                 * Reference to the main element.
                 * @type {Element}
                 */
                this.element = element;
                this.$element = $(element);

                /**
                 * Current options object constructed by defaults and overriding markup/CSS.
                 * @type {{}}
                 */
                this.options = {};

                this._initialDefaults = initialDefaults;
                this._stickyOpts = {};
                element[componentExpando] = this;

                this.origName = origName;

                this.parseOptions(this.options);

                this.name = this.options.name || rb.jsPrefix + origName;
                this.jsName = this.options.jsName || origName;

                this._evtName = this.jsName + 'changed';
                this._beforeEvtName = this.jsName + 'change';

                rb.addLog(this, this.options.debug == null ? rb.isDebug : this.options.debug);

                /**
                 * Template function or hash of template functions to be used with `this.render`. On instantiation the `rb.template['nameOfComponent']` is referenced.
                 * @type {Function|{}}
                 */
                this.templates = rb.templates[this.jsName] || rb.templates[origName] || {};

                this.beforeConstruct();

                _setupEventsByEvtObj(this);
            }

            Component.prototype.beforeConstruct = function beforeConstruct() {};

            Component.prototype.component = function component(element, moduleName, initialOpts) {
                if (typeof element == 'string') {
                    element = this.interpolateName(element);
                    element = rb.getElementsByString(element, this.element)[0] || this.query(element);
                }

                return rb.getComponent(element, moduleName, initialOpts);
            };

            Component.prototype.rAFs = function rAFs() {
                return rb.rAFs.apply(rb, [this].concat(Array.prototype.slice.call(arguments)));
            };

            Component.prototype.getId = function getId(element, async) {
                var id;

                if (typeof element == 'boolean') {
                    async = element;
                    element = null;
                }

                if (!element) {
                    element = this.element;
                }

                if (async == null) {
                    async = true;
                }

                if (!(id = element.id)) {
                    id = 'js' + rb.nameSeparator + rb.getID();
                    if (async) {
                        rb.rAFQueue(function () {
                            element.id = id;
                        }, true);
                    } else {
                        element.id = id;
                    }
                }

                return id;
            };

            Component.prototype.trigger = function trigger(type, detail) {
                var opts = void 0;

                if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) == 'object') {
                    detail = type;
                    type = detail.type;
                }

                if (type == null) {
                    type = this._evtName;
                } else if (!type.startsWith(this.jsName)) {
                    type = this.jsName + type;
                }

                opts = { detail: detail || {} };

                if (detail) {
                    if ('bubbles' in detail) {
                        opts.bubbles = detail.bubbles;
                    }
                    if ('cancelable' in detail) {
                        opts.cancelable = detail.cancelable;
                    }
                }

                return rb.events.dispatch(this.element, type, opts);
            };

            Component.prototype.getElementsByString = function getElementsByString(string, element) {
                return rb.getElementsByString(this.interpolateName(string), element || this.element);
            };

            Component.prototype._trigger = function _trigger() {
                this.logInfo('_trigger is deprecated use trigger instead');
                return this.trigger.apply(this, arguments);
            };

            Component.prototype.setFocus = function setFocus() {
                return rb.setFocus.apply(rb, arguments);
            };

            Component.prototype.getFocusElement = function getFocusElement(element) {
                var focusElement = void 0;

                if (element && element !== true) {
                    if (element.nodeType == 1) {
                        focusElement = element;
                    } else if (typeof element == 'string') {
                        focusElement = rb.elementFromStr(element, this.element)[0];
                    }
                } else {
                    focusElement = this.options.autofocusSel && this.query(this.options.autofocusSel) || this.query(focusSel);
                }

                if (!focusElement && (element === true || this.element.classList.contains(focusClass))) {
                    focusElement = this.element;
                }
                return focusElement;
            };

            Component.prototype.setComponentFocus = function setComponentFocus(element, delay) {
                var focusElement = void 0;

                if (typeof element == 'number') {
                    delay = element;
                    element = null;
                }

                focusElement = !element || element.nodeType != 1 ? this.getFocusElement(element) : element;

                this.storeActiveElement();

                if (focusElement) {
                    this.setFocus(focusElement, delay || this.options.focusDelay);
                }
            };

            Component.prototype.storeActiveElement = function storeActiveElement() {
                var activeElement = document.activeElement;

                this._activeElement = activeElement && activeElement.nodeName ? activeElement : null;

                return this._activeElement;
            };

            Component.prototype.restoreFocus = function restoreFocus(checkInside, delay) {
                var activeElem = this._activeElement;

                if (!activeElem) {
                    return;
                }

                if (typeof checkInside == 'number') {
                    delay = checkInside;
                    checkInside = null;
                }

                this._activeElement = null;
                if (!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)) {
                    this.setFocus(activeElem, delay || this.options.focusDelay);
                }
            };

            Component.prototype.interpolateName = function interpolateName(str, isJs) {

                if (!isJs && rb.attrSel) {
                    str = replaceHTMLSel(str);
                }

                return str.replace(regName, isJs ? this.jsName : this.name).replace(regJsName, this.jsName).replace(regHtmlName, this.name).replace(regnameSeparator, rb.nameSeparator).replace(regElementSeparator, rb.elementSeparator).replace(regUtilPrefix, rb.utilPrefix).replace(regStatePrefix, rb.statePrefix);
            };

            Component.prototype.query = function query(selector, context) {
                return (context || this.element).querySelector(this.interpolateName(selector));
            };

            Component.prototype._qSA = function _qSA(selector, context) {
                return (context || this.element).querySelectorAll(this.interpolateName(selector));
            };

            Component.prototype.queryAll = function queryAll(selector, context) {
                return Array.from(this._qSA(selector, context));
            };

            Component.prototype.$queryAll = function $queryAll(selector, context) {
                return $(this._qSA(selector, context));
            };

            Component.prototype.parseOptions = function parseOptions(opts) {
                var options = $.extend(true, opts || {}, this.constructor.defaults, this._initialDefaults, rb.parseComponentCss(this.element, this.origName), this.parseHTMLOptions(), this._stickyOpts);
                this.setOptions(options);
            };

            Component.prototype.setOptions = function setOptions(opts, isSticky) {

                if (opts !== this.options) {
                    var oldValue = void 0,
                        newValue = void 0;

                    for (var prop in opts) {
                        newValue = opts[prop];
                        oldValue = this.options[prop];

                        if (newValue !== oldValue && (!oldValue || (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) != 'object' || (typeof oldValue === 'undefined' ? 'undefined' : _typeof(oldValue)) != 'object' || JSON.stringify(newValue) != JSON.stringify(oldValue))) {
                            this.setOption(prop, newValue, isSticky);
                        }
                    }
                }
            };

            Component.prototype.setOption = function setOption(name, value, isSticky) {
                this.options[name] = value;

                if (isSticky) {
                    this._stickyOpts[name] = value;
                }

                if (name == 'debug') {
                    this.isDebug = value;
                } else if ((name == 'name' || name == 'jsName') && this.name && this.jsName && this.logWarn) {
                    this.logWarn('don\'t change name after init.');
                }
            };

            Component.prototype.setChildOption = function setChildOption($childs, name, value, isSticky) {
                var run = function run(elem) {
                    var component = this && this[componentExpando] || elem[componentExpando] || elem;
                    if (component && component.setOption) {
                        component.setOption(name, value, isSticky);
                    }
                };

                if ($childs.each) {
                    $childs.each(run);
                } else if ($childs.forEach) {
                    $childs.forEach(run);
                } else {
                    run($childs);
                }
            };

            Component.prototype.render = function render(name, data) {
                if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) == 'object') {
                    data = name;
                    name = '';
                }
                if (!data.name) {
                    data.name = this.name;
                }

                if (!data.component) {
                    data.component = this.component;
                }

                return this.templates[name] ? this.templates[name](data) : !name && typeof this.templates == 'function' ? this.templates(data) : '';
            };

            Component.prototype.parseHTMLOptions = function parseHTMLOptions(_element) {
                if (_element) {
                    rb.logError('use `rb.parseDataAttrs` instead of parseHTMLOptions.');
                    return {};
                }

                var element = this.element;
                var mainOptions = 'data-' + this.origName + '-options';
                var options = rb.jsonParse(element.getAttribute(mainOptions)) || {};

                return rb.parseDataAttrs(element, options, this.origName, mainOptions);
            };

            Component.prototype.destroy = function destroy() {
                live.destroyComponent(this);
            };

            Component.prototype.log = function log() {};

            return Component;
        }();

        ;

        Object.assign(Component, {
            /**
             * defaults Object, represent the default options of the component.
             * While a parsed option can be of any type, it is recommended to only use immutable values as defaults.
             *
             * @static
             * @memberOf rb.Component
             *
             * @see rb.Component.prototype.setOption
             *
             * @prop {Boolean} defaults.debug=rb.isDebug If `true` log method wirtes into console. Inherits from `rb.isDebug`.
             * @prop {Number} defaults.focusDelay=0 Default focus delay for `setComponentFocus`. Can be used to avoid interference between focusing and an animation.
             * @prop {String} defaults.autofocusSel='' Overrides the js-rb-autofocus selector for the component.
             * @prop {String|undefined} defaults.name=undefined Overrides the name of the component, which is used for class names by `interpolateName` and its dependent methods.
             * @prop {Boolean} defaults.jsName=undefined Overrides the jsName of the component, which is used for events by `interpolateName` and its dependent methods.
             *
             * @example
             * <!-- overriding defaults with markup -->
             * <div data-module="mymodule" data-mymodule-options='{"fooBar": false, "baz": true}'></div>
             * <div data-module="mymodule" data-mymodule-foo-bar="false" data-mymodule-baz="true"></div>
             *
             * @example
             *
             * //creating a new component with different defaults:
             * rb.live.register('special-accordion', class SpecialAccordion extends rb.components.accordion {
             *      static get defaults(){
             *          return {
             *              multiple: true,
             *          };
             *      }
             * });
             *
             * //overriding defaults (before initialization for all instances) with JS
             * rb.components.accordion.defaults.multiple = true;
             *
             * //overriding defaults (after initialization for one instance) with JS
             * var accordion = rb.getComponent(accordionElement);
             * accordion.setOption('multiple', true);
             *
             * @example
             * //overriding defaults using Sass
             * .rb-accordion {
             *      (at)include rb-js-export((
             *          multiple: false
             *      ));
             * }
             *
             * //also works responsive:
             * (at)media (max-width: 800px) {
             *   .rb-accordion {
             *      (at)include rb-js-export((
             *          multiple: false
             *      ));
             *   }
             * }
             *
             */
            defaults: {
                focusDelay: 0,
                debug: null,
                autofocusSel: '',
                switchedOff: false,
                name: '',
                jsName: ''
            },

            /**
             * Events object can be used to specify events, that will be bound to the component element.
             *
             * The key specifies the event type and optional a selector (separated by a whitespace) for event delegation. The key will be interpolated with [`this.interpolateName`]{@link rb.Component#interpolateName}.
             *
             * The key also allows comma separated multiple events as also modifiers (`'event1,event2:modifier()'`). As modifier `"event:capture()"`, `"event:keycodes(13 32)"`, `"event:matches(.selector)"` and `"event:closest(.selector)"` (alias for `"event .selector"`) are known. The delegated element is available through the `delegatedTarget` property.
             *
             * The value is either a string representing the name of a component method or a function reference. The function is always executed in context of the component.
             *
             * @static
             * @memberOf rb.Component
             *
             * @example
             *
             * class MyComponent extends rb.Component {
             *      constructor(element, initialDefaults){
             *          super(element, initialDefaults);
             *          this.child = this.query('.{name}__close-button');
             *
             *          rb.rAFs(this, 'setLayout');
             *      }
             *
             *      static get events(){
             *          return {
             *              'mouseenter': '_onInteraction',
             *              'click .{name}__close-button': 'close',
             *              'focus:capture():matches(input, select)': '_onFocus',
             *              'mouseenter:capture():matches(.teaser)': '_delegatedMouseenter',
             *              'keypress:keycodes(13 32):matches(.ok-btn)': '_ok',
             *              'click:closest(.ok-btn)': '_ok',
             *              'submit:@(closest(form))': '_submit',
             *          }
             *      }
             * }
             */
            events: {}
        });

        Component.prototype.getElementsFromString = Component.prototype.getElementsByString;

        rb.Component = Component;

        generateFocusClasses();
    })(window, document, rb.live);

    exports.default = window.rb;
});