"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJWT = void 0;
const jwt = __importStar(require("atlassian-jwt"));
const moment = require("moment");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("../config.json");
function getJWT(extendeApiCallUrl = "/public/rest/api/1.0/stepresult/search?executionId=bacf0888-4be9-4e07-8474-559daafddfc8&issueId=15550", typereq = "GET") {
    // define ACCESS from Config file
    const accessKey = config[process.argv[2]].access_key;
    const secretKey = config[process.argv[2]].secret_key;
    const accountId = config[process.argv[2]].account_id;
    const baseUrl = config.pollak.base_api_call;
    const now = moment().utc();
    const req = jwt.fromMethodAndUrl(typereq, baseUrl + extendeApiCallUrl);
    const tokenData = {
        sub: accountId,
        iss: accessKey,
        iat: now.unix(),
        exp: now.add(10, "minutes").unix(),
        qsh: jwt.createQueryStringHash(req, false, baseUrl),
    };
    const token = jwt.encode(tokenData, secretKey);
    return token;
}
exports.getJWT = getJWT;
