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

| Endpoint  | URL | Done |
|-----------|-----|------|
| product   |     | []   |
| order     |     | []   |
| customer  |     | []   |
| cart      |     | []   |
| cart_rule |     | []   |
| category  |     | []   |
| store     |     | []   |
| tax       |     | []   |
| tax_rule  |     | []   |
| address   |     | []   |
| country   |     | []   |


## Stack
- [fetch](https://www.npmjs.com/package/node-fetch)
- Typescript

## Architecture

## How to use
```js
const client = new WSClient({
  baseURl: process.env.BASE_URL, // URL of your PrestaShop
  wsKey: process.env.WS_KEY, // Key to connect to your prestashop
});

const response = await client.product.create(productData); 
console.log(response.status);
console.log(response.data.product); // Maybe return type writable ??

// Error case
// Return an Exeption depending on what is the error.
// UnreachableServerException
// WrongPayloadException
// RequestTimeoutException
// InvalidCredentialsException

```

### Contributing
 
This library is an open source solution. Everyone is welcome and even encouraged to contribute with their own improvements!

Just make sure to follow our [contribution guidelines](https://devdocs.prestashop-project.org/8/contribute/contribution-guidelines/project-modules/).

### Reporting issues

You can report issues [here](https://github.com/PrestaShop/ws-client/issues/new).

