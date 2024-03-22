<template>
  <v-card>
    <v-card-title class="d-flex bg-primary">
      Concepto
      <v-spacer></v-spacer>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn color="success" v-if="props.propConcepto == null" @click="conceptosPrecargadosDialog = true">
        Aplicar Concepto Precargado
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text v-show="showConcepto">
      <v-form ref="conceptoForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12" class="pa-1">
            <v-textarea variant="outlined" label="Concepto" rows="3" counter="1000" no-resize
              v-model="conceptoClass.descripcion" :rules="[rules.requerido]"></v-textarea>
          </v-col>
          <v-col cols="12" class="pa-1 d-flex">
            <v-text-field variant="outlined" density="compact" label="Buscar Producto o Servicio"
              v-model="codClaveProdServ" @keyup.enter="getClaveProdServ" append-inner-icon="mdi-magnify"></v-text-field>
              <v-btn class="ml-2" color="primary" @click="busquedaAvanzada()">
                <v-icon size="large">mdi-help</v-icon>
                <v-tooltip activator="parent" location="end">Busqueda Avanzada</v-tooltip>
              </v-btn>
          </v-col>
          <v-col cols="12" class="pa-1" v-if="conceptoClass.idClaveProdServ != null">
            <v-text-field variant="plain" density="compact" readonly v-model="conceptoClass.idClaveProdServ"
              label="Clave.- Descripcion de producto y servicio"></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Buscar Unidad" @keyup.enter="getClaveUnidad"
              v-model="codClaveUnidad" append-inner-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-1" v-if="conceptoClass.idClaveUnidad != null">
            <v-text-field variant="plain" density="compact" readonly v-model="conceptoClass.idClaveUnidad"
              label="Clave.- Descripcion de Unidad"></v-text-field>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Cantidad" v-model="conceptoClass.cantidad"
              :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Valor Unitario"
              v-model="conceptoClass.valorUnitario" :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Importe" v-model="conceptoClass.importe"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="3" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Descuento" v-model="conceptoClass.descuento"
              :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Objeto Impuesto" :items="itemsObjetoImp"
              :item-title="titleAutoComplete" item-value="codigo" v-model="conceptoClass.idObjetoImp"
              ></v-autocomplete>
          </v-col>
          <v-col cols="4" class="mb-4 pa-1" v-if="props.propConcepto == null">
            <v-btn variant="tonal" block color="primary" @click="guardarPrecargado">
              Guardar Como Precargado
            </v-btn>
          </v-col>
          <v-col :cols="props.propConcepto == null ? 8 : 12" class="mb-4 pa-1">
            <v-btn variant="tonal" block color="success" @click="agregarConcepto">
              {{ btnText }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    {{ auxImp }}
  </v-card>
  <v-dialog v-model="conceptosPrecargadosDialog" width="1000">
    <ConceptosPrecargados @emitConceptoPre="getEmitConceptoPre" />
  </v-dialog>
  <v-dialog v-model="listClaveProdServDialog" width="1000">
    <ListaClaveProdServ :propBusquedaAvanzada="propBusquedaAvanzada" :listClaveProdServDesc="desserts" @emitClaveProdServ="getEmitClaveProdServ"></ListaClaveProdServ>
  </v-dialog>
  <v-dialog v-model="listClaveUnidadDialog" width="1000">
    <ListaClaveUnidad :listClaveProdServDesc="desserts2" @emitClaveUnidad="getEmitClaveUnidad"></ListaClaveUnidad>
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import Rules from "@/class/Rules";

import ConceptosPrecargados from "./ConceptosPrecargados.vue";
import ListaClaveProdServ from "./ListaClaveProdServ.vue";
import ListaClaveUnidad from "./ListaClaveUnidad.vue";

const appStore = storeApp();
const rules = new Rules();

const conceptoForm: any = ref(null);
const itemsObjetoImp: any = ref([]);
const conceptoClass = appStore.concepto;

let desserts: any = ref([]);
let desserts2: any = ref([]);
let showConcepto: any = ref(true);
let conceptosPrecargadosDialog: any = ref(false);
let listClaveProdServDialog: any = ref(false);
let listClaveUnidadDialog: any = ref(false);

let codClaveProdServ: any = ref();
let codClaveUnidad: any = ref();

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

let arrayImpuestos: any = ref([]);

let btnText: any = ref("Añadir concepto a la factura");
let propBusquedaAvanzada: any = ref(false);

const props = defineProps(["propConcepto"]);
const emit = defineEmits(["setDatosConcepto", "actualizar", "closeConcepto"]);

let auxImp = computed(() => {
  if (conceptoClass.cantidad != null && conceptoClass.valorUnitario != null) {
    let aux = Number(conceptoClass.cantidad) * Number(conceptoClass.valorUnitario);
    conceptoClass.importe = Number(aux).toFixed(2);
  }
});

onMounted(() => {
  if (props.propConcepto != null) {
    btnText.value = "Editar";
    cargarDatos();
  } else {
    conceptoForm.value.reset();
  }
  getObjetoImp();
});

async function agregarConcepto() {
  const { valid } = await conceptoForm.value.validate();
  if (valid) {
    let obj = objetoConcepto();
    if (props.propConcepto != null) {
      emit("closeConcepto");
      emit("actualizar", obj);
    } else {
      emit("setDatosConcepto", obj);
    }
  } else {
    emit("setDatosConcepto", null);
  }
}

function getClaveProdServ() {
  axios
    .get(appStore.link + "/ClaveProdServ/byCod/" + codClaveProdServ.value)
    .then((response) => {
      if (response.data.length > 1) {
        listClaveProdServDialog.value = true;
        desserts.value = response.data;
        propBusquedaAvanzada.value = false;
      } else {
        conceptoClass.idClaveProdServ =
          response.data[0].codigo + ".- " + response.data[0].descripcion;
      }
      codClaveProdServ.value = null;
    })
    .catch((e) => {
      mostrarSnack("error", "No existe. Revisa tus caracteres", 5000);
    });
}

function getClaveUnidad() {
  axios
    .get(appStore.link + "/ClaveUnidad/byId/" + codClaveUnidad.value)
    .then((response) => {
      if (response.data.length > 1) {
        listClaveUnidadDialog.value = true;
        desserts2.value = response.data;
      } else {
        conceptoClass.idClaveUnidad =
          response.data[0].codigo + ".- " + response.data[0].descripcion;
      }
      codClaveUnidad.value = null;
    })
    .catch((e) => {
      mostrarSnack("error", "No existe. Revisa tus caracteres", 5000);
    });
}

function getObjetoImp() {
  axios
    .get(appStore.link + "/ObjetoImp/get")
    .then((response) => {
      itemsObjetoImp.value = response.data;
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getEmitConceptoPre(item: any) {
  if (item != null) {
    conceptoForm.value?.reset();
    Object.assign(conceptoClass, item);
    arrayImpuestos.value = item.datosImpuesto;
    conceptosPrecargadosDialog.value = false;
  }
}

function getEmitClaveProdServ(item: any) {
  listClaveProdServDialog.value = false;
  conceptoClass.idClaveProdServ = item.codigo + ".- " + item.descripcion;
}

function getEmitClaveUnidad(item: any) {
  listClaveUnidadDialog.value = false;
  conceptoClass.idClaveUnidad = item.codigo + ".- " + item.descripcion;
}

function cargarDatos() {
  conceptoClass.idClaveProdServ = props.propConcepto.idClaveProdServ + ".- " + props.propConcepto.claveProdServDesc;
  // conceptoClass.claveProdServDesc = props.propConcepto.claveProdServDesc;
  conceptoClass.idClaveUnidad = props.propConcepto.idClaveUnidad + ".- " + props.propConcepto.unidad;
  // conceptoClass.unidad = props.propConcepto.unidad;
  conceptoClass.idObjetoImp = props.propConcepto.idObjetoImp;
  conceptoClass.cantidad = props.propConcepto.cantidad;
  conceptoClass.valorUnitario = props.propConcepto.valorUnitario;
  conceptoClass.importe = props.propConcepto.importe;
  conceptoClass.descuento = props.propConcepto.descuento;
  conceptoClass.descripcion = props.propConcepto.descripcion;
}

function objetoConcepto() {
  let codClaveProdServ = conceptoClass.idClaveProdServ.split(".");
  let prodServ = codClaveProdServ[1].replace("- ", "");
  let codClaveUnidad = conceptoClass.idClaveUnidad.split(".");
  let unidad2 = codClaveUnidad[1].replace("- ", "");
  let obj = {
    idClaveProdServ: codClaveProdServ[0],
    claveProdServDesc: prodServ,
    idClaveUnidad: codClaveUnidad[0],
    unidad: unidad2,
    cantidad: conceptoClass.cantidad,
    idObjetoImp: conceptoClass.idObjetoImp,
    valorUnitario: conceptoClass.valorUnitario,
    importe: conceptoClass.importe,
    descuento: conceptoClass.descuento,
    descripcion: conceptoClass.descripcion,
    datosImpuesto: [],
    totalImp: "0.00",
    totalRete: "0.00",
    totalTras: "0.00",
  } as any;

  if (arrayImpuestos.value != null) {
    obj.datosImpuesto = arrayImpuestos.value;
  }
  if (props.propConcepto != null) {
    obj.datosImpuesto = props.propConcepto.datosImpuesto;
  }
  return obj;
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

async function guardarPrecargado() {
  const { valid } = await conceptoForm.value.validate();
  if (valid) {
    let ruta = "/ConceptosPrecargados/add";
    let obj = objetoConcepto();
    if (obj.idObjetoImp == "01") {
      let array = {
        datosConcepto: [],
        idEmpresa: null
      };
      array.datosConcepto = obj;
      array.idEmpresa = appStore.empresa.id;
      await axios
        .post(appStore.link + ruta, array)
        .then((response) => {
          if (response.data == 0) {
            // loader.value = false;
            console.log("entro aca")
            mostrarSnack("green", "Se guardo como precargado", 4500);
            emit("setDatosConcepto", obj);
            // emit("cerrarVentanaFacturacion");
            // descargarArchivos(response.data.mensaje)
          } else {
            // loader.value = false;
            mostrarSnack("error", response.data.mensaje, 5000);
          }
        })
        .catch((e) => {
          console.log("Fatal" + e);
        });
    } else {
      obj.precargado = true;
      emit("setDatosConcepto", obj);
    }
  }
}

function busquedaAvanzada(){
  listClaveProdServDialog.value = true;
  propBusquedaAvanzada.value = true;
}

defineExpose({
  cargarDatos,
});
</script>
