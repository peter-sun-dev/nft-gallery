import resolveQueryPath from '@/utils/queryPathResolver'
import { notificationTypes, showNotification } from '@/utils/notification'

export default function ({
  queryPrefix = '',
  queryName,
  variables = {},
  options = {},
}) {
  const { $apollo, $consola } = useNuxtApp()
  const { client } = usePrefix()
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function doFetch() {
    loading.value = true
    data.value = null
    error.value = null
    const query = await resolveQueryPath(queryPrefix || client.value, queryName)

    try {
      const response = await $apollo.query({
        query: query.default,
        client: client.value,
        variables,
        ...options,
      })
      data.value = response.data
    } catch (err) {
      ;(error.value as unknown) = err
      showNotification(`${err as string}`, notificationTypes.danger)
      $consola.error(err)
    } finally {
      loading.value = false
    }
  }

  if (isRef(variables)) {
    watchEffect(doFetch)
  } else {
    doFetch()
  }

  return {
    data,
    error,
    loading,
  }
}
