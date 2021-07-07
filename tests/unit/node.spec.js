import { VuePersistentStorageManager } from '@/main'
import { createLocalVue } from '@vue/test-utils'

function testPluginInstallation(vm, options) {
  expect(vm.prototype.$storageManager).toBeUndefined()
  vm.use(VuePersistentStorageManager, options)
  expect(vm.prototype.$storageManager).toBeDefined()
  expect(vm.prototype.$storageManager.isAvailable).toBe(false)
  expect(vm.prototype.$storageManager.isPersistent).toBe(false)
}

describe('VuePersistentStorageManager in node environment', () => {
  beforeAll(() => {
    // Remove Jest's localStorage mock to simulate plain node environment
    // eslint-disable-next-line no-undef
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
    })
  })
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
  it('provides an empty StorageEstimate', () => {
    const vm = createLocalVue()
    testPluginInstallation(vm)
    expect(vm.prototype.$storageManager.storageEstimate).toEqual({})
  })
  it('allows requesting persistence', async () => {
    const vm = createLocalVue()
    testPluginInstallation(vm)
    await expect(vm.prototype.$storageManager.requestPersistentStorage()).resolves.toBe(false)
    expect(vm.prototype.$storageManager.isPersistent).toBe(false)
  })
})
