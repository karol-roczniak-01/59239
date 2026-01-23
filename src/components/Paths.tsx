import { useMatches, Link, useLocation } from "@tanstack/react-router";

const Paths = () => {
  const matches = useMatches();
  const location = useLocation();

  // Filter out duplicate root matches
  const uniqueMatches = matches.filter((match, index, self) => 
    self.findIndex(m => m.pathname === match.pathname) === index
  );

  return (
    <div className="absolute z-20 top-2 left-2 flex-col gap-0.5 hidden md:flex">
      {uniqueMatches.map((match) => {
        const segments = match.pathname.split("/").filter(Boolean);
        const depth = segments.length;
        const label = depth === 0 ? "Home" : segments[segments.length - 1];
        const prefix = depth === 0 ? "" : "│  ".repeat(depth - 1) + "├─ ";
        const isActive = location.pathname === match.pathname;

        return (
          <Link
            key={match.id}
            to={match.pathname as any}
            className="text-sm capitalize hover:underline"
            disabled={isActive}
            style={{ 
              opacity: isActive ? 0.5 : 1,
              cursor: isActive ? "not-allowed" : "pointer",
              pointerEvents: isActive ? "none" : "auto"
            }}
          >
            {prefix}{label}
          </Link>
        );
      })}
    </div>
  );
};

export default Paths;
