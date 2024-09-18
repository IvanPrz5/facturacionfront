<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="4">
        <v-menu v-model="menu" location="end" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props"> Buscar Por </v-btn>
          </template>
          <v-card width="600" variant="tonal">
            <v-radio-group v-model="column">
              <v-radio :value="0">
                <template v-slot:label>
                  <div>Buscar por <strong class="text-primary"> uuid, rfc </strong></div>
                </template>
              </v-radio>
              <v-radio :value="1">
                <template v-slot:label>
                  <div>Buscar por <strong class="text-primary"> fechas </strong></div>
                </template>
              </v-radio>
              <v-radio :value="2">
                <template v-slot:label>
                  <div>Buscar por <strong class="text-primary"> totales </strong></div>
                </template>
              </v-radio>
            </v-radio-group>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-if="column == 0">
                <v-text-field class="mt-2" density="compact" append-inner-icon="mdi-magnify" v-model="buscarPor"
                  @keyup.enter="getFacturasByUuidOrFechas(0)" placeholder="UUID"></v-text-field>
              </v-list-item>
              <v-list-item v-if="column == 1">
                <div class="mx-3 mb-2 d-flex">
                  <div>
                    <span>Fecha Inicio</span>
                    <VueDatepicker v-model="fechaInicio" auto-apply :enable-time-picker="false" :format="formatDate"
                    :start-time="startTime" locale="es-MX" :state="state" teleport-center hide-input-icon
                    :inline="{ input: true }" />
                  </div>
                  <div>
                    Fecha de Fin
                    <VueDatepicker v-model="fechaFin" auto-apply :enable-time-picker="false" :min-date="fechaInicio"
                    :format="formatDate" :start-time="endTime" locale="es-MX" :state="state" teleport-center
                    hide-input-icon :inline="{ input: true }" />
                  </div>
                </div>
              </v-list-item>
              <v-list-item v-if="column == 2">
                <v-text-field class="mt-2" density="compact" append-inner-icon="mdi-magnify" v-model="totales"
                  @keyup.enter="getFacturasByUuidOrFechas(0)" placeholder="Totales"></v-text-field>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-btn v-if="column != null" class="bg-primary" block @click="getFacturasByUuidOrFechas(0)">Buscar</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
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
              <v-btn variant="text" block @click="getFacturas(0, true, false)">Timbradas</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" block @click="getFacturas(0, true, true)">Canceladas</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" block @click="getFacturas(0, false, false)">Por Timbrar</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" block @click="getFacturasPPD(0, true, false)">Pagos</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-card class="mt-5" elevation="10">
      <v-card-text>
        <v-data-table v-model:expanded="expanded" :headers="headers" :items="facturas" :loading="loading"
          :items-per-page="itemsPerPage" item-value="datosComprobante.id" show-expand>
          <template v-slot:item.datosComprobante.idTipoComprobante="{ value }">
            <v-chip :color="getColor(value)">
              {{ value }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <!-- @vue-ignore -->
            <div v-if="item.datosComprobante.isTimbrado == false &&
              item.datosComprobante.isCancelado == false">
              <v-btn class="mr-2" color="success" variant="tonal" @click="confirmarTimbrar(item)">
                <v-icon size="large"> mdi-bell </v-icon>
                <v-tooltip activator="parent" location="end">Timbrar Factura</v-tooltip>
              </v-btn>
              <v-btn class="mr-2" variant="tonal" color="info" @click="editarFactura(item)">
                <v-icon size="large"> mdi-pencil </v-icon>
                <v-tooltip activator="parent" location="end">Editar Factura</v-tooltip>
              </v-btn>
              <v-btn variant="tonal" color="error" @click="eliminarFactura(item)">
                <v-icon size="large"> mdi-delete </v-icon>
                <v-tooltip activator="parent" location="end">Eliminar</v-tooltip>
              </v-btn>
            </div>
            <!-- @vue-ignore -->
            <div v-if="item.datosComprobante.isTimbrado == true &&
              item.datosComprobante.isCancelado == false">
              <v-btn class="mr-2" color="red-lighten-1" variant="tonal" @click="confirmaCancelar(item)">
                <v-icon size="large"> mdi-bell-cancel </v-icon>
                <v-tooltip activator="parent" location="end">Cancelar Factura</v-tooltip>
              </v-btn>
              <!-- @vue-ignore -->
              <v-btn v-if="item.datosComprobante.idMetodoPago == 'PPD'" class="mr-2" color="teal" variant="tonal" @click="verPagos(item)">
                <v-icon size="large"> mdi-cash-multiple </v-icon>
                <v-tooltip activator="parent" location="end"> Ver Pagos </v-tooltip>
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn variant="tonal" color="purple-lighten-3" v-bind="props">
                    <v-icon size="large"> mdi-dots-vertical </v-icon>
                    <v-tooltip activator="parent" location="end">Desplegar Menú</v-tooltip>
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
                  <v-list-item v-if="isAdmin == 'JEFE'">
                    <v-btn color="red" prepend-icon="mdi-email" @click="openMailDialog(item)">MAIL</v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
          <template v-slot:expanded-row="{ columns, item }">
            <!-- @vue-ignore -->
            <tr v-for="i in item.datosConcepto">
              <!-- class="bg-grey-lighten-3" -->
              <td :colspan="columns.length">
                <div class="d-flex">
                  <div class="text-teal">Descripcion: {{ i.descripcion }} -</div>
                  <div class="text-blue">Valor Unitario: {{ i.valorUnitario }} -</div>
                  <div class="text-purple">Importe: {{ i.importe }} -</div>
                  <div class="text-error">Descuento: {{ i.descuento }}</div>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <div class="text-indigo-lighten-1">Impuestos Trasladados: {{ trasladados(i.datosImpuesto) }} -</div>
                  <div class="text-green">Impuestos Retenidos: {{ retenidos(i.datosImpuesto) }} -</div>
                  <div>Total de impuestos: {{ totalImpuestos(i.datosImpuesto) }}</div>
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
          {{ itemTimbrarCancelar.datosComprobante.uuid }}
        </p>
        <!-- <v-progress-linear indeterminate :color="colorBtn" v-model="mostrarCarga"></v-progress-linear> -->
        <v-divider class="mb-4"></v-divider>
        <div class="text-end">
          <v-btn :color="colorBtn" @click="cancelarTimbrarFactura">
            {{ btnText }}
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>
  </v-container>
  <v-dialog v-model="dialogFacturacion" scrollable width="auto">
    <v-card>
      <Facturacion :propsEditarFactura="propsEditarFactura" @cerrarVentanaFacturacion="cerrarVentanaFacturacion" />
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogPagos" scrollable width="1500">
    <v-card>
      <Pagos :uuidPagosProp="uuidPagosProp"></Pagos>
    </v-card>
  </v-dialog>
  <v-dialog v-model="loader" width="auto" persistent>
    <v-card color="indigo">
      <v-card-text class="d-flex flex-column align-center mx-5 mt-3 mb-5">
        Por favor espere.
        <v-progress-circular :size="70" :width="7" color="warning" indeterminate></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="mailDialog" width="500" >
    <MailForm :data="data"></MailForm>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, inject, watch, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Pagos from "@/components/pagos/Pagos.vue";
import Facturacion from "../Facturacion/Facturacion.vue";
import MailForm from "@/components/mail/MailForm.vue";

import VueDatepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const mailForm = ref<InstanceType<typeof MailForm> | null>(null);

const appStore = storeApp();
const emitter: any = inject("emitter");
const headers: any = ref([
  { title: "ID", key: "datosComprobante.id", sortable: false },
  { title: "Receptor", key: "datosReceptor.nombre", sortable: false },
  {
    title: "Comprobante",
    key: "datosComprobante.idTipoComprobante",
    align: "center",
  },
  { title: "SubTotal", key: "datosComprobante.subTotal", align: "center" },
  { title: "Descuento", key: "datosComprobante.descuento", align: "center" },
  { title: "Total", key: "datosComprobante.total", align: "center" },
  { title: "Fecha", key: "datosComprobante.fecha", sortable: false },
  { title: "UUID", key: "datosComprobante.uuid" },
  { title: "Actions", key: "actions", sortable: false },
]);
let expanded: any = ref([]);

let facturas: any = ref([]);

let page: any = ref(1);
let totalElements: any = ref();
let totalPages: any = ref();
let itemsPerPage: any = ref(50);
let tipoConsulta: any = ref(true);
let tipoConsulta2: any = ref(false);
let canceladas: any = ref(0);
let dialogFacturacion: any = ref(false);
let statusPage: any = ref();
let buscarPor: any = ref();

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let dialogCancelarXml: any = ref(false);
let itemTimbrarCancelar: any = ref();
let btnText: any = ref();
let colorBtn: any = ref();

let loading: any = ref(false);
let propsEditarFactura: any = ref();
let loader: any = ref(false);

let fechaInicio: any = ref();
let fechaFin: any = ref();
const fechasValidas: any = ref(false);
let contenidoTabla: any = ref(true);

let pageCount: any = ref();
let column: any = ref(null);
let totales: any = ref();

let menu: any = ref(false);
let uuidPagosProp: any = ref();
let dialogPagos: any = ref(false);

const startTime = ref({ hours: 0, minutes: 0 });
const endTime = ref({ hours: 23, minutes: 59 });
const state: any = ref(false);
const mailDialog = ref(false);
const data: any = ref();

const isAdmin = ref("");

onMounted(() => {
  if(localStorage.getItem('roleAdmin') != null){
    isAdmin.value = 'JEFE'
  }
  getFacturas(0, true, false);
});

watch(page, (nuevoValor: any) => {
  if (contenidoTabla.value == false) {
    getFacturasByUuidOrFechas(nuevoValor - 1);
  } else {
    getFacturas(nuevoValor - 1, tipoConsulta.value, tipoConsulta2.value);
  }
});

function getColor(item: any) {
  if (item == "I") {
    return "blue";
  }
  if (item == "E") {
    return "green";
  }
  if (item == "T") {
    return "orange";
  }
  if (item == "N") {
    return "red";
  }
  if (item == "P") {
    return "yellow";
  }
}

async function getFacturas(pageNumber: any, tipo: any, tipo2: any) {
  facturas.value = [];
  loading.value = true;
  tipoConsulta.value = tipo;
  tipoConsulta2.value = tipo2;
  contenidoTabla.value = true;

  if (page.value > totalPages.value) {
    pageNumber = 0;
  }

  let ruta =
    appStore.link +
    "/Comprobante/" +
    tipo +
    "/" +
    tipo2 +
    "/" +
    appStore.empresa.id +
    "/pageable";

  await axios
    .get(ruta, {
      params: {
        page: pageNumber,
        size: 50,
      },
    })
    .then((response) => {
      setTimeout(() => {
        totalPages.value = response.data.totalPages;
        pageCount.value = response.data.totalPages;
        facturas.value = response.data.content;
        totalElements.value = response.data.totalElements;
        loading.value = false;
      }, 500);
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

async function getFacturasByUuidOrFechas(pageNumber: any) {
  contenidoTabla.value = false;
  let ruta = null;
  if (page.value > totalPages.value) {
    pageNumber = 0;
  }

  if (column.value == 0 && buscarPor.value != undefined) {
    loading.value = true;
    ruta = "/byUuid/" + buscarPor.value + "/" + tipoConsulta.value + "/" + tipoConsulta2.value + "/" + appStore.empresa.id;
    getConsultasByFilters(pageNumber, ruta)
  }

  if (column.value == 1) {
    let inicioAux = "";
    let finAux = "";
    if (fechaInicio.value != undefined && fechaFin.value != undefined) {
      inicioAux = convert(fechaInicio.value);
      finAux = convert(fechaFin.value);
      state.value = true;
    } else {
      state.value = false;
    }
    if (inicioAux <= finAux) {
      fechasValidas.value = true;
    } else {
      fechasValidas.value = false;
    }
    if (state.value == true && fechasValidas.value == true) {
      loading.value = true;
      ruta = "/byFechas/" + inicioAux + "/" + finAux + "/" + tipoConsulta.value + "/" + tipoConsulta2.value + "/" + appStore.empresa.id;
      getConsultasByFilters(pageNumber, ruta);
    }
  }
  if (column.value == 2 && totales.value != undefined) {
    loading.value = true;
    ruta = "/byTotal/" + totales.value + "/" + tipoConsulta.value + "/" + tipoConsulta2.value + "/" + appStore.empresa.id
    getConsultasByFilters(pageNumber, ruta)
  }
}

async function getConsultasByFilters(pageNumber: any, ruta: any) {
  await axios
    .get(
      appStore.link +
      "/Comprobante" + ruta, {
      params: {
        page: pageNumber,
        size: 50,
      },
    })
    .then((response) => {
      setTimeout(() => {
        totalPages.value = response.data.totalPages;
        pageCount.value = response.data.totalPages;
        facturas.value = response.data.content;
        totalElements.value = response.data.totalElements;
        loading.value = false;
        menu.value = false;
      }, 500);
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

async function getFacturasPPD(pageNumber: any, tipo: any, tipo2: any) {
  facturas.value = [];
  loading.value = true;
  tipoConsulta.value = tipo;
  tipoConsulta2.value = tipo2;
  contenidoTabla.value = true;

  if (page.value > totalPages.value) {
    pageNumber = 0;
  }

  let ruta =
    appStore.link +
    "/Comprobante/pagos/" +
    tipo +
    "/" +
    tipo2 +
    "/" +
    appStore.empresa.id +
    "/pageable";

  await axios
    .get(ruta, {
      params: {
        page: pageNumber,
        size: 50,
      },
    })
    .then((response) => {
      setTimeout(() => {
        totalPages.value = response.data.totalPages;
        pageCount.value = response.data.totalPages;
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
  itemTimbrarCancelar.value = item;
}

function confirmarTimbrar(item: any) {
  btnText.value = "TIMBRAR FACTURA";
  colorBtn.value = "green-lighten-1";
  dialogCancelarXml.value = true;
  itemTimbrarCancelar.value = item;
}

async function cancelarTimbrarFactura() {
  if (btnText.value == "CANCELAR FACTURA") {
    let obj = {
      idEmpresa: itemTimbrarCancelar.value.idEmpresa,
      uuid: itemTimbrarCancelar.value.datosComprobante.uuid,
      isPago: false,
    };
    let ruta = appStore.link + "/Facturacion/cancelarXml";
    await rutaAxios(axios.put, ruta, obj);
  } else {
    itemTimbrarCancelar.value.datosComprobante.isTimbrado = true;
    let ruta = appStore.link + "/Facturacion/timbrarXml";
    await rutaAxios(axios.post, ruta, itemTimbrarCancelar.value);
  }
}

async function rutaAxios(tipoAxios: any, ruta: any, obj: any) {
  dialogCancelarXml.value = false;
  loader.value = true;
  await tipoAxios(ruta, obj)
    .then((response: any) => {
      if (response.data.status == 0) {
        loader.value = false;
        if(response.data.mensaje != "Se cancelo el xml"){
          mostrarSnack("green", "Se timbro con el uuid: " + response.data.mensaje, 5000);
          descargarArchivos(response.data.mensaje, itemTimbrarCancelar.value)
        }else{
          mostrarSnack("success", response.data.mensaje, 3000);
        }
        getFacturas(page.value - 1, tipoConsulta.value, tipoConsulta2.value);
      } else {
        loader.value = false;
        mostrarSnack("error", response.data.mensaje, 5000);
        getFacturas(page.value - 1, tipoConsulta.value, tipoConsulta2.value);
      }
    })
    .catch((e: any) => {
      console.log("Fatal" + e);
    });
}

async function descargarPdf(item: any) {
  await axios.post(appStore.link + "/Xml/descargarPdf/" + item.datosComprobante.uuid + "/" + appStore.empresa.id, item, {
    responseType: "blob"
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.datosComprobante.uuid + ".pdf");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

async function descargarXml(item: any) {
  await axios({
    url: appStore.link + "/Xml/descargarXml/" + item.datosComprobante.uuid,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.datosComprobante.uuid + ".xml");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

async function descargarCvv(item: any) {
  await axios({
    url: appStore.link + "/Xml/descargarCvv/" + item.datosComprobante.uuid,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.datosComprobante.uuid + ".png");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
}

function eliminarFactura(item: any) {
  axios
    .put(appStore.link + "/Comprobante/eliminar", item)
    .then((response) => {
      console.log(response.data);
      if (response.data == 0) {
        loader.value = false;
        mostrarSnack("success", "eliminado", 3000);
        getFacturas(page.value - 1, tipoConsulta.value, tipoConsulta2.value);
      }
    })
    .catch((e) => {
      console.log("Fatal" + e);
    });
}

function editarFactura(item: any) {
  dialogFacturacion.value = true;
  propsEditarFactura.value = item;
  emitter.emit("editarAct", item);
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}

function cerrarVentanaFacturacion(msj: any) {
  dialogFacturacion.value = false;
  if (msj != "Los datos se guardaron para timbrar despues") {
    mostrarSnack("green", "Se timbro con el uuid: " + msj, 5000);
  }else{
    mostrarSnack("green", msj, 5000);
  }
}

function formatDate(date: any) {
  let aux = date.toLocaleString("en-GB").replace(" ", " ");
  let fecha = aux.substring(0, aux.length - 3);
  return fecha;
}

function convert(date: Date) {
  return date
    .toLocaleString("sv", { timeZone: "America/Mexico_City" })
    .replace(" ", "T");
}

function trasladados(item: any){
  let imp = 0.0;
  for(let i=0; i<item.length; i++){
    if(item[i].isTrasladado == true){
      imp += Number(item[i].importe);
    }
  }
  return imp;
}

function retenidos(item: any){
  let imp = 0.0;
  for(let i=0; i<item.length; i++){
    if(item[i].isTrasladado == false){
      imp += Number(item[i].importe);
    }
  }
  return imp;
}

function totalImpuestos(item: any){
  return item.length;
}

async function descargarArchivos(uuid: any, item: any){
  await axios
    .post(appStore.link + "/Xml/descargarArchivos/" + uuid + "/" + appStore.empresa.id, item, {
      responseType: "blob"
    })
    .then((response) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", uuid + ".zip");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e) => {
      console.log(e)
    })
}

function openMailDialog(item: any){
  // item.datosComprobante.uuid + "/" + appStore.empresa.id, item,
  mailDialog.value = true;
  data.value = item;
  // mailForm.value?.enviarEmail(item);
}

function verPagos(item: any){
  uuidPagosProp.value = item;
  dialogPagos.value = true;
}


</script>
