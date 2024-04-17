<template>
  <v-card>
    <v-card-title class="bg-primary"> {{ btnText }} Cliente </v-card-title>
    <v-card-text class="mt-2">
      <v-form ref="añadirClienteForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="8" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Nombre" v-model="nombre"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="RFC" v-model="rfc" :rules="[
      rules.minimoDeCaracteres(rfc, 11),
      rules.maximoDeCaracteres(rfc, 13),
    ]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Codigo Postal" v-model="domicilioFiscal" :rules="[
      rules.requerido,
      rules.totalCaracteres(domicilioFiscal, 5),
    ]"></v-text-field>
          </v-col>
          <v-col cols="8" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Regimen Fiscal" v-model="regimenFiscal"
              :rules="[rules.requerido]" :items="itemsRegimenFiscal" :item-title="titleAutoComplete"
              item-value="id"></v-autocomplete>
          </v-col>
          <!-- <v-col cols="12" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Uso CFDI" v-model="usoCfdi"
              :rules="[rules.requerido]" :items="itemsUsoCfdi" :item-title="titleAutoComplete" item-value="id"></v-autocomplete>
          </v-col> -->
          <v-col cols="12" class="mb-2">
            <v-btn block color="success" @click="agregarCliente">
              {{ btnText }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import Rules from "@/class/Rules";

const emit = defineEmits(["clienteAgregado"]);
const props = defineProps([
  "arrayClienteProp",
  "editarClienteProp",
  "regFiscalIdProp",
]);
const appStore = storeApp();
const rules = new Rules();
const añadirClienteForm: any = ref(null);
const itemsRegimenFiscal: any = ref([]);
const itemsUsoCfdi: any = ref([]);

let nombre: any = ref();
let rfc: any = ref();
let domicilioFiscal: any = ref();
let regimenFiscal: any = ref();
let usoCfdi: any = ref();
let btnText: any = ref();
let idCliente: any = ref();

onMounted(() => {
  if (props.editarClienteProp != null) {
    btnText.value = "Editar";
    cargarDatos(props.editarClienteProp);
  } else {
    btnText.value = "Agregar";
  }
  getRegimenFiscal();
});

async function agregarCliente() {
  const { valid } = await añadirClienteForm.value.validate();
  if (valid) {
    let obj = objetoCliente();
    let ruta = "/Clientes/add/";
    if (props.editarClienteProp != null) {
      ruta = "/Clientes/edit/" + idCliente.value;
    }
    await axios
      .post(appStore.link + ruta + appStore.empresa.id, obj)
      .then((response) => {
        emit("clienteAgregado", response.data);
      })
      .catch((e) => {
        console.log("Fatal " + e);
      });
  }
}

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

// ÑEVES RAMIREZ QUEZADA RAQÑ7701212M3 78905 605
function objetoCliente() {
  let obj = {
    nombre: nombre.value,
    rfc: rfc.value,
    domicilioFiscal: domicilioFiscal.value,
    regimenFiscal: { id: regimenFiscal.value },
    usoCfdi: { id: usoCfdi.value },
    id: null,
  };
  if (props.editarClienteProp != null) {
    obj.id = idCliente.value;
  }
  return obj;
}

function titleAutoComplete(item: any) {
  return item.codigo + "-" + item.descripcion;
}

function cargarDatos(item: any) {
  idCliente.value = item.id;
  nombre.value = item.nombre;
  rfc.value = item.rfc;
  domicilioFiscal.value = item.domicilioFiscal;
  if (props.regFiscalIdProp != undefined) {
    regimenFiscal.value = props.regFiscalIdProp;
  } else {
    regimenFiscal.value = item.idRegimenFiscal;
  }
  usoCfdi.value = item.idUso;
}
</script>
