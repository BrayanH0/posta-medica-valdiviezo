import { APIRequestContext, expect } from '@playwright/test';

// RFC-011 (tarea 26): las pruebas que llaman a la API con `request` necesitan el token de quien hace la petición.
// Se obtiene con POST /login (las mismas credenciales de prueba de docs/PRUEBAS.md) y se guarda por rol.
const API = 'http://localhost:8080';
const CREDENCIALES = {
  paciente: { dni: '12345678', clave: '123456' }, // paciente 1
  medico: { dni: '10000001', clave: '123456' },   // médico 1
  admin: { dni: '87654321', clave: '123456' },    // administrador 1
};
export type Rol = keyof typeof CREDENCIALES;

const tokens: Partial<Record<Rol, string>> = {};

export async function tokenDe(request: APIRequestContext, rol: Rol): Promise<string> {
  if (!tokens[rol]) {
    const r = await request.post(`${API}/login`, { data: CREDENCIALES[rol] });
    expect(r.status()).toBe(200);
    tokens[rol] = (await r.json()).token;
  }
  return tokens[rol]!;
}

// Cabecera para las opciones de request.get/post/put/delete
export async function conToken(request: APIRequestContext, rol: Rol) {
  return { Authorization: `Bearer ${await tokenDe(request, rol)}` };
}
