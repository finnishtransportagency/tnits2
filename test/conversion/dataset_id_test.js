const assert = require('chai').assert;
const uuid = require('uuid');
const DatasetIDGenerator = require('../../dist/common/dataset_id').DatasetIDGenerator;

describe('Converter: Dataset ID Generator', function() {

    const provider = 'f90056dc-8945-4885-9860-f0f017855cfd';
    const startTime = new Date('2022-01-01T00:00:00.000Z').getTime();
    const endTime = new Date('2022-01-02T00:00:00.000Z').getTime();

    it('Dataset ID should be string of given value', function() {
        const result = DatasetIDGenerator.encode(provider, startTime, endTime);
        
        assert.equal(result, '+QBW3IlFSIWYYPDwF4Vc/QAAAX4S75wAAAABfhgV+AA=');
        assert.typeOf(result, 'string');
    });

    it('Dataset ID should round trip', function() {
        const randomProvider = uuid.v4();
        const encoded = DatasetIDGenerator.encode(randomProvider, startTime, endTime);
        const decoded = DatasetIDGenerator.decode(encoded);

        assert.equal(decoded.providerId, randomProvider);
        assert.equal(decoded.startTime, startTime);
        assert.equal(decoded.endTime, endTime);
    });

});