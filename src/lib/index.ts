import got from 'got';

/**
 * Enum that can be used to compare and check the results
 */
export enum GenderizeGender {
    FEMALE = 'female',
    MALE = 'male'
}

export interface GenderizeSingleResponse {
    /**
     * Name which was used for this prediction
     */
    name: string;

    /**
     * Either a [[`GenderizeGender`]] value (male/female) or null
     * if the API was not able to predict a gender.
     */
    gender: GenderizeGender | null;

    /**
     * Value between 0 and 1 (including)
     */
    probability: number;

    /**
     * The number of data rows examined in order
     * to calculate the API response
     */
    count: number;
}
export interface GenderizeSingleResponseWithCountry extends GenderizeSingleResponse {
    /**
     * ISO 3166-1 alpha-2 country code which was used for this prediction
     */
    country_id: string;
}

export interface GenderizeLimit {
    /**
     * The amount of names available in the current time window
     */
    limit: number;

    /**
     * The number of names left in the current time window
     */
    remaining: number;

    /**
     * Next time window start time
     *
     * ```javascript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     *
     * // execute a predicition
     *
     * genderize.limit?.reset.toString()
     * ```
     */
    reset: Date;
}

export default class Genderize {
    private readonly apiKey;
    private latestHeaders: [Record<string, string[] | string | undefined>, Date] | null = null;

    /**
     * Usually you get an `Genderize` instance like this:
     * ```javascript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     * ```
     *
     * You can get an API key from [store.genderize.io](https://store.genderize.io/).
     *
     * If you don't have an API key yet, you can start with the free plan:
     * ```javascript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize();
     * ```
     */
    constructor(apiKey?: string) {
        this.apiKey = apiKey;
    }

    /**
     * @internal
     */
    static getIntHeader(value: string | string[] | undefined): number | undefined {
        if(Array.isArray(value)) {
            return this.getIntHeader(value[0]);
        }

        if(value === undefined) {
            return undefined;
        }

        return parseInt(value);
    }

    /**
     * Outputs information about the current state of the rate limit. Updated and cached
     * each time [[`predict`]] is called. If no information is available, for example because
     * [[`predict`]] has not been executed yet, `null` is returned. Otherwise the response is
     * of type [[`GenderizeLimit`]].
     */
    get limit(): GenderizeLimit | null {
        if(!this.latestHeaders) {
            return null;
        }

        const limit = Genderize.getIntHeader(this.latestHeaders[0]['x-rate-limit-limit']);
        const remaining = Genderize.getIntHeader(this.latestHeaders[0]['x-rate-limit-remaining']);
        const reset = Genderize.getIntHeader(this.latestHeaders[0]['x-rate-reset']);

        if(limit !== undefined && remaining !== undefined && reset !== undefined) {
            return {
                limit,
                remaining,
                reset: new Date(this.latestHeaders[1].getTime() + (reset * 1000))
            };
        }

        return null;
    }

    /**
     * Internal function which builds the url parameters
     * used to query the prediction endpoint.
     *
     * @internal
     */
    params(names: string | string[], country?: string): URLSearchParams {
        const searchParams = new URLSearchParams();
        if(Array.isArray(names) && names.length > 10) {
            throw new Error(`Too many names given: ${names.length} names provided, but 10 is the maximum allowed`);
        }
        if(Array.isArray(names) && names.length === 0) {
            throw new Error('No name given, but at least one is required');
        }

        if(Array.isArray(names)) {
            names.forEach(name => searchParams.append('name', name));
        } else {
            searchParams.append('name', names);
        }

        if(country) {
            searchParams.append('country_id', country);
        }

        if(this.apiKey) {
            searchParams.append('apikey', this.apiKey);
        }

        return searchParams;
    }

    /**
     * Predict a single name
     *
     * ```typescript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     * genderize.predict('Mia').then(result => {
     *     console.log(result);
     * });
     * ```
     *
     * ```json
     * {
     *   name: 'Mia',
     *   gender: 'female',
     *   probability: 0.96,
     *   count: 19266
     * }
     * ```
     */
    async predict(name: string): Promise<GenderizeSingleResponse>;

    /**
     * Predict multiple names. Works for up to 10 names at the same time.
     *
     * Please check [this list](https://genderize.io/our-data) if you're unsure about
     * the country code you have to use.
     *
     * It is recommended to check the count of the response when using localization.
     * If the count is very low or gender is null, you can fallback to a request
     * with no localization.
     *
     * ```typescript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     * genderize.predict(['Noah', 'Evelyn']).then(result => {
     *     console.log(result);
     * });
     * ```
     *
     * ```json
     * [
     *   { name: 'Noah', gender: 'male', probability: 0.88, count: 3939 },
     *   { name: 'Evelyn', gender: 'female', probability: 0.98, count: 12188 }
     * ]
     * ```
     */
    async predict(names: string[]): Promise<GenderizeSingleResponse[]>;

    /**
     * Predict a single name with a given ISO 3166-1 alpha-2 country code
     *
     * ```typescript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     * genderize.predict('Mia', 'DE').then(result => {
     *     console.log(result);
     * });
     * ```
     *
     * ```json
     * {
     *   name: 'Mia',
     *   gender: 'female',
     *   probability: 0.97,
     *   count: 1786,
     *   country_id: 'DE'
     * }
     * ```
     */
    async predict(name: string, country: string): Promise<GenderizeSingleResponseWithCountry>;

    /**
     * Predict multiple names with a given ISO 3166-1 alpha-2
     * country code. Works for up to 10 names at the same time.
     *
     * Please check [this list](https://genderize.io/our-data) if you're unsure about
     * the country code you have to use.
     *
     * It is recommended to check the count of the response when using localization.
     * If the count is very low or gender is null, you can fallback to a request
     * with no localization.
     *
     * ```typescript
     * import Genderize from '@sebbo2002/genderize';
     * const genderize = new Genderize('API-KEY');
     * genderize.predict(['Noah', 'Evelyn'], 'DE').then(result => {
     *     console.log(result);
     * });
     * ```
     *
     * ```json
     * [
     *   { name: 'Noah', gender: 'male', probability: 1, count: 608, country_id: 'DE' },
     *   { name: 'Evelyn', gender: 'female', probability: 0.97, count: 1665, country_id: 'DE' }
     * ]
     * ```
     */
    async predict(names: string[], country: string): Promise<GenderizeSingleResponseWithCountry[]>;

    async predict(names: string | string[], country?: string): Promise<GenderizeSingleResponse | GenderizeSingleResponse[] | GenderizeSingleResponseWithCountry | GenderizeSingleResponseWithCountry[]> {
        const searchParams = this.params(names, country);
        const {body, headers} = await got.get('https://api.genderize.io/', { searchParams, responseType: 'json' });
        this.latestHeaders = [headers, new Date()];
        return body as GenderizeSingleResponse | GenderizeSingleResponse[];
    }
}
