// Utilities
import { defineStore } from 'pinia';
import { ref } from 'vue';
import Usuario from '@/class/Usuario';
import { Cliente } from '@/class/Cliente';
import { Concepto } from '@/class/Concepto';
import { Comprobante } from '@/class/Comprobante';
import { Impuesto } from '@/class/Impuesto';
import { Empresa } from '@/class/Empresa';
import { Pagos } from '@/class/Pagos';

export const storeApp = defineStore('app', () => {
  const token = ref("");
  // Productivo
  // const link = "http://187.221.211.10:7520/facturacion-0.0.1-SNAPSHOT/api/v1";

  const link = "http://localhost:8095/api/v1";

  const usuario: Usuario | null = new Usuario();
  const comprobante: Comprobante | null = new Comprobante();
  const cliente: Cliente | null = new Cliente();
  const concepto: Concepto | null = new Concepto();
  const impuesto: Impuesto | null = new Impuesto();
  const empresa: Empresa | null = new Empresa();
  const pagos: Pagos | null = new Pagos();
  const theme = ref("");
  
  return{
    token, 
    link,
    usuario,
    comprobante,
    cliente,
    concepto,
    impuesto,
    empresa,
    pagos,
    theme
  }
})
