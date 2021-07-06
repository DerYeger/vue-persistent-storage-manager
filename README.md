<h1 align="center">vue-persistent-storage-manager</h1>

<p align="center">
  <a href="https://github.com/DerYeger/vue-persistent-storage-manager/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/workflow/status/DerYeger/vue-persistent-storage-manager/CI?label=CI&logo=github">
  </a>
  <a href="https://www.npmjs.com/package/vue-persistent-storage-manager">
    <img alt="NPM" src="https://img.shields.io/npm/v/vue-persistent-storage-manager">
  </a>
</p>

> Vue plugin that wraps the StorageManager API and provides reactivity.

## Features

- 💽 **StorageManager**: Wraps the [StorageManager](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager) API.
- 🔁 **Reactive**: Provides observable state using Vue's reactivity
- ✔️ **SSR**: Supports server-side-rendering by validating the availability of the StorageManager API.

## Installation

1. Install dependency

```bash
# yarn
$ yarn add vue-persistent-storage-manager

# npm
$ npm install vue-persistent-storage-manager
```

2. Configure plugin

```typescript
import Vue from 'vue'
import { VuePersistentStorageManager } from 'vue-persistent-storage-manager'

Vue.use(VuePersistentStorageManager, { watchStorage: true })
```

> Note: If `watchStorage` is set to `true`, the functions `localStorage.setItem` and `localStorage.removeItem` are replaced by functions that call the original implementations.

### Nuxt

1. Create the file `plugins/persistentStorageManager.ts` with the following contents.

```typescript
import Vue from 'vue'
import { VuePersistentStorageManager } from 'vue-persistent-storage-manager'

export default () => {
  Vue.use(VuePersistentStorageManager, { watchStorage: true })
}
```

2. Update the `plugins` array in `nuxt.config.js`.

```typescript
export default {
  plugins: [
    { src: '~/plugins/persistentStorageManager.ts' },
  ],
}
```

## Development

```bash
# install dependencies
$ yarn install

# build for production
$ yarn build

# lint project files
$ yarn lint

# run tests
$ yarn test
```

## License

[MIT](./LICENSE) - Copyright &copy; Jan Müller
