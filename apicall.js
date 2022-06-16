"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.postData = exports.putData = exports.getData = exports.postJiraData = exports.getJiraData = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
var config = require('./config.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
var auth = require('./jwt-auth');
// import http from "http";
var request = require("request");
// const fetch = require('node-fetch');
function getJiraData(urlParams, login, api_token) {
    if (login === void 0) { login = "pollak@bart.sk"; }
    if (api_token === void 0) { api_token = config.pollak.jira_token; }
    return __awaiter(this, void 0, void 0, function () {
        function requestGet() {
            return new Promise(function (resolve) {
                request(url, options, function (error, response, body) {
                    resolve(response.body);
                });
            });
        }
        var url, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://crossuite.atlassian.net/rest/api/3/' + urlParams;
                    options = {
                        method: 'GET',
                        headers: {
                            'Authorization': "Basic " + Buffer.from(login + ':' + api_token).toString('base64'),
                            'Accept': 'application/json'
                        }
                    };
                    return [4 /*yield*/, requestGet().then(function (result) {
                            return result;
                        })
                        // console.log(res)
                    ];
                case 1:
                    res = _a.sent();
                    // console.log(res)
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.getJiraData = getJiraData;
;
function postJiraData(urlParams, body, login, api_token) {
    if (login === void 0) { login = "pollak@bart.sk"; }
    if (api_token === void 0) { api_token = config.pollak.jira_token; }
    return __awaiter(this, void 0, void 0, function () {
        function fetchpost() {
            return new Promise(function (resolve) {
                request(url, options, function (error, response, body) {
                    resolve(response.body);
                });
            });
        }
        var url, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://crossuite.atlassian.net/rest/api/3/' + urlParams;
                    options = {
                        method: 'POST',
                        headers: {
                            'Authorization': "Basic " + Buffer.from(login + ':' + api_token).toString('base64'),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    };
                    return [4 /*yield*/, fetchpost().then(function (result) {
                            return result;
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.postJiraData = postJiraData;
function getData(extendeApiCallUrl) {
    if (extendeApiCallUrl === void 0) { extendeApiCallUrl = '/public/rest/api/1.0/teststep/15550?projectId=10000'; }
    return __awaiter(this, void 0, void 0, function () {
        function requestGet() {
            return new Promise(function (resolve) {
                request(url, options, function (error, response, body) {
                    resolve(response.body);
                });
            });
        }
        var JWT, accessKey, baseUrl, url, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    JWT = auth.getJWT(extendeApiCallUrl);
                    accessKey = config[process.argv[2]].access_key;
                    baseUrl = config.pollak.base_api_call;
                    url = baseUrl + extendeApiCallUrl;
                    options = {
                        method: 'GET',
                        headers: {
                            Authorization: 'JWT ' + JWT,
                            zapiAccessKey: accessKey
                        }
                    };
                    return [4 /*yield*/, requestGet().then(function (result) {
                            return result;
                        })
                        // console.log(res)
                    ];
                case 1:
                    res = _a.sent();
                    // console.log(res)
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.getData = getData;
;
function putData(extendeApiCallUrl, bodyJSON) {
    return __awaiter(this, void 0, void 0, function () {
        function requestPut() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                request(url, options, function (error, response, body) {
                                    resolve(response.statusCode);
                                });
                            })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var JWT, accessKey, baseUrl, url, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    JWT = auth.getJWT(extendeApiCallUrl, "PUT");
                    accessKey = config[process.argv[2]].access_key;
                    baseUrl = config.pollak.base_api_call;
                    url = baseUrl + extendeApiCallUrl;
                    options = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'JWT ' + JWT,
                            zapiAccessKey: accessKey
                        },
                        body: JSON.stringify(bodyJSON)
                    };
                    return [4 /*yield*/, requestPut().then(function (result) {
                            return result;
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.putData = putData;
;
function postData(extendeApiCallUrl, bodyJSON) {
    return __awaiter(this, void 0, void 0, function () {
        function fetchpost() {
            return new Promise(function (resolve) {
                request(url, options, function (error, response, body) {
                    resolve(response.body);
                });
            });
        }
        var JWT, accessKey, baseUrl, url, options, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    JWT = auth.getJWT(extendeApiCallUrl, "POST");
                    accessKey = config[process.argv[2]].access_key;
                    baseUrl = config.pollak.base_api_call;
                    url = baseUrl + extendeApiCallUrl;
                    options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'JWT ' + JWT,
                            zapiAccessKey: accessKey
                        },
                        body: JSON.stringify(bodyJSON)
                    };
                    return [4 /*yield*/, fetchpost().then(function (result) {
                            return result;
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.postData = postData;
;
