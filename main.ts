const datas = require('./data');
const fs = require('fs');
//test Folder of generated JSONs
const fsPath = '../cross-app/reports';
export async function main() {
   let [data, crossids] = await datas.getFilesData();
   //helps counter variables for cycles
   let i = 0, j = 0, indexOfPassedExecs = 0, indexOfFailedExecs = 0, indexOdPendingExecs = 0;
   let unexecutedExecsIndex = 0;
   let passedExecs: Array<string> = [''];
   let failedExecs: Array<string> = [''];
   let pendingExecs: Array<string> = [''];
   let unexecutedExecs: Array<string> = [''];
   let branch_proccess_argv = process.argv[3] as String;
   let cycle_proccess_argv = process.argv[4] as String;

   if (branch_proccess_argv == undefined) {
      branch_proccess_argv = "";
      console.warn("Branch is not filled in console arguments!")
   }
   if (cycle_proccess_argv == undefined) {
      cycle_proccess_argv = "";
      console.warn("Cycle name is not filled in console arguments!")
   }
   function getAllIndexes(arr: any, val: any) {
      var indexes = [], i = -1;
      while ((i = arr.indexOf(val, i + 1)) != -1) {
         indexes.push(i);
      }
      return indexes;
   }

   const unique = Array.from(new Set(crossids));
   while (i < unique.length) {
      let index = getAllIndexes(crossids, unique[i]);
      let obj = JSON.parse(data[index[0]]);
      let crossId: string = datas.getJiraCrosId(obj['description']);
      let issueId: string = await datas.getIsseuId(crossId);

      await datas.getCycleId(branch_proccess_argv, cycle_proccess_argv).then(async function (cycleId: any) {
         try {
            await datas.createAndAssignExecution(issueId, cycleId, branch_proccess_argv, cycle_proccess_argv).then(async function (response: string) {
               let res = true;
               let wip = false;
               let count_pending_its = 0;
               let count_failed_its = 0;
               // let failStepId: string;
               for (j = 0; j < index.length; j++) {
                  const obj2 = JSON.parse(data[index[j]]);
                  if (obj2['passed'] == false && obj2['pending'] == false) {
                     count_failed_its++;
                     res = false;
                  }
                  if (obj2['pending'] == true) {
                     count_pending_its = count_pending_its + 1;
                     res = false;
                     wip = true;
                  }
               }
               // if at minimum one test step failed and pending its is less than count of all its and no step is WIP 
               // >> y--, so test exec hash is not added to failed tests array and place is cleared for next created failed execution in next while cycle
               if (res == false && count_pending_its != index.length) {
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
               } else if (res == true) {
                  passedExecs[indexOfPassedExecs] = response;
                  indexOfPassedExecs++;
                  await datas.updateJiraIssueStatus(crossId, 1);
               }

               if (wip == true && count_pending_its != index.length) {
                  if (res == false && count_failed_its > 0) {
                     failedExecs[indexOfFailedExecs] = response;
                     indexOfFailedExecs++;
                     await datas.updateJiraIssueStatus(crossId, 0);
                  } else if (res == false && count_failed_its == 0) {
                     pendingExecs[indexOdPendingExecs] = response;
                     indexOdPendingExecs++;
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
      i = i + 1;
   }

   await datas.bulkEditExecs(passedExecs, true);
   await datas.bulkEditExecs(failedExecs, false);
   await datas.bulkEditExecs(pendingExecs, false, true);
   await datas.bulkEditExecs(unexecutedExecs, false, false, true);

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
}

main();