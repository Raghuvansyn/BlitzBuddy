"use client";

import { RequestCard } from "./RequestCard";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const RequestsList = ({ filterStatus, title }: { filterStatus?: number; title: string }) => {
  const { address } = useAccount();

  const { data: requests, isLoading } = useScaffoldReadContract({
    contractName: "BlitzBuddy",
    functionName: "getAllRequests",
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="loading loading-spinner text-indigo-500"></div>
      </div>
    );
  }

  // Filter requests
  const filteredRequests = (requests || [])
    .filter((req: any) => {
      if (filterStatus !== undefined && req.status !== filterStatus) return false;
      return true;
    })
    .sort((a: any, b: any) => Number(b.id) - Number(a.id));

  return (
    <div className="w-full font-sans">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
          {filteredRequests.length}
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400">
          <div className="text-3xl mb-2">🍃</div>
          <div className="text-sm font-medium">Nothing here yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req: any) => (
            <RequestCard key={req.id.toString()} request={req} accountAddress={address} />
          ))}
        </div>
      )}
    </div>
  );
};
