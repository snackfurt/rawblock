import rb from '../utils/global-rb';
import isPlainObject from './$_is-plain-object';
import extend from './$_extend';
import Callbacks from './$_callbacks';
import addDimensions from './$_dimensions';
import getCss, {cssHooks} from '../utils/get-css';

let dataSymbol, regFocusable;
const specialEvents = {};

const Dom = function (elements, context) {

    if (!(this instanceof Dom)) {
        return new Dom(elements, context);
    }

    if (typeof elements == 'string') {
        if(regHTML.test(elements)){
            elements = Dom.parseHTML(elements, context);
        } else if(context && context.length > 1 && context instanceof Dom){
            return context.find(elements);
        } else {
            elements = Array.from((context || document).querySelectorAll(elements));
        }
    } else if (typeof elements == 'function') {
        if (Dom.isReady) {
            elements(Dom);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                elements(Dom);
            });
        }
        return;
    }

    if (!Array.isArray(elements)) {
        if (!elements) {
            elements = [];
        } else if (elements.nodeName || !('length' in elements) || elements == window) {
            elements = [elements];
        } else {
            elements = Array.from(elements.elements || elements);
        }
    }

    this.elements = elements;
    this.length = this.elements.length || 0;
};

const regWhite = /\s+/g;
const regHTML = /^\s*</;
const fn = Dom.prototype;

Object.assign(Dom, {
    isPlainObject: isPlainObject,
    extend: extend,
    cssHooks,
    event: {
        special: specialEvents,
    },
    fn: Dom.prototype,
    cssNumber: {
        opacity: true,
    },
    support: {},
    isReady: document.readyState != 'loading',
    parseHTML: function(string, context = document){
        const div = context.createElement('div');
        div.innerHTML = string;
        return new Dom(div.childNodes).remove().get();
    },
    noop: function () {
    },
    q: function (sel, context) {
        return new Dom((context || document).querySelectorAll(sel));
    },
    Event: function (type, options) {
        const event = rb.events.Event(type, options);

        if (!event.isDefaultPrevented || event.isDefaultPrevented._deprecated) {
            event.isDefaultPrevented = function () {
                return event.defaultPrevented;
            };
        }

        return event;
    },
    Callbacks: Callbacks,

    camelCase: (function () {
        const reg = /-([\da-z])/gi;
        const camelCase = function (all, found) {
            return found.toUpperCase();
        };

        const retCamel = function (str) {
            return str.replace(reg, camelCase);
        };

        return retCamel;
    })(),
    propHooks: {},
    prop: function(element, name, value){
        const hook = Dom.propHooks[name];

        if(value === undefined){
            return hook && hook.get ?
                hook.get(element) :
                element[name];
        }

        if(hook && hook.set){
            hook.set(element, value);
        } else {
            element[name] = value;
        }
    },
});

Object.assign(fn, {
    get: function (number) {
        return arguments.length ? this.elements[number] : this.elements;
    },
    eq: function (number) {
        return new Dom(this.elements[number] ? [this.elements[number]] : []);
    },
    css: function (style, value) {
        let elem;

        if (typeof style == 'string') {
            if(arguments.length == 1){
                elem = this.elements[0];
                return elem && getCss(elem, style);
            }

            style = {[style]: value};
        }
        this.elements.forEach(function (elem) {
            let prop;
            const eStyle = elem.style;

            for (prop in style) {
                if (Dom.cssHooks[prop] && Dom.cssHooks[prop].set) {
                    Dom.cssHooks[prop].set(elem, style[prop]);
                } else {
                    const propValue = (!Dom.cssNumber[prop] && typeof style[prop] == 'number') ?
                        style[prop] + 'px' :
                        style[prop]
                    ;

                    eStyle[prop] = propValue;
                }
            }
        });
        return this;
    },
    prop: function (props, value) {
        let elem;

        if (typeof props == 'string') {
            if(arguments.length == 1){
                elem = this.elements[0];
                return elem && Dom.prop(elem, props);
            }

            props = {[props]: value};
        }

        this.elements.forEach(function (elem) {
            let prop;

            for (prop in props) {
                Dom.prop(elem, prop, props[prop]);
            }
        });
        return this;
    },
    attr: function (attrs, value) {
        let elem;

        if (typeof attrs == 'string') {
            if(arguments.length == 1){
                elem = this.elements[0];
                return elem && elem.getAttribute(attrs);
            }

            attrs = {[attrs]: value};
        }
        this.elements.forEach(function (elem) {
            let attr;

            for (attr in attrs) {
                elem.setAttribute(attr, attrs[attr]);
            }
        });
        return this;
    },
    removeAttr: function (attr) {
        this.elements.forEach(function (elem) {
            elem.removeAttribute(attr);
        });
        return this;
    },
    is: function (sel) {
        return this.elements.some(function (elem) {
            return elem.matches(sel);
        });
    },
    html: function (htmlstringOrDom) {
        let elem;

        if (!arguments.length) {
            elem = this.elements[0];
            return elem && elem.innerHTML || '';
        }

        this.elements.forEach(function (elem) {
            elem.innerHTML = '';
        });

        this.append(htmlstringOrDom);

        return this;
    },
    text: function (htmlstring) {
        let elem;

        if (!arguments.length) {
            elem = this.elements[0];
            return elem && elem.textContent || '';
        }

        this.elements.forEach(function (elem) {
            elem.textContent = htmlstring;
        });

        return this;
    },
    before: function (htmlstringOrDom) {
        const isHTMLString = typeof htmlstringOrDom != 'object';
        const target = !isHTMLString ? this.first() : this;

        target.elements.forEach(function (elem) {
            let parentElement;

            if (isHTMLString) {
                elem.insertAdjacentHTML('beforebegin', htmlstringOrDom);
            } else {
                parentElement = elem.parentNode;
                if (parentElement) {
                    parentElement.insertBefore(getNodesAsOne(htmlstringOrDom), elem);
                }
            }
        });
        return this;
    },
    prepend: function (htmlstringOrDom) {
        const isHTMLString = typeof htmlstringOrDom != 'object';
        const target = !isHTMLString ? this.first() : this;

        target.elements.forEach(function (elem) {
            if (isHTMLString) {
                elem.insertAdjacentHTML('afterbegin', htmlstringOrDom);
            } else {
                elem.insertBefore(getNodesAsOne(htmlstringOrDom), elem.firstChild);
            }
        });
        return this;
    },
    prependTo: function(target){
        new Dom(target).prepend(this);
        return this;
    },
    append: function (htmlstringOrDom) {
        const isHTMLString = typeof htmlstringOrDom != 'object';
        const target = !isHTMLString ? this.last() : this;

        target.elements.forEach(function (elem) {
            if (isHTMLString) {
                elem.insertAdjacentHTML('beforeend', htmlstringOrDom);
            } else {
                elem.insertBefore(getNodesAsOne(htmlstringOrDom), null);
            }
        });

        return this;
    },
    appendTo: function(target){
        new Dom(target).append(this);
        return this;
    },
    after: function (htmlstringOrDom) {
        const isHTMLString = typeof htmlstringOrDom != 'object';
        const target = !isHTMLString ? this.last() : this;

        target.elements.forEach(function (elem) {
            let parentElement;

            if (isHTMLString) {
                elem.insertAdjacentHTML('afterend', htmlstringOrDom);
            } else {
                parentElement = elem.parentNode;
                if (parentElement) {
                    parentElement.insertBefore(getNodesAsOne(htmlstringOrDom), elem.nextElementSibling);
                }
            }
        });
        return this;
    },
    each: function (cb) {
        this.elements.forEach(function (elem, index) {
            cb.call(elem, index, elem);
        });
        return this;
    },
    remove: function () {
        this.elements.forEach(function (elem) {
            let parent = elem.parentNode;

            if (parent && parent.removeChild) {
                parent.removeChild(elem);
            }
        });
        return this;
    },
    trigger: function (type, options) {
        let firstEvent;

        if (typeof type == 'object') {
            firstEvent = type;
            type = firstEvent.type;
        }

        if (!options) {
            options = {};
        }

        if (options.bubbles == null) {
            options.bubbles = true;
        }

        this.elements.forEach(function (elem) {
            const event = firstEvent || new CustomEvent(type, options);

            firstEvent = null;
            elem.dispatchEvent(event);
        });

        return this;
    },
    index: function (elem) {
        if (!elem.nodeName && elem.get) {
            elem = elem.get(0);
        }
        return this.elements.indexOf(elem);
    },
    add: function(elem){
        if(this.elements && this.elements.indexOf(elem) == -1){
            this.elements.push(elem);
        }
        return this;
    },
    first: function(){
        return Dom(this.elements[0]);
    },
    last: function(){
        return Dom(this.elements[this.elements.length - 1]);
    },
    data: function(name, value){
        let ret;

        const isSetter = typeof name == 'object' || value != undefined;

        if(isSetter){
            const mergeObject = typeof name != 'string';

            ret = this;

            this.elements.forEach((element)=>{
                const data = getData(element, true)._;

                if(mergeObject){
                    Object.assign(data, name);
                } else {
                    data[name] = value;
                }
            });
        } else if(this.elements[0]) {
            const data = getData(this.elements[0], true)._;

            ret = name ? data[name] : data;
        }

        return ret;
    },
});

function getNodesAsOne(nodes){
    let node = nodes;

    if(!nodes.nodeType){
        if(nodes instanceof Dom){
            nodes = nodes.get();
        }

        if(nodes.length == 1){
            node = nodes[0];
        } else {
            node = document.createDocumentFragment();
            Array.from(nodes).forEach(function(elem){
                node.appendChild(elem);
            });
        }
    }

    return node;
}

['scrollTop', 'scrollLeft'].forEach(function(name){
    fn[name] = function(value){
        let elem;
        let ret = this;

        if(value == null){
            ret = 0;
            elem = this[0];

            if(elem){
                ret = (elem == window || elem == document ?
                    document.scrollingElement :
                    elem)[name];
            }
        } else {
            this.elements.forEach(function(elem){
                if(elem == window || elem == document){
                    elem = document.scrollingElement;
                }
                elem[name] = value;
            });
        }
        return ret;
    };
});

[['find', 'querySelectorAll', true], ['children', 'children']].forEach(function (action) {
    const isMatched = !!action[2];
    const isMethod = !!action[2];

    fn[action[0]] = function (sel) {
        const array = [];
        this.elements.forEach(function (elem, index) {
            let i, len;
            const elements = isMethod ? elem[action[1]](sel) : elem[action[1]];

            for (i = 0, len = elements.length; i < len; i++) {
                if ((isMatched || !sel || elements[i].matches(sel)) && (!index || array.indexOf(elements[i]) == -1)) {
                    array.push(elements[i]);
                }
            }
        });

        return new Dom(array);
    };
});

[['closest', 'closest', true, false, true], ['next', 'nextElementSibling', false, true], ['prev', 'previousElementSibling', false, true], ['parent', 'parentNode']].forEach(function (action) {
    const isMatched = !!action[2];
    const isUnique = !!action[3];
    const isMethod = !!action[4];

    fn[action[0]] = function (sel) {
        const array = [];

        this.elements.forEach(function (elem, index) {
            const element = isMethod ? elem[action[1]](sel) : elem[action[1]];

            if (element && (isMatched || !sel || element.matches(sel)) && (isUnique || !index || array.indexOf(element) == -1)) {
                array.push(element);
            }
        });

        return new Dom(array);
    };
});

[['prevAll', 'previousElementSibling'], ['nextAll', 'nextElementSibling'], ['parents', 'parentNode']].forEach(function (action) {
    fn[action[0]] = function (sel) {
        const array = [];

        this.elements.forEach(function (elem, index) {
            let element = elem[action[1]];

            while (element && element.nodeType == 1) {
                if ((!sel || element.matches(sel)) && (!index || array.indexOf(element) == -1)) {
                    array.push(element);
                }
                element = element[action[1]];
            }
        });

        return new Dom(array);
    };
});

fn.detach = fn.remove;

['add', 'remove', 'toggle'].forEach(function (action) {
    const isToggle = action == 'toggle';

    fn[action + 'Class'] = function (cl) {
        const args = isToggle ? arguments : cl.split(regWhite);

        this.elements.forEach(function (elem) {
            const list = elem.classList;
            list[action].apply(list, args);
        });

        return this;
    };
});

//new array or returns array
['map', 'filter', 'not'].forEach(function (name) {
    let isNot;
    let arrayFn = name;

    if ((isNot = name == 'not')) {
        arrayFn = 'filter';
    }

    fn[name] = function (fn) {
        let needle;
        const type = typeof fn;

        if (type != 'function') {
            needle = fn;
            if (!this.length) {
                fn = Dom.noop;
            } else if (type == 'string') {
                fn = function () {
                    return this.matches(needle);
                };
            } else if (type == 'object') {
                if(typeof needle.length == 'number' && !needle.nodeType){
                    if(!Array.isArray(needle)){
                        needle = needle instanceof Dom ?
                            needle.get() :
                            Array.from(needle)
                        ;
                    }

                    fn = function () {
                        return needle.includes(this);
                    };
                } else {
                    fn = function () {
                        return this == needle;
                    };
                }
            }
        }

        return new Dom(this.elements[arrayFn](function (elem, index) {
            const ret = fn.call(elem, index, elem);

            return isNot ? !ret : ret;
        }));
    };
});

['slice'].forEach(function(name){
    fn[name] = function () {
        return new Dom(this.elements[name].apply(this.elements, arguments));
    };
});

//['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
//	fn[name] = function(){
//		return this.elements[name].apply(this.elements, arguments);
//	};
//});

[['on', 'addEventListener'], ['off', 'removeEventListener']].forEach(function (action) {
    Dom.fn[action[0]] = function (type, sel, fn) {
        if(typeof type == 'object'){
            this.elements.forEach(function (elem) {
                let key;
                for(key in type){
                    elem[action[1]](key, type[key], false);
                }
            });
        } else {
            let useFn;

            if (typeof sel == 'function') {
                fn = sel;
                sel = null;
            }

            if (sel) {
                useFn = rb.events.proxies.delegate(fn, sel);
            } else {
                useFn = fn;
            }

            this.elements.forEach(function (elem) {
                elem[action[1]](type, useFn, false);
            });
        }

        return this;
    };
});

Dom.data = function (element, name, value) {
    const data = getData(element);
    const isObject = typeof name == 'object';

    if(isObject){
        Object.assign(data._, name);
    } else if (value !== undefined) {
        data._[name] = value;
    }

    return name && !isObject ? data._[name] : data._;
};

function getData(element, getAttrs){
    if (!dataSymbol) {
        dataSymbol = rb.Symbol('_rb$data');
    }

    let data = element[dataSymbol];

    if (!data) {
        data = {_: {}, isAttr: false};
        element[dataSymbol] = data;
    }

    if(!data.isAttr && getAttrs){
        Object.assign(data._, Object.assign(rb.parseDataAttrs(element), data._));
    }

    return data;
}

if(document.createElement('a').tabIndex !== 0 || document.createElement('i').tabIndex != -1){
    regFocusable = /^(?:a|area|input|select|textarea|button)$/i;
    Dom.propHooks.tabIndex = {
        get: function(element){
            const tabIndex = element.getAttribute('tabindex');

            return tabIndex ?
                parseInt(tabIndex, 10) :
                (regFocusable.test(element.nodeName) ?
                    0 :
                    -1)
            ;
        },
    };
}

addDimensions(Dom);

if (!Dom.isReady) {
    document.addEventListener('DOMContentLoaded', function () {
        Dom.isReady = true;
    });
}

if(rb.param){
    Dom.param = rb.param;
}

rb.$ = Dom;

export default Dom;
