<template>
  <v-card>
    <v-card-title class="bg-primary">
      Selecciona el Producto o Servicio
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-col cols="10">
            <v-text-field variant="outlined" density="compact" placeholder="Buscar en los resultados" v-model="search"
              append-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-data-table :headers="headers" :items="desserts" :search="search">
              <template v-slot:item.actions="{ item }">
                <v-btn size="small" color="success" @click="selecItem(item)">
                  <v-icon size="medium"> mdi-check </v-icon>
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

const props = defineProps(["listClaveProdServDesc"]);
const emit = defineEmits(["emitClaveProdServ"]);

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
let search: any = ref("");

onMounted(() => {
  desserts.value = props.listClaveProdServDesc;
});

function selecItem(item: any) {
  emit("emitClaveProdServ", item);
}

</script>


