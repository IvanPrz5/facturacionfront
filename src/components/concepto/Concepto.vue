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

let desserts: any = ref([]);
let desserts2: any = ref([]);
let conceptoClass: any = ref(appStore.concepto);
let showConcepto: any = ref(true);
let arrayConceptos: any = ref([]);
let editedIndex: any = ref(-1);

const emit = defineEmits(["setDatosConcepto", "closeEditarConcepto"]);

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
  axios.get(appStore.link + "/ClaveProdServ/byCod/" + conceptoClass.value.idClaveProdServ)
    .then((response) => {
      if(response.data.length > 1){
        desserts.value = response.data;
      }else{
        conceptoClass.value.claveProdServDesc = response.data[0].descripcion;
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
  if (editedIndex.value > -1) {
    Object.assign(arrayConceptos.value[editedIndex.value], /* {
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
    } */ conceptoClass.value);
    emit("closeEditarConcepto");
    editedIndex.value = -1;
  } else {
    arrayConceptos.value.push(conceptoClass.value
      /* idClaveProdServ: idClaveProdServ.value,
      claveProdServDesc: claveProdServDesc.value,
      idClaveUnidad: idClaveUnidad.value,
      unidad: unidad.value,
      cantidad: cantidad.value,
      idObjetoImp: idObjetoImp.value,
      valorUnitario: valorUnitario.value,
      importe: importe.value,
      descuento: descuento.value,
      descripcion: descripcion.value, */ 
    );
    emit("setDatosConcepto", arrayConceptos.value);
  }
}

function cargarDatos(item: any) {
  /* idClaveProdServ.value = item.idClaveProdServ;
  claveProdServDesc.value = item.claveProdServDesc;
  idClaveUnidad.value = item.idClaveUnidad;
  unidad.value = item.unidad;
  idObjetoImp.value = item.idObjetoImp;
  cantidad.value = item.cantidad;
  valorUnitario.value = item.valorUnitario;
  importe.value = item.importe;
  descuento.value = item.descuento;
  descripcion.value = item.descripcion; */
  editedIndex.value = arrayConceptos.value.indexOf(item);
  conceptoClass.value = Object.assign({}, item);
}


function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  cargarDatos,
})
</script>
