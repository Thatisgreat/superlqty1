// @ts-nocheck
// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import React from 'react';

export async function getRoutes() {
  const routes = {"1":{"path":"/","parentId":"@@/global-layout","id":"1"},"2":{"path":"","redirect":"/trove","parentId":"1","id":"2"},"3":{"path":"/trove","name":"Trove","parentId":"@@/global-layout","id":"3"},"4":{"path":"/trove/:trove_manager","name":"TroveManager","parentId":"@@/global-layout","id":"4"},"5":{"path":"/earn","name":"Earn","parentId":"@@/global-layout","id":"5"},"6":{"path":"/earn/:contract","name":"EarnManager","parentId":"@@/global-layout","id":"6"},"7":{"path":"/redeem","name":"Redeem","parentId":"@@/global-layout","id":"7"},"8":{"path":"/portfolio","name":"Portfolio","parentId":"@@/global-layout","id":"8"},"9":{"path":"*","redirect":"/trove","parentId":"@@/global-layout","id":"9"},"@@/global-layout":{"id":"@@/global-layout","path":"/","isLayout":true}} as const;
  return {
    routes,
    routeComponents: {
'1': React.lazy(() => import( './EmptyRoute')),
'2': React.lazy(() => import( './EmptyRoute')),
'3': React.lazy(() => import(/* webpackChunkName: "p__trove__index" */'@/pages/trove/index.tsx')),
'4': React.lazy(() => import(/* webpackChunkName: "p__troveManager__index" */'@/pages/troveManager/index.tsx')),
'5': React.lazy(() => import(/* webpackChunkName: "p__earn" */'@/pages/earn.tsx')),
'6': React.lazy(() => import(/* webpackChunkName: "p__earnManager" */'@/pages/earnManager.tsx')),
'7': React.lazy(() => import(/* webpackChunkName: "p__redeem__index" */'@/pages/redeem/index.tsx')),
'8': React.lazy(() => import(/* webpackChunkName: "p__portfolio" */'@/pages/portfolio.tsx')),
'9': React.lazy(() => import( './EmptyRoute')),
'@@/global-layout': React.lazy(() => import(/* webpackChunkName: "layouts__index" */'/Users/liuxiaolin/Documents/--------project---------/cs-project-ultra-liquity-front/src/layouts/index.tsx')),
},
  };
}
