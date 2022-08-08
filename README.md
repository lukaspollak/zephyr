# Zephyr

Parsing data generated from Selenium or Jest and import it to extension for JIRA:Zephyr as reports of automation testing! In the current(latest) version u are able to do:
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
     └── node_modules                     # node modules of project fro which zephyr-import package is installed
          └── zephyr-import               # project
               └── README
               └── configZephyr.ts
               └── configZephyrUser.ts
               └── dist                   # compiled scripts from src. Compiled by npm run build defined in scripts of package.json
                    └── data.js                
                    └── apicall.js            
                    └── jwt-atuh.js            
                    └── main.js 
               └── dist                   # implementation scripts
                    └── data.ts           # parsing data             
                    └── apicall.ts        # apiCall to Apiari (Zephyr)    
                    └── jwt-atuh.ts       # authentfication for api calls     
                    └── main.ts           # main algorithm for importing 
               └── package.json                          
               └── tsconfig.json          # compiler options
```

# Installing project
```shell script
npm i
```

# Compile changes
```shell script
tsc main.ts
```

# Run compiled changes - resp. run importing
- needed reports folder as zephyr/reports
```shell script
node main.js {user_name} (branch_name) {cycle_custom_name}

# user_name - your name from config 
# branch_name - branch from which u run tests, when u put release/X.X.X, it will create new cycle RELEASE (if no exist in current version /X.X.X)
# cycle_custom_name - custom cycle name, it will ignore first part of branch {release/} and it will create new custom cycle with custom_cycle_name if no already exists for version /X.X.X
```

# Compile and run at once
```shell script
npx ts-node main.ts
```

