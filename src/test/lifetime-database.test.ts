// Run against a disposable local PostgreSQL only, never production inventory.
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
const enabled = process.env["LIFETIME_TEST_DB"] === "local";
const sql = postgres({ host: "/tmp/lifetime-pg", port: 55439, username: "lifetimecheck", database: "postgres", max: 10 });
const owner = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const oid = "20000000-0000-4000-8000-000000000001";
describe.skipIf(!enabled)("Standalone SQL on disposable PostgreSQL (synthetic fixtures, not paid tests)", () => {
  beforeAll(async () => {
    // Explicitly isolated connection above; reset only this disposable fixture database.
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; DROP SCHEMA IF EXISTS storage CASCADE; DROP ROLE IF EXISTS anon; DROP ROLE IF EXISTS authenticated; DROP ROLE IF EXISTS service_role; CREATE SCHEMA public;');
    await sql.unsafe(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz);
    CREATE TABLE public.profiles(id uuid PRIMARY KEY,status text);
    CREATE TABLE public.private_config(key text,value text);
    CREATE TABLE storage.objects(bucket_id text,name text);
    CREATE FUNCTION public.has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;`);
    await sql.unsafe(readFileSync("drizzle/migrations/0001_standalone_lifetime_delivery.sql", "utf8"));
    await sql.unsafe(readFileSync("drizzle/migrations/0004_harden_lifetime_delivery.sql", "utf8"));
    await sql.unsafe('GRANT USAGE ON SCHEMA auth,storage TO authenticated; GRANT SELECT ON storage.objects TO authenticated; ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
    await sql`INSERT INTO auth.users VALUES (${owner},now()),(${other},now())`;
    await sql`INSERT INTO public.profiles VALUES (${owner},'active'),(${other},'active')`;
    await sql`INSERT INTO public.private_config VALUES ('oxapay_key_hash','local-fixture')`;
    await sql`INSERT INTO storage.objects VALUES ('lifetime-apks','instagram.apk'),('lifetime-apks','tiktok.apk')`;
    await sql`INSERT INTO public.lifetime_orders(id,user_id,product,status,track_id) VALUES (${oid},${owner},'instagram','pending','fixture-track')`;
    await sql`INSERT INTO public.lifetime_key_stock(product,key_code,order_id) VALUES ('instagram','SYNTHETIC-IG-FIXTURE',${oid}),('tiktok','SYNTHETIC-TT-FIXTURE',null)`;
  });
  afterAll(async () => { await sql.end(); });
  const fulfill = (patch: (string | number | null)[] = []) => sql`SELECT public.fulfill_lifetime_order(${oid},${patch[0] ?? 'local-fixture'},'fixture-track',${patch.length > 1 ? patch[1] : 25},${patch.length > 2 ? patch[2] : 'USD'},${patch.length > 3 ? patch[3] : 'paid'},${patch.length > 4 ? patch[4] : oid}) as result`;
  it("rejects unpaid status", async () => { await expect(fulfill(['local-fixture',25,'USD','pending'])).rejects.toThrow('Payment mismatch'); });
  it("rejects a forged authorization fingerprint", async () => { await expect(fulfill(['wrong'])).rejects.toThrow('forbidden'); });
  it("rejects mismatched amount", async () => { await expect(fulfill(['local-fixture',24])).rejects.toThrow('Payment mismatch'); });
  it("rejects mismatched currency", async () => { await expect(fulfill(['local-fixture',25,'INR'])).rejects.toThrow('Payment mismatch'); });
  it("rejects NULL payment proof", async () => { await expect(fulfill(['local-fixture',null,null,null,null])).rejects.toThrow('Payment mismatch'); });
  it("does not deliver before verification", async () => {
    const r = await sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; return tx`SELECT public.get_lifetime_delivery(${oid}) as result`; });
    expect(r[0].result.access_key).toBeNull();
  });
  it("concurrent duplicate fulfillment consumes exactly one matching key", async () => {
    const results = await Promise.all(Array.from({length:10}, () => fulfill()));
    expect(results.filter(r => r[0].result.already === false)).toHaveLength(1);
    const rows = await sql`SELECT product,access_key FROM public.lifetime_orders WHERE id=${oid}`;
    expect(rows[0]).toMatchObject({product:'instagram',access_key:'SYNTHETIC-IG-FIXTURE'});
    const unused = await sql`SELECT count(*)::int as n FROM public.lifetime_key_stock WHERE product='tiktok' AND order_id IS NULL`;
    expect(unused[0].n).toBe(1);
  });
  it("rejects cross-account key retrieval", async () => {
    await expect(sql.begin(async tx => { await tx`SELECT set_config('test.uid',${other},true)`; return tx`SELECT public.get_lifetime_delivery(${oid})`; })).rejects.toThrow('Order unavailable');
  });
  it("returns the same assigned key on history reopening", async () => {
    const read = () => sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; return tx`SELECT public.get_lifetime_delivery(${oid}) as result`; });
    expect((await read())[0].result).toEqual((await read())[0].result);
    expect((await read())[0].result.access_key).toBe('SYNTHETIC-IG-FIXTURE');
  });
  it("blocks direct key column reads even for authenticated owners", async () => {
    await expect(sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; await tx.unsafe('SET LOCAL ROLE authenticated'); return tx.unsafe('SELECT access_key FROM public.lifetime_orders'); })).rejects.toThrow('permission denied');
  });
  it("acknowledges fulfilled callback lookups without exposing a key", async () => {
    const r=await sql`SELECT public.lookup_lifetime_callback(${oid},'local-fixture') as result`;
    expect(r[0].result.status).toBe('fulfilled'); expect(r[0].result).not.toHaveProperty('access_key');
  });
  it("blocks checkout when matching stock is exhausted", async () => {
    await expect(sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; return tx`SELECT public.reserve_lifetime_order('instagram','local-fixture')`; })).rejects.toThrow('Product keys unavailable');
  });
  it("concurrent checkout retries claim one invoice and one TikTok key only", async () => {
    const reserve = () => sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; return tx`SELECT public.reserve_lifetime_order('tiktok','local-fixture') as result`; });
    const results = await Promise.all(Array.from({length:8}, reserve));
    expect(results.filter(r=>r[0].result.invoice_claim)).toHaveLength(1);
    expect(new Set(results.map(r=>r[0].result.id)).size).toBe(1);
  });
  it("TikTok delivery assigns the TikTok key and owner-only matching APK", async () => {
    const orders=await sql`SELECT id FROM public.lifetime_orders WHERE product='tiktok' AND user_id=${owner}`;
    const tid=orders[0].id as string;
    await sql`UPDATE public.lifetime_orders SET track_id='tiktok-track',status='pending' WHERE id=${tid}`;
    await sql`SELECT public.fulfill_lifetime_order(${tid},'local-fixture','tiktok-track',25,'USD','paid',${tid})`;
    const receipt=await sql`SELECT access_key FROM public.lifetime_orders WHERE id=${tid}`;
    expect(receipt[0].access_key).toBe('SYNTHETIC-TT-FIXTURE');
    const files=await sql.begin(async tx => { await tx`SELECT set_config('test.uid',${owner},true)`; await tx.unsafe('SET LOCAL ROLE authenticated'); return tx`SELECT name FROM storage.objects ORDER BY name`; });
    expect(files.map(f=>f.name)).toEqual(['instagram.apk','tiktok.apk']);
    const denied=await sql.begin(async tx => { await tx`SELECT set_config('test.uid',${other},true)`; await tx.unsafe('SET LOCAL ROLE authenticated'); return tx`SELECT name FROM storage.objects`; });
    expect(denied).toHaveLength(0);
  });
  it("enforces combined 100 reservation capacity", async () => {
    await sql.unsafe(`WITH o AS (INSERT INTO public.lifetime_orders(user_id,product,status) SELECT '${other}'::uuid,'instagram','expired' FROM generate_series(1,98) RETURNING id) INSERT INTO public.lifetime_key_stock(product,key_code,order_id) SELECT 'instagram','SYNTHETIC-'||id::text,id FROM o`);
    await expect(sql.begin(async tx => { await tx`SELECT set_config('test.uid',${other},true)`; return tx`SELECT public.reserve_lifetime_order('tiktok','local-fixture')`; })).rejects.toThrow('Lifetime capacity reached');
  });
});