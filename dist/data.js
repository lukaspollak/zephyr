"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJiraIssueStatus = exports.getFilesData = exports.execs = exports.updateStepResult = exports.putStepResult = exports.bulkEditSteps = exports.bulkEditExecs = exports.createExecution = exports.createAndAssignExecution = exports.getIsseuId = exports.getCycleId = exports.createCycle = exports.getIdOfVersion = exports.getTestId = exports.getJiraCrosId = exports.getTestIT = void 0;
// get parent dir name of node modules
const path = require("path");
const parent_dirname = path.join(__dirname, "../../..");
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
const ZephyrApiVersion = "/public/rest/api/" + configZephyr.zephyrDefaultOptions.zephyrApiVersion;
const jiraProjectID = configZephyr.zephyrDefaultOptions.jiraProjectId;
const apicall = require("./apicall");
const fs = require("fs");
// folder where jsons are placed
let testFolder = "../reports/jsons/";
if (configZephyr.zephyrDefaultOptions.reportsDir != null) {
    testFolder = configZephyr.zephyrDefaultOptions.reportsDir + "/";
}
function getTestIT(description) {
    const start_pos = 0;
    const start_pos1 = description.indexOf("|");
    const text_to_get = description.substring(start_pos, start_pos1);
    return text_to_get;
}
exports.getTestIT = getTestIT;
function getJiraCrosId(description) {
    const start_pos = description.indexOf("|") + 1;
    const end_pos = description.indexOf(" ", start_pos);
    const issueId = description.substring(start_pos, end_pos);
    return issueId;
}
exports.getJiraCrosId = getJiraCrosId;
function getTestId(description) {
    const crosid = getJiraCrosId(description);
    const start_pos = crosid.indexOf("|") + 1;
    const end_pos = crosid.length;
    const issueId = crosid.substring(start_pos, end_pos);
    if (issueId.length == 9) {
        return "1" + issueId.substring(5, issueId.length);
    }
    else if (issueId.length == 10) {
        return "2" + issueId.substring(6, issueId.length);
    }
}
exports.getTestId = getTestId;
async function getIdOfVersion(versionName, projectId = jiraProjectID) {
    let versions;
    let versionsJSON;
    let id = -1;
    if (versionName != "development") {
        try {
            versions = await apicall.getJiraData("project/" + projectId + "/versions");
            versionsJSON = JSON.parse(versions);
            for (let i in versionsJSON) {
                if (versionsJSON[i].name.includes(versionName)) {
                    id = versionsJSON[i].id;
                    return id;
                }
            }
        }
        catch (err) {
            console.log("Versions call troubles!", err);
        }
    }
    else if (versionName === "development") {
        id = -1;
    }
    if (id === -1) {
        console.log("Version does not exist or u wanna run test as Ad Hoc!");
        return id;
    }
}
exports.getIdOfVersion = getIdOfVersion;
async function createCycle(branch, custom_cycle_name = "", projectId = jiraProjectID) {
    let response;
    let version = "";
    let environment = "";
    let cycleName = "";
    let description = "default description";
    let cycle_id = "";
    if (branch.toLowerCase() == "development") {
        cycleName = "DEVELOPMENT";
        environment = "DEVELOPMENT";
        description = "Tests was runned during development period!";
    }
    if (branch.toLowerCase().includes("release")) {
        cycleName = "RELEASE";
        environment = "TEST";
        description = "Tests was runned during release period!";
    }
    if (custom_cycle_name != "") {
        cycleName = custom_cycle_name;
        environment = "TEST";
        description = "Tests was runned as custom release cycle!";
    }
    version = branch.split("/").pop();
    try {
        await getIdOfVersion(version, projectId).then(async function (versionID) {
            const body = {
                name: cycleName,
                environment: environment,
                description: description,
                versionId: versionID,
                projectId: projectId,
            };
            response = await apicall.postData(ZephyrApiVersion + "/cycle", body);
            const data = JSON.parse(response);
            cycle_id = data.id;
        });
    }
    catch (error) {
        console.log("Continue as Ad hoc reporting, because an error occured when founding version:", error);
        cycle_id = undefined;
    }
    return cycle_id;
}
exports.createCycle = createCycle;
async function getCycleId(branch, cycleName = "", skip_duplicity_verify = false, current_used_cycle_id = undefined, projectId = jiraProjectID) {
    let response;
    let cycle_id = -1;
    if (current_used_cycle_id == undefined) {
        if (skip_duplicity_verify == false) {
            const splittedVersion = branch.split("/", 2);
            const versionName = splittedVersion[1];
            if (cycleName == "") {
                cycleName = splittedVersion[0];
            }
            await getIdOfVersion(versionName).then(async function (versionID) {
                if (versionID != -1) {
                    response = await apicall.getData(ZephyrApiVersion +
                        "/cycles/search?versionId=" +
                        versionID +
                        "&" +
                        "projectId=" +
                        projectId);
                    const cycleJSON = JSON.parse(response);
                    if (!cycleJSON || !Array.isArray(cycleJSON)) {
                        console.error("Unexpected response for cycles!");
                        return -1;
                    }
                    for (let i in cycleJSON) {
                        const name = cycleJSON[i]?.name;
                        if (!name)
                            continue;
                        if (name.toLowerCase() === cycleName.toLowerCase()) {
                            cycle_id = cycleJSON[i].id;
                            return cycle_id;
                        }
                    }
                    if (cycle_id == -1) {
                        console.log("Cycle does not exist!");
                        return cycle_id;
                    }
                }
                else {
                    console.error("Version does not Exist!");
                }
            });
        }
        else if (skip_duplicity_verify == true) {
            cycle_id = -1;
        }
    }
    else {
        cycle_id = current_used_cycle_id;
    }
    return cycle_id;
}
exports.getCycleId = getCycleId;
async function getIsseuId(jiraIssueID) {
    try {
        let issueIDJson = await apicall.getJiraData("issue/" + jiraIssueID);
        let data = JSON.parse(issueIDJson);
        data = data.id;
        data = data.toString();
        return data;
    }
    catch (err) {
        console.log(err);
    }
}
exports.getIsseuId = getIsseuId;
async function createAndAssignExecution(jiraIssueID = "", cycleId, branch, custom_cycle_name = "") {
    const versionName = branch.split("/").pop();
    const versionID = await this.getIdOfVersion(versionName);
    if (jiraIssueID == "") {
        console.error("No JIRA ID SET!");
    }
    if (cycleId == -1) {
        console.log("Creating cycle ...");
        const [exec_id, cycle_id] = await this.createExecution(jiraIssueID, await this.createCycle(branch, custom_cycle_name), versionID);
        return [exec_id, cycle_id];
    }
    else {
        const [exec_id, cycle_id] = await this.createExecution(jiraIssueID, cycleId, versionID);
        return [exec_id, cycle_id];
    }
}
exports.createAndAssignExecution = createAndAssignExecution;
async function createExecution(jiraIssueID = "", cycleId = -1, versionID = -1) {
    if (!jiraIssueID)
        throw new Error("No JIRA ID SET!");
    const body = {
        status: { id: -1 },
        projectId: jiraProjectID,
        issueId: jiraIssueID,
        cycleId,
        versionId: versionID,
        assigneeType: "currentUser",
    };
    try {
        const data = await apicall.postData(ZephyrApiVersion + "/execution", body);
        const json = JSON.parse(data);
        if (!json?.execution?.id) {
            console.error("Missing execution ID in response:", json);
            throw new Error("Missing execution ID in response");
        }
        return [json.execution.id, cycleId];
    }
    catch (err) {
        console.error("Execution error:", err);
        throw err;
    }
}
exports.createExecution = createExecution;
// createExecution('24452','4c544096-cb8a-4d5f-9030-a31ae60e44a6','10737');
async function bulkEditExecs(execs, status, pending = false, unexecuted = false) {
    let body;
    if (unexecuted === true) {
        body = {
            executions: execs,
            status: -1,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: false,
            stepStatus: -1,
        };
    }
    else if (status === true && !pending) {
        body = {
            executions: execs,
            status: 1,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: true,
            stepStatus: 1,
        };
    }
    else if (status === false && !pending) {
        body = {
            executions: execs,
            status: 2,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: false,
            stepStatus: -1,
        };
    }
    else if (status === false && pending) {
        body = {
            executions: execs,
            status: 3,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: false,
            stepStatus: -1,
        };
    }
    await apicall.postData(ZephyrApiVersion + "/executions", body);
}
exports.bulkEditExecs = bulkEditExecs;
async function bulkEditSteps(exec, status) {
    let body;
    const execs = [exec];
    if (status == true) {
        body = {
            executions: execs,
            status: -1,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: true,
            stepStatus: 1,
        };
    }
    else if (status == false) {
        body = {
            executions: execs,
            status: -1,
            clearDefectMappingFlag: false,
            testStepStatusChangeFlag: true,
            stepStatus: 2,
        };
    }
    await apicall.postData(ZephyrApiVersion + "/executions", body);
}
exports.bulkEditSteps = bulkEditSteps;
async function putStepResult(execId, issueId, stepResultId, resultOfTest, // <-- zmena tu
console_log = "Passed.") {
    const body = {
        executionId: execId,
        issueId: issueId,
        comment: console_log,
        status: { id: resultOfTest, description: console_log },
    };
    try {
        await apicall.putData(ZephyrApiVersion + "/stepresult/" + stepResultId, body);
    }
    catch (err) {
        console.error(err);
    }
}
exports.putStepResult = putStepResult;
async function updateStepResult(obj, issueId, execId) {
    let data = await apicall.getData(ZephyrApiVersion + "/teststep/" + issueId + "?projectId=" + jiraProjectID);
    let stepResult = await apicall.getData(ZephyrApiVersion +
        "/stepresult/search?executionId=" +
        execId +
        "&issueId=" +
        issueId +
        "&isOrdered=" +
        true);
    data = JSON.parse(data);
    stepResult = JSON.parse(stepResult);
    let id;
    let stepResultId;
    let step = getTestIT(obj["description"]);
    let console_log = Array.isArray(obj["message"])
        ? obj["message"].join(" | ")
        : obj["message"]?.toString() ?? "";
    let resultOfTest = 1;
    const passed = obj["passed"];
    const pending = obj["pending"];
    const selectedSteps = data.map(({ step }) => step);
    const selectedStepsIds = data.map(({ id }) => id);
    if (selectedSteps.includes(step)) {
        const indexOfStep = selectedSteps.indexOf(step);
        id = selectedStepsIds[indexOfStep];
        stepResultId = stepResult.stepResults[indexOfStep]["id"];
        if (pending === true) {
            resultOfTest = 3;
        }
        else if (passed === true) {
            if (console_log.includes("screenshot did not match") ||
                console_log.includes("Expected")) {
                resultOfTest = 2;
            }
            else {
                resultOfTest = 1;
            }
        }
        else {
            resultOfTest = 2;
        }
        await putStepResult(execId, issueId, stepResultId, resultOfTest, console_log);
    }
    else {
        console.error("Not matched it, please compare test it('description') definition and JIRA steps definition!");
    }
}
exports.updateStepResult = updateStepResult;
async function execs(path = testFolder) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err)
                return reject(err);
            resolve(files);
        });
    });
}
exports.execs = execs;
async function getFilesData(path = testFolder) {
    const files = await execs(path);
    let data = [];
    let crosids = [];
    function getJson(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(path + file, "utf8", (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    for (let i = 0; i < files.length; i++) {
        try {
            const content = await getJson(files[i]);
            const json = JSON.parse(content);
            if (!json.suites || !Array.isArray(json.suites))
                continue;
            for (const suite of json.suites) {
                const description = suite.name || "";
                const testId = getTestId(description);
                if (!testId) {
                    console.warn(`Skipped file ${files[i]}: could not extract testId from suite name '${suite.name}'`);
                    continue;
                }
                if (!suite.tests || !Array.isArray(suite.tests))
                    continue;
                for (const test of suite.tests) {
                    if (!test.name)
                        continue;
                    test.suiteName = suite.name;
                    test.description = `${test.name} | ${testId}`; // ensure description includes identifier
                    data.push(JSON.stringify(test));
                    crosids.push(testId);
                }
            }
        }
        catch (err) {
            console.error(`Failed to parse file ${files[i]}:`, err);
            continue;
        }
    }
    return [data, crosids];
}
exports.getFilesData = getFilesData;
async function updateJiraIssueStatus(issueCrosID, status) {
    const transitionMap = {
        1: "51",
        0: "41",
        2: "91", // skipped
    };
    const transitionId = transitionMap[status];
    if (!transitionId) {
        console.error(`Invalid status: ${status}`);
        return false;
    }
    const body = { transition: { id: transitionId } };
    const urlParams = `issue/${issueCrosID}/transitions`;
    try {
        await apicall.postJiraData(urlParams, body);
        return true;
    }
    catch (e) {
        console.error("Status of Jira issue is not updated!", e);
        return false;
    }
}
exports.updateJiraIssueStatus = updateJiraIssueStatus;
