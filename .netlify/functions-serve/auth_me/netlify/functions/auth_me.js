var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/auth_me.mjs
var auth_me_exports = {};
__export(auth_me_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(auth_me_exports);
var import_crypto = __toESM(require("crypto"), 1);
var SESSION_SECRET = (process.env.SESSION_SECRET || "").trim();
var json = (status, data, event) => {
  const origin = event?.headers?.origin || "";
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Vary": "Origin"
  };
  return { statusCode: status, headers: cors, body: JSON.stringify(data) };
};
function verify(token) {
  if (!token || !SESSION_SECRET) return null;
  const [body, sig] = token.split(".");
  const expected = import_crypto.default.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp < Math.floor(Date.now() / 1e3)) return null;
  return payload;
}
function getCookie(cookies, name) {
  if (!cookies) return null;
  const m = cookies.split(/; */).find((c) => c.startsWith(name + "="));
  return m ? decodeURIComponent(m.split("=")[1]) : null;
}
async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {}, event);
  const token = getCookie(event.headers.cookie, "session");
  const payload = verify(token);
  if (!payload) return json(401, { error: "Unauthorized" }, event);
  return json(200, { ok: true, sub: payload.sub, exp: payload.exp }, event);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=auth_me.js.map
