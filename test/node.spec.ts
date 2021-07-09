import { createLocalVue } from '@vue/test-utils'
import { VueConstructor } from 'vue'
import { PluginOptions, VuePersistentStorageManager } from '@/index'

function testPluginInstallation(vm: VueConstructor, options?: PluginOptions) {
  expect(vm.prototype.$storageManager).toBeUndefined()
  vm.use(VuePersistentStorageManager, options)
  expect(vm.prototype.$storageManager).toBeDefined()
  expect(vm.prototype.$storageManager.isAvailable).toBe(false)
  expect(vm.prototype.$storageManager.isPersistent).toBe(false)
}

describe('VuePersistentStorageManager in node environment', () => {
  it('can be installed without options', () => {
    const vm = createLocalVue()
    testPluginInstallation(vm)
  })
  it('can be installed with watchStorage set to true', () => {
    const vm = createLocalVue()
    testPluginInstallation(vm, { watchStorage: true })
  })
  it('can be installed with watchStorage set to false', () => {
    const vm = createLocalVue()
    testPluginInstallation(vm, { watchStorage: false })
  })
  it('can be installed multiple times', async () => {
    const first = createLocalVue()
    await testPluginInstallation(first, { watchStorage: true })
    const second = createLocalVue()
    await testPluginInstallation(second, { watchStorage: true })
  })
  it('provides an empty StorageEstimate', () => {
    const vm = createLocalVue()
    testPluginInstallation(vm)
    expect(vm.prototype.$storageManager.storageEstimate).toEqual({})
    expect(vm.prototype.$storageEstimate).toEqual({})
  })
  it('allows requesting persistence', async () => {
    const vm = createLocalVue()
    testPluginInstallation(vm)
    await expect(vm.prototype.$storageManager.requestPersistentStorage()).resolves.toBe(false)
    expect(vm.prototype.$storageManager.isPersistent).toBe(false)
  })
})
