<template>
  <div class="page_container !h-screen">
    <form @submit.prevent="login_action()" class="form_container">
      <h2 class="text-4xl mb-6 text-center">Коммуналка</h2>
      <q-input required filled bg-color="gray" color="white" v-model="email" label="Электронная почта" type="email" />
      <q-input required filled bg-color="gray" color="white" v-model="password" class="q-mt-md" label="Пароль"
        type="password" />
      <q-btn type="submit" outline class="q-mt-md action_button" color="white" text-color="white" label="Войти" />
      <span class="q-mt-md text-center">Нет аккаунта? <span @click="$router.push('/register')"
          style="text-decoration: underline; cursor: pointer;">Зарегистрироваться.</span></span>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia"
import { useUserStore } from "stores/user"
const userStore = useUserStore()

const email = ref("")
const password = ref("")
const { user } = storeToRefs(useUserStore())

const login_action = async () => {
  await userStore.login({ email: email.value, password: password.value })
}


</script>

<style lang="scss" scoped>
.page_container {
  // background: #ffffff;
  position: relative;
  color: white;
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
