//Global Layout: Header and Footer
import { Box } from '@mui/material';
import { Outlet } from '@umijs/max';
import React from 'react';
import Footer from './Footer';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <Box className='flex flex-col min-h-screen bg-[#0F0F0F] bg-[url("@/assets/images/bg_bottom.png")] bg-no-repeat bg-contain bg-bottom'>
      <Header></Header>
      <Box className="w-full grow">
        <Box className="container mx-auto h-full ">
          <Outlet />
        </Box>
      </Box>
      <Footer></Footer>
    </Box>
  );
};

export default Layout;
