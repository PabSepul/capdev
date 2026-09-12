import { createClient } from "npm:@supabase/supabase-js@2.116.0";
const origins = new Set(["https://capsulasdev.com", "https://www.capsulasdev.com"]);
Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  const headers = { "Access-Control-Allow-Origin": origins.has(origin) ? origin : "https://capsulasdev.com",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json", "Vary": "Origin" };
  if(request.method === "OPTIONS") return new Response(null,{status:204,headers});
  if(request.method !== "POST" || !origins.has(origin)) return new Response('{"error":"Solicitud no permitida"}',{status:403,headers});
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if(!token) return new Response('{"error":"Sesión requerida"}',{status:401,headers});
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error} = await admin.auth.getUser(token);
  if(error || !user) return new Response('{"error":"Sesión inválida"}',{status:401,headers});
  let body;
  try { body=await request.json(); } catch { return new Response('{"error":"Solicitud inválida"}',{status:400,headers}); }
  if(body.confirmation !== "ELIMINAR MI CUENTA") return new Response('{"error":"Confirmación requerida"}',{status:400,headers});
  // El ID siempre viene del token verificado; no se acepta un ID del cuerpo.
  const deleted = await admin.auth.admin.deleteUser(user.id);
  return new Response(JSON.stringify(deleted.error ? {error:"No se pudo eliminar la cuenta"} : {ok:true}),
    {status:deleted.error ? 500 : 200,headers});
});
