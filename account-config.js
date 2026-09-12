/* Solo valores públicos. Nunca pegar aquí service_role, secret keys o contraseñas.
   Supabase Auth también debe permitir altas por correo: este indicador no sustituye
   esa protección del servidor. */
globalThis.AccountConfig = Object.freeze({
  supabaseUrl: "https://neofezxmcrmrijzxuqjo.supabase.co",
  publishableKey: "sb_publishable_q0Xk7ie9N18L5BnIzLVzPQ_1Cn4cCaY",
  registrationEnabled: true,
  privacyVersion: "2026-09-07",
  privacyContact: "privacidad@capsulasdev.com",
  siteUrl: "https://capsulasdev.com"
});
