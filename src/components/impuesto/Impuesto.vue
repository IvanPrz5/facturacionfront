<template>
  <v-card>
    <v-card-title class="bg-primary"> Aplicar Impuesto </v-card-title>
    <v-card-text>
      <v-form ref="impuestoForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12" class="d-flex">
            <v-radio-group v-model="isTrasladado">
              <div class="d-flex">
                <v-radio label="Impuesto Traslado" color="green" :value="true"></v-radio>
                <v-radio label="Impuesto Retenido" color="warning" :value="false"></v-radio>
              </div>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="6" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Impuesto" :items="itemsImpuesto"
              :item-title="titleAutoComplete" item-value="codigo" v-model="impuestoClass.impuesto"
              :rules="[rules.requerido]" @update:model-value="cambiarBtn"></v-autocomplete>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Tipo Factor" :items="itemsTipoFactor"
              item-title="codigo" item-value="codigo" v-model="impuestoClass.tipoFactor"
              :rules="[rules.requerido]"></v-autocomplete>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-autocomplete variant="outlined" density="compact" label="Tasa o Cuota" :items="itemsTasaCuota"
              item-title="descripcion" item-value="descripcion" v-model="impuestoClass.tasaCuota"
              :rules="[rules.requerido]"></v-autocomplete>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Base" v-model="impuestoClass.base"
              :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1" v-if="impuestoClass.importe != 'NaN'">
            <v-text-field variant="outlined" density="compact" label="Importe" v-model="impuestoClass.importe"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-row no-gutters>
        <div style="display: none;">{{ array }}</div>
        <v-col v-if="desserts.length > 0" class="px-1" cols="6">
          <v-btn block color="error" @click="cerrarImpuesto()">
            Terminar
          </v-btn>
        </v-col>
        <v-col class="px-1" cols="6">
          <v-btn block color="indigo" @click="agregarImpuesto">
            {{ btnText }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-data-table class="mt-2" v-if="desserts.length > 0 && propImpuesto == null" height="300" :headers="headers"
    :items="desserts" :sort-by="[{ key: 'isTrasladado' }]">
    <template v-slot:top>
      <v-toolbar density="compact" color="purple">
        <v-toolbar-title>Lista de Impuestos</v-toolbar-title>
      </v-toolbar>
    </template>
    <template v-slot:item.impuesto="{ value }">
      {{ codImpuesto(value) }}
    </template>
    <template v-slot:item.isTrasladado="{ value }">
      <v-chip :color="getColor(value)"> 
        {{ textImp = value ? 'T' : 'R' }}
      </v-chip>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-btn variant="text" size="small" @click="eliminarItem(item)">
        <v-icon size="medium"> mdi-delete </v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from "vue";
import { storeApp } from "@/store/app";
import axios from "axios";
import Rules from "@/class/Rules";

const appStore = storeApp();
const rules = new Rules();
const impuestoClass = appStore.impuesto;
const itemsImpuesto: any = ref([]);
const itemsTipoFactor: any = ref([]);
const itemsTasaCuota: any = ref([]);
const impuestoForm: any = ref(null);

const props = defineProps(["propImpuesto", "propImporte", "propTabla"]);
const emit = defineEmits([
  "closeImpuesto",
  "actualizarImpuesto",
  "setDatosImpuesto",
]);

const headers: any = ref([
  { title: "Impuesto", key: "impuesto" },
  { title: "Tasa Cuota", key: "tasaCuota" },
  { title: "Tipo Factor", key: "tipoFactor" },
  { title: "Base", key: "base" },
  { title: "Importe", key: "importe" },
  { title: "Tipo", key: "isTrasladado" },
  { title: "Actions", key: "actions", sortable: false, },
]);
let desserts: any = ref([]);

let btnText: any = ref("Agregar");
let isTrasladado: any = ref(true);
let auxImp: any = ref();
let textImp: any = ref();

watch(impuestoClass, (nuevoValor) => {
  let aux = Number(nuevoValor.base) * Number(nuevoValor.tasaCuota);
  impuestoClass.importe = aux.toFixed(2);
});

const array = computed(() => {
  // if(impuestoClass.codImpuesto != undefined)
  if (impuestoClass.impuesto != undefined && impuestoClass.tipoFactor != undefined) {
    if (impuestoClass.impuesto == "001") {
      auxImp.value = "ISR";
    }
    if (impuestoClass.impuesto == "002") {
      auxImp.value = "IVA";
    }
    if (impuestoClass.impuesto == "003") {
      auxImp.value = "IEPS";
    }
    impuestoClass.tasaCuota = null;
    getTasaCuota(auxImp.value);
  }
});

onMounted(() => {
  if (props.propImpuesto != null) {
    btnText.value = "Editar";
    cargarDatos();
  }
  if (props.propImporte != null) {
    impuestoClass.base = props.propImporte;
  }
  if (props.propTabla != null) {
    desserts.value = props.propTabla;
  }
  getImpuesto();
  getTipoFactor();
});

function cambiarBtn(){
  if(impuestoClass.impuesto == "001"){
    isTrasladado.value = false;
  }else{
    isTrasladado.value = true;
  }
}

function getColor(item: any) {
  if (item == false) return 'warning'
  else return 'green'
}

function getImpuesto() {
  axios
    .get(appStore.link + "/Impuesto/get")
    .then((response) => {
      itemsImpuesto.value = response.data;
      if (props.propImpuesto == null) {
        impuestoClass.impuesto = response.data[1].codigo
      }
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getTipoFactor() {
  axios
    .get(appStore.link + "/TipoFactor/get")
    .then((response) => {
      itemsTipoFactor.value = response.data;
      if (props.propImpuesto == null) {
        impuestoClass.tipoFactor = response.data[0].codigo;
      }
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

function getTasaCuota(aux: any) {
  axios
    .get(
      appStore.link +
      "/TasaoCuota/byImpFac/" +
      aux +
      "/" +
      impuestoClass.tipoFactor
    )
    .then((response) => {
      if (response.data.length == 0) {
        itemsTasaCuota.value = [];
      }
      if (response.data.length == 1) {
        impuestoClass.tasaCuota = response.data[0].descripcion;
        itemsTasaCuota.value = [];
      }
      if (response.data.length > 2) {
        impuestoClass.tasaCuota = response.data[1].descripcion;
        itemsTasaCuota.value = response.data;
      }
    })
    .catch((e) => {
      console.log("Fatal " + e);
    });
}

async function agregarImpuesto() {
  const { valid } = await impuestoForm.value.validate();
  if (valid) {
    let obj = objetoImpuesto();
    if (props.propImpuesto != null) {
      emit("closeImpuesto");
      emit("actualizarImpuesto", obj);
    } else {
      desserts.value.push(obj);
      emit("setDatosImpuesto", desserts.value);
    }
  } else {
    emit("setDatosImpuesto", null);
  }
}

function cargarDatos() {
  impuestoClass.impuesto = props.propImpuesto.impuesto;
  impuestoClass.tipoFactor = props.propImpuesto.tipoFactor;
  impuestoClass.tasaCuota = props.propImpuesto.tasaCuota;
  impuestoClass.importe = props.propImpuesto.importe;
  impuestoClass.base = props.propImpuesto.base;
  impuestoClass.importe = props.propImpuesto.isTrasladado;
  isTrasladado.value = props.propImpuesto.isTrasladado;
}

function objetoImpuesto() {
  let obj = {
    impuesto: impuestoClass.impuesto,
    tipoFactor: impuestoClass.tipoFactor,
    tasaCuota: impuestoClass.tasaCuota,
    base: impuestoClass.base,
    importe: impuestoClass.importe,
    isTrasladado: isTrasladado.value
  };

  return obj;
}

function eliminarItem(item: any) {
  desserts.value.splice(item, 1)
}

function cerrarImpuesto() {
  emit("closeImpuesto");
}

function titleAutoComplete(item: any) {
  return item.codigo + " - " + item.descripcion;
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

defineExpose({
  cargarDatos,
});

/* 
higt threason
reign of terror
8th commandt
 */
</script>
