import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { site } from "@/lib/constants";
import { loginAdmin } from "./actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const query = await searchParams;

  return (
    <main className="section">
      <div className="grid2">
        <section className="panel">
          <span className="badge">Admin-only</span>
          <h1>Sign in to manage rewards.</h1>
          <p className="lede">Use the configured admin username and the password from <strong>ADMIN_PASSWORD</strong>. No promoter login exists in this first version.</p>
        </section>
        <section className="panel">
          <h2>Admin login</h2>
          {query.error ? <p className="message error">Invalid username or password.</p> : null}
          {!process.env.ADMIN_PASSWORD ? <p className="message error">ADMIN_PASSWORD is not configured, so login is disabled.</p> : null}
          <form className="form" action={loginAdmin}>
            <label className="field">Username <input name="username" defaultValue={site.adminUsername} required /></label>
            <label className="field">Password <input name="password" type="password" required /></label>
            <button className="button" type="submit">Login</button>
          </form>
        </section>
      </div>
    </main>
  );
}
