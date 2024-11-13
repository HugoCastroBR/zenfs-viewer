import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export const websiteMessenger = defineCustomEventMessaging<{
  hello: (name: string) => string
  invoke(options: { method: string; args: any[] }): Promise<any>
  invokeBinary(bf: ArrayBuffer): Promise<ArrayBuffer>
}>({
  namespace: 'zenfs-viewer',
})
