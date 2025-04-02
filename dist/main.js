"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const path_1 = __importDefault(require("path"));
const datas = require("./data");
const parent_dirname = path_1.default.join(__dirname, "../../..");
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
async function main() {
    console.info("Reporting...");
    let [data, crossids] = await datas.getFilesData();
    let indexOfCycle = 0;
    let indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
    let passedExecs = [""], failedExecs = [""], pendingExecs = [""], unexecutedExecs = [""];
    const branch = configZephyr.zephyrDefaultOptions.version;
    const cycle = configZephyr.zephyrDefaultOptions.cycle;
    let allowDuplicateCycles = configZephyr.zephyrDefaultOptions.skip_duplicityCycle_verify;
    let current_used_cycle_id = undefined;
    const unique = Array.from(new Set(crossids));
    function getAllIndexes(arr, val) {
        let indexes = [], i = -1;
        while ((i = arr.indexOf(val, i + 1)) != -1)
            indexes.push(i);
        return indexes;
    }
    while (indexOfCycle < unique.length) {
        let index = getAllIndexes(crossids, unique[indexOfCycle]);
        let obj = JSON.parse(data[index[0]]);
        let crossId = datas.getJiraCrosId(obj["suiteName"]);
        let issueId = await datas.getIsseuId(crossId);
        const cycleId = await datas.getCycleId(branch, cycle, allowDuplicateCycles, current_used_cycle_id);
        allowDuplicateCycles = false;
        try {
            const [execution_id, current_used_cycle] = await datas.createAndAssignExecution(issueId, cycleId, branch, cycle);
            current_used_cycle_id = current_used_cycle;
            let passed = true;
            let wip = false;
            let count_pending_its = 0;
            let count_failed_its = 0;
            for (let j = 0; j < index.length; j++) {
                const obj2 = JSON.parse(data[index[j]]);
                if (obj2.state === "failed") {
                    count_failed_its++;
                    passed = false;
                }
                if (obj2.state === "skipped") {
                    count_pending_its++;
                    passed = false;
                    wip = true;
                }
            }
            if (!passed && count_pending_its !== index.length) {
                if (count_failed_its > 0) {
                    failedExecs[indexOfFailedExecs++] = execution_id;
                }
                await datas.updateJiraIssueStatus(crossId, 0);
                for (let z = 0; z < index.length; z++) {
                    const obj2 = JSON.parse(data[index[z]]);
                    obj2.description = `${obj2.name}|${obj2.suiteName}`;
                    obj2.message = obj2.error || "";
                    obj2.passed = obj2.state === "passed";
                    obj2.pending = obj2.state === "skipped";
                    await datas.updateStepResult(obj2, issueId, execution_id);
                }
            }
            else if (passed) {
                passedExecs[indexOfPassedExecs++] = execution_id;
                await datas.updateJiraIssueStatus(crossId, 1);
                await datas.bulkEditSteps(execution_id, true);
            }
            if (wip && count_pending_its !== index.length) {
                if (!passed && count_failed_its > 0 && count_pending_its === 0) {
                    failedExecs[indexOfFailedExecs++] = execution_id;
                    await datas.updateJiraIssueStatus(crossId, 0);
                }
                else if (!passed && count_failed_its === 0 && count_pending_its > 0) {
                    pendingExecs[indexOfPendingExecs++] = execution_id;
                    await datas.updateJiraIssueStatus(crossId, 1);
                }
            }
            else if (count_pending_its === index.length && !passed && count_failed_its === 0) {
                unexecutedExecs[unexecutedExecsIndex++] = execution_id;
                await datas.updateJiraIssueStatus(crossId, 2);
            }
        }
        catch (err) {
            console.error(err);
        }
        console.log("Importing", crossId);
        indexOfCycle++;
    }
    if (passedExecs[0] !== "")
        await datas.bulkEditExecs(passedExecs, true);
    if (failedExecs[0] !== "")
        await datas.bulkEditExecs(failedExecs, false);
    if (pendingExecs[0] !== "")
        await datas.bulkEditExecs(pendingExecs, false, true);
    if (unexecutedExecs[0] !== "")
        await datas.bulkEditExecs(unexecutedExecs, false, false, true);
    console.log("Passed", passedExecs);
    console.log("Failed", failedExecs);
    console.log("Pending", pendingExecs);
    console.log("Unexecuted", unexecutedExecs);
}
exports.main = main;
main();
