"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('/' + parent_dirname + '/configZephyr.json');
const configZephyrUser = require('/' + parent_dirname + '/configZephyrUser.json');
function getJWT(extendeApiCallUrl = "", typereq = "GET") {
    // define ACCESS from Config file
    const accessKey = configZephyrUser[configZephyr.executor].access_key;
    const secretKey = configZephyrUser[configZephyr.executor].secret_key;
    const accountId = configZephyrUser[configZephyr.executor].account_id;
    const baseUrl = configZephyr.zephyrDefaultOptions.base_api_call;
    const now = moment().utc();
    const req = jwt.fromMethodAndUrl(typereq, baseUrl + extendeApiCallUrl);
    const tokenData = {
        sub: accountId,
        iss: accessKey,
        iat: now.unix(),
        exp: now.add(10, "minutes").unix(),
        qsh: jwt.createQueryStringHash(req, false, baseUrl),
    };
    const token = jwt.encodeSymmetric(tokenData, secretKey);
    return token;
}
exports.getJWT = getJWT;
