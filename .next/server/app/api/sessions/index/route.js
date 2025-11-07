"use strict";
(() => {
var exports = {};
exports.id = 793;
exports.ids = [793];
exports.modules = {

/***/ 57147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 22037:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 71017:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 82701:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  headerHooks: () => (/* binding */ headerHooks),
  originalPathname: () => (/* binding */ originalPathname),
  requestAsyncStorage: () => (/* binding */ requestAsyncStorage),
  routeModule: () => (/* binding */ routeModule),
  serverHooks: () => (/* binding */ serverHooks),
  staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),
  staticGenerationBailout: () => (/* binding */ staticGenerationBailout)
});

// NAMESPACE OBJECT: ./app/api/sessions/index/route.ts
var route_namespaceObject = {};
__webpack_require__.r(route_namespaceObject);
__webpack_require__.d(route_namespaceObject, {
  GET: () => (GET)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/node-polyfill-headers.js
var node_polyfill_headers = __webpack_require__(45050);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/app-route/module.js
var app_route_module = __webpack_require__(71910);
var module_default = /*#__PURE__*/__webpack_require__.n(app_route_module);
// EXTERNAL MODULE: ./node_modules/next/dist/server/web/exports/next-response.js
var next_response = __webpack_require__(18847);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(57147);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(71017);
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_);
// EXTERNAL MODULE: ./lib/db.ts
var db = __webpack_require__(26845);
;// CONCATENATED MODULE: ./app/api/sessions/index/route.ts




async function exists(filePath) {
    try {
        await external_fs_.promises.access(filePath);
        return true;
    } catch  {
        return false;
    }
}
async function GET() {
    const index = {
        years: {}
    };
    try {
        if ((0,db/* isDatabaseEnabled */.M)()) {
            const sql = (0,db/* getDb */.z)();
            const rows = await sql`select distinct year, round_slug, session_code from sessions order by year, round_slug, session_code`;
            for (const row of rows){
                const y = String(row.year);
                if (!index.years[y]) index.years[y] = {
                    rounds: []
                };
                const entry = index.years[y];
                let round = entry.rounds.find((r)=>r.id === row.round_slug);
                if (!round) {
                    round = {
                        id: row.round_slug,
                        sessions: []
                    };
                    entry.rounds.push(round);
                }
                if (!round.sessions.includes(row.session_code)) {
                    round.sessions.push(row.session_code);
                }
            }
            // sort rounds and sessions
            for (const y of Object.keys(index.years)){
                index.years[y].rounds.sort((a, b)=>a.id.localeCompare(b.id));
                index.years[y].rounds.forEach((r)=>r.sessions.sort());
            }
            return next_response/* default */.Z.json(index);
        }
        const root = external_path_default().join(process.cwd(), "public", "data", "sessions");
        const years = await external_fs_.promises.readdir(root, {
            withFileTypes: true
        });
        for (const yearDir of years){
            if (!yearDir.isDirectory()) continue;
            const year = yearDir.name;
            const yearPath = external_path_default().join(root, year);
            const rounds = [];
            const roundDirs = await external_fs_.promises.readdir(yearPath, {
                withFileTypes: true
            });
            for (const rd of roundDirs){
                if (!rd.isDirectory()) continue;
                const roundId = rd.name;
                const roundPath = external_path_default().join(yearPath, roundId);
                const sessionDirs = await external_fs_.promises.readdir(roundPath, {
                    withFileTypes: true
                });
                const sessions = [];
                for (const sd of sessionDirs){
                    if (!sd.isDirectory()) continue;
                    const sessionCode = sd.name;
                    const sessionJson = external_path_default().join(roundPath, sessionCode, "session.json");
                    if (await exists(sessionJson)) {
                        sessions.push(sessionCode);
                    }
                }
                if (sessions.length) {
                    rounds.push({
                        id: roundId,
                        sessions: sessions.sort()
                    });
                }
            }
            if (rounds.length) {
                index.years[year] = {
                    rounds: rounds.sort((a, b)=>a.id.localeCompare(b.id))
                };
            }
        }
        return next_response/* default */.Z.json(index);
    } catch (error) {
        return next_response/* default */.Z.json({
            error: "Failed to scan sessions",
            details: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fsessions%2Findex%2Froute&name=app%2Fapi%2Fsessions%2Findex%2Froute&pagePath=private-next-app-dir%2Fapi%2Fsessions%2Findex%2Froute.ts&appDir=%2FUsers%2Fjasoncharwin%2FPersonal%20Code%20Projects%2FF1-Corner-Analysis%2Fapp&appPaths=%2Fapi%2Fsessions%2Findex%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

    

    

    

    const options = {"definition":{"kind":"APP_ROUTE","page":"/api/sessions/index/route","pathname":"/api/sessions/index","filename":"route","bundlePath":"app/api/sessions/index/route"},"resolvedPagePath":"/Users/jasoncharwin/Personal Code Projects/F1-Corner-Analysis/app/api/sessions/index/route.ts","nextConfigOutput":""}
    const routeModule = new (module_default())({
      ...options,
      userland: route_namespaceObject,
    })

    // Pull out the exports that we need to expose from the module. This should
    // be eliminated when we've moved the other routes to the new format. These
    // are used to hook into the route.
    const {
      requestAsyncStorage,
      staticGenerationAsyncStorage,
      serverHooks,
      headerHooks,
      staticGenerationBailout
    } = routeModule

    const originalPathname = "/api/sessions/index/route"

    

/***/ }),

/***/ 26845:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   M: () => (/* binding */ isDatabaseEnabled),
/* harmony export */   z: () => (/* binding */ getDb)
/* harmony export */ });
/* harmony import */ var _neondatabase_serverless__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(34260);
// Lightweight Neon client for serverless Postgres on Vercel
// Switch on by setting process.env.DATA_SOURCE = 'database' and providing DATABASE_URL

function isDatabaseEnabled() {
    return typeof process.env.DATA_SOURCE === "string" && process.env.DATA_SOURCE.toLowerCase() === "database" && typeof process.env.DATABASE_URL === "string" && !!process.env.DATABASE_URL;
}
function getDb() {
    if (!isDatabaseEnabled()) {
        throw new Error("Database not enabled. Set DATA_SOURCE=database and DATABASE_URL.");
    }
    const connection = process.env.DATABASE_URL;
    return (0,_neondatabase_serverless__WEBPACK_IMPORTED_MODULE_0__/* .neon */ .qn)(connection);
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [399,170], () => (__webpack_exec__(82701)));
module.exports = __webpack_exports__;

})();