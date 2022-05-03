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
exports.main = void 0;
var datas = require('./data');
var fs = require('fs');
//test Folder of generated JSONs
var fsPath = '../cross-app/reports';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function getAllIndexes(arr, val) {
            var indexes = [], i = -1;
            while ((i = arr.indexOf(val, i + 1)) != -1) {
                indexes.push(i);
            }
            return indexes;
        }
        var _a, data, crossids, i, j, x, y, z, unexecutedExecsIndex, passedExecs, failedExecs, pendingExecs, unexecutedExecs, unique, _loop_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, datas.getFilesData()];
                case 1:
                    _a = _b.sent(), data = _a[0], crossids = _a[1];
                    i = 0;
                    j = 0;
                    x = 0;
                    y = 0;
                    z = 0;
                    unexecutedExecsIndex = 0;
                    passedExecs = [''];
                    failedExecs = [''];
                    pendingExecs = [''];
                    unexecutedExecs = [''];
                    unique = Array.from(new Set(crossids));
                    _loop_1 = function () {
                        var index, obj, crossId, issueId, cycleId, err_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    index = getAllIndexes(crossids, unique[i]);
                                    obj = JSON.parse(data[index[0]]);
                                    crossId = datas.getJiraCrosId(obj['description']);
                                    return [4 /*yield*/, datas.getIsseuId(crossId)];
                                case 1:
                                    issueId = _c.sent();
                                    return [4 /*yield*/, datas.getCycleId(process.argv[3], process.argv[4])];
                                case 2:
                                    cycleId = _c.sent();
                                    _c.label = 3;
                                case 3:
                                    _c.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, datas.createExecution(issueId, cycleId, process.argv[3]).then(function (response) {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var res, wip, count_pending_its, obj2;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            res = true;
                                                            wip = false;
                                                            count_pending_its = 0;
                                                            // let count_failed_its = 0; -> for next optimalization
                                                            // let failStepId: string;
                                                            for (j = 0; j < index.length; j++) {
                                                                obj2 = JSON.parse(data[index[j]]);
                                                                if (obj2['passed'] == false && obj2['pending'] == false) {
                                                                    res = false;
                                                                }
                                                                if (obj2['pending'] == true) {
                                                                    count_pending_its = count_pending_its + 1;
                                                                    res = false;
                                                                    wip = true;
                                                                }
                                                            }
                                                            if (!(res == false && count_pending_its != index.length)) return [3 /*break*/, 2];
                                                            if (wip != false) {
                                                                y--;
                                                            }
                                                            else {
                                                                failedExecs[y] = response;
                                                            }
                                                            ;
                                                            return [4 /*yield*/, datas.bulkEditSteps(response, true).then(function () {
                                                                    return __awaiter(this, void 0, void 0, function () {
                                                                        var z_1, obj2, err_2;
                                                                        return __generator(this, function (_a) {
                                                                            switch (_a.label) {
                                                                                case 0:
                                                                                    y = y + 1;
                                                                                    z_1 = 0;
                                                                                    _a.label = 1;
                                                                                case 1:
                                                                                    if (!(z_1 < index.length)) return [3 /*break*/, 7];
                                                                                    obj2 = JSON.parse(data[index[z_1]]);
                                                                                    if (!(obj2['passed'] == false)) return [3 /*break*/, 5];
                                                                                    _a.label = 2;
                                                                                case 2:
                                                                                    _a.trys.push([2, 4, , 5]);
                                                                                    return [4 /*yield*/, datas.updateStepResult(obj2, issueId, response)];
                                                                                case 3:
                                                                                    _a.sent();
                                                                                    return [3 /*break*/, 5];
                                                                                case 4:
                                                                                    err_2 = _a.sent();
                                                                                    console.error(err_2);
                                                                                    return [3 /*break*/, 5];
                                                                                case 5:
                                                                                    ;
                                                                                    _a.label = 6;
                                                                                case 6:
                                                                                    z_1++;
                                                                                    return [3 /*break*/, 1];
                                                                                case 7: return [2 /*return*/];
                                                                            }
                                                                        });
                                                                    });
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            if (res == true) {
                                                                passedExecs[x] = response;
                                                                x = x + 1;
                                                            }
                                                            _a.label = 3;
                                                        case 3:
                                                            if (wip == true && count_pending_its != index.length) {
                                                                pendingExecs[z] = response;
                                                                z = z + 1;
                                                            }
                                                            else if (count_pending_its == index.length) {
                                                                unexecutedExecs[unexecutedExecsIndex] = response;
                                                                unexecutedExecsIndex = unexecutedExecsIndex + 1;
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            });
                                        })];
                                case 4:
                                    _c.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _c.sent();
                                    console.log(err_1);
                                    return [3 /*break*/, 6];
                                case 6:
                                    console.log("Importing", crossId);
                                    i = i + 1;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 2;
                case 2:
                    if (!(i < unique.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, datas.bulkEditExecs(passedExecs, true)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(failedExecs, false)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(pendingExecs, false, true)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(unexecutedExecs, false, false, true)];
                case 8:
                    _b.sent();
                    // try {
                    //    fs.unlinkSync(fsPath)
                    //    //file removed
                    //  } catch(err) {
                    //    console.error(err)
                    //  }
                    console.log("Passed", passedExecs);
                    console.log("Failed", failedExecs);
                    console.log("Pending", pendingExecs);
                    console.log("Unexecuted", unexecutedExecs);
                    return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
main();
