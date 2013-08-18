(function () {
/**
 * almond 0.2.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name) && !defining.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    function onResourceLoad(name, defined, deps){
        if(requirejs.onResourceLoad && name){
            requirejs.onResourceLoad({defined:defined}, {id:name}, deps);
        }
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (defined.hasOwnProperty(depName) ||
                           waiting.hasOwnProperty(depName) ||
                           defining.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }

        onResourceLoad(name, defined, args);
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../Scripts/almond-custom", function(){});

define('plugins/http',["jquery","knockout"],function(e,t){return{callbackParam:"callback",get:function(t,n){return e.ajax(t,{data:n})},jsonp:function(t,n,i){return-1==t.indexOf("=?")&&(i=i||this.callbackParam,t+=-1==t.indexOf("?")?"?":"&",t+=i+"=?"),e.ajax({url:t,dataType:"jsonp",data:n})},post:function(n,i){return e.ajax({url:n,data:t.toJSON(i),type:"POST",contentType:"application/json",dataType:"json"})}}});
define('durandal/system',["require","jquery"],function(e,t){function n(e){var t="[object "+e+"]";r["is"+e]=function(e){return s.call(e)==t}}var r,i=!1,o=Object.keys,a=Object.prototype.hasOwnProperty,s=Object.prototype.toString,u=!1,c=Array.isArray,l=Array.prototype.slice;if(Function.prototype.bind&&("object"==typeof console||"function"==typeof console)&&"object"==typeof console.log)try{["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function(e){console[e]=this.call(console[e],console)},Function.prototype.bind)}catch(d){u=!0}e.on&&e.on("moduleLoaded",function(e,t){r.setModuleId(e,t)}),"undefined"!=typeof requirejs&&(requirejs.onResourceLoad=function(e,t){r.setModuleId(e.defined[t.id],t.id)});var f=function(){},v=function(){try{if("undefined"!=typeof console&&"function"==typeof console.log)if(window.opera)for(var e=0;e<arguments.length;)console.log("Item "+(e+1)+": "+arguments[e]),e++;else 1==l.call(arguments).length&&"string"==typeof l.call(arguments)[0]?console.log(l.call(arguments).toString()):console.log.apply(console,l.call(arguments));else Function.prototype.bind&&!u||"undefined"==typeof console||"object"!=typeof console.log||Function.prototype.call.call(console.log,console,l.call(arguments))}catch(t){}},g=function(e){if(e instanceof Error)throw e;throw new Error(e)};r={version:"2.0.0",noop:f,getModuleId:function(e){return e?"function"==typeof e?e.prototype.__moduleId__:"string"==typeof e?null:e.__moduleId__:null},setModuleId:function(e,t){return e?"function"==typeof e?(e.prototype.__moduleId__=t,void 0):("string"!=typeof e&&(e.__moduleId__=t),void 0):void 0},resolveObject:function(e){return r.isFunction(e)?new e:e},debug:function(e){return 1==arguments.length&&(i=e,i?(this.log=v,this.error=g,this.log("Debug:Enabled")):(this.log("Debug:Disabled"),this.log=f,this.error=f)),i},log:f,error:f,assert:function(e,t){e||r.error(new Error(t||"Assert:Failed"))},defer:function(e){return t.Deferred(e)},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=0|16*Math.random(),n="x"==e?t:8|3&t;return n.toString(16)})},acquire:function(){var t,n=arguments[0],i=!1;return r.isArray(n)?(t=n,i=!0):t=l.call(arguments,0),this.defer(function(n){e(t,function(){var e=arguments;setTimeout(function(){e.length>1||i?n.resolve(l.call(e,0)):n.resolve(e[0])},1)},function(e){n.reject(e)})}).promise()},extend:function(e){for(var t=l.call(arguments,1),n=0;n<t.length;n++){var r=t[n];if(r)for(var i in r)e[i]=r[i]}return e},wait:function(e){return r.defer(function(t){setTimeout(t.resolve,e)}).promise()}},r.keys=o||function(e){if(e!==Object(e))throw new TypeError("Invalid object");var t=[];for(var n in e)a.call(e,n)&&(t[t.length]=n);return t},r.isElement=function(e){return!(!e||1!==e.nodeType)},r.isArray=c||function(e){return"[object Array]"==s.call(e)},r.isObject=function(e){return e===Object(e)},r.isBoolean=function(e){return"boolean"==typeof e},r.isPromise=function(e){return e&&r.isFunction(e.then)};for(var p=["Arguments","Function","String","Number","Date","RegExp"],h=0;h<p.length;h++)n(p[h]);return r});
define('durandal/viewEngine',["durandal/system","jquery"],function(e,t){var n;return n=t.parseHTML?function(e){return t.parseHTML(e)}:function(e){return t(e).get()},{viewExtension:".html",viewPlugin:"text",isViewUrl:function(e){return-1!==e.indexOf(this.viewExtension,e.length-this.viewExtension.length)},convertViewUrlToViewId:function(e){return e.substring(0,e.length-this.viewExtension.length)},convertViewIdToRequirePath:function(e){return this.viewPlugin+"!"+e+this.viewExtension},parseMarkup:n,processMarkup:function(e){var t=this.parseMarkup(e);return this.ensureSingleElement(t)},ensureSingleElement:function(e){if(1==e.length)return e[0];for(var n=[],i=0;i<e.length;i++){var r=e[i];if(8!=r.nodeType){if(3==r.nodeType){var o=/\S/.test(r.nodeValue);if(!o)continue}n.push(r)}}return n.length>1?t(n).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0):n[0]},createView:function(t){var n=this,i=this.convertViewIdToRequirePath(t);return e.defer(function(r){e.acquire(i).then(function(e){var i=n.processMarkup(e);i.setAttribute("data-view",t),r.resolve(i)}).fail(function(e){n.createFallbackView(t,i,e).then(function(e){e.setAttribute("data-view",t),r.resolve(e)})})}).promise()},createFallbackView:function(t,n){var i=this,r='View Not Found. Searched for "'+t+'" via path "'+n+'".';return e.defer(function(e){e.resolve(i.processMarkup('<div class="durandal-view-404">'+r+"</div>"))}).promise()}}});
define('durandal/viewLocator',["durandal/system","durandal/viewEngine"],function(e,t){function n(e,t){for(var n=0;n<e.length;n++){var i=e[n],r=i.getAttribute("data-view");if(r==t)return i}}function i(e){return(e+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1")}return{useConvention:function(e,t,n){e=e||"viewmodels",t=t||"views",n=n||t;var r=new RegExp(i(e),"gi");this.convertModuleIdToViewId=function(e){return e.replace(r,t)},this.translateViewIdToArea=function(e,t){return t&&"partial"!=t?n+"/"+t+"/"+e:n+"/"+e}},locateViewForObject:function(t,n,i){var r;if(t.getView&&(r=t.getView()))return this.locateView(r,n,i);if(t.viewUrl)return this.locateView(t.viewUrl,n,i);var o=e.getModuleId(t);return o?this.locateView(this.convertModuleIdToViewId(o),n,i):this.locateView(this.determineFallbackViewId(t),n,i)},convertModuleIdToViewId:function(e){return e},determineFallbackViewId:function(e){var t=/function (.{1,})\(/,n=t.exec(e.constructor.toString()),i=n&&n.length>1?n[1]:"";return"views/"+i},translateViewIdToArea:function(e){return e},locateView:function(i,r,o){if("string"==typeof i){var a;if(a=t.isViewUrl(i)?t.convertViewUrlToViewId(i):i,r&&(a=this.translateViewIdToArea(a,r)),o){var u=n(o,a);if(u)return e.defer(function(e){e.resolve(u)}).promise()}return t.createView(a)}return e.defer(function(e){e.resolve(i)}).promise()}}});
define('durandal/binder',["durandal/system","knockout"],function(e,t){function n(t){return void 0===t?{applyBindings:!0}:e.isBoolean(t)?{applyBindings:t}:(void 0===t.applyBindings&&(t.applyBindings=!0),t)}function i(i,u,l,d){if(!u||!l)return r.throwOnErrors?e.error(a):e.log(a,u,d),void 0;if(!u.getAttribute)return r.throwOnErrors?e.error(o):e.log(o,u,d),void 0;var f=u.getAttribute("data-view");try{var v;return i&&i.binding&&(v=i.binding(u)),v=n(v),r.binding(d,u,v),v.applyBindings?(e.log("Binding",f,d),t.applyBindings(l,u)):i&&t.utils.domData.set(u,s,{$data:i}),r.bindingComplete(d,u,v),i&&i.bindingComplete&&i.bindingComplete(u),t.utils.domData.set(u,c,v),v}catch(p){p.message=p.message+";\nView: "+f+";\nModuleId: "+e.getModuleId(d),r.throwOnErrors?e.error(p):e.log(p.message)}}var r,a="Insufficient Information to Bind",o="Unexpected View Type",c="durandal-binding-instruction",s="__ko_bindingContext__";return r={binding:e.noop,bindingComplete:e.noop,throwOnErrors:!1,getBindingInstruction:function(e){return t.utils.domData.get(e,c)},bindContext:function(e,t,n){return n&&e&&(e=e.createChildContext(n)),i(n,t,e,n||(e?e.$data:null))},bind:function(e,t){return i(e,t,e,e)}}});
define('durandal/activator',["durandal/system","knockout"],function(e,t){function n(e){return void 0==e&&(e={}),e.closeOnDeactivate||(e.closeOnDeactivate=u.defaults.closeOnDeactivate),e.beforeActivate||(e.beforeActivate=u.defaults.beforeActivate),e.afterDeactivate||(e.afterDeactivate=u.defaults.afterDeactivate),e.affirmations||(e.affirmations=u.defaults.affirmations),e.interpretResponse||(e.interpretResponse=u.defaults.interpretResponse),e.areSameItem||(e.areSameItem=u.defaults.areSameItem),e}function a(t,n,a){return e.isArray(a)?t[n].apply(t,a):t[n](a)}function r(t,n,a,r,i){if(t&&t.deactivate){e.log("Deactivating",t);var o;try{o=t.deactivate(n)}catch(c){return e.error(c),r.resolve(!1),void 0}o&&o.then?o.then(function(){a.afterDeactivate(t,n,i),r.resolve(!0)},function(t){e.log(t),r.resolve(!1)}):(a.afterDeactivate(t,n,i),r.resolve(!0))}else t&&a.afterDeactivate(t,n,i),r.resolve(!0)}function i(t,n,r,i){if(t)if(t.activate){e.log("Activating",t);var o;try{o=a(t,"activate",i)}catch(c){return e.error(c),r(!1),void 0}o&&o.then?o.then(function(){n(t),r(!0)},function(t){e.log(t),r(!1)}):(n(t),r(!0))}else n(t),r(!0);else r(!0)}function o(t,n,a){return a.lifecycleData=null,e.defer(function(r){if(t&&t.canDeactivate){var i;try{i=t.canDeactivate(n)}catch(o){return e.error(o),r.resolve(!1),void 0}i.then?i.then(function(e){a.lifecycleData=e,r.resolve(a.interpretResponse(e))},function(t){e.error(t),r.resolve(!1)}):(a.lifecycleData=i,r.resolve(a.interpretResponse(i)))}else r.resolve(!0)}).promise()}function c(t,n,r,i){return r.lifecycleData=null,e.defer(function(o){if(t==n())return o.resolve(!0),void 0;if(t&&t.canActivate){var c;try{c=a(t,"canActivate",i)}catch(s){return e.error(s),o.resolve(!1),void 0}c.then?c.then(function(e){r.lifecycleData=e,o.resolve(r.interpretResponse(e))},function(t){e.error(t),o.resolve(!1)}):(r.lifecycleData=c,o.resolve(r.interpretResponse(c)))}else o.resolve(!0)}).promise()}function s(a,s){var u,l=t.observable(null);s=n(s);var f=t.computed({read:function(){return l()},write:function(e){f.viaSetter=!0,f.activateItem(e)}});return f.__activator__=!0,f.settings=s,s.activator=f,f.isActivating=t.observable(!1),f.canDeactivateItem=function(e,t){return o(e,t,s)},f.deactivateItem=function(t,n){return e.defer(function(e){f.canDeactivateItem(t,n).then(function(a){a?r(t,n,s,e,l):(f.notifySubscribers(),e.resolve(!1))})}).promise()},f.canActivateItem=function(e,t){return c(e,l,s,t)},f.activateItem=function(t,n){var a=f.viaSetter;return f.viaSetter=!1,e.defer(function(o){if(f.isActivating())return o.resolve(!1),void 0;f.isActivating(!0);var c=l();return s.areSameItem(c,t,u,n)?(f.isActivating(!1),o.resolve(!0),void 0):(f.canDeactivateItem(c,s.closeOnDeactivate).then(function(v){v?f.canActivateItem(t,n).then(function(v){v?e.defer(function(e){r(c,s.closeOnDeactivate,s,e)}).promise().then(function(){t=s.beforeActivate(t,n),i(t,l,function(e){u=n,f.isActivating(!1),o.resolve(e)},n)}):(a&&f.notifySubscribers(),f.isActivating(!1),o.resolve(!1))}):(a&&f.notifySubscribers(),f.isActivating(!1),o.resolve(!1))}),void 0)}).promise()},f.canActivate=function(){var e;return a?(e=a,a=!1):e=f(),f.canActivateItem(e)},f.activate=function(){var e;return a?(e=a,a=!1):e=f(),f.activateItem(e)},f.canDeactivate=function(e){return f.canDeactivateItem(f(),e)},f.deactivate=function(e){return f.deactivateItem(f(),e)},f.includeIn=function(e){e.canActivate=function(){return f.canActivate()},e.activate=function(){return f.activate()},e.canDeactivate=function(e){return f.canDeactivate(e)},e.deactivate=function(e){return f.deactivate(e)}},s.includeIn?f.includeIn(s.includeIn):a&&f.activate(),f.forItems=function(t){s.closeOnDeactivate=!1,s.determineNextItemToActivate=function(e,t){var n=t-1;return-1==n&&e.length>1?e[1]:n>-1&&n<e.length-1?e[n]:null},s.beforeActivate=function(e){var n=f();if(e){var a=t.indexOf(e);-1==a?t.push(e):e=t()[a]}else e=s.determineNextItemToActivate(t,n?t.indexOf(n):0);return e},s.afterDeactivate=function(e,n){n&&t.remove(e)};var n=f.canDeactivate;f.canDeactivate=function(a){return a?e.defer(function(e){function n(){for(var t=0;t<i.length;t++)if(!i[t])return e.resolve(!1),void 0;e.resolve(!0)}for(var r=t(),i=[],o=0;o<r.length;o++)f.canDeactivateItem(r[o],a).then(function(e){i.push(e),i.length==r.length&&n()})}).promise():n()};var a=f.deactivate;return f.deactivate=function(n){return n?e.defer(function(e){function a(a){f.deactivateItem(a,n).then(function(){i++,t.remove(a),i==o&&e.resolve()})}for(var r=t(),i=0,o=r.length,c=0;o>c;c++)a(r[c])}).promise():a()},f},f}var u,l={closeOnDeactivate:!0,affirmations:["yes","ok","true"],interpretResponse:function(n){return e.isObject(n)&&(n=n.can||!1),e.isString(n)?-1!==t.utils.arrayIndexOf(this.affirmations,n.toLowerCase()):n},areSameItem:function(e,t){return e==t},beforeActivate:function(e){return e},afterDeactivate:function(e,t,n){t&&n&&n(null)}};return u={defaults:l,create:s,isActivator:function(e){return e&&e.__activator__}}});
define('durandal/composition',["durandal/system","durandal/viewLocator","durandal/binder","durandal/viewEngine","durandal/activator","jquery","knockout"],function(e,t,n,i,a,r,o){function c(e){for(var t=[],n={childElements:t,activeView:null},i=o.virtualElements.firstChild(e);i;)1==i.nodeType&&(t.push(i),i.getAttribute(h)&&(n.activeView=i)),i=o.virtualElements.nextSibling(i);return n.activeView||(n.activeView=t[0]),n}function s(){y--,0===y&&setTimeout(function(){for(var e=w.length;e--;)w[e]();w=[]},1)}function l(t,n,i){if(i)n();else if(t.activate&&t.model&&t.model.activate){var a;a=e.isArray(t.activationData)?t.model.activate.apply(t.model,t.activationData):t.model.activate(t.activationData),a&&a.then?a.then(n):a||void 0===a?n():s()}else n()}function u(){var t=this;t.activeView&&t.activeView.removeAttribute(h),t.child&&(t.model&&t.model.attached&&(t.composingNewView||t.alwaysTriggerAttach)&&t.model.attached(t.child,t.parent,t),t.attached&&t.attached(t.child,t.parent,t),t.child.setAttribute(h,!0),t.composingNewView&&t.model&&(t.model.compositionComplete&&g.current.complete(function(){t.model.compositionComplete(t.child,t.parent,t)}),t.model.detached&&o.utils.domNodeDisposal.addDisposeCallback(t.child,function(){t.model.detached(t.child,t.parent,t)})),t.compositionComplete&&g.current.complete(function(){t.compositionComplete(t.child,t.parent,t)})),s(),t.triggerAttach=e.noop}function d(t){if(e.isString(t.transition)){if(t.activeView){if(t.activeView==t.child)return!1;if(!t.child)return!0;if(t.skipTransitionOnSameViewId){var n=t.activeView.getAttribute("data-view"),i=t.child.getAttribute("data-view");return n!=i}}return!0}return!1}function v(e){for(var t=0,n=e.length,i=[];n>t;t++){var a=e[t].cloneNode(!0);i.push(a)}return i}function f(e){var t=v(e.parts),n=g.getParts(t),i=g.getParts(e.child);for(var a in n)r(i[a]).replaceWith(n[a])}function m(t){var n,i,a=o.virtualElements.childNodes(t);if(!e.isArray(a)){var r=[];for(n=0,i=a.length;i>n;n++)r[n]=a[n];a=r}for(n=1,i=a.length;i>n;n++)o.removeNode(a[n])}var g,p={},h="data-active-view",w=[],y=0,b="durandal-composition-data",A="data-part",D="["+A+"]",S=["model","view","transition","area","strategy","activationData"],I={complete:function(e){w.push(e)}};return g={convertTransitionToModuleId:function(e){return"transitions/"+e},defaultTransitionName:null,current:I,addBindingHandler:function(e,t,n){var i,a,r="composition-handler-"+e;t=t||o.bindingHandlers[e],n=n||function(){return void 0},a=o.bindingHandlers[e]={init:function(e,i,a,c,s){var l={trigger:o.observable(null)};return g.current.complete(function(){t.init&&t.init(e,i,a,c,s),t.update&&(o.utils.domData.set(e,r,t),l.trigger("trigger"))}),o.utils.domData.set(e,r,l),n(e,i,a,c,s)},update:function(e,t,n,i,a){var c=o.utils.domData.get(e,r);return c.update?c.update(e,t,n,i,a):(c.trigger(),void 0)}};for(i in t)"init"!==i&&"update"!==i&&(a[i]=t[i])},getParts:function(t){var n={};e.isArray(t)||(t=[t]);for(var i=0;i<t.length;i++){var a=t[i];if(a.getAttribute){var o=a.getAttribute(A);o&&(n[o]=a);for(var c=r(D,a).not(r("[data-bind] "+D,a)),s=0;s<c.length;s++){var l=c.get(s);n[l.getAttribute(A)]=l}}}return n},cloneNodes:v,finalize:function(t){if(t.transition=t.transition||this.defaultTransitionName,t.child||t.activeView)if(d(t)){var i=this.convertTransitionToModuleId(t.transition);e.acquire(i).then(function(e){t.transition=e,e(t).then(function(){if(t.cacheViews){if(t.activeView){var e=n.getBindingInstruction(t.activeView);void 0==e.cacheViews||e.cacheViews||o.removeNode(t.activeView)}}else t.child?m(t.parent):o.virtualElements.emptyNode(t.parent);t.triggerAttach()})}).fail(function(t){e.error("Failed to load transition ("+i+"). Details: "+t.message)})}else{if(t.child!=t.activeView){if(t.cacheViews&&t.activeView){var a=n.getBindingInstruction(t.activeView);void 0==a.cacheViews||a.cacheViews?r(t.activeView).hide():o.removeNode(t.activeView)}t.child?(t.cacheViews||m(t.parent),r(t.child).show()):t.cacheViews||o.virtualElements.emptyNode(t.parent)}t.triggerAttach()}else t.cacheViews||o.virtualElements.emptyNode(t.parent),t.triggerAttach()},bindAndShow:function(e,t,a){t.child=e,t.composingNewView=t.cacheViews?-1==o.utils.arrayIndexOf(t.viewElements,e):!0,l(t,function(){if(t.binding&&t.binding(t.child,t.parent,t),t.preserveContext&&t.bindingContext)t.composingNewView&&(t.parts&&f(t),r(e).hide(),o.virtualElements.prepend(t.parent,e),n.bindContext(t.bindingContext,e,t.model));else if(e){var a=t.model||p,c=o.dataFor(e);if(c!=a){if(!t.composingNewView)return r(e).remove(),i.createView(e.getAttribute("data-view")).then(function(e){g.bindAndShow(e,t,!0)}),void 0;t.parts&&f(t),r(e).hide(),o.virtualElements.prepend(t.parent,e),n.bind(a,e)}}g.finalize(t)},a)},defaultStrategy:function(e){return t.locateViewForObject(e.model,e.area,e.viewElements)},getSettings:function(t){var n,r=t(),c=o.utils.unwrapObservable(r)||{},s=a.isActivator(r);if(e.isString(c))return c=i.isViewUrl(c)?{view:c}:{model:c,activate:!0};if(n=e.getModuleId(c))return c={model:c,activate:!0};!s&&c.model&&(s=a.isActivator(c.model));for(var l in c)c[l]=-1!=o.utils.arrayIndexOf(S,l)?o.utils.unwrapObservable(c[l]):c[l];return s?c.activate=!1:void 0===c.activate&&(c.activate=!0),c},executeStrategy:function(e){e.strategy(e).then(function(t){g.bindAndShow(t,e)})},inject:function(n){return n.model?n.view?(t.locateView(n.view,n.area,n.viewElements).then(function(e){g.bindAndShow(e,n)}),void 0):(n.strategy||(n.strategy=this.defaultStrategy),e.isString(n.strategy)?e.acquire(n.strategy).then(function(e){n.strategy=e,g.executeStrategy(n)}).fail(function(t){e.error("Failed to load view strategy ("+n.strategy+"). Details: "+t.message)}):this.executeStrategy(n),void 0):(this.bindAndShow(null,n),void 0)},compose:function(n,i,a,r){y++,r||(i=g.getSettings(function(){return i},n));var o=c(n);i.activeView=o.activeView,i.parent=n,i.triggerAttach=u,i.bindingContext=a,i.cacheViews&&!i.viewElements&&(i.viewElements=o.childElements),i.model?e.isString(i.model)?e.acquire(i.model).then(function(t){i.model=e.resolveObject(t),g.inject(i)}).fail(function(t){e.error("Failed to load composed module ("+i.model+"). Details: "+t.message)}):g.inject(i):i.view?(i.area=i.area||"partial",i.preserveContext=!0,t.locateView(i.view,i.area,i.viewElements).then(function(e){g.bindAndShow(e,i)})):this.bindAndShow(null,i)}},o.bindingHandlers.compose={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,a,r){var c=g.getSettings(t,e);if(c.mode){var s=o.utils.domData.get(e,b);if(!s){var l=o.virtualElements.childNodes(e);s={},"inline"===c.mode?s.view=i.ensureSingleElement(l):"templated"===c.mode&&(s.parts=v(l)),o.virtualElements.emptyNode(e),o.utils.domData.set(e,b,s)}"inline"===c.mode?c.view=s.view.cloneNode(!0):"templated"===c.mode&&(c.parts=s.parts),c.preserveContext=!0}g.compose(e,c,r,!0)}},o.virtualElements.allowedBindings.compose=!0,g});
define('durandal/events',["durandal/system"],function(e){var t=/\s+/,n=function(){},i=function(e,t){this.owner=e,this.events=t};return i.prototype.then=function(e,t){return this.callback=e||this.callback,this.context=t||this.context,this.callback?(this.owner.on(this.events,this.callback,this.context),this):this},i.prototype.on=i.prototype.then,i.prototype.off=function(){return this.owner.off(this.events,this.callback,this.context),this},n.prototype.on=function(e,n,r){var a,o,c;if(n){for(a=this.callbacks||(this.callbacks={}),e=e.split(t);o=e.shift();)c=a[o]||(a[o]=[]),c.push(n,r);return this}return new i(this,e)},n.prototype.off=function(n,i,r){var a,o,c,s;if(!(o=this.callbacks))return this;if(!(n||i||r))return delete this.callbacks,this;for(n=n?n.split(t):e.keys(o);a=n.shift();)if((c=o[a])&&(i||r))for(s=c.length-2;s>=0;s-=2)i&&c[s]!==i||r&&c[s+1]!==r||c.splice(s,2);else delete o[a];return this},n.prototype.trigger=function(e){var n,i,r,a,o,c,s,l;if(!(i=this.callbacks))return this;for(l=[],e=e.split(t),a=1,o=arguments.length;o>a;a++)l[a-1]=arguments[a];for(;n=e.shift();){if((s=i.all)&&(s=s.slice()),(r=i[n])&&(r=r.slice()),r)for(a=0,o=r.length;o>a;a+=2)r[a].apply(r[a+1]||this,l);if(s)for(c=[n].concat(l),a=0,o=s.length;o>a;a+=2)s[a].apply(s[a+1]||this,c)}return this},n.prototype.proxy=function(e){var t=this;return function(n){t.trigger(e,n)}},n.includeIn=function(e){e.on=n.prototype.on,e.off=n.prototype.off,e.trigger=n.prototype.trigger,e.proxy=n.prototype.proxy},n});
define('durandal/app',["durandal/system","durandal/viewEngine","durandal/composition","durandal/events","jquery"],function(e,t,n,a,r){function i(){return e.defer(function(t){return 0==c.length?(t.resolve(),void 0):(e.acquire(c).then(function(n){for(var a=0;a<n.length;a++){var r=n[a];if(r.install){var i=s[a];e.isObject(i)||(i={}),r.install(i),e.log("Plugin:Installed "+c[a])}else e.log("Plugin:Loaded "+c[a])}t.resolve()}).fail(function(t){e.error("Failed to load plugin(s). Details: "+t.message)}),void 0)}).promise()}var o,c=[],s=[];return o={title:"Application",configurePlugins:function(t,n){var a=e.keys(t);n=n||"plugins/",-1===n.indexOf("/",n.length-1)&&(n+="/");for(var r=0;r<a.length;r++){var i=a[r];c.push(n+i),s.push(t[i])}},start:function(){return e.log("Application:Starting"),this.title&&(document.title=this.title),e.defer(function(t){r(function(){i().then(function(){t.resolve(),e.log("Application:Started")})})}).promise()},setRoot:function(a,r,i){var o,c={activate:!0,transition:r};o=!i||e.isString(i)?document.getElementById(i||"applicationHost"):i,e.isString(a)?t.isViewUrl(a)?c.view=a:c.model=a:c.model=a,n.compose(o,c)}},a.includeIn(o),o});
define('calendarService/calendarservice',["plugins/http","durandal/app","knockout"],function(){var t=function(t){this.title=t.title,this.start=t.start},n={loadForUser:function(n){console.log("loading calendar for usera ",n);for(var a=0;3>a;a++)n.addCalendarEntry(new t({title:"Fotballtrening title"+a,start:Date()}))}};return{service:n,CalendarEntry:t}});
requirejs.config({paths:{text:"../Scripts/text",durandal:"../Scripts/durandal",plugins:"../Scripts/durandal/plugins",transitions:"../Scripts/durandal/transitions",underscore:"../Scripts/underscore",knockout:"../Scripts/knockout-2.3.0",jquery:"../Scripts/jquery-1.9.1"},shim:{underscore:{exports:"_"}}}),define("jquery",[],function(){return jQuery}),define("knockout",ko),define('main',["durandal/system","durandal/app","durandal/viewLocator"],function(t,n,r){t.debug(!0),n.title="Durandal Starter Kit",n.configurePlugins({router:!0,dialog:!0,widget:!0}),n.start().then(function(){r.useConvention(),n.setRoot("shell/shell","entrance")})});
define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});
define('text!main/main.html',[],function () { return '<div>\r\n\r\n    <div class="row" data-bind="foreach: users">\r\n        <div class="col-sm-2">\r\n      <h3 data-bind="text: name"></h3>\r\n      <ul class="list-group" data-bind="foreach: entries">\r\n        <li class="list-group-item"><div>\r\n          <p data-bind="text: title"/>\r\n          <p data-bind="textualDate: start"/>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n      </div>\r\n    </div>\r\n\r\n</div>\r\n';});

define('calendarservice/calendarservice',["plugins/http","durandal/app","knockout"],function(){var t=function(t){this.title=t.title,this.start=t.start},n={loadForUser:function(n){console.log("loading calendar for usera ",n);for(var a=0;3>a;a++)n.addCalendarEntry(new t({title:"Fotballtrening title"+a,start:Date()}))}};return{service:n,CalendarEntry:t}});
define('user/user',["plugins/http","durandal/app","knockout","calendarservice/calendarservice"],function(e,n,r,t){var a=function(e){var n=this;this.name=e.name,this.entries=r.observableArray([]),this.addCalendarEntry=function(e){n.entries.push(e)},this.loadCalendar=function(){t.service.loadForUser(n)}};return{User:a}});
define('main/main',["plugins/http","durandal/app","knockout","user/user","underscore"],function(e,r,n,t,a){var s={users:n.observableArray([]),addUser:function(e){this.users.push(e)},loadCalendars:function(){a.each(this.users(),function(e){console.log(e),e.loadCalendar()})}};return r.on("settings:loaded",function(){s.addUser(new t.User({name:"user1"})),s.addUser(new t.User({name:"user2"})),s.addUser(new t.User({name:"user3"})),s.addUser(new t.User({name:"user4"})),s.addUser(new t.User({name:"user5"})),s.loadCalendars()}),s});
define('text!shell/shell.html',[],function () { return '<nav class="navbar" role="navigation">\r\n\r\n    <div class="navbar-header">\r\n        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">\r\n            <span class="sr-only">Toggle navigation</span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n            <span class="icon-bar"></span>\r\n        </button>\r\n        <a class="navbar-brand" href="#">Kjokkentavla</a>\r\n    </div>\r\n    <div class="collapse navbar-collapse navbar-ex1-collapse">\r\n        <ul class="nav navbar-nav" data-bind="foreach: router.navigationModel">\r\n            <li data-bind="css: { active: isActive }">\r\n                <a data-bind="attr: { href: hash }, html: title"></a>\r\n            </li>\r\n        </ul>\r\n        <ul class="nav navbar-nav navbar-right">\r\n            <li>\r\n                <div class="loader" data-bind="css: { active: router.isNavigating }">\r\n                    <i class="icon-spinner icon-2x icon-spin"></i>\r\n                </div>\r\n            </li>\r\n        </ul>\r\n\r\n    </div>\r\n\r\n</nav>\r\n<div class="container-fluid page-host" data-bind="router: { transition: \'entrance\', cacheViews: true }"></div>\r\n';});

define('plugins/history',["durandal/system","jquery"],function(e,t){function n(e,t,n){if(n){var i=e.href.replace(/(javascript:|#).*$/,"");e.replace(i+"#"+t)}else e.hash="#"+t}var i=/^[#\/]|\s+$/g,a=/^\/+|\/+$/g,r=/msie [\w.]+/,o=/\/$/,s={interval:50,active:!1};return"undefined"!=typeof window&&(s.location=window.location,s.history=window.history),s.getHash=function(e){var t=(e||s).location.href.match(/#(.*)$/);return t?t[1]:""},s.getFragment=function(e,t){if(null==e)if(s._hasPushState||!s._wantsHashChange||t){e=s.location.pathname;var n=s.root.replace(o,"");e.indexOf(n)||(e=e.substr(n.length))}else e=s.getHash();return e.replace(i,"")},s.activate=function(n){s.active&&e.error("History has already been activated."),s.active=!0,s.options=e.extend({},{root:"/"},s.options,n),s.root=s.options.root,s._wantsHashChange=s.options.hashChange!==!1,s._wantsPushState=!!s.options.pushState,s._hasPushState=!!(s.options.pushState&&s.history&&s.history.pushState);var o=s.getFragment(),c=document.documentMode,l=r.exec(navigator.userAgent.toLowerCase())&&(!c||7>=c);s.root=("/"+s.root+"/").replace(a,"/"),l&&s._wantsHashChange&&(s.iframe=t('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,s.navigate(o,!1)),s._hasPushState?t(window).on("popstate",s.checkUrl):s._wantsHashChange&&"onhashchange"in window&&!l?t(window).on("hashchange",s.checkUrl):s._wantsHashChange&&(s._checkUrlInterval=setInterval(s.checkUrl,s.interval)),s.fragment=o;var u=s.location,d=u.pathname.replace(/[^\/]$/,"$&/")===s.root;if(s._wantsHashChange&&s._wantsPushState){if(!s._hasPushState&&!d)return s.fragment=s.getFragment(null,!0),s.location.replace(s.root+s.location.search+"#"+s.fragment),!0;s._hasPushState&&d&&u.hash&&(this.fragment=s.getHash().replace(i,""),this.history.replaceState({},document.title,s.root+s.fragment+u.search))}return s.options.silent?void 0:s.loadUrl()},s.deactivate=function(){t(window).off("popstate",s.checkUrl).off("hashchange",s.checkUrl),clearInterval(s._checkUrlInterval),s.active=!1},s.checkUrl=function(){var e=s.getFragment();return e===s.fragment&&s.iframe&&(e=s.getFragment(s.getHash(s.iframe))),e===s.fragment?!1:(s.iframe&&s.navigate(e,!1),s.loadUrl(),void 0)},s.loadUrl=function(e){var t=s.fragment=s.getFragment(e);return s.options.routeHandler?s.options.routeHandler(t):!1},s.navigate=function(t,i){if(!s.active)return!1;if(void 0===i?i={trigger:!0}:e.isBoolean(i)&&(i={trigger:i}),t=s.getFragment(t||""),s.fragment!==t){s.fragment=t;var a=s.root+t;if(s._hasPushState)s.history[i.replace?"replaceState":"pushState"]({},document.title,a);else{if(!s._wantsHashChange)return s.location.assign(a);n(s.location,t,i.replace),s.iframe&&t!==s.getFragment(s.getHash(s.iframe))&&(i.replace||s.iframe.document.open().close(),n(s.iframe.location,t,i.replace))}return i.trigger?s.loadUrl(t):void 0}},s.navigateBack=function(){s.history.back()},s});
define('plugins/router',["durandal/system","durandal/app","durandal/activator","durandal/events","durandal/composition","plugins/history","knockout","jquery"],function(e,t,n,i,r,a,o,s){function c(e){return e=e.replace(y,"\\$&").replace(p,"(?:$1)?").replace(h,function(e,t){return t?e:"([^/]+)"}).replace(m,"(.*?)"),new RegExp("^"+e+"$")}function u(e){var t=e.indexOf(":"),n=t>0?t-1:e.length;return e.substring(0,n)}function l(e){return e.router&&e.router.loadUrl}function d(e,t){return-1!==e.indexOf(t,e.length-t.length)}function f(e,t){if(!e||!t)return!1;if(e.length!=t.length)return!1;for(var n=0,i=e.length;i>n;n++)if(e[n]!=t[n])return!1;return!0}var v,g,p=/\((.*?)\)/g,h=/(\(\?)?:\w+/g,m=/\*\w+/g,y=/[\-{}\[\]+?.,\\\^$|#\s]/g,b=/\/$/,w=function(){function r(t,n){e.log("Navigation Complete",t,n);var i=e.getModuleId(C);i&&P.trigger("router:navigation:from:"+i),C=t,O=n;var r=e.getModuleId(C);r&&P.trigger("router:navigation:to:"+r),l(t)||P.updateDocumentTitle(t,n),g.explicitNavigation=!1,g.navigatingBack=!1,P.trigger("router:navigation:complete",t,n,P)}function s(t,n){e.log("Navigation Cancelled"),P.activeInstruction(O),O&&P.navigate(O.fragment,!1),B(!1),g.explicitNavigation=!1,g.navigatingBack=!1,P.trigger("router:navigation:cancelled",t,n,P)}function p(t){e.log("Navigation Redirecting"),B(!1),g.explicitNavigation=!1,g.navigatingBack=!1,P.navigate(t,{trigger:!0,replace:!0})}function h(e,t,n){g.navigatingBack=!g.explicitNavigation&&C!=n.fragment,P.trigger("router:route:activating",t,n,P),e.activateItem(t,n.params).then(function(i){if(i){var a=C;r(t,n),l(t)&&k({router:t.router,fragment:n.fragment,queryString:n.queryString}),a==t&&P.attached()}else e.settings.lifecycleData&&e.settings.lifecycleData.redirect?p(e.settings.lifecycleData.redirect):s(t,n);v&&(v.resolve(),v=null)})}function m(t,n,i){var r=P.guardRoute(n,i);r?r.then?r.then(function(r){r?e.isString(r)?p(r):h(t,n,i):s(n,i)}):e.isString(r)?p(r):h(t,n,i):s(n,i)}function y(e,t,n){P.guardRoute?m(e,t,n):h(e,t,n)}function _(e){return O&&O.config.moduleId==e.config.moduleId&&C&&(C.canReuseForRoute&&C.canReuseForRoute.apply(C,e.params)||C.router&&C.router.loadUrl)}function S(){if(!B()){var t=V.shift();if(V=[],t){if(t.router){var i=t.fragment;return t.queryString&&(i+="?"+t.queryString),t.router.loadUrl(i),void 0}B(!0),P.activeInstruction(t),_(t)?y(n.create(),C,t):e.acquire(t.config.moduleId).then(function(n){var i=e.resolveObject(n);y(N,i,t)}).fail(function(n){e.error("Failed to load routed module ("+t.config.moduleId+"). Details: "+n.message)})}}}function k(e){V.unshift(e),S()}function x(e,t,n){for(var i=e.exec(t).slice(1),r=0;r<i.length;r++){var a=i[r];i[r]=a?decodeURIComponent(a):null}var o=P.parseQueryString(n);return o&&i.push(o),{params:i,queryParams:o}}function I(t){P.trigger("router:route:before-config",t,P),e.isRegExp(t)?t.routePattern=t.route:(t.title=t.title||P.convertRouteToTitle(t.route),t.moduleId=t.moduleId||P.convertRouteToModuleId(t.route),t.hash=t.hash||P.convertRouteToHash(t.route),t.routePattern=c(t.route)),P.trigger("router:route:after-config",t,P),P.routes.push(t),P.route(t.routePattern,function(e,n){var i=x(t.routePattern,e,n);k({fragment:e,queryString:n,config:t,params:i.params,queryParams:i.queryParams})})}function A(t){if(e.isArray(t.route))for(var n=0,i=t.route.length;i>n;n++){var r=e.extend({},t);r.route=t.route[n],n>0&&delete r.nav,I(r)}else I(t);return P}function D(e){e.isActive||(e.isActive=o.computed(function(){var t=N();return t&&t.__moduleId__==e.moduleId}))}var C,O,V=[],B=o.observable(!1),N=n.create(),P={handlers:[],routes:[],navigationModel:o.observableArray([]),activeItem:N,isNavigating:o.computed(function(){var e=N(),t=B(),n=e&&e.router&&e.router!=P&&e.router.isNavigating()?!0:!1;return t||n}),activeInstruction:o.observable(null),__router__:!0};return i.includeIn(P),N.settings.areSameItem=function(e,t,n,i){return e==t?f(n,i):!1},P.parseQueryString=function(e){var t,n;if(!e)return null;if(n=e.split("&"),0==n.length)return null;t={};for(var i=0;i<n.length;i++){var r=n[i];if(""!==r){var a=r.split("=");t[a[0]]=a[1]&&decodeURIComponent(a[1].replace(/\+/g," "))}}return t},P.route=function(e,t){P.handlers.push({routePattern:e,callback:t})},P.loadUrl=function(t){var n=P.handlers,i=null,r=t,o=t.indexOf("?");if(-1!=o&&(r=t.substring(0,o),i=t.substr(o+1)),P.relativeToParentRouter){var s=this.parent.activeInstruction();r=s.params.join("/"),r&&"/"==r[0]&&(r=r.substr(1)),r||(r=""),r=r.replace("//","/").replace("//","/")}r=r.replace(b,"");for(var c=0;c<n.length;c++){var u=n[c];if(u.routePattern.test(r))return u.callback(r,i),!0}return e.log("Route Not Found"),P.trigger("router:route:not-found",t,P),O&&a.navigate(O.fragment,{trigger:!1,replace:!0}),g.explicitNavigation=!1,g.navigatingBack=!1,!1},P.updateDocumentTitle=function(e,n){n.config.title?document.title=t.title?n.config.title+" | "+t.title:n.config.title:t.title&&(document.title=t.title)},P.navigate=function(e,t){return e&&-1!=e.indexOf("://")?(window.location.href=e,!0):(g.explicitNavigation=!0,a.navigate(e,t))},P.navigateBack=function(){a.navigateBack()},P.attached=function(){setTimeout(function(){B(!1),P.trigger("router:navigation:attached",C,O,P),S()},10)},P.compositionComplete=function(){P.trigger("router:navigation:composition-complete",C,O,P)},P.convertRouteToHash=function(e){if(P.relativeToParentRouter){var t=P.parent.activeInstruction(),n=t.config.hash+"/"+e;return a._hasPushState&&(n="/"+n),n=n.replace("//","/").replace("//","/")}return a._hasPushState?e:"#"+e},P.convertRouteToModuleId=function(e){return u(e)},P.convertRouteToTitle=function(e){var t=u(e);return t.substring(0,1).toUpperCase()+t.substring(1)},P.map=function(t,n){if(e.isArray(t)){for(var i=0;i<t.length;i++)P.map(t[i]);return P}return e.isString(t)||e.isRegExp(t)?(n?e.isString(n)&&(n={moduleId:n}):n={},n.route=t):n=t,A(n)},P.buildNavigationModel=function(t){var n=[],i=P.routes;t=t||100;for(var r=0;r<i.length;r++){var a=i[r];a.nav&&(e.isNumber(a.nav)||(a.nav=t),D(a),n.push(a))}return n.sort(function(e,t){return e.nav-t.nav}),P.navigationModel(n),P},P.mapUnknownRoutes=function(t,n){var i="*catchall",r=c(i);return P.route(r,function(o,s){var c=x(r,o,s),u={fragment:o,queryString:s,config:{route:i,routePattern:r},params:c.params,queryParams:c.queryParams};if(t)if(e.isString(t))u.config.moduleId=t,n&&a.navigate(n,{trigger:!1,replace:!0});else if(e.isFunction(t)){var l=t(u);if(l&&l.then)return l.then(function(){P.trigger("router:route:before-config",u.config,P),P.trigger("router:route:after-config",u.config,P),k(u)}),void 0}else u.config=t,u.config.route=i,u.config.routePattern=r;else u.config.moduleId=o;P.trigger("router:route:before-config",u.config,P),P.trigger("router:route:after-config",u.config,P),k(u)}),P},P.reset=function(){return O=C=void 0,P.handlers=[],P.routes=[],P.off(),delete P.options,P},P.makeRelative=function(t){return e.isString(t)&&(t={moduleId:t,route:t}),t.moduleId&&!d(t.moduleId,"/")&&(t.moduleId+="/"),t.route&&!d(t.route,"/")&&(t.route+="/"),t.fromParent&&(P.relativeToParentRouter=!0),P.on("router:route:before-config").then(function(e){t.moduleId&&(e.moduleId=t.moduleId+e.moduleId),t.route&&(e.route=""===e.route?t.route.substring(0,t.route.length-1):t.route+e.route)}),P},P.createChildRouter=function(){var e=w();return e.parent=P,e},P};return g=w(),g.explicitNavigation=!1,g.navigatingBack=!1,g.activate=function(t){return e.defer(function(n){if(v=n,g.options=e.extend({routeHandler:g.loadUrl},g.options,t),a.activate(g.options),a._hasPushState)for(var i=g.routes,r=i.length;r--;){var o=i[r];o.hash=o.hash.replace("#","")}s(document).delegate("a","click",function(e){if(g.explicitNavigation=!0,a._hasPushState&&!(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)){var t=s(this).attr("href"),n=this.protocol+"//";(!t||"#"!==t.charAt(0)&&t.slice(n.length)!==n)&&(e.preventDefault(),a.navigate(t))}})}).promise()},g.deactivate=function(){a.deactivate()},g.install=function(){o.bindingHandlers.router={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,a){var s=o.utils.unwrapObservable(t())||{};if(s.__router__)s={model:s.activeItem(),attached:s.attached,compositionComplete:s.compositionComplete,activate:!1};else{var c=o.utils.unwrapObservable(s.router||i.router)||g;s.model=c.activeItem(),s.attached=c.attached,s.compositionComplete=c.compositionComplete,s.activate=!1}r.compose(e,s,a)}},o.virtualElements.allowedBindings.router=!0},g});
define('shell/shell',["plugins/router","durandal/app","main/main"],function(e,n){return{router:e,search:function(){n.showMessage("Search not yet implemented...")},activate:function(){return e.map([{route:"",title:"Main",moduleId:"main/main",nav:!0},{route:"flickr",moduleId:"viewmodels/flickr",nav:!0}]).buildNavigationModel(),n.trigger("settings:loaded",{}),e.activate()}}});
define('text!user/user.html',[],function () { return '<div data-bind="text: name">\r\n    \r\n</div>\r\n';});

define('viewmodels/flickr',["plugins/http","durandal/app","knockout"],function(e,n,t){return{displayName:"Flickr",images:t.observableArray([]),activate:function(){if(!(this.images().length>0)){var n=this;return e.jsonp("http://api.flickr.com/services/feeds/photos_public.gne",{tags:"mount ranier",tagmode:"any",format:"json"},"jsoncallback").then(function(e){n.images(e.items)})}},select:function(e){e.viewUrl="views/detail",n.showDialog(e)},canDeactivate:function(){return n.showMessage("Are you sure you want to leave this page?","Navigate",["Yes","No"])}}});
define('viewmodels/welcome',[],function(){var e=function(){this.displayName="Welcome to the Durandal Starter Kit!",this.description="Durandal is a cross-device, cross-platform client framework written in JavaScript and designed to make Single Page Applications (SPAs) easy to create and maintain.",this.features=["Clean MV* Architecture","JS & HTML Modularity","Simple App Lifecycle","Eventing, Modals, Message Boxes, etc.","Navigation & Screen State Management","Consistent Async Programming w/ Promises","App Bundling and Optimization","Use any Backend Technology","Built on top of jQuery, Knockout & RequireJS","Integrates with other libraries such as SammyJS & Bootstrap","Make jQuery & Bootstrap widgets templatable and bindable (or build your own widgets)."]};return e});
define('text!views/detail.html',[],function () { return '<div class="messageBox autoclose" style="max-width: 425px">\r\n    <div class="modal-header">\r\n        <h3>Details</h3>\r\n    </div>\r\n    <div class="modal-body">\r\n        <p data-bind="html: description"></p>\r\n    </div>\r\n</div>';});

define('text!views/flickr.html',[],function () { return '<section>\r\n    <h2 data-bind="html: displayName"></h2>\r\n    <div class="row-fluid">\r\n        <ul class="thumbnails" data-bind="foreach: images">\r\n            <li>\r\n                <a href="#" class="thumbnail" data-bind="click:$parent.select">\r\n                    <img style="width: 260px; height: 180px;" data-bind="attr: { src: media.m }"/>\r\n                </a>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</section>';});

define('text!views/welcome.html',[],function () { return '<section>\r\n    <h2 data-bind="html:displayName"></h2>\r\n    <blockquote data-bind="html:description"></blockquote>\r\n    <h3>Features</h3>\r\n    <ul data-bind="foreach: features">\r\n        <li data-bind="html: $data"></li>\r\n    </ul>\r\n    <div class="alert alert-success">\r\n      <h4>Read Me Please</h4>\r\n        For information about this template and for general documenation please visit <a href="http://www.durandaljs.com">the official site</a> and if you can\'t find \r\n        answers to your questions there, we hope you will join our <a href="https://groups.google.com/forum/?fromgroups#!forum/durandaljs">google group</a>.\r\n    </div>\r\n</section>';});

define('plugins/dialog',["durandal/system","durandal/app","durandal/composition","durandal/activator","durandal/viewEngine","jquery","knockout"],function(e,t,i,n,a,r,o){function s(t){return e.defer(function(i){e.isString(t)?e.acquire(t).then(function(t){i.resolve(e.resolveObject(t))}).fail(function(i){e.error("Failed to load dialog module ("+t+"). Details: "+i.message)}):i.resolve(t)}).promise()}var c,l={},u=0,d=function(e,t,i){this.message=e,this.title=t||d.defaultTitle,this.options=i||d.defaultOptions};return d.prototype.selectOption=function(e){c.close(this,e)},d.prototype.getView=function(){return a.processMarkup(d.defaultViewMarkup)},d.setViewUrl=function(e){delete d.prototype.getView,d.prototype.viewUrl=e},d.defaultTitle=t.title||"Application",d.defaultOptions=["Ok"],d.defaultViewMarkup=['<div data-view="plugins/messageBox" class="messageBox">','<div class="modal-header">','<h3 data-bind="text: title"></h3>',"</div>",'<div class="modal-body">','<p class="message" data-bind="text: message"></p>',"</div>",'<div class="modal-footer" data-bind="foreach: options">','<button class="btn" data-bind="click: function () { $parent.selectOption($data); }, text: $data, css: { \'btn-primary\': $index() == 0, autofocus: $index() == 0 }"></button>',"</div>","</div>"].join("\n"),c={MessageBox:d,currentZIndex:1050,getNextZIndex:function(){return++this.currentZIndex},isOpen:function(){return u>0},getContext:function(e){return l[e||"default"]},addContext:function(e,t){t.name=e,l[e]=t;var i="show"+e.substr(0,1).toUpperCase()+e.substr(1);this[i]=function(t,i){return this.show(t,i,e)}},createCompositionSettings:function(e,t){var i={model:e,activate:!1};return t.attached&&(i.attached=t.attached),t.compositionComplete&&(i.compositionComplete=t.compositionComplete),i},getDialog:function(e){return e?e.__dialog__:void 0},close:function(e){var t=this.getDialog(e);if(t){var i=Array.prototype.slice.call(arguments,1);t.close.apply(t,i)}},show:function(t,a,r){var o=this,c=l[r||"default"];return e.defer(function(e){s(t).then(function(t){var r=n.create();r.activateItem(t,a).then(function(n){if(n){var a=t.__dialog__={owner:t,context:c,activator:r,close:function(){var i=arguments;r.deactivateItem(t,!0).then(function(n){n&&(u--,c.removeHost(a),delete t.__dialog__,0==i.length?e.resolve():1==i.length?e.resolve(i[0]):e.resolve.apply(e,i))})}};a.settings=o.createCompositionSettings(t,c),c.addHost(a),u++,i.compose(a.host,a.settings)}else e.resolve(!1)})})}).promise()},showMessage:function(t,i,n){return e.isString(this.MessageBox)?c.show(this.MessageBox,[t,i||d.defaultTitle,n||d.defaultOptions]):c.show(new this.MessageBox(t,i,n))},install:function(e){t.showDialog=function(e,t,i){return c.show(e,t,i)},t.showMessage=function(e,t,i){return c.showMessage(e,t,i)},e.messageBox&&(c.MessageBox=e.messageBox),e.messageBoxView&&(c.MessageBox.prototype.getView=function(){return e.messageBoxView})}},c.addContext("default",{blockoutOpacity:.2,removeDelay:200,addHost:function(e){var t=r("body"),i=r('<div class="modalBlockout"></div>').css({"z-index":c.getNextZIndex(),opacity:this.blockoutOpacity}).appendTo(t),n=r('<div class="modalHost"></div>').css({"z-index":c.getNextZIndex()}).appendTo(t);if(e.host=n.get(0),e.blockout=i.get(0),!c.isOpen()){e.oldBodyMarginRight=t.css("margin-right"),e.oldInlineMarginRight=t.get(0).style.marginRight;var a=r("html"),o=t.outerWidth(!0),s=a.scrollTop();r("html").css("overflow-y","hidden");var l=r("body").outerWidth(!0);t.css("margin-right",l-o+parseInt(e.oldBodyMarginRight)+"px"),a.scrollTop(s)}},removeHost:function(e){if(r(e.host).css("opacity",0),r(e.blockout).css("opacity",0),setTimeout(function(){o.removeNode(e.host),o.removeNode(e.blockout)},this.removeDelay),!c.isOpen()){var t=r("html"),i=t.scrollTop();t.css("overflow-y","").scrollTop(i),e.oldInlineMarginRight?r("body").css("margin-right",e.oldBodyMarginRight):r("body").css("margin-right","")}},compositionComplete:function(e,t,i){var n=r(e),a=n.width(),o=n.height(),s=c.getDialog(i.model);n.css({"margin-top":(-o/2).toString()+"px","margin-left":(-a/2).toString()+"px"}),r(s.host).css("opacity",1),r(e).hasClass("autoclose")&&r(s.blockout).click(function(){s.close()}),r(".autofocus",e).each(function(){r(this).focus()})}}),c});
define('plugins/observable',["durandal/system","durandal/binder","knockout"],function(e,t,n){function i(e){var t=e[0];return"_"===t||"$"===t}function a(t){if(!t||e.isElement(t)||t.ko===n||t.jquery)return!1;var i=d.call(t);return-1==f.indexOf(i)&&!(t===!0||t===!1)}function r(e,t){var n=e.__observable__,i=!0;if(!n||!n.__full__){n=n||(e.__observable__={}),n.__full__=!0,v.forEach(function(n){e[n]=function(){i=!1;var e=m[n].apply(t,arguments);return i=!0,e}}),p.forEach(function(n){e[n]=function(){i&&t.valueWillMutate();var a=h[n].apply(e,arguments);return i&&t.valueHasMutated(),a}}),g.forEach(function(n){e[n]=function(){for(var a=0,r=arguments.length;r>a;a++)o(arguments[a]);i&&t.valueWillMutate();var s=h[n].apply(e,arguments);return i&&t.valueHasMutated(),s}}),e.splice=function(){for(var n=2,a=arguments.length;a>n;n++)o(arguments[n]);i&&t.valueWillMutate();var r=h.splice.apply(e,arguments);return i&&t.valueHasMutated(),r};for(var a=0,r=e.length;r>a;a++)o(e[a])}}function o(t){var o,s;if(a(t)&&(o=t.__observable__,!o||!o.__full__)){if(o=o||(t.__observable__={}),o.__full__=!0,e.isArray(t)){var l=n.observableArray(t);r(t,l)}else for(var u in t)i(u)||o[u]||(s=t[u],e.isFunction(s)||c(t,u,s));y&&e.log("Converted",t)}}function s(e,t,n){var i;e(t),i=e.peek(),n?i.destroyAll||(i||(i=[],e(i)),r(i,e)):o(i)}function c(t,i,a){var c,l,u=t.__observable__||(t.__observable__={});if(void 0===a&&(a=t[i]),e.isArray(a))c=n.observableArray(a),r(a,c),l=!0;else if("function"==typeof a){if(!n.isObservable(a))return null;c=a}else e.isPromise(a)?(c=n.observable(),a.then(function(t){if(e.isArray(t)){var i=n.observableArray(t);r(t,i),t=i}c(t)})):(c=n.observable(a),o(a));return Object.defineProperty(t,i,{configurable:!0,enumerable:!0,get:c,set:n.isWriteableObservable(c)?function(t){t&&e.isPromise(t)?t.then(function(t){s(c,t,e.isArray(t))}):s(c,t,l)}:void 0}),u[i]=c,c}function l(t,n,i){var a,r=this,o={owner:t,deferEvaluation:!0};return"function"==typeof i?o.read=i:("value"in i&&e.error('For ko.defineProperty, you must not specify a "value" for the property. You must provide a "get" function.'),"function"!=typeof i.get&&e.error('For ko.defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".'),o.read=i.get,o.write=i.set),a=r.computed(o),t[n]=a,c(t,n,a)}var u,d=Object.prototype.toString,f=["[object Function]","[object String]","[object Boolean]","[object Number]","[object Date]","[object RegExp]"],v=["remove","removeAll","destroy","destroyAll","replace"],p=["pop","reverse","sort","shift","splice"],g=["push","unshift"],h=Array.prototype,m=n.observableArray.fn,y=!1;return u=function(e,t){var i,a,r;return e?(i=e.__observable__,i&&(a=i[t])?a:(r=e[t],n.isObservable(r)?r:c(e,t,r))):null},u.defineProperty=l,u.convertProperty=c,u.convertObject=o,u.install=function(e){var n=t.binding;t.binding=function(e,t,i){i.applyBindings&&!i.skipConversion&&o(e),n(e,t)},y=e.logConversion},u});
define('plugins/serializer',["durandal/system"],function(e){return{typeAttribute:"type",space:void 0,replacer:function(e,t){if(e){var n=e[0];if("_"===n||"$"===n)return void 0}return t},serialize:function(t,n){return n=void 0===n?{}:n,(e.isString(n)||e.isNumber(n))&&(n={space:n}),JSON.stringify(t,n.replacer||this.replacer,n.space||this.space)},getTypeId:function(e){return e?e[this.typeAttribute]:void 0},typeMap:{},registerType:function(){var t=arguments[0];if(1==arguments.length){var n=t[this.typeAttribute]||e.getModuleId(t);this.typeMap[n]=t}else this.typeMap[t]=arguments[1]},reviver:function(e,t,n,i){var r=n(t);if(r){var a=i(r);if(a)return a.fromJSON?a.fromJSON(t):new a(t)}return t},deserialize:function(e,t){var n=this;t=t||{};var i=t.getTypeId||function(e){return n.getTypeId(e)},r=t.getConstructor||function(e){return n.typeMap[e]},a=t.reviver||function(e,t){return n.reviver(e,t,i,r)};return JSON.parse(e,a)}}});
define('plugins/widget',["durandal/system","durandal/composition","jquery","knockout"],function(e,t,n,i){function r(e,n){var r=i.utils.domData.get(e,c);r||(r={parts:t.cloneNodes(i.virtualElements.childNodes(e))},i.virtualElements.emptyNode(e),i.utils.domData.set(e,c,r)),n.parts=r.parts}var a={},o={},s=["model","view","kind"],c="durandal-widget-data",u={getSettings:function(t){var n=i.utils.unwrapObservable(t())||{};if(e.isString(n))return{kind:n};for(var r in n)n[r]=-1!=i.utils.arrayIndexOf(s,r)?i.utils.unwrapObservable(n[r]):n[r];return n},registerKind:function(e){i.bindingHandlers[e]={init:function(){return{controlsDescendantBindings:!0}},update:function(t,n,i,a,o){var s=u.getSettings(n);s.kind=e,r(t,s),u.create(t,s,o,!0)}},i.virtualElements.allowedBindings[e]=!0},mapKind:function(e,t,n){t&&(o[e]=t),n&&(a[e]=n)},mapKindToModuleId:function(e){return a[e]||u.convertKindToModulePath(e)},convertKindToModulePath:function(e){return"widgets/"+e+"/viewmodel"},mapKindToViewId:function(e){return o[e]||u.convertKindToViewPath(e)},convertKindToViewPath:function(e){return"widgets/"+e+"/view"},createCompositionSettings:function(e,t){return t.model||(t.model=this.mapKindToModuleId(t.kind)),t.view||(t.view=this.mapKindToViewId(t.kind)),t.preserveContext=!0,t.activate=!0,t.activationData=t,t.mode="templated",t},create:function(e,n,i,r){r||(n=u.getSettings(function(){return n},e));var a=u.createCompositionSettings(e,n);t.compose(e,a,i)},install:function(e){if(e.bindingName=e.bindingName||"widget",e.kinds)for(var t=e.kinds,n=0;n<t.length;n++)u.registerKind(t[n]);i.bindingHandlers[e.bindingName]={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,a){var o=u.getSettings(t);r(e,o),u.create(e,o,a,!0)}},i.virtualElements.allowedBindings[e.bindingName]=!0}};return u});
define('transitions/entrance',["durandal/system","durandal/composition","jquery"],function(e,t,n){var i=100,r={marginRight:0,marginLeft:0,opacity:1},o={marginLeft:"",marginRight:"",opacity:"",display:""},a=function(t){return e.defer(function(e){function a(){e.resolve()}function s(){t.keepScrollPosition||n(document).scrollTop(0)}function c(){s(),t.triggerAttach();var e={marginLeft:l?"0":"20px",marginRight:l?"0":"-20px",opacity:0,display:"block"},i=n(t.child);i.css(e),i.animate(r,u,"swing",function(){i.css(o),a()})}if(t.child){var u=t.duration||500,l=!!t.fadeOnly;t.activeView?n(t.activeView).fadeOut(i,c):c()}else n(t.activeView).fadeOut(i,a)}).promise()};return a});
require(["main"]);
}());