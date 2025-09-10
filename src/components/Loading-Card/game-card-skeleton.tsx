import { Card } from "@/components/ui/card";

export function GameCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700 p-3 text-white">
      {/* Date + Time */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div
          className="h-3 w-16 bg-slate-700 rounded animate-pulse"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="h-3 w-12 bg-slate-700 rounded animate-pulse"
          style={{ animationDelay: "0.1s" }}
        ></div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between my-2">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div
            className="w-12 h-12 bg-slate-700 rounded-full mb-1 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="h-3 w-16 bg-slate-700 rounded animate-pulse"
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>

        <div className="text-slate-400 font-bold text-sm mx-2">vs</div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div
            className="w-12 h-12 bg-slate-700 rounded-full mb-1 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="h-3 w-16 bg-slate-700 rounded animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
      </div>

      {/* Location */}
      <div
        className="h-3 w-32 bg-slate-700 rounded my-1 animate-pulse"
        style={{ animationDelay: "0.6s" }}
      ></div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-2">
        <div
          className="h-3 w-20 bg-slate-700 rounded animate-pulse"
          style={{ animationDelay: "0.7s" }}
        ></div>
        <div
          className="h-3 w-28 bg-slate-700 rounded animate-pulse"
          style={{ animationDelay: "0.8s" }}
        ></div>
      </div>
    </Card>
  );
}