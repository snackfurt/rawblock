(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var defaultCSSProp = '--rb-cfg';
    var watchCSSProp = '--rb-watch-css';

    var regStartQuote = /^\s?"?'?"?/;
    var regEndQuote = /"?'?"?\s?$/;
    var regEscapedQuote = /\\"/g;

    var removeLeadingQuotes = function (str) {
        return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
    };

    function getComponentCss(element, name){
        var prop, style, rets;

        var ret = 'null';
        var styles = rb.getStyles(element);
        var defaults = rb.components[name].defaults;

        name = '--' + name + '-';

        if(styles.getPropertyValue(watchCSSProp)){
            rets = [];

            for(prop in defaults){
                style = styles.getPropertyValue(name + prop);

                if(style){
                    rets.push('"'+ prop +'":'+ removeLeadingQuotes(style));
                }
            }

            if(rets.length){
                ret = '{' + rets.join(',') + '}';
            }
        }

        return ret;
    }

    function parseCss(element, name){
        var styles = element.nodeType ? rb.getStyles(element) : element;

        return rb.jsonParse(
            removeLeadingQuotes(styles.getPropertyValue(name || defaultCSSProp) || '')
        );
    }

    function hasComponentCssChanged(element, name, symbol){
        var nowStyles = getComponentCss(element, name);
        var cachedStyles = element[symbol] && element[symbol][name];

        if(!element[symbol]){
            element[symbol] = {};
        }
        element[symbol][symbol] = nowStyles;

        return nowStyles != cachedStyles;
    }

    function parseComponentCss(element, name, symbol){
        var styles = element[symbol] && element[symbol][name] || getComponentCss(element, name);

        if(symbol){
            if(!element[symbol]){
                element[symbol] = {};
            }
            element[symbol][name] = styles;
        }

        return rb.jsonParse(styles);
    }

    rb.enableCustomCss = function(){
        rb.parseComponentCss = parseComponentCss;
        rb.hasComponentCssChanged = hasComponentCssChanged;
    };

    return parseCss;
}));
