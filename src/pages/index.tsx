import type { NextPage } from "next";
import Head from "next/head";
import { Navbar } from "../components/navbar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>My Drone Fleet</title>
        <meta name="description" content="A Drone Fleet Manager" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={"flex flex-col h-screen"}>
        <main className="container mx-auto flex-auto flex-col items-center justify-center p-4">
        </main>
        <footer className="flex-[0_1_20px] text-center h-6 bg-gray-600 text-white text-xs">
          This site is not affiliated with Skydio. Built by <a href="https://github.com/youcefs21" className="text-blue-400">Youcef Boumar</a>
        </footer>
      </div>
    </>
  );
};

export default Home;

