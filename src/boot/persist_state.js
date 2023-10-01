import { boot } from 'quasar/wrappers'
import { watch } from 'vue'

export default boot(({ app, store }) => {
  watch(store.state.value,
    (user_store) => {
      if (
        user_store.user == null
      ) {
        localStorage.removeItem("user_store")
      } else {
        localStorage.setItem("user_store", JSON.stringify(user_store.user))
      }
    }, { deep: true })
})
