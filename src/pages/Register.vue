<template>
  <div class="page_container !h-screen">
    <div class="form_container">
      <h2 class="text-4xl mb-6 text-center">Коммуналка</h2>
      <q-input filled bg-color="gray" color="white" v-model="name" label="Имя" />
      <q-input filled bg-color="gray" color="white" v-model="email" class="q-mt-md" label="Электроонная почта" />
      <q-input filled bg-color="gray" color="white" v-model="password" class="q-mt-md" label="Пароль" type="password" />
      <q-btn @click="register_action()" outline class="q-mt-md action_button" color="white" text-color="white" label="Зарегистрироваться" />
      <span class="q-mt-md text-center">Есть аккаунт? <span @click="$router.push('/')"
          style="text-decoration: underline; cursor: pointer;">Авторизоавться.</span></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia"
import { useUserStore } from "stores/user"
import { route } from "quasar/wrappers";

const userStore = useUserStore()

const name = ref("")
const email = ref("")
const password = ref("")
const { user } = storeToRefs(useUserStore())

const register_action = () => {
  console.log(123);
  userStore.register({ email: email.value, password: password.value, name: name.value })
}


</script>

<style lang="scss" scoped>
.page_container {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form_container {
  display: flex;
  flex-direction: column;
  min-width: 340px;
}
</style>
