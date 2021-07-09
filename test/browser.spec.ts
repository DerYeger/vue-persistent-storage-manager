/**
 * @jest-environment jsdom
 */

import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { VueConstructor } from 'vue'
import { PluginOptions, VuePersistentStorageManager } from '@/index'

const localStorageMock = () => {
  return {
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }
}

async function testPluginInstallation(vm: VueConstructor, options?: PluginOptions, isPersistent = false) {
  expect(vm.prototype.$storageManager).toBeUndefined()
  vm.use(VuePersistentStorageManager, options)
  expect(vm.prototype.$storageManager).toBeDefined()
  await flushPromises()
  expect(vm.prototype.$storageManager.isAvailable).toBe(true)
  expect(vm.prototype.$storageManager.isPersistent).toBe(isPersistent)
}

function testStorageEstimate(vm: VueConstructor, expected: StorageEstimate) {
  expect(vm.prototype.$storageManager.storageEstimate).toEqual(expected)
  expect(vm.prototype.$storageEstimate).toEqual(expected)
}

describe('VuePersistentStorageManager in browser environment', () => {
  beforeAll(() => {
    Object.defineProperty(global.navigator, 'storage', {
      value: {
        estimate: () => Promise.resolve({}),
        persist: () => Promise.resolve(false),
        persisted: () => Promise.resolve(false),
      },
    })
    Object.defineProperty(global.navigator, 'permissions', {
      value: {
        query: ({ name }: PermissionDescriptor) => {
          if (name === 'persistent-storage') {
            return Promise.resolve({
              onChange: () => {
                throw new Error()
              },
            })
          } else {
            return Promise.reject()
          }
        },
      },
    })
  })
  beforeEach(() => {
    Object.defineProperty(global.navigator.storage, 'estimate', {
      value: () => Promise.resolve({}),
    })
    Object.defineProperty(global.navigator.storage, 'persist', {
      value: () => Promise.resolve(false),
    })
    Object.defineProperty(global.navigator.storage, 'persisted', {
      value: () => Promise.resolve(false),
    })
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock(),
    })
  })
  it('can be installed without options', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm)
  })
  it('can be installed with watchStorage set to true', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm, { watchStorage: true })
  })
  it('can be installed with watchStorage set to false', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm, { watchStorage: false })
  })
  it('can be installed multiple times', async () => {
    const first = createLocalVue()
    await testPluginInstallation(first, { watchStorage: true })
    const second = createLocalVue()
    await testPluginInstallation(second, { watchStorage: true })
  })
  it('provides the StorageEstimate', async () => {
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    testStorageEstimate(vm, testEstimate)
  })
  it('updates the StorageEstimate on storage events', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    testStorageEstimate(vm, {})
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    global.window.dispatchEvent(new StorageEvent('storage'))
    await flushPromises()
    testStorageEstimate(vm, testEstimate)
  })
  it('updates the StorageEstimate on localStorage.setItem', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm, { watchStorage: true })
    const originalSetItemSpy = jest.spyOn(localStorage, 'originalSetItem')
    testStorageEstimate(vm, {})
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    localStorage.setItem('test', 'test')
    expect(originalSetItemSpy).toHaveBeenCalledTimes(1)
    await flushPromises()
    testStorageEstimate(vm, testEstimate)
  })
  it('updates the StorageEstimate on localStorage.removeItem', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm, { watchStorage: true })
    const originalRemoveItemSpy = jest.spyOn(localStorage, 'originalRemoveItem')
    testStorageEstimate(vm, {})
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    localStorage.removeItem('test')
    expect(originalRemoveItemSpy).toHaveBeenCalledTimes(1)
    await flushPromises()
    testStorageEstimate(vm, testEstimate)
  })
  it('does not update the StorageEstimate if not configured to do so', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm, { watchStorage: false })
    const setItemSpy = jest.spyOn(localStorage, 'setItem')
    const removeItemSpy = jest.spyOn(localStorage, 'removeItem')
    testStorageEstimate(vm, {})
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    expect(setItemSpy).toHaveBeenCalledTimes(1)
    expect(removeItemSpy).toHaveBeenCalledTimes(1)
    await flushPromises()
    testStorageEstimate(vm, {})
  })
  it('handles denied persistence', async () => {
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    await expect(vm.prototype.$storageManager.requestPersistentStorage()).resolves.toBe(false)
    expect(vm.prototype.$storageManager.isPersistent).toBe(false)
  })
  it('handles granted persistence', async () => {
    global.navigator.storage.persist = () => Promise.resolve(true)
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    await expect(vm.prototype.$storageManager.requestPersistentStorage()).resolves.toBe(true)
    expect(vm.prototype.$storageManager.isPersistent).toBe(true)
  })
  it('handles initial granted persistence', async () => {
    global.navigator.storage.persisted = () => Promise.resolve(true)
    const vm = createLocalVue()
    await testPluginInstallation(vm, undefined, true)
    expect(vm.prototype.$storageManager.isPersistent).toBe(true)
  })
  it('handles permission granted without request', async () => {
    const persistentStoragePermission = {
      onchange: () => {
        throw new Error('')
      },
    }
    Object.defineProperty(global.navigator.permissions, 'query', {
      value: ({ name }: PermissionDescriptor) => {
        if (name === 'persistent-storage') {
          return Promise.resolve(persistentStoragePermission)
        } else {
          return Promise.reject()
        }
      },
    })
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    expect(vm.prototype.$storageManager.isPersistent).toBe(false)
    global.navigator.storage.persisted = () => Promise.resolve(true)
    persistentStoragePermission.onchange()
    await flushPromises()
    expect(vm.prototype.$storageManager.isPersistent).toBe(true)
  })
  it('handles permission revoked', async () => {
    global.navigator.storage.persisted = () => Promise.resolve(true)
    const persistentStoragePermission = {
      onchange: () => {
        throw new Error('')
      },
    }
    Object.defineProperty(global.navigator.permissions, 'query', {
      value: ({ name }: PermissionDescriptor) => {
        if (name === 'persistent-storage') {
          return Promise.resolve(persistentStoragePermission)
        } else {
          return Promise.reject()
        }
      },
    })
    const vm = createLocalVue()
    await testPluginInstallation(vm, undefined, true)
    expect(vm.prototype.$storageManager.isPersistent).toBe(true)
    global.navigator.storage.persisted = () => Promise.resolve(false)
    persistentStoragePermission.onchange()
    await flushPromises()
    expect(vm.prototype.$storageManager.isPersistent).toBe(false)
  })
})
