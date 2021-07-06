import Vue, { PluginFunction } from 'vue'

declare interface VuePersistentStorageManagerOptions {
  watchStorage: boolean
}

declare class VuePersistentStorageManager {
  static readonly install: PluginFunction<VuePersistentStorageManagerOptions>

  constructor()
  readonly isActive: boolean
  readonly isPersistent: boolean
  readonly storageEstimate: StorageEstimate
  requestPersistentStorage(): Promise<boolean>
}

declare module 'vue/types/vue' {
  interface Vue {
    $storageManager: VuePersistentStorageManager
  }
}
