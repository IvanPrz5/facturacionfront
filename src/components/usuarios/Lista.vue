<template>
  <v-card>
    <v-card-title class="bg-primary">Empresas</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-if="props.propList == 0" v-for="(item, i) in roles">
          <div class="d-flex">
            <div>
              <v-list-item-title v-text="item.descripcion"></v-list-item-title>
              <!-- <v-list-item-subtitle v-text="item.descripcion"></v-list-item-subtitle> -->
            </div>
            <v-spacer></v-spacer>
            <!-- @vue-ignore -->
            <v-btn @click="asignarRol(item)" v-if="rolesUsers.filter(r => r.id == item.id).length < 1" prepend-icon="mdi-plus" size="small" class="mr-2" color="success">Agregar</v-btn>
            <v-btn @click="quitarRol(item)" v-else prepend-icon="mdi-delete" size="small" class="mr-2" color="error">Quitar</v-btn>
          </div>
          <v-divider class="mt-2 mb-2"></v-divider>
        </v-list-item>
        <v-list-item v-if="props.propList == 1" v-for="(item, i) in empresas">
          <div class="d-flex">
            <div>
              <v-list-item-title v-text="item.nombre"></v-list-item-title>
              <v-list-item-subtitle v-text="item.rfc"></v-list-item-subtitle>
            </div>
            <v-spacer></v-spacer>
            <!-- @vue-ignore -->
            <v-btn @click="asignar(item)" v-if="empresasUsers.filter(r => r.id == item.id).length < 1" prepend-icon="mdi-plus" size="small" class="mr-2" color="success">Agregar</v-btn>
            <v-btn @click="quitar(item)" v-else prepend-icon="mdi-delete" size="small" class="mr-2" color="error">Quitar</v-btn>
          </div>
          <v-divider class="mt-2 mb-2"></v-divider>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "../../store/app";
import axios from "axios";

const appStore = storeApp();
let empresas: any = ref([]);
let empresasUsers: any = ref([]);
let roles: any = ref([]);
let rolesUsers: any = ref([]);

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

const props = defineProps(["propList", "propsItemTable"]);

onMounted(() => {
  if(props.propList == 0){
    getRoles();
    getRolesByUsuario(props.propsItemTable);
  }
  if(props.propList == 1){
    getEmpresas();
    getEmpresasByUsuario(props.propsItemTable);
  }
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

function getEmpresasByUsuario(item:any) {
  axios
    .get(appStore.link + "/Empresas/getEmpresas/" + item.id)
    .then((response) => {
      empresasUsers.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getRoles() {
  axios
    .get(appStore.link + "/Roles/all")
    .then((response) => {
      roles.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getRolesByUsuario(item: any) {
  axios
    .get(appStore.link + "/Roles/byUser/" + item.id)
    .then((response) => {
      rolesUsers.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function asignarRol(item: any){
  axios.post(appStore.link + "/Roles/addRol/" + item.id + "/" +  props.propsItemTable.id)
    .then((response) => {
      if(response.data == "0"){
        getRoles();
        getRolesByUsuario(props.propsItemTable);
        mostrarSnack("success", "Se asigno el rol", 3500);
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function quitarRol(item: any){
  axios.post(appStore.link + "/Roles/deleteRol/" + item.id + "/" +  props.propsItemTable.id)
    .then((response) => {
      if(response.data == "0"){
        getRoles();
        getRolesByUsuario(props.propsItemTable);
        mostrarSnack("success", "Se quito el Rol", 3500);
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function asignar(item: any){
  axios.post(appStore.link + "/Usuarios/asignar/" + props.propsItemTable.id + "/" + item.id)
    .then((response) => {
      if(response.data == "0"){
        getEmpresas();
        getEmpresasByUsuario(props.propsItemTable);
        mostrarSnack("success", "Se asigno la empresa", 3500);
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function quitar(item: any){
  axios.post(appStore.link + "/Usuarios/quitar/" + props.propsItemTable.id + "/" + item.id)
    .then((response) => {
      if(response.data == "0"){
        getEmpresas();
        getEmpresasByUsuario(props.propsItemTable);
        mostrarSnack("success", "Se quito la empresa", 3500);
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  time = timeMensaje;
  snack.value = true;
}
</script>
