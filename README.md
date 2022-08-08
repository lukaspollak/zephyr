# Zephyr

Parsing data generated from Selenium or Jest (WIP) and import it to extension for JIRA:Zephyr as reports of automation testing! In the current(latest) version u are able to do:
* select for which JIRA project u wanna import parsed data
* select who executed tests, so who has correct access rights defined in configZephyrUser.json
* create specific cycle for version to which reports will imported
     * cycle is parsed from branch, so when u have prepared release/X.X.X branch, it will create cycle RELEASE and placed this cycle to executions for version X.X.X
     * in the case u do not wanna to have cycle named as RELEASE, u can name it as u want. F.i. development_cycle and it will create cycle with specified name to version from selected branch X.X.X
     * in the case that there is no version specified, so branch is called f.i. development, production or feature/name > reports will imported as Ad Hoc 
* TODO:
     * specify Assignee, so to which user the executed tests will assigned
     * divide tests in cycle to folders
     * run specific tests via specified components of main TEST issue
     * ...

Package for import reports to Jira extension Zephyr should be correctly installed for project wehre it will be used, so correctly placed in package.json of project.

# FILE STRUCTURE OF PACKAGE IMPLEMENTATION

```shell script
.
├── Home directory                        # project where package is installed - here must be configs placed after instalation of npm package
     └── configZephyr.json                # configuration of Project, API version of Apiari (Zephyr), inputs for run script as executor, branch, custom cycle name
     └── confgiZephyrUser.json            # ids, keys, tokens for reporter (or ...) which use the zephyr script
     └── node_modules                     # node modules of project fro where zephyr-import package is installed
          └── zephyr-import               # project
               └── README
               └── ...
```

# USER CONFIG Example

* account_id: u can find it in url when u open your profile in JIRA: project.atlassian.net/jira/people/{{account_id}}
* access_key: key to access for zephyr API. Go in JIRA: Apps/Zephyr/API Keys >> copy Access key
* secret_key: key to access for zephyr API. Go in JIRA: Apps/Zephyr/API Keys >> copy Secret key >> do not send it to external users (security)
* jira_token: go to Manage profile url: https://id.atlassian.com/manage-profile/security/api-tokens, and generate your new token

```shell script
// confgiZephyrUser.json
{
  "user_name": {
    "account_id": "6x483..xx...08bd4",
    "access_key": "MD...xxx...........kFVTFRfT..xxx...RQ",
    "secret_key": "ALBJgdcccxxxxx.....y2DtadVI.....WUfgp..xx",
    "jira_token": "5qAvm...xxxx...4BD"
  },
}

```

# Zephyr CONFIG Example

* jiraProjectID: ID of project, ussually number. U can find it in project URL.
* base_api_call: DEVELOPMENT: default value, DO NOT CHANGE IT if u do not wanna update implementation
* zephyrApiVersion: DEVELOPMENT: default value, DO NOT CHANGE IT if u do not wanna update implementation
* reportsDir: Selenium reported generate JSONs as tests results. So each IT() of test === one generate JSON. Script needs to have path to mentioned JSON. See example lower in shell script
* exectuor: who is running the script and his params are defined in user config above
* version: so branch. This is the input from which selected version is found and new cycle is linked to version found.
* cycle: custom cycle name. So if u do not wanna to have name parsed from version paramater, u can put custom name of cycle which will be linked to version found by param version 
```shell script
// configZephyr.json
{
  "zephyrDefaultOptions": {
    "jiraProjectId": 10000,
    "base_api_call": "https://prod-api.zephyr4jiracloud.com/connect",
    "zephyrApiVersion": "1.0",
    "reportsDir": "./reports/jsons",
    "executor": "user_name",
    "version": "release/2.5.5",
    "cycle": "RELEASE"
  }
}
```
# Installing project
```shell script
npm i zephyr-import
```


