const datas = require('./data');
const fs = require('fs');
//test Folder of generated JSONs
const fsPath = '../cross-app/reports';
export async function main() {
   let [data, crossids] = await datas.getFilesData();
   let i = 0;
   let j = 0;
   let x = 0;
   let y = 0;
   let z = 0;
   let passedExecs: Array<string> = [''];
   let failedExecs: Array<string> = [''];
   let pendingExecs: Array<string> = [''];

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
      try {
         await datas.createExecution(issueId).then(async function (response: string) {
            let res = true;
            let count_pending_its = 0;
            // let failStepId: string;
            for (j = 0; j < index.length; j++) {
               const obj2 = JSON.parse(data[index[j]]);
               if (obj2['passed'] == false && obj2['pending'] == false) {
                  res = false;
               }
               if (obj2['pending'] == true) {
                  count_pending_its = count_pending_its + 1;
                  res = false;
               }
            }
            if (res == false && count_pending_its != index.length) {
               failedExecs[y] = response;
               y = y + 1;
               for (let z = 0; z < index.length; z++) {
                  const obj2 = JSON.parse(data[index[z]]);
                  try {
                     await datas.updateStepResult(obj2, issueId, response);
                  } catch (err) {
                     console.error(err);
                  }
               }
            } else if (res == true) {
               passedExecs[x] = response;
               x = x + 1;
            }
            if (count_pending_its == index.length) {
               pendingExecs[z] = response;
               z = z + 1;
            }
         });
      } catch (err) {
         console.log(err);
         //console.error("Error:", err);
      }
      console.log("Importing", crossId);
      i = i + 1;
   }

   await datas.bulkEditExecs(passedExecs, true);
   await datas.bulkEditExecs(failedExecs, false);
   await datas.bulkEditExecs(pendingExecs, false, true);

   // try {
   //    fs.unlinkSync(fsPath)
   //    //file removed
   //  } catch(err) {
   //    console.error(err)
   //  }

   console.log("Passed", passedExecs);
   console.log("Failed", failedExecs);
   console.log("Pending", pendingExecs);
}

main();