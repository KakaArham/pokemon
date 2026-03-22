import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("pokemon/:name", "routes/pokemon-detail.tsx"),
  route("vs", "routes/vs.tsx")
] satisfies RouteConfig;
