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
              <v-icon size="x-large"> mdi-filter-menu </v-icon>
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
    <v-card elevation="10">
      <v-card-text>
        <v-data-table v-model:expanded="expanded" :page.sync="page" :headers="headers" :items="facturas"
          :loading="loading" :items-per-page="itemsPerPage" show-expand>
          <template v-slot:item.tipoComprobante="{ value }">
            <v-chip :color="getColor(value)">
              {{ value }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <!-- @vue-ignore -->
            <div v-if="item.isTimbrado == false">
              <v-btn class="mr-2" color="success" variant="tonal" @click="confirmarTimbrar(item)">
                <v-icon size="large"> mdi-bell </v-icon>
              </v-btn>
              <v-btn variant="tonal" color="indigo" @click="editarFactura(item)">
                <v-icon size="large"> mdi-pencil </v-icon>
              </v-btn>
            </div>
            <div v-else>
              <v-btn class="mr-2" color="red-lighten-1" variant="tonal" @click="confirmaCancelar(item)">
                <v-icon size="large"> mdi-bell-cancel </v-icon>
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn variant="tonal" color="purple-lighten-3" v-bind="props">
                    <v-icon size="large"> mdi-dots-vertical </v-icon>
                  </v-btn>
                </template>
                <v-list :lines="false">
                  <v-list-item>
                    <v-btn color="green" prepend-icon="mdi-file-pdf-box" @click="descargarPdf(item)">PDF</v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn color="blue" prepend-icon="mdi-file-xml-box" @click="descargarXml(item)">XML</v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn color="purple" prepend-icon="mdi-qrcode" @click="descargarCvv(item)">CVV</v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
          <template v-slot:expanded-row="{ columns, item }">
            <!-- @vue-ignore -->
            <tr v-for="i in item.conceptosList">
              <td class="bg-grey-lighten-3" :colspan="columns.length">
                <div class="d-flex">
                  <div>Descripcion: {{ i.descripcion }} -</div>
                  <div>Valor Unitario: {{ i.valorUnitario }} -</div>
                  <div>Importe: {{ i.importe }} -</div>
                  <div>Descuento: {{ i.descuento }}</div>
                  <!-- <div> -->
                  <!-- {{ i.trasladoList }} -->
                  <!-- </div> -->
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
    <v-dialog v-model="dialogCancelarXml">
      <v-sheet elevation="12" max-width="600" rounded="lg" width="100%" class="pa-4 text-center mx-auto">
        <v-icon class="mb-5" :color="colorBtn" icon="mdi-alert-decagram-outline" size="112"></v-icon>
        <h2 class="text-h5 mb-6">{{ btnText }} ?</h2>
        <p class="mb-4 text-medium-emphasis text-body-4">
          {{ itemCancelar.uuid }}
        </p>
        <v-divider class="mb-4"></v-divider>
        <div class="text-end">
          <v-btn :color="colorBtn" @click="cancelarTimbrarFactura">
            {{ btnText }}
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

const appStore = storeApp();

const headers: any = ref([
  { title: "ID", key: "id" },
  // { title: "Emisor", key: "idEmisor.nombre", sortable: false },
  { title: "Receptor", key: "idReceptor.nombre", sortable: false },
  { title: "Fecha", key: "fecha" },
  { title: "Comprobante", key: "tipoComprobante", align: "center" },
  { title: "SubTotal", key: "subTotal", align: "center" },
  { title: "Descuento", key: "descuento", align: "center" },
  { title: "Total", key: "total", align: "center" },
  { title: "UUID", key: "uuid" },
  { title: "Actions", key: "actions", sortable: false },
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

let dialogCancelarXml: any = ref(false);
let itemCancelar: any = ref();
let btnText: any = ref();
let colorBtn: any = ref();

const pageCount = computed(() => {
  getFacturas(page.value - 1, tipoConsulta.value);
  return Math.ceil(totalElements.value / itemsPerPage.value);
});

let loading: any = ref(false);


function getColor(item: any) {
  if (item == "I") {
    return 'blue';
  }
  if (item == "E") {
    return 'green';
  }
  if (item == "T") {
    return 'orange';
  }
  if (item == "N") {
    return 'red';
  }
  if (item == "P") {
    return 'yellow';
  }
}

async function getFacturas(pageNumber: any, tipo: any) {
  facturas.value = [];
  loading.value = true;
  tipoConsulta.value = tipo;
  await axios
    .get(
      appStore.link +
      "/Comprobante/" +
      tipo +
      "/" +
      appStore.empresa.id +
      "/pageable",
      {
        params: {
          page: page.value - 1,
          size: itemsPerPage.value,
        },
      }
    )
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

function confirmaCancelar(item: any) {
  btnText.value = "CANCELAR FACTURA";
  colorBtn.value = "red-lighten-1";
  dialogCancelarXml.value = true;
  itemCancelar.value = item;
}

function confirmarTimbrar(item: any) {
  btnText.value = "TIMBRAR FACTURA";
  colorBtn.value = "green-lighten-1";
  dialogCancelarXml.value = true;
  itemCancelar.value = item;
}

async function cancelarTimbrarFactura() {
  if (btnText.value == "CANCELAR FACTURA") {
    axios
      .post(appStore.link + "/Facturacion/cancelarXml", itemCancelar.value)
      .then((response) => {
        if (response.data.status == 0) {
          dialogCancelarXml.value = false;
          mostrarSnack("success", response.data.mensaje, 3000);
        } else {
          dialogCancelarXml.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal " + e);
      });
  } else {
    await axios
      .post(appStore.link + "/Facturacion/timbrarXml", itemCancelar.value)
      .then((response) => {
        if (response.data.status == 0) {
          // dialog.value = false;
          mostrarSnack("success", response.data.mensaje, 3000);
        } else {
          // dialog.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal" + e);
      });
  }
}

async function descargarPdf(item: any) {
  await axios({
    url: appStore.link + "/Xml/descargarPdf/" + item.uuid + "/" + appStore.empresa.id,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.uuid + ".pdf");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

async function descargarXml(item: any) {
  await axios({
    url: appStore.link + "/Xml/descargarXml/" + item.uuid,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.uuid + ".xml");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

async function descargarCvv(item: any) {
  await axios({
    url: appStore.link + "/Xml/descargarCvv/" + item.uuid,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.uuid + ".png");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

function editarFactura(item: any) {
  console.log(item)
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}
</script>
