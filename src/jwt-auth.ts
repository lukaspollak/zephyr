import * as jwt from "atlassian-jwt";
const moment = require("moment");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const parent_dirname = path.join(__dirname, '../../..');
// get config from parent dir of node modules, so config.json should be placed there
const configZephyr = require('/' + parent_dirname + '/configZephyr.json');
const configZephyrUser = require('/' + parent_dirname + '/configZephyrUser.json');

export function getJWT(
  extendeApiCallUrl: string = "",
  typereq = "GET"
) {
  // define ACCESS from Config file
  const accessKey: string = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].access_key;
  const secretKey: string = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].secret_key;
  const accountId: string = configZephyrUser[configZephyr.zephyrDefaultOptions.executor].account_id;
  const baseUrl: string = configZephyr.zephyrDefaultOptions.base_api_call;

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
