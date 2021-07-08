<h1 align="center">vue-persistent-storage-manager</h1>

<p align="center">
  <a href="https://github.com/DerYeger/vue-persistent-storage-manager/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/workflow/status/DerYeger/vue-persistent-storage-manager/CI?label=CI&logo=github">
  </a>
  <a href="https://www.npmjs.com/package/vue-persistent-storage-manager">
    <img alt="NPM" src="https://img.shields.io/npm/v/vue-persistent-storage-manager">
  </a>
    <a href="https://codecov.io/gh/DerYeger/vue-persistent-storage-manager">
      <img alt="Coverage" src="https://codecov.io/gh/DerYeger/vue-persistent-storage-manager/branch/master/graph/badge.svg?token=p35W6u2noe"/>
    </a>
</p>

> Vue plugin that wraps the [StorageManager](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager) API and provides the state of the `persistent-storage` permission alongside a storage estimate.

## Features

- ⌛ **Persistent storage**: Request and monitor the `persistent-storage` permission.
- 💽 **Storage estimate**: Get storage quota and usage estimates.
- 🔁 **Reactive**: Provides observable state using Vue's reactivity
- ✔️ **SSR**: Supports server-side-rendering by validating the availability of the StorageManager API.

## Installation

```bash
# yarn
$ yarn add vue-persistent-storage-manager

# npm
$ npm install vue-persistent-storage-manager
```

## Usage

```typescript
import Vue from 'vue'
import { VuePersistentStorageManager } from 'vue-persistent-storage-manager'

Vue.use(VuePersistentStorageManager, { watchStorage: true })
```

Options are not required.
In this case, `watchStorage` will default to `false`.
> Note: If `watchStorage` is set to `true`, the functions `localStorage.setItem` and `localStorage.removeItem` are replaced by functions that update the StorageEstimate.
> The original functions will still be called and are available as `localStorage.originalSetItem` and `localStorage.originalRemoveItem`

```vue
<template>
  <div>
    <button :disabled="!$storageManager.isAvailable || $storageManager.isPersistent" @click="$storageManager.requestPersistentStorage()">
      {{ $storageManager.isPersistent ? 'Persistence granted' : 'Request persistence' }}
    </button>
    <p>{{ (100 * $storageManager.storageEstimate.usage) / $storageManager.storageEstimate.quota }}%</p>
    <p>{{ $storageManager.storageEstimate.usage / 1000000 }}MB</p>
  </div>
</template>
```

### Nuxt

1. Create the file `plugins/persistentStorageManager.ts` with the following content.

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
