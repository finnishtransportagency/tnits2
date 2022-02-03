import ssm from 'aws-sdk/clients/ssm';
const SSM = new ssm();

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
    const parameter = await SSM.getParameter(params).promise();
    const value = parameter.Parameter?.Value;
    if (!value) {
        throw new Error(`Empty API Key value for: ${name}`)
    }
    return value;
}
