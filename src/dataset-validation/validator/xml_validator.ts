import { validateXMLWithXSD } from 'validate-with-xmllint';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os'

/**
 *  Relative path used in the schema spec.tn-its.eu/schemas/TNITS.xsd is not correctly resolved
 *  when it’s run with xmllint in the /tmp directory context.
 *  A replicated schema directory ensures all paths work as expected
 * @param src
 * @param dest
 */
const copyDirectory = (src: string, dest: string) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

export async function validate(datasetXml: string, id: string): Promise<boolean> {
    const dir = process.cwd();
    let tmpSchemaDir: string | undefined;

    try {
        process.chdir('xml-schemas/');
        tmpSchemaDir = fs.mkdtempSync(path.join(tmpdir(), 'schema-'));
        copyDirectory(process.cwd(), tmpSchemaDir);
        const tmpSchemaPath = path.join(tmpSchemaDir, 'reference_schema.xsd');
        await validateXMLWithXSD(
            datasetXml,
            tmpSchemaPath
        );

        return true
    } catch (err) {
        console.error(`Dataset ${id} did not validate against XSD`)
        throw err;
    } finally {
        process.chdir(dir);
    }
}