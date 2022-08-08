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
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const datas = require('./data');
// get parent dir name of node modules
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('/' + parent_dirname + '/configZephyr.json');
const configZephyrUser = require('/' + parent_dirname + '/configZephyrUser.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let [data, crossids] = yield datas.getFilesData();
        //helps counter variables for cycles
        let indexOfCycle = 0, j = 0;
        let indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
        let passedExecs = [''];
        let failedExecs = [''];
        let pendingExecs = [''];
        let unexecutedExecs = [''];
        let branch_proccess_argv = configZephyr.zephyrDefaultOptions.version;
        let cycle_proccess_argv = configZephyr.zephyrDefaultOptions.cycle;
        if (branch_proccess_argv == undefined) {
            branch_proccess_argv = "";
            console.warn("Branch is not filled in console arguments!");
        }
        if (cycle_proccess_argv == undefined) {
            cycle_proccess_argv = "";
            console.warn("Cycle name is not filled in console arguments!");
        }
        function getAllIndexes(arr, val) {
            let indexes = [], i = -1;
            while ((i = arr.indexOf(val, i + 1)) != -1) {
                indexes.push(i);
            }
            return indexes;
        }
        const unique = Array.from(new Set(crossids));
        while (indexOfCycle < unique.length) {
            let index = getAllIndexes(crossids, unique[indexOfCycle]);
            let obj = JSON.parse(data[index[0]]);
            let crossId = datas.getJiraCrosId(obj['description']);
            let issueId = yield datas.getIsseuId(crossId);
            yield datas.getCycleId(branch_proccess_argv, cycle_proccess_argv).then(function (cycleId) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield datas.createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv).then(function (response) {
                            return __awaiter(this, void 0, void 0, function* () {
                                let passed = true;
                                let wip = false;
                                let count_pending_its = 0;
                                let count_failed_its = 0;
                                // let failStepId: string;
                                for (j = 0; j < index.length; j++) {
                                    const obj2 = JSON.parse(data[index[j]]);
                                    if (obj2['passed'] == false && obj2['pending'] == false) {
                                        count_failed_its++;
                                        passed = false;
                                    }
                                    if (obj2['pending'] == true) {
                                        count_pending_its = count_pending_its + 1;
                                        passed = false;
                                        wip = true;
                                    }
                                }
                                // if at minimum one test step failed and pending its is less than count of all its and no step is WIP
                                // >> y--, so test exec hash is not added to failed tests array and place is cleared for next created failed execution in next while cycle
                                if (passed == false && count_pending_its != index.length) {
                                    failedExecs[indexOfFailedExecs] = response;
                                    indexOfFailedExecs++;
                                    yield datas.updateJiraIssueStatus(crossId, 0);
                                    yield datas.bulkEditSteps(response, true).then(function () {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            for (let z = 0; z < index.length; z++) {
                                                const obj2 = JSON.parse(data[index[z]]);
                                                if (obj2['passed'] == false) {
                                                    try {
                                                        yield datas.updateStepResult(obj2, issueId, response);
                                                    }
                                                    catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                                ;
                                            }
                                        });
                                    });
                                }
                                else if (passed == true) {
                                    passedExecs[indexOfPassedExecs] = response;
                                    indexOfPassedExecs++;
                                    yield datas.updateJiraIssueStatus(crossId, 1);
                                }
                                if (wip == true && count_pending_its != index.length) {
                                    if (passed == false && count_failed_its > 0) {
                                        failedExecs[indexOfFailedExecs] = response;
                                        indexOfFailedExecs++;
                                        yield datas.updateJiraIssueStatus(crossId, 0);
                                    }
                                    else if (passed == false && count_failed_its == 0) {
                                        pendingExecs[indexOfPendingExecs] = response;
                                        indexOfPendingExecs++;
                                        yield datas.updateJiraIssueStatus(crossId, 1);
                                    }
                                }
                                else if (count_pending_its == index.length) {
                                    unexecutedExecs[unexecutedExecsIndex] = response;
                                    unexecutedExecsIndex = unexecutedExecsIndex + 1;
                                    yield datas.updateJiraIssueStatus(crossId, 2);
                                }
                            });
                        });
                    }
                    catch (err) {
                        console.log(err);
                        //console.error("Error:", err);
                    }
                });
            });
            console.log("Importing", crossId);
            indexOfCycle++;
        }
        yield datas.bulkEditExecs(passedExecs, true);
        yield datas.bulkEditExecs(failedExecs, false);
        yield datas.bulkEditExecs(pendingExecs, false, true);
        yield datas.bulkEditExecs(unexecutedExecs, false, false, true);
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
    });
}
exports.main = main;
main();
