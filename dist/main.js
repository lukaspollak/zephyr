"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const datas = require('./data');
// get parent dir name of node modules
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('/' + parent_dirname + '/configZephyr.json');
;
async function main() {
    let [data, crossids] = await datas.getFilesData();
    //helps counter variables for cycles
    let indexOfCycle = 0, j = 0;
    let indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
    let passedExecs = [''];
    let failedExecs = [''];
    let pendingExecs = [''];
    let unexecutedExecs = [''];
    let argv1 = process.argv[1];
    let argv2 = process.argv[2];
    console.log(argv1, argv2);
    let branch_proccess_argv;
    let cycle_proccess_argv;
    if (argv1 == '') {
        branch_proccess_argv = configZephyr.zephyrDefaultOptions.version;
        if (argv2 == '') {
            cycle_proccess_argv = configZephyr.zephyrDefaultOptions.cycle;
        }
        else {
            branch_proccess_argv = argv1;
        }
    }
    else {
        cycle_proccess_argv = argv2;
    }
    if (branch_proccess_argv == undefined) {
        branch_proccess_argv = "";
        console.warn("Branch is not filled in config options arguments!");
    }
    if (cycle_proccess_argv == undefined) {
        cycle_proccess_argv = "";
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
        let crossId = datas.getJiraCrosId(obj['description']);
        let issueId = await datas.getIsseuId(crossId);
        await datas.getCycleId(branch_proccess_argv, cycle_proccess_argv, allow_duplicity_of_cycles, current_used_cycle_id).then(async function (cycleId) {
            // allowed only with first initialization, cause without it will report each test to new cycle
            allow_duplicity_of_cycles = false;
            try {
                await datas.createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv).then(async function ([response, current_used_cycle]) {
                    current_used_cycle_id = current_used_cycle;
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
                        await datas.updateJiraIssueStatus(crossId, 0);
                        await datas.bulkEditSteps(response, true).then(async function () {
                            for (let z = 0; z < index.length; z++) {
                                const obj2 = JSON.parse(data[index[z]]);
                                if (obj2['passed'] == false) {
                                    try {
                                        await datas.updateStepResult(obj2, issueId, response);
                                    }
                                    catch (err) {
                                        console.error(err);
                                    }
                                }
                                ;
                            }
                        });
                    }
                    else if (passed == true) {
                        passedExecs[indexOfPassedExecs] = response;
                        indexOfPassedExecs++;
                        await datas.updateJiraIssueStatus(crossId, 1);
                    }
                    if (wip == true && count_pending_its != index.length) {
                        if (passed == false && count_failed_its > 0) {
                            failedExecs[indexOfFailedExecs] = response;
                            indexOfFailedExecs++;
                            await datas.updateJiraIssueStatus(crossId, 0);
                        }
                        else if (passed == false && count_failed_its == 0) {
                            pendingExecs[indexOfPendingExecs] = response;
                            indexOfPendingExecs++;
                            await datas.updateJiraIssueStatus(crossId, 1);
                        }
                    }
                    else if (count_pending_its == index.length) {
                        unexecutedExecs[unexecutedExecsIndex] = response;
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
    await datas.bulkEditExecs(passedExecs, true);
    await datas.bulkEditExecs(failedExecs, false);
    await datas.bulkEditExecs(pendingExecs, false, true);
    await datas.bulkEditExecs(unexecutedExecs, false, false, true);
    console.log("Passed", passedExecs);
    console.log("Failed", failedExecs);
    console.log("Pending", pendingExecs);
    console.log("Unexecuted", unexecutedExecs);
}
exports.main = main;
main();
