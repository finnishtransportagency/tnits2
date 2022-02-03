import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getBucketObjects } from '../common/s3_list_objects';
import { DatasetLister } from './tn-its/list_datasets';

export const handler = async ( event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> => {
    try {
        const lastValid = event.queryStringParameters?.lastValidDataSetID;
        const objectKeys = await getBucketObjects(process.env.S3_BUCKET, lastValid);
        const datasetList = new DatasetLister(objectKeys).datasetRefListAsXml();
        return gatewayResponse(200, datasetList.toString());
    } catch (err) {
        console.error(err);
        return gatewayResponse(400, `Error: ${err}`);
    }
}

function gatewayResponse(statusCode: number, body: string): APIGatewayProxyResult {
    return {
        statusCode: statusCode,
        headers: { 'Content-Type': statusCode == 200 ? 'application/xml' : 'application/json' },
        body: body
    };
}