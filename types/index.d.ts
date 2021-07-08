import Vue, { PluginFunction } from 'vue'

/**
 * Options for the VuePersistentStorageManager plugin.
 */
declare interface VuePersistentStorageManagerOptions {
  /**
   * If true, localStorage.setItem and localStorage.removeItem will be replaced with custom functions.
   *
   */
  watchStorage: boolean
}

/**
 * Wrapper for the StorageManager API. Provides the state of the persistent-storage permission alongside a storage estimate.
 */
declare class VuePersistentStorageManager {
  /**
   * Installs a VuePersistentStorageManager as a Vue plugin.
   */
  static readonly install: PluginFunction<VuePersistentStorageManagerOptions>

  /**
   * Creates a new VuePersistentStorageManager instance.
   */
  constructor()

  /**
   * Indicates that the StorageManager API is available.
   */
  readonly isAvailable: boolean

  /**
   * Indicates that persistence of localStorage has been granted.
   */
  readonly isPersistent: boolean

  /**
   * Contains storage quota and usage information.
   */
  readonly storageEstimate: StorageEstimate

  /**
   * Requests persistence of localStorage.
   * @return Promise that resolves to true if permission has been granted.
   */
  requestPersistentStorage(): Promise<boolean>
}

declare module 'vue/types/vue' {
  interface Vue {
    $storageManager: VuePersistentStorageManager
  }
}

declare global {
  interface Storage {
    originalSetItem: ((key: string, value: string) => void) | undefined
    originalRemoveItem: ((key: string) => void) | undefined
  }
}
