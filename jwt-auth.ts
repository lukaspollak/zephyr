import * as jwt from "atlassian-jwt";
const moment = require("moment");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./config.json");

export function getJWT(
  extendeApiCallUrl: string = "/public/rest/api/1.0/stepresult/search?executionId=bacf0888-4be9-4e07-8474-559daafddfc8&issueId=15550",
  typereq = "GET"
) {
  // define ACCESS from Config file
  const accessKey: string = config[process.argv[2]].access_key;
  const secretKey: string = config[process.argv[2]].secret_key;
  const accountId: string = config[process.argv[2]].account_id;
  const baseUrl: string = config.pollak.base_api_call;

  const now = moment().utc();
  const req: jwt.Request = jwt.fromMethodAndUrl(
    typereq,
    baseUrl + extendeApiCallUrl
  );

  const tokenData = {
    sub: accountId,
    iss: accessKey,
    iat: now.unix(), // The time the token is generated
    exp: now.add(10, "minutes").unix(), // Token expiry time
    qsh: jwt.createQueryStringHash(req, false, baseUrl),
  };

  const token: string = jwt.encodeSymmetric(tokenData, secretKey);
  return token;
}
