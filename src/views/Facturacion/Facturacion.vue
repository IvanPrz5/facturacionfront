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
            <v-list-group v-for="i in arrayConceptos">
              <template v-slot:activator="{ props }">
                <v-row no-gutters>
                  <v-col cols="10">
                    <v-list-item v-bind="props" :title="i.descripcion"></v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-btn variant="text" icon="mdi-cash-plus" color="green-lighten-2"
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
                      Clave Unidad: {{i.idClaveUnidad}}.- {{ i.unidad }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Objeto Impuesto: {{ i.idObjetoImp }}
                    </div>
                  </div>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Cantidad: {{ i.cantidad }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Valor Unitario: {{ i.valorUnitario }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Importe: {{ i.importe }}
                    </div>
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Descuento: {{ i.descuento }}
                    </div>
                  </div>
                </div>
                <v-list-group v-for="j in i.datosImpuesto">
                  <template v-slot:activator="{ props }">
                    <v-row>
                      <v-col cols="10">
                        <v-list-item v-bind="props" title="Impuestos"></v-list-item>
                      </v-col>
                      <v-col cols="2">
                        <v-btn variant="text" icon="mdi-pencil-box-outline" color="indigo-lighten-2"
                          @click="editarImpuesto(j, i)"></v-btn>
                        <v-btn variant="text" icon="mdi-delete-circle-outline" color="purple-lighten-2"
                          @click="eliminarImpuesto(j, i)"></v-btn>
                      </v-col>
                    </v-row>
                  </template>
                  <v-list-item>
                    <div class="d-flex align-center justify-center">
                      <div>
                        <div class="text-subtitle-2 text-medium-emphasis">
                          Impuesto: {{ j.codImpuesto }}
                        </div>
                        <div class="text-subtitle-2 text-medium-emphasis">
                          Tipo Factor: {{ j.codTipoFactor }}
                        </div>
                        <div class="text-subtitle-2 text-medium-emphasis">
                          Tasa ó Cuota: {{ j.codTasaCuota }}
                        </div>
                      </div>
                      <v-divider class="mx-4" inset vertical></v-divider>
                      <div>
                        <div class="text-subtitle-2 text-medium-emphasis">
                          Base: {{ j.base }}
                        </div>
                        <div class="text-subtitle-2 text-medium-emphasis">
                          Importe: {{ j.importe }}
                        </div>
                      </div>
                    </div>
                  </v-list-item>
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
        <v-btn color="success" @click="generarFactura"> Generar Factura </v-btn>
        <v-spacer></v-spacer>
        <div class="d-flex flex-column">
          <label>SubTotal: {{ subTotal }} </label>
          <label>Descuento: {{descuento}} </label>
          <label>Total: {{ total }} </label>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showConcepto" width="900">
      <Concepto ref="concepto" :propConcepto="propConcepto" @setDatosConcepto="getDatosConceptos"
        @actualizar="actualizar" @closeConcepto="cerrarConcepto" />
    </v-dialog>
    <v-dialog v-model="dialogImpuesto" width="700">
      <Impuesto ref="impuesto" :propImpuesto="propImpuesto" @closeImpuesto="cerrarImpuesto" 
        @actualizarImpuesto="actualizarImpuesto" @setDatosImpuesto="getDatosImpuestos" />
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
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Cliente from '@/components/cliente/Cliente.vue';
import Comprobante from '@/components/comprobante/Comprobante.vue'
import Concepto from '@/components/concepto/Concepto.vue';
import Impuesto from '@/components/impuesto/Impuesto.vue'

const cliente = ref<InstanceType<typeof Cliente> | null>(null);
const comprobante = ref<InstanceType<typeof Comprobante> | null>(null);
const concepto = ref<InstanceType<typeof Concepto> | null>(null);
const impuesto = ref<InstanceType<typeof Impuesto> | null>(null);

const appStore = storeApp();
const clienteClass = appStore.cliente;
const comprobanteClass = appStore.comprobante

let datosFactura: any = ref({});

let showComprobante: any = ref(true);
let showConcepto: any = ref(false);

let showListConceptos: any = ref(true);
let dialogImpuesto: any = ref(false);
let dialog: any = ref(false);

let arrayConceptos: any = ref([]);
let propConcepto: any = ref();
let propImpuesto: any = ref();
// let arrayImpuestos: any = ref([]);

let conceptoIndex: any = ref(-1);
let impuestoIndex: any = ref(-1)

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let subTotal: any = ref();
let descuento: any = ref();
let total: any = ref();

async function generarFactura() {
  // dialog.value = true;
  getDatosCliente();
  getDatosComprobante();
  // if (datosCliente != null && datosComprobante != null) {
    datosFactura.value.datosConcepto = arrayConceptos.value;
    console.log(datosFactura.value);
    await axios
      .post(appStore.link + "/Facturacion/crearXml", datosFactura.value)
      .then((response) => {
        if (response.data.status == 0) {
          dialog.value = false;
          mostrarSnack("success", response.data.mensaje, 3000)
        } else {
          dialog.value = false;
          mostrarSnack("error", response.data.mensaje, 5000)
        }
        // console.log(response.data);
      })
      .catch((e) => {
        console.log("Fatal" + e);
      });
  // } else {
  //   console.log("No dejar campos vacios")
  // }
}

function getDatosCliente() {
  datosFactura.value.datosReceptor = cliente.value?.setDatosCliente();
  console.log(datosFactura.value.datosReceptor);
}

function getDatosComprobante() {
  datosFactura.value.datosComprobante = comprobante.value?.setDatosComprobante();
  console.log(datosFactura.value.datosComprobante);
}

function crearConcepto() {
  showConcepto.value = true;
  propConcepto.value = null;
  // cliente.value?.ocultar();
}

function getDatosConceptos(item: any) {
  if (item != null) {
    arrayConceptos.value.push(item);
    cerrarConcepto();
  }
}

function editarConcepto(item: any) {
  showConcepto.value = true;
  propConcepto.value = item;
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
}

function actualizar(item: any){
  if(item != null){
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
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
}

function getDatosImpuestos(item: any) {
  arrayConceptos.value[conceptoIndex.value].datosImpuesto.push(item);
  cerrarImpuesto();
}

function editarImpuesto(imp: any, concep:any) {
  dialogImpuesto.value = true;
  propImpuesto.value = imp;
  conceptoIndex.value = arrayConceptos.value.indexOf(concep);
  impuestoIndex.value = arrayConceptos.value[conceptoIndex.value].datosImpuesto.indexOf(imp);
}

function actualizarImpuesto(item: any){
  Object.assign(arrayConceptos.value[conceptoIndex.value].datosImpuesto[impuestoIndex.value], item);
}

function eliminarImpuesto(imp: any, concep:any) {
  conceptoIndex.value = arrayConceptos.value.indexOf(concep);
  impuestoIndex.value = arrayConceptos.value[conceptoIndex.value].datosImpuesto.indexOf(imp);
  arrayConceptos.value[conceptoIndex.value].datosImpuesto.splice(impuestoIndex.value, 1)
}

function cerrarImpuesto() {
  dialogImpuesto.value = false;
}

function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  time = timeMensaje;
  snack.value = true;
}

</script>
