<template>
  <v-container>
    <v-card>
      <v-row no-gutters>
        <v-col cols="3" class="pa-1">
          <v-select density="compact" label="Tipo" :items="tipoItems" item-title="descripcion" item-value="status"
            v-model="tipo" @update:model-value="getDivision"></v-select>
        </v-col>
        <v-col cols="3" class="pa-1">
          <v-select density="compact" label="Division" :items="divisionItems" item-title="descripcion" v-model="division"
            item-value="clave" @update:model-value="getGrupos"></v-select>
        </v-col>
        <v-col cols="3" class="pa-1">
          <v-select density="compact" label="Grupo" :items="gruposItems" item-title="descripcion" v-model="grupo"
            item-value="clave" @update:model-value="getClases"></v-select>
        </v-col>
        <v-col cols="3" class="pa-1">
          <v-select density="compact" label="Clase" :items="claseItems" item-title="descripcion" v-model="clase"
            item-value="codigo"></v-select>
        </v-col>
        <v-col class="d-flex" cols="12">
          <div>
            <label>O puedes buscar por palabra o clave</label>
            <v-text-field density="compact"></v-text-field>
          </div>
          <div>
            <v-btn color="indigo" @click="buscarProductos">Buscar</v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table v-model:page="page" :items-per-page="itemsPerPage" :items="desserts" :headers="headers">
            <template v-slot:item.actions="{ item }">
              <v-btn size="small" color="success" @click="selecItem(item)">
                <v-icon size="medium"> mdi-check </v-icon>
              </v-btn>
            </template>
            <template v-slot:bottom>
              <div class="text-center pt-2">
                <v-pagination v-model="page" :length="pageCount"></v-pagination>
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { storeApp } from "@/store/app";

const appStore = storeApp();
const headers: any = ref([
  {
    title: "Codigo",
    key: "codigo",
  },
  {
    title: "Descripcion",
    key: "descripcion",
  },
  {
    title: "Palabras Similares",
    key: "palabrasSimilares"
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]);
let desserts: any = ref([]);

let tipoItems: any = ref([
  {
    descripcion: "Productos",
    status: true
  },
  {
    descripcion: "Servicios",
    status: false
  }
]);
let divisionItems: any = ref([]);
let gruposItems: any = ref([]);
let claseItems: any = ref([]);

let tipo: any = ref();
let division: any = ref();
let grupo: any = ref();
let clase: any = ref();
let divGrup: any = ref([]);

let page: any = ref(1);
let itemsPerPage: any = ref(50);

const pageCount = computed(() => {
  return Math.ceil(desserts.value.length / itemsPerPage.value);
});

onMounted(() => {
  // getDivision();
});

function getDivision() {
  divisionItems.value = [];
  division.value = null;
  gruposItems.value = []
  grupo.value = null;
  claseItems.value = [];
  clase.value = null;

  axios.get(appStore.link + "/ClaveProdServ/division/" + tipo.value)
    .then((response) => {
      divisionItems.value = response.data;
    })
    .catch((e) => {
      console.log(e)
    })
}

function getGrupos() {
  gruposItems.value = []
  grupo.value = null;
  claseItems.value = [];
  clase.value = null;
  axios.get(appStore.link + "/ClaveProdServ/grupos/" + division.value)
    .then((response) => {
      gruposItems.value = response.data
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function getClases() {
  claseItems.value = [];
  clase.value = null;
  divGrup.value = division.value + grupo.value;
  axios.get(appStore.link + "/ClaveProdServ/clase/" + divGrup.value)
    .then((response) => {
      claseItems.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function buscarProductos() {
  let aux = clase.value.substring(4, 6)
  let final = divGrup.value + aux;
  axios.get(appStore.link + "/ClaveProdServ/productos/" + final.toString())
    .then((response) => {
      desserts.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
}

function selecItem(item: any) {
  console.log(item);
}
</script>
