<template>
  <div class="root_page_wrapper">
    <suspense>
      <router-view />
    </suspense>
    <ul class="bottom_menu">
      <li v-for="(icon, index) in menu_icons" :key="icon.icon" :class="index == active_menu_item ? 'active_nav_item' : ''"
        @click="handleClick(icon, index)">
        <i :class=icon.icon></i>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.root_page_wrapper {
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  // align-items: center;
  height: 100vh;
}

.active_nav_item {
  background-color: #626cff;
}

ul {
  all: unset;
  display: flex;
  list-style: none;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  background: #1d1d1d;
  height: 6em;
  position: fixed;
  bottom: 0;
}

li {
  color: white;
  padding: 0.5rem 2rem;
  cursor: pointer;
  border-radius: 9999px;
  font-size: 24px;
  transition: .1s ease-in-out;

  &:hover {
    background-color: #ffffffe9;
    color: #1d1d1d;
  }
}
</style>

<script setup>
import { ref } from "vue"
import { useRouter } from 'vue-router'

const router = useRouter()

const handleClick = (icon, index) => {
  active_menu_item.value = index;
  router.push(icon.route)
}

const menu_icons = [
  { icon: "fas fa-tasks", route: "/dash/tasks" },
  { icon: "fas fa-home", route: "/dash/homes" },
  { icon: "fas fa-gear", route: "/dash/settings" },
]

const active_menu_item = ref(0)

</script>
