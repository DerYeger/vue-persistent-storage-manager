import { VuePersistentStorageManager } from '@/main'
import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'

async function testPluginInstallation(vm, options, isPersistent = false) {
  expect(vm.prototype.$storageManager).toBeUndefined()
  vm.use(VuePersistentStorageManager, options)
  expect(vm.prototype.$storageManager).toBeDefined()
  await flushPromises()
  expect(vm.prototype.$storageManager.isAvailable).toBe(true)
  expect(vm.prototype.$storageManager.isPersistent).toBe(isPersistent)
}

describe('VuePersistentStorageManager in browser environment', () => {
  beforeEach(async () => {
    global.navigator.storage = {
      estimate: () => Promise.resolve({}),
      persist: () => Promise.resolve(false),
      persisted: () => Promise.resolve(false),
    }
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
  it('provides the StorageEstimate', async () => {
    const testEstimate = {
      quota: 42,
      usage: 7,
    }
    global.navigator.storage.estimate = () => Promise.resolve(testEstimate)
    const vm = createLocalVue()
    await testPluginInstallation(vm)
    expect(vm.prototype.$storageManager.storageEstimate).toEqual(testEstimate)
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
    await testPluginInstallation(vm, {}, true)
    expect(vm.prototype.$storageManager.isPersistent).toBe(true)
  })
})
