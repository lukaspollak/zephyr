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
exports.updateJiraIssueStatus = exports.getFilesData = exports.execs = exports.updateStepResult = exports.putStepResult = exports.bulkEditSteps = exports.bulkEditExecs = exports.createExecution = exports.createAndAssignExecution = exports.getIsseuId = exports.getCycleId = exports.createCycle = exports.getIdOfVersion = exports.getTestId = exports.getJiraCrosId = exports.getTestIT = void 0;
const ZephyrApiVersion = '/public/rest/api/1.0';
const jiraProjectID = 10000;
const apicall = require('./apicall');
const testFolder = '../cross-app/reports/jsons';
const fs = require('fs');
function getTestIT(description) {
    const start_pos = 0;
    const start_pos1 = description.indexOf('|');
    const text_to_get = description.substring(start_pos, start_pos1);
    return text_to_get;
}
exports.getTestIT = getTestIT;
function getJiraCrosId(description) {
    const start_pos = description.indexOf('|') + 1;
    const end_pos = description.indexOf(' ', start_pos);
    const issueId = description.substring(start_pos, end_pos);
    return issueId;
}
exports.getJiraCrosId = getJiraCrosId;
function getTestId(description) {
    const crosid = getJiraCrosId(description);
    const start_pos = crosid.indexOf('|') + 1;
    const end_pos = crosid.length;
    const issueId = crosid.substring(start_pos, end_pos);
    if (issueId.length == 9) {
        return '1' + issueId.substring(5, issueId.length);
    }
    else if (issueId.length == 10) {
        return '2' + issueId.substring(6, issueId.length);
    }
}
exports.getTestId = getTestId;
function getIdOfVersion(versionName, projectId = jiraProjectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let versions;
        let versionsJSON;
        let id = -1;
        try {
            versions = yield apicall.getJiraData('project/' + projectId + '/versions');
            versionsJSON = JSON.parse(versions);
            for (let i in versionsJSON) {
                if (versionsJSON[i].name === versionName) {
                    id = versionsJSON[i].id;
                    return id;
                }
            }
        }
        catch (err) {
            console.log('Versions call troubles!', err);
        }
        if (id === -1) {
            console.log('Version does not exist or it is Ad Hoc!');
            return id;
        }
    });
}
exports.getIdOfVersion = getIdOfVersion;
function createCycle(branch, custom_cycle_name = '', projectId = jiraProjectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        let version = '';
        let environment = '';
        let cycleName = '';
        let description = 'default description';
        let cycle_id = '';
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
            yield getIdOfVersion(version, projectId).then(function (versionID) {
                return __awaiter(this, void 0, void 0, function* () {
                    const body = {
                        "name": cycleName,
                        "environment": environment,
                        "description": description,
                        "versionId": versionID,
                        "projectId": projectId
                    };
                    response = yield apicall.postData(ZephyrApiVersion + '/cycle', body);
                    const data = JSON.parse(response);
                    cycle_id = data.id;
                });
            });
        }
        catch (error) {
            console.log("Continue as Ad hoc reporting, because an error occured when founding version:", error);
            cycle_id = undefined;
        }
        return cycle_id;
    });
}
exports.createCycle = createCycle;
function getCycleId(branch, cycleName = '', projectId = jiraProjectID) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        let cycle_id = -1;
        const splittedVersion = branch.split('/', 2);
        const versionName = splittedVersion[1];
        if (cycleName == '') {
            cycleName = splittedVersion[0];
        }
        yield getIdOfVersion(versionName).then(function (versionID) {
            return __awaiter(this, void 0, void 0, function* () {
                if (versionID != -1) {
                    response = yield apicall.getData(ZephyrApiVersion + '/cycles/search?versionId=' + versionID + '&' + 'projectId=' + projectId);
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
                }
                else {
                    console.error("Version does not Exist!");
                }
            });
        });
        return cycle_id;
    });
}
exports.getCycleId = getCycleId;
function getIsseuId(jiraIssueID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let issueIDJson = yield apicall.getJiraData("issue/" + jiraIssueID);
            let data = JSON.parse(issueIDJson);
            data = data.id;
            data = data.toString();
            return data;
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.getIsseuId = getIsseuId;
function createAndAssignExecution(jiraIssueID = '', cycleId, branch, custom_cycle_name = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const versionName = branch.split('/').pop();
        const versionID = yield this.getIdOfVersion(versionName);
        if (jiraIssueID == '') {
            console.error('No JIRA ID SET!');
        }
        if (cycleId == -1) {
            console.log('Creating cycle ...');
            const response = yield this.createExecution(jiraIssueID, yield this.createCycle(branch, custom_cycle_name), versionID);
            return response;
        }
        else {
            const response = yield this.createExecution(jiraIssueID, cycleId, versionID);
            return response;
        }
    });
}
exports.createAndAssignExecution = createAndAssignExecution;
function createExecution(jiraIssueID = '', cycleId = -1, versionID = -1) {
    return __awaiter(this, void 0, void 0, function* () {
        let body = {};
        if (jiraIssueID == '') {
            console.error('No JIRA ID SET!');
        }
        ;
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
            const data = yield apicall.postData(ZephyrApiVersion + '/execution', body);
            const json = JSON.parse(data);
            return json['execution']['id'];
        }
        catch (err) {
            console.log('Execution error:', err);
        }
    });
}
exports.createExecution = createExecution;
// createExecution('24452','4c544096-cb8a-4d5f-9030-a31ae60e44a6','10737');
function bulkEditExecs(execs, status, pending = false, unexecuted = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let body;
        if (unexecuted == true) {
            status = null;
            pending = null;
            body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": -1 };
        }
        if (status == true && pending == false) {
            body = { "executions": execs, "status": 1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
        }
        else if (status == false && pending == false) {
            body = { "executions": execs, "status": 2, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": -1 };
        }
        else if (status == false && pending == true) {
            body = { "executions": execs, "status": 3, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": false, "stepStatus": 3 };
        }
        yield apicall.postData(ZephyrApiVersion + '/executions', body);
    });
}
exports.bulkEditExecs = bulkEditExecs;
function bulkEditSteps(exec, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let body;
        const execs = [exec];
        if (status == true) {
            body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 1 };
        }
        else if (status == false) {
            body = { "executions": execs, "status": -1, "clearDefectMappingFlag": false, "testStepStatusChangeFlag": true, "stepStatus": 2 };
        }
        yield apicall.postData(ZephyrApiVersion + '/executions', body);
    });
}
exports.bulkEditSteps = bulkEditSteps;
function putStepResult(execId, issueId, stepResultId, resultOfTest, console_log = 'Passed.') {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { "executionId": execId, "issueId": issueId, "comment": console_log, "status": { "id": resultOfTest, "description": console_log } };
        yield new Promise((resolve) => {
            try {
                apicall.putData(ZephyrApiVersion + '/stepresult/' + stepResultId, body).then(function (response) {
                    resolve(response);
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    });
}
exports.putStepResult = putStepResult;
function updateStepResult(obj, issueId, execId) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield apicall.getData(ZephyrApiVersion + '/teststep/' + issueId + '?projectId=' + jiraProjectID);
        let stepResult = yield apicall.getData(ZephyrApiVersion + '/stepresult/search?executionId=' + execId + '&issueId=' + issueId + '&isOrdered=' + true);
        data = JSON.parse(data);
        stepResult = JSON.parse(stepResult);
        let id;
        let stepResultId;
        let step = getTestIT(obj['description']);
        let console_log = obj['message'].toString();
        let resultOfTest = 1;
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
            }
            else if (pending == false) {
                if (passed == true) {
                    resultOfTest = 1;
                }
                else if (passed == false) {
                    resultOfTest = 2;
                }
            }
            yield this.putStepResult(execId, issueId, stepResultId, resultOfTest, console_log);
        }
        else {
            console.error("Not matched it, please compare test it('description') definition and JIRA steps definition!");
        }
    });
}
exports.updateStepResult = updateStepResult;
function execs(path = '../cross-app/reports/jsons/') {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        function getFiles() {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    fs.readdir(testFolder, (err, files) => __awaiter(this, void 0, void 0, function* () {
                        resolve(files);
                    }));
                });
            });
        }
        const res = yield getFiles().then(function (result) {
            return result;
        });
        return res;
    });
}
exports.execs = execs;
function getFilesData(path = '../cross-app/reports/jsons/') {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield execs();
        let i = 0;
        let j = 0;
        let data = [];
        let crosids = [];
        function getJson(file) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve) => {
                    fs.readFile(path + file, 'utf8', function (err, data) {
                        return __awaiter(this, void 0, void 0, function* () {
                            resolve(data);
                        });
                    });
                });
            });
        }
        const resJson = yield getJson(res).then(function (result) {
            return result;
        });
        while (i < res.length) {
            data[i] = yield getJson(res[i]).then(function (result) {
                const obj = JSON.parse(result);
                crosids[i] = getTestId(obj['description']);
                i = i + 1;
                return result;
            });
        }
        return [data, crosids];
    });
}
exports.getFilesData = getFilesData;
function updateJiraIssueStatus(issueCrosID, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let body;
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
            yield apicall.postJiraData(urlParams, body);
            return true;
        }
        catch (_a) {
            console.error("Status of Jira issue is not updated!");
            return false;
        }
    });
}
exports.updateJiraIssueStatus = updateJiraIssueStatus;
