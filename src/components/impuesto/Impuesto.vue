<template>
    <v-card>
      <v-card-title class="bg-primary"> Aplicar Impuesto </v-card-title>
      <v-card-text class="mt-6">
        <v-form>
          <v-row no-gutters>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Impuesto" :items="itemsImpuesto"
                :item-title="titleAutoComplete" item-value="codigo" v-model="impuestoClass.codImpuesto"></v-autocomplete>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tipo Factor" :items="itemsTipoFactor"
                item-title="codigo" item-value="codigo" v-model="impuestoClass.codTipoFactor"></v-autocomplete>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Tasa o Cuota" :items="itemsTasaCuota"
                item-title="descripcion" item-value="descripcion" v-model="impuestoClass.codTasaCuota"></v-autocomplete>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-text-field ariant="outlined" density="compact" label="Importe"
                v-model="impuestoClass.importe"></v-text-field>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-text-field ariant="outlined" density="compact" label="Base" v-model="impuestoClass.base"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- <v-btn variant="tonal" color="red" @click="cerrarImpuesto">Cancelar</v-btn> -->
        <v-btn variant="tonal" block color="success" @click="agregarImpuesto"> {{ btnText }} </v-btn>
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

let btnText: any = ref("Agregar");

const props = defineProps(["propImpuesto"]);  
const emit = defineEmits(["closeImpuesto", "actualizarImpuesto", "setDatosImpuesto"]);

onMounted(() => {
  if(props.propImpuesto != null){
    btnText.value = "Editar"
    cargarDatos();
  }
  getImpuesto();
  getTipoFactor();
  getTasaCuota();
})

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
  let obj =  objetoImpuesto();
  if (props.propImpuesto != null) {
    emit("closeImpuesto");
    emit("actualizarImpuesto", obj)
  } else {
    emit("setDatosImpuesto", obj)
  }
}

function cargarDatos() {
  impuestoClass.codImpuesto = props.propImpuesto.codImpuesto;
  impuestoClass.codTipoFactor = props.propImpuesto.codTipoFactor;
  impuestoClass.codTasaCuota = props.propImpuesto.codTasaCuota;
  impuestoClass.importe = props.propImpuesto.base;
  impuestoClass.base = props.propImpuesto.importe;
}

function objetoImpuesto(){
  let obj = {
    codImpuesto: impuestoClass.codImpuesto,
    codTipoFactor: impuestoClass.codTipoFactor,
    codTasaCuota: impuestoClass.codTasaCuota,
    base: impuestoClass.base,
    importe: impuestoClass.importe
  }

  return obj;
}

function cerrarImpuesto() {
  emit("closeImpuesto");
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  cargarDatos,
})
</script>
