import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";

  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    // Não deixa uma falha de configuração do Supabase derrubar o site inteiro
    // (ex.: env vars ausentes/inválidas no runtime). Rotas /admin continuam
    // protegidas abaixo por não haver `user`; rotas públicas seguem servidas.
    console.error("[middleware] Falha ao inicializar sessão Supabase:", error);
  }

  if (isAdminRoute && !user) {
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
