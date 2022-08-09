export interface Config {
    options: {
        jiraProjectId: number,
        base_api_call: string,
        zephyrApiVersion: string,
        reportsDir: string,
        executor: string,
        version: string,
        cycle: string
    }

    user: {
        jiraProjectId: number,
        base_api_call: string,
        zephyrApiVersion: string,
        reportsDir: string,
        executor: string,
        version: string,
        cycle: string
    }
}