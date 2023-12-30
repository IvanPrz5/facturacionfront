<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card variant="tonal">
          <v-card-title class="d-flex">
            Cliente
            <v-spacer></v-spacer>
            <v-icon :icon="showCliente ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="showCliente = !showCliente"></v-icon>
          </v-card-title>
          <v-divider></v-divider>
          <v-expand-transition>
            <div class="mx-4 mt-4" v-show="showCliente">
              <v-form>
                <v-row no-gutters>
                  <v-col cols="8" class="pa-1">
                    <v-text-field variant="outlined" density="compact" label="Nombre"
                      v-model="clienteClass.nombre"></v-text-field>
                  </v-col>
                  <v-col class="pa-1">
                    <v-text-field variant="outlined" density="compact" label="RFC"
                      v-model="clienteClass.rfc"></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col class="pa-1">
                    <v-text-field variant="outlined" density="compact" label="Codigo Postal"
                      append-inner-icon="mdi-magnify" @click:append-inner="buscaCodigoPostal"
                      @keyup.enter="buscaCodigoPostal" v-model="clienteClass.idCodigoPostal">
                    </v-text-field>
                    <!-- <v-autocomplete variant="outlined" density="compact" label="Codigo Postal"></v-autocomplete> -->
                  </v-col>
                  <v-col class="pa-1">
                    <v-text-field variant="outlined" density="compact" label="Estado" v-model="nombreEstado"
                      readonly></v-text-field>
                  </v-col>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Regimen Fiscal"
                      :items="itemsRegimenFiscal" :item-title="titleAutoComplete" item-value="codigo"
                      v-model="clienteClass.codRegimenFiscal"></v-autocomplete>
                  </v-col>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Uso CFDI" :items="itemsUsoCfdi"
                      :item-title="titleAutoComplete" item-value="codigo"
                      v-model="clienteClass.codUsoCfdi"></v-autocomplete>
                  </v-col>
                </v-row>
              </v-form>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card variant="tonal">
          <v-card-title class="d-flex">
            Comprobante
            <v-spacer></v-spacer>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn @click="agregarConcepto">Añadir Concepto</v-btn>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-icon :icon="showComprobante ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="showComprobante = !showComprobante"></v-icon>
          </v-card-title>
          <v-divider></v-divider>
          <v-expand-transition>
            <div class="mx-4 mt-4" v-show="showComprobante">
              <v-form>
                <v-row no-gutters>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Tipo de Comprobante"
                      :items="itemsTipoComprobante" :item-title="titleAutoComplete" item-value="codigo"
                      v-model="comprobanteClass.idTipoComprobante"></v-autocomplete>
                  </v-col>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Exportación" :items="itemsExportacion"
                      :item-title="titleAutoComplete" item-value="codigo"
                      v-model="comprobanteClass.idExportacion"></v-autocomplete>
                  </v-col>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Forma de Pago" :items="itemsFormaPago"
                      :item-title="titleAutoComplete" item-value="codigo"
                      v-model="comprobanteClass.idFormaPago"></v-autocomplete>
                  </v-col>
                  <v-col class="pa-1">
                    <v-autocomplete variant="outlined" density="compact" label="Metodo de Pago" :items="itemsMetodoPago"
                      :item-title="titleAutoComplete" item-value="codigo"
                      v-model="comprobanteClass.idMetodoPago"></v-autocomplete>
                  </v-col>
                </v-row>
              </v-form>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-expand-transition>
          <div v-show="showConcepto">
            <Concepto ref="concepto" @closeConcepto="cerrarConcepto" @closeEditarConcepto="closeEditarConcepto" />
          </div>
        </v-expand-transition>
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
                    <v-btn variant="text" icon="mdi-cash-plus" color="green-lighten-2"
                      @click="aplicarImpuesto(i)"></v-btn>
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
                        <v-btn variant="text" icon="mdi-pencil-box-outline" color="indigo-lighten-2" @click="editarImpuesto(j)"></v-btn>
                        <v-btn variant="text" icon="mdi-delete-circle-outline" color="purple-lighten-2" @click="eliminarImpuesto(j)"></v-btn>
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
                          Importe: {{ j.base }}
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
        <v-btn @click="generarFactura"> Generar Factura </v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="dialogImpuesto" width="700">
      <Impuesto ref="impuesto" @closeImpuesto="cerrarImpuesto" @closeEditarImpuesto="cerrarImpuestoEditar" @datosImpuesto="datosImpuesto" />
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Concepto from '@/components/concepto/Concepto.vue';
import Impuesto from '@/components/impuesto/Impuesto.vue'

const concepto = ref<InstanceType<typeof Concepto> | null>(null);
const impuesto = ref<InstanceType<typeof Impuesto> | null>(null);

const appStore = storeApp();
const clienteClass = appStore.cliente;
const comprobanteClass = appStore.comprobante
const itemsRegimenFiscal: any = ref([]);
const itemsUsoCfdi: any = ref([]);
let nombreEstado: any = ref();

const itemsTipoComprobante: any = ref([]);
const itemsExportacion: any = ref([]);
const itemsFormaPago: any = ref([]);
const itemsMetodoPago: any = ref([]);

let comprobante2: any = ref({});

let showCliente: any = ref(true);
let showComprobante: any = ref(true);
let showConcepto: any = ref(false);
let showListConceptos: any = ref(true);
let dialogImpuesto: any = ref(false);

let arrayConceptos: any = ref([]);
let arrayImpuestos: any = ref([]);

let editedIndex: any = ref(-1);

onMounted(() => {
  getRegimenFiscal();
  getUsoCfdi();

  getTipoComprobante();
  getExportacion();
  getFormaPago();
  getMetodoPago();
});

function getRegimenFiscal() {
  axios
    .get(appStore.link + "/RegimenFiscal/get")
    .then((response) => {
      itemsRegimenFiscal.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getUsoCfdi() {
  axios
    .get(appStore.link + "/UsoCFDI/get")
    .then((response) => {
      itemsUsoCfdi.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function buscaCodigoPostal() {
  // console.log(clienteClass.idCodPostal)
  axios
    .get(appStore.link + "/CodigoPostal/byId/" + clienteClass.idCodigoPostal)
    .then((response) => {
      nombreEstado.value = response.data[0].descripcion;
    })
    .catch((e) => {
      console.log("Fatal" + e);
    });
}

function getTipoComprobante() {
  axios
    .get(appStore.link + "/TipoComprobante/get")
    .then((response) => {
      itemsTipoComprobante.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getExportacion() {
  axios
    .get(appStore.link + "/Exportacion/get")
    .then((response) => {
      itemsExportacion.value = response.data;
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

function getMetodoPago() {
  axios
    .get(appStore.link + "/MetodoPago/get")
    .then((response) => {
      itemsMetodoPago.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function generarFactura() {
  comprobante2.value.datosReceptor = clienteClass;
  comprobante2.value.datosComprobante = comprobanteClass;
  axios
    .post(appStore.link + "/Facturacion/crearXml", comprobante2.value)
    .then((response) => {
      console.log(response.data);
    })
    .catch((e) => {
      console.log("Fatal" + e);
    });
}

function getConcepto(datos: any) {
  console.log(datos)
  /* let subTotal = 0.0;
  let descuento = 0.0;

  for (let i = 0; i < comprobante2.value.datosConcepto.length; i++) {
    console.log(comprobante2.value.datosConcepto[i].importe);
    subTotal += parseFloat(comprobante2.value.datosConcepto[i].importe);
    descuento += parseFloat(comprobante2.value.datosConcepto[i].descuento);
  }

  let total = subTotal - descuento; */
  // Object.assign(comprobante2.value, datos);
}

function agregarConcepto() {
  showConcepto.value = true;
  showCliente.value = false;
  showListConceptos.value = true;
}

function eliminarConcepto(item: any) {
  arrayConceptos.value.splice(item, 1);
}

function editarConcepto(item: any) {
  showConcepto.value = true
  concepto.value?.cargarDatos(item);
}

function cerrarConcepto(data: any) {
  showConcepto.value = false;
  arrayConceptos.value = data;
  comprobante2.value.datosConcepto = data;
}

function aplicarImpuesto(item: any) {
  dialogImpuesto.value = true;
  editedIndex.value = arrayConceptos.value.indexOf(item);
}

function closeEditarConcepto() {
  showConcepto.value = false;
}

function datosImpuesto(data: any){
  arrayImpuestos.value = data;
  arrayConceptos.value[editedIndex.value].datosImpuesto = data;
}

function cerrarImpuesto() {
  dialogImpuesto.value = false;
  // arrayImpuestos.value = data;
  // arrayConceptos.value[editedIndex.value].datosImpuesto = data;
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
}

function cerrarImpuestoEditar(){
  dialogImpuesto.value = false;
}

function editarImpuesto(item: any) {
  dialogImpuesto.value = true;
  console.log(item);
  impuesto.value?.cargarDatos(item);
  // concepto.value?.cargarDatos(item);
}

function eliminarImpuesto(item: any) {
  // arrayConceptos.value.splice(item, 1);
  arrayConceptos.value[editedIndex.value].datosImpuesto.splice(item, 1);
  console.log(arrayConceptos.value);
}

/* import Comprobante from '@/components/comprobante/Comprobante.vue';

const concepto = ref <InstanceType <typeof Concepto> | null> (null);*/
</script>
