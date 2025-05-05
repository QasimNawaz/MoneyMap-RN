// type TabsNestedRoutes = {
//   transaction: {
//     history: {
//       selectedAccountId: number;
//     };
//     detail: {
//       transactionId: number;
//     };
//   };
//   profile: {
//     index: undefined;
//   };
//   categories: {
//     index: undefined;
//     "sub-categories": {
//       id: number;
//       name: string;
//     };
//     "add-sub-category": {
//       categoryId: number;
//     };
//     "edit-sub-category": {
//       id: number;
//       name: string;
//     };
//   };
//   labels: {
//     index: undefined;
//   };
//   templates: {
//     index: undefined;
//   };
//   notification: {
//     index: undefined;
//   };
//   about: {
//     index: undefined;
//   };
// };

// export type AppRoutes = {
//   "/": undefined;
//   "(onboarding)": undefined;
//   "(first-account)": undefined;
//   "(tabs)": {
//     index: {
//       screen?: "home";
//     };
//     statistics: undefined;
//     add: {
//       screen?: "first" | "second";
//     };
//     accounts: undefined;
//     settings: undefined;
//   };
//   "(tabs-nested)": {
//     "transaction-history": TabsNestedRoutes["transaction"]["history"];
//     "profile/index": TabsNestedRoutes["profile"]["index"];
//     "categories/index": TabsNestedRoutes["categories"]["index"];
//     "categories/sub-categories": TabsNestedRoutes["categories"]["sub-categories"];
//     "categories/add-sub-category": TabsNestedRoutes["categories"]["add-sub-category"];
//     "categories/edit-sub-category": TabsNestedRoutes["categories"]["edit-sub-category"];
//     "labels/index": TabsNestedRoutes["labels"]["index"];
//     "templates/index": TabsNestedRoutes["templates"]["index"];
//     "notification/index": TabsNestedRoutes["notification"]["index"];
//     "about/index": TabsNestedRoutes["about"]["index"];
//   };
// };

type NestedScreens = {
  "transaction/history": {
    selectedAccountId: number;
  };
  "categories/index": undefined;
  "categories/sub-categories": {
    id: number;
    name: string;
  };
  "categories/add-sub-category": {
    categoryId: number;
  };
  "categories/edit-sub-category": {
    categoryId: number;
    name: string;
  };
  "profile/index": undefined;
  "labels/index": undefined;
  "templates/index": undefined;
  "notification/index": undefined;
  "about/index": undefined;
};

export type AppRoutes = {
  "/": undefined;
  "(onboarding)": undefined;
  "(first-account)": undefined;
  "(tabs)": {
    index: undefined;
    statistics: undefined;
    add: undefined;
    accounts: undefined;
    settings: undefined;
  };
  "(tabs-nested)": NestedScreens;
};

// Type helper for nested navigation
export type NestedNavigationPaths = {
  [K in keyof NestedScreens as `(tabs-nested)/${K}`]: NestedScreens[K];
};

// Combine all routes
export type AllRoutes = AppRoutes & NestedNavigationPaths;
