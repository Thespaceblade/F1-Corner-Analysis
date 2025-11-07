"use strict";
(() => {
var exports = {};
exports.id = 497;
exports.ids = [497];
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

/***/ 83191:
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

// NAMESPACE OBJECT: ./app/api/sessions/[year]/[round]/[session]/route.ts
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
;// CONCATENATED MODULE: ./app/api/sessions/[year]/[round]/[session]/route.ts




function resolveSessionPath(year, round, session) {
    return external_path_default().join(process.cwd(), "public", "data", "sessions", year, round, session, "session.json");
}
function normalizeDriverCodes(raw) {
    if (!raw) return [];
    return raw.split(",").map((code)=>code.trim().toUpperCase()).filter(Boolean);
}
function filterDrivers(payload, driverCodes) {
    if (!driverCodes.length) {
        return payload;
    }
    const allDrivers = Object.keys(payload?.drivers ?? {});
    const requested = driverCodes;
    const foundSet = new Set(allDrivers.filter((code)=>requested.includes(code)));
    const missing = requested.filter((code)=>!foundSet.has(code));
    const filteredDrivers = Object.fromEntries(Object.entries(payload?.drivers ?? {}).filter(([code])=>foundSet.has(code)));
    const filteredLaps = (payload?.laps ?? []).filter((lap)=>foundSet.has(lap.driver));
    const filteredCorners = Object.fromEntries(Object.entries(payload?.corners ?? {}).filter(([code])=>foundSet.has(code)));
    const meta = {
        ...payload?.meta ?? {},
        requestedDrivers: requested,
        filteredDrivers: Array.from(foundSet),
        missingDrivers: missing
    };
    const notes = Array.isArray(payload?.notes) ? [
        ...payload.notes
    ] : [];
    if (missing.length) {
        notes.push(`Drivers not found in dataset: ${missing.join(", ")}`);
    }
    if (!foundSet.size) {
        notes.push("No drivers matched the current filter.");
    }
    return {
        ...payload,
        meta,
        drivers: filteredDrivers,
        laps: filteredLaps,
        corners: filteredCorners,
        notes
    };
}
async function GET(request, { params }) {
    const { year, round, session } = params;
    const sessionPath = resolveSessionPath(year, round, session.toUpperCase());
    const url = new URL(request.url);
    const driversFilter = normalizeDriverCodes(url.searchParams.get("drivers"));
    try {
        if ((0,db/* isDatabaseEnabled */.M)()) {
            const sql = (0,db/* getDb */.z)();
            const sessionRows = await sql`select * from sessions where year=${Number(year)} and round_slug=${round} and session_code=${session.toUpperCase()} limit 1`;
            if (!sessionRows.length) {
                throw new Error("Session not found in database");
            }
            const s = sessionRows[0];
            const lapsQuery = driversFilter.length ? sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id} and driver_code = any(${driversFilter})` : sql`select driver_code, lap_number, stint, compound, tyre_life, lap_time_seconds, sector1_seconds, sector2_seconds, sector3_seconds, track_status, flags, is_valid from laps where session_id=${s.id}`;
            const laps = await lapsQuery;
            const driverCodes = Array.from(new Set(laps.map((l)=>(l.driver_code || "").toUpperCase()).filter(Boolean)));
            const driverRows = driverCodes.length ? await sql`select code, team, number from drivers where code = any(${driverCodes})` : [];
            const drivers = Object.fromEntries(driverRows.map((d)=>[
                    d.code.toUpperCase(),
                    {
                        code: d.code.toUpperCase(),
                        team: d.team,
                        number: d.number,
                        defaultCompound: null
                    }
                ]));
            const lapsPayload = laps.map((l)=>({
                    driver: (l.driver_code || "").toUpperCase(),
                    lapNumber: l.lap_number ?? null,
                    stint: l.stint ?? null,
                    compound: l.compound ?? null,
                    tyreLife: l.tyre_life ?? null,
                    lapTimeSeconds: l.lap_time_seconds ?? null,
                    sectorTimesSeconds: [
                        l.sector1_seconds ?? null,
                        l.sector2_seconds ?? null,
                        l.sector3_seconds ?? null
                    ],
                    isPersonalBest: false,
                    trackStatus: l.track_status ?? null,
                    hasData: true,
                    flags: Array.isArray(l.flags) ? l.flags : [],
                    isValid: typeof l.is_valid === "boolean" ? l.is_valid : undefined
                }));
            const payload = {
                meta: {
                    year: s.year,
                    round: s.round_slug,
                    session: s.session_code,
                    generatedAt: s.generated_at ?? undefined,
                    requestedDrivers: driversFilter.length ? driversFilter : null,
                    event: {
                        name: s.event_name,
                        country: s.country,
                        officialName: s.official_name
                    },
                    availableDrivers: driverCodes
                },
                drivers,
                laps: lapsPayload,
                corners: Object.fromEntries(driverCodes.map((c)=>[
                        c,
                        []
                    ])),
                notes: []
            };
            return next_response/* default */.Z.json(payload);
        }
        const raw = await external_fs_.promises.readFile(sessionPath, "utf8");
        const payload = JSON.parse(raw);
        const filtered = filterDrivers(payload, driversFilter);
        return next_response/* default */.Z.json(filtered);
    } catch (error) {
        return next_response/* default */.Z.json({
            error: "Session data not found",
            details: error instanceof Error ? error.message : String(error),
            params
        }, {
            status: 404
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?page=%2Fapi%2Fsessions%2F%5Byear%5D%2F%5Bround%5D%2F%5Bsession%5D%2Froute&name=app%2Fapi%2Fsessions%2F%5Byear%5D%2F%5Bround%5D%2F%5Bsession%5D%2Froute&pagePath=private-next-app-dir%2Fapi%2Fsessions%2F%5Byear%5D%2F%5Bround%5D%2F%5Bsession%5D%2Froute.ts&appDir=%2FUsers%2Fjasoncharwin%2FPersonal%20Code%20Projects%2FF1-Corner-Analysis%2Fapp&appPaths=%2Fapi%2Fsessions%2F%5Byear%5D%2F%5Bround%5D%2F%5Bsession%5D%2Froute&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!

    

    

    

    const options = {"definition":{"kind":"APP_ROUTE","page":"/api/sessions/[year]/[round]/[session]/route","pathname":"/api/sessions/[year]/[round]/[session]","filename":"route","bundlePath":"app/api/sessions/[year]/[round]/[session]/route"},"resolvedPagePath":"/Users/jasoncharwin/Personal Code Projects/F1-Corner-Analysis/app/api/sessions/[year]/[round]/[session]/route.ts","nextConfigOutput":""}
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

    const originalPathname = "/api/sessions/[year]/[round]/[session]/route"

    

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
var __webpack_require__ = require("../../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [399,170], () => (__webpack_exec__(83191)));
module.exports = __webpack_exports__;

})();