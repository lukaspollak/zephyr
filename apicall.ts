// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./config.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const auth = require('./jwt-auth');
// import http from "http";
const request = require("request");
// const fetch = require('node-fetch');

export async function getJiraData(urlParams, login = "pollak@bart.sk", api_token: string = config.pollak.jira_token) {
    const url = 'https://crossuite.atlassian.net/rest/api/3/' + urlParams;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${Buffer.from(
                login + ':' + api_token
            ).toString('base64')}`,
            'Accept': 'application/json'
        },
    };

    function requestGet() {
        return new Promise<any>((resolve) => {
            request(url, options, function (error: any, response: any, body: any) {
                resolve(response.body);
            })
        });
    }

    const res = await requestGet().then(function (result: any) {
        return result;
    })

    // console.log(res)
    return res;
};

export async function getData(extendeApiCallUrl: string = '/public/rest/api/1.0/teststep/15550?projectId=10000') {
    const JWT: string = auth.getJWT(extendeApiCallUrl);
    const accessKey: string = config[process.argv[2]].access_key;
    const baseUrl: string = config.pollak.base_api_call;
    const url: string = baseUrl + extendeApiCallUrl;

    const options = {
        method: 'GET',
        headers: {
            Authorization: 'JWT ' + JWT,
            zapiAccessKey: accessKey,
        },
    };

    function requestGet() {
        return new Promise<any>((resolve) => {
            request(url, options, function (error: any, response: any, body: any) {
                resolve(response.body);
            })
        });
    }

    const res = await requestGet().then(function (result: any) {
        return result;
    })

    // console.log(res)
    return res;
};

export async function putData(extendeApiCallUrl: string, bodyJSON: any) {
    const JWT: string = auth.getJWT(extendeApiCallUrl, "PUT");
    const accessKey: string = config[process.argv[2]].access_key;
    const baseUrl: string = config.pollak.base_api_call;
    const url: string = baseUrl + extendeApiCallUrl;

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'JWT ' + JWT,
            zapiAccessKey: accessKey,
        },
        body: JSON.stringify(bodyJSON),
    };

    async function requestPut() {
        return await new Promise<any>((resolve) => {
            request(url, options, function (error: any, response: any, body: any) {
                resolve(response.statusCode);
            })
        });
    }

    const res = await requestPut().then(function (result: any) {
        return result;
    })

    return res;
};

export async function postData(extendeApiCallUrl: string, bodyJSON: any) {
    const JWT: string = auth.getJWT(extendeApiCallUrl, "POST");
    const accessKey: string = config[process.argv[2]].access_key;
    const baseUrl: string = config.pollak.base_api_call;
    const url: string = baseUrl + extendeApiCallUrl;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'JWT ' + JWT,
            zapiAccessKey: accessKey,
        },
        body: JSON.stringify(bodyJSON),
    };

    function fetchpost() {
        return new Promise<any>((resolve) => {
            request(url, options, function (error: any, response: any, body: any) {
                resolve(response.body);
            })
        });
    }

    const res = await fetchpost().then(function (result: any) {
        return result;
    })

    return res;
};