<script setup>
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { ref } from 'vue'
import sha1 from 'js-sha1'

const userStore = useUserStore()

const $q = useQuasar()

const home_title = ref("")
const home_address = ref("")
const home_pass = ref("")
const home_pass_confirm = ref("")

const home_create = () => {
  if (
    home_title.value !== ""
    && home_address.value !== ""
    && home_pass.value !== ""
    && home_pass_confirm.value !== ""
    && (home_pass.value == home_pass_confirm.value)) {
    userStore.home_create({
      title: home_title.value,
      address: home_address.value,
      password: sha1(home_pass.value),
      hash: sha1(home_address.value)
    })
  } else {
    $q.notify({
      message: "Пароли не совпадают или заполнены не все поля",
      type: "negative",
      position: "top"
    })
  }
}

</script>


<template>
  <div class="form_container">
    <h2 class="text-4xl mb-6 text-center">Я хозяин</h2>
    <q-input filled bg-color="gray" color="white" v-model="home_title" label="Название дома" />
    <q-input filled bg-color="gray" color="white" v-model="home_address" class="q-mt-md"
      label="Россия, г. Москва, ул. Грина 1337" />
    <q-input filled bg-color="gray" color="white" v-model="home_pass" class="q-mt-md" label="Пароль" type="password" />
    <q-input filled bg-color="gray" color="white" v-model="home_pass_confirm" class="q-mt-md" label="Подтверждение пароля"
      type="password" />
    <q-btn @click="home_create()" outline class="q-mt-md action_button" color="white" text-color="white"
      label="Зарегистрировать дом" />
  </div>
</template>
