
;
/*!
 * jQuery JavaScript Library v1.6.2
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Thu Jun 30 14:16:56 2011 -0400
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// (both of which we optimize for)
	quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Check for digits
	rdigit = /\d/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z])/ig,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document);

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return (context || rootjQuery).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.6.2",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.done( fn );

		return this;
	},

	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).unbind( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery._Deferred();

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
		if ( obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw msg;
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return (new Function( "return " + data ))();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	// (xml & tmp used internally)
	parseXML: function( data , xml , tmp ) {

		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}

		tmp = xml.documentElement;

		if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
			jQuery.error( "Invalid XML: " + data );
		}

		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Converts a dashed string to camelCased string;
	// Used by both the css and data modules
	camelCase: function( string ) {
		return string.replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array ) {

		if ( indexOf ) {
			return indexOf.call( array, elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return (new Date()).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


var // Promise methods
	promiseMethods = "done fail isResolved isRejected promise then always pipe".split( " " ),
	// Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({
	// Create a simple deferred (one callbacks list)
	_Deferred: function() {
		var // callbacks list
			callbacks = [],
			// stored [ context , args ]
			fired,
			// to avoid firing when already doing so
			firing,
			// flag to know if the deferred has been cancelled
			cancelled,
			// the deferred itself
			deferred  = {

				// done( f1, f2, ...)
				done: function() {
					if ( !cancelled ) {
						var args = arguments,
							i,
							length,
							elem,
							type,
							_fired;
						if ( fired ) {
							_fired = fired;
							fired = 0;
						}
						for ( i = 0, length = args.length; i < length; i++ ) {
							elem = args[ i ];
							type = jQuery.type( elem );
							if ( type === "array" ) {
								deferred.done.apply( deferred, elem );
							} else if ( type === "function" ) {
								callbacks.push( elem );
							}
						}
						if ( _fired ) {
							deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
						}
					}
					return this;
				},

				// resolve with given context and args
				resolveWith: function( context, args ) {
					if ( !cancelled && !fired && !firing ) {
						// make sure args are available (#8421)
						args = args || [];
						firing = 1;
						try {
							while( callbacks[ 0 ] ) {
								callbacks.shift().apply( context, args );
							}
						}
						finally {
							fired = [ context, args ];
							firing = 0;
						}
					}
					return this;
				},

				// resolve with this as context and given arguments
				resolve: function() {
					deferred.resolveWith( this, arguments );
					return this;
				},

				// Has this deferred been resolved?
				isResolved: function() {
					return !!( firing || fired );
				},

				// Cancel
				cancel: function() {
					cancelled = 1;
					callbacks = [];
					return this;
				}
			};

		return deferred;
	},

	// Full fledged deferred (two callbacks list)
	Deferred: function( func ) {
		var deferred = jQuery._Deferred(),
			failDeferred = jQuery._Deferred(),
			promise;
		// Add errorDeferred methods, then and promise
		jQuery.extend( deferred, {
			then: function( doneCallbacks, failCallbacks ) {
				deferred.done( doneCallbacks ).fail( failCallbacks );
				return this;
			},
			always: function() {
				return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
			},
			fail: failDeferred.done,
			rejectWith: failDeferred.resolveWith,
			reject: failDeferred.resolve,
			isRejected: failDeferred.isResolved,
			pipe: function( fnDone, fnFail ) {
				return jQuery.Deferred(function( newDefer ) {
					jQuery.each( {
						done: [ fnDone, "resolve" ],
						fail: [ fnFail, "reject" ]
					}, function( handler, data ) {
						var fn = data[ 0 ],
							action = data[ 1 ],
							returned;
						if ( jQuery.isFunction( fn ) ) {
							deferred[ handler ](function() {
								returned = fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise().then( newDefer.resolve, newDefer.reject );
								} else {
									newDefer[ action ]( returned );
								}
							});
						} else {
							deferred[ handler ]( newDefer[ action ] );
						}
					});
				}).promise();
			},
			// Get a promise for this deferred
			// If obj is provided, the promise aspect is added to the object
			promise: function( obj ) {
				if ( obj == null ) {
					if ( promise ) {
						return promise;
					}
					promise = obj = {};
				}
				var i = promiseMethods.length;
				while( i-- ) {
					obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ];
				}
				return obj;
			}
		});
		// Make sure only one callback list will be used
		deferred.done( failDeferred.cancel ).fail( deferred.cancel );
		// Unexpose cancel
		delete deferred.cancel;
		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = arguments,
			i = 0,
			length = args.length,
			count = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					// Strange bug in FF4:
					// Values changed onto the arguments object sometimes end up as undefined values
					// outside the $.when method. Cloning the object into a fresh array solves the issue
					deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
				}
			};
		}
		if ( length > 1 ) {
			for( ; i < length; i++ ) {
				if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return deferred.promise();
	}
});



jQuery.support = (function() {

	var div = document.createElement( "div" ),
		documentElement = document.documentElement,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		support,
		fragment,
		body,
		testElementParent,
		testElement,
		testElementStyle,
		tds,
		events,
		eventName,
		i,
		isSupported;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName( "tbody" ).length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName( "link" ).length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains it's value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	div.innerHTML = "";

	// Figure out if the W3C box model works as expected
	div.style.width = div.style.paddingLeft = "1px";

	body = document.getElementsByTagName( "body" )[ 0 ];
	// We use our own, invisible, body unless the body is already present
	// in which case we use a div (#9239)
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0
	};
	if ( body ) {
		jQuery.extend( testElementStyle, {
			position: "absolute",
			left: -1000,
			top: -1000
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	support.boxModel = div.offsetWidth === 2;

	if ( "zoom" in div.style ) {
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		// (IE < 8 does this)
		div.style.display = "inline";
		div.style.zoom = 1;
		support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

		// Check if elements with layout shrink-wrap their children
		// (IE 6 does this)
		div.style.display = "";
		div.innerHTML = "<div style='width:4px;'></div>";
		support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
	}

	div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
	tds = div.getElementsByTagName( "td" );

	// Check if table cells still have offsetWidth/Height when they are set
	// to display:none and there are still other visible table cells in a
	// table row; if so, offsetWidth/Height are not reliable for use when
	// determining if an element has been hidden directly using
	// display:none (it is still safe to use offsets if a parent element is
	// hidden; don safety goggles and see bug #4512 for more information).
	// (only IE 8 fails this test)
	isSupported = ( tds[ 0 ].offsetHeight === 0 );

	tds[ 0 ].style.display = "";
	tds[ 1 ].style.display = "none";

	// Check if empty table cells still have offsetWidth/Height
	// (IE < 8 fail this test)
	support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Remove the body element we added
	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		} ) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Null connected elements to avoid leaks in IE
	testElement = fragment = select = opt = body = marginDiv = div = input = null;

	return support;
})();

// Keep track of boxModel
jQuery.boxModel = jQuery.support.boxModel;




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([a-z])([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var internalKey = jQuery.expando, getByName = typeof name === "string", thisCache,

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ jQuery.expando ] = id = ++jQuery.uuid;
			} else {
				id = jQuery.expando;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jQuery.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jQuery data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jQuery.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		return getByName ? 
			// Check for both converted-to-camel and non-converted data property names
			thisCache[ jQuery.camelCase( name ) ] || thisCache[ name ] :
			thisCache;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var internalKey = jQuery.expando, isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {
			var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {
				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		if ( jQuery.support.deleteExpando || cache != window ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {};
			// TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
			// metadata on plain JS objects when the object is serialized using
			// JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}

			cache[ id ][ internalKey ] = internalCache;

		// Otherwise, we need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		} else if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			} else {
				elem[ jQuery.expando ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 ) {
			    var attr = this[0].attributes, name;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var $this = jQuery( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		var name = "data-" + key.replace( rmultiDash, "$1-$2" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jQuery.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery.data( elem, deferDataKey, undefined, true );
	if ( defer &&
		( src === "queue" || !jQuery.data( elem, queueDataKey, undefined, true ) ) &&
		( src === "mark" || !jQuery.data( elem, markDataKey, undefined, true ) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery.data( elem, queueDataKey, undefined, true ) &&
				!jQuery.data( elem, markDataKey, undefined, true ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.resolve();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = (type || "fx") + "mark";
			jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
			if ( count ) {
				jQuery.data( elem, key, count, true );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		if ( elem ) {
			type = (type || "fx") + "queue";
			var q = jQuery.data( elem, type, undefined, true );
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery.data( elem, type, jQuery.makeArray(data), true );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			defer;

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
				count++;
				tmp.done( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	rinvalidChar = /\:|^on/,
	formHook, boolHook;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},
	
	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},
	
	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = (value || "").split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret,
			elem = this[0];
		
		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ? 
					// handle most common string cases
					ret.replace(rreturn, "") : 
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return undefined;
		}

		var isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
					var option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},
	
	attrFix: {
		// Always normalize to ensure hook usage
		tabindex: "tabIndex"
	},
	
	attr: function( elem, name, value, pass ) {
		var nType = elem.nodeType;
		
		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( !("getAttribute" in elem) ) {
			return jQuery.prop( elem, name, value );
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// Normalize the name if needed
		if ( notxml ) {
			name = jQuery.attrFix[ name ] || name;

			hooks = jQuery.attrHooks[ name ];

			if ( !hooks ) {
				// Use boolHook for boolean attributes
				if ( rboolean.test( name ) ) {

					hooks = boolHook;

				// Use formHook for forms and if the name contains certain characters
				} else if ( formHook && name !== "className" &&
					(jQuery.nodeName( elem, "form" ) || rinvalidChar.test( name )) ) {

					hooks = formHook;
				}
			}
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return undefined;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, name ) {
		var propName;
		if ( elem.nodeType === 1 ) {
			name = jQuery.attrFix[ name ] || name;
		
			if ( jQuery.support.getSetAttribute ) {
				// Use removeAttribute in browsers that support it
				elem.removeAttribute( name );
			} else {
				jQuery.attr( elem, name, "" );
				elem.removeAttributeNode( elem.getAttributeNode( name ) );
			}

			// Set corresponding property to false for boolean attributes
			if ( rboolean.test( name ) && (propName = jQuery.propFix[ name ] || name) in elem ) {
				elem[ propName ] = false;
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabIndex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		},
		// Use the value property for back compat
		// Use the formHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( formHook && jQuery.nodeName( elem, "button" ) ) {
					return formHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( formHook && jQuery.nodeName( elem, "button" ) ) {
					return formHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},
	
	prop: function( elem, name, value ) {
		var nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return undefined;
		}

		var ret, hooks,
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return (elem[ name ] = value);
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== undefined ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},
	
	propHooks: {}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		return jQuery.prop( elem, name ) ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !jQuery.support.getSetAttribute ) {

	// propFix is more comprehensive and contains all fixes
	jQuery.attrFix = jQuery.propFix;
	
	// Use this for any attribute on a form in IE6/7
	formHook = jQuery.attrHooks.name = jQuery.attrHooks.title = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			// Return undefined if nodeValue is empty string
			return ret && ret.nodeValue !== "" ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Check form objects in IE (multiple bugs related)
			// Only use nodeValue if the attribute node exists on the form
			var ret = elem.getAttributeNode( name );
			if ( ret ) {
				ret.nodeValue = value;
				return value;
			}
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return (elem.style.cssText = "" + value);
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	});
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
			}
		}
	});
});




var rnamespaces = /\.(.*)$/,
	rformElems = /^(?:textarea|input|select)$/i,
	rperiod = /\./g,
	rspaces = / /g,
	rescape = /[^\w\s.|`]/g,
	fcleanup = function( nm ) {
		return nm.replace(rescape, "\\$&");
	};

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function( elem, types, handler, data ) {
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if ( handler === false ) {
			handler = returnFalse;
		} else if ( !handler ) {
			// Fixes bug #7229. Fix recommended by jdalton
			return;
		}

		var handleObjIn, handleObj;

		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure
		var elemData = jQuery._data( elem );

		// If no elemData is found then we must be trying to bind to one of the
		// banned noData elements
		if ( !elemData ) {
			return;
		}

		var events = elemData.events,
			eventHandle = elemData.handle;

		if ( !events ) {
			elemData.events = events = {};
		}

		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.handle.apply( eventHandle.elem, arguments ) :
					undefined;
			};
		}

		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native events in IE.
		eventHandle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = types.split(" ");

		var type, i = 0, namespaces;

		while ( (type = types[ i++ ]) ) {
			handleObj = handleObjIn ?
				jQuery.extend({}, handleObjIn) :
				{ handler: handler, data: data };

			// Namespaced event handlers
			if ( type.indexOf(".") > -1 ) {
				namespaces = type.split(".");
				type = namespaces.shift();
				handleObj.namespace = namespaces.slice(0).sort().join(".");

			} else {
				namespaces = [];
				handleObj.namespace = "";
			}

			handleObj.type = type;
			if ( !handleObj.guid ) {
				handleObj.guid = handler.guid;
			}

			// Get the current list of functions bound to this event
			var handlers = events[ type ],
				special = jQuery.event.special[ type ] || {};

			// Init the event handler queue
			if ( !handlers ) {
				handlers = events[ type ] = [];

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add the function to the element's handler list
			handlers.push( handleObj );

			// Keep track of which events have been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, pos ) {
		// don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if ( handler === false ) {
			handler = returnFalse;
		}

		var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			events = elemData && elemData.events;

		if ( !elemData || !events ) {
			return;
		}

		// types is actually an event object here
		if ( types && types.type ) {
			handler = types.handler;
			types = types.type;
		}

		// Unbind all events for the element
		if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
			types = types || "";

			for ( type in events ) {
				jQuery.event.remove( elem, type + types );
			}

			return;
		}

		// Handle multiple events separated by a space
		// jQuery(...).unbind("mouseover mouseout", fn);
		types = types.split(" ");

		while ( (type = types[ i++ ]) ) {
			origType = type;
			handleObj = null;
			all = type.indexOf(".") < 0;
			namespaces = [];

			if ( !all ) {
				// Namespaced event handlers
				namespaces = type.split(".");
				type = namespaces.shift();

				namespace = new RegExp("(^|\\.)" +
					jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
			}

			eventType = events[ type ];

			if ( !eventType ) {
				continue;
			}

			if ( !handler ) {
				for ( j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];

					if ( all || namespace.test( handleObj.namespace ) ) {
						jQuery.event.remove( elem, origType, handleObj.handler, j );
						eventType.splice( j--, 1 );
					}
				}

				continue;
			}

			special = jQuery.event.special[ type ] || {};

			for ( j = pos || 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( handler.guid === handleObj.guid ) {
					// remove the given handler for the given type
					if ( all || namespace.test( handleObj.namespace ) ) {
						if ( pos == null ) {
							eventType.splice( j--, 1 );
						}

						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}

					if ( pos != null ) {
						break;
					}
				}
			}

			// remove generic event handler if no more handlers exist
			if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				ret = null;
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			var handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			delete elemData.events;
			delete elemData.handle;

			if ( jQuery.isEmptyObject( elemData ) ) {
				jQuery.removeData( elem, undefined, true );
			}
		}
	},
	
	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			exclusive;

		if ( type.indexOf("!") >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.exclusive = exclusive;
		event.namespace = namespaces.join(".");
		event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");
		
		// triggerHandler() and global events don't bubble or run the default action
		if ( onlyHandlers || !elem ) {
			event.preventDefault();
			event.stopPropagation();
		}

		// Handle a global trigger
		if ( !elem ) {
			// TODO: Stop taunting the data cache; remove global events and always attach to document
			jQuery.each( jQuery.cache, function() {
				// internalKey variable is just used to make it easier to find
				// and potentially change this stuff later; currently it just
				// points to jQuery.expando
				var internalKey = jQuery.expando,
					internalCache = this[ internalKey ];
				if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
					jQuery.event.trigger( event, data, internalCache.handle.elem );
				}
			});
			return;
		}

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		event.target = elem;

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		var cur = elem,
			// IE doesn't like method names with a colon (#3533, #8272)
			ontype = type.indexOf(":") < 0 ? "on" + type : "";

		// Fire event on the current element, then bubble up the DOM tree
		do {
			var handle = jQuery._data( cur, "handle" );

			event.currentTarget = cur;
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Trigger an inline bound script
			if ( ontype && jQuery.acceptData( cur ) && cur[ ontype ] && cur[ ontype ].apply( cur, data ) === false ) {
				event.result = false;
				event.preventDefault();
			}

			// Bubble up to document, then to window
			cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
		} while ( cur && !event.isPropagationStopped() );

		// If nobody prevented the default action, do it now
		if ( !event.isDefaultPrevented() ) {
			var old,
				special = jQuery.event.special[ type ] || {};

			if ( (!special._default || special._default.call( elem.ownerDocument, event ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction)() check here because IE6/7 fails that test.
				// IE<9 dies on focus to hidden element (#1486), may want to revisit a try/catch.
				try {
					if ( ontype && elem[ type ] ) {
						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];

						if ( old ) {
							elem[ ontype ] = null;
						}

						jQuery.event.triggered = type;
						elem[ type ]();
					}
				} catch ( ieError ) {}

				if ( old ) {
					elem[ ontype ] = old;
				}

				jQuery.event.triggered = undefined;
			}
		}
		
		return event.result;
	},

	handle: function( event ) {
		event = jQuery.event.fix( event || window.event );
		// Snapshot the handlers list since a called handler may add/remove events.
		var handlers = ((jQuery._data( this, "events" ) || {})[ event.type ] || []).slice(0),
			run_all = !event.exclusive && !event.namespace,
			args = Array.prototype.slice.call( arguments, 0 );

		// Use the fix-ed Event rather than the (read-only) native event
		args[0] = event;
		event.currentTarget = this;

		for ( var j = 0, l = handlers.length; j < l; j++ ) {
			var handleObj = handlers[ j ];

			// Triggered event must 1) be non-exclusive and have no namespace, or
			// 2) have namespace(s) a subset or equal to those in the bound event.
			if ( run_all || event.namespace_re.test( handleObj.namespace ) ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handleObj.handler;
				event.data = handleObj.data;
				event.handleObj = handleObj;

				var ret = handleObj.handler.apply( this, args );

				if ( ret !== undefined ) {
					event.result = ret;
					if ( ret === false ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}

				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
		return event.result;
	},

	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = jQuery.Event( originalEvent );

		for ( var i = this.props.length, prop; i; ) {
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
	},

	// Deprecated, use jQuery.guid instead
	guid: 1E8,

	// Deprecated, use jQuery.proxy instead
	proxy: jQuery.proxy,

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady,
			teardown: jQuery.noop
		},

		live: {
			add: function( handleObj ) {
				jQuery.event.add( this,
					liveConvert( handleObj.origType, handleObj.selector ),
					jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
			},

			remove: function( handleObj ) {
				jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
			}
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {

	// Check if mouse(over|out) are still within the same parent element
	var related = event.relatedTarget,
		inside = false,
		eventType = event.type;

	event.type = event.data;

	if ( related !== this ) {

		if ( related ) {
			inside = jQuery.contains( this, related );
		}

		if ( !inside ) {

			jQuery.event.handle.apply( this, arguments );

			event.type = eventType;
		}
	}
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
	event.type = event.data;
	jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		setup: function( data ) {
			jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
		},
		teardown: function( data ) {
			jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
		}
	};
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function( data, namespaces ) {
			if ( !jQuery.nodeName( this, "form" ) ) {
				jQuery.event.add(this, "click.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
						trigger( "submit", this, arguments );
					}
				});

				jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
					var elem = e.target,
						type = elem.type;

					if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
						trigger( "submit", this, arguments );
					}
				});

			} else {
				return false;
			}
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialSubmit" );
		}
	};

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

	var changeFilters,

	getVal = function( elem ) {
		var type = elem.type, val = elem.value;

		if ( type === "radio" || type === "checkbox" ) {
			val = elem.checked;

		} else if ( type === "select-multiple" ) {
			val = elem.selectedIndex > -1 ?
				jQuery.map( elem.options, function( elem ) {
					return elem.selected;
				}).join("-") :
				"";

		} else if ( jQuery.nodeName( elem, "select" ) ) {
			val = elem.selectedIndex;
		}

		return val;
	},

	testChange = function testChange( e ) {
		var elem = e.target, data, val;

		if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
			return;
		}

		data = jQuery._data( elem, "_change_data" );
		val = getVal(elem);

		// the current data will be also retrieved by beforeactivate
		if ( e.type !== "focusout" || elem.type !== "radio" ) {
			jQuery._data( elem, "_change_data", val );
		}

		if ( data === undefined || val === data ) {
			return;
		}

		if ( data != null || val ) {
			e.type = "change";
			e.liveFired = undefined;
			jQuery.event.trigger( e, arguments[1], elem );
		}
	};

	jQuery.event.special.change = {
		filters: {
			focusout: testChange,

			beforedeactivate: testChange,

			click: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( type === "radio" || type === "checkbox" || jQuery.nodeName( elem, "select" ) ) {
					testChange.call( this, e );
				}
			},

			// Change has to be called before submit
			// Keydown will be called before keypress, which is used in submit-event delegation
			keydown: function( e ) {
				var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

				if ( (e.keyCode === 13 && !jQuery.nodeName( elem, "textarea" ) ) ||
					(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
					type === "select-multiple" ) {
					testChange.call( this, e );
				}
			},

			// Beforeactivate happens also before the previous element is blurred
			// with this event you can't trigger a change event, but you can store
			// information
			beforeactivate: function( e ) {
				var elem = e.target;
				jQuery._data( elem, "_change_data", getVal(elem) );
			}
		},

		setup: function( data, namespaces ) {
			if ( this.type === "file" ) {
				return false;
			}

			for ( var type in changeFilters ) {
				jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
			}

			return rformElems.test( this.nodeName );
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialChange" );

			return rformElems.test( this.nodeName );
		}
	};

	changeFilters = jQuery.event.special.change.filters;

	// Handle when the input is .focus()'d
	changeFilters.focus = changeFilters.beforeactivate;
}

function trigger( type, elem, args ) {
	// Piggyback on a donor event to simulate a different one.
	// Fake originalEvent to avoid donor's stopPropagation, but if the
	// simulated event prevents default then we do the same on the donor.
	// Don't pass args or remember liveFired; they apply to the donor event.
	var event = jQuery.extend( {}, args[ 0 ] );
	event.type = type;
	event.originalEvent = {};
	event.liveFired = undefined;
	jQuery.event.handle.call( elem, event );
	if ( event.isDefaultPrevented() ) {
		args[ 0 ].preventDefault();
	}
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0;

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};

		function handler( donor ) {
			// Donor event is always a native one; fix it and switch its type.
			// Let focusin/out handler cancel the donor focus/blur event.
			var e = jQuery.event.fix( donor );
			e.type = fix;
			e.originalEvent = {};
			jQuery.event.trigger( e, null, e.target );
			if ( e.isDefaultPrevented() ) {
				donor.preventDefault();
			}
		}
	});
}

jQuery.each(["bind", "one"], function( i, name ) {
	jQuery.fn[ name ] = function( type, data, fn ) {
		var handler;

		// Handle object literals
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}

		if ( arguments.length === 2 || data === false ) {
			fn = data;
			data = undefined;
		}

		if ( name === "one" ) {
			handler = function( event ) {
				jQuery( this ).unbind( event, handler );
				return fn.apply( this, arguments );
			};
			handler.guid = fn.guid || jQuery.guid++;
		} else {
			handler = fn;
		}

		if ( type === "unload" && name !== "one" ) {
			this.one( type, data, fn );

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.add( this[i], type, handler, data );
			}
		}

		return this;
	};
});

jQuery.fn.extend({
	unbind: function( type, fn ) {
		// Handle object literals
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.live( types, data, fn, selector );
	},

	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
			return this.unbind( "live" );

		} else {
			return this.die( types, null, fn, selector );
		}
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},

	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

var liveMap = {
	focus: "focusin",
	blur: "focusout",
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
	jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
		var type, i = 0, match, namespaces, preType,
			selector = origSelector || this.selector,
			context = origSelector ? this : jQuery( this.context );

		if ( typeof types === "object" && !types.preventDefault ) {
			for ( var key in types ) {
				context[ name ]( key, data, types[key], selector );
			}

			return this;
		}

		if ( name === "die" && !types &&
					origSelector && origSelector.charAt(0) === "." ) {

			context.unbind( origSelector );

			return this;
		}

		if ( data === false || jQuery.isFunction( data ) ) {
			fn = data || returnFalse;
			data = undefined;
		}

		types = (types || "").split(" ");

		while ( (type = types[ i++ ]) != null ) {
			match = rnamespaces.exec( type );
			namespaces = "";

			if ( match )  {
				namespaces = match[0];
				type = type.replace( rnamespaces, "" );
			}

			if ( type === "hover" ) {
				types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
				continue;
			}

			preType = type;

			if ( liveMap[ type ] ) {
				types.push( liveMap[ type ] + namespaces );
				type = type + namespaces;

			} else {
				type = (liveMap[ type ] || type) + namespaces;
			}

			if ( name === "live" ) {
				// bind live handler
				for ( var j = 0, l = context.length; j < l; j++ ) {
					jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
						{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
				}

			} else {
				// unbind live handler
				context.unbind( "live." + liveConvert( type, selector ), fn );
			}
		}

		return this;
	};
});

function liveHandler( event ) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = jQuery._data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
	if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
		return;
	}

	if ( event.namespace ) {
		namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		close = match[i];

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
				elem = close.elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					event.type = handleObj.preType;
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];

					// Make sure not to accidentally match a child element with the same selector
					if ( related && jQuery.contains( elem, related ) ) {
						related = elem;
					}
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj, level: close.level });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];

		if ( maxLevel && match.level > maxLevel ) {
			break;
		}

		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		ret = match.handleObj.origHandler.apply( match.elem, arguments );

		if ( ret === false || event.isPropagationStopped() ) {
			maxLevel = match.level;

			if ( ret === false ) {
				stop = false;
			}
			if ( event.isImmediatePropagationStopped() ) {
				break;
			}
		}
	}

	return stop;
}

function liveConvert( type, selector ) {
	return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspaces, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.bind( name, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( typeof selector === "string" ?
			jQuery.filter( selector, this ).length > 0 :
			this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array
		if ( jQuery.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[ selector ] ) {
						matches[ selector ] = POS.test( selector ) ?
							jQuery( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[ selector ];

						if ( match.jquery ? match.index( cur ) > -1 : jQuery( cur ).is( match ) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jQuery.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jQuery( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until ),
			// The variable 'args' was introduced in
			// https://github.com/jquery/jquery/commit/52a0238
			// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
			// http://code.google.com/p/v8/issues/detail?id=1050
			args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
	});
}




var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnocache = /<(?:script|object|embed|option|style)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jQuery( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery(arguments[0]);
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnocache.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || (l > 1 && i < lastIndex) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var internalKey = jQuery.expando,
		oldData = jQuery.data( src ),
		curData = jQuery.data( dest, oldData );

	// Switch to use the internal data object, if it exists, for the next
	// stage of data copying
	if ( (oldData = oldData[ internalKey ]) ) {
		var events = oldData.events;
				curData = curData[ internalKey ] = jQuery.extend({}, oldData);

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( var type in events ) {
				for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
				}
			}
		}
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc;

  // nodes may contain either an explicit document object,
  // a jQuery collection or context object.
  // If nodes[0] contains a valid object to assign to doc
  if ( nodes && nodes[0] ) {
    doc = nodes[0].ownerDocument || nodes[0];
  }

  // Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ args[0] ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = (i > 0 ? this.clone(true) : this).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( "getElementsByTagName" in elem ) {
		return elem.getElementsByTagName( "*" );

	} else if ( "querySelectorAll" in elem ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	if ( jQuery.nodeName( elem, "input" ) ) {
		fixDefaultChecked( elem );
	} else if ( "getElementsByTagName" in elem ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var clone = elem.cloneNode(true),
				srcElements,
				destElements,
				i;

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName
			// instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				cloneFixAttributes( srcElements[i], destElements[i] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ] && cache[ id ][ internalKey ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}



var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^[+\-]=/,
	rrelNumFilter = /[^+\-\.\de]+/g,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Make sure that NaN and null values aren't set. See: #7116
			if ( type === "number" && isNaN( value ) || value == null ) {
				return;
			}

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && rrelNum.test( value ) ) {
				value = +value.replace( rrelNumFilter, "" ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle;

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// Set the alpha filter to set the opacity
			var opacity = jQuery.isNaN( value ) ?
				"" :
				"alpha(opacity=" + value * 100 + ")",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( !(defaultView = elem.ownerDocument.defaultView) ) {
			return undefined;
		}

		if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
			style = elem.style;

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
			// Remember the original values
			left = style.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : (ret || 0);
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			jQuery.each( which, function() {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
				}
			});
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		jQuery.each( which, function() {
			val += parseFloat( jQuery.css( elem, "padding" + this ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + this + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + this ) ) || 0;
			}
		});
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts;

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for(; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for(; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.bind( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function ( target, settings ) {
		if ( !settings ) {
			// Only one parameter, we extend ajaxSettings
			settings = target;
			target = jQuery.extend( true, jQuery.ajaxSettings, settings );
		} else {
			// target was provided, we extend into it
			jQuery.extend( true, target, jQuery.ajaxSettings, settings );
		}
		// Flatten fields we don't want deep extended
		for( var field in { context: 1, url: 1 } ) {
			if ( field in settings ) {
				target[ field ] = settings[ field ];
			} else if( field in jQuery.ajaxSettings ) {
				target[ field ] = jQuery.ajaxSettings[ field ];
			}
		}
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": "*/*"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery._Deferred(),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, statusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status ? 4 : 0;

			var isSuccess,
				success,
				error,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = statusText;

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.done;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( status < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					jQuery.error( e );
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for( key in s.converters ) {
				if( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow,
	requestAnimationFrame = window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
						jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[i];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data(elem, "olddisplay") || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				if ( this[i].style ) {
					var display = jQuery.css( this[i], "display" );

					if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
						jQuery._data( this[i], "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		return this[ optall.queue === false ? "each" : "queue" ](function() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p,
				display, e,
				parts, start, end, unit;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height
					// animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {
						if ( !jQuery.support.inlineBlockNeedsLayout ) {
							this.style.display = "inline-block";

						} else {
							display = defaultDisplay( this.nodeName );

							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if ( display === "inline" ) {
								this.style.display = "inline-block";

							} else {
								this.style.display = "inline";
								this.style.zoom = 1;
							}
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ((end || 1) / e.cur()) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		});
	},

	stop: function( clearQueue, gotoEnd ) {
		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			var timers = jQuery.timers,
				i = timers.length;
			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}
			while ( i-- ) {
				if ( timers[i].elem === this ) {
					if (gotoEnd) {
						// force the next step to be the last
						timers[i](true);
					}

					timers.splice(i, 1);
				}
			}
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue !== false ) {
				jQuery.dequeue( this );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx,
			raf;

		this.startTime = fxNow || createFxNow();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
		this.now = this.start;
		this.pos = this.state = 0;

		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			// Use requestAnimationFrame instead of setInterval if available
			if ( requestAnimationFrame ) {
				timerId = true;
				raf = function() {
					// When timerId gets set to null at any point, this stops
					if ( timerId ) {
						requestAnimationFrame( raf );
						fx.tick();
					}
				};
				requestAnimationFrame( raf );
			} else {
				timerId = setInterval( fx.tick, fx.interval );
			}
		}
	},

	// Simple 'show' function
	show: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options,
			i, n;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( i in options.animatedProperties ) {
				if ( options.animatedProperties[i] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function (index, value) {
						elem.style[ "overflow" + value ] = options.overflow[index];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery(elem).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( var p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[p] );
					}
				}

				// Execute the complete function
				options.complete.call( elem );
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[ this.prop ] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ((this.end - this.start) * this.pos);
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		for ( var timers = jQuery.timers, i = 0 ; i < timers.length ; ++i ) {
			if ( !timers[i]() ) {
				timers.splice(i--, 1);
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );

		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );

			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		jQuery.offset.initialize();

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {
	initialize: function() {
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed";
		checkDiv.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden";
		innerDiv.style.position = "relative";

		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		jQuery.offset.initialize = jQuery.noop;
	},

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		jQuery.offset.initialize();

		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({
	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem && elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem && elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ];
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				elem.document.body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNaN( ret ) ? orig : ret;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});


// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;
})(window);

/**
 * Helper function to be able to use the jquery mobile mobileinit event
 * in the standalone build, that already includes jquery and jquery mobile.
 */
(function(window) {
    if (window.mobileinit) {
        $(window.document).bind("mobileinit", function() {
            window.mobileinit.apply(this, arguments);
        });
    }

})(window);

/**
 * @license AngularJS v0.9.19
 * (c) 2010-2011 AngularJS http://angularjs.org
 * License: MIT
 */

(function(window, document, undefined){

////////////////////////////////////

if (typeof document.getAttribute == $undefined)
  document.getAttribute = function() {};

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.lowercase
 * @function
 *
 * @description Converts string to lowercase
 * @param {string} string String to be lowercased.
 * @returns {string} Lowercased string.
 */
var lowercase = function (string){ return isString(string) ? string.toLowerCase() : string; };


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.uppercase
 * @function
 *
 * @description Converts string to uppercase.
 * @param {string} string String to be uppercased.
 * @returns {string} Uppercased string.
 */
var uppercase = function (string){ return isString(string) ? string.toUpperCase() : string; };


var manualLowercase = function (s) {
  return isString(s)
      ? s.replace(/[A-Z]/g, function (ch) {return fromCharCode(ch.charCodeAt(0) | 32); })
      : s;
};
var manualUppercase = function (s) {
  return isString(s)
      ? s.replace(/[a-z]/g, function (ch) {return fromCharCode(ch.charCodeAt(0) & ~32); })
      : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods with
// correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}

function fromCharCode(code) { return String.fromCharCode(code); }


var _undefined        = undefined,
    _null             = null,
    $$element         = '$element',
    $$scope           = '$scope',
    $$validate        = '$validate',
    $angular          = 'angular',
    $array            = 'array',
    $boolean          = 'boolean',
    $console          = 'console',
    $date             = 'date',
    $element          = 'element',
    $function         = 'function',
    $length           = 'length',
    $name             = 'name',
    $noop             = 'noop',
    $null             = 'null',
    $number           = 'number',
    $object           = 'object',
    $string           = 'string',
    $value            = 'value',
    $selected         = 'selected',
    $undefined        = 'undefined',
    NG_EXCEPTION      = 'ng-exception',
    NG_VALIDATION_ERROR = 'ng-validation-error',
    NOOP              = 'noop',
    PRIORITY_FIRST    = -99999,
    PRIORITY_WATCH    = -1000,
    PRIORITY_LAST     =  99999,
    PRIORITY          = {'FIRST': PRIORITY_FIRST, 'LAST': PRIORITY_LAST, 'WATCH':PRIORITY_WATCH},
    Error             = window.Error,
    /** holds major version number for IE or NaN for real browsers */
    msie              = parseInt((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10),
    jqLite,           // delay binding since jQuery could be loaded after us.
    jQuery,           // delay binding
    slice             = [].slice,
    push              = [].push,
    error             = window[$console]
                           ? bind(window[$console], window[$console]['error'] || noop)
                           : noop,

    /** @name angular */
    angular           = window[$angular] || (window[$angular] = {}),
    /** @name angular.markup */
    angularTextMarkup = extensionMap(angular, 'markup'),
    /** @name angular.attrMarkup */
    angularAttrMarkup = extensionMap(angular, 'attrMarkup'),
    /** @name angular.directive */
    angularDirective  = extensionMap(angular, 'directive'),
    /** @name angular.widget */
    angularWidget     = extensionMap(angular, 'widget', lowercase),
    /** @name angular.validator */
    angularValidator  = extensionMap(angular, 'validator'),
    /** @name angular.fileter */
    angularFilter     = extensionMap(angular, 'filter'),
    /** @name angular.formatter */
    angularFormatter  = extensionMap(angular, 'formatter'),
    /** @name angular.service */
    angularService    = extensionMap(angular, 'service'),
    angularCallbacks  = extensionMap(angular, 'callbacks'),
    nodeName_,
    rngScript         = /^(|.*\/)angular(-.*?)?(\.min)?.js(\?[^#]*)?(#(.*))?$/,
    uid               = ['0', '0', '0'],
    DATE_ISOSTRING_LN = 24;

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.forEach
 * @function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection. The collection can either
 * be an object or an array. The `iterator` function is invoked with `iterator(value, key)`, where
 * `value` is the value of an object property or an array element and `key` is the object property
 * key or array element index. Optionally, `context` can be specified for the iterator function.
 *
 * Note: this function was previously known as `angular.foreach`.
 *
   <pre>
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender:male']);
   </pre>
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {function()} iterator Iterator function.
 * @param {Object} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj, iterator, context) {
  var key;
  if (obj) {
    if (isFunction(obj)){
      for (key in obj) {
        if (key != 'prototype' && key != $length && key != $name && obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context);
    } else if (isObject(obj) && isNumber(obj.length)) {
      for (key = 0; key < obj.length; key++)
        iterator.call(context, obj[key], key);
    } else {
      for (key in obj)
        iterator.call(context, obj[key], key);
    }
  }
  return obj;
}

function forEachSorted(obj, iterator, context) {
  var keys = [];
  for (var key in obj) keys.push(key);
  keys.sort();
  for ( var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}


function formatError(arg) {
  if (arg instanceof Error) {
    if (arg.stack) {
      arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ?
            'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
    } else if (arg.sourceURL) {
      arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
    }
  }
  return arg;
}

/**
 * @description
 * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
 * characters such as '012ABC'. The reason why we are not using simply a number counter is that
 * the number string gets longer over time, and it can also overflow, where as the the nextId
 * will grow much slower, it is a string, and it will never overflow.
 *
 * @returns an unique alpha-numeric string
 */
function nextUid() {
  var index = uid.length;
  var digit;

  while(index) {
    index--;
    digit = uid[index].charCodeAt(0);
    if (digit == 57 /*'9'*/) {
      uid[index] = 'A';
      return uid.join('');
    }
    if (digit == 90  /*'Z'*/) {
      uid[index] = '0';
    } else {
      uid[index] = String.fromCharCode(digit + 1);
      return uid.join('');
    }
  }
  uid.unshift('0');
  return uid.join('');
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.extend
 * @function
 *
 * @description
 * Extends the destination object `dst` by copying all of the properties from the `src` object(s) to
 * `dst`. You can specify multiple `src` objects.
 *
 * @param {Object} dst The destination object.
 * @param {...Object} src The source object(s).
 */
function extend(dst) {
  forEach(arguments, function(obj){
    if (obj !== dst) {
      forEach(obj, function(value, key){
        dst[key] = value;
      });
    }
  });
  return dst;
}


function inherit(parent, extra) {
  return extend(new (extend(function(){}, {prototype:parent}))(), extra);
}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.noop
 * @function
 *
 * @description
 * Empty function that performs no operation whatsoever. This function is useful when writing code
 * in the functional style.
   <pre>
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   </pre>
 */
function noop() {}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.identity
 * @function
 *
 * @description
 * A function that does nothing except for returning its first argument. This function is useful
 * when writing code in the functional style.
 *
   <pre>
     function transformer(transformationFn, value) {
       return (transformationFn || identity)(value);
     };
   </pre>
 */
function identity($) {return $;}


function valueFn(value) {return function(){ return value; };}

function extensionMap(angular, name, transform) {
  var extPoint;
  return angular[name] || (extPoint = angular[name] = function (name, fn, prop){
    name = (transform || identity)(name);
    if (isDefined(fn)) {
      extPoint[name] = extend(fn, prop || {});
    }
    return extPoint[name];
  });
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isUndefined
 * @function
 *
 * @description
 * Checks if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value){ return typeof value == $undefined; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isDefined
 * @function
 *
 * @description
 * Checks if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value){ return typeof value != $undefined; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isObject
 * @function
 *
 * @description
 * Checks if a reference is an `Object`. Unlike in JavaScript `null`s are not considered to be
 * objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value){ return value!=null && typeof value == $object;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isString
 * @function
 *
 * @description
 * Checks if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value){ return typeof value == $string;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isNumber
 * @function
 *
 * @description
 * Checks if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value){ return typeof value == $number;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isDate
 * @function
 *
 * @description
 * Checks if value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value){ return value instanceof Date; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isArray
 * @function
 *
 * @description
 * Checks if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
function isArray(value) { return value instanceof Array; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isFunction
 * @function
 *
 * @description
 * Checks if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value){ return typeof value == $function;}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
  return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

function isBoolean(value) { return typeof value == $boolean;}
function isTextNode(node) { return nodeName_(node) == '#text'; }
function trim(value) { return isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value; }
function isElement(node) {
  return node &&
    (node.nodeName  // we are a direct element
    || (node.bind && node.find));  // we have a bind and find method part of jQuery API
}

/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str){
  var obj = {}, items = str.split(","), i;
  for ( i = 0; i < items.length; i++ )
    obj[ items[i] ] = true;
  return obj;
}



/**
 * HTML class which is the only class which can be used in ng:bind to inline HTML for security reasons.
 * @constructor
 * @param html raw (unsafe) html
 * @param {string=} option if set to 'usafe' then get method will return raw (unsafe/unsanitized) html
 */
function HTML(html, option) {
  this.html = html;
  this.get = lowercase(option) == 'unsafe'
    ? valueFn(html)
    : function htmlSanitize() {
        var buf = [];
        htmlParser(html, htmlSanitizeWriter(buf));
        return buf.join('');
      };
}

if (msie < 9) {
  nodeName_ = function(element) {
    element = element.nodeName ? element : element[0];
    return (element.scopeName && element.scopeName != 'HTML' ) ? uppercase(element.scopeName + ':' + element.nodeName) : element.nodeName;
  };
} else {
  nodeName_ = function(element) {
    return element.nodeName ? element.nodeName : element[0].nodeName;
  };
}

function isVisible(element) {
  var rect = element[0].getBoundingClientRect(),
      width = (rect.width || (rect.right||0 - rect.left||0)),
      height = (rect.height || (rect.bottom||0 - rect.top||0));
  return width>0 && height>0;
}

function map(obj, iterator, context) {
  var results = [];
  forEach(obj, function(value, index, list) {
    results.push(iterator.call(context, value, index, list));
  });
  return results;
}


/**
 * @ngdoc function
 * @name angular.Object.size
 * @function
 *
 * @description
 * Determines the number of elements in an array, number of properties of an object or string
 * length.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {Object|Array|string} obj Object, array or string to inspect.
 * @param {boolean} [ownPropsOnly=false] Count only "own" properties in an object
 * @returns {number} The size of `obj` or `0` if `obj` is neither an object or an array.
 *
 * @example
 * <doc:example>
 *  <doc:source>
 *   Number of items in array: {{ [1,2].$size() }}<br/>
 *   Number of items in object: {{ {a:1, b:2, c:3}.$size() }}<br/>
 *  </doc:source>
 *  <doc:scenario>
 *   it('should print correct sizes for an array and an object', function() {
 *     expect(binding('[1,2].$size()')).toBe('2');
 *     expect(binding('{a:1, b:2, c:3}.$size()')).toBe('3');
 *   });
 *  </doc:scenario>
 * </doc:example>
 */
function size(obj, ownPropsOnly) {
  var size = 0, key;

  if (isArray(obj) || isString(obj)) {
    return obj.length;
  } else if (isObject(obj)){
    for (key in obj)
      if (!ownPropsOnly || obj.hasOwnProperty(key))
        size++;
  }

  return size;
}


function includes(array, obj) {
  for ( var i = 0; i < array.length; i++) {
    if (obj === array[i]) return true;
  }
  return false;
}

function indexOf(array, obj) {
  for ( var i = 0; i < array.length; i++) {
    if (obj === array[i]) return i;
  }
  return -1;
}

function isLeafNode (node) {
  if (node) {
    switch (node.nodeName) {
    case "OPTION":
    case "PRE":
    case "TITLE":
      return true;
    }
  }
  return false;
}

/**
 * @ngdoc function
 * @name angular.Object.copy
 * @function
 *
 * @description
 * Creates a deep copy of `source`.
 *
 * If `source` is an object or an array, all of its members will be copied into the `destination`
 * object.
 *
 * If `destination` is not provided and `source` is an object or an array, a copy is created &
 * returned, otherwise the `source` is returned.
 *
 * If `destination` is provided, all of its properties will be deleted.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {*} source The source to be used to make a copy.
 *                   Can be any type including primitives, `null` and `undefined`.
 * @param {(Object|Array)=} destination Optional destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination` if `destination` was specified.
 *
 * @example
 * <doc:example>
 *  <doc:source>
     Salutation: <input type="text" name="master.salutation" value="Hello" /><br/>
     Name: <input type="text" name="master.name" value="world"/><br/>
     <button ng:click="form = master.$copy()">copy</button>
     <hr/>

     The master object is <span ng:hide="master.$equals(form)">NOT</span> equal to the form object.

     <pre>master={{master}}</pre>
     <pre>form={{form}}</pre>
 *  </doc:source>
 *  <doc:scenario>
   it('should print that initialy the form object is NOT equal to master', function() {
     expect(element('.doc-example-live input[name=master.salutation]').val()).toBe('Hello');
     expect(element('.doc-example-live input[name=master.name]').val()).toBe('world');
     expect(element('.doc-example-live span').css('display')).toBe('inline');
   });

   it('should make form and master equal when the copy button is clicked', function() {
     element('.doc-example-live button').click();
     expect(element('.doc-example-live span').css('display')).toBe('none');
   });
 *  </doc:scenario>
 * </doc:example>
 */
function copy(source, destination){
  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, []);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isObject(source)) {
        destination = copy(source, {});
      }
    }
  } else {
    if (isArray(source)) {
      while(destination.length) {
        destination.pop();
      }
      for ( var i = 0; i < source.length; i++) {
        destination.push(copy(source[i]));
      }
    } else {
      forEach(destination, function(value, key){
        delete destination[key];
      });
      for ( var key in source) {
        destination[key] = copy(source[key]);
      }
    }
  }
  return destination;
}


/**
 * @ngdoc function
 * @name angular.Object.equals
 * @function
 *
 * @description
 * Determines if two objects or value are equivalent.
 *
 * To be equivalent, they must pass `==` comparison or be of the same type and have all their
 * properties pass `==` comparison. During property comparision properties of `function` type and
 * properties with name starting with `$` are ignored.
 *
 * Supports values types, arrays and objects.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 *
 * @example
 * <doc:example>
 *  <doc:source>
     Salutation: <input type="text" name="greeting.salutation" value="Hello" /><br/>
     Name: <input type="text" name="greeting.name" value="world"/><br/>
     <hr/>

     The <code>greeting</code> object is
     <span ng:hide="greeting.$equals({salutation:'Hello', name:'world'})">NOT</span> equal to
     <code>{salutation:'Hello', name:'world'}</code>.

     <pre>greeting={{greeting}}</pre>
 *  </doc:source>
 *  <doc:scenario>
     it('should print that initialy greeting is equal to the hardcoded value object', function() {
       expect(element('.doc-example-live input[name=greeting.salutation]').val()).toBe('Hello');
       expect(element('.doc-example-live input[name=greeting.name]').val()).toBe('world');
       expect(element('.doc-example-live span').css('display')).toBe('none');
     });

     it('should say that the objects are not equal when the form is modified', function() {
       input('greeting.name').enter('kitty');
       expect(element('.doc-example-live span').css('display')).toBe('inline');
     });
 *  </doc:scenario>
 * </doc:example>
 */
function equals(o1, o2) {
  if (o1 == o2) return true;
  if (o1 === null || o2 === null) return false;
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2 && t1 == 'object') {
    if (o1 instanceof Array) {
      if ((length = o1.length) == o2.length) {
        for(key=0; key<length; key++) {
          if (!equals(o1[key], o2[key])) return false;
        }
        return true;
      }
    } else {
      keySet = {};
      for(key in o1) {
        if (key.charAt(0) !== '$' && !isFunction(o1[key]) && !equals(o1[key], o2[key])) return false;
        keySet[key] = true;
      }
      for(key in o2) {
        if (!keySet[key] && key.charAt(0) !== '$' && !isFunction(o2[key])) return false;
      }
      return true;
    }
  }
  return false;
}

function setHtml(node, html) {
  if (isLeafNode(node)) {
    if (msie) {
      node.innerText = html;
    } else {
      node.textContent = html;
    }
  } else {
    node.innerHTML = html;
  }
}

function isRenderableElement(element) {
  var name = element && element[0] && element[0].nodeName;
  return name && name.charAt(0) != '#' &&
    !includes(['TR', 'COL', 'COLGROUP', 'TBODY', 'THEAD', 'TFOOT'], name);
}

function elementError(element, type, error) {
  var parent;

  while (!isRenderableElement(element)) {
    parent = element.parent();
    if (parent.length) {
      element = element.parent();
    } else {
      return;
    }
  }

  if (element[0]['$NG_ERROR'] !== error) {
    element[0]['$NG_ERROR'] = error;
    if (error) {
      element.addClass(type);
      element.attr(type, error.message || error);
    } else {
      element.removeClass(type);
      element.removeAttr(type);
    }
  }
}

function concat(array1, array2, index) {
  return array1.concat(slice.call(array2, index, array2.length));
}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.bind
 * @function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for `fn`).
 * Optional `args` can be supplied which are prebound to the function, also known as
 * [function currying](http://en.wikipedia.org/wiki/Currying).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
function bind(self, fn) {
  var curryArgs = arguments.length > 2
    ? slice.call(arguments, 2, arguments.length)
    : [];
  if (typeof fn == $function && !(fn instanceof RegExp)) {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0, arguments.length)))
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    // in IE, native methods are not functions and so they can not be bound (but they don't need to be)
    return fn;
  }
}

function toBoolean(value) {
  if (value && value.length !== 0) {
    var v = lowercase("" + value);
    value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
  } else {
    value = false;
  }
  return value;
}

function merge(src, dst) {
  for ( var key in src) {
    var value = dst[key];
    var type = typeof value;
    if (type == $undefined) {
      dst[key] = fromJson(toJson(src[key]));
    } else if (type == 'object' && value.constructor != array &&
        key.substring(0, 1) != "$") {
      merge(src[key], value);
    }
  }
}


/** @name angular.compile */
function compile(element) {
  return new Compiler(angularTextMarkup, angularAttrMarkup, angularDirective, angularWidget)
    .compile(element);
}
/////////////////////////////////////////////////

/**
 * Parses an escaped url query string into key-value pairs.
 * @returns Object.<(string|boolean)>
 */
function parseKeyValue(/**string*/keyValue) {
  var obj = {}, key_value, key;
  forEach((keyValue || "").split('&'), function(keyValue){
    if (keyValue) {
      key_value = keyValue.split('=');
      key = unescape(key_value[0]);
      obj[key] = isDefined(key_value[1]) ? unescape(key_value[1]) : true;
    }
  });
  return obj;
}

function toKeyValue(obj) {
  var parts = [];
  forEach(obj, function(value, key) {
    parts.push(escape(key) + (value === true ? '' : '=' + escape(value)));
  });
  return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom mehtod because encodeURIComponent is too agressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
  return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method becuase encodeURIComponent is too agressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace((pctEncodeSpaces ? null : /%20/g), '+');
}


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:autobind
 * @element script
 *
 * @TODO ng:autobind is not a directive!! it should be documented as bootstrap parameter in a
 *     separate bootstrap section.
 * @TODO rename to ng:autobind to ng:autoboot
 *
 * @description
 *
 * `ng:autobind` with no parameters tells angular to compile and manage the whole page.
 *
 * `ng:autobind="[root element ID]"` tells angular to compile and manage part of the docucment,
 * starting at "root element ID".
 *
 * For details on bootstrapping angular, see {@link guide/dev_guide.bootstrap Initializing Angular}
 * in the Angular Developer Guide.
 */
function angularInit(config, document){
  var autobind = config.autobind;

  if (autobind) {
    var element = isString(autobind) ? document.getElementById(autobind) : document,
        scope = compile(element)(createScope({'$config':config})),
        $browser = scope.$service('$browser');

    if (config.css)
      $browser.addCss(config.base_url + config.css);
    else if(msie<8)
      $browser.addJs(config.ie_compat, config.ie_compat_id);
  }
}

function angularJsConfig(document, config) {
  bindJQuery();
  var scripts = document.getElementsByTagName("script"),
      match;
  config = extend({
    ie_compat_id: 'ng-ie-compat'
  }, config);
  for(var j = 0; j < scripts.length; j++) {
    match = (scripts[j].src || "").match(rngScript);
    if (match) {
      config.base_url = match[1];
      config.ie_compat = match[1] + 'angular-ie-compat' + (match[2] || '') + '.js';
      extend(config, parseKeyValue(match[6]));
      eachAttribute(jqLite(scripts[j]), function(value, name){
        if (/^ng:/.exec(name)) {
          name = name.substring(3).replace(/-/g, '_');
          value = value || true;
          config[name] = value;
        }
      });
    }
  }
  return config;
}

function bindJQuery(){
  // bind to jQuery if present;
  jQuery = window.jQuery;
  // reset to jQuery or default to us.
  if (jQuery) {
    jqLite = jQuery;
    extend(jQuery.fn, {
      scope: JQLitePrototype.scope
    });
  } else {
    jqLite = jqLiteWrap;
  }
  angular.element = jqLite;
}

/**
 * throw error of the argument is falsy.
 */
function assertArg(arg, name, reason) {
  if (!arg) {
    var error = new Error("Argument '" + (name||'?') + "' is " +
        (reason || "required"));
    throw error;
  }
}

function assertArgFn(arg, name) {
  assertArg(isFunction(arg, name, 'not a function'));
}


/**
 * @ngdoc property
 * @name angular.version
 * @description
 * Object which contains information about the current AngularJS version. The object has following
 * properties:
 *
 * - `full` – `{string}` – full version string, e.g. "0.9.18"
 * - `major` – `{number}` – major version number, e.g. 0
 * - `minor` – `{number}` – minor version number, e.g. 9
 * - `dot` – `{number}` – dot version number, e.g. 18
 * - `codeName` – `{string}` – code name of the release, e.g. "jiggling-armfat"
 */
var version = {
  full: '0.9.19',    // all of these placeholder strings will be replaced by rake's
  major: 0,    // compile task
  minor: 9,
  dot: 19,
  codeName: 'canine-psychokinesis'
};

var array = [].constructor;

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.toJson
 * @function
 *
 * @description
 * Serializes the input into a JSON formated string.
 *
 * @param {Object|Array|Date|string|number} obj Input to jsonify.
 * @param {boolean=} pretty If set to true, the JSON output will contain newlines and whitespace.
 * @returns {string} Jsonified string representing `obj`.
 */
function toJson(obj, pretty) {
  var buf = [];
  toJsonArray(buf, obj, pretty ? "\n  " : null, []);
  return buf.join('');
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.fromJson
 * @function
 *
 * @description
 * Deserializes a string in the JSON format.
 *
 * @param {string} json JSON string to deserialize.
 * @param {boolean} [useNative=false] Use native JSON parser if available
 * @returns {Object|Array|Date|string|number} Deserialized thingy.
 */
function fromJson(json, useNative) {
  if (!isString(json)) return json;

  var obj;

  try {
    if (useNative && window.JSON && window.JSON.parse) {
      obj = JSON.parse(json);
      return transformDates(obj);
    }
    return parser(json, true).primary()();
  } catch (e) {
    error("fromJson error: ", json, e);
    throw e;
  }

  // TODO make forEach optionally recursive and remove this function
  function transformDates(obj) {
    if (isString(obj) && obj.length === DATE_ISOSTRING_LN) {
      return angularString.toDate(obj);
    } else if (isArray(obj) || isObject(obj)) {
      forEach(obj, function(val, name) {
        obj[name] = transformDates(val);
      });
    }
    return obj;
  }
}

angular.toJson = toJson;
angular.fromJson = fromJson;

function toJsonArray(buf, obj, pretty, stack) {
  if (isObject(obj)) {
    if (obj === window) {
      buf.push('WINDOW');
      return;
    }

    if (obj === document) {
      buf.push('DOCUMENT');
      return;
    }

    if (includes(stack, obj)) {
      buf.push('RECURSION');
      return;
    }
    stack.push(obj);
  }
  if (obj === null) {
    buf.push($null);
  } else if (obj instanceof RegExp) {
    buf.push(angular.String.quoteUnicode(obj.toString()));
  } else if (isFunction(obj)) {
    return;
  } else if (isBoolean(obj)) {
    buf.push('' + obj);
  } else if (isNumber(obj)) {
    if (isNaN(obj)) {
      buf.push($null);
    } else {
      buf.push('' + obj);
    }
  } else if (isString(obj)) {
    return buf.push(angular.String.quoteUnicode(obj));
  } else if (isObject(obj)) {
    if (isArray(obj)) {
      buf.push("[");
      var len = obj.length;
      var sep = false;
      for(var i=0; i<len; i++) {
        var item = obj[i];
        if (sep) buf.push(",");
        if (!(item instanceof RegExp) && (isFunction(item) || isUndefined(item))) {
          buf.push($null);
        } else {
          toJsonArray(buf, item, pretty, stack);
        }
        sep = true;
      }
      buf.push("]");
    } else if (isDate(obj)) {
      buf.push(angular.String.quoteUnicode(angular.Date.toString(obj)));
    } else {
      buf.push("{");
      if (pretty) buf.push(pretty);
      var comma = false;
      var childPretty = pretty ? pretty + "  " : false;
      var keys = [];
      for(var k in obj) {
        if (obj.hasOwnProperty(k) && obj[k] !== undefined) {
          keys.push(k);
        }
      }
      keys.sort();
      for ( var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex];
        var value = obj[key];
        if (typeof value != $function) {
          if (comma) {
            buf.push(",");
            if (pretty) buf.push(pretty);
          }
          buf.push(angular.String.quote(key));
          buf.push(":");
          toJsonArray(buf, value, childPretty, stack);
          comma = true;
        }
      }
      buf.push("}");
    }
  }
  if (isObject(obj)) {
    stack.pop();
  }
}

/**
 * Template provides directions an how to bind to a given element.
 * It contains a list of init functions which need to be called to
 * bind to a new instance of elements. It also provides a list
 * of child paths which contain child templates
 */
function Template(priority) {
  this.paths = [];
  this.children = [];
  this.inits = [];
  this.priority = priority;
  this.newScope = false;
}

Template.prototype = {
  attach: function(element, scope) {
    var inits = {};
    this.collectInits(element, inits, scope);
    forEachSorted(inits, function(queue){
      forEach(queue, function(fn) {fn();});
    });
  },

  collectInits: function(element, inits, scope) {
    var queue = inits[this.priority], childScope = scope;
    if (!queue) {
      inits[this.priority] = queue = [];
    }
    if (this.newScope) {
      childScope = createScope(scope);
      scope.$onEval(childScope.$eval);
      element.data($$scope, childScope);
    }
    forEach(this.inits, function(fn) {
      queue.push(function() {
        childScope.$tryEval(function(){
          return childScope.$service.invoke(childScope, fn, [element]);
        }, element);
      });
    });
    var i,
        childNodes = element[0].childNodes,
        children = this.children,
        paths = this.paths,
        length = paths.length;
    for (i = 0; i < length; i++) {
      children[i].collectInits(jqLite(childNodes[paths[i]]), inits, childScope);
    }
  },


  addInit:function(linkingFn) {
    if (linkingFn) {
      if (!linkingFn.$inject)
        linkingFn.$inject = [];
      this.inits.push(linkingFn);
    }
  },


  addChild: function(index, template) {
    if (template) {
      this.paths.push(index);
      this.children.push(template);
    }
  },

  empty: function() {
    return this.inits.length === 0 && this.paths.length === 0;
  }
};

///////////////////////////////////
//Compiler
//////////////////////////////////

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.compile
 * @function
 *
 * @description
 * Compiles a piece of HTML string or DOM into a template and produces a template function, which
 * can then be used to link {@link angular.scope scope} and the template together.
 *
 * The compilation is a process of walking the DOM tree and trying to match DOM elements to
 * {@link angular.markup markup}, {@link angular.attrMarkup attrMarkup},
 * {@link angular.widget widgets}, and {@link angular.directive directives}. For each match it
 * executes corresponding markup, attrMarkup, widget or directive template function and collects the
 * instance functions into a single template function which is then returned.
 *
 * The template function can then be used once to produce the view or as it is the case with
 * {@link angular.widget.@ng:repeat repeater} many-times, in which case each call results in a view
 * that is a DOM clone of the original template.
 *
   <pre>
    // compile the entire window.document and give me the scope bound to this template.
    var rootScope = angular.compile(window.document)();

    // compile a piece of html
    var rootScope2 = angular.compile('<div ng:click="clicked = true">click me</div>')();

    // compile a piece of html and retain reference to both the dom and scope
    var template = angular.element('<div ng:click="clicked = true">click me</div>'),
        scope = angular.compile(template)();
    // at this point template was transformed into a view
   </pre>
 *
 *
 * @param {string|DOMElement} element Element or HTML to compile into a template function.
 * @returns {function([scope][, cloneAttachFn])} a template function which is used to bind template
 * (a DOM element/tree) to a scope. Where:
 *
 *  * `scope` - A {@link angular.scope Scope} to bind to. If none specified, then a new
 *               root scope is created.
 *  * `cloneAttachFn` - If `cloneAttachFn` is provided, then the link function will clone the
 *               `template` and call the `cloneAttachFn` function allowing the caller to attach the
 *               cloned elements to the DOM document at the appropriate place. The `cloneAttachFn` is
 *               called as: <br/> `cloneAttachFn(clonedElement, scope)` where:
 *
 *      * `clonedElement` - is a clone of the original `element` passed into the compiler.
 *      * `scope` - is the current scope with which the linking function is working with.
 *
 * Calling the template function returns the scope to which the element is bound to. It is either
 * the same scope as the one passed into the template function, or if none were provided it's the
 * newly create scope.
 *
 * If you need access to the bound view, there are two ways to do it:
 *
 * - If you are not asking the linking function to clone the template, create the DOM element(s)
 *   before you send them to the compiler and keep this reference around.
 *   <pre>
 *     var view = angular.element('<p>{{total}}</p>'),
 *         scope = angular.compile(view)();
 *   </pre>
 *
 * - if on the other hand, you need the element to be cloned, the view reference from the original
 *   example would not point to the clone, but rather to the original template that was cloned. In
 *   this case, you can access the clone via the cloneAttachFn:
 *   <pre>
 *     var original = angular.element('<p>{{total}}</p>'),
 *         scope = someParentScope.$new(),
 *         clone;
 *
 *     angular.compile(original)(scope, function(clonedElement, scope) {
 *       clone = clonedElement;
 *       //attach the clone to DOM document at the right place
 *     });
 *
 *     //now we have reference to the cloned DOM via `clone`
 *   </pre>
 *
 *
 * Compiler Methods For Widgets and Directives:
 *
 * The following methods are available for use when you write your own widgets, directives,
 * and markup.  (Recall that the compile function's this is a reference to the compiler.)
 *
 *  `compile(element)` - returns linker -
 *  Invoke a new instance of the compiler to compile a DOM element and return a linker function.
 *  You can apply the linker function to the original element or a clone of the original element.
 *  The linker function returns a scope.
 *
 *  * `comment(commentText)` - returns element - Create a comment element.
 *
 *  * `element(elementName)` - returns element - Create an element by name.
 *
 *  * `text(text)` - returns element - Create a text element.
 *
 *  * `descend([set])` - returns descend state (true or false). Get or set the current descend
 *  state. If true the compiler will descend to children elements.
 *
 *  * `directives([set])` - returns directive state (true or false). Get or set the current
 *  directives processing state. The compiler will process directives only when directives set to
 *  true.
 *
 * For information on how the compiler works, see the
 * {@link guide/dev_guide.compiler Angular HTML Compiler} section of the Developer Guide.
 */
function Compiler(markup, attrMarkup, directives, widgets){
  this.markup = markup;
  this.attrMarkup = attrMarkup;
  this.directives = directives;
  this.widgets = widgets;
}

Compiler.prototype = {
  compile: function(templateElement) {
    templateElement = jqLite(templateElement);
    var index = 0,
        template,
        parent = templateElement.parent();
    if (templateElement.length > 1) {
      // https://github.com/angular/angular.js/issues/338
      throw Error("Cannot compile multiple element roots: " +
          jqLite('<div>').append(templateElement.clone()).html());
    }
    if (parent && parent[0]) {
      parent = parent[0];
      for(var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i] == templateElement[0]) {
          index = i;
        }
      }
    }
    template = this.templatize(templateElement, index, 0) || new Template();
    return function(scope, cloneConnectFn){
      // important!!: we must call our jqLite.clone() since the jQuery one is trying to be smart
      // and sometimes changes the structure of the DOM.
      var element = cloneConnectFn
        ? JQLitePrototype.clone.call(templateElement) // IMPORTANT!!!
        : templateElement;
        scope = scope || createScope();
      element.data($$scope, scope);
      scope.$element = element;
      (cloneConnectFn||noop)(element, scope);
      template.attach(element, scope);
      scope.$eval();
      return scope;
    };
  },


  /**
   * @workInProgress
   * @ngdoc directive
   * @name angular.directive.ng:eval-order
   *
   * @description
   * Normally the view is updated from top to bottom. This usually is
   * not a problem, but under some circumstances the values for data
   * is not available until after the full view is computed. If such
   * values are needed before they are computed the order of
   * evaluation can be changed using ng:eval-order
   *
   * @element ANY
   * @param {integer|string=} [priority=0] priority integer, or FIRST, LAST constant
   *
   * @example
   * try changing the invoice and see that the Total will lag in evaluation
   * @example
     <doc:example>
       <doc:source>
        <div>TOTAL: without ng:eval-order {{ items.$sum('total') | currency }}</div>
        <div ng:eval-order='LAST'>TOTAL: with ng:eval-order {{ items.$sum('total') | currency }}</div>
        <table ng:init="items=[{qty:1, cost:9.99, desc:'gadget'}]">
          <tr>
            <td>QTY</td>
            <td>Description</td>
            <td>Cost</td>
            <td>Total</td>
            <td></td>
          </tr>
          <tr ng:repeat="item in items">
            <td><input name="item.qty"/></td>
            <td><input name="item.desc"/></td>
            <td><input name="item.cost"/></td>
            <td>{{item.total = item.qty * item.cost | currency}}</td>
            <td><a href="" ng:click="items.$remove(item)">X</a></td>
          </tr>
          <tr>
            <td colspan="3"><a href="" ng:click="items.$add()">add</a></td>
            <td>{{ items.$sum('total') | currency }}</td>
          </tr>
        </table>
       </doc:source>
       <doc:scenario>
         it('should check ng:format', function(){
           expect(using('.doc-example-live div:first').binding("items.$sum('total')")).toBe('$9.99');
           expect(using('.doc-example-live div:last').binding("items.$sum('total')")).toBe('$9.99');
           input('item.qty').enter('2');
           expect(using('.doc-example-live div:first').binding("items.$sum('total')")).toBe('$9.99');
           expect(using('.doc-example-live div:last').binding("items.$sum('total')")).toBe('$19.98');
         });
       </doc:scenario>
     </doc:example>
   */

  templatize: function(element, elementIndex, priority){
    var self = this,
        widget,
        fn,
        directiveFns = self.directives,
        descend = true,
        directives = true,
        elementName = nodeName_(element),
        elementNamespace = elementName.indexOf(':') > 0 ? lowercase(elementName).replace(':', '-') : '',
        template,
        selfApi = {
          compile: bind(self, self.compile),
          descend: function(value){ if(isDefined(value)) descend = value; return descend;},
          directives: function(value){ if(isDefined(value)) directives = value; return directives;},
          scope: function(value){ if(isDefined(value)) template.newScope = template.newScope || value; return template.newScope;}
        };
    try {
      priority = element.attr('ng:eval-order') || priority || 0;
    } catch (e) {
      // for some reason IE throws error under some weird circumstances. so just assume nothing
      priority = priority || 0;
    }
    element.addClass(elementNamespace);
    if (isString(priority)) {
      priority = PRIORITY[uppercase(priority)] || parseInt(priority, 10);
    }
    template = new Template(priority);
    eachAttribute(element, function(value, name){
      if (!widget) {
        if (widget = self.widgets('@' + name)) {
          element.addClass('ng-attr-widget');
          widget = bind(selfApi, widget, value, element);
        }
      }
    });
    if (!widget) {
      if (widget = self.widgets(elementName)) {
        if (elementNamespace)
          element.addClass('ng-widget');
        widget = bind(selfApi, widget, element);
      }
    }
    if (widget) {
      descend = false;
      directives = false;
      var parent = element.parent();
      template.addInit(widget.call(selfApi, element));
      if (parent && parent[0]) {
        element = jqLite(parent[0].childNodes[elementIndex]);
      }
    }
    if (descend){
      // process markup for text nodes only
      for(var i=0, child=element[0].childNodes;
          i<child.length; i++) {
        if (isTextNode(child[i])) {
          forEach(self.markup, function(markup){
            if (i<child.length) {
              var textNode = jqLite(child[i]);
              markup.call(selfApi, textNode.text(), textNode, element);
            }
          });
        }
      }
    }

    if (directives) {
      // Process attributes/directives
      eachAttribute(element, function(value, name){
        forEach(self.attrMarkup, function(markup){
          markup.call(selfApi, value, name, element);
        });
      });
      eachAttribute(element, function(value, name){
        fn = directiveFns[name];
        if (fn) {
          element.addClass('ng-directive');
          template.addInit((directiveFns[name]).call(selfApi, value, element));
        }
      });
    }
    // Process non text child nodes
    if (descend) {
      eachNode(element, function(child, i){
        template.addChild(i, self.templatize(child, i, priority));
      });
    }
    return template.empty() ? null : template;
  }
};

function eachNode(element, fn){
  var i, chldNodes = element[0].childNodes || [], chld;
  for (i = 0; i < chldNodes.length; i++) {
    if(!isTextNode(chld = chldNodes[i])) {
      fn(jqLite(chld), i);
    }
  }
}

function eachAttribute(element, fn){
  var i, attrs = element[0].attributes || [], chld, attr, name, value, attrValue = {};
  for (i = 0; i < attrs.length; i++) {
    attr = attrs[i];
    name = attr.name;
    value = attr.value;
    if (msie && name == 'href') {
      value = decodeURIComponent(element[0].getAttribute(name, 2));
    }
    attrValue[name] = value;
  }
  forEachSorted(attrValue, fn);
}

function getter(instance, path, unboundFn) {
  if (!path) return instance;
  var element = path.split('.');
  var key;
  var lastInstance = instance;
  var len = element.length;
  for ( var i = 0; i < len; i++) {
    key = element[i];
    if (!key.match(/^[\$\w][\$\w\d]*$/))
        throw "Expression '" + path + "' is not a valid expression for accessing variables.";
    if (instance) {
      lastInstance = instance;
      instance = instance[key];
    }
    if (isUndefined(instance)  && key.charAt(0) == '$') {
      var type = angular['Global']['typeOf'](lastInstance);
      type = angular[type.charAt(0).toUpperCase()+type.substring(1)];
      var fn = type ? type[[key.substring(1)]] : undefined;
      if (fn) {
        instance = bind(lastInstance, fn, lastInstance);
        return instance;
      }
    }
  }
  if (!unboundFn && isFunction(instance)) {
    return bind(lastInstance, instance);
  }
  return instance;
}

function setter(instance, path, value){
  var element = path.split('.');
  for ( var i = 0; element.length > 1; i++) {
    var key = element.shift();
    var newInstance = instance[key];
    if (!newInstance) {
      newInstance = {};
      instance[key] = newInstance;
    }
    instance = newInstance;
  }
  instance[element.shift()] = value;
  return value;
}

///////////////////////////////////
var scopeId = 0,
    getterFnCache = {},
    compileCache = {},
    JS_KEYWORDS = {};
forEach(
    ("abstract,boolean,break,byte,case,catch,char,class,const,continue,debugger,default," +
    "delete,do,double,else,enum,export,extends,false,final,finally,float,for,function,goto," +
    "if,implements,import,ininstanceof,intinterface,long,native,new,null,package,private," +
    "protected,public,return,short,static,super,switch,synchronized,this,throw,throws," +
    "transient,true,try,typeof,var,volatile,void,undefined,while,with").split(/,/),
  function(key){ JS_KEYWORDS[key] = true;}
);
function getterFn(path){
  var fn = getterFnCache[path];
  if (fn) return fn;

  var code = 'var l, fn, t;\n';
  forEach(path.split('.'), function(key) {
    key = (JS_KEYWORDS[key]) ? '["' + key + '"]' : '.' + key;
    code += 'if(!s) return s;\n' +
            'l=s;\n' +
            's=s' + key + ';\n' +
            'if(typeof s=="function" && !(s instanceof RegExp)) s = function(){ return l'+key+'.apply(l, arguments); };\n';
    if (key.charAt(1) == '$') {
      // special code for super-imposed functions
      var name = key.substr(2);
      code += 'if(!s) {\n' +
              '  t = angular.Global.typeOf(l);\n' +
              '  fn = (angular[t.charAt(0).toUpperCase() + t.substring(1)]||{})["' + name + '"];\n' +
              '  if (fn) s = function(){ return fn.apply(l, [l].concat(Array.prototype.slice.call(arguments, 0, arguments.length))); };\n' +
              '}\n';
    }
  });
  code += 'return s;';
  fn = Function('s', code);
  fn["toString"] = function(){ return code; };

  return getterFnCache[path] = fn;
}

///////////////////////////////////

function expressionCompile(exp){
  if (typeof exp === $function) return exp;
  var fn = compileCache[exp];
  if (!fn) {
    var p = parser(exp);
    var fnSelf = p.statements();
    fn = compileCache[exp] = extend(
      function(){ return fnSelf(this);},
      {fnSelf: fnSelf});
  }
  return fn;
}

function errorHandlerFor(element, error) {
  elementError(element, NG_EXCEPTION, isDefined(error) ? formatError(error) : error);
}


/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.scope
 *
 * @description
 * Scope is a JavaScript object and the execution context for expressions. You can think about
 * scopes as JavaScript objects that have extra APIs for registering watchers. A scope is the
 * context in which model (from the model-view-controller design pattern) exists.
 *
 * Angular scope objects provide the following methods:
 *
 * * {@link angular.scope.$become $become()} -
 * * {@link angular.scope.$bind $bind()} -
 * * {@link angular.scope.$eval $eval()} -
 * * {@link angular.scope.$get $get()} -
 * * {@link angular.scope.$new $new()} -
 * * {@link angular.scope.$onEval $onEval()} -
 * * {@link angular.scope.$service $service()} -
 * * {@link angular.scope.$set $set()} -
 * * {@link angular.scope.$tryEval $tryEval()} -
 * * {@link angular.scope.$watch $watch()} -
 *
 * For more information about how angular scope objects work, see {@link guide/dev_guide.scopes
 * Angular Scope Objects} in the angular Developer Guide.
 */
function createScope(parent, providers, instanceCache) {
  function Parent(){}
  parent = Parent.prototype = (parent || {});
  var instance = new Parent();
  var evalLists = {sorted:[]};
  var $log, $exceptionHandler;

  extend(instance, {
    'this': instance,
    $id: (scopeId++),
    $parent: parent,

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$bind
     * @function
     *
     * @description
     * Binds a function `fn` to the current scope. See: {@link angular.bind}.

       <pre>
         var scope = angular.scope();
         var fn = scope.$bind(function(){
           return this;
         });
         expect(fn()).toEqual(scope);
       </pre>
     *
     * @param {function()} fn Function to be bound.
     */
    $bind: bind(instance, bind, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$get
     * @function
     *
     * @description
     * Returns the value for `property_chain` on the current scope. Unlike in JavaScript, if there
     * are any `undefined` intermediary properties, `undefined` is returned instead of throwing an
     * exception.
     *
       <pre>
         var scope = angular.scope();
         expect(scope.$get('person.name')).toEqual(undefined);
         scope.person = {};
         expect(scope.$get('person.name')).toEqual(undefined);
         scope.person.name = 'misko';
         expect(scope.$get('person.name')).toEqual('misko');
       </pre>
     *
     * @param {string} property_chain String representing name of a scope property. Optionally
     *     properties can be chained with `.` (dot), e.g. `'person.name.first'`
     * @returns {*} Value for the (nested) property.
     */
    $get: bind(instance, getter, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$set
     * @function
     *
     * @description
     * Assigns a value to a property of the current scope specified via `property_chain`. Unlike in
     * JavaScript, if there are any `undefined` intermediary properties, empty objects are created
     * and assigned to them instead of throwing an exception.
     *
       <pre>
         var scope = angular.scope();
         expect(scope.person).toEqual(undefined);
         scope.$set('person.name', 'misko');
         expect(scope.person).toEqual({name:'misko'});
         expect(scope.person.name).toEqual('misko');
       </pre>
     *
     * @param {string} property_chain String representing name of a scope property. Optionally
     *     properties can be chained with `.` (dot), e.g. `'person.name.first'`
     * @param {*} value Value to assign to the scope property.
     */
    $set: bind(instance, setter, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$eval
     * @function
     *
     * @description
     * Without the `exp` parameter triggers an eval cycle for this scope and its child scopes.
     *
     * With the `exp` parameter, compiles the expression to a function and calls it with `this` set
     * to the current scope and returns the result. In other words, evaluates `exp` as angular
     * expression in the context of the current scope.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.a = 1;
         scope.b = 2;

         expect(scope.$eval('a+b')).toEqual(3);
         expect(scope.$eval(function(){ return this.a + this.b; })).toEqual(3);

         scope.$onEval('sum = a+b');
         expect(scope.sum).toEqual(undefined);
         scope.$eval();
         expect(scope.sum).toEqual(3);
       </pre>
     *
     * @param {(string|function())=} exp An angular expression to be compiled to a function or a js
     *     function.
     *
     * @returns {*} The result of calling compiled `exp` with `this` set to the current scope.
     */
    $eval: function(exp) {
      var type = typeof exp;
      var i, iSize;
      var j, jSize;
      var queue;
      var fn;
      if (type == $undefined) {
        for ( i = 0, iSize = evalLists.sorted.length; i < iSize; i++) {
          for ( queue = evalLists.sorted[i],
              jSize = queue.length,
              j= 0; j < jSize; j++) {
            instance.$tryEval(queue[j].fn, queue[j].handler);
          }
        }
      } else if (type === $function) {
        return exp.call(instance);
      } else  if (type === 'string') {
        return expressionCompile(exp).call(instance);
      }
    },


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$tryEval
     * @function
     *
     * @description
     * Evaluates the expression in the context of the current scope just like
     * {@link angular.scope.$eval} with expression parameter, but also wraps it in a try/catch
     * block.
     *
     * If an exception is thrown then `exceptionHandler` is used to handle the exception.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.error = function(){ throw 'myerror'; };
         scope.$exceptionHandler = function(e) {this.lastException = e; };

         expect(scope.$eval('error()'));
         expect(scope.lastException).toEqual('myerror');
         this.lastException = null;

         expect(scope.$eval('error()'),  function(e) {this.lastException = e; });
         expect(scope.lastException).toEqual('myerror');

         var body = angular.element(window.document.body);
         expect(scope.$eval('error()'), body);
         expect(body.attr('ng-exception')).toEqual('"myerror"');
         expect(body.hasClass('ng-exception')).toEqual(true);
       </pre>
     *
     * @param {string|function()} expression Angular expression to evaluate.
     * @param {(function()|DOMElement)=} exceptionHandler Function to be called or DOMElement to be
     *     decorated.
     * @returns {*} The result of `expression` evaluation.
     */
    $tryEval: function (expression, exceptionHandler) {
      var type = typeof expression;
      try {
        if (type == $function) {
          return expression.call(instance);
        } else if (type == 'string'){
          return expressionCompile(expression).call(instance);
        }
      } catch (e) {
        if ($log) $log.error(e);
        if (isFunction(exceptionHandler)) {
          exceptionHandler(e);
        } else if (exceptionHandler) {
          errorHandlerFor(exceptionHandler, e);
        } else if (isFunction($exceptionHandler)) {
          $exceptionHandler(e);
        }
      }
    },


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$watch
     * @function
     *
     * @description
     * Registers `listener` as a callback to be executed every time the `watchExp` changes. Be aware
     * that the callback gets, by default, called upon registration, this can be prevented via the
     * `initRun` parameter.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.name = 'misko';
         scope.counter = 0;

         expect(scope.counter).toEqual(0);
         scope.$watch('name', 'counter = counter + 1');
         expect(scope.counter).toEqual(1);

         scope.$eval();
         expect(scope.counter).toEqual(1);

         scope.name = 'adam';
         scope.$eval();
         expect(scope.counter).toEqual(2);
       </pre>
     *
     * @param {function()|string} watchExp Expression that should be evaluated and checked for
     *    change during each eval cycle. Can be an angular string expression or a function.
     * @param {function()|string} listener Function (or angular string expression) that gets called
     *    every time the value of the `watchExp` changes. The function will be called with two
     *    parameters, `newValue` and `oldValue`.
     * @param {(function()|DOMElement)=} [exceptionHanlder=angular.service.$exceptionHandler] Handler
     *    that gets called when `watchExp` or `listener` throws an exception. If a DOMElement is
     *    specified as a handler, the element gets decorated by angular with the information about the
     *    exception.
     * @param {boolean=} [initRun=true] Flag that prevents the first execution of the listener upon
     *    registration.
     *
     */
    $watch: function(watchExp, listener, exceptionHandler, initRun) {
      var watch = expressionCompile(watchExp),
          last = watch.call(instance);
      listener = expressionCompile(listener);
      function watcher(firstRun){
        var value = watch.call(instance),
            // we have to save the value because listener can call ourselves => inf loop
            lastValue = last;
        if (firstRun || lastValue !== value) {
          last = value;
          instance.$tryEval(function(){
            return listener.call(instance, value, lastValue);
          }, exceptionHandler);
        }
      }
      instance.$onEval(PRIORITY_WATCH, watcher);
      if (isUndefined(initRun)) initRun = true;
      if (initRun) watcher(true);
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$onEval
     * @function
     *
     * @description
     * Evaluates the `expr` expression in the context of the current scope during each
     * {@link angular.scope.$eval eval cycle}.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.counter = 0;
         scope.$onEval('counter = counter + 1');
         expect(scope.counter).toEqual(0);
         scope.$eval();
         expect(scope.counter).toEqual(1);
       </pre>
     *
     * @param {number} [priority=0] Execution priority. Lower priority numbers get executed first.
     * @param {string|function()} expr Angular expression or function to be executed.
     * @param {(function()|DOMElement)=} [exceptionHandler=angular.service.$exceptionHandler] Handler
     *     function to call or DOM element to decorate when an exception occurs.
     *
     */
    $onEval: function(priority, expr, exceptionHandler){
      if (!isNumber(priority)) {
        exceptionHandler = expr;
        expr = priority;
        priority = 0;
      }
      var evalList = evalLists[priority];
      if (!evalList) {
        evalList = evalLists[priority] = [];
        evalList.priority = priority;
        evalLists.sorted.push(evalList);
        evalLists.sorted.sort(function(a,b){return a.priority-b.priority;});
      }
      evalList.push({
        fn: expressionCompile(expr),
        handler: exceptionHandler
      });
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$become
     * @function
     * @deprecated This method will be removed before 1.0
     *
     * @description
     * Modifies the scope to act like an instance of the given class by:
     *
     * - copying the class's prototype methods
     * - applying the class's initialization function to the scope instance (without using the new
     *   operator)
     *
     * That makes the scope be a `this` for the given class's methods — effectively an instance of
     * the given class with additional (scope) stuff. A scope can later `$become` another class.
     *
     * `$become` gets used to make the current scope act like an instance of a controller class.
     * This allows for use of a controller class in two ways.
     *
     * - as an ordinary JavaScript class for standalone testing, instantiated using the new
     *   operator, with no attached view.
     * - as a controller for an angular model stored in a scope, "instantiated" by
     *   `scope.$become(ControllerClass)`.
     *
     * Either way, the controller's methods refer to the model  variables like `this.name`. When
     * stored in a scope, the model supports data binding. When bound to a view, {{name}} in the
     * HTML template refers to the same variable.
     */
    $become: function(Class) {
      if (isFunction(Class)) {
        instance.constructor = Class;
        forEach(Class.prototype, function(fn, name){
          instance[name] = bind(instance, fn);
        });
        instance.$service.invoke(instance, Class, slice.call(arguments, 1, arguments.length));

        //TODO: backwards compatibility hack, remove when we don't depend on init methods
        if (isFunction(Class.prototype.init)) {
          instance.init();
        }
      }
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$new
     * @function
     *
     * @description
     * Creates a new {@link angular.scope scope}, that:
     *
     * - is a child of the current scope
     * - will {@link angular.scope.$become $become} of type specified via `constructor`
     *
     * @param {function()} constructor Constructor function of the type the new scope should assume.
     * @returns {Object} The newly created child scope.
     *
     */
    $new: function(constructor) {
      var child = createScope(instance);
      child.$become.apply(instance, concat([constructor], arguments, 1));
      instance.$onEval(child.$eval);
      return child;
    }

  });

  if (!parent.$root) {
    instance.$root = instance;
    instance.$parent = instance;

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$service
     * @function
     *
     * @description
     * Provides access to angular's dependency injector and
     * {@link angular.service registered services}. In general the use of this api is discouraged,
     * except for tests and components that currently don't support dependency injection (widgets,
     * filters, etc).
     *
     * @param {string} serviceId String ID of the service to return.
     * @returns {*} Value, object or function returned by the service factory function if any.
     */
    (instance.$service = createInjector(instance, providers, instanceCache)).eager();
  }

  $log = instance.$service('$log');
  $exceptionHandler = instance.$service('$exceptionHandler');

  return instance;
}

/**
 * @ngdoc function
 * @name angular.injector
 * @function
 *
 * @description
 * Creates an injector function that can be used for retrieving services as well as for
 * dependency injection (see {@link guide/dev_guide.di dependency injection}).
 *
 * Angular creates an injector automatically for the root scope and it is available as the
 * {@link angular.scope.$service $service} property. Creation of the injector automatically creates
 * all of the `$eager` {@link angular.service services}.
 *
 * @param {Object=} [factoryScope={}] `this` for the service factory function.
 * @param {Object.<string, function()>=} [factories=angular.service] Map of service factory
 *     functions.
 * @param {Object.<string, function()>=} [instanceCache={}] Place where instances of services are
 *     saved for reuse. Can also be used to override services specified by `serviceFactory`
 *     (useful in tests).
 * @returns {function()} Injector function:
 *
 *   * `injector(serviceName)`:
 *     * `serviceName` - `{string=}` - name of the service to retrieve.
 *
 * The injector function also has these properties:
 *
 *   * an `invoke` property which can be used to invoke methods with dependency-injected arguments.
 *    `injector.invoke(self, fn, curryArgs)`
 *     * `self` -  "`this`" to be used when invoking the function.
 *     * `fn` - the function to be invoked. The function may have the `$inject` property which
 *        lists the set of arguments which should be auto injected
 *        (see {@link guide/dev_guide.di dependency injection}).
 *     * `curryArgs(array)` - optional array of arguments to pass to function invocation after the
 *        injection arguments (also known as curry arguments or currying).
 *   * an `eager` property which is used to initialize the eager services.
 *     `injector.eager()`
 */
function createInjector(factoryScope, factories, instanceCache) {
  factories = factories || angularService;
  instanceCache = instanceCache || {};
  factoryScope = factoryScope || {};
  injector.invoke = invoke;

  injector.eager = function(){
    forEach(factories, function(factory, name){
      if (factory.$eager)
        injector(name);

      if (factory.$creation)
        throw new Error("Failed to register service '" + name +
        "': $creation property is unsupported. Use $eager:true or see release notes.");
    });
  };
  return injector;

  function injector(value){
    if (!(value in instanceCache)) {
      var factory = factories[value];
      if (!factory) throw Error("Unknown provider for '"+value+"'.");
      instanceCache[value] = invoke(factoryScope, factory);
    }
    return instanceCache[value];
  }

  function invoke(self, fn, args){
    args = args || [];
    var injectNames = injectionArgs(fn);
    var i = injectNames.length;
    while(i--) {
      args.unshift(injector(injectNames[i]));
    }
    return fn.apply(self, args);
  }
}

/**
 * THIS IS NOT PUBLIC DOC YET!
 *
 * @name angular.annotate
 * @function
 *
 * @description
 * Annotate the function with injection arguments. This is equivalent to setting the `$inject`
 * property as described in {@link guide.di dependency injection}.
 *
 * <pre>
 * var MyController = angular.annotate('$location', function($location){ ... });
 * </pre>
 *
 * is the same as
 *
 * <pre>
 * var MyController = function($location){ ... };
 * MyController.$inject = ['$location'];
 * </pre>
 *
 * @param {String|Array} serviceName... zero or more service names to inject into the
 *     `annotatedFunction`.
 * @param {function} annotatedFunction function to annotate with `$inject`
 *     functions.
 * @returns {function} `annotatedFunction`
 */
function annotate(services, fn) {
  if (services instanceof Array) {
    fn.$inject = services;
    return fn;
  } else {
    var i = 0,
        length = arguments.length - 1, // last one is the destination function
        $inject = arguments[length].$inject = [];
    for (; i < length; i++) {
      $inject.push(arguments[i]);
    }
    return arguments[length]; // return the last one
  }
}

function angularServiceInject(name, fn, inject, eager) {
  angularService(name, fn, {$inject:inject, $eager:eager});
}


/**
 * @returns the $inject property of function. If not found the
 * the $inject is computed by looking at the toString of function and
 * extracting all arguments which and assuming that they are the
 * injection names.
 */
var FN_ARGS = /^function\s*[^\(]*\(([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(.+?)\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function injectionArgs(fn) {
  assertArgFn(fn);
  if (!fn.$inject) {
    var args = fn.$inject = [];
    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
      arg.replace(FN_ARG, function(all, name){
        args.push(name);
      });
    });
  }
  return fn.$inject;
}

var OPERATORS = {
    'null':function(self){return null;},
    'true':function(self){return true;},
    'false':function(self){return false;},
    $undefined:noop,
    '+':function(self, a,b){return (isDefined(a)?a:0)+(isDefined(b)?b:0);},
    '-':function(self, a,b){return (isDefined(a)?a:0)-(isDefined(b)?b:0);},
    '*':function(self, a,b){return a*b;},
    '/':function(self, a,b){return a/b;},
    '%':function(self, a,b){return a%b;},
    '^':function(self, a,b){return a^b;},
    '=':noop,
    '==':function(self, a,b){return a==b;},
    '!=':function(self, a,b){return a!=b;},
    '<':function(self, a,b){return a<b;},
    '>':function(self, a,b){return a>b;},
    '<=':function(self, a,b){return a<=b;},
    '>=':function(self, a,b){return a>=b;},
    '&&':function(self, a,b){return a&&b;},
    '||':function(self, a,b){return a||b;},
    '&':function(self, a,b){return a&b;},
//    '|':function(self, a,b){return a|b;},
    '|':function(self, a,b){return b(self, a);},
    '!':function(self, a){return !a;}
};
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};

function lex(text, parseStringsForObjects){
  var dateParseLength = parseStringsForObjects ? DATE_ISOSTRING_LN : -1,
      tokens = [],
      token,
      index = 0,
      json = [],
      ch,
      lastCh = ':'; // can start regexp

  while (index < text.length) {
    ch = text.charAt(index);
    if (is('"\'')) {
      readString(ch);
    } else if (isNumber(ch) || is('.') && isNumber(peek())) {
      readNumber();
    } else if (isIdent(ch)) {
      readIdent();
      // identifiers can only be if the preceding char was a { or ,
      if (was('{,') && json[0]=='{' &&
         (token=tokens[tokens.length-1])) {
        token.json = token.text.indexOf('.') == -1;
      }
    } else if (is('(){}[].,;:')) {
      tokens.push({
        index:index,
        text:ch,
        json:(was(':[,') && is('{[')) || is('}]:,')
      });
      if (is('{[')) json.unshift(ch);
      if (is('}]')) json.shift();
      index++;
    } else if (isWhitespace(ch)) {
      index++;
      continue;
    } else {
      var ch2 = ch + peek(),
          fn = OPERATORS[ch],
          fn2 = OPERATORS[ch2];
      if (fn2) {
        tokens.push({index:index, text:ch2, fn:fn2});
        index += 2;
      } else if (fn) {
        tokens.push({index:index, text:ch, fn:fn, json: was('[,:') && is('+-')});
        index += 1;
      } else {
        throwError("Unexpected next character ", index, index+1);
      }
    }
    lastCh = ch;
  }
  return tokens;

  function is(chars) {
    return chars.indexOf(ch) != -1;
  }

  function was(chars) {
    return chars.indexOf(lastCh) != -1;
  }

  function peek() {
    return index + 1 < text.length ? text.charAt(index + 1) : false;
  }
  function isNumber(ch) {
    return '0' <= ch && ch <= '9';
  }
  function isWhitespace(ch) {
    return ch == ' ' || ch == '\r' || ch == '\t' ||
           ch == '\n' || ch == '\v' || ch == '\u00A0'; // IE treats non-breaking space as \u00A0
  }
  function isIdent(ch) {
    return 'a' <= ch && ch <= 'z' ||
           'A' <= ch && ch <= 'Z' ||
           '_' == ch || ch == '$';
  }
  function isExpOperator(ch) {
    return ch == '-' || ch == '+' || isNumber(ch);
  }

  function throwError(error, start, end) {
    end = end || index;
    throw Error("Lexer Error: " + error + " at column" +
        (isDefined(start)
            ? "s " + start +  "-" + index + " [" + text.substring(start, end) + "]"
            : " " + end) +
        " in expression [" + text + "].");
  }

  function readNumber() {
    var number = "";
    var start = index;
    while (index < text.length) {
      var ch = lowercase(text.charAt(index));
      if (ch == '.' || isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = peek();
        if (ch == 'e' && isExpOperator(peekCh)) {
          number += ch;
        } else if (isExpOperator(ch) &&
            peekCh && isNumber(peekCh) &&
            number.charAt(number.length - 1) == 'e') {
          number += ch;
        } else if (isExpOperator(ch) &&
            (!peekCh || !isNumber(peekCh)) &&
            number.charAt(number.length - 1) == 'e') {
          throwError('Invalid exponent');
        } else {
          break;
        }
      }
      index++;
    }
    number = 1 * number;
    tokens.push({index:start, text:number, json:true,
      fn:function(){return number;}});
  }
  function readIdent() {
    var ident = "";
    var start = index;
    var fn;
    while (index < text.length) {
      var ch = text.charAt(index);
      if (ch == '.' || isIdent(ch) || isNumber(ch)) {
        ident += ch;
      } else {
        break;
      }
      index++;
    }
    fn = OPERATORS[ident];
    tokens.push({
      index:start,
      text:ident,
      json: fn,
      fn:fn||extend(getterFn(ident), {
        assign:function(self, value){
          return setter(self, ident, value);
        }
      })
    });
  }

  function readString(quote) {
    var start = index;
    index++;
    var string = "";
    var rawString = quote;
    var escape = false;
    while (index < text.length) {
      var ch = text.charAt(index);
      rawString += ch;
      if (escape) {
        if (ch == 'u') {
          var hex = text.substring(index + 1, index + 5);
          if (!hex.match(/[\da-f]{4}/i))
            throwError( "Invalid unicode escape [\\u" + hex + "]");
          index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          if (rep) {
            string += rep;
          } else {
            string += ch;
          }
        }
        escape = false;
      } else if (ch == '\\') {
        escape = true;
      } else if (ch == quote) {
        index++;
        tokens.push({index:start, text:rawString, string:string, json:true,
          fn:function(){
            return (string.length == dateParseLength)
              ? angular['String']['toDate'](string)
              : string;
          }});
        return;
      } else {
        string += ch;
      }
      index++;
    }
    throwError("Unterminated quote", start);
  }
}

/////////////////////////////////////////

function parser(text, json){
  var ZERO = valueFn(0),
      tokens = lex(text, json),
      assignment = _assignment,
      assignable = logicalOR,
      functionCall = _functionCall,
      fieldAccess = _fieldAccess,
      objectIndex = _objectIndex,
      filterChain = _filterChain,
      functionIdent = _functionIdent,
      pipeFunction = _pipeFunction;
  if(json){
    // The extra level of aliasing is here, just in case the lexer misses something, so that
    // we prevent any accidental execution in JSON.
    assignment = logicalOR;
    functionCall =
      fieldAccess =
      objectIndex =
      assignable =
      filterChain =
      functionIdent =
      pipeFunction =
        function (){ throwError("is not valid json", {text:text, index:0}); };
  }
  //TODO: Shouldn't all of the public methods have assertAllConsumed?
  //TODO: I think these should be public as part of the parser api instead of scope.$eval().
  return {
      assignable: assertConsumed(assignable),
      primary: assertConsumed(primary),
      statements: assertConsumed(statements),
      validator: assertConsumed(validator),
      formatter: assertConsumed(formatter),
      filter: assertConsumed(filter)
  };

  function assertConsumed(fn) {
    return function(){
      var value = fn();
      if (tokens.length !== 0) {
        throwError("is an unexpected token", tokens[0]);
      }
      return value;
    };
  }

  ///////////////////////////////////
  function throwError(msg, token) {
    throw Error("Syntax Error: Token '" + token.text +
      "' " + msg + " at column " +
      (token.index + 1) + " of the expression [" +
      text + "] starting at [" + text.substring(token.index) + "].");
  }

  function peekToken() {
    if (tokens.length === 0)
      throw Error("Unexpected end of expression: " + text);
    return tokens[0];
  }

  function peek(e1, e2, e3, e4) {
    if (tokens.length > 0) {
      var token = tokens[0];
      var t = token.text;
      if (t==e1 || t==e2 || t==e3 || t==e4 ||
          (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  }

  function expect(e1, e2, e3, e4){
    var token = peek(e1, e2, e3, e4);
    if (token) {
      if (json && !token.json) {
        throwError("is not valid json", token);
      }
      tokens.shift();
      return token;
    }
    return false;
  }

  function consume(e1){
    if (!expect(e1)) {
      throwError("is unexpected, expecting [" + e1 + "]", peek());
    }
  }

  function unaryFn(fn, right) {
    return function(self) {
      return fn(self, right(self));
    };
  }

  function binaryFn(left, fn, right) {
    return function(self) {
      return fn(self, left(self), right(self));
    };
  }

  function hasTokens () {
    return tokens.length > 0;
  }

  function statements(){
    var statements = [];
    while(true) {
      if (tokens.length > 0 && !peek('}', ')', ';', ']'))
        statements.push(filterChain());
      if (!expect(';')) {
        // optimize for the common case where there is only one statement.
        // TODO(size): maybe we should not support multiple statements?
        return statements.length == 1
          ? statements[0]
          : function (self){
            var value;
            for ( var i = 0; i < statements.length; i++) {
              var statement = statements[i];
              if (statement)
                value = statement(self);
            }
            return value;
          };
      }
    }
  }

  function _filterChain(){
    var left = expression();
    var token;
    while(true) {
      if ((token = expect('|'))) {
        left = binaryFn(left, token.fn, filter());
      } else {
        return left;
      }
    }
  }

  function filter(){
    return pipeFunction(angularFilter);
  }

  function validator(){
    return pipeFunction(angularValidator);
  }

  function formatter(){
    var token = expect();
    var formatter = angularFormatter[token.text];
    var argFns = [];
    if (!formatter) throwError('is not a valid formatter.', token);
    while(true) {
      if ((token = expect(':'))) {
        argFns.push(expression());
      } else {
        return valueFn({
          format:invokeFn(formatter.format),
          parse:invokeFn(formatter.parse)
        });
      }
    }
    function invokeFn(fn){
      return function(self, input){
        var args = [input];
        for ( var i = 0; i < argFns.length; i++) {
          args.push(argFns[i](self));
        }
        return fn.apply(self, args);
      };
    }
  }

  function _pipeFunction(fnScope){
    var fn = functionIdent(fnScope);
    var argsFn = [];
    var token;
    while(true) {
      if ((token = expect(':'))) {
        argsFn.push(expression());
      } else {
        var fnInvoke = function(self, input){
          var args = [input];
          for ( var i = 0; i < argsFn.length; i++) {
            args.push(argsFn[i](self));
          }
          return fn.apply(self, args);
        };
        return function(){
          return fnInvoke;
        };
      }
    }
  }

  function expression(){
    return assignment();
  }

  function _assignment(){
    var left = logicalOR();
    var right;
    var token;
    if (token = expect('=')) {
      if (!left.assign) {
        throwError("implies assignment but [" +
          text.substring(0, token.index) + "] can not be assigned to", token);
      }
      right = logicalOR();
      return function(self){
        return left.assign(self, right(self));
      };
    } else {
      return left;
    }
  }

  function logicalOR(){
    var left = logicalAND();
    var token;
    while(true) {
      if ((token = expect('||'))) {
        left = binaryFn(left, token.fn, logicalAND());
      } else {
        return left;
      }
    }
  }

  function logicalAND(){
    var left = equality();
    var token;
    if ((token = expect('&&'))) {
      left = binaryFn(left, token.fn, logicalAND());
    }
    return left;
  }

  function equality(){
    var left = relational();
    var token;
    if ((token = expect('==','!='))) {
      left = binaryFn(left, token.fn, equality());
    }
    return left;
  }

  function relational(){
    var left = additive();
    var token;
    if (token = expect('<', '>', '<=', '>=')) {
      left = binaryFn(left, token.fn, relational());
    }
    return left;
  }

  function additive(){
    var left = multiplicative();
    var token;
    while(token = expect('+','-')) {
      left = binaryFn(left, token.fn, multiplicative());
    }
    return left;
  }

  function multiplicative(){
    var left = unary();
    var token;
    while(token = expect('*','/','%')) {
      left = binaryFn(left, token.fn, unary());
    }
    return left;
  }

  function unary(){
    var token;
    if (expect('+')) {
      return primary();
    } else if (token = expect('-')) {
      return binaryFn(ZERO, token.fn, unary());
    } else if (token = expect('!')) {
      return unaryFn(token.fn, unary());
    } else {
      return primary();
    }
  }

  function _functionIdent(fnScope) {
    var token = expect();
    var element = token.text.split('.');
    var instance = fnScope;
    var key;
    for ( var i = 0; i < element.length; i++) {
      key = element[i];
      if (instance)
        instance = instance[key];
    }
    if (typeof instance != $function) {
      throwError("should be a function", token);
    }
    return instance;
  }

  function primary() {
    var primary;
    if (expect('(')) {
      var expression = filterChain();
      consume(')');
      primary = expression;
    } else if (expect('[')) {
      primary = arrayDeclaration();
    } else if (expect('{')) {
      primary = object();
    } else {
      var token = expect();
      primary = token.fn;
      if (!primary) {
        throwError("not a primary expression", token);
      }
    }
    var next;
    while (next = expect('(', '[', '.')) {
      if (next.text === '(') {
        primary = functionCall(primary);
      } else if (next.text === '[') {
        primary = objectIndex(primary);
      } else if (next.text === '.') {
        primary = fieldAccess(primary);
      } else {
        throwError("IMPOSSIBLE");
      }
    }
    return primary;
  }

  function _fieldAccess(object) {
    var field = expect().text;
    var getter = getterFn(field);
    return extend(function (self){
      return getter(object(self));
    }, {
      assign:function(self, value){
        return setter(object(self), field, value);
      }
    });
  }

  function _objectIndex(obj) {
    var indexFn = expression();
    consume(']');
    return extend(
      function (self){
        var o = obj(self);
        var i = indexFn(self);
        return (o) ? o[i] : undefined;
      }, {
        assign:function(self, value){
          return obj(self)[indexFn(self)] = value;
        }
      });
  }

  function _functionCall(fn) {
    var argsFn = [];
    if (peekToken().text != ')') {
      do {
        argsFn.push(expression());
      } while (expect(','));
    }
    consume(')');
    return function (self){
      var args = [];
      for ( var i = 0; i < argsFn.length; i++) {
        args.push(argsFn[i](self));
      }
      var fnPtr = fn(self) || noop;
      // IE stupidity!
      return fnPtr.apply
          ? fnPtr.apply(self, args)
          : fnPtr(args[0], args[1], args[2], args[3], args[4]);
    };
  }

  // This is used with json array declaration
  function arrayDeclaration () {
    var elementFns = [];
    if (peekToken().text != ']') {
      do {
        elementFns.push(expression());
      } while (expect(','));
    }
    consume(']');
    return function (self){
      var array = [];
      for ( var i = 0; i < elementFns.length; i++) {
        array.push(elementFns[i](self));
      }
      return array;
    };
  }

  function object () {
    var keyValues = [];
    if (peekToken().text != '}') {
      do {
        var token = expect(),
        key = token.string || token.text;
        consume(":");
        var value = expression();
        keyValues.push({key:key, value:value});
      } while (expect(','));
    }
    consume('}');
    return function (self){
      var object = {};
      for ( var i = 0; i < keyValues.length; i++) {
        var keyValue = keyValues[i];
        var value = keyValue.value(self);
        object[keyValue.key] = value;
      }
      return object;
    };
  }

  function watchDecl () {
    var anchorName = expect().text;
    consume(":");
    var expressionFn;
    if (peekToken().text == '{') {
      consume("{");
      expressionFn = statements();
      consume("}");
    } else {
      expressionFn = expression();
    }
    return function(self) {
      return {name:anchorName, fn:expressionFn};
    };
  }
}

function Route(template, defaults) {
  this.template = template = template + '#';
  this.defaults = defaults || {};
  var urlParams = this.urlParams = {};
  forEach(template.split(/\W/), function(param){
    if (param && template.match(new RegExp(":" + param + "\\W"))) {
      urlParams[param] = true;
    }
  });
}

Route.prototype = {
  url: function(params) {
    var self = this,
        url = this.template,
        encodedVal;

    params = params || {};
    forEach(this.urlParams, function(_, urlParam){
      encodedVal = encodeUriSegment(params[urlParam] || self.defaults[urlParam] || "");
      url = url.replace(new RegExp(":" + urlParam + "(\\W)"), encodedVal + "$1");
    });
    url = url.replace(/\/?#$/, '');
    var query = [];
    forEachSorted(params, function(value, key){
      if (!self.urlParams[key]) {
        query.push(encodeUriQuery(key) + '=' + encodeUriQuery(value));
      }
    });
    url = url.replace(/\/*$/, '');
    return url + (query.length ? '?' + query.join('&') : '');
  }
};

function ResourceFactory(xhr) {
  this.xhr = xhr;
}

ResourceFactory.DEFAULT_ACTIONS = {
  'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'}
};

ResourceFactory.prototype = {
  route: function(url, paramDefaults, actions){
    var self = this;
    var route = new Route(url);
    actions = extend({}, ResourceFactory.DEFAULT_ACTIONS, actions);
    function extractParams(data){
      var ids = {};
      forEach(paramDefaults || {}, function(value, key){
        ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
      });
      return ids;
    }

    function Resource(value){
      copy(value || {}, this);
    }

    forEach(actions, function(action, name){
      var isPostOrPut = action.method == 'POST' || action.method == 'PUT';
      Resource[name] = function (a1, a2, a3, a4) {
        var params = {};
        var data;
        var success = noop;
        var error = null;
        switch(arguments.length) {
        case 4:
          error = a4;
          success = a3;
          //fallthrough
        case 3:
        case 2:
          if (isFunction(a2)) {
            if (isFunction(a1)) {
              success = a1;
              error = a2;
              break;
            }

            success = a2;
            error = a3;
            //fallthrough
          } else {
            params = a1;
            data = a2;
            success = a3;
            break;
          }
        case 1:
          if (isFunction(a1)) success = a1;
          else if (isPostOrPut) data = a1;
          else params = a1;
          break;
        case 0: break;
        default:
          throw "Expected between 0-4 arguments [params, data, success, error], got " +
            arguments.length + " arguments.";
        }

        var value = this instanceof Resource ? this : (action.isArray ? [] : new Resource(data));
        self.xhr(
          action.method,
          route.url(extend({}, action.params || {}, extractParams(data), params)),
          data,
          function(status, response, responseHeaders) {
            if (response) {
              if (action.isArray) {
                value.length = 0;
                forEach(response, function(item) {
                  value.push(new Resource(item));
                });
              } else {
                copy(response, value);
              }
            }
            (success||noop)(value, responseHeaders);
          },
          error || action.verifyCache,
          action.verifyCache);
        return value;
      };

      Resource.bind = function(additionalParamDefaults){
        return self.route(url, extend({}, paramDefaults, additionalParamDefaults), actions);
      };

      Resource.prototype['$' + name] = function(a1, a2, a3) {
        var params = extractParams(this),
            success = noop,
            error;

        switch(arguments.length) {
        case 3: params = a1; success = a2; error = a3; break;
        case 2:
        case 1:
          if (isFunction(a1)) {
            success = a1;
            error = a2;
          } else {
            params = a1;
            success = a2 || noop;
          }
        case 0: break;
        default:
          throw "Expected between 1-3 arguments [params, success, error], got " +
            arguments.length + " arguments.";
        }
        var data = isPostOrPut ? this : undefined;
        Resource[name].call(this, params, data, success, error);
      };
    });
    return Resource;
  }
};

//////////////////////////////
// Browser
//////////////////////////////
var XHR = window.XMLHttpRequest || function () {
  try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
  try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
  try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
  throw new Error("This browser does not support XMLHttpRequest.");
};


/**
 * @ngdoc service
 * @name angular.service.$browser
 * @requires $log
 *
 * @description
 * Constructor for the object exposed as $browser service.
 *
 * This object has two goals:
 *
 * - hide all the global state in the browser caused by the window object
 * - abstract away all the browser specific features and inconsistencies
 *
 * For tests we provide {@link angular.mock.service.$browser mock implementation} of the `$browser`
 * service, which can be used for convenient testing of the application without the interaction with
 * the real browser apis.
 */
/**
 * @param {object} window The global window object.
 * @param {object} document jQuery wrapped document.
 * @param {object} body jQuery wrapped document.body.
 * @param {function()} XHR XMLHttpRequest constructor.
 * @param {object} $log console.log or an object with the same interface.
 */
function Browser(window, document, body, XHR, $log) {
  var self = this,
      rawDocument = document[0],
      location = window.location,
      setTimeout = window.setTimeout,
      clearTimeout = window.clearTimeout,
      pendingDeferIds = {},
      lastLocationUrl;

  self.isMock = false;

  //////////////////////////////////////////////////////////////
  // XHR API
  //////////////////////////////////////////////////////////////
  var idCounter = 0;
  var outstandingRequestCount = 0;
  var outstandingRequestCallbacks = [];


  /**
   * Executes the `fn` function (supports currying) and decrements the `outstandingRequestCallbacks`
   * counter. If the counter reaches 0, all the `outstandingRequestCallbacks` are executed.
   */
  function completeOutstandingRequest(fn) {
    try {
      fn.apply(null, slice.call(arguments, 1));
    } finally {
      outstandingRequestCount--;
      if (outstandingRequestCount === 0) {
        while(outstandingRequestCallbacks.length) {
          try {
            outstandingRequestCallbacks.pop()();
          } catch (e) {
            $log.error(e);
          }
        }
      }
    }
  }

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#xhr
   * @methodOf angular.service.$browser
   *
   * @param {string} method Requested method (get|post|put|delete|head|json)
   * @param {string} url Requested url
   * @param {?string} post Post data to send (null if nothing to post)
   * @param {function(number, string, function([string]))} callback Function that will be called on
   *   response. The third argument is a function that can be called to return a specified response
   *   header or an Object containing all headers (when called with no arguments).
   * @param {object=} header additional HTTP headers to send with XHR.
   *   Standard headers are:
   *   <ul>
   *     <li><tt>Content-Type</tt>: <tt>application/x-www-form-urlencoded</tt></li>
   *     <li><tt>Accept</tt>: <tt>application/json, text/plain, &#42;/&#42;</tt></li>
   *     <li><tt>X-Requested-With</tt>: <tt>XMLHttpRequest</tt></li>
   *   </ul>
   *
   * @description
   * Send ajax request
   */
  self.xhr = function(method, url, post, callback, headers) {
    var parsedHeaders;

    outstandingRequestCount ++;
    if (lowercase(method) == 'json') {
      var callbackId = ("angular_" + Math.random() + '_' + (idCounter++)).replace(/\d\./, '');
      window[callbackId] = function(data) {
        window[callbackId].data = data;
      };

      var script = self.addJs(url.replace('JSON_CALLBACK', callbackId), null, function() {
        if (window[callbackId].data) {
          completeOutstandingRequest(callback, 200, window[callbackId].data);
        } else {
          completeOutstandingRequest(callback);
        }
        delete window[callbackId];
        body[0].removeChild(script);
      });
    } else {
      var xhr = new XHR();
      xhr.open(method, url, true);
      forEach(headers, function(value, key) {
          if (value) xhr.setRequestHeader(key, value);
      });
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // normalize IE bug (http://bugs.jquery.com/ticket/1450)
          var status = xhr.status == 1223 ? 204 : xhr.status || 200;
          completeOutstandingRequest(callback, status, xhr.responseText, function(header) {
            header = lowercase(header);

            if (header) {
              return parsedHeaders
                ? parsedHeaders[header] || null
                : xhr.getResponseHeader(header);
            } else {
              // Return an object containing each response header
              parsedHeaders = {};

              forEach(xhr.getAllResponseHeaders().split('\n'), function(line) {
                var i = line.indexOf(':'),
                    key = lowercase(trim(line.substr(0, i))),
                    value = trim(line.substr(i + 1));

                if (parsedHeaders[key]) {
                  // Combine repeated headers
                  // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
                  parsedHeaders[key] += ', ' + value;
                } else {
                  parsedHeaders[key] = value;
                }
              });

              return parsedHeaders;
            }
          });
        }
      };
      xhr.send(post || '');
    }
  };

  /**
   * @private
   * Note: this method is used only by scenario runner
   * TODO(vojta): prefix this method with $$ ?
   * @param {function()} callback Function that will be called when no outstanding request
   */
  self.notifyWhenNoOutstandingRequests = function(callback) {
    // force browser to execute all pollFns - this is needed so that cookies and other pollers fire
    // at some deterministic time in respect to the test runner's actions. Leaving things up to the
    // regular poller would result in flaky tests.
    forEach(pollFns, function(pollFn){ pollFn(); });

    if (outstandingRequestCount === 0) {
      callback();
    } else {
      outstandingRequestCallbacks.push(callback);
    }
  };

  //////////////////////////////////////////////////////////////
  // Poll Watcher API
  //////////////////////////////////////////////////////////////
  var pollFns = [],
      pollTimeout;

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addPollFn
   * @methodOf angular.service.$browser
   *
   * @param {function()} fn Poll function to add
   *
   * @description
   * Adds a function to the list of functions that poller periodically executes,
   * and starts polling if not started yet.
   *
   * @returns {function()} the added function
   */
  self.addPollFn = function(fn) {
    if (isUndefined(pollTimeout)) startPoller(100, setTimeout);
    pollFns.push(fn);
    return fn;
  };

  /**
   * @param {number} interval How often should browser call poll functions (ms)
   * @param {function()} setTimeout Reference to a real or fake `setTimeout` function.
   *
   * @description
   * Configures the poller to run in the specified intervals, using the specified
   * setTimeout fn and kicks it off.
   */
  function startPoller(interval, setTimeout) {
    (function check() {
      forEach(pollFns, function(pollFn){ pollFn(); });
      pollTimeout = setTimeout(check, interval);
    })();
  };

  //////////////////////////////////////////////////////////////
  // URL API
  //////////////////////////////////////////////////////////////

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#setUrl
   * @methodOf angular.service.$browser
   *
   * @param {string} url New url
   *
   * @description
   * Sets browser's url
   */
  self.setUrl = function(url) {

    var existingURL = lastLocationUrl;
    if (!existingURL.match(/#/)) existingURL += '#';
    if (!url.match(/#/)) url += '#';
    if (existingURL != url) {
      location.href = url;
    }
   };

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#getUrl
   * @methodOf angular.service.$browser
   *
   * @description
   * Get current browser's url
   *
   * @returns {string} Browser's url
   */
  self.getUrl = function() {
    return lastLocationUrl = location.href;
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#onHashChange
   * @methodOf angular.service.$browser
   *
   * @description
   * Detects if browser support onhashchange events and register a listener otherwise registers
   * $browser poller. The `listener` will then get called when the hash changes.
   *
   * The listener gets called with either HashChangeEvent object or simple object that also contains
   * `oldURL` and `newURL` properties.
   *
   * Note: this api is intended for use only by the $location service. Please use the
   * {@link angular.service.$location $location service} to monitor hash changes in angular apps.
   *
   * @param {function(event)} listener Listener function to be called when url hash changes.
   * @return {function()} Returns the registered listener fn - handy if the fn is anonymous.
   */
  self.onHashChange = function(listener) {
    // IE8 comp mode returns true, but doesn't support hashchange event
    var dm = window.document.documentMode;
    if ('onhashchange' in window && (isUndefined(dm) || dm >= 8)) {
      jqLite(window).bind('hashchange', listener);
    } else {
      var lastBrowserUrl = self.getUrl();

      self.addPollFn(function() {
        if (lastBrowserUrl != self.getUrl()) {
          listener();
          lastBrowserUrl = self.getUrl();
        }
      });
    }
    return listener;
  };

  //////////////////////////////////////////////////////////////
  // Cookies API
  //////////////////////////////////////////////////////////////
  var lastCookies = {};
  var lastCookieString = '';

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#cookies
   * @methodOf angular.service.$browser
   *
   * @param {string=} name Cookie name
   * @param {string=} value Cokkie value
   *
   * @description
   * The cookies method provides a 'private' low level access to browser cookies.
   * It is not meant to be used directly, use the $cookie service instead.
   *
   * The return values vary depending on the arguments that the method was called with as follows:
   * <ul>
   *   <li>cookies() -> hash of all cookies, this is NOT a copy of the internal state, so do not modify it</li>
   *   <li>cookies(name, value) -> set name to value, if value is undefined delete the cookie</li>
   *   <li>cookies(name) -> the same as (name, undefined) == DELETES (no one calls it right now that way)</li>
   * </ul>
   *
   * @returns {Object} Hash of all cookies (if called without any parameter)
   */
  self.cookies = function (name, value) {
    var cookieLength, cookieArray, cookie, i, keyValue, index;

    if (name) {
      if (value === undefined) {
        rawDocument.cookie = escape(name) + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else {
        if (isString(value)) {
          rawDocument.cookie = escape(name) + '=' + escape(value);

          cookieLength = name.length + value.length + 1;
          if (cookieLength > 4096) {
            $log.warn("Cookie '"+ name +"' possibly not set or overflowed because it was too large ("+
              cookieLength + " > 4096 bytes)!");
          }
          if (lastCookies.length > 20) {
            $log.warn("Cookie '"+ name +"' possibly not set or overflowed because too many cookies " +
              "were already set (" + lastCookies.length + " > 20 )");
          }
        }
      }
    } else {
      if (rawDocument.cookie !== lastCookieString) {
        lastCookieString = rawDocument.cookie;
        cookieArray = lastCookieString.split("; ");
        lastCookies = {};

        for (i = 0; i < cookieArray.length; i++) {
          cookie = cookieArray[i];
          index = cookie.indexOf('=');
          if (index > 0) { //ignore nameless cookies
            lastCookies[unescape(cookie.substring(0, index))] = unescape(cookie.substring(index + 1));
          }
        }
      }
      return lastCookies;
    }
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#defer
   * @methodOf angular.service.$browser
   * @param {function()} fn A function, who's execution should be defered.
   * @param {number=} [delay=0] of milliseconds to defer the function execution.
   * @returns {*} DeferId that can be used to cancel the task via `$browser.defer.cancel()`.
   *
   * @description
   * Executes a fn asynchroniously via `setTimeout(fn, delay)`.
   *
   * Unlike when calling `setTimeout` directly, in test this function is mocked and instead of using
   * `setTimeout` in tests, the fns are queued in an array, which can be programmatically flushed
   * via `$browser.defer.flush()`.
   *
   */
  self.defer = function(fn, delay) {
    var timeoutId;
    outstandingRequestCount++;
    timeoutId = setTimeout(function() {
      delete pendingDeferIds[timeoutId];
      completeOutstandingRequest(fn);
    }, delay || 0);
    pendingDeferIds[timeoutId] = true;
    return timeoutId;
  };


  /**
   * THIS DOC IS NOT VISIBLE because ngdocs can't process docs for foo#method.method
   *
   * @name angular.service.$browser#defer.cancel
   * @methodOf angular.service.$browser.defer
   * @returns {boolean} Returns `true` if the task hasn't executed yet and was successfuly canceled.
   *
   * @description
   * Cancels a defered task identified with `deferId`.
   */

  self.defer.cancel = function(deferId) {
    if (pendingDeferIds[deferId]) {
      delete pendingDeferIds[deferId];
      clearTimeout(deferId);
      completeOutstandingRequest(noop);
      return true;
    }
  };


  //////////////////////////////////////////////////////////////
  // Misc API
  //////////////////////////////////////////////////////////////
  var hoverListener = noop;

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#hover
   * @methodOf angular.service.$browser
   *
   * @description
   * Set hover listener.
   *
   * @param {function(Object, boolean)} listener Function that will be called when a hover event
   *    occurs.
   */
  self.hover = function(listener) { hoverListener = listener; };

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#bind
   * @methodOf angular.service.$browser
   *
   * @description
   * Register hover function to real browser
   */
  self.bind = function() {
    document.bind("mouseover", function(event){
      hoverListener(jqLite(msie ? event.srcElement : event.target), true);
      return true;
    });
    document.bind("mouseleave mouseout click dblclick keypress keyup", function(event){
      hoverListener(jqLite(event.target), false);
      return true;
    });
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addCss
   * @methodOf angular.service.$browser
   *
   * @param {string} url Url to css file
   * @description
   * Adds a stylesheet tag to the head.
   */
  self.addCss = function(url) {
    var link = jqLite(rawDocument.createElement('link'));
    link.attr('rel', 'stylesheet');
    link.attr('type', 'text/css');
    link.attr('href', url);
    body.append(link);
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addJs
   * @methodOf angular.service.$browser
   *
   * @param {string} url Url to js file
   * @param {string=} domId Optional id for the script tag
   *
   * @description
   * Adds a script tag to the head.
   */
  self.addJs = function(url, domId, done) {
    // we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
    // - fetches local scripts via XHR and evals them
    // - adds and immediately removes script elements from the document
    //
    // We need addJs to be able to add angular-ie-compat.js which is very special and must remain
    // part of the DOM so that the embedded images can reference it. jQuery's append implementation
    // (v1.4.2) fubars it.
    var script = rawDocument.createElement('script');

    script.type = 'text/javascript';
    script.src = url;
    if (domId) script.id = domId;

    if (msie) {
      script.onreadystatechange = function() {
        /loaded|complete/.test(script.readyState) && done && done();
      };
    } else {
      if (done) script.onload = script.onerror = done;
    }

    body[0].appendChild(script);

    return script;
  };
}

/*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */

// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
  END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/,
  ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
  BEGIN_TAG_REGEXP = /^</,
  BEGING_END_TAGE_REGEXP = /^<\s*\//,
  COMMENT_REGEXP = /<!--(.*?)-->/g,
  CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
  URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#)/,
  NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g; // Match everything outside of normal chars and " (quote character)

// Empty Elements - HTML 4.01
var emptyElements = makeMap("area,br,col,hr,img");

// Block Elements - HTML 4.01
var blockElements = makeMap("address,blockquote,center,dd,del,dir,div,dl,dt,"+
    "hr,ins,li,map,menu,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

// Inline Elements - HTML 4.01
var inlineElements = makeMap("a,abbr,acronym,b,bdo,big,br,cite,code,del,dfn,em,font,i,img,"+
    "ins,kbd,label,map,q,s,samp,small,span,strike,strong,sub,sup,tt,u,var");
// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelfElements = makeMap("colgroup,dd,dt,li,p,td,tfoot,th,thead,tr");
// Special Elements (can contain anything)
var specialElements = makeMap("script,style");
var validElements = extend({}, emptyElements, blockElements, inlineElements, closeSelfElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap("background,href,longdesc,src,usemap");
var validAttrs = extend({}, uriAttrs, makeMap(
    'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
    'scope,scrolling,shape,span,start,summary,target,title,type,'+
    'valign,value,vspace,width'));

/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser( html, handler ) {
  var index, chars, match, stack = [], last = html;
  stack.last = function(){ return stack[ stack.length - 1 ]; };

  while ( html ) {
    chars = true;

    // Make sure we're not in a script or style element
    if ( !stack.last() || !specialElements[ stack.last() ] ) {

      // Comment
      if ( html.indexOf("<!--") === 0 ) {
        index = html.indexOf("-->");

        if ( index >= 0 ) {
          if (handler.comment) handler.comment( html.substring( 4, index ) );
          html = html.substring( index + 3 );
          chars = false;
        }

      // end tag
      } else if ( BEGING_END_TAGE_REGEXP.test(html) ) {
        match = html.match( END_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( END_TAG_REGEXP, parseEndTag );
          chars = false;
        }

      // start tag
      } else if ( BEGIN_TAG_REGEXP.test(html) ) {
        match = html.match( START_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( START_TAG_REGEXP, parseStartTag );
          chars = false;
        }
      }

      if ( chars ) {
        index = html.indexOf("<");

        var text = index < 0 ? html : html.substring( 0, index );
        html = index < 0 ? "" : html.substring( index );

        if (handler.chars) handler.chars( decodeEntities(text) );
      }

    } else {
      html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'), function(all, text){
        text = text.
          replace(COMMENT_REGEXP, "$1").
          replace(CDATA_REGEXP, "$1");

        if (handler.chars) handler.chars( decodeEntities(text) );

        return "";
      });

      parseEndTag( "", stack.last() );
    }

    if ( html == last ) {
      throw "Parse Error: " + html;
    }
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag( tag, tagName, rest, unary ) {
    tagName = lowercase(tagName);
    if ( blockElements[ tagName ] ) {
      while ( stack.last() && inlineElements[ stack.last() ] ) {
        parseEndTag( "", stack.last() );
      }
    }

    if ( closeSelfElements[ tagName ] && stack.last() == tagName ) {
      parseEndTag( "", tagName );
    }

    unary = emptyElements[ tagName ] || !!unary;

    if ( !unary )
      stack.push( tagName );

    var attrs = {};

    rest.replace(ATTR_REGEXP, function(match, name, doubleQuotedValue, singleQoutedValue, unqoutedValue) {
      var value = doubleQuotedValue
        || singleQoutedValue
        || unqoutedValue
        || '';

      attrs[name] = decodeEntities(value);
    });
    if (handler.start) handler.start( tagName, attrs, unary );
  }

  function parseEndTag( tag, tagName ) {
    var pos = 0, i;
    tagName = lowercase(tagName);
    if ( tagName )
      // Find the closest opened tag of the same type
      for ( pos = stack.length - 1; pos >= 0; pos-- )
        if ( stack[ pos ] == tagName )
          break;

    if ( pos >= 0 ) {
      // Close all the open elements, up the stack
      for ( i = stack.length - 1; i >= pos; i-- )
        if (handler.end) handler.end( stack[ i ] );

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
}

/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
var hiddenPre=document.createElement("pre");
function decodeEntities(value) {
  hiddenPre.innerHTML=value.replace(/</g,"&lt;");
  return hiddenPre.innerText || hiddenPre.textContent || '';
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(NON_ALPHANUMERIC_REGEXP, function(value){
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf){
  var ignore = false;
  var out = bind(buf, buf.push);
  return {
    start: function(tag, attrs, unary){
      tag = lowercase(tag);
      if (!ignore && specialElements[tag]) {
        ignore = tag;
      }
      if (!ignore && validElements[tag] == true) {
        out('<');
        out(tag);
        forEach(attrs, function(value, key){
          var lkey=lowercase(key);
          if (validAttrs[lkey]==true && (uriAttrs[lkey]!==true || value.match(URI_REGEXP))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out(unary ? '/>' : '>');
      }
    },
    end: function(tag){
        tag = lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
    chars: function(chars){
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
  };
}

//////////////////////////////////
//JQLite
//////////////////////////////////

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.element
 * @function
 *
 * @description
 * Wraps a raw DOM element or HTML string as [jQuery](http://jquery.com) element.
 * `angular.element` is either an alias for [jQuery](http://api.jquery.com/jQuery/) function if
 * jQuery is loaded or a function that wraps the element or string in angular's jQuery lite
 * implementation.
 *
 * Real jQuery always takes precedence (as long as it was loaded before `DOMContentEvent`)
 *
 * Angular's jQuery lite implementation is a tiny API-compatible subset of jQuery which allows
 * angular to manipulate DOM. The jQuery lite implements only a subset of jQuery api, with the
 * focus on the most commonly needed functionality and minimal footprint. For this reason only a
 * limited number of jQuery methods, arguments and invocation styles are supported.
 *
 * Note: All element references in angular are always wrapped with jQuery (lite) and are never
 * raw DOM references.
 *
 * ## Angular's jQuery lite implements these functions:
 *
 * - [addClass()](http://api.jquery.com/addClass/)
 * - [after()](http://api.jquery.com/after/)
 * - [append()](http://api.jquery.com/append/)
 * - [attr()](http://api.jquery.com/attr/)
 * - [bind()](http://api.jquery.com/bind/)
 * - [children()](http://api.jquery.com/children/)
 * - [clone()](http://api.jquery.com/clone/)
 * - [css()](http://api.jquery.com/css/)
 * - [data()](http://api.jquery.com/data/)
 * - [hasClass()](http://api.jquery.com/hasClass/)
 * - [parent()](http://api.jquery.com/parent/)
 * - [remove()](http://api.jquery.com/remove/)
 * - [removeAttr()](http://api.jquery.com/removeAttr/)
 * - [removeClass()](http://api.jquery.com/removeClass/)
 * - [removeData()](http://api.jquery.com/removeData/)
 * - [replaceWith()](http://api.jquery.com/replaceWith/)
 * - [text()](http://api.jquery.com/text/)
 * - [trigger()](http://api.jquery.com/trigger/)
 * - [eq()](http://api.jquery.com/eq/)
 *
 * ## Additionally these methods extend the jQuery and  are available in both jQuery and jQuery lite
 * version:
 *
 *- `scope()` - retrieves the current angular scope of the element.
 *
 * @param {string|DOMElement} element HTML string or DOMElement to be wrapped into jQuery.
 * @returns {Object} jQuery object.
 */

var jqCache = {},
    jqName = 'ng-' + new Date().getTime(),
    jqId = 1,
    addEventListenerFn = (window.document.addEventListener
      ? function(element, type, fn) {element.addEventListener(type, fn, false);}
      : function(element, type, fn) {element.attachEvent('on' + type, fn);}),
    removeEventListenerFn = (window.document.removeEventListener
      ? function(element, type, fn) {element.removeEventListener(type, fn, false); }
      : function(element, type, fn) {element.detachEvent('on' + type, fn); });

function jqNextId() { return (jqId++); }


function getStyle(element) {
  var current = {}, style = element[0].style, value, name, i;
  if (typeof style.length == 'number') {
    for(i = 0; i < style.length; i++) {
      name = style[i];
      current[name] = style[name];
    }
  } else {
    for (name in style) {
      value = style[name];
      if (1*name != name && name != 'cssText' && value && typeof value == 'string' && value !='false')
        current[name] = value;
    }
  }
  return current;
}

/////////////////////////////////////////////
function jqLiteWrap(element) {
  if (isString(element) && element.charAt(0) != '<') {
    throw new Error('selectors not implemented');
  }
  return new JQLite(element);
}

function JQLite(element) {
  if (element instanceof JQLite) {
    return element;
  } else if (isString(element)) {
    var div = document.createElement('div');
    // Read about the NoScope elements here:
    // http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
    div.innerHTML = '<div>&nbsp;</div>' + element; // IE insanity to make NoScope elements work!
    div.removeChild(div.firstChild); // remove the superfluous div
    JQLiteAddNodes(this, div.childNodes);
    this.remove(); // detach the elements from the temporary DOM div.
  } else {
    JQLiteAddNodes(this, element);
  }
}

function JQLiteClone(element) {
  return element.cloneNode(true);
}

function JQLiteDealoc(element){
  JQLiteRemoveData(element);
  for ( var i = 0, children = element.childNodes || []; i < children.length; i++) {
    JQLiteDealoc(children[i]);
  }
}

function JQLiteRemoveData(element) {
  var cacheId = element[jqName],
  cache = jqCache[cacheId];
  if (cache) {
    forEach(cache.bind || {}, function(fn, type){
      removeEventListenerFn(element, type, fn);
    });
    delete jqCache[cacheId];
    element[jqName] = undefined; // ie does not allow deletion of attributes on elements.
  }
}

function JQLiteData(element, key, value) {
  var cacheId = element[jqName],
      cache = jqCache[cacheId || -1];
  if (isDefined(value)) {
    if (!cache) {
      element[jqName] = cacheId = jqNextId();
      cache = jqCache[cacheId] = {};
    }
    cache[key] = value;
  } else {
    return cache ? cache[key] : null;
  }
}

function JQLiteHasClass(element, selector, _) {
  // the argument '_' is important, since it makes the function have 3 arguments, which
  // is needed for delegate function to realize the this is a getter.
  var className = " " + selector + " ";
  return ((" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf( className ) > -1);
}

function JQLiteRemoveClass(element, selector) {
  element.className = trim(
      (" " + element.className + " ")
      .replace(/[\n\t]/g, " ")
      .replace(" " + selector + " ", "")
  );
}

function JQLiteAddClass(element, selector ) {
  if (!JQLiteHasClass(element, selector)) {
    element.className = trim(element.className + ' ' + selector);
  }
}

function JQLiteAddNodes(root, elements) {
  if (elements) {
    elements = (!elements.nodeName && isDefined(elements.length) && !isWindow(elements))
      ? elements
      : [ elements ];
    for(var i=0; i < elements.length; i++) {
      root.push(elements[i]);
    }
  }
}

//////////////////////////////////////////
// Functions which are declared directly.
//////////////////////////////////////////
var JQLitePrototype = JQLite.prototype = {
  ready: function(fn) {
    var fired = false;

    function trigger() {
      if (fired) return;
      fired = true;
      fn();
    }

    this.bind('DOMContentLoaded', trigger); // works for modern browsers and IE9
    // we can not use jqLite since we are not done loading and jQuery could be loaded later.
    jqLiteWrap(window).bind('load', trigger); // fallback to window.onload for others
  },
  toString: function() {
    var value = [];
    forEach(this, function(e){ value.push('' + e);});
    return '[' + value.join(', ') + ']';
  },

  eq: function(index) {
      return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
  },

  length: 0,
  push: push,
  sort: [].sort,
  splice: [].splice
};

//////////////////////////////////////////
// Functions iterating getter/setters.
// these functions return self on setter and
// value on get.
//////////////////////////////////////////
var SPECIAL_ATTR = makeMap("multiple,selected,checked,disabled,readonly");

forEach({
  data: JQLiteData,

  scope: function(element) {
    var scope;
    while (element && !(scope = jqLite(element).data($$scope))) {
      element = element.parentNode;
    }
    return scope;
  },

  removeAttr: function(element,name) {
    element.removeAttribute(name);
  },

  hasClass: JQLiteHasClass,

  css: function(element, name, value) {
    if (isDefined(value)) {
      element.style[name] = value;
    } else {
      return element.style[name];
    }
  },

  attr: function(element, name, value){
    if (SPECIAL_ATTR[name]) {
      if (isDefined(value)) {
        element[name] = !!value;
      } else {
        return element[name];
      }
    } else if (isDefined(value)) {
      element.setAttribute(name, value);
    } else if (element.getAttribute) {
      // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
      // some elements (e.g. Document) don't have get attribute, so return undefined
      var ret = element.getAttribute(name, 2);
      // normalize non-existing attributes to undefined (as jQuery)
      return ret === null ? undefined : ret;
    }
  },

  text: extend((msie < 9)
      ? function(element, value) {
        // NodeType == 3 is text node
        if (element.nodeType == 3) {
          if (isUndefined(value))
            return element.nodeValue;
          element.nodeValue = value;
        } else {
          if (isUndefined(value))
            return element.innerText;
          element.innerText = value;
        }
      }
      : function(element, value) {
        if (isUndefined(value)) {
          return element.textContent;
        }
        element.textContent = value;
      }, {$dv:''}),

  val: function(element, value) {
    if (isUndefined(value)) {
      return element.value;
    }
    element.value = value;
  },

  html: function(element, value) {
    if (isUndefined(value)) {
      return element.innerHTML;
    }
    for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) {
      JQLiteDealoc(childNodes[i]);
    }
    element.innerHTML = value;
  }
}, function(fn, name){
  /**
   * Properties: writes return selection, reads return first value
   */
  JQLite.prototype[name] = function(arg1, arg2) {
    var i, key;

    if ((fn.length == 2 ? arg1 : arg2) === undefined) {
      if (isObject(arg1)) {
        // we are a write, but the object properties are the key/values
        for(i=0; i < this.length; i++) {
          for (key in arg1) {
            fn(this[i], key, arg1[key]);
          }
        }
        // return self for chaining
        return this;
      } else {
        // we are a read, so read the first child.
        if (this.length)
          return fn(this[0], arg1, arg2);
      }
    } else {
      // we are a write, so apply to all children
      for(i=0; i < this.length; i++) {
        fn(this[i], arg1, arg2);
      }
      // return self for chaining
      return this;
    }
    return fn.$dv;
  };
});

//////////////////////////////////////////
// Functions iterating traversal.
// These functions chain results into a single
// selector.
//////////////////////////////////////////
forEach({
  removeData: JQLiteRemoveData,

  dealoc: JQLiteDealoc,

  bind: function(element, type, fn){
    var bind = JQLiteData(element, 'bind');
    if (!bind) JQLiteData(element, 'bind', bind = {});
    forEach(type.split(' '), function(type){
      var eventHandler = bind[type];
      if (!eventHandler) {
        bind[type] = eventHandler = function(event) {
          if (!event.preventDefault) {
            event.preventDefault = function(){
              event.returnValue = false; //ie
            };
          }
          if (!event.stopPropagation) {
            event.stopPropagation = function() {
              event.cancelBubble = true; //ie
            };
          }
          if (!event.target) {
            event.target = event.srcElement || document;
          }
          forEach(eventHandler.fns, function(fn){
            fn.call(element, event);
          });
        };
        eventHandler.fns = [];
        addEventListenerFn(element, type, eventHandler);
      }
      eventHandler.fns.push(fn);
    });
  },

  replaceWith: function(element, replaceNode) {
    var index, parent = element.parentNode;
    JQLiteDealoc(element);
    forEach(new JQLite(replaceNode), function(node){
      if (index) {
        parent.insertBefore(node, index.nextSibling);
      } else {
        parent.replaceChild(node, element);
      }
      index = node;
    });
  },

  children: function(element) {
    var children = [];
    forEach(element.childNodes, function(element){
      if (element.nodeName != '#text')
        children.push(element);
    });
    return children;
  },

  append: function(element, node) {
    forEach(new JQLite(node), function(child){
      if (element.nodeType === 1)
        element.appendChild(child);
    });
  },

  prepend: function(element, node) {
    if (element.nodeType === 1) {
      var index = element.firstChild;
      forEach(new JQLite(node), function(child){
        if (index) {
          element.insertBefore(child, index);
        } else {
          element.appendChild(child);
          index = child;
        }
      });
    }
  },

  remove: function(element) {
    JQLiteDealoc(element);
    var parent = element.parentNode;
    if (parent) parent.removeChild(element);
  },

  after: function(element, newElement) {
    var index = element, parent = element.parentNode;
    forEach(new JQLite(newElement), function(node){
      parent.insertBefore(node, index.nextSibling);
      index = node;
    });
  },

  addClass: JQLiteAddClass,
  removeClass: JQLiteRemoveClass,

  toggleClass: function(element, selector, condition) {
    if (isUndefined(condition)) {
      condition = !JQLiteHasClass(element, selector);
    }
    (condition ? JQLiteAddClass : JQLiteRemoveClass)(element, selector);
  },

  parent: function(element) {
    var parent = element.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },

  next: function(element) {
    return element.nextSibling;
  },

  find: function(element, selector) {
    return element.getElementsByTagName(selector);
  },

  clone: JQLiteClone
}, function(fn, name){
  /**
   * chaining functions
   */
  JQLite.prototype[name] = function(arg1, arg2) {
    var value;
    for(var i=0; i < this.length; i++) {
      if (value == undefined) {
        value = fn(this[i], arg1, arg2);
        if (value !== undefined) {
          // any function which returns a value needs to be wrapped
          value = jqLite(value);
        }
      } else {
        JQLiteAddNodes(value, fn(this[i], arg1, arg2));
      }
    }
    return value == undefined ? this : value;
  };
});

var angularGlobal = {
  'typeOf':function(obj){
    if (obj === null) return $null;
    var type = typeof obj;
    if (type == $object) {
      if (obj instanceof Array) return $array;
      if (isDate(obj)) return $date;
      if (obj.nodeType == 1) return $element;
    }
    return type;
  }
};


/**
 * @ngdoc overview
 * @name angular.Object
 * @function
 *
 * @description
 * A namespace for utility functions used to work with JavaScript objects. These functions are
 * exposed in two ways:
 *
 * __* Angular expressions:__ Functions are bound to all objects and augment the Object type. The
 * names of these methods are prefixed with the '$' character in order to minimize naming collisions.
 * To call a method, invoke the function without the first argument, e.g, `myObject.$foo(param2)`.
 *
 * __* JavaScript code:__ Functions don't augment the Object type and must be invoked as functions of
 * `angular.Object` as `angular.Object.foo(myObject, param2)`.
 *
 * * {@link angular.Object.copy angular.Object.copy()} - Creates a deep copy of the source parameter
 * * {@link angular.Object.equals angular.Object.equals()} - Determines if two objects or values are
 * equivalent
 * * {@link angular.Object.size angular.Object.size()} - Determines the number of elements in
 * strings, arrays, and objects.
 */
var angularCollection = {
  'copy': copy,
  'size': size,
  'equals': equals
};
var angularObject = {
  'extend': extend
};

/**
 * @ngdoc overview
 * @name angular.Array
 *
 * @description
 * A namespace for utility functions for the manipulation of JavaScript Array objects.
 *
 * These functions are exposed in two ways:
 *
 * * __Angular expressions:__ Functions are bound to the Array objects and augment the Array type as
 * array methods. The names of these methods are prefixed with $ character to minimize naming
 * collisions. To call a method, invoke myArrayObject.$foo(params).
 *
 *     Because Array type is a subtype of the Object type, all angular.Object functions augment
 *     theArray type in angular expressions as well.
 *
 * * __JavaScript code:__ Functions don't augment the Array type and must be invoked as functions of
 * `angular.Array` as `angular.Array.foo(myArrayObject, params)`.
 *
 * The following APIs are built-in to the angular Array object:
 *
 * * {@link angular.Array.add angular.Array.add()} - Optionally adds a new element to an array.
 * * {@link angular.Array.count angular.Array.count()} - Determines the number of elements in an
 * array.
 * * {@link angular.Array.filter angular.Array.filter()} - Returns a subset of items as a new array.
 * * {@link angular.Array.indexOf angular.Array.indexOf()} - Determines the index of an array value.
 * * {@link angular.Array.limitTo angular.Array.limitTo()} - Creates a new array off the front or
 * back of an existing array.
 * * {@link angular.Array.orderBy angular.Array.orderBy()} - Orders array elements
 * * {@link angular.Array.remove angular.Array.remove()} - Removes array elements
 * * {@link angular.Array.sum angular.Array.sum()} - Sums the number elements in an array
 */
var angularArray = {


  /**
   * @ngdoc function
   * @name angular.Array.indexOf
   * @function
   *
   * @description
   * Determines the index of `value` in `array`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Array to search.
   * @param {*} value Value to search for.
   * @returns {number} The position of the element in `array`. The position is 0-based. `-1` is returned if the value can't be found.
   *
   * @example
      <doc:example>
        <doc:source>
         <div ng:init="books = ['Moby Dick', 'Great Gatsby', 'Romeo and Juliet']"></div>
         <input name='bookName' value='Romeo and Juliet'> <br>
         Index of '{{bookName}}' in the list {{books}} is <em>{{books.$indexOf(bookName)}}</em>.
        </doc:source>
        <doc:scenario>
         it('should correctly calculate the initial index', function() {
           expect(binding('books.$indexOf(bookName)')).toBe('2');
         });

         it('should recalculate', function() {
           input('bookName').enter('foo');
           expect(binding('books.$indexOf(bookName)')).toBe('-1');

           input('bookName').enter('Moby Dick');
           expect(binding('books.$indexOf(bookName)')).toBe('0');
         });
        </doc:scenario>
      </doc:example>
   */
  'indexOf': indexOf,


  /**
   * @ngdoc function
   * @name angular.Array.sum
   * @function
   *
   * @description
   * This function calculates the sum of all numbers in `array`. If the `expressions` is supplied,
   * it is evaluated once for each element in `array` and then the sum of these values is returned.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The source array.
   * @param {(string|function())=} expression Angular expression or a function to be evaluated for each
   *     element in `array`. The array element becomes the `this` during the evaluation.
   * @returns {number} Sum of items in the array.
   *
   * @example
      <doc:example>
        <doc:source>
         <table ng:init="invoice= {items:[{qty:10, description:'gadget', cost:9.95}]}">
           <tr><th>Qty</th><th>Description</th><th>Cost</th><th>Total</th><th></th></tr>
           <tr ng:repeat="item in invoice.items">
             <td><input name="item.qty" value="1" size="4" ng:required ng:validate="integer"></td>
            <td><input name="item.description"></td>
              <td><input name="item.cost" value="0.00" ng:required ng:validate="number" size="6"></td>
             <td>{{item.qty * item.cost | currency}}</td>
             <td>[<a href ng:click="invoice.items.$remove(item)">X</a>]</td>
           </tr>
           <tr>
             <td><a href ng:click="invoice.items.$add()">add item</a></td>
             <td></td>
             <td>Total:</td>
             <td>{{invoice.items.$sum('qty*cost') | currency}}</td>
           </tr>
         </table>
        </doc:source>
        <doc:scenario>
         //TODO: these specs are lame because I had to work around issues #164 and #167
         it('should initialize and calculate the totals', function() {
           expect(repeater('.doc-example-live table tr', 'item in invoice.items').count()).toBe(3);
           expect(repeater('.doc-example-live table tr', 'item in invoice.items').row(1)).
             toEqual(['$99.50']);
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$99.50');
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$99.50');
         });

         it('should add an entry and recalculate', function() {
           element('.doc-example-live a:contains("add item")').click();
           using('.doc-example-live tr:nth-child(3)').input('item.qty').enter('20');
           using('.doc-example-live tr:nth-child(3)').input('item.cost').enter('100');

           expect(repeater('.doc-example-live table tr', 'item in invoice.items').row(2)).
             toEqual(['$2,000.00']);
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$2,099.50');
         });
        </doc:scenario>
      </doc:example>
   */
  'sum':function(array, expression) {
    var fn = angular['Function']['compile'](expression);
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      var value = 1 * fn(array[i]);
      if (!isNaN(value)){
        sum += value;
      }
    }
    return sum;
  },


  /**
   * @ngdoc function
   * @name angular.Array.remove
   * @function
   *
   * @description
   * Modifies `array` by removing an element from it. The element will be looked up using the
   * {@link angular.Array.indexOf indexOf} function on the `array` and only the first instance of
   * the element will be removed.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Array from which an element should be removed.
   * @param {*} value Element to be removed.
   * @returns {*} The removed element.
   *
   * @example
     <doc:example>
       <doc:source>
         <ul ng:init="tasks=['Learn Angular', 'Read Documentation',
                             'Check out demos', 'Build cool applications']">
           <li ng:repeat="task in tasks">
             {{task}} [<a href="" ng:click="tasks.$remove(task)">X</a>]
           </li>
         </ul>
         <hr/>
         tasks = {{tasks}}
       </doc:source>
       <doc:scenario>
         it('should initialize the task list with for tasks', function() {
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(4);
           expect(repeater('.doc-example-live ul li', 'task in tasks').column('task')).
             toEqual(['Learn Angular', 'Read Documentation', 'Check out demos',
                      'Build cool applications']);
         });

         it('should initialize the task list with for tasks', function() {
           element('.doc-example-live ul li a:contains("X"):first').click();
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(3);

           element('.doc-example-live ul li a:contains("X"):last').click();
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(2);

           expect(repeater('.doc-example-live ul li', 'task in tasks').column('task')).
             toEqual(['Read Documentation', 'Check out demos']);
         });
       </doc:scenario>
     </doc:example>
   */
  'remove':function(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
      array.splice(index, 1);
    return value;
  },


  /**
   * @ngdoc function
   * @name angular.Array.filter
   * @function
   *
   * @description
   * Selects a subset of items from `array` and returns it as a new array.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The source array.
   * @param {string|Object|function()} expression The predicate to be used for selecting items from
   *   `array`.
   *
   *   Can be one of:
   *
   *   - `string`: Predicate that results in a substring match using the value of `expression`
   *     string. All strings or objects with string properties in `array` that contain this string
   *     will be returned. The predicate can be negated by prefixing the string with `!`.
   *
   *   - `Object`: A pattern object can be used to filter specific properties on objects contained
   *     by `array`. For example `{name:"M", phone:"1"}` predicate will return an array of items
   *     which have property `name` containing "M" and property `phone` containing "1". A special
   *     property name `$` can be used (as in `{$:"text"}`) to accept a match against any
   *     property of the object. That's equivalent to the simple substring match with a `string`
   *     as described above.
   *
   *   - `function`: A predicate function can be used to write arbitrary filters. The function is
   *     called for each element of `array`. The final result is an array of those elements that
   *     the predicate returned true for.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="friends = [{name:'John', phone:'555-1276'},
                                  {name:'Mary', phone:'800-BIG-MARY'},
                                  {name:'Mike', phone:'555-4321'},
                                  {name:'Adam', phone:'555-5678'},
                                  {name:'Julie', phone:'555-8765'}]"></div>

         Search: <input name="searchText"/>
         <table id="searchTextResults">
           <tr><th>Name</th><th>Phone</th><tr>
           <tr ng:repeat="friend in friends.$filter(searchText)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
           <tr>
         </table>
         <hr>
         Any: <input name="search.$"/> <br>
         Name only <input name="search.name"/><br>
         Phone only <input name="search.phone"/><br>
         <table id="searchObjResults">
           <tr><th>Name</th><th>Phone</th><tr>
           <tr ng:repeat="friend in friends.$filter(search)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
           <tr>
         </table>
       </doc:source>
       <doc:scenario>
         it('should search across all fields when filtering with a string', function() {
           input('searchText').enter('m');
           expect(repeater('#searchTextResults tr', 'friend in friends').column('name')).
             toEqual(['Mary', 'Mike', 'Adam']);

           input('searchText').enter('76');
           expect(repeater('#searchTextResults tr', 'friend in friends').column('name')).
             toEqual(['John', 'Julie']);
         });

         it('should search in specific fields when filtering with a predicate object', function() {
           input('search.$').enter('i');
           expect(repeater('#searchObjResults tr', 'friend in friends').column('name')).
             toEqual(['Mary', 'Mike', 'Julie']);
         });
       </doc:scenario>
     </doc:example>
   */
  'filter':function(array, expression) {
    var predicates = [];
    predicates.check = function(value) {
      for (var j = 0; j < predicates.length; j++) {
        if(!predicates[j](value)) {
          return false;
        }
      }
      return true;
    };
    var search = function(obj, text){
      if (text.charAt(0) === '!') {
        return !search(obj, text.substr(1));
      }
      switch (typeof obj) {
      case "boolean":
      case "number":
      case "string":
        return ('' + obj).toLowerCase().indexOf(text) > -1;
      case "object":
        for ( var objKey in obj) {
          if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
            return true;
          }
        }
        return false;
      case "array":
        for ( var i = 0; i < obj.length; i++) {
          if (search(obj[i], text)) {
            return true;
          }
        }
        return false;
      default:
        return false;
      }
    };
    switch (typeof expression) {
      case "boolean":
      case "number":
      case "string":
        expression = {$:expression};
      case "object":
        for (var key in expression) {
          if (key == '$') {
            (function(){
              var text = (''+expression[key]).toLowerCase();
              if (!text) return;
              predicates.push(function(value) {
                return search(value, text);
              });
            })();
          } else {
            (function(){
              var path = key;
              var text = (''+expression[key]).toLowerCase();
              if (!text) return;
              predicates.push(function(value) {
                return search(getter(value, path), text);
              });
            })();
          }
        }
        break;
      case $function:
        predicates.push(expression);
        break;
      default:
        return array;
    }
    var filtered = [];
    for ( var j = 0; j < array.length; j++) {
      var value = array[j];
      if (predicates.check(value)) {
        filtered.push(value);
      }
    }
    return filtered;
  },


  /**
   * @workInProgress
   * @ngdoc function
   * @name angular.Array.add
   * @function
   *
   * @description
   * `add` is a function similar to JavaScript's `Array#push` method, in that it appends a new
   * element to an array. The difference is that the value being added is optional and defaults to
   * an empty object.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array expand.
   * @param {*=} [value={}] The value to be added.
   * @returns {Array} The expanded array.
   *
   * @TODO simplify the example.
   *
   * @example
   * This example shows how an initially empty array can be filled with objects created from user
   * input via the `$add` method.
     <doc:example>
       <doc:source>
         [<a href="" ng:click="people.$add()">add empty</a>]
         [<a href="" ng:click="people.$add({name:'John', sex:'male'})">add 'John'</a>]
         [<a href="" ng:click="people.$add({name:'Mary', sex:'female'})">add 'Mary'</a>]

         <ul ng:init="people=[]">
           <li ng:repeat="person in people">
             <input name="person.name">
             <select name="person.sex">
               <option value="">--chose one--</option>
               <option>male</option>
               <option>female</option>
             </select>
             [<a href="" ng:click="people.$remove(person)">X</a>]
           </li>
         </ul>
         <pre>people = {{people}}</pre>
       </doc:source>
       <doc:scenario>
         beforeEach(function() {
            expect(binding('people')).toBe('people = []');
         });

         it('should create an empty record when "add empty" is clicked', function() {
           element('.doc-example-live a:contains("add empty")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"",\n  "sex":null}]');
         });

         it('should create a "John" record when "add \'John\'" is clicked', function() {
           element('.doc-example-live a:contains("add \'John\'")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"John",\n  "sex":"male"}]');
         });

         it('should create a "Mary" record when "add \'Mary\'" is clicked', function() {
           element('.doc-example-live a:contains("add \'Mary\'")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"Mary",\n  "sex":"female"}]');
         });

         it('should delete a record when "X" is clicked', function() {
            element('.doc-example-live a:contains("add empty")').click();
            element('.doc-example-live li a:contains("X"):first').click();
            expect(binding('people')).toBe('people = []');
         });
       </doc:scenario>
     </doc:example>
   */
  'add':function(array, value) {
    array.push(isUndefined(value)? {} : value);
    return array;
  },


  /**
   * @ngdoc function
   * @name angular.Array.count
   * @function
   *
   * @description
   * Determines the number of elements in an array. Optionally it will count only those elements
   * for which the `condition` evaluates to `true`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array to count elements in.
   * @param {(function()|string)=} condition A function to be evaluated or angular expression to be
   *     compiled and evaluated. The element that is currently being iterated over, is exposed to
   *     the `condition` as `this`.
   * @returns {number} Number of elements in the array (for which the condition evaluates to true).
   *
   * @example
     <doc:example>
       <doc:source>
         <pre ng:init="items = [{name:'knife', points:1},
                                {name:'fork', points:3},
                                {name:'spoon', points:1}]"></pre>
         <ul>
           <li ng:repeat="item in items">
              {{item.name}}: points=
              <input type="text" name="item.points"/> <!-- id="item{{$index}} -->
           </li>
         </ul>
         <p>Number of items which have one point: <em>{{ items.$count('points==1') }}</em></p>
         <p>Number of items which have more than one point: <em>{{items.$count('points&gt;1')}}</em></p>
       </doc:source>
       <doc:scenario>
         it('should calculate counts', function() {
           expect(binding('items.$count(\'points==1\')')).toEqual(2);
           expect(binding('items.$count(\'points>1\')')).toEqual(1);
         });

         it('should recalculate when updated', function() {
           using('.doc-example-live li:first-child').input('item.points').enter('23');
           expect(binding('items.$count(\'points==1\')')).toEqual(1);
           expect(binding('items.$count(\'points>1\')')).toEqual(2);
         });
       </doc:scenario>
     </doc:example>
   */
  'count':function(array, condition) {
    if (!condition) return array.length;
    var fn = angular['Function']['compile'](condition), count = 0;
    forEach(array, function(value){
      if (fn(value)) {
        count ++;
      }
    });
    return count;
  },


  /**
   * @ngdoc function
   * @name angular.Array.orderBy
   * @function
   *
   * @description
   * Orders `array` by the `expression` predicate.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array to sort.
   * @param {function(*)|string|Array.<(function(*)|string)>} expression A predicate to be
   *    used by the comparator to determine the order of elements.
   *
   *    Can be one of:
   *
   *    - `function`: getter function. The result of this function will be sorted using the
   *      `<`, `=`, `>` operator
   *    - `string`: angular expression which evaluates to an object to order by, such as 'name' to
   *      sort by a property called 'name'. Optionally prefixed with `+` or `-` to control ascending
   *      or descending sort order (e.g. +name or -name).
   *    - `Array`: array of function or string predicates, such that a first predicate in the array
   *      is used for sorting, but when the items are equivalent next predicate is used.
   *
   * @param {boolean=} reverse Reverse the order the array.
   * @returns {Array} Sorted copy of the source array.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="friends = [{name:'John', phone:'555-1212', age:10},
                                  {name:'Mary', phone:'555-9876', age:19},
                                  {name:'Mike', phone:'555-4321', age:21},
                                  {name:'Adam', phone:'555-5678', age:35},
                                  {name:'Julie', phone:'555-8765', age:29}]"></div>

         <pre>Sorting predicate = {{predicate}}; reverse = {{reverse}}</pre>
         <hr/>
         [ <a href="" ng:click="predicate=''">unsorted</a> ]
         <table ng:init="predicate='-age'">
           <tr>
             <th><a href="" ng:click="predicate = 'name'; reverse=false">Name</a>
                 (<a href ng:click="predicate = '-name'; reverse=false">^</a>)</th>
             <th><a href="" ng:click="predicate = 'phone'; reverse=!reverse">Phone Number</a></th>
             <th><a href="" ng:click="predicate = 'age'; reverse=!reverse">Age</a></th>
           <tr>
           <tr ng:repeat="friend in friends.$orderBy(predicate, reverse)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
             <td>{{friend.age}}</td>
           <tr>
         </table>
       </doc:source>
       <doc:scenario>
         it('should be reverse ordered by aged', function() {
           expect(binding('predicate')).toBe('Sorting predicate = -age; reverse = ');
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.age')).
             toEqual(['35', '29', '21', '19', '10']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Adam', 'Julie', 'Mike', 'Mary', 'John']);
         });

         it('should reorder the table when user selects different predicate', function() {
           element('.doc-example-live a:contains("Name")').click();
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Adam', 'John', 'Julie', 'Mary', 'Mike']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.age')).
             toEqual(['35', '10', '29', '19', '21']);

           element('.doc-example-live a:contains("Phone")').click();
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.phone')).
             toEqual(['555-9876', '555-8765', '555-5678', '555-4321', '555-1212']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Mary', 'Julie', 'Adam', 'Mike', 'John']);
         });
       </doc:scenario>
     </doc:example>
   */
  'orderBy':function(array, sortPredicate, reverseOrder) {
    if (!sortPredicate) return array;
    sortPredicate = isArray(sortPredicate) ? sortPredicate: [sortPredicate];
    sortPredicate = map(sortPredicate, function(predicate){
      var descending = false, get = predicate || identity;
      if (isString(predicate)) {
        if ((predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
          descending = predicate.charAt(0) == '-';
          predicate = predicate.substring(1);
        }
        get = expressionCompile(predicate).fnSelf;
      }
      return reverseComparator(function(a,b){
        return compare(get(a),get(b));
      }, descending);
    });
    var arrayCopy = [];
    for ( var i = 0; i < array.length; i++) { arrayCopy.push(array[i]); }
    return arrayCopy.sort(reverseComparator(comparator, reverseOrder));

    function comparator(o1, o2){
      for ( var i = 0; i < sortPredicate.length; i++) {
        var comp = sortPredicate[i](o1, o2);
        if (comp !== 0) return comp;
      }
      return 0;
    }
    function reverseComparator(comp, descending) {
      return toBoolean(descending)
          ? function(a,b){return comp(b,a);}
          : comp;
    }
    function compare(v1, v2){
      var t1 = typeof v1;
      var t2 = typeof v2;
      if (t1 == t2) {
        if (t1 == "string") v1 = v1.toLowerCase();
        if (t1 == "string") v2 = v2.toLowerCase();
        if (v1 === v2) return 0;
        return v1 < v2 ? -1 : 1;
      } else {
        return t1 < t2 ? -1 : 1;
      }
    }
  },


  /**
   * @ngdoc function
   * @name angular.Array.limitTo
   * @function
   *
   * @description
   * Creates a new array containing only the first, or last `limit` number of elements of the
   * source `array`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Source array to be limited.
   * @param {string|Number} limit The length of the returned array. If the number is positive, the
   *     first `limit` items from the source array will be copied, if the number is negative, the
   *     last `limit` items will be copied.
   * @returns {Array} A new sub-array of length `limit`.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="numbers = [1,2,3,4,5,6,7,8,9]">
           Limit [1,2,3,4,5,6,7,8,9] to: <input name="limit" value="3"/>
           <p>Output: {{ numbers.$limitTo(limit) | json }}</p>
         </div>
       </doc:source>
       <doc:scenario>
         it('should limit the numer array to first three items', function() {
           expect(element('.doc-example-live input[name=limit]').val()).toBe('3');
           expect(binding('numbers.$limitTo(limit) | json')).toEqual('[1,2,3]');
         });

         it('should update the output when -3 is entered', function() {
           input('limit').enter(-3);
           expect(binding('numbers.$limitTo(limit) | json')).toEqual('[7,8,9]');
         });
       </doc:scenario>
     </doc:example>
   */
  limitTo: function(array, limit) {
    limit = parseInt(limit, 10);
    var out = [],
        i, n;

    if (limit > 0) {
      i = 0;
      n = limit;
    } else {
      i = array.length + limit;
      n = array.length;
    }

    for (; i<n; i++) {
      out.push(array[i]);
    }

    return out;
  }
};

var R_ISO8061_STR = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d)(?:\:(\d\d)(?:\:(\d\d)(?:\.(\d{3}))?)?)?Z)?$/;

var angularString = {
  'quote':function(string) {
    return '"' + string.replace(/\\/g, '\\\\').
                        replace(/"/g, '\\"').
                        replace(/\n/g, '\\n').
                        replace(/\f/g, '\\f').
                        replace(/\r/g, '\\r').
                        replace(/\t/g, '\\t').
                        replace(/\v/g, '\\v') +
             '"';
  },
  'quoteUnicode':function(string) {
    var str = angular['String']['quote'](string);
    var chars = [];
    for ( var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      if (ch < 128) {
        chars.push(str.charAt(i));
      } else {
        var encode = "000" + ch.toString(16);
        chars.push("\\u" + encode.substring(encode.length - 4));
      }
    }
    return chars.join('');
  },

  /**
   * Tries to convert input to date and if successful returns the date, otherwise returns the input.
   * @param {string} string
   * @return {(Date|string)}
   */
  'toDate':function(string){
    var match;
    if (isString(string) && (match = string.match(R_ISO8061_STR))){
      var date = new Date(0);
      date.setUTCFullYear(match[1], match[2] - 1, match[3]);
      date.setUTCHours(match[4]||0, match[5]||0, match[6]||0, match[7]||0);
      return date;
    }
    return string;
  }
};

var angularDate = {
    'toString':function(date){
       if (!date) return date;

       var isoString = date.toISOString ? date.toISOString() : '';

       return (isoString.length==24) ?
                isoString :
                padNumber(date.getUTCFullYear(), 4) + '-' +
                  padNumber(date.getUTCMonth() + 1, 2) + '-' +
                  padNumber(date.getUTCDate(), 2) + 'T' +
                  padNumber(date.getUTCHours(), 2) + ':' +
                  padNumber(date.getUTCMinutes(), 2) + ':' +
                  padNumber(date.getUTCSeconds(), 2) + '.' +
                  padNumber(date.getUTCMilliseconds(), 3) + 'Z';
    }
  };

var angularFunction = {
  'compile':function(expression) {
    if (isFunction(expression)){
      return expression;
    } else if (expression){
      return expressionCompile(expression).fnSelf;
    } else {
      return identity;
    }
  }
};

/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either call $hashKey function on object or assign unique hashKey id.
 *
 * @param obj
 * @returns {String} hash string such that the same input will have the same hash string
 */
function hashKey(obj) {
  var objType = typeof obj;
  var key = obj;
  if (objType == 'object') {
    if (typeof (key = obj.$hashKey) == 'function') {
      // must invoke on object to keep the right this
      key = obj.$hashKey();
    } else if (key === undefined) {
      key = obj.$hashKey = nextUid();
    }
  };
  return objType + ':' + key;
}

/**
 * HashMap which can use objects as keys
 */
function HashMap(){}
HashMap.prototype = {
  /**
   * Store key value pair
   * @param key key to store can be any type
   * @param value value to store can be any type
   * @returns old value if any
   */
  put: function(key, value) {
    var _key = hashKey(key);
    var oldValue = this[_key];
    this[_key] = value;
    return oldValue;
  },

  /**
   * @param key
   * @returns the value for the key
   */
  get: function(key) {
    return this[hashKey(key)];
  },

  /**
   * Remove the key/value pair
   * @param key
   * @returns value associated with key before it was removed
   */
  remove: function(key) {
    var _key = hashKey(key);
    var value = this[_key];
    delete this[_key];
    return value;
  }
};

function defineApi(dst, chain){
  angular[dst] = angular[dst] || {};
  forEach(chain, function(parent){
    extend(angular[dst], parent);
  });
}
defineApi('Global', [angularGlobal]);
defineApi('Collection', [angularGlobal, angularCollection]);
defineApi('Array', [angularGlobal, angularCollection, angularArray]);
defineApi('Object', [angularGlobal, angularCollection, angularObject]);
defineApi('String', [angularGlobal, angularString]);
defineApi('Date', [angularGlobal, angularDate]);
//IE bug
angular.Date.toString = angularDate.toString;
defineApi('Function', [angularGlobal, angularCollection, angularFunction]);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.filter
 * @description
 *
 * Filters are used for formatting data displayed to the user.
 *
 * The general syntax in templates is as follows:
 *
 *         {{ expression | [ filter_name ] }}
 *
 * Following is the list of built-in angular filters:
 *
 * * {@link angular.filter.currency currency}
 * * {@link angular.filter.date date}
 * * {@link angular.filter.html html}
 * * {@link angular.filter.json json}
 * * {@link angular.filter.linky linky}
 * * {@link angular.filter.lowercase lowercase}
 * * {@link angular.filter.number number}
 * * {@link angular.filter.uppercase uppercase}
 *
 * For more information about how angular filters work, and how to create your own filters, see
 * {@link guide/dev_guide.templates.filters Understanding Angular Filters} in the angular Developer
 * Guide.
 */

/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.currency
 * @function
 *
 * @description
 * Formats a number as a currency (ie $1,234.56). When no currency symbol is provided, default
 * symbol for current locale is used.
 *
 * @param {number} amount Input to filter.
 * @param {string=} symbol Currency symbol or identifier to be displayed.
 * @returns {string} Formatted number.
 *
 * @css ng-format-negative
 *   When the value is negative, this css class is applied to the binding making it (by default) red.
 *
 * @example
   <doc:example>
     <doc:source>
       <input type="text" name="amount" value="1234.56"/> <br/>
       default currency symbol ($): {{amount | currency}}<br/>
       custom currency identifier (USD$): {{amount | currency:"USD$"}}
     </doc:source>
     <doc:scenario>
       it('should init with 1234.56', function(){
         expect(binding('amount | currency')).toBe('$1,234.56');
         expect(binding('amount | currency:"USD$"')).toBe('USD$1,234.56');
       });
       it('should update', function(){
         input('amount').enter('-1234');
         expect(binding('amount | currency')).toBe('($1,234.00)');
         expect(binding('amount | currency:"USD$"')).toBe('(USD$1,234.00)');
         expect(element('.doc-example-live .ng-binding').attr('className')).
           toMatch(/ng-format-negative/);
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.currency = function(amount, currencySymbol){
  this.$element.toggleClass('ng-format-negative', amount < 0);
  if (isUndefined(currencySymbol)) currencySymbol = NUMBER_FORMATS.CURRENCY_SYM;
  return formatNumber(amount, 2, 1).replace(/\u00A4/g, currencySymbol);
};

/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.number
 * @function
 *
 * @description
 * Formats a number as text.
 *
 * If the input is not a number an empty string is returned.
 *
 * @param {number|string} number Number to format.
 * @param {(number|string)=} [fractionSize=2] Number of decimal places to round the number to.
 * @returns {string} Number rounded to decimalPlaces and places a “,” after each third digit.
 *
 * @example
   <doc:example>
     <doc:source>
       Enter number: <input name='val' value='1234.56789' /><br/>
       Default formatting: {{val | number}}<br/>
       No fractions: {{val | number:0}}<br/>
       Negative number: {{-val | number:4}}
     </doc:source>
     <doc:scenario>
       it('should format numbers', function(){
         expect(binding('val | number')).toBe('1,234.568');
         expect(binding('val | number:0')).toBe('1,235');
         expect(binding('-val | number:4')).toBe('-1,234.5679');
       });

       it('should update', function(){
         input('val').enter('3374.333');
         expect(binding('val | number')).toBe('3,374.333');
         expect(binding('val | number:0')).toBe('3,374');
         expect(binding('-val | number:4')).toBe('-3,374.3330');
       });
     </doc:scenario>
   </doc:example>
 */

// PATTERNS[0] is an array for Decimal Pattern, PATTERNS[1] is an array Currency Pattern
// Following is the order in each pattern array:
// 0: minInteger,
// 1: minFraction,
// 2: maxFraction,
// 3: positivePrefix,
// 4: positiveSuffix,
// 5: negativePrefix,
// 6: negativeSuffix,
// 7: groupSize,
// 8: lastGroupSize
var NUMBER_FORMATS = {
      DECIMAL_SEP: '.',
      GROUP_SEP: ',',
      PATTERNS: [[1, 0, 3, '', '', '-', '', 3, 3],[1, 2, 2, '\u00A4', '', '(\u00A4', ')', 3, 3]],
      CURRENCY_SYM: '$'
};
var DECIMAL_SEP = '.';

angularFilter.number = function(number, fractionSize) {
  if (isNaN(number) || !isFinite(number)) return '';
  return formatNumber(number, fractionSize, 0);
};

function formatNumber(number, fractionSize, type) {
  var isNegative = number < 0,
      type = type || 0, // 0 is decimal pattern, 1 is currency pattern
      pattern = NUMBER_FORMATS.PATTERNS[type];

  number = Math.abs(number);
  var numStr =  number + '',
      formatedText = '',
      parts = [];

  if (numStr.indexOf('e') !== -1) {
    var formatedText = numStr;
  } else {
    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

    //determine fractionSize if it is not specified
    if (isUndefined(fractionSize)) {
      fractionSize = Math.min(Math.max(pattern[1], fractionLen), pattern[2]);
    }

    var pow = Math.pow(10, fractionSize);
    number = Math.round(number * pow) / pow;
    var fraction = ('' + number).split(DECIMAL_SEP);
    var whole = fraction[0];
    fraction = fraction[1] || '';

    var pos = 0,
        lgroup = pattern[8],
        group = pattern[7];

    if (whole.length >= (lgroup + group)) {
      pos = whole.length - lgroup;
      for (var i = 0; i < pos; i++) {
        if ((pos - i)%group === 0 && i !== 0) {
          formatedText += NUMBER_FORMATS.GROUP_SEP;
        }
        formatedText += whole.charAt(i);
      }
    }

    for (i = pos; i < whole.length; i++) {
      if ((whole.length - i)%lgroup === 0 && i !== 0) {
        formatedText += NUMBER_FORMATS.GROUP_SEP;
      }
      formatedText += whole.charAt(i);
    }

    // format fraction part.
    while(fraction.length < fractionSize) {
      fraction += '0';
    }
    if (fractionSize) formatedText += NUMBER_FORMATS.DECIMAL_SEP + fraction.substr(0, fractionSize);
  }

  parts.push(isNegative ? pattern[5] : pattern[3]);
  parts.push(formatedText);
  parts.push(isNegative ? pattern[6] : pattern[4]);
  return parts.join('');
}

function padNumber(num, digits, trim) {
  var neg = '';
  if (num < 0) {
    neg =  '-';
    num = -num;
  }
  num = '' + num;
  while(num.length < digits) num = '0' + num;
  if (trim)
    num = num.substr(num.length - digits);
  return neg + num;
}


function dateGetter(name, size, offset, trim) {
  return function(date) {
    var value = date['get' + name]();
    if (offset > 0 || value > -offset)
      value += offset;
    if (value === 0 && offset == -12 ) value = 12;
    return padNumber(value, size, trim);
  };
}

function dateStrGetter(name, shortForm) {
  return function(date) {
    var value = date['get' + name]();

    if(name == 'Month') {
      value = MONTH[value];
    } else {
      value = DAY[value];
    }

    return shortForm ? value.substr(0,3) : value;
  };
}

function timeZoneGetter(numFormat) {
  return function(date) {
    var timeZone;
    if (numFormat || !(timeZone = GET_TIME_ZONE.exec(date.toString()))) {
      var offset = date.getTimezoneOffset();
      return padNumber(offset / 60, 2) + padNumber(Math.abs(offset % 60), 2);
    }
    return timeZone[0];
  };
}

var DAY = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');

var MONTH = 'January,February,March,April,May,June,July,August,September,October,November,December'.
             split(',');

var DATE_FORMATS = {
  yyyy: dateGetter('FullYear', 4),
    yy: dateGetter('FullYear', 2, 0, true),
     y: dateGetter('FullYear', 1),
  MMMM: dateStrGetter('Month'),
   MMM: dateStrGetter('Month', true),
    MM: dateGetter('Month', 2, 1),
     M: dateGetter('Month', 1, 1),
    dd: dateGetter('Date', 2),
     d: dateGetter('Date', 1),
    HH: dateGetter('Hours', 2),
     H: dateGetter('Hours', 1),
    hh: dateGetter('Hours', 2, -12),
     h: dateGetter('Hours', 1, -12),
    mm: dateGetter('Minutes', 2),
     m: dateGetter('Minutes', 1),
    ss: dateGetter('Seconds', 2),
     s: dateGetter('Seconds', 1),
  EEEE: dateStrGetter('Day'),
   EEE: dateStrGetter('Day', true),
     a: function(date){return date.getHours() < 12 ? 'am' : 'pm';},
     z: timeZoneGetter(false),
     Z: timeZoneGetter(true)
};

var DEFAULT_DATETIME_FORMATS = {
         long: 'MMMM d, y h:mm:ss a z',
       medium: 'MMM d, y h:mm:ss a',
        short: 'M/d/yy h:mm a',
    fullDate: 'EEEE, MMMM d, y',
    longDate: 'MMMM d, y',
  mediumDate: 'MMM d, y',
   shortDate: 'M/d/yy',
    longTime: 'h:mm:ss a z',
  mediumTime: 'h:mm:ss a',
   shortTime: 'h:mm a'
};

var GET_TIME_ZONE = /[A-Z]{3}(?![+\-])/;
var DATE_FORMATS_SPLIT = /([^yMdHhmsazZE]*)(E+|y+|M+|d+|H+|h+|m+|s+|a|Z|z)(.*)/;
var OPERA_TOSTRING_PATTERN = /^[\d].*Z$/;
var NUMBER_STRING = /^\d+$/;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.date
 * @function
 *
 * @description
 *   Formats `date` to a string based on the requested `format`.
 *
 *   `format` string can be composed of the following elements:
 *
 *   * `'yyyy'`: 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
 *   * `'yy'`: 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
 *   * `'y'`: 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
 *   * `'MMMM'`: Month in year (January-December)
 *   * `'MMM'`: Month in year (Jan-Dec)
 *   * `'MM'`: Month in year, padded (01-12)
 *   * `'M'`: Month in year (1-12)
 *   * `'dd'`: Day in month, padded (01-31)
 *   * `'d'`: Day in month (1-31)
 *   * `'EEEE'`: Day in Week,(Sunday-Saturday)
 *   * `'EEE'`: Day in Week, (Sun-Sat)
 *   * `'HH'`: Hour in day, padded (00-23)
 *   * `'H'`: Hour in day (0-23)
 *   * `'hh'`: Hour in am/pm, padded (01-12)
 *   * `'h'`: Hour in am/pm, (1-12)
 *   * `'mm'`: Minute in hour, padded (00-59)
 *   * `'m'`: Minute in hour (0-59)
 *   * `'ss'`: Second in minute, padded (00-59)
 *   * `'s'`: Second in minute (0-59)
 *   * `'a'`: am/pm marker
 *   * `'Z'`: 4 digit (+sign) representation of the timezone offset (-1200-1200)
 *   * `'z'`: short form of current timezone name (e.g. PDT)
 *
 *   `format` string can also be the following default formats for `en_US` locale (support for other
 *    locales will be added in the future versions):
 *
 *   * `'long'`: equivalent to `'MMMM d, y h:mm:ss a z'` for en_US  locale
 *     (e.g. September 3, 2010 12:05:08 pm PDT)
 *   * `'medium'`: equivalent to `'MMM d, y h:mm:ss a'` for en_US locale
 *     (e.g. Sep 3, 2010 12:05:08 pm)
 *   * `'short'`: equivalent to `'M/d/yy h:mm a'` for en_US  locale (e.g. 9/3/10 12:05 pm)
 *   * `'fullDate'`: equivalent to `'EEEE, MMMM d,y'` for en_US  locale
 *     (e.g. Friday, September 3, 2010)
 *   * `'longDate'`: equivalent to `'MMMM d, y'` for en_US  locale (e.g. September 3, 2010
 *   * `'mediumDate'`: equivalent to `'MMM d, y'` for en_US  locale (e.g. Sep 3, 2010)
 *   * `'shortDate'`: equivalent to `'M/d/yy'` for en_US locale (e.g. 9/3/10)
 *   * `'longTime'`: equivalent to `'h:mm:ss a z'` for en_US locale (e.g. 12:05:08 pm PDT)
 *   * `'mediumTime'`: equivalent to `'h:mm:ss a'` for en_US locale (e.g. 12:05:08 pm)
 *   * `'shortTime'`: equivalent to `'h:mm a'` for en_US locale (e.g. 12:05 pm)
 *
 * @param {(Date|number|string)} date Date to format either as Date object, milliseconds (string or
 *    number) or ISO 8601 extended datetime string (yyyy-MM-ddTHH:mm:ss.SSSZ).
 * @param {string=} format Formatting rules (see Description). If not specified,
 *    Date#toLocaleDateString is used.
 * @returns {string} Formatted string or the input if input is not recognized as date/millis.
 *
 * @example
   <doc:example>
     <doc:source>
       <span ng:non-bindable>{{1288323623006 | date:'medium'}}</span>:
           {{1288323623006 | date:'medium'}}<br/>
       <span ng:non-bindable>{{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}</span>:
          {{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}<br/>
       <span ng:non-bindable>{{1288323623006 | date:'MM/dd/yyyy @ h:mma'}}</span>:
          {{'1288323623006' | date:'MM/dd/yyyy @ h:mma'}}<br/>
     </doc:source>
     <doc:scenario>
       it('should format date', function(){
         expect(binding("1288323623006 | date:'medium'")).
            toMatch(/Oct 2\d, 2010 \d{1,2}:\d{2}:\d{2} (am|pm)/);
         expect(binding("1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'")).
            toMatch(/2010\-10\-2\d \d{2}:\d{2}:\d{2} \-?\d{4}/);
         expect(binding("'1288323623006' | date:'MM/dd/yyyy @ h:mma'")).
            toMatch(/10\/2\d\/2010 @ \d{1,2}:\d{2}(am|pm)/);
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.date = function(date, format) {
  format = DEFAULT_DATETIME_FORMATS[format] || format;
  if (isString(date)) {
    if (NUMBER_STRING.test(date)) {
      date = parseInt(date, 10);
    } else {
      date = angularString.toDate(date);
    }
  }

  if (isNumber(date)) {
    date = new Date(date);
  }

  if (!isDate(date)) {
    return date;
  }

  var text = date.toLocaleDateString(), fn;
  if (format && isString(format)) {
    text = '';
    var parts = [], match;
    while(format) {
      match = DATE_FORMATS_SPLIT.exec(format);
      if (match) {
        parts = concat(parts, match, 1);
        format = parts.pop();
      } else {
        parts.push(format);
        format = null;
      }
    }
    forEach(parts, function(value){
      fn = DATE_FORMATS[value];
      text += fn ? fn(date) : value;
    });
  }
  return text;
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.json
 * @function
 *
 * @description
 *   Allows you to convert a JavaScript object into JSON string.
 *
 *   This filter is mostly useful for debugging. When using the double curly {{value}} notation
 *   the binding is automatically converted to JSON.
 *
 * @param {*} object Any JavaScript object (including arrays and primitive types) to filter.
 * @returns {string} JSON string.
 *
 * @css ng-monospace Always applied to the encapsulating element.
 *
 * @example:
   <doc:example>
     <doc:source>
       <input type="text" name="objTxt" value="{a:1, b:[]}"
              ng:eval="obj = $eval(objTxt)"/>
       <pre>{{ obj | json }}</pre>
     </doc:source>
     <doc:scenario>
       it('should jsonify filtered objects', function() {
         expect(binding('obj | json')).toBe('{\n  "a":1,\n  "b":[]}');
       });

       it('should update', function() {
         input('objTxt').enter('[1, 2, 3]');
         expect(binding('obj | json')).toBe('[1,2,3]');
       });
     </doc:scenario>
   </doc:example>
 *
 */
angularFilter.json = function(object) {
  this.$element.addClass("ng-monospace");
  return toJson(object, true);
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.lowercase
 * @function
 *
 * @see angular.lowercase
 */
angularFilter.lowercase = lowercase;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.uppercase
 * @function
 *
 * @see angular.uppercase
 */
angularFilter.uppercase = uppercase;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.html
 * @function
 *
 * @description
 *   Prevents the input from getting escaped by angular. By default the input is sanitized and
 *   inserted into the DOM as is.
 *
 *   The input is sanitized by parsing the html into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer.
 *
 *   If you hate your users, you may call the filter with optional 'unsafe' argument, which bypasses
 *   the html sanitizer, but makes your application vulnerable to XSS and other attacks. Using this
 *   option is strongly discouraged and should be used only if you absolutely trust the input being
 *   filtered and you can't get the content through the sanitizer.
 *
 * @param {string} html Html input.
 * @param {string=} option If 'unsafe' then do not sanitize the HTML input.
 * @returns {string} Sanitized or raw html.
 *
 * @example
   <doc:example>
     <doc:source>
      Snippet: <textarea name="snippet" cols="60" rows="3">
     &lt;p style="color:blue"&gt;an html
     &lt;em onmouseover="this.textContent='PWN3D!'"&gt;click here&lt;/em&gt;
     snippet&lt;/p&gt;</textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="html-filter">
           <td>html filter</td>
           <td>
             <pre>&lt;div ng:bind="snippet | html"&gt;<br/>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng:bind="snippet | html"></div>
           </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng:bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet"></div></td>
         </tr>
         <tr id="html-unsafe-filter">
           <td>unsafe html filter</td>
           <td><pre>&lt;div ng:bind="snippet | html:'unsafe'"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet | html:'unsafe'"></div></td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should sanitize the html snippet ', function(){
         expect(using('#html-filter').binding('snippet | html')).
           toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
       });

       it('should escape snippet without any filter', function() {
         expect(using('#escaped-html').binding('snippet')).
           toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
                "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
                "snippet&lt;/p&gt;");
       });

       it('should inline raw snippet if filtered as unsafe', function() {
         expect(using('#html-unsafe-filter').binding("snippet | html:'unsafe'")).
           toBe("<p style=\"color:blue\">an html\n" +
                "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
                "snippet</p>");
       });

       it('should update', function(){
         input('snippet').enter('new <b>text</b>');
         expect(using('#html-filter').binding('snippet | html')).toBe('new <b>text</b>');
         expect(using('#escaped-html').binding('snippet')).toBe("new &lt;b&gt;text&lt;/b&gt;");
         expect(using('#html-unsafe-filter').binding("snippet | html:'unsafe'")).toBe('new <b>text</b>');
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.html =  function(html, option){
  return new HTML(html, option);
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.linky
 * @function
 *
 * @description
 *   Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 *   plain email address links.
 *
 * @param {string} text Input text.
 * @returns {string} Html-linkified text.
 *
 * @example
   <doc:example>
     <doc:source>
       Snippet: <textarea name="snippet" cols="60" rows="3">
  Pretty text with some links:
  http://angularjs.org/,
  mailto:us@somewhere.org,
  another@somewhere.org,
  and one more: ftp://127.0.0.1/.</textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng:bind="snippet | linky"&gt;<br/>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng:bind="snippet | linky"></div>
           </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng:bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet"></div></td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should linkify the snippet with urls', function(){
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('Pretty text with some links:\n' +
                '<a href="http://angularjs.org/">http://angularjs.org/</a>,\n' +
                '<a href="mailto:us@somewhere.org">us@somewhere.org</a>,\n' +
                '<a href="mailto:another@somewhere.org">another@somewhere.org</a>,\n' +
                'and one more: <a href="ftp://127.0.0.1/">ftp://127.0.0.1/</a>.');
       });

       it ('should not linkify snippet without the linky filter', function() {
         expect(using('#escaped-html').binding('snippet')).
           toBe("Pretty text with some links:\n" +
                "http://angularjs.org/,\n" +
                "mailto:us@somewhere.org,\n" +
                "another@somewhere.org,\n" +
                "and one more: ftp://127.0.0.1/.");
       });

       it('should update', function(){
         input('snippet').enter('new http://link.');
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('new <a href="http://link">http://link</a>.');
         expect(using('#escaped-html').binding('snippet')).toBe('new http://link.');
       });
     </doc:scenario>
   </doc:example>
 */
//TODO: externalize all regexps
angularFilter.linky = function(text){
  if (!text) return text;
  var URL = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/;
  var match;
  var raw = text;
  var html = [];
  var writer = htmlSanitizeWriter(html);
  var url;
  var i;
  while (match=raw.match(URL)) {
    // We can not end in these as they are sometimes found at the end of the sentence
    url = match[0];
    // if we did not match ftp/http/mailto then assume mailto
    if (match[2]==match[3]) url = 'mailto:' + url;
    i = match.index;
    writer.chars(raw.substr(0, i));
    writer.start('a', {href:url});
    writer.chars(match[0].replace(/^mailto:/, ''));
    writer.end('a');
    raw = raw.substring(i + match[0].length);
  }
  writer.chars(raw);
  return new HTML(html.join(''));
};

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.formatter
 * @description
 *
 * Formatters are used for translating data formats between those used for display and those used
 * for storage.
 *
 * Following is the list of built-in angular formatters:
 *
 * * {@link angular.formatter.boolean boolean} - Formats user input in boolean format
 * * {@link angular.formatter.json json} - Formats user input in JSON format
 * * {@link angular.formatter.list list} - Formats user input string as an array
 * * {@link angular.formatter.number number} - Formats user input strings as a number
 * * {@link angular.formatter.trim trim} - Trims extras spaces from end of user input
 *
 * For more information about how angular formatters work, and how to create your own formatters,
 * see {@link guide/dev_guide.templates.formatters Understanding Angular Formatters} in the angular
 * Developer Guide.
 */

function formatter(format, parse) {return {'format':format, 'parse':parse || format};}
function toString(obj) {
  return (isDefined(obj) && obj !== null) ? "" + obj : obj;
}

var NUMBER = /^\s*[-+]?\d*(\.\d*)?\s*$/;

angularFormatter.noop = formatter(identity, identity);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.json
 *
 * @description
 *   Formats the user input as JSON text.
 *
 * @returns {?string} A JSON string representation of the model.
 *
 * @example
   <doc:example>
     <doc:source>
      <div ng:init="data={name:'misko', project:'angular'}">
        <input type="text" size='50' name="data" ng:format="json"/>
        <pre>data={{data}}</pre>
      </div>
     </doc:source>
     <doc:scenario>
      it('should format json', function(){
        expect(binding('data')).toEqual('data={\n  \"name\":\"misko\",\n  \"project\":\"angular\"}');
        input('data').enter('{}');
        expect(binding('data')).toEqual('data={\n  }');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.json = formatter(toJson, function(value){
  return fromJson(value || 'null');
});

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.boolean
 *
 * @description
 *   Use boolean formatter if you wish to store the data as boolean.
 *
 * @returns {boolean} Converts to `true` unless user enters (blank), `f`, `false`, `0`, `no`, `[]`.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter truthy text:
        <input type="text" name="value" ng:format="boolean" value="no"/>
        <input type="checkbox" name="value"/>
        <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
        it('should format boolean', function(){
          expect(binding('value')).toEqual('value=false');
          input('value').enter('truthy');
          expect(binding('value')).toEqual('value=true');
        });
     </doc:scenario>
   </doc:example>
 */
angularFormatter['boolean'] = formatter(toString, toBoolean);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.number
 *
 * @description
 * Use number formatter if you wish to convert the user entered string to a number.
 *
 * @returns {number} Number from the parsed string.
 *
 * @example
   <doc:example>
     <doc:source>
      Enter valid number:
      <input type="text" name="value" ng:format="number" value="1234"/>
      <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
      it('should format numbers', function(){
        expect(binding('value')).toEqual('value=1234');
        input('value').enter('5678');
        expect(binding('value')).toEqual('value=5678');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.number = formatter(toString, function(obj){
  if (obj == null || NUMBER.exec(obj)) {
    return obj===null || obj === '' ? null : 1*obj;
  } else {
    throw "Not a number";
  }
});

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.list
 *
 * @description
 * Use list formatter if you wish to convert the user entered string to an array.
 *
 * @returns {Array} Array parsed from the entered string.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter a list of items:
        <input type="text" name="value" ng:format="list" value=" chair ,, table"/>
        <input type="text" name="value" ng:format="list"/>
        <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
      it('should format lists', function(){
        expect(binding('value')).toEqual('value=["chair","table"]');
        this.addFutureAction('change to XYZ', function($window, $document, done){
          $document.elements('.doc-example-live :input:last').val(',,a,b,').trigger('change');
          done();
        });
        expect(binding('value')).toEqual('value=["a","b"]');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.list = formatter(
  function(obj) { return obj ? obj.join(", ") : obj; },
  function(value) {
    var list = [];
    forEach((value || '').split(','), function(item){
      item = trim(item);
      if (item) list.push(item);
    });
    return list;
  }
);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.trim
 *
 * @description
 * Use trim formatter if you wish to trim extra spaces in user text.
 *
 * @returns {String} Trim excess leading and trailing space.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter text with leading/trailing spaces:
        <input type="text" name="value" ng:format="trim" value="  book  "/>
        <input type="text" name="value" ng:format="trim"/>
        <pre>value={{value|json}}</pre>
     </doc:source>
     <doc:scenario>
        it('should format trim', function(){
          expect(binding('value')).toEqual('value="book"');
          this.addFutureAction('change to XYZ', function($window, $document, done){
            $document.elements('.doc-example-live :input:last').val('  text  ').trigger('change');
            done();
          });
          expect(binding('value')).toEqual('value="text"');
        });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.trim = formatter(
  function(obj) { return obj ? trim("" + obj) : ""; }
);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.validator
 * @description
 *
 * Most of the built-in angular validators are used to check user input against defined types or
 * patterns.  You can easily create your own custom validators as well.
 *
 * Following is the list of built-in angular validators:
 *
 * * {@link angular.validator.asynchronous asynchronous()} - Provides asynchronous validation via a
 * callback function.
 * * {@link angular.validator.date date()} - Checks user input against default date format:
 * "MM/DD/YYYY"
 * * {@link angular.validator.email email()} - Validates that user input is a well-formed email
 * address.
 * * {@link angular.validator.integer integer()} - Validates that user input is an integer
 * * {@link angular.validator.json json()} - Validates that user input is valid JSON
 * * {@link angular.validator.number number()} - Validates that user input is a number
 * * {@link angular.validator.phone phone()} - Validates that user input matches the pattern
 * "1(123)123-1234"
 * * {@link angular.validator.regexp regexp()} - Restricts valid input to a specified regular
 * expression pattern
 * * {@link angular.validator.url url()} - Validates that user input is a well-formed URL.
 *
 * For more information about how angular validators work, and how to create your own validators,
 * see {@link guide/dev_guide.templates.validators Understanding Angular Validators} in the angular
 * Developer Guide.
 */

extend(angularValidator, {
  'noop': function() { return null; },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.regexp
   * @description
   * Use regexp validator to restrict the input to any Regular Expression.
   *
   * @param {string} value value to validate
   * @param {string|regexp} expression regular expression.
   * @param {string=} msg error message to display.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <script> function Cntl(){
         this.ssnRegExp = /^\d\d\d-\d\d-\d\d\d\d$/;
        }
        </script>
        Enter valid SSN:
        <div ng:controller="Cntl">
        <input name="ssn" value="123-45-6789" ng:validate="regexp:ssnRegExp" >
        </div>
      </doc:source>
      <doc:scenario>
        it('should invalidate non ssn', function(){
         var textBox = element('.doc-example-live :input');
         expect(textBox.attr('className')).not().toMatch(/ng-validation-error/);
         expect(textBox.val()).toEqual('123-45-6789');
         input('ssn').enter('123-45-67890');
         expect(textBox.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'regexp': function(value, regexp, msg) {
    if (!value.match(regexp)) {
      return msg ||
        "Value does not match expected format " + regexp + ".";
    } else {
      return null;
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.number
   * @description
   * Use number validator to restrict the input to numbers with an
   * optional range. (See integer for whole numbers validator).
   *
   * @param {string} value value to validate
   * @param {int=} [min=MIN_INT] minimum value.
   * @param {int=} [max=MAX_INT] maximum value.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter number: <input name="n1" ng:validate="number" > <br>
        Enter number greater than 10: <input name="n2" ng:validate="number:10" > <br>
        Enter number between 100 and 200: <input name="n3" ng:validate="number:100:200" > <br>
      </doc:source>
      <doc:scenario>
        it('should invalidate number', function(){
         var n1 = element('.doc-example-live :input[name=n1]');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('n1').enter('1.x');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
         var n2 = element('.doc-example-live :input[name=n2]');
         expect(n2.attr('className')).not().toMatch(/ng-validation-error/);
         input('n2').enter('9');
         expect(n2.attr('className')).toMatch(/ng-validation-error/);
         var n3 = element('.doc-example-live :input[name=n3]');
         expect(n3.attr('className')).not().toMatch(/ng-validation-error/);
         input('n3').enter('201');
         expect(n3.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'number': function(value, min, max) {
    var num = 1 * value;
    if (num == value) {
      if (typeof min != $undefined && num < min) {
        return "Value can not be less than " + min + ".";
      }
      if (typeof min != $undefined && num > max) {
        return "Value can not be greater than " + max + ".";
      }
      return null;
    } else {
      return "Not a number";
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.integer
   * @description
   * Use number validator to restrict the input to integers with an
   * optional range. (See integer for whole numbers validator).
   *
   * @param {string} value value to validate
   * @param {int=} [min=MIN_INT] minimum value.
   * @param {int=} [max=MAX_INT] maximum value.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter integer: <input name="n1" ng:validate="integer" > <br>
        Enter integer equal or greater than 10: <input name="n2" ng:validate="integer:10" > <br>
        Enter integer between 100 and 200 (inclusive): <input name="n3" ng:validate="integer:100:200" > <br>
      </doc:source>
      <doc:scenario>
        it('should invalidate integer', function(){
         var n1 = element('.doc-example-live :input[name=n1]');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('n1').enter('1.1');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
         var n2 = element('.doc-example-live :input[name=n2]');
         expect(n2.attr('className')).not().toMatch(/ng-validation-error/);
         input('n2').enter('10.1');
         expect(n2.attr('className')).toMatch(/ng-validation-error/);
         var n3 = element('.doc-example-live :input[name=n3]');
         expect(n3.attr('className')).not().toMatch(/ng-validation-error/);
         input('n3').enter('100.1');
         expect(n3.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   */
  'integer': function(value, min, max) {
    var numberError = angularValidator['number'](value, min, max);
    if (numberError) return numberError;
    if (!("" + value).match(/^\s*[\d+]*\s*$/) || value != Math.round(value)) {
      return "Not a whole number";
    }
    return null;
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.date
   * @description
   * Use date validator to restrict the user input to a valid date
   * in format in format MM/DD/YYYY.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid date:
        <input name="text" value="1/1/2009" ng:validate="date" >
      </doc:source>
      <doc:scenario>
        it('should invalidate date', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('123/123/123');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'date': function(value) {
    var fields = /^(\d\d?)\/(\d\d?)\/(\d\d\d\d)$/.exec(value);
    var date = fields ? new Date(fields[3], fields[1]-1, fields[2]) : 0;
    return (date &&
            date.getFullYear() == fields[3] &&
            date.getMonth() == fields[1]-1 &&
            date.getDate() == fields[2])
              ? null
              : "Value is not a date. (Expecting format: 12/31/2009).";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.email
   * @description
   * Use email validator if you wist to restrict the user input to a valid email.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid email:
        <input name="text" ng:validate="email" value="me@example.com">
      </doc:source>
      <doc:scenario>
        it('should invalidate email', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('a@b.c');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'email': function(value) {
    if (value.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/)) {
      return null;
    }
    return "Email needs to be in username@host.com format.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.phone
   * @description
   * Use phone validator to restrict the input phone numbers.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid phone number:
        <input name="text" value="1(234)567-8901" ng:validate="phone" >
      </doc:source>
      <doc:scenario>
        it('should invalidate phone', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('+12345678');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'phone': function(value) {
    if (value.match(/^1\(\d\d\d\)\d\d\d-\d\d\d\d$/)) {
      return null;
    }
    if (value.match(/^\+\d{2,3} (\(\d{1,5}\))?[\d ]+\d$/)) {
      return null;
    }
    return "Phone number needs to be in 1(987)654-3210 format in North America " +
           "or +999 (123) 45678 906 internationally.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.url
   * @description
   * Use phone validator to restrict the input URLs.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid URL:
        <input name="text" value="http://example.com/abc.html" size="40" ng:validate="url" >
      </doc:source>
      <doc:scenario>
        it('should invalidate url', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('abc://server/path');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'url': function(value) {
    if (value.match(/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/)) {
      return null;
    }
    return "URL needs to be in http://server[:port]/path format.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.json
   * @description
   * Use json validator if you wish to restrict the user input to a valid JSON.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <textarea name="json" cols="60" rows="5" ng:validate="json">
        {name:'abc'}
        </textarea>
      </doc:source>
      <doc:scenario>
        it('should invalidate json', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('json').enter('{name}');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'json': function(value) {
    try {
      fromJson(value);
      return null;
    } catch (e) {
      return e.toString();
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.asynchronous
   * @description
   * Use asynchronous validator if the validation can not be computed
   * immediately, but is provided through a callback. The widget
   * automatically shows a spinning indicator while the validity of
   * the widget is computed. This validator caches the result.
   *
   * @param {string} value value to validate
   * @param {function(inputToValidate,validationDone)} validate function to call to validate the state
   *         of the input.
   * @param {function(data)=} [update=noop] function to call when state of the
   *    validator changes
   *
   * @paramDescription
   * The `validate` function (specified by you) is called as
   * `validate(inputToValidate, validationDone)`:
   *
   *    * `inputToValidate`: value of the input box.
   *    * `validationDone`: `function(error, data){...}`
   *       * `error`: error text to display if validation fails
   *       * `data`: data object to pass to update function
   *
   * The `update` function is optionally specified by you and is
   * called by <angular/> on input change. Since the
   * asynchronous validator caches the results, the update
   * function can be called without a call to `validate`
   * function. The function is called as `update(data)`:
   *
   *    * `data`: data object as passed from validate function
   *
   * @css ng-input-indicator-wait, ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <script>
        function MyCntl(){
         this.myValidator = function (inputToValidate, validationDone) {
           setTimeout(function(){
             validationDone(inputToValidate.length % 2);
           }, 500);
         }
        }
        </script>
        This input is validated asynchronously:
        <div ng:controller="MyCntl">
          <input name="text" ng:validate="asynchronous:myValidator">
        </div>
      </doc:source>
      <doc:scenario>
        it('should change color in delayed way', function(){
         var textBox = element('.doc-example-live :input');
         expect(textBox.attr('className')).not().toMatch(/ng-input-indicator-wait/);
         expect(textBox.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('X');
         expect(textBox.attr('className')).toMatch(/ng-input-indicator-wait/);
         sleep(.6);
         expect(textBox.attr('className')).not().toMatch(/ng-input-indicator-wait/);
         expect(textBox.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  /*
   * cache is attached to the element
   * cache: {
   *   inputs : {
   *     'user input': {
   *        response: server response,
   *        error: validation error
   *     },
   *     current: 'current input'
   *   }
   * }
   *
   */
  'asynchronous': function(input, asynchronousFn, updateFn) {
    if (!input) return;
    var scope = this;
    var element = scope.$element;
    var cache = element.data('$asyncValidator');
    if (!cache) {
      element.data('$asyncValidator', cache = {inputs:{}});
    }

    cache.current = input;

    var inputState = cache.inputs[input],
        $invalidWidgets = scope.$service('$invalidWidgets');

    if (!inputState) {
      cache.inputs[input] = inputState = { inFlight: true };
      $invalidWidgets.markInvalid(scope.$element);
      element.addClass('ng-input-indicator-wait');
      asynchronousFn(input, function(error, data) {
        inputState.response = data;
        inputState.error = error;
        inputState.inFlight = false;
        if (cache.current == input) {
          element.removeClass('ng-input-indicator-wait');
          $invalidWidgets.markValid(element);
        }
        element.data($$validate)();
        scope.$service('$updateView')();
      });
    } else if (inputState.inFlight) {
      // request in flight, mark widget invalid, but don't show it to user
      $invalidWidgets.markInvalid(scope.$element);
    } else {
      (updateFn||noop)(inputState.response);
    }
    return inputState.error;
  }

});

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$cookieStore
 * @requires $cookies
 *
 * @description
 * Provides a key-value (string-object) storage, that is backed by session cookies.
 * Objects put or retrieved from this storage are automatically serialized or
 * deserialized by angular's toJson/fromJson.
 * @example
 */
angularServiceInject('$cookieStore', function($store) {

  return {
    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#get
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Returns the value of given cookie key
     *
     * @param {string} key Id to use for lookup.
     * @returns {Object} Deserialized cookie value.
     */
    get: function(key) {
      return fromJson($store[key]);
    },

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#put
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Sets a value for given cookie key
     *
     * @param {string} key Id for the `value`.
     * @param {Object} value Value to be stored.
     */
    put: function(key, value) {
      $store[key] = toJson(value);
    },

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#remove
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Remove given cookie
     *
     * @param {string} key Id of the key-value pair to delete.
     */
    remove: function(key) {
      delete $store[key];
    }
  };

}, ['$cookies']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$cookies
 * @requires $browser
 *
 * @description
 * Provides read/write access to browser's cookies.
 *
 * Only a simple Object is exposed and by adding or removing properties to/from
 * this object, new cookies are created/deleted at the end of current $eval.
 *
 * @example
 */
angularServiceInject('$cookies', function($browser) {
  var rootScope = this,
      cookies = {},
      lastCookies = {},
      lastBrowserCookies,
      runEval = false;

  //creates a poller fn that copies all cookies from the $browser to service & inits the service
  $browser.addPollFn(function() {
    var currentCookies = $browser.cookies();
    if (lastBrowserCookies != currentCookies) { //relies on browser.cookies() impl
      lastBrowserCookies = currentCookies;
      copy(currentCookies, lastCookies);
      copy(currentCookies, cookies);
      if (runEval) rootScope.$eval();
    }
  })();

  runEval = true;

  //at the end of each eval, push cookies
  //TODO: this should happen before the "delayed" watches fire, because if some cookies are not
  //      strings or browser refuses to store some cookies, we update the model in the push fn.
  this.$onEval(PRIORITY_LAST, push);

  return cookies;


  /**
   * Pushes all the cookies from the service to the browser and verifies if all cookies were stored.
   */
  function push(){
    var name,
        value,
        browserCookies,
        updated;

    //delete any cookies deleted in $cookies
    for (name in lastCookies) {
      if (isUndefined(cookies[name])) {
        $browser.cookies(name, undefined);
      }
    }

    //update all cookies updated in $cookies
    for(name in cookies) {
      value = cookies[name];
      if (!isString(value)) {
        if (isDefined(lastCookies[name])) {
          cookies[name] = lastCookies[name];
        } else {
          delete cookies[name];
        }
      } else if (value !== lastCookies[name]) {
        $browser.cookies(name, value);
        updated = true;
      }
    }

    //verify what was actually stored
    if (updated){
      updated = false;
      browserCookies = $browser.cookies();

      for (name in cookies) {
        if (cookies[name] !== browserCookies[name]) {
          //delete or reset all cookies that the browser dropped from $cookies
          if (isUndefined(browserCookies[name])) {
            delete cookies[name];
          } else {
            cookies[name] = browserCookies[name];
          }
          updated = true;
        }
      }
    }
  }
}, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$defer
 * @requires $browser
 * @requires $exceptionHandler
 * @requires $updateView
 *
 * @description
 * Delegates to {@link angular.service.$browser $browser.defer}, but wraps the `fn` function
 * into a try/catch block and delegates any exceptions to
 * {@link angular.service.$exceptionHandler $exceptionHandler} service.
 *
 * In tests you can use `$browser.defer.flush()` to flush the queue of deferred functions.
 *
 * @param {function()} fn A function, who's execution should be deferred.
 * @param {number=} [delay=0] of milliseconds to defer the function execution.
 */
angularServiceInject('$defer', function($browser, $exceptionHandler, $updateView) {
  return function(fn, delay) {
    $browser.defer(function() {
      try {
        fn();
      } catch(e) {
        $exceptionHandler(e);
      } finally {
        $updateView();
      }
    }, delay);
  };
}, ['$browser', '$exceptionHandler', '$updateView']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$document
 * @requires $window
 *
 * @description
 * A {@link angular.element jQuery (lite)}-wrapped reference to the browser's `window.document`
 * element.
 */
angularServiceInject("$document", function(window){
  return jqLite(window.document);
}, ['$window']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$exceptionHandler
 * @requires $log
 *
 * @description
 * Any uncaught exception in angular expressions is delegated to this service.
 * The default implementation simply delegates to `$log.error` which logs it into
 * the browser console.
 *
 * In unit tests, if `angular-mocks.js` is loaded, this service is overriden by
 * {@link angular.mock.service.$exceptionHandler mock $exceptionHandler}
 *
 * @example
 */
var $exceptionHandlerFactory; //reference to be used only in tests
angularServiceInject('$exceptionHandler', $exceptionHandlerFactory = function($log){
  return function(e) {
    $log.error(e);
  };
}, ['$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$hover
 * @requires $browser
 * @requires $document
 *
 * @description
 *
 * @example
 */
angularServiceInject("$hover", function(browser, document) {
  var tooltip, self = this, error, width = 300, arrowWidth = 10, body = jqLite(document[0].body);
  browser.hover(function(element, show){
    if (show && (error = element.attr(NG_EXCEPTION) || element.attr(NG_VALIDATION_ERROR))) {
      if (!tooltip) {
        tooltip = {
            callout: jqLite('<div id="ng-callout"></div>'),
            arrow: jqLite('<div></div>'),
            title: jqLite('<div class="ng-title"></div>'),
            content: jqLite('<div class="ng-content"></div>')
        };
        tooltip.callout.append(tooltip.arrow);
        tooltip.callout.append(tooltip.title);
        tooltip.callout.append(tooltip.content);
        body.append(tooltip.callout);
      }
      var docRect = body[0].getBoundingClientRect(),
          elementRect = element[0].getBoundingClientRect(),
          leftSpace = docRect.right - elementRect.right - arrowWidth;
      tooltip.title.text(element.hasClass("ng-exception") ? "EXCEPTION:" : "Validation error...");
      tooltip.content.text(error);
      if (leftSpace < width) {
        tooltip.arrow.addClass('ng-arrow-right');
        tooltip.arrow.css({left: (width + 1)+'px'});
        tooltip.callout.css({
          position: 'fixed',
          left: (elementRect.left - arrowWidth - width - 4) + "px",
          top: (elementRect.top - 3) + "px",
          width: width + "px"
        });
      } else {
        tooltip.arrow.addClass('ng-arrow-left');
        tooltip.callout.css({
          position: 'fixed',
          left: (elementRect.right + arrowWidth) + "px",
          top: (elementRect.top - 3) + "px",
          width: width + "px"
        });
      }
    } else if (tooltip) {
      tooltip.callout.remove();
      tooltip = null;
    }
  });
}, ['$browser', '$document'], true);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$invalidWidgets
 *
 * @description
 * Keeps references to all invalid widgets found during validation.
 * Can be queried to find whether there are any invalid widgets currently displayed.
 *
 * @example
 */
angularServiceInject("$invalidWidgets", function(){
  var invalidWidgets = [];


  /** Remove an element from the array of invalid widgets */
  invalidWidgets.markValid = function(element){
    var index = indexOf(invalidWidgets, element);
    if (index != -1)
      invalidWidgets.splice(index, 1);
  };


  /** Add an element to the array of invalid widgets */
  invalidWidgets.markInvalid = function(element){
    var index = indexOf(invalidWidgets, element);
    if (index === -1)
      invalidWidgets.push(element);
  };


  /** Return count of all invalid widgets that are currently visible */
  invalidWidgets.visible = function() {
    var count = 0;
    forEach(invalidWidgets, function(widget){
      count = count + (isVisible(widget) ? 1 : 0);
    });
    return count;
  };


  /* At the end of each eval removes all invalid widgets that are not part of the current DOM. */
  this.$onEval(PRIORITY_LAST, function() {
    for(var i = 0; i < invalidWidgets.length;) {
      var widget = invalidWidgets[i];
      if (isOrphan(widget[0])) {
        invalidWidgets.splice(i, 1);
        if (widget.dealoc) widget.dealoc();
      } else {
        i++;
      }
    }
  });


  /**
   * Traverses DOM element's (widget's) parents and considers the element to be an orphant if one of
   * it's parents isn't the current window.document.
   */
  function isOrphan(widget) {
    if (widget == window.document) return false;
    var parent = widget.parentNode;
    return !parent || isOrphan(parent);
  }

  return invalidWidgets;
});

var URL_MATCH = /^(file|ftp|http|https):\/\/(\w+:{0,1}\w*@)?([\w\.-]*)(:([0-9]+))?(\/[^\?#]*)?(\?([^#]*))?(#(.*))?$/,
    HASH_MATCH = /^([^\?]*)?(\?([^\?]*))?$/,
    DEFAULT_PORTS = {'http': 80, 'https': 443, 'ftp':21};

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$location
 * @requires $browser
 *
 * @property {string} href The full URL of the current location.
 * @property {string} protocol The protocol part of the URL (e.g. http or https).
 * @property {string} host The host name, ip address or FQDN of the current location.
 * @property {number} port The port number of the current location (e.g. 80, 443, 8080).
 * @property {string} path The path of the current location (e.g. /myapp/inbox).
 * @property {Object.<string|boolean>} search Map of query parameters (e.g. {user:"foo", page:23}).
 * @property {string} hash The fragment part of the URL of the current location (e.g. #foo).
 * @property {string} hashPath Similar to `path`, but located in the `hash` fragment
 *     (e.g. ../foo#/some/path  => /some/path).
 * @property {Object.<string|boolean>} hashSearch Similar to `search` but located in `hash`
 *     fragment (e.g. .../foo#/some/path?hashQuery=param  =>  {hashQuery: "param"}).
 *
 * @description
 * Parses the browser location url and makes it available to your application.
 * Any changes to the url are reflected into `$location` service and changes to
 * `$location` are reflected in the browser location url.
 *
 * Notice that using browser's forward/back buttons changes the $location.
 *
 * @example
   <doc:example>
     <doc:source>
       <div ng:init="$location = $service('$location')">
         <a id="ex-test" href="#myPath?name=misko">test hash</a>|
         <a id="ex-reset" href="#!/api/angular.service.$location">reset hash</a><br/>
         <input type='text' name="$location.hash" size="30">
         <pre>$location = {{$location}}</pre>
       </div>
     </doc:source>
     <doc:scenario>
       it('should initialize the input field', function() {
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('!/api/angular.service.$location');
       });


       it('should bind $location.hash to the input field', function() {
         using('.doc-example-live').input('$location.hash').enter('foo');
         expect(browser().location().hash()).toBe('foo');
       });


       it('should set the hash to a test string with test link is presed', function() {
         using('.doc-example-live').element('#ex-test').click();
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('myPath?name=misko');
       });

       it('should reset $location when reset link is pressed', function() {
         using('.doc-example-live').input('$location.hash').enter('foo');
         using('.doc-example-live').element('#ex-reset').click();
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('!/api/angular.service.$location');
       });

     </doc:scenario>
    </doc:example>
 */
angularServiceInject("$location", function($browser) {
  var scope = this,
      location = {update:update, updateHash: updateHash},
      lastLocation = {};

  $browser.onHashChange(function() { //register
    update($browser.getUrl());
    copy(location, lastLocation);
    scope.$eval();
  })(); //initialize

  this.$onEval(PRIORITY_FIRST, sync);
  this.$onEval(PRIORITY_LAST, updateBrowser);

  return location;

  // PUBLIC METHODS

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$location#update
   * @methodOf angular.service.$location
   *
   * @description
   * Updates the location object.
   *
   * Does not immediately update the browser. Instead the browser is updated at the end of $eval()
   * cycle.
   *
   * <pre>
       $location.update('http://www.angularjs.org/path#hash?search=x');
       $location.update({host: 'www.google.com', protocol: 'https'});
       $location.update({hashPath: '/path', hashSearch: {a: 'b', x: true}});
     </pre>
   *
   * @param {string|Object} href Full href as a string or object with properties
   */
  function update(href) {
    if (isString(href)) {
      extend(location, parseHref(href));
    } else {
      if (isDefined(href.hash)) {
        extend(href, isString(href.hash) ? parseHash(href.hash) : href.hash);
      }

      extend(location, href);

      if (isDefined(href.hashPath || href.hashSearch)) {
        location.hash = composeHash(location);
      }

      location.href = composeHref(location);
    }
  }

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$location#updateHash
   * @methodOf angular.service.$location
   *
   * @description
   * Updates the hash fragment part of the url.
   *
   * @see update()
   *
   * <pre>
       scope.$location.updateHash('/hp')
         ==> update({hashPath: '/hp'})
       scope.$location.updateHash({a: true, b: 'val'})
         ==> update({hashSearch: {a: true, b: 'val'}})
       scope.$location.updateHash('/hp', {a: true})
         ==> update({hashPath: '/hp', hashSearch: {a: true}})
     </pre>
   *
   * @param {string|Object} path A hashPath or hashSearch object
   * @param {Object=} search A hashSearch object
   */
  function updateHash(path, search) {
    var hash = {};

    if (isString(path)) {
      hash.hashPath = path;
      hash.hashSearch = search || {};
    } else
      hash.hashSearch = path;

    hash.hash = composeHash(hash);

    update({hash: hash});
  }


  // INNER METHODS

  /**
   * Synchronizes all location object properties.
   *
   * User is allowed to change properties, so after property change,
   * location object is not in consistent state.
   *
   * Properties are synced with the following precedence order:
   *
   * - `$location.href`
   * - `$location.hash`
   * - everything else
   *
   * Keep in mind that if the following code is executed:
   *
   * scope.$location.href = 'http://www.angularjs.org/path#a/b'
   *
   * immediately afterwards all other properties are still the old ones...
   *
   * This method checks the changes and update location to the consistent state
   */
  function sync() {
    if (!equals(location, lastLocation)) {
      if (location.href != lastLocation.href) {
        update(location.href);
        return;
      }
      if (location.hash != lastLocation.hash) {
        var hash = parseHash(location.hash);
        updateHash(hash.hashPath, hash.hashSearch);
      } else {
        location.hash = composeHash(location);
        location.href = composeHref(location);
      }
      update(location.href);
    }
  }


  /**
   * If location has changed, update the browser
   * This method is called at the end of $eval() phase
   */
  function updateBrowser() {
    sync();

    if ($browser.getUrl() != location.href) {
      $browser.setUrl(location.href);
      copy(location, lastLocation);
    }
  }

  /**
   * Compose href string from a location object
   *
   * @param {Object} loc The location object with all properties
   * @return {string} Composed href
   */
  function composeHref(loc) {
    var url = toKeyValue(loc.search);
    var port = (loc.port == DEFAULT_PORTS[loc.protocol] ? null : loc.port);

    return loc.protocol  + '://' + loc.host +
          (port ? ':' + port : '') + loc.path +
          (url ? '?' + url : '') + (loc.hash ? '#' + loc.hash : '');
  }

  /**
   * Compose hash string from location object
   *
   * @param {Object} loc Object with hashPath and hashSearch properties
   * @return {string} Hash string
   */
  function composeHash(loc) {
    var hashSearch = toKeyValue(loc.hashSearch);
    //TODO: temporary fix for issue #158
    return escape(loc.hashPath).replace(/%21/gi, '!').replace(/%3A/gi, ':').replace(/%24/gi, '$') +
          (hashSearch ? '?' + hashSearch : '');
  }

  /**
   * Parse href string into location object
   *
   * @param {string} href
   * @return {Object} The location object
   */
  function parseHref(href) {
    var loc = {};
    var match = URL_MATCH.exec(href);

    if (match) {
      loc.href = href.replace(/#$/, '');
      loc.protocol = match[1];
      loc.host = match[3] || '';
      loc.port = match[5] || DEFAULT_PORTS[loc.protocol] || null;
      loc.path = match[6] || '';
      loc.search = parseKeyValue(match[8]);
      loc.hash = match[10] || '';

      extend(loc, parseHash(loc.hash));
    }

    return loc;
  }

  /**
   * Parse hash string into object
   *
   * @param {string} hash
   */
  function parseHash(hash) {
    var h = {};
    var match = HASH_MATCH.exec(hash);

    if (match) {
      h.hash = hash;
      h.hashPath = unescape(match[1] || '');
      h.hashSearch = parseKeyValue(match[3]);
    }

    return h;
  }
}, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$log
 * @requires $window
 *
 * @description
 * Simple service for logging. Default implementation writes the message
 * into the browser's console (if present).
 *
 * The main purpose of this service is to simplify debugging and troubleshooting.
 *
 * @example
    <doc:example>
      <doc:source>
         <p>Reload this page with open console, enter text and hit the log button...</p>
         Message:
         <input type="text" name="message" value="Hello World!"/>
         <button ng:click="$log.log(message)">log</button>
         <button ng:click="$log.warn(message)">warn</button>
         <button ng:click="$log.info(message)">info</button>
         <button ng:click="$log.error(message)">error</button>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
var $logFactory; //reference to be used only in tests
angularServiceInject("$log", $logFactory = function($window){
  return {
    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#log
     * @methodOf angular.service.$log
     *
     * @description
     * Write a log message
     */
    log: consoleLog('log'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#warn
     * @methodOf angular.service.$log
     *
     * @description
     * Write a warning message
     */
    warn: consoleLog('warn'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#info
     * @methodOf angular.service.$log
     *
     * @description
     * Write an information message
     */
    info: consoleLog('info'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#error
     * @methodOf angular.service.$log
     *
     * @description
     * Write an error message
     */
    error: consoleLog('error')
  };

  function consoleLog(type) {
    var console = $window.console || {};
    var logFn = console[type] || console.log || noop;
    if (logFn.apply) {
      return function(){
        var args = [];
        forEach(arguments, function(arg){
          args.push(formatError(arg));
        });
        return logFn.apply(console, args);
      };
    } else {
      // we are IE, in which case there is nothing we can do
      return logFn;
    }
  }
}, ['$window']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$resource
 * @requires $xhr.cache
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link angular.service.$xhr $xhr} service or
 * raw XMLHttpRequest.
 *
 * @param {string} url A parameterized URL template with parameters prefixed by `:` as in
 *   `/user/:username`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods.
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend the
 *   default set of resource actions. The declaration should be created in the following format:
 *
 *       {action1: {method:?, params:?, isArray:?, verifyCache:?},
 *        action2: {method:?, params:?, isArray:?, verifyCache:?},
 *        ...}
 *
 *   Where:
 *
 *   - `action` – {string} – The name of action. This name becomes the name of the method on your
 *     resource object.
 *   - `method` – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`, `DELETE`,
 *     and `JSON` (also known as JSONP).
 *   - `params` – {object=} – Optional set of pre-bound parameters for this action.
 *   - isArray – {boolean=} – If true then the returned object for this action is an array, see
 *     `returns` section.
 *   - verifyCache – {boolean=} – If true then whenever cache hit occurs, the object is returned and
 *     an async request will be made to the server and the resources as well as the cache will be
 *     updated when the response is received.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *
 *       { 'get':    {method:'GET'},
 *         'save':   {method:'POST'},
 *         'query':  {method:'GET', isArray:true},
 *         'remove': {method:'DELETE'},
 *         'delete': {method:'DELETE'} };
 *
 *   Calling these methods invoke an {@link angular.service.$xhr} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class `save`, `remove` and `delete` actions are available on it as
 *   methods with the `$` prefix. This allows you to easily perform CRUD operations (create, read,
 *   update, delete) on server-side data like this:
 *   <pre>
        var User = $resource('/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function(){
          user.abc = true;
          user.$save();
        });
     </pre>
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most case one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action(postData, [parameters], [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *
 * @example
 *
 * # Credit card resource
 *
 * <pre>
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query();
     // GET: /user/123/card
     // server returns: [ {id:456, number:'1234', name:'Smith'} ];

     var card = cards[0];
     // each item is an instance of CreditCard
     expect(card instanceof CreditCard).toEqual(true);
     card.name = "J. Smith";
     // non GET methods are mapped onto the instances
     card.$save();
     // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
     // server returns: {id:456, number:'1234', name: 'J. Smith'};

     // our custom method is mapped as well.
     card.$charge({amount:9.99});
     // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     // server returns: {id:456, number:'1234', name: 'J. Smith'};

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'01234', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * </pre>
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$xhr` on the `url` template with the given `method` and `params`.
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     var user = User.get({userId:123}, function(){
       user.abc = true;
       user.$save();
     });
   </pre>
 *
 *     It's worth noting that the success callback for `get`, `query` and other method gets passed
 *     in the response that came from the server, so one could rewrite the above example as:
 *
   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, responseHeaders){
       u.abc = true;
       u.$save(function(u, responseHeaders) {
         // Get an Object containing all response headers
         var allHeaders = responseHeaders();

         // Get a specific response header
         u.newId = responseHeaders('Location');
       });
     });
   </pre>

 * # Buzz client

   Let's look at what a buzz client created with the `$resource` service looks like:
    <doc:example>
      <doc:source jsfiddle="false">
       <script>
         function BuzzController($resource) {
           this.Activity = $resource(
             'https://www.googleapis.com/buzz/v1/activities/:userId/:visibility/:activityId/:comments',
             {alt:'json', callback:'JSON_CALLBACK'},
             {get:{method:'JSON', params:{visibility:'@self'}}, replies: {method:'JSON', params:{visibility:'@self', comments:'@comments'}}}
           );
         }

         BuzzController.prototype = {
           fetch: function() {
             this.activities = this.Activity.get({userId:this.userId});
           },
           expandReplies: function(activity) {
             activity.replies = this.Activity.replies({userId:this.userId, activityId:activity.id});
           }
         };
         BuzzController.$inject = ['$resource'];
       </script>

       <div ng:controller="BuzzController">
         <input name="userId" value="googlebuzz"/>
         <button ng:click="fetch()">fetch</button>
         <hr/>
         <div ng:repeat="item in activities.data.items">
           <h1 style="font-size: 15px;">
             <img src="{{item.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{item.actor.profileUrl}}">{{item.actor.name}}</a>
             <a href ng:click="expandReplies(item)" style="float: right;">Expand replies: {{item.links.replies[0].count}}</a>
           </h1>
           {{item.object.content | html}}
           <div ng:repeat="reply in item.replies.data.items" style="margin-left: 20px;">
             <img src="{{reply.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{reply.actor.profileUrl}}">{{reply.actor.name}}</a>: {{reply.content | html}}
           </div>
         </div>
       </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
angularServiceInject('$resource', function($xhr){
  var resource = new ResourceFactory($xhr);
  return bind(resource, resource.route);
}, ['$xhr.cache']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$route
 * @requires $location
 *
 * @property {Object} current Reference to the current route definition.
 * @property {Array.<Object>} routes Array of all configured routes.
 *
 * @description
 * Watches `$location.hashPath` and tries to map the hash to an existing route
 * definition. It is used for deep-linking URLs to controllers and views (HTML partials).
 *
 * The `$route` service is typically used in conjunction with {@link angular.widget.ng:view ng:view}
 * widget.
 *
 * @example
   This example shows how changing the URL hash causes the <tt>$route</tt>
   to match a route against the URL, and the <tt>[[ng:include]]</tt> pulls in the partial.
   Try changing the URL in the input box to see changes.

    <doc:example>
      <doc:source jsfiddle="false">
        <script>
          function MainCntl($route, $location) {
            this.$route = $route;
            this.$location = $location;

            $route.when('/Book/:bookId', {template: 'examples/book.html', controller: BookCntl});
            $route.when('/Book/:bookId/ch/:chapterId', {template: 'examples/chapter.html', controller: ChapterCntl});
            $route.onChange(function() {
              $route.current.scope.params = $route.current.params;
            });
          }

          function BookCntl() {
            this.name = "BookCntl";
          }

          function ChapterCntl() {
            this.name = "ChapterCntl";
          }
        </script>

        <div ng:controller="MainCntl">
          Choose:
          <a href="#/Book/Moby">Moby</a> |
          <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="#/Book/Gatsby">Gatsby</a> |
          <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a><br/>
          $location.hashPath: <input type="text" name="$location.hashPath" size="80" />
          <pre>$route.current.template = {{$route.current.template}}</pre>
          <pre>$route.current.params = {{$route.current.params}}</pre>
          <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
          <hr />
          <ng:view></ng:view>
        </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
angularServiceInject('$route', function(location, $updateView) {
  var routes = {},
      onChange = [],
      matcher = switchRouteMatcher,
      parentScope = this,
      dirty = 0,
      lastHashPath,
      lastRouteParams,
      $route = {
        routes: routes,

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#onChange
         * @methodOf angular.service.$route
         *
         * @param {function()} fn Function that will be called when `$route.current` changes.
         * @returns {function()} The registered function.
         *
         * @description
         * Register a handler function that will be called when route changes
         */
        onChange: function(fn) {
          onChange.push(fn);
          return fn;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#parent
         * @methodOf angular.service.$route
         *
         * @param {Scope} [scope=rootScope] Scope to be used as parent for newly created
         *    `$route.current.scope` scopes.
         *
         * @description
         * Sets a scope to be used as the parent scope for scopes created on route change. If not
         * set, defaults to the root scope.
         */
        parent: function(scope) {
          if (scope) parentScope = scope;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#when
         * @methodOf angular.service.$route
         *
         * @param {string} path Route path (matched against `$location.hash`)
         * @param {Object} params Mapping information to be assigned to `$route.current` on route
         *    match.
         *
         *    Object properties:
         *
         *    - `controller` – `{function()=}` – Controller fn that should be associated with newly
         *      created scope.
         *    - `template` – `{string=}` – path to an html template that should be used by
         *      {@link angular.widget.ng:view ng:view} or
         *      {@link angular.widget.ng:include ng:include} widgets.
         *    - `redirectTo` – {(string|function())=} – value to update
         *      {@link angular.service.$location $location} hash with and trigger route redirection.
         *
         *      If `redirectTo` is a function, it will be called with the following parameters:
         *
         *      - `{Object.<string>}` - route parameters extracted from the current
         *        `$location.hashPath` by applying the current route template.
         *      - `{string}` - current `$location.hash`
         *      - `{string}` - current `$location.hashPath`
         *      - `{string}` - current `$location.hashSearch`
         *
         *      The custom `redirectTo` function is expected to return a string which will be used
         *      to update `$location.hash`.
         *
         *    - `[reloadOnSearch=true]` - {boolean=} - reload route when $location.hashSearch
         *      changes. If this option is disabled, you should set up a $watch to be notified of
         *      param (hashSearch) changes as follows:
         *
         *            function MyCtrl($route) {
         *              this.$watch(function() {
         *                return $route.current.params.myHashSearchParam;
         *              }, function(params) {
         *                //do stuff with params
         *              });
         *            }
         *
         * @returns {Object} route object
         *
         * @description
         * Adds a new route definition to the `$route` service.
         */
        when:function (path, params) {
          if (isUndefined(path)) return routes; //TODO(im): remove - not needed!
          var route = routes[path];
          if (!route) route = routes[path] = {reloadOnSearch: true};
          if (params) extend(route, params); //TODO(im): what the heck? merge two route definitions?
          dirty++;
          return route;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#otherwise
         * @methodOf angular.service.$route
         *
         * @description
         * Sets route definition that will be used on route change when no other route definition
         * is matched.
         *
         * @param {Object} params Mapping information to be assigned to `$route.current`.
         */
        otherwise: function(params) {
          $route.when(null, params);
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#reload
         * @methodOf angular.service.$route
         *
         * @description
         * Causes `$route` service to reload (and recreate the `$route.current` scope) upon the next
         * eval even if {@link angular.service.$location $location} hasn't changed.
         */
        reload: function() {
          dirty++;
        }
      };


  function switchRouteMatcher(on, when, dstName) {
    var regex = '^' + when.replace(/[\.\\\(\)\^\$]/g, "\$1") + '$',
        params = [],
        dst = {};
    forEach(when.split(/\W/), function(param){
      if (param) {
        var paramRegExp = new RegExp(":" + param + "([\\W])");
        if (regex.match(paramRegExp)) {
          regex = regex.replace(paramRegExp, "([^\/]*)$1");
          params.push(param);
        }
      }
    });
    var match = on.match(new RegExp(regex));
    if (match) {
      forEach(params, function(name, index){
        dst[name] = match[index + 1];
      });
      if (dstName) this.$set(dstName, dst);
    }
    return match ? dst : null;
  }


  function updateRoute(){
    var childScope, routeParams, pathParams, segmentMatch, key, redir;

    if ($route.current) {
      if (!$route.current.reloadOnSearch && (lastHashPath == location.hashPath)) {
        $route.current.params = extend({}, location.hashSearch, lastRouteParams);
        return;
      }
    }

    lastHashPath = location.hashPath;
    $route.current = null;
    forEach(routes, function(rParams, rPath) {
      if (!pathParams) {
        if (pathParams = matcher(location.hashPath, rPath)) {
          routeParams = rParams;
        }
      }
    });

    // "otherwise" fallback
    routeParams = routeParams || routes[null];

    if(routeParams) {
      if (routeParams.redirectTo) {
        if (isString(routeParams.redirectTo)) {
          // interpolate the redirectTo string
          redir = {hashPath: '',
                   hashSearch: extend({}, location.hashSearch, pathParams)};

          forEach(routeParams.redirectTo.split(':'), function(segment, i) {
            if (i==0) {
              redir.hashPath += segment;
            } else {
              segmentMatch = segment.match(/(\w+)(.*)/);
              key = segmentMatch[1];
              redir.hashPath += pathParams[key] || location.hashSearch[key];
              redir.hashPath += segmentMatch[2] || '';
              delete redir.hashSearch[key];
            }
          });
        } else {
          // call custom redirectTo function
          redir = {hash: routeParams.redirectTo(pathParams, location.hash, location.hashPath,
                                                location.hashSearch)};
        }

        location.update(redir);
        $updateView(); //TODO this is to work around the $location<=>$browser issues
        return;
      }

      childScope = createScope(parentScope);
      $route.current = extend({}, routeParams, {
        scope: childScope,
        params: extend({}, location.hashSearch, pathParams)
      });
      lastRouteParams = pathParams;
    }

    //fire onChange callbacks
    forEach(onChange, parentScope.$tryEval);

    if (childScope) {
      childScope.$become($route.current.controller);
    }
  }


  this.$watch(function(){ return dirty + location.hash; }, updateRoute);

  return $route;
}, ['$location', '$updateView']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$updateView
 * @requires $browser
 *
 * @description
 * Calling `$updateView` enqueues the eventual update of the view. (Update the DOM to reflect the
 * model). The update is eventual, since there are often multiple updates to the model which may
 * be deferred. The default update delayed is 25 ms. This means that the view lags the model by
 * that time. (25ms is small enough that it is perceived as instantaneous by the user). The delay
 * can be adjusted by setting the delay property of the service.
 *
 * <pre>angular.service('$updateView').delay = 10</pre>
 *
 * The delay is there so that multiple updates to the model which occur sufficiently close
 * together can be merged into a single update.
 *
 * You don't usually call '$updateView' directly since angular does it for you in most cases,
 * but there are some cases when you need to call it.
 *
 *  - `$updateView()` called automatically by angular:
 *    - Your Application Controllers: Your controller code is called by angular and hence
 *      angular is aware that you may have changed the model.
 *    - Your Services: Your service is usually called by your controller code, hence same rules
 *      apply.
 *  - May need to call `$updateView()` manually:
 *    - Widgets / Directives: If you listen to any DOM events or events on any third party
 *      libraries, then angular is not aware that you may have changed state state of the
 *      model, and hence you need to call '$updateView()' manually.
 *    - 'setTimeout'/'XHR':  If you call 'setTimeout' (instead of {@link angular.service.$defer})
 *      or 'XHR' (instead of {@link angular.service.$xhr}) then you may be changing the model
 *      without angular knowledge and you may need to call '$updateView()' directly.
 *
 * Note: if you wish to update the view immediately (without delay), you can do so by calling
 * {@link angular.scope.$eval} at any time from your code:
 * <pre>scope.$root.$eval()</pre>
 *
 * In unit-test mode the update is instantaneous and synchronous to simplify writing tests.
 *
 */

function serviceUpdateViewFactory($browser){
  var rootScope = this;
  var scheduled;
  function update(){
    scheduled = false;
    rootScope.$eval();
  }
  return $browser.isMock ? update : function(){
    if (!scheduled) {
      scheduled = true;
      $browser.defer(update, serviceUpdateViewFactory.delay);
    }
  };
}
serviceUpdateViewFactory.delay = 25;

angularServiceInject('$updateView', serviceUpdateViewFactory, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$window
 *
 * @description
 * A reference to the browser's `window` object. While `window`
 * is globally available in JavaScript, it causes testability problems, because
 * it is a global variable. In angular we always refer to it through the
 * `$window` service, so it may be overriden, removed or mocked for testing.
 *
 * All expressions are evaluated with respect to current scope so they don't
 * suffer from window globality.
 *
 * @example
   <doc:example>
     <doc:source>
       <input ng:init="$window = $service('$window'); greeting='Hello World!'" type="text" name="greeting" />
       <button ng:click="$window.alert(greeting)">ALERT</button>
     </doc:source>
     <doc:scenario>
     </doc:scenario>
   </doc:example>
 */
angularServiceInject("$window", bind(window, identity, window));

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.bulk
 * @requires $xhr
 * @requires $xhr.error
 * @requires $log
 *
 * @description
 *
 * @example
 */
angularServiceInject('$xhr.bulk', function($xhr, $error, $log){
  var requests = [],
      scope = this;
  function bulkXHR(method, url, post, success, error) {
    if (isFunction(post)) {
      error = success;
      success = post;
      post = null;
    }
    var currentQueue;
    forEach(bulkXHR.urls, function(queue){
      if (isFunction(queue.match) ? queue.match(url) : queue.match.exec(url)) {
        currentQueue = queue;
      }
    });
    if (currentQueue) {
      if (!currentQueue.requests) currentQueue.requests = [];
      var request = {
          method: method,
          url: url,
          data: post,
          success: success};
      if (error) request.error = error;
      currentQueue.requests.push(request);
    } else {
      $xhr(method, url, post, success, error);
    }
  }
  bulkXHR.urls = {};
  bulkXHR.flush = function(success, error) {
    forEach(bulkXHR.urls, function(queue, url) {
      var currentRequests = queue.requests;
      if (currentRequests && currentRequests.length) {
        queue.requests = [];
        queue.callbacks = [];
        $xhr('POST', url, {requests: currentRequests},
          function(code, response, responseHeaders) {
            forEach(response, function(response, i) {
              try {
                if (response.status == 200) {
                  (currentRequests[i].success || noop)
                      (response.status, response.response, responseHeaders);
                } else if (isFunction(currentRequests[i].error)) {
                    currentRequests[i].error(response.status, response.response, responseHeaders);
                } else {
                  $error(currentRequests[i], response);
                }
              } catch(e) {
                $log.error(e);
              }
            });
            (success || noop)();
          },
          function(code, response, responseHeaders) {
            forEach(currentRequests, function(request, i) {
              try {
                if (isFunction(request.error)) {
                  request.error(code, response, responseHeaders);
                } else {
                  $error(request, response);
                }
              } catch(e) {
                $log.error(e);
              }
            });
            (error || noop)();
          });
        scope.$eval();
      }
    });
  };
  this.$onEval(PRIORITY_LAST, bulkXHR.flush);
  return bulkXHR;
}, ['$xhr', '$xhr.error', '$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.cache
 * @function
 *
 * @requires $xhr.bulk
 * @requires $defer
 * @requires $xhr.error
 * @requires $log
 *
 * @description
 * Acts just like the {@link angular.service.$xhr $xhr} service but caches responses for `GET`
 * requests. All cache misses are delegated to the $xhr service.
 *
 * @property {function()} delegate Function to delegate all the cache misses to. Defaults to
 *   the {@link angular.service.$xhr $xhr} service.
 * @property {object} data The hashmap where all cached entries are stored.
 *
 * @param {string} method HTTP method.
 * @param {string} url Destination URL.
 * @param {(string|Object)=} post Request body.
 * @param {function(number, (string|Object), Function)} success Response success callback.
 * @param {function(number, (string|Object), Function)} error Response error callback.
 * @param {boolean=} [verifyCache=false] If `true` then a result is immediately returned from cache
 *   (if present) while a request is sent to the server for a fresh response that will update the
 *   cached entry. The `success` function will be called when the response is received.
 * @param {boolean=} [sync=false] in case of cache hit execute `success` synchronously.
 */
angularServiceInject('$xhr.cache', function($xhr, $defer, $error, $log) {
  var inflight = {}, self = this;
  function cache(method, url, post, success, error, verifyCache, sync) {
    if (isFunction(post)) {
      if (!isFunction(success)) {
        verifyCache = success;
        sync = error;
        error = null;
      } else {
        sync = verifyCache;
        verifyCache = error;
        error = success;
      }
      success = post;
      post = null;
    } else if (!isFunction(error)) {
      sync = verifyCache;
      verifyCache = error;
      error = null;
    }

    if (method == 'GET') {
      var data, dataCached;
      if (dataCached = cache.data[url]) {

        if (sync) {
          success(200, copy(dataCached.value), copy(dataCached.headers));
        } else {
          $defer(function() { success(200, copy(dataCached.value), copy(dataCached.headers)); });
        }

        if (!verifyCache)
          return;
      }

      if (data = inflight[url]) {
        data.successes.push(success);
        data.errors.push(error);
      } else {
        inflight[url] = {successes: [success], errors: [error]};
        cache.delegate(method, url, post,
          function(status, response, responseHeaders) {
            if (status == 200)
              cache.data[url] = {value: response, headers: responseHeaders};
            var successes = inflight[url].successes;
            delete inflight[url];
            forEach(successes, function(success) {
              try {
                (success||noop)(status, copy(response), responseHeaders);
              } catch(e) {
                $log.error(e);
              }
            });
          },
          function(status, response, responseHeaders) {
            var errors = inflight[url].errors,
                successes = inflight[url].successes;
            delete inflight[url];

            forEach(errors, function(error, i) {
              try {
                if (isFunction(error)) {
                  error(status, copy(response), copy(responseHeaders));
                } else {
                  $error(
                    {method: method, url: url, data: post, success: successes[i]},
                    {status: status, body: response});
                }
              } catch(e) {
                $log.error(e);
              }
            });
          });
      }

    } else {
      cache.data = {};
      cache.delegate(method, url, post, success, error);
    }
  }
  cache.data = {};
  cache.delegate = $xhr;
  return cache;
}, ['$xhr.bulk', '$defer', '$xhr.error', '$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.error
 * @function
 * @requires $log
 *
 * @description
 * Error handler for {@link angular.service.$xhr $xhr service}. An application can replaces this
 * service with one specific for the application. The default implementation logs the error to
 * {@link angular.service.$log $log.error}.
 *
 * @param {Object} request Request object.
 *
 *   The object has the following properties
 *
 *   - `method` – `{string}` – The http request method.
 *   - `url` – `{string}` – The request destination.
 *   - `data` – `{(string|Object)=} – An optional request body.
 *   - `success` – `{function()}` – The success callback function
 *
 * @param {Object} response Response object.
 *
 *   The response object has the following properties:
 *
 *   - status – {number} – Http status code.
 *   - body – {string|Object} – Body of the response.
 *
 * @example
    <doc:example>
      <doc:source>
        fetch a non-existent file and log an error in the console:
        <button ng:click="$service('$xhr')('GET', '/DOESNT_EXIST')">fetch</button>
      </doc:source>
    </doc:example>
 */
angularServiceInject('$xhr.error', function($log){
  return function(request, response){
    $log.error('ERROR: XHR: ' + request.url, request, response);
  };
}, ['$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr
 * @function
 * @requires $browser $xhr delegates all XHR requests to the `$browser.xhr()`. A mock version
 *                    of the $browser exists which allows setting expectations on XHR requests
 *                    in your tests
 * @requires $xhr.error $xhr delegates all non `2xx` response code to this service.
 * @requires $log $xhr delegates all exceptions to `$log.error()`.
 * @requires $updateView After a server response the view needs to be updated for data-binding to
 *           take effect.
 *
 * @description
 * Generates an XHR request. The $xhr service delegates all requests to
 * {@link angular.service.$browser $browser.xhr()} and adds error handling and security features.
 * While $xhr service provides nicer api than raw XmlHttpRequest, it is still considered a lower
 * level api in angular. For a higher level abstraction that utilizes `$xhr`, please check out the
 * {@link angular.service.$resource $resource} service.
 *
 * # Error handling
 * If no `error callback` is specified, XHR response with response code other then `2xx` will be
 * delegated to {@link angular.service.$xhr.error $xhr.error}. The `$xhr.error` can intercept the
 * request and process it in application specific way, or resume normal execution by calling the
 * request `success` method.
 *
 * # HTTP Headers
 * The $xhr service will automatically add certain http headers to all requests. These defaults can
 * be fully configured by accessing the `$xhr.defaults.headers` configuration object, which
 * currently contains this default configuration:
 *
 * - `$xhr.defaults.headers.common` (headers that are common for all requests):
 *   - `Accept: application/json, text/plain, *\/*`
 *   - `X-Requested-With: XMLHttpRequest`
 * - `$xhr.defaults.headers.post` (header defaults for HTTP POST requests):
 *   - `Content-Type: application/x-www-form-urlencoded`
 *
 * To add or overwrite these defaults, simple add or remove a property from this configuration
 * object. To add headers for an HTTP method other than POST, simple create a new object with name
 * equal to the lowercased http method name, e.g. `$xhr.defaults.headers.get['My-Header']='value'`.
 *
 *
 * # Security Considerations
 * When designing web applications your design needs to consider security threats from
 * {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
 * JSON Vulnerability} and {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF}.
 * Both server and the client must cooperate in order to eliminate these threats. Angular comes
 * pre-configured with strategies that address these issues, but for this to work backend server
 * cooperation is required.
 *
 * ## JSON Vulnerability Protection
 * A {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
 * JSON Vulnerability} allows third party web-site to turn your JSON resource URL into
 * {@link http://en.wikipedia.org/wiki/JSON#JSONP JSONP} request under some conditions. To
 * counter this your server can prefix all JSON requests with following string `")]}',\n"`.
 * Angular will automatically strip the prefix before processing it as JSON.
 *
 * For example if your server needs to return:
 * <pre>
 * ['one','two']
 * </pre>
 *
 * which is vulnerable to attack, your server can return:
 * <pre>
 * )]}',
 * ['one','two']
 * </pre>
 *
 * angular will strip the prefix, before processing the JSON.
 *
 *
 * ## Cross Site Request Forgery (XSRF) Protection
 * {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF} is a technique by which an
 * unauthorized site can gain your user's private data. Angular provides following mechanism to
 * counter XSRF. When performing XHR requests, the $xhr service reads a token from a cookie
 * called `XSRF-TOKEN` and sets it as the HTTP header `X-XSRF-TOKEN`. Since only JavaScript that
 * runs on your domain could read the cookie, your server can be assured that the XHR came from
 * JavaScript running on your domain.
 *
 * To take advantage of this, your server needs to set a token in a JavaScript readable session
 * cookie called `XSRF-TOKEN` on first HTTP GET request. On subsequent non-GET requests the server
 * can verify that the cookie matches `X-XSRF-TOKEN` HTTP header, and therefore be sure that only
 * JavaScript running on your domain could have read the token. The token must be unique for each
 * user and must be verifiable by the server (to prevent the JavaScript making up its own tokens).
 * We recommend that the token is a digest of your site's authentication cookie with
 * {@link http://en.wikipedia.org/wiki/Rainbow_table salt for added security}.
 *
 * @param {string} method HTTP method to use. Valid values are: `GET`, `POST`, `PUT`, `DELETE`, and
 *   `JSON`. `JSON` is a special case which causes a
 *   [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP) cross domain request using script tag
 *   insertion.
 * @param {string} url Relative or absolute URL specifying the destination of the request.  For
 *   `JSON` requests, `url` should include `JSON_CALLBACK` string to be replaced with a name of an
 *   angular generated callback function.
 * @param {(string|Object)=} post Request content as either a string or an object to be stringified
 *   as JSON before sent to the server.
 * @param {function(number, (string|Object), Function)} success A function to be called when the response is
 *   received. The success function will be called with:
 *
 *   - {number} code [HTTP status code](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) of
 *     the response. This will currently always be 200, since all non-200 responses are routed to
 *     {@link angular.service.$xhr.error} service (or custom error callback).
 *   - {string|Object} response Response object as string or an Object if the response was in JSON
 *     format.
 *   - {function(string=)} responseHeaders A function that when called with a {string} header name,
 *     returns the value of that header or null if it does not exist; when called without
 *     arguments, returns an object containing every response header
 * @param {function(number, (string|Object))} error A function to be called if the response code is
 *   not 2xx.. Accepts the same arguments as success, above.
 *
 * @example
   <doc:example>
     <doc:source jsfiddle="false">
       <script>
         function FetchCntl($xhr) {
           var self = this;

           this.fetch = function() {
             self.code = null;
             self.response = null;

             $xhr(self.method, self.url, function(code, response) {
               self.code = code;
               self.response = response;
             }, function(code, response) {
               self.code = code;
               self.response = response || "Request failed";
             });
           };

           this.updateModel = function(method, url) {
             self.method = method;
             self.url = url;
           };
         }
         FetchCntl.$inject = ['$xhr'];
       </script>
       <div ng:controller="FetchCntl">
         <select name="method">
           <option>GET</option>
           <option>JSON</option>
         </select>
         <input type="text" name="url" value="index.html" size="80"/>
         <button ng:click="fetch()">fetch</button><br>
         <button ng:click="updateModel('GET', 'index.html')">Sample GET</button>
         <button ng:click="updateModel('JSON', 'https://www.googleapis.com/buzz/v1/activities/googlebuzz/@self?alt=json&callback=JSON_CALLBACK')">Sample JSONP (Buzz API)</button>
         <button ng:click="updateModel('JSON', 'https://www.invalid_JSONP_request.com&callback=JSON_CALLBACK')">Invalid JSONP</button>
         <pre>code={{code}}</pre>
         <pre>response={{response}}</pre>
       </div>
     </doc:source>
     <doc:scenario>
       it('should make xhr GET request', function() {
         element(':button:contains("Sample GET")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=200');
         expect(binding('response')).toMatch(/angularjs.org/);
       });

       it('should make JSONP request to the Buzz API', function() {
         element(':button:contains("Buzz API")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=200');
         expect(binding('response')).toMatch(/buzz-feed/);
       });

       it('should make JSONP request to invalid URL and invoke the error handler',
           function() {
         element(':button:contains("Invalid JSONP")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=');
         expect(binding('response')).toBe('response=Request failed');
       });
     </doc:scenario>
   </doc:example>
 */
angularServiceInject('$xhr', function($browser, $error, $log, $updateView){

  var xhrHeaderDefaults = {
    common: {
      "Accept": "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest"
    },
    post: {'Content-Type': 'application/x-www-form-urlencoded'},
    get: {},      // all these empty properties are needed so that client apps can just do:
    head: {},     // $xhr.defaults.headers.head.foo="bar" without having to create head object
    put: {},      // it also means that if we add a header for these methods in the future, it
    'delete': {}, // won't be easily silently lost due to an object assignment.
    patch: {}
  };

  function xhr(method, url, post, success, error) {
    if (isFunction(post)) {
      error = success;
      success = post;
      post = null;
    }
    if (post && isObject(post)) {
      post = toJson(post);
    }

    $browser.xhr(method, url, post, function(code, response, responseHeaders){
      try {
        if (isString(response)) {
          if (response.match(/^\)\]\}',\n/)) response=response.substr(6);
          if (/^\s*[\[\{]/.exec(response) && /[\}\]]\s*$/.exec(response)) {
            response = fromJson(response, true);
          }
        }
        if (200 <= code && code < 300) {
          success(code, response, responseHeaders);
        } else if (isFunction(error)) {
          error(code, response, responseHeaders);
        } else {
          $error(
            {method: method, url: url, data: post, success: success},
            {status: code, body: response});
        }
      } catch (e) {
        $log.error(e);
      } finally {
        $updateView();
      }
    }, extend({'X-XSRF-TOKEN': $browser.cookies()['XSRF-TOKEN']},
              xhrHeaderDefaults.common,
              xhrHeaderDefaults[lowercase(method)]));
  };

  xhr.defaults = {headers: xhrHeaderDefaults};

  return xhr;
}, ['$browser', '$xhr.error', '$log', '$updateView']);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.directive
 * @description
 *
 * Custom attributes for DOM elements.  Directives modify the behavior of the element they are
 * specified in, but are not intended to add elements to the DOM as are
 * {@link angular.widget widgets}.
 *
 * Following is the list of built-in angular directives:
 *
 * * {@link angular.directive.ng:bind ng:bind} - Creates a data-binding between HTML text value and
 * data model.
 * * {@link angular.directive.ng:bind-attr ng:bind-attr} - Creates a data-binding as in `ng:bind`,
 * but uses JSON key / value pairs.
 * * {@link angular.directive.ng:bind-template ng:bind-template} - Replaces text value of an element
 * with a specified template.
 * * {@link angular.directive.ng:change ng:change} - Executes an expression when the value of an
 * input widget changes.
 * * {@link angular.directive.ng:class ng:class} - Conditionally set CSS class on an element.
 * * {@link angular.directive.ng:class-even ng:class-even} - Like `ng:class`, but works in
 * conjunction with {@link angular.widget.@ng:repeat} to affect even rows in a collection.
 * * {@link angular.directive.ng:class-odd ng:class-odd} - Like `ng:class`, but works with {@link
 * angular.widget.@ng:repeat}  to affect odd rows.
 * * {@link angular.directive.ng:click ng:click} - Executes custom behavior when element is clicked.
 * * {@link angular.directive.ng:controller ng:controller} - Creates a scope object linked to the
 * DOM element and assigns behavior to the scope.
 * * {@link angular.directive.ng:eval ng:eval} - Executes a binding but blocks output.
 * * {@link angular.directive.ng:eval-order ng:eval-order} - Change evaluation order when updating
 * the view.
 * * {@link angular.directive.ng:hide ng:hide} - Conditionally hides a portion of HTML.
 * * {@link angular.directive.ng:href ng:href} - Places an href in the angular namespace.
 * * {@link angular.directive.ng:init} - Initialization tasks run before a template is executed.
 * * {@link angular.directive.ng:show ng:show} - Conditionally displays a portion of HTML.
 * * {@link angular.directive.ng:src ng:src} - Places a `src` attribute into the angular namespace.
 * * {@link angular.directive.ng:style ng:style} - Conditionally set CSS styles on an element.
 * * {@link angular.directive.ng:submit} - Binds angular expressions to `onSubmit` events.
 *
 * For more information about how angular directives work, and how to create your own directives,
 * see {@link guide/dev_guide.compiler.directives Understanding Angular Directives} in the angular
 * Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:init
 *
 * @description
 * The `ng:init` attribute specifies initialization tasks to be executed
 *  before the template enters execution mode during bootstrap.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
    <div ng:init="greeting='Hello'; person='World'">
      {{greeting}} {{person}}!
    </div>
     </doc:source>
     <doc:scenario>
       it('should check greeting', function(){
         expect(binding('greeting')).toBe('Hello');
         expect(binding('person')).toBe('World');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:init", function(expression){
  return function(element){
    this.$tryEval(expression, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:controller
 *
 * @description
 * The `ng:controller` directive assigns behavior to a scope. This is a key aspect of how angular
 * supports the principles behind the Model-View-Controller design pattern.
 *
 * MVC components in angular:
 *
 * * Model — The Model is data in scope properties; scopes are attached to the DOM.
 * * View — The template (HTML with data bindings) is rendered into the View.
 * * Controller — The `ng:controller` directive specifies a Controller class; the class has
 *   methods that typically express the business logic behind the application.
 *
 * Note that an alternative way to define controllers is via the `{@link angular.service.$route}`
 * service.
 *
 * @element ANY
 * @param {expression} expression Name of a globally accessible constructor function or an
 *     {@link guide/dev_guide.expressions expression} that on the current scope evaluates to a
 *     constructor function.
 *
 * @example
 * Here is a simple form for editing user contact information. Adding, removing, clearing, and
 * greeting are methods declared on the controller (see source tab). These methods can
 * easily be called from the angular markup. Notice that the scope becomes the `this` for the
 * controller's instance. This allows for easy access to the view data from the controller. Also
 * notice that any changes to the data are automatically reflected in the View without the need
 * for a manual update.
   <doc:example>
     <doc:source>
      <script type="text/javascript">
        function SettingsController() {
          this.name = "John Smith";
          this.contacts = [
            {type:'phone', value:'408 555 1212'},
            {type:'email', value:'john.smith@example.org'} ];
        }
        SettingsController.prototype = {
         greet: function(){
           alert(this.name);
         },
         addContact: function(){
           this.contacts.push({type:'email', value:'yourname@example.org'});
         },
         removeContact: function(contactToRemove) {
           angular.Array.remove(this.contacts, contactToRemove);
         },
         clearContact: function(contact) {
           contact.type = 'phone';
           contact.value = '';
         }
        };
      </script>
      <div ng:controller="SettingsController">
        Name: <input type="text" name="name"/>
        [ <a href="" ng:click="greet()">greet</a> ]<br/>
        Contact:
        <ul>
          <li ng:repeat="contact in contacts">
            <select name="contact.type">
               <option>phone</option>
               <option>email</option>
            </select>
            <input type="text" name="contact.value"/>
            [ <a href="" ng:click="clearContact(contact)">clear</a>
            | <a href="" ng:click="removeContact(contact)">X</a> ]
          </li>
          <li>[ <a href="" ng:click="addContact()">add</a> ]</li>
       </ul>
      </div>
     </doc:source>
     <doc:scenario>
       it('should check controller', function(){
         expect(element('.doc-example-live div>:input').val()).toBe('John Smith');
         expect(element('.doc-example-live li[ng\\:repeat-index="0"] input').val()).toBe('408 555 1212');
         expect(element('.doc-example-live li[ng\\:repeat-index="1"] input').val()).toBe('john.smith@example.org');
         element('.doc-example-live li:first a:contains("clear")').click();
         expect(element('.doc-example-live li:first input').val()).toBe('');
         element('.doc-example-live li:last a:contains("add")').click();
         expect(element('.doc-example-live li[ng\\:repeat-index="2"] input').val()).toBe('yourname@example.org');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:controller", function(expression){
  this.scope(true);
  return function(element){
    var controller = getter(window, expression, true) || getter(this, expression, true);
    if (!controller)
      throw "Can not find '"+expression+"' controller.";
    if (!isFunction(controller))
      throw "Reference '"+expression+"' is not a class.";
    this.$become(controller);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:eval
 *
 * @description
 * The `ng:eval` allows you to execute a binding which has side effects
 * without displaying the result to the user.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
 * Notice that `{{` `obj.multiplied = obj.a * obj.b` `}}` has a side effect of assigning
 * a value to `obj.multiplied` and displaying the result to the user. Sometimes,
 * however, it is desirable to execute a side effect without showing the value to
 * the user. In such a case `ng:eval` allows you to execute code without updating
 * the display.
   <doc:example>
     <doc:source>
       <input name="obj.a" value="6" >
         * <input name="obj.b" value="2">
         = {{obj.multiplied = obj.a * obj.b}} <br>
       <span ng:eval="obj.divide = obj.a / obj.b"></span>
       <span ng:eval="obj.updateCount = 1 + (obj.updateCount||0)">
       </span>
       <tt>obj.divide = {{obj.divide}}</tt><br>
       <tt>obj.updateCount = {{obj.updateCount}}</tt>
     </doc:source>
     <doc:scenario>
       it('should check eval', function(){
         expect(binding('obj.divide')).toBe('3');
         expect(binding('obj.updateCount')).toBe('2');
         input('obj.a').enter('12');
         expect(binding('obj.divide')).toBe('6');
         expect(binding('obj.updateCount')).toBe('3');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:eval", function(expression){
  return function(element){
    this.$onEval(expression, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind
 *
 * @description
 * The `ng:bind` attribute asks angular to replace the text content of this
 * HTML element with the value of the given expression, and to keep the text
 * content up to date when the expression's value changes. Usually you would
 * just write `{{ expression }}` and let angular compile it into
 * `<span ng:bind="expression"></span>` at bootstrap time.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
 * You can try it right here: enter text in the text box and watch the greeting change.
   <doc:example>
     <doc:source>
       Enter name: <input type="text" name="name" value="Whirled"> <br>
       Hello <span ng:bind="name" />!
     </doc:source>
     <doc:scenario>
       it('should check ng:bind', function(){
         expect(using('.doc-example-live').binding('name')).toBe('Whirled');
         using('.doc-example-live').input('name').enter('world');
         expect(using('.doc-example-live').binding('name')).toBe('world');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind", function(expression, element){
  element.addClass('ng-binding');
  return function(element) {
    var lastValue = noop, lastError = noop;
    this.$onEval(function() {
      var error, value, html, isHtml, isDomElement,
          oldElement = this.hasOwnProperty($$element) ? this.$element : undefined;
      this.$element = element;
      value = this.$tryEval(expression, function(e){
        error = formatError(e);
      });
      this.$element = oldElement;
      // If we are HTML then save the raw HTML data so that we don't
      // recompute sanitization since it is expensive.
      // TODO: turn this into a more generic way to compute this
      if (isHtml = (value instanceof HTML))
        value = (html = value).html;
      if (lastValue === value && lastError == error) return;
      isDomElement = isElement(value);
      if (!isHtml && !isDomElement && isObject(value)) {
        value = toJson(value, true);
      }
      if (value != lastValue || error != lastError) {
        lastValue = value;
        lastError = error;
        elementError(element, NG_EXCEPTION, error);
        if (error) value = error;
        if (isHtml) {
          element.html(html.get());
        } else if (isDomElement) {
          element.html('');
          element.append(value);
        } else {
          element.text(value == undefined ? '' : value);
        }
      }
    }, element);
  };
});

var bindTemplateCache = {};
function compileBindTemplate(template){
  var fn = bindTemplateCache[template];
  if (!fn) {
    var bindings = [];
    forEach(parseBindings(template), function(text){
      var exp = binding(text);
      bindings.push(exp
        ? function(element){
            var error, value = this.$tryEval(exp, function(e){
              error = toJson(e);
            });
            elementError(element, NG_EXCEPTION, error);
            return error ? error : value;
          }
        : function() {
            return text;
          });
    });
    bindTemplateCache[template] = fn = function(element, prettyPrintJson){
      var parts = [], self = this,
         oldElement = this.hasOwnProperty($$element) ? self.$element : undefined;
      self.$element = element;
      for ( var i = 0; i < bindings.length; i++) {
        var value = bindings[i].call(self, element);
        if (isElement(value))
          value = '';
        else if (isObject(value))
          value = toJson(value, prettyPrintJson);
        parts.push(value);
      }
      self.$element = oldElement;
      return parts.join('');
    };
  }
  return fn;
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind-template
 *
 * @description
 * The `ng:bind-template` attribute specifies that the element
 * text should be replaced with the template in ng:bind-template.
 * Unlike ng:bind the ng:bind-template can contain multiple `{{` `}}`
 * expressions. (This is required since some HTML elements
 * can not have SPAN elements such as TITLE, or OPTION to name a few.)
 *
 * @element ANY
 * @param {string} template of form
 *   <tt>{{</tt> <tt>expression</tt> <tt>}}</tt> to eval.
 *
 * @example
 * Try it here: enter text in text box and watch the greeting change.
   <doc:example>
     <doc:source>
      Salutation: <input type="text" name="salutation" value="Hello"><br/>
      Name: <input type="text" name="name" value="World"><br/>
      <pre ng:bind-template="{{salutation}} {{name}}!"></pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:bind', function(){
         expect(using('.doc-example-live').binding('{{salutation}} {{name}}')).
           toBe('Hello World!');
         using('.doc-example-live').input('salutation').enter('Greetings');
         using('.doc-example-live').input('name').enter('user');
         expect(using('.doc-example-live').binding('{{salutation}} {{name}}')).
           toBe('Greetings user!');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind-template", function(expression, element){
  element.addClass('ng-binding');
  var templateFn = compileBindTemplate(expression);
  return function(element) {
    var lastValue;
    this.$onEval(function() {
      var value = templateFn.call(this, element, true);
      if (value != lastValue) {
        element.text(value);
        lastValue = value;
      }
    }, element);
  };
});

var REMOVE_ATTRIBUTES = {
  'disabled':'disabled',
  'readonly':'readOnly',
  'checked':'checked',
  'selected':'selected',
  'multiple':'multiple'
};
/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind-attr
 *
 * @description
 * The `ng:bind-attr` attribute specifies that
 * {@link guide/dev_guide.templates.databinding databindings}  should be created between element
 * attributes and given expressions. Unlike `ng:bind` the `ng:bind-attr` contains a JSON key value
 * pairs representing which attributes need to be mapped to which
 * {@link guide/dev_guide.expressions expressions}.
 *
 * You don't usually write the `ng:bind-attr` in the HTML since embedding
 * <tt ng:non-bindable>{{expression}}</tt> into the attribute directly as the attribute value is
 * preferred. The attributes get translated into `<span ng:bind-attr="{attr:expression}"/>` at
 * compile time.
 *
 * This HTML snippet is preferred way of working with `ng:bind-attr`
 * <pre>
 *   <a href="http://www.google.com/search?q={{query}}">Google</a>
 * </pre>
 *
 * The above gets translated to bellow during bootstrap time.
 * <pre>
 *   <a ng:bind-attr='{"href":"http://www.google.com/search?q={{query}}"}'>Google</a>
 * </pre>
 *
 * @element ANY
 * @param {string} attribute_json a JSON key-value pairs representing
 *    the attributes to replace. Each key matches the attribute
 *    which needs to be replaced. Each value is a text template of
 *    the attribute with embedded
 *    <tt ng:non-bindable>{{expression}}</tt>s. Any number of
 *    key-value pairs can be specified.
 *
 * @example
 * Try it here: enter text in text box and click Google.
   <doc:example>
     <doc:source>
      Google for:
      <input type="text" name="query" value="AngularJS"/>
      <a href="http://www.google.com/search?q={{query}}">Google</a>
     </doc:source>
     <doc:scenario>
       it('should check ng:bind-attr', function(){
         expect(using('.doc-example-live').element('a').attr('href')).
           toBe('http://www.google.com/search?q=AngularJS');
         using('.doc-example-live').input('query').enter('google');
         expect(using('.doc-example-live').element('a').attr('href')).
           toBe('http://www.google.com/search?q=google');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind-attr", function(expression){
  return function(element){
    var lastValue = {};
    this.$onEval(function(){
      var values = this.$eval(expression);
      for(var key in values) {
        var value = compileBindTemplate(values[key]).call(this, element),
            specialName = REMOVE_ATTRIBUTES[lowercase(key)];
        if (lastValue[key] !== value) {
          lastValue[key] = value;
          if (specialName) {
            if (toBoolean(value)) {
              element.attr(specialName, specialName);
              element.attr('ng-' + specialName, value);
            } else {
              element.removeAttr(specialName);
              element.removeAttr('ng-' + specialName);
            }
            (element.data($$validate)||noop)();
          } else {
            element.attr(key, value);
          }
        }
      }
    }, element);
  };
});


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:click
 *
 * @description
 * The ng:click allows you to specify custom behavior when
 * element is clicked.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval upon click.
 *
 * @example
   <doc:example>
     <doc:source>
      <button ng:click="count = count + 1" ng:init="count=0">
        Increment
      </button>
      count: {{count}}
     </doc:source>
     <doc:scenario>
       it('should check ng:click', function(){
         expect(binding('count')).toBe('0');
         element('.doc-example-live :button').click();
         expect(binding('count')).toBe('1');
       });
     </doc:scenario>
   </doc:example>
 */
/*
 * A directive that allows creation of custom onclick handlers that are defined as angular
 * expressions and are compiled and executed within the current scope.
 *
 * Events that are handled via these handler are always configured not to propagate further.
 *
 * TODO: maybe we should consider allowing users to control event propagation in the future.
 */
angularDirective("ng:click", function(expression, element){
  return annotate('$updateView', function($updateView, element){
    var self = this;
    element.bind('click', function(event){
      self.$tryEval(expression, element);
      $updateView();
      event.stopPropagation();
    });
  });
});


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:submit
 *
 * @description
 * Enables binding angular expressions to onsubmit events.
 *
 * Additionally it prevents the default action (which for form means sending the request to the
 * server and reloading the current page).
 *
 * @element form
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
      <form ng:submit="list.push(text);text='';" ng:init="list=[]">
        Enter text and hit enter:
        <input type="text" name="text" value="hello"/>
        <input type="submit" id="submit" value="Submit" />
      </form>
      <pre>list={{list}}</pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:submit', function(){
         expect(binding('list')).toBe('list=[]');
         element('.doc-example-live #submit').click();
         expect(binding('list')).toBe('list=["hello"]');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:submit", function(expression, element) {
  return annotate('$updateView', function($updateView, element) {
    var self = this;
    element.bind('submit', function(event) {
      self.$tryEval(expression, element);
      $updateView();
      event.preventDefault();
    });
  });
});


function ngClass(selector) {
  return function(expression, element){
    var existing = element[0].className + ' ';
    return function(element){
      this.$onEval(function(){
        var scope = this;

        if (selector(scope.$index)) {
          var ngClassVal = scope.$eval(element.attr('ng:class') || '');
          if (isArray(ngClassVal)) ngClassVal = ngClassVal.join(' ');
          var value = scope.$eval(expression);
          if (isArray(value)) value = value.join(' ');
          if (ngClassVal && ngClassVal !== value) value = value + ' ' + ngClassVal;
          element[0].className = trim(existing + value);
        }
      }, element);
    };
  };
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class
 *
 * @description
 * The `ng:class` allows you to set CSS class on HTML element
 * conditionally.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
      <input type="button" value="set" ng:click="myVar='ng-input-indicator-wait'">
      <input type="button" value="clear" ng:click="myVar=''">
      <br>
      <span ng:class="myVar">Sample Text &nbsp;&nbsp;&nbsp;&nbsp;</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:class', function(){
         expect(element('.doc-example-live span').attr('className')).not().
           toMatch(/ng-input-indicator-wait/);

         using('.doc-example-live').element(':button:first').click();

         expect(element('.doc-example-live span').attr('className')).
           toMatch(/ng-input-indicator-wait/);

         using('.doc-example-live').element(':button:last').click();

         expect(element('.doc-example-live span').attr('className')).not().
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class", ngClass(function(){return true;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class-odd
 *
 * @description
 * The `ng:class-odd` and `ng:class-even` works exactly as
 * `ng:class`, except it works in conjunction with `ng:repeat`
 * and takes affect only on odd (even) rows.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval. Must be
 *  inside `ng:repeat`.
 *
 * @example
   <doc:example>
     <doc:source>
        <ol ng:init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng:repeat="name in names">
           <span ng:class-odd="'ng-format-negative'"
                 ng:class-even="'ng-input-indicator-wait'">
             {{name}} &nbsp; &nbsp; &nbsp;
           </span>
          </li>
        </ol>
     </doc:source>
     <doc:scenario>
       it('should check ng:class-odd and ng:class-even', function(){
         expect(element('.doc-example-live li:first span').attr('className')).
           toMatch(/ng-format-negative/);
         expect(element('.doc-example-live li:last span').attr('className')).
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class-odd", ngClass(function(i){return i % 2 === 0;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class-even
 *
 * @description
 * The `ng:class-odd` and `ng:class-even` works exactly as
 * `ng:class`, except it works in conjunction with `ng:repeat`
 * and takes affect only on odd (even) rows.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval. Must be
 *  inside `ng:repeat`.
 *
 * @example
   <doc:example>
     <doc:source>
        <ol ng:init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng:repeat="name in names">
           <span ng:class-odd="'ng-format-negative'"
                 ng:class-even="'ng-input-indicator-wait'">
             {{name}} &nbsp; &nbsp; &nbsp;
           </span>
          </li>
        </ol>
     </doc:source>
     <doc:scenario>
       it('should check ng:class-odd and ng:class-even', function(){
         expect(element('.doc-example-live li:first span').attr('className')).
           toMatch(/ng-format-negative/);
         expect(element('.doc-example-live li:last span').attr('className')).
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class-even", ngClass(function(i){return i % 2 === 1;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:show
 *
 * @description
 * The `ng:show` and `ng:hide` directives show or hide a portion of the DOM tree (HTML)
 * conditionally.
 *
 * @element ANY
 * @param {expression} expression If the {@link guide/dev_guide.expressions expression} is truthy
 *     then the element is shown or hidden respectively.
 *
 * @example
   <doc:example>
     <doc:source>
        Click me: <input type="checkbox" name="checked"><br/>
        Show: <span ng:show="checked">I show up when your checkbox is checked.</span> <br/>
        Hide: <span ng:hide="checked">I hide when your checkbox is checked.</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:show / ng:hide', function(){
         expect(element('.doc-example-live span:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live span:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live span:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live span:last:hidden').count()).toEqual(1);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:show", function(expression, element){
  return function(element){
    this.$onEval(function(){
      element.css('display', toBoolean(this.$eval(expression)) ? '' : 'none');
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:hide
 *
 * @description
 * The `ng:hide` and `ng:show` directives hide or show a portion
 * of the HTML conditionally.
 *
 * @element ANY
 * @param {expression} expression If the {@link guide/dev_guide.expressions expression} truthy then
 *     the element is shown or hidden respectively.
 *
 * @example
   <doc:example>
     <doc:source>
        Click me: <input type="checkbox" name="checked"><br/>
        Show: <span ng:show="checked">I show up when you checkbox is checked?</span> <br/>
        Hide: <span ng:hide="checked">I hide when you checkbox is checked?</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:show / ng:hide', function(){
         expect(element('.doc-example-live span:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live span:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live span:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live span:last:hidden').count()).toEqual(1);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:hide", function(expression, element){
  return function(element){
    this.$onEval(function(){
      element.css('display', toBoolean(this.$eval(expression)) ? 'none' : '');
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:style
 *
 * @description
 * The ng:style allows you to set CSS style on an HTML element conditionally.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} which evals to an
 *      object whose keys are CSS style names and values are corresponding values for those CSS
 *      keys.
 *
 * @example
   <doc:example>
     <doc:source>
        <input type="button" value="set" ng:click="myStyle={color:'red'}">
        <input type="button" value="clear" ng:click="myStyle={}">
        <br/>
        <span ng:style="myStyle">Sample Text</span>
        <pre>myStyle={{myStyle}}</pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:style', function(){
         expect(element('.doc-example-live span').css('color')).toBe('rgb(0, 0, 0)');
         element('.doc-example-live :button[value=set]').click();
         expect(element('.doc-example-live span').css('color')).toBe('red');
         element('.doc-example-live :button[value=clear]').click();
         expect(element('.doc-example-live span').css('color')).toBe('rgb(0, 0, 0)');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:style", function(expression, element){
  return function(element){
    var resetStyle = getStyle(element);
    this.$onEval(function(){
      var style = this.$eval(expression) || {}, key, mergedStyle = {};
      for(key in style) {
        if (resetStyle[key] === undefined) resetStyle[key] = '';
        mergedStyle[key] = style[key];
      }
      for(key in resetStyle) {
        mergedStyle[key] = mergedStyle[key] || resetStyle[key];
      }
      element.css(mergedStyle);
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.markup
 * @description
 *
 * Angular markup transforms content of DOM elements or portions of this content into other text or
 * DOM elements for further compilation.
 *
 * Markup extensions do not themselves produce linking functions. Think of markup as a way to
 * produce shorthand for a {@link angular.widget widget} or a {@link angular.directive directive}.
 *
 * The most prominent example of a markup in angular is the built-in double curly markup
 * `{{expression}}`, which is shorthand for `<span ng:bind="expression"></span>`.
 *
 * Create custom markup like this:
 *
 * <pre>
 *   angular.markup('newMarkup', function(text, textNode, parentElement){
 *     //tranformation code
 *   });
 * </pre>
 *
 * For more information about angular markup, see {@link guide/dev_guide.compiler.markup
 * Understanding Angular Markup} in the angular Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.attrMarkup
 * @description
 *
 * Attribute markup extends the angular compiler in a very similar way as {@link angular.markup}
 * except that it allows you to modify the state of the attribute text rather than the content of a
 * node.
 *
 * Create custom attribute markup like this:
 *
 * <pre>
 *   angular.attrMarkup('newAttrMarkup', function(attrValue, attrName, element){
 *     //tranformation code
 *   });
 * </pre>
 *
 * For more information about angular attribute markup, see {@link guide/dev_guide.compiler.markup
 * Understanding Angular Markup} in the angular Developer Guide.
 */

function parseBindings(string) {
  var results = [];
  var lastIndex = 0;
  var index;
  while((index = string.indexOf('{{', lastIndex)) > -1) {
    if (lastIndex < index)
      results.push(string.substr(lastIndex, index - lastIndex));
    lastIndex = index;

    index = string.indexOf('}}', index);
    index = index < 0 ? string.length : index + 2;

    results.push(string.substr(lastIndex, index - lastIndex));
    lastIndex = index;
  }
  if (lastIndex != string.length)
    results.push(string.substr(lastIndex, string.length - lastIndex));
  return results.length === 0 ? [ string ] : results;
}

function binding(string) {
  var binding = string.replace(/\n/gm, ' ').match(/^\{\{(.*)\}\}$/);
  return binding ? binding[1] : null;
}

function hasBindings(bindings) {
  return bindings.length > 1 || binding(bindings[0]) !== null;
}

angularTextMarkup('{{}}', function(text, textNode, parentElement) {
  var bindings = parseBindings(text),
      self = this;
  if (hasBindings(bindings)) {
    if (isLeafNode(parentElement[0])) {
      parentElement.attr('ng:bind-template', text);
    } else {
      var cursor = textNode, newElement;
      forEach(parseBindings(text), function(text){
        var exp = binding(text);
        if (exp) {
          newElement = jqLite('<span>');
          newElement.attr('ng:bind', exp);
        } else {
          newElement = jqLite(document.createTextNode(text));
        }
        if (msie && text.charAt(0) == ' ') {
          newElement = jqLite('<span>&nbsp;</span>');
          var nbsp = newElement.html();
          newElement.text(text.substr(1));
          newElement.html(nbsp + newElement.html());
        }
        cursor.after(newElement);
        cursor = newElement;
      });
      textNode.remove();
    }
  }
});

/**
 * This tries to normalize the behavior of value attribute across browsers. If value attribute is
 * not specified, then specify it to be that of the text.
 */
angularTextMarkup('option', function(text, textNode, parentElement){
  if (lowercase(nodeName_(parentElement)) == 'option') {
    if (msie <= 7) {
      // In IE7 The issue is that there is no way to see if the value was specified hence
      // we have to resort to parsing HTML;
      htmlParser(parentElement[0].outerHTML, {
        start: function(tag, attrs) {
          if (isUndefined(attrs.value)) {
            parentElement.attr('value', text);
          }
        }
      });
    } else if (parentElement[0].getAttribute('value') == null) {
      // jQuery does normalization on 'value' so we have to bypass it.
      parentElement.attr('value', text);
    }
  }
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:href
 *
 * @description
 * Using <angular/> markup like {{hash}} in an href attribute makes
 * the page open to a wrong URL, if the user clicks that link before
 * angular has a chance to replace the {{hash}} with actual URL, the
 * link will be broken and will most likely return a 404 error.
 * The `ng:href` solves this problem by placing the `href` in the
 * `ng:` namespace.
 *
 * The buggy way to write it:
 * <pre>
 * <a href="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * The correct way to write it:
 * <pre>
 * <a ng:href="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * @element ANY
 * @param {template} template any string which can contain `{{}}` markup.
 *
 * @example
 * This example uses `link` variable inside `href` attribute:
    <doc:example>
      <doc:source>
        <input name="value" /><br />
        <a id="link-1" href ng:click="value = 1">link 1</a> (link, don't reload)<br />
        <a id="link-2" href="" ng:click="value = 2">link 2</a> (link, don't reload)<br />
        <a id="link-3" ng:href="#{{'123'}}" ng:click="value = 3">link 3</a> (link, reload!)<br />
        <a id="link-4" href="" name="xx" ng:click="value = 4">anchor</a> (link, don't reload)<br />
        <a id="link-5" name="xxx" ng:click="value = 5">anchor</a> (no link)<br />
        <a id="link-6" ng:href="#/{{value}}">link</a> (link, change hash)
      </doc:source>
      <doc:scenario>
        it('should execute ng:click but not reload when href without value', function() {
          element('#link-1').click();
          expect(input('value').val()).toEqual('1');
          expect(element('#link-1').attr('href')).toBe("");
        });

        it('should execute ng:click but not reload when href empty string', function() {
          element('#link-2').click();
          expect(input('value').val()).toEqual('2');
          expect(element('#link-2').attr('href')).toBe("");
        });

        it('should execute ng:click and change url when ng:href specified', function() {
          element('#link-3').click();
          expect(input('value').val()).toEqual('3');
          expect(element('#link-3').attr('href')).toBe("#123");
          expect(browser().location().hash()).toEqual('123');
        });

        it('should execute ng:click but not reload when href empty string and name specified', function() {
          element('#link-4').click();
          expect(input('value').val()).toEqual('4');
          expect(element('#link-4').attr('href')).toBe("");
        });

        it('should execute ng:click but not reload when no href but name specified', function() {
          element('#link-5').click();
          expect(input('value').val()).toEqual('5');
          expect(element('#link-5').attr('href')).toBe(undefined);
        });

        it('should only change url when only ng:href', function() {
          input('value').enter('6');
          element('#link-6').click();
          expect(browser().location().hash()).toEqual('/6');
          expect(element('#link-6').attr('href')).toBe("#/6");
        });
      </doc:scenario>
    </doc:example>
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:src
 *
 * @description
 * Using <angular/> markup like `{{hash}}` in a `src` attribute doesn't
 * work right: The browser will fetch from the URL with the literal
 * text `{{hash}}` until <angular/> replaces the expression inside
 * `{{hash}}`. The `ng:src` attribute solves this problem by placing
 *  the `src` attribute in the `ng:` namespace.
 *
 * The buggy way to write it:
 * <pre>
 * <img src="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * The correct way to write it:
 * <pre>
 * <img ng:src="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * @element ANY
 * @param {template} template any string which can contain `{{}}` markup.
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:disabled
 *
 * @description
 *
 * The following markup will make the button enabled on Chrome/Firefox but not on IE8 and older IEs:
 * <pre>
 * <div ng:init="scope = { isDisabled: false }">
 *  <button disabled="{{scope.isDisabled}}">Disabled</button>
 * </div>
 * </pre>
 *
 * The HTML specs do not require browsers to preserve the special attributes such as disabled.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:disabled.
 *
 * @example
    <doc:example>
      <doc:source>
        Click me to toggle: <input type="checkbox" name="checked"><br/>
        <button name="button" ng:disabled="{{checked}}">Button</button>
      </doc:source>
      <doc:scenario>
        it('should toggle button', function() {
          expect(element('.doc-example-live :button').attr('disabled')).toBeFalsy();
          input('checked').check();
          expect(element('.doc-example-live :button').attr('disabled')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:checked
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as checked.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:checked.
 * @example
    <doc:example>
      <doc:source>
        Check me to check both: <input type="checkbox" name="master"><br/>
        <input id="checkSlave" type="checkbox" ng:checked="{{master}}">
      </doc:source>
      <doc:scenario>
        it('should check both checkBoxes', function() {
          expect(element('.doc-example-live #checkSlave').attr('checked')).toBeFalsy();
          input('master').check();
          expect(element('.doc-example-live #checkSlave').attr('checked')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:multiple
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as multiple.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:multiple.
 *
 * @example
     <doc:example>
       <doc:source>
         Check me check multiple: <input type="checkbox" name="checked"><br/>
         <select id="select" ng:multiple="{{checked}}">
           <option>Misko</option>
           <option>Igor</option>
           <option>Vojta</option>
           <option>Di</option>
         </select>
       </doc:source>
       <doc:scenario>
         it('should toggle multiple', function() {
           expect(element('.doc-example-live #select').attr('multiple')).toBeFalsy();
           input('checked').check();
           expect(element('.doc-example-live #select').attr('multiple')).toBeTruthy();
         });
       </doc:scenario>
     </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:readonly
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as readonly.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:readonly.
 * @example
    <doc:example>
      <doc:source>
        Check me to make text readonly: <input type="checkbox" name="checked"><br/>
        <input type="text" ng:readonly="{{checked}}" value="I'm Angular"/>
      </doc:source>
      <doc:scenario>
        it('should toggle readonly attr', function() {
          expect(element('.doc-example-live :text').attr('readonly')).toBeFalsy();
          input('checked').check();
          expect(element('.doc-example-live :text').attr('readonly')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
* @workInProgress
* @ngdoc directive
* @name angular.directive.ng:selected
*
* @description
* The HTML specs do not require browsers to preserve the special attributes such as selected.
* (The presence of them means true and absence means false)
* This prevents the angular compiler from correctly retrieving the binding expression.
* To solve this problem, we introduce ng:selected.
* @example
   <doc:example>
     <doc:source>
       Check me to select: <input type="checkbox" name="checked"><br/>
       <select>
         <option>Hello!</option>
         <option id="greet" ng:selected="{{checked}}">Greetings!</option>
       </select>
     </doc:source>
     <doc:scenario>
       it('should select Greetings!', function() {
         expect(element('.doc-example-live #greet').attr('selected')).toBeFalsy();
         input('checked').check();
         expect(element('.doc-example-live #greet').attr('selected')).toBeTruthy();
       });
     </doc:scenario>
   </doc:example>
* @element ANY
* @param {template} template any string which can contain '{{}}' markup.
*/


var NG_BIND_ATTR = 'ng:bind-attr';
var SPECIAL_ATTRS = {};

forEach('src,href,checked,disabled,multiple,readonly,selected'.split(','), function(name) {
  SPECIAL_ATTRS['ng:' + name] = name;
});

angularAttrMarkup('{{}}', function(value, name, element){
  // don't process existing attribute markup
  if (angularDirective(name) || angularDirective("@" + name)) return;
  if (msie && name == 'src')
    value = decodeURI(value);
  var bindings = parseBindings(value),
      bindAttr;
  if (hasBindings(bindings)) {
    element.removeAttr(name);
    bindAttr = fromJson(element.attr(NG_BIND_ATTR) || "{}");
    bindAttr[SPECIAL_ATTRS[name] || name] = value;
    element.attr(NG_BIND_ATTR, toJson(bindAttr));
  }
});

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.widget
 * @description
 *
 * An angular widget can be either a custom attribute that modifies an existing DOM element or an
 * entirely new DOM element.
 *
 * During html compilation, widgets are processed after {@link angular.markup markup}, but before
 * {@link angular.directive directives}.
 *
 * Following is the list of built-in angular widgets:
 *
 * * {@link angular.widget.@ng:format ng:format} - Formats data for display to user and for storage.
 * * {@link angular.widget.@ng:non-bindable ng:non-bindable} - Blocks angular from processing an
 *   HTML element.
 * * {@link angular.widget.@ng:repeat ng:repeat} - Creates and manages a collection of cloned HTML
 *   elements.
 * * {@link angular.widget.@ng:required ng:required} - Verifies presence of user input.
 * * {@link angular.widget.@ng:validate ng:validate} - Validates content of user input.
 * * {@link angular.widget.HTML HTML input elements} - Standard HTML input elements data-bound by
 *   angular.
 * * {@link angular.widget.ng:view ng:view} - Works with $route to "include" partial templates
 * * {@link angular.widget.ng:switch ng:switch} - Conditionally changes DOM structure
 * * {@link angular.widget.ng:include ng:include} - Includes an external HTML fragment
 *
 * For more information about angular widgets, see {@link guide/dev_guide.compiler.widgets
 * Understanding Angular Widgets} in the angular Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.HTML
 *
 * @description
 * The most common widgets you will use will be in the form of the
 * standard HTML set. These widgets are bound using the `name` attribute
 * to an expression. In addition, they can have `ng:validate`, `ng:required`,
 * `ng:format`, `ng:change` attribute to further control their behavior.
 *
 * @usageContent
 *   see example below for usage
 *
 *   <input type="text|checkbox|..." ... />
 *   <textarea ... />
 *   <select ...>
 *     <option>...</option>
 *   </select>
 *
 * @example
    <doc:example>
      <doc:source>
        <table style="font-size:.9em;">
          <tr>
            <th>Name</th>
            <th>Format</th>
            <th>HTML</th>
            <th>UI</th>
            <th ng:non-bindable>{{input#}}</th>
          </tr>
          <tr>
            <th>text</th>
            <td>String</td>
            <td><tt>&lt;input type="text" name="input1"&gt;</tt></td>
            <td><input type="text" name="input1" size="4"></td>
            <td><tt>{{input1|json}}</tt></td>
          </tr>
          <tr>
            <th>textarea</th>
            <td>String</td>
            <td><tt>&lt;textarea name="input2"&gt;&lt;/textarea&gt;</tt></td>
            <td><textarea name="input2" cols='6'></textarea></td>
            <td><tt>{{input2|json}}</tt></td>
          </tr>
          <tr>
            <th>radio</th>
            <td>String</td>
            <td><tt>
              &lt;input type="radio" name="input3" value="A"&gt;<br>
              &lt;input type="radio" name="input3" value="B"&gt;
            </tt></td>
            <td>
              <input type="radio" name="input3" value="A">
              <input type="radio" name="input3" value="B">
            </td>
            <td><tt>{{input3|json}}</tt></td>
          </tr>
          <tr>
            <th>checkbox</th>
            <td>Boolean</td>
            <td><tt>&lt;input type="checkbox" name="input4" value="checked"&gt;</tt></td>
            <td><input type="checkbox" name="input4" value="checked"></td>
            <td><tt>{{input4|json}}</tt></td>
          </tr>
          <tr>
            <th>pulldown</th>
            <td>String</td>
            <td><tt>
              &lt;select name="input5"&gt;<br>
              &nbsp;&nbsp;&lt;option value="c"&gt;C&lt;/option&gt;<br>
              &nbsp;&nbsp;&lt;option value="d"&gt;D&lt;/option&gt;<br>
              &lt;/select&gt;<br>
            </tt></td>
            <td>
              <select name="input5">
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </td>
            <td><tt>{{input5|json}}</tt></td>
          </tr>
          <tr>
            <th>multiselect</th>
            <td>Array</td>
            <td><tt>
              &lt;select name="input6" multiple size="4"&gt;<br>
              &nbsp;&nbsp;&lt;option value="e"&gt;E&lt;/option&gt;<br>
              &nbsp;&nbsp;&lt;option value="f"&gt;F&lt;/option&gt;<br>
              &lt;/select&gt;<br>
            </tt></td>
            <td>
              <select name="input6" multiple size="4">
                <option value="e">E</option>
                <option value="f">F</option>
              </select>
            </td>
            <td><tt>{{input6|json}}</tt></td>
          </tr>
        </table>
      </doc:source>
      <doc:scenario>

        it('should exercise text', function(){
         input('input1').enter('Carlos');
         expect(binding('input1')).toEqual('"Carlos"');
        });
        it('should exercise textarea', function(){
         input('input2').enter('Carlos');
         expect(binding('input2')).toEqual('"Carlos"');
        });
        it('should exercise radio', function(){
         expect(binding('input3')).toEqual('null');
         input('input3').select('A');
         expect(binding('input3')).toEqual('"A"');
         input('input3').select('B');
         expect(binding('input3')).toEqual('"B"');
        });
        it('should exercise checkbox', function(){
         expect(binding('input4')).toEqual('false');
         input('input4').check();
         expect(binding('input4')).toEqual('true');
        });
        it('should exercise pulldown', function(){
         expect(binding('input5')).toEqual('"c"');
         select('input5').option('d');
         expect(binding('input5')).toEqual('"d"');
        });
        it('should exercise multiselect', function(){
         expect(binding('input6')).toEqual('[]');
         select('input6').options('e');
         expect(binding('input6')).toEqual('["e"]');
         select('input6').options('e', 'f');
         expect(binding('input6')).toEqual('["e","f"]');
        });
      </doc:scenario>
    </doc:example>
 */

function modelAccessor(scope, element) {
  var expr = element.attr('name');
  var exprFn, assignFn;
  if (expr) {
    exprFn = parser(expr).assignable();
    assignFn = exprFn.assign;
    if (!assignFn) throw new Error("Expression '" + expr + "' is not assignable.");
    return {
      get: function() {
        return exprFn(scope);
      },
      set: function(value) {
        if (value !== undefined) {
          return scope.$tryEval(function(){
            assignFn(scope, value);
          }, element);
        }
      }
    };
  }
}

function modelFormattedAccessor(scope, element) {
  var accessor = modelAccessor(scope, element),
      formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName);
  if (accessor) {
    return {
      get: function() {
        return formatter.format(scope, accessor.get());
      },
      set: function(value) {
        return accessor.set(formatter.parse(scope, value));
      }
    };
  }
}

function compileValidator(expr) {
  return parser(expr).validator()();
}

function compileFormatter(expr) {
  return parser(expr).formatter()();
}

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:validate
 *
 * @description
 * The `ng:validate` attribute widget validates the user input. If the input does not pass
 * validation, the `ng-validation-error` CSS class and the `ng:error` attribute are set on the input
 * element. Check out {@link angular.validator validators} to find out more.
 *
 * @param {string} validator The name of a built-in or custom {@link angular.validator validator} to
 *     to be used.
 *
 * @element INPUT
 * @css ng-validation-error
 *
 * @example
 * This example shows how the input element becomes red when it contains invalid input. Correct
 * the input to make the error disappear.
 *
    <doc:example>
      <doc:source>
        I don't validate:
        <input type="text" name="value" value="NotANumber"><br/>

        I need an integer or nothing:
        <input type="text" name="value" ng:validate="integer"><br/>
      </doc:source>
      <doc:scenario>
         it('should check ng:validate', function(){
           expect(element('.doc-example-live :input:last').attr('className')).
             toMatch(/ng-validation-error/);

           input('value').enter('123');
           expect(element('.doc-example-live :input:last').attr('className')).
             not().toMatch(/ng-validation-error/);
         });
      </doc:scenario>
    </doc:example>
 */
/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:required
 *
 * @description
 * The `ng:required` attribute widget validates that the user input is present. It is a special case
 * of the {@link angular.widget.@ng:validate ng:validate} attribute widget.
 *
 * @element INPUT
 * @css ng-validation-error
 *
 * @example
 * This example shows how the input element becomes red when it contains invalid input. Correct
 * the input to make the error disappear.
 *
    <doc:example>
      <doc:source>
        I cannot be blank: <input type="text" name="value" ng:required><br/>
      </doc:source>
      <doc:scenario>
       it('should check ng:required', function(){
         expect(element('.doc-example-live :input').attr('className')).toMatch(/ng-validation-error/);
         input('value').enter('123');
         expect(element('.doc-example-live :input').attr('className')).not().toMatch(/ng-validation-error/);
       });
      </doc:scenario>
    </doc:example>
 */
/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:format
 *
 * @description
 * The `ng:format` attribute widget formats stored data to user-readable text and parses the text
 * back to the stored form. You might find this useful, for example, if you collect user input in a
 * text field but need to store the data in the model as a list. Check out
 * {@link angular.formatter formatters} to learn more.
 *
 * @param {string} formatter The name of the built-in or custom {@link angular.formatter formatter}
 *     to be used.
 *
 * @element INPUT
 *
 * @example
 * This example shows how the user input is converted from a string and internally represented as an
 * array.
 *
    <doc:example>
      <doc:source>
        Enter a comma separated list of items:
        <input type="text" name="list" ng:format="list" value="table, chairs, plate">
        <pre>list={{list}}</pre>
      </doc:source>
      <doc:scenario>
       it('should check ng:format', function(){
         expect(binding('list')).toBe('list=["table","chairs","plate"]');
         input('list').enter(',,, a ,,,');
         expect(binding('list')).toBe('list=["a"]');
       });
      </doc:scenario>
    </doc:example>
 */
function valueAccessor(scope, element) {
  var validatorName = element.attr('ng:validate') || NOOP,
      validator = compileValidator(validatorName),
      requiredExpr = element.attr('ng:required'),
      formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName),
      format, parse, lastError, required,
      invalidWidgets = scope.$service('$invalidWidgets') || {markValid:noop, markInvalid:noop};
  if (!validator) throw "Validator named '" + validatorName + "' not found.";
  format = formatter.format;
  parse = formatter.parse;
  if (requiredExpr) {
    scope.$watch(requiredExpr, function(newValue) {
      required = newValue;
      validate();
    });
  } else {
    required = requiredExpr === '';
  }

  element.data($$validate, validate);
  return {
    get: function(){
      if (lastError)
        elementError(element, NG_VALIDATION_ERROR, null);
      try {
        var value = parse(scope, element.val());
        validate();
        return value;
      } catch (e) {
        lastError = e;
        elementError(element, NG_VALIDATION_ERROR, e);
      }
    },
    set: function(value) {
      var oldValue = element.val(),
          newValue = format(scope, value);
      if (oldValue != newValue) {
        element.val(newValue || ''); // needed for ie
      }
      validate();
    }
  };

  function validate() {
    var value = trim(element.val());
    if (element[0].disabled || element[0].readOnly) {
      elementError(element, NG_VALIDATION_ERROR, null);
      invalidWidgets.markValid(element);
    } else {
      var error, validateScope = inherit(scope, {$element:element});
      error = required && !value
              ? 'Required'
              : (value ? validator(validateScope, value) : null);
      elementError(element, NG_VALIDATION_ERROR, error);
      lastError = error;
      if (error) {
        invalidWidgets.markInvalid(element);
      } else {
        invalidWidgets.markValid(element);
      }
    }
  }
}

function checkedAccessor(scope, element) {
  var domElement = element[0], elementValue = domElement.value;
  return {
    get: function(){
      return !!domElement.checked;
    },
    set: function(value){
      domElement.checked = toBoolean(value);
    }
  };
}

function radioAccessor(scope, element) {
  var domElement = element[0];
  return {
    get: function(){
      return domElement.checked ? domElement.value : null;
    },
    set: function(value){
      domElement.checked = value == domElement.value;
    }
  };
}

function optionsAccessor(scope, element) {
  var formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName);
  return {
    get: function(){
      var values = [];
      forEach(element[0].options, function(option){
        if (option.selected) values.push(formatter.parse(scope, option.value));
      });
      return values;
    },
    set: function(values){
      var keys = {};
      forEach(values, function(value){
        keys[formatter.format(scope, value)] = true;
      });
      forEach(element[0].options, function(option){
        option.selected = keys[option.value];
      });
    }
  };
}

function noopAccessor() { return { get: noop, set: noop }; }

/*
 * TODO: refactor
 *
 * The table below is not quite right. In some cases the formatter is on the model side
 * and in some cases it is on the view side. This is a historical artifact
 *
 * The concept of model/view accessor is useful for anyone who is trying to develop UI, and
 * so it should be exposed to others. There should be a form object which keeps track of the
 * accessors and also acts as their factory. It should expose it as an object and allow
 * the validator to publish errors to it, so that the the error messages can be bound to it.
 *
 */
var textWidget = inputWidget('keydown change', modelAccessor, valueAccessor, initWidgetValue(), true),
    INPUT_TYPE = {
      'text':            textWidget,
      'textarea':        textWidget,
      'hidden':          textWidget,
      'password':        textWidget,
      'checkbox':        inputWidget('click', modelFormattedAccessor, checkedAccessor, initWidgetValue(false)),
      'radio':           inputWidget('click', modelFormattedAccessor, radioAccessor, radioInit),
      'select-one':      inputWidget('change', modelAccessor, valueAccessor, initWidgetValue(null)),
      'select-multiple': inputWidget('change', modelAccessor, optionsAccessor, initWidgetValue([]))
//      'file':            fileWidget???
    };


function initWidgetValue(initValue) {
  return function (model, view) {
    var value = view.get();
    if (!value && isDefined(initValue)) {
      value = copy(initValue);
    }
    if (isUndefined(model.get()) && isDefined(value)) {
      model.set(value);
    }
  };
}

function radioInit(model, view, element) {
 var modelValue = model.get(), viewValue = view.get(), input = element[0];
 input.checked = false;
 input.name = this.$id + '@' + input.name;
 if (isUndefined(modelValue)) {
   model.set(modelValue = null);
 }
 if (modelValue == null && viewValue !== null) {
   model.set(viewValue);
 }
 view.set(modelValue);
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:change
 *
 * @description
 * The directive executes an expression whenever the input widget changes.
 *
 * @element INPUT
 * @param {expression} expression to execute.
 *
 * @example
 * @example
    <doc:example>
      <doc:source>
        <div ng:init="checkboxCount=0; textCount=0"></div>
        <input type="text" name="text" ng:change="textCount = 1 + textCount">
           changeCount {{textCount}}<br/>
        <input type="checkbox" name="checkbox" ng:change="checkboxCount = 1 + checkboxCount">
           changeCount {{checkboxCount}}<br/>
      </doc:source>
      <doc:scenario>
         it('should check ng:change', function(){
           expect(binding('textCount')).toBe('0');
           expect(binding('checkboxCount')).toBe('0');

           using('.doc-example-live').input('text').enter('abc');
           expect(binding('textCount')).toBe('1');
           expect(binding('checkboxCount')).toBe('0');


           using('.doc-example-live').input('checkbox').check();
           expect(binding('textCount')).toBe('1');
           expect(binding('checkboxCount')).toBe('1');
         });
      </doc:scenario>
    </doc:example>
 */
function inputWidget(events, modelAccessor, viewAccessor, initFn, textBox) {
  return annotate('$updateView', '$defer', function($updateView, $defer, element) {
    var scope = this,
        model = modelAccessor(scope, element),
        view = viewAccessor(scope, element),
        action = element.attr('ng:change') || '',
        lastValue;
    if (model) {
      initFn.call(scope, model, view, element);
      this.$eval(element.attr('ng:init')||'');
      element.bind(events, function(event){
        function handler(){
          var value = view.get();
          if (!textBox || value != lastValue) {
            model.set(value);
            lastValue = model.get();
            scope.$tryEval(action, element);
            $updateView();
          }
        }
        event.type == 'keydown' ? $defer(handler) : handler();
      });
      scope.$watch(model.get, function(value){
        if (lastValue !== value) {
          view.set(lastValue = value);
        }
      });
    }
  });
}

function inputWidgetSelector(element){
  this.directives(true);
  this.descend(true);
  return INPUT_TYPE[lowercase(element[0].type)] || noop;
}

angularWidget('input', inputWidgetSelector);
angularWidget('textarea', inputWidgetSelector);


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:options
 *
 * @description
 * Dynamically generate a list of `<option>` elements for a `<select>` element using an array or
 * an object obtained by evaluating the `ng:options` expression.
 *
 * When an item in the select menu is select, the value of array element or object property
 * represented by the selected option will be bound to the model identified by the `name` attribute
 * of the parent select element.
 *
 * Optionally, a single hard-coded `<option>` element, with the value set to an empty string, can
 * be nested into the `<select>` element. This element will then represent `null` or "not selected"
 * option. See example below for demonstration.
 *
 * Note: `ng:options` provides iterator facility for `<option>` element which must be used instead
 * of {@link angular.widget.@ng:repeat ng:repeat}. `ng:repeat` is not suitable for use with
 * `<option>` element because of the following reasons:
 *
 *   * value attribute of the option element that we need to bind to requires a string, but the
 *     source of data for the iteration might be in a form of array containing objects instead of
 *     strings
 *   * {@link angular.widget.@ng:repeat ng:repeat} unrolls after the select binds causing
 *     incorect rendering on most browsers.
 *   * binding to a value not in list confuses most browsers.
 *
 * @element select
 * @param {comprehension_expression} comprehension in one of the following forms:
 *
 *   * for array data sources:
 *     * `label` **`for`** `value` **`in`** `array`
 *     * `select` **`as`** `label` **`for`** `value` **`in`** `array`
 *     * `label`  **`group by`** `group` **`for`** `value` **`in`** `array`
 *     * `select` **`as`** `label` **`group by`** `group` **`for`** `value` **`in`** `array`
 *   * for object data sources:
 *     * `label` **`for (`**`key` **`,`** `value`**`) in`** `object`
 *     * `select` **`as`** `label` **`for (`**`key` **`,`** `value`**`) in`** `object`
 *     * `label` **`group by`** `group` **`for (`**`key`**`,`** `value`**`) in`** `object`
 *     * `select` **`as`** `label` **`group by`** `group`
 *         **`for` `(`**`key`**`,`** `value`**`) in`** `object`
 *
 * Where:
 *
 *   * `array` / `object`: an expression which evaluates to an array / object to iterate over.
 *   * `value`: local variable which will refer to each item in the `array` or each property value
 *      of `object` during iteration.
 *   * `key`: local variable which will refer to a property name in `object` during iteration.
 *   * `label`: The result of this expression will be the label for `<option>` element. The
 *     `expression` will most likely refer to the `value` variable (e.g. `value.propertyName`).
 *   * `select`: The result of this expression will be bound to the model of the parent `<select>`
 *      element. If not specified, `select` expression will default to `value`.
 *   * `group`: The result of this expression will be used to group options using the `<optgroup>`
 *      DOM element.
 *
 * @example
    <doc:example>
      <doc:source>
        <script>
        function MyCntrl(){
          this.colors = [
            {name:'black', shade:'dark'},
            {name:'white', shade:'light'},
            {name:'red', shade:'dark'},
            {name:'blue', shade:'dark'},
            {name:'yellow', shade:'light'}
          ];
          this.color = this.colors[2]; // red
        }
        </script>
        <div ng:controller="MyCntrl">
          <ul>
            <li ng:repeat="color in colors">
              Name: <input name="color.name">
              [<a href ng:click="colors.$remove(color)">X</a>]
            </li>
            <li>
              [<a href ng:click="colors.push({})">add</a>]
            </li>
          </ul>
          <hr/>
          Color (null not allowed):
          <select name="color" ng:options="c.name for c in colors"></select><br>

          Color (null allowed):
          <div  class="nullable">
            <select name="color" ng:options="c.name for c in colors">
              <option value="">-- chose color --</option>
            </select>
          </div><br/>

          Color grouped by shade:
          <select name="color" ng:options="c.name group by c.shade for c in colors">
          </select><br/>


          Select <a href ng:click="color={name:'not in list'}">bogus</a>.<br>
          <hr/>
          Currently selected: {{ {selected_color:color}  }}
          <div style="border:solid 1px black; height:20px"
               ng:style="{'background-color':color.name}">
          </div>
        </div>
      </doc:source>
      <doc:scenario>
         it('should check ng:options', function(){
           expect(binding('color')).toMatch('red');
           select('color').option('0');
           expect(binding('color')).toMatch('black');
           using('.nullable').select('color').option('');
           expect(binding('color')).toMatch('null');
         });
      </doc:scenario>
    </doc:example>
 */
//                       00001111100000000000222200000000000000000000003333000000000000044444444444444444000000000555555555555555550000000666666666666666660000000000000007777
var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
angularWidget('select', function(element){
  this.descend(true);
  this.directives(true);

  var isMultiselect = element.attr('multiple'),
      expression = element.attr('ng:options'),
      onChange = expressionCompile(element.attr('ng:change') || "").fnSelf,
      match;

  if (!expression) {
    return inputWidgetSelector.call(this, element);
  }
  if (! (match = expression.match(NG_OPTIONS_REGEXP))) {
    throw Error(
      "Expected ng:options in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
      " but got '" + expression + "'.");
  }

  var displayFn = expressionCompile(match[2] || match[1]).fnSelf,
      valueName = match[4] || match[6],
      keyName = match[5],
      groupByFn = expressionCompile(match[3] || '').fnSelf,
      valueFn = expressionCompile(match[2] ? match[1] : valueName).fnSelf,
      valuesFn = expressionCompile(match[7]).fnSelf,
      // we can't just jqLite('<option>') since jqLite is not smart enough
      // to create it in <select> and IE barfs otherwise.
      optionTemplate = jqLite(document.createElement('option')),
      optGroupTemplate = jqLite(document.createElement('optgroup')),
      nullOption = false; // if false then user will not be able to select it

  return function(selectElement){

    // This is an array of array of existing option groups in DOM. We try to reuse these if possible
    // optionGroupsCache[0] is the options with no option group
    // optionGroupsCache[?][0] is the parent: either the SELECT or OPTGROUP element
    var optionGroupsCache = [[{element: selectElement, label:''}]],
        scope = this,
        model = modelAccessor(scope, element);

    // find existing special options
    forEach(selectElement.children(), function(option){
      if (option.value == '')
        // User is allowed to select the null.
        nullOption = {label:jqLite(option).text(), id:''};
    });
    selectElement.html(''); // clear contents

    selectElement.bind('change', function(){
      var optionGroup,
          collection = valuesFn(scope) || [],
          key = selectElement.val(),
          tempScope = inherit(scope),
          value, optionElement, index, groupIndex, length, groupLength;

      try {
        if (isMultiselect) {
          value = [];
          for (groupIndex = 0, groupLength = optionGroupsCache.length;
               groupIndex < groupLength;
               groupIndex++) {
            // list of options for that group. (first item has the parent)
            optionGroup = optionGroupsCache[groupIndex];

            for(index = 1, length = optionGroup.length; index < length; index++) {
              if ((optionElement = optionGroup[index].element)[0].selected) {
                if (keyName) tempScope[keyName] = key;
                tempScope[valueName] = collection[optionElement.val()];
                value.push(valueFn(tempScope));
              }
            }
          }
        } else {
          if (key == '?') {
            value = undefined;
          } else if (key == ''){
            value = null;
          } else {
            tempScope[valueName] = collection[key];
            if (keyName) tempScope[keyName] = key;
            value = valueFn(tempScope);
          }
        }
        if (isDefined(value) && model.get() !== value) {
          onChange(scope);
          model.set(value);
        }
        scope.$tryEval(function(){
          scope.$root.$eval();
        });
      } finally {
        tempScope = null; // TODO(misko): needs to be $destroy
      }
    });

    scope.$onEval(function(){
      var scope = this,
          optionGroups = {'':[]}, // Temporary location for the option groups before we render them
          optionGroupNames = [''],
          optionGroupName,
          optionGroup,
          option,
          existingParent, existingOptions, existingOption,
          values = valuesFn(scope) || [],
          keys = values,
          key,
          groupLength, length,
          fragment,
          groupIndex, index,
          optionElement,
          optionScope = inherit(scope),
          modelValue = model.get(),
          selected,
          selectedSet = false, // nothing is selected yet
          isMulti = isMultiselect,
          lastElement,
          element;

      try {
        if (isMulti) {
          selectedSet = new HashMap();
          if (modelValue && isNumber(length = modelValue.length)) {
            for (index = 0; index < length; index++) {
              selectedSet.put(modelValue[index], true);
            }
          }
        } else if (modelValue === null || nullOption) {
          // if we are not multiselect, and we are null then we have to add the nullOption
          optionGroups[''].push(extend({selected:modelValue === null, id:'', label:''}, nullOption));
          selectedSet = true;
        }

        // If we have a keyName then we are iterating over on object. Grab the keys and sort them.
        if(keyName) {
          keys = [];
          for (key in values) {
            if (values.hasOwnProperty(key))
              keys.push(key);
          }
          keys.sort();
        }

        // We now build up the list of options we need (we merge later)
        for (index = 0; length = keys.length, index < length; index++) {
          optionScope[valueName] = values[keyName ? optionScope[keyName]=keys[index]:index];
          optionGroupName = groupByFn(optionScope) || '';
          if (!(optionGroup = optionGroups[optionGroupName])) {
            optionGroup = optionGroups[optionGroupName] = [];
            optionGroupNames.push(optionGroupName);
          }
          if (isMulti) {
            selected = !!selectedSet.remove(valueFn(optionScope));
          } else {
            selected = modelValue === valueFn(optionScope);
            selectedSet = selectedSet || selected; // see if at least one item is selected
          }
          optionGroup.push({
              id: keyName ? keys[index] : index,   // either the index into array or key from object
              label: displayFn(optionScope) || '', // what will be seen by the user
              selected: selected                   // determine if we should be selected
            });
        }
        optionGroupNames.sort();
        if (!isMulti && !selectedSet) {
          // nothing was selected, we have to insert the undefined item
          optionGroups[''].unshift({id:'?', label:'', selected:true});
        }

        // Now we need to update the list of DOM nodes to match the optionGroups we computed above
        for (groupIndex = 0, groupLength = optionGroupNames.length;
             groupIndex < groupLength;
             groupIndex++) {
          // current option group name or '' if no group
          optionGroupName = optionGroupNames[groupIndex];

          // list of options for that group. (first item has the parent)
          optionGroup = optionGroups[optionGroupName];

          if (optionGroupsCache.length <= groupIndex) {
            // we need to grow the optionGroups
            optionGroupsCache.push(
                existingOptions = [
                  existingParent = {
                      element: optGroupTemplate.clone().attr('label', optionGroupName),
                      label: optionGroup.label
                    }
                ]
            );
            selectElement.append(existingParent.element);
          } else {
            existingOptions = optionGroupsCache[groupIndex];
            existingParent = existingOptions[0];  // either SELECT (no group) or OPTGROUP element

            // update the OPTGROUP label if not the same.
            if (existingParent.label != optionGroupName) {
              existingParent.element.attr('label', existingParent.label = optionGroupName);
            }
          }

          lastElement = null;  // start at the begining
          for(index = 0, length = optionGroup.length; index < length; index++) {
            option = optionGroup[index];
            if (existingOption = existingOptions[index+1]) {
              // reuse elements
              lastElement = existingOption.element;
              if (existingOption.label !== option.label) {
                lastElement.text(existingOption.label = option.label);
              }
              if (existingOption.id !== option.id) {
                lastElement.val(existingOption.id = option.id);
              }
              if (existingOption.selected !== option.selected) {
                lastElement.attr('selected', option.selected);
              }
            } else {
              // grow elements
              // jQuery(v1.4.2) Bug: We should be able to chain the method calls, but
              // in this version of jQuery on some browser the .text() returns a string
              // rather then the element.
              (element = optionTemplate.clone())
                .val(option.id)
                .attr('selected', option.selected)
                .text(option.label);
              existingOptions.push(existingOption = {
                element: element,
                label: option.label,
                id: option.id,
                checked: option.selected
              });
              if (lastElement) {
                lastElement.after(element);
              } else {
                existingParent.element.append(element);
              }
              lastElement = element;
            }
          }
          // remove any excessive OPTIONs in a group
          index++; // increment since the existingOptions[0] is parent element not OPTION
          while(existingOptions.length > index) {
            existingOptions.pop().element.remove();
          }
        }
        // remove any excessive OPTGROUPs from select
        while(optionGroupsCache.length > groupIndex) {
          optionGroupsCache.pop()[0].element.remove();
        }
      } finally {
        optionScope = null; // TODO(misko): needs to be $destroy()
      }
    });
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.ng:include
 *
 * @description
 * Fetches, compiles and includes an external HTML fragment.
 *
 * Keep in mind that Same Origin Policy applies to included resources
 * (e.g. ng:include won't work for file:// access).
 *
 * @param {string} src angular expression evaluating to URL. If the source is a string constant,
 *                 make sure you wrap it in quotes, e.g. `src="'myPartialTemplate.html'"`.
 * @param {Scope=} [scope=new_child_scope] optional expression which evaluates to an
 *                 instance of angular.scope to set the HTML fragment to.
 * @param {string=} onload Expression to evaluate when a new partial is loaded.
 *
 * @example
    <doc:example>
      <doc:source jsfiddle="false">
       <select name="url">
        <option value="examples/ng-include/template1.html">template1.html</option>
        <option value="examples/ng-include/template2.html">template2.html</option>
        <option value="">(blank)</option>
       </select>
       url of the template: <tt><a href="{{url}}">{{url}}</a></tt>
       <hr/>
       <ng:include src="url"></ng:include>
      </doc:source>
      <doc:scenario>
        it('should load template1.html', function(){
         expect(element('.doc-example-live ng\\:include').text()).
           toBe('Content of template1.html\n');
        });
        it('should load template2.html', function(){
         select('url').option('examples/ng-include/template2.html');
         expect(element('.doc-example-live ng\\:include').text()).
           toBe('Content of template2.html\n');
        });
        it('should change to blank', function(){
         select('url').option('');
         expect(element('.doc-example-live ng\\:include').text()).toEqual('');
        });
      </doc:scenario>
    </doc:example>
 */
angularWidget('ng:include', function(element){
  var compiler = this,
      srcExp = element.attr("src"),
      scopeExp = element.attr("scope") || '',
      onloadExp = element[0].getAttribute('onload') || ''; //workaround for jquery bug #7537
  if (element[0]['ng:compiled']) {
    this.descend(true);
    this.directives(true);
  } else {
    element[0]['ng:compiled'] = true;
    return extend(function(xhr, element){
      var scope = this, childScope;
      var changeCounter = 0;
      var preventRecursion = false;
      function incrementChange(){ changeCounter++;}
      this.$watch(srcExp, incrementChange);
      this.$watch(scopeExp, incrementChange);

      // note that this propagates eval to the current childScope, where childScope is dynamically
      // bound (via $route.onChange callback) to the current scope created by $route
      scope.$onEval(function(){
        if (childScope && !preventRecursion) {
          preventRecursion = true;
          try {
            childScope.$eval();
          } finally {
            preventRecursion = false;
          }
        }
      });
      this.$watch(function(){return changeCounter;}, function(){
        var src = this.$eval(srcExp),
            useScope = this.$eval(scopeExp);

        if (src) {
          xhr('GET', src, null, function(code, response){
            element.html(response);
            childScope = useScope || createScope(scope);
            compiler.compile(element)(childScope);
            scope.$eval(onloadExp);
          }, false, true);
        } else {
          childScope = null;
          element.html('');
        }
      });
    }, {$inject:['$xhr.cache']});
  }
});

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.ng:switch
 *
 * @description
 * Conditionally change the DOM structure.
 *
 * @usageContent
 * <any ng:switch-when="matchValue1">...</any>
 *   <any ng:switch-when="matchValue2">...</any>
 *   ...
 *   <any ng:switch-default>...</any>
 *
 * @param {*} on expression to match against <tt>ng:switch-when</tt>.
 * @paramDescription
 * On child elments add:
 *
 * * `ng:switch-when`: the case statement to match against. If match then this
 *   case will be displayed.
 * * `ng:switch-default`: the default case when no other casses match.
 *
 * @example
    <doc:example>
      <doc:source>
        <select name="switch">
          <option>settings</option>
          <option>home</option>
          <option>other</option>
        </select>
        <tt>switch={{switch}}</tt>
        </hr>
        <ng:switch on="switch" >
          <div ng:switch-when="settings">Settings Div</div>
          <span ng:switch-when="home">Home Span</span>
          <span ng:switch-default>default</span>
        </ng:switch>
        </code>
      </doc:source>
      <doc:scenario>
        it('should start in settings', function(){
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('Settings Div');
        });
        it('should change to home', function(){
         select('switch').option('home');
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('Home Span');
        });
        it('should select deafault', function(){
         select('switch').option('other');
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('default');
        });
      </doc:scenario>
    </doc:example>
 */
//TODO(im): remove all the code related to using and inline equals
var ngSwitch = angularWidget('ng:switch', function (element){
  var compiler = this,
      watchExpr = element.attr("on"),
      usingExpr = (element.attr("using") || 'equals'),
      usingExprParams = usingExpr.split(":"),
      usingFn = ngSwitch[usingExprParams.shift()],
      changeExpr = element.attr('change') || '',
      cases = [];
  if (!usingFn) throw "Using expression '" + usingExpr + "' unknown.";
  if (!watchExpr) throw "Missing 'on' attribute.";
  eachNode(element, function(caseElement){
    var when = caseElement.attr('ng:switch-when');
    var switchCase = {
        change: changeExpr,
        element: caseElement,
        template: compiler.compile(caseElement)
      };
    if (isString(when)) {
      switchCase.when = function(scope, value){
        var args = [value, when];
        forEach(usingExprParams, function(arg){
          args.push(arg);
        });
        return usingFn.apply(scope, args);
      };
      cases.unshift(switchCase);
    } else if (isString(caseElement.attr('ng:switch-default'))) {
      switchCase.when = valueFn(true);
      cases.push(switchCase);
    }
  });

  // this needs to be here for IE
  forEach(cases, function(_case){
    _case.element.remove();
  });

  element.html('');
  return function(element){
    var scope = this, childScope;
    this.$watch(watchExpr, function(value){
      var found = false;
      element.html('');
      childScope = createScope(scope);
      forEach(cases, function(switchCase){
        if (!found && switchCase.when(childScope, value)) {
          found = true;
          childScope.$tryEval(switchCase.change, element);
          switchCase.template(childScope, function(caseElement){
            element.append(caseElement);
          });
        }
      });
    });
    scope.$onEval(function(){
      if (childScope) childScope.$eval();
    });
  };
}, {
  equals: function(on, when) {
    return ''+on == when;
  }
});


/*
 * Modifies the default behavior of html A tag, so that the default action is prevented when href
 * attribute is empty.
 *
 * The reasoning for this change is to allow easy creation of action links with ng:click without
 * changing the location or causing page reloads, e.g.:
 * <a href="" ng:click="model.$save()">Save</a>
 */
angularWidget('a', function() {
  this.descend(true);
  this.directives(true);

  return function(element) {
    var hasNgHref = ((element.attr('ng:bind-attr') || '').indexOf('"href":') !== -1);

    // turn <a href ng:click="..">link</a> into a link in IE
    // but only if it doesn't have name attribute, in which case it's an anchor
    if (!hasNgHref && !element.attr('name') && !element.attr('href')) {
      element.attr('href', '');
    }

    if (element.attr('href') === '' && !hasNgHref) {
      element.bind('click', function(event){
        event.preventDefault();
      });
    }
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:repeat
 *
 * @description
 * The `ng:repeat` widget instantiates a template once per item from a collection. The collection is
 * enumerated with the `ng:repeat-index` attribute, starting from 0. Each template instance gets
 * its own scope, where the given loop variable is set to the current collection item, and `$index`
 * is set to the item index or key.
 *
 * Special properties are exposed on the local scope of each template instance, including:
 *
 *   * `$index` – `{number}` – iterator offset of the repeated element (0..length-1)
 *   * `$position` – `{string}` – position of the repeated element in the iterator. One of:
 *        * `'first'`,
 *        * `'middle'`
 *        * `'last'`
 *
 * Note: Although `ng:repeat` looks like a directive, it is actually an attribute widget.
 *
 * @element ANY
 * @param {string} repeat_expression The expression indicating how to enumerate a collection. Two
 *   formats are currently supported:
 *
 *   * `variable in expression` – where variable is the user defined loop variable and `expression`
 *     is a scope expression giving the collection to enumerate.
 *
 *     For example: `track in cd.tracks`.
 *
 *   * `(key, value) in expression` – where `key` and `value` can be any user defined identifiers,
 *     and `expression` is the scope expression giving the collection to enumerate.
 *
 *     For example: `(name, age) in {'adam':10, 'amalie':12}`.
 *
 * @example
 * This example initializes the scope to a list of names and
 * then uses `ng:repeat` to display every person:
    <doc:example>
      <doc:source>
        <div ng:init="friends = [{name:'John', age:25}, {name:'Mary', age:28}]">
          I have {{friends.length}} friends. They are:
          <ul>
            <li ng:repeat="friend in friends">
              [{{$index + 1}}] {{friend.name}} who is {{friend.age}} years old.
            </li>
          </ul>
        </div>
      </doc:source>
      <doc:scenario>
         it('should check ng:repeat', function(){
           var r = using('.doc-example-live').repeater('ul li');
           expect(r.count()).toBe(2);
           expect(r.row(0)).toEqual(["1","John","25"]);
           expect(r.row(1)).toEqual(["2","Mary","28"]);
         });
      </doc:scenario>
    </doc:example>
 */
angularWidget('@ng:repeat', function(expression, element){
  element.removeAttr('ng:repeat');
  element.replaceWith(jqLite('<!-- ng:repeat: ' + expression + ' -->'));
  var linker = this.compile(element);
  return function(iterStartElement){
    var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
        lhs, rhs, valueIdent, keyIdent;
    if (! match) {
      throw Error("Expected ng:repeat in form of '_item_ in _collection_' but got '" +
      expression + "'.");
    }
    lhs = match[1];
    rhs = match[2];
    match = lhs.match(/^([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\)$/);
    if (!match) {
      throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
      keyValue + "'.");
    }
    valueIdent = match[3] || match[1];
    keyIdent = match[2];

    var children = [], currentScope = this;
    this.$onEval(function(){
      var index = 0,
          childCount = children.length,
          lastIterElement = iterStartElement,
          collection = this.$tryEval(rhs, iterStartElement),
          collectionLength = size(collection, true),
          fragment = (element[0].nodeName != 'OPTION') ? document.createDocumentFragment() : null,
          addFragment,
          childScope,
          key;

      for (key in collection) {
        if (collection.hasOwnProperty(key)) {
          if (index < childCount) {
            // reuse existing child
            childScope = children[index];
            childScope[valueIdent] = collection[key];
            if (keyIdent) childScope[keyIdent] = key;
            lastIterElement = childScope.$element;
            childScope.$position = index == 0
                ? 'first'
                : (index == collectionLength - 1 ? 'last' : 'middle');
            childScope.$eval();
          } else {
            // grow children
            childScope = createScope(currentScope);
            childScope[valueIdent] = collection[key];
            if (keyIdent) childScope[keyIdent] = key;
            childScope.$index = index;
            childScope.$position = index == 0
                ? 'first'
                : (index == collectionLength - 1 ? 'last' : 'middle');
            children.push(childScope);
            linker(childScope, function(clone){
              clone.attr('ng:repeat-index', index);

              if (fragment) {
                fragment.appendChild(clone[0]);
                addFragment = true;
              } else {
                //temporarily preserve old way for option element
                lastIterElement.after(clone);
                lastIterElement = clone;
              }
            });
          }
          index ++;
        }
      }

      //attach new nodes buffered in doc fragment
      if (addFragment) {
        lastIterElement.after(jqLite(fragment));
      }

      // shrink children
      while(children.length > index) {
        children.pop().$element.remove();
      }
    }, iterStartElement);
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:non-bindable
 *
 * @description
 * Sometimes it is necessary to write code which looks like bindings but which should be left alone
 * by angular. Use `ng:non-bindable` to make angular ignore a chunk of HTML.
 *
 * Note: `ng:non-bindable` looks like a directive, but is actually an attribute widget.
 *
 * @element ANY
 *
 * @example
 * In this example there are two location where a simple binding (`{{}}`) is present, but the one
 * wrapped in `ng:non-bindable` is left alone.
 *
 * @example
    <doc:example>
      <doc:source>
        <div>Normal: {{1 + 2}}</div>
        <div ng:non-bindable>Ignored: {{1 + 2}}</div>
      </doc:source>
      <doc:scenario>
       it('should check ng:non-bindable', function(){
         expect(using('.doc-example-live').binding('1 + 2')).toBe('3');
         expect(using('.doc-example-live').element('div:last').text()).
           toMatch(/1 \+ 2/);
       });
      </doc:scenario>
    </doc:example>
 */
angularWidget("@ng:non-bindable", noop);


/**
 * @ngdoc widget
 * @name angular.widget.ng:view
 *
 * @description
 * # Overview
 * `ng:view` is a widget that complements the {@link angular.service.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * This widget provides functionality similar to {@link angular.widget.ng:include ng:include} when
 * used like this:
 *
 *     <ng:include src="$route.current.template" scope="$route.current.scope"></ng:include>
 *
 *
 * # Advantages
 * Compared to `ng:include`, `ng:view` offers these advantages:
 *
 * - shorter syntax
 * - more efficient execution
 * - doesn't require `$route` service to be available on the root scope
 *
 *
 * @example
    <doc:example>
      <doc:source jsfiddle="false">
         <script>
           function MyCtrl($route) {
             $route.when('/overview',
               { controller: OverviewCtrl,
                 template: 'guide/dev_guide.overview.html'});
             $route.when('/bootstrap',
               { controller: BootstrapCtrl,
                 template: 'guide/dev_guide.bootstrap.auto_bootstrap.html'});
           };
           MyCtrl.$inject = ['$route'];

           function BootstrapCtrl(){}
           function OverviewCtrl(){}
         </script>
         <div ng:controller="MyCtrl">
           <a href="#/overview">overview</a> |
           <a href="#/bootstrap">bootstrap</a> |
           <a href="#/undefined">undefined</a>

           <br/>

           The view is included below:
           <hr/>
           <ng:view></ng:view>
         </div>
      </doc:source>
      <doc:scenario>
        it('should load templates', function(){
          element('.doc-example-live a:contains(overview)').click();
          expect(element('.doc-example-live ng\\:view').text()).toMatch(/Developer Guide: Overview/);

          element('.doc-example-live a:contains(bootstrap)').click();
          expect(element('.doc-example-live ng\\:view').text()).toMatch(/Developer Guide: Initializing Angular: Automatic Initiialization/);
        });
      </doc:scenario>
    </doc:example>
 */
angularWidget('ng:view', function(element) {
  var compiler = this;

  if (!element[0]['ng:compiled']) {
    element[0]['ng:compiled'] = true;
    return annotate('$xhr.cache', '$route', function($xhr, $route, element){
      var parentScope = this,
          childScope;

      $route.onChange(function(){
        var src;

        if ($route.current) {
          src = $route.current.template;
          childScope = $route.current.scope;
        }

        if (src) {
          //xhr's callback must be async, see commit history for more info
          $xhr('GET', src, function(code, response){
            element.html(response);
            compiler.compile(element)(childScope);
          });
        } else {
          element.html('');
        }
      })(); //initialize the state forcefully, it's possible that we missed the initial
            //$route#onChange already

      // note that this propagates eval to the current childScope, where childScope is dynamically
      // bound (via $route.onChange callback) to the current scope created by $route
      parentScope.$onEval(function() {
        if (childScope) {
          childScope.$eval();
        }
      });
    });
  } else {
    this.descend(true);
    this.directives(true);
  }
});

var browserSingleton;

angularService('$browser', function($log){
  if (!browserSingleton) {
    browserSingleton = new Browser(window, jqLite(window.document), jqLite(window.document.body),
                                   XHR, $log);
    browserSingleton.bind();
  }
  return browserSingleton;
}, {$inject:['$log']});


extend(angular, {
  // disabled for now until we agree on public name
  //'annotate': annotate,
  'element': jqLite,
  'compile': compile,
  'scope': createScope,
  'copy': copy,
  'extend': extend,
  'equals': equals,
  'forEach': forEach,
  'injector': createInjector,
  'noop':noop,
  'bind':bind,
  'toJson': toJson,
  'fromJson': fromJson,
  'identity':identity,
  'isUndefined': isUndefined,
  'isDefined': isDefined,
  'isString': isString,
  'isFunction': isFunction,
  'isObject': isObject,
  'isNumber': isNumber,
  'isArray': isArray,
  'version': version
});

//try to bind to jquery now so that one can write angular.element().read()
//but we will rebind on bootstrap again.
bindJQuery();



  jqLiteWrap(document).ready(function(){
    angularInit(angularJsConfig(document), document);
  });

})(window, document);
angular.element(document).find('head').append('<style type="text/css">@charset "UTF-8";.ng-format-negative{color:red;}.ng-exception{border:2px solid #FF0000;font-family:"Courier New",Courier,monospace;font-size:smaller;white-space:pre;}.ng-validation-error{border:2px solid #FF0000;}#ng-callout{margin:0;padding:0;border:0;outline:0;font-size:13px;font-weight:normal;font-family:Verdana,Arial,Helvetica,sans-serif;vertical-align:baseline;background:transparent;text-decoration:none;}#ng-callout .ng-arrow-left{background-image:url("data:image/gif;base64,R0lGODlhCwAXAKIAAMzMzO/v7/f39////////wAAAAAAAAAAACH5BAUUAAQALAAAAAALABcAAAMrSLoc/AG8FeUUIN+sGebWAnbKSJodqqlsOxJtqYooU9vvk+vcJIcTkg+QAAA7");background-repeat:no-repeat;background-position:left top;position:absolute;z-index:101;left:-12px;height:23px;width:10px;top:-3px;}#ng-callout .ng-arrow-right{background-image:url("data:image/gif;base64,R0lGODlhCwAXAKIAAMzMzO/v7/f39////////wAAAAAAAAAAACH5BAUUAAQALAAAAAALABcAAAMrCLTcoM29yN6k9socs91e5X3EyJloipYrO4ohTMqA0Fn2XVNswJe+H+SXAAA7");background-repeat:no-repeat;background-position:left top;position:absolute;z-index:101;height:23px;width:11px;top:-2px;}#ng-callout{position:absolute;z-index:100;border:2px solid #CCCCCC;background-color:#fff;}#ng-callout .ng-content{padding:10px 10px 10px 10px;color:#333333;}#ng-callout .ng-title{background-color:#CCCCCC;text-align:left;padding-left:8px;padding-bottom:5px;padding-top:2px;font-weight:bold;}.ng-input-indicator-wait{background-image:url("data:image/png;base64,R0lGODlhEAAQAPQAAP///wAAAPDw8IqKiuDg4EZGRnp6egAAAFhYWCQkJKysrL6+vhQUFJycnAQEBDY2NmhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAkKAAAALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQJCgAAACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQJCgAAACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkECQoAAAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkECQoAAAAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAkKAAAALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAkKAAAALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQJCgAAACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQJCgAAACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAAA==");background-position:right;background-repeat:no-repeat;}</style>');

/*
* jQuery Mobile Framework Git Build: SHA1: bb8dfd7bd53969108d69b7d48a935b7a6c0c1d4b <> Date: Fri Nov 25 10:16:42 2011 +0100
* http://jquerymobile.com
*
* Copyright 2011 (c) jQuery Project
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
*/
/*!
 * jQuery UI Widget @VERSION
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */

(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			$( elem ).triggerHandler( "remove" );
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						$( this ).triggerHandler( "remove" );
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name );
				if ( !instance ) {
					throw "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'";
				}
				if ( !$.isFunction( instance[options] ) ) {
					throw "no such method '" + options + "' for " + name + " widget instance";
				}
				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		var options = {};
		if ( $.metadata ) {
			options = $.metadata.get( element )[ this.widgetName ];
		}
		return options;
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );
/*
* widget factory extentions for mobile
*/

(function( $, undefined ) {

$.widget( "mobile.widget", {
	// decorate the parent _createWidget to trigger `widgetinit` for users
	// who wish to do post post `widgetcreate` alterations/additions
	//
	// TODO create a pull request for jquery ui to trigger this event
	// in the original _createWidget
	_createWidget: function() {
		$.Widget.prototype._createWidget.apply( this, arguments );
		this._trigger( 'init' );
	},

	_getCreateOptions: function() {

		var elem = this.element,
			options = {};

		$.each( this.options, function( option ) {

			var value = elem.jqmData( option.replace( /[A-Z]/g, function( c ) {
							return "-" + c.toLowerCase();
						})
					);

			if ( value !== undefined ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	enhanceWithin: function( target ) {
		// TODO remove dependency on the page widget for the keepNative.
		// Currently the keepNative value is defined on the page prototype so
		// the method is as well
		var page = $(target).closest(":jqmData(role='page')").data( "page" ),
			keepNative = (page && page.keepNativeSelector()) || "";

		$( this.options.initSelector, target ).not( keepNative )[ this.widgetName ]();
	}
});

})( jQuery );
/*
* a workaround for window.matchMedia
*/

(function( $, undefined ) {

var $window = $( window ),
	$html = $( "html" );

/* $.mobile.media method: pass a CSS media type or query and get a bool return
	note: this feature relies on actual media query support for media queries, though types will work most anywhere
	examples:
		$.mobile.media('screen') //>> tests for screen media type
		$.mobile.media('screen and (min-width: 480px)') //>> tests for screen media type with window width > 480px
		$.mobile.media('@media screen and (-webkit-min-device-pixel-ratio: 2)') //>> tests for webkit 2x pixel ratio (iPhone 4)
*/
$.mobile.media = (function() {
	// TODO: use window.matchMedia once at least one UA implements it
	var cache = {},
		testDiv = $( "<div id='jquery-mediatest'>" ),
		fakeBody = $( "<body>" ).append( testDiv );

	return function( query ) {
		if ( !( query in cache ) ) {
			var styleBlock = document.createElement( "style" ),
				cssrule = "@media " + query + " { #jquery-mediatest { position:absolute; } }";

			//must set type for IE!
			styleBlock.type = "text/css";

			if ( styleBlock.styleSheet  ){
				styleBlock.styleSheet.cssText = cssrule;
			} else {
				styleBlock.appendChild( document.createTextNode(cssrule) );
			}

			$html.prepend( fakeBody ).prepend( styleBlock );
			cache[ query ] = testDiv.css( "position" ) === "absolute";
			fakeBody.add( styleBlock ).remove();
		}
		return cache[ query ];
	};
})();

})(jQuery);
/*
* support tests
*/

(function( $, undefined ) {

var fakeBody = $( "<body>" ).prependTo( "html" ),
	fbCSS = fakeBody[ 0 ].style,
	vendors = [ "Webkit", "Moz", "O" ],
	webos = "palmGetResource" in window, //only used to rule out scrollTop
	operamini = window.operamini && ({}).toString.call( window.operamini ) === "[object OperaMini]",
	bb = window.blackberry; //only used to rule out box shadow, as it's filled opaque on BB

// thx Modernizr
function propExists( prop ) {
	var uc_prop = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
		props = ( prop + " " + vendors.join( uc_prop + " " ) + uc_prop ).split( " " );

	for ( var v in props ){
		if ( fbCSS[ props[ v ] ] !== undefined ) {
			return true;
		}
	}
}

// Test for dynamic-updating base tag support ( allows us to avoid href,src attr rewriting )
function baseTagTest() {
	var fauxBase = location.protocol + "//" + location.host + location.pathname + "ui-dir/",
		base = $( "head base" ),
		fauxEle = null,
		href = "",
		link, rebase;

	if ( !base.length ) {
		base = fauxEle = $( "<base>", { "href": fauxBase }).appendTo( "head" );
	} else {
		href = base.attr( "href" );
	}

	link = $( "<a href='testurl' />" ).prependTo( fakeBody );
	rebase = link[ 0 ].href;
	base[ 0 ].href = href || location.pathname;

	if ( fauxEle ) {
		fauxEle.remove();
	}
	return rebase.indexOf( fauxBase ) === 0;
}


// non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
// allows for inclusion of IE 6+, including Windows Mobile 7
$.mobile.browser = {};
$.mobile.browser.ie = (function() {
	var v = 3,
	div = document.createElement( "div" ),
	a = div.all || [];

	while ( div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->", a[ 0 ] );

	return v > 4 ? v : !v;
})();


$.extend( $.support, {
	orientation: "orientation" in window && "onorientationchange" in window,
	touch: "ontouchend" in document,
	cssTransitions: "WebKitTransitionEvent" in window,
	pushState: "pushState" in history && "replaceState" in history,
	mediaquery: $.mobile.media( "only all" ),
	cssPseudoElement: !!propExists( "content" ),
	touchOverflow: !!propExists( "overflowScrolling" ),
	boxShadow: !!propExists( "boxShadow" ) && !bb,
	scrollTop: ( "pageXOffset" in window || "scrollTop" in document.documentElement || "scrollTop" in fakeBody[ 0 ] ) && !webos && !operamini,
	dynamicBaseTag: baseTagTest()
});

fakeBody.remove();


// $.mobile.ajaxBlacklist is used to override ajaxEnabled on platforms that have known conflicts with hash history updates (BB5, Symbian)
// or that generally work better browsing in regular http for full page refreshes (Opera Mini)
// Note: This detection below is used as a last resort.
// We recommend only using these detection methods when all other more reliable/forward-looking approaches are not possible
var nokiaLTE7_3 = (function(){

	var ua = window.navigator.userAgent;

	//The following is an attempt to match Nokia browsers that are running Symbian/s60, with webkit, version 7.3 or older
	return ua.indexOf( "Nokia" ) > -1 &&
			( ua.indexOf( "Symbian/3" ) > -1 || ua.indexOf( "Series60/5" ) > -1 ) &&
			ua.indexOf( "AppleWebKit" ) > -1 &&
			ua.match( /(BrowserNG|NokiaBrowser)\/7\.[0-3]/ );
})();

$.mobile.ajaxBlacklist =
			// BlackBerry browsers, pre-webkit
			window.blackberry && !window.WebKitPoint ||
			// Opera Mini
			operamini ||
			// Symbian webkits pre 7.3
			nokiaLTE7_3;

// Lastly, this workaround is the only way we've found so far to get pre 7.3 Symbian webkit devices
// to render the stylesheets when they're referenced before this script, as we'd recommend doing.
// This simply reappends the CSS in place, which for some reason makes it apply
if ( nokiaLTE7_3 ) {
	$(function() {
		$( "head link[rel='stylesheet']" ).attr( "rel", "alternate stylesheet" ).attr( "rel", "stylesheet" );
	});
}

// For ruling out shadows via css
if ( !$.support.boxShadow ) {
	$( "html" ).addClass( "ui-mobile-nosupport-boxshadow" );
}

})( jQuery );
/*
* "mouse" plugin
*/

// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

(function( $, window, document, undefined ) {

var dataPropertyName = "virtualMouseBindings",
	touchTargetPropertyName = "virtualTouchID",
	virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
	touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
	activeDocHandlers = {},
	resetTimerID = 0,
	startX = 0,
	startY = 0,
	didScroll = false,
	clickBlockList = [],
	blockMouseTriggers = false,
	blockTouchTriggers = false,
	eventCaptureSupported = "addEventListener" in document,
	$document = $( document ),
	nextTouchID = 1,
	lastTouchID = 0;

$.vmouse = {
	moveDistanceThreshold: 10,
	clickDistanceThreshold: 10,
	resetTimerDuration: 1500
};

function getNativeEvent( event ) {

	while ( event && typeof event.originalEvent !== "undefined" ) {
		event = event.originalEvent;
	}
	return event;
}

function createVirtualEvent( event, eventType ) {

	var t = event.type,
		oe, props, ne, prop, ct, touch, i, j;

	event = $.Event(event);
	event.type = eventType;

	oe = event.originalEvent;
	props = $.event.props;

	// copy original event properties over to the new event
	// this would happen if we could call $.event.fix instead of $.Event
	// but we don't have a way to force an event to be fixed multiple times
	if ( oe ) {
		for ( i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = oe[ prop ];
		}
	}

	// make sure that if the mouse and click virtual events are generated
	// without a .which one is defined
	if ( t.search(/mouse(down|up)|click/) > -1 && !event.which ){
		event.which = 1;
	}

	if ( t.search(/^touch/) !== -1 ) {
		ne = getNativeEvent( oe );
		t = ne.touches;
		ct = ne.changedTouches;
		touch = ( t && t.length ) ? t[0] : ( (ct && ct.length) ? ct[ 0 ] : undefined );

		if ( touch ) {
			for ( j = 0, len = touchEventProps.length; j < len; j++){
				prop = touchEventProps[ j ];
				event[ prop ] = touch[ prop ];
			}
		}
	}

	return event;
}

function getVirtualBindingFlags( element ) {

	var flags = {},
		b, k;

	while ( element ) {

		b = $.data( element, dataPropertyName );

		for (  k in b ) {
			if ( b[ k ] ) {
				flags[ k ] = flags.hasVirtualBinding = true;
			}
		}
		element = element.parentNode;
	}
	return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
	var b;
	while ( element ) {

		b = $.data( element, dataPropertyName );

		if ( b && ( !eventType || b[ eventType ] ) ) {
			return element;
		}
		element = element.parentNode;
	}
	return null;
}

function enableTouchBindings() {
	blockTouchTriggers = false;
}

function disableTouchBindings() {
	blockTouchTriggers = true;
}

function enableMouseBindings() {
	lastTouchID = 0;
	clickBlockList.length = 0;
	blockMouseTriggers = false;

	// When mouse bindings are enabled, our
	// touch bindings are disabled.
	disableTouchBindings();
}

function disableMouseBindings() {
	// When mouse bindings are disabled, our
	// touch bindings are enabled.
	enableTouchBindings();
}

function startResetTimer() {
	clearResetTimer();
	resetTimerID = setTimeout(function(){
		resetTimerID = 0;
		enableMouseBindings();
	}, $.vmouse.resetTimerDuration );
}

function clearResetTimer() {
	if ( resetTimerID ){
		clearTimeout( resetTimerID );
		resetTimerID = 0;
	}
}

function triggerVirtualEvent( eventType, event, flags ) {
	var ve;

	if ( ( flags && flags[ eventType ] ) ||
				( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

		ve = createVirtualEvent( event, eventType );

		$( event.target).trigger( ve );
	}

	return ve;
}

// Workaround for jquery issue 10192,
// by which the mouseout event receives an event with type mosueleave
// if at least one listener for mouseleave is registered.
var jqueryEventTypeFixes = {
   mouseenter: 'mouseover',
   mouseleave: 'mouseout'
};

function mouseEventCallback( event ) {
	var touchID = $.data(event.target, touchTargetPropertyName);

	if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ){
        var newType = jqueryEventTypeFixes[event.type];
        if (!newType) {
            newType = event.type;
        }
		var ve = triggerVirtualEvent( "v" + newType, event );
		if ( ve ) {
			if ( ve.isDefaultPrevented() ) {
				event.preventDefault();
			}
			if ( ve.isPropagationStopped() ) {
				event.stopPropagation();
			}
			if ( ve.isImmediatePropagationStopped() ) {
				event.stopImmediatePropagation();
			}
		}
	}
}

function handleTouchStart( event ) {

	var touches = getNativeEvent( event ).touches,
		target, flags;

	if ( touches && touches.length === 1 ) {

		target = event.target;
		flags = getVirtualBindingFlags( target );

		if ( flags.hasVirtualBinding ) {

			lastTouchID = nextTouchID++;
			$.data( target, touchTargetPropertyName, lastTouchID );

			clearResetTimer();

			disableMouseBindings();
			didScroll = false;

			var t = getNativeEvent( event ).touches[ 0 ];
			startX = t.pageX;
			startY = t.pageY;

			triggerVirtualEvent( "vmouseover", event, flags );
			triggerVirtualEvent( "vmousedown", event, flags );
		}
	}
}

function handleScroll( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	if ( !didScroll ) {
		triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
	}

	didScroll = true;
	startResetTimer();
}

function handleTouchMove( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	var t = getNativeEvent( event ).touches[ 0 ],
		didCancel = didScroll,
		moveThreshold = $.vmouse.moveDistanceThreshold;
		didScroll = didScroll ||
			( Math.abs(t.pageX - startX) > moveThreshold ||
				Math.abs(t.pageY - startY) > moveThreshold ),
		flags = getVirtualBindingFlags( event.target );

	if ( didScroll && !didCancel ) {
		triggerVirtualEvent( "vmousecancel", event, flags );
	}

	triggerVirtualEvent( "vmousemove", event, flags );
	startResetTimer();
}

function handleTouchEnd( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	disableTouchBindings();

	var flags = getVirtualBindingFlags( event.target ),
		t;
	triggerVirtualEvent( "vmouseup", event, flags );

	if ( !didScroll ) {
		var ve = triggerVirtualEvent( "vclick", event, flags );
		if ( ve && ve.isDefaultPrevented() ) {
			// The target of the mouse events that follow the touchend
			// event don't necessarily match the target used during the
			// touch. This means we need to rely on coordinates for blocking
			// any click that is generated.
			t = getNativeEvent( event ).changedTouches[ 0 ];
			clickBlockList.push({
				touchID: lastTouchID,
				x: t.clientX,
				y: t.clientY
			});

			// Prevent any mouse events that follow from triggering
			// virtual event notifications.
			blockMouseTriggers = true;
		}
	}
	triggerVirtualEvent( "vmouseout", event, flags);
	didScroll = false;

	startResetTimer();
}

function hasVirtualBindings( ele ) {
	var bindings = $.data( ele, dataPropertyName ),
		k;

	if ( bindings ) {
		for ( k in bindings ) {
			if ( bindings[ k ] ) {
				return true;
			}
		}
	}
	return false;
}

function dummyMouseHandler(){}

function getSpecialEventObject( eventType ) {
	var realType = eventType.substr( 1 );

	return {
		setup: function( data, namespace ) {
			// If this is the first virtual mouse binding for this element,
			// add a bindings object to its data.

			if ( !hasVirtualBindings( this ) ) {
				$.data( this, dataPropertyName, {});
			}

			// If setup is called, we know it is the first binding for this
			// eventType, so initialize the count for the eventType to zero.
			var bindings = $.data( this, dataPropertyName );
			bindings[ eventType ] = true;

			// If this is the first virtual mouse event for this type,
			// register a global handler on the document.

			activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

			if ( activeDocHandlers[ eventType ] === 1 ) {
				$document.bind( realType, mouseEventCallback );
			}

			// Some browsers, like Opera Mini, won't dispatch mouse/click events
			// for elements unless they actually have handlers registered on them.
			// To get around this, we register dummy handlers on the elements.

			$( this ).bind( realType, dummyMouseHandler );

			// For now, if event capture is not supported, we rely on mouse handlers.
			if ( eventCaptureSupported ) {
				// If this is the first virtual mouse binding for the document,
				// register our touchstart handler on the document.

				activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0) + 1;

				if (activeDocHandlers[ "touchstart" ] === 1) {
					$document.bind( "touchstart", handleTouchStart )
						.bind( "touchend", handleTouchEnd )

						// On touch platforms, touching the screen and then dragging your finger
						// causes the window content to scroll after some distance threshold is
						// exceeded. On these platforms, a scroll prevents a click event from being
						// dispatched, and on some platforms, even the touchend is suppressed. To
						// mimic the suppression of the click event, we need to watch for a scroll
						// event. Unfortunately, some platforms like iOS don't dispatch scroll
						// events until *AFTER* the user lifts their finger (touchend). This means
						// we need to watch both scroll and touchmove events to figure out whether
						// or not a scroll happenens before the touchend event is fired.

						.bind( "touchmove", handleTouchMove )
						.bind( "scroll", handleScroll );
				}
			}
		},

		teardown: function( data, namespace ) {
			// If this is the last virtual binding for this eventType,
			// remove its global handler from the document.

			--activeDocHandlers[ eventType ];

			if ( !activeDocHandlers[ eventType ] ) {
				$document.unbind( realType, mouseEventCallback );
			}

			if ( eventCaptureSupported ) {
				// If this is the last virtual mouse binding in existence,
				// remove our document touchstart listener.

				--activeDocHandlers[ "touchstart" ];

				if ( !activeDocHandlers[ "touchstart" ] ) {
					$document.unbind( "touchstart", handleTouchStart )
						.unbind( "touchmove", handleTouchMove )
						.unbind( "touchend", handleTouchEnd )
						.unbind( "scroll", handleScroll );
				}
			}

			var $this = $( this ),
				bindings = $.data( this, dataPropertyName );

			// teardown may be called when an element was
			// removed from the DOM. If this is the case,
			// jQuery core may have already stripped the element
			// of any data bindings so we need to check it before
			// using it.
			if ( bindings ) {
				bindings[ eventType ] = false;
			}

			// Unregister the dummy event handler.

			$this.unbind( realType, dummyMouseHandler );

			// If this is the last virtual mouse binding on the
			// element, remove the binding data from the element.

			if ( !hasVirtualBindings( this ) ) {
				$this.removeData( dataPropertyName );
			}
		}
	};
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( var i = 0; i < virtualEventNames.length; i++ ){
	$.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if ( eventCaptureSupported ) {
	document.addEventListener( "click", function( e ){
		var cnt = clickBlockList.length,
			target = e.target,
			x, y, ele, i, o, touchID;

		if ( cnt ) {
			x = e.clientX;
			y = e.clientY;
			threshold = $.vmouse.clickDistanceThreshold;

			// The idea here is to run through the clickBlockList to see if
			// the current click event is in the proximity of one of our
			// vclick events that had preventDefault() called on it. If we find
			// one, then we block the click.
			//
			// Why do we have to rely on proximity?
			//
			// Because the target of the touch event that triggered the vclick
			// can be different from the target of the click event synthesized
			// by the browser. The target of a mouse/click event that is syntehsized
			// from a touch event seems to be implementation specific. For example,
			// some browsers will fire mouse/click events for a link that is near
			// a touch event, even though the target of the touchstart/touchend event
			// says the user touched outside the link. Also, it seems that with most
			// browsers, the target of the mouse/click event is not calculated until the
			// time it is dispatched, so if you replace an element that you touched
			// with another element, the target of the mouse/click will be the new
			// element underneath that point.
			//
			// Aside from proximity, we also check to see if the target and any
			// of its ancestors were the ones that blocked a click. This is necessary
			// because of the strange mouse/click target calculation done in the
			// Android 2.1 browser, where if you click on an element, and there is a
			// mouse/click handler on one of its ancestors, the target will be the
			// innermost child of the touched element, even if that child is no where
			// near the point of touch.

			ele = target;

			while ( ele ) {
				for ( i = 0; i < cnt; i++ ) {
					o = clickBlockList[ i ];
					touchID = 0;

					if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
								$.data( ele, touchTargetPropertyName ) === o.touchID ) {
						// XXX: We may want to consider removing matches from the block list
						//      instead of waiting for the reset timer to fire.
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				ele = ele.parentNode;
			}
		}
	}, true);
}
})( jQuery, window, document );
/* 
* "events" plugin - Handles events
*/

(function( $, window, undefined ) {

// add new event shortcuts
$.each( ( "touchstart touchmove touchend orientationchange throttledresize " +
					"tap taphold swipe swipeleft swiperight scrollstart scrollstop" ).split( " " ), function( i, name ) {

	$.fn[ name ] = function( fn ) {
		return fn ? this.bind( name, fn ) : this.trigger( name );
	};

	$.attrFn[ name ] = true;
});

var supportTouch = $.support.touch,
	scrollEvent = "touchmove scroll",
	touchStartEvent = supportTouch ? "touchstart" : "mousedown",
	touchStopEvent = supportTouch ? "touchend" : "mouseup",
	touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

function triggerCustomEvent( obj, eventType, event ) {
	var originalType = event.type;
	event.type = eventType;
	$.event.handle.call( obj, event );
	event.type = originalType;
}

// also handles scrollstop
$.event.special.scrollstart = {

	enabled: true,

	setup: function() {

		var thisObject = this,
			$this = $( thisObject ),
			scrolling,
			timer;

		function trigger( event, state ) {
			scrolling = state;
			triggerCustomEvent( thisObject, scrolling ? "scrollstart" : "scrollstop", event );
		}

		// iPhone triggers scroll after a small delay; use touchmove instead
		$this.bind( scrollEvent, function( event ) {

			if ( !$.event.special.scrollstart.enabled ) {
				return;
			}

			if ( !scrolling ) {
				trigger( event, true );
			}

			clearTimeout( timer );
			timer = setTimeout(function() {
				trigger( event, false );
			}, 50 );
		});
	}
};

// also handles taphold
$.event.special.tap = {
	setup: function() {
		var thisObject = this,
			$this = $( thisObject );

		$this.bind( "vmousedown", function( event ) {

			if ( event.which && event.which !== 1 ) {
				return false;
			}

			var origTarget = event.target,
				origEvent = event.originalEvent,
				timer;

			function clearTapTimer() {
				clearTimeout( timer );
			}

			function clearTapHandlers() {
				clearTapTimer();

				$this.unbind( "vclick", clickHandler )
					.unbind( "vmouseup", clearTapTimer )
					.unbind( "vmousecancel", clearTapHandlers );
			}

			function clickHandler(event) {
				clearTapHandlers();

				// ONLY trigger a 'tap' event if the start target is
				// the same as the stop target.
				if ( origTarget == event.target ) {
					triggerCustomEvent( thisObject, "tap", event );
				}
			}

			$this.bind( "vmousecancel", clearTapHandlers )
				.bind( "vmouseup", clearTapTimer )
				.bind( "vclick", clickHandler );

			timer = setTimeout(function() {
					triggerCustomEvent( thisObject, "taphold", $.Event( "taphold" ) );
			}, 750 );
		});
	}
};

// also handles swipeleft, swiperight
$.event.special.swipe = {
	scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.

	durationThreshold: 1000, // More time than this, and it isn't a swipe.

	horizontalDistanceThreshold: 30,  // Swipe horizontal displacement must be more than this.

	verticalDistanceThreshold: 75,  // Swipe vertical displacement must be less than this.

	setup: function() {
		var thisObject = this,
			$this = $( thisObject );

		$this.bind( touchStartEvent, function( event ) {
			var data = event.originalEvent.touches ?
								event.originalEvent.touches[ 0 ] : event,
				start = {
					time: ( new Date() ).getTime(),
					coords: [ data.pageX, data.pageY ],
					origin: $( event.target )
				},
				stop;

			function moveHandler( event ) {

				if ( !start ) {
					return;
				}

				var data = event.originalEvent.touches ?
						event.originalEvent.touches[ 0 ] : event;

				stop = {
					time: ( new Date() ).getTime(),
					coords: [ data.pageX, data.pageY ]
				};

				// prevent scrolling
				if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
					event.preventDefault();
				}
			}

			$this.bind( touchMoveEvent, moveHandler )
				.one( touchStopEvent, function( event ) {
					$this.unbind( touchMoveEvent, moveHandler );

					if ( start && stop ) {
						if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
								Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
								Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {

							start.origin.trigger( "swipe" )
								.trigger( start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight" );
						}
					}
					start = stop = undefined;
				});
		});
	}
};

(function( $, window ) {
	// "Cowboy" Ben Alman

	var win = $( window ),
		special_event,
		get_orientation,
		last_orientation;

	$.event.special.orientationchange = special_event = {
		setup: function() {
			// If the event is supported natively, return false so that jQuery
			// will bind to the event using DOM methods.
			if ( $.support.orientation && $.mobile.orientationChangeEnabled ) {
				return false;
			}

			// Get the current orientation to avoid initial double-triggering.
			last_orientation = get_orientation();

			// Because the orientationchange event doesn't exist, simulate the
			// event by testing window dimensions on resize.
			win.bind( "throttledresize", handler );
		},
		teardown: function(){
			// If the event is not supported natively, return false so that
			// jQuery will unbind the event using DOM methods.
			if ( $.support.orientation && $.mobile.orientationChangeEnabled ) {
				return false;
			}

			// Because the orientationchange event doesn't exist, unbind the
			// resize event handler.
			win.unbind( "throttledresize", handler );
		},
		add: function( handleObj ) {
			// Save a reference to the bound event handler.
			var old_handler = handleObj.handler;


			handleObj.handler = function( event ) {
				// Modify event object, adding the .orientation property.
				event.orientation = get_orientation();

				// Call the originally-bound event handler and return its result.
				return old_handler.apply( this, arguments );
			};
		}
	};

	// If the event is not supported natively, this handler will be bound to
	// the window resize event to simulate the orientationchange event.
	function handler() {
		// Get the current orientation.
		var orientation = get_orientation();

		if ( orientation !== last_orientation ) {
			// The orientation has changed, so trigger the orientationchange event.
			last_orientation = orientation;
			win.trigger( "orientationchange" );
		}
	}

	// Get the current page orientation. This method is exposed publicly, should it
	// be needed, as jQuery.event.special.orientationchange.orientation()
	$.event.special.orientationchange.orientation = get_orientation = function() {
		var isPortrait = true, elem = document.documentElement;

		// prefer window orientation to the calculation based on screensize as
		// the actual screen resize takes place before or after the orientation change event
		// has been fired depending on implementation (eg android 2.3 is before, iphone after).
		// More testing is required to determine if a more reliable method of determining the new screensize
		// is possible when orientationchange is fired. (eg, use media queries + element + opacity)
		if ( $.support.orientation ) {
			// if the window orientation registers as 0 or 180 degrees report
			// portrait, otherwise landscape
			isPortrait = window.orientation % 180 == 0;
		} else {
			isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
		}

		return isPortrait ? "portrait" : "landscape";
	};

})( jQuery, window );


// throttled resize event
(function() {

	$.event.special.throttledresize = {
		setup: function() {
			$( this ).bind( "resize", handler );
		},
		teardown: function(){
			$( this ).unbind( "resize", handler );
		}
	};

	var throttle = 250,
		handler = function() {
			curr = ( new Date() ).getTime();
			diff = curr - lastCall;

			if ( diff >= throttle ) {

				lastCall = curr;
				$( this ).trigger( "throttledresize" );

			} else {

				if ( heldCall ) {
					clearTimeout( heldCall );
				}

				// Promise a held call will still execute
				heldCall = setTimeout( handler, throttle - diff );
			}
		},
		lastCall = 0,
		heldCall,
		curr,
		diff;
})();


$.each({
	scrollstop: "scrollstart",
	taphold: "tap",
	swipeleft: "swipe",
	swiperight: "swipe"
}, function( event, sourceEvent ) {

	$.event.special[ event ] = {
		setup: function() {
			$( this ).bind( sourceEvent, $.noop );
		}
	};
});

})( jQuery, this );
// Script: jQuery hashchange event
// 
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);
/*
* "page" plugin
*/

(function( $, undefined ) {

$.widget( "mobile.page", $.mobile.widget, {
	options: {
		theme: "c",
		domCache: false,
		keepNativeDefault: ":jqmData(role='none'), :jqmData(role='nojs')"
	},

	_create: function() {

		this._trigger( "beforecreate" );

		this.element
			.attr( "tabindex", "0" )
			.addClass( "ui-page ui-body-" + this.options.theme );
	},

	keepNativeSelector: function() {
		var options = this.options,
			keepNativeDefined = options.keepNative && $.trim(options.keepNative);

		if( keepNativeDefined && options.keepNative !== options.keepNativeDefault ){
			return [options.keepNative, options.keepNativeDefault].join(", ");
		}

		return options.keepNativeDefault;
	}
});
})( jQuery );
/* 
* "core" - The base file for jQm
*/

(function( $, window, undefined ) {

	var nsNormalizeDict = {};

	// jQuery.mobile configurable options
	$.extend( $.mobile, {

		// Namespace used framework-wide for data-attrs. Default is no namespace
		ns: "",

		// Define the url parameter used for referencing widget-generated sub-pages.
		// Translates to to example.html&ui-page=subpageIdentifier
		// hash segment before &ui-page= is used to make Ajax request
		subPageUrlKey: "ui-page",

		// Class assigned to page currently in view, and during transitions
		activePageClass: "ui-page-active",

		// Class used for "active" button state, from CSS framework
		activeBtnClass: "ui-btn-active",

		// Automatically handle clicks and form submissions through Ajax, when same-domain
		ajaxEnabled: true,

		// Automatically load and show pages based on location.hash
		hashListeningEnabled: true,

		// disable to prevent jquery from bothering with links
		linkBindingEnabled: true,

		// Set default page transition - 'none' for no transitions
		defaultPageTransition: "slide",

		// Minimum scroll distance that will be remembered when returning to a page
		minScrollBack: 250,

		// Set default dialog transition - 'none' for no transitions
		defaultDialogTransition: "pop",

		// Show loading message during Ajax requests
		// if false, message will not appear, but loading classes will still be toggled on html el
		loadingMessage: "loading",

		// Error response message - appears when an Ajax page request fails
		pageLoadErrorMessage: "Error Loading Page",

		//automatically initialize the DOM when it's ready
		autoInitializePage: true,

		pushStateEnabled: true,

		// turn of binding to the native orientationchange due to android orientation behavior
		orientationChangeEnabled: true,

		// Support conditions that must be met in order to proceed
		// default enhanced qualifications are media query support OR IE 7+
		gradeA: function(){
			return $.support.mediaquery || $.mobile.browser.ie && $.mobile.browser.ie >= 7;
		},

		// TODO might be useful upstream in jquery itself ?
		keyCode: {
			ALT: 18,
			BACKSPACE: 8,
			CAPS_LOCK: 20,
			COMMA: 188,
			COMMAND: 91,
			COMMAND_LEFT: 91, // COMMAND
			COMMAND_RIGHT: 93,
			CONTROL: 17,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			INSERT: 45,
			LEFT: 37,
			MENU: 93, // COMMAND_RIGHT
			NUMPAD_ADD: 107,
			NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111,
			NUMPAD_ENTER: 108,
			NUMPAD_MULTIPLY: 106,
			NUMPAD_SUBTRACT: 109,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SHIFT: 16,
			SPACE: 32,
			TAB: 9,
			UP: 38,
			WINDOWS: 91 // COMMAND
		},

		// Scroll page vertically: scroll to 0 to hide iOS address bar, or pass a Y value
		silentScroll: function( ypos ) {
			if ( $.type( ypos ) !== "number" ) {
				ypos = $.mobile.defaultHomeScroll;
			}

			// prevent scrollstart and scrollstop events
			$.event.special.scrollstart.enabled = false;

			setTimeout(function() {
				window.scrollTo( 0, ypos );
				$( document ).trigger( "silentscroll", { x: 0, y: ypos });
			}, 20 );

			setTimeout(function() {
				$.event.special.scrollstart.enabled = true;
			}, 150 );
		},

		// Expose our cache for testing purposes.
		nsNormalizeDict: nsNormalizeDict,

		// Take a data attribute property, prepend the namespace
		// and then camel case the attribute string. Add the result
		// to our nsNormalizeDict so we don't have to do this again.
		nsNormalize: function( prop ) {
			if ( !prop ) {
				return;
			}

			return nsNormalizeDict[ prop ] || ( nsNormalizeDict[ prop ] = $.camelCase( $.mobile.ns + prop ) );
		},

		getInheritedTheme: function( el, defaultTheme ) {

			// Find the closest parent with a theme class on it. Note that
			// we are not using $.fn.closest() on purpose here because this
			// method gets called quite a bit and we need it to be as fast
			// as possible.

			var e = el[ 0 ],
				ltr = "",
				re = /ui-(bar|body)-([a-z])\b/,
				c, m;

			while ( e ) {
				var c = e.className || "";
				if ( ( m = re.exec( c ) ) && ( ltr = m[ 2 ] ) ) {
					// We found a parent with a theme class
					// on it so bail from this loop.
					break;
				}
				e = e.parentNode;
			}
			
			// Return the theme letter we found, if none, return the
			// specified default.

			return ltr || defaultTheme || "a";
		}
	});

	// Mobile version of data and removeData and hasData methods
	// ensures all data is set and retrieved using jQuery Mobile's data namespace
	$.fn.jqmData = function( prop, value ) {
		var result;
		if ( typeof prop != "undefined" ) {
			result = this.data( prop ? $.mobile.nsNormalize( prop ) : prop, value );
		}
		return result;
	};

	$.jqmData = function( elem, prop, value ) {
		var result;
		if ( typeof prop != "undefined" ) {
			result = $.data( elem, prop ? $.mobile.nsNormalize( prop ) : prop, value );
		}
		return result;
	};

	$.fn.jqmRemoveData = function( prop ) {
		return this.removeData( $.mobile.nsNormalize( prop ) );
	};

	$.jqmRemoveData = function( elem, prop ) {
		return $.removeData( elem, $.mobile.nsNormalize( prop ) );
	};

	$.fn.removeWithDependents = function() {
		$.removeWithDependents( this );
	};

	$.removeWithDependents = function( elem ) {
		var $elem = $( elem );

		( $elem.jqmData('dependents') || $() ).remove();
		$elem.remove();
	};

	$.fn.addDependents = function( newDependents ) {
		$.addDependents( $(this), newDependents );
	};

	$.addDependents = function( elem, newDependents ) {
		var dependents = $(elem).jqmData( 'dependents' ) || $();

		$(elem).jqmData( 'dependents', $.merge(dependents, newDependents) );
	};

	// note that this helper doesn't attempt to handle the callback
	// or setting of an html elements text, its only purpose is
	// to return the html encoded version of the text in all cases. (thus the name)
	$.fn.getEncodedText = function() {
		return $( "<div/>" ).text( $(this).text() ).html();
	};

	// Monkey-patching Sizzle to filter the :jqmData selector
	var oldFind = $.find,
		jqmDataRE = /:jqmData\(([^)]*)\)/g;

	$.find = function( selector, context, ret, extra ) {
		selector = selector.replace( jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]" );

		return oldFind.call( this, selector, context, ret, extra );
	};

	$.extend( $.find, oldFind );

	$.find.matches = function( expr, set ) {
		return $.find( expr, null, null, set );
	};

	$.find.matchesSelector = function( node, expr ) {
		return $.find( expr, null, null, [ node ] ).length > 0;
	};
})( jQuery, this );

/*
* core utilities for auto ajax navigation, base tag mgmt,
*/

( function( $, undefined ) {

	//define vars for interal use
	var $window = $( window ),
		$html = $( 'html' ),
		$head = $( 'head' ),

		//url path helpers for use in relative url management
		path = {

			// This scary looking regular expression parses an absolute URL or its relative
			// variants (protocol, site, document, query, and hash), into the various
			// components (protocol, host, path, query, fragment, etc that make up the
			// URL as well as some other commonly used sub-parts. When used with RegExp.exec()
			// or String.match, it parses the URL into a results array that looks like this:
			//
			//     [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
			//     [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
			//     [2]: http://jblas:password@mycompany.com:8080/mail/inbox
			//     [3]: http://jblas:password@mycompany.com:8080
			//     [4]: http:
			//     [5]: //
			//     [6]: jblas:password@mycompany.com:8080
			//     [7]: jblas:password
			//     [8]: jblas
			//     [9]: password
			//    [10]: mycompany.com:8080
			//    [11]: mycompany.com
			//    [12]: 8080
			//    [13]: /mail/inbox
			//    [14]: /mail/
			//    [15]: inbox
			//    [16]: ?msg=1234&type=unread
			//    [17]: #msg-content
			//
			urlParseRE: /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,

			//Parse a URL into a structure that allows easy access to
			//all of the URL components by name.
			parseUrl: function( url ) {
				// If we're passed an object, we'll assume that it is
				// a parsed url object and just return it back to the caller.
				if ( $.type( url ) === "object" ) {
					return url;
				}

				var matches = path.urlParseRE.exec( url || "" ) || [];

					// Create an object that allows the caller to access the sub-matches
					// by name. Note that IE returns an empty string instead of undefined,
					// like all other browsers do, so we normalize everything so its consistent
					// no matter what browser we're running on.
					return {
						href:         matches[  0 ] || "",
						hrefNoHash:   matches[  1 ] || "",
						hrefNoSearch: matches[  2 ] || "",
						domain:       matches[  3 ] || "",
						protocol:     matches[  4 ] || "",
						doubleSlash:  matches[  5 ] || "",
						authority:    matches[  6 ] || "",
						username:     matches[  8 ] || "",
						password:     matches[  9 ] || "",
						host:         matches[ 10 ] || "",
						hostname:     matches[ 11 ] || "",
						port:         matches[ 12 ] || "",
						pathname:     matches[ 13 ] || "",
						directory:    matches[ 14 ] || "",
						filename:     matches[ 15 ] || "",
						search:       matches[ 16 ] || "",
						hash:         matches[ 17 ] || ""
					};
			},

			//Turn relPath into an asbolute path. absPath is
			//an optional absolute path which describes what
			//relPath is relative to.
			makePathAbsolute: function( relPath, absPath ) {
				if ( relPath && relPath.charAt( 0 ) === "/" ) {
					return relPath;
				}

				relPath = relPath || "";
				absPath = absPath ? absPath.replace( /^\/|(\/[^\/]*|[^\/]+)$/g, "" ) : "";

				var absStack = absPath ? absPath.split( "/" ) : [],
					relStack = relPath.split( "/" );
				for ( var i = 0; i < relStack.length; i++ ) {
					var d = relStack[ i ];
					switch ( d ) {
						case ".":
							break;
						case "..":
							if ( absStack.length ) {
								absStack.pop();
							}
							break;
						default:
							absStack.push( d );
							break;
					}
				}
				return "/" + absStack.join( "/" );
			},

			//Returns true if both urls have the same domain.
			isSameDomain: function( absUrl1, absUrl2 ) {
				return path.parseUrl( absUrl1 ).domain === path.parseUrl( absUrl2 ).domain;
			},

			//Returns true for any relative variant.
			isRelativeUrl: function( url ) {
				// All relative Url variants have one thing in common, no protocol.
				return path.parseUrl( url ).protocol === "";
			},

			//Returns true for an absolute url.
			isAbsoluteUrl: function( url ) {
				return path.parseUrl( url ).protocol !== "";
			},

			//Turn the specified realtive URL into an absolute one. This function
			//can handle all relative variants (protocol, site, document, query, fragment).
			makeUrlAbsolute: function( relUrl, absUrl ) {
				if ( !path.isRelativeUrl( relUrl ) ) {
					return relUrl;
				}

				var relObj = path.parseUrl( relUrl ),
					absObj = path.parseUrl( absUrl ),
					protocol = relObj.protocol || absObj.protocol,
					doubleSlash = relObj.protocol ? relObj.doubleSlash : ( relObj.doubleSlash || absObj.doubleSlash ),
					authority = relObj.authority || absObj.authority,
					hasPath = relObj.pathname !== "",
					pathname = path.makePathAbsolute( relObj.pathname || absObj.filename, absObj.pathname ),
					search = relObj.search || ( !hasPath && absObj.search ) || "",
					hash = relObj.hash;

				return protocol + doubleSlash + authority + pathname + search + hash;
			},

			//Add search (aka query) params to the specified url.
			addSearchParams: function( url, params ) {
				var u = path.parseUrl( url ),
					p = ( typeof params === "object" ) ? $.param( params ) : params,
					s = u.search || "?";
				return u.hrefNoSearch + s + ( s.charAt( s.length - 1 ) !== "?" ? "&" : "" ) + p + ( u.hash || "" );
			},

			convertUrlToDataUrl: function( absUrl ) {
				var u = path.parseUrl( absUrl );
				if ( path.isEmbeddedPage( u ) ) {
				    // For embedded pages, remove the dialog hash key as in getFilePath(),
				    // otherwise the Data Url won't match the id of the embedded Page.
					return u.hash.split( dialogHashKey )[0].replace( /^#/, "" );
				} else if ( path.isSameDomain( u, documentBase ) ) {
					return u.hrefNoHash.replace( documentBase.domain, "" );
				}
				return absUrl;
			},

			//get path from current hash, or from a file path
			get: function( newPath ) {
				if( newPath === undefined ) {
					newPath = location.hash;
				}
				return path.stripHash( newPath ).replace( /[^\/]*\.[^\/*]+$/, '' );
			},

			//return the substring of a filepath before the sub-page key, for making a server request
			getFilePath: function( path ) {
				var splitkey = '&' + $.mobile.subPageUrlKey;
				return path && path.split( splitkey )[0].split( dialogHashKey )[0];
			},

			//set location hash to path
			set: function( path ) {
				location.hash = path;
			},

			//test if a given url (string) is a path
			//NOTE might be exceptionally naive
			isPath: function( url ) {
				return ( /\// ).test( url );
			},

			//return a url path with the window's location protocol/hostname/pathname removed
			clean: function( url ) {
				return url.replace( documentBase.domain, "" );
			},

			//just return the url without an initial #
			stripHash: function( url ) {
				return url.replace( /^#/, "" );
			},

			//remove the preceding hash, any query params, and dialog notations
			cleanHash: function( hash ) {
				return path.stripHash( hash.replace( /\?.*$/, "" ).replace( dialogHashKey, "" ) );
			},

			//check whether a url is referencing the same domain, or an external domain or different protocol
			//could be mailto, etc
			isExternal: function( url ) {
				var u = path.parseUrl( url );
				return u.protocol && u.domain !== documentUrl.domain ? true : false;
			},

			hasProtocol: function( url ) {
				return ( /^(:?\w+:)/ ).test( url );
			},

			//check if the specified url refers to the first page in the main application document.
			isFirstPageUrl: function( url ) {
				// We only deal with absolute paths.
				var u = path.parseUrl( path.makeUrlAbsolute( url, documentBase ) ),

					// Does the url have the same path as the document?
					samePath = u.hrefNoHash === documentUrl.hrefNoHash || ( documentBaseDiffers && u.hrefNoHash === documentBase.hrefNoHash ),

					// Get the first page element.
					fp = $.mobile.firstPage,

					// Get the id of the first page element if it has one.
					fpId = fp && fp[0] ? fp[0].id : undefined;

					// The url refers to the first page if the path matches the document and
					// it either has no hash value, or the hash is exactly equal to the id of the
					// first page element.
					return samePath && ( !u.hash || u.hash === "#" || ( fpId && u.hash.replace( /^#/, "" ) === fpId ) );
			},

			isEmbeddedPage: function( url ) {
				var u = path.parseUrl( url );

				//if the path is absolute, then we need to compare the url against
				//both the documentUrl and the documentBase. The main reason for this
				//is that links embedded within external documents will refer to the
				//application document, whereas links embedded within the application
				//document will be resolved against the document base.
				if ( u.protocol !== "" ) {
					return ( u.hash && ( u.hrefNoHash === documentUrl.hrefNoHash || ( documentBaseDiffers && u.hrefNoHash === documentBase.hrefNoHash ) ) );
				}
				return (/^#/).test( u.href );
			}
		},

		//will be defined when a link is clicked and given an active class
		$activeClickedLink = null,

		//urlHistory is purely here to make guesses at whether the back or forward button was clicked
		//and provide an appropriate transition
		urlHistory = {
			// Array of pages that are visited during a single page load.
			// Each has a url and optional transition, title, and pageUrl (which represents the file path, in cases where URL is obscured, such as dialogs)
			stack: [],

			//maintain an index number for the active page in the stack
			activeIndex: 0,

			//get active
			getActive: function() {
				return urlHistory.stack[ urlHistory.activeIndex ];
			},

			getPrev: function() {
				return urlHistory.stack[ urlHistory.activeIndex - 1 ];
			},

			getNext: function() {
				return urlHistory.stack[ urlHistory.activeIndex + 1 ];
			},

			// addNew is used whenever a new page is added
			addNew: function( url, transition, title, pageUrl, role ) {
				//if there's forward history, wipe it
				if( urlHistory.getNext() ) {
					urlHistory.clearForward();
				}

				urlHistory.stack.push( {url : url, transition: transition, title: title, pageUrl: pageUrl, role: role } );

				urlHistory.activeIndex = urlHistory.stack.length - 1;
			},

			//wipe urls ahead of active index
			clearForward: function() {
				urlHistory.stack = urlHistory.stack.slice( 0, urlHistory.activeIndex + 1 );
			},

			directHashChange: function( opts ) {
				var back , forward, newActiveIndex, prev = this.getActive();

				// check if url isp in history and if it's ahead or behind current page
				$.each( urlHistory.stack, function( i, historyEntry ) {

					//if the url is in the stack, it's a forward or a back
					if( opts.currentUrl === historyEntry.url ) {
						//define back and forward by whether url is older or newer than current page
						back = i < urlHistory.activeIndex;
						forward = !back;
						newActiveIndex = i;
					}
				});

				// save new page index, null check to prevent falsey 0 result
				this.activeIndex = newActiveIndex !== undefined ? newActiveIndex : this.activeIndex;

				if( back ) {
					( opts.either || opts.isBack )( true );
				} else if( forward ) {
					( opts.either || opts.isForward )( false );
				}
			},

			//disable hashchange event listener internally to ignore one change
			//toggled internally when location.hash is updated to match the url of a successful page load
			ignoreNextHashChange: false
		},

		//define first selector to receive focus when a page is shown
		focusable = "[tabindex],a,button:visible,select:visible,input",

		//queue to hold simultanious page transitions
		pageTransitionQueue = [],

		//indicates whether or not page is in process of transitioning
		isPageTransitioning = false,

		//nonsense hash change key for dialogs, so they create a history entry
		dialogHashKey = "&ui-state=dialog",

		//existing base tag?
		$base = $head.children( "base" ),

		//tuck away the original document URL minus any fragment.
		documentUrl = path.parseUrl( location.href ),

		//if the document has an embedded base tag, documentBase is set to its
		//initial value. If a base tag does not exist, then we default to the documentUrl.
		documentBase = $base.length ? path.parseUrl( path.makeUrlAbsolute( $base.attr( "href" ), documentUrl.href ) ) : documentUrl,

		//cache the comparison once.
		documentBaseDiffers = ( documentUrl.hrefNoHash !== documentBase.hrefNoHash );

		//base element management, defined depending on dynamic base tag support
		var base = $.support.dynamicBaseTag ? {

			//define base element, for use in routing asset urls that are referenced in Ajax-requested markup
			element: ( $base.length ? $base : $( "<base>", { href: documentBase.hrefNoHash } ).prependTo( $head ) ),

			//set the generated BASE element's href attribute to a new page's base path
			set: function( href ) {
				base.element.attr( "href", path.makeUrlAbsolute( href, documentBase ) );
			},

			//set the generated BASE element's href attribute to a new page's base path
			reset: function() {
				base.element.attr( "href", documentBase.hrefNoHash );
			}

		} : undefined;

/*
	internal utility functions
--------------------------------------*/


	//direct focus to the page title, or otherwise first focusable element
	function reFocus( page ) {
		var pageTitle = page.find( ".ui-title:eq(0)" );

		if( pageTitle.length ) {
			pageTitle.focus();
		}
		else{
			page.focus();
		}
	}

	//remove active classes after page transition or error
	function removeActiveLinkClass( forceRemoval ) {
		if( !!$activeClickedLink && ( !$activeClickedLink.closest( '.ui-page-active' ).length || forceRemoval ) ) {
			$activeClickedLink.removeClass( $.mobile.activeBtnClass );
		}
		$activeClickedLink = null;
	}

	function releasePageTransitionLock() {
		isPageTransitioning = false;
		if( pageTransitionQueue.length > 0 ) {
			$.mobile.changePage.apply( null, pageTransitionQueue.pop() );
		}
	}

	// Save the last scroll distance per page, before it is hidden
	var setLastScrollEnabled = true,
		firstScrollElem, getScrollElem, setLastScroll, delayedSetLastScroll;

	getScrollElem = function() {
		var scrollElem = $window, activePage,
			touchOverflow = $.support.touchOverflow && $.mobile.touchOverflowEnabled;

		if( touchOverflow ){
			activePage = $( ".ui-page-active" );
			scrollElem = activePage.is( ".ui-native-fixed" ) ? activePage.find( ".ui-content" ) : activePage;
		}

		return scrollElem;
	};

	setLastScroll = function( scrollElem ) {
		// this barrier prevents setting the scroll value based on the browser
		// scrolling the window based on a hashchange
		if( !setLastScrollEnabled ) {
			return;
		}

		var active = $.mobile.urlHistory.getActive();

		if( active ) {
			var lastScroll = scrollElem && scrollElem.scrollTop();

			// Set active page's lastScroll prop.
			// If the location we're scrolling to is less than minScrollBack, let it go.
			active.lastScroll = lastScroll < $.mobile.minScrollBack ? $.mobile.defaultHomeScroll : lastScroll;
		}
	};

	// bind to scrollstop to gather scroll position. The delay allows for the hashchange
	// event to fire and disable scroll recording in the case where the browser scrolls
	// to the hash targets location (sometimes the top of the page). once pagechange fires
	// getLastScroll is again permitted to operate
	delayedSetLastScroll = function() {
		setTimeout( setLastScroll, 100, $(this) );
	};

	// disable an scroll setting when a hashchange has been fired, this only works
	// because the recording of the scroll position is delayed for 100ms after
	// the browser might have changed the position because of the hashchange
	$window.bind( $.support.pushState ? "popstate" : "hashchange", function() {
	 	setLastScrollEnabled = false;
	});

	// handle initial hashchange from chrome :(
	$window.one( $.support.pushState ? "popstate" : "hashchange", function() {
		setLastScrollEnabled = true;
	});

	// wait until the mobile page container has been determined to bind to pagechange
	$window.one( "pagecontainercreate", function(){
		// once the page has changed, re-enable the scroll recording
		$.mobile.pageContainer.bind( "pagechange", function() {
			var scrollElem = getScrollElem();

	 		setLastScrollEnabled = true;

			// remove any binding that previously existed on the get scroll
			// which may or may not be different than the scroll element determined for
			// this page previously
			scrollElem.unbind( "scrollstop", delayedSetLastScroll );

			// determine and bind to the current scoll element which may be the window
			// or in the case of touch overflow the element with touch overflow
			scrollElem.bind( "scrollstop", delayedSetLastScroll );
		});
	});

	// bind to scrollstop for the first page as "pagechange" won't be fired in that case
	getScrollElem().bind( "scrollstop", delayedSetLastScroll );

	// Make the iOS clock quick-scroll work again if we're using native overflow scrolling
	/*
	if( $.support.touchOverflow ){
		if( $.mobile.touchOverflowEnabled ){
			$( window ).bind( "scrollstop", function(){
				if( $( this ).scrollTop() === 0 ){
					$.mobile.activePage.scrollTop( 0 );
				}
			});
		}
	}
	*/

	//function for transitioning between two existing pages
	function transitionPages( toPage, fromPage, transition, reverse ) {

		//get current scroll distance
		var active	= $.mobile.urlHistory.getActive(),
			touchOverflow = $.support.touchOverflow && $.mobile.touchOverflowEnabled,
			toScroll = active.lastScroll || ( touchOverflow ? 0 : $.mobile.defaultHomeScroll ),
			screenHeight = getScreenHeight();

		// Scroll to top, hide addr bar
		window.scrollTo( 0, $.mobile.defaultHomeScroll );

		if( fromPage ) {
			//trigger before show/hide events
			fromPage.data( "page" )._trigger( "beforehide", null, { nextPage: toPage } );
		}

		if( !touchOverflow){
			toPage.height( screenHeight + toScroll );
		}

		toPage.data( "page" )._trigger( "beforeshow", null, { prevPage: fromPage || $( "" ) } );

		//clear page loader
		$.mobile.hidePageLoadingMsg();

		if( touchOverflow && toScroll ){

			toPage.addClass( "ui-mobile-pre-transition" );
			// Send focus to page as it is now display: block
			reFocus( toPage );

			//set page's scrollTop to remembered distance
			if( toPage.is( ".ui-native-fixed" ) ){
				toPage.find( ".ui-content" ).scrollTop( toScroll );
			}
			else{
				toPage.scrollTop( toScroll );
			}
		}

		//find the transition handler for the specified transition. If there
		//isn't one in our transitionHandlers dictionary, use the default one.
		//call the handler immediately to kick-off the transition.
		var th = $.mobile.transitionHandlers[transition || "none"] || $.mobile.defaultTransitionHandler,
			promise = th( transition, reverse, toPage, fromPage );

		promise.done(function() {
			//reset toPage height back
			if( !touchOverflow ){
				toPage.height( "" );
				// Send focus to the newly shown page
				reFocus( toPage );
			}

			// Jump to top or prev scroll, sometimes on iOS the page has not rendered yet.
			if( !touchOverflow ){
				$.mobile.silentScroll( toScroll );
			}

			//trigger show/hide events
			if( fromPage ) {
				if( !touchOverflow ){
					fromPage.height( "" );
				}

				fromPage.data( "page" )._trigger( "hide", null, { nextPage: toPage } );
			}

			//trigger pageshow, define prevPage as either fromPage or empty jQuery obj
			toPage.data( "page" )._trigger( "show", null, { prevPage: fromPage || $( "" ) } );
		});

		return promise;
	}

	//simply set the active page's minimum height to screen height, depending on orientation
	function getScreenHeight(){
		var orientation 	= $.event.special.orientationchange.orientation(),
			port			= orientation === "portrait",
			winMin			= port ? 480 : 320,
			screenHeight	= port ? screen.availHeight : screen.availWidth,
			winHeight		= Math.max( winMin, $( window ).height() ),
			pageMin			= Math.min( screenHeight, winHeight );

		return pageMin;
	}

	$.mobile.getScreenHeight = getScreenHeight;

	//simply set the active page's minimum height to screen height, depending on orientation
	function resetActivePageHeight(){
		// Don't apply this height in touch overflow enabled mode
		if( $.support.touchOverflow && $.mobile.touchOverflowEnabled ){
			return;
		}
		$( "." + $.mobile.activePageClass ).css( "min-height", getScreenHeight() );
	}

	//shared page enhancements
	function enhancePage( $page, role ) {
		// If a role was specified, make sure the data-role attribute
		// on the page element is in sync.
		if( role ) {
			$page.attr( "data-" + $.mobile.ns + "role", role );
		}

		//run page plugin
		$page.page();
	}

/* exposed $.mobile methods	 */

	//animation complete callback
	$.fn.animationComplete = function( callback ) {
		if( $.support.cssTransitions ) {
			return $( this ).one( 'webkitAnimationEnd', callback );
		}
		else{
			// defer execution for consistency between webkit/non webkit
			setTimeout( callback, 0 );
			return $( this );
		}
	};

	//expose path object on $.mobile
	$.mobile.path = path;

	//expose base object on $.mobile
	$.mobile.base = base;

	//history stack
	$.mobile.urlHistory = urlHistory;

	$.mobile.dialogHashKey = dialogHashKey;

	//default non-animation transition handler
	$.mobile.noneTransitionHandler = function( name, reverse, $toPage, $fromPage ) {
		if ( $fromPage ) {
			$fromPage.removeClass( $.mobile.activePageClass );
		}
		$toPage.addClass( $.mobile.activePageClass );

		return $.Deferred().resolve( name, reverse, $toPage, $fromPage ).promise();
	};

	//default handler for unknown transitions
	$.mobile.defaultTransitionHandler = $.mobile.noneTransitionHandler;

	//transition handler dictionary for 3rd party transitions
	$.mobile.transitionHandlers = {
		none: $.mobile.defaultTransitionHandler
	};

	//enable cross-domain page support
	$.mobile.allowCrossDomainPages = false;

	//return the original document url
	$.mobile.getDocumentUrl = function(asParsedObject) {
		return asParsedObject ? $.extend( {}, documentUrl ) : documentUrl.href;
	};

	//return the original document base url
	$.mobile.getDocumentBase = function(asParsedObject) {
		return asParsedObject ? $.extend( {}, documentBase ) : documentBase.href;
	};

	$.mobile._bindPageRemove = function() {
		var page = $(this);

		// when dom caching is not enabled or the page is embedded bind to remove the page on hide
		if( !page.data("page").options.domCache
				&& page.is(":jqmData(external-page='true')") ) {

			page.bind( 'pagehide.remove', function() {
				var $this = $( this ),
					prEvent = new $.Event( "pageremove" );

				$this.trigger( prEvent );

				if( !prEvent.isDefaultPrevented() ){
					$this.removeWithDependents();
				}
			});
		}
	};

	// Load a page into the DOM.
	$.mobile.loadPage = function( url, options ) {
		// This function uses deferred notifications to let callers
		// know when the page is done loading, or if an error has occurred.
		var deferred = $.Deferred(),

			// The default loadPage options with overrides specified by
			// the caller.
			settings = $.extend( {}, $.mobile.loadPage.defaults, options ),

			// The DOM element for the page after it has been loaded.
			page = null,

			// If the reloadPage option is true, and the page is already
			// in the DOM, dupCachedPage will be set to the page element
			// so that it can be removed after the new version of the
			// page is loaded off the network.
			dupCachedPage = null,

			// determine the current base url
			findBaseWithDefault = function(){
				var closestBase = ( $.mobile.activePage && getClosestBaseUrl( $.mobile.activePage ) );
				return closestBase || documentBase.hrefNoHash;
			},

			// The absolute version of the URL passed into the function. This
			// version of the URL may contain dialog/subpage params in it.
			absUrl = path.makeUrlAbsolute( url, findBaseWithDefault() );


		// If the caller provided data, and we're using "get" request,
		// append the data to the URL.
		if ( settings.data && settings.type === "get" ) {
			absUrl = path.addSearchParams( absUrl, settings.data );
			settings.data = undefined;
		}

		// If the caller is using a "post" request, reloadPage must be true
		if(  settings.data && settings.type === "post" ){
			settings.reloadPage = true;
		}

			// The absolute version of the URL minus any dialog/subpage params.
			// In otherwords the real URL of the page to be loaded.
		var fileUrl = path.getFilePath( absUrl ),

			// The version of the Url actually stored in the data-url attribute of
			// the page. For embedded pages, it is just the id of the page. For pages
			// within the same domain as the document base, it is the site relative
			// path. For cross-domain pages (Phone Gap only) the entire absolute Url
			// used to load the page.
			dataUrl = path.convertUrlToDataUrl( absUrl );

		// Make sure we have a pageContainer to work with.
		settings.pageContainer = settings.pageContainer || $.mobile.pageContainer;

		// Check to see if the page already exists in the DOM.
		page = settings.pageContainer.children( ":jqmData(url='" + dataUrl + "')" );

		// If we failed to find the page, check to see if the url is a
		// reference to an embedded page. If so, it may have been dynamically
		// injected by a developer, in which case it would be lacking a data-url
		// attribute and in need of enhancement.
		if ( page.length === 0 && dataUrl && !path.isPath( dataUrl ) ) {
			page = settings.pageContainer.children( "#" + dataUrl )
				.attr( "data-" + $.mobile.ns + "url", dataUrl );
		}

		// If we failed to find a page in the DOM, check the URL to see if it
		// refers to the first page in the application. If it isn't a reference
		// to the first page and refers to non-existent embedded page, error out.
		if ( page.length === 0 ) {
			if ( $.mobile.firstPage && path.isFirstPageUrl( fileUrl ) ) {
				// Check to make sure our cached-first-page is actually
				// in the DOM. Some user deployed apps are pruning the first
				// page from the DOM for various reasons, we check for this
				// case here because we don't want a first-page with an id
				// falling through to the non-existent embedded page error
				// case. If the first-page is not in the DOM, then we let
				// things fall through to the ajax loading code below so
				// that it gets reloaded.
				if ( $.mobile.firstPage.parent().length ) {
					page = $( $.mobile.firstPage );
				}
			} else if ( path.isEmbeddedPage( fileUrl )  ) {
				deferred.reject( absUrl, options );
				return deferred.promise();
			}
		}

		// Reset base to the default document base.
		if ( base ) {
			base.reset();
		}

		// If the page we are interested in is already in the DOM,
		// and the caller did not indicate that we should force a
		// reload of the file, we are done. Otherwise, track the
		// existing page as a duplicated.
		if ( page.length ) {
			if ( !settings.reloadPage ) {
				enhancePage( page, settings.role );
				deferred.resolve( absUrl, options, page );
				return deferred.promise();
			}
			dupCachedPage = page;
		}

		var mpc = settings.pageContainer,
			pblEvent = new $.Event( "pagebeforeload" ),
			triggerData = { url: url, absUrl: absUrl, dataUrl: dataUrl, deferred: deferred, options: settings };

		// Let listeners know we're about to load a page.
		mpc.trigger( pblEvent, triggerData );

		// If the default behavior is prevented, stop here!
		if( pblEvent.isDefaultPrevented() ){
			return deferred.promise();
		}

		if ( settings.showLoadMsg ) {

			// This configurable timeout allows cached pages a brief delay to load without showing a message
			var loadMsgDelay = setTimeout(function(){
					$.mobile.showPageLoadingMsg();
				}, settings.loadMsgDelay ),

				// Shared logic for clearing timeout and removing message.
				hideMsg = function(){

					// Stop message show timer
					clearTimeout( loadMsgDelay );

					// Hide loading message
					$.mobile.hidePageLoadingMsg();
				};
		}

		if ( !( $.mobile.allowCrossDomainPages || path.isSameDomain( documentUrl, absUrl ) ) ) {
			deferred.reject( absUrl, options );
		} else {
			// Load the new page.
			$.ajax({
				url: fileUrl,
				type: settings.type,
				data: settings.data,
				dataType: "html",
				success: function( html, textStatus, xhr ) {
					//pre-parse html to check for a data-url,
					//use it as the new fileUrl, base path, etc
					var all = $( "<div></div>" ),

						//page title regexp
						newPageTitle = html.match( /<title[^>]*>([^<]*)/ ) && RegExp.$1,

						// TODO handle dialogs again
						pageElemRegex = new RegExp( "(<[^>]+\\bdata-" + $.mobile.ns + "role=[\"']?page[\"']?[^>]*>)" ),
						dataUrlRegex = new RegExp( "\\bdata-" + $.mobile.ns + "url=[\"']?([^\"'>]*)[\"']?" );


					// data-url must be provided for the base tag so resource requests can be directed to the
					// correct url. loading into a temprorary element makes these requests immediately
					if( pageElemRegex.test( html )
							&& RegExp.$1
							&& dataUrlRegex.test( RegExp.$1 )
							&& RegExp.$1 ) {
						url = fileUrl = path.getFilePath( RegExp.$1 );
					}

					if ( base ) {
						base.set( fileUrl );
					}

					//workaround to allow scripts to execute when included in page divs
					all.get( 0 ).innerHTML = html;
					page = all.find( ":jqmData(role='page'), :jqmData(role='dialog')" ).first();

					//if page elem couldn't be found, create one and insert the body element's contents
					if( !page.length ){
						page = $( "<div data-" + $.mobile.ns + "role='page'>" + html.split( /<\/?body[^>]*>/gmi )[1] + "</div>" );
					}

					if ( newPageTitle && !page.jqmData( "title" ) ) {
						if ( ~newPageTitle.indexOf( "&" ) ) {
							newPageTitle = $( "<div>" + newPageTitle + "</div>" ).text();
						}
						page.jqmData( "title", newPageTitle );
					}

					//rewrite src and href attrs to use a base url
					if( !$.support.dynamicBaseTag ) {
						var newPath = path.get( fileUrl );
						page.find( "[src], link[href], a[rel='external'], :jqmData(ajax='false'), a[target]" ).each(function() {
							var thisAttr = $( this ).is( '[href]' ) ? 'href' :
									$(this).is('[src]') ? 'src' : 'action',
								thisUrl = $( this ).attr( thisAttr );

							// XXX_jblas: We need to fix this so that it removes the document
							//            base URL, and then prepends with the new page URL.
							//if full path exists and is same, chop it - helps IE out
							thisUrl = thisUrl.replace( location.protocol + '//' + location.host + location.pathname, '' );

							if( !/^(\w+:|#|\/)/.test( thisUrl ) ) {
								$( this ).attr( thisAttr, newPath + thisUrl );
							}
						});
					}

					//append to page and enhance
					// TODO taging a page with external to make sure that embedded pages aren't removed
					//      by the various page handling code is bad. Having page handling code in many
					//      places is bad. Solutions post 1.0
					page
						.attr( "data-" + $.mobile.ns + "url", path.convertUrlToDataUrl( fileUrl ) )
						.attr( "data-" + $.mobile.ns + "external-page", true )
						.appendTo( settings.pageContainer );

					// wait for page creation to leverage options defined on widget
					page.one( 'pagecreate', $.mobile._bindPageRemove );

					enhancePage( page, settings.role );

					// Enhancing the page may result in new dialogs/sub pages being inserted
					// into the DOM. If the original absUrl refers to a sub-page, that is the
					// real page we are interested in.
					if ( absUrl.indexOf( "&" + $.mobile.subPageUrlKey ) > -1 ) {
						page = settings.pageContainer.children( ":jqmData(url='" + dataUrl + "')" );
					}

					//bind pageHide to removePage after it's hidden, if the page options specify to do so

					// Remove loading message.
					if ( settings.showLoadMsg ) {
						hideMsg();
					}

					// Add the page reference and xhr to our triggerData.
					triggerData.xhr = xhr;
					triggerData.textStatus = textStatus;
					triggerData.page = page;

					// Let listeners know the page loaded successfully.
					settings.pageContainer.trigger( "pageload", triggerData );

					deferred.resolve( absUrl, options, page, dupCachedPage );
				},
				error: function( xhr, textStatus, errorThrown ) {
					//set base back to current path
					if( base ) {
						base.set( path.get() );
					}

					// Add error info to our triggerData.
					triggerData.xhr = xhr;
					triggerData.textStatus = textStatus;
					triggerData.errorThrown = errorThrown;

					var plfEvent = new $.Event( "pageloadfailed" );

					// Let listeners know the page load failed.
					settings.pageContainer.trigger( plfEvent, triggerData );

					// If the default behavior is prevented, stop here!
					// Note that it is the responsibility of the listener/handler
					// that called preventDefault(), to resolve/reject the
					// deferred object within the triggerData.
					if( plfEvent.isDefaultPrevented() ){
						return;
					}

					// Remove loading message.
					if ( settings.showLoadMsg ) {

						// Remove loading message.
						hideMsg();

						//show error message
						$( "<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>"+ $.mobile.pageLoadErrorMessage +"</h1></div>" )
							.css({ "display": "block", "opacity": 0.96, "top": $window.scrollTop() + 100 })
							.appendTo( settings.pageContainer )
							.delay( 800 )
							.fadeOut( 400, function() {
								$( this ).remove();
							});
					}

					deferred.reject( absUrl, options );
				}
			});
		}

		return deferred.promise();
	};

	$.mobile.loadPage.defaults = {
		type: "get",
		data: undefined,
		reloadPage: false,
		role: undefined, // By default we rely on the role defined by the @data-role attribute.
		showLoadMsg: false,
		pageContainer: undefined,
		loadMsgDelay: 50 // This delay allows loads that pull from browser cache to occur without showing the loading message.
	};

	// Show a specific page in the page container.
	$.mobile.changePage = function( toPage, options ) {
		// If we are in the midst of a transition, queue the current request.
		// We'll call changePage() once we're done with the current transition to
		// service the request.
		if( isPageTransitioning ) {
			pageTransitionQueue.unshift( arguments );
			return;
		}

		var settings = $.extend( {}, $.mobile.changePage.defaults, options );

		// Make sure we have a pageContainer to work with.
		settings.pageContainer = settings.pageContainer || $.mobile.pageContainer;

		// Make sure we have a fromPage.
		settings.fromPage = settings.fromPage || $.mobile.activePage;

		var mpc = settings.pageContainer,
			pbcEvent = new $.Event( "pagebeforechange" ),
			triggerData = { toPage: toPage, options: settings };

		// Let listeners know we're about to change the current page.
		mpc.trigger( pbcEvent, triggerData );

		// If the default behavior is prevented, stop here!
		if( pbcEvent.isDefaultPrevented() ){
			return;
		}

		// We allow "pagebeforechange" observers to modify the toPage in the trigger
		// data to allow for redirects. Make sure our toPage is updated.

		toPage = triggerData.toPage;

		// Set the isPageTransitioning flag to prevent any requests from
		// entering this method while we are in the midst of loading a page
		// or transitioning.

		isPageTransitioning = true;

		// If the caller passed us a url, call loadPage()
		// to make sure it is loaded into the DOM. We'll listen
		// to the promise object it returns so we know when
		// it is done loading or if an error ocurred.
		if ( typeof toPage == "string" ) {
			$.mobile.loadPage( toPage, settings )
				.done(function( url, options, newPage, dupCachedPage ) {
					isPageTransitioning = false;
					options.duplicateCachedPage = dupCachedPage;
					$.mobile.changePage( newPage, options );
				})
				.fail(function( url, options ) {
					isPageTransitioning = false;

					//clear out the active button state
					removeActiveLinkClass( true );

					//release transition lock so navigation is free again
					releasePageTransitionLock();
					settings.pageContainer.trigger( "pagechangefailed", triggerData );
				});
			return;
		}

		// If we are going to the first-page of the application, we need to make
		// sure settings.dataUrl is set to the application document url. This allows
		// us to avoid generating a document url with an id hash in the case where the
		// first-page of the document has an id attribute specified.
		if ( toPage[ 0 ] === $.mobile.firstPage[ 0 ] && !settings.dataUrl ) {
			settings.dataUrl = documentUrl.hrefNoHash;
		}

		// The caller passed us a real page DOM element. Update our
		// internal state and then trigger a transition to the page.
		var fromPage = settings.fromPage,
			url = ( settings.dataUrl && path.convertUrlToDataUrl( settings.dataUrl ) ) || toPage.jqmData( "url" ),
			// The pageUrl var is usually the same as url, except when url is obscured as a dialog url. pageUrl always contains the file path
			pageUrl = url,
			fileUrl = path.getFilePath( url ),
			active = urlHistory.getActive(),
			activeIsInitialPage = urlHistory.activeIndex === 0,
			historyDir = 0,
			pageTitle = document.title,
			isDialog = settings.role === "dialog" || toPage.jqmData( "role" ) === "dialog";

		// By default, we prevent changePage requests when the fromPage and toPage
		// are the same element, but folks that generate content manually/dynamically
		// and reuse pages want to be able to transition to the same page. To allow
		// this, they will need to change the default value of allowSamePageTransition
		// to true, *OR*, pass it in as an option when they manually call changePage().
		// It should be noted that our default transition animations assume that the
		// formPage and toPage are different elements, so they may behave unexpectedly.
		// It is up to the developer that turns on the allowSamePageTransitiona option
		// to either turn off transition animations, or make sure that an appropriate
		// animation transition is used.
		if( fromPage && fromPage[0] === toPage[0] && !settings.allowSamePageTransition ) {
			isPageTransitioning = false;
			mpc.trigger( "pagechange", triggerData );
			return;
		}

		// We need to make sure the page we are given has already been enhanced.
		enhancePage( toPage, settings.role );

		// If the changePage request was sent from a hashChange event, check to see if the
		// page is already within the urlHistory stack. If so, we'll assume the user hit
		// the forward/back button and will try to match the transition accordingly.
		if( settings.fromHashChange ) {
			urlHistory.directHashChange({
				currentUrl:	url,
				isBack:		function() { historyDir = -1; },
				isForward:	function() { historyDir = 1; }
			});
		}

		// Kill the keyboard.
		// XXX_jblas: We need to stop crawling the entire document to kill focus. Instead,
		//            we should be tracking focus with a live() handler so we already have
		//            the element in hand at this point.
		// Wrap this in a try/catch block since IE9 throw "Unspecified error" if document.activeElement
		// is undefined when we are in an IFrame.
		try {
			if(document.activeElement && document.activeElement.nodeName.toLowerCase() != 'body') {
				$(document.activeElement).blur();
			} else {
				$( "input:focus, textarea:focus, select:focus" ).blur();
			}
		} catch(e) {}

		// If we're displaying the page as a dialog, we don't want the url
		// for the dialog content to be used in the hash. Instead, we want
		// to append the dialogHashKey to the url of the current page.
		if ( isDialog && active ) {
			// on the initial page load active.url is undefined and in that case should
			// be an empty string. Moving the undefined -> empty string back into
			// urlHistory.addNew seemed imprudent given undefined better represents
			// the url state
			url = ( active.url || "" ) + dialogHashKey;
		}

		// Set the location hash.
		if( settings.changeHash !== false && url ) {
			//disable hash listening temporarily
			urlHistory.ignoreNextHashChange = true;
			//update hash and history
			path.set( url );
		}

		// if title element wasn't found, try the page div data attr too
		// If this is a deep-link or a reload ( active === undefined ) then just use pageTitle
		var newPageTitle = ( !active )? pageTitle : toPage.jqmData( "title" ) || toPage.children(":jqmData(role='header')").find(".ui-title" ).getEncodedText();
		if( !!newPageTitle && pageTitle == document.title ) {
			pageTitle = newPageTitle;
		}
		if ( !toPage.jqmData( "title" ) ) {
			toPage.jqmData( "title", pageTitle );
		}

		// Make sure we have a transition defined.
		settings.transition = settings.transition
			|| ( ( historyDir && !activeIsInitialPage ) ? active.transition : undefined )
			|| ( isDialog ? $.mobile.defaultDialogTransition : $.mobile.defaultPageTransition );

		//add page to history stack if it's not back or forward
		if( !historyDir ) {
			urlHistory.addNew( url, settings.transition, pageTitle, pageUrl, settings.role );
		}

		//set page title
		document.title = urlHistory.getActive().title;

		//set "toPage" as activePage
		$.mobile.activePage = toPage;

		// If we're navigating back in the URL history, set reverse accordingly.
		settings.reverse = settings.reverse || historyDir < 0;

		transitionPages( toPage, fromPage, settings.transition, settings.reverse )
			.done(function() {
				removeActiveLinkClass();

				//if there's a duplicateCachedPage, remove it from the DOM now that it's hidden
				if ( settings.duplicateCachedPage ) {
					settings.duplicateCachedPage.remove();
				}

				//remove initial build class (only present on first pageshow)
				$html.removeClass( "ui-mobile-rendering" );

				releasePageTransitionLock();

				// Let listeners know we're all done changing the current page.
				mpc.trigger( "pagechange", triggerData );
			});
	};

	$.mobile.changePage.defaults = {
		transition: undefined,
		reverse: false,
		changeHash: true,
		fromHashChange: false,
		role: undefined, // By default we rely on the role defined by the @data-role attribute.
		duplicateCachedPage: undefined,
		pageContainer: undefined,
		showLoadMsg: true, //loading message shows by default when pages are being fetched during changePage
		dataUrl: undefined,
		fromPage: undefined,
		allowSamePageTransition: false
	};

/* Event Bindings - hashchange, submit, and click */
	function findClosestLink( ele )
	{
		while ( ele ) {
			// Look for the closest element with a nodeName of "a".
			// Note that we are checking if we have a valid nodeName
			// before attempting to access it. This is because the
			// node we get called with could have originated from within
			// an embedded SVG document where some symbol instance elements
			// don't have nodeName defined on them, or strings are of type
			// SVGAnimatedString.
			if ( ( typeof ele.nodeName === "string" ) && ele.nodeName.toLowerCase() == "a" ) {
				break;
			}
			ele = ele.parentNode;
		}
		return ele;
	}

	// The base URL for any given element depends on the page it resides in.
	function getClosestBaseUrl( ele )
	{
		// Find the closest page and extract out its url.
		var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ),
			base = documentBase.hrefNoHash;

		if ( !url || !path.isPath( url ) ) {
			url = base;
		}

		return path.makeUrlAbsolute( url, base);
	}


	//The following event bindings should be bound after mobileinit has been triggered
	//the following function is called in the init file
	$.mobile._registerInternalEvents = function(){

		//bind to form submit events, handle with Ajax
		$( "form" ).live('submit', function( event ) {
			var $this = $( this );
			if( !$.mobile.ajaxEnabled ||
				$this.is( ":jqmData(ajax='false')" ) ) {
					return;
				}

			var type = $this.attr( "method" ),
				target = $this.attr( "target" ),
				url = $this.attr( "action" );

			// If no action is specified, browsers default to using the
			// URL of the document containing the form. Since we dynamically
			// pull in pages from external documents, the form should submit
			// to the URL for the source document of the page containing
			// the form.
			if ( !url ) {
				// Get the @data-url for the page containing the form.
				url = getClosestBaseUrl( $this );
				if ( url === documentBase.hrefNoHash ) {
					// The url we got back matches the document base,
					// which means the page must be an internal/embedded page,
					// so default to using the actual document url as a browser
					// would.
					url = documentUrl.hrefNoSearch;
				}
			}

			url = path.makeUrlAbsolute(  url, getClosestBaseUrl($this) );

			//external submits use regular HTTP
			if( path.isExternal( url ) || target ) {
				return;
			}

			$.mobile.changePage(
				url,
				{
					type:		type && type.length && type.toLowerCase() || "get",
					data:		$this.serialize(),
					transition:	$this.jqmData( "transition" ),
					direction:	$this.jqmData( "direction" ),
					reloadPage:	true
				}
			);
			event.preventDefault();
		});

		//add active state on vclick
		$( document ).bind( "vclick", function( event ) {
			// if this isn't a left click we don't care. Its important to note
			// that when the virtual event is generated it will create
			if ( event.which > 1 || !$.mobile.linkBindingEnabled ){
				return;
			}

			var link = findClosestLink( event.target );
			if ( link ) {
				if ( path.parseUrl( link.getAttribute( "href" ) || "#" ).hash !== "#" ) {
					removeActiveLinkClass( true );
					$activeClickedLink = $( link ).closest( ".ui-btn" ).not( ".ui-disabled" );
					$activeClickedLink.addClass( $.mobile.activeBtnClass );
					$( "." + $.mobile.activePageClass + " .ui-btn" ).not( link ).blur();
				}
			}
		});

		// click routing - direct to HTTP or Ajax, accordingly
		$( document ).bind( "click", function( event ) {
			if( !$.mobile.linkBindingEnabled ){
				return;
			}

			var link = findClosestLink( event.target );

			// If there is no link associated with the click or its not a left
			// click we want to ignore the click
			if ( !link || event.which > 1) {
				return;
			}

			var $link = $( link ),
				//remove active link class if external (then it won't be there if you come back)
				httpCleanup = function(){
					window.setTimeout( function() { removeActiveLinkClass( true ); }, 200 );
				};

			//if there's a data-rel=back attr, go back in history
			if( $link.is( ":jqmData(rel='back')" ) ) {
				window.history.back();
				return false;
			}

			var baseUrl = getClosestBaseUrl( $link ),

				//get href, if defined, otherwise default to empty hash
				href = path.makeUrlAbsolute( $link.attr( "href" ) || "#", baseUrl );

			//if ajax is disabled, exit early
			if( !$.mobile.ajaxEnabled && !path.isEmbeddedPage( href ) ){
				httpCleanup();
				//use default click handling
				return;
			}

			// XXX_jblas: Ideally links to application pages should be specified as
			//            an url to the application document with a hash that is either
			//            the site relative path or id to the page. But some of the
			//            internal code that dynamically generates sub-pages for nested
			//            lists and select dialogs, just write a hash in the link they
			//            create. This means the actual URL path is based on whatever
			//            the current value of the base tag is at the time this code
			//            is called. For now we are just assuming that any url with a
			//            hash in it is an application page reference.
			if ( href.search( "#" ) != -1 ) {
				href = href.replace( /[^#]*#/, "" );
				if ( !href ) {
					//link was an empty hash meant purely
					//for interaction, so we ignore it.
					event.preventDefault();
					return;
				} else if ( path.isPath( href ) ) {
					//we have apath so make it the href we want to load.
					href = path.makeUrlAbsolute( href, baseUrl );
				} else {
					//we have a simple id so use the documentUrl as its base.
					href = path.makeUrlAbsolute( "#" + href, documentUrl.hrefNoHash );
				}
			}

				// Should we handle this link, or let the browser deal with it?
			var useDefaultUrlHandling = $link.is( "[rel='external']" ) || $link.is( ":jqmData(ajax='false')" ) || $link.is( "[target]" ),

				// Some embedded browsers, like the web view in Phone Gap, allow cross-domain XHR
				// requests if the document doing the request was loaded via the file:// protocol.
				// This is usually to allow the application to "phone home" and fetch app specific
				// data. We normally let the browser handle external/cross-domain urls, but if the
				// allowCrossDomainPages option is true, we will allow cross-domain http/https
				// requests to go through our page loading logic.
				isCrossDomainPageLoad = ( $.mobile.allowCrossDomainPages && documentUrl.protocol === "file:" && href.search( /^https?:/ ) != -1 ),

				//check for protocol or rel and its not an embedded page
				//TODO overlap in logic from isExternal, rel=external check should be
				//     moved into more comprehensive isExternalLink
				isExternal = useDefaultUrlHandling || ( path.isExternal( href ) && !isCrossDomainPageLoad );

			if( isExternal ) {
				httpCleanup();
				//use default click handling
				return;
			}

			//use ajax
			var transition = $link.jqmData( "transition" ),
				direction = $link.jqmData( "direction" ),
				reverse = ( direction && direction === "reverse" ) ||
							// deprecated - remove by 1.0
							$link.jqmData( "back" ),

				//this may need to be more specific as we use data-rel more
				role = $link.attr( "data-" + $.mobile.ns + "rel" ) || undefined;

			$.mobile.changePage( href, { transition: transition, reverse: reverse, role: role } );
			event.preventDefault();
		});

		//prefetch pages when anchors with data-prefetch are encountered
		$( ".ui-page" ).live( "pageshow.prefetch", function() {
			var urls = [];
			$( this ).find( "a:jqmData(prefetch)" ).each(function(){
				var $link = $(this),
					url = $link.attr( "href" );

				if ( url && $.inArray( url, urls ) === -1 ) {
					urls.push( url );

					$.mobile.loadPage( url, {role: $link.attr("data-" + $.mobile.ns + "rel")} );
				}
			});
		});

		$.mobile._handleHashChange = function( hash ) {
			//find first page via hash
			var to = path.stripHash( hash ),
				//transition is false if it's the first page, undefined otherwise (and may be overridden by default)
				transition = $.mobile.urlHistory.stack.length === 0 ? "none" : undefined,

				// default options for the changPage calls made after examining the current state
				// of the page and the hash
				changePageOptions = {
					transition: transition,
					changeHash: false,
					fromHashChange: true
				};

			//if listening is disabled (either globally or temporarily), or it's a dialog hash
			if( !$.mobile.hashListeningEnabled || urlHistory.ignoreNextHashChange ) {
				urlHistory.ignoreNextHashChange = false;
				return;
			}

			// special case for dialogs
			if( urlHistory.stack.length > 1 && to.indexOf( dialogHashKey ) > -1 ) {

				// If current active page is not a dialog skip the dialog and continue
				// in the same direction
				if(!$.mobile.activePage.is( ".ui-dialog" )) {
					//determine if we're heading forward or backward and continue accordingly past
					//the current dialog
					urlHistory.directHashChange({
						currentUrl: to,
						isBack: function() { window.history.back(); },
						isForward: function() { window.history.forward(); }
					});

					// prevent changePage()
					return;
				} else {
					// if the current active page is a dialog and we're navigating
					// to a dialog use the dialog objected saved in the stack
					urlHistory.directHashChange({
						currentUrl: to,

						// regardless of the direction of the history change
						// do the following
						either: function( isBack ) {
							var active = $.mobile.urlHistory.getActive();

							to = active.pageUrl;

							// make sure to set the role, transition and reversal
							// as most of this is lost by the domCache cleaning
							$.extend( changePageOptions, {
								role: active.role,
								transition:	 active.transition,
								reverse: isBack
							});
						}
					});
				}
			}

			//if to is defined, load it
			if ( to ) {
				// At this point, 'to' can be one of 3 things, a cached page element from
				// a history stack entry, an id, or site-relative/absolute URL. If 'to' is
				// an id, we need to resolve it against the documentBase, not the location.href,
				// since the hashchange could've been the result of a forward/backward navigation
				// that crosses from an external page/dialog to an internal page/dialog.
				to = ( typeof to === "string" && !path.isPath( to ) ) ? ( path.makeUrlAbsolute( '#' + to, documentBase ) ) : to;
				$.mobile.changePage( to, changePageOptions );
			}	else {
				//there's no hash, go to the first page in the dom
				$.mobile.changePage( $.mobile.firstPage, changePageOptions );
			}
		};

		//hashchange event handler
		$window.bind( "hashchange", function( e, triggered ) {
			$.mobile._handleHashChange( location.hash );
		});

		//set page min-heights to be device specific
		$( document ).bind( "pageshow", resetActivePageHeight );
		$( window ).bind( "throttledresize", resetActivePageHeight );

	};//_registerInternalEvents callback

})( jQuery );
/*
* history.pushState support, layered on top of hashchange
*/

( function( $, window ) {
	// For now, let's Monkeypatch this onto the end of $.mobile._registerInternalEvents
	// Scope self to pushStateHandler so we can reference it sanely within the
	// methods handed off as event handlers
	var	pushStateHandler = {},
		self = pushStateHandler,
		$win = $( window ),
		url = $.mobile.path.parseUrl( location.href );

	$.extend( pushStateHandler, {
		// TODO move to a path helper, this is rather common functionality
		initialFilePath: (function() {
			return url.pathname + url.search;
		})(),

		initialHref: url.hrefNoHash,

		// Flag for tracking if a Hashchange naturally occurs after each popstate + replace
		hashchangeFired: false,

		state: function() {
			return {
				hash: location.hash || "#" + self.initialFilePath,
				title: document.title,

				// persist across refresh
				initialHref: self.initialHref
			};
		},

		resetUIKeys: function( url ) {
			var dialog = $.mobile.dialogHashKey,
				subkey = "&" + $.mobile.subPageUrlKey,
				dialogIndex = url.indexOf( dialog );

			if( dialogIndex > -1 ) {
				url = url.slice( 0, dialogIndex ) + "#" + url.slice( dialogIndex );
			} else if( url.indexOf( subkey ) > -1 ) {
				url = url.split( subkey ).join( "#" + subkey );
			}

			return url;
		},

		// TODO sort out a single barrier to hashchange functionality
		nextHashChangePrevented: function( value ) {
			$.mobile.urlHistory.ignoreNextHashChange = value;
			self.onHashChangeDisabled = value;
		},

		// on hash change we want to clean up the url
		// NOTE this takes place *after* the vanilla navigation hash change
		// handling has taken place and set the state of the DOM
		onHashChange: function( e ) {
			// disable this hash change
			if( self.onHashChangeDisabled ){
				return;
			}
			
			var href, state,
				hash = location.hash,
				isPath = $.mobile.path.isPath( hash ),
				resolutionUrl = isPath ? location.href : $.mobile.getDocumentUrl();
			hash = isPath ? hash.replace( "#", "" ) : hash;

			// propulate the hash when its not available
			state = self.state();

			// make the hash abolute with the current href
			href = $.mobile.path.makeUrlAbsolute( hash, resolutionUrl );

			if ( isPath ) {
				href = self.resetUIKeys( href );
			}

			// replace the current url with the new href and store the state
			// Note that in some cases we might be replacing an url with the
			// same url. We do this anyways because we need to make sure that
			// all of our history entries have a state object associated with
			// them. This allows us to work around the case where window.history.back()
			// is called to transition from an external page to an embedded page.
			// In that particular case, a hashchange event is *NOT* generated by the browser.
			// Ensuring each history entry has a state object means that onPopState()
			// will always trigger our hashchange callback even when a hashchange event
			// is not fired.
			history.replaceState( state, document.title, href );
		},

		// on popstate (ie back or forward) we need to replace the hash that was there previously
		// cleaned up by the additional hash handling
		onPopState: function( e ) {
			var poppedState = e.originalEvent.state, holdnexthashchange = false;

			// if there's no state its not a popstate we care about, ie chrome's initial popstate
			// or forward popstate
			if( poppedState ) {
				// disable any hashchange triggered by the browser
				self.nextHashChangePrevented( true );

				// defer our manual hashchange until after the browser fired
				// version has come and gone
				setTimeout(function() {
					// make sure that the manual hash handling takes place
					self.nextHashChangePrevented( false );

					// change the page based on the hash
					$.mobile._handleHashChange( poppedState.hash );
				}, 100);
			}
		},

		init: function() {
			$win.bind( "hashchange", self.onHashChange );

			// Handle popstate events the occur through history changes
			$win.bind( "popstate", self.onPopState );

			// if there's no hash, we need to replacestate for returning to home
			if ( location.hash === "" ) {
				history.replaceState( self.state(), document.title, location.href );
			}
		}
	});

	$( function() {
		if( $.mobile.pushStateEnabled && $.support.pushState ){
			pushStateHandler.init();
		}
	});
})( jQuery, this );
/*
* "transitions" plugin - Page change tranistions
*/

(function( $, window, undefined ) {

function css3TransitionHandler( name, reverse, $to, $from ) {

	var deferred = new $.Deferred(),
		reverseClass = reverse ? " reverse" : "",
		viewportClass = "ui-mobile-viewport-transitioning viewport-" + name,
		doneFunc = function() {

			$to.add( $from ).removeClass( "out in reverse " + name );

			if ( $from && $from[ 0 ] !== $to[ 0 ] ) {
				$from.removeClass( $.mobile.activePageClass );
			}

			$to.parent().removeClass( viewportClass );

			deferred.resolve( name, reverse, $to, $from );
		};

	$to.animationComplete( doneFunc );

	$to.parent().addClass( viewportClass );

	if ( $from ) {
		$from.addClass( name + " out" + reverseClass );
	}
	$to.addClass( $.mobile.activePageClass + " " + name + " in" + reverseClass );

	return deferred.promise();
}

// Make our transition handler public.
$.mobile.css3TransitionHandler = css3TransitionHandler;

// If the default transition handler is the 'none' handler, replace it with our handler.
if ( $.mobile.defaultTransitionHandler === $.mobile.noneTransitionHandler ) {
	$.mobile.defaultTransitionHandler = css3TransitionHandler;
}

})( jQuery, this );
/*
* "degradeInputs" plugin - degrades inputs to another type after custom enhancements are made.
*/

(function( $, undefined ) {

$.mobile.page.prototype.options.degradeInputs = {
	color: false,
	date: false,
	datetime: false,
	"datetime-local": false,
	email: false,
	month: false,
	number: false,
	range: "number",
	search: "text",
	tel: false,
	time: false,
	url: false,
	week: false
};


//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){

	var page = $(e.target).closest(':jqmData(role="page")').data("page"), options;

	if( !page ) {
		return;
	}

	options = page.options;

	// degrade inputs to avoid poorly implemented native functionality
	$( e.target ).find( "input" ).not( page.keepNativeSelector() ).each(function() {
		var $this = $( this ),
			type = this.getAttribute( "type" ),
			optType = options.degradeInputs[ type ] || "text";

		if ( options.degradeInputs[ type ] ) {
			var html = $( "<div>" ).html( $this.clone() ).html(),
				// In IE browsers, the type sometimes doesn't exist in the cloned markup, so we replace the closing tag instead
				hasType = html.indexOf( " type=" ) > -1,
				findstr = hasType ? /\s+type=["']?\w+['"]?/ : /\/?>/,
				repstr = " type=\"" + optType + "\" data-" + $.mobile.ns + "type=\"" + type + "\"" + ( hasType ? "" : ">" );

			$this.replaceWith( html.replace( findstr, repstr ) );
		}
	});

});

})( jQuery );/*
* "dialog" plugin.
*/

(function( $, window, undefined ) {

$.widget( "mobile.dialog", $.mobile.widget, {
	options: {
		closeBtnText 	: "Close",
		overlayTheme	: "a",
		initSelector	: ":jqmData(role='dialog')"
	},
	_create: function() {
		var self = this,
			$el = this.element,
			headerCloseButton = $( "<a href='#' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>"+ this.options.closeBtnText + "</a>" );

		$el.addClass( "ui-overlay-" + this.options.overlayTheme );

		// Class the markup for dialog styling
		// Set aria role
		$el.attr( "role", "dialog" )
			.addClass( "ui-dialog" )
			.find( ":jqmData(role='header')" )
			.addClass( "ui-corner-top ui-overlay-shadow" )
				.prepend( headerCloseButton )
			.end()
			.find( ":jqmData(role='content'),:jqmData(role='footer')" )
				.addClass( "ui-overlay-shadow" )
				.last()
				.addClass( "ui-corner-bottom" );

		// this must be an anonymous function so that select menu dialogs can replace
		// the close method. This is a change from previously just defining data-rel=back
		// on the button and letting nav handle it
		headerCloseButton.bind( "vclick", function() {
			self.close();
		});

		/* bind events
			- clicks and submits should use the closing transition that the dialog opened with
			  unless a data-transition is specified on the link/form
			- if the click was on the close button, or the link has a data-rel="back" it'll go back in history naturally
		*/
		$el.bind( "vclick submit", function( event ) {
			var $target = $( event.target ).closest( event.type === "vclick" ? "a" : "form" ),
				active;

			if ( $target.length && !$target.jqmData( "transition" ) ) {

				active = $.mobile.urlHistory.getActive() || {};

				$target.attr( "data-" + $.mobile.ns + "transition", ( active.transition || $.mobile.defaultDialogTransition ) )
					.attr( "data-" + $.mobile.ns + "direction", "reverse" );
			}
		})
		.bind( "pagehide", function() {
			$( this ).find( "." + $.mobile.activeBtnClass ).removeClass( $.mobile.activeBtnClass );
		});
	},

	// Close method goes back in history
	close: function() {
		window.history.back();
	}
});

//auto self-init widgets
$( $.mobile.dialog.prototype.options.initSelector ).live( "pagecreate", function(){
	$( this ).dialog();
});

})( jQuery, this );
/*
* This plugin handles theming and layout of headers, footers, and content areas
*/

(function( $, undefined ) {

$.mobile.page.prototype.options.backBtnText  = "Back";
$.mobile.page.prototype.options.addBackBtn   = false;
$.mobile.page.prototype.options.backBtnTheme = null;
$.mobile.page.prototype.options.headerTheme  = "a";
$.mobile.page.prototype.options.footerTheme  = "a";
$.mobile.page.prototype.options.contentTheme = null;

$( ":jqmData(role='page'), :jqmData(role='dialog')" ).live( "pagecreate", function( e ) {
	
	var $page = $( this ),
		o = $page.data( "page" ).options,
		pageRole = $page.jqmData( "role" ),
		pageTheme = o.theme;
	
	$( ":jqmData(role='header'), :jqmData(role='footer'), :jqmData(role='content')", this ).each(function() {
		var $this = $( this ),
			role = $this.jqmData( "role" ),
			theme = $this.jqmData( "theme" ),
			contentTheme = theme || o.contentTheme || ( pageRole === "dialog" && pageTheme ),
			$headeranchors,
			leftbtn,
			rightbtn,
			backBtn;
			
		$this.addClass( "ui-" + role );	

		//apply theming and markup modifications to page,header,content,footer
		if ( role === "header" || role === "footer" ) {
			
			var thisTheme = theme || ( role === "header" ? o.headerTheme : o.footerTheme ) || pageTheme;

			$this
				//add theme class
				.addClass( "ui-bar-" + thisTheme )
				// Add ARIA role
				.attr( "role", role === "header" ? "banner" : "contentinfo" );

			// Right,left buttons
			$headeranchors	= $this.children( "a" );
			leftbtn	= $headeranchors.hasClass( "ui-btn-left" );
			rightbtn = $headeranchors.hasClass( "ui-btn-right" );

			leftbtn = leftbtn || $headeranchors.eq( 0 ).not( ".ui-btn-right" ).addClass( "ui-btn-left" ).length;
			
			rightbtn = rightbtn || $headeranchors.eq( 1 ).addClass( "ui-btn-right" ).length;
			
			// Auto-add back btn on pages beyond first view
			if ( o.addBackBtn && 
				role === "header" &&
				$( ".ui-page" ).length > 1 &&
				$this.jqmData( "url" ) !== $.mobile.path.stripHash( location.hash ) &&
				!leftbtn ) {

				backBtn = $( "<a href='#' class='ui-btn-left' data-"+ $.mobile.ns +"rel='back' data-"+ $.mobile.ns +"icon='arrow-l'>"+ o.backBtnText +"</a>" )
					// If theme is provided, override default inheritance
					.attr( "data-"+ $.mobile.ns +"theme", o.backBtnTheme || thisTheme )
					.prependTo( $this );				
			}

			// Page title
			$this.children( "h1, h2, h3, h4, h5, h6" )
				.addClass( "ui-title" )
				// Regardless of h element number in src, it becomes h1 for the enhanced page
				.attr({
					"tabindex": "0",
					"role": "heading",
					"aria-level": "1"
				});

		} else if ( role === "content" ) {
			if ( contentTheme ) {
			    $this.addClass( "ui-body-" + ( contentTheme ) );
			}

			// Add ARIA role
			$this.attr( "role", "main" );
		}
	});
});

})( jQuery );/*
* "collapsible" plugin
*/

(function( $, undefined ) {

$.widget( "mobile.collapsible", $.mobile.widget, {
	options: {
		expandCueText: " click to expand contents",
		collapseCueText: " click to collapse contents",
		collapsed: true,
		heading: "h1,h2,h3,h4,h5,h6,legend",
		theme: null,
		contentTheme: null,
		iconTheme: "d",
		initSelector: ":jqmData(role='collapsible')"
	},
	_create: function() {

		var $el = this.element,
			o = this.options,
			collapsible = $el.addClass( "ui-collapsible" ),
			collapsibleHeading = $el.children( o.heading ).first(),
			collapsibleContent = collapsible.wrapInner( "<div class='ui-collapsible-content'></div>" ).find( ".ui-collapsible-content" ),
			collapsibleSet = $el.closest( ":jqmData(role='collapsible-set')" ).addClass( "ui-collapsible-set" ),
			collapsiblesInSet = collapsibleSet.children( ":jqmData(role='collapsible')" );

		// Replace collapsibleHeading if it's a legend
		if ( collapsibleHeading.is( "legend" ) ) {
			collapsibleHeading = $( "<div role='heading'>"+ collapsibleHeading.html() +"</div>" ).insertBefore( collapsibleHeading );
			collapsibleHeading.next().remove();
		}

		// If we are in a collapsible set
		if ( collapsibleSet.length ) {
			// Inherit the theme from collapsible-set
			if ( !o.theme ) {
				o.theme = collapsibleSet.jqmData( "theme" );
			}
			// Inherit the content-theme from collapsible-set
			if ( !o.contentTheme ) {
				o.contentTheme = collapsibleSet.jqmData( "content-theme" );
			}
		}

		collapsibleContent.addClass( ( o.contentTheme ) ? ( "ui-body-" + o.contentTheme ) : "");

		collapsibleHeading
			//drop heading in before content
			.insertBefore( collapsibleContent )
			//modify markup & attributes
			.addClass( "ui-collapsible-heading" )
			.append( "<span class='ui-collapsible-heading-status'></span>" )
			.wrapInner( "<a href='#' class='ui-collapsible-heading-toggle'></a>" )
			.find( "a" )
				.first()
				.buttonMarkup({
					shadow: false,
					corners: false,
					iconPos: "left",
					icon: "plus",
					theme: o.theme
				});

		if ( !collapsibleSet.length ) {
			collapsibleHeading
				.find( "a" ).first().add( collapsibleHeading.find( ".ui-btn-inner" ) )
					.addClass( "ui-corner-top ui-corner-bottom" );
		} else {
			// If we are in a collapsible set

			// Initialize the collapsible set if it's not already initialized
			if ( !collapsibleSet.jqmData( "collapsiblebound" ) ) {

				collapsibleSet
					.jqmData( "collapsiblebound", true )
					.bind( "expand", function( event ) {

						$( event.target )
							.closest( ".ui-collapsible" )
							.siblings( ".ui-collapsible" )
							.trigger( "collapse" );

					});
			}

			collapsiblesInSet.first()
				.find( "a" )
					.first()
					.addClass( "ui-corner-top" )
						.find( ".ui-btn-inner" )
							.addClass( "ui-corner-top" );

			collapsiblesInSet.last()
				.jqmData( "collapsible-last", true )
				.find( "a" )
					.first()
					.addClass( "ui-corner-bottom" )
						.find( ".ui-btn-inner" )
							.addClass( "ui-corner-bottom" );


			if ( collapsible.jqmData( "collapsible-last" ) ) {
				collapsibleHeading
					.find( "a" ).first().add ( collapsibleHeading.find( ".ui-btn-inner" ) )
						.addClass( "ui-corner-bottom" );
			}
		}

		//events
		collapsible
			.bind( "expand collapse", function( event ) {
				if ( !event.isDefaultPrevented() ) {

					event.preventDefault();

					var $this = $( this ),
						isCollapse = ( event.type === "collapse" ),
					    contentTheme = o.contentTheme;

					collapsibleHeading
						.toggleClass( "ui-collapsible-heading-collapsed", isCollapse)
						.find( ".ui-collapsible-heading-status" )
							.text( isCollapse ? o.expandCueText : o.collapseCueText )
						.end()
						.find( ".ui-icon" )
							.toggleClass( "ui-icon-minus", !isCollapse )
							.toggleClass( "ui-icon-plus", isCollapse );

					$this.toggleClass( "ui-collapsible-collapsed", isCollapse );
					collapsibleContent.toggleClass( "ui-collapsible-content-collapsed", isCollapse ).attr( "aria-hidden", isCollapse );

					if ( contentTheme && ( !collapsibleSet.length || collapsible.jqmData( "collapsible-last" ) ) ) {
						collapsibleHeading
							.find( "a" ).first().add( collapsibleHeading.find( ".ui-btn-inner" ) )
							.toggleClass( "ui-corner-bottom", isCollapse );
						collapsibleContent.toggleClass( "ui-corner-bottom", !isCollapse );
					}
					collapsibleContent.trigger( "updatelayout" );
				}
			})
			.trigger( o.collapsed ? "collapse" : "expand" );

		collapsibleHeading
			.bind( "click", function( event ) {

				var type = collapsibleHeading.is( ".ui-collapsible-heading-collapsed" ) ?
										"expand" : "collapse";

				collapsible.trigger( type );

				event.preventDefault();
			});
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( $.mobile.collapsible.prototype.options.initSelector, e.target ).collapsible();
});

})( jQuery );
/*
* "fieldcontain" plugin - simple class additions to make form row separators
*/

(function( $, undefined ) {

$.fn.fieldcontain = function( options ) {
	return this.addClass( "ui-field-contain ui-body ui-br" );
};

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( ":jqmData(role='fieldcontain')", e.target ).fieldcontain();
});

})( jQuery );/*
* plugin for creating CSS grids
*/

(function( $, undefined ) {

$.fn.grid = function( options ) {
	return this.each(function() {

		var $this = $( this ),
			o = $.extend({
				grid: null
			},options),
			$kids = $this.children(),
			gridCols = {solo:1, a:2, b:3, c:4, d:5},
			grid = o.grid,
			iterator;

			if ( !grid ) {
				if ( $kids.length <= 5 ) {
					for ( var letter in gridCols ) {
						if ( gridCols[ letter ] === $kids.length ) {
							grid = letter;
						}
					}
				} else {
					grid = "a";
				}
			}
			iterator = gridCols[grid];

		$this.addClass( "ui-grid-" + grid );

		$kids.filter( ":nth-child(" + iterator + "n+1)" ).addClass( "ui-block-a" );

		if ( iterator > 1 ) {
			$kids.filter( ":nth-child(" + iterator + "n+2)" ).addClass( "ui-block-b" );
		}
		if ( iterator > 2 ) {
			$kids.filter( ":nth-child(3n+3)" ).addClass( "ui-block-c" );
		}
		if ( iterator > 3 ) {
			$kids.filter( ":nth-child(4n+4)" ).addClass( "ui-block-d" );
		}
		if ( iterator > 4 ) {
			$kids.filter( ":nth-child(5n+5)" ).addClass( "ui-block-e" );
		}
	});
};
})( jQuery );/*
* "navbar" plugin
*/

(function( $, undefined ) {

$.widget( "mobile.navbar", $.mobile.widget, {
	options: {
		iconpos: "top",
		grid: null,
		initSelector: ":jqmData(role='navbar')"
	},

	_create: function(){

		var $navbar = this.element,
			$navbtns = $navbar.find( "a" ),
			iconpos = $navbtns.filter( ":jqmData(icon)" ).length ?
									this.options.iconpos : undefined;

		$navbar.addClass( "ui-navbar" )
			.attr( "role","navigation" )
			.find( "ul" )
				.grid({ grid: this.options.grid });

		if ( !iconpos ) {
			$navbar.addClass( "ui-navbar-noicons" );
		}

		$navbtns.buttonMarkup({
			corners:	false,
			shadow:		false,
			iconpos:	iconpos
		});

		$navbar.delegate( "a", "vclick", function( event ) {
			$navbtns.not( ".ui-state-persist" ).removeClass( $.mobile.activeBtnClass );
			$( this ).addClass( $.mobile.activeBtnClass );
		});
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( $.mobile.navbar.prototype.options.initSelector, e.target ).navbar();
});

})( jQuery );
/*
* "listview" plugin
*/

(function( $, undefined ) {

//Keeps track of the number of lists per page UID
//This allows support for multiple nested list in the same page
//https://github.com/jquery/jquery-mobile/issues/1617
var listCountPerPage = {};

$.widget( "mobile.listview", $.mobile.widget, {
	options: {
		theme: null,
		countTheme: "c",
		headerTheme: "b",
		dividerTheme: "b",
		splitIcon: "arrow-r",
		splitTheme: "b",
		inset: false,
		initSelector: ":jqmData(role='listview')"
	},

	_create: function() {
		var t = this;

		// create listview markup
		t.element.addClass(function( i, orig ) {
			return orig + " ui-listview " + ( t.options.inset ? " ui-listview-inset ui-corner-all ui-shadow " : "" );
		});

		t.refresh( true );
	},

	_removeCorners: function( li, which ) {
		var top = "ui-corner-top ui-corner-tr ui-corner-tl",
			bot = "ui-corner-bottom ui-corner-br ui-corner-bl";

		li = li.add( li.find( ".ui-btn-inner, .ui-li-link-alt, .ui-li-thumb" ) );

		if ( which === "top" ) {
			li.removeClass( top );
		} else if ( which === "bottom" ) {
			li.removeClass( bot );
		} else {
			li.removeClass( top + " " + bot );
		}
	},

	_refreshCorners: function( create ) {
		var $li,
			$visibleli,
			$topli,
			$bottomli;

		if ( this.options.inset ) {
			$li = this.element.children( "li" );
			// at create time the li are not visible yet so we need to rely on .ui-screen-hidden
			$visibleli = create?$li.not( ".ui-screen-hidden" ):$li.filter( ":visible" );

			this._removeCorners( $li );

			// Select the first visible li element
			$topli = $visibleli.first()
				.addClass( "ui-corner-top" );

			$topli.add( $topli.find( ".ui-btn-inner" )
					.not( ".ui-li-link-alt span:first-child" ) )
                                .addClass( "ui-corner-top" )
                                .end()
				.find( ".ui-li-link-alt, .ui-li-link-alt span:first-child" )
					.addClass( "ui-corner-tr" )
				.end()
				.find( ".ui-li-thumb" )
					.not(".ui-li-icon")
					.addClass( "ui-corner-tl" );

			// Select the last visible li element
			$bottomli = $visibleli.last()
				.addClass( "ui-corner-bottom" );

			$bottomli.add( $bottomli.find( ".ui-btn-inner" ) )
				.find( ".ui-li-link-alt" )
					.addClass( "ui-corner-br" )
				.end()
				.find( ".ui-li-thumb" )
					.not(".ui-li-icon")
					.addClass( "ui-corner-bl" );
		}
		if ( !create ) {
			this.element.trigger( "updatelayout" );
		}
	},

	// This is a generic utility method for finding the first
	// node with a given nodeName. It uses basic DOM traversal
	// to be fast and is meant to be a substitute for simple
	// $.fn.closest() and $.fn.children() calls on a single
	// element. Note that callers must pass both the lowerCase
	// and upperCase version of the nodeName they are looking for.
	// The main reason for this is that this function will be
	// called many times and we want to avoid having to lowercase
	// the nodeName from the element every time to ensure we have
	// a match. Note that this function lives here for now, but may
	// be moved into $.mobile if other components need a similar method.
	_findFirstElementByTagName: function( ele, nextProp, lcName, ucName )
	{
		var dict = {};
		dict[ lcName ] = dict[ ucName ] = true;
		while ( ele ) {
			if ( dict[ ele.nodeName ] ) {
				return ele;
			}
			ele = ele[ nextProp ];
		}
		return null;
	},
	_getChildrenByTagName: function( ele, lcName, ucName )
	{
		var results = [],
			dict = {};
		dict[ lcName ] = dict[ ucName ] = true;
		ele = ele.firstChild;
		while ( ele ) {
			if ( dict[ ele.nodeName ] ) {
				results.push( ele );
			}
			ele = ele.nextSibling;
		}
		return $( results );
	},

	_addThumbClasses: function( containers )
	{
		var i, img, len = containers.length;
		for ( i = 0; i < len; i++ ) {
			img = $( this._findFirstElementByTagName( containers[ i ].firstChild, "nextSibling", "img", "IMG" ) );
			if ( img.length ) {
				img.addClass( "ui-li-thumb" );
				$( this._findFirstElementByTagName( img[ 0 ].parentNode, "parentNode", "li", "LI" ) ).addClass( img.is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
			}
		}
	},

	refresh: function( create ) {
		this.parentPage = this.element.closest( ".ui-page" );
		this._createSubPages();

		var o = this.options,
			$list = this.element,
			self = this,
			dividertheme = $list.jqmData( "dividertheme" ) || o.dividerTheme,
			listsplittheme = $list.jqmData( "splittheme" ),
			listspliticon = $list.jqmData( "spliticon" ),
			li = this._getChildrenByTagName( $list[ 0 ], "li", "LI" ),
			counter = $.support.cssPseudoElement || !$.nodeName( $list[ 0 ], "ol" ) ? 0 : 1,
			itemClassDict = {},
			item, itemClass, itemTheme,
			a, last, splittheme, countParent, icon, imgParents, img;

		if ( counter ) {
			$list.find( ".ui-li-dec" ).remove();
		}
		
		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( this.element, "c" );
		}

		for ( var pos = 0, numli = li.length; pos < numli; pos++ ) {
			item = li.eq( pos );
			itemClass = "ui-li";

			// If we're creating the element, we update it regardless
			if ( create || !item.hasClass( "ui-li" ) ) {
				itemTheme = item.jqmData("theme") || o.theme;
				a = this._getChildrenByTagName( item[ 0 ], "a", "A" );

				if ( a.length ) {
					icon = item.jqmData("icon");

					item.buttonMarkup({
						wrapperEls: "div",
						shadow: false,
						corners: false,
						iconpos: "right",
						icon: a.length > 1 || icon === false ? false : icon || "arrow-r",
						theme: itemTheme
					});

					if ( ( icon != false ) && ( a.length == 1 ) ) {
						item.addClass( "ui-li-has-arrow" );
					}

					a.first().addClass( "ui-link-inherit" );

					if ( a.length > 1 ) {
						itemClass += " ui-li-has-alt";

						last = a.last();
						splittheme = listsplittheme || last.jqmData( "theme" ) || o.splitTheme;

						last.appendTo(item)
							.attr( "title", last.getEncodedText() )
							.addClass( "ui-li-link-alt" )
							.empty()
							.buttonMarkup({
								shadow: false,
								corners: false,
								theme: itemTheme,
								icon: false,
								iconpos: false
							})
							.find( ".ui-btn-inner" )
								.append(
									$( document.createElement( "span" ) ).buttonMarkup({
										shadow: true,
										corners: true,
										theme: splittheme,
										iconpos: "notext",
										icon: listspliticon || last.jqmData( "icon" ) || o.splitIcon
									})
								);
					}
				} else if ( item.jqmData( "role" ) === "list-divider" ) {

					itemClass += " ui-li-divider ui-btn ui-bar-" + dividertheme;
					item.attr( "role", "heading" );

					//reset counter when a divider heading is encountered
					if ( counter ) {
						counter = 1;
					}

				} else {
					itemClass += " ui-li-static ui-body-" + itemTheme;
				}
			}

			if ( counter && itemClass.indexOf( "ui-li-divider" ) < 0 ) {
				countParent = item.is( ".ui-li-static:first" ) ? item : item.find( ".ui-link-inherit" );

				countParent.addClass( "ui-li-jsnumbering" )
					.prepend( "<span class='ui-li-dec'>" + (counter++) + ". </span>" );
			}

			// Instead of setting item class directly on the list item and its
			// btn-inner at this point in time, push the item into a dictionary
			// that tells us what class to set on it so we can do this after this
			// processing loop is finished.

			if ( !itemClassDict[ itemClass ] ) {
				itemClassDict[ itemClass ] = [];
			}

			itemClassDict[ itemClass ].push( item[ 0 ] );
		}

		// Set the appropriate listview item classes on each list item
		// and their btn-inner elements. The main reason we didn't do this
		// in the for-loop above is because we can eliminate per-item function overhead
		// by calling addClass() and children() once or twice afterwards. This
		// can give us a significant boost on platforms like WP7.5.

		for ( itemClass in itemClassDict ) {
			$( itemClassDict[ itemClass ] ).addClass( itemClass ).children( ".ui-btn-inner" ).addClass( itemClass );
		}

		$list.find( "h1, h2, h3, h4, h5, h6" ).addClass( "ui-li-heading" )
			.end()

			.find( "p, dl" ).addClass( "ui-li-desc" )
			.end()

			.find( ".ui-li-aside" ).each(function() {
					var $this = $(this);
					$this.prependTo( $this.parent() ); //shift aside to front for css float
				})
			.end()

			.find( ".ui-li-count" ).each( function() {
					$( this ).closest( "li" ).addClass( "ui-li-has-count" );
				}).addClass( "ui-btn-up-" + ( $list.jqmData( "counttheme" ) || this.options.countTheme) + " ui-btn-corner-all" );

		// The idea here is to look at the first image in the list item
		// itself, and any .ui-link-inherit element it may contain, so we
		// can place the appropriate classes on the image and list item.
		// Note that we used to use something like:
		//
		//    li.find(">img:eq(0), .ui-link-inherit>img:eq(0)").each( ... );
		//
		// But executing a find() like that on Windows Phone 7.5 took a
		// really long time. Walking things manually with the code below
		// allows the 400 listview item page to load in about 3 seconds as
		// opposed to 30 seconds.

		this._addThumbClasses( li );
		this._addThumbClasses( $list.find( ".ui-link-inherit" ) );

		this._refreshCorners( create );
	},

	//create a string for ID/subpage url creation
	_idStringEscape: function( str ) {
		return str.replace(/[^a-zA-Z0-9]/g, '-');
	},

	_createSubPages: function() {
		var parentList = this.element,
			parentPage = parentList.closest( ".ui-page" ),
			parentUrl = parentPage.jqmData( "url" ),
			parentId = parentUrl || parentPage[ 0 ][ $.expando ],
			parentListId = parentList.attr( "id" ),
			o = this.options,
			dns = "data-" + $.mobile.ns,
			self = this,
			persistentFooterID = parentPage.find( ":jqmData(role='footer')" ).jqmData( "id" ),
			hasSubPages;

		if ( typeof listCountPerPage[ parentId ] === "undefined" ) {
			listCountPerPage[ parentId ] = -1;
		}

		parentListId = parentListId || ++listCountPerPage[ parentId ];

		$( parentList.find( "li>ul, li>ol" ).toArray().reverse() ).each(function( i ) {
			var self = this,
				list = $( this ),
				listId = list.attr( "id" ) || parentListId + "-" + i,
				parent = list.parent(),
				nodeEls = $( list.prevAll().toArray().reverse() ),
				nodeEls = nodeEls.length ? nodeEls : $( "<span>" + $.trim(parent.contents()[ 0 ].nodeValue) + "</span>" ),
				title = nodeEls.first().getEncodedText(),//url limits to first 30 chars of text
				id = ( parentUrl || "" ) + "&" + $.mobile.subPageUrlKey + "=" + listId,
				theme = list.jqmData( "theme" ) || o.theme,
				countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
				newPage, anchor;

			//define hasSubPages for use in later removal
			hasSubPages = true;

			newPage = list.detach()
						.wrap( "<div " + dns + "role='page' " +	dns + "url='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
						.parent()
							.before( "<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>" )
							.after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='"+ persistentFooterID +"'>") : "" )
							.parent()
								.appendTo( $.mobile.pageContainer );

			newPage.page();

			anchor = parent.find('a:first');

			if ( !anchor.length ) {
				anchor = $( "<a/>" ).html( nodeEls || title ).prependTo( parent.empty() );
			}

			anchor.attr( "href", "#" + id );

		}).listview();

		// on pagehide, remove any nested pages along with the parent page, as long as they aren't active
		// and aren't embedded
		if( hasSubPages &&
			parentPage.is( ":jqmData(external-page='true')" ) &&
			parentPage.data("page").options.domCache === false ) {

			var newRemove = function( e, ui ){
				var nextPage = ui.nextPage, npURL;

				if( ui.nextPage ){
					npURL = nextPage.jqmData( "url" );
					if( npURL.indexOf( parentUrl + "&" + $.mobile.subPageUrlKey ) !== 0 ){
						self.childPages().remove();
						parentPage.remove();
					}
				}
			};

			// unbind the original page remove and replace with our specialized version
			parentPage
				.unbind( "pagehide.remove" )
				.bind( "pagehide.remove", newRemove);
		}
	},

	// TODO sort out a better way to track sub pages of the listview this is brittle
	childPages: function(){
		var parentUrl = this.parentPage.jqmData( "url" );

		return $( ":jqmData(url^='"+  parentUrl + "&" + $.mobile.subPageUrlKey +"')");
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( $.mobile.listview.prototype.options.initSelector, e.target ).listview();
});

})( jQuery );
/*
* "listview" filter extension
*/

(function( $, undefined ) {

$.mobile.listview.prototype.options.filter = false;
$.mobile.listview.prototype.options.filterPlaceholder = "Filter items...";
$.mobile.listview.prototype.options.filterTheme = "c";
$.mobile.listview.prototype.options.filterCallback = function( text, searchValue ){
	return text.toLowerCase().indexOf( searchValue ) === -1;
};

$( ":jqmData(role='listview')" ).live( "listviewcreate", function() {

	var list = $( this ),
		listview = list.data( "listview" );

	if ( !listview.options.filter ) {
		return;
	}

	var wrapper = $( "<form>", {
			"class": "ui-listview-filter ui-bar-" + listview.options.filterTheme,
			"role": "search"
		}),
		search = $( "<input>", {
			placeholder: listview.options.filterPlaceholder
		})
		.attr( "data-" + $.mobile.ns + "type", "search" )
		.jqmData( "lastval", "" )
		.bind( "keyup change", function() {

			var $this = $(this),
				val = this.value.toLowerCase(),
				listItems = null,
				lastval = $this.jqmData( "lastval" ) + "",
				childItems = false,
				itemtext = "",
				item, change;

			// Change val as lastval for next execution
			$this.jqmData( "lastval" , val );
			change = val.substr( 0 , lastval.length - 1 ).replace( lastval , "" );

			if ( val.length < lastval.length || change.length != ( val.length - lastval.length ) ) {

				// Removed chars or pasted something totally different, check all items
				listItems = list.children();
			} else {

				// Only chars added, not removed, only use visible subset
				listItems = list.children( ":not(.ui-screen-hidden)" );
			}

			if ( val ) {

				// This handles hiding regular rows without the text we search for
				// and any list dividers without regular rows shown under it

				for ( var i = listItems.length - 1; i >= 0; i-- ) {
					item = $( listItems[ i ] );
					itemtext = item.jqmData( "filtertext" ) || item.text();

					if ( item.is( "li:jqmData(role=list-divider)" ) ) {

						item.toggleClass( "ui-filter-hidequeue" , !childItems );

						// New bucket!
						childItems = false;

					} else if ( listview.options.filterCallback( itemtext, val ) ) {

						//mark to be hidden
						item.toggleClass( "ui-filter-hidequeue" , true );
					} else {

						// There's a shown item in the bucket
						childItems = true;
					}
				}

				// Show items, not marked to be hidden
				listItems
					.filter( ":not(.ui-filter-hidequeue)" )
					.toggleClass( "ui-screen-hidden", false );

				// Hide items, marked to be hidden
				listItems
					.filter( ".ui-filter-hidequeue" )
					.toggleClass( "ui-screen-hidden", true )
					.toggleClass( "ui-filter-hidequeue", false );

			} else {

				//filtervalue is empty => show all
				listItems.toggleClass( "ui-screen-hidden", false );
			}
			listview._refreshCorners();
		})
		.appendTo( wrapper )
		.textinput();

	if ( $( this ).jqmData( "inset" ) ) {
		wrapper.addClass( "ui-listview-filter-inset" );
	}

	wrapper.bind( "submit", function() {
		return false;
	})
	.insertBefore( list );
});

})( jQuery );/*
* "nojs" plugin - class to make elements hidden to A grade browsers
*/

(function( $, undefined ) {

$( document ).bind( "pagecreate create", function( e ){
	$( ":jqmData(role='nojs')", e.target ).addClass( "ui-nojs" );
	
});

})( jQuery );/*
* "checkboxradio" plugin
*/

(function( $, undefined ) {

$.widget( "mobile.checkboxradio", $.mobile.widget, {
	options: {
		theme: null,
		initSelector: "input[type='checkbox'],input[type='radio']"
	},
	_create: function() {
		var self = this,
			input = this.element,
			// NOTE: Windows Phone could not find the label through a selector
			// filter works though.
			label = input.closest( "form,fieldset,:jqmData(role='page')" ).find( "label[for='" + input[ 0 ].id + "']"),
			inputtype = input.attr( "type" ),
			checkedState = inputtype + "-on",
			uncheckedState = inputtype + "-off",
			icon = input.parents( ":jqmData(type='horizontal')" ).length ? undefined : uncheckedState,
			activeBtn = icon ? "" : " " + $.mobile.activeBtnClass,
			checkedClass = "ui-" + checkedState + activeBtn,
			uncheckedClass = "ui-" + uncheckedState,
			checkedicon = "ui-icon-" + checkedState,
			uncheckedicon = "ui-icon-" + uncheckedState;

		if ( inputtype !== "checkbox" && inputtype !== "radio" ) {
			return;
		}

		// Expose for other methods
		$.extend( this, {
			label: label,
			inputtype: inputtype,
			checkedClass: checkedClass,
			uncheckedClass: uncheckedClass,
			checkedicon: checkedicon,
			uncheckedicon: uncheckedicon
		});

		// If there's no selected theme...
		if( !this.options.theme ) {
			this.options.theme = this.element.jqmData( "theme" );
		}

		label.buttonMarkup({
			theme: this.options.theme,
			icon: icon,
			shadow: false
		});

		// Wrap the input + label in a div
		input.add( label )
			.wrapAll( "<div class='ui-" + inputtype + "'></div>" );

		label.bind({
			vmouseover: function( event ) {
				if ( $( this ).parent().is( ".ui-disabled" ) ) {
					event.stopPropagation();
				}
			},

			vclick: function( event ) {
				if ( input.is( ":disabled" ) ) {
					event.preventDefault();
					return;
				}

				self._cacheVals();

				input.prop( "checked", inputtype === "radio" && true || !input.prop( "checked" ) );

				// trigger click handler's bound directly to the input as a substitute for
				// how label clicks behave normally in the browsers
				// TODO: it would be nice to let the browser's handle the clicks and pass them
				//       through to the associate input. we can swallow that click at the parent
				//       wrapper element level
				input.triggerHandler( 'click' );

				// Input set for common radio buttons will contain all the radio
				// buttons, but will not for checkboxes. clearing the checked status
				// of other radios ensures the active button state is applied properly
				self._getInputSet().not( input ).prop( "checked", false );

				self._updateAll();
				return false;
			}

		});

		input
			.bind({
				vmousedown: function() {
					self._cacheVals();
				},

				vclick: function() {
					var $this = $(this);

					// Adds checked attribute to checked input when keyboard is used
					if ( $this.is( ":checked" ) ) {

						$this.prop( "checked", true);
						self._getInputSet().not($this).prop( "checked", false );
					} else {

						$this.prop( "checked", false );
					}

					self._updateAll();
				},

				focus: function() {
					label.addClass( "ui-focus" );
				},

				blur: function() {
					label.removeClass( "ui-focus" );
				}
			});

		this.refresh();
	},

	_cacheVals: function() {
		this._getInputSet().each(function() {
			var $this = $(this);

			$this.jqmData( "cacheVal", $this.is( ":checked" ) );
		});
	},

	//returns either a set of radios with the same name attribute, or a single checkbox
	_getInputSet: function(){
		if(this.inputtype == "checkbox") {
			return this.element;
		}

		return this.element.closest( "form,fieldset,:jqmData(role='page')" )
			.find( "input[name='"+ this.element.attr( "name" ) +"'][type='"+ this.inputtype +"']" );
	},

	_updateAll: function() {
		var self = this;

		this._getInputSet().each(function() {
			var $this = $(this);

			if ( $this.is( ":checked" ) || self.inputtype === "checkbox" ) {
				$this.trigger( "change" );
			}
		})
		.checkboxradio( "refresh" );
	},

	refresh: function() {
		var input = this.element,
			label = this.label,
			icon = label.find( ".ui-icon" );

		// input[0].checked expando doesn't always report the proper value
		// for checked='checked'
		if ( $( input[ 0 ] ).prop( "checked" ) ) {

			label.addClass( this.checkedClass ).removeClass( this.uncheckedClass );
			icon.addClass( this.checkedicon ).removeClass( this.uncheckedicon );

		} else {

			label.removeClass( this.checkedClass ).addClass( this.uncheckedClass );
			icon.removeClass( this.checkedicon ).addClass( this.uncheckedicon );
		}

		if ( input.is( ":disabled" ) ) {
			this.disable();
		} else {
			this.enable();
		}
	},

	disable: function() {
		this.element.prop( "disabled", true ).parent().addClass( "ui-disabled" );
	},

	enable: function() {
		this.element.prop( "disabled", false ).parent().removeClass( "ui-disabled" );
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.checkboxradio.prototype.enhanceWithin( e.target );
});

})( jQuery );
/*
* "button" plugin - links that proxy to native input/buttons
*/

(function( $, undefined ) {

$.widget( "mobile.button", $.mobile.widget, {
	options: {
		theme: null,
		icon: null,
		iconpos: null,
		inline: null,
		corners: true,
		shadow: true,
		iconshadow: true,
		initSelector: "button, [type='button'], [type='submit'], [type='reset'], [type='image']"
	},
	_create: function() {
		var $el = this.element,
			o = this.options,
			type,
			name,
			$buttonPlaceholder;

		// Add ARIA role
		this.button = $( "<div></div>" )
			.text( $el.text() || $el.val() )
			.insertBefore( $el )
			.buttonMarkup({
				theme: o.theme,
				icon: o.icon,
				iconpos: o.iconpos,
				inline: o.inline,
				corners: o.corners,
				shadow: o.shadow,
				iconshadow: o.iconshadow
			})
			.append( $el.addClass( "ui-btn-hidden" ) );

		type = $el.attr( "type" );
		name = $el.attr( "name" );

		// Add hidden input during submit if input type="submit" has a name.
		if ( type !== "button" && type !== "reset" && name ) {
				$el.bind( "vclick", function() {
					// Add hidden input if it doesn’t already exist.
					if( $buttonPlaceholder === undefined ) {
						$buttonPlaceholder = $( "<input>", {
							type: "hidden",
							name: $el.attr( "name" ),
							value: $el.attr( "value" )
						}).insertBefore( $el );

						// Bind to doc to remove after submit handling
						$( document ).one("submit", function(){
							$buttonPlaceholder.remove();

							// reset the local var so that the hidden input
							// will be re-added on subsequent clicks
							$buttonPlaceholder = undefined;
						});
					}
				});
		}

		this.refresh();
	},

	enable: function() {
		this.element.attr( "disabled", false );
		this.button.removeClass( "ui-disabled" ).attr( "aria-disabled", false );
		return this._setOption( "disabled", false );
	},

	disable: function() {
		this.element.attr( "disabled", true );
		this.button.addClass( "ui-disabled" ).attr( "aria-disabled", true );
		return this._setOption( "disabled", true );
	},

	refresh: function() {
		var $el = this.element;

		if ( $el.prop("disabled") ) {
			this.disable();
		} else {
			this.enable();
		}

		// the textWrapper is stored as a data element on the button object
		// to prevent referencing by it's implementation details (eg 'class')
		this.button.data( 'textWrapper' ).text( $el.text() || $el.val() );
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.button.prototype.enhanceWithin( e.target );
});

})( jQuery );/*
* "slider" plugin
*/

( function( $, undefined ) {

$.widget( "mobile.slider", $.mobile.widget, {
	options: {
		theme: null,
		trackTheme: null,
		disabled: false,
		initSelector: "input[type='range'], :jqmData(type='range'), :jqmData(role='slider')"
	},

	_create: function() {

		// TODO: Each of these should have comments explain what they're for
		var self = this,

			control = this.element,

			parentTheme = $.mobile.getInheritedTheme( control, "c" ),

			theme = this.options.theme || parentTheme,

			trackTheme = this.options.trackTheme || parentTheme,

			cType = control[ 0 ].nodeName.toLowerCase(),

			selectClass = ( cType == "select" ) ? "ui-slider-switch" : "",

			controlID = control.attr( "id" ),

			labelID = controlID + "-label",

			label = $( "[for='"+ controlID +"']" ).attr( "id", labelID ),

			val = function() {
				return  cType == "input"  ? parseFloat( control.val() ) : control[0].selectedIndex;
			},

			min =  cType == "input" ? parseFloat( control.attr( "min" ) ) : 0,

			max =  cType == "input" ? parseFloat( control.attr( "max" ) ) : control.find( "option" ).length-1,

			step = window.parseFloat( control.attr( "step" ) || 1 ),

			slider = $( "<div class='ui-slider " + selectClass + " ui-btn-down-" + trackTheme +
									" ui-btn-corner-all' role='application'></div>" ),

			handle = $( "<a href='#' class='ui-slider-handle'></a>" )
				.appendTo( slider )
				.buttonMarkup({ corners: true, theme: theme, shadow: true })
				.attr({
					"role": "slider",
					"aria-valuemin": min,
					"aria-valuemax": max,
					"aria-valuenow": val(),
					"aria-valuetext": val(),
					"title": val(),
					"aria-labelledby": labelID
				}),
			options;

		$.extend( this, {
			slider: slider,
			handle: handle,
			dragging: false,
			beforeStart: null,
			userModified: false,
			mouseMoved: false
		});

		if ( cType == "select" ) {

			slider.wrapInner( "<div class='ui-slider-inneroffset'></div>" );
			
			// make the handle move with a smooth transition
			handle.addClass( "ui-slider-handle-snapping" );

			options = control.find( "option" );

			control.find( "option" ).each(function( i ) {

				var side = !i ? "b":"a",
					corners = !i ? "right" :"left",
					theme = !i ? " ui-btn-down-" + trackTheme :( " " + $.mobile.activeBtnClass );

				$( "<div class='ui-slider-labelbg ui-slider-labelbg-" + side + theme + " ui-btn-corner-" + corners + "'></div>" )
					.prependTo( slider );

				$( "<span class='ui-slider-label ui-slider-label-" + side + theme + " ui-btn-corner-" + corners + "' role='img'>" + $( this ).getEncodedText() + "</span>" )
					.prependTo( handle );
			});

		}

		label.addClass( "ui-slider" );

		// monitor the input for updated values
		control.addClass( cType === "input" ? "ui-slider-input" : "ui-slider-switch" )
			.change( function() {
				// if the user dragged the handle, the "change" event was triggered from inside refresh(); don't call refresh() again
				if (!self.mouseMoved) {
					self.refresh( val(), true );
				}
			})
			.keyup( function() { // necessary?
				self.refresh( val(), true, true );
			})
			.blur( function() {
				self.refresh( val(), true );
			});

		// prevent screen drag when slider activated
		$( document ).bind( "vmousemove", function( event ) {
			if ( self.dragging ) {
				// self.mouseMoved must be updated before refresh() because it will be used in the control "change" event
				self.mouseMoved = true;
				
				if ( cType === "select" ) {
					// make the handle move in sync with the mouse
					handle.removeClass( "ui-slider-handle-snapping" );
				}
				
				self.refresh( event );
				
				// only after refresh() you can calculate self.userModified
				self.userModified = self.beforeStart !== control[0].selectedIndex;
				return false;
			}
		});

		slider.bind( "vmousedown", function( event ) {
			self.dragging = true;
			self.userModified = false;
			self.mouseMoved = false;

			if ( cType === "select" ) {
				self.beforeStart = control[0].selectedIndex;
			}
			
			self.refresh( event );
			return false;
		});

		slider.add( document )
			.bind( "vmouseup", function() {
				if ( self.dragging ) {

					self.dragging = false;

					if ( cType === "select") {
					
						// make the handle move with a smooth transition
						handle.addClass( "ui-slider-handle-snapping" );
					
						if ( self.mouseMoved ) {
						
							// this is a drag, change the value only if user dragged enough
							if ( self.userModified ) {
								self.refresh( self.beforeStart == 0 ? 1 : 0 );
							}
							else {
								self.refresh( self.beforeStart );
							}
							
						}
						else {
							// this is just a click, change the value
							self.refresh( self.beforeStart == 0 ? 1 : 0 );
						}
						
					}
					
					self.mouseMoved = false;
					
					return false;
				}
			});

		slider.insertAfter( control );

		// NOTE force focus on handle
		this.handle
			.bind( "vmousedown", function() {
				$( this ).focus();
			})
			.bind( "vclick", false );

		this.handle
			.bind( "keydown", function( event ) {
				var index = val();

				if ( self.options.disabled ) {
					return;
				}

				// In all cases prevent the default and mark the handle as active
				switch ( event.keyCode ) {
				 case $.mobile.keyCode.HOME:
				 case $.mobile.keyCode.END:
				 case $.mobile.keyCode.PAGE_UP:
				 case $.mobile.keyCode.PAGE_DOWN:
				 case $.mobile.keyCode.UP:
				 case $.mobile.keyCode.RIGHT:
				 case $.mobile.keyCode.DOWN:
				 case $.mobile.keyCode.LEFT:
					event.preventDefault();

					if ( !self._keySliding ) {
						self._keySliding = true;
						$( this ).addClass( "ui-state-active" );
					}
					break;
				}

				// move the slider according to the keypress
				switch ( event.keyCode ) {
				 case $.mobile.keyCode.HOME:
					self.refresh( min );
					break;
				 case $.mobile.keyCode.END:
					self.refresh( max );
					break;
				 case $.mobile.keyCode.PAGE_UP:
				 case $.mobile.keyCode.UP:
				 case $.mobile.keyCode.RIGHT:
					self.refresh( index + step );
					break;
				 case $.mobile.keyCode.PAGE_DOWN:
				 case $.mobile.keyCode.DOWN:
				 case $.mobile.keyCode.LEFT:
					self.refresh( index - step );
					break;
				}
			}) // remove active mark
			.keyup( function( event ) {
				if ( self._keySliding ) {
					self._keySliding = false;
					$( this ).removeClass( "ui-state-active" );
				}
			});

		this.refresh(undefined, undefined, true);
	},

	refresh: function( val, isfromControl, preventInputUpdate ) {

		if ( this.options.disabled || this.element.attr('disabled')) { 
			this.disable();
		}

		var control = this.element, percent,
			cType = control[0].nodeName.toLowerCase(),
			min = cType === "input" ? parseFloat( control.attr( "min" ) ) : 0,
			max = cType === "input" ? parseFloat( control.attr( "max" ) ) : control.find( "option" ).length - 1;

		if ( typeof val === "object" ) {
			var data = val,
				// a slight tolerance helped get to the ends of the slider
				tol = 8;
			if ( !this.dragging ||
					data.pageX < this.slider.offset().left - tol ||
					data.pageX > this.slider.offset().left + this.slider.width() + tol ) {
				return;
			}
			percent = Math.round( ( ( data.pageX - this.slider.offset().left ) / this.slider.width() ) * 100 );
		} else {
			if ( val == null ) {
				val = cType === "input" ? parseFloat( control.val() ) : control[0].selectedIndex;
			}
			percent = ( parseFloat( val ) - min ) / ( max - min ) * 100;
		}

		if ( isNaN( percent ) ) {
			return;
		}

		if ( percent < 0 ) {
			percent = 0;
		}

		if ( percent > 100 ) {
			percent = 100;
		}

		var newval = Math.round( ( percent / 100 ) * ( max - min ) ) + min;

		if ( newval < min ) {
			newval = min;
		}

		if ( newval > max ) {
			newval = max;
		}

		// Flip the stack of the bg colors
		if ( percent > 60 && cType === "select" ) {
			// TODO: Dead path?
		}
		this.handle.css( "left", percent + "%" );
		this.handle.attr( {
				"aria-valuenow": cType === "input" ? newval : control.find( "option" ).eq( newval ).attr( "value" ),
				"aria-valuetext": cType === "input" ? newval : control.find( "option" ).eq( newval ).getEncodedText(),
				title: newval
			});

		// add/remove classes for flip toggle switch
		if ( cType === "select" ) {
			if ( newval === 0 ) {
				this.slider.addClass( "ui-slider-switch-a" )
					.removeClass( "ui-slider-switch-b" );
			} else {
				this.slider.addClass( "ui-slider-switch-b" )
					.removeClass( "ui-slider-switch-a" );
			}
		}

		if ( !preventInputUpdate ) {
			var valueChanged = false;

			// update control"s value
			if ( cType === "input" ) {
				valueChanged = control.val() !== newval;
				control.val( newval );
			} else {
				valueChanged = control[ 0 ].selectedIndex !== newval;
				control[ 0 ].selectedIndex = newval;
			}
			if ( !isfromControl && valueChanged ) {
				control.trigger( "change" );
			}
		}
	},

	enable: function() {
		this.element.attr( "disabled", false );
		this.slider.removeClass( "ui-disabled" ).attr( "aria-disabled", false );
		return this._setOption( "disabled", false );
	},

	disable: function() {
		this.element.attr( "disabled", true );
		this.slider.addClass( "ui-disabled" ).attr( "aria-disabled", true );
		return this._setOption( "disabled", true );
	}

});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.slider.prototype.enhanceWithin( e.target );
});

})( jQuery );
/*
* "textinput" plugin for text inputs, textareas
*/

(function( $, undefined ) {

$.widget( "mobile.textinput", $.mobile.widget, {
	options: {
		theme: null,
		initSelector: "input[type='text'], input[type='search'], :jqmData(type='search'), input[type='number'], :jqmData(type='number'), input[type='password'], input[type='email'], input[type='url'], input[type='tel'], textarea, input[type='time'], input[type='date'], input[type='month'], input[type='week'], input[type='datetime'], input[type='datetime-local'], input[type='color'], input:not([type])"
	},

	_create: function() {

		var input = this.element,
			o = this.options,
			theme = o.theme || $.mobile.getInheritedTheme( this.element, "c" ),
			themeclass  = " ui-body-" + theme,
			focusedEl, clearbtn;

		$( "label[for='" + input.attr( "id" ) + "']" ).addClass( "ui-input-text" );

		focusedEl = input.addClass("ui-input-text ui-body-"+ theme );

		// XXX: Temporary workaround for issue 785 (Apple bug 8910589).
		//      Turn off autocorrect and autocomplete on non-iOS 5 devices
		//      since the popup they use can't be dismissed by the user. Note
		//      that we test for the presence of the feature by looking for
		//      the autocorrect property on the input element. We currently
		//      have no test for iOS 5 or newer so we're temporarily using
		//      the touchOverflow support flag for jQM 1.0. Yes, I feel dirty. - jblas
		if ( typeof input[0].autocorrect !== "undefined" && !$.support.touchOverflow ) {
			// Set the attribute instead of the property just in case there
			// is code that attempts to make modifications via HTML.
			input[0].setAttribute( "autocorrect", "off" );
			input[0].setAttribute( "autocomplete", "off" );
		}


		//"search" input widget
		if ( input.is( "[type='search'],:jqmData(type='search')" ) ) {

			focusedEl = input.wrap( "<div class='ui-input-search ui-shadow-inset ui-btn-corner-all ui-btn-shadow ui-icon-searchfield" + themeclass + "'></div>" ).parent();
			clearbtn = $( "<a href='#' class='ui-input-clear' title='clear text'>clear text</a>" )
				.tap(function( event ) {
					input.val( "" ).focus();
					input.trigger( "change" );
					clearbtn.addClass( "ui-input-clear-hidden" );
					event.preventDefault();
				})
				.appendTo( focusedEl )
				.buttonMarkup({
					icon: "delete",
					iconpos: "notext",
					corners: true,
					shadow: true
				});

			function toggleClear() {
				setTimeout(function() {
					clearbtn.toggleClass( "ui-input-clear-hidden", !input.val() );
				}, 0);
			}

			toggleClear();

			input.bind('paste cut keyup focus change blur', toggleClear);

		} else {
			input.addClass( "ui-corner-all ui-shadow-inset" + themeclass );
		}

		input.focus(function() {
				focusedEl.addClass( "ui-focus" );
			})
			.blur(function(){
				focusedEl.removeClass( "ui-focus" );
			});

		// Autogrow
		if ( input.is( "textarea" ) ) {
			var extraLineHeight = 15,
				keyupTimeoutBuffer = 100,
				keyup = function() {
					var scrollHeight = input[ 0 ].scrollHeight,
						clientHeight = input[ 0 ].clientHeight;

					if ( clientHeight < scrollHeight ) {
						input.height(scrollHeight + extraLineHeight);
					}
				},
				keyupTimeout;

			input.keyup(function() {
				clearTimeout( keyupTimeout );
				keyupTimeout = setTimeout( keyup, keyupTimeoutBuffer );
			});

			// Issue 509: the browser is not providing scrollHeight properly until the styles load
			if ( $.trim( input.val() ) ) {
				// bind to the window load to make sure the height is calculated based on BOTH
				// the DOM and CSS
				$( window ).load( keyup );

				// binding to pagechange here ensures that for pages loaded via
				// ajax the height is recalculated without user input
				$( document ).one( "pagechange", keyup );
			}
		}
	},

	disable: function(){
		( this.element.attr( "disabled", true ).is( "[type='search'],:jqmData(type='search')" ) ?
			this.element.parent() : this.element ).addClass( "ui-disabled" );
	},

	enable: function(){
		( this.element.attr( "disabled", false).is( "[type='search'],:jqmData(type='search')" ) ?
			this.element.parent() : this.element ).removeClass( "ui-disabled" );
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.textinput.prototype.enhanceWithin( e.target );
});

})( jQuery );
/*
* custom "selectmenu" plugin
*/

(function( $, undefined ) {
	var extendSelect = function( widget ){

		var select = widget.select,
			selectID  = widget.selectID,
			label = widget.label,
			thisPage = widget.select.closest( ".ui-page" ),
			screen = $( "<div>", {"class": "ui-selectmenu-screen ui-screen-hidden"} ).appendTo( thisPage ),
			selectOptions = widget._selectOptions(),
			isMultiple = widget.isMultiple = widget.select[ 0 ].multiple,
			buttonId = selectID + "-button",
			menuId = selectID + "-menu",
			menuPage = $( "<div data-" + $.mobile.ns + "role='dialog' data-" +$.mobile.ns + "theme='"+ widget.options.theme +"' data-" +$.mobile.ns + "overlay-theme='"+ widget.options.overlayTheme +"'>" +
				"<div data-" + $.mobile.ns + "role='header'>" +
				"<div class='ui-title'>" + label.getEncodedText() + "</div>"+
				"</div>"+
				"<div data-" + $.mobile.ns + "role='content'></div>"+
				"</div>" ).appendTo( $.mobile.pageContainer ).page(),

			listbox =  $("<div>", { "class": "ui-selectmenu ui-selectmenu-hidden ui-overlay-shadow ui-corner-all ui-body-" + widget.options.overlayTheme + " " + $.mobile.defaultDialogTransition } ).insertAfter(screen),

			list = $( "<ul>", {
				"class": "ui-selectmenu-list",
				"id": menuId,
				"role": "listbox",
				"aria-labelledby": buttonId
			}).attr( "data-" + $.mobile.ns + "theme", widget.options.theme ).appendTo( listbox ),

			header = $( "<div>", {
				"class": "ui-header ui-bar-" + widget.options.theme
			}).prependTo( listbox ),

			headerTitle = $( "<h1>", {
				"class": "ui-title"
			}).appendTo( header ),

			headerClose = $( "<a>", {
				"text": widget.options.closeText,
				"href": "#",
				"class": "ui-btn-left"
			}).attr( "data-" + $.mobile.ns + "iconpos", "notext" ).attr( "data-" + $.mobile.ns + "icon", "delete" ).appendTo( header ).buttonMarkup(),

			menuPageContent = menuPage.find( ".ui-content" ),

			menuPageClose = menuPage.find( ".ui-header a" );


		$.extend( widget, {
			select: widget.select,
			selectID: selectID,
			buttonId: buttonId,
			menuId: menuId,
			thisPage: thisPage,
			menuPage: menuPage,
			label: label,
			screen: screen,
			selectOptions: selectOptions,
			isMultiple: isMultiple,
			theme: widget.options.theme,
			listbox: listbox,
			list: list,
			header: header,
			headerTitle: headerTitle,
			headerClose: headerClose,
			menuPageContent: menuPageContent,
			menuPageClose: menuPageClose,
			placeholder: "",

			build: function() {
				var self = this;

				// Create list from select, update state
				self.refresh();

				self.select.attr( "tabindex", "-1" ).focus(function() {
					$( this ).blur();
					self.button.focus();
				});

				// Button events
				self.button.bind( "vclick keydown" , function( event ) {
					if ( event.type == "vclick" ||
							 event.keyCode && ( event.keyCode === $.mobile.keyCode.ENTER ||
																	event.keyCode === $.mobile.keyCode.SPACE ) ) {

						self.open();
						event.preventDefault();
					}
				});

				// Events for list items
				self.list.attr( "role", "listbox" )
					.delegate( ".ui-li>a", "focusin", function() {
						$( this ).attr( "tabindex", "0" );
					})
					.delegate( ".ui-li>a", "focusout", function() {
						$( this ).attr( "tabindex", "-1" );
					})
					.delegate( "li:not(.ui-disabled, .ui-li-divider)", "click", function( event ) {

						// index of option tag to be selected
						var oldIndex = self.select[ 0 ].selectedIndex,
							newIndex = self.list.find( "li:not(.ui-li-divider)" ).index( this ),
							option = self._selectOptions().eq( newIndex )[ 0 ];

						// toggle selected status on the tag for multi selects
						option.selected = self.isMultiple ? !option.selected : true;

						// toggle checkbox class for multiple selects
						if ( self.isMultiple ) {
							$( this ).find( ".ui-icon" )
								.toggleClass( "ui-icon-checkbox-on", option.selected )
								.toggleClass( "ui-icon-checkbox-off", !option.selected );
						}

						// trigger change if value changed
						if ( self.isMultiple || oldIndex !== newIndex ) {
							self.select.trigger( "change" );
						}

						//hide custom select for single selects only
						if ( !self.isMultiple ) {
							self.close();
						}

						event.preventDefault();
					})
					.keydown(function( event ) {  //keyboard events for menu items
						var target = $( event.target ),
							li = target.closest( "li" ),
							prev, next;

						// switch logic based on which key was pressed
						switch ( event.keyCode ) {
							// up or left arrow keys
						 case 38:
							prev = li.prev();

							// if there's a previous option, focus it
							if ( prev.length ) {
								target
									.blur()
									.attr( "tabindex", "-1" );

								prev.find( "a" ).first().focus();
							}

							return false;
							break;

							// down or right arrow keys
						 case 40:
							next = li.next();

							// if there's a next option, focus it
							if ( next.length ) {
								target
									.blur()
									.attr( "tabindex", "-1" );

								next.find( "a" ).first().focus();
							}

							return false;
							break;

							// If enter or space is pressed, trigger click
						 case 13:
						 case 32:
							target.trigger( "click" );

							return false;
							break;
						}
					});

				// button refocus ensures proper height calculation
				// by removing the inline style and ensuring page inclusion
				self.menuPage.bind( "pagehide", function() {
					self.list.appendTo( self.listbox );
					self._focusButton();

					// TODO centralize page removal binding / handling in the page plugin.
					// Suggestion from @jblas to do refcounting
					//
					// TODO extremely confusing dependency on the open method where the pagehide.remove
					// bindings are stripped to prevent the parent page from disappearing. The way
					// we're keeping pages in the DOM right now sucks
					//
					// rebind the page remove that was unbound in the open function
					// to allow for the parent page removal from actions other than the use
					// of a dialog sized custom select
					//
					// doing this here provides for the back button on the custom select dialog
					$.mobile._bindPageRemove.call( self.thisPage );
				});

				// Events on "screen" overlay
				self.screen.bind( "vclick", function( event ) {
					self.close();
				});

				// Close button on small overlays
				self.headerClose.click( function() {
					if ( self.menuType == "overlay" ) {
						self.close();
						return false;
					}
				});

				// track this dependency so that when the parent page
				// is removed on pagehide it will also remove the menupage
				self.thisPage.addDependents( this.menuPage );
			},

			_isRebuildRequired: function() {
				var list = this.list.find( "li" ),
					options = this._selectOptions();

				// TODO exceedingly naive method to determine difference
				// ignores value changes etc in favor of a forcedRebuild
				// from the user in the refresh method
				return options.text() !== list.text();
			},

			refresh: function( forceRebuild , foo ){
				var self = this,
				select = this.element,
				isMultiple = this.isMultiple,
				options = this._selectOptions(),
				selected = this.selected(),
				// return an array of all selected index's
				indicies = this.selectedIndices();

				if (  forceRebuild || this._isRebuildRequired() ) {
					self._buildList();
				}

				self.setButtonText();
				self.setButtonCount();

				self.list.find( "li:not(.ui-li-divider)" )
					.removeClass( $.mobile.activeBtnClass )
					.attr( "aria-selected", false )
					.each(function( i ) {

						if ( $.inArray( i, indicies ) > -1 ) {
							var item = $( this );

							// Aria selected attr
							item.attr( "aria-selected", true );

							// Multiple selects: add the "on" checkbox state to the icon
							if ( self.isMultiple ) {
								item.find( ".ui-icon" ).removeClass( "ui-icon-checkbox-off" ).addClass( "ui-icon-checkbox-on" );
							} else {
								item.addClass( $.mobile.activeBtnClass );
							}
						}
					});
			},

			close: function() {
				if ( this.options.disabled || !this.isOpen ) {
					return;
				}

				var self = this;

				if ( self.menuType == "page" ) {
					// doesn't solve the possible issue with calling change page
					// where the objects don't define data urls which prevents dialog key
					// stripping - changePage has incoming refactor
					window.history.back();
				} else {
					self.screen.addClass( "ui-screen-hidden" );
					self.listbox.addClass( "ui-selectmenu-hidden" ).removeAttr( "style" ).removeClass( "in" );
					self.list.appendTo( self.listbox );
					self._focusButton();
				}

				// allow the dialog to be closed again
				self.isOpen = false;
			},

			open: function() {
				if ( this.options.disabled ) {
					return;
				}

				var self = this,
					menuHeight = self.list.parent().outerHeight(),
					menuWidth = self.list.parent().outerWidth(),
					activePage = $( ".ui-page-active" ),
					tOverflow = $.support.touchOverflow && $.mobile.touchOverflowEnabled,
					tScrollElem = activePage.is( ".ui-native-fixed" ) ? activePage.find( ".ui-content" ) : activePage;
					scrollTop = tOverflow ? tScrollElem.scrollTop() : $( window ).scrollTop(),
					btnOffset = self.button.offset().top,
					screenHeight = window.innerHeight,
					screenWidth = window.innerWidth;

				//add active class to button
				self.button.addClass( $.mobile.activeBtnClass );

				//remove after delay
				setTimeout( function() {
					self.button.removeClass( $.mobile.activeBtnClass );
				}, 300);

				function focusMenuItem() {
					self.list.find( $.mobile.activeBtnClass ).focus();
				}

				if ( menuHeight > screenHeight - 80 || !$.support.scrollTop ) {
					// prevent the parent page from being removed from the DOM,
					// otherwise the results of selecting a list item in the dialog
					// fall into a black hole
					self.thisPage.unbind( "pagehide.remove" );

					//for WebOS/Opera Mini (set lastscroll using button offset)
					if ( scrollTop == 0 && btnOffset > screenHeight ) {
						self.thisPage.one( "pagehide", function() {
							$( this ).jqmData( "lastScroll", btnOffset );
						});
					}

					self.menuPage.one( "pageshow", function() {
						// silentScroll() is called whenever a page is shown to restore
						// any previous scroll position the page may have had. We need to
						// wait for the "silentscroll" event before setting focus to avoid
						// the browser"s "feature" which offsets rendering to make sure
						// whatever has focus is in view.
						$( window ).one( "silentscroll", function() {
							focusMenuItem();
						});

						self.isOpen = true;
					});

					self.menuType = "page";
					self.menuPageContent.append( self.list );
					self.menuPage.find("div .ui-title").text(self.label.text());
					$.mobile.changePage( self.menuPage, {
						transition: $.mobile.defaultDialogTransition
					});
				} else {
					self.menuType = "overlay";

					self.screen.height( $(document).height() )
						.removeClass( "ui-screen-hidden" );

					// Try and center the overlay over the button
					var roomtop = btnOffset - scrollTop,
						roombot = scrollTop + screenHeight - btnOffset,
						halfheight = menuHeight / 2,
						maxwidth = parseFloat( self.list.parent().css( "max-width" ) ),
						newtop, newleft;

					if ( roomtop > menuHeight / 2 && roombot > menuHeight / 2 ) {
						newtop = btnOffset + ( self.button.outerHeight() / 2 ) - halfheight;
					} else {
						// 30px tolerance off the edges
						newtop = roomtop > roombot ? scrollTop + screenHeight - menuHeight - 30 : scrollTop + 30;
					}

					// If the menuwidth is smaller than the screen center is
					if ( menuWidth < maxwidth ) {
						newleft = ( screenWidth - menuWidth ) / 2;
					} else {

						//otherwise insure a >= 30px offset from the left
						newleft = self.button.offset().left + self.button.outerWidth() / 2 - menuWidth / 2;

						// 30px tolerance off the edges
						if ( newleft < 30 ) {
							newleft = 30;
						} else if ( (newleft + menuWidth) > screenWidth ) {
							newleft = screenWidth - menuWidth - 30;
						}
					}

					self.listbox.append( self.list )
						.removeClass( "ui-selectmenu-hidden" )
						.css({
							top: newtop,
							left: newleft
						})
						.addClass( "in" );

					focusMenuItem();

					// duplicate with value set in page show for dialog sized selects
					self.isOpen = true;
				}
			},

			_buildList: function() {
				var self = this,
					o = this.options,
					placeholder = this.placeholder,
					optgroups = [],
					lis = [],
					dataIcon = self.isMultiple ? "checkbox-off" : "false";

				self.list.empty().filter( ".ui-listview" ).listview( "destroy" );

				// Populate menu with options from select element
				self.select.find( "option" ).each( function( i ) {
					var $this = $( this ),
						$parent = $this.parent(),
						text = $this.getEncodedText(),
						anchor = "<a href='#'>"+ text +"</a>",
						classes = [],
						extraAttrs = [];

					// Are we inside an optgroup?
					if ( $parent.is( "optgroup" ) ) {
						var optLabel = $parent.attr( "label" );

						// has this optgroup already been built yet?
						if ( $.inArray( optLabel, optgroups ) === -1 ) {
							lis.push( "<li data-" + $.mobile.ns + "role='list-divider'>"+ optLabel +"</li>" );
							optgroups.push( optLabel );
						}
					}

					// Find placeholder text
					// TODO: Are you sure you want to use getAttribute? ^RW
					if ( !this.getAttribute( "value" ) || text.length == 0 || $this.jqmData( "placeholder" ) ) {
						if ( o.hidePlaceholderMenuItems ) {
							classes.push( "ui-selectmenu-placeholder" );
						}
						placeholder = self.placeholder = text;
					}

					// support disabled option tags
					if ( this.disabled ) {
						classes.push( "ui-disabled" );
						extraAttrs.push( "aria-disabled='true'" );
					}

					lis.push( "<li data-" + $.mobile.ns + "option-index='" + i + "' data-" + $.mobile.ns + "icon='"+ dataIcon +"' class='"+ classes.join(" ") + "' " + extraAttrs.join(" ") +">"+ anchor +"</li>" );
				});

				self.list.html( lis.join(" ") );

				self.list.find( "li" )
					.attr({ "role": "option", "tabindex": "-1" })
					.first().attr( "tabindex", "0" );

				// Hide header close link for single selects
				if ( !this.isMultiple ) {
					this.headerClose.hide();
				}

				// Hide header if it's not a multiselect and there's no placeholder
				if ( !this.isMultiple && !placeholder.length ) {
					this.header.hide();
				} else {
					this.headerTitle.text( this.placeholder );
				}

				// Now populated, create listview
				self.list.listview();
			},

			_button: function(){
				return $( "<a>", {
					"href": "#",
					"role": "button",
					// TODO value is undefined at creation
					"id": this.buttonId,
					"aria-haspopup": "true",

					// TODO value is undefined at creation
					"aria-owns": this.menuId
				});
			}
		});
	};

	$( "select" ).live( "selectmenubeforecreate", function(){
		var selectmenuWidget = $( this ).data( "selectmenu" );

		if( !selectmenuWidget.options.nativeMenu ){
			extendSelect( selectmenuWidget );
		}
	});
})( jQuery );
/*
* "selectmenu" plugin
*/

(function( $, undefined ) {

$.widget( "mobile.selectmenu", $.mobile.widget, {
	options: {
		theme: null,
		disabled: false,
		icon: "arrow-d",
		iconpos: "right",
		inline: null,
		corners: true,
		shadow: true,
		iconshadow: true,
		menuPageTheme: "b",
		overlayTheme: "a",
		hidePlaceholderMenuItems: true,
		closeText: "Close",
		nativeMenu: true,
		initSelector: "select:not(:jqmData(role='slider'))"
	},

	_button: function(){
		return $( "<div/>" );
	},

	_setDisabled: function( value ) {
		this.element.attr( "disabled", value );
		this.button.attr( "aria-disabled", value );
		return this._setOption( "disabled", value );
	},

	_focusButton : function() {
		var self = this;

		setTimeout( function() {
			self.button.focus();
		}, 40);
	},

  _selectOptions: function() {
    return this.select.find( "option" );
  },

	// setup items that are generally necessary for select menu extension
	_preExtension: function(){
		this.select = this.element.wrap( "<div class='ui-select'>" );
		this.selectID  = this.select.attr( "id" );
		this.label = $( "label[for='"+ this.selectID +"']" ).addClass( "ui-select" );
		this.isMultiple = this.select[ 0 ].multiple;
		if ( !this.options.theme ) {
			this.options.theme = $.mobile.getInheritedTheme( this.select, "c" );
		}
	},

	_create: function() {
		this._preExtension();

 		// Allows for extension of the native select for custom selects and other plugins
		// see select.custom for example extension
		// TODO explore plugin registration
		this._trigger( "beforeCreate" );

		this.button = this._button();

		var self = this,

			options = this.options,

			// IE throws an exception at options.item() function when
			// there is no selected item
			// select first in this case
			selectedIndex = this.select[ 0 ].selectedIndex == -1 ? 0 : this.select[ 0 ].selectedIndex,

			// TODO values buttonId and menuId are undefined here
			button = this.button
				.text( $( this.select[ 0 ].options.item( selectedIndex ) ).text() )
				.insertBefore( this.select )
				.buttonMarkup( {
					theme: options.theme,
					icon: options.icon,
					iconpos: options.iconpos,
					inline: options.inline,
					corners: options.corners,
					shadow: options.shadow,
					iconshadow: options.iconshadow
				});

		// Opera does not properly support opacity on select elements
		// In Mini, it hides the element, but not its text
		// On the desktop,it seems to do the opposite
		// for these reasons, using the nativeMenu option results in a full native select in Opera
		if ( options.nativeMenu && window.opera && window.opera.version ) {
			this.select.addClass( "ui-select-nativeonly" );
		}

		// Add counter for multi selects
		if ( this.isMultiple ) {
			this.buttonCount = $( "<span>" )
				.addClass( "ui-li-count ui-btn-up-c ui-btn-corner-all" )
				.hide()
				.appendTo( button.addClass('ui-li-has-count') );
		}

		// Disable if specified
		if ( options.disabled || this.element.attr('disabled')) {
			this.disable();
		}

		// Events on native select
		this.select.change( function() {
			self.refresh();
		});

		this.build();
	},

	build: function() {
		var self = this;

		this.select
			.appendTo( self.button )
			.bind( "vmousedown", function() {
				// Add active class to button
				self.button.addClass( $.mobile.activeBtnClass );
			})
			.bind( "focus vmouseover", function() {
				self.button.trigger( "vmouseover" );
			})
			.bind( "vmousemove", function() {
				// Remove active class on scroll/touchmove
				self.button.removeClass( $.mobile.activeBtnClass );
			})
			.bind( "change blur vmouseout", function() {
				self.button.trigger( "vmouseout" )
					.removeClass( $.mobile.activeBtnClass );
			})
			.bind( "change blur", function() {
				self.button.removeClass( "ui-btn-down-" + self.options.theme );
			});
	},

	selected: function() {
		return this._selectOptions().filter( ":selected" );
	},

	selectedIndices: function() {
		var self = this;

		return this.selected().map( function() {
			return self._selectOptions().index( this );
		}).get();
	},

	setButtonText: function() {
		var self = this, selected = this.selected();

		this.button.find( ".ui-btn-text" ).text( function() {
			if ( !self.isMultiple ) {
				return selected.text();
			}

			return selected.length ? selected.map( function() {
				return $( this ).text();
			}).get().join( ", " ) : self.placeholder;
		});
	},

	setButtonCount: function() {
		var selected = this.selected();

		// multiple count inside button
		if ( this.isMultiple ) {
			this.buttonCount[ selected.length > 1 ? "show" : "hide" ]().text( selected.length );
		}
	},

	refresh: function() {
		this.setButtonText();
		this.setButtonCount();
	},

	// open and close preserved in native selects
	// to simplify users code when looping over selects
	open: $.noop,
	close: $.noop,

	disable: function() {
		this._setDisabled( true );
		this.button.addClass( "ui-disabled" );
	},

	enable: function() {
		this._setDisabled( false );
		this.button.removeClass( "ui-disabled" );
	}
});

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile.selectmenu.prototype.enhanceWithin( e.target );
});
})( jQuery );
/*
* "buttons" plugin - for making button-like links
*/

( function( $, undefined ) {

$.fn.buttonMarkup = function( options ) {
	options = options || {};

	for ( var i = 0; i < this.length; i++ ) {
		var el = this.eq( i ),
			e = el[ 0 ],
			o = $.extend( {}, $.fn.buttonMarkup.defaults, {
				icon:       options.icon       !== undefined ? options.icon       : el.jqmData( "icon" ),
				iconpos:    options.iconpos    !== undefined ? options.iconpos    : el.jqmData( "iconpos" ),
				theme:      options.theme      !== undefined ? options.theme      : el.jqmData( "theme" ),
				inline:     options.inline     !== undefined ? options.inline     : el.jqmData( "inline" ),
				shadow:     options.shadow     !== undefined ? options.shadow     : el.jqmData( "shadow" ),
				corners:    options.corners    !== undefined ? options.corners    : el.jqmData( "corners" ),
				iconshadow: options.iconshadow !== undefined ? options.iconshadow : el.jqmData( "iconshadow" )
			}, options ),

			// Classes Defined
			innerClass = "ui-btn-inner",
			textClass = "ui-btn-text",
			buttonClass, iconClass,

			// Button inner markup
			buttonInner = document.createElement( o.wrapperEls ),
			buttonText = document.createElement( o.wrapperEls ),
			buttonIcon = o.icon ? document.createElement( "span" ) : null;

		if ( attachEvents ) {
			attachEvents();
		}

		// if not, try to find closest theme container
		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( el, "c" );
		}

		buttonClass = "ui-btn ui-btn-up-" + o.theme;

		if ( o.inline ) {
			buttonClass += " ui-btn-inline";
		}

		if ( o.icon ) {
			o.icon = "ui-icon-" + o.icon;
			o.iconpos = o.iconpos || "left";

			iconClass = "ui-icon " + o.icon;

			if ( o.iconshadow ) {
				iconClass += " ui-icon-shadow";
			}
		}

		if ( o.iconpos ) {
			buttonClass += " ui-btn-icon-" + o.iconpos;

			if ( o.iconpos == "notext" && !el.attr( "title" ) ) {
				el.attr( "title", el.getEncodedText() );
			}
		}

		if ( o.corners ) {
			buttonClass += " ui-btn-corner-all";
			innerClass += " ui-btn-corner-all";
		}

		if ( o.shadow ) {
			buttonClass += " ui-shadow";
		}

		e.setAttribute( "data-" + $.mobile.ns + "theme", o.theme );
		el.addClass( buttonClass );

		buttonInner.className = innerClass;
		buttonInner.setAttribute("aria-hidden", "true");

		buttonText.className = textClass;
		buttonInner.appendChild( buttonText );

		if ( buttonIcon ) {
			buttonIcon.className = iconClass;
			buttonInner.appendChild( buttonIcon );
		}

		while ( e.firstChild ) {
			buttonText.appendChild( e.firstChild );
		}

		e.appendChild( buttonInner );
		
		// TODO obviously it would be nice to pull this element out instead of
		// retrieving it from the DOM again, but this change is much less obtrusive
		// and 1.0 draws nigh
		$.data( e, 'textWrapper', $( buttonText ) );
	}

	return this;
};

$.fn.buttonMarkup.defaults = {
	corners: true,
	shadow: true,
	iconshadow: true,
	inline: false,
	wrapperEls: "span"
};

function closestEnabledButton( element ) {
    var cname;

    while ( element ) {
		// Note that we check for typeof className below because the element we
		// handed could be in an SVG DOM where className on SVG elements is defined to
		// be of a different type (SVGAnimatedString). We only operate on HTML DOM
		// elements, so we look for plain "string".

        cname = ( typeof element.className === 'string' ) && element.className.split(' ');

        if ( cname && $.inArray( "ui-btn", cname ) > -1 && $.inArray( "ui-disabled", cname ) < 0 ) {
            break;
        }
        element = element.parentNode;
    }

    return element;
}

var attachEvents = function() {
	$( document ).bind( {
		"vmousedown": function( event ) {
			var btn = closestEnabledButton( event.target ),
				$btn, theme;

			if ( btn ) {
				$btn = $( btn );
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
				$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
			}
		},
		"vmousecancel vmouseup": function( event ) {
			var btn = closestEnabledButton( event.target ),
				$btn, theme;

			if ( btn ) {
				$btn = $( btn );
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
				$btn.removeClass( "ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
			}
		},
		"vmouseover focus": function( event ) {
			var btn = closestEnabledButton( event.target ),
				$btn, theme;

			if ( btn ) {
				$btn = $( btn );
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
				$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
			}
		},
		"vmouseout blur": function( event ) {
			var btn = closestEnabledButton( event.target ),
				$btn, theme;

			if ( btn ) {
				$btn = $( btn );
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
				$btn.removeClass( "ui-btn-hover-" + theme  + " ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
			}
		}
	});

	attachEvents = null;
};

//links in bars, or those with  data-role become buttons
//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){

	$( ":jqmData(role='button'), .ui-bar > a, .ui-header > a, .ui-footer > a, .ui-bar > :jqmData(role='controlgroup') > a", e.target )
		.not( ".ui-btn, :jqmData(role='none'), :jqmData(role='nojs')" )
		.buttonMarkup();
});

})( jQuery );
/* 
* "controlgroup" plugin - corner-rounding for groups of buttons, checks, radios, etc
*/

(function( $, undefined ) {

$.fn.controlgroup = function( options ) {

	return this.each(function() {

		var $el = $( this ),
			o = $.extend({
						direction: $el.jqmData( "type" ) || "vertical",
						shadow: false,
						excludeInvisible: true
					}, options ),
			groupheading = $el.children( "legend" ),
			flCorners = o.direction == "horizontal" ? [ "ui-corner-left", "ui-corner-right" ] : [ "ui-corner-top", "ui-corner-bottom" ],
			type = $el.find( "input" ).first().attr( "type" );

		// Replace legend with more stylable replacement div
		if ( groupheading.length ) {
			$el.wrapInner( "<div class='ui-controlgroup-controls'></div>" );
			$( "<div role='heading' class='ui-controlgroup-label'>" + groupheading.html() + "</div>" ).insertBefore( $el.children(0) );
			groupheading.remove();
		}

		$el.addClass( "ui-corner-all ui-controlgroup ui-controlgroup-" + o.direction );

		// TODO: This should be moved out to the closure
		// otherwise it is redefined each time controlgroup() is called
		function flipClasses( els ) {
			els.removeClass( "ui-btn-corner-all ui-shadow" )
				.eq( 0 ).addClass( flCorners[ 0 ] )
				.end()
				.last().addClass( flCorners[ 1 ] ).addClass( "ui-controlgroup-last" );
		}

		flipClasses( $el.find( ".ui-btn" + ( o.excludeInvisible ? ":visible" : "" ) ) );
		flipClasses( $el.find( ".ui-btn-inner" ) );

		if ( o.shadow ) {
			$el.addClass( "ui-shadow" );
		}
	});
};

//auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$( ":jqmData(role='controlgroup')", e.target ).controlgroup({ excludeInvisible: false });
});

})(jQuery);/*
* "links" plugin - simple class additions for links
*/

(function( $, undefined ) {

$( document ).bind( "pagecreate create", function( e ){
	
	//links within content areas
	$( e.target )
		.find( "a" )
		.not( ".ui-btn, .ui-link-inherit, :jqmData(role='none'), :jqmData(role='nojs')" )
		.addClass( "ui-link" );

});

})( jQuery );/*
* "fixHeaderFooter" plugin - on-demand positioning for headers,footers
*/

(function( $, undefined ) {

var slideDownClass = "ui-header-fixed ui-fixed-inline fade",
	slideUpClass = "ui-footer-fixed ui-fixed-inline fade",

	slideDownSelector = ".ui-header:jqmData(position='fixed')",
	slideUpSelector = ".ui-footer:jqmData(position='fixed')";

$.fn.fixHeaderFooter = function( options ) {

	if ( !$.support.scrollTop || ( $.support.touchOverflow && $.mobile.touchOverflowEnabled ) ) {
		return this;
	}

	return this.each(function() {
		var $this = $( this );

		if ( $this.jqmData( "fullscreen" ) ) {
			$this.addClass( "ui-page-fullscreen" );
		}

		// Should be slidedown
		$this.find( slideDownSelector ).addClass( slideDownClass );

		// Should be slideup
		$this.find( slideUpSelector ).addClass( slideUpClass );
	});
};

// single controller for all showing,hiding,toggling
$.mobile.fixedToolbars = (function() {

	if ( !$.support.scrollTop || ( $.support.touchOverflow && $.mobile.touchOverflowEnabled ) ) {
		return;
	}

	var stickyFooter, delayTimer,
		currentstate = "inline",
		autoHideMode = false,
		showDelay = 100,
		ignoreTargets = "a,input,textarea,select,button,label,.ui-header-fixed,.ui-footer-fixed",
		toolbarSelector = ".ui-header-fixed:first, .ui-footer-fixed:not(.ui-footer-duplicate):last",
		// for storing quick references to duplicate footers
		supportTouch = $.support.touch,
		touchStartEvent = supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = supportTouch ? "touchend" : "mouseup",
		stateBefore = null,
		scrollTriggered = false,
		touchToggleEnabled = true;

	function showEventCallback( event ) {
		// An event that affects the dimensions of the visual viewport has
		// been triggered. If the header and/or footer for the current page are in overlay
		// mode, we want to hide them, and then fire off a timer to show them at a later
		// point. Events like a resize can be triggered continuously during a scroll, on
		// some platforms, so the timer is used to delay the actual positioning until the
		// flood of events have subsided.
		//
		// If we are in autoHideMode, we don't do anything because we know the scroll
		// callbacks for the plugin will fire off a show when the scrolling has stopped.
		if ( !autoHideMode && currentstate === "overlay" ) {
			if ( !delayTimer ) {
				$.mobile.fixedToolbars.hide( true );
			}

			$.mobile.fixedToolbars.startShowTimer();
		}
	}

	$(function() {
		var $document = $( document ),
			$window = $( window );

		$document
			.bind( "vmousedown", function( event ) {
				if ( touchToggleEnabled ) {
					stateBefore = currentstate;
				}
			})
			.bind( "vclick", function( event ) {
				if ( touchToggleEnabled ) {

					if ( $(event.target).closest( ignoreTargets ).length ) {
						return;
					}

					if ( !scrollTriggered ) {
						$.mobile.fixedToolbars.toggle( stateBefore );
						stateBefore = null;
					}
				}
			})
			.bind( "silentscroll", showEventCallback );


		// The below checks first for a $(document).scrollTop() value, and if zero, binds scroll events to $(window) instead.
		// If the scrollTop value is actually zero, both will return zero anyway.
		//
		// Works with $(document), not $(window) : Opera Mobile (WinMO phone; kinda broken anyway)
		// Works with $(window), not $(document) : IE 7/8
		// Works with either $(window) or $(document) : Chrome, FF 3.6/4, Android 1.6/2.1, iOS
		// Needs work either way : BB5, Opera Mobile (iOS)

		( ( $document.scrollTop() === 0 ) ? $window : $document )
			.bind( "scrollstart", function( event ) {

				scrollTriggered = true;

				if ( stateBefore === null ) {
					stateBefore = currentstate;
				}

				// We only enter autoHideMode if the headers/footers are in
				// an overlay state or the show timer was started. If the
				// show timer is set, clear it so the headers/footers don't
				// show up until after we're done scrolling.
				var isOverlayState = stateBefore == "overlay";

				autoHideMode = isOverlayState || !!delayTimer;

				if ( autoHideMode ) {
					$.mobile.fixedToolbars.clearShowTimer();

					if ( isOverlayState ) {
						$.mobile.fixedToolbars.hide( true );
					}
				}
			})
			.bind( "scrollstop", function( event ) {

				if ( $( event.target ).closest( ignoreTargets ).length ) {
					return;
				}

				scrollTriggered = false;

				if ( autoHideMode ) {
					$.mobile.fixedToolbars.startShowTimer();
					autoHideMode = false;
				}
				stateBefore = null;
			});

			$window.bind( "resize updatelayout", showEventCallback );
	});

	// 1. Before page is shown, check for duplicate footer
	// 2. After page is shown, append footer to new page
	$( ".ui-page" )
		.live( "pagebeforeshow", function( event, ui ) {

			var page = $( event.target ),
				footer = page.find( ":jqmData(role='footer')" ),
				id = footer.data( "id" ),
				prevPage = ui.prevPage,
				prevFooter = prevPage && prevPage.find( ":jqmData(role='footer')" ),
				prevFooterMatches = prevFooter.length && prevFooter.jqmData( "id" ) === id;

			if ( id && prevFooterMatches ) {
				stickyFooter = footer;
				setTop( stickyFooter.removeClass( "fade in out" ).appendTo( $.mobile.pageContainer ) );
			}
		})
		.live( "pageshow", function( event, ui ) {

			var $this = $( this );

			if ( stickyFooter && stickyFooter.length ) {

				setTimeout(function() {
					setTop( stickyFooter.appendTo( $this ).addClass( "fade" ) );
					stickyFooter = null;
				}, 500);
			}

			$.mobile.fixedToolbars.show( true, this );
		});

	// When a collapsiable is hidden or shown we need to trigger the fixed toolbar to reposition itself (#1635)
	$( ".ui-collapsible-contain" ).live( "collapse expand", showEventCallback );

	// element.getBoundingClientRect() is broken in iOS 3.2.1 on the iPad. The
	// coordinates inside of the rect it returns don't have the page scroll position
	// factored out of it like the other platforms do. To get around this,
	// we'll just calculate the top offset the old fashioned way until core has
	// a chance to figure out how to handle this situation.
	//
	// TODO: We'll need to get rid of getOffsetTop() once a fix gets folded into core.

	function getOffsetTop( ele ) {
		var top = 0,
			op, body;

		if ( ele ) {
			body = document.body;
			op = ele.offsetParent;
			top = ele.offsetTop;

			while ( ele && ele != body ) {
				top += ele.scrollTop || 0;

				if ( ele == op ) {
					top += op.offsetTop;
					op = ele.offsetParent;
				}

				ele = ele.parentNode;
			}
		}
		return top;
	}

	function setTop( el ) {
		var fromTop = $(window).scrollTop(),
			thisTop = getOffsetTop( el[ 0 ] ), // el.offset().top returns the wrong value on iPad iOS 3.2.1, call our workaround instead.
			thisCSStop = el.css( "top" ) == "auto" ? 0 : parseFloat(el.css( "top" )),
			screenHeight = window.innerHeight,
			thisHeight = el.outerHeight(),
			useRelative = el.parents( ".ui-page:not(.ui-page-fullscreen)" ).length,
			relval;

		if ( el.is( ".ui-header-fixed" ) ) {

			relval = fromTop - thisTop + thisCSStop;

			if ( relval < thisTop ) {
				relval = 0;
			}

			return el.css( "top", useRelative ? relval : fromTop );
		} else {
			// relval = -1 * (thisTop - (fromTop + screenHeight) + thisCSStop + thisHeight);
			// if ( relval > thisTop ) { relval = 0; }
			relval = fromTop + screenHeight - thisHeight - (thisTop - thisCSStop );

			return el.css( "top", useRelative ? relval : fromTop + screenHeight - thisHeight );
		}
	}

	// Exposed methods
	return {

		show: function( immediately, page ) {

			$.mobile.fixedToolbars.clearShowTimer();

			currentstate = "overlay";

			var $ap = page ? $( page ) :
					( $.mobile.activePage ? $.mobile.activePage :
						$( ".ui-page-active" ) );

			return $ap.children( toolbarSelector ).each(function() {

				var el = $( this ),
					fromTop = $( window ).scrollTop(),
					// el.offset().top returns the wrong value on iPad iOS 3.2.1, call our workaround instead.
					thisTop = getOffsetTop( el[ 0 ] ),
					screenHeight = window.innerHeight,
					thisHeight = el.outerHeight(),
					alreadyVisible = ( el.is( ".ui-header-fixed" ) && fromTop <= thisTop + thisHeight ) ||
														( el.is( ".ui-footer-fixed" ) && thisTop <= fromTop + screenHeight );

				// Add state class
				el.addClass( "ui-fixed-overlay" ).removeClass( "ui-fixed-inline" );

				if ( !alreadyVisible && !immediately ) {
					el.animationComplete(function() {
						el.removeClass( "in" );
					}).addClass( "in" );
				}
				setTop(el);
			});
		},

		hide: function( immediately ) {

			currentstate = "inline";

			var $ap = $.mobile.activePage ? $.mobile.activePage :
									$( ".ui-page-active" );

			return $ap.children( toolbarSelector ).each(function() {

				var el = $(this),
					thisCSStop = el.css( "top" ),
					classes;

				thisCSStop = thisCSStop == "auto" ? 0 :
											parseFloat(thisCSStop);

				// Add state class
				el.addClass( "ui-fixed-inline" ).removeClass( "ui-fixed-overlay" );

				if ( thisCSStop < 0 || ( el.is( ".ui-header-fixed" ) && thisCSStop !== 0 ) ) {

					if ( immediately ) {
						el.css( "top", 0);
					} else {

						if ( el.css( "top" ) !== "auto" && parseFloat( el.css( "top" ) ) !== 0 ) {

							classes = "out reverse";

							el.animationComplete(function() {
								el.removeClass( classes ).css( "top", 0 );
							}).addClass( classes );
						}
					}
				}
			});
		},

		startShowTimer: function() {

			$.mobile.fixedToolbars.clearShowTimer();

			var args = [].slice.call( arguments );

			delayTimer = setTimeout(function() {
				delayTimer = undefined;
				$.mobile.fixedToolbars.show.apply( null, args );
			}, showDelay);
		},

		clearShowTimer: function() {
			if ( delayTimer ) {
				clearTimeout( delayTimer );
			}
			delayTimer = undefined;
		},

		toggle: function( from ) {
			if ( from ) {
				currentstate = from;
			}
			return ( currentstate === "overlay" ) ? $.mobile.fixedToolbars.hide() :
								$.mobile.fixedToolbars.show();
		},

		setTouchToggleEnabled: function( enabled ) {
			touchToggleEnabled = enabled;
		}
	};
})();

//auto self-init widgets
$( document ).bind( "pagecreate create", function( event ) {

	if ( $( ":jqmData(position='fixed')", event.target ).length ) {

		$( event.target ).each(function() {

			if ( !$.support.scrollTop || ( $.support.touchOverflow && $.mobile.touchOverflowEnabled ) ) {
				return this;
			}

			var $this = $( this );

			if ( $this.jqmData( "fullscreen" ) ) {
				$this.addClass( "ui-page-fullscreen" );
			}

			// Should be slidedown
			$this.find( slideDownSelector ).addClass( slideDownClass );

			// Should be slideup
			$this.find( slideUpSelector ).addClass( slideUpClass );

		})

	}
});

})( jQuery );
/*
* "fixHeaderFooter" native plugin - Behavior for "fixed" headers,footers, and scrolling inner content
*/

(function( $, undefined ) {

// Enable touch overflow scrolling when it's natively supported
$.mobile.touchOverflowEnabled = false;

// Enabled zoom when touch overflow is enabled. Can cause usability issues, unfortunately
$.mobile.touchOverflowZoomEnabled = false;

$( document ).bind( "pagecreate", function( event ) {
	if( $.support.touchOverflow && $.mobile.touchOverflowEnabled ){
		
		var $target = $( event.target ),
			scrollStartY = 0;
			
		if( $target.is( ":jqmData(role='page')" ) ){
			
			$target.each(function() {
				var $page = $( this ),
					$fixies = $page.find( ":jqmData(role='header'), :jqmData(role='footer')" ).filter( ":jqmData(position='fixed')" ),
					fullScreen = $page.jqmData( "fullscreen" ),
					$scrollElem = $fixies.length ? $page.find( ".ui-content" ) : $page;
				
				$page.addClass( "ui-mobile-touch-overflow" );
				
				$scrollElem.bind( "scrollstop", function(){
					if( $scrollElem.scrollTop() > 0 ){
						window.scrollTo( 0, $.mobile.defaultHomeScroll );
					}
				});	
				
				if( $fixies.length ){
					
					$page.addClass( "ui-native-fixed" );
					
					if( fullScreen ){

						$page.addClass( "ui-native-fullscreen" );

						$fixies.addClass( "fade in" );

						$( document ).bind( "vclick", function(){
							$fixies
								.removeClass( "ui-native-bars-hidden" )
								.toggleClass( "in out" )
								.animationComplete(function(){
									$(this).not( ".in" ).addClass( "ui-native-bars-hidden" );
								});
						});
					}
				}
			});
		}
	}
});

})( jQuery );
/*
* "init" - Initialize the framework
*/

(function( $, window, undefined ) {
	var	$html = $( "html" ),
			$head = $( "head" ),
			$window = $( window );

 	// trigger mobileinit event - useful hook for configuring $.mobile settings before they're used
	$( window.document ).trigger( "mobileinit" );

	// support conditions
	// if device support condition(s) aren't met, leave things as they are -> a basic, usable experience,
	// otherwise, proceed with the enhancements
	if ( !$.mobile.gradeA() ) {
		return;
	}

	// override ajaxEnabled on platforms that have known conflicts with hash history updates
	// or generally work better browsing in regular http for full page refreshes (BB5, Opera Mini)
	if ( $.mobile.ajaxBlacklist ) {
		$.mobile.ajaxEnabled = false;
	}

	// add mobile, initial load "rendering" classes to docEl
	$html.addClass( "ui-mobile ui-mobile-rendering" );

	// loading div which appears during Ajax requests
	// will not appear if $.mobile.loadingMessage is false
	var $loader = $( "<div class='ui-loader ui-body-a ui-corner-all'><span class='ui-icon ui-icon-loading spin'></span><h1></h1></div>" );

	$.extend($.mobile, {
		// turn on/off page loading message.
		showPageLoadingMsg: function() {
			if ( $.mobile.loadingMessage ) {
				var activeBtn = $( "." + $.mobile.activeBtnClass ).first();

				$loader
					.find( "h1" )
						.text( $.mobile.loadingMessage )
						.end()
					.appendTo( $.mobile.pageContainer )
					// position at y center (if scrollTop supported), above the activeBtn (if defined), or just 100px from top
					.css({
						top: $.support.scrollTop && $window.scrollTop() + $window.height() / 2 ||
						activeBtn.length && activeBtn.offset().top || 100
					});
			}

			$html.addClass( "ui-loading" );
		},

		hidePageLoadingMsg: function() {
			$html.removeClass( "ui-loading" );
		},

		// find and enhance the pages in the dom and transition to the first page.
		initializePage: function() {
			// find present pages
			var $pages = $( ":jqmData(role='page')" );

			// if no pages are found, create one with body's inner html
			if ( !$pages.length ) {
				$pages = $( "body" ).wrapInner( "<div data-" + $.mobile.ns + "role='page'></div>" ).children( 0 );
			}

			// add dialogs, set data-url attrs
			$pages.add( ":jqmData(role='dialog')" ).each(function() {
				var $this = $(this);

				// unless the data url is already set set it to the pathname
				if ( !$this.jqmData("url") ) {
					$this.attr( "data-" + $.mobile.ns + "url", $this.attr( "id" ) || location.pathname + location.search );
				}
			});

			// define first page in dom case one backs out to the directory root (not always the first page visited, but defined as fallback)
			$.mobile.firstPage = $pages.first();

			// define page container
			$.mobile.pageContainer = $pages.first().parent().addClass( "ui-mobile-viewport" );

			// alert listeners that the pagecontainer has been determined for binding
			// to events triggered on it
			$window.trigger( "pagecontainercreate" );

			// cue page loading message
			$.mobile.showPageLoadingMsg();

			// if hashchange listening is disabled or there's no hash deeplink, change to the first page in the DOM
			if ( !$.mobile.hashListeningEnabled || !$.mobile.path.stripHash( location.hash ) ) {
				$.mobile.changePage( $.mobile.firstPage, { transition: "none", reverse: true, changeHash: false, fromHashChange: true } );
			}
			// otherwise, trigger a hashchange to load a deeplink
			else {
				$window.trigger( "hashchange", [ true ] );
			}
		}
	});
	
	// This function injects a meta viewport tag to prevent scaling. Off by default, on by default when touchOverflow scrolling is enabled
	function disableZoom() {
		var cont = "user-scalable=no",
			meta = $( "meta[name='viewport']" );
			
		if( meta.length ){
			meta.attr( "content", meta.attr( "content" ) + ", " + cont );
		}
		else{
			$( "head" ).prepend( "<meta>", { "name": "viewport", "content": cont } );
		}
	}
	
	// if touch-overflow is enabled, disable user scaling, as it creates usability issues
	if( $.support.touchOverflow && $.mobile.touchOverflowEnabled && !$.mobile.touchOverflowZoomEnabled ){
		disableZoom();
	}

	// initialize events now, after mobileinit has occurred
	$.mobile._registerInternalEvents();

	// check which scrollTop value should be used by scrolling to 1 immediately at domready
	// then check what the scroll top is. Android will report 0... others 1
	// note that this initial scroll won't hide the address bar. It's just for the check.
	$(function() {
		/*
        window.scrollTo( 0, 1 );

		// if defaultHomeScroll hasn't been set yet, see if scrollTop is 1
		// it should be 1 in most browsers, but android treats 1 as 0 (for hiding addr bar)
		// so if it's 1, use 0 from now on
		$.mobile.defaultHomeScroll = ( !$.support.scrollTop || $(window).scrollTop() === 1 ) ? 0 : 1;
		*/

        // workaround for issue 1673: always show the addressbar on android (android would need defaultHomeScroll==1),
        // as bugfix above does not always work yet...
        $.mobile.defaultHomeScroll = 0;

		//dom-ready inits
		if( $.mobile.autoInitializePage ){
			$.mobile.initializePage();
		}

		// window load event
		// hide iOS browser chrome on load
		$window.load( $.mobile.silentScroll );
	});
})( jQuery, this );

/**
 * jQuery Mobile angularJS adaper v1.0.4
 * http://github.com/tigbro/jquery-mobile-angular-adapter
 *
 * Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
 * Licensed under the MIT license.
 */
(function() {

// Placeholder for the build process
;
/**
 * Simple implementation of require/define assuming all
 * modules are named, in one file and in the correct order.
 * This is just what r.js produces.
 * This implementation is used for creating standalone bundles
 * that do no more require require.js
 */
// This syntax is needed for the namespace function of r.js to work.
var requirejs, require, define;
(function (window) {

    if (typeof define !== "undefined") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }


    var defined = [];
    var def;
    define = def = function(name, deps, value) {
        var dotJs = name.indexOf('.js');
        if (dotJs!==-1) {
            name = name.substring(0, dotJs);
        }
        if (arguments.length==2) {
            // No deps...
            value = deps;
            deps = [];
        }
        if (typeof value === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            value = value.apply(this, args);
        }
        defined[name] = value;
    }

    require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    }

    require.ready = $;
})(window);

/**
 * Wrapper around window.angular.
 */
define('angular',[], function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});

define('jquery',[], function() {
    if (typeof $ !== "undefined") {
        return $;
    }
});

/**
 * Global scope
 */
define('jqmng/globalScope',['jquery', 'angular'], function($, angular) {
    var onCreateListeners = [];

    /**
     * Widget to stop the page compilation at the body
     */
    angular.widget("body", function(element) {
        this.descend(false);
        this.directives(true);
        return function(element) {
            var scope = this;
            for (var i=0; i<onCreateListeners.length; i++) {
                onCreateListeners[i](scope);
            }
        }
    });

    var globalScope;

    /**
     * Return the global scope.
     * This equals the scope of the body element.
     */
    function getGlobalScope() {
        if (!globalScope) {
            globalScope = $("body").scope();
            if (!globalScope) {
                angular.compile($(document))();
            }
            globalScope = $("body").scope();
        }
        return globalScope;
    }

    function onCreate(listener) {
        onCreateListeners.push(listener);
    }

    $.mobile.globalScope = getGlobalScope;

    return {
        globalScope: getGlobalScope,
        onCreate: onCreate
    }
});

define('jqmng/navigate',['jquery', 'angular'], function($, angular) {
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    function callActivateFnOnPageChange(fnName, params) {
        if (fnName) {
            $(document).one("pagebeforechange", function(event, data) {
                var toPageUrl = $.mobile.path.parseUrl( data.toPage );
                var page = $("#"+toPageUrl.hash.substring(1));
                function executeCall() {
                    var scope = page.scope();
                    scope[fnName].apply(scope, params);
                }
                if (!page.data("page")) {
                    page.one("pagecreate", executeCall);
                    return;
                }
                executeCall();
            });
        }
    }

    /*
     * Service for page navigation.
     * @param target has the syntax: [<transition>:]pageId
     * @param activateFunctionName Function to call in the target scope.
     * @param further params Parameters for the function that should be called in the target scope.
     */
    function navigate(target, activateFunctionName) {
        var activateParams = Array.prototype.slice.call(arguments, 2);
        var parts = splitAtFirstColon(target);
        var animation, pageId;
        callActivateFnOnPageChange(activateFunctionName, activateParams);
        if (parts.length === 2 && parts[0] === 'back') {
            var pageId = parts[1];
            var relativeIndex = getIndexInStack(pageId);
            if (relativeIndex === undefined) {
                pageId = jqmChangePage(pageId, undefined);
            } else {
                window.history.go(relativeIndex);
            }
            return;
        } else if (parts.length === 2) {
            animation = parts[0];
            pageId = parts[1];
        } else {
            pageId = parts[0];
            animation = undefined;
        }
        if (pageId === 'back') {
            window.history.go(-1);
        } else {
            jqmChangePage(pageId, animation);
        }
    }

    function jqmChangePage(pageId, animation) {
        if (pageId.charAt(0) !== '#') {
            pageId = '#' + pageId;
        }
        $.mobile.changePage.call($.mobile, pageId, animation);
        return pageId;
    }


    angular.service('$navigate', function() {
        return navigate;
    });

    function getIndexInStack(pageId) {
        var stack = $.mobile.urlHistory.stack;
        var res = 0;
        var pageUrl;
        for (var i = stack.length - 2; i >= 0; i--) {
            pageUrl = stack[i].pageUrl;
            if (pageUrl === pageId) {
                return i - stack.length + 1;
            }
        }
        return undefined;
    }

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param scope
     */
    angular.Object.navigate = function(scope) {
        var service = scope.$service("$navigate");
        if (arguments.length === 2) {
            // used without the test.
            service(arguments[1]);
            return;
        }
        // parse the arguments...
        var test = arguments[1];
        var outcomes = {};
        var parts;
        for (var i = 2; i < arguments.length; i++) {
            parts = splitAtFirstColon(arguments[i]);
            outcomes[parts[0]] = parts[1];
        }
        if (test && test.then) {
            // test is a promise.
            test.then(function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.success) {
                    service(outcomes.success);
                }
            }, function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.failure) {
                    service(outcomes.failure);
                }
            });
        } else {
            if (outcomes[test]) {
                service(outcomes[test]);
            } else if (test !== false && outcomes.success) {
                service(outcomes.success);
            } else if (test === false && outcomes.failure) {
                service(outcomes.failure);
            }
        }
    };

    return navigate;

});

/*
 * waitdialog service.
 */
define('jqmng/waitDialog',['jquery'], function($) {
    var showCalls = [];

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            lastCall.callback.apply(this, arguments);
        }
        // This is required to prevent a second
        // click event, see
        // https://github.com/jquery/jquery-mobile/issues/1787
        event.preventDefault();
    }

    var loadDialog;

    function initIfNeeded() {
        if (!loadDialog || loadDialog.length == 0) {
            loadDialog = $(".ui-loader");
            loadDialog.bind('vclick', onClick);
        }
    }

    if (!$.mobile.loadingMessageWithCancel) {
        $.mobile.loadingMessageWithCancel = 'Loading. Click to cancel.';
    }

    function updateUi() {
        initIfNeeded();
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var msg = lastCall.msg;
            $.mobile.loadingMessage = msg;
            $.mobile.showPageLoadingMsg();
        } else {
            $.mobile.hidePageLoadingMsg();
        }
    }

    /**
     * jquery mobile hides the wait dialog when pages are transitioned.
     * This immediately closes wait dialogs that are opened in the pagebeforeshow event.
     */
    $('div').live('pageshow', function(event, ui) {
        updateUi();
    });

    /**
     *
     * @param msg (optional)
     * @param tapCallback (optional)
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] == 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] == 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] == 'function') {
            tapCallback = arguments[1];
        }
        if (!msg) {
            msg = $.mobile.loadingMessage;
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUi();
    }

    function hide() {
        showCalls.pop();
        updateUi();
    }

    /**
     *
     * @param promise
     * @param msg (optional)
     */
    function waitFor(promise, msg) {
        show();
        promise.always(function() {
            hide();
        });
    }

    /**
     *
     * @param promise
     * @param cancelData
     * @param msg (optional)
     */
    function waitForWithCancel(promise, cancelData, msg) {
        if (!msg) {
            msg = $.mobile.loadingMessageWithCancel;
        }
        show(msg, function() {
            promise.reject(cancelData);
        });
        promise.always(function() {
            hide();
        });
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel
    };

    angular.service('$waitDialog', function() {
        return res;
    });

    return res;
});

define('jqmng/event',['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ngm:event')('{vclick:"' + expression+'"}', element);
    });

    /**
     * A widget to bind general events like touches, ....
     */
    angular.directive("ngm:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

        var linkFn = function($updateView, element) {
            var self = this;
            for (var eventType in eventHandlers) {
                    (function(eventType) {
                        var handler = eventHandlers[eventType];
                        element.bind(eventType, function(event) {
                            var res = self.$tryEval(handler, element);
                            $updateView();
                            if (eventType.charAt(0)=='v') {
                                // This is required to prevent a second
                                // click event, see
                                // https://github.com/jquery/jquery-mobile/issues/1787
                                event.preventDefault();
                            }
                        });
                    })(eventType);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });
});

define('jqmng/fadein',['angular'], function(angular) {
    /*
     * Directive that fades in an element when angular
     * uses it. Useful in templating when the underlying template changed.
     */
    angular.directive("ngm:fadein", function(expression, element) {
        this.directives(true);
        this.descend(true);
        element.css({opacity:0.1});
        return function(element) {
            element.animate({opacity:1.0}, parseInt(expression));
        };
    });

});

/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
define('jqmng/if',['angular'], function(angular) {
    angular.Object.iff = function(self, test, trueCase, falseCase) {
        if (test) {
            return trueCase;
        } else {
            return falseCase;
        }
    }

    angular.widget('@ngm:if', function(expression, element) {
        var newExpr = 'ngmif in $iff(' + expression + ",[1],[])";
        element.removeAttr('ngm:if');
        return angular.widget('@ng:repeat').call(this, newExpr, element);
    });
});

/**
 * Paging Support for lists.
 * Note that this will cache the result of two calls until the next eval cycle
 * or a change to the filter or orderBy arguments.
 * <p>
 * Operations on the result:
 * - hasMorePages: returns whether there are more pages that can be loaded via loadNextPage
 * - loadNextPage: Loads the next page of the list
 *
 * Usage:
 <li ng:repeat="l in list.$paged()">{{l}}</li>
 <li ngm:if="list.$paged().hasMorePages()">
 <a href="#" ngm:click="list.$paged().loadNextPage()">Load more</a>
 </li>
 */
define('jqmng/paging',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    /**
     * The default page size for all lists.
     * Can be overwritten using array.pageSize.
     */
    if (!$.mobile.defaultListPageSize) {
        $.mobile.defaultListPageSize = 10;
    }

    var globalEvalId = 0;
    globalScope.onCreate(function(scope) {
        scope.$onEval(-99999, function() {
            globalEvalId++;
        });
    });

    var enhanceFunctions = {
        init : init,
        refresh : refresh,
        refreshIfNeeded : refreshIfNeeded,
        setFilter : setFilter,
        setOrderBy : setOrderBy,
        loadNextPage : loadNextPage,
        hasMorePages : hasMorePages,
        reset : reset
    };

    var usedProps = {
        pageSize: true,
        originalList: true,
        refreshNeeded: true,
        filter: true,
        orderBy: true,
        loadedCount: true,
        availableCount: true,
        evalId: true
    }


    function createPagedList(list) {
        var res = [];
        for (var fnName in enhanceFunctions) {
            res[fnName] = enhanceFunctions[fnName];
        }
        res.init(list);
        var oldHasOwnProperty = res.hasOwnProperty;
        res.hasOwnProperty = function(propName) {
            if (propName in enhanceFunctions || propName in usedProps) {
                return false;
            }
            return oldHasOwnProperty.apply(this, arguments);
        }
        return res;
    }

    function init(list) {
        if (list.pageSize) {
            this.pageSize = list.pageSize;
        } else {
            this.pageSize = $.mobile.defaultListPageSize;
        }
        this.originalList = list;
        this.refreshNeeded = true;
        this.reset();
    }

    function refresh() {
        var list = this.originalList;
        if (this.filter) {
            list = angular.Array.filter(list, this.filter);
        }
        if (this.orderBy) {
            list = angular.Array.orderBy(list, this.orderBy);
        }
        var loadedCount = this.loadedCount;
        if (loadedCount<this.pageSize) {
            loadedCount = this.pageSize;
        }
        if (loadedCount>list.length) {
            loadedCount = list.length;
        }
        this.loadedCount = loadedCount;
        this.availableCount = list.length;
        var newData = list.slice(0, loadedCount);
        var spliceArgs = [0, this.length].concat(newData);
        this.splice.apply(this, spliceArgs);
    }

    function refreshIfNeeded() {
        if (this.evalId != globalEvalId) {
            this.refreshNeeded = true;
            this.evalId = globalEvalId;
        }
        if (this.refreshNeeded) {
            this.refresh();
            this.refreshNeeded = false;
        }
        return this;
    }

    function setFilter(filterExpr) {
        if (!angular.Object.equals(this.filter, filterExpr)) {
            this.filter = filterExpr;
            this.refreshNeeded = true;
        }
    }

    function setOrderBy(orderBy) {
        if (!angular.Object.equals(this.orderBy, orderBy)) {
            this.orderBy = orderBy;
            this.refreshNeeded = true;
        }
    }

    function loadNextPage() {
        this.loadedCount = this.loadedCount + this.pageSize;
        this.refreshNeeded = true;
    }

    function hasMorePages() {
        this.refreshIfNeeded();
        return this.loadedCount < this.availableCount;
    }

    function reset() {
        this.loadedCount = 0;
        this.refreshNeeded = true;
    }

    /**
     * Returns the already loaded pages.
     * Also includes filtering (second argument) and ordering (third argument),
     * as the standard angular way does not work with paging.
     *
     * Does caching: Evaluates the filter and order expression only once in an eval cycle.
     * ATTENTION: There can only be one paged list per original list.
     */
    angular.Array.paged = function(list, filter, orderBy) {
        var pagedList = list.pagedList;
        if (!pagedList) {
            pagedList = createPagedList(list);
            list.pagedList = pagedList;
        }
        pagedList.setFilter(filter);
        pagedList.setOrderBy(orderBy);
        pagedList.refreshIfNeeded();
        return pagedList;

    };
});

define('jqmng/sharedController',['angular'], function(angular) {
    function findCtrlFunction(name) {
        var parts = name.split('.');
        var base = window;
        var part;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            base = base[part];
        }
        return base;
    }

    function sharedCtrl(rootScope, name) {
        var ctrl = findCtrlFunction(name);
        var instance = rootScope[name];
        if (!instance) {
            instance = rootScope.$new(ctrl);
            rootScope[name] = instance;
        }
        return instance;
    }

    function parseSharedControllersExpression(expression) {
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        var controllers = {}
        while (match = pattern.exec(expression)) {
            hasData = true;
            controllers[match[1]] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <name>:<controller>,...";
        }
        return controllers;
    }

    angular.directive('ngm:shared-controller', function(expression) {
        this.scope(true);
        var controllers = parseSharedControllersExpression(expression);
        return function(element) {
            var scope = this;
            for (var name in controllers) {
                scope[name] = sharedCtrl(scope.$root, controllers[name]);
            }
        }

    });
});

/**
 * Integration of the page widget.
 */
define('jqmng/widgets/pageCompile',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    // redirect all events from the page widget,
    // so we can intercept them.
    $.mobile.page.prototype.widgetEventPrefix = 'jqmngpage';

    /**
     * This is a copy of the degrade inputs plugin of jquery
     * mobile. We need it here to execute this replacement
     * at the right time, i.e. before we do the page compile with
     * angular.
     * @param targetPage
     */
    function degradeInputs(targetPage) {
        var page = targetPage.data("page"), options;

        if (!page) {
            return;
        }

        options = page.options;

        // degrade inputs to avoid poorly implemented native functionality
        targetPage.find("input").not(page.keepNativeSelector()).each(function() {
            var $this = $(this),
                type = this.getAttribute("type"),
                optType = options.degradeInputs[ type ] || "text";

            if (options.degradeInputs[ type ]) {
                var html = $("<div>").html($this.clone()).html(),
                    // In IE browsers, the type sometimes doesn't exist in the cloned markup, so we replace the closing tag instead
                    hasType = html.indexOf(" type=") > -1,
                    findstr = hasType ? /\s+type=["']?\w+['"]?/ : /\/?>/,
                    repstr = " type=\"" + optType + "\" data-" + $.mobile.ns + "type=\"" + type + "\"" + ( hasType ? "" : ">" );

                $this.replaceWith(html.replace(findstr, repstr));
            }
        });
    }

    $('div').live('jqmngpagecreate', function(event) {
        var page = $(event.target);
        var parentScope = globalScope.globalScope();
        var childScope = angular.scope(parentScope);
        degradeInputs(page);
        angular.compile(page)(childScope);
        parentScope.$eval();
        // The second pagecreate does only initialize
        // the widgets that we did not already create by angular.
        page.trigger("pagecreate");
    });

    $('div').live('jqmngpagebeforeshow', function(event, data) {
        var currPageScope = $(event.target).scope();
        if (currPageScope) {
            currScope = currPageScope;
            currScope.$service("$updateView")();
        }
        var page = $(event.target);
        page.trigger("pagebeforeshow", data);
    });

    $('div').live('jqmngpagebeforehide', function(event, data) {
        var page = $(event.target);
        page.trigger("pagebeforehide", data);
    });

    $('div').live('jqmngpagehide', function(event, data) {
        var page = $(event.target);
        page.trigger("pagehide", data);
    });

    $('div').live('jqmngpageshow', function(event, data) {
        var page = $(event.target);
        page.trigger("pageshow", data);
    });

    /**
     * Create jquery elements when elements were added to the dom.
     */
    $(document).bind('elementsAdded', function(event) {
        $(event.target).trigger('create');
    });

    var currScope = null;
    // The eval function of the global scope should eval
    // the active scope only.
    globalScope.onCreate(function(scope) {
        scope.$onEval(function() {
            // Note that wen cannot use $.mobile.activePage here,
            // as this is not set until the pageshow event, but
            // our pages are created before this!
            if (currScope) {
                currScope.$eval();
            }
        });
    });

    /**
     * Deactivate the url changing capabilities
     * of angular, so we do not get into trouble with
     * jquery mobile: angular saves the current url before a $eval
     * and updates the url after the $eval.
     * <p>
     * This also replaces the hashListen implementation
     * of angular by the jquery mobile impementation,
     * so we do not have two polling functions, ...
     * <p>
     * Attention: By this, urls can no more be changed via angular's $location service!
     */
    (function(angular) {
        var oldBrowser = angular.service("$browser");
        angular.service("$browser", function() {
            var res = oldBrowser.apply(this, arguments);
            res.onHashChange = function(handler) {
                $(window).bind('hashchange', handler);
                return handler;
            };
            res.setUrl = function() {
            };
            return res;
        }, {$inject:['$log']});
    })(angular);
});

/**
 * Helper functions for proxying jquery widgets and angular widgets.
 */
define('jqmng/widgets/widgetProxyUtil',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    /**
     * Creates a proxy around an existing angular widget.
     * Needed to use the angular functionalities like disabled handling,
     * invalidWidgets marking, formatting and validation.
     * @param tagname
     * @param compileFn
     */
    function createAngularWidgetProxy(tagname, compileFn) {

        var oldWidget = angular.widget(tagname);
        angular.widget(tagname, function() {
            var oldBinder;
            var bindFn = compileFn.apply(this, arguments);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder && oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var self = this;
                var myargs = arguments;
                var oldBinderCalled = false;
                var res;
                if (bindFn) {
                    res = bindFn.call(this, element, function() {
                        oldBinderCalled = true;
                        return oldBinder && oldBinder.apply(self, myargs);
                    });
                }
                if (!oldBinderCalled) {
                    return oldBinder && oldBinder.apply(self, myargs);
                }
                return res;
            }
            // execute the angular compiler after our compiler!
            oldBinder = oldWidget && oldWidget.apply(this, arguments);
            if (!oldWidget) {
                this.descend(true);
                this.directives(true);
            }

            newBinder.$inject = oldBinder && oldBinder.$inject;
            return newBinder;
        });
    }

    /**
     * Creates a proxy around an existing angular directive.
     * Needed e.g. to intercept the disabled handling, ...
     * @param directiveName
     * @param compileFn
     */
    function createAngularDirectiveProxy(directiveName, compileFn) {
        var oldDirective = angular.directive(directiveName);
        angular.directive(directiveName, function(expression) {
            var oldBinder = oldDirective.apply(this, arguments);
            var bindFn = compileFn(expression);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var scope = this;
                var res = oldBinder.apply(this, arguments);
                bindFn.call(this, element);
                return res;
            }
            newBinder.$inject = oldBinder.$inject;
            return newBinder;
        });
    }

    return {
        createAngularDirectiveProxy: createAngularDirectiveProxy,
        createAngularWidgetProxy: createAngularWidgetProxy
    }
});

define('jqmng/widgets/angularRepeat',['jqmng/widgets/widgetProxyUtil'], function(proxyUtil) {
    /**
     * Modify original ng:repeat so that all created items directly have a parent
     * (old style repeat). This is slower, however simplifies the integration with jquery mobile a lot!
     * <p>
     * This will furthermore create the events "elementsAdded" and "elementsRemoved" if
     * elements were added or deleted (only once per eval).
     * <p>
     * This also takes care for jquery widgets wrapping themselves into other elements
     * (e.g. setting a div as new parent).
     */
    angular.widget('@ng:repeat', function(expression, element) {
        element.removeAttr('ng:repeat');
        element.replaceWith(angular.element('<!-- ng:repeat: ' + expression + ' -->'));
        var linker = this.compile(element);
        return function(iterStartElement) {
            var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                lhs, rhs, valueIdent, keyIdent;
            if (! match) {
                throw Error("Expected ng:repeat in form of '_item_ in _collection_' but got '" +
                    expression + "'.");
            }
            lhs = match[1];
            rhs = match[2];
            match = lhs.match(/^([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\)$/);
            if (!match) {
                throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
                    rhs + "'.");
            }
            valueIdent = match[3] || match[1];
            keyIdent = match[2];
            var children = [], currentScope = this;
            var parent = iterStartElement.parent();
            this.$onEval(function() {
                var index = 0,
                    childCount = children.length,
                    lastIterElement = iterStartElement,
                    collection = this.$tryEval(rhs, iterStartElement),
                    collectionLength = angular.Array.size(collection, true),
                    childScope,
                    key;
                var addedElements = [];
                var removedElements = [];

                for (key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        if (index < childCount) {
                            // reuse existing child
                            childScope = children[index];
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            lastIterElement = childScope.$element;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            childScope.$eval();
                        } else {
                            // grow children
                            childScope = angular.scope(currentScope);
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            childScope.$index = index;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            children.push(childScope);
                            linker(childScope, function(clone) {
                                clone.attr('ng:repeat-index', index);

                                // Always use old way for jquery mobile, so
                                // that new elements instantly have a connection to the document root.
                                // Some jquery mobile widgets add new parents.
                                // Compensate this for adding.
                                var appendPosition = lastIterElement;
                                while (appendPosition.length>0 && appendPosition.parent()[0]!==parent[0]) {
                                    appendPosition = appendPosition.parent();
                                }
                                appendPosition.after(clone);
                                lastIterElement = clone;
                            });
                            addedElements.push(lastIterElement);
                        }
                        index ++;
                    }
                }

                // shrink children
                while (children.length > index) {
                    // Sencha Integration: Destroy widgets
                    var child = children.pop();
                    var childElement = child.$element;
                    removedElements.push(childElement);
                    childElement.remove();
                }

                if (addedElements.length>0) {
                    parent.trigger('elementsAdded', addedElements);
                } else if (removedElements.length>0) {
                    parent.trigger('elementsRemoved', removedElements);
                }
            }, iterStartElement);
        };
    });


});

define('jqmng/widgets/angularInput',[
    'jquery', 'jqmng/widgets/widgetProxyUtil'
],
    function($, proxyUtil) {
        function isCheckboxRadio(element) {
            return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

        }
        function isTextInput(element) {
            return element.filter($.mobile.textinput.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
        }

        var oldInput = angular.widget("input");
        angular.widget("input", function(element) {
            var textinput = isTextInput(element);
            var checkboxRadio = isCheckboxRadio(element);

            var name = element.attr('name');
            var type = element[0].type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (textinput) {
                type = 'text';
            }
            // We fake an element during compile phase, as setting the type attribute
            // is not allowed by the dom (although it works in many browsers...)
            var fakeElement = [{type: type}];
            var origBinder = oldInput.call(this, fakeElement);
            var newBinder = function() {
                var scope = this;
                var element = arguments[newBinder.$inject.length];
                if (checkboxRadio) {
                    // Angular binds to the click event for radio and check boxes,
                    // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                    // and no more to the click event, as the click event is too early / jqm has not updated
                    // the checked status.
                    var origBind = element.bind;
                    element.bind = function(events, callback) {
                        if (events.indexOf('click') != -1) {
                            events = "change";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                var res = origBinder.apply(this, arguments);
                // Watch the name and refresh the widget if needed
                if (name) {
                    scope.$watch(name, function(value) {
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    });
                }
                return res;
            };
            newBinder.$inject = origBinder.$inject || [];
            return newBinder;
        });

    });

define('jqmng/widgets/angularSelect',[
    'jqmng/widgets/widgetProxyUtil'
], function(proxyUtil) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var scope = this;
            var res = origBinder();
            var oldVal;
            if (name) {
                // Note: We cannot use $watch here, as ng:options uses $onEval to change the options,
                // and that gets executed after the $watch.
                scope.$onEval(function() {
                    var newVal = scope.$eval(name);
                    if (newVal!==oldVal) {
                        oldVal = newVal;
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    }
                });
            }

            return res;
        }
    });

});

define('jqmng/widgets/disabledHandling',[
    'jqmng/widgets/widgetProxyUtil'
], function(widgetProxyUtil) {
    widgetProxyUtil.createAngularDirectiveProxy('ng:bind-attr', function(expression) {
        var regex = /([^:{'"]+)/;
        var attr = regex.exec(expression)[1];
        if (attr !== 'disabled') {
            return function() {

            };
        } else {
            return function(element) {
                var scope = this;
                var oldValue;
                // Note: We cannot use scope.$watch here:
                // We want to be called after the proxied angular implementation, and
                // that uses $onEval. $watch always gets evaluated before $onEval.
                scope.$onEval(function() {
                    var value = element.attr(attr);
                    if (value != oldValue) {
                        oldValue = value;
                        var jqmOperation = value?"disable":"enable";
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget[jqmOperation]) {
                                element[key](jqmOperation);
                            }
                        }
                    }
                });
            }
        }
    });
});

define('jqmng/widgets/jqmButton',[
    'jquery'
], function($) {
    // Button wraps the actual button into another div that is stored in the
    // "button" property.
    var fn = $.mobile.button.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        oldDestroy.apply(this, arguments);
        this.button.remove();
    };

});

define('jqmng/widgets/jqmListView',[
    'jquery'
], function($) {
    // Listview may create subpages that need to be removed when the widget is destroyed.
    var fn = $.mobile.listview.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = this.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" +id+"-");
        var childPages = this.childPages();
        oldDestroy.apply(this, arguments);
        for (var i=0; i<childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    };
    var oldCreate = fn._create;
    fn._create = function() {
        var self = this;
        var res = oldCreate.apply(this, arguments);
        // refresh the list when the children change
        this.element.bind('elementsAdded elementsRemoved', function(event) {
            event.stopPropagation();
            self.refresh();
        });
    };
});

define('jqmng/widgets/jqmSelectMenu',['jquery'], function($) {

    // selectmenu may create:
    // - parent element
    var fn = $.mobile.selectmenu.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        var parent = this.element.closest(".ui-select");
        var menuPage = this.menuPage;
        var screen = this.screen;
        var listbox = this.listbox;
        oldDestroy.apply(this, arguments);
        parent && parent.remove();
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    };
    var oldCreate = fn._create;
    fn._create = function() {
        var res = oldCreate.apply(this, arguments);
        var self = this;

        // Note: We cannot use the prototype here,
        // as there is a plugin in jquery mobile that overwrites
        // the open functions...
        var oldOpen = self.open;
        self.open = function() {
            this.refresh();
            return oldOpen.apply(this, arguments);
        };
    };
});

define('jqmng/widgets/jqmSlider',['jquery'], function($) {
    // Button wraps the actual button into another div that is stored in the
    // "slider" property.
    var fn = $.mobile.slider.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        oldDestroy.apply(this, arguments);
        this.slider.remove();
    };
});

define('jqmng/jqmngStyle',[], function() {
    /* Special styles for jquery-mobile-angular-adapter */
    /* Don't show the angular validation popup */
    // TODO use the css plugin for this...
    var styles =
        "#ng-callout {display: none}";
    $('head').append('<style type=\"text/css\">' + styles + '</style>');

});

// Wrapper module as facade for the internal modules.
define('jqm-angular',[
    'angular',
    'jquery',
    'jqmng/globalScope',
    'jqmng/navigate',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/sharedController',
    'jqmng/widgets/pageCompile',
    'jqmng/widgets/angularRepeat',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/jqmButton',
    'jqmng/widgets/jqmListView',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider',
    'jqmng/jqmngStyle'
]);
})();
