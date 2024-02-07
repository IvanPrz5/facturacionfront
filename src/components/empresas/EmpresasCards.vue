<template>
  <v-row>
    <v-col v-for="i in empresas" :key="i" :cols="3">
      <v-card class="mb-1" @click="selecEmpresa(i)">
        <v-img cover height="250" src="https://cdn.vuetifyjs.com/images/cards/cooking.png"></v-img>
        <v-card-item>
          <v-card-title>{{ i.nombre }}</v-card-title>
          <v-card-subtitle>
            <span class="me-1">{{ i.rfc }}</span>
            <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
          </v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-row align="center" class="mx-0">
            <v-rating :model-value="4.5" color="amber" density="compact" half-increments readonly size="small"></v-rating>
            <div class="text-grey ms-4">4.5 (413)</div>
          </v-row>
        </v-card-text>
        <v-divider class="mx-4 mt-2 mb-2"></v-divider>
        <v-card-actions>
          <v-btn class="bg-deep-purple" variant="text" block>
            Seleccionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <div style="position: fixed; right: 40px; bottom: 40px;">
    <v-btn elevation="2" size="large" color="indigo" icon style="margin-top: 20px;" @click="aggEmpresa">
      <v-icon>mdi-plus</v-icon>
      <v-tooltip activator="parent" location="end">Crear Empresa</v-tooltip>
    </v-btn>
  </div>
  <v-dialog v-model="crearEmpresa" width="900">
    <CrearEmpresa @actualizarEmpresas="getEmpresas()"/>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "../../store/app";
import { useRouter } from "vue-router";
import { Empresa } from "@/class/Empresa";
import axios from "axios";
import CrearEmpresa from "./CrearEmpresa.vue";

const emit = defineEmits(["cerrarEmpresa"]);

const appStore = storeApp();
const router = useRouter();
let empresas: any = ref([]);
let crearEmpresa: any = ref(false);

onMounted(() => {
  getEmpresas();
});

function getEmpresas() {
  axios
    .get(appStore.link + "/Empresas/getAll")
    .then((response) => {
      empresas.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function selecEmpresa(item: any) {
  localStorage.setItem("empresa", JSON.stringify(<Empresa>item));
  appStore.empresa = <Empresa>item;
  router.push({ path: "/facturacion" });
  if (appStore.empresa != null) {
    emit("cerrarEmpresa")
  }
}


function aggEmpresa(){
  crearEmpresa.value = true;
}
</script>
