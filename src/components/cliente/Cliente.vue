<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex">
      Cliente
      <v-spacer></v-spacer>
      <v-icon :icon="showCliente ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showCliente = !showCliente"></v-icon>
    </v-card-title>
    <v-divider></v-divider>
    <v-expand-transition>
      <div class="mx-4 mt-4" v-show="showCliente">
        <v-form>
          <v-row no-gutters>
            <v-col cols="8" class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Nombre"
                v-model="clienteClass.nombre"></v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="RFC" v-model="clienteClass.rfc"></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Codigo Postal" append-inner-icon="mdi-magnify"
                @click:append-inner="buscaCodigoPostal" @keyup.enter="buscaCodigoPostal"
                v-model="clienteClass.idCodigoPostal">
              </v-text-field>
              <!-- <v-autocomplete variant="outlined" density="compact" label="Codigo Postal"></v-autocomplete> -->
            </v-col>
            <v-col class="pa-1">
              <v-text-field variant="outlined" density="compact" label="Estado" v-model="nombreEstado"
                readonly></v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Regimen Fiscal" :items="itemsRegimenFiscal"
                :item-title="titleAutoComplete" item-value="codigo"
                v-model="clienteClass.codRegimenFiscal"></v-autocomplete>
            </v-col>
            <v-col class="pa-1">
              <v-autocomplete variant="outlined" density="compact" label="Uso CFDI" :items="itemsUsoCfdi"
                :item-title="titleAutoComplete" item-value="codigo" v-model="clienteClass.codUsoCfdi"></v-autocomplete>
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
const clienteClass = appStore.cliente;

const itemsRegimenFiscal: any = ref([]);
const itemsUsoCfdi: any = ref([]);

let arrayCliente: any = ref([]);
let showCliente: any = ref(true);
let nombreEstado: any = ref();

onMounted(() => {
  getRegimenFiscal();
  getUsoCfdi();
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

function getUsoCfdi() {
  axios
    .get(appStore.link + "/UsoCFDI/get")
    .then((response) => {
      itemsUsoCfdi.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function buscaCodigoPostal() {
  // console.log(clienteClass.idCodPostal)
  axios
    .get(appStore.link + "/CodigoPostal/byId/" + clienteClass.idCodigoPostal)
    .then((response) => {
      nombreEstado.value = response.data[0].descripcion;
    })
    .catch((e) => {
      console.log("Fatal" + e);
    });
}

function setDatosCliente(){
  arrayCliente.value = clienteClass;
  return arrayCliente.value;
}

function ocultar(){
  showCliente.value = false
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

defineExpose({
  ocultar,
  setDatosCliente
})

</script>