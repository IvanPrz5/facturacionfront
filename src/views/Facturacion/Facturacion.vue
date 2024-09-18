<template>
  <v-container>
    <v-row class="mx-5">
      <v-col cols="12">
        <Cliente ref="cliente" @getDatosCliente="getDatosCliente"></Cliente>
      </v-col>
      <v-col cols="12">
        <!-- <div v-show="showComprobante"> -->
        <Comprobante ref="comprobante" @abrirConcepto="crearConcepto" :editarComprobanteProp="editarComprobanteProp">
        </Comprobante>
        <!-- </div> -->
      </v-col>
      <v-col v-if="arrayConceptos.length > 0" cols="12">
        <v-card elevation="5" max-height="600" class="overflow-auto">
          <v-card-title class="d-flex">
            Conceptos Agregados
            <v-card-subtitle color="red" v-if="facturaTimbrada" class="mt-2">
              FACTURA TIMBRADA UUID:
              <strong class="text-success"> {{ uuidTimbrado }} </strong>
            </v-card-subtitle>
            <v-spacer></v-spacer>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="indigo" @click="crearConcepto" v-if="!facturaTimbrada || !editarProp"
              append-icon="mdi-plus">Agregar Concepto</v-btn>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="indigo" @click="showImpuestoLocales" v-if="!facturaTimbrada || !editarProp"
              append-icon="mdi-plus">Impuesto Local</v-btn>
          </v-card-title>
          <v-card-text>
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
                          <h4 class="px-2 text-info">
                            Importe : {{ i.importe }},
                          </h4>
                          <h4 class="px-2 text-error">
                            Descuento : {{ i.descuento }},
                          </h4>
                          <h4 v-if="i.datosImpuesto.length > 0" class="px-2 text-orange">
                            Impuesto: {{ (i.totalImp, getTotalConcepImp(i)) }}
                          </h4>
                          <h4 class="px-2 text-green">
                            Total :
                            {{
          totalConcepto(i.importe, i.descuento, i.totalImp)
        }}
                          </h4>
                        </div>
                      </v-list-item>
                    </v-col>
                    <v-col cols="2" v-if="!facturaTimbrada || !editarProp">
                      <v-btn v-if="i.idObjetoImp != '01'" variant="text" icon color="green-lighten-2"
                        @click="crearImpuesto(i)">
                        <v-icon>mdi-cash-plus</v-icon>
                        <v-tooltip activator="parent" location="end">Agregar Impuesto</v-tooltip>
                      </v-btn>
                      <v-btn variant="text" icon color="blue-lighten-2" @click="editarConcepto(i)">
                        <v-icon>mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="end">Editar Concepto</v-tooltip>
                      </v-btn>
                      <v-btn v-if="arrayConceptos.length > 1" variant="text" icon color="red-lighten-2"
                        @click="eliminarConcepto(i)">
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="end">Eliminar Concepto</v-tooltip>
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>
                <v-list-item>
                  <div class="d-flex align-center justify-center">
                    <div>
                      <div class="text-subtitle-2 text-medium-emphasis">
                        Producto o Servicio: {{ i.idClaveProdServ }}.-
                        {{ i.claveProdServDesc }}
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
                        {{ (i.totalTras, getTotalConcepTras(i)) }}
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
                            <v-list-item :title="codImpuesto(j.impuesto)">
                              <div class="d-flex">
                                <v-list-item-subtitle>Importe :
                                  {{ j.importe }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Base : {{ j.base }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Tipo Factor :
                                  {{ j.tipoFactor }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Tasa ó Cuota :
                                  {{ j.tasaCuota }}</v-list-item-subtitle>
                              </div>
                            </v-list-item>
                          </v-col>
                          <v-col cols="2" v-if="!facturaTimbrada || !editarProp">
                            <v-btn variant="text" icon color="indigo-lighten-2" @click="editarImpuesto(j, i)">
                              <v-icon>mdi-pencil-box-outline</v-icon>
                              <v-tooltip activator="parent" location="end">Editar Impuesto</v-tooltip>
                            </v-btn>
                            <v-btn v-if="i.datosImpuesto.length > 1" variant="text" icon color="purple-lighten-2"
                              @click="eliminarImpuesto(j, i)">
                              <v-icon>mdi-delete-circle-outline</v-icon>
                              <v-tooltip activator="parent" location="end">Eliminar Impuesto</v-tooltip>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-list-item>
                    </div>
                  </v-list-group>
                  <v-list-group v-if="i.datosImpuesto.length > 0">
                    <template v-slot:activator="{ props }">
                      <v-list-item v-bind="props">
                        Impuestos Retenidos:
                        {{ (i.totalRete, getTotalConcepRete(i)) }}
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
                            <v-list-item :title="codImpuesto(j.impuesto)">
                              <div class="d-flex">
                                <v-list-item-subtitle v-if="!j.isTrasladado">Importe :
                                  {{ j.importe }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Base : {{ j.base }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Tipo Factor :
                                  {{ j.tipoFactor }}</v-list-item-subtitle>
                                <v-list-item-subtitle class="px-2">Tasa ó Cuota :
                                  {{ j.tasaCuota }}</v-list-item-subtitle>
                              </div>
                            </v-list-item>
                          </v-col>
                          <v-col cols="2" v-if="!facturaTimbrada || !editarProp">
                            <v-btn variant="text" icon color="indigo-lighten-2" @click="editarImpuesto(j, i)">
                              <v-icon>mdi-pencil-box-outline</v-icon>
                              <v-tooltip activator="parent" location="end">Editar Impuesto</v-tooltip>
                            </v-btn>
                            <v-btn variant="text" icon color="purple-lighten-2" v-if="i.datosImpuesto.length > 1"
                              @click="eliminarImpuesto(j, i)">
                              <v-icon>mdi-delete-circle-outline</v-icon>
                              <v-tooltip activator="parent" location="end">Eliminar Impuesto</v-tooltip>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-list-item>
                    </div>
                  </v-list-group>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mx-5">
      <v-col cols="8">
        <v-card v-if="arrayAux.length > 0" elevation="10" max-height="300" class="overflow-auto">
          <v-card-title>Impuestos Locales</v-card-title>
          <v-card-text>
            <v-list>
              <div v-for="(item, i) in arrayAux" class="d-flex">
                <v-list-item>{{ i + 1 }}</v-list-item>
                <v-list-item>Impuesto : {{ item.impuesto }}</v-list-item>
                <v-list-item>Porcentaje : {{ item.tasaCuota }}</v-list-item>
                <v-list-item>Monto : {{ item.importe }}</v-list-item>
                <v-list-item>
                  <v-chip :color="getColor(item.isTrasladado)">
                    {{
          (textChip = item.isTrasladado ? "Trasladado" : "Retenido")
        }}
                  </v-chip>
                </v-list-item>
                <v-list-item v-if="!facturaTimbrada || !editarProp">
                  <v-btn variant="text" icon color="indigo-lighten-2" @click="editarLocal(item)">
                    <v-icon>mdi-pencil-box-outline</v-icon>
                    <v-tooltip activator="parent" location="end">Editar Impuesto</v-tooltip>
                  </v-btn>
                  <v-btn variant="text" icon color="purple-lighten-2" @click="quitarLocal(item)">
                    <v-icon>mdi-delete-circle-outline</v-icon>
                    <v-tooltip activator="parent" location="end">Eliminar Impuesto</v-tooltip>
                  </v-btn>
                </v-list-item>
              </div>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4" v-if="(arrayConceptos.length > 0 && !facturaTimbrada) || !editarProp">
        <v-card class="elevation-5 d-flex">
          <v-card-text>
            <h3 class="text-info">SubTotal :</h3>
          </v-card-text>
          <v-card-text style="display: flex; flex-direction: column; align-items: end">
            <h3 class="text-info">{{ resultados.subTotal }}</h3>
          </v-card-text>
        </v-card>
        <v-card class="elevation-5 d-flex mt-2">
          <v-card-text>
            <h3>Trasladados :</h3>
            <h3>Retenidos :</h3>
            <!-- <h3 style="color: green">Total :</h3> -->
          </v-card-text>
          <v-card-text style="display: flex; flex-direction: column; align-items: end">
            <h3>{{ resultados2 }}</h3>
            <h3>{{ resultados3 }}</h3>
          </v-card-text>
        </v-card>
        <v-card class="elevation-5 d-flex mt-2">
          <v-card-text>
            <h3>Locales Trasladados :</h3>
            <h3>Locales Retenidos :</h3>
          </v-card-text>
          <v-card-text style="display: flex; flex-direction: column; align-items: end">
            <h3>{{ resultados4 }}</h3>
            <h3>{{ resultados5 }}</h3>
          </v-card-text>
        </v-card>
        <v-card class="elevation-5 d-flex mt-2">
          <v-card-text>
            <h3 style="color: red">Descuento :</h3>
            <h3 style="color: green">Total :</h3>
          </v-card-text>
          <v-card-text style="display: flex; flex-direction: column; align-items: end">
            <h3 style="color: red">{{ resultados.descuento }}</h3>
            <h3 style="color: green">{{ resultados.total }}</h3>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="d-flex" v-if="(arrayConceptos.length > 0 && !facturaTimbrada) || !editarProp">
        <!-- <v-spacer></v-spacer> -->
        <div style="display: flex; gap: 10px">
          <v-btn v-if="arrayConceptos.length > 0 && props.propsEditarFactura == null" color="red"
            @click="cancelarTimbrado">
            Limpiar
          </v-btn>
          <v-btn color="info" @click="vistaPrevia">
            Generar Vista Previa
          </v-btn>
          <v-btn color="warning" @click="timbrarDespues">
            Timbrar Despues
          </v-btn>
          <v-btn color="success" @click="timbrar"> Timbrar </v-btn>
          <v-btn v-if="isAdmin == 'JEFE'" color="purple" @click="openMailDialog">Enviar Mail</v-btn>
        </div>
      </v-col>
      <v-col cols="6" v-if="facturaTimbrada && editarProp">
          <v-btn color="indigo" @click="crearConcepto"> Agregar Concepto </v-btn>
          <v-btn v-if="arrayConceptos.length > 0" class="ml-2" color="purple" @click="openMailDialog">Enviar Mail</v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="showImpLocales" width="900">
      <ImpuestoLocal :propSubTotal="propSubTotal" @setImpLocales="getImpLocales" :editImpLocal="editImpLocal" @actualizarLocal="actualizarLocal">
      </ImpuestoLocal>
    </v-dialog>
    <v-dialog v-model="showConcepto" width="900">
      <Concepto ref="concepto" :propConcepto="propConcepto" @setDatosConcepto="getDatosConceptos"
        @actualizar="actualizar" @closeConcepto="cerrarConcepto" />
    </v-dialog>
    <v-dialog v-model="dialogImpuesto" width="900" persistent>
      <Impuesto ref="impuesto" :propImporte="propImporte" :propImpuesto="propImpuesto" :propTabla="propTabla"
        @closeImpuesto="cerrarImpuesto" @actualizarImpuesto="actualizarImpuesto"
        @setDatosImpuesto="getDatosImpuestos" />
    </v-dialog>
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
    <v-dialog v-model="mailDialog" width="500" >
      <MailForm :data="data"></MailForm>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";

import Cliente from "@/components/cliente/Cliente.vue";
import Comprobante from "@/components/comprobante/Comprobante.vue";
import Concepto from "@/components/concepto/Concepto.vue";
import Impuesto from "@/components/impuesto/Impuesto.vue";
import ImpuestoLocal from "@/components/impuesto/ImpuestoLocal.vue";
import MailForm from "@/components/mail/MailForm.vue";

const cliente = ref<InstanceType<typeof Cliente> | null>(null);
const comprobante = ref<InstanceType<typeof Comprobante> | null>(null);
const concepto = ref<InstanceType<typeof Concepto> | null>(null);
const impuesto = ref<InstanceType<typeof Impuesto> | null>(null);

const props = defineProps(["propsEditarFactura", "editarComprobanteProp"]);
const emit = defineEmits(["cerrarVentanaFacturacion"]);

const appStore = storeApp();

let datosFactura: any = ref({});

let textChip: any = ref();
let showConcepto: any = ref(false);

let dialogImpuesto: any = ref(false);
let showImpLocales: any = ref(false);
let loader: any = ref(false);
let editarProp: any = ref(true);
let facturaTimbrada: any = ref(true);

let arrayConceptos: any = ref([]);
let propConcepto: any = ref();
let propImpuesto: any = ref();
let propImporte: any = ref();
let propTabla: any = ref();

let uuidTimbrado: any = ref(null);

let conceptoIndex: any = ref(-1);
let conceptoIndexAux: any = ref(-1);
let precargadoIndex: any = ref(-1);
let impuestoIndex: any = ref(-1);
let despues: any = ref();

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let editarFacturaProp: any = ref();
let editarComprobanteProp: any = ref();
let propSubTotal: any = ref();
let arrayAux: any = ref([]);

let editImpLocal: any = ref();
let indexLocal: any = ref(-1);

const mailDialog = ref(false);
const data: any = ref();
const isAdmin = ref("");

onMounted(() => {

  if(localStorage.getItem('roleAdmin') != null){
    isAdmin.value = 'JEFE'
  }

  if (props.propsEditarFactura != undefined) {
    editarComprobanteProp.value = props.propsEditarFactura.datosComprobante;
    editarFacturaProp.value = props.propsEditarFactura.datosCliente;
    arrayConceptos.value = props.propsEditarFactura.datosConcepto;
    arrayAux.value = props.propsEditarFactura.datosLocales;
    editarProp.value = false;
  }
});

let resultados = computed(() => {
  let aux = 0;
  let aux2 = 0;
  let aux3 = 0;
  let aux4 = 0;
  let aux5 = 0;
  let aux6 = 0;
  for (let i = 0; i < arrayConceptos.value.length; i++) {
    aux += Number(arrayConceptos.value[i].importe);
    aux2 += Number(arrayConceptos.value[i].descuento);
    aux3 += Number(arrayConceptos.value[i].totalImp);
  }

  if (arrayAux.value != null) {
    for (let i = 0; i < arrayAux.value.length; i++) {
      if (arrayAux.value[i].isTrasladado == true) {
        aux5 += Number(arrayAux.value[i].importe);
      } else {
        aux6 += Number(arrayAux.value[i].importe);
      }
    }
    arrayConceptos.value.totalImpLocales = Number(aux5) + -Number(aux6);
  }
  let obj = {
    subTotal: "",
    descuento: "",
    total: "",
  };
  obj.subTotal = Number(aux).toFixed(2);
  obj.descuento = Number(aux2).toFixed(2);
  aux4 = Number(obj.subTotal) - Number(obj.descuento) + aux3;

  obj.total = Number(aux4).toFixed(2);

  if (arrayConceptos.value.totalImpLocales != null) {
    let algo = Number(aux4) + Number(arrayConceptos.value.totalImpLocales);
    obj.total = Number(algo).toFixed(2);
  }
  return obj;
});

let resultados2 = computed(() => {
  let aux = 0;
  for (let i = 0; i < arrayConceptos.value.length; i++) {
    for (let j = 0; j < arrayConceptos.value[i].datosImpuesto.length; j++) {
      if (arrayConceptos.value[i].datosImpuesto[j].isTrasladado == true) {
        aux += Number(arrayConceptos.value[i].datosImpuesto[j].importe);
      }
    }
  }

  let total = Number(aux).toFixed(2);
  return total;
});

let resultados3 = computed(() => {
  let aux = 0;
  for (let i = 0; i < arrayConceptos.value.length; i++) {
    for (let j = 0; j < arrayConceptos.value[i].datosImpuesto.length; j++) {
      if (arrayConceptos.value[i].datosImpuesto[j].isTrasladado == false) {
        aux += Number(arrayConceptos.value[i].datosImpuesto[j].importe);
      }
    }
  }
  let total = Number(aux).toFixed(2);
  return total;
});

let resultados4 = computed(() => {
  let aux = 0;
  for (let i = 0; i < arrayAux.value.length; i++) {
    if (arrayAux.value[i].isTrasladado == true) {
      aux += Number(arrayAux.value[i].importe);
    }
  }
  let total = Number(aux).toFixed(2);
  return total;
  // arrayConceptos.value.totalLocaleTras = aux.toFixed(2);
});

let resultados5 = computed(() => {
  let aux = 0;
  for (let i = 0; i < arrayAux.value.length; i++) {
    if (arrayAux.value[i].isTrasladado == false) {
      aux += Number(arrayAux.value[i].importe);
    }
  }
  let total = Number(aux).toFixed(2);
  return total;
  // arrayConceptos.value.totalLocaleRete = aux.toFixed(2);
});

async function generarFactura() {
  let datosComprobante = await getDatosComprobante();
  let datosCliente = await getDatosCliente();
  if (datosCliente != null && datosComprobante != null) {
    let ruta = "/Facturacion/timbrarXml";

    datosFactura.value.datosConcepto = arrayConceptos.value;
    if (despues.value == -1) {
      datosFactura.value.datosComprobante.isTimbrado = false;
    }
    datosFactura.value.idEmpresa = appStore.empresa.id;
    if (arrayAux.value.length > 0) {
      datosFactura.value.datosLocales = arrayAux.value;
    } else {
      datosFactura.value.datosLocales = [];
    }
    loader.value = true;

    await axios
      .post(appStore.link + ruta, datosFactura.value)
      .then((response) => {
        if (response.data.status == 0) {
          loader.value = false;
          if (
            response.data.mensaje !=
            "Los datos se guardaron para timbrar despues"
          ) {
            mostrarSnack(
              "green",
              "Se timbro con el uuid: " + response.data.mensaje,
              3500
            );
            emit("cerrarVentanaFacturacion");
            uuidTimbrado.value = response.data.mensaje;
            descargarArchivos(response.data.mensaje, datosFactura.value);
            facturaTimbrada.value = true;
            emit("cerrarVentanaFacturacion", response.data.mensaje);
            
          } else {
            mostrarSnack("green", response.data.mensaje, 5000);
            emit("cerrarVentanaFacturacion", response.data.mensaje);
          }
        } else {
          loader.value = false;
          mostrarSnack("error", response.data.mensaje, 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal" + e);
      });
  } else {
    console.log("No dejar campos vacios");
  }
}

function timbrar() {
  despues.value = 1;
  generarFactura();
}

function timbrarDespues() {
  despues.value = -1;
  generarFactura();
}

async function getDatosCliente() {
  return (datosFactura.value.datosReceptor =
    await cliente.value?.setDatosCliente());
}

async function getDatosComprobante() {
  datosFactura.value.datosComprobante =
    await comprobante.value?.setDatosComprobante();
  datosFactura.value.datosComprobante.isTimbrado = true;
  return datosFactura.value.datosComprobante;
}

function crearConcepto() {
  if (uuidTimbrado.value != null) {
    arrayConceptos.value = [];
    arrayAux.value = [];
    uuidTimbrado.value = false;
  }
  showConcepto.value = true;
  propConcepto.value = null;
}

function getDatosConceptos(item: any) {
  if (item != null) {
    if (facturaTimbrada.value == true && editarProp == true) {
      arrayConceptos.value = [];
    }
    arrayConceptos.value.push(item);
    cerrarConcepto();
    facturaTimbrada.value = false;
    if (item.idObjetoImp != "01") {
      crearImpuesto(item);
    }else{
      item.datosImpuesto = [];
    }
  }
}

function editarConcepto(item: any) {
  showConcepto.value = true;
  propConcepto.value = item;
  conceptoIndex.value = arrayConceptos.value.indexOf(item);
  conceptoIndexAux.value = arrayConceptos.value.indexOf(item)
}

function actualizar(item: any) {
  if (item != null) {
    Object.assign(arrayConceptos.value[conceptoIndex.value], item);
    if (item.idObjetoImp != "01") {
      crearImpuesto(item);
    }
    if (item.idObjetoImp == "01") {
      arrayConceptos.value[conceptoIndex.value].datosImpuesto = [];
    }
  }
}

function eliminarConcepto(item: any) {
  let index = arrayConceptos.value.indexOf(item);
  arrayConceptos.value.splice(index, 1);
}

function cerrarConcepto() {
  showConcepto.value = false;
}

function crearImpuesto(item: any) {
  dialogImpuesto.value = true;
  propImpuesto.value = null;
  if (item.datosImpuesto.length > 0) {
    propTabla.value = item.datosImpuesto;
  } else {
    propTabla.value = [];
  }
  propImporte.value = item.importe;
  precargadoIndex.value = arrayConceptos.value.indexOf(item);

  if (item.datosImpuesto.length > 0) {
    conceptoIndex.value = arrayConceptos.value.indexOf(item);
  } else {
    conceptoIndex.value = arrayConceptos.value.indexOf(item);
  }
}

function getDatosImpuestos(item: any) {
  if (item != null) {
    let numTrasladados = 0;
    let numRetenciones = 0;
    for (let i = 0; i < item.length; i++) {
      if (item[i].isTrasladado == true) {
        numTrasladados++;
      } else {
        numRetenciones++;
      }
    }
    if(conceptoIndex.value != -1){
      arrayConceptos.value[conceptoIndex.value].datosImpuesto = item;
      arrayConceptos.value[conceptoIndex.value].numTrasladados = numTrasladados;
      arrayConceptos.value[conceptoIndex.value].numRetenciones = numRetenciones;
    }
    /* if(conceptoIndexAux.value != -1){
      arrayConceptos.value[conceptoIndexAux.value].datosImpuesto = item;
      arrayConceptos.value[conceptoIndexAux.value].numTrasladados = numTrasladados;
      arrayConceptos.value[conceptoIndexAux.value].numRetenciones = numRetenciones;
    } */
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
  if (
    precargadoIndex.value != -1 &&
    arrayConceptos.value[precargadoIndex.value].precargado &&
    propImpuesto.value == null
  ) {
    let array = {
      datosConcepto: [],
      idEmpresa: null,
    };
    array.datosConcepto = arrayConceptos.value[precargadoIndex.value];
    array.idEmpresa = appStore.empresa.id;
    guardarPrecargado(array);
  }
}

function getTotalConcepTras(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  for (let j = 0; j < arrayConceptos.value[index].datosImpuesto.length; j++) {
    if (arrayConceptos.value[index].datosImpuesto[j].isTrasladado == true) {
      aux += Number(arrayConceptos.value[index].datosImpuesto[j].importe);
    }
  }
  return (arrayConceptos.value[index].totalTras = Number(aux).toFixed(2));
}

function getTotalConcepRete(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  for (let j = 0; j < arrayConceptos.value[index].datosImpuesto.length; j++) {
    if (arrayConceptos.value[index].datosImpuesto[j].isTrasladado == false) {
      aux += Number(arrayConceptos.value[index].datosImpuesto[j].importe);
    }
  }
  return (arrayConceptos.value[index].totalRete = Number(aux).toFixed(2));
}

function getTotalConcepImp(item: any) {
  let aux = 0;
  let index = arrayConceptos.value.indexOf(item);
  aux =
    Number(arrayConceptos.value[index].totalTras) +
    -Number(arrayConceptos.value[index].totalRete);
  arrayConceptos.value[index].totalImp = Number(aux).toFixed(2);
  return aux.toFixed(2);
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

async function descargarArchivos(uuid: any, datosFactura: any) {
  await axios
    .post(
      appStore.link +
      "/Xml/descargarArchivos/" +
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

async function guardarPrecargado(item: any) {
  let ruta = "/ConceptosPrecargados/add";
  await axios
    .post(appStore.link + ruta, item)
    .then((response) => {
      if (response.data == 0) {
        mostrarSnack("success", "Se guardo como precargado", 4500);
      } else {
        mostrarSnack("error", "Error", 5000);
      }
    })
    .catch((e) => {
      console.log("Fatal" + e);
    });
}

function cancelarTimbrado() {
  arrayConceptos.value = [];
  facturaTimbrada.value = true;
  editarProp.value = true;
  // Aqui va el limpiar el campos
  
}

async function vistaPrevia() {
  let datosComprobante = await getDatosComprobante();
  let datosCliente = await getDatosCliente();
  if (datosCliente != null && datosComprobante != null) {
    let ruta = "/Facturacion/vistaPrevia/" + appStore.empresa.id;

    datosFactura.value.datosConcepto = arrayConceptos.value;
    if (despues.value == -1) {
      datosFactura.value.datosComprobante.isTimbrado = false;
    }
    if (arrayAux.value.length > 0) {
      datosFactura.value.datosLocales = arrayAux.value;
    } else {
      datosFactura.value.datosLocales = [];
    }
    datosFactura.value.idEmpresa = appStore.empresa.id;
    loader.value = true;
    await axios
      .post(appStore.link + ruta, datosFactura.value, {
        responseType: "blob",
      })
      .then((response: any) => {
        let url = window.URL.createObjectURL(new Blob([response.data]));
        let link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Vista Previa" + new Date().toLocaleDateString() + ".pdf");
        document.body.appendChild(link);
        link.click();
        loader.value = false;
      })
      .catch((e: any) => {
        console.log("Error al generar vista Previa  " + e);
      });
  } else {
    console.log("No dejar campos vacios");
  }
}

function showImpuestoLocales() {
  showImpLocales.value = true;
  propSubTotal.value = resultados.value.subTotal;
}

function getImpLocales(item: any) {
  showImpLocales.value = false;
  arrayAux.value.push(item);
}

function editarLocal(item: any) {
  showImpLocales.value = true;
  editImpLocal.value = item;
  indexLocal.value = arrayAux.value.indexOf(item);
}

function quitarLocal(item: any) {
  let index = arrayAux.value.indexOf(item);
  arrayAux.value.splice(index, 1);
}

function getColor(item: any) {
  if (item == false) return "warning";
  else return "green";
}

function actualizarLocal(item: any){
  showImpLocales.value = false;
  Object.assign(arrayAux.value[indexLocal.value], item);
}

async function openMailDialog(){

  let datosComprobante = await getDatosComprobante();
  let datosCliente = await getDatosCliente();
  if (datosCliente != null && datosComprobante != null) {
    mailDialog.value = true;

    datosFactura.value.datosConcepto = arrayConceptos.value;
    datosFactura.value.idEmpresa = appStore.empresa.id;
    if (arrayAux.value.length > 0) {
      datosFactura.value.datosLocales = arrayAux.value;
    } else {
      datosFactura.value.datosLocales = [];
    }
    if(uuidTimbrado.value){
      datosFactura.value.datosComprobante.uuid = uuidTimbrado.value;
    }else{
      datosFactura.value.datosComprobante.uuid = "XXXXXXXXXX";
    }

    data.value = datosFactura.value;
  }else{
    console.log("DatosVacio")
  }
}

</script>
