import {
  Ionicons,
  AntDesign,
  MaterialIcons,
  FontAwesome5,
  Fontisto,
  FontAwesome,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// Define the possible routes (keys in the icons object)
export type IconType =
  | "index"
  | "statistics"
  | "add"
  | "accounts"
  | "settings"
  | "profile"
  | "editAccounts"
  | "labels"
  | "templates"
  | "categories"
  | "notifications"
  | "about";

// Define the icons object with the proper type
export const icons: Record<IconType, (props: any) => JSX.Element> = {
  index: (props: any) => (
    <AntDesign name="home" size={26} color="#000" {...props} />
  ),
  statistics: (props: any) => (
    <Ionicons name="stats-chart" size={26} color="#000" {...props} />
  ),
  add: (props: any) => (
    <Fontisto name="plus-a" size={26} color="#000" {...props} />
  ),
  accounts: (props: any) => (
    <MaterialIcons
      name="account-balance-wallet"
      size={26}
      color="#000"
      {...props}
    />
  ),
  settings: (props: any) => (
    <MaterialIcons name="person-2" size={26} color="#000" {...props} />
  ),
  profile: (props: any) => (
    <FontAwesome5 name="user-circle" size={26} color="#000" {...props} />
  ),
  editAccounts: (props: any) => (
    <FontAwesome name="bank" size={26} color="#000" {...props} />
  ),
  labels: (props: any) => (
    <MaterialIcons name="label" size={26} color="#000" {...props} />
  ),
  templates: (props: any) => (
    <MaterialIcons name="description" size={26} color="#000" {...props} />
  ),
  categories: (props: any) => (
    <MaterialIcons name="category" size={26} color="#000" {...props} />
  ),
  notifications: (props: any) => (
    <Ionicons name="notifications" size={26} color="#000" {...props} />
  ),
  about: (props: any) => (
    <Entypo name="info-with-circle" size={26} color="#000" {...props} />
  ),
};

export const getBaseRouteName = (routeName: string): IconType => {
  const baseRoute = routeName.split("/")[0] as IconType; // Type assertion here
  return baseRoute;
};

export const getIconComponent = (
  family: string | null,
  name: string | null,
  size: number = 24,
  color: string = "white"
) => {
  switch (family) {
    case "Ionicons":
      return <Ionicons name={name as any} size={size} color={color} />;
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case "FontAwesome":
      return <FontAwesome name={name as any} size={size} color={color} />;
    case "Feather":
      return <Feather name={name as any} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
      );
    case "FontAwesome5":
      return <FontAwesome5 name={name as any} size={size} color={color} />;
    default:
      return <FontAwesome5 name="question" size={size} color={color} />;
  }
};
