'use strict';

import Genderize, { GenderizeGender } from '../../src/lib';
import assert from 'assert';

describe('Genderize', function () {
    describe('params()', function () {
        it('should work with arrays', function () {
            assert.equal(
                new Genderize().params(['Max', 'Lisa'], 'DE').toString(),
                'name[]=Max&name[]=Lisa&country_id=DE'
            );
        });
        it('should work with single string', function () {
            assert.equal(new Genderize().params('Max').toString(), 'name=Max');
        });
        it('should throw an exception if no name was given', function() {
            assert.throws(() => {
                new Genderize().params([]);
            }, /No name given, but at least one is required/);
        });
        it('should throw an exception if > 10 names were given', function() {
            assert.throws(() => {
                new Genderize().params([
                    'James', 'Robert', 'John', 'Michael', 'David', 'William',
                    'Richard', 'Thomas', 'Christopher', 'Daniel', 'Paul'
                ]);
            }, /Too many names given: 11 names provided, but 10 is the maximum allowed/);
        });
        it('should add the apiKey if given', function () {
            assert.equal(
                new Genderize('hello-world').params(['Max', 'Lisa'], 'DE').toString(),
                'name[]=Max&name[]=Lisa&country_id=DE&apikey=hello-world'
            );
        });
    });
    describe('limit()', function () {
        it('should return null if no request was sent before', function () {
            assert.strictEqual(new Genderize().limit, null);
        });
    });
    describe('getIntHeader()', function() {
        it('should work with string', function() {
            assert.strictEqual(Genderize.getIntHeader('123'), 123);
        });
        it('should work with string[]', function() {
            assert.strictEqual(Genderize.getIntHeader(['123', '456']), 123);
        });
        it('should work with undefined', function() {
            assert.strictEqual(Genderize.getIntHeader(undefined), undefined);
        });
    });
    describe('detect()', function () {
        this.timeout(10000);

        it('should work with single names', async function() {
            const g = new Genderize();
            const result = await g.predict('Max');
            assert.equal(result.name, 'Max');
            assert.equal(result.gender, 'male');
            assert.equal(result.gender, GenderizeGender.MALE);
            assert.ok(result.probability > 0.9, 'probability > 0.9');
            assert.ok(result.count > 10000, 'count > 10000');

            assert.ok(g.limit, 'limit is set');
            assert.ok(g.limit.limit > 0, 'limit > 0');
            assert.ok(g.limit.remaining > 0, 'remaining > 0');
            assert.ok(g.limit.reset instanceof Date, 'reset is a Date');
        });
        it('should work with multiple names', async function() {
            const g = new Genderize();
            const result = await g.predict(['Moritz', 'Lisa']);
            assert.equal(result.length, 2);

            assert.equal(result[0].name, 'Moritz');
            assert.equal(result[0].gender, 'male');
            assert.equal(result[0].gender, GenderizeGender.MALE);
            assert.ok(result[0].probability > 0.9, 'probability > 0.9');
            assert.ok(result[0].count > 10000, 'count > 10000');

            assert.equal(result[1].name, 'Lisa');
            assert.equal(result[1].gender, 'female');
            assert.equal(result[1].gender, GenderizeGender.FEMALE);
            assert.ok(result[1].probability > 0.9, 'probability > 0.9');
            assert.ok(result[1].count > 10000, 'count > 10000');

            assert.ok(g.limit, 'limit is set');
            assert.ok(g.limit.limit > 0, 'limit > 0');
            assert.ok(g.limit.remaining > 0, 'remaining > 0');
            assert.ok(g.limit.reset instanceof Date, 'reset is a Date');
        });
    });
});
