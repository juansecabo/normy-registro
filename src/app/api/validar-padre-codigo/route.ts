import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ error: "Falta el parámetro codigo" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("Perfiles_Generales")
    .select("id")
    .eq("padre_codigo", codigo)
    .not("padre_codigo", "is", null)
    .limit(1);

  return NextResponse.json({
    ya_registrado: existing && existing.length > 0,
  });
}
