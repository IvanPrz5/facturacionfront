<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <Cliente ref="cliente" @getDatosCliente="getDatosCliente"></Cliente>
      </v-col>
      <v-col cols="12">
        <div v-show="showComprobante">
          <Comprobante ref="comprobante" @abrirConcepto="abrirConcepto"></Comprobante>
        </div>
      </v-col>
      <v-col v-if="arrayConceptos.length > 0" cols="12">
        <v-card>
          <v-card-title class="bg-primary">Conceptos Agregados</v-card-title>
          <v-list>
            <v-list-group v-for="i in arrayConceptos">
              <template v-slot:activator="{ props }">
                <v-row no-gutters>
                  <v-col cols="10">
                    <v-list-item v-bind="props" :title="i.descripcion"></v-list-item>
                  </v-col>
                  <v-col cols="2">
                    <v-btn variant="text" icon="mdi-cash-plus" color="green-lighten-2" @click="abrirImpuesto(i)"></v-btn>
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
                      Clave Unidad: {{ i.unidad }}
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
                          @click="editarImpuesto(j)"></v-btn>
                        <v-btn variant="text" icon="mdi-delete-circle-outline" color="purple-lighten-2"
                          @click="eliminarImpuesto(j)"></v-btn>
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
      <v-col>
        <v-btn color="primary" @click="generarFactura"> Generar Factura </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="showConcepto" width="900" eager>
    <Concepto ref="concepto" @setDatosConcepto="getDatosConceptos" @closeConcepto="cerrarConcepto" />
  </v-dialog>
  <v-dialog v-model="dialogImpuesto" width="700">
    <Impuesto ref="impuesto" @closeImpuesto="cerrarImpuesto" @setDatosImpuesto="getDatosImpuestos" />
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
let arrayImpuestos: any = ref([]);

let conceptoIndex: any = ref(-1);

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

async function generarFactura() {
  // dialog.value = true;
  let datosCliente = getDatosCliente();
  console.log(datosFactura.value.datosReceptor)
  // let datosComprobante = getDatosComprobante();
  /* if (datosCliente != null && datosComprobante != null) {
    datosFactura.value.datosConcepto = arrayConceptos.value;
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
  } else {
    console.log("No dejar campos vacios")
  } */
}

function getDatosCliente() {
  datosFactura.value.datosReceptor = cliente.value?.setDatosCliente();
}

function getDatosComprobante() {
  datosFactura.value.datosComprobante = comprobante.value?.setDatosComprobante();
}

function getDatosConceptos(item: any) {
  if (item != null) {
    arrayConceptos.value = item;
    console.log(arrayConceptos.value)
    // arrayConceptos.value.datosImpuesto = item.datosImpuesto;
    cerrarConcepto();
  } else {
    console.log(item)
  }
}

function getDatosImpuestos(item: any) {
  arrayImpuestos.value = item;
  arrayConceptos.value[conceptoIndex.value].datosImpuesto = item;
  cerrarImpuesto();
}

function abrirConcepto() {
  showConcepto.value = true;
  cliente.value?.ocultar();
}

function editarConcepto(item: any) {
  showConcepto.value = true;
  concepto.value?.cargarDatos(item);
}

function eliminarConcepto(item: any) {
  arrayConceptos.value.splice(item, 1);
}

function cerrarConcepto() {
  showConcepto.value = false;
}

function abrirImpuesto(item: any) {
  dialogImpuesto.value = true;
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
}

function editarImpuesto(item: any) {
  impuesto.value?.cargarDatos(item);
}

function eliminarImpuesto(item: any) {
  arrayConceptos.value[conceptoIndex.value].datosImpuesto.splice(item.value);
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
