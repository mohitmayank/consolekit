# consolekit
Console decoration with colors and level restriction for node

## install
`npm install consolekit`

## use
start consolekit with level of logging required in following order 
- log  - log everything
- trace - log everything except console.log
- info - ignore debug messges
- warn - only warning and error 
- error - only error
- none - don't log anything


```javascript
require('consolekit')('log');

console.log('console.log');
console.trace('console.trace');
console.info('console.info');
console.warn('console.warn');
console.error('console.error');
```

