import React, { useState } from "react";
import Head from "next/head";
import Header from "./header";
// import Navbar from "./header/Navbar";

type Props = {
  children?: any;
  header?: any;
  head?: any;
  title?: any;
  description?: any;
  logo?: string;
  images?: string;
  userDefault?: string;
  roles?: any;
  token?: any;
  refreshToken?: any;
  icons?: any;
};

const DashboardLayouts = ({
  children,
  description,
  logo,
  header,
  userDefault,
  token,
  refreshToken,
  roles,
  icons,
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <div className="bg-gray">
      <Head>
        <title>{`${header}`} | Barriergate</title>
        <link rel="icon" href={logo ? logo : `./image/logo-bar.png`} />
        <meta name="description" content={`Barriergate - ${description}`} />
      </Head>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            header={header}
            userDefault={userDefault}
            token={token}
            refreshToken={refreshToken}
            icons={icons}
            roles={roles}
          />

          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          {/* <div className='mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10'> */}
          <main className="'mx-auto w-full h-full">{children}</main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default DashboardLayouts;
