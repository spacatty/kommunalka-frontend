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

const home_create = async () => {
  if (
    home_title.value !== ""
    && home_address.value !== ""
    && home_pass.value !== ""
    && home_pass_confirm.value !== ""
    && (home_pass.value == home_pass_confirm.value)) {
    let home_update_object = {
      title: home_title.value,
      address: home_address.value,
      password: sha1(home_pass.value),
      hash: sha1(home_address.value)
    }
    let file_input = document.querySelector('.file_input').files
    if (file_input.length == 1) {
      home_update_object.image = file_input[0]
    }
    await userStore.home_create(home_update_object)
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
    <div class="flex items-center justify-between">
      <p class="text-lg">Изображение дома</p>
      <input type="file" accept="image/*"
        class="file_input my-6 outline-none file:py-2 file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
    </div>
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
