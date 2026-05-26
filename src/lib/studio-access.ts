export function canAccessStudio(env: Pick<NodeJS.ProcessEnv, "NODE_ENV">) {
  return env.NODE_ENV !== "production";
}
