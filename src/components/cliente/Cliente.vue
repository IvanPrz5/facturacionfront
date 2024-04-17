<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Cliente
      <v-card-subtitle class="mt-2"> {{ clienteClass.nombre }} </v-card-subtitle>
      <v-spacer></v-spacer>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn @click="listaClientes" color="indigo">
        Ver Clientes
      </v-btn>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn @click="agregarCliente" color="indigo" append-icon="mdi-plus">Añadir</v-btn>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn v-if="clienteClass.nombre != null" @click="editarCliente" color="indigo"
        append-icon="mdi-plus">Editar</v-btn>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-icon :icon="showCliente ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showCliente = !showCliente"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showCliente">
        <v-form ref="clienteForm" fast-fail @submit.prevent>
          <v-row no-gutters>
            <v-col cols="8" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Nombre" v-model="clienteClass.nombre"
                :rules="[rules.requerido]" readonly></v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="RFC" v-model="clienteClass.rfc"
                :rules="[rules.requerido]" readonly></v-text-field>
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
              <v-autocomplete variant="outlined" density="compact" label="Uso CFDI" v-model="clienteClass.usoCfdi"
                :rules="[rules.requerido]" :items="itemsUsoCfdi" :item-title="titleAutoComplete"
                item-value="codigo"></v-autocomplete>
              <!-- <v-text-field variant="outlined" density="compact" label="Uso CFDI" v-model="clienteClass.usoCfdi"
                :rules="[rules.requerido]" readonly></v-text-field> -->
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-expand-transition>
  </v-card>
  <v-dialog v-model="listClientesDialog" width="1200">
    <ListClientes :listClientes="desserts" @emitClientes="emitClientes" />
  </v-dialog>
  <v-dialog v-model="dialogCliente" width="900">
    <AñadirCliente @clienteAgregado="clienteAgregado" :arrayClienteProp="arrayClienteProp"
      :editarClienteProp="editarClienteProp" :regFiscalIdProp="regFiscalIdProp" />
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import AñadirCliente from "./AñadirCliente.vue";
import ListClientes from "./ListClientes.vue";
import Rules from "@/class/Rules";

const props = defineProps(["editarFacturaProp"]);

const appStore = storeApp();
const rules = new Rules();
const clienteClass = appStore.cliente;
const clienteForm: any = ref(null);
const emitter: any = inject('emitter');

let arrayCliente: any = ref([]);
let showCliente: any = ref(true);
let dialogCliente: any = ref(false);
let listClientesDialog: any = ref(false);
let desserts: any = ref([]);
let nombreRfc: any = ref() // MTV850101H72
let editarClienteProp: any = ref();
let regFiscalString: any = ref();
let regFiscalIdProp: any = ref();

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();
let arrayClienteProp: any = ref();
const itemsUsoCfdi: any = ref([]);

emitter.on('editarAct', (item: any) => {
  clienteClass.nombre = item.datosReceptor.nombre;
  clienteClass.rfc = item.datosReceptor.rfc;
  clienteClass.domicilioFiscal = item.datosReceptor.domicilioFiscal;
  clienteClass.regimenFiscal = item.datosReceptor.regimenFiscal;
});

emitter.on('emitReset', () => {
  clienteClass.nombre = null;
  clienteClass.rfc = null;
  clienteClass.domicilioFiscal = null;
  clienteClass.regimenFiscal = null;
  clienteClass.usoCfdi = null;
});

onMounted(() => {
  if (clienteClass.regimenFiscal != undefined) {
    getUsoCfdi(clienteClass.regimenFiscal);
    getRegimenFiscal(clienteClass.regimenFiscal)
  }
});

async function buscarPorNombreOrRfc() {
  await axios
    .get(appStore.link + "/Clientes/sinEmpresa/" + nombreRfc.value.toUpperCase())
    .then((response) => {
      if (response.data.length > 1) {
        listClientesDialog.value = true;
        desserts.value = response.data;
      } else {
        clienteClass.nombre = response.data[0].nombre;
        clienteClass.rfc = response.data[0].rfc;
        clienteClass.domicilioFiscal = response.data[0].domicilioFiscal;
        clienteClass.regimenFiscal = response.data[0].regimenFiscal;
        clienteClass.usoCfdi = response.data[0].usoCfdi;
      }
      nombreRfc.value = null;
    })
    .catch((e) => {
      mostrarSnack("error", "El cliente no existe, revise sus datos", 5000);
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
  let uso = clienteClass.usoCfdi;
  let obj = {
    nombre: clienteClass.nombre,
    rfc: clienteClass.rfc,
    domicilioFiscal: clienteClass.domicilioFiscal,
    regimenFiscal: reg[0],
    usoCfdi: uso,
  };
  return obj;
}

function ocultar() {
  showCliente.value = false;
}

function agregarCliente() {
  dialogCliente.value = true;
  editarClienteProp.value = null;
}

async function clienteAgregado(item: any) {
  dialogCliente.value = false;
  mostrarSnack("success", "El cliente se agrego correctamente", 5000);
  nombreRfc.value = item;
  await buscarPorNombreOrRfc();
  getUsoCfdi(clienteClass.regimenFiscal);
}

function emitClientes(item: any) {
  Object.assign(clienteClass, item);
  listClientesDialog.value = false;
  getUsoCfdi(clienteClass.regimenFiscal);
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  time = timeMensaje;
  snack.value = true;
}

function listaClientes() {
  listClientesDialog.value = true;
}

function editarCliente() {
  dialogCliente.value = true;
  editarClienteProp.value = clienteClass;
}

function getUsoCfdi(regFiscal: any) {
  let aux = null;
  if (regFiscal.includes(".-")) {
    let reg = regFiscal.split(".-")
    aux = reg[0];
  } else {
    aux = regFiscal;
  }
  axios
    .get(appStore.link + "/UsoCFDI/get/" + aux)
    .then((response) => {
      itemsUsoCfdi.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function titleAutoComplete(item: any) {
  return item.codigo + "-" + item.descripcion;
}

function getRegimenFiscal(regFiscal: any) {
  axios.get(appStore.link + "/RegimenFiscal/byCodigo/" + regFiscal)
    .then((response) => {
      clienteClass.regimenFiscal = response.data[0].codigo + ".- " + response.data[0].descripcion;
      regFiscalIdProp.value = response.data[0].id;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

defineExpose({
  ocultar,
  setDatosCliente,
});
</script>
