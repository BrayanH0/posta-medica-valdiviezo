// Comprueba una ficha contra la rama develop y contra la copia donde se compiló y probó (tarea 18).
// Uso (desde la raíz del repo): node docs/entrega/fichas/verificar-ficha.cjs <ficha.md> <carpetaCopia> <repo>
// Lee los bloques marcados con <!-- v:antes|despues|archivo-antes|archivo-despues|nuevo <ruta> -->.
// 1) cada bloque ANTES aparece exactamente 1 vez en develop (archivo-antes: igual al archivo entero);
// 2) develop + reemplazos de la ficha == archivo de la copia.
// Para verificar solo el punto 1 sin copia, pasar como <carpetaCopia> una copia de develop con los cambios aplicados.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const [ficha, copia, repo] = process.argv.slice(2);
const md = fs.readFileSync(ficha, 'utf8');
const re = /<!-- v:(antes|despues|archivo-antes|archivo-despues|nuevo) (\S+) -->\s*\n```[a-z]*\n([\s\S]*?)\n```/g;
const ops = [];
let m;
while ((m = re.exec(md))) ops.push({ tipo: m[1], ruta: m[2], texto: m[3] });
const archivos = {};
let fallos = 0;
const develop = (ruta) => execFileSync('git', ['-C', repo, 'show', `develop:${ruta}`], { encoding: 'utf8' });
for (let i = 0; i < ops.length; i++) {
  const op = ops[i];
  if (op.tipo === 'antes') {
    const sig = ops[i + 1];
    if (!sig || sig.tipo !== 'despues' || sig.ruta !== op.ruta) { console.log(`FALLA ${op.ruta}: ANTES sin DESPUES`); fallos++; continue; }
    if (!(op.ruta in archivos)) archivos[op.ruta] = develop(op.ruta);
    const veces = archivos[op.ruta].split(op.texto).length - 1;
    console.log(`${veces === 1 ? 'OK   ' : 'FALLA'} ANTES aparece ${veces} vez/veces en develop: ${op.ruta}`);
    if (veces !== 1) { fallos++; continue; }
    archivos[op.ruta] = archivos[op.ruta].replace(op.texto, () => sig.texto);
    i++;
  } else if (op.tipo === 'archivo-antes') {
    const sig = ops[i + 1];
    const actual = develop(op.ruta);
    const igual = actual === op.texto + '\n';
    console.log(`${igual ? 'OK   ' : 'FALLA'} ANTES (archivo completo) igual a develop: ${op.ruta}`);
    if (!igual) fallos++;
    archivos[op.ruta] = sig.texto + '\n';
    i++;
  } else if (op.tipo === 'nuevo') {
    let existe = true;
    try { develop(op.ruta); } catch { existe = false; }
    console.log(`${!existe ? 'OK   ' : 'FALLA'} archivo nuevo no existe en develop: ${op.ruta}`);
    if (existe) fallos++;
    archivos[op.ruta] = op.texto + '\n';
  }
}
for (const [ruta, contenido] of Object.entries(archivos)) {
  // La copia salió de `git archive` con core.autocrlf=true (CRLF); develop y GitHub guardan LF
  const enCopia = fs.readFileSync(path.join(copia, ruta), 'utf8').replace(/\r\n/g, '\n');
  const igual = enCopia === contenido;
  console.log(`${igual ? 'OK   ' : 'FALLA'} DESPUES de la ficha == copia compilada y probada: ${ruta}`);
  if (!igual) fallos++;
}
console.log(`bloques: ${ops.length}, archivos: ${Object.keys(archivos).length}, fallos: ${fallos}`);
process.exit(fallos ? 1 : 0);
