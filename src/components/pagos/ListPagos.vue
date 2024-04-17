<template>
    <v-row no-gutters>
      <v-col cols="12">
        <v-window v-model="step">
          <v-window-item :value="1">
            <v-data-table class="mt-4" v-model:expanded="expanded" :headers="headers" :items="desserts" show-expand>
              <!-- @vue-ignore -->
              <template v-slot:top>
                <v-toolbar density="compact">
                  <v-toolbar-title>Pagos En Emisión</v-toolbar-title>
                  <v-btn v-if="step < 2" color="error" variant="flat" @click="pagosCancelados">
                    Ver Pagos Cancelados
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <!-- @vue-ignore -->
                <v-btn v-if="item.isTimbrado" class="mr-2" size="small" color="red-lighten-1" variant="tonal"
                  @click="cancelarFacturas(item)">
                  <v-icon size="large"> mdi-bell-cancel </v-icon>
                  <v-tooltip activator="parent" location="end">Cancelar Factura</v-tooltip>
                </v-btn>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" variant="tonal" color="purple-lighten-3" v-bind="props">
                      <v-icon size="large"> mdi-dots-vertical </v-icon>
                      <v-tooltip activator="parent" location="end">
                        Desplegar Menú
                      </v-tooltip>
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
              </template>
              <template v-slot:expanded-row="{ columns, item }">
                <!-- @vue-ignore -->
                <tr v-for="i in item.impuestosPPDList">
                  <td :colspan="columns.length">
                    <div class="d-flex">
                      <div class="text-teal">BaseDR : {{ i.base }} -</div>
                      <div class="text-blue">
                        Impuesto : {{ i.impuesto }} - {{ i.tasaCuota }} -
                      </div>
                      <div class="text-purple">
                        Tipo Factor : {{ i.tipoFactor }} -
                      </div>
                      <div class="text-green">
                        ImporteDR : {{ i.impuesto }} - {{ i.tasaCuota }}
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-slot:bottom></template>
            </v-data-table>
          </v-window-item>
          <v-window-item :value="2">
            <v-data-table class="mt-4" v-model:expanded="expanded" :headers="headers" :items="desserts" show-expand>
              <!-- @vue-ignore -->
              <template v-slot:top>
                <v-toolbar density="compact">
                  <v-toolbar-title>Pagos Cancelados</v-toolbar-title>
                  <v-btn v-if="step > 1" color="success" variant="flat" @click="pagosEnEmision">
                    Ver Pagos En Emisión
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:expanded-row="{ columns, item }">
                <!-- @vue-ignore -->
                <tr v-for="i in item.impuestosPPDList">
                  <td :colspan="columns.length">
                    <div class="d-flex">
                      <div class="text-teal">BaseDR : {{ i.base }} -</div>
                      <div class="text-blue">
                        Impuesto : {{ i.impuesto }} - {{ i.tasaCuota }} -
                      </div>
                      <div class="text-purple">
                        Tipo Factor : {{ i.tipoFactor }} -
                      </div>
                      <div class="text-green">
                        ImporteDR : {{ i.impuesto }} - {{ i.tasaCuota }}
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-slot:bottom></template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <v-dialog v-model="loader" width="auto" persistent>
      <v-card color="indigo">
        <v-card-text class="d-flex flex-column align-center mx-5 mt-3 mb-5">
          Por favor espere.
          <v-progress-circular :size="70" :width="7" color="warning" indeterminate></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from "vue";
  import { storeApp } from "@/store/app";
  import axios from "axios";
  
  const props = defineProps(["uuidPagosProp"]);
  
  const appStore = storeApp();
  const headers: any = ref([
    {
      title: "UUID",
      key: "uuid",
    },
    {
      title: "Saldo Anterior",
      key: "saldoAnterior",
      align: "center",
    },
    {
      title: "Importe Pagado",
      key: "importePago",
      align: "center",
    },
    {
      title: "Saldo Insoluto",
      key: "saldoInsoluto",
      align: "center",
    },
    {
      title: "Parcialidad",
      key: "numParcialidad",
      align: "center",
    },
    {
      title: "Forma Pago",
      key: "idFormaPago",
      align: "center",
    },
    {
      title: "Fecha Pago",
      key: "fechaPago",
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
    },
  ]);
  let desserts: any = ref([]);
  let expanded: any = ref([]);
  let loader: any = ref(false);
  let datosReceptor = ref();
  let step: any = ref(1);
  
  onMounted(() => {
    if (props.uuidPagosProp != null) {
      getFacturasByUuid(props.uuidPagosProp, true);
    }
  });
  
  async function getFacturasByUuid(uuid: any, tipo: any) {
    await axios
      .get(
        appStore.link +
        "/Pagos/pagos/byUuid/" +
        uuid +
        "/" +
        tipo +
        "/" +
        appStore.empresa.id
      )
      .then((response) => {
        datosReceptor.value = response.data.datosReceptor;
        desserts.value = response.data.datosPagos;
      })
      .catch((e) => {
        console.log("Fatal " + e);
      });
  }
  
  async function cancelarFacturas(item: any) {
    loader.value = true;
    let obj = {
      idEmpresa: appStore.empresa.id,
      uuid: item.uuid,
      isPago: true,
    };
    await axios
      .put(appStore.link + "/Facturacion/cancelarXml", obj)
      .then((response) => {
        if (response.data.status == 0) {
          loader.value = false;
          if (response.data.mensaje == "Se cancelo el xml") {
            getFacturasByUuid(props.uuidPagosProp, true);
            mostrarSnack("success", response.data.mensaje, 5000);
          }
        }else {
          loader.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
          getFacturasByUuid(props.uuidPagosProp, true);
        }
        
      })
      .catch((e) => {
        console.log("Fatal " + e);
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
  
  async function descargarPdf(item: any) {
    console.log(item)
    let obj = {
      datosComprobante: null,
      datosPagos: item,
      datosConceptos: null,
      datosReceptor: datosReceptor.value,
      idEmpresa: appStore.empresa.id,
    };
    await axios
      .post(
        appStore.link +
        "/Pagos/pagosPdf/" +
        item.uuid +
        "/" +
        appStore.empresa.id,
        obj,
        {
          responseType: "blob",
        }
      )
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
  
  function pagosCancelados() {
    step.value++;
    getFacturasByUuid(props.uuidPagosProp, false);
  }
  
  function pagosEnEmision() {
    step.value--;
    getFacturasByUuid(props.uuidPagosProp, true);
  }
  
  function mostrarSnack(color: any, msgSnack: any, time: any) {
    /* snackColor = color;
      msg = msgSnack;
      timeMensaje = time;
      snack.value = true; */
  }
  
  defineExpose({
    getFacturasByUuid
  });
  </script>
  