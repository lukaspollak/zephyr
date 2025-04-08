// get parent dir name of node modules
const path = require("path");
const parent_dirname = path.join(__dirname, "../../..");
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
const ZephyrApiVersion =
  "/public/rest/api/" + configZephyr.zephyrDefaultOptions.zephyrApiVersion;
const jiraProjectID = configZephyr.zephyrDefaultOptions.jiraProjectId;
const apicall = require("./apicall");
const fs = require("fs");
// folder where jsons are placed
let testFolder: string = "../reports/jsons/";
if (configZephyr.zephyrDefaultOptions.reportsDir != null) {
  testFolder = configZephyr.zephyrDefaultOptions.reportsDir + "/";
}

async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 5000): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (retries <= 0) throw e;
    if (e?.message?.includes("Rate limit exceeded")) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return retry(fn, retries - 1, delay);
    }
    throw e;
  }
}

export function getTestIT(description: String) {
  const start_pos = 0;
  const start_pos1 = description.indexOf("|");
  const text_to_get = description.substring(start_pos, start_pos1);
  return text_to_get;
}

export function getJiraCrosId(description: String) {
  const start_pos = description.indexOf("|") + 1;
  const end_pos = description.indexOf(" ", start_pos);
  const issueId = description.substring(start_pos, end_pos);
  return issueId;
}

export function getTestId(description: String) {
  const crosid = getJiraCrosId(description);
  const start_pos = crosid.indexOf("|") + 1;
  const end_pos = crosid.length;
  const issueId = crosid.substring(start_pos, end_pos);

  if (issueId.length == 9) {
    return "1" + issueId.substring(5, issueId.length);
  } else if (issueId.length == 10) {
    return "2" + issueId.substring(6, issueId.length);
  }
}

export async function getIdOfVersion(
  versionName: string,
  projectId: number = jiraProjectID
) {
  let versions: string;
  let versionsJSON: any;
  let id: number = -1;
  if (versionName != "development") {
    try {
      versions = await apicall.getJiraData(
        "project/" + projectId + "/versions"
      );
      versionsJSON = JSON.parse(versions);

      for (let i in versionsJSON) {
        if (versionsJSON[i].name.includes(versionName)) {
          id = versionsJSON[i].id;
          return id;
        }
      }
    } catch (err) {
      console.log("Versions call troubles!", err);
    }
  } else if (versionName === "development") {
    id = -1;
  }
  if (id === -1) {
    console.log("Version does not exist or u wanna run test as Ad Hoc!");
    return id;
  }
}

export async function createCycle(
  branch: string,
  custom_cycle_name: string = "",
  projectId: number = jiraProjectID
) {
  let response: any;
  let version: string = "";
  let environment: string = "";
  let cycleName: string = "";
  let description: string = "default description";
  let cycle_id: string = "";

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
    await getIdOfVersion(version, projectId).then(async function (
      versionID: number
    ) {
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
  } catch (error) {
    console.log(
      "Continue as Ad hoc reporting, because an error occured when founding version:",
      error
    );
    cycle_id = undefined;
  }
  return cycle_id;
}

export async function getCycleId(
  branch: string,
  cycleName: string = "",
  skip_duplicity_verify: boolean = false,
  current_used_cycle_id: string = undefined,
  projectId: number = jiraProjectID
) {
  let response: any;
  let cycle_id: any = -1;

  if (current_used_cycle_id == undefined) {
    if (skip_duplicity_verify == false) {
      const splittedVersion = branch.split("/", 2);
      const versionName = splittedVersion[1];
      if (cycleName == "") {
        cycleName = splittedVersion[0];
      }

      await getIdOfVersion(versionName).then(async function (
        versionID: number
      ) {
        if (versionID != -1) {
          response = await apicall.getData(
            ZephyrApiVersion +
              "/cycles/search?versionId=" +
              versionID +
              "&" +
              "projectId=" +
              projectId
          );
          const cycleJSON = JSON.parse(response);

          if (!cycleJSON || !Array.isArray(cycleJSON)) {
            console.error("Unexpected response for cycles!");
            return -1;
          }

          for (let i in cycleJSON) {
            const name = cycleJSON[i]?.name;
            if (!name) continue;

            if (name.toLowerCase() === cycleName.toLowerCase()) {
              cycle_id = cycleJSON[i].id;
              return cycle_id;
            }
          }
          if (cycle_id == -1) {
            console.log("Cycle does not exist!");
            return cycle_id;
          }
        } else {
          console.error("Version does not Exist!");
        }
      });
    } else if (skip_duplicity_verify == true) {
      cycle_id = -1;
    }
  } else {
    cycle_id = current_used_cycle_id;
  }
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

export async function createAndAssignExecution(
  jiraIssueID: string = "",
  cycleId: any,
  branch: string,
  custom_cycle_name: string = ""
) {
  const versionName = branch.split("/").pop();
  const versionID = await this.getIdOfVersion(versionName);

  if (jiraIssueID == "") {
    console.error("No JIRA ID SET!");
  }
  if (cycleId == -1) {
    console.log("Creating cycle ...");
    const [exec_id, cycle_id] = await this.createExecution(
      jiraIssueID,
      await this.createCycle(branch, custom_cycle_name),
      versionID
    );
    return [exec_id, cycle_id];
  } else {
    const [exec_id, cycle_id] = await this.createExecution(
      jiraIssueID,
      cycleId,
      versionID
    );
    return [exec_id, cycle_id];
  }
}

export async function createExecution(
  jiraIssueID: string = "",
  cycleId: any = -1,
  versionID: any = -1
) {
  if (!jiraIssueID) throw new Error("No JIRA ID SET!");

  const body = {
    status: { id: -1 },
    projectId: jiraProjectID,
    issueId: jiraIssueID,
    cycleId,
    versionId: versionID,
    assigneeType: "currentUser",
  };

  async function execWithRetry(retries = 5): Promise<[string, any]> {
    const data = await apicall.postData(ZephyrApiVersion + "/execution", body);
    let json: any;

    try {
      json = JSON.parse(data);
    } catch (err) {
      throw new Error("Failed to parse Zephyr response.");
    }

    // detect rate limit
    if (json?.error === "Rate limit exceeded") {
      const waitMatch = json.message?.match(/(\d+)\s*seconds/);
      const waitTime = waitMatch ? parseInt(waitMatch[1]) * 1000 : 5000;

      if (retries > 0) {
        console.warn(`Rate limited. Retrying after ${waitTime} ms...`);
        await new Promise((res) => setTimeout(res, waitTime));
        return await execWithRetry(retries - 1);
      } else {
        throw new Error("Exceeded retry attempts due to rate limiting.");
      }
    }

    if (!json?.execution?.id) {
      console.error("Missing execution ID in response:", json);
      throw new Error("Missing execution ID in response");
    }

    return [json.execution.id, cycleId];
  }

  return await execWithRetry();
}


// createExecution('24452','4c544096-cb8a-4d5f-9030-a31ae60e44a6','10737');

export async function bulkEditExecs(
  execs: Array<string>,
  status: boolean,
  pending: boolean = false,
  unexecuted: boolean = false
) {
  let body: any;

  if (unexecuted === true) {
    body = {
      executions: execs,
      status: -1,
      clearDefectMappingFlag: false,
      testStepStatusChangeFlag: false,
      stepStatus: -1,
    };
  } else if (status === true && !pending) {
    body = {
      executions: execs,
      status: 1,
      clearDefectMappingFlag: false,
      testStepStatusChangeFlag: true,
      stepStatus: 1,
    };
  } else if (status === false && !pending) {
    body = {
      executions: execs,
      status: 2,
      clearDefectMappingFlag: false,
      testStepStatusChangeFlag: false, 
      stepStatus: -1,
    };
  } else if (status === false && pending) {
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


export async function bulkEditSteps(exec: string, status: boolean) {
  let body: any;
  const execs = [exec];
  if (status == true) {
    body = {
      executions: execs,
      status: -1,
      clearDefectMappingFlag: false,
      testStepStatusChangeFlag: true,
      stepStatus: 1,
    };
  } else if (status == false) {
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

export async function putStepResult(
  execId: string,
  issueId: string,
  stepResultId: string,
  resultOfTest: number,
  console_log: string = "Passed."
) {
  const body = {
    executionId: execId,
    issueId: issueId,
    comment: console_log,
    status: { id: resultOfTest, description: console_log },
  };

  const fn = async () =>
    await apicall.putData(
      ZephyrApiVersion + "/stepresult/" + stepResultId,
      body
    );

  await retry(fn);
}


export async function updateStepResult(
  obj: any,
  issueId: string,
  execId: string
) {
  let dataRaw = await apicall.getData(
    ZephyrApiVersion + "/teststep/" + issueId + "?projectId=" + jiraProjectID
  );
  let stepResultRaw = await apicall.getData(
    ZephyrApiVersion +
      "/stepresult/search?executionId=" +
      execId +
      "&issueId=" +
      issueId +
      "&isOrdered=true"
  );

  let data, stepResult;
  try {
    data = JSON.parse(dataRaw);
    stepResult = JSON.parse(stepResultRaw);
  } catch (err) {
    console.error("Failed to parse step data or results:", err);
    return;
  }

  const stepName = getTestIT(obj["description"]);
  const console_log: string = Array.isArray(obj["message"])
    ? obj["message"].join(" | ")
    : obj["message"]?.toString() ?? "";

  const passed = obj["passed"];
  const pending = obj["pending"];
  const selectedSteps = data.map(({ step }) => step);
  const selectedStepsIds = data.map(({ id }) => id);

  console.log("Looking for step:", stepName);
  console.log("Available JIRA steps:", selectedSteps);

  const indexOfStep = selectedSteps.indexOf(stepName);
  if (indexOfStep === -1) {
    console.error("Not matched step: check test description vs JIRA steps!");
    return;
  }

  const stepResultItem = stepResult?.stepResults?.[indexOfStep];
  if (!stepResultItem) {
    console.error(`stepResult is undefined at index ${indexOfStep}`);
    return;
  }

  const stepResultId = stepResultItem.id;

  let resultOfTest: number;
  if (pending === true) {
    resultOfTest = 3;
  } else if (passed === true) {
    if (
      console_log.includes("screenshot did not match") ||
      console_log.includes("Expected")
    ) {
      resultOfTest = 2;
    } else {
      resultOfTest = 1;
    }
  } else {
    resultOfTest = 2;
  }

  await putStepResult(execId, issueId, stepResultId, resultOfTest, console_log);
}


export async function execs(path: string = testFolder): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
}


export async function getFilesData(path: string = testFolder) {
  const files = await execs(path);
  let data: string[] = [];
  let crosids: string[] = [];

  function getJson(file: string) {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path + file, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  for (let i = 0; i < files.length; i++) {
    try {
      const content = await getJson(files[i]);
      const json = JSON.parse(content);

      if (!json.suites || !Array.isArray(json.suites)) continue;

      for (const suite of json.suites) {
        const description = suite.name || "";
        const testId = getTestId(description);

        if (!testId) {
          console.warn(`Skipped file ${files[i]}: could not extract testId from suite name '${suite.name}'`);
          continue;
        }

        if (!suite.tests || !Array.isArray(suite.tests)) continue;

        for (const test of suite.tests) {
          if (!test.name) continue;

          test.suiteName = suite.name;
          test.description = `${test.name} | ${testId}`; // ensure description includes identifier

          data.push(JSON.stringify(test));
          crosids.push(testId);
        }
      }
    } catch (err) {
      console.error(`Failed to parse file ${files[i]}:`, err);
      continue;
    }
  }

  return [data, crosids];
}


export async function updateJiraIssueStatus(
  issueCrosID: string,
  status: number
): Promise<boolean> {
  const transitionMap: Record<number, string> = {
    1: "51", // passed
    0: "41", // fail
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
  } catch (e) {
    console.error("Status of Jira issue is not updated!", e);
    return false;
  }
}

