<script setup>
import { useUserStore } from "stores/user";
const userStore = useUserStore()
</script>


<template>
  <div class="flex items-center justify-between my-4">
    <p class="text-lg text-bold">Хозяин коммуналки</p>
  </div>
  <div class="owner_hero py-2">
    <div class="avatar_wrapper h-16 w-16 mx-auto">
      <img :src="`https://robohash.org/${userStore.user.home.owner.id}?set=set4`" alt="avatar"
        class="avatar rounded-full h-full w-full object-cover">
    </div>
    <p class="text-md font-bold text-center my-2">{{ userStore.user.home.owner.name }}</p>
  </div>

  <div class="flex items-center justify-between my-4">
    <p class="text-lg text-bold">Список соседей</p>
  </div>

  <div class="neighbors_grid grid grid-cols-2">
    <div class="owner_hero py-2" v-for="neighbor in userStore.user.home.neighbors">
      <div class="avatar_wrapper h-16 w-16 mx-auto">
        <img :src="`https://robohash.org/${neighbor.id}?set=set4`" alt="avatar"
          class="avatar rounded-full h-full w-full object-cover">
      </div>
      <p class="text-md font-bold text-center my-2">{{ neighbor.name }}</p>
    </div>
  </div>
</template>
