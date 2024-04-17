<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Facturación</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="appStore.empresa != null" class="mt-4 text-subtitle-2">{{ appStore.empresa.nombre }}</div>
      <v-spacer></v-spacer>
      <v-btn v-if="appStore.empresa != null" variant="text" icon @click="cambiarEmpresa">
        <v-icon>mdi-briefcase-arrow-left-right</v-icon>
        <v-tooltip activator="parent" location="end">Cambiar de Empresa</v-tooltip>
      </v-btn>
      <v-btn variant="text" icon="mdi-theme-light-dark" @click="darkMode"></v-btn>
      <v-btn variant="text" icon="mdi-logout" @click="cerrarSesion"></v-btn>
    </v-app-bar>
    <v-navigation-drawer v-if="appStore.empresa != null" v-model="drawer" permanent>
      <v-list>
        <v-list-item prepend-avatar="/usuario.png" :title="appStore.usuario.nombre + ' ' + appStore.usuario.apPaterno"
          :subtitle="appStore.usuario.email"></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-text-box-plus" title="Facturación" @click="toFacturacion"></v-list-item>
        <v-list-item prepend-icon="mdi-text-box-multiple" title="Mis Facturas" to="/facturas"></v-list-item>
        <v-list-group v-if="roleAdmin == true">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-account-cog" title="Configuracion General"></v-list-item>
          </template>
          <v-list-item prepend-icon="mdi-account" title="Usuarios" to="/usuarios"></v-list-item>
        </v-list-group>
        <!-- {{ appStore.usuario.role }} -->
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
import { ref, onMounted, onBeforeMount, inject } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { storeApp } from '@/store/app';
import EmpresasCards from "@/components/empresas/EmpresasCards.vue";

const appStore = storeApp();
const router = useRouter();
const emitter: any = inject("emitter");
const theme = useTheme();

let drawer: any = ref(true);
let dialogEmpresas: any = ref(false);
let roleAdmin: any = ref(false);
let roleJefe: any = ref(false);
let roleAux: any = ref(false);

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
  getRole();
});

function darkMode() {
  theme.global.name.value = theme.global.current.value.dark
    ? "light"
    : "dark";
  localStorage.setItem("theme", theme.global.name.value);
  appStore.theme = JSON.stringify(localStorage.getItem("theme")).replaceAll('"', "");
}

function cambiarEmpresa() {
  dialogEmpresas.value = true;
}

function cerrarEmpresa() {
  dialogEmpresas.value = false;
}

function cerrarSesion() {
  localStorage.clear();
  appStore.token = "";
  router.push({ path: "/login" });
}

function getRole() {
  for (let i = 0; i < appStore.usuario.role.length; i++) {
    if (appStore.usuario.role[i].descripcion == 'ADMIN') {
      roleAdmin.value = true;
    }
    if (appStore.usuario.role[i].descripcion == 'JEFE DE AREA') {
      roleJefe.value = true;
    }
    if (appStore.usuario.role[i].descripcion == 'AUXILIAR') {
      roleAux.value = true;
    }
  }
}

function toFacturacion() {
  router.push({ path: "/facturacion" });
  emitter.emit("emitReset");
}

</script>