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
        var indexOfCycle, j, indexOfPassedExecs, indexOfFailedExecs, indexOfPendingExecs, unexecutedExecsIndex, passedExecs, failedExecs, pendingExecs, unexecutedExecs, branch_proccess_argv, cycle_proccess_argv, reporter_process_argv, data, crossids, unique, index, obj, crossId, issueId;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    indexOfCycle = 0, j = 0;
                    indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
                    passedExecs = [''];
                    failedExecs = [''];
                    pendingExecs = [''];
                    unexecutedExecs = [''];
                    branch_proccess_argv = process.argv[4];
                    cycle_proccess_argv = process.argv[5];
                    reporter_process_argv = process.argv[3];
                    if (branch_proccess_argv == undefined) {
                        branch_proccess_argv = "";
                        console.warn("Branch is not filled in command arguments!");
                    }
                    if (cycle_proccess_argv == undefined) {
                        cycle_proccess_argv = "";
                        console.warn("Cycle name is not filled in command arguments!");
                    }
                    crossids = [];
                    if (!(reporter_process_argv == "selenium")) return [3 /*break*/, 2];
                    return [4 /*yield*/, datas.getFilesJsonData()];
                case 1:
                    // default
                    _a = _c.sent(), data = _a[0], crossids = _a[1]; // load data from JSONs files of selenium reporter (reports/json)
                    return [3 /*break*/, 4];
                case 2:
                    if (!(reporter_process_argv == "jest")) return [3 /*break*/, 4];
                    return [4 /*yield*/, datas.getXmlFilesJsonData()];
                case 3:
                    // custom
                    _b = _c.sent(), data = _b[0], crossids = _b[1]; // load data from JSONs files of jest reporter (coverage/)
                    _c.label = 4;
                case 4:
                    unique = Array.from(new Set(crossids));
                    _c.label = 5;
                case 5:
                    if (!(indexOfCycle < unique.length)) return [3 /*break*/, 7];
                    index = getAllIndexes(crossids, unique[indexOfCycle]);
                    obj = void 0;
                    console.log('Index:' + index);
                    if (reporter_process_argv == "selenium") {
                        obj = JSON.parse(data[index[0]]);
                    }
                    else if (reporter_process_argv == "jest") {
                        obj = data[index[0]];
                    }
                    console.log('obj:' + obj);
                    crossId = datas.getJiraCrosId(obj['description']);
                    console.log('crossId:' + crossId);
                    return [4 /*yield*/, datas.getIsseuId(crossId)];
                case 6:
                    issueId = _c.sent();
                    console.log('issueId:' + issueId);
                    // await datas.getCycleId(branch_proccess_argv, cycle_proccess_argv).then(async function (cycleId: any) {
                    //    try {
                    //       await datas.createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv).then(async function (response: string) {
                    //          let passed = true;
                    //          let wip = false;
                    //          let count_pending_its = 0;
                    //          let count_failed_its = 0;
                    //          // let failStepId: string;
                    //          for (j = 0; j < index.length; j++) {
                    //             const obj2 = JSON.parse(data[index[j]]);
                    //             if (obj2['passed'] == false && obj2['pending'] == false) {
                    //                count_failed_its++;
                    //                passed = false;
                    //             }
                    //             if (obj2['pending'] == true) {
                    //                count_pending_its++;
                    //                passed = false;
                    //                wip = true;
                    //             }
                    //          }
                    //          // if at minimum one test step failed and pending its is less than count of all its and no step is WIP 
                    //          // >> y--, so test exec hash is not added to failed tests array and place is cleared for next created failed execution in next while cycle
                    //          if (passed == false && count_pending_its != index.length) {
                    //             failedExecs[indexOfFailedExecs] = response;
                    //             indexOfFailedExecs++;
                    //             await datas.updateJiraIssueStatus(crossId, 0);
                    //             await datas.bulkEditSteps(response, true).then(async function () {
                    //                for (let z = 0; z < index.length; z++) {
                    //                   const obj2 = JSON.parse(data[index[z]]);
                    //                   if (obj2['passed'] == false) {
                    //                      try {
                    //                         await datas.updateStepResult(obj2, issueId, response);
                    //                      } catch (err) {
                    //                         console.error(err);
                    //                      }
                    //                   };
                    //                }
                    //             })
                    //          } else if (passed == true) {
                    //             passedExecs[indexOfPassedExecs] = response;
                    //             indexOfPassedExecs++;
                    //             await datas.updateJiraIssueStatus(crossId, 1);
                    //          }
                    //          if (wip == true && count_pending_its != index.length) {
                    //             if (passed == false && count_failed_its > 0) {
                    //                failedExecs[indexOfFailedExecs] = response;
                    //                indexOfFailedExecs++;
                    //                await datas.updateJiraIssueStatus(crossId, 0);
                    //             } else if (passed == false && count_failed_its == 0) {
                    //                pendingExecs[indexOfPendingExecs] = response;
                    //                indexOfPendingExecs++;
                    //                await datas.updateJiraIssueStatus(crossId, 1);
                    //             }
                    //          } else if (count_pending_its == index.length) {
                    //             unexecutedExecs[unexecutedExecsIndex] = response;
                    //             unexecutedExecsIndex = unexecutedExecsIndex + 1;
                    //             await datas.updateJiraIssueStatus(crossId, 2);
                    //          }
                    //       });
                    //    } catch (err) {
                    //       console.log(err);
                    //       //console.error("Error:", err);
                    //    }
                    // })
                    console.log("Importing", crossId);
                    indexOfCycle++;
                    return [3 /*break*/, 5];
                case 7: return [4 /*yield*/, datas.bulkEditExecs(passedExecs, true)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(failedExecs, false)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(pendingExecs, false, true)];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, datas.bulkEditExecs(unexecutedExecs, false, false, true)];
                case 11:
                    _c.sent();
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
