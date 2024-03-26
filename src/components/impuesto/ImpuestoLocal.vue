<template>
  <v-card>
    <v-card-title class="d-flex bg-primary">
      Impuesto Local
    </v-card-title>
    <v-card-text class="mx-4 mt-4">
      <v-form ref="impuestoLocalForm" fast-fail @submit.prevent>
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
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Impuesto o Derecho Local"
              v-model="impuestoLocal" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Porcentaje"
              v-model="porcentajeLocal" :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col cols="4" class="pa-1">
            <v-text-field variant="outlined" density="compact" label="Monto" v-model="montoLocal" :rules="[rules.requerido, rules.numero]"></v-text-field>
          </v-col>
          <v-col class="mb-5">
            <v-btn @click="aplicarImpLocal" color="success">{{ btnText }} Impuesto</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    {{ auxMonto }}
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import Rules from "@/class/Rules";

const rules = new Rules();

const props = defineProps(["propSubTotal", "editImpLocal"]);
const emit = defineEmits(["setImpLocales", "actualizarLocal"]);

const impuestoLocalForm: any = ref(null);

// let subTotal: any = ref();
let impuestoLocal: any = ref();
let porcentajeLocal: any = ref();
let montoLocal: any = ref();
let isTrasladado: any = ref(true);
let btnText: any = ref();

let auxMonto = computed(() => {
  if(impuestoLocal.value != null && porcentajeLocal.value != null && props.propSubTotal != null){
    let aux = Number(porcentajeLocal.value) * Number(props.propSubTotal);
    montoLocal.value = Number(aux).toFixed(2);
  }
});

onMounted(() => {
  if(props.editImpLocal != null){
    impuestoLocal.value = props.editImpLocal.impuesto;
    porcentajeLocal.value = props.editImpLocal.tasaCuota;
    montoLocal.value = props.editImpLocal.importe;
    isTrasladado.value = props.editImpLocal.isTrasladado;
    btnText.value = "EDITAR";
  }else{
    btnText.value = "AGREGAR";
  }
});

async function aplicarImpLocal() {
  const { valid } = await impuestoLocalForm.value.validate();
  if(valid){
    let obj = objetoImpuesto();
    if(props.editImpLocal != null){
      emit("actualizarLocal", obj)
    }else{
      emit("setImpLocales", obj);
    }
  }else{
    console.log("Campos Vacios")
  }
}

function objetoImpuesto() {
  let obj = {
    impuesto: impuestoLocal.value,
    tasaCuota: porcentajeLocal,
    // base: impuestoClass.base,
    importe: montoLocal.value,
    isTrasladado: isTrasladado.value,
    isEstatal: false
  };

  return obj;
}
</script>
