<template>
  <v-card>
    <v-card-title class="bg-primary"> Empresa </v-card-title>
    <v-card-text>
      <v-form ref="empresaForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="6" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Nombre" v-model="empresa.nombre" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="RFC" v-model="empresa.rfc" :rules="[rules.requerido, rules.minimoDeCaracteres(empresa.rfc, 11), rules.maximoDeCaracteres(empresa.rfc, 13)]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Codigo Postal"
              v-model="empresa.codPostal" :rules="[rules.requerido, rules.totalCaracteres(empresa.codPostal, 5)]"></v-text-field>
          </v-col>
          <v-col cols="8" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Regimen Fiscal" v-model="empresa.regimenFiscal"
              :rules="[rules.requerido]" :items="itemsRegimenFiscal" :item-title="titleAutoComplete"
              item-value="id"></v-autocomplete>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept=".cer" label="Cer" chips
              v-model="cerB64" :rules="[rules.requerido]"></v-file-input>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept=".key" label="Key" chips
              v-model="keyB64" :rules="[rules.requerido]"></v-file-input>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Contraseña key" chips
              v-model="empresa.passKey" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-file-input variant="outlined" density="compact" accept="image/png, image/jpeg, image/bmp"
              prepend-icon="mdi-camera" label="Logo" v-model="logo"></v-file-input>
          </v-col>
          <v-col cols="4 mb-4" class="px-1">
            <v-btn variant="tonal" block color="error" @click="cerrar">Cancelar</v-btn>
          </v-col>
          <v-col cols="8 mb-4" class="px-1">
            <v-btn variant="tonal" block color="success" @click="crearEmpresa">{{ btnText }}</v-btn>
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

const emit = defineEmits(["actualizarEmpresas", "errorEmpresas", "cerrar"]);
const props = defineProps(["editarEmpresaProp"]);

const appStore = storeApp();
const rules = new Rules();
const itemsRegimenFiscal: any = ref([]);
const empresaForm: any = ref(null);

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
  numCertificado: null,
  curp: "",
  usuarioPac: "",
  contraseñaPac: "",
  fisica: "",
  status: true,
  idRegimenFiscal: { id: null },
});
let btnText: any = ref("")

onMounted(() => {
  if(props.editarEmpresaProp != null){
    btnText.value = "Editar Empresa";
    cargarDatos(props.editarEmpresaProp);
  }else{
    btnText.value = "Crear Empresa";
  }
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

async function crearEmpresa() {
  const { valid } = await empresaForm.value.validate();
  if(valid){
    
    let tipoAxios = "/Empresas/add/" + appStore.usuario.id
    if(props.editarEmpresaProp != null){
      tipoAxios = "/Empresas/editar/" + props.editarEmpresaProp.id;
    }
    
    empresa.value.idRegimenFiscal.id = empresa.value.regimenFiscal;
    const entityJson = JSON.stringify(empresa.value);
    const blob = new Blob([entityJson], {
      type: "application/json",
    });

    var formData = new FormData();
    
    arrayFiles.value.push(cerB64.value[0]);
    arrayFiles.value.push(keyB64.value[0]);
    if(logo.value != null){
      arrayFiles.value.push(logo.value[0]);
    }

    for(let i=0; i<arrayFiles.value.length; i++){
      formData.append("file", arrayFiles.value[i]);
    }

    formData.append("doc", blob);
    
    axios
      .post(appStore.link + tipoAxios, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        arrayFiles.value = [];
        emit("actualizarEmpresas");
      })
      .catch((e) => {
        emit("errorEmpresas");
      })
  }else{
    console.log("Campos Vacios")
  }
}

function cargarDatos(item: any){
  empresa.value.nombre = item.nombre;
  empresa.value.rfc = item.rfc;
  empresa.value.codPostal = item.codPostal;
  empresa.value.regimenFiscal = item.regimenFiscal;
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

function cerrar(){
  emit("cerrar");
}
</script>
