"use strict";
exports.id = 170;
exports.ids = [170];
exports.modules = {

/***/ 64278:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    prefixes: function() {
        return prefixes;
    },
    wait: function() {
        return wait;
    },
    error: function() {
        return error;
    },
    warn: function() {
        return warn;
    },
    ready: function() {
        return ready;
    },
    info: function() {
        return info;
    },
    event: function() {
        return event;
    },
    trace: function() {
        return trace;
    },
    warnOnce: function() {
        return warnOnce;
    }
});
const _chalk = /*#__PURE__*/ _interop_require_default(__webpack_require__(26310));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const prefixes = {
    wait: "- " + _chalk.default.cyan("wait"),
    error: "- " + _chalk.default.red("error"),
    warn: "- " + _chalk.default.yellow("warn"),
    ready: "- " + _chalk.default.green("ready"),
    info: "- " + _chalk.default.cyan("info"),
    event: "- " + _chalk.default.magenta("event"),
    trace: "- " + _chalk.default.magenta("trace")
};
function wait(...message) {
    console.log(prefixes.wait, ...message);
}
function error(...message) {
    console.error(prefixes.error, ...message);
}
function warn(...message) {
    console.warn(prefixes.warn, ...message);
}
function ready(...message) {
    console.log(prefixes.ready, ...message);
}
function info(...message) {
    console.log(prefixes.info, ...message);
}
function event(...message) {
    console.log(prefixes.event, ...message);
}
function trace(...message) {
    console.log(prefixes.trace, ...message);
}
const warnOnceMessages = new Set();
function warnOnce(...message) {
    if (!warnOnceMessages.has(message[0])) {
        warnOnceMessages.add(message.join(" "));
        warn(...message);
    }
} //# sourceMappingURL=log.js.map


/***/ }),

/***/ 18035:
/***/ ((module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    RSC: function() {
        return RSC;
    },
    ACTION: function() {
        return ACTION;
    },
    NEXT_ROUTER_STATE_TREE: function() {
        return NEXT_ROUTER_STATE_TREE;
    },
    NEXT_ROUTER_PREFETCH: function() {
        return NEXT_ROUTER_PREFETCH;
    },
    NEXT_URL: function() {
        return NEXT_URL;
    },
    FETCH_CACHE_HEADER: function() {
        return FETCH_CACHE_HEADER;
    },
    RSC_CONTENT_TYPE_HEADER: function() {
        return RSC_CONTENT_TYPE_HEADER;
    },
    RSC_VARY_HEADER: function() {
        return RSC_VARY_HEADER;
    },
    FLIGHT_PARAMETERS: function() {
        return FLIGHT_PARAMETERS;
    },
    NEXT_RSC_UNION_QUERY: function() {
        return NEXT_RSC_UNION_QUERY;
    }
});
const RSC = "RSC";
const ACTION = "Next-Action";
const NEXT_ROUTER_STATE_TREE = "Next-Router-State-Tree";
const NEXT_ROUTER_PREFETCH = "Next-Router-Prefetch";
const NEXT_URL = "Next-Url";
const FETCH_CACHE_HEADER = "x-vercel-sc-headers";
const RSC_CONTENT_TYPE_HEADER = "text/x-component";
const RSC_VARY_HEADER = RSC + ", " + NEXT_ROUTER_STATE_TREE + ", " + NEXT_ROUTER_PREFETCH;
const FLIGHT_PARAMETERS = [
    [
        RSC
    ],
    [
        NEXT_ROUTER_STATE_TREE
    ],
    [
        NEXT_ROUTER_PREFETCH
    ]
];
const NEXT_RSC_UNION_QUERY = "_rsc";
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=app-router-headers.js.map


/***/ }),

/***/ 58670:
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "DraftMode", ({
    enumerable: true,
    get: function() {
        return DraftMode;
    }
}));
const _staticgenerationbailout = __webpack_require__(9665);
class DraftMode {
    get isEnabled() {
        return this._provider.isEnabled;
    }
    enable() {
        if ((0, _staticgenerationbailout.staticGenerationBailout)("draftMode().enable()")) {
            return;
        }
        return this._provider.enable();
    }
    disable() {
        if ((0, _staticgenerationbailout.staticGenerationBailout)("draftMode().disable()")) {
            return;
        }
        return this._provider.disable();
    }
    constructor(provider){
        this._provider = provider;
    }
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=draft-mode.js.map


/***/ }),

/***/ 10525:
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    headers: function() {
        return headers;
    },
    cookies: function() {
        return cookies;
    },
    draftMode: function() {
        return draftMode;
    }
});
const _requestcookies = __webpack_require__(17766);
const _headers = __webpack_require__(3356);
const _cookies = __webpack_require__(39072);
const _requestasyncstorage = __webpack_require__(99741);
const _actionasyncstorage = __webpack_require__(96899);
const _staticgenerationbailout = __webpack_require__(9665);
const _draftmode = __webpack_require__(58670);
function headers() {
    if ((0, _staticgenerationbailout.staticGenerationBailout)("headers")) {
        return _headers.HeadersAdapter.seal(new Headers({}));
    }
    const requestStore = _requestasyncstorage.requestAsyncStorage.getStore();
    if (!requestStore) {
        throw new Error("Invariant: Method expects to have requestAsyncStorage, none available");
    }
    return requestStore.headers;
}
function cookies() {
    if ((0, _staticgenerationbailout.staticGenerationBailout)("cookies")) {
        return _requestcookies.RequestCookiesAdapter.seal(new _cookies.RequestCookies(new Headers({})));
    }
    const requestStore = _requestasyncstorage.requestAsyncStorage.getStore();
    if (!requestStore) {
        throw new Error("Invariant: Method expects to have requestAsyncStorage, none available");
    }
    const asyncActionStore = _actionasyncstorage.actionAsyncStorage.getStore();
    if (asyncActionStore && (asyncActionStore.isAction || asyncActionStore.isAppRoute)) {
        // We can't conditionally return different types here based on the context.
        // To avoid confusion, we always return the readonly type here.
        return requestStore.mutableCookies;
    }
    return requestStore.cookies;
}
function draftMode() {
    const requestStore = _requestasyncstorage.requestAsyncStorage.getStore();
    if (!requestStore) {
        throw new Error("Invariant: Method expects to have requestAsyncStorage, none available");
    }
    return new _draftmode.DraftMode(requestStore.draftMode);
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=headers.js.map


/***/ }),

/***/ 13693:
/***/ ((module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    notFound: function() {
        return notFound;
    },
    isNotFoundError: function() {
        return isNotFoundError;
    }
});
const NOT_FOUND_ERROR_CODE = "NEXT_NOT_FOUND";
function notFound() {
    // eslint-disable-next-line no-throw-literal
    const error = new Error(NOT_FOUND_ERROR_CODE);
    error.digest = NOT_FOUND_ERROR_CODE;
    throw error;
}
function isNotFoundError(error) {
    return (error == null ? void 0 : error.digest) === NOT_FOUND_ERROR_CODE;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=not-found.js.map


/***/ }),

/***/ 8104:
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    RedirectType: function() {
        return RedirectType;
    },
    getRedirectError: function() {
        return getRedirectError;
    },
    redirect: function() {
        return redirect;
    },
    isRedirectError: function() {
        return isRedirectError;
    },
    getURLFromRedirectError: function() {
        return getURLFromRedirectError;
    },
    getRedirectTypeFromError: function() {
        return getRedirectTypeFromError;
    }
});
const _requestasyncstorage = __webpack_require__(99741);
const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";
var RedirectType;
(function(RedirectType) {
    RedirectType["push"] = "push";
    RedirectType["replace"] = "replace";
})(RedirectType || (RedirectType = {}));
function getRedirectError(url, type) {
    const error = new Error(REDIRECT_ERROR_CODE);
    error.digest = REDIRECT_ERROR_CODE + ";" + type + ";" + url;
    const requestStore = _requestasyncstorage.requestAsyncStorage.getStore();
    if (requestStore) {
        error.mutableCookies = requestStore.mutableCookies;
    }
    return error;
}
function redirect(url, type) {
    if (type === void 0) type = "replace";
    throw getRedirectError(url, type);
}
function isRedirectError(error) {
    if (typeof (error == null ? void 0 : error.digest) !== "string") return false;
    const [errorCode, type, destination] = error.digest.split(";", 3);
    return errorCode === REDIRECT_ERROR_CODE && (type === "replace" || type === "push") && typeof destination === "string";
}
function getURLFromRedirectError(error) {
    if (!isRedirectError(error)) return null;
    // Slices off the beginning of the digest that contains the code and the
    // separating ';'.
    return error.digest.split(";", 3)[2];
}
function getRedirectTypeFromError(error) {
    if (!isRedirectError(error)) {
        throw new Error("Not a redirect error");
    }
    return error.digest.split(";", 3)[1];
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=redirect.js.map


/***/ }),

/***/ 14079:
/***/ ((module) => {


var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = (to, from, except, desc)=>{
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: ()=>from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
    return to;
};
var __toCommonJS = (mod)=>__copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
// src/index.ts
var src_exports = {};
__export(src_exports, {
    RequestCookies: ()=>RequestCookies,
    ResponseCookies: ()=>ResponseCookies
});
module.exports = __toCommonJS(src_exports);
// src/serialize.ts
function serialize(c) {
    var _a;
    const attrs = [
        "path" in c && c.path && `Path=${c.path}`,
        "expires" in c && (c.expires || c.expires === 0) && `Expires=${(typeof c.expires === "number" ? new Date(c.expires) : c.expires).toUTCString()}`,
        "maxAge" in c && typeof c.maxAge === "number" && `Max-Age=${c.maxAge}`,
        "domain" in c && c.domain && `Domain=${c.domain}`,
        "secure" in c && c.secure && "Secure",
        "httpOnly" in c && c.httpOnly && "HttpOnly",
        "sameSite" in c && c.sameSite && `SameSite=${c.sameSite}`
    ].filter(Boolean);
    return `${c.name}=${encodeURIComponent((_a = c.value) != null ? _a : "")}; ${attrs.join("; ")}`;
}
function parseCookieString(cookie) {
    const map = /* @__PURE__ */ new Map();
    for (const pair of cookie.split(/; */)){
        if (!pair) continue;
        const splitAt = pair.indexOf("=");
        if (splitAt === -1) {
            map.set(pair, "true");
            continue;
        }
        const [key, value] = [
            pair.slice(0, splitAt),
            pair.slice(splitAt + 1)
        ];
        try {
            map.set(key, decodeURIComponent(value != null ? value : "true"));
        } catch  {}
    }
    return map;
}
function parseSetCookieString(setCookie) {
    if (!setCookie) {
        return void 0;
    }
    const [[name, value], ...attributes] = parseCookieString(setCookie);
    const { domain, expires, httponly, maxage, path, samesite, secure } = Object.fromEntries(attributes.map(([key, value2])=>[
            key.toLowerCase(),
            value2
        ]));
    const cookie = {
        name,
        value: decodeURIComponent(value),
        domain,
        ...expires && {
            expires: new Date(expires)
        },
        ...httponly && {
            httpOnly: true
        },
        ...typeof maxage === "string" && {
            maxAge: Number(maxage)
        },
        path,
        ...samesite && {
            sameSite: parseSameSite(samesite)
        },
        ...secure && {
            secure: true
        }
    };
    return compact(cookie);
}
function compact(t) {
    const newT = {};
    for(const key in t){
        if (t[key]) {
            newT[key] = t[key];
        }
    }
    return newT;
}
var SAME_SITE = [
    "strict",
    "lax",
    "none"
];
function parseSameSite(string) {
    string = string.toLowerCase();
    return SAME_SITE.includes(string) ? string : void 0;
}
// src/request-cookies.ts
var RequestCookies = class {
    constructor(requestHeaders){
        /** @internal */ this._parsed = /* @__PURE__ */ new Map();
        this._headers = requestHeaders;
        const header = requestHeaders.get("cookie");
        if (header) {
            const parsed = parseCookieString(header);
            for (const [name, value] of parsed){
                this._parsed.set(name, {
                    name,
                    value
                });
            }
        }
    }
    [Symbol.iterator]() {
        return this._parsed[Symbol.iterator]();
    }
    /**
   * The amount of cookies received from the client
   */ get size() {
        return this._parsed.size;
    }
    get(...args) {
        const name = typeof args[0] === "string" ? args[0] : args[0].name;
        return this._parsed.get(name);
    }
    getAll(...args) {
        var _a;
        const all = Array.from(this._parsed);
        if (!args.length) {
            return all.map(([_, value])=>value);
        }
        const name = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
        return all.filter(([n])=>n === name).map(([_, value])=>value);
    }
    has(name) {
        return this._parsed.has(name);
    }
    set(...args) {
        const [name, value] = args.length === 1 ? [
            args[0].name,
            args[0].value
        ] : args;
        const map = this._parsed;
        map.set(name, {
            name,
            value
        });
        this._headers.set("cookie", Array.from(map).map(([_, value2])=>serialize(value2)).join("; "));
        return this;
    }
    /**
   * Delete the cookies matching the passed name or names in the request.
   */ delete(names) {
        const map = this._parsed;
        const result = !Array.isArray(names) ? map.delete(names) : names.map((name)=>map.delete(name));
        this._headers.set("cookie", Array.from(map).map(([_, value])=>serialize(value)).join("; "));
        return result;
    }
    /**
   * Delete all the cookies in the cookies in the request.
   */ clear() {
        this.delete(Array.from(this._parsed.keys()));
        return this;
    }
    /**
   * Format the cookies in the request as a string for logging
   */ [Symbol.for("edge-runtime.inspect.custom")]() {
        return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
    }
    toString() {
        return [
            ...this._parsed.values()
        ].map((v)=>`${v.name}=${encodeURIComponent(v.value)}`).join("; ");
    }
};
// src/response-cookies.ts
var ResponseCookies = class {
    constructor(responseHeaders){
        /** @internal */ this._parsed = /* @__PURE__ */ new Map();
        var _a, _b, _c;
        this._headers = responseHeaders;
        const setCookie = // @ts-expect-error See https://github.com/whatwg/fetch/issues/973
        (_c = (_b = (_a = responseHeaders.getAll) == null ? void 0 : _a.call(responseHeaders, "set-cookie")) != null ? _b : responseHeaders.get("set-cookie")) != null ? _c : [];
        const cookieStrings = Array.isArray(setCookie) ? setCookie : splitCookiesString(setCookie);
        for (const cookieString of cookieStrings){
            const parsed = parseSetCookieString(cookieString);
            if (parsed) this._parsed.set(parsed.name, parsed);
        }
    }
    /**
   * {@link https://wicg.github.io/cookie-store/#CookieStore-get CookieStore#get} without the Promise.
   */ get(...args) {
        const key = typeof args[0] === "string" ? args[0] : args[0].name;
        return this._parsed.get(key);
    }
    /**
   * {@link https://wicg.github.io/cookie-store/#CookieStore-getAll CookieStore#getAll} without the Promise.
   */ getAll(...args) {
        var _a;
        const all = Array.from(this._parsed.values());
        if (!args.length) {
            return all;
        }
        const key = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
        return all.filter((c)=>c.name === key);
    }
    /**
   * {@link https://wicg.github.io/cookie-store/#CookieStore-set CookieStore#set} without the Promise.
   */ set(...args) {
        const [name, value, cookie] = args.length === 1 ? [
            args[0].name,
            args[0].value,
            args[0]
        ] : args;
        const map = this._parsed;
        map.set(name, normalizeCookie({
            name,
            value,
            ...cookie
        }));
        replace(map, this._headers);
        return this;
    }
    /**
   * {@link https://wicg.github.io/cookie-store/#CookieStore-delete CookieStore#delete} without the Promise.
   */ delete(...args) {
        const name = typeof args[0] === "string" ? args[0] : args[0].name;
        return this.set({
            name,
            value: "",
            expires: /* @__PURE__ */ new Date(0)
        });
    }
    [Symbol.for("edge-runtime.inspect.custom")]() {
        return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
    }
    toString() {
        return [
            ...this._parsed.values()
        ].map(serialize).join("; ");
    }
};
function replace(bag, headers) {
    headers.delete("set-cookie");
    for (const [, value] of bag){
        const serialized = serialize(value);
        headers.append("set-cookie", serialized);
    }
}
function normalizeCookie(cookie = {
    name: "",
    value: ""
}) {
    if (typeof cookie.expires === "number") {
        cookie.expires = new Date(cookie.expires);
    }
    if (cookie.maxAge) {
        cookie.expires = new Date(Date.now() + cookie.maxAge * 1e3);
    }
    if (cookie.path === null || cookie.path === void 0) {
        cookie.path = "/";
    }
    return cookie;
}
function splitCookiesString(cookiesString) {
    if (!cookiesString) return [];
    var cookiesStrings = [];
    var pos = 0;
    var start;
    var ch;
    var lastComma;
    var nextStart;
    var cookiesSeparatorFound;
    function skipWhitespace() {
        while(pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))){
            pos += 1;
        }
        return pos < cookiesString.length;
    }
    function notSpecialChar() {
        ch = cookiesString.charAt(pos);
        return ch !== "=" && ch !== ";" && ch !== ",";
    }
    while(pos < cookiesString.length){
        start = pos;
        cookiesSeparatorFound = false;
        while(skipWhitespace()){
            ch = cookiesString.charAt(pos);
            if (ch === ",") {
                lastComma = pos;
                pos += 1;
                skipWhitespace();
                nextStart = pos;
                while(pos < cookiesString.length && notSpecialChar()){
                    pos += 1;
                }
                if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
                    cookiesSeparatorFound = true;
                    pos = nextStart;
                    cookiesStrings.push(cookiesString.substring(start, lastComma));
                    start = pos;
                } else {
                    pos = lastComma + 1;
                }
            } else {
                pos += 1;
            }
        }
        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
            cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
    }
    return cookiesStrings;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (0);


/***/ }),

/***/ 77953:
/***/ ((module) => {


(()=>{
    "use strict";
    var e = {
        339: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.ContextAPI = void 0;
            const n = r(44);
            const a = r(38);
            const o = r(741);
            const i = "context";
            const c = new n.NoopContextManager;
            class ContextAPI {
                constructor(){}
                static getInstance() {
                    if (!this._instance) {
                        this._instance = new ContextAPI;
                    }
                    return this._instance;
                }
                setGlobalContextManager(e) {
                    return (0, a.registerGlobal)(i, e, o.DiagAPI.instance());
                }
                active() {
                    return this._getContextManager().active();
                }
                with(e, t, r, ...n) {
                    return this._getContextManager().with(e, t, r, ...n);
                }
                bind(e, t) {
                    return this._getContextManager().bind(e, t);
                }
                _getContextManager() {
                    return (0, a.getGlobal)(i) || c;
                }
                disable() {
                    this._getContextManager().disable();
                    (0, a.unregisterGlobal)(i, o.DiagAPI.instance());
                }
            }
            t.ContextAPI = ContextAPI;
        },
        741: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.DiagAPI = void 0;
            const n = r(144);
            const a = r(871);
            const o = r(133);
            const i = r(38);
            const c = "diag";
            class DiagAPI {
                constructor(){
                    function _logProxy(e) {
                        return function(...t) {
                            const r = (0, i.getGlobal)("diag");
                            if (!r) return;
                            return r[e](...t);
                        };
                    }
                    const e = this;
                    const setLogger = (t, r = {
                        logLevel: o.DiagLogLevel.INFO
                    })=>{
                        var n, c, s;
                        if (t === e) {
                            const t = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                            e.error((n = t.stack) !== null && n !== void 0 ? n : t.message);
                            return false;
                        }
                        if (typeof r === "number") {
                            r = {
                                logLevel: r
                            };
                        }
                        const u = (0, i.getGlobal)("diag");
                        const l = (0, a.createLogLevelDiagLogger)((c = r.logLevel) !== null && c !== void 0 ? c : o.DiagLogLevel.INFO, t);
                        if (u && !r.suppressOverrideMessage) {
                            const e = (s = (new Error).stack) !== null && s !== void 0 ? s : "<failed to generate stacktrace>";
                            u.warn(`Current logger will be overwritten from ${e}`);
                            l.warn(`Current logger will overwrite one already registered from ${e}`);
                        }
                        return (0, i.registerGlobal)("diag", l, e, true);
                    };
                    e.setLogger = setLogger;
                    e.disable = ()=>{
                        (0, i.unregisterGlobal)(c, e);
                    };
                    e.createComponentLogger = (e)=>new n.DiagComponentLogger(e);
                    e.verbose = _logProxy("verbose");
                    e.debug = _logProxy("debug");
                    e.info = _logProxy("info");
                    e.warn = _logProxy("warn");
                    e.error = _logProxy("error");
                }
                static instance() {
                    if (!this._instance) {
                        this._instance = new DiagAPI;
                    }
                    return this._instance;
                }
            }
            t.DiagAPI = DiagAPI;
        },
        128: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.MetricsAPI = void 0;
            const n = r(333);
            const a = r(38);
            const o = r(741);
            const i = "metrics";
            class MetricsAPI {
                constructor(){}
                static getInstance() {
                    if (!this._instance) {
                        this._instance = new MetricsAPI;
                    }
                    return this._instance;
                }
                setGlobalMeterProvider(e) {
                    return (0, a.registerGlobal)(i, e, o.DiagAPI.instance());
                }
                getMeterProvider() {
                    return (0, a.getGlobal)(i) || n.NOOP_METER_PROVIDER;
                }
                getMeter(e, t, r) {
                    return this.getMeterProvider().getMeter(e, t, r);
                }
                disable() {
                    (0, a.unregisterGlobal)(i, o.DiagAPI.instance());
                }
            }
            t.MetricsAPI = MetricsAPI;
        },
        930: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.PropagationAPI = void 0;
            const n = r(38);
            const a = r(600);
            const o = r(625);
            const i = r(377);
            const c = r(701);
            const s = r(741);
            const u = "propagation";
            const l = new a.NoopTextMapPropagator;
            class PropagationAPI {
                constructor(){
                    this.createBaggage = c.createBaggage;
                    this.getBaggage = i.getBaggage;
                    this.getActiveBaggage = i.getActiveBaggage;
                    this.setBaggage = i.setBaggage;
                    this.deleteBaggage = i.deleteBaggage;
                }
                static getInstance() {
                    if (!this._instance) {
                        this._instance = new PropagationAPI;
                    }
                    return this._instance;
                }
                setGlobalPropagator(e) {
                    return (0, n.registerGlobal)(u, e, s.DiagAPI.instance());
                }
                inject(e, t, r = o.defaultTextMapSetter) {
                    return this._getGlobalPropagator().inject(e, t, r);
                }
                extract(e, t, r = o.defaultTextMapGetter) {
                    return this._getGlobalPropagator().extract(e, t, r);
                }
                fields() {
                    return this._getGlobalPropagator().fields();
                }
                disable() {
                    (0, n.unregisterGlobal)(u, s.DiagAPI.instance());
                }
                _getGlobalPropagator() {
                    return (0, n.getGlobal)(u) || l;
                }
            }
            t.PropagationAPI = PropagationAPI;
        },
        967: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.TraceAPI = void 0;
            const n = r(38);
            const a = r(414);
            const o = r(994);
            const i = r(542);
            const c = r(741);
            const s = "trace";
            class TraceAPI {
                constructor(){
                    this._proxyTracerProvider = new a.ProxyTracerProvider;
                    this.wrapSpanContext = o.wrapSpanContext;
                    this.isSpanContextValid = o.isSpanContextValid;
                    this.deleteSpan = i.deleteSpan;
                    this.getSpan = i.getSpan;
                    this.getActiveSpan = i.getActiveSpan;
                    this.getSpanContext = i.getSpanContext;
                    this.setSpan = i.setSpan;
                    this.setSpanContext = i.setSpanContext;
                }
                static getInstance() {
                    if (!this._instance) {
                        this._instance = new TraceAPI;
                    }
                    return this._instance;
                }
                setGlobalTracerProvider(e) {
                    const t = (0, n.registerGlobal)(s, this._proxyTracerProvider, c.DiagAPI.instance());
                    if (t) {
                        this._proxyTracerProvider.setDelegate(e);
                    }
                    return t;
                }
                getTracerProvider() {
                    return (0, n.getGlobal)(s) || this._proxyTracerProvider;
                }
                getTracer(e, t) {
                    return this.getTracerProvider().getTracer(e, t);
                }
                disable() {
                    (0, n.unregisterGlobal)(s, c.DiagAPI.instance());
                    this._proxyTracerProvider = new a.ProxyTracerProvider;
                }
            }
            t.TraceAPI = TraceAPI;
        },
        377: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.deleteBaggage = t.setBaggage = t.getActiveBaggage = t.getBaggage = void 0;
            const n = r(339);
            const a = r(421);
            const o = (0, a.createContextKey)("OpenTelemetry Baggage Key");
            function getBaggage(e) {
                return e.getValue(o) || undefined;
            }
            t.getBaggage = getBaggage;
            function getActiveBaggage() {
                return getBaggage(n.ContextAPI.getInstance().active());
            }
            t.getActiveBaggage = getActiveBaggage;
            function setBaggage(e, t) {
                return e.setValue(o, t);
            }
            t.setBaggage = setBaggage;
            function deleteBaggage(e) {
                return e.deleteValue(o);
            }
            t.deleteBaggage = deleteBaggage;
        },
        496: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.BaggageImpl = void 0;
            class BaggageImpl {
                constructor(e){
                    this._entries = e ? new Map(e) : new Map;
                }
                getEntry(e) {
                    const t = this._entries.get(e);
                    if (!t) {
                        return undefined;
                    }
                    return Object.assign({}, t);
                }
                getAllEntries() {
                    return Array.from(this._entries.entries()).map(([e, t])=>[
                            e,
                            t
                        ]);
                }
                setEntry(e, t) {
                    const r = new BaggageImpl(this._entries);
                    r._entries.set(e, t);
                    return r;
                }
                removeEntry(e) {
                    const t = new BaggageImpl(this._entries);
                    t._entries.delete(e);
                    return t;
                }
                removeEntries(...e) {
                    const t = new BaggageImpl(this._entries);
                    for (const r of e){
                        t._entries.delete(r);
                    }
                    return t;
                }
                clear() {
                    return new BaggageImpl;
                }
            }
            t.BaggageImpl = BaggageImpl;
        },
        817: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.baggageEntryMetadataSymbol = void 0;
            t.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        },
        701: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.baggageEntryMetadataFromString = t.createBaggage = void 0;
            const n = r(741);
            const a = r(496);
            const o = r(817);
            const i = n.DiagAPI.instance();
            function createBaggage(e = {}) {
                return new a.BaggageImpl(new Map(Object.entries(e)));
            }
            t.createBaggage = createBaggage;
            function baggageEntryMetadataFromString(e) {
                if (typeof e !== "string") {
                    i.error(`Cannot create baggage metadata from unknown type: ${typeof e}`);
                    e = "";
                }
                return {
                    __TYPE__: o.baggageEntryMetadataSymbol,
                    toString () {
                        return e;
                    }
                };
            }
            t.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
        },
        388: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.context = void 0;
            const n = r(339);
            t.context = n.ContextAPI.getInstance();
        },
        44: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NoopContextManager = void 0;
            const n = r(421);
            class NoopContextManager {
                active() {
                    return n.ROOT_CONTEXT;
                }
                with(e, t, r, ...n) {
                    return t.call(r, ...n);
                }
                bind(e, t) {
                    return t;
                }
                enable() {
                    return this;
                }
                disable() {
                    return this;
                }
            }
            t.NoopContextManager = NoopContextManager;
        },
        421: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.ROOT_CONTEXT = t.createContextKey = void 0;
            function createContextKey(e) {
                return Symbol.for(e);
            }
            t.createContextKey = createContextKey;
            class BaseContext {
                constructor(e){
                    const t = this;
                    t._currentContext = e ? new Map(e) : new Map;
                    t.getValue = (e)=>t._currentContext.get(e);
                    t.setValue = (e, r)=>{
                        const n = new BaseContext(t._currentContext);
                        n._currentContext.set(e, r);
                        return n;
                    };
                    t.deleteValue = (e)=>{
                        const r = new BaseContext(t._currentContext);
                        r._currentContext.delete(e);
                        return r;
                    };
                }
            }
            t.ROOT_CONTEXT = new BaseContext;
        },
        920: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.diag = void 0;
            const n = r(741);
            t.diag = n.DiagAPI.instance();
        },
        144: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.DiagComponentLogger = void 0;
            const n = r(38);
            class DiagComponentLogger {
                constructor(e){
                    this._namespace = e.namespace || "DiagComponentLogger";
                }
                debug(...e) {
                    return logProxy("debug", this._namespace, e);
                }
                error(...e) {
                    return logProxy("error", this._namespace, e);
                }
                info(...e) {
                    return logProxy("info", this._namespace, e);
                }
                warn(...e) {
                    return logProxy("warn", this._namespace, e);
                }
                verbose(...e) {
                    return logProxy("verbose", this._namespace, e);
                }
            }
            t.DiagComponentLogger = DiagComponentLogger;
            function logProxy(e, t, r) {
                const a = (0, n.getGlobal)("diag");
                if (!a) {
                    return;
                }
                r.unshift(t);
                return a[e](...r);
            }
        },
        689: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.DiagConsoleLogger = void 0;
            const r = [
                {
                    n: "error",
                    c: "error"
                },
                {
                    n: "warn",
                    c: "warn"
                },
                {
                    n: "info",
                    c: "info"
                },
                {
                    n: "debug",
                    c: "debug"
                },
                {
                    n: "verbose",
                    c: "trace"
                }
            ];
            class DiagConsoleLogger {
                constructor(){
                    function _consoleFunc(e) {
                        return function(...t) {
                            if (console) {
                                let r = console[e];
                                if (typeof r !== "function") {
                                    r = console.log;
                                }
                                if (typeof r === "function") {
                                    return r.apply(console, t);
                                }
                            }
                        };
                    }
                    for(let e = 0; e < r.length; e++){
                        this[r[e].n] = _consoleFunc(r[e].c);
                    }
                }
            }
            t.DiagConsoleLogger = DiagConsoleLogger;
        },
        871: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.createLogLevelDiagLogger = void 0;
            const n = r(133);
            function createLogLevelDiagLogger(e, t) {
                if (e < n.DiagLogLevel.NONE) {
                    e = n.DiagLogLevel.NONE;
                } else if (e > n.DiagLogLevel.ALL) {
                    e = n.DiagLogLevel.ALL;
                }
                t = t || {};
                function _filterFunc(r, n) {
                    const a = t[r];
                    if (typeof a === "function" && e >= n) {
                        return a.bind(t);
                    }
                    return function() {};
                }
                return {
                    error: _filterFunc("error", n.DiagLogLevel.ERROR),
                    warn: _filterFunc("warn", n.DiagLogLevel.WARN),
                    info: _filterFunc("info", n.DiagLogLevel.INFO),
                    debug: _filterFunc("debug", n.DiagLogLevel.DEBUG),
                    verbose: _filterFunc("verbose", n.DiagLogLevel.VERBOSE)
                };
            }
            t.createLogLevelDiagLogger = createLogLevelDiagLogger;
        },
        133: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.DiagLogLevel = void 0;
            var r;
            (function(e) {
                e[e["NONE"] = 0] = "NONE";
                e[e["ERROR"] = 30] = "ERROR";
                e[e["WARN"] = 50] = "WARN";
                e[e["INFO"] = 60] = "INFO";
                e[e["DEBUG"] = 70] = "DEBUG";
                e[e["VERBOSE"] = 80] = "VERBOSE";
                e[e["ALL"] = 9999] = "ALL";
            })(r = t.DiagLogLevel || (t.DiagLogLevel = {}));
        },
        38: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.unregisterGlobal = t.getGlobal = t.registerGlobal = void 0;
            const n = r(966);
            const a = r(520);
            const o = r(565);
            const i = a.VERSION.split(".")[0];
            const c = Symbol.for(`opentelemetry.js.api.${i}`);
            const s = n._globalThis;
            function registerGlobal(e, t, r, n = false) {
                var o;
                const i = s[c] = (o = s[c]) !== null && o !== void 0 ? o : {
                    version: a.VERSION
                };
                if (!n && i[e]) {
                    const t = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e}`);
                    r.error(t.stack || t.message);
                    return false;
                }
                if (i.version !== a.VERSION) {
                    const t = new Error(`@opentelemetry/api: Registration of version v${i.version} for ${e} does not match previously registered API v${a.VERSION}`);
                    r.error(t.stack || t.message);
                    return false;
                }
                i[e] = t;
                r.debug(`@opentelemetry/api: Registered a global for ${e} v${a.VERSION}.`);
                return true;
            }
            t.registerGlobal = registerGlobal;
            function getGlobal(e) {
                var t, r;
                const n = (t = s[c]) === null || t === void 0 ? void 0 : t.version;
                if (!n || !(0, o.isCompatible)(n)) {
                    return;
                }
                return (r = s[c]) === null || r === void 0 ? void 0 : r[e];
            }
            t.getGlobal = getGlobal;
            function unregisterGlobal(e, t) {
                t.debug(`@opentelemetry/api: Unregistering a global for ${e} v${a.VERSION}.`);
                const r = s[c];
                if (r) {
                    delete r[e];
                }
            }
            t.unregisterGlobal = unregisterGlobal;
        },
        565: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.isCompatible = t._makeCompatibilityCheck = void 0;
            const n = r(520);
            const a = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
            function _makeCompatibilityCheck(e) {
                const t = new Set([
                    e
                ]);
                const r = new Set;
                const n = e.match(a);
                if (!n) {
                    return ()=>false;
                }
                const o = {
                    major: +n[1],
                    minor: +n[2],
                    patch: +n[3],
                    prerelease: n[4]
                };
                if (o.prerelease != null) {
                    return function isExactmatch(t) {
                        return t === e;
                    };
                }
                function _reject(e) {
                    r.add(e);
                    return false;
                }
                function _accept(e) {
                    t.add(e);
                    return true;
                }
                return function isCompatible(e) {
                    if (t.has(e)) {
                        return true;
                    }
                    if (r.has(e)) {
                        return false;
                    }
                    const n = e.match(a);
                    if (!n) {
                        return _reject(e);
                    }
                    const i = {
                        major: +n[1],
                        minor: +n[2],
                        patch: +n[3],
                        prerelease: n[4]
                    };
                    if (i.prerelease != null) {
                        return _reject(e);
                    }
                    if (o.major !== i.major) {
                        return _reject(e);
                    }
                    if (o.major === 0) {
                        if (o.minor === i.minor && o.patch <= i.patch) {
                            return _accept(e);
                        }
                        return _reject(e);
                    }
                    if (o.minor <= i.minor) {
                        return _accept(e);
                    }
                    return _reject(e);
                };
            }
            t._makeCompatibilityCheck = _makeCompatibilityCheck;
            t.isCompatible = _makeCompatibilityCheck(n.VERSION);
        },
        934: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.metrics = void 0;
            const n = r(128);
            t.metrics = n.MetricsAPI.getInstance();
        },
        28: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.ValueType = void 0;
            var r;
            (function(e) {
                e[e["INT"] = 0] = "INT";
                e[e["DOUBLE"] = 1] = "DOUBLE";
            })(r = t.ValueType || (t.ValueType = {}));
        },
        962: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.createNoopMeter = t.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t.NOOP_OBSERVABLE_GAUGE_METRIC = t.NOOP_OBSERVABLE_COUNTER_METRIC = t.NOOP_UP_DOWN_COUNTER_METRIC = t.NOOP_HISTOGRAM_METRIC = t.NOOP_COUNTER_METRIC = t.NOOP_METER = t.NoopObservableUpDownCounterMetric = t.NoopObservableGaugeMetric = t.NoopObservableCounterMetric = t.NoopObservableMetric = t.NoopHistogramMetric = t.NoopUpDownCounterMetric = t.NoopCounterMetric = t.NoopMetric = t.NoopMeter = void 0;
            class NoopMeter {
                constructor(){}
                createHistogram(e, r) {
                    return t.NOOP_HISTOGRAM_METRIC;
                }
                createCounter(e, r) {
                    return t.NOOP_COUNTER_METRIC;
                }
                createUpDownCounter(e, r) {
                    return t.NOOP_UP_DOWN_COUNTER_METRIC;
                }
                createObservableGauge(e, r) {
                    return t.NOOP_OBSERVABLE_GAUGE_METRIC;
                }
                createObservableCounter(e, r) {
                    return t.NOOP_OBSERVABLE_COUNTER_METRIC;
                }
                createObservableUpDownCounter(e, r) {
                    return t.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
                }
                addBatchObservableCallback(e, t) {}
                removeBatchObservableCallback(e) {}
            }
            t.NoopMeter = NoopMeter;
            class NoopMetric {
            }
            t.NoopMetric = NoopMetric;
            class NoopCounterMetric extends NoopMetric {
                add(e, t) {}
            }
            t.NoopCounterMetric = NoopCounterMetric;
            class NoopUpDownCounterMetric extends NoopMetric {
                add(e, t) {}
            }
            t.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
            class NoopHistogramMetric extends NoopMetric {
                record(e, t) {}
            }
            t.NoopHistogramMetric = NoopHistogramMetric;
            class NoopObservableMetric {
                addCallback(e) {}
                removeCallback(e) {}
            }
            t.NoopObservableMetric = NoopObservableMetric;
            class NoopObservableCounterMetric extends NoopObservableMetric {
            }
            t.NoopObservableCounterMetric = NoopObservableCounterMetric;
            class NoopObservableGaugeMetric extends NoopObservableMetric {
            }
            t.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
            class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
            }
            t.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
            t.NOOP_METER = new NoopMeter;
            t.NOOP_COUNTER_METRIC = new NoopCounterMetric;
            t.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric;
            t.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric;
            t.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric;
            t.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric;
            t.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric;
            function createNoopMeter() {
                return t.NOOP_METER;
            }
            t.createNoopMeter = createNoopMeter;
        },
        333: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NOOP_METER_PROVIDER = t.NoopMeterProvider = void 0;
            const n = r(962);
            class NoopMeterProvider {
                getMeter(e, t, r) {
                    return n.NOOP_METER;
                }
            }
            t.NoopMeterProvider = NoopMeterProvider;
            t.NOOP_METER_PROVIDER = new NoopMeterProvider;
        },
        966: function(e, t, r) {
            var n = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
                if (n === undefined) n = r;
                Object.defineProperty(e, n, {
                    enumerable: true,
                    get: function() {
                        return t[r];
                    }
                });
            } : function(e, t, r, n) {
                if (n === undefined) n = r;
                e[n] = t[r];
            });
            var a = this && this.__exportStar || function(e, t) {
                for(var r in e)if (r !== "default" && !Object.prototype.hasOwnProperty.call(t, r)) n(t, e, r);
            };
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            a(r(652), t);
        },
        385: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t._globalThis = void 0;
            t._globalThis = typeof globalThis === "object" ? globalThis : global;
        },
        652: function(e, t, r) {
            var n = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
                if (n === undefined) n = r;
                Object.defineProperty(e, n, {
                    enumerable: true,
                    get: function() {
                        return t[r];
                    }
                });
            } : function(e, t, r, n) {
                if (n === undefined) n = r;
                e[n] = t[r];
            });
            var a = this && this.__exportStar || function(e, t) {
                for(var r in e)if (r !== "default" && !Object.prototype.hasOwnProperty.call(t, r)) n(t, e, r);
            };
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            a(r(385), t);
        },
        251: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.propagation = void 0;
            const n = r(930);
            t.propagation = n.PropagationAPI.getInstance();
        },
        600: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NoopTextMapPropagator = void 0;
            class NoopTextMapPropagator {
                inject(e, t) {}
                extract(e, t) {
                    return e;
                }
                fields() {
                    return [];
                }
            }
            t.NoopTextMapPropagator = NoopTextMapPropagator;
        },
        625: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.defaultTextMapSetter = t.defaultTextMapGetter = void 0;
            t.defaultTextMapGetter = {
                get (e, t) {
                    if (e == null) {
                        return undefined;
                    }
                    return e[t];
                },
                keys (e) {
                    if (e == null) {
                        return [];
                    }
                    return Object.keys(e);
                }
            };
            t.defaultTextMapSetter = {
                set (e, t, r) {
                    if (e == null) {
                        return;
                    }
                    e[t] = r;
                }
            };
        },
        978: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.trace = void 0;
            const n = r(967);
            t.trace = n.TraceAPI.getInstance();
        },
        76: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NonRecordingSpan = void 0;
            const n = r(304);
            class NonRecordingSpan {
                constructor(e = n.INVALID_SPAN_CONTEXT){
                    this._spanContext = e;
                }
                spanContext() {
                    return this._spanContext;
                }
                setAttribute(e, t) {
                    return this;
                }
                setAttributes(e) {
                    return this;
                }
                addEvent(e, t) {
                    return this;
                }
                setStatus(e) {
                    return this;
                }
                updateName(e) {
                    return this;
                }
                end(e) {}
                isRecording() {
                    return false;
                }
                recordException(e, t) {}
            }
            t.NonRecordingSpan = NonRecordingSpan;
        },
        527: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NoopTracer = void 0;
            const n = r(339);
            const a = r(542);
            const o = r(76);
            const i = r(994);
            const c = n.ContextAPI.getInstance();
            class NoopTracer {
                startSpan(e, t, r = c.active()) {
                    const n = Boolean(t === null || t === void 0 ? void 0 : t.root);
                    if (n) {
                        return new o.NonRecordingSpan;
                    }
                    const s = r && (0, a.getSpanContext)(r);
                    if (isSpanContext(s) && (0, i.isSpanContextValid)(s)) {
                        return new o.NonRecordingSpan(s);
                    } else {
                        return new o.NonRecordingSpan;
                    }
                }
                startActiveSpan(e, t, r, n) {
                    let o;
                    let i;
                    let s;
                    if (arguments.length < 2) {
                        return;
                    } else if (arguments.length === 2) {
                        s = t;
                    } else if (arguments.length === 3) {
                        o = t;
                        s = r;
                    } else {
                        o = t;
                        i = r;
                        s = n;
                    }
                    const u = i !== null && i !== void 0 ? i : c.active();
                    const l = this.startSpan(e, o, u);
                    const g = (0, a.setSpan)(u, l);
                    return c.with(g, s, undefined, l);
                }
            }
            t.NoopTracer = NoopTracer;
            function isSpanContext(e) {
                return typeof e === "object" && typeof e["spanId"] === "string" && typeof e["traceId"] === "string" && typeof e["traceFlags"] === "number";
            }
        },
        228: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.NoopTracerProvider = void 0;
            const n = r(527);
            class NoopTracerProvider {
                getTracer(e, t, r) {
                    return new n.NoopTracer;
                }
            }
            t.NoopTracerProvider = NoopTracerProvider;
        },
        387: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.ProxyTracer = void 0;
            const n = r(527);
            const a = new n.NoopTracer;
            class ProxyTracer {
                constructor(e, t, r, n){
                    this._provider = e;
                    this.name = t;
                    this.version = r;
                    this.options = n;
                }
                startSpan(e, t, r) {
                    return this._getTracer().startSpan(e, t, r);
                }
                startActiveSpan(e, t, r, n) {
                    const a = this._getTracer();
                    return Reflect.apply(a.startActiveSpan, a, arguments);
                }
                _getTracer() {
                    if (this._delegate) {
                        return this._delegate;
                    }
                    const e = this._provider.getDelegateTracer(this.name, this.version, this.options);
                    if (!e) {
                        return a;
                    }
                    this._delegate = e;
                    return this._delegate;
                }
            }
            t.ProxyTracer = ProxyTracer;
        },
        414: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.ProxyTracerProvider = void 0;
            const n = r(387);
            const a = r(228);
            const o = new a.NoopTracerProvider;
            class ProxyTracerProvider {
                getTracer(e, t, r) {
                    var a;
                    return (a = this.getDelegateTracer(e, t, r)) !== null && a !== void 0 ? a : new n.ProxyTracer(this, e, t, r);
                }
                getDelegate() {
                    var e;
                    return (e = this._delegate) !== null && e !== void 0 ? e : o;
                }
                setDelegate(e) {
                    this._delegate = e;
                }
                getDelegateTracer(e, t, r) {
                    var n;
                    return (n = this._delegate) === null || n === void 0 ? void 0 : n.getTracer(e, t, r);
                }
            }
            t.ProxyTracerProvider = ProxyTracerProvider;
        },
        505: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.SamplingDecision = void 0;
            var r;
            (function(e) {
                e[e["NOT_RECORD"] = 0] = "NOT_RECORD";
                e[e["RECORD"] = 1] = "RECORD";
                e[e["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
            })(r = t.SamplingDecision || (t.SamplingDecision = {}));
        },
        542: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.getSpanContext = t.setSpanContext = t.deleteSpan = t.setSpan = t.getActiveSpan = t.getSpan = void 0;
            const n = r(421);
            const a = r(76);
            const o = r(339);
            const i = (0, n.createContextKey)("OpenTelemetry Context Key SPAN");
            function getSpan(e) {
                return e.getValue(i) || undefined;
            }
            t.getSpan = getSpan;
            function getActiveSpan() {
                return getSpan(o.ContextAPI.getInstance().active());
            }
            t.getActiveSpan = getActiveSpan;
            function setSpan(e, t) {
                return e.setValue(i, t);
            }
            t.setSpan = setSpan;
            function deleteSpan(e) {
                return e.deleteValue(i);
            }
            t.deleteSpan = deleteSpan;
            function setSpanContext(e, t) {
                return setSpan(e, new a.NonRecordingSpan(t));
            }
            t.setSpanContext = setSpanContext;
            function getSpanContext(e) {
                var t;
                return (t = getSpan(e)) === null || t === void 0 ? void 0 : t.spanContext();
            }
            t.getSpanContext = getSpanContext;
        },
        430: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.TraceStateImpl = void 0;
            const n = r(450);
            const a = 32;
            const o = 512;
            const i = ",";
            const c = "=";
            class TraceStateImpl {
                constructor(e){
                    this._internalState = new Map;
                    if (e) this._parse(e);
                }
                set(e, t) {
                    const r = this._clone();
                    if (r._internalState.has(e)) {
                        r._internalState.delete(e);
                    }
                    r._internalState.set(e, t);
                    return r;
                }
                unset(e) {
                    const t = this._clone();
                    t._internalState.delete(e);
                    return t;
                }
                get(e) {
                    return this._internalState.get(e);
                }
                serialize() {
                    return this._keys().reduce((e, t)=>{
                        e.push(t + c + this.get(t));
                        return e;
                    }, []).join(i);
                }
                _parse(e) {
                    if (e.length > o) return;
                    this._internalState = e.split(i).reverse().reduce((e, t)=>{
                        const r = t.trim();
                        const a = r.indexOf(c);
                        if (a !== -1) {
                            const o = r.slice(0, a);
                            const i = r.slice(a + 1, t.length);
                            if ((0, n.validateKey)(o) && (0, n.validateValue)(i)) {
                                e.set(o, i);
                            } else {}
                        }
                        return e;
                    }, new Map);
                    if (this._internalState.size > a) {
                        this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, a));
                    }
                }
                _keys() {
                    return Array.from(this._internalState.keys()).reverse();
                }
                _clone() {
                    const e = new TraceStateImpl;
                    e._internalState = new Map(this._internalState);
                    return e;
                }
            }
            t.TraceStateImpl = TraceStateImpl;
        },
        450: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.validateValue = t.validateKey = void 0;
            const r = "[_0-9a-z-*/]";
            const n = `[a-z]${r}{0,255}`;
            const a = `[a-z0-9]${r}{0,240}@[a-z]${r}{0,13}`;
            const o = new RegExp(`^(?:${n}|${a})$`);
            const i = /^[ -~]{0,255}[!-~]$/;
            const c = /,|=/;
            function validateKey(e) {
                return o.test(e);
            }
            t.validateKey = validateKey;
            function validateValue(e) {
                return i.test(e) && !c.test(e);
            }
            t.validateValue = validateValue;
        },
        757: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.createTraceState = void 0;
            const n = r(430);
            function createTraceState(e) {
                return new n.TraceStateImpl(e);
            }
            t.createTraceState = createTraceState;
        },
        304: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.INVALID_SPAN_CONTEXT = t.INVALID_TRACEID = t.INVALID_SPANID = void 0;
            const n = r(762);
            t.INVALID_SPANID = "0000000000000000";
            t.INVALID_TRACEID = "00000000000000000000000000000000";
            t.INVALID_SPAN_CONTEXT = {
                traceId: t.INVALID_TRACEID,
                spanId: t.INVALID_SPANID,
                traceFlags: n.TraceFlags.NONE
            };
        },
        902: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.SpanKind = void 0;
            var r;
            (function(e) {
                e[e["INTERNAL"] = 0] = "INTERNAL";
                e[e["SERVER"] = 1] = "SERVER";
                e[e["CLIENT"] = 2] = "CLIENT";
                e[e["PRODUCER"] = 3] = "PRODUCER";
                e[e["CONSUMER"] = 4] = "CONSUMER";
            })(r = t.SpanKind || (t.SpanKind = {}));
        },
        994: (e, t, r)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.wrapSpanContext = t.isSpanContextValid = t.isValidSpanId = t.isValidTraceId = void 0;
            const n = r(304);
            const a = r(76);
            const o = /^([0-9a-f]{32})$/i;
            const i = /^[0-9a-f]{16}$/i;
            function isValidTraceId(e) {
                return o.test(e) && e !== n.INVALID_TRACEID;
            }
            t.isValidTraceId = isValidTraceId;
            function isValidSpanId(e) {
                return i.test(e) && e !== n.INVALID_SPANID;
            }
            t.isValidSpanId = isValidSpanId;
            function isSpanContextValid(e) {
                return isValidTraceId(e.traceId) && isValidSpanId(e.spanId);
            }
            t.isSpanContextValid = isSpanContextValid;
            function wrapSpanContext(e) {
                return new a.NonRecordingSpan(e);
            }
            t.wrapSpanContext = wrapSpanContext;
        },
        832: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.SpanStatusCode = void 0;
            var r;
            (function(e) {
                e[e["UNSET"] = 0] = "UNSET";
                e[e["OK"] = 1] = "OK";
                e[e["ERROR"] = 2] = "ERROR";
            })(r = t.SpanStatusCode || (t.SpanStatusCode = {}));
        },
        762: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.TraceFlags = void 0;
            var r;
            (function(e) {
                e[e["NONE"] = 0] = "NONE";
                e[e["SAMPLED"] = 1] = "SAMPLED";
            })(r = t.TraceFlags || (t.TraceFlags = {}));
        },
        520: (e, t)=>{
            Object.defineProperty(t, "__esModule", {
                value: true
            });
            t.VERSION = void 0;
            t.VERSION = "1.4.1";
        }
    };
    var t = {};
    function __nccwpck_require__(r) {
        var n = t[r];
        if (n !== undefined) {
            return n.exports;
        }
        var a = t[r] = {
            exports: {}
        };
        var o = true;
        try {
            e[r].call(a.exports, a, a.exports, __nccwpck_require__);
            o = false;
        } finally{
            if (o) delete t[r];
        }
        return a.exports;
    }
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname + "/";
    var r = {};
    (()=>{
        var e = r;
        Object.defineProperty(e, "__esModule", {
            value: true
        });
        e.trace = e.propagation = e.metrics = e.diag = e.context = e.INVALID_SPAN_CONTEXT = e.INVALID_TRACEID = e.INVALID_SPANID = e.isValidSpanId = e.isValidTraceId = e.isSpanContextValid = e.createTraceState = e.TraceFlags = e.SpanStatusCode = e.SpanKind = e.SamplingDecision = e.ProxyTracerProvider = e.ProxyTracer = e.defaultTextMapSetter = e.defaultTextMapGetter = e.ValueType = e.createNoopMeter = e.DiagLogLevel = e.DiagConsoleLogger = e.ROOT_CONTEXT = e.createContextKey = e.baggageEntryMetadataFromString = void 0;
        var t = __nccwpck_require__(701);
        Object.defineProperty(e, "baggageEntryMetadataFromString", {
            enumerable: true,
            get: function() {
                return t.baggageEntryMetadataFromString;
            }
        });
        var n = __nccwpck_require__(421);
        Object.defineProperty(e, "createContextKey", {
            enumerable: true,
            get: function() {
                return n.createContextKey;
            }
        });
        Object.defineProperty(e, "ROOT_CONTEXT", {
            enumerable: true,
            get: function() {
                return n.ROOT_CONTEXT;
            }
        });
        var a = __nccwpck_require__(689);
        Object.defineProperty(e, "DiagConsoleLogger", {
            enumerable: true,
            get: function() {
                return a.DiagConsoleLogger;
            }
        });
        var o = __nccwpck_require__(133);
        Object.defineProperty(e, "DiagLogLevel", {
            enumerable: true,
            get: function() {
                return o.DiagLogLevel;
            }
        });
        var i = __nccwpck_require__(962);
        Object.defineProperty(e, "createNoopMeter", {
            enumerable: true,
            get: function() {
                return i.createNoopMeter;
            }
        });
        var c = __nccwpck_require__(28);
        Object.defineProperty(e, "ValueType", {
            enumerable: true,
            get: function() {
                return c.ValueType;
            }
        });
        var s = __nccwpck_require__(625);
        Object.defineProperty(e, "defaultTextMapGetter", {
            enumerable: true,
            get: function() {
                return s.defaultTextMapGetter;
            }
        });
        Object.defineProperty(e, "defaultTextMapSetter", {
            enumerable: true,
            get: function() {
                return s.defaultTextMapSetter;
            }
        });
        var u = __nccwpck_require__(387);
        Object.defineProperty(e, "ProxyTracer", {
            enumerable: true,
            get: function() {
                return u.ProxyTracer;
            }
        });
        var l = __nccwpck_require__(414);
        Object.defineProperty(e, "ProxyTracerProvider", {
            enumerable: true,
            get: function() {
                return l.ProxyTracerProvider;
            }
        });
        var g = __nccwpck_require__(505);
        Object.defineProperty(e, "SamplingDecision", {
            enumerable: true,
            get: function() {
                return g.SamplingDecision;
            }
        });
        var p = __nccwpck_require__(902);
        Object.defineProperty(e, "SpanKind", {
            enumerable: true,
            get: function() {
                return p.SpanKind;
            }
        });
        var d = __nccwpck_require__(832);
        Object.defineProperty(e, "SpanStatusCode", {
            enumerable: true,
            get: function() {
                return d.SpanStatusCode;
            }
        });
        var _ = __nccwpck_require__(762);
        Object.defineProperty(e, "TraceFlags", {
            enumerable: true,
            get: function() {
                return _.TraceFlags;
            }
        });
        var f = __nccwpck_require__(757);
        Object.defineProperty(e, "createTraceState", {
            enumerable: true,
            get: function() {
                return f.createTraceState;
            }
        });
        var b = __nccwpck_require__(994);
        Object.defineProperty(e, "isSpanContextValid", {
            enumerable: true,
            get: function() {
                return b.isSpanContextValid;
            }
        });
        Object.defineProperty(e, "isValidTraceId", {
            enumerable: true,
            get: function() {
                return b.isValidTraceId;
            }
        });
        Object.defineProperty(e, "isValidSpanId", {
            enumerable: true,
            get: function() {
                return b.isValidSpanId;
            }
        });
        var v = __nccwpck_require__(304);
        Object.defineProperty(e, "INVALID_SPANID", {
            enumerable: true,
            get: function() {
                return v.INVALID_SPANID;
            }
        });
        Object.defineProperty(e, "INVALID_TRACEID", {
            enumerable: true,
            get: function() {
                return v.INVALID_TRACEID;
            }
        });
        Object.defineProperty(e, "INVALID_SPAN_CONTEXT", {
            enumerable: true,
            get: function() {
                return v.INVALID_SPAN_CONTEXT;
            }
        });
        const O = __nccwpck_require__(388);
        Object.defineProperty(e, "context", {
            enumerable: true,
            get: function() {
                return O.context;
            }
        });
        const P = __nccwpck_require__(920);
        Object.defineProperty(e, "diag", {
            enumerable: true,
            get: function() {
                return P.diag;
            }
        });
        const N = __nccwpck_require__(934);
        Object.defineProperty(e, "metrics", {
            enumerable: true,
            get: function() {
                return N.metrics;
            }
        });
        const S = __nccwpck_require__(251);
        Object.defineProperty(e, "propagation", {
            enumerable: true,
            get: function() {
                return S.propagation;
            }
        });
        const C = __nccwpck_require__(978);
        Object.defineProperty(e, "trace", {
            enumerable: true,
            get: function() {
                return C.trace;
            }
        });
        e["default"] = {
            context: O.context,
            diag: P.diag,
            metrics: N.metrics,
            propagation: S.propagation,
            trace: C.trace
        };
    })();
    module.exports = r;
})();


/***/ }),

/***/ 12222:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


(()=>{
    var r = {
        535: (r, e, n)=>{
            "use strict";
            r = n.nmd(r);
            const t = n(54);
            const wrapAnsi16 = (r, e)=>function() {
                    const n = r.apply(t, arguments);
                    return `[${n + e}m`;
                };
            const wrapAnsi256 = (r, e)=>function() {
                    const n = r.apply(t, arguments);
                    return `[${38 + e};5;${n}m`;
                };
            const wrapAnsi16m = (r, e)=>function() {
                    const n = r.apply(t, arguments);
                    return `[${38 + e};2;${n[0]};${n[1]};${n[2]}m`;
                };
            function assembleStyles() {
                const r = new Map;
                const e = {
                    modifier: {
                        reset: [
                            0,
                            0
                        ],
                        bold: [
                            1,
                            22
                        ],
                        dim: [
                            2,
                            22
                        ],
                        italic: [
                            3,
                            23
                        ],
                        underline: [
                            4,
                            24
                        ],
                        inverse: [
                            7,
                            27
                        ],
                        hidden: [
                            8,
                            28
                        ],
                        strikethrough: [
                            9,
                            29
                        ]
                    },
                    color: {
                        black: [
                            30,
                            39
                        ],
                        red: [
                            31,
                            39
                        ],
                        green: [
                            32,
                            39
                        ],
                        yellow: [
                            33,
                            39
                        ],
                        blue: [
                            34,
                            39
                        ],
                        magenta: [
                            35,
                            39
                        ],
                        cyan: [
                            36,
                            39
                        ],
                        white: [
                            37,
                            39
                        ],
                        gray: [
                            90,
                            39
                        ],
                        redBright: [
                            91,
                            39
                        ],
                        greenBright: [
                            92,
                            39
                        ],
                        yellowBright: [
                            93,
                            39
                        ],
                        blueBright: [
                            94,
                            39
                        ],
                        magentaBright: [
                            95,
                            39
                        ],
                        cyanBright: [
                            96,
                            39
                        ],
                        whiteBright: [
                            97,
                            39
                        ]
                    },
                    bgColor: {
                        bgBlack: [
                            40,
                            49
                        ],
                        bgRed: [
                            41,
                            49
                        ],
                        bgGreen: [
                            42,
                            49
                        ],
                        bgYellow: [
                            43,
                            49
                        ],
                        bgBlue: [
                            44,
                            49
                        ],
                        bgMagenta: [
                            45,
                            49
                        ],
                        bgCyan: [
                            46,
                            49
                        ],
                        bgWhite: [
                            47,
                            49
                        ],
                        bgBlackBright: [
                            100,
                            49
                        ],
                        bgRedBright: [
                            101,
                            49
                        ],
                        bgGreenBright: [
                            102,
                            49
                        ],
                        bgYellowBright: [
                            103,
                            49
                        ],
                        bgBlueBright: [
                            104,
                            49
                        ],
                        bgMagentaBright: [
                            105,
                            49
                        ],
                        bgCyanBright: [
                            106,
                            49
                        ],
                        bgWhiteBright: [
                            107,
                            49
                        ]
                    }
                };
                e.color.grey = e.color.gray;
                for (const n of Object.keys(e)){
                    const t = e[n];
                    for (const n of Object.keys(t)){
                        const a = t[n];
                        e[n] = {
                            open: `[${a[0]}m`,
                            close: `[${a[1]}m`
                        };
                        t[n] = e[n];
                        r.set(a[0], a[1]);
                    }
                    Object.defineProperty(e, n, {
                        value: t,
                        enumerable: false
                    });
                    Object.defineProperty(e, "codes", {
                        value: r,
                        enumerable: false
                    });
                }
                const ansi2ansi = (r)=>r;
                const rgb2rgb = (r, e, n)=>[
                        r,
                        e,
                        n
                    ];
                e.color.close = "\x1b[39m";
                e.bgColor.close = "\x1b[49m";
                e.color.ansi = {
                    ansi: wrapAnsi16(ansi2ansi, 0)
                };
                e.color.ansi256 = {
                    ansi256: wrapAnsi256(ansi2ansi, 0)
                };
                e.color.ansi16m = {
                    rgb: wrapAnsi16m(rgb2rgb, 0)
                };
                e.bgColor.ansi = {
                    ansi: wrapAnsi16(ansi2ansi, 10)
                };
                e.bgColor.ansi256 = {
                    ansi256: wrapAnsi256(ansi2ansi, 10)
                };
                e.bgColor.ansi16m = {
                    rgb: wrapAnsi16m(rgb2rgb, 10)
                };
                for (let r of Object.keys(t)){
                    if (typeof t[r] !== "object") {
                        continue;
                    }
                    const n = t[r];
                    if (r === "ansi16") {
                        r = "ansi";
                    }
                    if ("ansi16" in n) {
                        e.color.ansi[r] = wrapAnsi16(n.ansi16, 0);
                        e.bgColor.ansi[r] = wrapAnsi16(n.ansi16, 10);
                    }
                    if ("ansi256" in n) {
                        e.color.ansi256[r] = wrapAnsi256(n.ansi256, 0);
                        e.bgColor.ansi256[r] = wrapAnsi256(n.ansi256, 10);
                    }
                    if ("rgb" in n) {
                        e.color.ansi16m[r] = wrapAnsi16m(n.rgb, 0);
                        e.bgColor.ansi16m[r] = wrapAnsi16m(n.rgb, 10);
                    }
                }
                return e;
            }
            Object.defineProperty(r, "exports", {
                enumerable: true,
                get: assembleStyles
            });
        },
        148: (r, e, n)=>{
            "use strict";
            const t = n(379);
            const a = n(535);
            const o = n(220).stdout;
            const s = n(299);
            const l = process.platform === "win32" && !(process.env.TERM || "").toLowerCase().startsWith("xterm");
            const i = [
                "ansi",
                "ansi",
                "ansi256",
                "ansi16m"
            ];
            const c = new Set([
                "gray"
            ]);
            const u = Object.create(null);
            function applyOptions(r, e) {
                e = e || {};
                const n = o ? o.level : 0;
                r.level = e.level === undefined ? n : e.level;
                r.enabled = "enabled" in e ? e.enabled : r.level > 0;
            }
            function Chalk(r) {
                if (!this || !(this instanceof Chalk) || this.template) {
                    const e = {};
                    applyOptions(e, r);
                    e.template = function() {
                        const r = [].slice.call(arguments);
                        return chalkTag.apply(null, [
                            e.template
                        ].concat(r));
                    };
                    Object.setPrototypeOf(e, Chalk.prototype);
                    Object.setPrototypeOf(e.template, e);
                    e.template.constructor = Chalk;
                    return e.template;
                }
                applyOptions(this, r);
            }
            if (l) {
                a.blue.open = "\x1b[94m";
            }
            for (const r of Object.keys(a)){
                a[r].closeRe = new RegExp(t(a[r].close), "g");
                u[r] = {
                    get () {
                        const e = a[r];
                        return build.call(this, this._styles ? this._styles.concat(e) : [
                            e
                        ], this._empty, r);
                    }
                };
            }
            u.visible = {
                get () {
                    return build.call(this, this._styles || [], true, "visible");
                }
            };
            a.color.closeRe = new RegExp(t(a.color.close), "g");
            for (const r of Object.keys(a.color.ansi)){
                if (c.has(r)) {
                    continue;
                }
                u[r] = {
                    get () {
                        const e = this.level;
                        return function() {
                            const n = a.color[i[e]][r].apply(null, arguments);
                            const t = {
                                open: n,
                                close: a.color.close,
                                closeRe: a.color.closeRe
                            };
                            return build.call(this, this._styles ? this._styles.concat(t) : [
                                t
                            ], this._empty, r);
                        };
                    }
                };
            }
            a.bgColor.closeRe = new RegExp(t(a.bgColor.close), "g");
            for (const r of Object.keys(a.bgColor.ansi)){
                if (c.has(r)) {
                    continue;
                }
                const e = "bg" + r[0].toUpperCase() + r.slice(1);
                u[e] = {
                    get () {
                        const e = this.level;
                        return function() {
                            const n = a.bgColor[i[e]][r].apply(null, arguments);
                            const t = {
                                open: n,
                                close: a.bgColor.close,
                                closeRe: a.bgColor.closeRe
                            };
                            return build.call(this, this._styles ? this._styles.concat(t) : [
                                t
                            ], this._empty, r);
                        };
                    }
                };
            }
            const v = Object.defineProperties(()=>{}, u);
            function build(r, e, n) {
                const builder = function() {
                    return applyStyle.apply(builder, arguments);
                };
                builder._styles = r;
                builder._empty = e;
                const t = this;
                Object.defineProperty(builder, "level", {
                    enumerable: true,
                    get () {
                        return t.level;
                    },
                    set (r) {
                        t.level = r;
                    }
                });
                Object.defineProperty(builder, "enabled", {
                    enumerable: true,
                    get () {
                        return t.enabled;
                    },
                    set (r) {
                        t.enabled = r;
                    }
                });
                builder.hasGrey = this.hasGrey || n === "gray" || n === "grey";
                builder.__proto__ = v;
                return builder;
            }
            function applyStyle() {
                const r = arguments;
                const e = r.length;
                let n = String(arguments[0]);
                if (e === 0) {
                    return "";
                }
                if (e > 1) {
                    for(let t = 1; t < e; t++){
                        n += " " + r[t];
                    }
                }
                if (!this.enabled || this.level <= 0 || !n) {
                    return this._empty ? "" : n;
                }
                const t = a.dim.open;
                if (l && this.hasGrey) {
                    a.dim.open = "";
                }
                for (const r of this._styles.slice().reverse()){
                    n = r.open + n.replace(r.closeRe, r.open) + r.close;
                    n = n.replace(/\r?\n/g, `${r.close}$&${r.open}`);
                }
                a.dim.open = t;
                return n;
            }
            function chalkTag(r, e) {
                if (!Array.isArray(e)) {
                    return [].slice.call(arguments, 1).join(" ");
                }
                const n = [].slice.call(arguments, 2);
                const t = [
                    e.raw[0]
                ];
                for(let r = 1; r < e.length; r++){
                    t.push(String(n[r - 1]).replace(/[{}\\]/g, "\\$&"));
                    t.push(String(e.raw[r]));
                }
                return s(r, t.join(""));
            }
            Object.defineProperties(Chalk.prototype, u);
            r.exports = Chalk();
            r.exports.supportsColor = o;
            r.exports["default"] = r.exports;
        },
        299: (r)=>{
            "use strict";
            const e = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
            const n = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
            const t = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
            const a = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;
            const o = new Map([
                [
                    "n",
                    "\n"
                ],
                [
                    "r",
                    "\r"
                ],
                [
                    "t",
                    "	"
                ],
                [
                    "b",
                    "\b"
                ],
                [
                    "f",
                    "\f"
                ],
                [
                    "v",
                    "\v"
                ],
                [
                    "0",
                    "\x00"
                ],
                [
                    "\\",
                    "\\"
                ],
                [
                    "e",
                    "\x1b"
                ],
                [
                    "a",
                    "\x07"
                ]
            ]);
            function unescape(r) {
                if (r[0] === "u" && r.length === 5 || r[0] === "x" && r.length === 3) {
                    return String.fromCharCode(parseInt(r.slice(1), 16));
                }
                return o.get(r) || r;
            }
            function parseArguments(r, e) {
                const n = [];
                const o = e.trim().split(/\s*,\s*/g);
                let s;
                for (const e of o){
                    if (!isNaN(e)) {
                        n.push(Number(e));
                    } else if (s = e.match(t)) {
                        n.push(s[2].replace(a, (r, e, n)=>e ? unescape(e) : n));
                    } else {
                        throw new Error(`Invalid Chalk template style argument: ${e} (in style '${r}')`);
                    }
                }
                return n;
            }
            function parseStyle(r) {
                n.lastIndex = 0;
                const e = [];
                let t;
                while((t = n.exec(r)) !== null){
                    const r = t[1];
                    if (t[2]) {
                        const n = parseArguments(r, t[2]);
                        e.push([
                            r
                        ].concat(n));
                    } else {
                        e.push([
                            r
                        ]);
                    }
                }
                return e;
            }
            function buildStyle(r, e) {
                const n = {};
                for (const r of e){
                    for (const e of r.styles){
                        n[e[0]] = r.inverse ? null : e.slice(1);
                    }
                }
                let t = r;
                for (const r of Object.keys(n)){
                    if (Array.isArray(n[r])) {
                        if (!(r in t)) {
                            throw new Error(`Unknown Chalk style: ${r}`);
                        }
                        if (n[r].length > 0) {
                            t = t[r].apply(t, n[r]);
                        } else {
                            t = t[r];
                        }
                    }
                }
                return t;
            }
            r.exports = (r, n)=>{
                const t = [];
                const a = [];
                let o = [];
                n.replace(e, (e, n, s, l, i, c)=>{
                    if (n) {
                        o.push(unescape(n));
                    } else if (l) {
                        const e = o.join("");
                        o = [];
                        a.push(t.length === 0 ? e : buildStyle(r, t)(e));
                        t.push({
                            inverse: s,
                            styles: parseStyle(l)
                        });
                    } else if (i) {
                        if (t.length === 0) {
                            throw new Error("Found extraneous } in Chalk template literal");
                        }
                        a.push(buildStyle(r, t)(o.join("")));
                        o = [];
                        t.pop();
                    } else {
                        o.push(c);
                    }
                });
                a.push(o.join(""));
                if (t.length > 0) {
                    const r = `Chalk template literal is missing ${t.length} closing bracket${t.length === 1 ? "" : "s"} (\`}\`)`;
                    throw new Error(r);
                }
                return a.join("");
            };
        },
        117: (r, e, n)=>{
            var t = n(251);
            var a = {};
            for(var o in t){
                if (t.hasOwnProperty(o)) {
                    a[t[o]] = o;
                }
            }
            var s = r.exports = {
                rgb: {
                    channels: 3,
                    labels: "rgb"
                },
                hsl: {
                    channels: 3,
                    labels: "hsl"
                },
                hsv: {
                    channels: 3,
                    labels: "hsv"
                },
                hwb: {
                    channels: 3,
                    labels: "hwb"
                },
                cmyk: {
                    channels: 4,
                    labels: "cmyk"
                },
                xyz: {
                    channels: 3,
                    labels: "xyz"
                },
                lab: {
                    channels: 3,
                    labels: "lab"
                },
                lch: {
                    channels: 3,
                    labels: "lch"
                },
                hex: {
                    channels: 1,
                    labels: [
                        "hex"
                    ]
                },
                keyword: {
                    channels: 1,
                    labels: [
                        "keyword"
                    ]
                },
                ansi16: {
                    channels: 1,
                    labels: [
                        "ansi16"
                    ]
                },
                ansi256: {
                    channels: 1,
                    labels: [
                        "ansi256"
                    ]
                },
                hcg: {
                    channels: 3,
                    labels: [
                        "h",
                        "c",
                        "g"
                    ]
                },
                apple: {
                    channels: 3,
                    labels: [
                        "r16",
                        "g16",
                        "b16"
                    ]
                },
                gray: {
                    channels: 1,
                    labels: [
                        "gray"
                    ]
                }
            };
            for(var l in s){
                if (s.hasOwnProperty(l)) {
                    if (!("channels" in s[l])) {
                        throw new Error("missing channels property: " + l);
                    }
                    if (!("labels" in s[l])) {
                        throw new Error("missing channel labels property: " + l);
                    }
                    if (s[l].labels.length !== s[l].channels) {
                        throw new Error("channel and label counts mismatch: " + l);
                    }
                    var i = s[l].channels;
                    var c = s[l].labels;
                    delete s[l].channels;
                    delete s[l].labels;
                    Object.defineProperty(s[l], "channels", {
                        value: i
                    });
                    Object.defineProperty(s[l], "labels", {
                        value: c
                    });
                }
            }
            s.rgb.hsl = function(r) {
                var e = r[0] / 255;
                var n = r[1] / 255;
                var t = r[2] / 255;
                var a = Math.min(e, n, t);
                var o = Math.max(e, n, t);
                var s = o - a;
                var l;
                var i;
                var c;
                if (o === a) {
                    l = 0;
                } else if (e === o) {
                    l = (n - t) / s;
                } else if (n === o) {
                    l = 2 + (t - e) / s;
                } else if (t === o) {
                    l = 4 + (e - n) / s;
                }
                l = Math.min(l * 60, 360);
                if (l < 0) {
                    l += 360;
                }
                c = (a + o) / 2;
                if (o === a) {
                    i = 0;
                } else if (c <= .5) {
                    i = s / (o + a);
                } else {
                    i = s / (2 - o - a);
                }
                return [
                    l,
                    i * 100,
                    c * 100
                ];
            };
            s.rgb.hsv = function(r) {
                var e;
                var n;
                var t;
                var a;
                var o;
                var s = r[0] / 255;
                var l = r[1] / 255;
                var i = r[2] / 255;
                var c = Math.max(s, l, i);
                var u = c - Math.min(s, l, i);
                var diffc = function(r) {
                    return (c - r) / 6 / u + 1 / 2;
                };
                if (u === 0) {
                    a = o = 0;
                } else {
                    o = u / c;
                    e = diffc(s);
                    n = diffc(l);
                    t = diffc(i);
                    if (s === c) {
                        a = t - n;
                    } else if (l === c) {
                        a = 1 / 3 + e - t;
                    } else if (i === c) {
                        a = 2 / 3 + n - e;
                    }
                    if (a < 0) {
                        a += 1;
                    } else if (a > 1) {
                        a -= 1;
                    }
                }
                return [
                    a * 360,
                    o * 100,
                    c * 100
                ];
            };
            s.rgb.hwb = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a = s.rgb.hsl(r)[0];
                var o = 1 / 255 * Math.min(e, Math.min(n, t));
                t = 1 - 1 / 255 * Math.max(e, Math.max(n, t));
                return [
                    a,
                    o * 100,
                    t * 100
                ];
            };
            s.rgb.cmyk = function(r) {
                var e = r[0] / 255;
                var n = r[1] / 255;
                var t = r[2] / 255;
                var a;
                var o;
                var s;
                var l;
                l = Math.min(1 - e, 1 - n, 1 - t);
                a = (1 - e - l) / (1 - l) || 0;
                o = (1 - n - l) / (1 - l) || 0;
                s = (1 - t - l) / (1 - l) || 0;
                return [
                    a * 100,
                    o * 100,
                    s * 100,
                    l * 100
                ];
            };
            function comparativeDistance(r, e) {
                return Math.pow(r[0] - e[0], 2) + Math.pow(r[1] - e[1], 2) + Math.pow(r[2] - e[2], 2);
            }
            s.rgb.keyword = function(r) {
                var e = a[r];
                if (e) {
                    return e;
                }
                var n = Infinity;
                var o;
                for(var s in t){
                    if (t.hasOwnProperty(s)) {
                        var l = t[s];
                        var i = comparativeDistance(r, l);
                        if (i < n) {
                            n = i;
                            o = s;
                        }
                    }
                }
                return o;
            };
            s.keyword.rgb = function(r) {
                return t[r];
            };
            s.rgb.xyz = function(r) {
                var e = r[0] / 255;
                var n = r[1] / 255;
                var t = r[2] / 255;
                e = e > .04045 ? Math.pow((e + .055) / 1.055, 2.4) : e / 12.92;
                n = n > .04045 ? Math.pow((n + .055) / 1.055, 2.4) : n / 12.92;
                t = t > .04045 ? Math.pow((t + .055) / 1.055, 2.4) : t / 12.92;
                var a = e * .4124 + n * .3576 + t * .1805;
                var o = e * .2126 + n * .7152 + t * .0722;
                var s = e * .0193 + n * .1192 + t * .9505;
                return [
                    a * 100,
                    o * 100,
                    s * 100
                ];
            };
            s.rgb.lab = function(r) {
                var e = s.rgb.xyz(r);
                var n = e[0];
                var t = e[1];
                var a = e[2];
                var o;
                var l;
                var i;
                n /= 95.047;
                t /= 100;
                a /= 108.883;
                n = n > .008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116;
                t = t > .008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
                a = a > .008856 ? Math.pow(a, 1 / 3) : 7.787 * a + 16 / 116;
                o = 116 * t - 16;
                l = 500 * (n - t);
                i = 200 * (t - a);
                return [
                    o,
                    l,
                    i
                ];
            };
            s.hsl.rgb = function(r) {
                var e = r[0] / 360;
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a;
                var o;
                var s;
                var l;
                var i;
                if (n === 0) {
                    i = t * 255;
                    return [
                        i,
                        i,
                        i
                    ];
                }
                if (t < .5) {
                    o = t * (1 + n);
                } else {
                    o = t + n - t * n;
                }
                a = 2 * t - o;
                l = [
                    0,
                    0,
                    0
                ];
                for(var c = 0; c < 3; c++){
                    s = e + 1 / 3 * -(c - 1);
                    if (s < 0) {
                        s++;
                    }
                    if (s > 1) {
                        s--;
                    }
                    if (6 * s < 1) {
                        i = a + (o - a) * 6 * s;
                    } else if (2 * s < 1) {
                        i = o;
                    } else if (3 * s < 2) {
                        i = a + (o - a) * (2 / 3 - s) * 6;
                    } else {
                        i = a;
                    }
                    l[c] = i * 255;
                }
                return l;
            };
            s.hsl.hsv = function(r) {
                var e = r[0];
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a = n;
                var o = Math.max(t, .01);
                var s;
                var l;
                t *= 2;
                n *= t <= 1 ? t : 2 - t;
                a *= o <= 1 ? o : 2 - o;
                l = (t + n) / 2;
                s = t === 0 ? 2 * a / (o + a) : 2 * n / (t + n);
                return [
                    e,
                    s * 100,
                    l * 100
                ];
            };
            s.hsv.rgb = function(r) {
                var e = r[0] / 60;
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a = Math.floor(e) % 6;
                var o = e - Math.floor(e);
                var s = 255 * t * (1 - n);
                var l = 255 * t * (1 - n * o);
                var i = 255 * t * (1 - n * (1 - o));
                t *= 255;
                switch(a){
                    case 0:
                        return [
                            t,
                            i,
                            s
                        ];
                    case 1:
                        return [
                            l,
                            t,
                            s
                        ];
                    case 2:
                        return [
                            s,
                            t,
                            i
                        ];
                    case 3:
                        return [
                            s,
                            l,
                            t
                        ];
                    case 4:
                        return [
                            i,
                            s,
                            t
                        ];
                    case 5:
                        return [
                            t,
                            s,
                            l
                        ];
                }
            };
            s.hsv.hsl = function(r) {
                var e = r[0];
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a = Math.max(t, .01);
                var o;
                var s;
                var l;
                l = (2 - n) * t;
                o = (2 - n) * a;
                s = n * a;
                s /= o <= 1 ? o : 2 - o;
                s = s || 0;
                l /= 2;
                return [
                    e,
                    s * 100,
                    l * 100
                ];
            };
            s.hwb.rgb = function(r) {
                var e = r[0] / 360;
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a = n + t;
                var o;
                var s;
                var l;
                var i;
                if (a > 1) {
                    n /= a;
                    t /= a;
                }
                o = Math.floor(6 * e);
                s = 1 - t;
                l = 6 * e - o;
                if ((o & 1) !== 0) {
                    l = 1 - l;
                }
                i = n + l * (s - n);
                var c;
                var u;
                var v;
                switch(o){
                    default:
                    case 6:
                    case 0:
                        c = s;
                        u = i;
                        v = n;
                        break;
                    case 1:
                        c = i;
                        u = s;
                        v = n;
                        break;
                    case 2:
                        c = n;
                        u = s;
                        v = i;
                        break;
                    case 3:
                        c = n;
                        u = i;
                        v = s;
                        break;
                    case 4:
                        c = i;
                        u = n;
                        v = s;
                        break;
                    case 5:
                        c = s;
                        u = n;
                        v = i;
                        break;
                }
                return [
                    c * 255,
                    u * 255,
                    v * 255
                ];
            };
            s.cmyk.rgb = function(r) {
                var e = r[0] / 100;
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a = r[3] / 100;
                var o;
                var s;
                var l;
                o = 1 - Math.min(1, e * (1 - a) + a);
                s = 1 - Math.min(1, n * (1 - a) + a);
                l = 1 - Math.min(1, t * (1 - a) + a);
                return [
                    o * 255,
                    s * 255,
                    l * 255
                ];
            };
            s.xyz.rgb = function(r) {
                var e = r[0] / 100;
                var n = r[1] / 100;
                var t = r[2] / 100;
                var a;
                var o;
                var s;
                a = e * 3.2406 + n * -1.5372 + t * -.4986;
                o = e * -.9689 + n * 1.8758 + t * .0415;
                s = e * .0557 + n * -.204 + t * 1.057;
                a = a > .0031308 ? 1.055 * Math.pow(a, 1 / 2.4) - .055 : a * 12.92;
                o = o > .0031308 ? 1.055 * Math.pow(o, 1 / 2.4) - .055 : o * 12.92;
                s = s > .0031308 ? 1.055 * Math.pow(s, 1 / 2.4) - .055 : s * 12.92;
                a = Math.min(Math.max(0, a), 1);
                o = Math.min(Math.max(0, o), 1);
                s = Math.min(Math.max(0, s), 1);
                return [
                    a * 255,
                    o * 255,
                    s * 255
                ];
            };
            s.xyz.lab = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a;
                var o;
                var s;
                e /= 95.047;
                n /= 100;
                t /= 108.883;
                e = e > .008856 ? Math.pow(e, 1 / 3) : 7.787 * e + 16 / 116;
                n = n > .008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116;
                t = t > .008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
                a = 116 * n - 16;
                o = 500 * (e - n);
                s = 200 * (n - t);
                return [
                    a,
                    o,
                    s
                ];
            };
            s.lab.xyz = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a;
                var o;
                var s;
                o = (e + 16) / 116;
                a = n / 500 + o;
                s = o - t / 200;
                var l = Math.pow(o, 3);
                var i = Math.pow(a, 3);
                var c = Math.pow(s, 3);
                o = l > .008856 ? l : (o - 16 / 116) / 7.787;
                a = i > .008856 ? i : (a - 16 / 116) / 7.787;
                s = c > .008856 ? c : (s - 16 / 116) / 7.787;
                a *= 95.047;
                o *= 100;
                s *= 108.883;
                return [
                    a,
                    o,
                    s
                ];
            };
            s.lab.lch = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a;
                var o;
                var s;
                a = Math.atan2(t, n);
                o = a * 360 / 2 / Math.PI;
                if (o < 0) {
                    o += 360;
                }
                s = Math.sqrt(n * n + t * t);
                return [
                    e,
                    s,
                    o
                ];
            };
            s.lch.lab = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a;
                var o;
                var s;
                s = t / 360 * 2 * Math.PI;
                a = n * Math.cos(s);
                o = n * Math.sin(s);
                return [
                    e,
                    a,
                    o
                ];
            };
            s.rgb.ansi16 = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                var a = 1 in arguments ? arguments[1] : s.rgb.hsv(r)[2];
                a = Math.round(a / 50);
                if (a === 0) {
                    return 30;
                }
                var o = 30 + (Math.round(t / 255) << 2 | Math.round(n / 255) << 1 | Math.round(e / 255));
                if (a === 2) {
                    o += 60;
                }
                return o;
            };
            s.hsv.ansi16 = function(r) {
                return s.rgb.ansi16(s.hsv.rgb(r), r[2]);
            };
            s.rgb.ansi256 = function(r) {
                var e = r[0];
                var n = r[1];
                var t = r[2];
                if (e === n && n === t) {
                    if (e < 8) {
                        return 16;
                    }
                    if (e > 248) {
                        return 231;
                    }
                    return Math.round((e - 8) / 247 * 24) + 232;
                }
                var a = 16 + 36 * Math.round(e / 255 * 5) + 6 * Math.round(n / 255 * 5) + Math.round(t / 255 * 5);
                return a;
            };
            s.ansi16.rgb = function(r) {
                var e = r % 10;
                if (e === 0 || e === 7) {
                    if (r > 50) {
                        e += 3.5;
                    }
                    e = e / 10.5 * 255;
                    return [
                        e,
                        e,
                        e
                    ];
                }
                var n = (~~(r > 50) + 1) * .5;
                var t = (e & 1) * n * 255;
                var a = (e >> 1 & 1) * n * 255;
                var o = (e >> 2 & 1) * n * 255;
                return [
                    t,
                    a,
                    o
                ];
            };
            s.ansi256.rgb = function(r) {
                if (r >= 232) {
                    var e = (r - 232) * 10 + 8;
                    return [
                        e,
                        e,
                        e
                    ];
                }
                r -= 16;
                var n;
                var t = Math.floor(r / 36) / 5 * 255;
                var a = Math.floor((n = r % 36) / 6) / 5 * 255;
                var o = n % 6 / 5 * 255;
                return [
                    t,
                    a,
                    o
                ];
            };
            s.rgb.hex = function(r) {
                var e = ((Math.round(r[0]) & 255) << 16) + ((Math.round(r[1]) & 255) << 8) + (Math.round(r[2]) & 255);
                var n = e.toString(16).toUpperCase();
                return "000000".substring(n.length) + n;
            };
            s.hex.rgb = function(r) {
                var e = r.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
                if (!e) {
                    return [
                        0,
                        0,
                        0
                    ];
                }
                var n = e[0];
                if (e[0].length === 3) {
                    n = n.split("").map(function(r) {
                        return r + r;
                    }).join("");
                }
                var t = parseInt(n, 16);
                var a = t >> 16 & 255;
                var o = t >> 8 & 255;
                var s = t & 255;
                return [
                    a,
                    o,
                    s
                ];
            };
            s.rgb.hcg = function(r) {
                var e = r[0] / 255;
                var n = r[1] / 255;
                var t = r[2] / 255;
                var a = Math.max(Math.max(e, n), t);
                var o = Math.min(Math.min(e, n), t);
                var s = a - o;
                var l;
                var i;
                if (s < 1) {
                    l = o / (1 - s);
                } else {
                    l = 0;
                }
                if (s <= 0) {
                    i = 0;
                } else if (a === e) {
                    i = (n - t) / s % 6;
                } else if (a === n) {
                    i = 2 + (t - e) / s;
                } else {
                    i = 4 + (e - n) / s + 4;
                }
                i /= 6;
                i %= 1;
                return [
                    i * 360,
                    s * 100,
                    l * 100
                ];
            };
            s.hsl.hcg = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = 1;
                var a = 0;
                if (n < .5) {
                    t = 2 * e * n;
                } else {
                    t = 2 * e * (1 - n);
                }
                if (t < 1) {
                    a = (n - .5 * t) / (1 - t);
                }
                return [
                    r[0],
                    t * 100,
                    a * 100
                ];
            };
            s.hsv.hcg = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = e * n;
                var a = 0;
                if (t < 1) {
                    a = (n - t) / (1 - t);
                }
                return [
                    r[0],
                    t * 100,
                    a * 100
                ];
            };
            s.hcg.rgb = function(r) {
                var e = r[0] / 360;
                var n = r[1] / 100;
                var t = r[2] / 100;
                if (n === 0) {
                    return [
                        t * 255,
                        t * 255,
                        t * 255
                    ];
                }
                var a = [
                    0,
                    0,
                    0
                ];
                var o = e % 1 * 6;
                var s = o % 1;
                var l = 1 - s;
                var i = 0;
                switch(Math.floor(o)){
                    case 0:
                        a[0] = 1;
                        a[1] = s;
                        a[2] = 0;
                        break;
                    case 1:
                        a[0] = l;
                        a[1] = 1;
                        a[2] = 0;
                        break;
                    case 2:
                        a[0] = 0;
                        a[1] = 1;
                        a[2] = s;
                        break;
                    case 3:
                        a[0] = 0;
                        a[1] = l;
                        a[2] = 1;
                        break;
                    case 4:
                        a[0] = s;
                        a[1] = 0;
                        a[2] = 1;
                        break;
                    default:
                        a[0] = 1;
                        a[1] = 0;
                        a[2] = l;
                }
                i = (1 - n) * t;
                return [
                    (n * a[0] + i) * 255,
                    (n * a[1] + i) * 255,
                    (n * a[2] + i) * 255
                ];
            };
            s.hcg.hsv = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = e + n * (1 - e);
                var a = 0;
                if (t > 0) {
                    a = e / t;
                }
                return [
                    r[0],
                    a * 100,
                    t * 100
                ];
            };
            s.hcg.hsl = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = n * (1 - e) + .5 * e;
                var a = 0;
                if (t > 0 && t < .5) {
                    a = e / (2 * t);
                } else if (t >= .5 && t < 1) {
                    a = e / (2 * (1 - t));
                }
                return [
                    r[0],
                    a * 100,
                    t * 100
                ];
            };
            s.hcg.hwb = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = e + n * (1 - e);
                return [
                    r[0],
                    (t - e) * 100,
                    (1 - t) * 100
                ];
            };
            s.hwb.hcg = function(r) {
                var e = r[1] / 100;
                var n = r[2] / 100;
                var t = 1 - n;
                var a = t - e;
                var o = 0;
                if (a < 1) {
                    o = (t - a) / (1 - a);
                }
                return [
                    r[0],
                    a * 100,
                    o * 100
                ];
            };
            s.apple.rgb = function(r) {
                return [
                    r[0] / 65535 * 255,
                    r[1] / 65535 * 255,
                    r[2] / 65535 * 255
                ];
            };
            s.rgb.apple = function(r) {
                return [
                    r[0] / 255 * 65535,
                    r[1] / 255 * 65535,
                    r[2] / 255 * 65535
                ];
            };
            s.gray.rgb = function(r) {
                return [
                    r[0] / 100 * 255,
                    r[0] / 100 * 255,
                    r[0] / 100 * 255
                ];
            };
            s.gray.hsl = s.gray.hsv = function(r) {
                return [
                    0,
                    0,
                    r[0]
                ];
            };
            s.gray.hwb = function(r) {
                return [
                    0,
                    100,
                    r[0]
                ];
            };
            s.gray.cmyk = function(r) {
                return [
                    0,
                    0,
                    0,
                    r[0]
                ];
            };
            s.gray.lab = function(r) {
                return [
                    r[0],
                    0,
                    0
                ];
            };
            s.gray.hex = function(r) {
                var e = Math.round(r[0] / 100 * 255) & 255;
                var n = (e << 16) + (e << 8) + e;
                var t = n.toString(16).toUpperCase();
                return "000000".substring(t.length) + t;
            };
            s.rgb.gray = function(r) {
                var e = (r[0] + r[1] + r[2]) / 3;
                return [
                    e / 255 * 100
                ];
            };
        },
        54: (r, e, n)=>{
            var t = n(117);
            var a = n(528);
            var o = {};
            var s = Object.keys(t);
            function wrapRaw(r) {
                var wrappedFn = function(e) {
                    if (e === undefined || e === null) {
                        return e;
                    }
                    if (arguments.length > 1) {
                        e = Array.prototype.slice.call(arguments);
                    }
                    return r(e);
                };
                if ("conversion" in r) {
                    wrappedFn.conversion = r.conversion;
                }
                return wrappedFn;
            }
            function wrapRounded(r) {
                var wrappedFn = function(e) {
                    if (e === undefined || e === null) {
                        return e;
                    }
                    if (arguments.length > 1) {
                        e = Array.prototype.slice.call(arguments);
                    }
                    var n = r(e);
                    if (typeof n === "object") {
                        for(var t = n.length, a = 0; a < t; a++){
                            n[a] = Math.round(n[a]);
                        }
                    }
                    return n;
                };
                if ("conversion" in r) {
                    wrappedFn.conversion = r.conversion;
                }
                return wrappedFn;
            }
            s.forEach(function(r) {
                o[r] = {};
                Object.defineProperty(o[r], "channels", {
                    value: t[r].channels
                });
                Object.defineProperty(o[r], "labels", {
                    value: t[r].labels
                });
                var e = a(r);
                var n = Object.keys(e);
                n.forEach(function(n) {
                    var t = e[n];
                    o[r][n] = wrapRounded(t);
                    o[r][n].raw = wrapRaw(t);
                });
            });
            r.exports = o;
        },
        528: (r, e, n)=>{
            var t = n(117);
            function buildGraph() {
                var r = {};
                var e = Object.keys(t);
                for(var n = e.length, a = 0; a < n; a++){
                    r[e[a]] = {
                        distance: -1,
                        parent: null
                    };
                }
                return r;
            }
            function deriveBFS(r) {
                var e = buildGraph();
                var n = [
                    r
                ];
                e[r].distance = 0;
                while(n.length){
                    var a = n.pop();
                    var o = Object.keys(t[a]);
                    for(var s = o.length, l = 0; l < s; l++){
                        var i = o[l];
                        var c = e[i];
                        if (c.distance === -1) {
                            c.distance = e[a].distance + 1;
                            c.parent = a;
                            n.unshift(i);
                        }
                    }
                }
                return e;
            }
            function link(r, e) {
                return function(n) {
                    return e(r(n));
                };
            }
            function wrapConversion(r, e) {
                var n = [
                    e[r].parent,
                    r
                ];
                var a = t[e[r].parent][r];
                var o = e[r].parent;
                while(e[o].parent){
                    n.unshift(e[o].parent);
                    a = link(t[e[o].parent][o], a);
                    o = e[o].parent;
                }
                a.conversion = n;
                return a;
            }
            r.exports = function(r) {
                var e = deriveBFS(r);
                var n = {};
                var t = Object.keys(e);
                for(var a = t.length, o = 0; o < a; o++){
                    var s = t[o];
                    var l = e[s];
                    if (l.parent === null) {
                        continue;
                    }
                    n[s] = wrapConversion(s, e);
                }
                return n;
            };
        },
        251: (r)=>{
            "use strict";
            r.exports = {
                aliceblue: [
                    240,
                    248,
                    255
                ],
                antiquewhite: [
                    250,
                    235,
                    215
                ],
                aqua: [
                    0,
                    255,
                    255
                ],
                aquamarine: [
                    127,
                    255,
                    212
                ],
                azure: [
                    240,
                    255,
                    255
                ],
                beige: [
                    245,
                    245,
                    220
                ],
                bisque: [
                    255,
                    228,
                    196
                ],
                black: [
                    0,
                    0,
                    0
                ],
                blanchedalmond: [
                    255,
                    235,
                    205
                ],
                blue: [
                    0,
                    0,
                    255
                ],
                blueviolet: [
                    138,
                    43,
                    226
                ],
                brown: [
                    165,
                    42,
                    42
                ],
                burlywood: [
                    222,
                    184,
                    135
                ],
                cadetblue: [
                    95,
                    158,
                    160
                ],
                chartreuse: [
                    127,
                    255,
                    0
                ],
                chocolate: [
                    210,
                    105,
                    30
                ],
                coral: [
                    255,
                    127,
                    80
                ],
                cornflowerblue: [
                    100,
                    149,
                    237
                ],
                cornsilk: [
                    255,
                    248,
                    220
                ],
                crimson: [
                    220,
                    20,
                    60
                ],
                cyan: [
                    0,
                    255,
                    255
                ],
                darkblue: [
                    0,
                    0,
                    139
                ],
                darkcyan: [
                    0,
                    139,
                    139
                ],
                darkgoldenrod: [
                    184,
                    134,
                    11
                ],
                darkgray: [
                    169,
                    169,
                    169
                ],
                darkgreen: [
                    0,
                    100,
                    0
                ],
                darkgrey: [
                    169,
                    169,
                    169
                ],
                darkkhaki: [
                    189,
                    183,
                    107
                ],
                darkmagenta: [
                    139,
                    0,
                    139
                ],
                darkolivegreen: [
                    85,
                    107,
                    47
                ],
                darkorange: [
                    255,
                    140,
                    0
                ],
                darkorchid: [
                    153,
                    50,
                    204
                ],
                darkred: [
                    139,
                    0,
                    0
                ],
                darksalmon: [
                    233,
                    150,
                    122
                ],
                darkseagreen: [
                    143,
                    188,
                    143
                ],
                darkslateblue: [
                    72,
                    61,
                    139
                ],
                darkslategray: [
                    47,
                    79,
                    79
                ],
                darkslategrey: [
                    47,
                    79,
                    79
                ],
                darkturquoise: [
                    0,
                    206,
                    209
                ],
                darkviolet: [
                    148,
                    0,
                    211
                ],
                deeppink: [
                    255,
                    20,
                    147
                ],
                deepskyblue: [
                    0,
                    191,
                    255
                ],
                dimgray: [
                    105,
                    105,
                    105
                ],
                dimgrey: [
                    105,
                    105,
                    105
                ],
                dodgerblue: [
                    30,
                    144,
                    255
                ],
                firebrick: [
                    178,
                    34,
                    34
                ],
                floralwhite: [
                    255,
                    250,
                    240
                ],
                forestgreen: [
                    34,
                    139,
                    34
                ],
                fuchsia: [
                    255,
                    0,
                    255
                ],
                gainsboro: [
                    220,
                    220,
                    220
                ],
                ghostwhite: [
                    248,
                    248,
                    255
                ],
                gold: [
                    255,
                    215,
                    0
                ],
                goldenrod: [
                    218,
                    165,
                    32
                ],
                gray: [
                    128,
                    128,
                    128
                ],
                green: [
                    0,
                    128,
                    0
                ],
                greenyellow: [
                    173,
                    255,
                    47
                ],
                grey: [
                    128,
                    128,
                    128
                ],
                honeydew: [
                    240,
                    255,
                    240
                ],
                hotpink: [
                    255,
                    105,
                    180
                ],
                indianred: [
                    205,
                    92,
                    92
                ],
                indigo: [
                    75,
                    0,
                    130
                ],
                ivory: [
                    255,
                    255,
                    240
                ],
                khaki: [
                    240,
                    230,
                    140
                ],
                lavender: [
                    230,
                    230,
                    250
                ],
                lavenderblush: [
                    255,
                    240,
                    245
                ],
                lawngreen: [
                    124,
                    252,
                    0
                ],
                lemonchiffon: [
                    255,
                    250,
                    205
                ],
                lightblue: [
                    173,
                    216,
                    230
                ],
                lightcoral: [
                    240,
                    128,
                    128
                ],
                lightcyan: [
                    224,
                    255,
                    255
                ],
                lightgoldenrodyellow: [
                    250,
                    250,
                    210
                ],
                lightgray: [
                    211,
                    211,
                    211
                ],
                lightgreen: [
                    144,
                    238,
                    144
                ],
                lightgrey: [
                    211,
                    211,
                    211
                ],
                lightpink: [
                    255,
                    182,
                    193
                ],
                lightsalmon: [
                    255,
                    160,
                    122
                ],
                lightseagreen: [
                    32,
                    178,
                    170
                ],
                lightskyblue: [
                    135,
                    206,
                    250
                ],
                lightslategray: [
                    119,
                    136,
                    153
                ],
                lightslategrey: [
                    119,
                    136,
                    153
                ],
                lightsteelblue: [
                    176,
                    196,
                    222
                ],
                lightyellow: [
                    255,
                    255,
                    224
                ],
                lime: [
                    0,
                    255,
                    0
                ],
                limegreen: [
                    50,
                    205,
                    50
                ],
                linen: [
                    250,
                    240,
                    230
                ],
                magenta: [
                    255,
                    0,
                    255
                ],
                maroon: [
                    128,
                    0,
                    0
                ],
                mediumaquamarine: [
                    102,
                    205,
                    170
                ],
                mediumblue: [
                    0,
                    0,
                    205
                ],
                mediumorchid: [
                    186,
                    85,
                    211
                ],
                mediumpurple: [
                    147,
                    112,
                    219
                ],
                mediumseagreen: [
                    60,
                    179,
                    113
                ],
                mediumslateblue: [
                    123,
                    104,
                    238
                ],
                mediumspringgreen: [
                    0,
                    250,
                    154
                ],
                mediumturquoise: [
                    72,
                    209,
                    204
                ],
                mediumvioletred: [
                    199,
                    21,
                    133
                ],
                midnightblue: [
                    25,
                    25,
                    112
                ],
                mintcream: [
                    245,
                    255,
                    250
                ],
                mistyrose: [
                    255,
                    228,
                    225
                ],
                moccasin: [
                    255,
                    228,
                    181
                ],
                navajowhite: [
                    255,
                    222,
                    173
                ],
                navy: [
                    0,
                    0,
                    128
                ],
                oldlace: [
                    253,
                    245,
                    230
                ],
                olive: [
                    128,
                    128,
                    0
                ],
                olivedrab: [
                    107,
                    142,
                    35
                ],
                orange: [
                    255,
                    165,
                    0
                ],
                orangered: [
                    255,
                    69,
                    0
                ],
                orchid: [
                    218,
                    112,
                    214
                ],
                palegoldenrod: [
                    238,
                    232,
                    170
                ],
                palegreen: [
                    152,
                    251,
                    152
                ],
                paleturquoise: [
                    175,
                    238,
                    238
                ],
                palevioletred: [
                    219,
                    112,
                    147
                ],
                papayawhip: [
                    255,
                    239,
                    213
                ],
                peachpuff: [
                    255,
                    218,
                    185
                ],
                peru: [
                    205,
                    133,
                    63
                ],
                pink: [
                    255,
                    192,
                    203
                ],
                plum: [
                    221,
                    160,
                    221
                ],
                powderblue: [
                    176,
                    224,
                    230
                ],
                purple: [
                    128,
                    0,
                    128
                ],
                rebeccapurple: [
                    102,
                    51,
                    153
                ],
                red: [
                    255,
                    0,
                    0
                ],
                rosybrown: [
                    188,
                    143,
                    143
                ],
                royalblue: [
                    65,
                    105,
                    225
                ],
                saddlebrown: [
                    139,
                    69,
                    19
                ],
                salmon: [
                    250,
                    128,
                    114
                ],
                sandybrown: [
                    244,
                    164,
                    96
                ],
                seagreen: [
                    46,
                    139,
                    87
                ],
                seashell: [
                    255,
                    245,
                    238
                ],
                sienna: [
                    160,
                    82,
                    45
                ],
                silver: [
                    192,
                    192,
                    192
                ],
                skyblue: [
                    135,
                    206,
                    235
                ],
                slateblue: [
                    106,
                    90,
                    205
                ],
                slategray: [
                    112,
                    128,
                    144
                ],
                slategrey: [
                    112,
                    128,
                    144
                ],
                snow: [
                    255,
                    250,
                    250
                ],
                springgreen: [
                    0,
                    255,
                    127
                ],
                steelblue: [
                    70,
                    130,
                    180
                ],
                tan: [
                    210,
                    180,
                    140
                ],
                teal: [
                    0,
                    128,
                    128
                ],
                thistle: [
                    216,
                    191,
                    216
                ],
                tomato: [
                    255,
                    99,
                    71
                ],
                turquoise: [
                    64,
                    224,
                    208
                ],
                violet: [
                    238,
                    130,
                    238
                ],
                wheat: [
                    245,
                    222,
                    179
                ],
                white: [
                    255,
                    255,
                    255
                ],
                whitesmoke: [
                    245,
                    245,
                    245
                ],
                yellow: [
                    255,
                    255,
                    0
                ],
                yellowgreen: [
                    154,
                    205,
                    50
                ]
            };
        },
        379: (r)=>{
            "use strict";
            var e = /[|\\{}()[\]^$+*?.]/g;
            r.exports = function(r) {
                if (typeof r !== "string") {
                    throw new TypeError("Expected a string");
                }
                return r.replace(e, "\\$&");
            };
        },
        343: (r)=>{
            "use strict";
            r.exports = (r, e)=>{
                e = e || process.argv;
                const n = r.startsWith("-") ? "" : r.length === 1 ? "-" : "--";
                const t = e.indexOf(n + r);
                const a = e.indexOf("--");
                return t !== -1 && (a === -1 ? true : t < a);
            };
        },
        220: (r, e, n)=>{
            "use strict";
            const t = n(37);
            const a = n(343);
            const o = process.env;
            let s;
            if (a("no-color") || a("no-colors") || a("color=false")) {
                s = false;
            } else if (a("color") || a("colors") || a("color=true") || a("color=always")) {
                s = true;
            }
            if ("FORCE_COLOR" in o) {
                s = o.FORCE_COLOR.length === 0 || parseInt(o.FORCE_COLOR, 10) !== 0;
            }
            function translateLevel(r) {
                if (r === 0) {
                    return false;
                }
                return {
                    level: r,
                    hasBasic: true,
                    has256: r >= 2,
                    has16m: r >= 3
                };
            }
            function supportsColor(r) {
                if (s === false) {
                    return 0;
                }
                if (a("color=16m") || a("color=full") || a("color=truecolor")) {
                    return 3;
                }
                if (a("color=256")) {
                    return 2;
                }
                if (r && !r.isTTY && s !== true) {
                    return 0;
                }
                const e = s ? 1 : 0;
                if (process.platform === "win32") {
                    const r = t.release().split(".");
                    if (Number(process.versions.node.split(".")[0]) >= 8 && Number(r[0]) >= 10 && Number(r[2]) >= 10586) {
                        return Number(r[2]) >= 14931 ? 3 : 2;
                    }
                    return 1;
                }
                if ("CI" in o) {
                    if ([
                        "TRAVIS",
                        "CIRCLECI",
                        "APPVEYOR",
                        "GITLAB_CI"
                    ].some((r)=>r in o) || o.CI_NAME === "codeship") {
                        return 1;
                    }
                    return e;
                }
                if ("TEAMCITY_VERSION" in o) {
                    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(o.TEAMCITY_VERSION) ? 1 : 0;
                }
                if (o.COLORTERM === "truecolor") {
                    return 3;
                }
                if ("TERM_PROGRAM" in o) {
                    const r = parseInt((o.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
                    switch(o.TERM_PROGRAM){
                        case "iTerm.app":
                            return r >= 3 ? 3 : 2;
                        case "Apple_Terminal":
                            return 2;
                    }
                }
                if (/-256(color)?$/i.test(o.TERM)) {
                    return 2;
                }
                if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(o.TERM)) {
                    return 1;
                }
                if ("COLORTERM" in o) {
                    return 1;
                }
                if (o.TERM === "dumb") {
                    return e;
                }
                return e;
            }
            function getSupportLevel(r) {
                const e = supportsColor(r);
                return translateLevel(e);
            }
            r.exports = {
                supportsColor: getSupportLevel,
                stdout: getSupportLevel(process.stdout),
                stderr: getSupportLevel(process.stderr)
            };
        },
        37: (r)=>{
            "use strict";
            r.exports = __webpack_require__(22037);
        }
    };
    var e = {};
    function __nccwpck_require__(n) {
        var t = e[n];
        if (t !== undefined) {
            return t.exports;
        }
        var a = e[n] = {
            id: n,
            loaded: false,
            exports: {}
        };
        var o = true;
        try {
            r[n](a, a.exports, __nccwpck_require__);
            o = false;
        } finally{
            if (o) delete e[n];
        }
        a.loaded = true;
        return a.exports;
    }
    (()=>{
        __nccwpck_require__.nmd = (r)=>{
            r.paths = [];
            if (!r.children) r.children = [];
            return r;
        };
    })();
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname + "/";
    var n = __nccwpck_require__(148);
    module.exports = n;
})();


/***/ }),

/***/ 37784:
/***/ ((module) => {


(()=>{
    "use strict";
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname + "/";
    var e = {};
    (()=>{
        var r = e;
        /*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ r.parse = parse;
        r.serialize = serialize;
        var i = decodeURIComponent;
        var t = encodeURIComponent;
        var a = /; */;
        var n = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        function parse(e, r) {
            if (typeof e !== "string") {
                throw new TypeError("argument str must be a string");
            }
            var t = {};
            var n = r || {};
            var o = e.split(a);
            var s = n.decode || i;
            for(var p = 0; p < o.length; p++){
                var f = o[p];
                var u = f.indexOf("=");
                if (u < 0) {
                    continue;
                }
                var v = f.substr(0, u).trim();
                var c = f.substr(++u, f.length).trim();
                if ('"' == c[0]) {
                    c = c.slice(1, -1);
                }
                if (undefined == t[v]) {
                    t[v] = tryDecode(c, s);
                }
            }
            return t;
        }
        function serialize(e, r, i) {
            var a = i || {};
            var o = a.encode || t;
            if (typeof o !== "function") {
                throw new TypeError("option encode is invalid");
            }
            if (!n.test(e)) {
                throw new TypeError("argument name is invalid");
            }
            var s = o(r);
            if (s && !n.test(s)) {
                throw new TypeError("argument val is invalid");
            }
            var p = e + "=" + s;
            if (null != a.maxAge) {
                var f = a.maxAge - 0;
                if (isNaN(f) || !isFinite(f)) {
                    throw new TypeError("option maxAge is invalid");
                }
                p += "; Max-Age=" + Math.floor(f);
            }
            if (a.domain) {
                if (!n.test(a.domain)) {
                    throw new TypeError("option domain is invalid");
                }
                p += "; Domain=" + a.domain;
            }
            if (a.path) {
                if (!n.test(a.path)) {
                    throw new TypeError("option path is invalid");
                }
                p += "; Path=" + a.path;
            }
            if (a.expires) {
                if (typeof a.expires.toUTCString !== "function") {
                    throw new TypeError("option expires is invalid");
                }
                p += "; Expires=" + a.expires.toUTCString();
            }
            if (a.httpOnly) {
                p += "; HttpOnly";
            }
            if (a.secure) {
                p += "; Secure";
            }
            if (a.sameSite) {
                var u = typeof a.sameSite === "string" ? a.sameSite.toLowerCase() : a.sameSite;
                switch(u){
                    case true:
                        p += "; SameSite=Strict";
                        break;
                    case "lax":
                        p += "; SameSite=Lax";
                        break;
                    case "strict":
                        p += "; SameSite=Strict";
                        break;
                    case "none":
                        p += "; SameSite=None";
                        break;
                    default:
                        throw new TypeError("option sameSite is invalid");
                }
            }
            return p;
        }
        function tryDecode(e, r) {
            try {
                return r(e);
            } catch (r) {
                return e;
            }
        }
    })();
    module.exports = e;
})();


/***/ }),

/***/ 26310:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return _default;
    }
}));
let chalk;
if (false) {} else {
    chalk = __webpack_require__(12222);
}
const _default = chalk; //# sourceMappingURL=chalk.js.map


/***/ }),

/***/ 20418:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    NEXT_QUERY_PARAM_PREFIX: function() {
        return NEXT_QUERY_PARAM_PREFIX;
    },
    PRERENDER_REVALIDATE_HEADER: function() {
        return PRERENDER_REVALIDATE_HEADER;
    },
    PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER: function() {
        return PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER;
    },
    CACHE_ONE_YEAR: function() {
        return CACHE_ONE_YEAR;
    },
    MIDDLEWARE_FILENAME: function() {
        return MIDDLEWARE_FILENAME;
    },
    MIDDLEWARE_LOCATION_REGEXP: function() {
        return MIDDLEWARE_LOCATION_REGEXP;
    },
    INSTRUMENTATION_HOOK_FILENAME: function() {
        return INSTRUMENTATION_HOOK_FILENAME;
    },
    INSTRUMENTATION_HOOKS_LOCATION_REGEXP: function() {
        return INSTRUMENTATION_HOOKS_LOCATION_REGEXP;
    },
    PAGES_DIR_ALIAS: function() {
        return PAGES_DIR_ALIAS;
    },
    DOT_NEXT_ALIAS: function() {
        return DOT_NEXT_ALIAS;
    },
    ROOT_DIR_ALIAS: function() {
        return ROOT_DIR_ALIAS;
    },
    APP_DIR_ALIAS: function() {
        return APP_DIR_ALIAS;
    },
    RSC_MOD_REF_PROXY_ALIAS: function() {
        return RSC_MOD_REF_PROXY_ALIAS;
    },
    RSC_ACTION_VALIDATE_ALIAS: function() {
        return RSC_ACTION_VALIDATE_ALIAS;
    },
    RSC_ACTION_PROXY_ALIAS: function() {
        return RSC_ACTION_PROXY_ALIAS;
    },
    RSC_ACTION_CLIENT_WRAPPER_ALIAS: function() {
        return RSC_ACTION_CLIENT_WRAPPER_ALIAS;
    },
    PUBLIC_DIR_MIDDLEWARE_CONFLICT: function() {
        return PUBLIC_DIR_MIDDLEWARE_CONFLICT;
    },
    SSG_GET_INITIAL_PROPS_CONFLICT: function() {
        return SSG_GET_INITIAL_PROPS_CONFLICT;
    },
    SERVER_PROPS_GET_INIT_PROPS_CONFLICT: function() {
        return SERVER_PROPS_GET_INIT_PROPS_CONFLICT;
    },
    SERVER_PROPS_SSG_CONFLICT: function() {
        return SERVER_PROPS_SSG_CONFLICT;
    },
    STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR: function() {
        return STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR;
    },
    SERVER_PROPS_EXPORT_ERROR: function() {
        return SERVER_PROPS_EXPORT_ERROR;
    },
    GSP_NO_RETURNED_VALUE: function() {
        return GSP_NO_RETURNED_VALUE;
    },
    GSSP_NO_RETURNED_VALUE: function() {
        return GSSP_NO_RETURNED_VALUE;
    },
    UNSTABLE_REVALIDATE_RENAME_ERROR: function() {
        return UNSTABLE_REVALIDATE_RENAME_ERROR;
    },
    GSSP_COMPONENT_MEMBER_ERROR: function() {
        return GSSP_COMPONENT_MEMBER_ERROR;
    },
    NON_STANDARD_NODE_ENV: function() {
        return NON_STANDARD_NODE_ENV;
    },
    SSG_FALLBACK_EXPORT_ERROR: function() {
        return SSG_FALLBACK_EXPORT_ERROR;
    },
    ESLINT_DEFAULT_DIRS: function() {
        return ESLINT_DEFAULT_DIRS;
    },
    ESLINT_DEFAULT_DIRS_WITH_APP: function() {
        return ESLINT_DEFAULT_DIRS_WITH_APP;
    },
    ESLINT_PROMPT_VALUES: function() {
        return ESLINT_PROMPT_VALUES;
    },
    SERVER_RUNTIME: function() {
        return SERVER_RUNTIME;
    },
    WEBPACK_LAYERS: function() {
        return WEBPACK_LAYERS;
    },
    WEBPACK_RESOURCE_QUERIES: function() {
        return WEBPACK_RESOURCE_QUERIES;
    }
});
const NEXT_QUERY_PARAM_PREFIX = "nxtP";
const PRERENDER_REVALIDATE_HEADER = "x-prerender-revalidate";
const PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER = "x-prerender-revalidate-if-generated";
const CACHE_ONE_YEAR = 31536000;
const MIDDLEWARE_FILENAME = "middleware";
const MIDDLEWARE_LOCATION_REGEXP = `(?:src/)?${MIDDLEWARE_FILENAME}`;
const INSTRUMENTATION_HOOK_FILENAME = "instrumentation";
const INSTRUMENTATION_HOOKS_LOCATION_REGEXP = `(?:src/)?${INSTRUMENTATION_HOOK_FILENAME}`;
const PAGES_DIR_ALIAS = "private-next-pages";
const DOT_NEXT_ALIAS = "private-dot-next";
const ROOT_DIR_ALIAS = "private-next-root-dir";
const APP_DIR_ALIAS = "private-next-app-dir";
const RSC_MOD_REF_PROXY_ALIAS = "next/dist/build/webpack/loaders/next-flight-loader/module-proxy";
const RSC_ACTION_VALIDATE_ALIAS = "private-next-rsc-action-validate";
const RSC_ACTION_PROXY_ALIAS = "private-next-rsc-action-proxy";
const RSC_ACTION_CLIENT_WRAPPER_ALIAS = "private-next-rsc-action-client-wrapper";
const PUBLIC_DIR_MIDDLEWARE_CONFLICT = `You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://nextjs.org/docs/messages/public-next-folder-conflict`;
const SSG_GET_INITIAL_PROPS_CONFLICT = `You can not use getInitialProps with getStaticProps. To use SSG, please remove your getInitialProps`;
const SERVER_PROPS_GET_INIT_PROPS_CONFLICT = `You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.`;
const SERVER_PROPS_SSG_CONFLICT = `You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps`;
const STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR = `can not have getInitialProps/getServerSideProps, https://nextjs.org/docs/messages/404-get-initial-props`;
const SERVER_PROPS_EXPORT_ERROR = `pages with \`getServerSideProps\` can not be exported. See more info here: https://nextjs.org/docs/messages/gssp-export`;
const GSP_NO_RETURNED_VALUE = "Your `getStaticProps` function did not return an object. Did you forget to add a `return`?";
const GSSP_NO_RETURNED_VALUE = "Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?";
const UNSTABLE_REVALIDATE_RENAME_ERROR = "The `unstable_revalidate` property is available for general use.\n" + "Please use `revalidate` instead.";
const GSSP_COMPONENT_MEMBER_ERROR = `can not be attached to a page's component and must be exported from the page. See more info here: https://nextjs.org/docs/messages/gssp-component-member`;
const NON_STANDARD_NODE_ENV = `You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env`;
const SSG_FALLBACK_EXPORT_ERROR = `Pages with \`fallback\` enabled in \`getStaticPaths\` can not be exported. See more info here: https://nextjs.org/docs/messages/ssg-fallback-true-export`;
const ESLINT_DEFAULT_DIRS = [
    "pages",
    "components",
    "lib",
    "src"
];
const ESLINT_DEFAULT_DIRS_WITH_APP = [
    "app",
    ...ESLINT_DEFAULT_DIRS
];
const ESLINT_PROMPT_VALUES = [
    {
        title: "Strict",
        recommended: true,
        config: {
            extends: "next/core-web-vitals"
        }
    },
    {
        title: "Base",
        config: {
            extends: "next"
        }
    },
    {
        title: "Cancel",
        config: null
    }
];
const SERVER_RUNTIME = {
    edge: "edge",
    experimentalEdge: "experimental-edge",
    nodejs: "nodejs"
};
const WEBPACK_LAYERS_NAMES = {
    shared: "sc_shared",
    server: "sc_server",
    client: "sc_client",
    action: "sc_action",
    api: "api",
    middleware: "middleware",
    edgeAsset: "edge-asset",
    appClient: "app-client",
    metadataRoute: "app-metadata-route"
};
const WEBPACK_LAYERS = {
    ...WEBPACK_LAYERS_NAMES,
    GROUP: {
        server: [
            WEBPACK_LAYERS_NAMES.server,
            WEBPACK_LAYERS_NAMES.action,
            WEBPACK_LAYERS_NAMES.metadataRoute
        ]
    }
};
const WEBPACK_RESOURCE_QUERIES = {
    edgeSSREntry: "__next_edge_ssr_entry__",
    metadata: "__next_metadata__",
    metadataRoute: "__next_metadata_route__",
    metadataImageMeta: "__next_metadata_image_meta__"
}; //# sourceMappingURL=constants.js.map


/***/ }),

/***/ 57430:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getCookieParser: function() {
        return getCookieParser;
    },
    sendStatusCode: function() {
        return sendStatusCode;
    },
    redirect: function() {
        return redirect;
    },
    checkIsOnDemandRevalidate: function() {
        return checkIsOnDemandRevalidate;
    },
    COOKIE_NAME_PRERENDER_BYPASS: function() {
        return COOKIE_NAME_PRERENDER_BYPASS;
    },
    COOKIE_NAME_PRERENDER_DATA: function() {
        return COOKIE_NAME_PRERENDER_DATA;
    },
    RESPONSE_LIMIT_DEFAULT: function() {
        return RESPONSE_LIMIT_DEFAULT;
    },
    SYMBOL_PREVIEW_DATA: function() {
        return SYMBOL_PREVIEW_DATA;
    },
    SYMBOL_CLEARED_COOKIES: function() {
        return SYMBOL_CLEARED_COOKIES;
    },
    clearPreviewData: function() {
        return clearPreviewData;
    },
    ApiError: function() {
        return ApiError;
    },
    sendError: function() {
        return sendError;
    },
    setLazyProp: function() {
        return setLazyProp;
    }
});
const _headers = __webpack_require__(3356);
const _constants = __webpack_require__(20418);
function getCookieParser(headers) {
    return function parseCookie() {
        const { cookie } = headers;
        if (!cookie) {
            return {};
        }
        const { parse: parseCookieFn } = __webpack_require__(37784);
        return parseCookieFn(Array.isArray(cookie) ? cookie.join("; ") : cookie);
    };
}
function sendStatusCode(res, statusCode) {
    res.statusCode = statusCode;
    return res;
}
function redirect(res, statusOrUrl, url) {
    if (typeof statusOrUrl === "string") {
        url = statusOrUrl;
        statusOrUrl = 307;
    }
    if (typeof statusOrUrl !== "number" || typeof url !== "string") {
        throw new Error(`Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`);
    }
    res.writeHead(statusOrUrl, {
        Location: url
    });
    res.write(url);
    res.end();
    return res;
}
function checkIsOnDemandRevalidate(req, previewProps) {
    const headers = _headers.HeadersAdapter.from(req.headers);
    const previewModeId = headers.get(_constants.PRERENDER_REVALIDATE_HEADER);
    const isOnDemandRevalidate = previewModeId === previewProps.previewModeId;
    const revalidateOnlyGenerated = headers.has(_constants.PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER);
    return {
        isOnDemandRevalidate,
        revalidateOnlyGenerated
    };
}
const COOKIE_NAME_PRERENDER_BYPASS = `__prerender_bypass`;
const COOKIE_NAME_PRERENDER_DATA = `__next_preview_data`;
const RESPONSE_LIMIT_DEFAULT = 4 * 1024 * 1024;
const SYMBOL_PREVIEW_DATA = Symbol(COOKIE_NAME_PRERENDER_DATA);
const SYMBOL_CLEARED_COOKIES = Symbol(COOKIE_NAME_PRERENDER_BYPASS);
function clearPreviewData(res, options = {}) {
    if (SYMBOL_CLEARED_COOKIES in res) {
        return res;
    }
    const { serialize } = __webpack_require__(37784);
    const previous = res.getHeader("Set-Cookie");
    res.setHeader(`Set-Cookie`, [
        ...typeof previous === "string" ? [
            previous
        ] : Array.isArray(previous) ? previous : [],
        serialize(COOKIE_NAME_PRERENDER_BYPASS, "", {
            // To delete a cookie, set `expires` to a date in the past:
            // https://tools.ietf.org/html/rfc6265#section-4.1.1
            // `Max-Age: 0` is not valid, thus ignored, and the cookie is persisted.
            expires: new Date(0),
            httpOnly: true,
            sameSite:  true ? "none" : 0,
            secure: "production" !== "development",
            path: "/",
            ...options.path !== undefined ? {
                path: options.path
            } : undefined
        }),
        serialize(COOKIE_NAME_PRERENDER_DATA, "", {
            // To delete a cookie, set `expires` to a date in the past:
            // https://tools.ietf.org/html/rfc6265#section-4.1.1
            // `Max-Age: 0` is not valid, thus ignored, and the cookie is persisted.
            expires: new Date(0),
            httpOnly: true,
            sameSite:  true ? "none" : 0,
            secure: "production" !== "development",
            path: "/",
            ...options.path !== undefined ? {
                path: options.path
            } : undefined
        })
    ]);
    Object.defineProperty(res, SYMBOL_CLEARED_COOKIES, {
        value: true,
        enumerable: false
    });
    return res;
}
class ApiError extends Error {
    constructor(statusCode, message){
        super(message);
        this.statusCode = statusCode;
    }
}
function sendError(res, statusCode, message) {
    res.statusCode = statusCode;
    res.statusMessage = message;
    res.end(message);
}
function setLazyProp({ req }, prop, getter) {
    const opts = {
        configurable: true,
        enumerable: true
    };
    const optsReset = {
        ...opts,
        writable: true
    };
    Object.defineProperty(req, prop, {
        ...opts,
        get: ()=>{
            const value = getter();
            // we set the property on the object to avoid recalculating it
            Object.defineProperty(req, prop, {
                ...optsReset,
                value
            });
            return value;
        },
        set: (value)=>{
            Object.defineProperty(req, prop, {
                ...optsReset,
                value
            });
        }
    });
} //# sourceMappingURL=index.js.map


/***/ }),

/***/ 85195:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "DraftModeProvider", ({
    enumerable: true,
    get: function() {
        return DraftModeProvider;
    }
}));
const _apiutils = __webpack_require__(57430);
class DraftModeProvider {
    constructor(previewProps, req, cookies, mutableCookies){
        var _cookies_get;
        // The logic for draftMode() is very similar to tryGetPreviewData()
        // but Draft Mode does not have any data associated with it.
        const isOnDemandRevalidate = previewProps && (0, _apiutils.checkIsOnDemandRevalidate)(req, previewProps).isOnDemandRevalidate;
        const cookieValue = (_cookies_get = cookies.get(_apiutils.COOKIE_NAME_PRERENDER_BYPASS)) == null ? void 0 : _cookies_get.value;
        this.isEnabled = Boolean(!isOnDemandRevalidate && cookieValue && previewProps && cookieValue === previewProps.previewModeId);
        this._previewModeId = previewProps == null ? void 0 : previewProps.previewModeId;
        this._mutableCookies = mutableCookies;
    }
    enable() {
        if (!this._previewModeId) {
            throw new Error("Invariant: previewProps missing previewModeId this should never happen");
        }
        this._mutableCookies.set({
            name: _apiutils.COOKIE_NAME_PRERENDER_BYPASS,
            value: this._previewModeId,
            httpOnly: true,
            sameSite:  true ? "none" : 0,
            secure: "production" !== "development",
            path: "/"
        });
    }
    disable() {
        // To delete a cookie, set `expires` to a date in the past:
        // https://tools.ietf.org/html/rfc6265#section-4.1.1
        // `Max-Age: 0` is not valid, thus ignored, and the cookie is persisted.
        this._mutableCookies.set({
            name: _apiutils.COOKIE_NAME_PRERENDER_BYPASS,
            value: "",
            httpOnly: true,
            sameSite:  true ? "none" : 0,
            secure: "production" !== "development",
            path: "/",
            expires: new Date(0)
        });
    }
} //# sourceMappingURL=draft-mode-provider.js.map


/***/ }),

/***/ 32991:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "RequestAsyncStorageWrapper", ({
    enumerable: true,
    get: function() {
        return RequestAsyncStorageWrapper;
    }
}));
const _approuterheaders = __webpack_require__(18035);
const _headers = __webpack_require__(3356);
const _requestcookies = __webpack_require__(17766);
const _cookies = __webpack_require__(39072);
const _draftmodeprovider = __webpack_require__(85195);
function getHeaders(headers) {
    const cleaned = _headers.HeadersAdapter.from(headers);
    for (const param of _approuterheaders.FLIGHT_PARAMETERS){
        cleaned.delete(param.toString().toLowerCase());
    }
    return _headers.HeadersAdapter.seal(cleaned);
}
function getCookies(headers) {
    const cookies = new _cookies.RequestCookies(_headers.HeadersAdapter.from(headers));
    return _requestcookies.RequestCookiesAdapter.seal(cookies);
}
function getMutableCookies(headers, res) {
    const cookies = new _cookies.RequestCookies(_headers.HeadersAdapter.from(headers));
    return _requestcookies.MutableRequestCookiesAdapter.wrap(cookies, res);
}
const RequestAsyncStorageWrapper = {
    /**
   * Wrap the callback with the given store so it can access the underlying
   * store using hooks.
   *
   * @param storage underlying storage object returned by the module
   * @param context context to seed the store
   * @param callback function to call within the scope of the context
   * @returns the result returned by the callback
   */ wrap (storage, { req, res, renderOpts }, callback) {
        let previewProps = undefined;
        if (renderOpts && "previewProps" in renderOpts) {
            // TODO: investigate why previewProps isn't on RenderOpts
            previewProps = renderOpts.previewProps;
        }
        const cache = {};
        const store = {
            get headers () {
                if (!cache.headers) {
                    // Seal the headers object that'll freeze out any methods that could
                    // mutate the underlying data.
                    cache.headers = getHeaders(req.headers);
                }
                return cache.headers;
            },
            get cookies () {
                if (!cache.cookies) {
                    // Seal the cookies object that'll freeze out any methods that could
                    // mutate the underlying data.
                    cache.cookies = getCookies(req.headers);
                }
                return cache.cookies;
            },
            get mutableCookies () {
                if (!cache.mutableCookies) {
                    cache.mutableCookies = getMutableCookies(req.headers, res);
                }
                return cache.mutableCookies;
            },
            get draftMode () {
                if (!cache.draftMode) {
                    cache.draftMode = new _draftmodeprovider.DraftModeProvider(previewProps, req, this.cookies, this.mutableCookies);
                }
                return cache.draftMode;
            }
        };
        return storage.run(store, callback, store);
    }
}; //# sourceMappingURL=request-async-storage-wrapper.js.map


/***/ }),

/***/ 80428:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "StaticGenerationAsyncStorageWrapper", ({
    enumerable: true,
    get: function() {
        return StaticGenerationAsyncStorageWrapper;
    }
}));
const StaticGenerationAsyncStorageWrapper = {
    wrap (storage, { pathname, renderOpts }, callback) {
        /**
     * Rules of Static & Dynamic HTML:
     *
     *    1.) We must generate static HTML unless the caller explicitly opts
     *        in to dynamic HTML support.
     *
     *    2.) If dynamic HTML support is requested, we must honor that request
     *        or throw an error. It is the sole responsibility of the caller to
     *        ensure they aren't e.g. requesting dynamic HTML for an AMP page.
     *
     *    3.) If the request is in draft mode, we must generate dynamic HTML.
     *
     * These rules help ensure that other existing features like request caching,
     * coalescing, and ISR continue working as intended.
     */ const isStaticGeneration = !renderOpts.supportsDynamicHTML && !renderOpts.isDraftMode;
        const store = {
            isStaticGeneration,
            pathname,
            originalPathname: renderOpts.originalPathname,
            incrementalCache: // so that it can access the fs cache without mocks
            renderOpts.incrementalCache || globalThis.__incrementalCache,
            isRevalidate: renderOpts.isRevalidate,
            isPrerendering: renderOpts.nextExport,
            fetchCache: renderOpts.fetchCache,
            isOnDemandRevalidate: renderOpts.isOnDemandRevalidate,
            isDraftMode: renderOpts.isDraftMode
        };
        // TODO: remove this when we resolve accessing the store outside the execution context
        renderOpts.store = store;
        return storage.run(store, callback, store);
    }
}; //# sourceMappingURL=static-generation-async-storage-wrapper.js.map


/***/ }),

/***/ 48740:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "RouteKind", ({
    enumerable: true,
    get: function() {
        return RouteKind;
    }
}));
var RouteKind;
(function(RouteKind) {
    RouteKind[/**
   * `PAGES` represents all the React pages that are under `pages/`.
   */ "PAGES"] = "PAGES";
    RouteKind[/**
   * `PAGES_API` represents all the API routes under `pages/api/`.
   */ "PAGES_API"] = "PAGES_API";
    RouteKind[/**
   * `APP_PAGE` represents all the React pages that are under `app/` with the
   * filename of `page.{j,t}s{,x}`.
   */ "APP_PAGE"] = "APP_PAGE";
    RouteKind[/**
   * `APP_ROUTE` represents all the API routes and metadata routes that are under `app/` with the
   * filename of `route.{j,t}s{,x}`.
   */ "APP_ROUTE"] = "APP_ROUTE";
})(RouteKind || (RouteKind = {})); //# sourceMappingURL=route-kind.js.map


/***/ }),

/***/ 41944:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "autoImplementMethods", ({
    enumerable: true,
    get: function() {
        return autoImplementMethods;
    }
}));
const _http = __webpack_require__(9095);
const _responsehandlers = __webpack_require__(48537);
const AUTOMATIC_ROUTE_METHODS = [
    "HEAD",
    "OPTIONS"
];
function autoImplementMethods(handlers) {
    // Loop through all the HTTP methods to create the initial methods object.
    // Each of the methods will be set to the the 405 response handler.
    const methods = _http.HTTP_METHODS.reduce((acc, method)=>({
            ...acc,
            // If the userland module implements the method, then use it. Otherwise,
            // use the 405 response handler.
            [method]: handlers[method] ?? _responsehandlers.handleMethodNotAllowedResponse
        }), {});
    // Get all the methods that could be automatically implemented that were not
    // implemented by the userland module.
    const implemented = new Set(_http.HTTP_METHODS.filter((method)=>handlers[method]));
    const missing = AUTOMATIC_ROUTE_METHODS.filter((method)=>!implemented.has(method));
    // Loop over the missing methods to automatically implement them if we can.
    for (const method of missing){
        // If the userland module doesn't implement the HEAD method, then
        // we'll automatically implement it by calling the GET method (if it
        // exists).
        if (method === "HEAD") {
            // If the userland module doesn't implement the GET method, then
            // we're done.
            if (!handlers.GET) break;
            // Implement the HEAD method by calling the GET method.
            methods.HEAD = handlers.GET;
            // Mark it as implemented.
            implemented.add("HEAD");
            continue;
        }
        // If OPTIONS is not provided then implement it.
        if (method === "OPTIONS") {
            // TODO: check if HEAD is implemented, if so, use it to add more headers
            // Get all the methods that were implemented by the userland module.
            const allow = [
                "OPTIONS",
                ...implemented
            ];
            // If the list of methods doesn't include HEAD, but it includes GET, then
            // add HEAD as it's automatically implemented.
            if (!implemented.has("HEAD") && implemented.has("GET")) {
                allow.push("HEAD");
            }
            // Sort and join the list with commas to create the `Allow` header. See:
            // https://httpwg.org/specs/rfc9110.html#field.allow
            const headers = {
                Allow: allow.sort().join(", ")
            };
            // Implement the OPTIONS method by returning a 204 response with the
            // `Allow` header.
            methods.OPTIONS = ()=>new Response(null, {
                    status: 204,
                    headers
                });
            // Mark this method as implemented.
            implemented.add("OPTIONS");
            continue;
        }
        throw new Error(`Invariant: should handle all automatic implementable methods, got method: ${method}`);
    }
    return methods;
} //# sourceMappingURL=auto-implement-methods.js.map


/***/ }),

/***/ 81552:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Cleans a URL by stripping the protocol, host, and search params.
 *
 * @param urlString the url to clean
 * @returns the cleaned url
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "cleanURL", ({
    enumerable: true,
    get: function() {
        return cleanURL;
    }
}));
function cleanURL(urlString) {
    const url = new URL(urlString);
    url.host = "localhost:3000";
    url.search = "";
    url.protocol = "http";
    return url.toString();
} //# sourceMappingURL=clean-url.js.map


/***/ }),

/***/ 56865:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getNonStaticMethods", ({
    enumerable: true,
    get: function() {
        return getNonStaticMethods;
    }
}));
const NON_STATIC_METHODS = [
    "OPTIONS",
    "POST",
    "PUT",
    "DELETE",
    "PATCH"
];
function getNonStaticMethods(handlers) {
    // We can currently only statically optimize if only GET/HEAD are used as
    // prerender can't be used conditionally based on the method currently.
    const methods = NON_STATIC_METHODS.filter((method)=>handlers[method]);
    if (methods.length === 0) return false;
    return methods;
} //# sourceMappingURL=get-non-static-methods.js.map


/***/ }),

/***/ 34694:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Get pathname from absolute path.
 *
 * @param absolutePath the absolute path
 * @returns the pathname
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getPathnameFromAbsolutePath", ({
    enumerable: true,
    get: function() {
        return getPathnameFromAbsolutePath;
    }
}));
function getPathnameFromAbsolutePath(absolutePath) {
    // Remove prefix including app dir
    let appDir = "/app/";
    if (!absolutePath.includes(appDir)) {
        appDir = "\\app\\";
    }
    const [, ...parts] = absolutePath.split(appDir);
    const relativePath = appDir[0] + parts.join(appDir);
    // remove extension
    const pathname = relativePath.split(".").slice(0, -1).join(".");
    return pathname;
} //# sourceMappingURL=get-pathname-from-absolute-path.js.map


/***/ }),

/***/ 34065:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "proxyRequest", ({
    enumerable: true,
    get: function() {
        return proxyRequest;
    }
}));
const _cookies = __webpack_require__(14079);
const _nexturl = __webpack_require__(32765);
const _cleanurl = __webpack_require__(81552);
function proxyRequest(request, { dynamic }, hooks) {
    function handleNextUrlBailout(prop) {
        switch(prop){
            case "search":
            case "searchParams":
            case "toString":
            case "href":
            case "origin":
                hooks.staticGenerationBailout(`nextUrl.${prop}`);
                return;
            default:
                return;
        }
    }
    const cache = {};
    const handleForceStatic = (url, prop)=>{
        switch(prop){
            case "search":
                return "";
            case "searchParams":
                if (!cache.searchParams) cache.searchParams = new URLSearchParams();
                return cache.searchParams;
            case "url":
            case "href":
                if (!cache.url) cache.url = (0, _cleanurl.cleanURL)(url);
                return cache.url;
            case "toJSON":
            case "toString":
                if (!cache.url) cache.url = (0, _cleanurl.cleanURL)(url);
                if (!cache.toString) cache.toString = ()=>cache.url;
                return cache.toString;
            case "headers":
                if (!cache.headers) cache.headers = new Headers();
                return cache.headers;
            case "cookies":
                if (!cache.headers) cache.headers = new Headers();
                if (!cache.cookies) cache.cookies = new _cookies.RequestCookies(cache.headers);
                return cache.cookies;
            case "clone":
                if (!cache.url) cache.url = (0, _cleanurl.cleanURL)(url);
                return ()=>new _nexturl.NextURL(cache.url);
            default:
                break;
        }
    };
    const wrappedNextUrl = new Proxy(request.nextUrl, {
        get (target, prop) {
            handleNextUrlBailout(prop);
            if (dynamic === "force-static" && typeof prop === "string") {
                const result = handleForceStatic(target.href, prop);
                if (result !== undefined) return result;
            }
            const value = target[prop];
            if (typeof value === "function") {
                return value.bind(target);
            }
            return value;
        },
        set (target, prop, value) {
            handleNextUrlBailout(prop);
            target[prop] = value;
            return true;
        }
    });
    const handleReqBailout = (prop)=>{
        switch(prop){
            case "headers":
                hooks.headerHooks.headers();
                return;
            // if request.url is accessed directly instead of
            // request.nextUrl we bail since it includes query
            // values that can be relied on dynamically
            case "url":
            case "body":
            case "blob":
            case "json":
            case "text":
            case "arrayBuffer":
            case "formData":
                hooks.staticGenerationBailout(`request.${prop}`);
                return;
            default:
                return;
        }
    };
    return new Proxy(request, {
        get (target, prop) {
            handleReqBailout(prop);
            if (prop === "nextUrl") {
                return wrappedNextUrl;
            }
            if (dynamic === "force-static" && typeof prop === "string") {
                const result = handleForceStatic(target.url, prop);
                if (result !== undefined) return result;
            }
            const value = target[prop];
            if (typeof value === "function") {
                return value.bind(target);
            }
            return value;
        },
        set (target, prop, value) {
            handleReqBailout(prop);
            target[prop] = value;
            return true;
        }
    });
} //# sourceMappingURL=proxy-request.js.map


/***/ }),

/***/ 85993:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "resolveHandlerError", ({
    enumerable: true,
    get: function() {
        return resolveHandlerError;
    }
}));
const _notfound = __webpack_require__(13693);
const _redirect = __webpack_require__(8104);
const _responsehandlers = __webpack_require__(48537);
function resolveHandlerError(err) {
    if ((0, _redirect.isRedirectError)(err)) {
        const redirect = (0, _redirect.getURLFromRedirectError)(err);
        if (!redirect) {
            throw new Error("Invariant: Unexpected redirect url format");
        }
        // This is a redirect error! Send the redirect response.
        return (0, _responsehandlers.handleTemporaryRedirectResponse)(redirect, err.mutableCookies);
    }
    if ((0, _notfound.isNotFoundError)(err)) {
        // This is a not found error! Send the not found response.
        return (0, _responsehandlers.handleNotFoundResponse)();
    }
    // Return false to indicate that this is not a handled error.
    return false;
} //# sourceMappingURL=resolve-handler-error.js.map


/***/ }),

/***/ 71910:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    AppRouteRouteModule: function() {
        return AppRouteRouteModule;
    },
    default: function() {
        return _default;
    }
});
const _routemodule = __webpack_require__(41073);
const _requestasyncstoragewrapper = __webpack_require__(32991);
const _staticgenerationasyncstoragewrapper = __webpack_require__(80428);
const _responsehandlers = __webpack_require__(48537);
const _http = __webpack_require__(9095);
const _patchfetch = __webpack_require__(78550);
const _tracer = __webpack_require__(3250);
const _constants = __webpack_require__(45447);
const _getpathnamefromabsolutepath = __webpack_require__(34694);
const _proxyrequest = __webpack_require__(34065);
const _resolvehandlererror = __webpack_require__(85993);
const _log = /*#__PURE__*/ _interop_require_wildcard(__webpack_require__(64278));
const _autoimplementmethods = __webpack_require__(41944);
const _getnonstaticmethods = __webpack_require__(56865);
const _requestcookies = __webpack_require__(17766);
const _routekind = __webpack_require__(48740);
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
// These are imported weirdly like this because of the way that the bundling
// works. We need to import the built files from the dist directory, but we
// can't do that directly because we need types from the source files. So we
// import the types from the source files and then import the built files.
const { requestAsyncStorage } = __webpack_require__(99741);
const { staticGenerationAsyncStorage } = __webpack_require__(97568);
const serverHooks = __webpack_require__(35819);
const headerHooks = __webpack_require__(10525);
const { staticGenerationBailout } = __webpack_require__(9665);
const { actionAsyncStorage } = __webpack_require__(96899);
class AppRouteRouteModule extends _routemodule.RouteModule {
    static is(route) {
        return route.definition.kind === _routekind.RouteKind.APP_ROUTE;
    }
    constructor({ userland, definition, resolvedPagePath, nextConfigOutput }){
        super({
            userland,
            definition
        });
        /**
   * A reference to the request async storage.
   */ this.requestAsyncStorage = requestAsyncStorage;
        /**
   * A reference to the static generation async storage.
   */ this.staticGenerationAsyncStorage = staticGenerationAsyncStorage;
        /**
   * An interface to call server hooks which interact with the underlying
   * storage.
   */ this.serverHooks = serverHooks;
        /**
   * An interface to call header hooks which interact with the underlying
   * request storage.
   */ this.headerHooks = headerHooks;
        /**
   * An interface to call static generation bailout hooks which interact with
   * the underlying static generation storage.
   */ this.staticGenerationBailout = staticGenerationBailout;
        /**
   * A reference to the mutation related async storage, such as mutations of
   * cookies.
   */ this.actionAsyncStorage = actionAsyncStorage;
        this.resolvedPagePath = resolvedPagePath;
        this.nextConfigOutput = nextConfigOutput;
        // Automatically implement some methods if they aren't implemented by the
        // userland module.
        this.methods = (0, _autoimplementmethods.autoImplementMethods)(userland);
        // Get the non-static methods for this route.
        this.nonStaticMethods = (0, _getnonstaticmethods.getNonStaticMethods)(userland);
        // Get the dynamic property from the userland module.
        this.dynamic = this.userland.dynamic;
        if (this.nextConfigOutput === "export") {
            if (!this.dynamic || this.dynamic === "auto") {
                this.dynamic = "error";
            } else if (this.dynamic === "force-dynamic") {
                throw new Error(`export const dynamic = "force-dynamic" on page "${definition.pathname}" cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`);
            }
        }
        // We only warn in development after here, so return if we're not in
        // development.
        if (false) {}
    }
    /**
   * Resolves the handler function for the given method.
   *
   * @param method the requested method
   * @returns the handler function for the given method
   */ resolve(method) {
        // Ensure that the requested method is a valid method (to prevent RCE's).
        if (!(0, _http.isHTTPMethod)(method)) return _responsehandlers.handleBadRequestResponse;
        // Return the handler.
        return this.methods[method];
    }
    /**
   * Executes the route handler.
   */ async execute(request, context) {
        // Get the handler function for the given method.
        const handler = this.resolve(request.method);
        // Get the context for the request.
        const requestContext = {
            req: request
        };
        requestContext.renderOpts = {
            previewProps: context.prerenderManifest.preview
        };
        // Get the context for the static generation.
        const staticGenerationContext = {
            pathname: this.definition.pathname,
            renderOpts: // the default values.
            context.staticGenerationContext ?? {
                supportsDynamicHTML: false
            }
        };
        // Add the fetchCache option to the renderOpts.
        staticGenerationContext.renderOpts.fetchCache = this.userland.fetchCache;
        // Run the handler with the request AsyncLocalStorage to inject the helper
        // support. We set this to `unknown` because the type is not known until
        // runtime when we do a instanceof check below.
        const response = await this.actionAsyncStorage.run({
            isAppRoute: true
        }, ()=>{
            return _requestasyncstoragewrapper.RequestAsyncStorageWrapper.wrap(this.requestAsyncStorage, requestContext, ()=>{
                return _staticgenerationasyncstoragewrapper.StaticGenerationAsyncStorageWrapper.wrap(this.staticGenerationAsyncStorage, staticGenerationContext, (staticGenerationStore)=>{
                    var _getTracer_getRootSpanAttributes;
                    // Check to see if we should bail out of static generation based on
                    // having non-static methods.
                    if (this.nonStaticMethods) {
                        this.staticGenerationBailout(`non-static methods used ${this.nonStaticMethods.join(", ")}`);
                    }
                    // Update the static generation store based on the dynamic property.
                    switch(this.dynamic){
                        case "force-dynamic":
                            // The dynamic property is set to force-dynamic, so we should
                            // force the page to be dynamic.
                            staticGenerationStore.forceDynamic = true;
                            this.staticGenerationBailout(`force-dynamic`, {
                                dynamic: this.dynamic
                            });
                            break;
                        case "force-static":
                            // The dynamic property is set to force-static, so we should
                            // force the page to be static.
                            staticGenerationStore.forceStatic = true;
                            break;
                        case "error":
                            // The dynamic property is set to error, so we should throw an
                            // error if the page is being statically generated.
                            staticGenerationStore.dynamicShouldError = true;
                            break;
                        default:
                            break;
                    }
                    // If the static generation store does not have a revalidate value
                    // set, then we should set it the revalidate value from the userland
                    // module or default to false.
                    staticGenerationStore.revalidate ??= this.userland.revalidate ?? false;
                    // Wrap the request so we can add additional functionality to cases
                    // that might change it's output or affect the rendering.
                    const wrappedRequest = (0, _proxyrequest.proxyRequest)(request, {
                        dynamic: this.dynamic
                    }, {
                        headerHooks: this.headerHooks,
                        serverHooks: this.serverHooks,
                        staticGenerationBailout: this.staticGenerationBailout
                    });
                    // TODO: propagate this pathname from route matcher
                    const route = (0, _getpathnamefromabsolutepath.getPathnameFromAbsolutePath)(this.resolvedPagePath);
                    (_getTracer_getRootSpanAttributes = (0, _tracer.getTracer)().getRootSpanAttributes()) == null ? void 0 : _getTracer_getRootSpanAttributes.set("next.route", route);
                    return (0, _tracer.getTracer)().trace(_constants.AppRouteRouteHandlersSpan.runHandler, {
                        spanName: `executing api route (app) ${route}`,
                        attributes: {
                            "next.route": route
                        }
                    }, async ()=>{
                        var _staticGenerationStore_tags;
                        // Patch the global fetch.
                        (0, _patchfetch.patchFetch)({
                            serverHooks: this.serverHooks,
                            staticGenerationAsyncStorage: this.staticGenerationAsyncStorage
                        });
                        const res = await handler(wrappedRequest, {
                            params: context.params
                        });
                        context.staticGenerationContext.fetchMetrics = staticGenerationStore.fetchMetrics;
                        await Promise.all(staticGenerationStore.pendingRevalidates || []);
                        (0, _patchfetch.addImplicitTags)(staticGenerationStore);
                        context.staticGenerationContext.fetchTags = (_staticGenerationStore_tags = staticGenerationStore.tags) == null ? void 0 : _staticGenerationStore_tags.join(",");
                        // It's possible cookies were set in the handler, so we need
                        // to merge the modified cookies and the returned response
                        // here.
                        const requestStore = this.requestAsyncStorage.getStore();
                        if (requestStore && requestStore.mutableCookies) {
                            const headers = new Headers(res.headers);
                            if ((0, _requestcookies.appendMutableCookies)(headers, requestStore.mutableCookies)) {
                                return new Response(res.body, {
                                    status: res.status,
                                    statusText: res.statusText,
                                    headers
                                });
                            }
                        }
                        return res;
                    });
                });
            });
        });
        // If the handler did't return a valid response, then return the internal
        // error response.
        if (!(response instanceof Response)) {
            // TODO: validate the correct handling behavior, maybe log something?
            return (0, _responsehandlers.handleInternalServerErrorResponse)();
        }
        if (response.headers.has("x-middleware-rewrite")) {
            // TODO: move this error into the `NextResponse.rewrite()` function.
            // TODO-APP: re-enable support below when we can proxy these type of requests
            throw new Error("NextResponse.rewrite() was used in a app route handler, this is not currently supported. Please remove the invocation to continue.");
        // // This is a rewrite created via `NextResponse.rewrite()`. We need to send
        // // the response up so it can be handled by the backing server.
        // // If the server is running in minimal mode, we just want to forward the
        // // response (including the rewrite headers) upstream so it can perform the
        // // redirect for us, otherwise return with the special condition so this
        // // server can perform a rewrite.
        // if (!minimalMode) {
        //   return { response, condition: 'rewrite' }
        // }
        // // Relativize the url so it's relative to the base url. This is so the
        // // outgoing headers upstream can be relative.
        // const rewritePath = response.headers.get('x-middleware-rewrite')!
        // const initUrl = getRequestMeta(req, '__NEXT_INIT_URL')!
        // const { pathname } = parseUrl(relativizeURL(rewritePath, initUrl))
        // response.headers.set('x-middleware-rewrite', pathname)
        }
        if (response.headers.get("x-middleware-next") === "1") {
            // TODO: move this error into the `NextResponse.next()` function.
            throw new Error("NextResponse.next() was used in a app route handler, this is not supported. See here for more info: https://nextjs.org/docs/messages/next-response-next-in-app-route-handler");
        }
        return response;
    }
    async handle(request, context) {
        try {
            // Execute the route to get the response.
            const response = await this.execute(request, context);
            // The response was handled, return it.
            return response;
        } catch (err) {
            // Try to resolve the error to a response, else throw it again.
            const response = (0, _resolvehandlererror.resolveHandlerError)(err);
            if (!response) throw err;
            // The response was resolved, return it.
            return response;
        }
    }
}
const _default = AppRouteRouteModule; //# sourceMappingURL=module.js.map


/***/ }),

/***/ 48537:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    handleTemporaryRedirectResponse: function() {
        return handleTemporaryRedirectResponse;
    },
    handleBadRequestResponse: function() {
        return handleBadRequestResponse;
    },
    handleNotFoundResponse: function() {
        return handleNotFoundResponse;
    },
    handleMethodNotAllowedResponse: function() {
        return handleMethodNotAllowedResponse;
    },
    handleInternalServerErrorResponse: function() {
        return handleInternalServerErrorResponse;
    }
});
const _requestcookies = __webpack_require__(17766);
function handleTemporaryRedirectResponse(url, mutableCookies) {
    const headers = new Headers({
        location: url
    });
    (0, _requestcookies.appendMutableCookies)(headers, mutableCookies);
    return new Response(null, {
        status: 307,
        headers
    });
}
function handleBadRequestResponse() {
    return new Response(null, {
        status: 400
    });
}
function handleNotFoundResponse() {
    return new Response(null, {
        status: 404
    });
}
function handleMethodNotAllowedResponse() {
    return new Response(null, {
        status: 405
    });
}
function handleInternalServerErrorResponse() {
    return new Response(null, {
        status: 500
    });
} //# sourceMappingURL=response-handlers.js.map


/***/ }),

/***/ 41073:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "RouteModule", ({
    enumerable: true,
    get: function() {
        return RouteModule;
    }
}));
class RouteModule {
    constructor({ userland, definition }){
        this.userland = userland;
        this.definition = definition;
    }
} //# sourceMappingURL=route-module.js.map


/***/ }),

/***/ 78550:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    addImplicitTags: function() {
        return addImplicitTags;
    },
    patchFetch: function() {
        return patchFetch;
    }
});
const _constants = __webpack_require__(45447);
const _tracer = __webpack_require__(3250);
const _constants1 = __webpack_require__(20418);
const isEdgeRuntime = "nodejs" === "edge";
function addImplicitTags(staticGenerationStore) {
    const newTags = [];
    const pathname = staticGenerationStore == null ? void 0 : staticGenerationStore.originalPathname;
    if (!pathname) {
        return newTags;
    }
    if (!Array.isArray(staticGenerationStore.tags)) {
        staticGenerationStore.tags = [];
    }
    if (!staticGenerationStore.tags.includes(pathname)) {
        staticGenerationStore.tags.push(pathname);
    }
    newTags.push(pathname);
    return newTags;
}
function trackFetchMetric(staticGenerationStore, ctx) {
    if (!staticGenerationStore) return;
    if (!staticGenerationStore.fetchMetrics) {
        staticGenerationStore.fetchMetrics = [];
    }
    const dedupeFields = [
        "url",
        "status",
        "method"
    ];
    // don't add metric if one already exists for the fetch
    if (staticGenerationStore.fetchMetrics.some((metric)=>{
        return dedupeFields.every((field)=>metric[field] === ctx[field]);
    })) {
        return;
    }
    staticGenerationStore.fetchMetrics.push({
        url: ctx.url,
        cacheStatus: ctx.cacheStatus,
        status: ctx.status,
        method: ctx.method,
        start: ctx.start,
        end: Date.now(),
        idx: staticGenerationStore.nextFetchId || 0
    });
}
function patchFetch({ serverHooks, staticGenerationAsyncStorage }) {
    if (!globalThis._nextOriginalFetch) {
        globalThis._nextOriginalFetch = globalThis.fetch;
    }
    if (globalThis.fetch.__nextPatched) return;
    const { DynamicServerError } = serverHooks;
    const originFetch = globalThis._nextOriginalFetch;
    globalThis.fetch = async (input, init)=>{
        var _init_method;
        let url;
        try {
            url = new URL(input instanceof Request ? input.url : input);
            url.username = "";
            url.password = "";
        } catch  {
            // Error caused by malformed URL should be handled by native fetch
            url = undefined;
        }
        const fetchUrl = (url == null ? void 0 : url.href) ?? "";
        const fetchStart = Date.now();
        const method = (init == null ? void 0 : (_init_method = init.method) == null ? void 0 : _init_method.toUpperCase()) || "GET";
        return await (0, _tracer.getTracer)().trace(_constants.AppRenderSpan.fetch, {
            kind: _tracer.SpanKind.CLIENT,
            spanName: [
                "fetch",
                method,
                fetchUrl
            ].filter(Boolean).join(" "),
            attributes: {
                "http.url": fetchUrl,
                "http.method": method,
                "net.peer.name": url == null ? void 0 : url.hostname,
                "net.peer.port": (url == null ? void 0 : url.port) || undefined
            }
        }, async ()=>{
            var _ref, _getRequestMeta;
            const staticGenerationStore = staticGenerationAsyncStorage.getStore();
            const isRequestInput = input && typeof input === "object" && typeof input.method === "string";
            const getRequestMeta = (field)=>{
                let value = isRequestInput ? input[field] : null;
                return value || (init == null ? void 0 : init[field]);
            };
            // If the staticGenerationStore is not available, we can't do any
            // special treatment of fetch, therefore fallback to the original
            // fetch implementation.
            if (!staticGenerationStore || ((_ref = init == null ? void 0 : init.next) == null ? void 0 : _ref.internal) || staticGenerationStore.isDraftMode) {
                return originFetch(input, init);
            }
            let revalidate = undefined;
            const getNextField = (field)=>{
                var _init_next, _init_next1, _input_next;
                return typeof (init == null ? void 0 : (_init_next = init.next) == null ? void 0 : _init_next[field]) !== "undefined" ? init == null ? void 0 : (_init_next1 = init.next) == null ? void 0 : _init_next1[field] : isRequestInput ? (_input_next = input.next) == null ? void 0 : _input_next[field] : undefined;
            };
            // RequestInit doesn't keep extra fields e.g. next so it's
            // only available if init is used separate
            let curRevalidate = getNextField("revalidate");
            const tags = getNextField("tags") || [];
            if (Array.isArray(tags)) {
                if (!staticGenerationStore.tags) {
                    staticGenerationStore.tags = [];
                }
                for (const tag of tags){
                    if (!staticGenerationStore.tags.includes(tag)) {
                        staticGenerationStore.tags.push(tag);
                    }
                }
            }
            const implicitTags = addImplicitTags(staticGenerationStore);
            for (const tag of implicitTags || []){
                if (!tags.includes(tag)) {
                    tags.push(tag);
                }
            }
            const isOnlyCache = staticGenerationStore.fetchCache === "only-cache";
            const isForceCache = staticGenerationStore.fetchCache === "force-cache";
            const isDefaultCache = staticGenerationStore.fetchCache === "default-cache";
            const isDefaultNoStore = staticGenerationStore.fetchCache === "default-no-store";
            const isOnlyNoStore = staticGenerationStore.fetchCache === "only-no-store";
            const isForceNoStore = staticGenerationStore.fetchCache === "force-no-store";
            let _cache = getRequestMeta("cache");
            if (typeof _cache === "string" && typeof curRevalidate !== "undefined") {
                console.warn(`Warning: fetch for ${fetchUrl} on ${staticGenerationStore.pathname} specified "cache: ${_cache}" and "revalidate: ${curRevalidate}", only one should be specified.`);
                _cache = undefined;
            }
            if (_cache === "force-cache") {
                curRevalidate = false;
            }
            if ([
                "no-cache",
                "no-store"
            ].includes(_cache || "")) {
                curRevalidate = 0;
            }
            if (typeof curRevalidate === "number" || curRevalidate === false) {
                revalidate = curRevalidate;
            }
            let cacheReason = "";
            const _headers = getRequestMeta("headers");
            const initHeaders = typeof (_headers == null ? void 0 : _headers.get) === "function" ? _headers : new Headers(_headers || {});
            const hasUnCacheableHeader = initHeaders.get("authorization") || initHeaders.get("cookie");
            const isUnCacheableMethod = ![
                "get",
                "head"
            ].includes(((_getRequestMeta = getRequestMeta("method")) == null ? void 0 : _getRequestMeta.toLowerCase()) || "get");
            // if there are authorized headers or a POST method and
            // dynamic data usage was present above the tree we bail
            // e.g. if cookies() is used before an authed/POST fetch
            const autoNoCache = (hasUnCacheableHeader || isUnCacheableMethod) && staticGenerationStore.revalidate === 0;
            if (isForceNoStore) {
                revalidate = 0;
                cacheReason = "fetchCache = force-no-store";
            }
            if (isOnlyNoStore) {
                if (_cache === "force-cache" || revalidate === 0) {
                    throw new Error(`cache: 'force-cache' used on fetch for ${fetchUrl} with 'export const fetchCache = 'only-no-store'`);
                }
                revalidate = 0;
                cacheReason = "fetchCache = only-no-store";
            }
            if (isOnlyCache && _cache === "no-store") {
                throw new Error(`cache: 'no-store' used on fetch for ${fetchUrl} with 'export const fetchCache = 'only-cache'`);
            }
            if (isForceCache && (typeof curRevalidate === "undefined" || curRevalidate === 0)) {
                cacheReason = "fetchCache = force-cache";
                revalidate = false;
            }
            if (typeof revalidate === "undefined") {
                if (isDefaultCache) {
                    revalidate = false;
                    cacheReason = "fetchCache = default-cache";
                } else if (autoNoCache) {
                    revalidate = 0;
                    cacheReason = "auto no cache";
                } else if (isDefaultNoStore) {
                    revalidate = 0;
                    cacheReason = "fetchCache = default-no-store";
                } else {
                    cacheReason = "auto cache";
                    revalidate = typeof staticGenerationStore.revalidate === "boolean" || typeof staticGenerationStore.revalidate === "undefined" ? false : staticGenerationStore.revalidate;
                }
            } else if (!cacheReason) {
                cacheReason = `revalidate: ${revalidate}`;
            }
            if (// revalidate although if it occurs during build we do
            !autoNoCache && (typeof staticGenerationStore.revalidate === "undefined" || typeof revalidate === "number" && (staticGenerationStore.revalidate === false || typeof staticGenerationStore.revalidate === "number" && revalidate < staticGenerationStore.revalidate))) {
                staticGenerationStore.revalidate = revalidate;
            }
            const isCacheableRevalidate = typeof revalidate === "number" && revalidate > 0 || revalidate === false;
            let cacheKey;
            if (staticGenerationStore.incrementalCache && isCacheableRevalidate) {
                try {
                    cacheKey = await staticGenerationStore.incrementalCache.fetchCacheKey(fetchUrl, isRequestInput ? input : init);
                } catch (err) {
                    console.error(`Failed to generate cache key for`, input);
                }
            }
            const requestInputFields = [
                "cache",
                "credentials",
                "headers",
                "integrity",
                "keepalive",
                "method",
                "mode",
                "redirect",
                "referrer",
                "referrerPolicy",
                "signal",
                "window",
                "duplex"
            ];
            if (isRequestInput) {
                const reqInput = input;
                const reqOptions = {
                    body: reqInput._ogBody || reqInput.body
                };
                for (const field of requestInputFields){
                    // @ts-expect-error custom fields
                    reqOptions[field] = reqInput[field];
                }
                input = new Request(reqInput.url, reqOptions);
            } else if (init) {
                const initialInit = init;
                init = {
                    body: init._ogBody || init.body
                };
                for (const field of requestInputFields){
                    // @ts-expect-error custom fields
                    init[field] = initialInit[field];
                }
            }
            const fetchIdx = staticGenerationStore.nextFetchId ?? 1;
            staticGenerationStore.nextFetchId = fetchIdx + 1;
            const normalizedRevalidate = typeof revalidate !== "number" ? _constants1.CACHE_ONE_YEAR : revalidate;
            const doOriginalFetch = async (isStale)=>{
                // add metadata to init without editing the original
                const clonedInit = {
                    ...init,
                    next: {
                        ...init == null ? void 0 : init.next,
                        fetchType: "origin",
                        fetchIdx
                    }
                };
                return originFetch(input, clonedInit).then(async (res)=>{
                    if (!isStale) {
                        trackFetchMetric(staticGenerationStore, {
                            start: fetchStart,
                            url: fetchUrl,
                            cacheReason,
                            cacheStatus: "miss",
                            status: res.status,
                            method: clonedInit.method || "GET"
                        });
                    }
                    if (res.status === 200 && staticGenerationStore.incrementalCache && cacheKey && isCacheableRevalidate) {
                        const bodyBuffer = Buffer.from(await res.arrayBuffer());
                        try {
                            await staticGenerationStore.incrementalCache.set(cacheKey, {
                                kind: "FETCH",
                                data: {
                                    headers: Object.fromEntries(res.headers.entries()),
                                    body: bodyBuffer.toString("base64"),
                                    status: res.status,
                                    tags,
                                    url: res.url
                                },
                                revalidate: normalizedRevalidate
                            }, revalidate, true, fetchUrl, fetchIdx);
                        } catch (err) {
                            console.warn(`Failed to set fetch cache`, input, err);
                        }
                        const response = new Response(bodyBuffer, {
                            headers: new Headers(res.headers),
                            status: res.status
                        });
                        Object.defineProperty(response, "url", {
                            value: res.url
                        });
                        return response;
                    }
                    return res;
                });
            };
            if (cacheKey && (staticGenerationStore == null ? void 0 : staticGenerationStore.incrementalCache)) {
                const entry = staticGenerationStore.isOnDemandRevalidate ? null : await staticGenerationStore.incrementalCache.get(cacheKey, true, revalidate, fetchUrl, fetchIdx);
                if ((entry == null ? void 0 : entry.value) && entry.value.kind === "FETCH") {
                    const currentTags = entry.value.data.tags;
                    // when stale and is revalidating we wait for fresh data
                    // so the revalidated entry has the updated data
                    if (!(staticGenerationStore.isRevalidate && entry.isStale)) {
                        if (entry.isStale) {
                            if (!staticGenerationStore.pendingRevalidates) {
                                staticGenerationStore.pendingRevalidates = [];
                            }
                            staticGenerationStore.pendingRevalidates.push(doOriginalFetch(true).catch(console.error));
                        } else if (tags && !tags.every((tag)=>{
                            return currentTags == null ? void 0 : currentTags.includes(tag);
                        })) {
                            var _staticGenerationStore_incrementalCache;
                            // if new tags are being added we need to set even if
                            // the data isn't stale
                            if (!entry.value.data.tags) {
                                entry.value.data.tags = [];
                            }
                            for (const tag of tags){
                                if (!entry.value.data.tags.includes(tag)) {
                                    entry.value.data.tags.push(tag);
                                }
                            }
                            (_staticGenerationStore_incrementalCache = staticGenerationStore.incrementalCache) == null ? void 0 : _staticGenerationStore_incrementalCache.set(cacheKey, entry.value, revalidate, true, fetchUrl, fetchIdx);
                        }
                        const resData = entry.value.data;
                        let decodedBody;
                        if (false) {} else {
                            decodedBody = Buffer.from(resData.body, "base64").subarray();
                        }
                        trackFetchMetric(staticGenerationStore, {
                            start: fetchStart,
                            url: fetchUrl,
                            cacheReason,
                            cacheStatus: "hit",
                            status: resData.status || 200,
                            method: (init == null ? void 0 : init.method) || "GET"
                        });
                        const response = new Response(decodedBody, {
                            headers: resData.headers,
                            status: resData.status
                        });
                        Object.defineProperty(response, "url", {
                            value: entry.value.data.url
                        });
                        return response;
                    }
                }
            }
            if (staticGenerationStore.isStaticGeneration) {
                if (init && typeof init === "object") {
                    const cache = init.cache;
                    // Delete `cache` property as Cloudflare Workers will throw an error
                    if (isEdgeRuntime) {
                        delete init.cache;
                    }
                    if (cache === "no-store") {
                        staticGenerationStore.revalidate = 0;
                        const dynamicUsageReason = `no-store fetch ${input}${staticGenerationStore.pathname ? ` ${staticGenerationStore.pathname}` : ""}`;
                        const err = new DynamicServerError(dynamicUsageReason);
                        staticGenerationStore.dynamicUsageErr = err;
                        staticGenerationStore.dynamicUsageStack = err.stack;
                        staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                    }
                    const hasNextConfig = "next" in init;
                    const next = init.next || {};
                    if (typeof next.revalidate === "number" && (typeof staticGenerationStore.revalidate === "undefined" || typeof staticGenerationStore.revalidate === "number" && next.revalidate < staticGenerationStore.revalidate)) {
                        const forceDynamic = staticGenerationStore.forceDynamic;
                        if (!forceDynamic || next.revalidate !== 0) {
                            staticGenerationStore.revalidate = next.revalidate;
                        }
                        if (!forceDynamic && next.revalidate === 0) {
                            const dynamicUsageReason = `revalidate: ${next.revalidate} fetch ${input}${staticGenerationStore.pathname ? ` ${staticGenerationStore.pathname}` : ""}`;
                            const err = new DynamicServerError(dynamicUsageReason);
                            staticGenerationStore.dynamicUsageErr = err;
                            staticGenerationStore.dynamicUsageStack = err.stack;
                            staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                        }
                    }
                    if (hasNextConfig) delete init.next;
                }
            }
            return doOriginalFetch();
        });
    };
    globalThis.fetch.__nextGetStaticStore = ()=>{
        return staticGenerationAsyncStorage;
    };
    globalThis.fetch.__nextPatched = true;
} //# sourceMappingURL=patch-fetch.js.map


/***/ }),

/***/ 45447:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Contains predefined constants for the trace span name in next/server.
 *
 * Currently, next/server/tracer is internal implementation only for tracking
 * next.js's implementation only with known span names defined here.
 **/ // eslint typescript has a bug with TS enums
/* eslint-disable no-shadow */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    NextVanillaSpanAllowlist: function() {
        return NextVanillaSpanAllowlist;
    },
    BaseServerSpan: function() {
        return BaseServerSpan;
    },
    LoadComponentsSpan: function() {
        return LoadComponentsSpan;
    },
    NextServerSpan: function() {
        return NextServerSpan;
    },
    NextNodeServerSpan: function() {
        return NextNodeServerSpan;
    },
    StartServerSpan: function() {
        return StartServerSpan;
    },
    RenderSpan: function() {
        return RenderSpan;
    },
    RouterSpan: function() {
        return RouterSpan;
    },
    AppRenderSpan: function() {
        return AppRenderSpan;
    },
    NodeSpan: function() {
        return NodeSpan;
    },
    AppRouteRouteHandlersSpan: function() {
        return AppRouteRouteHandlersSpan;
    },
    ResolveMetadataSpan: function() {
        return ResolveMetadataSpan;
    }
});
var BaseServerSpan;
(function(BaseServerSpan) {
    BaseServerSpan["handleRequest"] = "BaseServer.handleRequest";
    BaseServerSpan["run"] = "BaseServer.run";
    BaseServerSpan["pipe"] = "BaseServer.pipe";
    BaseServerSpan["getStaticHTML"] = "BaseServer.getStaticHTML";
    BaseServerSpan["render"] = "BaseServer.render";
    BaseServerSpan["renderToResponseWithComponents"] = "BaseServer.renderToResponseWithComponents";
    BaseServerSpan["renderToResponse"] = "BaseServer.renderToResponse";
    BaseServerSpan["renderToHTML"] = "BaseServer.renderToHTML";
    BaseServerSpan["renderError"] = "BaseServer.renderError";
    BaseServerSpan["renderErrorToResponse"] = "BaseServer.renderErrorToResponse";
    BaseServerSpan["renderErrorToHTML"] = "BaseServer.renderErrorToHTML";
    BaseServerSpan["render404"] = "BaseServer.render404";
})(BaseServerSpan || (BaseServerSpan = {}));
var LoadComponentsSpan;
(function(LoadComponentsSpan) {
    LoadComponentsSpan["loadDefaultErrorComponents"] = "LoadComponents.loadDefaultErrorComponents";
    LoadComponentsSpan["loadComponents"] = "LoadComponents.loadComponents";
})(LoadComponentsSpan || (LoadComponentsSpan = {}));
var NextServerSpan;
(function(NextServerSpan) {
    NextServerSpan["getRequestHandler"] = "NextServer.getRequestHandler";
    NextServerSpan["getServer"] = "NextServer.getServer";
    NextServerSpan["getServerRequestHandler"] = "NextServer.getServerRequestHandler";
    NextServerSpan["createServer"] = "createServer.createServer";
})(NextServerSpan || (NextServerSpan = {}));
var NextNodeServerSpan;
(function(NextNodeServerSpan) {
    NextNodeServerSpan["compression"] = "NextNodeServer.compression";
    NextNodeServerSpan["getBuildId"] = "NextNodeServer.getBuildId";
    NextNodeServerSpan["generateStaticRoutes"] = "NextNodeServer.generateStaticRoutes";
    NextNodeServerSpan["generateFsStaticRoutes"] = "NextNodeServer.generateFsStaticRoutes";
    NextNodeServerSpan["generatePublicRoutes"] = "NextNodeServer.generatePublicRoutes";
    NextNodeServerSpan["generateImageRoutes"] = "NextNodeServer.generateImageRoutes.route";
    NextNodeServerSpan["sendRenderResult"] = "NextNodeServer.sendRenderResult";
    NextNodeServerSpan["sendStatic"] = "NextNodeServer.sendStatic";
    NextNodeServerSpan["proxyRequest"] = "NextNodeServer.proxyRequest";
    NextNodeServerSpan["runApi"] = "NextNodeServer.runApi";
    NextNodeServerSpan["render"] = "NextNodeServer.render";
    NextNodeServerSpan["renderHTML"] = "NextNodeServer.renderHTML";
    NextNodeServerSpan["imageOptimizer"] = "NextNodeServer.imageOptimizer";
    NextNodeServerSpan["getPagePath"] = "NextNodeServer.getPagePath";
    NextNodeServerSpan["getRoutesManifest"] = "NextNodeServer.getRoutesManifest";
    NextNodeServerSpan["findPageComponents"] = "NextNodeServer.findPageComponents";
    NextNodeServerSpan["getFontManifest"] = "NextNodeServer.getFontManifest";
    NextNodeServerSpan["getServerComponentManifest"] = "NextNodeServer.getServerComponentManifest";
    NextNodeServerSpan["getRequestHandler"] = "NextNodeServer.getRequestHandler";
    NextNodeServerSpan["renderToHTML"] = "NextNodeServer.renderToHTML";
    NextNodeServerSpan["renderError"] = "NextNodeServer.renderError";
    NextNodeServerSpan["renderErrorToHTML"] = "NextNodeServer.renderErrorToHTML";
    NextNodeServerSpan["render404"] = "NextNodeServer.render404";
    NextNodeServerSpan["route"] = "route";
    NextNodeServerSpan["onProxyReq"] = "onProxyReq";
    NextNodeServerSpan["apiResolver"] = "apiResolver";
})(NextNodeServerSpan || (NextNodeServerSpan = {}));
var StartServerSpan;
(function(StartServerSpan) {
    StartServerSpan["startServer"] = "startServer.startServer";
})(StartServerSpan || (StartServerSpan = {}));
var RenderSpan;
(function(RenderSpan) {
    RenderSpan["getServerSideProps"] = "Render.getServerSideProps";
    RenderSpan["getStaticProps"] = "Render.getStaticProps";
    RenderSpan["renderToString"] = "Render.renderToString";
    RenderSpan["renderDocument"] = "Render.renderDocument";
    RenderSpan["createBodyResult"] = "Render.createBodyResult";
})(RenderSpan || (RenderSpan = {}));
var AppRenderSpan;
(function(AppRenderSpan) {
    AppRenderSpan["renderToString"] = "AppRender.renderToString";
    AppRenderSpan["renderToReadableStream"] = "AppRender.renderToReadableStream";
    AppRenderSpan["getBodyResult"] = "AppRender.getBodyResult";
    AppRenderSpan["fetch"] = "AppRender.fetch";
})(AppRenderSpan || (AppRenderSpan = {}));
var RouterSpan;
(function(RouterSpan) {
    RouterSpan["executeRoute"] = "Router.executeRoute";
})(RouterSpan || (RouterSpan = {}));
var NodeSpan;
(function(NodeSpan) {
    NodeSpan["runHandler"] = "Node.runHandler";
})(NodeSpan || (NodeSpan = {}));
var AppRouteRouteHandlersSpan;
(function(AppRouteRouteHandlersSpan) {
    AppRouteRouteHandlersSpan["runHandler"] = "AppRouteRouteHandlers.runHandler";
})(AppRouteRouteHandlersSpan || (AppRouteRouteHandlersSpan = {}));
var ResolveMetadataSpan;
(function(ResolveMetadataSpan) {
    ResolveMetadataSpan["generateMetadata"] = "ResolveMetadata.generateMetadata";
})(ResolveMetadataSpan || (ResolveMetadataSpan = {}));
const NextVanillaSpanAllowlist = [
    "BaseServer.handleRequest",
    "Render.getServerSideProps",
    "Render.getStaticProps",
    "AppRender.fetch",
    "AppRender.getBodyResult",
    "Render.renderDocument",
    "Node.runHandler",
    "AppRouteRouteHandlers.runHandler",
    "ResolveMetadata.generateMetadata"
]; //# sourceMappingURL=constants.js.map


/***/ }),

/***/ 3250:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getTracer: function() {
        return getTracer;
    },
    SpanStatusCode: function() {
        return SpanStatusCode;
    },
    SpanKind: function() {
        return SpanKind;
    }
});
const _constants = __webpack_require__(45447);
let api;
// we want to allow users to use their own version of @opentelemetry/api if they
// want to, so we try to require it first, and if it fails we fall back to the
// version that is bundled with Next.js
// this is because @opentelemetry/api has to be synced with the version of
// @opentelemetry/tracing that is used, and we don't want to force users to use
// the version that is bundled with Next.js.
// the API is ~stable, so this should be fine
if (false) {} else {
    try {
        api = __webpack_require__(77953);
    } catch (err) {
        api = __webpack_require__(77953);
    }
}
const { context, trace, SpanStatusCode, SpanKind } = api;
const isPromise = (p)=>{
    return p !== null && typeof p === "object" && typeof p.then === "function";
};
const closeSpanWithError = (span, error)=>{
    if (error) {
        span.recordException(error);
    }
    span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error == null ? void 0 : error.message
    });
    span.end();
};
/** we use this map to propagate attributes from nested spans to the top span */ const rootSpanAttributesStore = new Map();
const rootSpanIdKey = api.createContextKey("next.rootSpanId");
let lastSpanId = 0;
const getSpanId = ()=>lastSpanId++;
class NextTracerImpl {
    /**
   * Returns an instance to the trace with configured name.
   * Since wrap / trace can be defined in any place prior to actual trace subscriber initialization,
   * This should be lazily evaluated.
   */ getTracerInstance() {
        return trace.getTracer("next.js", "0.0.1");
    }
    getContext() {
        return context;
    }
    getActiveScopeSpan() {
        return trace.getSpan(context == null ? void 0 : context.active());
    }
    trace(...args) {
        const [type, fnOrOptions, fnOrEmpty] = args;
        // coerce options form overload
        const { fn, options } = typeof fnOrOptions === "function" ? {
            fn: fnOrOptions,
            options: {}
        } : {
            fn: fnOrEmpty,
            options: {
                ...fnOrOptions
            }
        };
        if (!_constants.NextVanillaSpanAllowlist.includes(type) && process.env.NEXT_OTEL_VERBOSE !== "1" || options.hideSpan) {
            return fn();
        }
        const spanName = options.spanName ?? type;
        // Trying to get active scoped span to assign parent. If option specifies parent span manually, will try to use it.
        let spanContext = this.getSpanContext((options == null ? void 0 : options.parentSpan) ?? this.getActiveScopeSpan());
        let isRootSpan = false;
        if (!spanContext) {
            spanContext = api.ROOT_CONTEXT;
            isRootSpan = true;
        }
        const spanId = getSpanId();
        options.attributes = {
            "next.span_name": spanName,
            "next.span_type": type,
            ...options.attributes
        };
        return api.context.with(spanContext.setValue(rootSpanIdKey, spanId), ()=>this.getTracerInstance().startActiveSpan(spanName, options, (span)=>{
                const onCleanup = ()=>{
                    rootSpanAttributesStore.delete(spanId);
                };
                if (isRootSpan) {
                    rootSpanAttributesStore.set(spanId, new Map(Object.entries(options.attributes ?? {})));
                }
                try {
                    if (fn.length > 1) {
                        return fn(span, (err)=>closeSpanWithError(span, err));
                    }
                    const result = fn(span);
                    if (isPromise(result)) {
                        result.then(()=>span.end(), (err)=>closeSpanWithError(span, err)).finally(onCleanup);
                    } else {
                        span.end();
                        onCleanup();
                    }
                    return result;
                } catch (err) {
                    closeSpanWithError(span, err);
                    onCleanup();
                    throw err;
                }
            }));
    }
    wrap(...args) {
        const tracer = this;
        const [name, options, fn] = args.length === 3 ? args : [
            args[0],
            {},
            args[1]
        ];
        if (!_constants.NextVanillaSpanAllowlist.includes(name) && process.env.NEXT_OTEL_VERBOSE !== "1") {
            return fn;
        }
        return function() {
            let optionsObj = options;
            if (typeof optionsObj === "function" && typeof fn === "function") {
                optionsObj = optionsObj.apply(this, arguments);
            }
            const lastArgId = arguments.length - 1;
            const cb = arguments[lastArgId];
            if (typeof cb === "function") {
                const scopeBoundCb = tracer.getContext().bind(context.active(), cb);
                return tracer.trace(name, optionsObj, (_span, done)=>{
                    arguments[lastArgId] = function(err) {
                        done == null ? void 0 : done(err);
                        return scopeBoundCb.apply(this, arguments);
                    };
                    return fn.apply(this, arguments);
                });
            } else {
                return tracer.trace(name, optionsObj, ()=>fn.apply(this, arguments));
            }
        };
    }
    startSpan(...args) {
        const [type, options] = args;
        const spanContext = this.getSpanContext((options == null ? void 0 : options.parentSpan) ?? this.getActiveScopeSpan());
        return this.getTracerInstance().startSpan(type, options, spanContext);
    }
    getSpanContext(parentSpan) {
        const spanContext = parentSpan ? trace.setSpan(context.active(), parentSpan) : undefined;
        return spanContext;
    }
    getRootSpanAttributes() {
        const spanId = context.active().getValue(rootSpanIdKey);
        return rootSpanAttributesStore.get(spanId);
    }
}
const getTracer = (()=>{
    const tracer = new NextTracerImpl();
    return ()=>tracer;
})(); //# sourceMappingURL=tracer.js.map


/***/ }),

/***/ 45050:
/***/ (() => {

/**
 * Polyfills the `Headers.getAll(name)` method so it'll work in the edge
 * runtime.
 */ 
if (!("getAll" in Headers.prototype)) {
    // @ts-expect-error - this is polyfilling this method so it doesn't exist yet
    Headers.prototype.getAll = function(name) {
        name = name.toLowerCase();
        if (name !== "set-cookie") throw new Error("Headers.getAll is only supported for Set-Cookie header");
        const headers = [
            ...this.entries()
        ].filter(([key])=>key === name);
        return headers.map(([, value])=>value);
    };
} //# sourceMappingURL=node-polyfill-headers.js.map


/***/ }),

/***/ 18847:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;
// This file is for modularized imports for next/server to get fully-treeshaking.

__webpack_unused_export__ = ({
    value: true
});
Object.defineProperty(exports, "Z", ({
    enumerable: true,
    get: function() {
        return _response.NextResponse;
    }
}));
const _response = __webpack_require__(2595); //# sourceMappingURL=next-response.js.map


/***/ }),

/***/ 9095:
/***/ ((__unused_webpack_module, exports) => {

/**
 * List of valid HTTP methods that can be implemented by Next.js's Custom App
 * Routes.
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    HTTP_METHODS: function() {
        return HTTP_METHODS;
    },
    isHTTPMethod: function() {
        return isHTTPMethod;
    }
});
const HTTP_METHODS = [
    "GET",
    "HEAD",
    "OPTIONS",
    "POST",
    "PUT",
    "DELETE",
    "PATCH"
];
function isHTTPMethod(maybeMethod) {
    return HTTP_METHODS.includes(maybeMethod);
} //# sourceMappingURL=http.js.map


/***/ }),

/***/ 32765:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "NextURL", ({
    enumerable: true,
    get: function() {
        return NextURL;
    }
}));
const _detectdomainlocale = __webpack_require__(9845);
const _formatnextpathnameinfo = __webpack_require__(90583);
const _gethostname = __webpack_require__(36730);
const _getnextpathnameinfo = __webpack_require__(91970);
const REGEX_LOCALHOST_HOSTNAME = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|::1|localhost)/;
function parseURL(url, base) {
    return new URL(String(url).replace(REGEX_LOCALHOST_HOSTNAME, "localhost"), base && String(base).replace(REGEX_LOCALHOST_HOSTNAME, "localhost"));
}
const Internal = Symbol("NextURLInternal");
class NextURL {
    constructor(input, baseOrOpts, opts){
        let base;
        let options;
        if (typeof baseOrOpts === "object" && "pathname" in baseOrOpts || typeof baseOrOpts === "string") {
            base = baseOrOpts;
            options = opts || {};
        } else {
            options = opts || baseOrOpts || {};
        }
        this[Internal] = {
            url: parseURL(input, base ?? options.base),
            options: options,
            basePath: ""
        };
        this.analyze();
    }
    analyze() {
        var _this_Internal_options_nextConfig, _this_Internal_options_nextConfig_i18n, _this_Internal_domainLocale, _this_Internal_options_nextConfig1, _this_Internal_options_nextConfig_i18n1;
        const info = (0, _getnextpathnameinfo.getNextPathnameInfo)(this[Internal].url.pathname, {
            nextConfig: this[Internal].options.nextConfig,
            parseData: !undefined,
            i18nProvider: this[Internal].options.i18nProvider
        });
        const hostname = (0, _gethostname.getHostname)(this[Internal].url, this[Internal].options.headers);
        this[Internal].domainLocale = this[Internal].options.i18nProvider ? this[Internal].options.i18nProvider.detectDomainLocale(hostname) : (0, _detectdomainlocale.detectDomainLocale)((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.domains, hostname);
        const defaultLocale = ((_this_Internal_domainLocale = this[Internal].domainLocale) == null ? void 0 : _this_Internal_domainLocale.defaultLocale) || ((_this_Internal_options_nextConfig1 = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n1 = _this_Internal_options_nextConfig1.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n1.defaultLocale);
        this[Internal].url.pathname = info.pathname;
        this[Internal].defaultLocale = defaultLocale;
        this[Internal].basePath = info.basePath ?? "";
        this[Internal].buildId = info.buildId;
        this[Internal].locale = info.locale ?? defaultLocale;
        this[Internal].trailingSlash = info.trailingSlash;
    }
    formatPathname() {
        return (0, _formatnextpathnameinfo.formatNextPathnameInfo)({
            basePath: this[Internal].basePath,
            buildId: this[Internal].buildId,
            defaultLocale: !this[Internal].options.forceLocale ? this[Internal].defaultLocale : undefined,
            locale: this[Internal].locale,
            pathname: this[Internal].url.pathname,
            trailingSlash: this[Internal].trailingSlash
        });
    }
    formatSearch() {
        return this[Internal].url.search;
    }
    get buildId() {
        return this[Internal].buildId;
    }
    set buildId(buildId) {
        this[Internal].buildId = buildId;
    }
    get locale() {
        return this[Internal].locale ?? "";
    }
    set locale(locale) {
        var _this_Internal_options_nextConfig, _this_Internal_options_nextConfig_i18n;
        if (!this[Internal].locale || !((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.locales.includes(locale))) {
            throw new TypeError(`The NextURL configuration includes no locale "${locale}"`);
        }
        this[Internal].locale = locale;
    }
    get defaultLocale() {
        return this[Internal].defaultLocale;
    }
    get domainLocale() {
        return this[Internal].domainLocale;
    }
    get searchParams() {
        return this[Internal].url.searchParams;
    }
    get host() {
        return this[Internal].url.host;
    }
    set host(value) {
        this[Internal].url.host = value;
    }
    get hostname() {
        return this[Internal].url.hostname;
    }
    set hostname(value) {
        this[Internal].url.hostname = value;
    }
    get port() {
        return this[Internal].url.port;
    }
    set port(value) {
        this[Internal].url.port = value;
    }
    get protocol() {
        return this[Internal].url.protocol;
    }
    set protocol(value) {
        this[Internal].url.protocol = value;
    }
    get href() {
        const pathname = this.formatPathname();
        const search = this.formatSearch();
        return `${this.protocol}//${this.host}${pathname}${search}${this.hash}`;
    }
    set href(url) {
        this[Internal].url = parseURL(url);
        this.analyze();
    }
    get origin() {
        return this[Internal].url.origin;
    }
    get pathname() {
        return this[Internal].url.pathname;
    }
    set pathname(value) {
        this[Internal].url.pathname = value;
    }
    get hash() {
        return this[Internal].url.hash;
    }
    set hash(value) {
        this[Internal].url.hash = value;
    }
    get search() {
        return this[Internal].url.search;
    }
    set search(value) {
        this[Internal].url.search = value;
    }
    get password() {
        return this[Internal].url.password;
    }
    set password(value) {
        this[Internal].url.password = value;
    }
    get username() {
        return this[Internal].url.username;
    }
    set username(value) {
        this[Internal].url.username = value;
    }
    get basePath() {
        return this[Internal].basePath;
    }
    set basePath(value) {
        this[Internal].basePath = value.startsWith("/") ? value : `/${value}`;
    }
    toString() {
        return this.href;
    }
    toJSON() {
        return this.href;
    }
    [Symbol.for("edge-runtime.inspect.custom")]() {
        return {
            href: this.href,
            origin: this.origin,
            protocol: this.protocol,
            username: this.username,
            password: this.password,
            host: this.host,
            hostname: this.hostname,
            port: this.port,
            pathname: this.pathname,
            search: this.search,
            searchParams: this.searchParams,
            hash: this.hash
        };
    }
    clone() {
        return new NextURL(String(this), this[Internal].options);
    }
} //# sourceMappingURL=next-url.js.map


/***/ }),

/***/ 3356:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ReadonlyHeadersError: function() {
        return ReadonlyHeadersError;
    },
    HeadersAdapter: function() {
        return HeadersAdapter;
    }
});
const _reflect = __webpack_require__(33505);
class ReadonlyHeadersError extends Error {
    constructor(){
        super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
    }
    static callable() {
        throw new ReadonlyHeadersError();
    }
}
class HeadersAdapter extends Headers {
    constructor(headers){
        // We've already overridden the methods that would be called, so we're just
        // calling the super constructor to ensure that the instanceof check works.
        super();
        this.headers = new Proxy(headers, {
            get (target, prop, receiver) {
                // Because this is just an object, we expect that all "get" operations
                // are for properties. If it's a "get" for a symbol, we'll just return
                // the symbol.
                if (typeof prop === "symbol") {
                    return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return undefined.
                if (typeof original === "undefined") return;
                // If the original casing exists, return the value.
                return _reflect.ReflectAdapter.get(target, original, receiver);
            },
            set (target, prop, value, receiver) {
                if (typeof prop === "symbol") {
                    return _reflect.ReflectAdapter.set(target, prop, value, receiver);
                }
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, use the prop as the key.
                return _reflect.ReflectAdapter.set(target, original ?? prop, value, receiver);
            },
            has (target, prop) {
                if (typeof prop === "symbol") return _reflect.ReflectAdapter.has(target, prop);
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return false.
                if (typeof original === "undefined") return false;
                // If the original casing exists, return true.
                return _reflect.ReflectAdapter.has(target, original);
            },
            deleteProperty (target, prop) {
                if (typeof prop === "symbol") return _reflect.ReflectAdapter.deleteProperty(target, prop);
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return true.
                if (typeof original === "undefined") return true;
                // If the original casing exists, delete the property.
                return _reflect.ReflectAdapter.deleteProperty(target, original);
            }
        });
    }
    /**
   * Seals a Headers instance to prevent modification by throwing an error when
   * any mutating method is called.
   */ static seal(headers) {
        return new Proxy(headers, {
            get (target, prop, receiver) {
                switch(prop){
                    case "append":
                    case "delete":
                    case "set":
                        return ReadonlyHeadersError.callable;
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
    }
    /**
   * Merges a header value into a string. This stores multiple values as an
   * array, so we need to merge them into a string.
   *
   * @param value a header value
   * @returns a merged header value (a string)
   */ merge(value) {
        if (Array.isArray(value)) return value.join(", ");
        return value;
    }
    /**
   * Creates a Headers instance from a plain object or a Headers instance.
   *
   * @param headers a plain object or a Headers instance
   * @returns a headers instance
   */ static from(headers) {
        if (headers instanceof Headers) return headers;
        return new HeadersAdapter(headers);
    }
    append(name, value) {
        const existing = this.headers[name];
        if (typeof existing === "string") {
            this.headers[name] = [
                existing,
                value
            ];
        } else if (Array.isArray(existing)) {
            existing.push(value);
        } else {
            this.headers[name] = value;
        }
    }
    delete(name) {
        delete this.headers[name];
    }
    get(name) {
        const value = this.headers[name];
        if (typeof value !== "undefined") return this.merge(value);
        return null;
    }
    has(name) {
        return typeof this.headers[name] !== "undefined";
    }
    set(name, value) {
        this.headers[name] = value;
    }
    forEach(callbackfn, thisArg) {
        for (const [name, value] of this.entries()){
            callbackfn.call(thisArg, value, name, this);
        }
    }
    *entries() {
        for (const key of Object.keys(this.headers)){
            const name = key.toLowerCase();
            // We assert here that this is a string because we got it from the
            // Object.keys() call above.
            const value = this.get(name);
            yield [
                name,
                value
            ];
        }
    }
    *keys() {
        for (const key of Object.keys(this.headers)){
            const name = key.toLowerCase();
            yield name;
        }
    }
    *values() {
        for (const key of Object.keys(this.headers)){
            // We assert here that this is a string because we got it from the
            // Object.keys() call above.
            const value = this.get(key);
            yield value;
        }
    }
    [Symbol.iterator]() {
        return this.entries();
    }
} //# sourceMappingURL=headers.js.map


/***/ }),

/***/ 33505:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "ReflectAdapter", ({
    enumerable: true,
    get: function() {
        return ReflectAdapter;
    }
}));
class ReflectAdapter {
    static get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === "function") {
            return value.bind(target);
        }
        return value;
    }
    static set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
    }
    static has(target, prop) {
        return Reflect.has(target, prop);
    }
    static deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    }
} //# sourceMappingURL=reflect.js.map


/***/ }),

/***/ 17766:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ReadonlyRequestCookiesError: function() {
        return ReadonlyRequestCookiesError;
    },
    RequestCookiesAdapter: function() {
        return RequestCookiesAdapter;
    },
    getModifiedCookieValues: function() {
        return getModifiedCookieValues;
    },
    appendMutableCookies: function() {
        return appendMutableCookies;
    },
    MutableRequestCookiesAdapter: function() {
        return MutableRequestCookiesAdapter;
    }
});
const _cookies = __webpack_require__(39072);
const _reflect = __webpack_require__(33505);
class ReadonlyRequestCookiesError extends Error {
    constructor(){
        super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options");
    }
    static callable() {
        throw new ReadonlyRequestCookiesError();
    }
}
class RequestCookiesAdapter {
    static seal(cookies) {
        return new Proxy(cookies, {
            get (target, prop, receiver) {
                switch(prop){
                    case "clear":
                    case "delete":
                    case "set":
                        return ReadonlyRequestCookiesError.callable;
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
    }
}
const SYMBOL_MODIFY_COOKIE_VALUES = Symbol.for("next.mutated.cookies");
function getModifiedCookieValues(cookies) {
    const modified = cookies[SYMBOL_MODIFY_COOKIE_VALUES];
    if (!modified || !Array.isArray(modified) || modified.length === 0) {
        return [];
    }
    return modified;
}
function appendMutableCookies(headers, mutableCookies) {
    const modifiedCookieValues = getModifiedCookieValues(mutableCookies);
    if (modifiedCookieValues.length === 0) {
        return false;
    }
    // Return a new response that extends the response with
    // the modified cookies as fallbacks. `res`' cookies
    // will still take precedence.
    const resCookies = new _cookies.ResponseCookies(headers);
    const returnedCookies = resCookies.getAll();
    // Set the modified cookies as fallbacks.
    for (const cookie of modifiedCookieValues){
        resCookies.set(cookie);
    }
    // Set the original cookies as the final values.
    for (const cookie of returnedCookies){
        resCookies.set(cookie);
    }
    return true;
}
class MutableRequestCookiesAdapter {
    static wrap(cookies, res) {
        const responseCookes = new _cookies.ResponseCookies(new Headers());
        for (const cookie of cookies.getAll()){
            responseCookes.set(cookie);
        }
        let modifiedValues = [];
        const modifiedCookies = new Set();
        const updateResponseCookies = ()=>{
            var _fetch___nextGetStaticStore;
            // TODO-APP: change method of getting staticGenerationAsyncStore
            const staticGenerationAsyncStore = fetch.__nextGetStaticStore == null ? void 0 : (_fetch___nextGetStaticStore = fetch.__nextGetStaticStore()) == null ? void 0 : _fetch___nextGetStaticStore.getStore();
            if (staticGenerationAsyncStore) {
                staticGenerationAsyncStore.pathWasRevalidated = true;
            }
            const allCookies = responseCookes.getAll();
            modifiedValues = allCookies.filter((c)=>modifiedCookies.has(c.name));
            if (res) {
                const serializedCookies = [];
                for (const cookie of modifiedValues){
                    const tempCookies = new _cookies.ResponseCookies(new Headers());
                    tempCookies.set(cookie);
                    serializedCookies.push(tempCookies.toString());
                }
                res.setHeader("Set-Cookie", serializedCookies);
            }
        };
        return new Proxy(responseCookes, {
            get (target, prop, receiver) {
                switch(prop){
                    // A special symbol to get the modified cookie values
                    case SYMBOL_MODIFY_COOKIE_VALUES:
                        return modifiedValues;
                    // TODO: Throw error if trying to set a cookie after the response
                    // headers have been set.
                    case "delete":
                        return function(...args) {
                            modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
                            try {
                                target.delete(...args);
                            } finally{
                                updateResponseCookies();
                            }
                        };
                    case "set":
                        return function(...args) {
                            modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
                            try {
                                return target.set(...args);
                            } finally{
                                updateResponseCookies();
                            }
                        };
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
    }
} //# sourceMappingURL=request-cookies.js.map


/***/ }),

/***/ 39072:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    RequestCookies: function() {
        return _cookies.RequestCookies;
    },
    ResponseCookies: function() {
        return _cookies.ResponseCookies;
    }
});
const _cookies = __webpack_require__(14079); //# sourceMappingURL=cookies.js.map


/***/ }),

/***/ 2595:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "NextResponse", ({
    enumerable: true,
    get: function() {
        return NextResponse;
    }
}));
const _nexturl = __webpack_require__(32765);
const _utils = __webpack_require__(54439);
const _cookies = __webpack_require__(39072);
const INTERNALS = Symbol("internal response");
const REDIRECTS = new Set([
    301,
    302,
    303,
    307,
    308
]);
function handleMiddlewareField(init, headers) {
    var _init_request;
    if (init == null ? void 0 : (_init_request = init.request) == null ? void 0 : _init_request.headers) {
        if (!(init.request.headers instanceof Headers)) {
            throw new Error("request.headers must be an instance of Headers");
        }
        const keys = [];
        for (const [key, value] of init.request.headers){
            headers.set("x-middleware-request-" + key, value);
            keys.push(key);
        }
        headers.set("x-middleware-override-headers", keys.join(","));
    }
}
class NextResponse extends Response {
    constructor(body, init = {}){
        super(body, init);
        this[INTERNALS] = {
            cookies: new _cookies.ResponseCookies(this.headers),
            url: init.url ? new _nexturl.NextURL(init.url, {
                headers: (0, _utils.toNodeOutgoingHttpHeaders)(this.headers),
                nextConfig: init.nextConfig
            }) : undefined
        };
    }
    [Symbol.for("edge-runtime.inspect.custom")]() {
        return {
            cookies: this.cookies,
            url: this.url,
            // rest of props come from Response
            body: this.body,
            bodyUsed: this.bodyUsed,
            headers: Object.fromEntries(this.headers),
            ok: this.ok,
            redirected: this.redirected,
            status: this.status,
            statusText: this.statusText,
            type: this.type
        };
    }
    get cookies() {
        return this[INTERNALS].cookies;
    }
    static json(body, init) {
        // @ts-expect-error This is not in lib/dom right now, and we can't augment it.
        const response = Response.json(body, init);
        return new NextResponse(response.body, response);
    }
    static redirect(url, init) {
        const status = typeof init === "number" ? init : (init == null ? void 0 : init.status) ?? 307;
        if (!REDIRECTS.has(status)) {
            throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        const initObj = typeof init === "object" ? init : {};
        const headers = new Headers(initObj == null ? void 0 : initObj.headers);
        headers.set("Location", (0, _utils.validateURL)(url));
        return new NextResponse(null, {
            ...initObj,
            headers,
            status
        });
    }
    static rewrite(destination, init) {
        const headers = new Headers(init == null ? void 0 : init.headers);
        headers.set("x-middleware-rewrite", (0, _utils.validateURL)(destination));
        handleMiddlewareField(init, headers);
        return new NextResponse(null, {
            ...init,
            headers
        });
    }
    static next(init) {
        const headers = new Headers(init == null ? void 0 : init.headers);
        headers.set("x-middleware-next", "1");
        handleMiddlewareField(init, headers);
        return new NextResponse(null, {
            ...init,
            headers
        });
    }
} //# sourceMappingURL=response.js.map


/***/ }),

/***/ 54439:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    fromNodeOutgoingHttpHeaders: function() {
        return fromNodeOutgoingHttpHeaders;
    },
    splitCookiesString: function() {
        return splitCookiesString;
    },
    toNodeOutgoingHttpHeaders: function() {
        return toNodeOutgoingHttpHeaders;
    },
    validateURL: function() {
        return validateURL;
    }
});
function fromNodeOutgoingHttpHeaders(nodeHeaders) {
    const headers = new Headers();
    for (let [key, value] of Object.entries(nodeHeaders)){
        const values = Array.isArray(value) ? value : [
            value
        ];
        for (let v of values){
            if (typeof v === "undefined") continue;
            if (typeof v === "number") {
                v = v.toString();
            }
            headers.append(key, v);
        }
    }
    return headers;
}
function splitCookiesString(cookiesString) {
    var cookiesStrings = [];
    var pos = 0;
    var start;
    var ch;
    var lastComma;
    var nextStart;
    var cookiesSeparatorFound;
    function skipWhitespace() {
        while(pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))){
            pos += 1;
        }
        return pos < cookiesString.length;
    }
    function notSpecialChar() {
        ch = cookiesString.charAt(pos);
        return ch !== "=" && ch !== ";" && ch !== ",";
    }
    while(pos < cookiesString.length){
        start = pos;
        cookiesSeparatorFound = false;
        while(skipWhitespace()){
            ch = cookiesString.charAt(pos);
            if (ch === ",") {
                // ',' is a cookie separator if we have later first '=', not ';' or ','
                lastComma = pos;
                pos += 1;
                skipWhitespace();
                nextStart = pos;
                while(pos < cookiesString.length && notSpecialChar()){
                    pos += 1;
                }
                // currently special character
                if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
                    // we found cookies separator
                    cookiesSeparatorFound = true;
                    // pos is inside the next cookie, so back up and return it.
                    pos = nextStart;
                    cookiesStrings.push(cookiesString.substring(start, lastComma));
                    start = pos;
                } else {
                    // in param ',' or param separator ';',
                    // we continue from that comma
                    pos = lastComma + 1;
                }
            } else {
                pos += 1;
            }
        }
        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
            cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
    }
    return cookiesStrings;
}
function toNodeOutgoingHttpHeaders(headers) {
    const nodeHeaders = {};
    const cookies = [];
    if (headers) {
        for (const [key, value] of headers.entries()){
            if (key.toLowerCase() === "set-cookie") {
                // We may have gotten a comma joined string of cookies, or multiple
                // set-cookie headers. We need to merge them into one header array
                // to represent all the cookies.
                cookies.push(...splitCookiesString(value));
                nodeHeaders[key] = cookies.length === 1 ? cookies[0] : cookies;
            } else {
                nodeHeaders[key] = value;
            }
        }
    }
    return nodeHeaders;
}
function validateURL(url) {
    try {
        return String(new URL(String(url)));
    } catch (error) {
        throw new Error(`URL is malformed "${String(url)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, {
            cause: error
        });
    }
} //# sourceMappingURL=utils.js.map


/***/ }),

/***/ 36730:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getHostname", ({
    enumerable: true,
    get: function() {
        return getHostname;
    }
}));
function getHostname(parsed, headers) {
    // Get the hostname from the headers if it exists, otherwise use the parsed
    // hostname.
    let hostname;
    if ((headers == null ? void 0 : headers.host) && !Array.isArray(headers.host)) {
        hostname = headers.host.toString().split(":")[0];
    } else if (parsed.hostname) {
        hostname = parsed.hostname;
    } else return;
    return hostname.toLowerCase();
} //# sourceMappingURL=get-hostname.js.map


/***/ }),

/***/ 9845:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "detectDomainLocale", ({
    enumerable: true,
    get: function() {
        return detectDomainLocale;
    }
}));
function detectDomainLocale(domainItems, hostname, detectedLocale) {
    if (!domainItems) return;
    if (detectedLocale) {
        detectedLocale = detectedLocale.toLowerCase();
    }
    for (const item of domainItems){
        var _item_domain, _item_locales;
        // remove port if present
        const domainHostname = (_item_domain = item.domain) == null ? void 0 : _item_domain.split(":")[0].toLowerCase();
        if (hostname === domainHostname || detectedLocale === item.defaultLocale.toLowerCase() || ((_item_locales = item.locales) == null ? void 0 : _item_locales.some((locale)=>locale.toLowerCase() === detectedLocale))) {
            return item;
        }
    }
} //# sourceMappingURL=detect-domain-locale.js.map


/***/ }),

/***/ 20580:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "normalizeLocalePath", ({
    enumerable: true,
    get: function() {
        return normalizeLocalePath;
    }
}));
function normalizeLocalePath(pathname, locales) {
    let detectedLocale;
    // first item will be empty string from splitting at first char
    const pathnameParts = pathname.split("/");
    (locales || []).some((locale)=>{
        if (pathnameParts[1] && pathnameParts[1].toLowerCase() === locale.toLowerCase()) {
            detectedLocale = locale;
            pathnameParts.splice(1, 1);
            pathname = pathnameParts.join("/") || "/";
            return true;
        }
        return false;
    });
    return {
        pathname,
        detectedLocale
    };
} //# sourceMappingURL=normalize-locale-path.js.map


/***/ }),

/***/ 72495:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addLocale", ({
    enumerable: true,
    get: function() {
        return addLocale;
    }
}));
const _addpathprefix = __webpack_require__(599);
const _pathhasprefix = __webpack_require__(38372);
function addLocale(path, locale, defaultLocale, ignorePrefix) {
    // If no locale was given or the locale is the default locale, we don't need
    // to prefix the path.
    if (!locale || locale === defaultLocale) return path;
    const lower = path.toLowerCase();
    // If the path is an API path or the path already has the locale prefix, we
    // don't need to prefix the path.
    if (!ignorePrefix) {
        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/api")) return path;
        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/" + locale.toLowerCase())) return path;
    }
    // Add the locale prefix to the path.
    return (0, _addpathprefix.addPathPrefix)(path, "/" + locale);
} //# sourceMappingURL=add-locale.js.map


/***/ }),

/***/ 599:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addPathPrefix", ({
    enumerable: true,
    get: function() {
        return addPathPrefix;
    }
}));
const _parsepath = __webpack_require__(8680);
function addPathPrefix(path, prefix) {
    if (!path.startsWith("/") || !prefix) {
        return path;
    }
    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
    return "" + prefix + pathname + query + hash;
} //# sourceMappingURL=add-path-prefix.js.map


/***/ }),

/***/ 67578:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addPathSuffix", ({
    enumerable: true,
    get: function() {
        return addPathSuffix;
    }
}));
const _parsepath = __webpack_require__(8680);
function addPathSuffix(path, suffix) {
    if (!path.startsWith("/") || !suffix) {
        return path;
    }
    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
    return "" + pathname + suffix + query + hash;
} //# sourceMappingURL=add-path-suffix.js.map


/***/ }),

/***/ 90583:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "formatNextPathnameInfo", ({
    enumerable: true,
    get: function() {
        return formatNextPathnameInfo;
    }
}));
const _removetrailingslash = __webpack_require__(20194);
const _addpathprefix = __webpack_require__(599);
const _addpathsuffix = __webpack_require__(67578);
const _addlocale = __webpack_require__(72495);
function formatNextPathnameInfo(info) {
    let pathname = (0, _addlocale.addLocale)(info.pathname, info.locale, info.buildId ? undefined : info.defaultLocale, info.ignorePrefix);
    if (info.buildId || !info.trailingSlash) {
        pathname = (0, _removetrailingslash.removeTrailingSlash)(pathname);
    }
    if (info.buildId) {
        pathname = (0, _addpathsuffix.addPathSuffix)((0, _addpathprefix.addPathPrefix)(pathname, "/_next/data/" + info.buildId), info.pathname === "/" ? "index.json" : ".json");
    }
    pathname = (0, _addpathprefix.addPathPrefix)(pathname, info.basePath);
    return !info.buildId && info.trailingSlash ? !pathname.endsWith("/") ? (0, _addpathsuffix.addPathSuffix)(pathname, "/") : pathname : (0, _removetrailingslash.removeTrailingSlash)(pathname);
} //# sourceMappingURL=format-next-pathname-info.js.map


/***/ }),

/***/ 91970:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getNextPathnameInfo", ({
    enumerable: true,
    get: function() {
        return getNextPathnameInfo;
    }
}));
const _normalizelocalepath = __webpack_require__(20580);
const _removepathprefix = __webpack_require__(89528);
const _pathhasprefix = __webpack_require__(38372);
function getNextPathnameInfo(pathname, options) {
    var _options_nextConfig;
    const { basePath, i18n, trailingSlash } = (_options_nextConfig = options.nextConfig) != null ? _options_nextConfig : {};
    const info = {
        pathname: pathname,
        trailingSlash: pathname !== "/" ? pathname.endsWith("/") : trailingSlash
    };
    if (basePath && (0, _pathhasprefix.pathHasPrefix)(info.pathname, basePath)) {
        info.pathname = (0, _removepathprefix.removePathPrefix)(info.pathname, basePath);
        info.basePath = basePath;
    }
    if (options.parseData === true && info.pathname.startsWith("/_next/data/") && info.pathname.endsWith(".json")) {
        const paths = info.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
        const buildId = paths[0];
        info.pathname = paths[1] !== "index" ? "/" + paths.slice(1).join("/") : "/";
        info.buildId = buildId;
    }
    // If provided, use the locale route normalizer to detect the locale instead
    // of the function below.
    if (options.i18nProvider) {
        const result = options.i18nProvider.analyze(info.pathname);
        info.locale = result.detectedLocale;
        var _result_pathname;
        info.pathname = (_result_pathname = result.pathname) != null ? _result_pathname : info.pathname;
    } else if (i18n) {
        const pathLocale = (0, _normalizelocalepath.normalizeLocalePath)(info.pathname, i18n.locales);
        info.locale = pathLocale.detectedLocale;
        var _pathLocale_pathname;
        info.pathname = (_pathLocale_pathname = pathLocale.pathname) != null ? _pathLocale_pathname : info.pathname;
    }
    return info;
} //# sourceMappingURL=get-next-pathname-info.js.map


/***/ }),

/***/ 8680:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Given a path this function will find the pathname, query and hash and return
 * them. This is useful to parse full paths on the client side.
 * @param path A path to parse e.g. /foo/bar?id=1#hash
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "parsePath", ({
    enumerable: true,
    get: function() {
        return parsePath;
    }
}));
function parsePath(path) {
    const hashIndex = path.indexOf("#");
    const queryIndex = path.indexOf("?");
    const hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
    if (hasQuery || hashIndex > -1) {
        return {
            pathname: path.substring(0, hasQuery ? queryIndex : hashIndex),
            query: hasQuery ? path.substring(queryIndex, hashIndex > -1 ? hashIndex : undefined) : "",
            hash: hashIndex > -1 ? path.slice(hashIndex) : ""
        };
    }
    return {
        pathname: path,
        query: "",
        hash: ""
    };
} //# sourceMappingURL=parse-path.js.map


/***/ }),

/***/ 38372:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "pathHasPrefix", ({
    enumerable: true,
    get: function() {
        return pathHasPrefix;
    }
}));
const _parsepath = __webpack_require__(8680);
function pathHasPrefix(path, prefix) {
    if (typeof path !== "string") {
        return false;
    }
    const { pathname } = (0, _parsepath.parsePath)(path);
    return pathname === prefix || pathname.startsWith(prefix + "/");
} //# sourceMappingURL=path-has-prefix.js.map


/***/ }),

/***/ 89528:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removePathPrefix", ({
    enumerable: true,
    get: function() {
        return removePathPrefix;
    }
}));
const _pathhasprefix = __webpack_require__(38372);
function removePathPrefix(path, prefix) {
    // If the path doesn't start with the prefix we can return it as is. This
    // protects us from situations where the prefix is a substring of the path
    // prefix such as:
    //
    // For prefix: /blog
    //
    //   /blog -> true
    //   /blog/ -> true
    //   /blog/1 -> true
    //   /blogging -> false
    //   /blogging/ -> false
    //   /blogging/1 -> false
    if (!(0, _pathhasprefix.pathHasPrefix)(path, prefix)) {
        return path;
    }
    // Remove the prefix from the path via slicing.
    const withoutPrefix = path.slice(prefix.length);
    // If the path without the prefix starts with a `/` we can return it as is.
    if (withoutPrefix.startsWith("/")) {
        return withoutPrefix;
    }
    // If the path without the prefix doesn't start with a `/` we need to add it
    // back to the path to make sure it's a valid path.
    return "/" + withoutPrefix;
} //# sourceMappingURL=remove-path-prefix.js.map


/***/ }),

/***/ 20194:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Removes the trailing slash for a given route or page path. Preserves the
 * root page. Examples:
 *   - `/foo/bar/` -> `/foo/bar`
 *   - `/foo/bar` -> `/foo/bar`
 *   - `/` -> `/`
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removeTrailingSlash", ({
    enumerable: true,
    get: function() {
        return removeTrailingSlash;
    }
}));
function removeTrailingSlash(route) {
    return route.replace(/\/$/, "") || "/";
} //# sourceMappingURL=remove-trailing-slash.js.map


/***/ }),

/***/ 34260:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   qn: () => (/* binding */ Xs)
/* harmony export */ });
/* unused harmony exports Client, ClientBase, Connection, DatabaseError, NeonDbError, Pool, Query, defaults, neonConfig, types */
var io = Object.create;
var Ce = Object.defineProperty;
var so = Object.getOwnPropertyDescriptor;
var oo = Object.getOwnPropertyNames;
var ao = Object.getPrototypeOf, uo = Object.prototype.hasOwnProperty;
var co = (r, e, t)=>e in r ? Ce(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t;
var a = (r, e)=>Ce(r, "name", {
        value: e,
        configurable: !0
    });
var z = (r, e)=>()=>(r && (e = r(r = 0)), e);
var I = (r, e)=>()=>(e || r((e = {
            exports: {}
        }).exports, e), e.exports), se = (r, e)=>{
    for(var t in e)Ce(r, t, {
        get: e[t],
        enumerable: !0
    });
}, Tn = (r, e, t, n)=>{
    if (e && typeof e == "object" || typeof e == "function") for (let i of oo(e))!uo.call(r, i) && i !== t && Ce(r, i, {
        get: ()=>e[i],
        enumerable: !(n = so(e, i)) || n.enumerable
    });
    return r;
};
var Te = (r, e, t)=>(t = r != null ? io(ao(r)) : {}, Tn(e || !r || !r.__esModule ? Ce(t, "default", {
        value: r,
        enumerable: !0
    }) : t, r)), O = (r)=>Tn(Ce({}, "__esModule", {
        value: !0
    }), r);
var _ = (r, e, t)=>co(r, typeof e != "symbol" ? e + "" : e, t);
var Bn = I((st)=>{
    "use strict";
    p();
    st.byteLength = lo;
    st.toByteArray = po;
    st.fromByteArray = go;
    var ae = [], re = [], ho = typeof Uint8Array < "u" ? Uint8Array : Array, Rt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(Ee = 0, In = Rt.length; Ee < In; ++Ee)ae[Ee] = Rt[Ee], re[Rt.charCodeAt(Ee)] = Ee;
    var Ee, In;
    re[45] = 62;
    re[95] = 63;
    function Pn(r) {
        var e = r.length;
        if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        var t = r.indexOf("=");
        t === -1 && (t = e);
        var n = t === e ? 0 : 4 - t % 4;
        return [
            t,
            n
        ];
    }
    a(Pn, "getLens");
    function lo(r) {
        var e = Pn(r), t = e[0], n = e[1];
        return (t + n) * 3 / 4 - n;
    }
    a(lo, "byteLength");
    function fo(r, e, t) {
        return (e + t) * 3 / 4 - t;
    }
    a(fo, "_byteLength");
    function po(r) {
        var e, t = Pn(r), n = t[0], i = t[1], s = new ho(fo(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
        for(c = 0; c < u; c += 4)e = re[r.charCodeAt(c)] << 18 | re[r.charCodeAt(c + 1)] << 12 | re[r.charCodeAt(c + 2)] << 6 | re[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
        return i === 2 && (e = re[r.charCodeAt(c)] << 2 | re[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = re[r.charCodeAt(c)] << 10 | re[r.charCodeAt(c + 1)] << 4 | re[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
    }
    a(po, "toByteArray");
    function yo(r) {
        return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
    }
    a(yo, "tripletToBase64");
    function mo(r, e, t) {
        for(var n, i = [], s = e; s < t; s += 3)n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(yo(n));
        return i.join("");
    }
    a(mo, "encodeChunk");
    function go(r) {
        for(var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s)i.push(mo(r, o, o + s > u ? u : o + s));
        return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
    }
    a(go, "fromByteArray");
});
var Ln = I((Ft)=>{
    p();
    Ft.read = function(r, e, t, n, i) {
        var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, h = c >> 1, l = -7, d = t ? i - 1 : 0, b = t ? -1 : 1, C = r[e + d];
        for(d += b, s = C & (1 << -l) - 1, C >>= -l, l += u; l > 0; s = s * 256 + r[e + d], d += b, l -= 8);
        for(o = s & (1 << -l) - 1, s >>= -l, l += n; l > 0; o = o * 256 + r[e + d], d += b, l -= 8);
        if (s === 0) s = 1 - h;
        else {
            if (s === c) return o ? NaN : (C ? -1 : 1) * (1 / 0);
            o = o + Math.pow(2, n), s = s - h;
        }
        return (C ? -1 : 1) * o * Math.pow(2, s - n);
    };
    Ft.write = function(r, e, t, n, i, s) {
        var o, u, c, h = s * 8 - i - 1, l = (1 << h) - 1, d = l >> 1, b = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, C = n ? 0 : s - 1, B = n ? 1 : -1, Q = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
        for(e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = l) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + d >= 1 ? e += b / c : e += b * Math.pow(2, 1 - d), e * c >= 2 && (o++, c /= 2), o + d >= l ? (u = 0, o = l) : o + d >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + d) : (u = e * Math.pow(2, d - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + C] = u & 255, C += B, u /= 256, i -= 8);
        for(o = o << i | u, h += i; h > 0; r[t + C] = o & 255, C += B, o /= 256, h -= 8);
        r[t + C - B] |= Q * 128;
    };
});
var Kn = I((Le)=>{
    "use strict";
    p();
    var Mt = Bn(), Pe = Ln(), Rn = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    Le.Buffer = f;
    Le.SlowBuffer = vo;
    Le.INSPECT_MAX_BYTES = 50;
    var ot = 2147483647;
    Le.kMaxLength = ot;
    f.TYPED_ARRAY_SUPPORT = wo();
    !f.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function wo() {
        try {
            let r = new Uint8Array(1), e = {
                foo: a(function() {
                    return 42;
                }, "foo")
            };
            return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
        } catch  {
            return !1;
        }
    }
    a(wo, "typedArraySupport");
    Object.defineProperty(f.prototype, "parent", {
        enumerable: !0,
        get: a(function() {
            if (f.isBuffer(this)) return this.buffer;
        }, "get")
    });
    Object.defineProperty(f.prototype, "offset", {
        enumerable: !0,
        get: a(function() {
            if (f.isBuffer(this)) return this.byteOffset;
        }, "get")
    });
    function le(r) {
        if (r > ot) throw new RangeError('The value "' + r + '" is invalid for option "size"');
        let e = new Uint8Array(r);
        return Object.setPrototypeOf(e, f.prototype), e;
    }
    a(le, "createBuffer");
    function f(r, e, t) {
        if (typeof r == "number") {
            if (typeof e == "string") throw new TypeError('The "string" argument must be of type string. Received type number');
            return Ot(r);
        }
        return kn(r, e, t);
    }
    a(f, "Buffer");
    f.poolSize = 8192;
    function kn(r, e, t) {
        if (typeof r == "string") return So(r, e);
        if (ArrayBuffer.isView(r)) return xo(r);
        if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
        if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(r.buffer, SharedArrayBuffer))) return kt(r, e, t);
        if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
        let n = r.valueOf && r.valueOf();
        if (n != null && n !== r) return f.from(n, e, t);
        let i = Eo(r);
        if (i) return i;
        if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return f.from(r[Symbol.toPrimitive]("string"), e, t);
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    }
    a(kn, "from");
    f.from = function(r, e, t) {
        return kn(r, e, t);
    };
    Object.setPrototypeOf(f.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(f, Uint8Array);
    function Un(r) {
        if (typeof r != "number") throw new TypeError('"size" argument must be of type number');
        if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    }
    a(Un, "assertSize");
    function bo(r, e, t) {
        return Un(r), r <= 0 ? le(r) : e !== void 0 ? typeof t == "string" ? le(r).fill(e, t) : le(r).fill(e) : le(r);
    }
    a(bo, "alloc");
    f.alloc = function(r, e, t) {
        return bo(r, e, t);
    };
    function Ot(r) {
        return Un(r), le(r < 0 ? 0 : Nt(r) | 0);
    }
    a(Ot, "allocUnsafe");
    f.allocUnsafe = function(r) {
        return Ot(r);
    };
    f.allocUnsafeSlow = function(r) {
        return Ot(r);
    };
    function So(r, e) {
        if ((typeof e != "string" || e === "") && (e = "utf8"), !f.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
        let t = On(r, e) | 0, n = le(t), i = n.write(r, e);
        return i !== t && (n = n.slice(0, i)), n;
    }
    a(So, "fromString");
    function Dt(r) {
        let e = r.length < 0 ? 0 : Nt(r.length) | 0, t = le(e);
        for(let n = 0; n < e; n += 1)t[n] = r[n] & 255;
        return t;
    }
    a(Dt, "fromArrayLike");
    function xo(r) {
        if (ue(r, Uint8Array)) {
            let e = new Uint8Array(r);
            return kt(e.buffer, e.byteOffset, e.byteLength);
        }
        return Dt(r);
    }
    a(xo, "fromArrayView");
    function kt(r, e, t) {
        if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
        if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
        let n;
        return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(r, e, t), Object.setPrototypeOf(n, f.prototype), n;
    }
    a(kt, "fromArrayBuffer");
    function Eo(r) {
        if (f.isBuffer(r)) {
            let e = Nt(r.length) | 0, t = le(e);
            return t.length === 0 || r.copy(t, 0, 0, e), t;
        }
        if (r.length !== void 0) return typeof r.length != "number" || Qt(r.length) ? le(0) : Dt(r);
        if (r.type === "Buffer" && Array.isArray(r.data)) return Dt(r.data);
    }
    a(Eo, "fromObject");
    function Nt(r) {
        if (r >= ot) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ot.toString(16) + " bytes");
        return r | 0;
    }
    a(Nt, "checked");
    function vo(r) {
        return +r != r && (r = 0), f.alloc(+r);
    }
    a(vo, "SlowBuffer");
    f.isBuffer = a(function(e) {
        return e != null && e._isBuffer === !0 && e !== f.prototype;
    }, "isBuffer");
    f.compare = a(function(e, t) {
        if (ue(e, Uint8Array) && (e = f.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = f.from(t, t.offset, t.byteLength)), !f.isBuffer(e) || !f.isBuffer(t)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
        if (e === t) return 0;
        let n = e.length, i = t.length;
        for(let s = 0, o = Math.min(n, i); s < o; ++s)if (e[s] !== t[s]) {
            n = e[s], i = t[s];
            break;
        }
        return n < i ? -1 : i < n ? 1 : 0;
    }, "compare");
    f.isEncoding = a(function(e) {
        switch(String(e).toLowerCase()){
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return !0;
            default:
                return !1;
        }
    }, "isEncoding");
    f.concat = a(function(e, t) {
        if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (e.length === 0) return f.alloc(0);
        let n;
        if (t === void 0) for(t = 0, n = 0; n < e.length; ++n)t += e[n].length;
        let i = f.allocUnsafe(t), s = 0;
        for(n = 0; n < e.length; ++n){
            let o = e[n];
            if (ue(o, Uint8Array)) s + o.length > i.length ? (f.isBuffer(o) || (o = f.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
            else if (f.isBuffer(o)) o.copy(i, s);
            else throw new TypeError('"list" argument must be an Array of Buffers');
            s += o.length;
        }
        return i;
    }, "concat");
    function On(r, e) {
        if (f.isBuffer(r)) return r.length;
        if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
        if (typeof r != "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r);
        let t = r.length, n = arguments.length > 2 && arguments[2] === !0;
        if (!n && t === 0) return 0;
        let i = !1;
        for(;;)switch(e){
            case "ascii":
            case "latin1":
            case "binary":
                return t;
            case "utf8":
            case "utf-8":
                return Ut(r).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return t * 2;
            case "hex":
                return t >>> 1;
            case "base64":
                return Vn(r).length;
            default:
                if (i) return n ? -1 : Ut(r).length;
                e = ("" + e).toLowerCase(), i = !0;
        }
    }
    a(On, "byteLength");
    f.byteLength = On;
    function _o(r, e, t) {
        let n = !1;
        if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
        for(r || (r = "utf8");;)switch(r){
            case "hex":
                return Mo(this, e, t);
            case "utf8":
            case "utf-8":
                return qn(this, e, t);
            case "ascii":
                return Ro(this, e, t);
            case "latin1":
            case "binary":
                return Fo(this, e, t);
            case "base64":
                return Bo(this, e, t);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return Do(this, e, t);
            default:
                if (n) throw new TypeError("Unknown encoding: " + r);
                r = (r + "").toLowerCase(), n = !0;
        }
    }
    a(_o, "slowToString");
    f.prototype._isBuffer = !0;
    function ve(r, e, t) {
        let n = r[e];
        r[e] = r[t], r[t] = n;
    }
    a(ve, "swap");
    f.prototype.swap16 = a(function() {
        let e = this.length;
        if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for(let t = 0; t < e; t += 2)ve(this, t, t + 1);
        return this;
    }, "swap16");
    f.prototype.swap32 = a(function() {
        let e = this.length;
        if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for(let t = 0; t < e; t += 4)ve(this, t, t + 3), ve(this, t + 1, t + 2);
        return this;
    }, "swap32");
    f.prototype.swap64 = a(function() {
        let e = this.length;
        if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for(let t = 0; t < e; t += 8)ve(this, t, t + 7), ve(this, t + 1, t + 6), ve(this, t + 2, t + 5), ve(this, t + 3, t + 4);
        return this;
    }, "swap64");
    f.prototype.toString = a(function() {
        let e = this.length;
        return e === 0 ? "" : arguments.length === 0 ? qn(this, 0, e) : _o.apply(this, arguments);
    }, "toString");
    f.prototype.toLocaleString = f.prototype.toString;
    f.prototype.equals = a(function(e) {
        if (!f.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
        return this === e ? !0 : f.compare(this, e) === 0;
    }, "equals");
    f.prototype.inspect = a(function() {
        let e = "", t = Le.INSPECT_MAX_BYTES;
        return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
    }, "inspect");
    Rn && (f.prototype[Rn] = f.prototype.inspect);
    f.prototype.compare = a(function(e, t, n, i, s) {
        if (ue(e, Uint8Array) && (e = f.from(e, e.offset, e.byteLength)), !f.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
        if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length) throw new RangeError("out of range index");
        if (i >= s && t >= n) return 0;
        if (i >= s) return -1;
        if (t >= n) return 1;
        if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e) return 0;
        let o = s - i, u = n - t, c = Math.min(o, u), h = this.slice(i, s), l = e.slice(t, n);
        for(let d = 0; d < c; ++d)if (h[d] !== l[d]) {
            o = h[d], u = l[d];
            break;
        }
        return o < u ? -1 : u < o ? 1 : 0;
    }, "compare");
    function Nn(r, e, t, n, i) {
        if (r.length === 0) return -1;
        if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, Qt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
            if (i) return -1;
            t = r.length - 1;
        } else if (t < 0) if (i) t = 0;
        else return -1;
        if (typeof e == "string" && (e = f.from(e, n)), f.isBuffer(e)) return e.length === 0 ? -1 : Fn(r, e, t, n, i);
        if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : Fn(r, [
            e
        ], t, n, i);
        throw new TypeError("val must be string, number or Buffer");
    }
    a(Nn, "bidirectionalIndexOf");
    function Fn(r, e, t, n, i) {
        let s = 1, o = r.length, u = e.length;
        if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
            if (r.length < 2 || e.length < 2) return -1;
            s = 2, o /= 2, u /= 2, t /= 2;
        }
        function c(l, d) {
            return s === 1 ? l[d] : l.readUInt16BE(d * s);
        }
        a(c, "read");
        let h;
        if (i) {
            let l = -1;
            for(h = t; h < o; h++)if (c(r, h) === c(e, l === -1 ? 0 : h - l)) {
                if (l === -1 && (l = h), h - l + 1 === u) return l * s;
            } else l !== -1 && (h -= h - l), l = -1;
        } else for(t + u > o && (t = o - u), h = t; h >= 0; h--){
            let l = !0;
            for(let d = 0; d < u; d++)if (c(r, h + d) !== c(e, d)) {
                l = !1;
                break;
            }
            if (l) return h;
        }
        return -1;
    }
    a(Fn, "arrayIndexOf");
    f.prototype.includes = a(function(e, t, n) {
        return this.indexOf(e, t, n) !== -1;
    }, "includes");
    f.prototype.indexOf = a(function(e, t, n) {
        return Nn(this, e, t, n, !0);
    }, "indexOf");
    f.prototype.lastIndexOf = a(function(e, t, n) {
        return Nn(this, e, t, n, !1);
    }, "lastIndexOf");
    function Ao(r, e, t, n) {
        t = Number(t) || 0;
        let i = r.length - t;
        n ? (n = Number(n), n > i && (n = i)) : n = i;
        let s = e.length;
        n > s / 2 && (n = s / 2);
        let o;
        for(o = 0; o < n; ++o){
            let u = parseInt(e.substr(o * 2, 2), 16);
            if (Qt(u)) return o;
            r[t + o] = u;
        }
        return o;
    }
    a(Ao, "hexWrite");
    function Co(r, e, t, n) {
        return at(Ut(e, r.length - t), r, t, n);
    }
    a(Co, "utf8Write");
    function To(r, e, t, n) {
        return at(No(e), r, t, n);
    }
    a(To, "asciiWrite");
    function Io(r, e, t, n) {
        return at(Vn(e), r, t, n);
    }
    a(Io, "base64Write");
    function Po(r, e, t, n) {
        return at(qo(e, r.length - t), r, t, n);
    }
    a(Po, "ucs2Write");
    f.prototype.write = a(function(e, t, n, i) {
        if (t === void 0) i = "utf8", n = this.length, t = 0;
        else if (n === void 0 && typeof t == "string") i = t, n = this.length, t = 0;
        else if (isFinite(t)) t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
        else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        let s = this.length - t;
        if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        i || (i = "utf8");
        let o = !1;
        for(;;)switch(i){
            case "hex":
                return Ao(this, e, t, n);
            case "utf8":
            case "utf-8":
                return Co(this, e, t, n);
            case "ascii":
            case "latin1":
            case "binary":
                return To(this, e, t, n);
            case "base64":
                return Io(this, e, t, n);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return Po(this, e, t, n);
            default:
                if (o) throw new TypeError("Unknown encoding: " + i);
                i = ("" + i).toLowerCase(), o = !0;
        }
    }, "write");
    f.prototype.toJSON = a(function() {
        return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0)
        };
    }, "toJSON");
    function Bo(r, e, t) {
        return e === 0 && t === r.length ? Mt.fromByteArray(r) : Mt.fromByteArray(r.slice(e, t));
    }
    a(Bo, "base64Slice");
    function qn(r, e, t) {
        t = Math.min(r.length, t);
        let n = [], i = e;
        for(; i < t;){
            let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
            if (i + u <= t) {
                let c, h, l, d;
                switch(u){
                    case 1:
                        s < 128 && (o = s);
                        break;
                    case 2:
                        c = r[i + 1], (c & 192) === 128 && (d = (s & 31) << 6 | c & 63, d > 127 && (o = d));
                        break;
                    case 3:
                        c = r[i + 1], h = r[i + 2], (c & 192) === 128 && (h & 192) === 128 && (d = (s & 15) << 12 | (c & 63) << 6 | h & 63, d > 2047 && (d < 55296 || d > 57343) && (o = d));
                        break;
                    case 4:
                        c = r[i + 1], h = r[i + 2], l = r[i + 3], (c & 192) === 128 && (h & 192) === 128 && (l & 192) === 128 && (d = (s & 15) << 18 | (c & 63) << 12 | (h & 63) << 6 | l & 63, d > 65535 && d < 1114112 && (o = d));
                }
            }
            o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
        }
        return Lo(n);
    }
    a(qn, "utf8Slice");
    var Mn = 4096;
    function Lo(r) {
        let e = r.length;
        if (e <= Mn) return String.fromCharCode.apply(String, r);
        let t = "", n = 0;
        for(; n < e;)t += String.fromCharCode.apply(String, r.slice(n, n += Mn));
        return t;
    }
    a(Lo, "decodeCodePointsArray");
    function Ro(r, e, t) {
        let n = "";
        t = Math.min(r.length, t);
        for(let i = e; i < t; ++i)n += String.fromCharCode(r[i] & 127);
        return n;
    }
    a(Ro, "asciiSlice");
    function Fo(r, e, t) {
        let n = "";
        t = Math.min(r.length, t);
        for(let i = e; i < t; ++i)n += String.fromCharCode(r[i]);
        return n;
    }
    a(Fo, "latin1Slice");
    function Mo(r, e, t) {
        let n = r.length;
        (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
        let i = "";
        for(let s = e; s < t; ++s)i += Qo[r[s]];
        return i;
    }
    a(Mo, "hexSlice");
    function Do(r, e, t) {
        let n = r.slice(e, t), i = "";
        for(let s = 0; s < n.length - 1; s += 2)i += String.fromCharCode(n[s] + n[s + 1] * 256);
        return i;
    }
    a(Do, "utf16leSlice");
    f.prototype.slice = a(function(e, t) {
        let n = this.length;
        e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
        let i = this.subarray(e, t);
        return Object.setPrototypeOf(i, f.prototype), i;
    }, "slice");
    function N(r, e, t) {
        if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
        if (r + e > t) throw new RangeError("Trying to access beyond buffer length");
    }
    a(N, "checkOffset");
    f.prototype.readUintLE = f.prototype.readUIntLE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || N(e, t, this.length);
        let i = this[e], s = 1, o = 0;
        for(; ++o < t && (s *= 256);)i += this[e + o] * s;
        return i;
    }, "readUIntLE");
    f.prototype.readUintBE = f.prototype.readUIntBE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || N(e, t, this.length);
        let i = this[e + --t], s = 1;
        for(; t > 0 && (s *= 256);)i += this[e + --t] * s;
        return i;
    }, "readUIntBE");
    f.prototype.readUint8 = f.prototype.readUInt8 = a(function(e, t) {
        return e = e >>> 0, t || N(e, 1, this.length), this[e];
    }, "readUInt8");
    f.prototype.readUint16LE = f.prototype.readUInt16LE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 2, this.length), this[e] | this[e + 1] << 8;
    }, "readUInt16LE");
    f.prototype.readUint16BE = f.prototype.readUInt16BE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 2, this.length), this[e] << 8 | this[e + 1];
    }, "readUInt16BE");
    f.prototype.readUint32LE = f.prototype.readUInt32LE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
    }, "readUInt32LE");
    f.prototype.readUint32BE = f.prototype.readUInt32BE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
    }, "readUInt32BE");
    f.prototype.readBigUInt64LE = me(a(function(e) {
        e = e >>> 0, Be(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && We(e, this.length - 8);
        let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
        return BigInt(i) + (BigInt(s) << BigInt(32));
    }, "readBigUInt64LE"));
    f.prototype.readBigUInt64BE = me(a(function(e) {
        e = e >>> 0, Be(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && We(e, this.length - 8);
        let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
        return (BigInt(i) << BigInt(32)) + BigInt(s);
    }, "readBigUInt64BE"));
    f.prototype.readIntLE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || N(e, t, this.length);
        let i = this[e], s = 1, o = 0;
        for(; ++o < t && (s *= 256);)i += this[e + o] * s;
        return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
    }, "readIntLE");
    f.prototype.readIntBE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || N(e, t, this.length);
        let i = t, s = 1, o = this[e + --i];
        for(; i > 0 && (s *= 256);)o += this[e + --i] * s;
        return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
    }, "readIntBE");
    f.prototype.readInt8 = a(function(e, t) {
        return e = e >>> 0, t || N(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
    }, "readInt8");
    f.prototype.readInt16LE = a(function(e, t) {
        e = e >>> 0, t || N(e, 2, this.length);
        let n = this[e] | this[e + 1] << 8;
        return n & 32768 ? n | 4294901760 : n;
    }, "readInt16LE");
    f.prototype.readInt16BE = a(function(e, t) {
        e = e >>> 0, t || N(e, 2, this.length);
        let n = this[e + 1] | this[e] << 8;
        return n & 32768 ? n | 4294901760 : n;
    }, "readInt16BE");
    f.prototype.readInt32LE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
    }, "readInt32LE");
    f.prototype.readInt32BE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
    }, "readInt32BE");
    f.prototype.readBigInt64LE = me(a(function(e) {
        e = e >>> 0, Be(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && We(e, this.length - 8);
        let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
        return (BigInt(i) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
    }, "readBigInt64LE"));
    f.prototype.readBigInt64BE = me(a(function(e) {
        e = e >>> 0, Be(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && We(e, this.length - 8);
        let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
        return (BigInt(i) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n);
    }, "readBigInt64BE"));
    f.prototype.readFloatLE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), Pe.read(this, e, !0, 23, 4);
    }, "readFloatLE");
    f.prototype.readFloatBE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 4, this.length), Pe.read(this, e, !1, 23, 4);
    }, "readFloatBE");
    f.prototype.readDoubleLE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 8, this.length), Pe.read(this, e, !0, 52, 8);
    }, "readDoubleLE");
    f.prototype.readDoubleBE = a(function(e, t) {
        return e = e >>> 0, t || N(e, 8, this.length), Pe.read(this, e, !1, 52, 8);
    }, "readDoubleBE");
    function Y(r, e, t, n, i, s) {
        if (!f.isBuffer(r)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (e > i || e < s) throw new RangeError('"value" argument is out of bounds');
        if (t + n > r.length) throw new RangeError("Index out of range");
    }
    a(Y, "checkInt");
    f.prototype.writeUintLE = f.prototype.writeUIntLE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
            let u = Math.pow(2, 8 * n) - 1;
            Y(this, e, t, n, u, 0);
        }
        let s = 1, o = 0;
        for(this[t] = e & 255; ++o < n && (s *= 256);)this[t + o] = e / s & 255;
        return t + n;
    }, "writeUIntLE");
    f.prototype.writeUintBE = f.prototype.writeUIntBE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
            let u = Math.pow(2, 8 * n) - 1;
            Y(this, e, t, n, u, 0);
        }
        let s = n - 1, o = 1;
        for(this[t + s] = e & 255; --s >= 0 && (o *= 256);)this[t + s] = e / o & 255;
        return t + n;
    }, "writeUIntBE");
    f.prototype.writeUint8 = f.prototype.writeUInt8 = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
    }, "writeUInt8");
    f.prototype.writeUint16LE = f.prototype.writeUInt16LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
    }, "writeUInt16LE");
    f.prototype.writeUint16BE = f.prototype.writeUInt16BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
    }, "writeUInt16BE");
    f.prototype.writeUint32LE = f.prototype.writeUInt32LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
    }, "writeUInt32LE");
    f.prototype.writeUint32BE = f.prototype.writeUInt32BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
    }, "writeUInt32BE");
    function Qn(r, e, t, n, i) {
        $n(e, n, i, r, t, 7);
        let s = Number(e & BigInt(4294967295));
        r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
        let o = Number(e >> BigInt(32) & BigInt(4294967295));
        return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
    }
    a(Qn, "wrtBigUInt64LE");
    function jn(r, e, t, n, i) {
        $n(e, n, i, r, t, 7);
        let s = Number(e & BigInt(4294967295));
        r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
        let o = Number(e >> BigInt(32) & BigInt(4294967295));
        return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
    }
    a(jn, "wrtBigUInt64BE");
    f.prototype.writeBigUInt64LE = me(a(function(e, t = 0) {
        return Qn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }, "writeBigUInt64LE"));
    f.prototype.writeBigUInt64BE = me(a(function(e, t = 0) {
        return jn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }, "writeBigUInt64BE"));
    f.prototype.writeIntLE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, !i) {
            let c = Math.pow(2, 8 * n - 1);
            Y(this, e, t, n, c - 1, -c);
        }
        let s = 0, o = 1, u = 0;
        for(this[t] = e & 255; ++s < n && (o *= 256);)e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
        return t + n;
    }, "writeIntLE");
    f.prototype.writeIntBE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, !i) {
            let c = Math.pow(2, 8 * n - 1);
            Y(this, e, t, n, c - 1, -c);
        }
        let s = n - 1, o = 1, u = 0;
        for(this[t + s] = e & 255; --s >= 0 && (o *= 256);)e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
        return t + n;
    }, "writeIntBE");
    f.prototype.writeInt8 = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
    }, "writeInt8");
    f.prototype.writeInt16LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
    }, "writeInt16LE");
    f.prototype.writeInt16BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
    }, "writeInt16BE");
    f.prototype.writeInt32LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
    }, "writeInt32LE");
    f.prototype.writeInt32BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || Y(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
    }, "writeInt32BE");
    f.prototype.writeBigInt64LE = me(a(function(e, t = 0) {
        return Qn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64LE"));
    f.prototype.writeBigInt64BE = me(a(function(e, t = 0) {
        return jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE"));
    function Wn(r, e, t, n, i, s) {
        if (t + n > r.length) throw new RangeError("Index out of range");
        if (t < 0) throw new RangeError("Index out of range");
    }
    a(Wn, "checkIEEE754");
    function Hn(r, e, t, n, i) {
        return e = +e, t = t >>> 0, i || Wn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(r, e, t, n, 23, 4), t + 4;
    }
    a(Hn, "writeFloat");
    f.prototype.writeFloatLE = a(function(e, t, n) {
        return Hn(this, e, t, !0, n);
    }, "writeFloatLE");
    f.prototype.writeFloatBE = a(function(e, t, n) {
        return Hn(this, e, t, !1, n);
    }, "writeFloatBE");
    function Gn(r, e, t, n, i) {
        return e = +e, t = t >>> 0, i || Wn(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Pe.write(r, e, t, n, 52, 8), t + 8;
    }
    a(Gn, "writeDouble");
    f.prototype.writeDoubleLE = a(function(e, t, n) {
        return Gn(this, e, t, !0, n);
    }, "writeDoubleLE");
    f.prototype.writeDoubleBE = a(function(e, t, n) {
        return Gn(this, e, t, !1, n);
    }, "writeDoubleBE");
    f.prototype.copy = a(function(e, t, n, i) {
        if (!f.isBuffer(e)) throw new TypeError("argument should be a Buffer");
        if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0) return 0;
        if (t < 0) throw new RangeError("targetStart out of bounds");
        if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
        if (i < 0) throw new RangeError("sourceEnd out of bounds");
        i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
        let s = i - n;
        return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
    }, "copy");
    f.prototype.fill = a(function(e, t, n, i) {
        if (typeof e == "string") {
            if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
            if (typeof i == "string" && !f.isEncoding(i)) throw new TypeError("Unknown encoding: " + i);
            if (e.length === 1) {
                let o = e.charCodeAt(0);
                (i === "utf8" && o < 128 || i === "latin1") && (e = o);
            }
        } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
        if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
        if (n <= t) return this;
        t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
        let s;
        if (typeof e == "number") for(s = t; s < n; ++s)this[s] = e;
        else {
            let o = f.isBuffer(e) ? e : f.from(e, i), u = o.length;
            if (u === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
            for(s = 0; s < n - t; ++s)this[s + t] = o[s % u];
        }
        return this;
    }, "fill");
    var Ie = {};
    function qt(r, e, t) {
        var n;
        Ie[r] = (n = class extends t {
            constructor(){
                super(), Object.defineProperty(this, "message", {
                    value: e.apply(this, arguments),
                    writable: !0,
                    configurable: !0
                }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
            }
            get code() {
                return r;
            }
            set code(s) {
                Object.defineProperty(this, "code", {
                    configurable: !0,
                    enumerable: !0,
                    value: s,
                    writable: !0
                });
            }
            toString() {
                return `${this.name} [${r}]: ${this.message}`;
            }
        }, a(n, "NodeError"), n);
    }
    a(qt, "E");
    qt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
        return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    }, RangeError);
    qt("ERR_INVALID_ARG_TYPE", function(r, e) {
        return `The "${r}" argum\
ent must be of type number. Received type ${typeof e}`;
    }, TypeError);
    qt("ERR_OUT_OF_RANGE", function(r, e, t) {
        let n = `The value of "${r}" is out of range.`, i = t;
        return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = Dn(String(t)) : typeof t == "bigint" && (i = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = Dn(i)), i += "n"), n += ` It\
 must be ${e}. Received ${i}`, n;
    }, RangeError);
    function Dn(r) {
        let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
        for(; t >= n + 4; t -= 3)e = `_${r.slice(t - 3, t)}${e}`;
        return `${r.slice(0, t)}${e}`;
    }
    a(Dn, "addNumericalSeparator");
    function ko(r, e, t) {
        Be(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && We(e, r.length - (t + 1));
    }
    a(ko, "checkBounds");
    function $n(r, e, t, n, i, s) {
        if (r > t || r < e) {
            let o = typeof e == "bigint" ? "n" : "", u;
            throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and \
< 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Ie.ERR_OUT_OF_RANGE("value", u, r);
        }
        ko(n, i, s);
    }
    a($n, "checkIntBI");
    function Be(r, e) {
        if (typeof r != "number") throw new Ie.ERR_INVALID_ARG_TYPE(e, "number", r);
    }
    a(Be, "validateNumber");
    function We(r, e, t) {
        throw Math.floor(r) !== r ? (Be(r, t), new Ie.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Ie.ERR_BUFFER_OUT_OF_BOUNDS : new Ie.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
    }
    a(We, "boundsError");
    var Uo = /[^+/0-9A-Za-z-_]/g;
    function Oo(r) {
        if (r = r.split("=")[0], r = r.trim().replace(Uo, ""), r.length < 2) return "";
        for(; r.length % 4 !== 0;)r = r + "=";
        return r;
    }
    a(Oo, "base64clean");
    function Ut(r, e) {
        e = e || 1 / 0;
        let t, n = r.length, i = null, s = [];
        for(let o = 0; o < n; ++o){
            if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
                if (!i) {
                    if (t > 56319) {
                        (e -= 3) > -1 && s.push(239, 191, 189);
                        continue;
                    } else if (o + 1 === n) {
                        (e -= 3) > -1 && s.push(239, 191, 189);
                        continue;
                    }
                    i = t;
                    continue;
                }
                if (t < 56320) {
                    (e -= 3) > -1 && s.push(239, 191, 189), i = t;
                    continue;
                }
                t = (i - 55296 << 10 | t - 56320) + 65536;
            } else i && (e -= 3) > -1 && s.push(239, 191, 189);
            if (i = null, t < 128) {
                if ((e -= 1) < 0) break;
                s.push(t);
            } else if (t < 2048) {
                if ((e -= 2) < 0) break;
                s.push(t >> 6 | 192, t & 63 | 128);
            } else if (t < 65536) {
                if ((e -= 3) < 0) break;
                s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
            } else if (t < 1114112) {
                if ((e -= 4) < 0) break;
                s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
            } else throw new Error("Invalid code point");
        }
        return s;
    }
    a(Ut, "utf8ToBytes");
    function No(r) {
        let e = [];
        for(let t = 0; t < r.length; ++t)e.push(r.charCodeAt(t) & 255);
        return e;
    }
    a(No, "asciiToBytes");
    function qo(r, e) {
        let t, n, i, s = [];
        for(let o = 0; o < r.length && !((e -= 2) < 0); ++o)t = r.charCodeAt(o), n = t >> 8, i = t % 256, s.push(i), s.push(n);
        return s;
    }
    a(qo, "utf16leToBytes");
    function Vn(r) {
        return Mt.toByteArray(Oo(r));
    }
    a(Vn, "base64ToBytes");
    function at(r, e, t, n) {
        let i;
        for(i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)e[i + t] = r[i];
        return i;
    }
    a(at, "blitBuffer");
    function ue(r, e) {
        return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
    }
    a(ue, "isInstance");
    function Qt(r) {
        return r !== r;
    }
    a(Qt, "numberIsNaN");
    var Qo = function() {
        let r = "0123456789abcdef", e = new Array(256);
        for(let t = 0; t < 16; ++t){
            let n = t * 16;
            for(let i = 0; i < 16; ++i)e[n + i] = r[t] + r[i];
        }
        return e;
    }();
    function me(r) {
        return typeof BigInt > "u" ? jo : r;
    }
    a(me, "defineBigIntMethod");
    function jo() {
        throw new Error("BigInt not supported");
    }
    a(jo, "BufferBigIntNotDefined");
});
var S, x, E, w, y, m, p = z(()=>{
    "use strict";
    S = globalThis, x = globalThis.setImmediate ?? ((r)=>setTimeout(r, 0)), E = globalThis.clearImmediate ?? ((r)=>clearTimeout(r)), w = globalThis.crypto ?? {};
    w.subtle ?? (w.subtle = {});
    y = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : Kn().Buffer, m = globalThis.process ?? {};
    m.env ?? (m.env = {});
    try {
        m.nextTick(()=>{});
    } catch  {
        let e = Promise.resolve();
        m.nextTick = e.then.bind(e);
    }
});
var ge = I((nh, jt)=>{
    "use strict";
    p();
    var Re = typeof Reflect == "object" ? Reflect : null, zn = Re && typeof Re.apply == "function" ? Re.apply : a(function(e, t, n) {
        return Function.prototype.apply.call(e, t, n);
    }, "ReflectApply"), ut;
    Re && typeof Re.ownKeys == "function" ? ut = Re.ownKeys : Object.getOwnPropertySymbols ? ut = a(function(e) {
        return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
    }, "ReflectOwnKeys") : ut = a(function(e) {
        return Object.getOwnPropertyNames(e);
    }, "ReflectOwnKeys");
    function Wo(r) {
        console && console.warn && console.warn(r);
    }
    a(Wo, "ProcessEmitWarning");
    var Zn = Number.isNaN || a(function(e) {
        return e !== e;
    }, "NumberIsNaN");
    function L() {
        L.init.call(this);
    }
    a(L, "EventEmitter");
    jt.exports = L;
    jt.exports.once = Vo;
    L.EventEmitter = L;
    L.prototype._events = void 0;
    L.prototype._eventsCount = 0;
    L.prototype._maxListeners = void 0;
    var Yn = 10;
    function ct(r) {
        if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
    }
    a(ct, "checkListener");
    Object.defineProperty(L, "defaultMaxListeners", {
        enumerable: !0,
        get: a(function() {
            return Yn;
        }, "get"),
        set: a(function(r) {
            if (typeof r != "number" || r < 0 || Zn(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
            Yn = r;
        }, "set")
    });
    L.init = function() {
        (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
    };
    L.prototype.setMaxListeners = a(function(e) {
        if (typeof e != "number" || e < 0 || Zn(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
        return this._maxListeners = e, this;
    }, "setMaxListeners");
    function Jn(r) {
        return r._maxListeners === void 0 ? L.defaultMaxListeners : r._maxListeners;
    }
    a(Jn, "_getMaxListeners");
    L.prototype.getMaxListeners = a(function() {
        return Jn(this);
    }, "getMaxListeners");
    L.prototype.emit = a(function(e) {
        for(var t = [], n = 1; n < arguments.length; n++)t.push(arguments[n]);
        var i = e === "error", s = this._events;
        if (s !== void 0) i = i && s.error === void 0;
        else if (!i) return !1;
        if (i) {
            var o;
            if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
            var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
            throw u.context = o, u;
        }
        var c = s[e];
        if (c === void 0) return !1;
        if (typeof c == "function") zn(c, this, t);
        else for(var h = c.length, l = ni(c, h), n = 0; n < h; ++n)zn(l[n], this, t);
        return !0;
    }, "emit");
    function Xn(r, e, t, n) {
        var i, s, o;
        if (ct(t), s = r._events, s === void 0 ? (s = r._events = Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
        else if (typeof o == "function" ? o = s[e] = n ? [
            t,
            o
        ] : [
            o,
            t
        ] : n ? o.unshift(t) : o.push(t), i = Jn(r), i > 0 && o.length > i && !o.warned) {
            o.warned = !0;
            var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, Wo(u);
        }
        return r;
    }
    a(Xn, "_addListener");
    L.prototype.addListener = a(function(e, t) {
        return Xn(this, e, t, !1);
    }, "addListener");
    L.prototype.on = L.prototype.addListener;
    L.prototype.prependListener = a(function(e, t) {
        return Xn(this, e, t, !0);
    }, "prependListener");
    function Ho() {
        if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
    }
    a(Ho, "onceWrapper");
    function ei(r, e, t) {
        var n = {
            fired: !1,
            wrapFn: void 0,
            target: r,
            type: e,
            listener: t
        }, i = Ho.bind(n);
        return i.listener = t, n.wrapFn = i, i;
    }
    a(ei, "_onceWrap");
    L.prototype.once = a(function(e, t) {
        return ct(t), this.on(e, ei(this, e, t)), this;
    }, "once");
    L.prototype.prependOnceListener = a(function(e, t) {
        return ct(t), this.prependListener(e, ei(this, e, t)), this;
    }, "prependOnceListener");
    L.prototype.removeListener = a(function(e, t) {
        var n, i, s, o, u;
        if (ct(t), i = this._events, i === void 0) return this;
        if (n = i[e], n === void 0) return this;
        if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
        else if (typeof n != "function") {
            for(s = -1, o = n.length - 1; o >= 0; o--)if (n[o] === t || n[o].listener === t) {
                u = n[o].listener, s = o;
                break;
            }
            if (s < 0) return this;
            s === 0 ? n.shift() : Go(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
        }
        return this;
    }, "removeListener");
    L.prototype.off = L.prototype.removeListener;
    L.prototype.removeAllListeners = a(function(e) {
        var t, n, i;
        if (n = this._events, n === void 0) return this;
        if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete n[e]), this;
        if (arguments.length === 0) {
            var s = Object.keys(n), o;
            for(i = 0; i < s.length; ++i)o = s[i], o !== "removeListener" && this.removeAllListeners(o);
            return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this;
        }
        if (t = n[e], typeof t == "function") this.removeListener(e, t);
        else if (t !== void 0) for(i = t.length - 1; i >= 0; i--)this.removeListener(e, t[i]);
        return this;
    }, "removeAllListeners");
    function ti(r, e, t) {
        var n = r._events;
        if (n === void 0) return [];
        var i = n[e];
        return i === void 0 ? [] : typeof i == "function" ? t ? [
            i.listener || i
        ] : [
            i
        ] : t ? $o(i) : ni(i, i.length);
    }
    a(ti, "_listeners");
    L.prototype.listeners = a(function(e) {
        return ti(this, e, !0);
    }, "listeners");
    L.prototype.rawListeners = a(function(e) {
        return ti(this, e, !1);
    }, "rawListeners");
    L.listenerCount = function(r, e) {
        return typeof r.listenerCount == "function" ? r.listenerCount(e) : ri.call(r, e);
    };
    L.prototype.listenerCount = ri;
    function ri(r) {
        var e = this._events;
        if (e !== void 0) {
            var t = e[r];
            if (typeof t == "function") return 1;
            if (t !== void 0) return t.length;
        }
        return 0;
    }
    a(ri, "listenerCount");
    L.prototype.eventNames = a(function() {
        return this._eventsCount > 0 ? ut(this._events) : [];
    }, "eventNames");
    function ni(r, e) {
        for(var t = new Array(e), n = 0; n < e; ++n)t[n] = r[n];
        return t;
    }
    a(ni, "arrayClone");
    function Go(r, e) {
        for(; e + 1 < r.length; e++)r[e] = r[e + 1];
        r.pop();
    }
    a(Go, "spliceOne");
    function $o(r) {
        for(var e = new Array(r.length), t = 0; t < e.length; ++t)e[t] = r[t].listener || r[t];
        return e;
    }
    a($o, "unwrapListeners");
    function Vo(r, e) {
        return new Promise(function(t, n) {
            function i(o) {
                r.removeListener(e, s), n(o);
            }
            a(i, "errorListener");
            function s() {
                typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
            }
            a(s, "resolver"), ii(r, e, s, {
                once: !0
            }), e !== "error" && Ko(r, i, {
                once: !0
            });
        });
    }
    a(Vo, "once");
    function Ko(r, e, t) {
        typeof r.on == "function" && ii(r, "error", e, t);
    }
    a(Ko, "addErrorHandlerIfEventEmitter");
    function ii(r, e, t, n) {
        if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
        else if (typeof r.addEventListener == "function") r.addEventListener(e, a(function i(s) {
            n.once && r.removeEventListener(e, i), t(s);
        }, "wrapListener"));
        else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
    }
    a(ii, "eventTargetAgnosticAddListener");
});
var He = {};
se(He, {
    default: ()=>zo
});
var zo, Ge = z(()=>{
    "use strict";
    p();
    zo = {};
});
function $e(r) {
    let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, h = 0, l = 0, d = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
    ], b = a((A, g)=>A >>> g | A << 32 - g, "rrot"), C = new Uint32Array(64), B = new Uint8Array(64), Q = a(()=>{
        for(let R = 0, $ = 0; R < 16; R++, $ += 4)C[R] = B[$] << 24 | B[$ + 1] << 16 | B[$ + 2] << 8 | B[$ + 3];
        for(let R = 16; R < 64; R++){
            let $ = b(C[R - 15], 7) ^ b(C[R - 15], 18) ^ C[R - 15] >>> 3, ce = b(C[R - 2], 17) ^ b(C[R - 2], 19) ^ C[R - 2] >>> 10;
            C[R] = C[R - 16] + $ + C[R - 7] + ce | 0;
        }
        let A = e, g = t, P = n, K = i, k = s, j = o, ee = u, oe = c;
        for(let R = 0; R < 64; R++){
            let $ = b(k, 6) ^ b(k, 11) ^ b(k, 25), ce = k & j ^ ~k & ee, ye = oe + $ + ce + d[R] + C[R] | 0, Se = b(A, 2) ^ b(A, 13) ^ b(A, 22), je = A & g ^ A & P ^ g & P, he = Se + je | 0;
            oe = ee, ee = j, j = k, k = K + ye | 0, K = P, P = g, g = A, A = ye + he | 0;
        }
        e = e + A | 0, t = t + g | 0, n = n + P | 0, i = i + K | 0, s = s + k | 0, o = o + j | 0, u = u + ee | 0, c = c + oe | 0, l = 0;
    }, "process"), X = a((A)=>{
        typeof A == "string" && (A = new TextEncoder().encode(A));
        for(let g = 0; g < A.length; g++)B[l++] = A[g], l === 64 && Q();
        h += A.length;
    }, "add"), de = a(()=>{
        if (B[l++] = 128, l == 64 && Q(), l + 8 > 64) {
            for(; l < 64;)B[l++] = 0;
            Q();
        }
        for(; l < 58;)B[l++] = 0;
        let A = h * 8;
        B[l++] = A / 1099511627776 & 255, B[l++] = A / 4294967296 & 255, B[l++] = A >>> 24, B[l++] = A >>> 16 & 255, B[l++] = A >>> 8 & 255, B[l++] = A & 255, Q();
        let g = new Uint8Array(32);
        return g[0] = e >>> 24, g[1] = e >>> 16 & 255, g[2] = e >>> 8 & 255, g[3] = e & 255, g[4] = t >>> 24, g[5] = t >>> 16 & 255, g[6] = t >>> 8 & 255, g[7] = t & 255, g[8] = n >>> 24, g[9] = n >>> 16 & 255, g[10] = n >>> 8 & 255, g[11] = n & 255, g[12] = i >>> 24, g[13] = i >>> 16 & 255, g[14] = i >>> 8 & 255, g[15] = i & 255, g[16] = s >>> 24, g[17] = s >>> 16 & 255, g[18] = s >>> 8 & 255, g[19] = s & 255, g[20] = o >>> 24, g[21] = o >>> 16 & 255, g[22] = o >>> 8 & 255, g[23] = o & 255, g[24] = u >>> 24, g[25] = u >>> 16 & 255, g[26] = u >>> 8 & 255, g[27] = u & 255, g[28] = c >>> 24, g[29] = c >>> 16 & 255, g[30] = c >>> 8 & 255, g[31] = c & 255, g;
    }, "digest");
    return r === void 0 ? {
        add: X,
        digest: de
    } : (X(r), de());
}
var si = z(()=>{
    "use strict";
    p();
    a($e, "sha256");
});
var U, Ve, oi = z(()=>{
    "use strict";
    p();
    U = class U {
        constructor(){
            _(this, "_dataLength", 0);
            _(this, "_bufferLength", 0);
            _(this, "_state", new Int32Array(4));
            _(this, "_buffer", new ArrayBuffer(68));
            _(this, "_buffer8");
            _(this, "_buffer32");
            this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
        }
        static hashByteArray(e, t = !1) {
            return this.onePassHasher.start().appendByteArray(e).end(t);
        }
        static hashStr(e, t = !1) {
            return this.onePassHasher.start().appendStr(e).end(t);
        }
        static hashAsciiStr(e, t = !1) {
            return this.onePassHasher.start().appendAsciiStr(e).end(t);
        }
        static _hex(e) {
            let t = U.hexChars, n = U.hexOut, i, s, o, u;
            for(u = 0; u < 4; u += 1)for(s = u * 8, i = e[u], o = 0; o < 8; o += 2)n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(i & 15), i >>>= 4;
            return n.join("");
        }
        static _md5cycle(e, t) {
            let n = e[0], i = e[1], s = e[2], o = e[3];
            n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
        }
        start() {
            return this._dataLength = 0, this._bufferLength = 0, this._state.set(U.stateIdentity), this;
        }
        appendStr(e) {
            let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
            for(o = 0; o < e.length; o += 1){
                if (s = e.charCodeAt(o), s < 128) t[i++] = s;
                else if (s < 2048) t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
                else if (s < 55296 || s > 56319) t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
                else {
                    if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error("Unicode standard supports code points up to U+10FFFF");
                    t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
                }
                i >= 64 && (this._dataLength += 64, U._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
            }
            return this._bufferLength = i, this;
        }
        appendAsciiStr(e) {
            let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
            for(;;){
                for(s = Math.min(e.length - o, 64 - i); s--;)t[i++] = e.charCodeAt(o++);
                if (i < 64) break;
                this._dataLength += 64, U._md5cycle(this._state, n), i = 0;
            }
            return this._bufferLength = i, this;
        }
        appendByteArray(e) {
            let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
            for(;;){
                for(s = Math.min(e.length - o, 64 - i); s--;)t[i++] = e[o++];
                if (i < 64) break;
                this._dataLength += 64, U._md5cycle(this._state, n), i = 0;
            }
            return this._bufferLength = i, this;
        }
        getState() {
            let e = this._state;
            return {
                buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)),
                buflen: this._bufferLength,
                length: this._dataLength,
                state: [
                    e[0],
                    e[1],
                    e[2],
                    e[3]
                ]
            };
        }
        setState(e) {
            let t = e.buffer, n = e.state, i = this._state, s;
            for(this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1)this._buffer8[s] = t.charCodeAt(s);
        }
        end(e = !1) {
            let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
            this._dataLength += t;
            let o = this._dataLength * 8;
            if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U.buffer32Identity.subarray(s), s), t > 55 && (U._md5cycle(this._state, i), i.set(U.buffer32Identity)), o <= 4294967295) i[14] = o;
            else {
                let u = o.toString(16).match(/(.*?)(.{0,8})$/);
                if (u === null) return;
                let c = parseInt(u[2], 16), h = parseInt(u[1], 16) || 0;
                i[14] = c, i[15] = h;
            }
            return U._md5cycle(this._state, i), e ? this._state : U._hex(this._state);
        }
    };
    a(U, "Md5"), _(U, "stateIdentity", new Int32Array([
        1732584193,
        -271733879,
        -1732584194,
        271733878
    ])), _(U, "buffer32Identity", new Int32Array([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ])), _(U, "hexChars", "0123456789abcdef"), _(U, "hexOut", []), _(U, "onePassHasher", new U);
    Ve = U;
});
var Wt = {};
se(Wt, {
    createHash: ()=>Zo,
    createHmac: ()=>Jo,
    randomBytes: ()=>Yo
});
function Yo(r) {
    return w.getRandomValues(y.alloc(r));
}
function Zo(r) {
    if (r === "sha256") return {
        update: a(function(e) {
            return {
                digest: a(function() {
                    return y.from($e(e));
                }, "digest")
            };
        }, "update")
    };
    if (r === "md5") return {
        update: a(function(e) {
            return {
                digest: a(function() {
                    return typeof e == "string" ? Ve.hashStr(e) : Ve.hashByteArray(e);
                }, "digest")
            };
        }, "update")
    };
    throw new Error(`Hash type '${r}' not supported`);
}
function Jo(r, e) {
    if (r !== "sha256") throw new Error(`Only sha256 is supported (requested: '${r}')`);
    return {
        update: a(function(t) {
            return {
                digest: a(function() {
                    typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(t));
                    let n = e.length;
                    if (n > 64) e = $e(e);
                    else if (n < 64) {
                        let c = new Uint8Array(64);
                        c.set(e), e = c;
                    }
                    let i = new Uint8Array(64), s = new Uint8Array(64);
                    for(let c = 0; c < 64; c++)i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
                    let o = new Uint8Array(t.length + 64);
                    o.set(i, 0), o.set(t, 64);
                    let u = new Uint8Array(96);
                    return u.set(s, 0), u.set($e(o), 64), y.from($e(u));
                }, "digest")
            };
        }, "update")
    };
}
var Ht = z(()=>{
    "use strict";
    p();
    si();
    oi();
    a(Yo, "randomBytes");
    a(Zo, "createHash");
    a(Jo, "createHmac");
});
var $t = I((ai)=>{
    "use strict";
    p();
    ai.parse = function(r, e) {
        return new Gt(r, e).parse();
    };
    var ht = class ht {
        constructor(e, t){
            this.source = e, this.transform = t || Xo, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
        }
        isEof() {
            return this.position >= this.source.length;
        }
        nextCharacter() {
            var e = this.source[this.position++];
            return e === "\\" ? {
                value: this.source[this.position++],
                escaped: !0
            } : {
                value: e,
                escaped: !1
            };
        }
        record(e) {
            this.recorded.push(e);
        }
        newEntry(e) {
            var t;
            (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
        }
        consumeDimensions() {
            if (this.source[0] === "[") for(; !this.isEof();){
                var e = this.nextCharacter();
                if (e.value === "=") break;
            }
        }
        parse(e) {
            var t, n, i;
            for(this.consumeDimensions(); !this.isEof();)if (t = this.nextCharacter(), t.value === "{" && !i) this.dimension++, this.dimension > 1 && (n = new ht(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(!0)), this.position += n.position - 2);
            else if (t.value === "}" && !i) {
                if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
            } else t.value === '"' && !t.escaped ? (i && this.newEntry(!0), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
            if (this.dimension !== 0) throw new Error("array dimension not balanced");
            return this.entries;
        }
    };
    a(ht, "ArrayParser");
    var Gt = ht;
    function Xo(r) {
        return r;
    }
    a(Xo, "identity");
});
var Vt = I((Sh, ui)=>{
    p();
    var ea = $t();
    ui.exports = {
        create: a(function(r, e) {
            return {
                parse: a(function() {
                    return ea.parse(r, e);
                }, "parse")
            };
        }, "create")
    };
});
var li = I((vh, hi)=>{
    "use strict";
    p();
    var ta = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, ra = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, na = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, ia = /^-?infinity$/;
    hi.exports = a(function(e) {
        if (ia.test(e)) return Number(e.replace("i", "I"));
        var t = ta.exec(e);
        if (!t) return sa(e) || null;
        var n = !!t[8], i = parseInt(t[1], 10);
        n && (i = ci(i));
        var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(t[4], 10), c = parseInt(t[5], 10), h = parseInt(t[6], 10), l = t[7];
        l = l ? 1e3 * parseFloat(l) : 0;
        var d, b = oa(e);
        return b != null ? (d = new Date(Date.UTC(i, s, o, u, c, h, l)), Kt(i) && d.setUTCFullYear(i), b !== 0 && d.setTime(d.getTime() - b)) : (d = new Date(i, s, o, u, c, h, l), Kt(i) && d.setFullYear(i)), d;
    }, "parseDate");
    function sa(r) {
        var e = ra.exec(r);
        if (e) {
            var t = parseInt(e[1], 10), n = !!e[4];
            n && (t = ci(t));
            var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
            return Kt(t) && o.setFullYear(t), o;
        }
    }
    a(sa, "getDate");
    function oa(r) {
        if (r.endsWith("+00")) return 0;
        var e = na.exec(r.split(" ")[1]);
        if (e) {
            var t = e[1];
            if (t === "Z") return 0;
            var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(e[3] || 0, 10) * 60 + parseInt(e[4] || 0, 10);
            return i * n * 1e3;
        }
    }
    a(oa, "timeZoneOffset");
    function ci(r) {
        return -(r - 1);
    }
    a(ci, "bcYearToNegativeYear");
    function Kt(r) {
        return r >= 0 && r < 100;
    }
    a(Kt, "is0To99");
});
var pi = I((Ch, fi)=>{
    p();
    fi.exports = ua;
    var aa = Object.prototype.hasOwnProperty;
    function ua(r) {
        for(var e = 1; e < arguments.length; e++){
            var t = arguments[e];
            for(var n in t)aa.call(t, n) && (r[n] = t[n]);
        }
        return r;
    }
    a(ua, "extend");
});
var mi = I((Ph, yi)=>{
    "use strict";
    p();
    var ca = pi();
    yi.exports = Fe;
    function Fe(r) {
        if (!(this instanceof Fe)) return new Fe(r);
        ca(this, xa(r));
    }
    a(Fe, "PostgresInterval");
    var ha = [
        "seconds",
        "minutes",
        "hours",
        "days",
        "months",
        "years"
    ];
    Fe.prototype.toPostgres = function() {
        var r = ha.filter(this.hasOwnProperty, this);
        return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
            var t = this[e] || 0;
            return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "")), t + " " + e;
        }, this).join(" ");
    };
    var la = {
        years: "Y",
        months: "M",
        days: "D",
        hours: "H",
        minutes: "M",
        seconds: "S"
    }, fa = [
        "years",
        "months",
        "days"
    ], pa = [
        "hours",
        "minutes",
        "seconds"
    ];
    Fe.prototype.toISOString = Fe.prototype.toISO = function() {
        var r = fa.map(t, this).join(""), e = pa.map(t, this).join("");
        return "P" + r + "T" + e;
        function t(n) {
            var i = this[n] || 0;
            return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "")), i + la[n];
        }
    };
    var zt = "([+-]?\\d+)", da = zt + "\\s+years?", ya = zt + "\\s+mons?", ma = zt + "\\s+days?", ga = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", wa = new RegExp([
        da,
        ya,
        ma,
        ga
    ].map(function(r) {
        return "(" + r + ")?";
    }).join("\\s*")), di = {
        years: 2,
        months: 4,
        days: 6,
        hours: 9,
        minutes: 10,
        seconds: 11,
        milliseconds: 12
    }, ba = [
        "hours",
        "minutes",
        "seconds",
        "milliseconds"
    ];
    function Sa(r) {
        var e = r + "000000".slice(r.length);
        return parseInt(e, 10) / 1e3;
    }
    a(Sa, "parseMilliseconds");
    function xa(r) {
        if (!r) return {};
        var e = wa.exec(r), t = e[8] === "-";
        return Object.keys(di).reduce(function(n, i) {
            var s = di[i], o = e[s];
            return !o || (o = i === "milliseconds" ? Sa(o) : parseInt(o, 10), !o) || (t && ~ba.indexOf(i) && (o *= -1), n[i] = o), n;
        }, {});
    }
    a(xa, "parse");
});
var wi = I((Rh, gi)=>{
    "use strict";
    p();
    gi.exports = a(function(e) {
        if (/^\\x/.test(e)) return new y(e.substr(2), "hex");
        for(var t = "", n = 0; n < e.length;)if (e[n] !== "\\") t += e[n], ++n;
        else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
        else {
            for(var i = 1; n + i < e.length && e[n + i] === "\\";)i++;
            for(var s = 0; s < Math.floor(i / 2); ++s)t += "\\";
            n += Math.floor(i / 2) * 2;
        }
        return new y(t, "binary");
    }, "parseBytea");
});
var Ai = I((Dh, _i)=>{
    p();
    var Ke = $t(), ze = Vt(), lt = li(), Si = mi(), xi = wi();
    function ft(r) {
        return a(function(t) {
            return t === null ? t : r(t);
        }, "nullAllowed");
    }
    a(ft, "allowNull");
    function Ei(r) {
        return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
    }
    a(Ei, "parseBool");
    function Ea(r) {
        return r ? Ke.parse(r, Ei) : null;
    }
    a(Ea, "parseBoolArray");
    function va(r) {
        return parseInt(r, 10);
    }
    a(va, "parseBaseTenInt");
    function Yt(r) {
        return r ? Ke.parse(r, ft(va)) : null;
    }
    a(Yt, "parseIntegerArray");
    function _a(r) {
        return r ? Ke.parse(r, ft(function(e) {
            return vi(e).trim();
        })) : null;
    }
    a(_a, "parseBigIntegerArray");
    var Aa = a(function(r) {
        if (!r) return null;
        var e = ze.create(r, function(t) {
            return t !== null && (t = er(t)), t;
        });
        return e.parse();
    }, "parsePointArray"), Zt = a(function(r) {
        if (!r) return null;
        var e = ze.create(r, function(t) {
            return t !== null && (t = parseFloat(t)), t;
        });
        return e.parse();
    }, "parseFloatArray"), ne = a(function(r) {
        if (!r) return null;
        var e = ze.create(r);
        return e.parse();
    }, "parseStringArray"), Jt = a(function(r) {
        if (!r) return null;
        var e = ze.create(r, function(t) {
            return t !== null && (t = lt(t)), t;
        });
        return e.parse();
    }, "parseDateArray"), Ca = a(function(r) {
        if (!r) return null;
        var e = ze.create(r, function(t) {
            return t !== null && (t = Si(t)), t;
        });
        return e.parse();
    }, "parseIntervalArray"), Ta = a(function(r) {
        return r ? Ke.parse(r, ft(xi)) : null;
    }, "parseByteAArray"), Xt = a(function(r) {
        return parseInt(r, 10);
    }, "parseInteger"), vi = a(function(r) {
        var e = String(r);
        return /^\d+$/.test(e) ? e : r;
    }, "parseBigInteger"), bi = a(function(r) {
        return r ? Ke.parse(r, ft(JSON.parse)) : null;
    }, "parseJsonArray"), er = a(function(r) {
        return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), {
            x: parseFloat(r[0]),
            y: parseFloat(r[1])
        });
    }, "parsePoint"), Ia = a(function(r) {
        if (r[0] !== "<" && r[1] !== "(") return null;
        for(var e = "(", t = "", n = !1, i = 2; i < r.length - 1; i++){
            if (n || (e += r[i]), r[i] === ")") {
                n = !0;
                continue;
            } else if (!n) continue;
            r[i] !== "," && (t += r[i]);
        }
        var s = er(e);
        return s.radius = parseFloat(t), s;
    }, "parseCircle"), Pa = a(function(r) {
        r(20, vi), r(21, Xt), r(23, Xt), r(26, Xt), r(700, parseFloat), r(701, parseFloat), r(16, Ei), r(1082, lt), r(1114, lt), r(1184, lt), r(600, er), r(651, ne), r(718, Ia), r(1e3, Ea), r(1001, Ta), r(1005, Yt), r(1007, Yt), r(1028, Yt), r(1016, _a), r(1017, Aa), r(1021, Zt), r(1022, Zt), r(1231, Zt), r(1014, ne), r(1015, ne), r(1008, ne), r(1009, ne), r(1040, ne), r(1041, ne), r(1115, Jt), r(1182, Jt), r(1185, Jt), r(1186, Si), r(1187, Ca), r(17, xi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, bi), r(3807, bi), r(3907, ne), r(2951, ne), r(791, ne), r(1183, ne), r(1270, ne);
    }, "init");
    _i.exports = {
        init: Pa
    };
});
var Ti = I((Oh, Ci)=>{
    "use strict";
    p();
    var Z = 1e6;
    function Ba(r) {
        var e = r.readInt32BE(0), t = r.readUInt32BE(4), n = "";
        e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
        var i = "", s, o, u, c, h, l;
        {
            if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
            for(c = "", h = 6 - u.length, l = 0; l < h; l++)c += "0";
            i = c + u + i;
        }
        {
            if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
            for(c = "", h = 6 - u.length, l = 0; l < h; l++)c += "0";
            i = c + u + i;
        }
        {
            if (s = e % Z, e = e / Z >>> 0, o = 4294967296 * s + t, t = o / Z >>> 0, u = "" + (o - Z * t), t === 0 && e === 0) return n + u + i;
            for(c = "", h = 6 - u.length, l = 0; l < h; l++)c += "0";
            i = c + u + i;
        }
        return s = e % Z, o = 4294967296 * s + t, u = "" + o % Z, n + u + i;
    }
    a(Ba, "readInt8");
    Ci.exports = Ba;
});
var Ri = I((Qh, Li)=>{
    p();
    var La = Ti(), F = a(function(r, e, t, n, i) {
        t = t || 0, n = n || !1, i = i || function(C, B, Q) {
            return C * Math.pow(2, Q) + B;
        };
        var s = t >> 3, o = a(function(C) {
            return n ? ~C & 255 : C;
        }, "inv"), u = 255, c = 8 - t % 8;
        e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
        var h = 0;
        t % 8 + e >= 8 && (h = i(0, o(r[s]) & u, c));
        for(var l = e + t >> 3, d = s + 1; d < l; d++)h = i(h, o(r[d]), 8);
        var b = (e + t) % 8;
        return b > 0 && (h = i(h, o(r[l]) >> 8 - b, b)), h;
    }, "parseBits"), Bi = a(function(r, e, t) {
        var n = Math.pow(2, t - 1) - 1, i = F(r, 1), s = F(r, t, 1);
        if (s === 0) return 0;
        var o = 1, u = a(function(h, l, d) {
            h === 0 && (h = 1);
            for(var b = 1; b <= d; b++)o /= 2, (l & 1 << d - b) > 0 && (h += o);
            return h;
        }, "parsePrecisionBits"), c = F(r, e, t + 1, !1, u);
        return s == Math.pow(2, t + 1) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
    }, "parseFloatFromBits"), Ra = a(function(r) {
        return F(r, 1) == 1 ? -1 * (F(r, 15, 1, !0) + 1) : F(r, 15, 1);
    }, "parseInt16"), Ii = a(function(r) {
        return F(r, 1) == 1 ? -1 * (F(r, 31, 1, !0) + 1) : F(r, 31, 1);
    }, "parseInt32"), Fa = a(function(r) {
        return Bi(r, 23, 8);
    }, "parseFloat32"), Ma = a(function(r) {
        return Bi(r, 52, 11);
    }, "parseFloat64"), Da = a(function(r) {
        var e = F(r, 16, 32);
        if (e == 49152) return NaN;
        for(var t = Math.pow(1e4, F(r, 16, 16)), n = 0, i = [], s = F(r, 16), o = 0; o < s; o++)n += F(r, 16, 64 + 16 * o) * t, t /= 1e4;
        var u = Math.pow(10, F(r, 16, 48));
        return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
    }, "parseNumeric"), Pi = a(function(r, e) {
        var t = F(e, 1), n = F(e, 63, 1), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
        return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
            return this.usec;
        }, i.setMicroSeconds = function(s) {
            this.usec = s;
        }, i.getUTCMicroSeconds = function() {
            return this.usec;
        }, i;
    }, "parseDate"), Ye = a(function(r) {
        for(var e = F(r, 32), t = F(r, 32, 32), n = F(r, 32, 64), i = 96, s = [], o = 0; o < e; o++)s[o] = F(r, 32, i), i += 32, i += 32;
        var u = a(function(h) {
            var l = F(r, 32, i);
            if (i += 32, l == 4294967295) return null;
            var d;
            if (h == 23 || h == 20) return d = F(r, l * 8, i), i += l * 8, d;
            if (h == 25) return d = r.toString(this.encoding, i >> 3, (i += l << 3) >> 3), d;
            console.log("ERROR: ElementType not implemented: " + h);
        }, "parseElement"), c = a(function(h, l) {
            var d = [], b;
            if (h.length > 1) {
                var C = h.shift();
                for(b = 0; b < C; b++)d[b] = c(h, l);
                h.unshift(C);
            } else for(b = 0; b < h[0]; b++)d[b] = u(l);
            return d;
        }, "parse");
        return c(s, n);
    }, "parseArray"), ka = a(function(r) {
        return r.toString("utf8");
    }, "parseText"), Ua = a(function(r) {
        return r === null ? null : F(r, 8) > 0;
    }, "parseBool"), Oa = a(function(r) {
        r(20, La), r(21, Ra), r(23, Ii), r(26, Ii), r(1700, Da), r(700, Fa), r(701, Ma), r(16, Ua), r(1114, Pi.bind(null, !1)), r(1184, Pi.bind(null, !0)), r(1e3, Ye), r(1007, Ye), r(1016, Ye), r(1008, Ye), r(1009, Ye), r(25, ka);
    }, "init");
    Li.exports = {
        init: Oa
    };
});
var Mi = I((Hh, Fi)=>{
    p();
    Fi.exports = {
        BOOL: 16,
        BYTEA: 17,
        CHAR: 18,
        INT8: 20,
        INT2: 21,
        INT4: 23,
        REGPROC: 24,
        TEXT: 25,
        OID: 26,
        TID: 27,
        XID: 28,
        CID: 29,
        JSON: 114,
        XML: 142,
        PG_NODE_TREE: 194,
        SMGR: 210,
        PATH: 602,
        POLYGON: 604,
        CIDR: 650,
        FLOAT4: 700,
        FLOAT8: 701,
        ABSTIME: 702,
        RELTIME: 703,
        TINTERVAL: 704,
        CIRCLE: 718,
        MACADDR8: 774,
        MONEY: 790,
        MACADDR: 829,
        INET: 869,
        ACLITEM: 1033,
        BPCHAR: 1042,
        VARCHAR: 1043,
        DATE: 1082,
        TIME: 1083,
        TIMESTAMP: 1114,
        TIMESTAMPTZ: 1184,
        INTERVAL: 1186,
        TIMETZ: 1266,
        BIT: 1560,
        VARBIT: 1562,
        NUMERIC: 1700,
        REFCURSOR: 1790,
        REGPROCEDURE: 2202,
        REGOPER: 2203,
        REGOPERATOR: 2204,
        REGCLASS: 2205,
        REGTYPE: 2206,
        UUID: 2950,
        TXID_SNAPSHOT: 2970,
        PG_LSN: 3220,
        PG_NDISTINCT: 3361,
        PG_DEPENDENCIES: 3402,
        TSVECTOR: 3614,
        TSQUERY: 3615,
        GTSVECTOR: 3642,
        REGCONFIG: 3734,
        REGDICTIONARY: 3769,
        JSONB: 3802,
        REGNAMESPACE: 4089,
        REGROLE: 4096
    };
});
var Xe = I((Je)=>{
    p();
    var Na = Ai(), qa = Ri(), Qa = Vt(), ja = Mi();
    Je.getTypeParser = Wa;
    Je.setTypeParser = Ha;
    Je.arrayParser = Qa;
    Je.builtins = ja;
    var Ze = {
        text: {},
        binary: {}
    };
    function Di(r) {
        return String(r);
    }
    a(Di, "noParse");
    function Wa(r, e) {
        return e = e || "text", Ze[e] && Ze[e][r] || Di;
    }
    a(Wa, "getTypeParser");
    function Ha(r, e, t) {
        typeof e == "function" && (t = e, e = "text"), Ze[e][r] = t;
    }
    a(Ha, "setTypeParser");
    Na.init(function(r, e) {
        Ze.text[r] = e;
    });
    qa.init(function(r, e) {
        Ze.binary[r] = e;
    });
});
var et = I((zh, tr)=>{
    "use strict";
    p();
    tr.exports = {
        host: "localhost",
        user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
        database: void 0,
        password: null,
        connectionString: void 0,
        port: 5432,
        rows: 0,
        binary: !1,
        max: 10,
        idleTimeoutMillis: 3e4,
        client_encoding: "",
        ssl: !1,
        application_name: void 0,
        fallback_application_name: void 0,
        options: void 0,
        parseInputDatesAsUTC: !1,
        statement_timeout: !1,
        lock_timeout: !1,
        idle_in_transaction_session_timeout: !1,
        query_timeout: !1,
        connect_timeout: 0,
        keepalives: 1,
        keepalives_idle: 0
    };
    var Me = Xe(), Ga = Me.getTypeParser(20, "text"), $a = Me.getTypeParser(1016, "text");
    tr.exports.__defineSetter__("parseInt8", function(r) {
        Me.setTypeParser(20, "text", r ? Me.getTypeParser(23, "text") : Ga), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : $a);
    });
});
var tt = I((Zh, Ui)=>{
    "use strict";
    p();
    var Va = (Ht(), O(Wt)), Ka = et();
    function za(r) {
        var e = r.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return '"' + e + '"';
    }
    a(za, "escapeElement");
    function ki(r) {
        for(var e = "{", t = 0; t < r.length; t++)t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + ki(r[t]) : r[t] instanceof y ? e += "\\\\x" + r[t].toString("hex") : e += za(pt(r[t]));
        return e = e + "}", e;
    }
    a(ki, "arrayString");
    var pt = a(function(r, e) {
        if (r == null) return null;
        if (r instanceof y) return r;
        if (ArrayBuffer.isView(r)) {
            var t = y.from(r.buffer, r.byteOffset, r.byteLength);
            return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
        }
        return r instanceof Date ? Ka.parseInputDatesAsUTC ? Ja(r) : Za(r) : Array.isArray(r) ? ki(r) : typeof r == "object" ? Ya(r, e) : r.toString();
    }, "prepareValue");
    function Ya(r, e) {
        if (r && typeof r.toPostgres == "function") {
            if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
            return e.push(r), pt(r.toPostgres(pt), e);
        }
        return JSON.stringify(r);
    }
    a(Ya, "prepareObject");
    function G(r, e) {
        for(r = "" + r; r.length < e;)r = "0" + r;
        return r;
    }
    a(G, "pad");
    function Za(r) {
        var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
        n && (t = Math.abs(t) + 1);
        var i = G(t, 4) + "-" + G(r.getMonth() + 1, 2) + "-" + G(r.getDate(), 2) + "T" + G(r.getHours(), 2) + ":" + G(r.getMinutes(), 2) + ":" + G(r.getSeconds(), 2) + "." + G(r.getMilliseconds(), 3);
        return e < 0 ? (i += "-", e *= -1) : i += "+", i += G(Math.floor(e / 60), 2) + ":" + G(e % 60, 2), n && (i += " BC"), i;
    }
    a(Za, "dateToString");
    function Ja(r) {
        var e = r.getUTCFullYear(), t = e < 1;
        t && (e = Math.abs(e) + 1);
        var n = G(e, 4) + "-" + G(r.getUTCMonth() + 1, 2) + "-" + G(r.getUTCDate(), 2) + "T" + G(r.getUTCHours(), 2) + ":" + G(r.getUTCMinutes(), 2) + ":" + G(r.getUTCSeconds(), 2) + "." + G(r.getUTCMilliseconds(), 3);
        return n += "+00:00", t && (n += " BC"), n;
    }
    a(Ja, "dateToStringUTC");
    function Xa(r, e, t) {
        return r = typeof r == "string" ? {
            text: r
        } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
    }
    a(Xa, "normalizeQueryConfig");
    var rr = a(function(r) {
        return Va.createHash("md5").update(r, "utf-8").digest("hex");
    }, "md5"), eu = a(function(r, e, t) {
        var n = rr(e + r), i = rr(y.concat([
            y.from(n),
            t
        ]));
        return "md5" + i;
    }, "postgresMd5PasswordHash");
    Ui.exports = {
        prepareValue: a(function(e) {
            return pt(e);
        }, "prepareValueWrapper"),
        normalizeQueryConfig: Xa,
        postgresMd5PasswordHash: eu,
        md5: rr
    };
});
var ji = I((el, Qi)=>{
    "use strict";
    p();
    var nr = (Ht(), O(Wt));
    function tu(r) {
        if (r.indexOf("SCRAM-SHA-256") === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
        let e = nr.randomBytes(18).toString("base64");
        return {
            mechanism: "SCRAM-SHA-256",
            clientNonce: e,
            response: "n,,n=*,r=" + e,
            message: "SASLInitialResponse"
        };
    }
    a(tu, "startSession");
    function ru(r, e, t) {
        if (r.message !== "SASLInitialResponse") throw new Error("SASL: Last message was not SASLInitialResponse");
        if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
        if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
        let n = su(t);
        if (n.nonce.startsWith(r.clientNonce)) {
            if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
        } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
        var i = y.from(n.salt, "base64"), s = uu(e, i, n.iteration), o = De(s, "Client Key"), u = au(o), c = "n=*,r=" + r.clientNonce, h = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, l = "c=biws,r=" + n.nonce, d = c + "," + h + "," + l, b = De(u, d), C = qi(o, b), B = C.toString("base64"), Q = De(s, "Server Key"), X = De(Q, d);
        r.message = "SASLResponse", r.serverSignature = X.toString("base64"), r.response = l + ",p=" + B;
    }
    a(ru, "continueSession");
    function nu(r, e) {
        if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
        if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
        let { serverSignature: t } = ou(e);
        if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
    }
    a(nu, "finalizeSession");
    function iu(r) {
        if (typeof r != "string") throw new TypeError("SASL: text must be a string");
        return r.split("").map((e, t)=>r.charCodeAt(t)).every((e)=>e >= 33 && e <= 43 || e >= 45 && e <= 126);
    }
    a(iu, "isPrintableChars");
    function Oi(r) {
        return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
    }
    a(Oi, "isBase64");
    function Ni(r) {
        if (typeof r != "string") throw new TypeError("SASL: attribute pairs text must be a string");
        return new Map(r.split(",").map((e)=>{
            if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
            let t = e[0], n = e.substring(2);
            return [
                t,
                n
            ];
        }));
    }
    a(Ni, "parseAttributePairs");
    function su(r) {
        let e = Ni(r), t = e.get("r");
        if (t) {
            if (!iu(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
        } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
        let n = e.get("s");
        if (n) {
            if (!Oi(n)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
        } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
        let i = e.get("i");
        if (i) {
            if (!/^[1-9][0-9]*$/.test(i)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
        } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
        let s = parseInt(i, 10);
        return {
            nonce: t,
            salt: n,
            iteration: s
        };
    }
    a(su, "parseServerFirstMessage");
    function ou(r) {
        let t = Ni(r).get("v");
        if (t) {
            if (!Oi(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
        } else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
        return {
            serverSignature: t
        };
    }
    a(ou, "parseServerFinalMessage");
    function qi(r, e) {
        if (!y.isBuffer(r)) throw new TypeError("first argument must be a Buffer");
        if (!y.isBuffer(e)) throw new TypeError("second argument must be a Buffer");
        if (r.length !== e.length) throw new Error("Buffer lengths must match");
        if (r.length === 0) throw new Error("Buffers cannot be empty");
        return y.from(r.map((t, n)=>r[n] ^ e[n]));
    }
    a(qi, "xorBuffers");
    function au(r) {
        return nr.createHash("sha256").update(r).digest();
    }
    a(au, "sha256");
    function De(r, e) {
        return nr.createHmac("sha256", r).update(e).digest();
    }
    a(De, "hmacSha256");
    function uu(r, e, t) {
        for(var n = De(r, y.concat([
            e,
            y.from([
                0,
                0,
                0,
                1
            ])
        ])), i = n, s = 0; s < t - 1; s++)n = De(r, n), i = qi(i, n);
        return i;
    }
    a(uu, "Hi");
    Qi.exports = {
        startSession: tu,
        continueSession: ru,
        finalizeSession: nu
    };
});
var ir = {};
se(ir, {
    join: ()=>cu
});
function cu(...r) {
    return r.join("/");
}
var sr = z(()=>{
    "use strict";
    p();
    a(cu, "join");
});
var or = {};
se(or, {
    stat: ()=>hu
});
function hu(r, e) {
    e(new Error("No filesystem"));
}
var ar = z(()=>{
    "use strict";
    p();
    a(hu, "stat");
});
var ur = {};
se(ur, {
    default: ()=>lu
});
var lu, cr = z(()=>{
    "use strict";
    p();
    lu = {};
});
var Wi = {};
se(Wi, {
    StringDecoder: ()=>hr
});
var lr, hr, Hi = z(()=>{
    "use strict";
    p();
    lr = class lr {
        constructor(e){
            _(this, "td");
            this.td = new TextDecoder(e);
        }
        write(e) {
            return this.td.decode(e, {
                stream: !0
            });
        }
        end(e) {
            return this.td.decode(e);
        }
    };
    a(lr, "StringDecoder");
    hr = lr;
});
var Ki = I((hl, Vi)=>{
    "use strict";
    p();
    var { Transform: fu } = (cr(), O(ur)), { StringDecoder: pu } = (Hi(), O(Wi)), we = Symbol("last"), dt = Symbol("decoder");
    function du(r, e, t) {
        let n;
        if (this.overflow) {
            if (n = this[dt].write(r).split(this.matcher), n.length === 1) return t();
            n.shift(), this.overflow = !1;
        } else this[we] += this[dt].write(r), n = this[we].split(this.matcher);
        this[we] = n.pop();
        for(let i = 0; i < n.length; i++)try {
            $i(this, this.mapper(n[i]));
        } catch (s) {
            return t(s);
        }
        if (this.overflow = this[we].length > this.maxLength, this.overflow && !this.skipOverflow) {
            t(new Error("maximum buffer reached"));
            return;
        }
        t();
    }
    a(du, "transform");
    function yu(r) {
        if (this[we] += this[dt].end(), this[we]) try {
            $i(this, this.mapper(this[we]));
        } catch (e) {
            return r(e);
        }
        r();
    }
    a(yu, "flush");
    function $i(r, e) {
        e !== void 0 && r.push(e);
    }
    a($i, "push");
    function Gi(r) {
        return r;
    }
    a(Gi, "noop");
    function mu(r, e, t) {
        switch(r = r || /\r?\n/, e = e || Gi, t = t || {}, arguments.length){
            case 1:
                typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
                break;
            case 2:
                typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = Gi);
        }
        t = Object.assign({}, t), t.autoDestroy = !0, t.transform = du, t.flush = yu, t.readableObjectMode = !0;
        let n = new fu(t);
        return n[we] = "", n[dt] = new pu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || !1, n.overflow = !1, n._destroy = function(i, s) {
            this._writableState.errorEmitted = !1, s(i);
        }, n;
    }
    a(mu, "split");
    Vi.exports = mu;
});
var Zi = I((pl, fe)=>{
    "use strict";
    p();
    var zi = (sr(), O(ir)), gu = (cr(), O(ur)).Stream, wu = Ki(), Yi = (Ge(), O(He)), bu = 5432, yt = m.platform === "win32", rt = m.stderr, Su = 56, xu = 7, Eu = 61440, vu = 32768;
    function _u(r) {
        return (r & Eu) == vu;
    }
    a(_u, "isRegFile");
    var ke = [
        "host",
        "port",
        "database",
        "user",
        "password"
    ], fr = ke.length, Au = ke[fr - 1];
    function pr() {
        var r = rt instanceof gu && rt.writable === !0;
        if (r) {
            var e = Array.prototype.slice.call(arguments).concat(`
`);
            rt.write(Yi.format.apply(Yi, e));
        }
    }
    a(pr, "warn");
    Object.defineProperty(fe.exports, "isWin", {
        get: a(function() {
            return yt;
        }, "get"),
        set: a(function(r) {
            yt = r;
        }, "set")
    });
    fe.exports.warnTo = function(r) {
        var e = rt;
        return rt = r, e;
    };
    fe.exports.getFileName = function(r) {
        var e = r || m.env, t = e.PGPASSFILE || (yt ? zi.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : zi.join(e.HOME || "./", ".pgpass"));
        return t;
    };
    fe.exports.usePgPass = function(r, e) {
        return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? !1 : yt ? !0 : (e = e || "<unkn>", _u(r.mode) ? r.mode & (Su | xu) ? (pr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), !1) : !0 : (pr('WARNING: password file "%s" is not a plain file', e), !1));
    };
    var Cu = fe.exports.match = function(r, e) {
        return ke.slice(0, -1).reduce(function(t, n, i) {
            return i == 1 && Number(r[n] || bu) === Number(e[n]) ? t && !0 : t && (e[n] === "*" || e[n] === r[n]);
        }, !0);
    };
    fe.exports.getPassword = function(r, e, t) {
        var n, i = e.pipe(wu());
        function s(c) {
            var h = Tu(c);
            h && Iu(h) && Cu(r, h) && (n = h[Au], i.end());
        }
        a(s, "onLine");
        var o = a(function() {
            e.destroy(), t(n);
        }, "onEnd"), u = a(function(c) {
            e.destroy(), pr("WARNING: error on reading file: %s", c), t(void 0);
        }, "onErr");
        e.on("error", u), i.on("data", s).on("end", o).on("error", u);
    };
    var Tu = fe.exports.parseLine = function(r) {
        if (r.length < 11 || r.match(/^\s+#/)) return null;
        for(var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = !1, c = a(function(l, d, b) {
            var C = r.substring(d, b);
            Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (C = C.replace(/\\([:\\])/g, "$1")), o[ke[l]] = C;
        }, "addToObj"), h = 0; h < r.length - 1; h += 1){
            if (e = r.charAt(h + 1), t = r.charAt(h), u = n == fr - 1, u) {
                c(n, i);
                break;
            }
            h >= 0 && e == ":" && t !== "\\" && (c(n, i, h + 1), i = h + 2, n += 1);
        }
        return o = Object.keys(o).length === fr ? o : null, o;
    }, Iu = fe.exports.isValidEntry = function(r) {
        for(var e = {
            0: function(o) {
                return o.length > 0;
            },
            1: function(o) {
                return o === "*" ? !0 : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
            },
            2: function(o) {
                return o.length > 0;
            },
            3: function(o) {
                return o.length > 0;
            },
            4: function(o) {
                return o.length > 0;
            }
        }, t = 0; t < ke.length; t += 1){
            var n = e[t], i = r[ke[t]] || "", s = n(i);
            if (!s) return !1;
        }
        return !0;
    };
});
var Xi = I((gl, dr)=>{
    "use strict";
    p();
    var ml = (sr(), O(ir)), Ji = (ar(), O(or)), mt = Zi();
    dr.exports = function(r, e) {
        var t = mt.getFileName();
        Ji.stat(t, function(n, i) {
            if (n || !mt.usePgPass(i, t)) return e(void 0);
            var s = Ji.createReadStream(t);
            mt.getPassword(r, s, e);
        });
    };
    dr.exports.warnTo = mt.warnTo;
});
var wt = I((bl, es)=>{
    "use strict";
    p();
    var Pu = Xe();
    function gt(r) {
        this._types = r || Pu, this.text = {}, this.binary = {};
    }
    a(gt, "TypeOverrides");
    gt.prototype.getOverrides = function(r) {
        switch(r){
            case "text":
                return this.text;
            case "binary":
                return this.binary;
            default:
                return {};
        }
    };
    gt.prototype.setTypeParser = function(r, e, t) {
        typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
    };
    gt.prototype.getTypeParser = function(r, e) {
        return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
    };
    es.exports = gt;
});
var ts = {};
se(ts, {
    default: ()=>Bu
});
var Bu, rs = z(()=>{
    "use strict";
    p();
    Bu = {};
});
var ns = {};
se(ns, {
    parse: ()=>yr
});
function yr(r, e = !1) {
    let { protocol: t } = new URL(r), n = "http:" + r.substring(t.length), { username: i, password: s, host: o, hostname: u, port: c, pathname: h, search: l, searchParams: d, hash: b } = new URL(n);
    s = decodeURIComponent(s), i = decodeURIComponent(i), h = decodeURIComponent(h);
    let C = i + ":" + s, B = e ? Object.fromEntries(d.entries()) : l;
    return {
        href: r,
        protocol: t,
        auth: C,
        username: i,
        password: s,
        host: o,
        hostname: u,
        port: c,
        pathname: h,
        search: l,
        query: B,
        hash: b
    };
}
var mr = z(()=>{
    "use strict";
    p();
    a(yr, "parse");
});
var ss = I((Al, is)=>{
    "use strict";
    p();
    var Lu = (mr(), O(ns)), gr = (ar(), O(or));
    function wr(r) {
        if (r.charAt(0) === "/") {
            var t = r.split(" ");
            return {
                host: t[0],
                database: t[1]
            };
        }
        var e = Lu.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, !0), t = e.query;
        for(var n in t)Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
        var i = (e.auth || ":").split(":");
        if (t.user = i[0], t.password = i.splice(1).join(":"), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
        t.host || (t.host = e.hostname);
        var s = e.pathname;
        if (!t.host && s && /^%2f/i.test(s)) {
            var o = s.split("/");
            t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
        }
        switch(s && s.charAt(0) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = !0), t.ssl === "0" && (t.ssl = !1), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = gr.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = gr.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = gr.readFileSync(t.sslrootcert).toString()), t.sslmode){
            case "disable":
                {
                    t.ssl = !1;
                    break;
                }
            case "prefer":
            case "require":
            case "verify-ca":
            case "verify-full":
                break;
            case "no-verify":
                {
                    t.ssl.rejectUnauthorized = !1;
                    break;
                }
        }
        return t;
    }
    a(wr, "parse");
    is.exports = wr;
    wr.parse = wr;
});
var bt = I((Il, us)=>{
    "use strict";
    p();
    var Ru = (rs(), O(ts)), as = et(), os = ss().parse, V = a(function(r, e, t) {
        return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === !1 || (t = m.env[t]), e[r] || t || as[r];
    }, "val"), Fu = a(function() {
        switch(m.env.PGSSLMODE){
            case "disable":
                return !1;
            case "prefer":
            case "require":
            case "verify-ca":
            case "verify-full":
                return !0;
            case "no-verify":
                return {
                    rejectUnauthorized: !1
                };
        }
        return as.ssl;
    }, "readSSLConfigFromEnvironment"), Ue = a(function(r) {
        return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    }, "quoteParamValue"), ie = a(function(r, e, t) {
        var n = e[t];
        n != null && r.push(t + "=" + Ue(n));
    }, "add"), Sr = class Sr {
        constructor(e){
            e = typeof e == "string" ? os(e) : e || {}, e.connectionString && (e = Object.assign({}, e, os(e.connectionString))), this.user = V("user", e), this.database = V("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(V("port", e), 10), this.host = V("host", e), Object.defineProperty(this, "password", {
                configurable: !0,
                enumerable: !1,
                writable: !0,
                value: V("password", e)
            }), this.binary = V("binary", e), this.options = V("options", e), this.ssl = typeof e.ssl > "u" ? Fu() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = !0), this.ssl === "no-verify" && (this.ssl = {
                rejectUnauthorized: !1
            }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", {
                enumerable: !1
            }), this.client_encoding = V("client_encoding", e), this.replication = V("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = V("application_name", e, "PGAPPNAME"), this.fallback_application_name = V("fallback_application_name", e, !1), this.statement_timeout = V("statement_timeout", e, !1), this.lock_timeout = V("lock_timeout", e, !1), this.idle_in_transaction_session_timeout = V("idle_in_transaction_session_timeout", e, !1), this.query_timeout = V("query_timeout", e, !1), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === !1 ? this.keepalives = 0 : e.keepAlive === !0 && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
        }
        getLibpqConnectionString(e) {
            var t = [];
            ie(t, this, "user"), ie(t, this, "password"), ie(t, this, "port"), ie(t, this, "application_name"), ie(t, this, "fallback_application_name"), ie(t, this, "connect_timeout"), ie(t, this, "options");
            var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? {
                sslmode: this.ssl
            } : {};
            if (ie(t, n, "sslmode"), ie(t, n, "sslca"), ie(t, n, "sslkey"), ie(t, n, "sslcert"), ie(t, n, "sslrootcert"), this.database && t.push("dbname=" + Ue(this.database)), this.replication && t.push("replication=" + Ue(this.replication)), this.host && t.push("host=" + Ue(this.host)), this.isDomainSocket) return e(null, t.join(" "));
            this.client_encoding && t.push("client_encoding=" + Ue(this.client_encoding)), Ru.lookup(this.host, function(i, s) {
                return i ? e(i, null) : (t.push("hostaddr=" + Ue(s)), e(null, t.join(" ")));
            });
        }
    };
    a(Sr, "ConnectionParameters");
    var br = Sr;
    us.exports = br;
});
var ls = I((Ll, hs)=>{
    "use strict";
    p();
    var Mu = Xe(), cs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Er = class Er {
        constructor(e, t){
            this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
        }
        addCommandComplete(e) {
            var t;
            e.text ? t = cs.exec(e.text) : t = cs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(t[2], 10), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
        }
        _parseRowAsArray(e) {
            for(var t = new Array(e.length), n = 0, i = e.length; n < i; n++){
                var s = e[n];
                s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
            }
            return t;
        }
        parseRow(e) {
            for(var t = {}, n = 0, i = e.length; n < i; n++){
                var s = e[n], o = this.fields[n].name;
                s !== null ? t[o] = this._parsers[n](s) : t[o] = null;
            }
            return t;
        }
        addRow(e) {
            this.rows.push(e);
        }
        addFields(e) {
            this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
            for(var t = 0; t < e.length; t++){
                var n = e[t];
                this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = Mu.getTypeParser(n.dataTypeID, n.format || "text");
            }
        }
    };
    a(Er, "Result");
    var xr = Er;
    hs.exports = xr;
});
var ys = I((Ml, ds)=>{
    "use strict";
    p();
    var { EventEmitter: Du } = ge(), fs = ls(), ps = tt(), _r = class _r extends Du {
        constructor(e, t, n){
            super(), e = ps.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new fs(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = !1, this._canceledDueToError = !1, this._promise = null;
        }
        requiresPreparation() {
            return this.name || this.rows ? !0 : !this.text || !this.values ? !1 : this.values.length > 0;
        }
        _checkForMultirow() {
            this._result.command && (Array.isArray(this._results) || (this._results = [
                this._result
            ]), this._result = new fs(this._rowMode, this.types), this._results.push(this._result));
        }
        handleRowDescription(e) {
            this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
        }
        handleDataRow(e) {
            let t;
            if (!this._canceledDueToError) {
                try {
                    t = this._result.parseRow(e.fields);
                } catch (n) {
                    this._canceledDueToError = n;
                    return;
                }
                this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
            }
        }
        handleCommandComplete(e, t) {
            this._checkForMultirow(), this._result.addCommandComplete(e), this.rows && t.sync();
        }
        handleEmptyQuery(e) {
            this.rows && e.sync();
        }
        handleError(e, t) {
            if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = !1), this.callback) return this.callback(e);
            this.emit("error", e);
        }
        handleReadyForQuery(e) {
            if (this._canceledDueToError) return this.handleError(this._canceledDueToError, e);
            if (this.callback) try {
                this.callback(null, this._results);
            } catch (t) {
                m.nextTick(()=>{
                    throw t;
                });
            }
            this.emit("end", this._results);
        }
        submit(e) {
            if (typeof this.text != "string" && typeof this.name != "string") return new Error("A query must have either text or a name. Supplying neither is unsupported.");
            let t = e.parsedStatements[this.name];
            return this.text && t && this.text !== t ? new Error(`Prepared statements must be \
unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
        }
        hasBeenParsed(e) {
            return this.name && e.parsedStatements[this.name];
        }
        handlePortalSuspended(e) {
            this._getRows(e, this.rows);
        }
        _getRows(e, t) {
            e.execute({
                portal: this.portal,
                rows: t
            }), t ? e.flush() : e.sync();
        }
        prepare(e) {
            this.isPreparedStatement = !0, this.hasBeenParsed(e) || e.parse({
                text: this.text,
                name: this.name,
                types: this.types
            });
            try {
                e.bind({
                    portal: this.portal,
                    statement: this.name,
                    values: this.values,
                    binary: this.binary,
                    valueMapper: ps.prepareValue
                });
            } catch (t) {
                this.handleError(t, e);
                return;
            }
            e.describe({
                type: "P",
                name: this.portal || ""
            }), this._getRows(e, this.rows);
        }
        handleCopyInResponse(e) {
            e.sendCopyFail("No source stream defined");
        }
        handleCopyData(e, t) {}
    };
    a(_r, "Query");
    var vr = _r;
    ds.exports = vr;
});
var ws = {};
se(ws, {
    Socket: ()=>_e,
    isIP: ()=>ku
});
function ku(r) {
    return 0;
}
var gs, ms, v, _e, St = z(()=>{
    "use strict";
    p();
    gs = Te(ge(), 1);
    a(ku, "isIP");
    ms = /^[^.]+\./, v = class v extends gs.EventEmitter {
        constructor(){
            super(...arguments);
            _(this, "opts", {});
            _(this, "connecting", !1);
            _(this, "pending", !0);
            _(this, "writable", !0);
            _(this, "encrypted", !1);
            _(this, "authorized", !1);
            _(this, "destroyed", !1);
            _(this, "ws", null);
            _(this, "writeBuffer");
            _(this, "tlsState", 0);
            _(this, "tlsRead");
            _(this, "tlsWrite");
        }
        static get poolQueryViaFetch() {
            return v.opts.poolQueryViaFetch ?? v.defaults.poolQueryViaFetch;
        }
        static set poolQueryViaFetch(t) {
            v.opts.poolQueryViaFetch = t;
        }
        static get fetchEndpoint() {
            return v.opts.fetchEndpoint ?? v.defaults.fetchEndpoint;
        }
        static set fetchEndpoint(t) {
            v.opts.fetchEndpoint = t;
        }
        static get fetchConnectionCache() {
            return !0;
        }
        static set fetchConnectionCache(t) {
            console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
        }
        static get fetchFunction() {
            return v.opts.fetchFunction ?? v.defaults.fetchFunction;
        }
        static set fetchFunction(t) {
            v.opts.fetchFunction = t;
        }
        static get webSocketConstructor() {
            return v.opts.webSocketConstructor ?? v.defaults.webSocketConstructor;
        }
        static set webSocketConstructor(t) {
            v.opts.webSocketConstructor = t;
        }
        get webSocketConstructor() {
            return this.opts.webSocketConstructor ?? v.webSocketConstructor;
        }
        set webSocketConstructor(t) {
            this.opts.webSocketConstructor = t;
        }
        static get wsProxy() {
            return v.opts.wsProxy ?? v.defaults.wsProxy;
        }
        static set wsProxy(t) {
            v.opts.wsProxy = t;
        }
        get wsProxy() {
            return this.opts.wsProxy ?? v.wsProxy;
        }
        set wsProxy(t) {
            this.opts.wsProxy = t;
        }
        static get coalesceWrites() {
            return v.opts.coalesceWrites ?? v.defaults.coalesceWrites;
        }
        static set coalesceWrites(t) {
            v.opts.coalesceWrites = t;
        }
        get coalesceWrites() {
            return this.opts.coalesceWrites ?? v.coalesceWrites;
        }
        set coalesceWrites(t) {
            this.opts.coalesceWrites = t;
        }
        static get useSecureWebSocket() {
            return v.opts.useSecureWebSocket ?? v.defaults.useSecureWebSocket;
        }
        static set useSecureWebSocket(t) {
            v.opts.useSecureWebSocket = t;
        }
        get useSecureWebSocket() {
            return this.opts.useSecureWebSocket ?? v.useSecureWebSocket;
        }
        set useSecureWebSocket(t) {
            this.opts.useSecureWebSocket = t;
        }
        static get forceDisablePgSSL() {
            return v.opts.forceDisablePgSSL ?? v.defaults.forceDisablePgSSL;
        }
        static set forceDisablePgSSL(t) {
            v.opts.forceDisablePgSSL = t;
        }
        get forceDisablePgSSL() {
            return this.opts.forceDisablePgSSL ?? v.forceDisablePgSSL;
        }
        set forceDisablePgSSL(t) {
            this.opts.forceDisablePgSSL = t;
        }
        static get disableSNI() {
            return v.opts.disableSNI ?? v.defaults.disableSNI;
        }
        static set disableSNI(t) {
            v.opts.disableSNI = t;
        }
        get disableSNI() {
            return this.opts.disableSNI ?? v.disableSNI;
        }
        set disableSNI(t) {
            this.opts.disableSNI = t;
        }
        static get pipelineConnect() {
            return v.opts.pipelineConnect ?? v.defaults.pipelineConnect;
        }
        static set pipelineConnect(t) {
            v.opts.pipelineConnect = t;
        }
        get pipelineConnect() {
            return this.opts.pipelineConnect ?? v.pipelineConnect;
        }
        set pipelineConnect(t) {
            this.opts.pipelineConnect = t;
        }
        static get subtls() {
            return v.opts.subtls ?? v.defaults.subtls;
        }
        static set subtls(t) {
            v.opts.subtls = t;
        }
        get subtls() {
            return this.opts.subtls ?? v.subtls;
        }
        set subtls(t) {
            this.opts.subtls = t;
        }
        static get pipelineTLS() {
            return v.opts.pipelineTLS ?? v.defaults.pipelineTLS;
        }
        static set pipelineTLS(t) {
            v.opts.pipelineTLS = t;
        }
        get pipelineTLS() {
            return this.opts.pipelineTLS ?? v.pipelineTLS;
        }
        set pipelineTLS(t) {
            this.opts.pipelineTLS = t;
        }
        static get rootCerts() {
            return v.opts.rootCerts ?? v.defaults.rootCerts;
        }
        static set rootCerts(t) {
            v.opts.rootCerts = t;
        }
        get rootCerts() {
            return this.opts.rootCerts ?? v.rootCerts;
        }
        set rootCerts(t) {
            this.opts.rootCerts = t;
        }
        wsProxyAddrForHost(t, n) {
            let i = this.wsProxy;
            if (i === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
            return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
        }
        setNoDelay() {
            return this;
        }
        setKeepAlive() {
            return this;
        }
        ref() {
            return this;
        }
        unref() {
            return this;
        }
        connect(t, n, i) {
            this.connecting = !0, i && this.once("connect", i);
            let s = a(()=>{
                this.connecting = !1, this.pending = !1, this.emit("connect"), this.emit("ready");
            }, "handleWebSocketOpen"), o = a((c, h = !1)=>{
                c.binaryType = "arraybuffer", c.addEventListener("error", (l)=>{
                    this.emit("error", l), this.emit("close");
                }), c.addEventListener("message", (l)=>{
                    if (this.tlsState === 0) {
                        let d = y.from(l.data);
                        this.emit("data", d);
                    }
                }), c.addEventListener("close", ()=>{
                    this.emit("close");
                }), h ? s() : c.addEventListener("open", s);
            }, "configureWebSocket"), u;
            try {
                u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
            } catch (c) {
                this.emit("error", c), this.emit("close");
                return;
            }
            try {
                let h = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
                if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(h), o(this.ws);
                else try {
                    this.ws = new WebSocket(h), o(this.ws);
                } catch  {
                    this.ws = new __unstable_WebSocket(h), o(this.ws);
                }
            } catch (c) {
                let l = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
                fetch(l, {
                    headers: {
                        Upgrade: "websocket"
                    }
                }).then((d)=>{
                    if (this.ws = d.webSocket, this.ws == null) throw c;
                    this.ws.accept(), o(this.ws, !0);
                }).catch((d)=>{
                    this.emit("error", new Error(`All attempts to open a WebSocket to\
 connect to the database failed. Please refer to https://github.com/neondatabase\
/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined\
. Details: ${d.message}`)), this.emit("close");
                });
            }
        }
        async startTls(t) {
            if (this.subtls === void 0) throw new Error("For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information.");
            this.tlsState = 1;
            let n = this.subtls.TrustedCert.fromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), [u, c] = await this.subtls.startTls(t, n, s, o, {
                useSNI: !this.disableSNI,
                expectPreData: this.pipelineTLS ? new Uint8Array([
                    83
                ]) : void 0
            });
            this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = !0, this.authorized = !0, this.emit("secureConnection", this), this.tlsReadLoop();
        }
        async tlsReadLoop() {
            for(;;){
                let t = await this.tlsRead();
                if (t === void 0) break;
                {
                    let n = y.from(t);
                    this.emit("data", n);
                }
            }
        }
        rawWrite(t) {
            if (!this.coalesceWrites) {
                this.ws.send(t);
                return;
            }
            if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(()=>{
                this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
            }, 0);
            else {
                let n = new Uint8Array(this.writeBuffer.length + t.length);
                n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
            }
        }
        write(t, n = "utf8", i = (s)=>{}) {
            return t.length === 0 ? (i(), !0) : (typeof t == "string" && (t = y.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", ()=>{
                this.write(t, n, i);
            }) : (this.tlsWrite(t), i()), !0);
        }
        end(t = y.alloc(0), n = "utf8", i = ()=>{}) {
            return this.write(t, n, ()=>{
                this.ws.close(), i();
            }), this;
        }
        destroy() {
            return this.destroyed = !0, this.end();
        }
    };
    a(v, "Socket"), _(v, "defaults", {
        poolQueryViaFetch: !1,
        fetchEndpoint: a((t, n, i)=>{
            let s;
            return i?.jwtAuth ? s = t.replace(ms, "apiauth.") : s = t.replace(ms, "api."), "https://" + s + "/sql";
        }, "fetchEndpoint"),
        fetchConnectionCache: !0,
        fetchFunction: void 0,
        webSocketConstructor: void 0,
        wsProxy: a((t)=>t + "/v2", "wsProxy"),
        useSecureWebSocket: !0,
        forceDisablePgSSL: !0,
        coalesceWrites: !0,
        pipelineConnect: "password",
        subtls: void 0,
        rootCerts: "",
        pipelineTLS: !1,
        disableSNI: !1
    }), _(v, "opts", {});
    _e = v;
});
var Xr = I((T)=>{
    "use strict";
    p();
    Object.defineProperty(T, "__esModule", {
        value: !0
    });
    T.NoticeMessage = T.DataRowMessage = T.CommandCompleteMessage = T.ReadyForQueryMessage = T.NotificationResponseMessage = T.BackendKeyDataMessage = T.AuthenticationMD5Password = T.ParameterStatusMessage = T.ParameterDescriptionMessage = T.RowDescriptionMessage = T.Field = T.CopyResponse = T.CopyDataMessage = T.DatabaseError = T.copyDone = T.emptyQuery = T.replicationStart = T.portalSuspended = T.noData = T.closeComplete = T.bindComplete = T.parseComplete = void 0;
    T.parseComplete = {
        name: "parseComplete",
        length: 5
    };
    T.bindComplete = {
        name: "bindComplete",
        length: 5
    };
    T.closeComplete = {
        name: "closeComplete",
        length: 5
    };
    T.noData = {
        name: "noData",
        length: 5
    };
    T.portalSuspended = {
        name: "portalSuspended",
        length: 5
    };
    T.replicationStart = {
        name: "replicationStart",
        length: 4
    };
    T.emptyQuery = {
        name: "emptyQuery",
        length: 4
    };
    T.copyDone = {
        name: "copyDone",
        length: 4
    };
    var Nr = class Nr extends Error {
        constructor(e, t, n){
            super(e), this.length = t, this.name = n;
        }
    };
    a(Nr, "DatabaseError");
    var Ar = Nr;
    T.DatabaseError = Ar;
    var qr = class qr {
        constructor(e, t){
            this.length = e, this.chunk = t, this.name = "copyData";
        }
    };
    a(qr, "CopyDataMessage");
    var Cr = qr;
    T.CopyDataMessage = Cr;
    var Qr = class Qr {
        constructor(e, t, n, i){
            this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
        }
    };
    a(Qr, "CopyResponse");
    var Tr = Qr;
    T.CopyResponse = Tr;
    var jr = class jr {
        constructor(e, t, n, i, s, o, u){
            this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
        }
    };
    a(jr, "Field");
    var Ir = jr;
    T.Field = Ir;
    var Wr = class Wr {
        constructor(e, t){
            this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
        }
    };
    a(Wr, "RowDescriptionMessage");
    var Pr = Wr;
    T.RowDescriptionMessage = Pr;
    var Hr = class Hr {
        constructor(e, t){
            this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
        }
    };
    a(Hr, "ParameterDescriptionMessage");
    var Br = Hr;
    T.ParameterDescriptionMessage = Br;
    var Gr = class Gr {
        constructor(e, t, n){
            this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
        }
    };
    a(Gr, "ParameterStatusMessage");
    var Lr = Gr;
    T.ParameterStatusMessage = Lr;
    var $r = class $r {
        constructor(e, t){
            this.length = e, this.salt = t, this.name = "authenticationMD5Password";
        }
    };
    a($r, "AuthenticationMD5Password");
    var Rr = $r;
    T.AuthenticationMD5Password = Rr;
    var Vr = class Vr {
        constructor(e, t, n){
            this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
        }
    };
    a(Vr, "BackendKeyDataMessage");
    var Fr = Vr;
    T.BackendKeyDataMessage = Fr;
    var Kr = class Kr {
        constructor(e, t, n, i){
            this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
        }
    };
    a(Kr, "NotificationResponseMessage");
    var Mr = Kr;
    T.NotificationResponseMessage = Mr;
    var zr = class zr {
        constructor(e, t){
            this.length = e, this.status = t, this.name = "readyForQuery";
        }
    };
    a(zr, "ReadyForQueryMessage");
    var Dr = zr;
    T.ReadyForQueryMessage = Dr;
    var Yr = class Yr {
        constructor(e, t){
            this.length = e, this.text = t, this.name = "commandComplete";
        }
    };
    a(Yr, "CommandCompleteMessage");
    var kr = Yr;
    T.CommandCompleteMessage = kr;
    var Zr = class Zr {
        constructor(e, t){
            this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
        }
    };
    a(Zr, "DataRowMessage");
    var Ur = Zr;
    T.DataRowMessage = Ur;
    var Jr = class Jr {
        constructor(e, t){
            this.length = e, this.message = t, this.name = "notice";
        }
    };
    a(Jr, "NoticeMessage");
    var Or = Jr;
    T.NoticeMessage = Or;
});
var bs = I((xt)=>{
    "use strict";
    p();
    Object.defineProperty(xt, "__esModule", {
        value: !0
    });
    xt.Writer = void 0;
    var tn = class tn {
        constructor(e = 256){
            this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(e);
        }
        ensure(e) {
            var t = this.buffer.length - this.offset;
            if (t < e) {
                var n = this.buffer, i = n.length + (n.length >> 1) + e;
                this.buffer = y.allocUnsafe(i), n.copy(this.buffer);
            }
        }
        addInt32(e) {
            return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
        }
        addInt16(e) {
            return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
        }
        addCString(e) {
            if (!e) this.ensure(1);
            else {
                var t = y.byteLength(e);
                this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
            }
            return this.buffer[this.offset++] = 0, this;
        }
        addString(e = "") {
            var t = y.byteLength(e);
            return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
        }
        add(e) {
            return this.ensure(e.length), e.copy(this.buffer, this.offset), this.offset += e.length, this;
        }
        join(e) {
            if (e) {
                this.buffer[this.headerPosition] = e;
                let t = this.offset - (this.headerPosition + 1);
                this.buffer.writeInt32BE(t, this.headerPosition + 1);
            }
            return this.buffer.slice(e ? 0 : 5, this.offset);
        }
        flush(e) {
            var t = this.join(e);
            return this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(this.size), t;
        }
    };
    a(tn, "Writer");
    var en = tn;
    xt.Writer = en;
});
var xs = I((vt)=>{
    "use strict";
    p();
    Object.defineProperty(vt, "__esModule", {
        value: !0
    });
    vt.serialize = void 0;
    var rn = bs(), M = new rn.Writer, Uu = a((r)=>{
        M.addInt16(3).addInt16(0);
        for (let n of Object.keys(r))M.addCString(n).addCString(r[n]);
        M.addCString("client_encoding").addCString("UTF8");
        var e = M.addCString("").flush(), t = e.length + 4;
        return new rn.Writer().addInt32(t).add(e).flush();
    }, "startup"), Ou = a(()=>{
        let r = y.allocUnsafe(8);
        return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
    }, "requestSsl"), Nu = a((r)=>M.addCString(r).flush(112), "password"), qu = a(function(r, e) {
        return M.addCString(r).addInt32(y.byteLength(e)).addString(e), M.flush(112);
    }, "sendSASLInitialResponseMessage"), Qu = a(function(r) {
        return M.addString(r).flush(112);
    }, "sendSCRAMClientFinalMessage"), ju = a((r)=>M.addCString(r).flush(81), "query"), Ss = [], Wu = a((r)=>{
        let e = r.name || "";
        e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
        let t = r.types || Ss;
        for(var n = t.length, i = M.addCString(e).addCString(r.text).addInt16(n), s = 0; s < n; s++)i.addInt32(t[s]);
        return M.flush(80);
    }, "parse"), Oe = new rn.Writer, Hu = a(function(r, e) {
        for(let t = 0; t < r.length; t++){
            let n = e ? e(r[t], t) : r[t];
            n == null ? (M.addInt16(0), Oe.addInt32(-1)) : n instanceof y ? (M.addInt16(1), Oe.addInt32(n.length), Oe.add(n)) : (M.addInt16(0), Oe.addInt32(y.byteLength(n)), Oe.addString(n));
        }
    }, "writeValues"), Gu = a((r = {})=>{
        let e = r.portal || "", t = r.statement || "", n = r.binary || !1, i = r.values || Ss, s = i.length;
        return M.addCString(e).addCString(t), M.addInt16(s), Hu(i, r.valueMapper), M.addInt16(s), M.add(Oe.flush()), M.addInt16(n ? 1 : 0), M.flush(66);
    }, "bind"), $u = y.from([
        69,
        0,
        0,
        0,
        9,
        0,
        0,
        0,
        0,
        0
    ]), Vu = a((r)=>{
        if (!r || !r.portal && !r.rows) return $u;
        let e = r.portal || "", t = r.rows || 0, n = y.byteLength(e), i = 4 + n + 1 + 4, s = y.allocUnsafe(1 + i);
        return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
    }, "execute"), Ku = a((r, e)=>{
        let t = y.allocUnsafe(16);
        return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(5678, 6), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
    }, "cancel"), nn = a((r, e)=>{
        let n = 4 + y.byteLength(e) + 1, i = y.allocUnsafe(1 + n);
        return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
    }, "cstringMessage"), zu = M.addCString("P").flush(68), Yu = M.addCString("S").flush(68), Zu = a((r)=>r.name ? nn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? zu : Yu, "describe"), Ju = a((r)=>{
        let e = `${r.type}${r.name || ""}`;
        return nn(67, e);
    }, "close"), Xu = a((r)=>M.add(r).flush(100), "copyData"), ec = a((r)=>nn(102, r), "copyFail"), Et = a((r)=>y.from([
            r,
            0,
            0,
            0,
            4
        ]), "codeOnlyBuffer"), tc = Et(72), rc = Et(83), nc = Et(88), ic = Et(99), sc = {
        startup: Uu,
        password: Nu,
        requestSsl: Ou,
        sendSASLInitialResponseMessage: qu,
        sendSCRAMClientFinalMessage: Qu,
        query: ju,
        parse: Wu,
        bind: Gu,
        execute: Vu,
        describe: Zu,
        close: Ju,
        flush: a(()=>tc, "flush"),
        sync: a(()=>rc, "sync"),
        end: a(()=>nc, "end"),
        copyData: Xu,
        copyDone: a(()=>ic, "copyDone"),
        copyFail: ec,
        cancel: Ku
    };
    vt.serialize = sc;
});
var Es = I((_t)=>{
    "use strict";
    p();
    Object.defineProperty(_t, "__esModule", {
        value: !0
    });
    _t.BufferReader = void 0;
    var oc = y.allocUnsafe(0), on = class on {
        constructor(e = 0){
            this.offset = e, this.buffer = oc, this.encoding = "utf-8";
        }
        setBuffer(e, t) {
            this.offset = e, this.buffer = t;
        }
        int16() {
            let e = this.buffer.readInt16BE(this.offset);
            return this.offset += 2, e;
        }
        byte() {
            let e = this.buffer[this.offset];
            return this.offset++, e;
        }
        int32() {
            let e = this.buffer.readInt32BE(this.offset);
            return this.offset += 4, e;
        }
        string(e) {
            let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
            return this.offset += e, t;
        }
        cstring() {
            let e = this.offset, t = e;
            for(; this.buffer[t++] !== 0;);
            return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
        }
        bytes(e) {
            let t = this.buffer.slice(this.offset, this.offset + e);
            return this.offset += e, t;
        }
    };
    a(on, "BufferReader");
    var sn = on;
    _t.BufferReader = sn;
});
var As = I((At)=>{
    "use strict";
    p();
    Object.defineProperty(At, "__esModule", {
        value: !0
    });
    At.Parser = void 0;
    var D = Xr(), ac = Es(), an = 1, uc = 4, vs = an + uc, _s = y.allocUnsafe(0), cn = class cn {
        constructor(e){
            if (this.buffer = _s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new ac.BufferReader, e?.mode === "binary") throw new Error("Binary mode not supported yet");
            this.mode = e?.mode || "text";
        }
        parse(e, t) {
            this.mergeBuffer(e);
            let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
            for(; i + vs <= n;){
                let s = this.buffer[i], o = this.buffer.readUInt32BE(i + an), u = an + o;
                if (u + i <= n) {
                    let c = this.handlePacket(i + vs, s, o, this.buffer);
                    t(c), i += u;
                } else break;
            }
            i === n ? (this.buffer = _s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
        }
        mergeBuffer(e) {
            if (this.bufferLength > 0) {
                let t = this.bufferLength + e.byteLength;
                if (t + this.bufferOffset > this.buffer.byteLength) {
                    let i;
                    if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i = this.buffer;
                    else {
                        let s = this.buffer.byteLength * 2;
                        for(; t >= s;)s *= 2;
                        i = y.allocUnsafe(s);
                    }
                    this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
                }
                e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
            } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
        }
        handlePacket(e, t, n, i) {
            switch(t){
                case 50:
                    return D.bindComplete;
                case 49:
                    return D.parseComplete;
                case 51:
                    return D.closeComplete;
                case 110:
                    return D.noData;
                case 115:
                    return D.portalSuspended;
                case 99:
                    return D.copyDone;
                case 87:
                    return D.replicationStart;
                case 73:
                    return D.emptyQuery;
                case 68:
                    return this.parseDataRowMessage(e, n, i);
                case 67:
                    return this.parseCommandCompleteMessage(e, n, i);
                case 90:
                    return this.parseReadyForQueryMessage(e, n, i);
                case 65:
                    return this.parseNotificationMessage(e, n, i);
                case 82:
                    return this.parseAuthenticationResponse(e, n, i);
                case 83:
                    return this.parseParameterStatusMessage(e, n, i);
                case 75:
                    return this.parseBackendKeyData(e, n, i);
                case 69:
                    return this.parseErrorMessage(e, n, i, "error");
                case 78:
                    return this.parseErrorMessage(e, n, i, "notice");
                case 84:
                    return this.parseRowDescriptionMessage(e, n, i);
                case 116:
                    return this.parseParameterDescriptionMessage(e, n, i);
                case 71:
                    return this.parseCopyInMessage(e, n, i);
                case 72:
                    return this.parseCopyOutMessage(e, n, i);
                case 100:
                    return this.parseCopyData(e, n, i);
                default:
                    return new D.DatabaseError("received invalid response: " + t.toString(16), n, "error");
            }
        }
        parseReadyForQueryMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.string(1);
            return new D.ReadyForQueryMessage(t, i);
        }
        parseCommandCompleteMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.cstring();
            return new D.CommandCompleteMessage(t, i);
        }
        parseCopyData(e, t, n) {
            let i = n.slice(e, e + (t - 4));
            return new D.CopyDataMessage(t, i);
        }
        parseCopyInMessage(e, t, n) {
            return this.parseCopyMessage(e, t, n, "copyInResponse");
        }
        parseCopyOutMessage(e, t, n) {
            return this.parseCopyMessage(e, t, n, "copyOutResponse");
        }
        parseCopyMessage(e, t, n, i) {
            this.reader.setBuffer(e, n);
            let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new D.CopyResponse(t, i, s, o);
            for(let c = 0; c < o; c++)u.columnTypes[c] = this.reader.int16();
            return u;
        }
        parseNotificationMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
            return new D.NotificationResponseMessage(t, i, s, o);
        }
        parseRowDescriptionMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int16(), s = new D.RowDescriptionMessage(t, i);
            for(let o = 0; o < i; o++)s.fields[o] = this.parseField();
            return s;
        }
        parseField() {
            let e = this.reader.cstring(), t = this.reader.int32(), n = this.reader.int16(), i = this.reader.int32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
            return new D.Field(e, t, n, i, s, o, u);
        }
        parseParameterDescriptionMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int16(), s = new D.ParameterDescriptionMessage(t, i);
            for(let o = 0; o < i; o++)s.dataTypeIDs[o] = this.reader.int32();
            return s;
        }
        parseDataRowMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int16(), s = new Array(i);
            for(let o = 0; o < i; o++){
                let u = this.reader.int32();
                s[o] = u === -1 ? null : this.reader.string(u);
            }
            return new D.DataRowMessage(t, s);
        }
        parseParameterStatusMessage(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.cstring(), s = this.reader.cstring();
            return new D.ParameterStatusMessage(t, i, s);
        }
        parseBackendKeyData(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int32(), s = this.reader.int32();
            return new D.BackendKeyDataMessage(t, i, s);
        }
        parseAuthenticationResponse(e, t, n) {
            this.reader.setBuffer(e, n);
            let i = this.reader.int32(), s = {
                name: "authenticationOk",
                length: t
            };
            switch(i){
                case 0:
                    break;
                case 3:
                    s.length === 8 && (s.name = "authenticationCleartextPassword");
                    break;
                case 5:
                    if (s.length === 12) {
                        s.name = "authenticationMD5Password";
                        let u = this.reader.bytes(4);
                        return new D.AuthenticationMD5Password(t, u);
                    }
                    break;
                case 10:
                    s.name = "authenticationSASL", s.mechanisms = [];
                    let o;
                    do o = this.reader.cstring(), o && s.mechanisms.push(o);
                    while (o);
                    break;
                case 11:
                    s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
                    break;
                case 12:
                    s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
                    break;
                default:
                    throw new Error("Unknown authenticationOk message type " + i);
            }
            return s;
        }
        parseErrorMessage(e, t, n, i) {
            this.reader.setBuffer(e, n);
            let s = {}, o = this.reader.string(1);
            for(; o !== "\x00";)s[o] = this.reader.cstring(), o = this.reader.string(1);
            let u = s.M, c = i === "notice" ? new D.NoticeMessage(t, u) : new D.DatabaseError(u, t, i);
            return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
        }
    };
    a(cn, "Parser");
    var un = cn;
    At.Parser = un;
});
var hn = I((be)=>{
    "use strict";
    p();
    Object.defineProperty(be, "__esModule", {
        value: !0
    });
    be.DatabaseError = be.serialize = be.parse = void 0;
    var cc = Xr();
    Object.defineProperty(be, "DatabaseError", {
        enumerable: !0,
        get: a(function() {
            return cc.DatabaseError;
        }, "get")
    });
    var hc = xs();
    Object.defineProperty(be, "serialize", {
        enumerable: !0,
        get: a(function() {
            return hc.serialize;
        }, "get")
    });
    var lc = As();
    function fc(r, e) {
        let t = new lc.Parser;
        return r.on("data", (n)=>t.parse(n, e)), new Promise((n)=>r.on("end", ()=>n()));
    }
    a(fc, "parse");
    be.parse = fc;
});
var Cs = {};
se(Cs, {
    connect: ()=>pc
});
function pc({ socket: r, servername: e }) {
    return r.startTls(e), r;
}
var Ts = z(()=>{
    "use strict";
    p();
    a(pc, "connect");
});
var pn = I((of, Bs)=>{
    "use strict";
    p();
    var Is = (St(), O(ws)), dc = ge().EventEmitter, { parse: yc, serialize: q } = hn(), Ps = q.flush(), mc = q.sync(), gc = q.end(), fn = class fn extends dc {
        constructor(e){
            super(), e = e || {}, this.stream = e.stream || new Is.Socket, this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = !1, this.parsedStatements = {}, this.ssl = e.ssl || !1, this._ending = !1, this._emitMessage = !1;
            var t = this;
            this.on("newListener", function(n) {
                n === "message" && (t._emitMessage = !0);
            });
        }
        connect(e, t) {
            var n = this;
            this._connecting = !0, this.stream.setNoDelay(!0), this.stream.connect(e, t), this.stream.once("connect", function() {
                n._keepAlive && n.stream.setKeepAlive(!0, n._keepAliveInitialDelayMillis), n.emit("connect");
            });
            let i = a(function(s) {
                n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
            }, "reportStreamError");
            if (this.stream.on("error", i), this.stream.on("close", function() {
                n.emit("end");
            }), !this.ssl) return this.attachListeners(this.stream);
            this.stream.once("data", function(s) {
                var o = s.toString("utf8");
                switch(o){
                    case "S":
                        break;
                    case "N":
                        return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
                    default:
                        return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
                }
                var u = (Ts(), O(Cs));
                let c = {
                    socket: n.stream
                };
                n.ssl !== !0 && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Is.isIP(t) === 0 && (c.servername = t);
                try {
                    n.stream = u.connect(c);
                } catch (h) {
                    return n.emit("error", h);
                }
                n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
            });
        }
        attachListeners(e) {
            e.on("end", ()=>{
                this.emit("end");
            }), yc(e, (t)=>{
                var n = t.name === "error" ? "errorMessage" : t.name;
                this._emitMessage && this.emit("message", t), this.emit(n, t);
            });
        }
        requestSsl() {
            this.stream.write(q.requestSsl());
        }
        startup(e) {
            this.stream.write(q.startup(e));
        }
        cancel(e, t) {
            this._send(q.cancel(e, t));
        }
        password(e) {
            this._send(q.password(e));
        }
        sendSASLInitialResponseMessage(e, t) {
            this._send(q.sendSASLInitialResponseMessage(e, t));
        }
        sendSCRAMClientFinalMessage(e) {
            this._send(q.sendSCRAMClientFinalMessage(e));
        }
        _send(e) {
            return this.stream.writable ? this.stream.write(e) : !1;
        }
        query(e) {
            this._send(q.query(e));
        }
        parse(e) {
            this._send(q.parse(e));
        }
        bind(e) {
            this._send(q.bind(e));
        }
        execute(e) {
            this._send(q.execute(e));
        }
        flush() {
            this.stream.writable && this.stream.write(Ps);
        }
        sync() {
            this._ending = !0, this._send(Ps), this._send(mc);
        }
        ref() {
            this.stream.ref();
        }
        unref() {
            this.stream.unref();
        }
        end() {
            if (this._ending = !0, !this._connecting || !this.stream.writable) {
                this.stream.end();
                return;
            }
            return this.stream.write(gc, ()=>{
                this.stream.end();
            });
        }
        close(e) {
            this._send(q.close(e));
        }
        describe(e) {
            this._send(q.describe(e));
        }
        sendCopyFromChunk(e) {
            this._send(q.copyData(e));
        }
        endCopyFrom() {
            this._send(q.copyDone());
        }
        sendCopyFail(e) {
            this._send(q.copyFail(e));
        }
    };
    a(fn, "Connection");
    var ln = fn;
    Bs.exports = ln;
});
var Fs = I((hf, Rs)=>{
    "use strict";
    p();
    var wc = ge().EventEmitter, cf = (Ge(), O(He)), bc = tt(), dn = ji(), Sc = Xi(), xc = wt(), Ec = bt(), Ls = ys(), vc = et(), _c = pn(), yn = class yn extends wc {
        constructor(e){
            super(), this.connectionParameters = new Ec(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(this, "password", {
                configurable: !0,
                enumerable: !1,
                writable: !0,
                value: this.connectionParameters.password
            }), this.replication = this.connectionParameters.replication;
            var t = e || {};
            this._Promise = t.Promise || S.Promise, this._types = new xc(t.types), this._ending = !1, this._connecting = !1, this._connected = !1, this._connectionError = !1, this._queryable = !0, this.connection = t.connection || new _c({
                stream: t.stream,
                ssl: this.connectionParameters.ssl,
                keepAlive: t.keepAlive || !1,
                keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0,
                encoding: this.connectionParameters.client_encoding || "utf8"
            }), this.queryQueue = [], this.binary = t.binary || vc.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || !1, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", {
                enumerable: !1
            }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
        }
        _errorAllQueries(e) {
            let t = a((n)=>{
                m.nextTick(()=>{
                    n.handleError(e, this.connection);
                });
            }, "enqueueError");
            this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
        }
        _connect(e) {
            var t = this, n = this.connection;
            if (this._connectionCallback = e, this._connecting || this._connected) {
                let i = new Error("Client has already been connected. You cannot reuse a client.");
                m.nextTick(()=>{
                    e(i);
                });
                return;
            }
            this._connecting = !0, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(()=>{
                n._ending = !0, n.stream.destroy(new Error("timeout expired"));
            }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
                t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
            }), n.on("sslconnect", function() {
                n.startup(t.getStartupConf());
            }), this._attachListeners(n), n.once("end", ()=>{
                let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
                clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(()=>{
                    this.emit("end");
                });
            });
        }
        connect(e) {
            if (e) {
                this._connect(e);
                return;
            }
            return new this._Promise((t, n)=>{
                this._connect((i)=>{
                    i ? n(i) : t();
                });
            });
        }
        _attachListeners(e) {
            e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(this)), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
        }
        _checkPgPass(e) {
            let t = this.connection;
            typeof this.password == "function" ? this._Promise.resolve().then(()=>this.password()).then((n)=>{
                if (n !== void 0) {
                    if (typeof n != "string") {
                        t.emit("error", new TypeError("Password must be a string"));
                        return;
                    }
                    this.connectionParameters.password = this.password = n;
                } else this.connectionParameters.password = this.password = null;
                e();
            }).catch((n)=>{
                t.emit("error", n);
            }) : this.password !== null ? e() : Sc(this.connectionParameters, (n)=>{
                n !== void 0 && (this.connectionParameters.password = this.password = n), e();
            });
        }
        _handleAuthCleartextPassword(e) {
            this._checkPgPass(()=>{
                this.connection.password(this.password);
            });
        }
        _handleAuthMD5Password(e) {
            this._checkPgPass(()=>{
                let t = bc.postgresMd5PasswordHash(this.user, this.password, e.salt);
                this.connection.password(t);
            });
        }
        _handleAuthSASL(e) {
            this._checkPgPass(()=>{
                this.saslSession = dn.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
            });
        }
        _handleAuthSASLContinue(e) {
            dn.continueSession(this.saslSession, this.password, e.data), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        }
        _handleAuthSASLFinal(e) {
            dn.finalizeSession(this.saslSession, e.data), this.saslSession = null;
        }
        _handleBackendKeyData(e) {
            this.processID = e.processID, this.secretKey = e.secretKey;
        }
        _handleReadyForQuery(e) {
            this._connecting && (this._connecting = !1, this._connected = !0, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
            let { activeQuery: t } = this;
            this.activeQuery = null, this.readyForQuery = !0, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
        }
        _handleErrorWhileConnecting(e) {
            if (!this._connectionError) {
                if (this._connectionError = !0, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
                this.emit("error", e);
            }
        }
        _handleErrorEvent(e) {
            if (this._connecting) return this._handleErrorWhileConnecting(e);
            this._queryable = !1, this._errorAllQueries(e), this.emit("error", e);
        }
        _handleErrorMessage(e) {
            if (this._connecting) return this._handleErrorWhileConnecting(e);
            let t = this.activeQuery;
            if (!t) {
                this._handleErrorEvent(e);
                return;
            }
            this.activeQuery = null, t.handleError(e, this.connection);
        }
        _handleRowDescription(e) {
            this.activeQuery.handleRowDescription(e);
        }
        _handleDataRow(e) {
            this.activeQuery.handleDataRow(e);
        }
        _handlePortalSuspended(e) {
            this.activeQuery.handlePortalSuspended(this.connection);
        }
        _handleEmptyQuery(e) {
            this.activeQuery.handleEmptyQuery(this.connection);
        }
        _handleCommandComplete(e) {
            this.activeQuery.handleCommandComplete(e, this.connection);
        }
        _handleParseComplete(e) {
            this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
        }
        _handleCopyInResponse(e) {
            this.activeQuery.handleCopyInResponse(this.connection);
        }
        _handleCopyData(e) {
            this.activeQuery.handleCopyData(e, this.connection);
        }
        _handleNotification(e) {
            this.emit("notification", e);
        }
        _handleNotice(e) {
            this.emit("notice", e);
        }
        getStartupConf() {
            var e = this.connectionParameters, t = {
                user: e.user,
                database: e.database
            }, n = e.application_name || e.fallback_application_name;
            return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
        }
        cancel(e, t) {
            if (e.activeQuery === t) {
                var n = this.connection;
                this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
                    n.cancel(e.processID, e.secretKey);
                });
            } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
        }
        setTypeParser(e, t, n) {
            return this._types.setTypeParser(e, t, n);
        }
        getTypeParser(e, t) {
            return this._types.getTypeParser(e, t);
        }
        escapeIdentifier(e) {
            return '"' + e.replace(/"/g, '""') + '"';
        }
        escapeLiteral(e) {
            for(var t = !1, n = "'", i = 0; i < e.length; i++){
                var s = e[i];
                s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = !0) : n += s;
            }
            return n += "'", t === !0 && (n = " E" + n), n;
        }
        _pulseQueryQueue() {
            if (this.readyForQuery === !0) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
                this.readyForQuery = !1, this.hasExecuted = !0;
                let e = this.activeQuery.submit(this.connection);
                e && m.nextTick(()=>{
                    this.activeQuery.handleError(e, this.connection), this.readyForQuery = !0, this._pulseQueryQueue();
                });
            } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
        }
        query(e, t, n) {
            var i, s, o, u, c;
            if (e == null) throw new TypeError("Client was passed a null or undefined query");
            return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Ls(e, t, n), i.callback || (s = new this._Promise((h, l)=>{
                i.callback = (d, b)=>d ? l(d) : h(b);
            }))), o && (c = i.callback, u = setTimeout(()=>{
                var h = new Error("Query read timeout");
                m.nextTick(()=>{
                    i.handleError(h, this.connection);
                }), c(h), i.callback = ()=>{};
                var l = this.queryQueue.indexOf(i);
                l > -1 && this.queryQueue.splice(l, 1), this._pulseQueryQueue();
            }, o), i.callback = (h, l)=>{
                clearTimeout(u), c(h, l);
            }), this.binary && !i.binary && (i.binary = !0), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(()=>{
                i.handleError(new Error("Client was closed and is not queryable"), this.connection);
            }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(()=>{
                i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
            }), s);
        }
        ref() {
            this.connection.ref();
        }
        unref() {
            this.connection.unref();
        }
        end(e) {
            if (this._ending = !0, !this.connection._connecting) if (e) e();
            else return this._Promise.resolve();
            if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
            else return new this._Promise((t)=>{
                this.connection.once("end", t);
            });
        }
    };
    a(yn, "Client");
    var Ct = yn;
    Ct.Query = Ls;
    Rs.exports = Ct;
});
var Us = I((pf, ks)=>{
    "use strict";
    p();
    var Ac = ge().EventEmitter, Ms = a(function() {}, "NOOP"), Ds = a((r, e)=>{
        let t = r.findIndex(e);
        return t === -1 ? void 0 : r.splice(t, 1)[0];
    }, "removeWhere"), wn = class wn {
        constructor(e, t, n){
            this.client = e, this.idleListener = t, this.timeoutId = n;
        }
    };
    a(wn, "IdleItem");
    var mn = wn, bn = class bn {
        constructor(e){
            this.callback = e;
        }
    };
    a(bn, "PendingItem");
    var Ne = bn;
    function Cc() {
        throw new Error("Release called on client which has already been released to the pool.");
    }
    a(Cc, "throwOnDoubleRelease");
    function Tt(r, e) {
        if (e) return {
            callback: e,
            result: void 0
        };
        let t, n, i = a(function(o, u) {
            o ? t(o) : n(u);
        }, "cb"), s = new r(function(o, u) {
            n = o, t = u;
        }).catch((o)=>{
            throw Error.captureStackTrace(o), o;
        });
        return {
            callback: i,
            result: s
        };
    }
    a(Tt, "promisify");
    function Tc(r, e) {
        return a(function t(n) {
            n.client = e, e.removeListener("error", t), e.on("error", ()=>{
                r.log("additional client error after disconnection due to error", n);
            }), r._remove(e), r.emit("error", n, e);
        }, "idleListener");
    }
    a(Tc, "makeIdleListener");
    var Sn = class Sn extends Ac {
        constructor(e, t){
            super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
                configurable: !0,
                enumerable: !1,
                writable: !0,
                value: e.password
            }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", {
                enumerable: !1
            }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || !1, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {}, this.Client = this.options.Client || t || It().Client, this.Promise = this.options.Promise || S.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = new WeakSet, this._pendingQueue = [], this._endCallback = void 0, this.ending = !1, this.ended = !1;
        }
        _isFull() {
            return this._clients.length >= this.options.max;
        }
        _pulseQueue() {
            if (this.log("pulse queue"), this.ended) {
                this.log("pulse queue ended");
                return;
            }
            if (this.ending) {
                this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t)=>{
                    this._remove(t.client);
                }), this._clients.length || (this.ended = !0, this._endCallback());
                return;
            }
            if (!this._pendingQueue.length) {
                this.log("no queued requests");
                return;
            }
            if (!this._idle.length && this._isFull()) return;
            let e = this._pendingQueue.shift();
            if (this._idle.length) {
                let t = this._idle.pop();
                clearTimeout(t.timeoutId);
                let n = t.client;
                n.ref && n.ref();
                let i = t.idleListener;
                return this._acquireClient(n, e, i, !1);
            }
            if (!this._isFull()) return this.newClient(e);
            throw new Error("unexpected condition");
        }
        _remove(e) {
            let t = Ds(this._idle, (n)=>n.client === e);
            t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter((n)=>n !== e), e.end(), this.emit("remove", e);
        }
        connect(e) {
            if (this.ending) {
                let i = new Error("Cannot use a pool after calling end on the pool");
                return e ? e(i) : this.Promise.reject(i);
            }
            let t = Tt(this.Promise, e), n = t.result;
            if (this._isFull() || this._idle.length) {
                if (this._idle.length && m.nextTick(()=>this._pulseQueue()), !this.options.connectionTimeoutMillis) return this._pendingQueue.push(new Ne(t.callback)), n;
                let i = a((u, c, h)=>{
                    clearTimeout(o), t.callback(u, c, h);
                }, "queueCallback"), s = new Ne(i), o = setTimeout(()=>{
                    Ds(this._pendingQueue, (u)=>u.callback === i), s.timedOut = !0, t.callback(new Error("timeout exceeded when trying to connect"));
                }, this.options.connectionTimeoutMillis);
                return this._pendingQueue.push(s), n;
            }
            return this.newClient(new Ne(t.callback)), n;
        }
        newClient(e) {
            let t = new this.Client(this.options);
            this._clients.push(t);
            let n = Tc(this, t);
            this.log("checking client timeout");
            let i, s = !1;
            this.options.connectionTimeoutMillis && (i = setTimeout(()=>{
                this.log("ending client due to timeout"), s = !0, t.connection ? t.connection.stream.destroy() : t.end();
            }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o)=>{
                if (i && clearTimeout(i), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u)=>u !== t), s && (o.message = "Connection terminated due to connection timeout"), this._pulseQueue(), e.timedOut || e.callback(o, void 0, Ms);
                else {
                    if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
                        let u = setTimeout(()=>{
                            this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((h)=>h.client === t) !== -1 && this._acquireClient(t, new Ne((h, l, d)=>d()), n, !1);
                        }, this.options.maxLifetimeSeconds * 1e3);
                        u.unref(), t.once("end", ()=>clearTimeout(u));
                    }
                    return this._acquireClient(t, e, n, !0);
                }
            });
        }
        _acquireClient(e, t, n, i) {
            i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s)=>{
                if (s) return e.release(s), t.callback(s, void 0, Ms);
                t.callback(void 0, e, e.release);
            }) : t.callback(void 0, e, e.release);
        }
        _releaseOnce(e, t) {
            let n = !1;
            return (i)=>{
                n && Cc(), n = !0, this._release(e, t, i);
            };
        }
        _release(e, t, n) {
            if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
                e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
                return;
            }
            if (this._expired.has(e)) {
                this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
                return;
            }
            let s;
            this.options.idleTimeoutMillis && (s = setTimeout(()=>{
                this.log("remove idle client"), this._remove(e);
            }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new mn(e, t, s)), this._pulseQueue();
        }
        query(e, t, n) {
            if (typeof e == "function") {
                let s = Tt(this.Promise, e);
                return x(function() {
                    return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
                }), s.result;
            }
            typeof t == "function" && (n = t, t = void 0);
            let i = Tt(this.Promise, n);
            return n = i.callback, this.connect((s, o)=>{
                if (s) return n(s);
                let u = !1, c = a((h)=>{
                    u || (u = !0, o.release(h), n(h));
                }, "onError");
                o.once("error", c), this.log("dispatching query");
                try {
                    o.query(e, t, (h, l)=>{
                        if (this.log("query dispatched"), o.removeListener("error", c), !u) return u = !0, o.release(h), h ? n(h) : n(void 0, l);
                    });
                } catch (h) {
                    return o.release(h), n(h);
                }
            }), i.result;
        }
        end(e) {
            if (this.log("ending"), this.ending) {
                let n = new Error("Called end on pool more than once");
                return e ? e(n) : this.Promise.reject(n);
            }
            this.ending = !0;
            let t = Tt(this.Promise, e);
            return this._endCallback = t.callback, this._pulseQueue(), t.result;
        }
        get waitingCount() {
            return this._pendingQueue.length;
        }
        get idleCount() {
            return this._idle.length;
        }
        get expiredCount() {
            return this._clients.reduce((e, t)=>e + (this._expired.has(t) ? 1 : 0), 0);
        }
        get totalCount() {
            return this._clients.length;
        }
    };
    a(Sn, "Pool");
    var gn = Sn;
    ks.exports = gn;
});
var Os = {};
se(Os, {
    default: ()=>Ic
});
var Ic, Ns = z(()=>{
    "use strict";
    p();
    Ic = {};
});
var qs = I((gf, Pc)=>{
    Pc.exports = {
        name: "pg",
        version: "8.8.0",
        description: "PostgreSQL client - pure javascript & libpq with the same API",
        keywords: [
            "database",
            "libpq",
            "pg",
            "postgre",
            "postgres",
            "postgresql",
            "rdbms"
        ],
        homepage: "https://github.com/brianc/node-postgres",
        repository: {
            type: "git",
            url: "git://github.com/brianc/node-postgres.git",
            directory: "packages/pg"
        },
        author: "Brian Carlson <brian.m.carlson@gmail.com>",
        main: "./lib",
        dependencies: {
            "buffer-writer": "2.0.0",
            "packet-reader": "1.0.0",
            "pg-connection-string": "^2.5.0",
            "pg-pool": "^3.5.2",
            "pg-protocol": "^1.5.0",
            "pg-types": "^2.1.0",
            pgpass: "1.x"
        },
        devDependencies: {
            async: "2.6.4",
            bluebird: "3.5.2",
            co: "4.6.0",
            "pg-copy-streams": "0.3.0"
        },
        peerDependencies: {
            "pg-native": ">=3.0.1"
        },
        peerDependenciesMeta: {
            "pg-native": {
                optional: !0
            }
        },
        scripts: {
            test: "make test-all"
        },
        files: [
            "lib",
            "SPONSORS.md"
        ],
        license: "MIT",
        engines: {
            node: ">= 8.0.0"
        },
        gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655"
    };
});
var Ws = I((wf, js)=>{
    "use strict";
    p();
    var Qs = ge().EventEmitter, Bc = (Ge(), O(He)), xn = tt(), qe = js.exports = function(r, e, t) {
        Qs.call(this), r = xn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = !1, this.on("newListener", (function(n) {
            n === "row" && (this._emitRowEvents = !0);
        }).bind(this));
    };
    Bc.inherits(qe, Qs);
    var Lc = {
        sqlState: "code",
        statementPosition: "position",
        messagePrimary: "message",
        context: "where",
        schemaName: "schema",
        tableName: "table",
        columnName: "column",
        dataTypeName: "dataType",
        constraintName: "constraint",
        sourceFile: "file",
        sourceLine: "line",
        sourceFunction: "routine"
    };
    qe.prototype.handleError = function(r) {
        var e = this.native.pq.resultErrorFields();
        if (e) for(var t in e){
            var n = Lc[t] || t;
            r[n] = e[t];
        }
        this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
    };
    qe.prototype.then = function(r, e) {
        return this._getPromise().then(r, e);
    };
    qe.prototype.catch = function(r) {
        return this._getPromise().catch(r);
    };
    qe.prototype._getPromise = function() {
        return this._promise ? this._promise : (this._promise = new Promise((function(r, e) {
            this._once("end", r), this._once("error", e);
        }).bind(this)), this._promise);
    };
    qe.prototype.submit = function(r) {
        this.state = "running";
        var e = this;
        this.native = r.native, r.native.arrayMode = this._arrayMode;
        var t = a(function(s, o, u) {
            if (r.native.arrayMode = !1, x(function() {
                e.emit("_done");
            }), s) return e.handleError(s);
            e._emitRowEvents && (u.length > 1 ? o.forEach((c, h)=>{
                c.forEach((l)=>{
                    e.emit("row", l, u[h]);
                });
            }) : o.forEach(function(c) {
                e.emit("row", c, u);
            })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
        }, "after");
        if (m.domain && (t = m.domain.bind(t)), this.name) {
            this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
            var n = (this.values || []).map(xn.prepareValue);
            if (r.namedQueries[this.name]) {
                if (this.text && r.namedQueries[this.name] !== this.text) {
                    let s = new Error(`Pre\
pared statements must be unique - '${this.name}' was used for a different statem\
ent`);
                    return t(s);
                }
                return r.native.execute(this.name, n, t);
            }
            return r.native.prepare(this.name, this.text, n.length, function(s) {
                return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
            });
        } else if (this.values) {
            if (!Array.isArray(this.values)) {
                let s = new Error("Query values must be an array");
                return t(s);
            }
            var i = this.values.map(xn.prepareValue);
            r.native.query(this.text, i, t);
        } else r.native.query(this.text, t);
    };
});
var Vs = I((Ef, $s)=>{
    "use strict";
    p();
    var Rc = (Ns(), O(Os)), Fc = wt(), xf = qs(), Hs = ge().EventEmitter, Mc = (Ge(), O(He)), Dc = bt(), Gs = Ws(), J = $s.exports = function(r) {
        Hs.call(this), r = r || {}, this._Promise = r.Promise || S.Promise, this._types = new Fc(r.types), this.native = new Rc({
            types: this._types
        }), this._queryQueue = [], this._ending = !1, this._connecting = !1, this._connected = !1, this._queryable = !0;
        var e = this.connectionParameters = new Dc(r);
        this.user = e.user, Object.defineProperty(this, "password", {
            configurable: !0,
            enumerable: !1,
            writable: !0,
            value: e.password
        }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
    };
    J.Query = Gs;
    Mc.inherits(J, Hs);
    J.prototype._errorAllQueries = function(r) {
        let e = a((t)=>{
            m.nextTick(()=>{
                t.native = this.native, t.handleError(r);
            });
        }, "enqueueError");
        this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
    };
    J.prototype._connect = function(r) {
        var e = this;
        if (this._connecting) {
            m.nextTick(()=>r(new Error("Client has already been connected. You cannot reuse a client.")));
            return;
        }
        this._connecting = !0, this.connectionParameters.getLibpqConnectionString(function(t, n) {
            if (t) return r(t);
            e.native.connect(n, function(i) {
                if (i) return e.native.end(), r(i);
                e._connected = !0, e.native.on("error", function(s) {
                    e._queryable = !1, e._errorAllQueries(s), e.emit("error", s);
                }), e.native.on("notification", function(s) {
                    e.emit("notification", {
                        channel: s.relname,
                        payload: s.extra
                    });
                }), e.emit("connect"), e._pulseQueryQueue(!0), r();
            });
        });
    };
    J.prototype.connect = function(r) {
        if (r) {
            this._connect(r);
            return;
        }
        return new this._Promise((e, t)=>{
            this._connect((n)=>{
                n ? t(n) : e();
            });
        });
    };
    J.prototype.query = function(r, e, t) {
        var n, i, s, o, u;
        if (r == null) throw new TypeError("Client was passed a null or undefined query");
        if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
        else if (s = this.connectionParameters.query_timeout, n = new Gs(r, e, t), !n.callback) {
            let c, h;
            i = new this._Promise((l, d)=>{
                c = l, h = d;
            }), n.callback = (l, d)=>l ? h(l) : c(d);
        }
        return s && (u = n.callback, o = setTimeout(()=>{
            var c = new Error("Query read timeout");
            m.nextTick(()=>{
                n.handleError(c, this.connection);
            }), u(c), n.callback = ()=>{};
            var h = this._queryQueue.indexOf(n);
            h > -1 && this._queryQueue.splice(h, 1), this._pulseQueryQueue();
        }, s), n.callback = (c, h)=>{
            clearTimeout(o), u(c, h);
        }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(()=>{
            n.handleError(new Error("Client was closed and is not queryable"));
        }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(()=>{
            n.handleError(new Error("Client has encountered a connection error and is not queryable"));
        }), i);
    };
    J.prototype.end = function(r) {
        var e = this;
        this._ending = !0, this._connected || this.once("connect", this.end.bind(this, r));
        var t;
        return r || (t = new this._Promise(function(n, i) {
            r = a((s)=>s ? i(s) : n(), "cb");
        })), this.native.end(function() {
            e._errorAllQueries(new Error("Connection terminated")), m.nextTick(()=>{
                e.emit("end"), r && r();
            });
        }), t;
    };
    J.prototype._hasActiveQuery = function() {
        return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    J.prototype._pulseQueryQueue = function(r) {
        if (this._connected && !this._hasActiveQuery()) {
            var e = this._queryQueue.shift();
            if (!e) {
                r || this.emit("drain");
                return;
            }
            this._activeQuery = e, e.submit(this);
            var t = this;
            e.once("_done", function() {
                t._pulseQueryQueue();
            });
        }
    };
    J.prototype.cancel = function(r) {
        this._activeQuery === r ? this.native.cancel(function() {}) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
    };
    J.prototype.ref = function() {};
    J.prototype.unref = function() {};
    J.prototype.setTypeParser = function(r, e, t) {
        return this._types.setTypeParser(r, e, t);
    };
    J.prototype.getTypeParser = function(r, e) {
        return this._types.getTypeParser(r, e);
    };
});
var En = I((Af, Ks)=>{
    "use strict";
    p();
    Ks.exports = Vs();
});
var It = I((Tf, nt)=>{
    "use strict";
    p();
    var kc = Fs(), Uc = et(), Oc = pn(), Nc = Us(), { DatabaseError: qc } = hn(), Qc = a((r)=>{
        var e;
        return e = class extends Nc {
            constructor(n){
                super(n, r);
            }
        }, a(e, "BoundPool"), e;
    }, "poolFactory"), vn = a(function(r) {
        this.defaults = Uc, this.Client = r, this.Query = this.Client.Query, this.Pool = Qc(this.Client), this._pools = [], this.Connection = Oc, this.types = Xe(), this.DatabaseError = qc;
    }, "PG");
    typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? nt.exports = new vn(En()) : (nt.exports = new vn(kc), Object.defineProperty(nt.exports, "native", {
        configurable: !0,
        enumerable: !1,
        get () {
            var r = null;
            try {
                r = new vn(En());
            } catch (e) {
                if (e.code !== "MODULE_NOT_FOUND") throw e;
            }
            return Object.defineProperty(nt.exports, "native", {
                value: r
            }), r;
        }
    }));
});
p();
var Bt = Te(It());
St();
p();
St();
mr();
var Zs = Te(tt()), Js = Te(wt());
function jc(r) {
    return r instanceof y ? "\\x" + r.toString("hex") : r;
}
a(jc, "encodeBuffersAsBytea");
var Pt = class Pt extends Error {
    constructor(t){
        super(t);
        _(this, "name", "NeonDbError");
        _(this, "severity");
        _(this, "code");
        _(this, "detail");
        _(this, "hint");
        _(this, "position");
        _(this, "internalPosition");
        _(this, "internalQuery");
        _(this, "where");
        _(this, "schema");
        _(this, "table");
        _(this, "column");
        _(this, "dataType");
        _(this, "constraint");
        _(this, "file");
        _(this, "line");
        _(this, "routine");
        _(this, "sourceError");
        "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, Pt);
    }
};
a(Pt, "NeonDbError");
var pe = Pt, zs = "transaction() expects an array of queries, or a function returning an array of queries", Wc = [
    "severity",
    "code",
    "detail",
    "hint",
    "position",
    "internalPosition",
    "internalQuery",
    "where",
    "schema",
    "table",
    "column",
    "dataType",
    "constraint",
    "file",
    "line",
    "routine"
];
function Xs(r, { arrayMode: e, fullResults: t, fetchOptions: n, isolationLevel: i, readOnly: s, deferrable: o, queryCallback: u, resultCallback: c, authToken: h } = {}) {
    if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
    let l;
    try {
        l = yr(r);
    } catch  {
        throw new Error("Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r));
    }
    let { protocol: d, username: b, hostname: C, port: B, pathname: Q } = l;
    if (d !== "postgres:" && d !== "postgresql:" || !b || !C || !Q) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
    function X(A, ...g) {
        let P, K;
        if (typeof A == "string") P = A, K = g[1], g = g[0] ?? [];
        else {
            P = "";
            for(let j = 0; j < A.length; j++)P += A[j], j < g.length && (P += "$" + (j + 1));
        }
        g = g.map((j)=>jc((0, Zs.prepareValue)(j)));
        let k = {
            query: P,
            params: g
        };
        return u && u(k), Hc(de, k, K);
    }
    a(X, "resolve"), X.transaction = async (A, g)=>{
        if (typeof A == "function" && (A = A(X)), !Array.isArray(A)) throw new Error(zs);
        A.forEach((k)=>{
            if (k[Symbol.toStringTag] !== "NeonQueryPromise") throw new Error(zs);
        });
        let P = A.map((k)=>k.parameterizedQuery), K = A.map((k)=>k.opts ?? {});
        return de(P, K, g);
    };
    async function de(A, g, P) {
        let { fetchEndpoint: K, fetchFunction: k } = _e, j = Array.isArray(A) ? {
            queries: A
        } : A, ee = n ?? {}, oe = e ?? !1, R = t ?? !1, $ = i, ce = s, ye = o;
        P !== void 0 && (P.fetchOptions !== void 0 && (ee = {
            ...ee,
            ...P.fetchOptions
        }), P.arrayMode !== void 0 && (oe = P.arrayMode), P.fullResults !== void 0 && (R = P.fullResults), P.isolationLevel !== void 0 && ($ = P.isolationLevel), P.readOnly !== void 0 && (ce = P.readOnly), P.deferrable !== void 0 && (ye = P.deferrable)), g !== void 0 && !Array.isArray(g) && g.fetchOptions !== void 0 && (ee = {
            ...ee,
            ...g.fetchOptions
        });
        let Se = h;
        !Array.isArray(g) && g?.authToken !== void 0 && (Se = g.authToken);
        let je = typeof K == "function" ? K(C, B, {
            jwtAuth: Se !== void 0
        }) : K, he = {
            "Neon-Connection-String": r,
            "Neon-Raw-Text-Output": "true",
            "Neon-Array-Mode": "true"
        }, it = await Gc(Se);
        it && (he.Authorization = `Bearer ${it}`), Array.isArray(A) && ($ !== void 0 && (he["Neon-Batch-Isolation-Level"] = $), ce !== void 0 && (he["Neon-Batch-Read-Only"] = String(ce)), ye !== void 0 && (he["Neon-Batch-Deferrable"] = String(ye)));
        let te;
        try {
            te = await (k ?? fetch)(je, {
                method: "POST",
                body: JSON.stringify(j),
                headers: he,
                ...ee
            });
        } catch (W) {
            let H = new pe(`Error connecting to database: ${W.message}`);
            throw H.sourceError = W, H;
        }
        if (te.ok) {
            let W = await te.json();
            if (Array.isArray(A)) {
                let H = W.results;
                if (!Array.isArray(H)) throw new pe("Neon internal error: unexpected result format");
                return H.map((Ae, xe)=>{
                    let Lt = g[xe] ?? {}, ro = Lt.arrayMode ?? oe, no = Lt.fullResults ?? R;
                    return Ys(Ae, {
                        arrayMode: ro,
                        fullResults: no,
                        parameterizedQuery: A[xe],
                        resultCallback: c,
                        types: Lt.types
                    });
                });
            } else {
                let H = g ?? {}, Ae = H.arrayMode ?? oe, xe = H.fullResults ?? R;
                return Ys(W, {
                    arrayMode: Ae,
                    fullResults: xe,
                    parameterizedQuery: A,
                    resultCallback: c,
                    types: H.types
                });
            }
        } else {
            let { status: W } = te;
            if (W === 400) {
                let H = await te.json(), Ae = new pe(H.message);
                for (let xe of Wc)Ae[xe] = H[xe] ?? void 0;
                throw Ae;
            } else {
                let H = await te.text();
                throw new pe(`Server er\
ror (HTTP status ${W}): ${H}`);
            }
        }
    }
    return a(de, "execute"), X;
}
a(Xs, "neon");
function Hc(r, e, t) {
    return {
        [Symbol.toStringTag]: "NeonQueryPromise",
        parameterizedQuery: e,
        opts: t,
        then: a((n, i)=>r(e, t).then(n, i), "then"),
        catch: a((n)=>r(e, t).catch(n), "catch"),
        finally: a((n)=>r(e, t).finally(n), "finally")
    };
}
a(Hc, "createNeonQueryPromise");
function Ys(r, { arrayMode: e, fullResults: t, parameterizedQuery: n, resultCallback: i, types: s }) {
    let o = new Js.default(s), u = r.fields.map((l)=>l.name), c = r.fields.map((l)=>o.getTypeParser(l.dataTypeID)), h = e === !0 ? r.rows.map((l)=>l.map((d, b)=>d === null ? null : c[b](d))) : r.rows.map((l)=>Object.fromEntries(l.map((d, b)=>[
                u[b],
                d === null ? null : c[b](d)
            ])));
    return i && i(n, r, h, {
        arrayMode: e,
        fullResults: t
    }), t ? (r.viaNeonFetch = !0, r.rowAsArray = e, r.rows = h, r._parsers = c, r._types = o, r) : h;
}
a(Ys, "processQueryResult");
async function Gc(r) {
    if (typeof r == "string") return r;
    if (typeof r == "function") try {
        return await Promise.resolve(r());
    } catch (e) {
        let t = new pe("Error getting auth token.");
        throw e instanceof Error && (t = new pe(`Error getting auth toke\
n: ${e.message}`)), t;
    }
}
a(Gc, "getAuthToken");
var to = Te(bt()), Qe = Te(It());
var An = class An extends Bt.Client {
    constructor(t){
        super(t);
        this.config = t;
    }
    get neonConfig() {
        return this.connection.stream;
    }
    connect(t) {
        let { neonConfig: n } = this;
        n.forceDisablePgSSL && (this.ssl = this.connection.ssl = !1), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
        let i = this.config?.host !== void 0 || this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
        if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No datab\
ase host or connection string was set, and key parameters have default values (h\
ost: localhost, user: ${s}, db: ${s}, password: null). Is an environment variabl\
e missing? Alternatively, if you intended to connect with these parameters, plea\
se set the host to 'localhost' explicitly.`);
        let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
        if (!u && !n.pipelineConnect) return o;
        let h = this.connection;
        if (u && h.on("connect", ()=>h.stream.emit("data", "S")), c) {
            h.removeAllListeners("authenticationCleartextPassword"), h.removeAllListeners("readyForQuery"), h.once("readyForQuery", ()=>h.on("readyForQuery", this._handleReadyForQuery.bind(this)));
            let l = this.ssl ? "sslconnect" : "connect";
            h.on(l, ()=>{
                this._handleAuthCleartextPassword(), this._handleReadyForQuery();
            });
        }
        return o;
    }
    async _handleAuthSASLContinue(t) {
        let n = this.saslSession, i = this.password, s = t.data;
        if (n.message !== "SASLInitialResponse" || typeof i != "string" || typeof s != "string") throw new Error("SASL: protocol error");
        let o = Object.fromEntries(s.split(",").map((te)=>{
            if (!/^.=/.test(te)) throw new Error("SASL: Invalid attribute pair entry");
            let W = te[0], H = te.substring(2);
            return [
                W,
                H
            ];
        })), u = o.r, c = o.s, h = o.i;
        if (!u || !/^[!-+--~]+$/.test(u)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
        if (!c || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64");
        if (!h || !/^[1-9][0-9]*$/.test(h)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count");
        if (!u.startsWith(n.clientNonce)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
        if (u.length === n.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
        let l = parseInt(h, 10), d = y.from(c, "base64"), b = new TextEncoder, C = b.encode(i), B = await w.subtle.importKey("raw", C, {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            }
        }, !1, [
            "sign"
        ]), Q = new Uint8Array(await w.subtle.sign("HMAC", B, y.concat([
            d,
            y.from([
                0,
                0,
                0,
                1
            ])
        ]))), X = Q;
        for(var de = 0; de < l - 1; de++)Q = new Uint8Array(await w.subtle.sign("HMAC", B, Q)), X = y.from(X.map((te, W)=>X[W] ^ Q[W]));
        let A = X, g = await w.subtle.importKey("raw", A, {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            }
        }, !1, [
            "sign"
        ]), P = new Uint8Array(await w.subtle.sign("HMAC", g, b.encode("Client Key"))), K = await w.subtle.digest("SHA-256", P), k = "n=*,r=" + n.clientNonce, j = "r=" + u + ",s=" + c + ",i=" + l, ee = "c=biws,r=" + u, oe = k + "," + j + "," + ee, R = await w.subtle.importKey("raw", K, {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            }
        }, !1, [
            "sign"
        ]);
        var $ = new Uint8Array(await w.subtle.sign("HMAC", R, b.encode(oe))), ce = y.from(P.map((te, W)=>P[W] ^ $[W])), ye = ce.toString("base64");
        let Se = await w.subtle.importKey("raw", A, {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            }
        }, !1, [
            "sign"
        ]), je = await w.subtle.sign("HMAC", Se, b.encode("Server Key")), he = await w.subtle.importKey("raw", je, {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            }
        }, !1, [
            "sign"
        ]);
        var it = y.from(await w.subtle.sign("HMAC", he, b.encode(oe)));
        n.message = "SASLResponse", n.serverSignature = it.toString("base64"), n.response = ee + ",p=" + ye, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
};
a(An, "NeonClient");
var _n = An;
function $c(r, e) {
    if (e) return {
        callback: e,
        result: void 0
    };
    let t, n, i = a(function(o, u) {
        o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
        n = o, t = u;
    });
    return {
        callback: i,
        result: s
    };
}
a($c, "promisify");
var Cn = class Cn extends Bt.Pool {
    constructor(){
        super(...arguments);
        _(this, "Client", _n);
        _(this, "hasFetchUnsupportedListeners", !1);
    }
    on(t, n) {
        return t !== "error" && (this.hasFetchUnsupportedListeners = !0), super.on(t, n);
    }
    query(t, n, i) {
        if (!_e.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function") return super.query(t, n, i);
        typeof n == "function" && (i = n, n = void 0);
        let s = $c(this.Promise, i);
        i = s.callback;
        try {
            let o = new to.default(this.options), u = encodeURIComponent, c = encodeURI, h = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, l = typeof t == "string" ? t : t.text, d = n ?? t.values ?? [];
            Xs(h, {
                fullResults: !0,
                arrayMode: t.rowMode === "array"
            })(l, d, {
                types: t.types ?? this.options?.types
            }).then((C)=>i(void 0, C)).catch((C)=>i(C));
        } catch (o) {
            i(o);
        }
        return s.result;
    }
};
a(Cn, "NeonPool");
var eo = (/* unused pure expression or super */ null && (Cn));
var export_ClientBase = Qe.ClientBase;
var export_Connection = Qe.Connection;
var export_DatabaseError = Qe.DatabaseError;
var export_Query = Qe.Query;
var export_defaults = Qe.defaults;
var export_types = Qe.types;
 /*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/ 


/***/ })

};
;