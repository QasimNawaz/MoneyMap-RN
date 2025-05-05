import { useRouter, usePathname, Href } from "expo-router";
import { AllRoutes } from "@/types/navigation";

type ValidRoutePath = keyof AllRoutes;

export function useTypedRouter() {
  const router = useRouter();

  async function navigate<T extends ValidRoutePath>(
    route: T,
    params?: AllRoutes[T]
  ) {
    const href = params
      ? { pathname: route as string, params }
      : (route as string);

    router.push(href as Href);
  }

  async function replace<T extends ValidRoutePath>(
    route: T,
    params?: AllRoutes[T]
  ) {
    const href = params
      ? { pathname: route as string, params }
      : (route as string);

    router.replace(href as Href);
  }

  function back() {
    router.back();
  }

  return {
    back,
    typedNavigate: navigate,
    typedReplace: replace,
    currentPath: usePathname(),
  };
}
