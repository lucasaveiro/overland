var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/auth_logout.mjs
var auth_logout_exports = {};
__export(auth_logout_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(auth_logout_exports);
var json = (status, data, event) => {
  const origin = event?.headers?.origin || "";
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Vary": "Origin"
  };
  return { statusCode: status, headers: cors, body: JSON.stringify(data) };
};
async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {}, event);
  return {
    ...json(200, { ok: true }, event),
    headers: { ...json(200, {}, event).headers, "Set-Cookie": "session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict" }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=auth_logout.js.map
