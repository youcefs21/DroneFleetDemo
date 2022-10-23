import Link from "next/link";
import { FC } from "react";

export type pageNameType = "dashboard" | "batchControls" | "assets" | "3DReconstruction";

type NavItemType = FC<{
  href: string,
  children: string,
  currentPage: pageNameType,
  pageName: pageNameType
}>;


const NavItem: NavItemType = ({ href, children, currentPage, pageName }) => {
  return (
    <div className="">
      <Link href={href}>
        <a className={`${currentPage === pageName ? "bg-gray-900 text-white" : "hover:text-white hover:bg-gray-700"} text-gray-300  px-3 py-2 rounded-md text-sm font-semibold`}>
          {children}
        </a>
      </Link>
    </div>
  );
};

type navbarType = FC<{
  currentPage: pageNameType
}>;

export const Navbar: navbarType = ({currentPage}) => {
  return (
    <nav className="flex-initial shadow-md bg-gray-800">
      <div className="flex h-16 p-3 gap-8">
        <div className="flex flex-shrink-0 items-center">
          <img className="block h-8 w-auto rounded" src="/favicon.ico"/>
        </div>
        <div className="flex place-items-center gap-2">
        </div>
      </div>
    </nav>
  );
}
