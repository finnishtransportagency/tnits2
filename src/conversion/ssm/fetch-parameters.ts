import {GetParameterCommand, GetParameterCommandOutput, SSMClient} from '@aws-sdk/client-ssm';
const ssmClient = new SSMClient({region: process.env.AWS_REGION});

/**
 * Fetch parameter value from parameter store
 * @param name      Name of parameter
 * @param secure    Boolean, is the param secure or not
 * @returns         Parameter value or empty string
 */
export async function fetchSSMParameterValue(name: string, secure: boolean): Promise<string> {
    const params = {
        Name: name,
        WithDecryption: secure
    }
    try {
        const command: GetParameterCommand = new GetParameterCommand(params)
        const result: GetParameterCommandOutput = await ssmClient.send(command)
        const value = result.Parameter?.Value;
        if (!value) {
            throw new Error(`Empty API Key value for: ${name}`)
        }
        return value;
    }
    catch (err) {
        console.error(err)
        throw new Error("Error fetching SSM paramater value")
    }
}
