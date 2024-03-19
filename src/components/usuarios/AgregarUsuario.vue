<template>
  <v-card>
    <v-card-title class="bg-primary">{{btnTxt}} USUARIO</v-card-title>
    <v-card-text>
      <v-form ref="usuarioForm" fast-fail @submit.prevent>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field variant="outlined" density="compact" label="Nombre" v-model="credenciales.nombre"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field variant="outlined" density="compact" label="Apellido" v-model="credenciales.apPaterno"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field variant="outlined" density="compact" label="Email" v-model="credenciales.email"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
          <v-col v-if="props.propEditarUsuario == null" cols="12">
            <v-text-field variant="outlined" density="compact" label="Password" v-model="credenciales.password"
              :rules="[rules.requerido]"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="mb-2">
      <v-btn class="bg-success" block @click="agregarUsuario">{{btnTxt}}</v-btn>
    </v-card-actions>
</v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { storeApp } from "../../store/app";
import axios from "axios";
import Rules from "@/class/Rules";

const props = defineProps(["propEditarUsuario"]);
const emit = defineEmits(["actualizar"]);

const appStore = storeApp();
const rules = new Rules();
const usuarioForm: any = ref(null);

let btnTxt: any = ref("AGREGAR");

let credenciales: any = ref({
  nombre: "",
  apPaterno: "",
  email: "",
  password: "",
});

let idUsuario: any = ref();

onMounted(() => {
  if(props.propEditarUsuario != null){
    btnTxt.value = "EDITAR";
    cargarDatos(props.propEditarUsuario);
  }
})

async function agregarUsuario(){
  const { valid } = await usuarioForm.value.validate();
  if(valid){
    let ruta = "/register";
    if(props.propEditarUsuario != null){
      ruta = "/Usuarios/edit/" + idUsuario.value;
    }
    axios.post(appStore.link + ruta, credenciales.value)
    .then((response) => {
      if(response.data.result == 0){
        emit("actualizar")
      }
    })
    .catch((e) => {
      console.log("Fatal " + e)
    })
  }else{
    console.log("Campos Vacios")
  }
}

function cargarDatos(item: any){
  credenciales.value.nombre = item.nombre;
  credenciales.value.apPaterno = item.apPaterno;
  credenciales.value.email = item.email;
  credenciales.value.password = item.password;
  idUsuario.value = item.id;
}

</script>
