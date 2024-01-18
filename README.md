# WS-CLIENT

## Description

Typescript [Webservice](https://devdocs.prestashop-project.org/8/webservice/) Client to use with PrestaShop Core.

TO DO :

- Typing : 2 types are required
  - Readable
  - Writable

PrestaShop Compatibility :

- 9
- 8
- 1.7

NodeJs compatibility :

- 18

## Endpoint to implement

| Endpoint   | URL | Done |
|------------| --- | ---- |
| addresses  |     | []   |
| carts      |     | []   |
| cart_rules |     | []   |
| categories |     | []   |
| country    |     | []   |
| customers  |     | []   |
| orders     |     | []   |
| products   |     | []   |
| stores     |     | []   |
| taxes      |     | []   |
| tax_rules  |     | []   |

## Stack

- [fetch](https://www.npmjs.com/package/node-fetch)
- Typescript

## How to use

Set up the env file:

```sh
cp .env.dist .env
open .env
```

Run some code:

```js
import { categories } from '../../ws-client-endpoints';
import { init } from '../../ws-config';
import { CategoryWritable } from '../types/ws-entities/categories.type';
...
const categoryData: CategoryWritable = {
  ...
}
init('http://localhost:8080', 'GENERATE_A_COMPLEX_WSKEY_WITH_32');
const category: Category = await categories.create(categoryData);
console.log(`Category (id=${category.id} created at ${category.date_add}`,);

// Error case
// Return an Exeption depending on what is the error.
// UnreachableServerException
// WrongPayloadException
// RequestTimeoutException
// InvalidCredentialsException
```

# Build

Install dependencies:

```sh
npm install -g pnpm
pnpm install
```

Build the library:

```sh
pnpm build
```

Test the library:

```sh
pnpm test
```

# Contributing

This library is an open source solution. Everyone is welcome and even encouraged to contribute with their own improvements!

Just make sure to follow our [contribution guidelines](https://devdocs.prestashop-project.org/8/contribute/contribution-guidelines/project-modules/).

## Reporting issues

You can report issues [here](https://github.com/PrestaShop/ws-client/issues/new).
