<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Concepto
      <v-spacer></v-spacer>
      <v-icon :icon="showConcepto ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showConcepto = !showConcepto"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showConcepto">
        <v-form>
          <v-row no-gutters>
            <v-col cols="3" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Clave de Producto o Servicio"
                v-model="conceptoClass.idClaveProdServ" @keyup.enter="getClaveProdServ"></v-text-field>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Producto o Servicio" v-model="conceptoClass.claveProdServDesc"
                :items="desserts" item-title="descripcion"></v-autocomplete>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Clave Unidad" @keyup.enter="getClaveUnidad"
                v-model="conceptoClass.idClaveUnidad"></v-text-field>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Unidad" v-model="conceptoClass.unidad"
              :items="desserts2"></v-autocomplete>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Objeto Impuesto" :items="itemsObjetoImp"
                :item-title="titleAutoComplete" item-value="codigo" v-model="conceptoClass.idObjetoImp"></v-autocomplete>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Cantidad" v-model="conceptoClass.cantidad"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Valor Unitario"
                v-model="conceptoClass.valorUnitario"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Importe" v-model="conceptoClass.importe"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Descuento" v-model="conceptoClass.descuento"></v-text-field>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea variant="outlined" label="Descripcion" rows="3" counter no-resize
                v-model="conceptoClass.descripcion"></v-textarea>
            </v-col>
            <v-col cols="12 mb-6">
              <v-btn variant="tonal" block color="primary" @click="agregarConcepto">
                Agregar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-expand-transition>
    <!-- <v-card-actions>
      <v-btn variant="tonal" block color="primary" @click="agregarConcepto">
        Agregar
      </v-btn>
    </v-card-actions> -->
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();
const itemsObjetoImp: any = ref([]);
const conceptoClass = appStore.concepto;

let desserts: any = ref([]);
let desserts2: any = ref([]);
let showConcepto: any = ref(true);
let arrayConceptos: any = ref([]);
let editedIndex: any = ref(-1);

const emit = defineEmits(["setDatosConcepto", "closeConcepto"]);

onMounted(() => {
  getObjetoImp();
})

function getClaveProdServ() {
  axios.get(appStore.link + "/ClaveProdServ/byCod/" + conceptoClass.idClaveProdServ)
    .then((response) => {
      if(response.data.length > 1){
        desserts.value = response.data;
      }else{
        conceptoClass.claveProdServDesc = response.data[0].descripcion;
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getClaveUnidad() {
  axios.get(appStore.link + "/ClaveUnidad/byId/" + conceptoClass.idClaveUnidad)
    .then((response) => {
      if(response.data.length > 1){
        desserts2.value = response.data;
      }else{
        conceptoClass.unidad = response.data[0].descripcion;
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getObjetoImp() {
  axios.get(appStore.link + "/ObjetoImp/get")
    .then((response) => {
      itemsObjetoImp.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function agregarConcepto() {
  let obj = objetoConcepto();
  if (editedIndex.value > -1) {
    Object.assign(arrayConceptos.value[editedIndex.value], obj);
    emit("closeConcepto");
    editedIndex.value = -1;
  } else {
    arrayConceptos.value.push(obj);
    emit("setDatosConcepto", arrayConceptos.value);
  }
}

function cargarDatos(item: any) {
  conceptoClass.idClaveProdServ = item.idClaveProdServ;
  conceptoClass.claveProdServDesc = item.claveProdServDesc;
  conceptoClass.idClaveUnidad = item.idClaveUnidad;
  conceptoClass.unidad = item.unidad;
  conceptoClass.idObjetoImp = item.idObjetoImp;
  conceptoClass.cantidad = item.cantidad;
  conceptoClass.valorUnitario = item.valorUnitario;
  conceptoClass.importe = item.importe;
  conceptoClass.descuento = item.descuento;
  conceptoClass.descripcion = item.descripcion;
  editedIndex.value = arrayConceptos.value.indexOf(item);
}

function objetoConcepto(){
  let obj = {
    idClaveProdServ: conceptoClass.idClaveProdServ,
    claveProdServDesc: conceptoClass.claveProdServDesc,
    idClaveUnidad: conceptoClass.idClaveUnidad,
    unidad: conceptoClass.unidad,
    cantidad: conceptoClass.cantidad,
    idObjetoImp: conceptoClass.idObjetoImp,
    valorUnitario: conceptoClass.valorUnitario,
    importe: conceptoClass.importe,
    descuento: conceptoClass.descuento,
    descripcion: conceptoClass.descripcion, 
  }
  return obj;
}


function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  cargarDatos,
})
</script>
