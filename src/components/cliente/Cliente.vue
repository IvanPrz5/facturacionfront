<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Cliente
      <v-spacer></v-spacer>
      <v-text-field class="pa-0 ma-0" density="compact" variant="filled" label="Buscar por Nombre o Rfc del cliente"
        hide-details append-inner-icon="mdi-magnify" v-model="nombreRfc" @click:append-inner="buscarPorNombreOrRfc"
        @keyup.enter="buscarPorNombreOrRfc"></v-text-field>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn @click="agregarCliente" color="success">
        <v-icon size="x-large">mdi-plus</v-icon>
        <v-tooltip activator="parent" location="end">Si tu cliente no aparece, crealo</v-tooltip>
      </v-btn>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-icon :icon="showCliente ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showCliente = !showCliente"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showCliente">
        <v-form ref="clienteForm" fast-fail @submit.prevent>
          <v-row no-gutters>
            <!-- <v-col cols="12">
              <v-text-field variant="outlined" density="compact" label="RFC o Nombre del Cliente" append-inner-icon="mdi-magnify"></v-text-field>
            </v-col> -->
            <v-col cols="8" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Nombre" v-model="clienteClass.nombre"
                :rules="[rules.requerido]" readonly></v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="RFC" v-model="clienteClass.rfc"
                :rules="[rules.requerido]" ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Codigo Postal"
                v-model="clienteClass.domicilioFiscal" :rules="[rules.requerido]" readonly>
              </v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Regimen Fiscal"
                v-model="clienteClass.regimenFiscal" :rules="[rules.requerido]" readonly></v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Uso CFDI" v-model="clienteClass.usoCfdi"
                :rules="[rules.requerido]" readonly></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-expand-transition>
  </v-card>
  <v-dialog v-model="dialogCliente" width="900">
    <AñadirCliente @clienteAgregado="clienteAgregado" />
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import AñadirCliente from "./AñadirCliente.vue";
import Rules from "@/class/Rules";

const appStore = storeApp();
const rules = new Rules();
const clienteClass = appStore.cliente;
const clienteForm: any = ref(null)

let arrayCliente: any = ref([]);
let showCliente: any = ref(true);
let dialogCliente: any = ref(false);
let nombreRfc: any = ref() // MTV850101H72

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

async function buscarPorNombreOrRfc() {
  await axios
    .get(appStore.link + "/Clientes/byNombreOrRfc/" + nombreRfc.value)
    .then((response) => {
      if (response.data == "") {
        mostrarSnack("error", "El cliente no existe, revise sus datos", 5000);
      } else {
        clienteClass.nombre = response.data.nombre;
        clienteClass.rfc = response.data.rfc;
        clienteClass.domicilioFiscal = response.data.domicilioFiscal;
        clienteClass.regimenFiscal = response.data.regimenFiscal;
        clienteClass.usoCfdi = response.data.usoCfdi;
        nombreRfc.value = null;
      }
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

async function setDatosCliente() {
  const { valid } = await clienteForm.value.validate();
  if (valid) {
    arrayCliente.value = objetoConcepto();
    return arrayCliente.value;
  } else {
    return null;
  }
}

function objetoConcepto() {
  let reg = clienteClass.regimenFiscal.split(".");
  let uso = clienteClass.usoCfdi.split(".");
  // let unidad2 = codClaveUnidad[1].replace("- ", "");
  let obj = {
    nombre: clienteClass.nombre,
    rfc: clienteClass.rfc,
    domicilioFiscal: clienteClass.domicilioFiscal,
    regimenFiscal: reg[0],
    usoCfdi: uso[0],
  };
  return obj;
}

function ocultar() {
  showCliente.value = false;
}

function agregarCliente() {
  dialogCliente.value = true;
}

async function clienteAgregado(item: any) {
  dialogCliente.value = false;
  mostrarSnack("success", "El cliente se agrego correctamente", 5000);
  nombreRfc.value = item;
  await buscarPorNombreOrRfc();
  // Object.assign(clienteClass, item);
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  time = timeMensaje;
  snack.value = true;
}

defineExpose({
  ocultar,
  setDatosCliente,
});
</script>
