<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Comprobante
      <v-spacer></v-spacer>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn @click="agregarConcepto">Añadir Concepto</v-btn>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-icon :icon="showComprobante ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="showComprobante = !showComprobante"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showComprobante">
        <v-form>
          <v-row no-gutters>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tipo de Comprobante"
                :items="itemsTipoComprobante" :item-title="titleAutoComplete" item-value="codigo"
                v-model="comprobanteClass.idTipoComprobante"></v-autocomplete>
            </v-col>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Exportación" :items="itemsExportacion"
                :item-title="titleAutoComplete" item-value="codigo"
                v-model="comprobanteClass.idExportacion"></v-autocomplete>
            </v-col>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Forma de Pago" :items="itemsFormaPago"
                :item-title="titleAutoComplete" item-value="codigo"
                v-model="comprobanteClass.idFormaPago"></v-autocomplete>
            </v-col>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Metodo de Pago" :items="itemsMetodoPago"
                :item-title="titleAutoComplete" item-value="codigo"
                v-model="comprobanteClass.idMetodoPago"></v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();
const comprobanteClass = appStore.comprobante;

const emit = defineEmits(["abrirConcepto"]);

const itemsTipoComprobante: any = ref([]);
const itemsExportacion: any = ref([]);
const itemsFormaPago: any = ref([]);
const itemsMetodoPago: any = ref([]);

let arrayComprobante: any = ref([]);
let showComprobante: any = ref(true);

onMounted(() => {
  getTipoComprobante();
  getExportacion();
  getFormaPago();
  getMetodoPago();
});

function getTipoComprobante() {
  axios
    .get(appStore.link + "/TipoComprobante/get")
    .then((response) => {
      itemsTipoComprobante.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getExportacion() {
  axios
    .get(appStore.link + "/Exportacion/get")
    .then((response) => {
      itemsExportacion.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getFormaPago() {
  axios
    .get(appStore.link + "/FormaPago/get")
    .then((response) => {
      itemsFormaPago.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getMetodoPago() {
  axios
    .get(appStore.link + "/MetodoPago/get")
    .then((response) => {
      itemsMetodoPago.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function setDatosComprobante(){
  arrayComprobante.value = comprobanteClass;
  return arrayComprobante.value;
}

function agregarConcepto() {
  emit("abrirConcepto");
  // showConcepto.value = true;
  // showCliente.value = false;
  // showListConceptos.value = true;
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  setDatosComprobante,
});
</script>