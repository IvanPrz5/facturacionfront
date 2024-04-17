<template>
  <v-card>
    <v-card-title class="bg-primary"> Selecciona la unidad </v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="8">
            <v-text-field variant="outlined" density="compact" placeholder="Buscar en los resultados" v-model="search"
              append-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table v-model:page="page" :items-per-page="itemsPerPage" :headers="headers" :items="desserts" :search="search">
              <template v-slot:item.actions="{ item }">
                <v-btn size="small" color="success" @click="selecItem(item)">
                  <v-icon size="medium"> mdi-check </v-icon>
                  <v-tooltip activator="parent" location="start">Seleccionar</v-tooltip>
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

const props = defineProps(["listClaveProdServDesc"]);
const emit = defineEmits(["emitClaveUnidad"]);

const headers: any = ref([
  {
    title: "Codigo",
    key: "codigo",
  },
  {
    title: "Nombre",
    key: "descripcion",
  },
  {
    title: "Descripcion",
    key: "nombre",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
]);
let desserts: any = ref([]);
let search: any = ref("");

let page: any = ref(1);
let itemsPerPage: any = ref(50);

const pageCount = computed(() => {
  return Math.ceil(desserts.value.length / itemsPerPage.value);
});

onMounted(() => {
  desserts.value = props.listClaveProdServDesc;
});

function selecItem(item: any) {
  emit("emitClaveUnidad", item);
}
</script>
