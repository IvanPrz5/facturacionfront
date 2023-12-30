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
                v-model="idClaveProdServ" @keyup.enter="getClaveProdServ"></v-text-field>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Producto o Servicio" v-model="claveProdServDesc"
                readonly></v-text-field>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Clave Unidad" @keyup.enter="getClaveUnidad"
                v-model="idClaveUnidad"></v-text-field>
            </v-col>
            <v-col cols="3" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Unidad" v-model="unidad" readonly></v-text-field>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Objeto Impuesto" :items="itemsObjetoImp"
                :item-title="titleAutoComplete" item-value="codigo" v-model="idObjetoImp"></v-autocomplete>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Cantidad" v-model="cantidad"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Valor Unitario"
                v-model="valorUnitario"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Importe" v-model="importe"></v-text-field>
            </v-col>
            <v-col cols="2" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Descuento" v-model="descuento"></v-text-field>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea variant="outlined" label="Descripcion" rows="3" counter no-resize
                v-model="descripcion"></v-textarea>
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
const conceptoClass = appStore.concepto;
const itemsObjetoImp: any = ref([]);

let showConcepto: any = ref(true);
let arrayConceptos: any = ref([]);
let editedIndex: any = ref(-1);

const emit = defineEmits(["closeConcepto", "closeEditarConcepto"]);

let idClaveProdServ: any = ref();
let claveProdServDesc: any = ref();
let idClaveUnidad: any = ref();
let unidad: any = ref();
let cantidad: any = ref();
let idObjetoImp: any = ref();
let valorUnitario: any = ref();
let importe: any = ref();
let descuento: any = ref();
let descripcion: any = ref();

onMounted(() => {
  getObjetoImp();
})

function getClaveProdServ() {
  axios.get(appStore.link + "/ClaveProdServ/byCod/" + idClaveProdServ.value)
    .then((response) => {
      claveProdServDesc.value = response.data[0].descripcion;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getClaveUnidad() {
  axios.get(appStore.link + "/ClaveUnidad/byId/" + idClaveUnidad.value)
    .then((response) => {
      console.log(response.data)
      unidad.value = response.data[0].descripcion;
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
  if (editedIndex.value > -1) {
    Object.assign(arrayConceptos.value[editedIndex.value], {
      idClaveProdServ: idClaveProdServ.value,
      claveProdServDesc: claveProdServDesc.value,
      idClaveUnidad: idClaveUnidad.value,
      unidad: unidad.value,
      cantidad: cantidad.value,
      idObjetoImp: idObjetoImp.value,
      valorUnitario: valorUnitario.value,
      importe: importe.value,
      descuento: descuento.value,
      descripcion: descripcion.value,
    });
    emit("closeEditarConcepto");
    editedIndex.value = -1;
  } else {
    arrayConceptos.value.push({
      idClaveProdServ: idClaveProdServ.value,
      claveProdServDesc: claveProdServDesc.value,
      idClaveUnidad: idClaveUnidad.value,
      unidad: unidad.value,
      cantidad: cantidad.value,
      idObjetoImp: idObjetoImp.value,
      valorUnitario: valorUnitario.value,
      importe: importe.value,
      descuento: descuento.value,
      descripcion: descripcion.value, 
    });
    emit("closeConcepto", arrayConceptos.value);
  }
}

function cargarDatos(item: any) {
  idClaveProdServ.value = item.idClaveProdServ;
  claveProdServDesc.value = item.claveProdServDesc;
  idClaveUnidad.value = item.idClaveUnidad;
  unidad.value = item.unidad;
  idObjetoImp.value = item.idObjetoImp;
  cantidad.value = item.cantidad;
  valorUnitario.value = item.valorUnitario;
  importe.value = item.importe;
  descuento.value = item.descuento;
  descripcion.value = item.descripcion;

  editedIndex.value = arrayConceptos.value.indexOf(item);

}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  cargarDatos,
})
</script>
