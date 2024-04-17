<template>
  <v-card>
    <v-card-title class="bg-primary d-flex">
      Selecciona el Producto o Servicio
      <v-spacer></v-spacer>
      <v-divider class="mx-4" inset vertical></v-divider>
      <!-- <v-btn color="success" @click="mostrarBusqueda"> Mostrar Busqueda </v-btn> -->
    </v-card-title>
    <v-card-text v-if="!props.propBusquedaAvanzada && mostrarBtn == true">
      <v-btn color="indigo" @click="mostrarBusqueda">Si no tu producto
        no aparece haz click aqui</v-btn>
    </v-card-text>
    <v-card-text v-if="busquedaAvanzada || props.propBusquedaAvanzada">
      <v-form ref="busquedaForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12">
            En esta herramienta podrás identificar la clave del producto o
            servicio que deseas facturar; para hacerlo deberás seleccionar el
            Tipo, posteriormente la División, enseguida el Grupo, y por último la
            Clase; dar clic en Buscar y obtendrás las claves asociadas.
          </v-col>
        </v-row>
        <v-row no-guttes>
          <v-col cols="3" class="pa-1">
            <v-select density="compact" label="Tipo" :items="tipoItems" item-title="descripcion" item-value="status"
              v-model="tipo" ></v-select>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-select density="compact" label="Division" :items="divisionItems" item-title="descripcion"
              v-model="division" item-value="clave" @click="getDivision"></v-select>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-select density="compact" label="Grupo" :items="gruposItems" item-title="descripcion" v-model="grupo"
              item-value="clave"  @click="getGrupos" ></v-select>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-select density="compact" label="Clase" :items="claseItems" item-title="descripcion" v-model="clase"
              item-value="codigo" @click="getClases"></v-select>
          </v-col>
          <v-col class="d-flex" cols="12">
            <div>
              <label>O puedes buscar por palabra o clave</label>
              <v-text-field density="compact" v-model="clavePalabra"></v-text-field>
            </div>
            <div style="display: flex; align-items: center; padding-left: 50px">
              <v-btn color="indigo" @click="buscarProductos">Buscar</v-btn>
            </div>
            <div style="display: flex; align-items: center; padding-left: 50px">
              <v-btn color="purple" @click="limpiarResultados">Limpiar resultados</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-text v-if="desserts.length > 0">
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="10">
            <v-text-field variant="outlined" density="compact" placeholder="Buscar en los resultados" v-model="search"
              append-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table v-model:page="page" :items-per-page="itemsPerPage" :headers="headers" :items="desserts" :search="search">
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
            <!-- <v-pagination></v-pagination> -->
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { storeApp } from "@/store/app";

const props = defineProps(["listClaveProdServDesc", "propBusquedaAvanzada"]);
const emit = defineEmits(["emitClaveProdServ"]);

const busquedaForm: any = ref(null);
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
    key: "palabrasSimilares",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]);
let desserts: any = ref([]);
let search: any = ref("");

let tipoItems: any = ref([
  {
    descripcion: "Productos",
    status: true,
  },
  {
    descripcion: "Servicios",
    status: false,
  },
]);

let divisionItems: any = ref([]);
let gruposItems: any = ref([]);
let claseItems: any = ref([]);

let tipo: any = ref();
let division: any = ref();
let grupo: any = ref();
let clase: any = ref();
let divGrup: any = ref(null);
let clavePalabra: any = ref();

let page: any = ref(1);
let itemsPerPage: any = ref(50);
let busquedaAvanzada: any = ref(false);
let mostrarBtn: any = ref(true);

const pageCount = computed(() => {
  return Math.ceil(desserts.value.length / itemsPerPage.value);
});

onMounted(() => {
  if(props.propBusquedaAvanzada){
    desserts.value = [];
  }else{
    desserts.value = props.listClaveProdServDesc;
  }
});

function selecItem(item: any) {
  emit("emitClaveProdServ", item);
}

function getDivision() {
  divisionItems.value = [];
  division.value = null;
  gruposItems.value = [];
  grupo.value = null;
  claseItems.value = [];
  clase.value = null;

  if(tipo.value != undefined){
    axios
    .get(appStore.link + "/ClaveProdServ/division/" + tipo.value)
    .then((response) => {
      divisionItems.value = response.data;
    })
    .catch((e) => {
      console.log(e);
    });
  }
}

function getGrupos() {
  gruposItems.value = [];
  grupo.value = null;
  claseItems.value = [];
  clase.value = null;

  if(division.value != undefined){
    axios
    .get(appStore.link + "/ClaveProdServ/grupos/" + division.value)
    .then((response) => {
      gruposItems.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
  }
}

function getClases() {
  claseItems.value = [];
  clase.value = null;
  divGrup.value = division.value + grupo.value;

  if(divGrup.value != undefined){
    axios
    .get(appStore.link + "/ClaveProdServ/clase/" + divGrup.value)
    .then((response) => {
      claseItems.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
  }
}

function buscarProductos() {
  let aux = null;
  let final = null;
  if (clase.value != null) {
    aux = clase.value.substring(4, 6);
    final = divGrup.value + aux;
  } else {
    final = division.value + grupo.value;
  }
  let ruta = "/ClaveProdServ/productos/" + final;
  
  if(clavePalabra.value != undefined){
    ruta = "/ClaveProdServ/byCod/" + clavePalabra.value
  }

  if(final.length > 0 || clavePalabra.value != undefined){
    axios
    .get(appStore.link + ruta)
    .then((response) => {
      desserts.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
  }
}

function mostrarBusqueda() {
  busquedaAvanzada.value = true;
  desserts.value = [];
  mostrarBtn.value = false;
}

function limpiarResultados() {
  try {
    desserts.value = [];
    busquedaForm.value.reset();
  } catch (error) {
  }
}
</script>
