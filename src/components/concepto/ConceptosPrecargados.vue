<template>
  <v-card>
    <v-card-title class="bg-primary">Aplicar Concepto</v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="10">
            <v-text-field variant="outlined" density="compact" placeholder="Buscar" v-model="search" append-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table v-model:page="page" :items-per-page="itemsPerPage" v-model:expanded="expanded" :headers="headers" :items="desserts" :search="search" show-expand>
              <template v-slot:expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length">
                    <div class="d-flex">
                      <div>
                        <!-- @vue-skip -->
                        {{ item.idClaveProdServ }}
                      </div>
                      <v-divider class="mx-4" inset vertical></v-divider>
                      <div>
                        <!-- @vue-skip -->
                        {{ item.idClaveUnidad }}
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn size="small" color="success" @click="selecItem(item)">
                  <v-icon size="medium">
                    mdi-check
                  </v-icon>
                </v-btn>
              </template>
              <template v-slot:bottom>
                <div class="text-center pt-2">
                  <v-pagination
                    v-model="page"
                    :length="pageCount"
                  ></v-pagination>
                </div>
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
import { computed } from "vue";

const appStore = storeApp();
const emit = defineEmits(["emitConceptoPre"]);

const headers: any = ref([
  {
    title: "ID",
    key: "id"
  },
  {
    title: "Descripcion",
    key: "descripcion"
  },
  {
    title: "Valor Unitario",
    key: "valorUnitario"
  },
  {
    title: "Cantidad",
    key: "cantidad"
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false
  }
]);
let desserts: any = ref([]);
let search: any = ref("");
let expanded: any = ref([]);

let page: any = ref(1);
let itemsPerPage: any = ref(10);

const pageCount = computed(() => {
  return Math.ceil(desserts.value.length / itemsPerPage.value);
})

onMounted(() => {
  getConceptosPrecargados();
})

function getConceptosPrecargados(){
  axios.get(appStore.link + "/ConceptosPrecargados/all/" + appStore.empresa.id)
  .then((response) => {
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
