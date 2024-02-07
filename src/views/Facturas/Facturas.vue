<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="4">
        <v-text-field density="compact" variant="solo" label="Buscar" append-inner-icon="mdi-magnify"
          single-line></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="1">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props">
              <v-icon size="x-large">
                mdi-filter-menu
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn variant="text" block @click="getFacturas(0, true)">Timbradas</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" block @click="getFacturas(0, false)">Por Timbrar</v-btn>
            </v-list-item>
            <!-- <v-list-item>
              <v-btn variant="text" block @click="getFacturas(fechas)">Por Fechas</v-btn>
            </v-list-item> -->
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-card>
      <v-card-text>
        <v-data-table v-model:expanded="expanded" :page.sync="page" :headers="headers" :items="facturas"
          :loading="loading" :items-per-page="itemsPerPage" show-expand>
          <template v-slot:item.actions="{ item }">
            <!-- @vue-ignore -->
            <v-btn color="success" variant="tonal" rounded v-if="item.isTimbrado == false">
              <v-icon>
                mdi-bell
              </v-icon>
            </v-btn>
            <v-btn color="warning" variant="tonal" rounded v-else @click="cancelarFactura(item)">
              <v-icon>
                mdi-bell-cancel
              </v-icon>
            </v-btn>
          </template>
          <template v-slot:expanded-row="{ columns, item }">
            <!-- @vue-ignore -->
            <tr v-for="i in item.conceptosList">
              <td class="bg-blue-grey-lighten-4" :colspan="columns.length">
                <div class="d-flex">
                  <div>
                    Descripcion: {{ i.descripcion }} -
                  </div>
                  <div>
                    Valor Unitario: {{ i.valorUnitario }} -
                  </div>
                  <div>
                    Importe: {{ i.importe }} -
                  </div>
                  <div>
                    Descuento: {{ i.descuento }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <template v-slot:bottom>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount"></v-pagination>
            </div>
          </template>
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
      {{ msg }}
    </v-snackbar>
  </v-container>

</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();

const headers: any = ref([
  { title: "ID", key: "id" },
  { title: "Emisor", key: "idEmisor.nombre", sortable: false },
  { title: "Receptor", key: "idReceptor.nombre", sortable: false },
  // { title: "Fecha", key: "base" },
  { title: "Comprobante", key: "tipoComprobante" },
  { title: "SubTotal", key: "subTotal" },
  { title: "Descuento", key: "descuento" },
  { title: "Total", key: "total" },
  { title: "UUID", key: "uuid" },
  { title: "Actions", key: "actions", sortable: false, },
]);
let facturas: any = ref([]);
let expanded: any = ref([]);

let page: any = ref(1);
let totalElements: any = ref();
let totalPages: any = ref();
let itemsPerPage: any = ref(25);
let tipoConsulta: any = ref(true);

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

const pageCount = computed(() => {
  getFacturas(page.value - 1, tipoConsulta.value);
  return Math.ceil(totalElements.value / itemsPerPage.value);
});

let loading: any = ref(false);

async function getFacturas(pageNumber: any, tipo: any) {
  facturas.value = [];
  loading.value = true;
  tipoConsulta.value = tipo;
  await axios
    .get(appStore.link + "/Comprobante/" + tipo + "/" + appStore.empresa.id + "/pageable", {
      params: {
        page: page.value - 1,
        size: itemsPerPage.value,
      }
    })
    .then((response) => {
      setTimeout(() => {
        totalPages.value = response.data.totalPages;
        facturas.value = response.data.content;
        totalElements.value = response.data.totalElements;
        loading.value = false;
      }, 500);
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function cancelarFactura(item: any) {
  axios.post(appStore.link + "/Facturacion/cancelarXml", item)
  .then((response) => {
    if(response.data.status == 0){
      mostrarSnack("success", response.data.mensaje, 3000);
    }else{
      mostrarSnack("error", response.data.mensaje, 5000)
    }
  })
  .catch((e) => {
    console.log("Fatal " + e)
  })
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}
</script>
