export default class Rules {
  maximoDeCaracteres = (value: any, digitosMax: number) => {
    if (value?.length <= digitosMax) return true;
    return "Máximo de " + digitosMax + " carácteres ";
  };

  minimoDeCaracteres = (value: any, digitosMin: number) => {
    if (value?.length > digitosMin) return true;
    return "Mínimo de " + digitosMin + " carácteres ";
  };

  totalCaracteres = (value: any, digitosMin: number) => {
    if (value?.length == digitosMin) return true;
    return "Se requieren" + digitosMin + " carácteres ";
  };

  numero = (value: string) => {
    if (/^[0-9]*(\.[0-9]+)?$/.test(value)) return true;
    return "Solo números";
  };

  rfc = (value: string) => {
    if (
      /[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])(?:[A-Z\d]{3})/.test(
        value
      )
    )
      return true;

    return "RFC no cumple la estructura";
  };

  file = (value: any) => {
    if (value || value > 0) return true;
    return "Requerido";
  };

  requerido = (value: any) => {
    if (value) return true;
    return "Requerido";
  };

  requeridoDescuento = (value: any) => {
    console.log(value.length)
    if (value.length > 0) return true;
    return "Requerido";
  };

  emailRules = (value: string) => {
    if (/.+@.+\..+/.test(value)) return true;
    return "El correo no tiene formato correcto";
  };
}
