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
exports.getFilesData = exports.execs = exports.updateStepResult = exports.putStepResult = exports.bulkEditSteps = exports.bulkEditExecs = exports.createExecution = exports.getIsseuId = exports.createCycle = exports.getTestId = exports.getJiraCrosId = exports.getTestIT = void 0;
var apicall = require('./apicall');
var config = require('./config.json');
var auth = require('./jwt-auth');
var testFolder = '../cross-app/reports/jsons';
var fs = require('fs');
function getTestIT(description) {
    var start_pos = 0;
    var start_pos1 = description.indexOf('|');
    var text_to_get = description.substring(start_pos, start_pos1);
    return text_to_get;
}
exports.getTestIT = getTestIT;
function getJiraCrosId(description) {
    var start_pos = description.indexOf('|') + 1;
    var end_pos = description.indexOf(' ', start_pos);
    var issueId = description.substring(start_pos, end_pos);
    return issueId;
}
exports.getJiraCrosId = getJiraCrosId;
function getTestId(description) {
    var crosid = getJiraCrosId(description);
    var start_pos = crosid.indexOf('|') + 1;
    var end_pos = crosid.length;
    var issueId = crosid.substring(start_pos, end_pos);
    if (issueId.length == 9) {
        return '1' + issueId.substring(5, issueId.length);
    }
    else if (issueId.length == 10) {
        return '2' + issueId.substring(6, issueId.length);
    }
}
exports.getTestId = getTestId;
function createCycle() {
    // console.log("Cycle not created because function is not implemented");
}
exports.createCycle = createCycle;
function getIsseuId(jiraID) {
    return __awaiter(this, void 0, void 0, function () {
        var issueIDJson, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, apicall.getJiraData(jiraID)];
                case 1:
                    issueIDJson = _a.sent();
                    data = JSON.parse(issueIDJson);
                    data = data.id;
                    data = data.toString();
                    return [2 /*return*/, data];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getIsseuId = getIsseuId;
function createExecution(jiraID) {
    if (jiraID === void 0) { jiraID = ""; }
    return __awaiter(this, void 0, void 0, function () {
        var body, data, json, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (jiraID == "") {
                        console.error('No JIRA ID SET!');
                    }
                    ;
                    body = { "status": { "id": -1 }, "projectId": 10000, "issueId": jiraID, "cycleId": "-1", "versionId": -1, "assigneeType": "currentUser" };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apicall.postData('/public/rest/api/1.0/execution', body)];
                case 2:
                    data = _a.sent();
                    json = JSON.parse(data);
                    return [2 /*return*/, json['execution']['id']];
                case 3:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.createExecution = createExecution;
// createExecution()
function bulkEditExecs(execs, status, pending) {
    if (pending === void 0) { pending = false; }
    return __awaiter(this, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (status == true && pending == false) {
                        body = { "executions": execs, "status": 1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
                    }
                    else if (status == false && pending == false) {
                        body = { "executions": execs, "status": 2, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": -1 };
                    }
                    else if (status == false && pending == true) {
                        body = { "executions": execs, "status": 3, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": 3 };
                    }
                    return [4 /*yield*/, apicall.postData('/public/rest/api/1.0/executions', body)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.bulkEditExecs = bulkEditExecs;
function bulkEditSteps(exec, status) {
    return __awaiter(this, void 0, void 0, function () {
        var body, execs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    execs = [exec];
                    if (status == true) {
                        body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
                    }
                    else if (status == false) {
                        body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 2 };
                    }
                    return [4 /*yield*/, apicall.postData('/public/rest/api/1.0/executions', body)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.bulkEditSteps = bulkEditSteps;
function putStepResult(execId, issueId, stepResultId, resultOfTest, console_log) {
    if (console_log === void 0) { console_log = 'Passed.'; }
    return __awaiter(this, void 0, void 0, function () {
        var body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = { "executionId": execId, "issueId": issueId, "comment": console_log, "status": { "id": resultOfTest, "description": console_log } };
                    return [4 /*yield*/, new Promise(function (resolve) {
                            try {
                                apicall.putData('/public/rest/api/1.0/stepresult/' + stepResultId, body).then(function (response) {
                                    resolve(response);
                                });
                            }
                            catch (err) {
                                console.error(err);
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.putStepResult = putStepResult;
function updateStepResult(obj, issueId, execId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, stepResult, id, stepResultId, step, console_log, resultOfTest, passed, pending, selectedSteps, selectedStepsIds, indexOfStep, stepId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apicall.getData('/public/rest/api/1.0/teststep/' + issueId + '?projectId=10000')];
                case 1:
                    data = _a.sent();
                    return [4 /*yield*/, apicall.getData('/public/rest/api/1.0/stepresult/search?executionId=' + execId + '&issueId=' + issueId + '&isOrdered=' + true)];
                case 2:
                    stepResult = _a.sent();
                    data = JSON.parse(data);
                    stepResult = JSON.parse(stepResult);
                    step = getTestIT(obj['description']);
                    console_log = obj['message'].toString();
                    resultOfTest = 1;
                    passed = obj['passed'];
                    pending = obj['pending'];
                    selectedSteps = data.map(function (_a) {
                        var step = _a.step;
                        return step;
                    });
                    selectedStepsIds = data.map(function (_a) {
                        var id = _a.id;
                        return id;
                    });
                    if (!selectedSteps.includes(step)) return [3 /*break*/, 4];
                    indexOfStep = selectedSteps.indexOf(step);
                    id = selectedStepsIds[indexOfStep];
                    stepId = stepResult.stepResults[indexOfStep]['stepId'];
                    stepResultId = stepResult.stepResults[indexOfStep]['id'];
                    console.log("Issue id:", issueId);
                    console.log("It Description:", step);
                    console.log("Console message:", console_log);
                    if (pending == true) {
                        resultOfTest = 3;
                    }
                    else if (pending == false) {
                        if (passed == true) {
                            resultOfTest = 1;
                        }
                        else if (passed == false) {
                            resultOfTest = 2;
                        }
                    }
                    return [4 /*yield*/, this.putStepResult(execId, issueId, stepResultId, resultOfTest, console_log)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.error("Not matched it, please compare test it('description') definition and JIRA steps definition!");
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.updateStepResult = updateStepResult;
function execs(path) {
    if (path === void 0) { path = '../cross-app/reports/jsons/'; }
    return __awaiter(this, void 0, void 0, function () {
        function getFiles() {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve) {
                            fs.readdir(testFolder, function (err, files) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    resolve(files);
                                    return [2 /*return*/];
                                });
                            }); });
                        })];
                });
            });
        }
        var i, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    return [4 /*yield*/, getFiles().then(function (result) {
                            return result;
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.execs = execs;
function getFilesData(path) {
    if (path === void 0) { path = '../cross-app/reports/jsons/'; }
    return __awaiter(this, void 0, void 0, function () {
        function getJson(file) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                fs.readFile(path + file, 'utf8', function (err, data) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            resolve(data);
                                            return [2 /*return*/];
                                        });
                                    });
                                });
                            })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var res, i, j, data, crosids, resJson, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, execs()];
                case 1:
                    res = _c.sent();
                    i = 0;
                    j = 0;
                    data = [];
                    crosids = [];
                    return [4 /*yield*/, getJson(res).then(function (result) {
                            return result;
                        })];
                case 2:
                    resJson = _c.sent();
                    _c.label = 3;
                case 3:
                    if (!(i < res.length)) return [3 /*break*/, 5];
                    _a = data;
                    _b = i;
                    return [4 /*yield*/, getJson(res[i]).then(function (result) {
                            var obj = JSON.parse(result);
                            crosids[i] = getTestId(obj['description']);
                            i = i + 1;
                            return result;
                        })];
                case 4:
                    _a[_b] = _c.sent();
                    return [3 /*break*/, 3];
                case 5: return [2 /*return*/, [data, crosids]];
            }
        });
    });
}
exports.getFilesData = getFilesData;
