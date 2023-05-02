# genderize

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/sebbo2002/genderize/blob/develop/LICENSE)
[![Module Size](https://img.shields.io/bundlephobia/min/genderize?style=flat-square)](https://bundlephobia.com/package/genderize)
[![CI Status](https://img.shields.io/github/actions/workflow/status/sebbo2002/genderize/test-release.yml?style=flat-square)](https://github.com/sebbo2002/genderize/actions)

<br />

`genderize` is a simple client for [genderize.io](https://genderize.io/), a gender prediction API using a person's 
name. The library supports both normal and batch usage, allows free and paid usage via an optional API key, and makes it 
very easy to access rate limiting information. It's written in TypeScript.


## 📦 Installation

	npm install @sebbo2002/genderize


## ⚡️ Quick Start

```typescript
import Genderize from '@sebbo2002/genderize';

const genderize = new Genderize('API-KEY'); // or just `new Genderize()` for free usage

// { name: 'Mia', gender: 'female', probability: 0.96, count: 19266 }
await genderize.predict('Mia');

// {name: 'Steven', gender: 'male, probability: 0.98, count: 5207, country_id: 'US' }
await genderize.predict('Alex', 'US');

// [
//   { name: 'Noah', gender: 'male', probability: 0.88, count: 3939 },
//   { name: 'Evelyn', gender: 'female', probability: 0.98, count: 12188 }
// ]
await genderize.predict(['Noah', 'Evelyn']);

// { limit: 1000, remaining: 978, reset: 2022-05-23T00:00:02.203Z }
genderize.limit
```


## 📑 API-Reference

Every hot detail about the API can be found in [the documentation](https://sebbo2002.github.io/genderize/develop/reference/).


## 🚦 Tests

```
npm test
npm run coverage
```


## 🙆🏼‍♂️ Copyright and license

Copyright (c) Sebastian Pekarek under the [MIT license](LICENSE).
