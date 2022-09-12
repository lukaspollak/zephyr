const datas = require('./data');
// get parent dir name of node modules
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('/' + parent_dirname + '/configZephyr.json');;
export async function main() {
   let [data, crossids] = await datas.getFilesData();
   //helps counter variables for cycles
   let indexOfCycle = 0, j = 0;
   let indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOfPendingExecs = 0, unexecutedExecsIndex = 0;
   let passedExecs: Array<string> = [''];
   let failedExecs: Array<string> = [''];
   let pendingExecs: Array<string> = [''];
   let unexecutedExecs: Array<string> = [''];
   let branch_proccess_argv = configZephyr.zephyrDefaultOptions.version;
   let cycle_proccess_argv = configZephyr.zephyrDefaultOptions.cycle;

   if (branch_proccess_argv == undefined) {
      branch_proccess_argv = "";
      console.warn("Branch is not filled in config options arguments!")
   }
   if (cycle_proccess_argv == undefined) {
      cycle_proccess_argv = "";
      console.warn("Cycle name is not filled in config options arguments!")
   }

   function getAllIndexes(arr: any, val: any) {
      let indexes = [], i = -1;
      while ((i = arr.indexOf(val, i + 1)) != -1) {
         indexes.push(i);
      }
      return indexes;
   }

   let allow_duplicity_of_cycles: boolean = configZephyr.zephyrDefaultOptions.skip_duplicityCycle_verify
   const unique = Array.from(new Set(crossids));
   while (indexOfCycle < unique.length) {
      let index = getAllIndexes(crossids, unique[indexOfCycle]);
      let obj = JSON.parse(data[index[0]]);
      let crossId: string = datas.getJiraCrosId(obj['description']);
      let issueId: string = await datas.getIsseuId(crossId);

      await datas.getCycleId(branch_proccess_argv, cycle_proccess_argv, allow_duplicity_of_cycles).then(async function (cycleId: any) {
         // allowed only with first initialization, cause without it will report each test to new cycle
         allow_duplicity_of_cycles = false;
         try {
            await datas.createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv).then(async function (response: string) {
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
                           } catch (err) {
                              console.error(err);
                           }
                        };
                     }
                  })

               } else if (passed == true) {
                  passedExecs[indexOfPassedExecs] = response;
                  indexOfPassedExecs++;
                  await datas.updateJiraIssueStatus(crossId, 1);
               }

               if (wip == true && count_pending_its != index.length) {
                  if (passed == false && count_failed_its > 0) {
                     failedExecs[indexOfFailedExecs] = response;
                     indexOfFailedExecs++;
                     await datas.updateJiraIssueStatus(crossId, 0);
                  } else if (passed == false && count_failed_its == 0) {
                     pendingExecs[indexOfPendingExecs] = response;
                     indexOfPendingExecs++;
                     await datas.updateJiraIssueStatus(crossId, 1);
                  }
               } else if (count_pending_its == index.length) {
                  unexecutedExecs[unexecutedExecsIndex] = response;
                  unexecutedExecsIndex = unexecutedExecsIndex + 1;
                  await datas.updateJiraIssueStatus(crossId, 2);
               }
            });
         } catch (err) {
            console.log(err);
            //console.error("Error:", err);
         }
      })
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

main();
