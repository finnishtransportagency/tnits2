import libxmljs from 'libxmljs2';
import fs from 'fs';
import path from 'path';

export function validate(datasetXml: string, id: string): boolean {
    const dir = process.cwd();
    try {
        process.chdir('xml-schemas/');
        const schemaPath = path.resolve(process.cwd(), './reference_schema.xsd');
        const schemaString = fs.readFileSync(schemaPath, 'utf-8').toString();
        const schema = libxmljs.parseXml(schemaString);
        const doc = libxmljs.parseXml(datasetXml.toString());
        const valid = doc.validate(schema);
        if (!valid) {
            console.error({ errors: doc.validationErrors });
            throw new Error(`Dataset ${id} did not validate against XSD`)
        }
        return valid;
    } catch (err) {
        throw err;
    } finally {
        process.chdir(dir);
    }
}