<template>
  <v-card>
    <v-card-title class="bg-primary">
      Selecciona el Cliente
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="8">
            <v-text-field variant="outlined" density="compact" placeholder="Buscar" v-model="search"
              append-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table :headers="headers" :items="desserts" :search="search">
              <template v-slot:item.actions="{ item }">
                <v-btn class="mr-2" size="small" color="success" @click="selecItem(item)">
                  <v-icon size="medium"> mdi-check </v-icon>
                  <v-tooltip activator="parent" location="bottom">Seleccionar</v-tooltip>
                </v-btn>
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
import { ref, onMounted } from "vue";
import axios from "axios";
import { storeApp } from "@/store/app";

const props = defineProps(["listClientes"]);
const emit = defineEmits(["emitClientes"]);

const appStore = storeApp();
const headers: any = ref([
  {
    title: "Nombre",
    key: "nombre",
  },
  {
    title: "RFC",
    key: "rfc",
  },
  {
    title: "Regimen Fiscal",
    key: "regimenFiscal",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]);
let desserts: any = ref([]);
let search: any = ref("");

onMounted(() => {
  if(props.listClientes.length > 0){
    desserts.value = props.listClientes;
  }else{
    getClientesByEmpresa();
  }
});

function selecItem(item: any) {
  emit("emitClientes", item);
}

function getClientesByEmpresa(){
  axios.get(appStore.link + "/Clientes/byEmpresa/" + appStore.empresa.id)
  .then((response) => {
    desserts.value = response.data;
  })
  .catch((e) => {
    console.log("Fatal " + e)
  })

}
</script>
