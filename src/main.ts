import path from "path";
import fs from "fs";
const datas = require("./data");

const parent_dirname = path.join(__dirname, "../../..");
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");

export async function main() {
  console.info("Reporting...");
  let [data, crossids] = await datas.getFilesData();

  const branch = configZephyr.zephyrDefaultOptions.version;
  const cycle = configZephyr.zephyrDefaultOptions.cycle;
  let allowDuplicateCycles = configZephyr.zephyrDefaultOptions.skip_duplicityCycle_verify;
  let current_used_cycle_id: string = undefined;

  const passedExecs: string[] = [];
  const failedExecs: string[] = [];
  const pendingExecs: string[] = [];
  const unexecutedExecs: string[] = [];

  const unique = Array.from(new Set(crossids));

  function getAllIndexes(arr: any[], val: any) {
    let indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) indexes.push(i);
    return indexes;
  }

  for (const testId of unique) {
    const index = getAllIndexes(crossids, testId);
    const obj = JSON.parse(data[index[0]]);
    const crossId: string = datas.getJiraCrosId(obj["suiteName"]);
    const issueId: string = await datas.getIsseuId(crossId);

    const cycleId = await datas.getCycleId(branch, cycle, allowDuplicateCycles, current_used_cycle_id);
    allowDuplicateCycles = false;

    try {
      const [execution_id, current_used_cycle] = await datas.createAndAssignExecution(issueId, cycleId, branch, cycle);
      current_used_cycle_id = current_used_cycle;

      let passed = true;
      let count_failed_its = 0;
      let count_pending_its = 0;

      await datas.bulkEditSteps(execution_id, true); // prednastav vsetky stepy ako passed

      for (const i of index) {
        const obj2 = JSON.parse(data[i]);
        obj2.description = `${obj2.name}|${obj2.suiteName}`;
        obj2.message = obj2.error || "";

        if (obj2.state === "failed") {
          count_failed_its++;
          passed = false;
          obj2.passed = false;
          obj2.pending = false;
          await datas.updateStepResult(obj2, issueId, execution_id);
        } else if (obj2.state === "skipped") {
          count_pending_its++;
          passed = false;
          obj2.passed = false;
          obj2.pending = true;
          await datas.updateStepResult(obj2, issueId, execution_id);
        }
      }

      if (passed) {
        passedExecs.push(execution_id);
        await datas.updateJiraIssueStatus(crossId, 1);
      } else if (count_failed_its > 0) {
        failedExecs.push(execution_id);
        await datas.updateJiraIssueStatus(crossId, 0);
      } else if (count_pending_its === index.length) {
        unexecutedExecs.push(execution_id);
        await datas.updateJiraIssueStatus(crossId, 2);
      } else {
        pendingExecs.push(execution_id);
        await datas.updateJiraIssueStatus(crossId, 1);
      }

      console.log("Imported", crossId);
    } catch (err) {
      console.error("Failed to process", crossId, err);
    }
  }
  
  passedExecs.length > 0 && datas.bulkEditExecs(passedExecs, true),
  failedExecs.length > 0 && datas.bulkEditExecs(failedExecs, false),
  pendingExecs.length > 0 && datas.bulkEditExecs(pendingExecs, false, true),
  unexecutedExecs.length > 0 && datas.bulkEditExecs(unexecutedExecs, false, false, true)

  console.log("Passed", passedExecs);
  console.log("Failed", failedExecs);
  console.log("Pending", pendingExecs);
  console.log("Unexecuted", unexecutedExecs);
}

main();