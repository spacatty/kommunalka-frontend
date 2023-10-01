<script setup>
import { ref } from "vue"
import { useQuasar } from 'quasar'
import { useUserStore } from "stores/user";
import { api_url } from 'assets/variables'
import JoinComponent from 'components/dashboard/home/Join.vue'
import CreateComponent from 'components/dashboard/home/Create.vue'
import TabInfoComponent from 'components/dashboard/home/TabInfo.vue'

Array.prototype.random = function () {
  return this[Math.floor((Math.random() * this.length))];
}

const userStore = useUserStore()
userStore.home_get()

const $q = useQuasar()

const currentSelect = ref(1);

const tab = ref('tasks')

const selected_category = ref(null)
const selected_category_index = ref(null)
const selected_category_toggle = ref(false)

const category_tasks_state_copy = ref(null)

const task_status_update = (task_index, category_index, category_id) => {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите отметить задачу выполненной?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await userStore.task_mark_done({ id: category_tasks_state_copy.value[task_index].id })
    await userStore.get_tasks_by_category({ category_id: category_id, category_index: category_index })
    category_tasks_state_copy.value = { ...userStore.user.home.categories[category_index].tasks }
  })
    .onCancel(() => { category_tasks_state_copy.value[task_index].done = false; })
    .onDismiss(() => { })
}


const init_dialog = async (category, index) => {
  await userStore.get_tasks_by_category({ category_id: category.id, category_index: index })
  category_tasks_state_copy.value = { ...userStore.user.home.categories[index].tasks }
  selected_category_index.value = index
  selected_category.value = category
  selected_category_toggle.value = true
}

const new_task_select_period_options = [
  { label: 'Ежедневно', value: '1D' },
  { label: 'Еженедельно', value: '1W' },
  { label: 'Ежемесячно', value: '1M' },
]

const add_new_task_toggle = ref(false)
const add_new_task_date = ref(new Date())
const add_new_task_selected_item = ref(null)
const add_new_task_title = ref(null)
const add_new_task_selected_period = ref(null)

const new_task_add = async () => {
  let responsible = userStore.user.id
  if (userStore.user.home.neighbors !== undefined) { responsible = add_new_task_selected_item.value }

  await userStore.add_new_task(
    {
      title: add_new_task_title.value,
      responsible: responsible,
      deadline: new Date(add_new_task_date.value),
      period: add_new_task_selected_period?.value?.value ?? null,
      done: false,
      category: selected_category.value.id,
      home: userStore.user.home.id,
      category_index: selected_category_index.value
    }
  )
  await userStore.get_tasks_by_category({ category_id: selected_category.value.id, category_index: selected_category_index.value })
  category_tasks_state_copy.value = { ...userStore.user.home.categories[selected_category_index.value].tasks }
}

const colors = [
  { color: "bg-red-400" },
  { color: "bg-amber-400" },
  { color: "bg-emerald-400" },
  { color: "bg-pink-400" },
]

const new_category_add_toggle = ref(false);
const new_category_title = ref("");
const new_category_selected_color = ref()

const new_category_add = async () => {
  await userStore.new_category_add({
    title: new_category_title.value,
    home: userStore.user.home.id,
    color: colors[new_category_selected_color.value].color
  })
}

const random_transition = ref('')

setInterval(() => {
  random_transition.value = ['jump-up', 'jump-down',
    'scale', 'fade',].random()
}, 10000);

</script>

<template>
  <div v-if="userStore.user.home" class="px-8 py-16">
    <div class="home_header_container flex items-center justify-center text-center">
      <div class="home_header flex items-center justify-center text-center flex-col">
        <img class="home_avatar rounded-full h-32 w-32" alt="home avatar"
          :src="`${api_url}${userStore.user.home.image.url}`">
        <p class="home_title mt-8 mb-2 text-lg font-semibold">{{ userStore.user.home.title }}</p>
        <p class="home_title mb-8 text-md">Адрес: {{ userStore.user.home.address }}</p>
      </div>
    </div>

    <q-tabs class="text-grey" v-model="tab" dense active-color="orange" indicator-color="indigo" align="justify"
      narrow-indicator>
      <q-tab name="tasks" label="Обязанности" />
      <q-tab name="info" label="Информация" />
    </q-tabs>

    <q-separator />

    <q-tab-panels class="mb-16" v-model="tab" animated :transition-prev="random_transition"
      :transition-next="random_transition">
      <q-tab-panel name="tasks">

        <div class="category_wrapper">
          <div class="flex items-center justify-between my-4">
            <p class="text-lg text-bold">Категории обязанностей</p>
            <q-btn round outline color="secondary" @click="new_category_add_toggle = true" icon="add" />
          </div>
          <div class="category_container grid grid-cols-2 gap-4 px-1 py-2">
            <div v-for="(category, index) in userStore.user.home.categories" :class="[category.color]" :key="category.id"
              @click="init_dialog(category, index)"
              class="flex items-center justify-center text-center h-32 rounded-md shadow-xl select-none cursor-pointer ease-in-out duration-150 hover:scale-95">
              <div class="card">
                <p class="font-semibold">{{ category.title }}</p>
              </div>
            </div>
          </div>

          <q-dialog full-height full-width v-if="selected_category" v-model="selected_category_toggle" persistent>
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="flex items-center justify-between my-4">
                  <p class="text-lg text-bold">{{ selected_category.title }}</p>
                  <q-btn v-if="userStore.user.id == userStore.user.home.owner.id" round outline color="secondary"
                    @click="add_new_task_toggle = true" icon="add" />
                </div>
                <p class="text-md text-bold">Всего актуальных задач: {{ selected_category?.tasks?.length ?? 0 }}</p>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-timeline class="mt-8" layout="dense" side="right" color="secondary">
                  <q-timeline-entry v-for="(task, task_index) in category_tasks_state_copy" :key="task.id" side="left">
                    <template v-slot:title>
                      <p class="font-semibold text-orange-300">{{ task.responsible.name }}</p>
                    </template>
                    <template v-slot:subtitle>
                      <p class="font-semibold ">{{ new Date(task.deadline).toLocaleString() }}</p>
                    </template>
                    <div class="item_container flex items-center">
                      <q-checkbox @click="task_status_update(task_index, selected_category_index, selected_category.id)"
                        dark v-model="task.done" class="checkbox_custom" color="teal" />
                      <p class="">{{ task.title }}</p>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Закрыть" color="green" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

        </div>

        <q-dialog v-model="new_category_add_toggle" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Новая категория</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="new_category_title" color="white" label="Название" autofocus
                @keyup.enter="prompt = false" />
              <!-- <q-input dense v-model="new_category_color" color="white" label="Цвет" autofocus
              @keyup.enter="prompt = false" /> -->
              <p class="mt-8">Цвет</p>
              <hr class="mt-2">
              <div class="custom_color_selector mt-4 flex">
                <div v-for="(color, index) in colors" :key="color.color" @click="new_category_selected_color = index"
                  :class="[new_category_selected_color == index ? 'bg-slate-200' : 0, 'color_wrapper cursor-pointer ease-in-out duration-300 hover:bg-slate-200 hover:brightness-100 brightness-75 px-2 py-1 rounded-full']">
                  <div :class="['h-8 w-8 rounded-full', color.color]"></div>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Отмена" color="red" v-close-popup />
              <q-btn @click="new_category_add()" flat label="Добавить" color="green" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="add_new_task_toggle" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Новая обязанность</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="add_new_task_title" class="my-4" color="white" label="Заголовок" autofocus />
              <q-input color="white" v-model="add_new_task_date">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="add_new_task_date" mask="YYYY-MM-DD HH:mm">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="add_new_task_date" mask="YYYY-MM-DD HH:mm" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-select v-if="userStore?.user?.home?.neighbors" color="white" class="my-4"
                v-model="add_new_task_selected_item"
                :options="[...userStore?.user?.home?.neighbors?.map(x => { return { label: x.name, value: x.id } }), { label: userStore.user.name, value: userStore.user.id }]"
                label="Ответственный">

              </q-select>

              <q-select color="white" class="my-4" v-model="add_new_task_selected_period"
                :options="new_task_select_period_options" label="Периодичность" />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Отмена" color="red" v-close-popup />
              <q-btn flat label="Добавить" @click="new_task_add()" color="green" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </q-tab-panel>

      <q-tab-panel name="info">
        <TabInfoComponent />
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <div v-else-if="currentSelect == 1" class="page_container flex-col !h-screen">
    <JoinComponent />
    <span class="q-mt-md text-center">Не сосед? <span @click="currentSelect = 2"
        style="text-decoration: underline; cursor: pointer;">Создать дом.</span></span>
  </div>
  <div v-else-if="currentSelect == 2" class="page_container flex-col !h-screen">
    <CreateComponent />
    <span class="q-mt-md text-center">Нажали не туда? <span @click="currentSelect = 1"
        style="text-decoration: underline; cursor: pointer;">Войти в хату.</span></span>
  </div>
</template>

<style scoped lang="scss">
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
  width: 100%;
  padding: 0 3rem;
  // text-align: center;
}
</style>
