"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const datas = require("./data");
// get parent dir name of node modules
const path = require("path");
const parent_dirname = path.join(__dirname, "../../..");
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
async function main() {
    console.info("Reporting from: " + parent_dirname + "/reports");
    let [data, crossids] = await datas.getFilesData();
    //helps counter variables for cycles
    let indexOfCycle = 0, j = 0;
    let indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
    let passedExecs = [""];
    let failedExecs = [""];
    let pendingExecs = [""];
    let unexecutedExecs = [""];
    let branch_proccess_argv = configZephyr.zephyrDefaultOptions.version;
    let cycle_proccess_argv = configZephyr.zephyrDefaultOptions.cycle;
    console.info("Reporting from cycle branch: " + branch_proccess_argv);
    // console.log(cycle_proccess_argv);
    if (branch_proccess_argv == "") {
        console.log(branch_proccess_argv);
        console.warn("Branch is not filled in config options arguments!");
    }
    if (cycle_proccess_argv == "") {
        console.log(cycle_proccess_argv);
        console.warn("Cycle name is not filled in config options arguments!");
    }
    function getAllIndexes(arr, val) {
        let indexes = [], i = -1;
        while ((i = arr.indexOf(val, i + 1)) != -1) {
            indexes.push(i);
        }
        return indexes;
    }
    let allow_duplicity_of_cycles = configZephyr.zephyrDefaultOptions.skip_duplicityCycle_verify;
    let current_used_cycle_id = undefined;
    const unique = Array.from(new Set(crossids));
    while (indexOfCycle < unique.length) {
        let index = getAllIndexes(crossids, unique[indexOfCycle]);
        let obj = JSON.parse(data[index[0]]);
        let crossId = datas.getJiraCrosId(obj["description"]);
        let issueId = await datas.getIsseuId(crossId);
        await datas
            .getCycleId(branch_proccess_argv, cycle_proccess_argv, allow_duplicity_of_cycles, current_used_cycle_id)
            .then(async function (cycleId) {
            // allowed only with first initialization, cause without it will report each test to new cycle
            allow_duplicity_of_cycles = false;
            try {
                await datas
                    .createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv)
                    .then(async function ([execution_id, current_used_cycle]) {
                    current_used_cycle_id = current_used_cycle;
                    let passed = true;
                    let wip = false;
                    let count_pending_its = 0;
                    let count_failed_its = 0;
                    // let failStepId: string;
                    for (j = 0; j < index.length; j++) {
                        const obj2 = JSON.parse(data[index[j]]);
                        if (obj2["passed"] == false && obj2["pending"] == false) {
                            count_failed_its++;
                            passed = false;
                        }
                        if (obj2["pending"] == true) {
                            count_pending_its++;
                            passed = false;
                            wip = true;
                        }
                        // console.log("passed:", passed, "wip:", wip);
                    }
                    // if at minimum one test step failed and pending its is less than count of all its and no step is WIP
                    // >> y--, so test exec hash is not added to failed tests array and place is cleared for next created failed execution in next while cycle
                    if (passed == false && count_pending_its != index.length) {
                        if (count_failed_its > 0) {
                            failedExecs[indexOfFailedExecs] = execution_id;
                            indexOfFailedExecs++;
                        }
                        await datas.updateJiraIssueStatus(crossId, 0);
                        await datas
                            .bulkEditSteps(execution_id, true)
                            .then(async function () {
                            for (let z = 0; z < index.length; z++) {
                                const obj2 = JSON.parse(data[index[z]]);
                                if (obj2["passed"] == false) {
                                    try {
                                        await datas.updateStepResult(obj2, issueId, execution_id);
                                    }
                                    catch (err) {
                                        console.error(err);
                                    }
                                }
                            }
                        });
                    }
                    else if (passed == true) {
                        passedExecs[indexOfPassedExecs] = execution_id;
                        indexOfPassedExecs++;
                        await datas.updateJiraIssueStatus(crossId, 1);
                    }
                    if (wip == true && count_pending_its != index.length) {
                        if (passed == false &&
                            count_failed_its > 0 &&
                            count_pending_its == 0) {
                            failedExecs[indexOfFailedExecs] = execution_id;
                            indexOfFailedExecs++;
                            await datas.updateJiraIssueStatus(crossId, 0);
                        }
                        else if (passed == false &&
                            count_failed_its == 0 &&
                            count_pending_its > 0) {
                            pendingExecs[indexOfPendingExecs] = execution_id;
                            indexOfPendingExecs++;
                            await datas.updateJiraIssueStatus(crossId, 1);
                        }
                    }
                    else if (count_pending_its == index.length &&
                        passed == false &&
                        count_failed_its == 0) {
                        unexecutedExecs[unexecutedExecsIndex] = execution_id;
                        unexecutedExecsIndex = unexecutedExecsIndex + 1;
                        await datas.updateJiraIssueStatus(crossId, 2);
                    }
                });
            }
            catch (err) {
                console.log(err);
                //console.error("Error:", err);
            }
        });
        console.log("Importing", crossId);
        indexOfCycle++;
    }
    if (passedExecs[0] != "") {
        // console.log("Importing bulk passed");
        // console.log(passedExecs);
        await datas.bulkEditExecs(passedExecs, true);
    }
    if (failedExecs[0] != "") {
        // console.log("Importing bulk failed");
        // console.log(failedExecs);
        await datas.bulkEditExecs(failedExecs, false);
    }
    if (pendingExecs[0] != "") {
        // console.log("Importing bulk pending");
        // console.log(pendingExecs);
        await datas.bulkEditExecs(pendingExecs, false, true);
    }
    if (unexecutedExecs[0] != "") {
        // console.log("Importing bulk unexecuted");
        // console.log(unexecutedExecs);
        await datas.bulkEditExecs(unexecutedExecs, false, false, true);
    }
    console.log("Passed", passedExecs);
    console.log("Failed", failedExecs);
    console.log("Pending", pendingExecs);
    console.log("Unexecuted", unexecutedExecs);
}
exports.main = main;
main();
