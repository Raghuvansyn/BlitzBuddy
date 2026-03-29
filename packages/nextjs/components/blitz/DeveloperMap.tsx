"use client";

const developers = [
  { id: 1, name: "Alex Chen", skills: "Solidity, React", role: "Smart Contract Dev", x: 20, y: 30, avatar: "👨‍💻" },
  { id: 2, name: "Sarah J.", skills: "Foundry, Rust", role: "Backend Engineer", x: 70, y: 15, avatar: "👩‍💻" },
  { id: 3, name: "David M.", skills: "Frontend, UX", role: "Design Tech", x: 40, y: 70, avatar: "👨‍🎨" },
  { id: 4, name: "Priya P.", skills: "Smart Contracts", role: "Security Res", x: 80, y: 65, avatar: "👩‍🔬" },
  { id: 5, name: "You", skills: "Hacker", role: "Need Help", x: 50, y: 45, avatar: "📍", isYou: true },
];

export const DeveloperMap = () => {
  return (
    <div className="relative w-full h-[400px] lg:h-full bg-[radial-gradient(#e5e7eb_1.5px,transparent_1px)] [background-size:20px_20px] bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center font-sans">
      <div className="absolute top-5 left-6 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          ETH San Francisco 
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Hack Map</span>
        </h3>
        <p className="text-sm text-gray-600 font-medium mt-1 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Actively scanning for experts...
        </p>
      </div>

      {/* Map Nodes */}
      <div className="relative w-full h-full max-w-2xl max-h-2xl mx-auto">
        {developers.map(dev => (
          <div
            key={dev.id}
            className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:z-20`}
            style={{ left: `${dev.x}%`, top: `${dev.y}%` }}
          >
            {/* Radar Animation for "You" */}
            {dev.isYou && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-indigo-500/40 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-400/20 animate-ping pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1s' }} />
              </>
            )}

            {/* The Avatar Dot */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full text-xl shadow-md border-2 cursor-pointer transition-transform duration-300 ease-out z-10 relative ${dev.isYou ? "bg-indigo-50 border-indigo-500 scale-110 shadow-indigo-200" : "bg-white border-gray-200 hover:border-gray-400 hover:scale-110"}`}
            >
              {dev.avatar}
            </div>

            {/* The Hover Info Box */}
            <div
              className={`mt-3 px-4 py-3 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity absolute top-12 w-56 text-left z-20 ${dev.isYou ? "hidden" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <div className="font-bold text-sm text-gray-900">{dev.name}</div>
              </div>
              <div className="text-xs text-indigo-600 font-medium mb-2">{dev.role}</div>
              <div className="text-xs text-gray-400 mb-3">{dev.skills}</div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
                  𝕏 @{dev.name.split(" ")[0].toLowerCase()}
                </span>
                <span className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-1">
                  GH github
                </span>
              </div>
            </div>

            {/* "You" Indicator */}
            {dev.isYou && (
              <div className="mt-2 font-bold text-[10px] text-white tracking-wide uppercase bg-indigo-600 px-2.5 py-1 rounded-full shadow-md z-10 relative">
                Scanning...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
