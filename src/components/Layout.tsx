import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";

import type { ReactNode } from "react";
import { useLanguage } from "@/providers/language-provider";

interface LayoutProps {
  children: ReactNode
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage()
  const { pathname } = useLocation();
  const router = useRouter();

  const segments = pathname === "/" ? [] : pathname.split("/").filter(Boolean);

  useHotkeys("alt+o", () => router.history.back());
  useHotkeys("alt+i", () => router.history.forward());
  useHotkeys("alt+h", () => { window.location.href = "https://19188103.com"; });

  return (
    <div className='w-full h-dvh flex flex-col overflow-hidden'>
      <header className="hidden md:flex shrink-0 items-center p-2">
        <a href="https://19188103.com">hub/</a>
        <Link to="/" className={pathname === "/" ? "opacity-70 pointer-events-none" : ""}>
          5-92-39
        </Link>
        {segments.map((segment, i) => {
          if (uuidRegex.test(segment)) return null;

          const nextIsUuid = uuidRegex.test(segments[i + 1]);
          const isCurrent = i === segments.length - 1 || (nextIsUuid && i === segments.length - 2);
          const to = nextIsUuid
            ? "/" + segments.slice(0, i + 1).join("/") + "/" + segments[i + 1]
            : "/" + segments.slice(0, i + 1).join("/");

          return (
            <span key={to} className="flex items-center">
              <span>/</span>
              <Link to={to} className={isCurrent ? "opacity-70 pointer-events-none" : ""}>
                {nextIsUuid ? `${segment}/\${id}` : segment}
              </Link>
            </span>
          );
        })}
      </header>
      {children}
      <footer className="md:hidden shrink-0 grid grid-cols-4 p-2">
        <div className="flex">
          <button onClick={() => router.history.back()}>[&lt;--]</button>
        </div>
        <div className="flex justify-start">
          <a className="truncate" href="https://19188103.com">[{t('all')}]</a>
        </div>
        <div className="flex justify-end">
          <Link className="truncate" to="/">[{t('menu')}]</Link>
        </div>
        <div className="flex justify-end">
          <button onClick={() => router.history.forward()}>[--&gt;]</button>
        </div>
      </footer>
    </div>
  );
}

export default Layout;