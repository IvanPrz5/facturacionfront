<template>
  <v-container>
    <v-img class="mx-auto my-10" max-width="250" src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-v3-slim-text-light.svg"></v-img>
    <v-card class="mx-auto pa-12 pb-8" elevation="0" max-width="448" rounded="lg">
      <v-form ref="formLogin" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12" class="mb-3">
            <v-text-field density="compact" label="Email" prepend-inner-icon="mdi-email-outline" variant="outlined"
              v-model="credenciales.email" :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
              density="compact" label="Contraseña" prepend-inner-icon="mdi-lock-outline" variant="outlined"
              @click:append-inner="visible = !visible" v-model="credenciales.password" :rules="[rules.requerido]"
              @keyup.enter="login"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-btn block class="mb-5" color="primary" size="large" variant="tonal" @click="login">
        Iniciar Sesión
      </v-btn>
      <!-- <v-card-text class="text-center registerLink">
        <a class="text-blue text-decoration-none" rel="noopener noreferrer" @click="register">
          Registrate Aquí <v-icon icon="mdi-chevron-right"></v-icon>
        </a>
      </v-card-text> -->
    </v-card>
  </v-container>
  <v-snackbar v-model="snack" :timeout="1900" color="error">
    Revisa tu credenciales.
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeApp } from '@/store/app';
import axios from 'axios';
import Usuario from '@/class/Usuario';
import Rules from '@/class/Rules';

const appStore = storeApp();
const router = useRouter();
const rules = new Rules();
const formLogin: any = ref(null);

let visible: any = ref(false);
let snack: any = ref(false);
let credenciales: any = ref({
  email: "",
  password: "",
});

async function login() {
  const { valid } = await formLogin.value.validate();
  if (valid) {
    axios
      .post(appStore.link + "/login", credenciales.value)
      .then((response) => {
        localStorage.setItem("token", response.data.data.token);
        appStore.usuario = <Usuario> response.data.data.usuario[0];
        localStorage.setItem("usuario", JSON.stringify(<Usuario>response.data.data.usuario[0]));
        router.push({ path: "/empresas" });
      })
      .catch((error) => {
        snack.value = true;
        console.log("No se puede cargar  -> " + error);
      });
  }
}

function register() {
  router.push({ path: "/register" });
}
</script>

<style scoped>
.registerLink a {
  cursor: pointer;
}
</style>
