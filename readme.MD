## Log to HTML

A lightweight JavaScript utility that adds a dynamic log window to your application, beautifies console outputs, and enhances debugging on mobile interfaces. 

## Npm Package

- https://www.npmjs.com/package/logtohtml

## Installation

1. Using NPM

```bash
npm install logtohtml
```

OR 

1. Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/logtohtml@0.0.3/dist/bundle.js"></script>
```

2. Add Query Param `?logtohtml=true` to your URL for testing

3. Demo Image
![Demo Image](./assets/demo.png)

## Usage

```js
import { createLogWindow, overrideConsole } from 'logtohtml';

createLogWindow();
overrideConsole();
```

## License

MIT © [Kunal Singh](https://singhkunal2050.dev)