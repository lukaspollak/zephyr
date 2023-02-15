"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postData = exports.putData = exports.getData = exports.postJiraData = exports.getJiraData = void 0;
const auth = require("./jwt-auth");
const request = require("request");
// get parent dir name of node modules
const path = require("path");
const parent_dirname = path.join(__dirname, "../../..");
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require("/" + parent_dirname + "/configZephyr.json");
const configZephyrUser = require("/" + parent_dirname + "/configZephyr.json");
async function getJiraData(urlParams, login = "pollak@bart.sk", api_token = configZephyrUser.pollak.jira_token) {
    const url = "https://crossuite.atlassian.net/rest/api/3/" + urlParams;
    const options = {
        method: "GET",
        headers: {
            Authorization: `Basic ${Buffer.from(login + ":" + api_token).toString("base64")}`,
            Accept: "application/json",
        },
    };
    function requestGet() {
        return new Promise((resolve) => {
            request(url, options, function (error, response, body) {
                resolve(response.body);
            });
        });
    }
    const res = await requestGet().then(function (result) {
        return result;
    });
    // console.log(res)
    return res;
}
exports.getJiraData = getJiraData;
async function postJiraData(urlParams, body, login = "pollak@bart.sk", api_token = configZephyrUser.pollak.jira_token) {
    const url = "https://crossuite.atlassian.net/rest/api/3/" + urlParams;
    const options = {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(login + ":" + api_token).toString("base64")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };
    function fetchpost() {
        return new Promise((resolve) => {
            request(url, options, function (error, response, body) {
                resolve(response.body);
            });
        });
    }
    const res = await fetchpost().then(function (result) {
        return result;
    });
    return res;
}
exports.postJiraData = postJiraData;
async function getData(extendeApiCallUrl = "/public/rest/api/1.0/teststep/15550?projectId=10000") {
    const JWT = auth.getJWT(extendeApiCallUrl);
    const accessKey = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
    const baseUrl = configZephyr.zephyrDefaultOptions.base_api_call;
    const url = baseUrl + extendeApiCallUrl;
    const options = {
        method: "GET",
        headers: {
            Authorization: "JWT " + JWT,
            zapiAccessKey: accessKey,
        },
    };
    function requestGet() {
        return new Promise((resolve) => {
            request(url, options, function (error, response, body) {
                resolve(response.body);
            });
        });
    }
    const res = await requestGet().then(function (result) {
        return result;
    });
    // console.log(res)
    return res;
}
exports.getData = getData;
async function putData(extendeApiCallUrl, bodyJSON) {
    const JWT = auth.getJWT(extendeApiCallUrl, "PUT");
    const accessKey = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
    const baseUrl = configZephyr.zephyrDefaultOptions.base_api_call;
    const url = baseUrl + extendeApiCallUrl;
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
        return await new Promise((resolve) => {
            request(url, options, function (error, response, body) {
                resolve(response.statusCode);
            });
        });
    }
    const res = await requestPut().then(function (result) {
        return result;
    });
    return res;
}
exports.putData = putData;
async function postData(extendeApiCallUrl, bodyJSON) {
    const JWT = auth.getJWT(extendeApiCallUrl, "POST");
    const accessKey = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
    const baseUrl = configZephyr.zephyrDefaultOptions.base_api_call;
    const url = baseUrl + extendeApiCallUrl;
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
        return new Promise((resolve) => {
            request(url, options, function (error, response, body) {
                resolve(response.body);
            });
        });
    }
    const res = await fetchpost().then(function (result) {
        return result;
    });
    return res;
}
exports.postData = postData;
