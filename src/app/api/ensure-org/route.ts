import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  const user = data.user;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Check if org exists for this owner
  const { data: existing, error: selectErr } = await admin
    .from("organisations")
    .select("id,name")
    .eq("owner_user_id", user.id)
    .limit(1);

  if (selectErr) {
    return NextResponse.json({ ok: false, error: selectErr.message }, { status: 500 });
  }

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, org: existing[0], created: false });
  }

  const defaultName =
    user.user_metadata?.business_name ||
    (user.email ? `${user.email.split("@")[0]}'s business` : "My business");

  const { data: inserted, error: insertErr } = await admin
    .from("organisations")
    .insert({
      name: defaultName,
      owner_user_id: user.id,
    })
    .select("id,name")
    .single();

  if (insertErr) {
    return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, org: inserted, created: true });
}
