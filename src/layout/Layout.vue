<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Facturación</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" icon="mdi-magnify"></v-btn>
      <v-btn variant="text" icon="mdi-theme-light-dark" @click="darkMode"></v-btn>
      <v-btn variant="text" icon="mdi-dots-vertical"></v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list>
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" title="Sandra Adams"
          subtitle="sandra_a88@gmailcom"></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-folder" title="My Files" value="myfiles" to="/facturacion"></v-list-item>
        <v-list-item prepend-icon="mdi-account-multiple" title="Shared with me" value="shared" ></v-list-item>
        <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { storeApp } from '@/store/app';

const appStore = storeApp();
const router = useRouter();
const theme = useTheme();
let drawer:any = ref(true);

onBeforeMount(() => {
  const token = localStorage.getItem("token");
  if (token != null) {
    let user: any = localStorage.getItem("usuario");
    appStore.usuario = JSON.parse(user);
  } else {
    router.push({ path: "/login" });
  }
})

onMounted(() => {
  // getMenu()
});

function darkMode(){
  theme.global.name.value = theme.global.current.value.dark
    ? "light"
    : "dark"
}

</script>