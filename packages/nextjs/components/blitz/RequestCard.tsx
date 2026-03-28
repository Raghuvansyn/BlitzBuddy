"use client";

import { formatEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const RequestCard = ({ request, accountAddress }: { request: any; accountAddress: string | undefined }) => {
  const { writeContractAsync: acceptRequest, isMining: isAccepting } = useScaffoldWriteContract("BlitzBuddy");
  const { writeContractAsync: completeRequest, isMining: isCompleting } = useScaffoldWriteContract("BlitzBuddy");
  const { writeContractAsync: cancelRequest, isMining: isCanceling } = useScaffoldWriteContract("BlitzBuddy");

  // status enum: 0 = Open, 1 = Accepted, 2 = Completed, 3 = Cancelled
  const isRequester = accountAddress && accountAddress.toLowerCase() === request.requester.toLowerCase();
  const isHelper = accountAddress && accountAddress.toLowerCase() === request.helper.toLowerCase();

  const handleAccept = async () => {
    try {
      await acceptRequest({ functionName: "acceptRequest", args: [request.id] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeRequest({ functionName: "completeRequest", args: [request.id] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRequest({ functionName: "cancelRequest", args: [request.id] });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col font-sans">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-snug">{request.title}</h3>
        <div className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm border border-green-100 whitespace-nowrap">
          ♦ {formatEther(request.bounty)} MON
        </div>
      </div>

      {request.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{request.description}</p>
      )}

      <div className="flex items-center gap-2 mb-4 mt-auto">
        <span className="bg-gray-100 text-gray-600 font-medium text-xs px-2.5 py-1 rounded-md">
          {request.category || "General"}
        </span>
        <span className="bg-gray-100 text-gray-600 font-medium text-xs px-2.5 py-1 rounded-md">
          {request.durationMinutes} mins
        </span>
      </div>

      <div className="text-xs text-gray-400 font-mono mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
        By: {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        {request.status === 0 && !isRequester && (
          <button
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors w-full"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Help & Claim Bounty"}
          </button>
        )}
        {request.status === 0 && isRequester && (
          <button
            className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors w-full"
            onClick={handleCancel}
            disabled={isCanceling}
          >
            {isCanceling ? "Canceling..." : "Cancel"}
          </button>
        )}
        {request.status === 1 && isRequester && (
          <button
            className="bg-green-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-green-600 transition-colors w-full"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? "Paying..." : "Approve Resolution"}
          </button>
        )}
        {request.status === 1 && isHelper && (
          <div className="text-sm font-bold text-amber-500 w-full text-center bg-amber-50 py-2 rounded-xl border border-amber-100">
            Waiting for approval...
          </div>
        )}
        {request.status === 2 && (
          <div className="text-sm font-bold text-gray-400 w-full text-center py-2">✓ Resolved</div>
        )}
        {request.status === 3 && (
          <div className="text-sm font-bold text-gray-400 w-full text-center py-2">Cancelled</div>
        )}
      </div>
    </div>
  );
};
