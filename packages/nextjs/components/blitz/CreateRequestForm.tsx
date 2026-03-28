"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CreateRequestForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [bounty, setBounty] = useState("");

  const { writeContractAsync: createRequest, isMining } = useScaffoldWriteContract("BlitzBuddy");

  const handleCreate = async () => {
    try {
      if (!title || !bounty || !durationMinutes) return;
      
      const expiresAt = BigInt(Math.floor(Date.now() / 1000) + Number(expiresInDays || 1) * 24 * 60 * 60);
      await createRequest({
        functionName: "createRequest",
        args: [
          title,
          description,
          category,
          Number(durationMinutes) || 0,
          expiresAt,
        ],
        value: parseEther(bounty || "0"),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setDurationMinutes("");
      setExpiresInDays("");
      setBounty("");
    } catch (e) {
      console.error("Error creating request:", e);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col p-6 lg:p-8 font-sans">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Post a Bounty</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">Broadcast your issue to nearby experts.</p>
        
        <div className="flex-grow flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Problem Summary</label>
            <input type="text" placeholder="e.g. Broken package.json" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Details / Error Logs</label>
            <textarea placeholder="Paste your terminal error here..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 h-24 resize-none" value={description} onChange={e => setDescription(e.target.value)}></textarea>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tag</label>
              <input type="text" placeholder="Frontend" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-400" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Reward (MON)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-bold">♦</span>
                <input type="number" placeholder="0.5" className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-400" value={bounty} onChange={e => setBounty(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Est. Time (Mins)</label>
              <input type="number" placeholder="10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-400" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expires In (Days)</label>
              <input type="number" placeholder="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-400" value={expiresInDays} onChange={e => setExpiresInDays(e.target.value)} />
            </div>
          </div>
        </div>

        <button 
          className="mt-6 w-full bg-black text-white font-bold py-4 rounded-xl shadow-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500 text-sm tracking-wide uppercase" 
          onClick={handleCreate} 
          disabled={isMining || !title || !bounty || !durationMinutes}
        >
          {isMining ? "Deploying Bounty..." : "Lock Bounty & Broadcast"}
        </button>
    </div>
  );
};
