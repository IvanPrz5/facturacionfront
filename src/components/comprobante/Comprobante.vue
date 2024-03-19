<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Comprobante
      <v-card-subtitle
        v-if="comprobanteClass.idTipoComprobante != null && comprobanteClass.idFormaPago != null && comprobanteClass.idMetodoPago != null"
        class="mt-2">
        Tipo: {{ comprobanteClass.idTipoComprobante }} ,
        Forma de Pago: {{ comprobanteClass.idFormaPago }} ,
        Metodo de Pago: {{ comprobanteClass.idMetodoPago }}
      </v-card-subtitle>
      <v-spacer></v-spacer>
      <!-- <v-btn @click="agregarConcepto" color="success">
        <v-icon size="x-large">mdi-plus</v-icon>
        <v-tooltip activator="parent" location="end">Agregar Concepto</v-tooltip>
      </v-btn> -->
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-icon :icon="showComprobante ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="showComprobante = !showComprobante"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showComprobante">
        <v-form ref="comprobanteForm" fast-fail @submit.prevent>
          <v-row no-gutters>
            <v-col cols="3" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tipo de Comprobante"
                :items="itemsTipoComprobante" :item-title="titleAutoComplete" item-value="codigo"
                v-model="comprobanteClass.idTipoComprobante" :rules="[rules.requerido]"></v-autocomplete>
            </v-col>
            <v-col cols="9" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Exportación" :items="itemsExportacion"
                :item-title="titleAutoComplete" item-value="codigo" v-model="comprobanteClass.idExportacion"
                :rules="[rules.requerido]"></v-autocomplete>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Forma de Pago" :items="itemsFormaPago"
                :item-title="titleAutoComplete" item-value="codigo" v-model="comprobanteClass.idFormaPago"
                :rules="[rules.requerido]"></v-autocomplete>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Metodo de Pago" :items="itemsMetodoPago"
                :item-title="titleAutoComplete" item-value="codigo" v-model="comprobanteClass.idMetodoPago"
                :rules="[rules.requerido]"></v-autocomplete>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Folio"
                v-model="comprobanteClass.folio"></v-text-field>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Serie"
                v-model="comprobanteClass.serie"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import Rules from "@/class/Rules";

const props = defineProps(["propsEditarFactura", "editarComprobanteProp"]);
const emit = defineEmits(["abrirConcepto"]);

const appStore = storeApp();
const rules = new Rules();
const comprobanteClass = appStore.comprobante;
const comprobanteForm: any = ref(null);
const itemsTipoComprobante: any = ref([]);
const itemsExportacion: any = ref([]);
const itemsFormaPago: any = ref([]);
const itemsMetodoPago: any = ref([]);
const emitter: any = inject('emitter');

let arrayComprobante: any = ref([]);
let showComprobante: any = ref(true);

emitter.on('editarAct', (item: any) => {
  comprobanteClass.idTipoComprobante = item.datosComprobante.idTipoComprobante;
  comprobanteClass.idExportacion = item.datosComprobante.idExportacion;
  comprobanteClass.idFormaPago = item.datosComprobante.idFormaPago;
  comprobanteClass.idMetodoPago = item.datosComprobante.idMetodoPago;
  if (item.datosComprobante.folio != null && item.datosComprobante.serie != null) {
    comprobanteClass.folio = item.datosComprobante.folio;
    comprobanteClass.serie = item.datosComprobante.serie;
  }
});

emitter.on('emitReset', () => {
  comprobanteClass.idTipoComprobante = null;
  comprobanteClass.idExportacion = null;
  comprobanteClass.idFormaPago = null;
  comprobanteClass.idMetodoPago = null;
  // if(item.datosComprobante.folio != null && item.datosComprobante.serie != null){
  comprobanteClass.folio = null;
  comprobanteClass.serie = null;
  // }
});

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
  axios.get(appStore.link + "/FormaPago/get")
    .then((response) => {
      itemsFormaPago.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getMetodoPago() {
  axios.get(appStore.link + "/MetodoPago/get")
    .then((response) => {
      itemsMetodoPago.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

async function setDatosComprobante() {
  const { valid } = await comprobanteForm.value.validate();
  if (valid) {
    comprobanteClass.lugarExpedicion = appStore.empresa.codPostal;
    arrayComprobante.value = comprobanteClass;
    return arrayComprobante.value;
  } else {
    return null;
  }
}

function agregarConcepto() {
  emit("abrirConcepto");
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  setDatosComprobante,
});
</script>