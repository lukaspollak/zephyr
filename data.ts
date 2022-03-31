const apicall = require('./apicall');
const config = require('./config.json');
const auth = require('./jwt-auth');
const testFolder = '../cross-app/reports/jsons';
const fs = require('fs');

export function getTestIT(description: String) {
   const start_pos = 0;
   const start_pos1 = description.indexOf('|');
   const text_to_get = description.substring(start_pos, start_pos1);
   return text_to_get;
}

export function getJiraCrosId(description: String) {
   const start_pos = description.indexOf('|') + 1;
   const end_pos = description.indexOf(' ', start_pos);
   const issueId = description.substring(start_pos, end_pos);
   return issueId;
}

export function getTestId(description: String) {
   const crosid = getJiraCrosId(description);
   const start_pos = crosid.indexOf('|') + 1;
   const end_pos = crosid.length;
   const issueId = crosid.substring(start_pos, end_pos);

   if (issueId.length == 9) {
      return '1' + issueId.substring(5, issueId.length);
   } else if (issueId.length == 10) {
      return '2' + issueId.substring(6, issueId.length);
   }
}

export function createCycle() {
   // console.log("Cycle not created because function is not implemented");
}

export async function getIsseuId(jiraID: string) {
   try {
      let issueIDJson: any = await apicall.getJiraData(jiraID);
      let data = JSON.parse(issueIDJson);
      data = data.id;
      data = data.toString();
      return data;
   } catch (err) {
      console.log(err);
   }
}
export async function createExecution(jiraID: string = "") {
   if (jiraID == "") {
      console.error('No JIRA ID SET!')
   };
   const body = { "status": { "id": -1 }, "projectId": 10000, "issueId": jiraID, "cycleId": "-1", "versionId": -1, "assigneeType": "currentUser" };
   try {
      const data = await apicall.postData('/public/rest/api/1.0/execution', body);
      const json = JSON.parse(data);
      return json['execution']['id'];
   } catch (err) {
      console.log(err);
   }

}

// createExecution()
export async function bulkEditExecs(execs: Array<string>, status: boolean, pending: boolean = false, unexecuted: boolean = false) {
   let body: any;
   if (unexecuted == true) {
      status = null;
      pending = null;
      body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": -1 };
   }
   if (status == true && pending == false) {
      body = { "executions": execs, "status": 1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
   } else if (status == false && pending == false) {
      body = { "executions": execs, "status": 2, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": -1 };
   }
   else if (status == false && pending == true) {
      body = { "executions": execs, "status": 3, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": 3 };
   }
   await apicall.postData('/public/rest/api/1.0/executions', body);
}

export async function bulkEditSteps(exec: string, status: boolean) {
   let body: any;
   const execs = [exec];
   if (status == true) {
      body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
   } else if (status == false) {
      body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 2 };
   }
   await apicall.postData('/public/rest/api/1.0/executions', body);
}


export async function putStepResult(execId: string, issueId: string, stepResultId: string, resultOfTest: string, console_log: string = 'Passed.') {
   const body = { "executionId": execId, "issueId": issueId, "comment": console_log, "status": { "id": resultOfTest, "description": console_log } };
   await new Promise<any>((resolve) => {
      try {
         apicall.putData('/public/rest/api/1.0/stepresult/' + stepResultId, body).then(function (response: any) {
            resolve(response);
         });
      } catch (err) {
         console.error(err);
      }
   });
}

export async function updateStepResult(obj: any, issueId: string, execId: string) {
   let data = await apicall.getData('/public/rest/api/1.0/teststep/' + issueId + '?projectId=10000');
   let stepResult = await apicall.getData('/public/rest/api/1.0/stepresult/search?executionId=' + execId + '&issueId=' + issueId + '&isOrdered=' + true);

   data = JSON.parse(data);
   stepResult = JSON.parse(stepResult);

   let id: string;
   let stepResultId: string;
   let step: string = getTestIT(obj['description']);
   let console_log: string = obj['message'].toString();
   let resultOfTest: number = 1;

   const passed = obj['passed'];
   const pending = obj['pending'];
   const selectedSteps = data.map(({ step }) => step);
   const selectedStepsIds = data.map(({ id }) => id);

   if (selectedSteps.includes(step)) {
      const indexOfStep = selectedSteps.indexOf(step);
      id = selectedStepsIds[indexOfStep];
      let stepId = stepResult.stepResults[indexOfStep]['stepId'];
      stepResultId = stepResult.stepResults[indexOfStep]['id'];

      console.log("Issue id:", issueId);
      console.log("It Description:", step);
      console.log("Console message:", console_log);

      if (pending == true) {
         resultOfTest = 3;
      } else if (pending == false) {
         if (passed == true) {
            resultOfTest = 1;
         } else if (passed == false) {
            resultOfTest = 2;
         }
      }

      await this.putStepResult(execId, issueId, stepResultId, resultOfTest, console_log);

   } else {
      console.error("Not matched it, please compare test it('description') definition and JIRA steps definition!");
   }
}
export async function execs(path = '../cross-app/reports/jsons/') {
   let i = 0;
   async function getFiles() {
      return new Promise<any>((resolve) => {
         fs.readdir(testFolder, async (err: any, files: any[]) => {
            resolve(files);
         });
      });
   }
   const res = await getFiles().then(function (result: any) {
      return result;
   });
   return res;
}

export async function getFilesData(path: string = '../cross-app/reports/jsons/') {
   const res = await execs();
   let i: number = 0;
   let j: number = 0;
   let data: Array<string> = [];
   let crosids: Array<string> = [];
   async function getJson(file: any) {
      return await new Promise<any>((resolve) => {
         fs.readFile(path + file, 'utf8', async function (err: any, data: any) {
            resolve(data);
         });
      });
   }
   const resJson = await getJson(res).then(function (result: any) {
      return result;
   });

   while (i < res.length) {
      data[i] = await getJson(res[i]).then(function (result: any) {
         const obj = JSON.parse(result);
         crosids[i] = getTestId(obj['description']);
         i = i + 1;
         return result;
      });
   }
   return [data, crosids];
}

