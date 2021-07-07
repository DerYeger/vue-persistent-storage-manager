function modifyLocalStorageFunctions(storageManager) {
  if (typeof localStorage === 'undefined') {
    return
  }
  if (typeof localStorage.originalSetItem === 'undefined') {
    localStorage.originalSetItem = localStorage.setItem
  }
  const setItem = localStorage.setItem
  localStorage.setItem = function (...args) {
    setItem.apply(this, args)
    storageManager._refreshStorageEstimate()
  }
  if (typeof localStorage.originalRemoveItem === 'undefined') {
    localStorage.originalRemoveItem = localStorage.removeItem
  }
  const removeItem = localStorage.removeItem
  localStorage.removeItem = function (...args) {
    removeItem.apply(this, args)
    storageManager._refreshStorageEstimate()
  }
}

export class VuePersistentStorageManager {
  static install(Vue, options) {
    const watchStorage = options?.watchStorage ?? false
    const storageManager = Vue.observable(new VuePersistentStorageManager(watchStorage))
    Vue.prototype.$storageManager = storageManager
    if (watchStorage) {
      modifyLocalStorageFunctions(storageManager)
    }
  }

  constructor() {
    this._isAvailable = typeof navigator !== 'undefined' && navigator?.storage?.persist !== undefined
    this._isPersistent = false
    this._storageEstimate = {
      quota: undefined,
      usage: undefined,
    }
    if (!this._isAvailable) {
      return
    }
    this._refreshIsPersistent()
    this._refreshStorageEstimate()
    navigator.permissions?.query({ name: 'persistent-storage' })?.then((persistentStoragePermission) => {
      persistentStoragePermission.onchange = () => this._refreshIsPersistent()
    })
    window.addEventListener('storage', () => {
      this._refreshStorageEstimate()
    })
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

  _refreshIsPersistent() {
    navigator.storage.persisted().then((persisted) => (this._isPersistent = persisted))
  }

  _refreshStorageEstimate() {
    navigator.storage.estimate().then((storageEstimate) => {
      this._storageEstimate = storageEstimate
    })
  }
}
