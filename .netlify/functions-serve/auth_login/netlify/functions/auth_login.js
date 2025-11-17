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

// netlify/functions/auth_login.mjs
var auth_login_exports = {};
__export(auth_login_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(auth_login_exports);
var import_crypto = __toESM(require("crypto"), 1);
var ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();
var SESSION_SECRET = (process.env.SESSION_SECRET || "").trim();
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
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = import_crypto.default.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(200, {}, event);
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, event);
  if (!ADMIN_PASSWORD || !SESSION_SECRET) return json(500, { error: "Missing env vars" }, event);
  const { password } = JSON.parse(event.body || "{}");
  if ((password || "") !== ADMIN_PASSWORD) return json(401, { error: "Invalid credentials" }, event);
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + 7 * 24 * 3600;
  const token = sign({ sub: "admin", iat: now, exp });
  const secure = true;
  const cookie = `session=${token}; HttpOnly; Secure=${secure ? "" : ""}; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 3600}`;
  return {
    ...json(200, { ok: true }, event),
    headers: { ...json(200, {}, event).headers, "Set-Cookie": cookie }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=auth_login.js.map
