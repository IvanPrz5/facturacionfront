// Utilities
import { defineStore } from 'pinia';
import { ref } from 'vue';
import Usuario from '@/class/Usuario';
import { Cliente } from '@/class/Cliente';
import { Concepto } from '@/class/Concepto';
import { Comprobante } from '@/class/Comprobante';
import { Impuesto } from '@/class/Impuesto';

export const storeApp = defineStore('app', () => {
  const token = ref("");
  const link = "http://localhost:8095/api/v1";
  const usuario: Usuario | null = new Usuario();
  const comprobante: Comprobante | null = new Comprobante();
  const cliente: Cliente | null = new Cliente();
  const concepto: Concepto | null = new Concepto();
  const impuesto: Impuesto | null = new Impuesto();
  
  return{
    token, 
    link,
    usuario,
    comprobante,
    cliente,
    concepto,
    impuesto
  }
})
