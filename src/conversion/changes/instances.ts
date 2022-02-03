import axios, { AxiosInstance } from "axios";
import { fetchSSMParameterValue } from "../ssm/fetch-parameters";
import { providers } from "../tn-its/helper/asset_types";

export interface AxiosInstances {
    [ key: string ]: AxiosInstance
}

export async function getInstances() {
    const instances: AxiosInstances = {};
    for (const [key, value] of Object.entries(providers)) {
        instances[key] = await createInstance(value.baseUrl, value.apiKeyPath)
    }
    return instances;
}

async function createInstance(baseUrl: string = "", apiKeyPath: string = ""): Promise<AxiosInstance> {
    try {
        const apiKeyValue = await fetchSSMParameterValue(apiKeyPath, true);
        return axios.create({
            baseURL: baseUrl,
            headers: {
                "X-API-Key": apiKeyValue,
                "Content-Type": "application/json"
            }
        });
    } catch (err) {
        console.error(err);
        throw new Error(`Error fetching API Key from ${apiKeyPath}`);
    }
}
