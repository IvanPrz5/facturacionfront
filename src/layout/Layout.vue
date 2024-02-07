<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Facturación</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="appStore.empresa != null" class="mt-4 text-subtitle-2">{{ appStore.empresa.nombre }}</div>
      <v-spacer></v-spacer>
      <v-btn v-if="appStore.empresa != null"  variant="text" icon @click="cambiarEmpresa">
        <v-icon>mdi-briefcase-arrow-left-right</v-icon>
        <v-tooltip activator="parent" location="end">Cambiar de Empresa</v-tooltip>
      </v-btn>
      <v-btn variant="text" icon="mdi-theme-light-dark" @click="darkMode"></v-btn>
      <v-btn variant="text" icon="mdi-dots-vertical"></v-btn>
    </v-app-bar>
    <v-navigation-drawer v-if="appStore.empresa != null" v-model="drawer" permanent>
      <v-list>
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" title="Sandra Adams"
          subtitle="sandra_a88@gmailcom"></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-text-box-plus" title="Facturación" to="/facturacion"></v-list-item>
        <v-list-item prepend-icon="mdi-text-box-multiple" title="Mis Facturas" to="/facturas"></v-list-item>
        <v-list-item prepend-icon="mdi-account-multiple" title="Shared with me" value="shared" to="/empresas"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
    <v-dialog v-model="dialogEmpresas" width="1200">
      <EmpresasCards @cerrarEmpresa="cerrarEmpresa"></EmpresasCards>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { storeApp } from '@/store/app';
import EmpresasCards from "@/components/empresas/EmpresasCards.vue";

const appStore = storeApp();
const router = useRouter();
const theme = useTheme();
let drawer: any = ref(true);
let dialogEmpresas: any = ref(false);

onBeforeMount(() => {
  const token = localStorage.getItem("token");
  if (token != null) {
    let user: any = localStorage.getItem("usuario");
    appStore.usuario = JSON.parse(user);
    let empresa: any = localStorage.getItem("empresa");
    appStore.empresa = JSON.parse(empresa)
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

function cambiarEmpresa(){
  dialogEmpresas.value = true;
}

function cerrarEmpresa(){
  dialogEmpresas.value = false;
}
</script>