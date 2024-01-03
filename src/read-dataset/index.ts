import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getSignedDatasetUrl } from './s3-storage/fetch-handler';

export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dataSetID = event.queryStringParameters?.dataSetID;
    if (!dataSetID) {
        throw new Error("Required dataset ID missing");
    }
    try {
        const dataSetUrl = await getSignedDatasetUrl(encodeURIComponent(dataSetID));
        return gatewayResponse(302, '', 'application/xml', dataSetUrl);
    } catch (err) {
        console.error(err);
        return gatewayResponse(400, `Error: ${err}`, 'application/json');
    }
}

function gatewayResponse(statusCode: number, body: string, contentType: string, location = ''): APIGatewayProxyResult {
    const response: APIGatewayProxyResult = {
        statusCode: statusCode,
        headers: {
            'Content-Type': contentType
        },
        body: body
    };
    if (location && response.headers) response.headers.Location = location;
    return response;
}