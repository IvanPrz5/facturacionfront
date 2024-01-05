<template>
    <v-card>
      <v-card-title class="bg-primary"> Aplicar Impuesto </v-card-title>
      <v-card-text class="mt-6">
        <v-form>
          <v-row no-gutters>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Impuesto" :items="itemsImpuesto"
                :item-title="titleAutoComplete" item-value="codigo" v-model="codImpuesto"></v-autocomplete>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tipo Factor" :items="itemsTipoFactor"
                item-title="codigo" item-value="codigo" v-model="codTipoFactor"></v-autocomplete>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tasa o Cuota" :items="itemsTasaCuota"
                item-title="descripcion" item-value="descripcion" v-model="codTasaCuota"></v-autocomplete>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-text-field ariant="outlined" density="compact" label="Importe"
                v-model="importe"></v-text-field>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-text-field ariant="outlined" density="compact" label="Base" v-model="base"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="red" @click="cerrarImpuesto">Cancelar</v-btn>
        <v-btn variant="tonal" color="success" @click="agregarImpuesto">Agregar</v-btn>
      </v-card-actions>
    </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();
const impuestoClass = appStore.impuesto;
const itemsImpuesto: any = ref([]);
const itemsTipoFactor: any = ref([]);
const itemsTasaCuota: any = ref([]);

let arrayImpuestos: any = ref([]);
let editedIndex: any = ref(-1);

const emit = defineEmits(["closeImpuesto", "closeEditarImpuesto", "datosImpuesto"]);

onMounted(() => {
  getImpuesto();
  getTipoFactor();
  getTasaCuota();
})

let codImpuesto: any = ref();
let codTipoFactor: any = ref();
let codTasaCuota: any = ref();
let importe: any = ref();
let base: any = ref();


function getImpuesto() {
  axios.get(appStore.link + "/Impuesto/get")
    .then((response) => {
      itemsImpuesto.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getTipoFactor() {
  axios.get(appStore.link + "/TipoFactor/get")
    .then((response) => {
      itemsTipoFactor.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getTasaCuota() {
  axios.get(appStore.link + "/TasaoCuota/get")
    .then((response) => {
      itemsTasaCuota.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function agregarImpuesto() {
  let impuestoArr = objetoImpuesto();
  emit("datosImpuesto", impuestoArr);
  emit("closeImpuesto")
}

function objetoImpuesto() {
  if (editedIndex.value > -1) {
    console.log(editedIndex.value);
    Object.assign(arrayImpuestos.value[editedIndex.value], {
      codImpuesto: codImpuesto.value,
      codTipoFactor: codTipoFactor.value,
      codTasaCuota: codTasaCuota.value,
      base: base.value,
      importe: importe.value
    })
    emit("closeImpuesto")
    editedIndex.value = -1;
  } else {
    arrayImpuestos.value.push({
      codImpuesto: codImpuesto.value,
      codTipoFactor: codTipoFactor.value,
      codTasaCuota: codTasaCuota.value,
      base: base.value,
      importe: importe.value
    });

    return arrayImpuestos.value;
  }
}

function cargarDatosImpuesto(item: any) {
  codImpuesto.value = item.codImpuesto;
  codTipoFactor = item.codTipoFactor;
  codTasaCuota = item.codTasaCuota;
  importe = item.base;
  base = item.importe;
  editedIndex.value = arrayImpuestos.value.indexOf(item);
  console.log("Entro");
}

function cerrarImpuesto() {
  emit("closeImpuesto");
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  cargarDatosImpuesto,
})
</script>
