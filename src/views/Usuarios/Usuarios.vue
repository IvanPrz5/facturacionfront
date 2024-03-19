<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex">
        Usuarios
        <v-spacer></v-spacer>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-btn color="indigo" @click="agregarUsuario"> Agregar Usuario </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-data-table :headers="headers" :items="desserts">
              <template v-slot:item.actions="{ item }">
                <v-btn class="mr-2" color="success" variant="tonal" @click="editarRoles(item)">
                  <v-icon size="large"> mdi-account-settings </v-icon>
                  <v-tooltip activator="parent" location="bottom">Editar Roles</v-tooltip>
                </v-btn>
                <v-btn class="mr-2" color="blue" variant="tonal" @click="editarEmpresas(item)">
                  <v-icon size="large"> mdi-bank </v-icon>
                  <v-tooltip activator="parent" location="bottom">Editar Empresas</v-tooltip>
                </v-btn>
                <v-btn class="mr-2" color="error" variant="tonal" @click="editarUsuario(item)">
                  <v-icon size="large"> mdi-pencil </v-icon>
                  <v-tooltip activator="parent" location="bottom">Editar Usuario</v-tooltip>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="dialogLista" width="800">
    <Lista :propList="propList" :propsItemTable="propsItemTable"></Lista>
  </v-dialog>
  <v-dialog v-model="dialogUsuario" width="600">
    <AgregarUsuario :propEditarUsuario="propEditarUsuario" @actualizar="actualizar"></AgregarUsuario>
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Lista from "@/components/usuarios/Lista.vue";
import AgregarUsuario from "@/components/usuarios/AgregarUsuario.vue";

const appStore = storeApp();
const headers: any = ref([
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Nombre",
    key: "nombre",
  },
  {
    title: "Paterno",
    key: "apPaterno",
  },
  {
    title: "Email",
    key: "email",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]);
let desserts: any = ref([]);
let dialogLista: any = ref(false);
let dialogUsuario: any = ref(false);
let propList: any = ref();
let propEditarUsuario: any = ref();
let propsItemTable: any = ref();

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

onMounted(() => {
  getUsuarios();
});

function editarRoles(item: any){
  propsItemTable.value = item;
  propList.value = 0;
  dialogLista.value = true;
}

function editarEmpresas(item: any) {
  propsItemTable.value = item;
  propList.value = 1;
  dialogLista.value = true;
}

function agregarUsuario(){
  propEditarUsuario.value = null;
  dialogUsuario.value = true;
}

function editarUsuario(item: any){
  propEditarUsuario.value = item;
  dialogUsuario.value = true;
}

function getUsuarios() {
  axios
    .get(appStore.link + "/Usuarios/byStatus")
    .then((response) => {
      desserts.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function actualizar(){
  dialogUsuario.value = false;
  getUsuarios();
  mostrarSnack("success", "Se guardo correctamente", 3500);
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  time = timeMensaje;
  snack.value = true;
}
</script>
