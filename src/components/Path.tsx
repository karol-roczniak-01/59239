import { Link, useLocation } from "@tanstack/react-router";

const Path = () => {
  const location = useLocation();

  // Build breadcrumb items from current pathname
  const segments = location.pathname.split("/").filter(Boolean);

  // Create array of breadcrumb items — hub is always first, external link
  const breadcrumbs: {
    pathname: string;
    label: string;
    depth: number;
    external?: boolean;
  }[] = [
    { pathname: "https://19188103.com", label: "hub", depth: 0, external: false },
    { pathname: "/", label: "Home", depth: 1 },
  ];

  // Build full path for each segment
  segments.forEach((segment, index) => {
    const pathname = "/" + segments.slice(0, index + 1).join("/");
    breadcrumbs.push({
      pathname,
      label: segment,
      depth: index + 2, // offset by 2 to account for hub + home
    });
  });

  return (
    <div className="absolute z-20 top-2 left-2 flex-col gap-0 hidden md:flex">
      {breadcrumbs.map((item) => {
        const isActive = !item.external && location.pathname === item.pathname;

        const sharedStyle = {
          opacity: isActive ? 0.5 : 1,
          cursor: isActive ? "not-allowed" : "pointer",
          pointerEvents: isActive ? ("none" as const) : ("auto" as const),
          paddingLeft: `${item.depth * 8}px`,
        };

        const label = (
          <>
            {item.depth > 0 && "└─ "}
            {item.label.slice(0, 12)}
          </>
        );

        if (item.external) {
          return (
            <a
              key={item.pathname}
              href={item.pathname}
              className="text-sm capitalize hover:underline"
              style={sharedStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label.slice(0, 12)}
            </a>
          );
        }

        return (
          <Link
            key={item.pathname}
            to={item.pathname as any}
            className="text-sm capitalize hover:underline"
            disabled={isActive}
            style={sharedStyle}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};

export default Path;