import { VueConstructor } from 'vue'
import { PluginOptions, VuePersistentStorageManager } from '@src/index'
import flushPromises from 'flush-promises'

export const localStorageMock = (): Storage => {
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
    originalSetItem: undefined,
    originalRemoveItem: undefined,
  }
}

export const testEstimate = {
  quota: 42,
  usage: 7,
}

export const persistentStoragePermission = {
  onchange: (): void => {
    throw new Error('')
  },
}

export function defineGlobals(): void {
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
          return Promise.resolve(persistentStoragePermission)
        } else {
          return Promise.reject()
        }
      },
    },
  })
}

export function redefineGlobals(): void {
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
}

export function checkStorageEstimate(vm: VueConstructor, expected: StorageEstimate): void {
  expect(vm.prototype.$storageManager.storageEstimate).toEqual(expected)
  expect(vm.prototype.$storageEstimate).toEqual(expected)
}

export async function checkPluginInstallation(
  vm: VueConstructor,
  options?: PluginOptions,
  isAvailable = false,
  isPersistent = false
): Promise<void> {
  expect(vm.prototype.$storageManager).toBeUndefined()
  vm.use(VuePersistentStorageManager, options)
  expect(vm.prototype.$storageManager).toBeDefined()
  await flushPromises()
  expect(vm.prototype.$storageManager.isAvailable).toBe(isAvailable)
  expect(vm.prototype.$storageManager.isPersistent).toBe(isPersistent)
}
