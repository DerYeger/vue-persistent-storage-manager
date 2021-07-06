import Vue from 'vue'
import VuePersistentStorageManager from '@/index'

describe('StorageManager', () => {
  it('can be installed', () => {
    const vm = new Vue()
    expect(vm.$storageManager).toBeUndefined()
    Vue.use(VuePersistentStorageManager, { watchStorage: false })
    expect(vm.$storageManager).toBeDefined()
    expect(vm.$storageManager.isPersistent).toBe(false)
    expect(vm.$storageManager.isAvailable).toBe(false)
  })
})
