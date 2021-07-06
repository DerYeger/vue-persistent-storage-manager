let localStorageFunctionsModified = false

const storageEventType = 'storage'

function modifyLocalStorageFunctions() {
  if (localStorageFunctionsModified || typeof localStorage === 'undefined') {
    return
  }
  const originalSetItem = localStorage.setItem
  localStorage.setItem = function (...args) {
    originalSetItem.apply(this, args)
    window.dispatchEvent(new StorageEvent(storageEventType))
  }
  const originalRemoveItem = localStorage.removeItem
  localStorage.removeItem = function (...args) {
    originalRemoveItem.apply(this, args)
    window.dispatchEvent(new StorageEvent(storageEventType))
  }
  localStorageFunctionsModified = true
}

export class VuePersistentStorageManager {
  static install(Vue, options) {
    const watchStorage = options?.watchStorage ?? false
    Vue.prototype.$storageManager = Vue.observable(new VuePersistentStorageManager(watchStorage))
    if (watchStorage) {
      modifyLocalStorageFunctions()
    }
  }

  constructor(watchStorage) {
    this._isAvailable = typeof navigator !== 'undefined' && navigator?.storage?.persist !== undefined
    this._isPersistent = false
    this._storageEstimate = {
      quota: undefined,
      usage: undefined,
    }
    if (!this._isAvailable) {
      return
    }
    this._refreshIsActive()
    this._refreshStorageEstimate()
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'persistent-storage' }).then((persistentStoragePermission) => {
        persistentStoragePermission.onchange = () => this._refreshIsActive()
      })
    }
    if (watchStorage) {
      window.addEventListener(storageEventType, () => {
        this._refreshStorageEstimate()
      })
    }
  }

  get isAvailable() {
    return this._isAvailable
  }

  get isPersistent() {
    return this._isAvailable && this._isPersistent
  }

  get storageEstimate() {
    return this._storageEstimate
  }

  requestPersistentStorage() {
    if (!this._isAvailable) {
      return Promise.resolve(false)
    }
    return navigator.storage.persist().then((persisted) => {
      this._isPersistent = persisted
      return persisted
    })
  }

  _refreshIsActive() {
    navigator.storage.persisted().then((persisted) => (this._isPersistent = persisted))
  }

  _refreshStorageEstimate() {
    navigator.storage.estimate().then((storageEstimate) => {
      this._storageEstimate = storageEstimate
    })
  }
}
