<template>
  {{ position }}
  <router-view />
</template>

<script setup>
import { date, useQuasar } from "quasar";
import { ref } from "vue";
import sha1 from "js-sha1";

const $q = useQuasar();

import { useUserStore } from "stores/user";
const userStore = useUserStore();

useQuasar().dark.set(true);

userStore.load_state();

if ($q.capacitor) {
  const getTimeRemaining = (endtime) => {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  (async () => {
    const LocalNotifications = $q.capacitor.Plugins.LocalNotifications;
    console.log(LocalNotifications);
    let permissions = await LocalNotifications.requestPermissions();
    if (permissions.display !== "granted") {
      return;
    }

    await LocalNotifications.addListener(
      "localNotificationReceived",
      async (notification) => {
        console.log(notification);
      }
    );

    // await LocalNotifications.cancel({ notifications: [{ id: 4 }] })
    console.log(await LocalNotifications.getPending());

    for (const task of userStore.user.tasks) {
      let time_left = getTimeRemaining(new Date(task.deadline));
      if (!task.scheduled_day) {
        if (
          time_left.days == 1 ||
          (time_left.days == 0 && time_left.hours > 1)
        ) {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Math.random() * 1000000000) + 1,
                title: "Коммуналка | Задачи",
                body: `Осталось меньше ДНЯ до выполнения задачи в категории ${task.category.title}`,
                schedule: {
                  at: new Date(Date.now() + 1000),
                  // repeats: true,
                  // every: "minute"
                },
              },
            ],
          });
          await userStore.mark_task_notification_scheduled({
            task_id: task.id,
            day: true,
          });
        }
      }
      if (!task.scheduled_hour) {
        if (time_left.hours <= 1) {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Math.random() * 1000000000) + 1,
                title: "Коммуналка | Задачи",
                body: `Осталось меньше ЧАСА до выполнения задачи в категории ${task.category.title}`,
                schedule: {
                  at: new Date(Date.now() + 1000),
                },
              },
            ],
          });
          await userStore.mark_task_notification_scheduled({
            task_id: task.id,
            day: false,
          });
        }
      }
    }
  })();
  // $q.capacitor.Plugins.PushNotifications.requestPermissions().then(result => {
  //   if (result.receive === 'granted') {
  //     $q.capacitor.Plugins.PushNotifications.register();
  //   } else {
  //   }
  // });

  // $q.capacitor.Plugins.PushNotifications.addListener('registration',
  //   (token) => {
  //     // alert('Push registration success, token: ' + token.value);
  //     console.log({ token: token.value });
  //   }
  // );

  // // Some issue with our setup and push will not work
  // $q.capacitor.Plugins.PushNotifications.addListener('registrationError',
  //   (error) => {
  //     alert('Error on registration: ' + JSON.stringify(error));
  //   }
  // );

  // // Show us the notification payload if the app is open on our device
  // $q.capacitor.Plugins.PushNotifications.addListener('pushNotificationReceived',
  //   (notification) => {
  //     alert('Push received: ' + JSON.stringify(notification));
  //   }
  // );

  // // Method called when tapping on a notification
  // $q.capacitor.Plugins.PushNotifications.addListener('pushNotificationActionPerformed',
  //   (notification) => {
  //     alert('Push action performed: ' + JSON.stringify(notification));
  //   }
  // );
}
</script>

<style>
body,
#q-app {
  font-family: "Montserrat", sans-serif;
  min-height: 100vh;
}
</style>
