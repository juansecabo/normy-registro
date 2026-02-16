import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ error: "Falta el parámetro codigo" }, { status: 400 });
  }

  // Check if already used as parent identification
  const { data: existingPadre } = await supabase
    .from("Perfiles_Generales")
    .select("id")
    .eq("padre_codigo", codigo)
    .not("padre_codigo", "is", null)
    .limit(1);

  if (existingPadre && existingPadre.length > 0) {
    return NextResponse.json({ ya_registrado: true });
  }

  // Check if already used as student identification
  const { data: existingEstudiante } = await supabase
    .from("Perfiles_Generales")
    .select("id")
    .eq("estudiante_codigo", codigo)
    .limit(1);

  if (existingEstudiante && existingEstudiante.length > 0) {
    return NextResponse.json({ ya_registrado: true });
  }

  return NextResponse.json({ ya_registrado: false });
}
