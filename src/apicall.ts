const auth = require("./jwt-auth");
const request = require("request");
// get parent dir name of node modules
const path = require("path");
const parent_dirname = path.join(__dirname, "../../..");
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
const configZephyrUser = require("/" + parent_dirname + "/configZephyr.json");
export async function getJiraData(
  urlParams: String,
  login = "pollak@bart.sk",
  api_token: string = configZephyrUser.pollak.jira_token
) {
  const url = "https://crossuite.atlassian.net/rest/api/3/" + urlParams;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(login + ":" + api_token).toString(
        "base64"
      )}`,
      Accept: "application/json",
    },
  };

  function requestGet() {
    return new Promise<any>((resolve) => {
      request(url, options, function (error: any, response: any, body: any) {
        resolve(response.body);
      });
    });
  }

  const res = await requestGet().then(function (result: any) {
    return result;
  });

  // console.log(res)
  return res;
}

export async function postJiraData(
  urlParams: string,
  body: any,
  login = "pollak@bart.sk",
  api_token: string = configZephyrUser.pollak.jira_token
) {
  const url = "https://crossuite.atlassian.net/rest/api/3/" + urlParams;
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(login + ":" + api_token).toString(
        "base64"
      )}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  function fetchpost() {
    return new Promise<any>((resolve) => {
      request(url, options, function (error: any, response: any, body: any) {
        resolve(response.body);
      });
    });
  }

  const res = await fetchpost().then(function (result: any) {
    return result;
  });

  return res;
}

export async function getData(
  extendeApiCallUrl: string = "/public/rest/api/1.0/teststep/15550?projectId=10000"
) {
  const JWT: string = auth.getJWT(extendeApiCallUrl);
  const accessKey: string =
    configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
  const baseUrl: string = configZephyr.zephyrDefaultOptions.base_api_call;
  const url: string = baseUrl + extendeApiCallUrl;

  const options = {
    method: "GET",
    headers: {
      Authorization: "JWT " + JWT,
      zapiAccessKey: accessKey,
    },
  };

  function requestGet() {
    return new Promise<any>((resolve) => {
      request(url, options, function (error: any, response: any, body: any) {
        resolve(response.body);
      });
    });
  }

  const res = await requestGet().then(function (result: any) {
    return result;
  });

  // console.log(res)
  return res;
}

export async function putData(extendeApiCallUrl: string, bodyJSON: any) {
  const JWT: string = auth.getJWT(extendeApiCallUrl, "PUT");
  const accessKey: string =
    configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
  const baseUrl: string = configZephyr.zephyrDefaultOptions.base_api_call;
  const url: string = baseUrl + extendeApiCallUrl;

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "JWT " + JWT,
      zapiAccessKey: accessKey,
    },
    body: JSON.stringify(bodyJSON),
  };

  async function requestPut() {
    return await new Promise<any>((resolve) => {
      request(url, options, function (error: any, response: any, body: any) {
        resolve(response.statusCode);
      });
    });
  }

  const res = await requestPut().then(function (result: any) {
    return result;
  });

  return res;
}

export async function postData(extendeApiCallUrl: string, bodyJSON: any) {
  const JWT: string = auth.getJWT(extendeApiCallUrl, "POST");
  const accessKey: string =
    configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
  const baseUrl: string = configZephyr.zephyrDefaultOptions.base_api_call;
  const url: string = baseUrl + extendeApiCallUrl;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "JWT " + JWT,
      zapiAccessKey: accessKey,
    },
    body: JSON.stringify(bodyJSON),
  };

  async function fetchpost() {
    return new Promise<any>((resolve) => {
      request(url, options, function (error: any, response: any, body: any) {
        resolve(response.body);
      });
    });
  }

  const res = await fetchpost().then(function (result: any) {
    return result;
  });

  return res;
}
