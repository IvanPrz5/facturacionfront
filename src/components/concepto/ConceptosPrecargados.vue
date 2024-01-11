<template>
  <v-card>
    <v-card-title class="bg-primary">Aplicar Concepto</v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="3">
            <v-text-field variant="solo" density="compact" placeholder="Buscar" v-model="search" append-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table :headers="headers" :items="desserts" :search="search">
              <template v-slot:item.actions="{ item }">
                <v-btn size="small" color="success" @click="selecItem(item)">
                  <v-icon size="medium">
                    mdi-check
                  </v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();
const emit = defineEmits(["emitConceptoPre"]);

const headers: any = ref([
  {
    title: "Clave -- Producto o Servicio",
    key: "idClaveProdServ"
  },
  {
    title: "Clave -- Unidad",
    key: "idClaveUnidad"
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false
  }
]);
let desserts: any = ref([]);
let search: any = ref("");

onMounted(() => {
  // desserts.value = props.listClaveProdServDesc;
  getConceptosPrecargados();
})

function getConceptosPrecargados(){
  axios.get(appStore.link + "/ConceptosPrecargados/all")
  .then((response) => {
    console.log(response.data)
    desserts.value = response.data;
  })
  .catch((e) => {
    console.log("Fatal " + e)
  })
}

function selecItem(item: any) {
  emit("emitConceptoPre", item)
}
</script>
