"use strict";
exports.__esModule = true;
exports.getJWT = void 0;
var jwt = require("atlassian-jwt");
var moment = require("moment");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var config = require("./config.json");
function getJWT(extendeApiCallUrl, typereq) {
    if (extendeApiCallUrl === void 0) { extendeApiCallUrl = "/public/rest/api/1.0/stepresult/search?executionId=bacf0888-4be9-4e07-8474-559daafddfc8&issueId=15550"; }
    if (typereq === void 0) { typereq = "GET"; }
    // define ACCESS from Config file
    var accessKey = config[process.argv[2]].access_key;
    var secretKey = config[process.argv[2]].secret_key;
    var accountId = config[process.argv[2]].account_id;
    var baseUrl = config.pollak.base_api_call;
    var now = moment().utc();
    var req = jwt.fromMethodAndUrl(typereq, baseUrl + extendeApiCallUrl);
    var tokenData = {
        sub: accountId,
        iss: accessKey,
        iat: now.unix(),
        exp: now.add(10, "minutes").unix(),
        qsh: jwt.createQueryStringHash(req, false, baseUrl)
    };
    var token = jwt.encode(tokenData, secretKey);
    return token;
}
exports.getJWT = getJWT;
