// get parent dir name of node modules
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('../configZephyr.json');
// const configZephyr = require('/' + parent_dirname + '/configZephyr.json');
const ZephyrApiVersion = '/public/rest/api/' + configZephyr.zephyrDefaultOptions.ZephyrApiVersion;
const jiraProjectID = configZephyr.zephyrDefaultOptions.jiraProjectID;
const apicall = require('./apicall');
const fs = require('fs');
// folder where jsons are placed
let testFolder: string = '../reports/jsons';
if (configZephyr.zephyrDefaultOptions.reportsDir != null) {
   testFolder = configZephyr.zephyrDefaultOptions.reportsDir;
}

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

export async function getIdOfVersion(versionName: string, projectId: number = jiraProjectID) {
   let versions: string;
   let versionsJSON: any;
   let id: number = -1;
   try {
      versions = await apicall.getJiraData('project/' + projectId + '/versions');
      versionsJSON = JSON.parse(versions);

      for (let i in versionsJSON) {
         if (versionsJSON[i].name === versionName) {
            id = versionsJSON[i].id;
            return id;
         }
      }
   } catch (err) {
      console.log('Versions call troubles!', err);
   }
   if (id === -1) {
      console.log('Version does not exist or it is Ad Hoc!');
      return id;
   }
}

export async function createCycle(branch: string, custom_cycle_name: string = '', projectId: number = jiraProjectID) {
   let response: any;
   let version: string = '';
   let environment: string = '';
   let cycleName: string = '';
   let description: string = 'default description';
   let cycle_id: string = '';

   if (branch.toLowerCase() == "development") {
      cycleName = 'DEVELOPMENT';
      environment = 'DEVELOPMENT';
      description = 'Tests was runned during development period!';
   }
   if (branch.toLowerCase().includes('release')) {
      cycleName = 'RELEASE';
      environment = 'TEST';
      description = 'Tests was runned during release period!';
   }
   if (custom_cycle_name != '') {
      cycleName = custom_cycle_name;
      environment = 'TEST';
      description = 'Tests was runned during release period as custom release cycle!';
   }

   version = branch.split('/').pop();
   try {
      await getIdOfVersion(version, projectId).then(async function (versionID: number) {
         const body = {
            "name": cycleName,
            "environment": environment,
            "description": description,
            "versionId": versionID,
            "projectId": projectId
         };

         response = await apicall.postData(ZephyrApiVersion + '/cycle', body);
         const data = JSON.parse(response);
         cycle_id = data.id;
      });
   } catch (error) {
      console.log("Continue as Ad hoc reporting, because an error occured when founding version:", error);
      cycle_id = undefined;
   }
   return cycle_id;
}

export async function getCycleId(branch: string, cycleName: string = '', projectId: number = jiraProjectID) {
   let response: any;
   let cycle_id: any = -1;
   const splittedVersion = branch.split('/', 2);
   const versionName = splittedVersion[1];

   if (cycleName == '') {
      cycleName = splittedVersion[0];
   }

   await getIdOfVersion(versionName).then(async function (versionID: number) {
      if (versionID != -1) {
         response = await apicall.getData(ZephyrApiVersion + '/cycles/search?versionId=' + versionID + '&' + 'projectId=' + projectId);
         const cycleJSON = JSON.parse(response);
         for (let i in cycleJSON) {
            if (cycleJSON[i].name.toLowerCase() === cycleName.toLowerCase()) {
               cycle_id = cycleJSON[i].id;
               return cycle_id;
            }
         }
         if (cycle_id == -1) {
            console.log('Cycle does not exist!');
            return cycle_id;
         }
      } else {
         console.error("Version does not Exist!");
      }
   });
   return cycle_id;
}

export async function getIsseuId(jiraIssueID: string) {
   try {
      let issueIDJson: any = await apicall.getJiraData("issue/" + jiraIssueID);
      let data = JSON.parse(issueIDJson);
      data = data.id;
      data = data.toString();
      return data;
   } catch (err) {
      console.log(err);
   }
}

export async function createAndAssignExecution(jiraIssueID: string = '', cycleId: any, branch: string, custom_cycle_name: string = '') {
   const versionName = branch.split('/').pop();
   const versionID = await this.getIdOfVersion(versionName);

   if (jiraIssueID == '') {
      console.error('No JIRA ID SET!');
   }
   if (cycleId == -1) {
      console.log('Creating cycle ...');
      const response = await this.createExecution(jiraIssueID, await this.createCycle(branch, custom_cycle_name), versionID);
      return response;
   } else {
      const response = await this.createExecution(jiraIssueID, cycleId, versionID);
      return response;
   }
}

export async function createExecution(jiraIssueID: string = '', cycleId: any = -1, versionID: any = -1) {
   let body: Object = {};
   if (jiraIssueID == '') {
      console.error('No JIRA ID SET!');
   };
   if (cycleId == -1 && versionID != -1) {
      body = { "status": { "id": -1 }, "projectId": jiraProjectID, "issueId": jiraIssueID, "cycleId": -1, "versionId": versionID, "assigneeType": "currentUser" };
   }
   if (cycleId == -1 && versionID == -1) {
      body = { "status": { "id": -1 }, "projectId": jiraProjectID, "issueId": jiraIssueID, "cycleId": -1, "versionId": -1, "assigneeType": "currentUser" };
   }
   if (cycleId != -1 && versionID != -1) {
      body = { "status": { "id": -1 }, "projectId": jiraProjectID, "issueId": jiraIssueID, "cycleId": cycleId, "versionId": versionID, "assigneeType": "currentUser" };
   }

   try {
      const data = await apicall.postData(ZephyrApiVersion + '/execution', body);
      const json = JSON.parse(data);
      return json['execution']['id'];
   } catch (err) {
      console.log('Execution error:', err);
   }
}

// createExecution('24452','4c544096-cb8a-4d5f-9030-a31ae60e44a6','10737');

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
   await apicall.postData(ZephyrApiVersion + '/executions', body);
}

export async function bulkEditSteps(exec: string, status: boolean) {
   let body: any;
   const execs = [exec];
   if (status == true) {
      body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
   } else if (status == false) {
      body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 2 };
   }
   await apicall.postData(ZephyrApiVersion + '/executions', body);
}

export async function putStepResult(execId: string, issueId: string, stepResultId: string, resultOfTest: string, console_log: string = 'Passed.') {
   const body = { "executionId": execId, "issueId": issueId, "comment": console_log, "status": { "id": resultOfTest, "description": console_log } };
   await new Promise<any>((resolve) => {
      try {
         apicall.putData(ZephyrApiVersion + '/stepresult/' + stepResultId, body).then(function (response: any) {
            resolve(response);
         });
      } catch (err) {
         console.error(err);
      }
   });
}

export async function updateStepResult(obj: any, issueId: string, execId: string) {
   let data = await apicall.getData(ZephyrApiVersion + '/teststep/' + issueId + '?projectId=' + jiraProjectID);
   let stepResult = await apicall.getData(ZephyrApiVersion + '/stepresult/search?executionId=' + execId + '&issueId=' + issueId + '&isOrdered=' + true);

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

export async function execs(path: string = testFolder) {
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

export async function getFilesData(path: string = testFolder + '/') {
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

export async function updateJiraIssueStatus(issueCrosID: string, status: number) {
   let body: any;
   const urlParams = 'issue/' + issueCrosID + '/transitions';

   // passed
   if (status == 1) {
      body = { "transition": { "id": "51" } };
   }
   // fail
   if (status == 0) {
      body = { "transition": { "id": "41" } };
   }
   // skipped
   if (status == 2) {
      body = { "transition": { "id": "91" } };
   }

   try {
      await apicall.postJiraData(urlParams, body);
      return true;
   } catch {
      console.error("Status of Jira issue is not updated!");
      return false;
   }
}