<script setup>
import { ref, watch } from "vue"
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user'
import sha1 from 'js-sha1'
import { api_url } from 'assets/variables'

const userStore = useUserStore()

const $q = useQuasar()

const toggle_dark_state = ref($q.dark.isActive)
const home_state_copy = ref({ ...userStore.user.home })
// $q.dark.set(true)

watch(toggle_dark_state, (_) => $q.dark.toggle())

const logout_action = () => {
  userStore.logout()
}


const new_password = ref("")
const new_password_confirmation = ref("")
const home_settings_dialog_toggle = ref(false)

const home_save = async () => {
  let file_input = document.querySelector('.file_input').files
  let home_update_object = {};
  home_update_object.title = home_state_copy.value.title
  if ((new_password.value !== ""
    && new_password_confirmation.value !== "")
    && new_password.value == new_password_confirmation.value) {
    home_update_object.password = sha1(new_password.value)
  }
  if (file_input.length == 1) {
    home_update_object.image = file_input[0]
  }

  await userStore.home_update(home_update_object)
}
</script>


<template>
  <div class="tasks_wrapper px-8 py-16 mb-16 h-full">
    <div class="flex flex-col justify-between h-full">
      <div class="main_settings_row">
        <div class="item_row flex items-center justify-between mt-4 mb-8">
          <p class="text-xl text-bold">Темный режим</p>
          <q-toggle size="64px" v-model="toggle_dark_state" checked-icon="check" color="green" unckecked-color="red"
            unchecked-icon="clear" />
        </div>
        <div v-if="userStore.user.id == userStore.user.home.owner.id" class="item_row flex items-center justify-between mt-4 mb-8">
          <p class="text-xl text-bold">Настройки дома</p>
          <q-btn @click="home_settings_dialog_toggle = true" class="h-8 w-20" outline icon="home" color="green"
            unckecked-color="green" unchecked-icon="clear" />

          <q-dialog v-if="userStore.user.id == userStore.user.home.owner.id" v-model="home_settings_dialog_toggle" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Настройки дома</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="home_settings_fields flex flex-col items-center">
                  <div class="home_header flex items-center justify-center text-center flex-col h-32 w-32 my-2 relative">
                    <img class="home_avatar rounded-full h-32 w-32" alt="home avatar"
                      :src="`${api_url}${home_state_copy.image.url}`">
                  </div>
                  <input type="file" accept="image/*"
                    class="file_input my-4 outline-none file:py-2 file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                  <q-input value label="Название дома" v-model="home_state_copy.title" class="w-full my-2"
                    color="white" />
                  <q-input value label="Новый пароль" v-model="new_password" class="w-full my-2" color="white" />
                  <q-input value label="Подтверждение пароля" v-model="new_password_confirmation" class="w-full my-2"
                    color="white" />
                </div>
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Отмена" color="red" v-close-popup />
                <q-btn @click="home_save()" flat label="Сохранить" color="green" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

        </div>

      </div>

      <div class="item_row flex items-center justify-between my-4">
        <p class="text-md text-gray-600 text-bold">Выйти из учётной записи</p>
        <q-btn @click="logout_action()" class="h-8 w-20" outline icon="logout" color="red" unckecked-color="red"
          unchecked-icon="clear" />
      </div>
    </div>


  </div>
</template>
