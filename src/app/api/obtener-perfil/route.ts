import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Falta el parámetro id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Perfiles_Generales")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("obtener-perfil error:", error);
    return NextResponse.json({ existe: false, ya_registrado: false });
  }

  // Check if registration is truly complete (not just perfil set)
  let ya_registrado = false;
  if (data.perfil === "Estudiante") {
    ya_registrado = !!data.estudiante_codigo && !!data.contrasena;
  } else if (data.perfil === "Padre de familia") {
    const numMap: Record<string, number> = { "1 (uno)": 1, "2 (dos)": 2, "3 (tres)": 3 };
    const required = numMap[data.padre_numero_de_estudiantes] || 0;
    if (required > 0 && data.padre_nombre && data.contrasena && data.padre_codigo) {
      const codes = [data.padre_estudiante1_codigo, data.padre_estudiante2_codigo, data.padre_estudiante3_codigo];
      ya_registrado = codes.slice(0, required).every((c: string | null) => !!c);
    }
  }

  return NextResponse.json({
    existe: true,
    ya_registrado,
    datos_actuales: data,
  });
}
