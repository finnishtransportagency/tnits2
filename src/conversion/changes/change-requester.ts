import axios, { AxiosInstance, AxiosError } from "axios";
import { AssetType, AssetTypes } from '../tn-its/helper/asset_types';
import { AssetTypeChanges } from '../tn-its/helper/interfaces';
import { getInstances, AxiosInstances } from './instances';

/** Max number of changes fetched at one query */
const LIMIT_RECORD_NUMBER = 8000;
const MAX_REDIRECTS = 540; // 3 hours / 20 seconds per retry. Same as Digiroad

export async function fetchAllChanges(startTime: string, endTime: string) {
    console.log(`Fetching changes from ${startTime} to ${endTime}`);
    const instances = await getInstances();
    const results: Array<PromiseSettledResult<AssetTypeChanges>> = await Promise.allSettled(requestAllChanges(startTime, endTime, instances))
    const errors = results.filter(response => response.status === 'rejected') as PromiseRejectedResult[];
    if (errors.length > 0) {
        for (const err of errors) {
            console.error(err.reason)
        }
        throw new Error("Unable to fetch all assetTypes. Stopping conversion process.");
    } else {
        const fetchSuccess = results as PromiseFulfilledResult<AssetTypeChanges>[];
        return fetchSuccess.map(response => response.value);
    }
}

function requestAllChanges(sinceDate: string, untilDate: string, instances: AxiosInstances): Promise<AssetTypeChanges>[] {
    const responses = [];
    for (const assetType of AssetTypes) {
        console.log(`Started to query ${assetType.id}`);
        const instance = instances[assetType.provider.name];
        const assetTypeChanges = recursiveAssetTypeRequest(assetType, instance, sinceDate, untilDate, 1, {'assetType': assetType, features: []});
        responses.push(assetTypeChanges);
    }
    return responses;
}

async function recursiveAssetTypeRequest( assetType: AssetType, instance: AxiosInstance, since: string, until: string, 
                                    pageNumber: number, results: AssetTypeChanges): Promise<AssetTypeChanges> {
    const limit_messages = `pageNumber:${pageNumber}, recordNumber:${LIMIT_RECORD_NUMBER}`;
    const token = Buffer.from(limit_messages).toString('base64');
    try {
        const response = await instance.get(`${assetType.id}?since=${since}&until=${until}&token=${token}`, {maxRedirects: MAX_REDIRECTS});
        results.features = results.features.concat(response.data.features);
        if (response.data.features.length === LIMIT_RECORD_NUMBER) {
            return await recursiveAssetTypeRequest(assetType, instance, since, until, pageNumber + 1, results);
        } else {
            console.log(`Fetched ${results.features.length} assets of type ${assetType.id}`);
            return results;
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(`Error happened during fetch of ${assetType.id} ` + getAxiosErrorMessage(err));
        } else {
            console.error(`Asset type ${assetType.id} responded with error:`);
            console.error(err)
            throw new Error(`Error happened during fetch of ${assetType.id}`);
        }
    }
}

function getAxiosErrorMessage(err: AxiosError): string {
    if (err.response == undefined) {
        return (`(${err.message})`);
    }
    const { status, statusText, data } = err.response;
    return `(${status}: ${statusText}. Data fetched: ${data})`;
}