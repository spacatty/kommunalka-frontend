import { defineStore } from 'pinia';
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { Notify } from 'quasar'


const router = useRouter()

const isValidSHA1 = (s) => {
  return /[a-fA-F0-9]{40}$/.test(s)
}

const wrapped_request = async (method, params, success_notify_options) => {
  try {
    let res = await eval(`api.${method}(${params})`)
    success_notify_options ? Notify.create(success_notify_options) : 0
    return res.data
  } catch (error) {
    console.log(`[WR ERROR] ⬇`);
    console.log(error);
    if (error?.response?.data?.errors[0]?.message) {
      Notify.create(
        {
          position: 'top',
          message: `Прозошла ошибка: ${error.response.data.errors[0].message}`,
          type: 'negative',
        })
      if (error.response.data.errors[0].message.includes("not allowed")) {
        localStorage.removeItem("user_store")
        router.go({ name: "login" })
      }
    } else {
      Notify.create(
        {
          position: 'top',
          message: `Прозошла ошибка: ${error}`,
          type: 'negative',
        })
    }
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  getters: {

  },
  actions: {
    async load_state() {
      if (localStorage.getItem("user_store") !== null) {
        if (localStorage.getItem("user_store").user !== null) {
          this.$state.user = JSON.parse(localStorage.getItem("user_store")).user
        }
      }
    },
    async register({ email, password, name }) {
      let body = await wrapped_request('post', `'/api/users', {
          email: ${JSON.stringify(email)},
          password: ${JSON.stringify(password)},
          name: ${JSON.stringify(name)},
          role: "user",
          loginAttempts: 0
        }`)
      if (body == null) { return }
      if (res.status == 201 && res.data.message.includes("successfully created")) {
        Notify.create(
          {
            position: 'top',
            message: 'Вы успешно зарегистрированы',
            type: 'positive',
          })
        this.login({ email, password })
      }

    },
    async login({ email, password }) {
      let body = await wrapped_request('post', `'/api/users/login', {email: ${JSON.stringify(email)}, password: ${JSON.stringify(password)}}`)
      if (body == null) { return }
      Notify.create(
        {
          position: 'top',
          message: `Добро пожаловать, ${body.user.name}`,
          type: 'positive',
        })
      this.$state.user = body.user
      await this.home_get()
      // await this.user_tasks_get()
      this.router.push({ name: "dash_tasks" })
    },
    async logout() {
      let body = await wrapped_request('post', "'/api/users/logout'")
      if (body == null) { return }
      Notify.create(
        {
          position: 'top',
          message: `Вы успешно вышли из системы`,
          type: 'positive',
        })
      this.$state.user = null
      this.router.push('/')
    },
    async home_create({ title, address, password, hash }) {
      let body = await wrapped_request('post', `'/api/homes', { title: ${JSON.stringify(title)}, address: ${JSON.stringify(address)}, password: ${JSON.stringify(password)}, home_hash: ${JSON.stringify(hash)}}`)
      if (body == null) { return }
      Notify.create(
        {
          position: 'top',
          message: `Дом успешно зарегистрирован`,
          type: 'positive',
        })
      this.$state.user.home = body.doc
    },
    async home_get() {
      let body = await wrapped_request('get', `'/api/homes?where[owner][equals]=${this.$state.user.id}'`)
      if (body.docs.length == 0) {
        body = await wrapped_request('get', `'/api/homes?where[neighbors][equals]=${this.$state.user.id}'`)
        if (body.docs.length == 0) { return }
      }
      this.$state.user.home = body.docs[0]

      body = await wrapped_request('get', `'/api/task_category?where[home][equals]=${this.$state.user.home.id}&depth=0'`)
      this.$state.user.home.categories = body.docs

    },
    async home_join({ hash, password }) {
      let body
      if (isValidSHA1(hash)) {
        body = (await wrapped_request('get', `'/api/homes?where[home_hash][equals]=${hash}&where[password][equals]=${password}&depth=0'`)).docs
      } else {
        body = (await wrapped_request('get', `'/api/homes?where[address][equals]=${hash}&where[password][equals]=${password}&depth=0'`)).docs
      }
      if (body == null) { return }
      if (body.length == 0) {
        Notify.create({ type: 'negative', position: 'top', message: "Неверные данные для входа" })
        return
      }
      let current_neighbors_list = body[0].neighbors
      current_neighbors_list.push(this.$state.user.id)
      current_neighbors_list = Array.from(new Set(current_neighbors_list))

      body = await wrapped_request('patch', `'/api/homes/${body[0].id}', { neighbors: ${JSON.stringify(current_neighbors_list)} }`)
      if (!body.message.includes("successfully")) {
        Notify.create({ type: 'negative', position: 'top', message: "Ошибка при прикреплении к дому" })
        return
      }
      Notify.create({ type: 'positive', position: 'top', message: "Вы успешно присоединились к дому" })
      this.$state.user.home = body.doc

    },
    async home_update({ title, password, image }) {
      let patch_data = "{"
      if (title) {
        patch_data = patch_data.concat(`title: ${JSON.stringify(title)},`)
      }
      if (password) {
        patch_data = patch_data.concat(`password: ${JSON.stringify(password)},`)
      }
      if (image) {
        let media_id = await this.upload_image({ image })
        patch_data = patch_data.concat(`image: ${JSON.stringify(media_id)}`)
      }
      patch_data = patch_data.concat("}")

      let body = await wrapped_request('patch', `'/api/homes/${this.$state.user.home.id}', ${patch_data}`)
      Notify.create({
        position: 'top',
        type: 'positive',
        message: "Дом успешно обновлен"
      })
    },
    async upload_image({ image }) {
      try {
        let FD = new FormData()
        FD.append('file', image)
        let res = await api.post('/api/media', FD)
        return res.data.doc.id
      } catch (error) {
        console.log(`[UPLOAD IMAGE ERROR] ⬇`);
        console.log(error);
        if (error?.response?.data?.errors[0]?.message) {
          Notify.create(
            {
              position: 'top',
              message: `Прозошла ошибка: ${error.response.data.errors[0].message}`,
              type: 'negative',
            })
          if (error.response.data.errors[0].message.includes("not allowed")) {
            localStorage.removeItem("user_store")
            router.push({ name: "login" })
          }
        } else {
          Notify.create(
            {
              position: 'top',
              message: `Прозошла ошибка: ${error}`,
              type: 'negative',
            })
        }
      }
    },
    async new_category_add({ title, home, color }) {
      let body = await wrapped_request('post', `'/api/task_category', { title: ${JSON.stringify(title)}, home: ${JSON.stringify(home)}, color: ${JSON.stringify(color)} }`)
      if (body == null) { return }
      Notify.create(
        {
          position: 'top',
          message: `Категория успешно добавлена`,
          type: 'positive',
        })
      this.router.go()
    },
    async add_new_task({ title, responsible, deadline, period, done, category, home, category_index }) {
      let body = await wrapped_request('post', `'/api/tasks', { home: ${JSON.stringify(home)}, title: ${JSON.stringify(title)}, responsible: ${JSON.stringify(responsible)}, deadline: ${JSON.stringify(deadline)}, period: ${JSON.stringify(period)}, done: ${JSON.stringify(done)}, category: ${JSON.stringify(category)},  }`)
      if (body == null) { return }
      Notify.create(
        {
          position: 'top',
          message: `Задача создана успешно`,
          type: 'positive',
        })
      if (!this.$state.user.home.categories[category_index].tasks) { this.$state.user.home.categories[category_index].tasks = [] }
      this.$state.user.home.categories[category_index].tasks.push(body.doc)
    },
    async get_tasks_by_category({ category_id, category_index }) {
      let body = (await wrapped_request('get', `'/api/tasks?where[home][equals]=${this.$state.user.home.id}&where[category][equals]=${category_id}&where[done][equals]=false&depth=1'`)).docs
      if (body == null) { return }
      this.$state.user.home.categories[category_index].tasks = body
    },
    async user_tasks_get() {
      let body = (await wrapped_request('get', `'/api/tasks?where[responsible][equals]=${this.$state.user.id}&where[done][equals]=false&depth=1'`)).docs
      if (body == null) { return }
      this.$state.user.tasks = null
      this.$state.user.tasks = body
    },
    async task_mark_done({ id }) {
      let body = (await wrapped_request('patch', `'/api/tasks/${id}', { done: "true" }`))
      if (body == null) { return }
      if (!body.message.includes("successfully")) {
        Notify.create({ type: 'negative', position: 'top', message: "Ошибка при изменении статуса задачи" })
        return
      }
      // await this.user_tasks_get()
      Notify.create({
        type: 'positive',
        position: 'top',
        message: 'Статус задачи успешно изменен'
      })
    },
    async mark_task_notification_scheduled({task_id, day}) {
      let body;
      if(day) {
        body = (await wrapped_request('patch', `'/api/tasks/${task_id}', { scheduled_day: "true" }`))
      } else {
        body = (await wrapped_request('patch', `'/api/tasks/${task_id}', { scheduled_hour: "true" }`))
      }
      if (body == null) { return }
      if (!body.message.includes("successfully")) {
        return
      }
    }


  },
  mutations: {

  }
});
