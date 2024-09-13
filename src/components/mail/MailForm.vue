<template>
  <v-card>
    <v-card-title> Enviar Email </v-card-title>
    <v-card-text>
      <v-form ref="mailForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              label="Para"
              variant="outlined"
              density="compact"
              v-model="emailSettings.to"
              :rules="[rules.requerido, rules.emailRules]"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              label="Asunto"
              variant="outlined"
              density="compact"
              v-model="emailSettings.subject"
              :rules="[rules.requerido]"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              label="Descripcion"
              variant="outlined"
              density="compact"
              v-model="emailSettings.body"
              :rules="[rules.requerido]"
            >
            </v-textarea>
          </v-col>
          <v-col cols="12" class="d-flex justify-end mb-3">
            <v-btn color="success" @click="enviarEmail">Enviar Email</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>

  <v-dialog v-model="loader" width="auto" persistent>
      <v-card color="indigo">
        <v-card-text class="d-flex flex-column align-center mx-5 mt-3 mb-5">
          Enviando Mail.
          <v-progress-circular :size="70" :width="7" color="warning" indeterminate></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :timeout="timeMensaje" :color="snackColor">
      {{ msg }}
    </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import axios from "axios";
import { storeApp } from "@/store/app";
import Rules from "@/class/Rules";

const props = defineProps(["data"]);

const appStore = storeApp();
const rules = new Rules();

const mailForm: any = ref(null);
const loader = ref(false);
const emailSettings = ref({
  to: "",
  subject: "",
  body: "",
}) as any;

const snack: any = ref(false);
let snackColor = "";
let msg: String = "";
let timeMensaje: any = ref();

async function enviarEmail() {
  const { valid } = await mailForm.value.validate();

  if (valid) {

    loader.value = true;

    const body = {
      datosFactura: props.data,
      mailDto: emailSettings.value,
    };

    await axios
      .post(
        appStore.link +
          "/Email/file/" +
          props.data.datosComprobante.uuid +
          "/" +
          appStore.empresa.id,
        body
      )
      .then((response) => {
        loader.value = false;
        if(response.data == 0){
          mostrarSnack("green", "El Email se envio.", 5000);
        }else{
          mostrarSnack("error", "El Email no se envio. Intente otra vez", 5000);
        }
      })
      .catch((e) => {
        console.log("Fatal " + e);
        loader.value = false;
        mostrarSnack("error", "Ocurrio un error", 5000);
      });
  }
}



function mostrarSnack(color: any, msgSnack: any, time: any) {
  snackColor = color;
  msg = msgSnack;
  timeMensaje = time;
  snack.value = true;
}


defineExpose({
  enviarEmail,
});
</script>
