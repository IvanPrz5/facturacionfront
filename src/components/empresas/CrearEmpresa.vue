<template>
  <v-card>
    <v-card-title class="bg-primary"> Empresa </v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-col cols="6" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Nombre" v-model="empresa.nombre"></v-text-field>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="RFC" v-model="empresa.rfc"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Codigo Postal"
              v-model="empresa.codPostal"></v-text-field>
          </v-col>
          <v-col cols="8" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Regimen Fiscal" v-model="empresa.regimenFiscal"
              :rules="[rules.requerido]" :items="itemsRegimenFiscal" :item-title="titleAutoComplete"
              item-value="id"></v-autocomplete>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept=".cer" label="Cer" chips
              v-model="cerB64"></v-file-input>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept=".key" label="Key" chips
              v-model="keyB64"></v-file-input>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Contraseña key" chips
              v-model="empresa.passKey"></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept="image/png, image/jpeg, image/bmp"
              prepend-icon="mdi-camera" label="Logo" v-model="logo"></v-file-input>
          </v-col>
          <v-col cols="12 mb-4">
            <v-btn variant="tonal" block color="success" @click="crearEmpresa">Crear Empresa</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import Rules from "@/class/Rules";
import axios from 'axios';

const emit = defineEmits(["actualizarEmpresas"]);

const appStore = storeApp();
const rules = new Rules();
const itemsRegimenFiscal: any = ref([]);

let cerB64: any = ref();
let keyB64: any = ref();
let logo: any = ref();
let arrayFiles: any = ref([]);

let empresa: any = ref({
  nombre: null,
  rfc: null,
  codPostal: null,
  regimenFiscal: null,
  passKey: null,
  numCertificado: "prueba",
  curp: "MAPC960410HOCRRR01",
  usuarioPac: "aksdbka",
  contraseñaPac: "aksdbka",
  fisica: "jajshdvb",
  routeCerB64: "kahsvdjahsd",
  status: true,
  idRegimenFiscal: { id: null },
});

onMounted(() => {
  getRegimenFiscal();
});

function getRegimenFiscal() {
  axios
    .get(appStore.link + "/RegimenFiscal/get")
    .then((response) => {
      itemsRegimenFiscal.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function crearEmpresa() {
  empresa.value.idRegimenFiscal.id = empresa.value.regimenFiscal;
  const entityJson = JSON.stringify(empresa.value);
  const blob = new Blob([entityJson], {
    type: "application/json",
  });

  var formData = new FormData();
  
  arrayFiles.value.push(cerB64.value[0]);
  arrayFiles.value.push(keyB64.value[0]);
  arrayFiles.value.push(logo.value[0]);

  for(let i=0; i<arrayFiles.value.length; i++){
    formData.append("file", arrayFiles.value[i]);
  }
  formData.append("doc", blob);

  console.log(entityJson)

  axios
    .post(appStore.link + "/Empresas/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(() => {
      arrayFiles.value = [];
      emit("actualizarEmpresas");
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function objetoEmpresa() {

}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}
</script>
