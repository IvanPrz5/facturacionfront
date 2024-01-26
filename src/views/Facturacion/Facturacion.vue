<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <Cliente ref="cliente" @getDatosCliente="getDatosCliente"></Cliente>
      </v-col>
      <v-col cols="12">
        <div v-show="showComprobante">
          <Comprobante ref="comprobante" @abrirConcepto="crearConcepto"></Comprobante>
        </div>
      </v-col>
      <v-col v-if="arrayConceptos.length > 0" cols="12">
        <v-card variant="tonal">
          <v-card-title class="d-flex">
            Conceptos Agregados
            <v-spacer></v-spacer>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="indigo" @click="crearConcepto">
              <v-icon size="x-large">mdi-plus</v-icon>
              <v-tooltip activator="parent" location="end">Agregar Concepto</v-tooltip>
            </v-btn>
          </v-card-title>
          <v-list>
            <v-list-group v-for="(i, item) in arrayConceptos" :key="i">
              <template v-slot:activator="{ props }">
                <v-row no-gutters>
                  <v-col cols="1">
                    <v-list-item-subtitle class="pl-5 pt-3">{{
                      item + 1
                    }}</v-list-item-subtitle>
                  </v-col>
                  <v-col cols="9">
                    <v-list-item v-bind="props" :title="i.descripcion">
                      <div class="d-flex">
                        <v-list-item-subtitle class="px-2 text-info">Importe : {{ i.importe }},</v-list-item-subtitle>
                        <v-list-item-subtitle class="px-2 text-red">Descuento : {{ i.descuento }},</v-list-item-subtitle>
                        <v-list-item-subtitle v-if="i.datosImpuesto.length > 0" class="px-2 text-orange">Impuesto :
                          {{ i.totalImp, getTotalConcepImp(i) }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle class="px-2 text-success">Total :
                          {{
                            totalConcepto(i.importe, i.descuento, i.totalImp)
                          }}</v-list-item-subtitle>
                      </div>
                    </v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-btn v-if="i.idObjetoImp != '01'" variant="text" icon="mdi-cash-plus" color="green-lighten-2"
                      @click="crearImpuesto(i)"></v-btn>
                    <v-btn variant="text" icon="mdi-pencil" color="blue-lighten-2" @click="editarConcepto(i)"></v-btn>
                    <v-btn variant="text" icon="mdi-delete" color="red-lighten-2" @click="eliminarConcepto(i)"></v-btn>
                  </v-col>
                </v-row>
              </template>
              <v-list-item>
                <div class="d-flex align-center justify-center">
                  <div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Producto o Servicio: {{ i.claveProdServDesc }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Clave Unidad: {{ i.idClaveUnidad }}.- {{ i.unidad }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Objeto Impuesto: {{ codObjImpuesto(i.idObjetoImp) }}
                    </div>
                  </div>
                </div>
                <v-list-group v-if="i.datosImpuesto.length > 0">
                  <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props">
                      Impuestos Trasladados:
                      {{ i.totalTras, getTotalConcepTras(i) }}
                    </v-list-item>
                  </template>
                  <div v-for="(j, item) in i.datosImpuesto" :key="item">
                    <v-list-item v-if="j.isTrasladado">
                      <v-row no-gutters>
                        <v-col cols="1">
                          <v-list-item-subtitle class="pl-5 pt-3">{{
                            item + 1
                          }}</v-list-item-subtitle>
                        </v-col>
                        <v-col cols="9">
                          <v-list-item :title="codImpuesto(j.codImpuesto)">
                            <div class="d-flex">
                              <v-list-item-subtitle>Importe : {{ j.importe }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Base : {{ j.base }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Tipo Factor :
                                {{ j.codTipoFactor }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Tasa ó Cuota :
                                {{ j.codTasaCuota }}</v-list-item-subtitle>
                            </div>
                          </v-list-item>
                        </v-col>
                        <v-col cols="2">
                          <v-btn variant="text" icon="mdi-pencil-box-outline" color="indigo-lighten-2"
                            @click="editarImpuesto(j, i)"></v-btn>
                          <v-btn v-if="i.datosImpuesto.length > 1" variant="text" icon="mdi-delete-circle-outline"
                            color="purple-lighten-2" @click="eliminarImpuesto(j, i)"></v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-group>
                <v-list-group v-if="i.datosImpuesto.length > 0">
                  <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props">
                      Impuestos Retenidos:
                      {{ i.totalRete, getTotalConcepRete(i) }}
                    </v-list-item>
                  </template>
                  <div v-for="(j, item) in i.datosImpuesto" :key="item">
                    <v-list-item v-if="!j.isTrasladado">
                      <v-row no-gutters>
                        <v-col cols="1">
                          <v-list-item-subtitle class="pl-5 pt-3">{{
                            item + 1
                          }}</v-list-item-subtitle>
                        </v-col>
                        <v-col cols="9">
                          <v-list-item :title="codImpuesto(j.codImpuesto)">
                            <div class="d-flex">
                              <v-list-item-subtitle v-if="!j.isTrasladado">Importe : {{ j.importe
                              }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Base : {{ j.base }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Tipo Factor :
                                {{ j.codTipoFactor }}</v-list-item-subtitle>
                              <v-list-item-subtitle class="px-2">Tasa ó Cuota :
                                {{ j.codTasaCuota }}</v-list-item-subtitle>
                            </div>
                          </v-list-item>
                        </v-col>
                        <v-col cols="2">
                          <v-btn variant="text" icon="mdi-pencil-box-outline" color="indigo-lighten-2"
                            @click="editarImpuesto(j, i)"></v-btn>
                          <v-btn variant="text" icon="mdi-delete-circle-outline" color="purple-lighten-2"
                            v-if="i.datosImpuesto.length > 1" @click="eliminarImpuesto(j, i)"></v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-group>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="6" v-if="arrayConceptos.length == 0">
        <v-btn color="indigo" @click="crearConcepto"> Agregar Concepto </v-btn>
      </v-col>
      <v-col cols="12" class="d-flex" v-if="arrayConceptos.length > 0">
        <!-- <v-spacer></v-spacer> -->
        <v-btn color="success" @click="generarFactura"> Generar Factura </v-btn>
        <v-spacer></v-spacer>
        <div class="d-flex flex-column">
          <div>SubTotal : {{ subTotal }}</div>
          <div style="color: red">Descuento : - {{ descuento }}</div>
          <div style="color: green">Total : {{ total }}</div>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showConcepto" width="900">
      <Concepto ref="concepto" :propConcepto="propConcepto" @setDatosConcepto="getDatosConceptos" @actualizar="actualizar"
        @closeConcepto="cerrarConcepto" />
    </v-dialog>
    <v-dialog v-model="dialogImpuesto" width="900" persistent>
      <Impuesto ref="impuesto" :propImporte="propImporte" :propImpuesto="propImpuesto" :propTabla="propTabla"
        @closeImpuesto="cerrarImpuesto" @actualizarImpuesto="actualizarImpuesto" @setDatosImpuesto="getDatosImpuestos" />
    </v-dialog>
    <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
      {{ msg }}
    </v-snackbar>
    <v-dialog v-model="dialog" persistent>
      <v-card color="deep-purple">
        <v-card-text>
          Por favor espere.
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Cliente from "@/components/cliente/Cliente.vue";
import Comprobante from "@/components/comprobante/Comprobante.vue";
import Concepto from "@/components/concepto/Concepto.vue";
import Impuesto from "@/components/impuesto/Impuesto.vue";

const cliente = ref<InstanceType<typeof Cliente> | null>(null);
const comprobante = ref<InstanceType<typeof Comprobante> | null>(null);
const concepto = ref<InstanceType<typeof Concepto> | null>(null);
const impuesto = ref<InstanceType<typeof Impuesto> | null>(null);

const appStore = storeApp();
const clienteClass = appStore.cliente;
const comprobanteClass = appStore.comprobante;

let datosFactura: any = ref({});

let showComprobante: any = ref(true);
let showConcepto: any = ref(false);

let showListConceptos: any = ref(true);
let dialogImpuesto: any = ref(false);
let dialog: any = ref(false);

let arrayConceptos: any = ref([]);
let propConcepto: any = ref();
let propImpuesto: any = ref();
let propImporte: any = ref();
let propTabla: any = ref();

// let arrayImpuestos: any = ref([]);

let conceptoIndex: any = ref(-1);
let impuestoIndex: any = ref(-1);

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let subTotal: any = ref();
let descuento: any = ref();
let total: any = ref();

let importeConcepto: any = ref();

watch(arrayConceptos.value, (nuevoValor) => {
  let aux = 0;
  let aux2 = 0;
  let aux3 = 0;
  let aux4 = 0;
  for (let i = 0; i < nuevoValor.length; i++) {
    aux += Number(nuevoValor[i].importe);
    aux2 += Number(nuevoValor[i].descuento);
    aux3 += Number(nuevoValor[i].totalImp);
    // console.log(nuevoValor)
  }
  subTotal.value = Number(aux).toFixed(2);
  descuento.value = Number(aux2).toFixed(2);
  // if (aux3 > 0) {
  aux4 = Number(subTotal.value) - Number(descuento.value) + aux3;
  total.value = Number(aux4).toFixed(2);
  /* } else {
    aux4 = Number(subTotal.value) - Number(descuento.value);
    total.value = Number(aux4).toFixed(2);
  } */
});

async function generarFactura() {
  // dialog.value = true;
  let datosComprobante = await getDatosComprobante();
  let datosCliente = await getDatosCliente();
  if (datosCliente != null && datosComprobante != null) {
    datosFactura.value.datosConcepto = arrayConceptos.value;
    console.log(datosFactura.value.datosConcepto)
  await axios
      .post(appStore.link + "/Facturacion/crearXml", datosFactura.value)
      .then((response) => {
        if (response.data.status == 0) {
          dialog.value = false;
          mostrarSnack("success", response.data.mensaje, 3000);
        } else {
          dialog.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal" + e);
      });
  } else {
    console.log("No dejar campos vacios")
  }
}

/* async function descargarXml() {
  await axios({
    url: appStore.link + "/Recursos/descargarXml/" + uuid,
    method: "GET",
    responseType: "blob",
  })
    .then((response: any) => {
      let url = window.URL.createObjectURL(new Blob([response.data]));
      let link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", uuid + ".xml");
      document.body.appendChild(link);
      link.click();
    })
    .catch((e: any) => {
      console.log("Buscar folio  " + e);
    });
} */

async function getDatosCliente() {
  return datosFactura.value.datosReceptor = await cliente.value?.setDatosCliente();
}

async function getDatosComprobante() {
  datosFactura.value.datosComprobante = await comprobante.value?.setDatosComprobante();
  datosFactura.value.datosComprobante.isTimbrado = true;
  return datosFactura.value.datosComprobante;
}

function crearConcepto() {
  showConcepto.value = true;
  propConcepto.value = null;
}

function getDatosConceptos(item: any) {
  if (item != null) {
    arrayConceptos.value.push(item);
    cerrarConcepto();
    if (item.idObjetoImp != "01") {
      crearImpuesto(item);
    }
  }
}

function editarConcepto(item: any) {
  showConcepto.value = true;
  propConcepto.value = item;
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
  console.log(item);
}

function actualizar(item: any) {
  if (item != null) {
    Object.assign(arrayConceptos.value[conceptoIndex.value], item);
  }
}

function eliminarConcepto(item: any) {
  arrayConceptos.value.splice(item, 1);
}

function cerrarConcepto() {
  showConcepto.value = false;
}

function crearImpuesto(item: any) {
  dialogImpuesto.value = true;
  propImpuesto.value = null;
  if (item.datosImpuesto.length > 0) {
    propTabla.value = item.datosImpuesto;
  }
  propImporte.value = item.importe;
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
}

function getDatosImpuestos(item: any) {
  if (item != null) {
    arrayConceptos.value[conceptoIndex.value].datosImpuesto = item;
  }
}

function editarImpuesto(imp: any, concep: any) {
  dialogImpuesto.value = true;
  propImpuesto.value = imp;
  propImporte.value = null;
  conceptoIndex.value = arrayConceptos.value.indexOf(concep);
  impuestoIndex.value =
    arrayConceptos.value[conceptoIndex.value].datosImpuesto.indexOf(imp);
}

function actualizarImpuesto(item: any) {
  Object.assign(
    arrayConceptos.value[conceptoIndex.value].datosImpuesto[
    impuestoIndex.value
    ],
    item
  );
}

function eliminarImpuesto(imp: any, concep: any) {
  conceptoIndex.value = arrayConceptos.value.indexOf(concep);
  impuestoIndex.value =
    arrayConceptos.value[conceptoIndex.value].datosImpuesto.indexOf(imp);
  arrayConceptos.value[conceptoIndex.value].datosImpuesto.splice(
    impuestoIndex.value,
    1
  );
}

function cerrarImpuesto() {
  dialogImpuesto.value = false;
}

function getTotalConcepTras(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  for (let j = 0; j < arrayConceptos.value[index].datosImpuesto.length; j++) {
    if (arrayConceptos.value[index].datosImpuesto[j].isTrasladado == true) {
      aux += Number(arrayConceptos.value[index].datosImpuesto[j].importe);
    }
  }
  arrayConceptos.value[index].totalTras = Number(aux).toFixed(2);
}

function getTotalConcepRete(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  for (let j = 0; j < arrayConceptos.value[index].datosImpuesto.length; j++) {
    if (arrayConceptos.value[index].datosImpuesto[j].isTrasladado == false) {
      aux += Number(arrayConceptos.value[index].datosImpuesto[j].importe);
    }
  }
  arrayConceptos.value[index].totalRete = Number(aux).toFixed(2);
}

function getTotalConcepImp(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  aux =
    Number(arrayConceptos.value[index].totalTras) +
    -Number(arrayConceptos.value[index].totalRete);
  arrayConceptos.value[index].totalImp = Number(aux).toFixed(2);
}

function totalConcepto(a: any, b: any, c: any) {
  let aux = 0;
  if (c != undefined) {
    aux = Number(a) - Number(b) + Number(c);
  } else {
    aux = Number(a) - Number(b);
  }
  // totalTodosConceptos(a, b, c)
  return Number(aux).toFixed(2);
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}

function codImpuesto(codImpuesto: any) {
  if (codImpuesto == "001") {
    return "001 - ISR";
  }
  if (codImpuesto == "002") {
    return "002 - IVA";
  }
  if (codImpuesto == "003") {
    return "003 - IEPS";
  }
}

function codObjImpuesto(codImpuesto: any) {
  if (codImpuesto == "01") {
    return "01 - No Objeto de Impuesto";
  }
  if (codImpuesto == "02") {
    return "02 - Si Objeto de Impuesto";
  }
  if (codImpuesto == "03") {
    return "03 - Si Objeto de Impuesto Y No Obligado Al Desglose";
  }
  if (codImpuesto == "04") {
    return "04 - Si Objeto de Impuesto Y No Causa Impuesto";
  }
}
</script>
