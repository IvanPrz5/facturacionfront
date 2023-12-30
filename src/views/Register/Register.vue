<template>
  <v-container>
    <v-img class="mx-auto my-5" max-width="200" src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-v3-slim-text-light.svg"></v-img>
    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
      <v-form ref="formRegister" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12" class="mb-3">
            <v-text-field density="compact" label="Nombre" prepend-inner-icon="mdi-account-outline" variant="outlined"
              v-model="credenciales.nombre" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12" class="mb-3">
            <v-text-field density="compact" label="Apellido Paterno" prepend-inner-icon="mdi-account-outline"
              variant="outlined" v-model="credenciales.apPaterno" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12" class="mb-3">
            <v-text-field density="compact" label="Correo Electrónico" prepend-inner-icon="mdi-email-outline"
              variant="outlined" v-model="credenciales.email" :rules="[rules.emailRules]"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
              density="compact" label="Ingresa tu contraseña" prepend-inner-icon="mdi-lock-outline" variant="outlined"
              @click:append-inner="visible = !visible" v-model="credenciales.password"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-btn block class="mb-5" color="info" size="large" variant="tonal" @click="register">
        Registrarse
      </v-btn>
      <v-card-text class="text-center registerLink">
        <a class="text-blue text-decoration-none" rel="noopener noreferrer" @click="toLogin">
          Ya tienes una cuenta?
        </a>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="dialog" persistent width="auto">
    <v-card color="success">
      <v-card-text>
        El usuario se registro exitosamente. Seras redireccionado al Login.
        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snack" :timeout="2050" :color="snackColor">
    {{ msg }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { storeApp } from "../../store/app";
import { useRouter } from "vue-router";
import Rules from "@/class/Rules";
import axios from "axios";

const appStore = storeApp();
const router = useRouter();
const rules = new Rules();
const formRegister: any = ref(null);
const dialog: any = ref(false);
const snack: any = ref(false);
let visible: any = ref(false);
let snackColor = "";
let msg: String = "";
let credenciales: any = ref({
  nombre: "",
  apPaterno: "",
  email: "",
  password: "",
});

async function register() {
  const { valid } = await formRegister.value.validate();
  if (valid) {
    axios
      .post(appStore.link + "/register", credenciales.value)
      .then((response) => {
        if (!response.data.error) {
          dialog.value = true;
          setTimeout(toLogin, 2200);
        }
        if (response.data.result == 2) {
          showSnack("error", "El email ya existe");
        }
      })
      .catch((error) => {
        console.log("No se puede cargar  -> " + error);
      });
  }
}

function toLogin() {
  router.push({ path: "/login" });
}

function showSnack(color: any, msgSnack: any) {
  snackColor = color;
  msg = msgSnack;
  snack.value = true;
}
</script>

<style scoped>
.registerLink a {
  cursor: pointer;
}
</style>
