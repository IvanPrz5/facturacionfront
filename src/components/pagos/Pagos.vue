<template>
    <v-card>
      <v-card-title class="d-flex bg-primary">
        Pagos de factura : {{ props.uuidPagosProp.datosComprobante.uuid }}
        <v-spacer></v-spacer>
        <v-divider class="mx-4" inset vertical></v-divider>
        <!-- <v-icon :icon="showPagos ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showPagos = !showPagos"></v-icon> -->
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <div v-show="showPagos">
          <v-form ref="pagosForm" fast-fail @submit.prevent>
            <v-row no-gutters v-if="pagosClass.numParcialidad > 1 || verTabla">
              <v-col class="mb-5">
                <ListPagos ref="listPagos" :uuidPagosProp="uuidPagosProp"></ListPagos>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row no-gutters class="mt-4">
              <v-col cols="6" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="UUID" v-model="pagosClass.uuid"
                  :rules="[rules.requerido]" readonly></v-text-field>
              </v-col>
              <v-col cols="6" class="pa-1">
                <v-autocomplete variant="outlined" density="compact" label="Forma de Pago" :items="itemsFormaPago"
                  :item-title="titleAutoComplete" item-value="codigo" v-model="pagosClass.idFormaPago"
                  :rules="[rules.requerido]"></v-autocomplete>
              </v-col>
              <v-col cols="6" class="pa-1">
                <v-autocomplete variant="outlined" density="compact" label="Objeto Impuesto" :items="itemsObjetoImp"
                  :item-title="titleAutoComplete" item-value="codigo" v-model="pagosClass.objetoImp"
                  :rules="[rules.requerido]"></v-autocomplete>
              </v-col>
              <v-col class="pa-1" cols="6">
                <VueDatepicker v-model="pagosClass.fechaPago" auto-apply :enable-time-picker="true" :format="formatDate"
                  :start-time="startTime" locale="es-MX" :state="pagosClass.fechaPago != null ? true : false"
                  hide-input-icon :dark="appStore.theme == 'dark' ? true : false" placeholder="Fecha de Pago"
                  teleport-center />
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row no-gutters class="mt-4">
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Serie" v-model="pagosClass.serie"
                  :rules="[rules.requerido]"></v-text-field>
              </v-col>
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Folio" v-model="pagosClass.folio"
                  :rules="[rules.requerido]"></v-text-field>
              </v-col>
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Número Parcialidad"
                  v-model="pagosClass.numParcialidad"></v-text-field>
              </v-col>
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Importe Saldo Anterior"
                  v-model="pagosClass.saldoAnterior" :rules="[rules.requerido, rules.numero]"></v-text-field>
              </v-col>
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Importe Pagado" v-model="pagosClass.importePago"
                  :rules="[rules.requerido, rules.numero]"></v-text-field>
              </v-col>
              <v-col cols="4" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Saldo Insoluto"
                  v-model="pagosClass.saldoInsoluto" :rules="[rules.requerido, rules.numero]"></v-text-field>
              </v-col>
              {{ auxInsoluto }}
            </v-row>
            <v-divider></v-divider>
            <v-row no-gutters class="mt-4" v-show="pagosClass.objetoImp != '01'">
              <v-col cols="3" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Base DR" v-model="pagosClass.baseDR"
                  readonly></v-text-field>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Impuesto DR" v-model="iva"
                  readonly></v-text-field>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Tipo Factor DR" v-model="tasa"
                  readonly></v-text-field>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-text-field variant="outlined" density="compact" label="Importe DR" v-model="pagosClass.importeDR"
                  readonly></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-4">
              <v-col>
                <v-btn class="mx-1" color="primary" @click="vistaPreviaPagos"> Generar Vista Previa </v-btn>
                <v-btn class="mx-1" color="success" @click="timbrarPagos"> Timbrar </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
      {{ msg }}
    </v-snackbar>
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
  import { ref, computed, onMounted } from "vue";
  import axios from "axios";
  import { storeApp } from "@/store/app";
  import Rules from "@/class/Rules";
  import VueDatepicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";
  
  import ListPagos from "@/components/pagos/ListPagos.vue";
  
  const listPagos = ref<InstanceType<typeof ListPagos> | null>(null);
  
  const props = defineProps(["uuidPagosProp"]);
  
  const appStore = storeApp();
  const rules = new Rules();
  const startTime = ref({ hours: 0, minutes: 0 });
  const pagosClass = appStore.pagos;
  const pagosForm: any = ref(null);
  const itemsFormaPago: any = ref([]);
  const itemsObjetoImp: any = ref([]);
  
  const snack: any = ref(false);
  let snackColor = "";
  let msg: String = "";
  let timeMensaje: any = ref();
  
  let showPagos: any = ref(true);
  let loader: any = ref(false);
  let iva: any = ref("IVA - 0.160000");
  let datosReceptor: any = ref();
  let tasa: any = ref("TASA");
  let verTabla: any = ref(false);
  let uuidPagosProp: any = ref();
  
  onMounted(() => {
    // desserts.value = [];
    resetForm();
    getFormaPago();
    getObjetoImp();
    getDatosPPDByUuid();
    if (pagosClass.numParcialidad > 1) {
      listPagos.value?.getFacturasByUuid(props.uuidPagosProp.datosComprobante.uuid, true);
      uuidPagosProp.value = props.uuidPagosProp.datosComprobante.uuid;
    }
  });
  
  let auxInsoluto = computed(() => {
    if (pagosClass.saldoAnterior != null && pagosClass.importePago != null) {
      let aux = Number(pagosClass.saldoAnterior) - Number(pagosClass.importePago);
      pagosClass.saldoInsoluto = Number(aux).toFixed(2);
      let aux2 = Number(pagosClass.importePago) / 1.16;
      pagosClass.baseDR = Number(aux2).toFixed(2);
      let aux3 = Number(aux2) * 0.16;
      pagosClass.importeDR = Number(aux3).toFixed(2);
    }
  });
  
  function getDatosPPDByUuid() {
    axios.get(appStore.link + "/Pagos/getPPD/" + props.uuidPagosProp.datosComprobante.uuid + "/" + appStore.empresa.id)
      .then((response) => {
        if (response.data != "") {
          if (response.data.comprobantePagosDto.numParcialidad > 0) {
            pagosClass.numParcialidad = Number(response.data.comprobantePagosDto.numParcialidad) + 1;
          } else {
            pagosClass.numParcialidad = 1;
          }
          pagosClass.saldoAnterior = response.data.comprobantePagosDto.saldoAnterior;
          pagosClass.uuid = response.data.comprobantePagosDto.uuid;
          pagosClass.isTrasladado = true;
          pagosClass.objetoImp = "01";
          datosReceptor.value = props.uuidPagosProp.datosReceptor;
        }
      })
      .catch((e) => {
        console.log("Fatal " + e);
      })
  }
  
  async function getObjetoImp() {
    axios
      .get(appStore.link + "/ObjetoImp/get")
      .then((response) => {
        itemsObjetoImp.value = response.data;
      })
      .catch((e) => {
        console.log("Fatal " + e);
      });
  }
  
  function getFormaPago() {
    axios
      .get(appStore.link + "/FormaPago/get")
      .then((response) => {
        itemsFormaPago.value = response.data;
      })
      .catch((e) => {
        console.log("Fatal " + e);
      });
  }
  
  async function vistaPreviaPagos() {
    const { valid } = await pagosForm.value.validate();
    if (valid) {
      pagosClass.uuidDR = props.uuidPagosProp.datosComprobante.uuid;
      let obj = {
        datosComprobante: null,
        datosReceptor: datosReceptor.value,
        datosConcepto: null,
        datosPagos: pagosClass,
        idEmpresa: appStore.empresa.id
      } as any;
      loader.value = true;
  
      let ruta = "/Pagos/vistaPrevia/" + appStore.empresa.id;
      let reg = obj.datosReceptor.regimenFiscal.split("-");
      obj.datosReceptor.regimenFiscal = reg[0];
  
      let fecha = convert(obj.datosPagos.fechaPago)
      obj.datosPagos.fechaPago = fecha;
  
      vistaPreviaAxios(ruta, obj)
    } else {
      console.log("Campos Vacios")
    }
  }
  
  async function vistaPreviaAxios(ruta: any, obj: any) {
    await axios
      .post(appStore.link + ruta, obj, {
        responseType: "blob",
      })
      .then((response: any) => {
        let url = window.URL.createObjectURL(new Blob([response.data]));
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "Vista Previa" + new Date().toLocaleDateString() + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
        loader.value = false;
      })
      .catch((e: any) => {
        console.log("Error al generar vista Previa  " + e);
      });
  }
  
  async function timbrarPagos() {
    const { valid } = await pagosForm.value.validate();
    if (valid) {
      pagosClass.uuidDR = props.uuidPagosProp.datosComprobante.uuid;
      let obj = {
        datosComprobante: null,
        datosReceptor: datosReceptor.value,
        datosConcepto: null,
        datosPagos: pagosClass,
        idEmpresa: appStore.empresa.id
      } as any;
      loader.value = true;
  
      let ruta = "/Pagos/pagosPPD";
      let reg = obj.datosReceptor.regimenFiscal.split("-");
      obj.datosReceptor.regimenFiscal = reg[0];
  
      let fecha = convert(obj.datosPagos.fechaPago)
      obj.datosPagos.fechaPago = fecha;
  
      timbrarAxios(ruta, obj);
    } else {
      console.log("Campos Vacios")
    }
  }
  
  async function timbrarAxios(ruta: any, obj: any) {
    await axios
      .post(appStore.link + ruta, obj)
      .then((response) => {
        if (response.data.status == 0) {
          loader.value = false;
          if (response.data.mensaje != "Los datos se guardaron para timbrar despues") {
            mostrarSnack(
              "green",
              "Se timbro con el uuid: " + response.data.mensaje,
              3500
            );
            descargarArchivos(response.data.mensaje, obj);
            listPagos.value?.getFacturasByUuid(props.uuidPagosProp.datosComprobante.uuid, true);
            verTabla.value = true;
          } else {
            mostrarSnack("green", response.data.mensaje, 5000);
          }
        } else {
          loader.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal" + e);
      });
  }
  
  async function descargarArchivos(uuid: any, datosFactura: any) {
    let ruta = "/Xml/descargarArchivosPPD/";
  
    await axios
      .post(
        appStore.link +
        ruta +
        uuid +
        "/" +
        appStore.empresa.id,
        datosFactura,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        let url = window.URL.createObjectURL(new Blob([response.data]));
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", uuid + ".zip");
        document.body.appendChild(link);
        link.click();
      })
      .catch((e) => {
        console.log(e);
      });
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
  
  function titleAutoComplete(item: any) {
    return item.codigo + " - " + item.descripcion;
  }
  
  function mostrarSnack(color: any, msgSnack: any, time: any) {
    snackColor = color;
    msg = msgSnack;
    timeMensaje = time;
    snack.value = true;
  }
  
  function resetForm(){
    pagosClass.objetoImp = null;
    pagosClass.idFormaPago = null;
    pagosClass.fechaPago = null;
    pagosClass.serie = null;
    pagosClass.folio = null;
    pagosClass.saldoAnterior = null;
    pagosClass.importePago = null;
    pagosClass.saldoInsoluto = null;
    pagosClass.saldoInsoluto = null;
    pagosClass.baseDR = null;
    pagosClass.importeDR = null;
  }
  </script>
  