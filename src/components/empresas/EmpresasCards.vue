<template>
  <v-row>
    <v-col cols="12" class="d-flex align-center justify-center">
      <div class="text-h5 font-weight-medium mb-2">
        Selecciona la empresa para facturar
      </div>
    </v-col>
    <v-col v-for="i in empresas" :key="i" :cols="3">
      <v-card class="mb-1">
        <v-img cover height="250" src="https://cdn.vuetifyjs.com/images/cards/road.jpg">
          <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
          <template v-slot:append>
            <v-btn icon @click="editarEmpresa(i)">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="bottom">Editar Empresa</v-tooltip>
            </v-btn>
          </template>
        </v-toolbar>
        </v-img>
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
          <v-btn class="bg-deep-purple" variant="text" block @click="selecEmpresa(i)">
            Seleccionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <div style="position: fixed; right: 40px; bottom: 40px;" v-if="roleAdmin == true || roleJefe == true">
    <v-btn elevation="2" size="large" color="indigo" style="margin-top: 20px;" @click="aggEmpresa">
      Crear Empresa
    </v-btn>
  </div>
  <v-dialog v-model="crearEmpresa" width="900" persistent>
    <CrearEmpresa @actualizarEmpresas="actualizar()" @errorEmpresas="errorEmpresas()" @cerrar="cerrar" :editarEmpresaProp="editarEmpresaProp" />
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
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

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let roleAdmin: any = ref(false);
let roleJefe: any = ref(false);
let roleAux: any = ref(false);
let editarEmpresaProp: any = ref(false);

onMounted(() => {
  getEmpresas();
  getRole();
});

function getEmpresas() {
  axios
    .get(appStore.link + "/Usuarios/getEmpresas/" + appStore.usuario.id)
    .then((response) => {
      empresas.value = response.data[0].empresas;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function selecEmpresa(item: any) {
  localStorage.setItem("empresa", JSON.stringify(<Empresa>item));
  appStore.empresa = <Empresa> item;
  router.push({ path: "/facturacion" });
  if (appStore.empresa != null) {
    emit("cerrarEmpresa");
  }
}

function actualizar(){
  getEmpresas();
  mostrarSnack("success", "La empresa se ha creado", 3000);
  crearEmpresa.value = false;
}

function errorEmpresas(){
  mostrarSnack("error", "Error al crear empresa", 3000);
}

function aggEmpresa(){
  crearEmpresa.value = true;
  editarEmpresaProp.value = null;
}

function editarEmpresa(item: any){
  crearEmpresa.value = true;
  editarEmpresaProp.value = item;
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}

function getRole(){
  for(let i=0; i<appStore.usuario.role.length; i++){
    if(appStore.usuario.role[i].descripcion == 'ADMIN'){
      roleAdmin.value = true;
    }
    if(appStore.usuario.role[i].descripcion == 'JEFE DE AREA'){
      roleJefe.value = true;
    }
    if(appStore.usuario.role[i].descripcion == 'AUXILIAR'){
      roleAux.value = true;
    }
  }
}

function cerrar(){
  crearEmpresa.value = false;
}
</script>
