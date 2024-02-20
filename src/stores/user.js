import { defineStore } from 'pinia';
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

let router;
let token;
// const router = useRouter()

const isValidSHA1 = (s) => {
  return /[a-fA-F0-9]{40}$/.test(s)
}

const wrapped_request = async (method, params, success_notify_options) => {
  try {
    if (token) { api.defaults.headers.common.Authorization = "JWT " + token } // если пользователь авторизован и есть токен, то крепим его к запросу
    let res = await eval(`api.${method}(${params})`) // eval - функция для выполнения js из строки, тут вызывается динамически сконструированный метод, например api.get("/posts")
    success_notify_options ? Notify.create(success_notify_options) : 0 // если предоставлены опции для уведомления об успешной отправке запроса, то показываем его
    return res.data // возвращаем тело ответа
  } catch (error) {
    console.log(`[WR ERROR] ⬇`);
    console.log(error);
    if (error?.response?.data?.errors[0]?.message) { // если ошибка апишная (от expressjs)
      Notify.create(
        {
          position: 'top',
          message: `Прозошла ошибка: ${error.response.data.errors[0].message}`,
          type: 'negative',
        })
      if (error.response.data.errors[0].message.includes("not allowed") || error.response.data.errors[0].message.includes("нет права")) { // если токен пользователя не действителен
        localStorage.removeItem("user_store") // удаляем сохраненный в localstorage объект пользователя
        router.go({ name: "login" }) // перекидываем на страницу входа
      }
    } else { // любая другая ошибка в ходе выполнения запроса
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
      router = useRouter()
      if (localStorage.getItem("user_store") !== null) {
        if (localStorage.getItem("user_store").user !== null) {
          this.$state.user = JSON.parse(localStorage.getItem("user_store")).user
          token = this.$state.user.token
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
      Notify.create(
        {
          position: 'top',
          message: 'Вы успешно зарегистрированы',
          type: 'positive',
        })
      this.login({ email, password })

    },
    async login({ email, password }) {
      let body = await wrapped_request('post', `'/api/users/login', {email: ${JSON.stringify(email)}, password: ${JSON.stringify(password)}}`) // отправка запроса через wrapped_req
      if (body == null) { return } // если ответ null, дальше не продолжаем (ошибку покажет wrapped_request)
      Notify.create( // если ответ всё-таки пришёл, то показываем приветственное соощбение
        {
          position: 'top',
          message: `Добро пожаловать, ${body.user.name}`,
          type: 'positive',
        })
      this.$state.user = body.user // записываем объект пользователя в состояние приложения 
      this.$state.user.token = body.token // аналогично пишем токен
      token = body.token // устанавливаем токен для дальнейшего прикрепления к запросам во wrapped_request
      await this.home_get() // проверяем наличие или прикрепление к дому
      // await this.user_tasks_get()
      this.router.push({ name: "dash_tasks" }) // направляем в интерфейс авторизованного пользователя в задачи
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
    async home_create({ title, address, password, home_hash, image }) {
      let patch_data = "{"

      if (image) {
        let media_id = await this.upload_image({ image })
        patch_data = patch_data.concat(`image: ${JSON.stringify(media_id)},`)
      }
      patch_data = patch_data.concat(`title: ${JSON.stringify(title)},`)
      patch_data = patch_data.concat(`address: ${JSON.stringify(address)},`)
      patch_data = patch_data.concat(`password: ${JSON.stringify(password)},`)
      patch_data = patch_data.concat(`home_hash: ${JSON.stringify(home_hash)},`)
      patch_data = patch_data.concat("}")
      let body = await wrapped_request('post', `'/api/homes', ${patch_data}`)
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
      let current_neighbors_list = body[0].neighbors ?? []
      current_neighbors_list.push(this.$state.user.id)
      current_neighbors_list = Array.from(new Set(current_neighbors_list))

      body = await wrapped_request('patch', `'/api/homes/${body[0].id}', { neighbors: ${JSON.stringify(current_neighbors_list)} }`)
      if (!body.status == 200) {
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
        let FD = new FormData() // инициализация объекта form data для дальнейшего внесения картинки сюда (традиционный метод заливки картинок)
        FD.append('file', image) // само прикрепление картинки 
        let res = await api.post('/api/media', FD) // отправка запроса на сохранение на серве (без wrapped request тк есть проблемы из-за eval и перевода 
                                                  // FormData в формат строки
        return res.data.doc.id // возвращение айдишника картинки (для использования в качестве внешнего ключа)
      } catch (error) { // то, что ниже, уже описано во wrapped_request
        console.log(`[UPLOAD IMAGE ERROR] ⬇`);
        console.log(error);
        if (error?.response?.data?.errors[0]?.message) {
          Notify.create(
            {
              position: 'top',
              message: `Прозошла ошибка: ${error.response.data.errors[0].message}`,
              type: 'negative',
            })
          if (error.response.data.errors[0].message.includes("not allowed") || error.response.data.errors[0].message.includes("нет права")) {
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
      if (!body.status == 200) {
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
    async mark_task_notification_scheduled({ task_id, day }) {
      let body;
      if (day) {
        body = (await wrapped_request('patch', `'/api/tasks/${task_id}', { scheduled_day: "true" }`))
      } else {
        body = (await wrapped_request('patch', `'/api/tasks/${task_id}', { scheduled_hour: "true" }`))
      }
      if (body == null) { return }
      if (!body.status == 200) {
        return
      }
    }
  },
  mutations: {

  }
});

