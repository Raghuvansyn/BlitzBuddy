"use client";

import type { NextPage } from "next";
import { CreateRequestForm } from "~~/components/blitz/CreateRequestForm";
import { DeveloperMap } from "~~/components/blitz/DeveloperMap";
import { RequestsList } from "~~/components/blitz/RequestsList";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-8 px-4 md:px-10 pb-20 bg-[#fafafa] min-h-screen font-sans text-gray-900">
        {/* Header */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <img src="/logo.png" alt="BlitzBuddy Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm border border-gray-100" />
              BlitzBuddy
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-2 tracking-wide uppercase">
              Peer-to-peer hackathon rescue network
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8 max-w-7xl h-auto lg:min-h-[500px] mb-12">
          {/* Left Side: Map of developers */}
          <div className="w-full lg:w-3/5 h-[400px] lg:h-full flex-shrink-0">
            <DeveloperMap />
          </div>

          {/* Right Side: Create Request Box */}
          <div className="w-full lg:w-2/5 h-full flex-shrink-0">
            <CreateRequestForm />
          </div>
        </div>

        <div className="w-full flex gap-8 max-w-7xl flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <RequestsList title="Available Bounties" filterStatus={0} />
          </div>

          <div className="w-full lg:w-1/2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <RequestsList title="Activity History" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
