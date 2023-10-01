<script setup>
import { ref, watch } from "vue"
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userStore = useUserStore()
const router = useRouter()

await userStore.user_tasks_get()

const tasks_state_copy = ref({ ...userStore.user.tasks })

const task_status_update = (task_index) => {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите отметить задачу выполненной?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await userStore.task_mark_done({ id: tasks_state_copy.value[task_index].id })
    tasks_state_copy.value = { ...userStore.user.tasks }
    router.go({ name: "dash_tasks" })
  })
    .onCancel(() => { tasks_state_copy.value[task_index].done = false; })
    .onDismiss(() => { })
}
</script>


<template>
  <div class="tasks_wrapper px-8 pb-24 pt-8">
    <div class="flex flex-col items-center my-8">
      <img class="user_avatar rounded-full h-16 w-16" alt="user avatar"
        :src="`https://robohash.org/${userStore.user.id}?set=set4`" />
      <p class="text-xl mt-4">{{ userStore.user.name }}</p>
    </div>
    <q-separator color="teal" size="2px" class="opacity-40" />
    <div class="flex items-center justify-between my-8">
      <p class="text-xl text-bold">Предстоящие задачи</p>
    </div>

    <q-timeline class="mt-8" layout="dense" side="right" color="secondary">
      <q-timeline-entry v-for="(task, task_index) in tasks_state_copy" :key="task.id" side="left">
        <template v-slot:title>
          <p class="font-semibold text-orange-300">{{ task.category.title }}</p>
        </template>
        <template v-slot:subtitle>
          <p class="font-semibold">{{ new Date(task.deadline).toLocaleDateString() }} {{ new
            Date(task.deadline).toLocaleTimeString() }}</p>
        </template>
        <div class="item_container flex items-center">
          <q-checkbox @click="task_status_update(task_index)" dark v-model="task.done" class="checkbox_custom"
            color="teal" />
          <p class="">{{ task.title }}</p>
        </div>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<style lang="scss" scoped>
.overflow_task_text {
  text-align: center;
  font-size: 14px;
  display: block;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.task_item {
  display: flex;
  align-items: center;
  margin-top: .1rem;

  p {
    width: 100%;
    all: unset;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

.grid_container {
  padding: 0 1rem;
  height: 100%;
  width: 100%;
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 240px;
}

.grid_container>* {
  min-width: 0px;
}

.grid_item {
  overflow: hidden;
  padding: 1rem;
  background-color: #1d1d1d;
  color: white;
  text-overflow: ellipsis;

  .task_title {
    all: unset;
    font-size: 12px;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
