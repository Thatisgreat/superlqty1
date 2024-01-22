const routes = [
  {
    path: '/',
    routes: [
      {
        path: '',
        redirect: '/trove',
      },
    ],
  },
  {
    path: '/trove',
    name: 'Trove',
    component: '@/pages/trove',
  },
  {
    path: '/trove/:trove_manager',
    name: 'TroveManager',
    component: '@/pages/troveManager',
  },
  {
    path: '/earn',
    name: 'Earn',
    component: '@/pages/earn',
  },
  {
    path: '/earn/:contract',
    name: 'EarnManager',
    component: '@/pages/earnManager',
  },
  {
    path: '/redeem',
    name: 'Redeem',
    component: '@/pages/redeem',
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: '@/pages/portfolio',
  },
  {
    path: '*',
    redirect: '/trove',
  },
];

export default routes;
