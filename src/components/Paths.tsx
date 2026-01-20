import { useMatches, Link, useLocation } from "@tanstack/react-router";

const Paths = () => {
  const matches = useMatches();
  const location = useLocation();

  // Get unique paths only
  const uniquePaths = matches
    .map(m => ({
      pathname: m.pathname,
      fullPath: m.fullPath, // This is the route definition path
      id: m.id
    }))
    .filter((item, index, self) => 
      self.findIndex(i => i.pathname === item.pathname) === index
    );

  return (
    <div className="absolute z-20 top-2 left-2 flex-col gap-0.5 hidden md:flex">
      {uniquePaths.map(({ pathname, fullPath, id }) => {
        const segments = pathname.split("/").filter(Boolean);
        const depth = segments.length;
        const label = depth === 0 ? "Home" : segments[segments.length - 1];
        const prefix = depth === 0 ? "" : "│  ".repeat(depth - 1) + "├─ ";
        const isHome = pathname === "/";
        const isCurrentLocation = location.pathname === pathname;
        const isDisabled = isHome && isCurrentLocation;

        if (isDisabled) {
          return (
            <span
              key={id}
              className="text-sm capitalize cursor-not-allowed opacity-50"
            >
              <span>{prefix}</span>
              <span>{label}</span>
            </span>
          );
        }

        return (
          <Link
            key={id}
            to={fullPath}
            className="text-sm capitalize cursor-pointer hover:underline"
          >
            <span>{prefix}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default Paths;