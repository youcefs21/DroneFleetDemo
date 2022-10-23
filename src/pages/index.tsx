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
        <Navbar currentPage="dashboard"/>
        <main className="container mx-auto flex-auto flex-col items-center justify-center p-4">
          this is a clone of Skydio Cloud API, with redis caching. <br />
          the base path is <a href="/api/v0/" className={"text-blue-400"}>/api/v0</a> <br />
          <br />
          documentation is available at <a href="https://cloud.skydio.com/documentation" className={"text-blue-400"}>https://cloud.skydio.com/documentation</a>
        </main>
        <footer className="flex-[0_1_20px] text-center h-6 bg-gray-600 text-white text-xs">
          This site is not affiliated with Skydio. Built by <a href="https://github.com/youcefs21" className="text-blue-400">Youcef Boumar</a>
        </footer>
      </div>
    </>
  );
};

export default Home;

