<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
import sha1 from 'js-sha1'

const userStore = useUserStore()
const $q = useQuasar()

const home_hash = ref("")
const home_pass = ref("")

const home_join = () => {
  if (home_hash.value !== "" && home_pass.value !== "") {
    userStore.home_join({ hash: home_hash.value, password: sha1(home_pass.value) })
  } else {
    $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Проверьте введенные данные'
    })
  }

}


</script>


<template>
  <div class="form_container">
    <h2 class="text-4xl mb-6 text-center">Я сосед</h2>
    <q-input filled bg-color="gray" color="white" v-model="home_hash" label="Адрес или ХЕШ дома" />
    <q-input filled bg-color="gray" color="white" v-model="home_pass" class="q-mt-md" label="Пароль от дома"
      type="password" />
    <q-btn @click="home_join()" outline class="q-mt-md action_button" color="white" text-color="white"
      label="Войти в хату" />
  </div>
</template>
