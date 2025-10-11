"use client";

import { useState } from "react";

interface BoroughMapProps {
  onBoroughSelect?: (borough: string | null) => void;
}

export default function BoroughMap({ onBoroughSelect }: BoroughMapProps) {
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  const handleBoroughClick = (borough: string) => {
    const newSelection = selectedBorough === borough ? null : borough;
    setSelectedBorough(newSelection);
    onBoroughSelect?.(newSelection);
  };

  return (
    <div className="w-full bg-white shadow-md py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">NYC Stray Cat Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedBorough ? `Viewing: ${selectedBorough}` : "Click a borough to filter sightings"}
          </p>
        </div>
        
        <svg
          viewBox="0 0 800 600"
          className="w-full max-w-3xl mx-auto"
          style={{ maxHeight: "300px" }}
        >
          {/* The Bronx */}
          <g
            onClick={() => handleBoroughClick("The Bronx")}
            className={`cursor-pointer transition-all ${
              selectedBorough === "The Bronx" ? "fill-blue-600" : 
              selectedBorough ? "fill-gray-300" : "fill-blue-500 hover:fill-blue-600"
            }`}
          >
            <path d="M 450 80 L 520 100 L 540 140 L 530 180 L 500 200 L 460 190 L 440 160 L 450 120 Z" />
            <text x="490" y="150" className="fill-white text-xs font-semibold pointer-events-none text-center" textAnchor="middle">
              Bronx
            </text>
          </g>

          {/* Manhattan */}
          <g
            onClick={() => handleBoroughClick("Manhattan")}
            className={`cursor-pointer transition-all ${
              selectedBorough === "Manhattan" ? "fill-blue-600" : 
              selectedBorough ? "fill-gray-300" : "fill-blue-500 hover:fill-blue-600"
            }`}
          >
            <path d="M 420 200 L 440 210 L 450 280 L 445 350 L 430 360 L 415 350 L 410 280 L 415 210 Z" />
            <text x="430" y="280" className="fill-white text-xs font-semibold pointer-events-none" textAnchor="middle">
              Manhattan
            </text>
          </g>

          {/* Queens */}
          <g
            onClick={() => handleBoroughClick("Queens")}
            className={`cursor-pointer transition-all ${
              selectedBorough === "Queens" ? "fill-blue-600" : 
              selectedBorough ? "fill-gray-300" : "fill-blue-500 hover:fill-blue-600"
            }`}
          >
            <path d="M 480 220 L 620 240 L 650 280 L 640 340 L 580 360 L 520 350 L 470 330 L 450 280 L 460 240 Z" />
            <text x="550" y="300" className="fill-white text-sm font-semibold pointer-events-none" textAnchor="middle">
              Queens
            </text>
          </g>

          {/* Brooklyn */}
          <g
            onClick={() => handleBoroughClick("Brooklyn")}
            className={`cursor-pointer transition-all ${
              selectedBorough === "Brooklyn" ? "fill-blue-600" : 
              selectedBorough ? "fill-gray-300" : "fill-blue-500 hover:fill-blue-600"
            }`}
          >
            <path d="M 430 370 L 520 360 L 560 380 L 580 420 L 560 460 L 500 480 L 440 470 L 410 440 L 415 400 Z" />
            <text x="490" y="425" className="fill-white text-sm font-semibold pointer-events-none" textAnchor="middle">
              Brooklyn
            </text>
          </g>

          {/* Staten Island */}
          <g
            onClick={() => handleBoroughClick("Staten Island")}
            className={`cursor-pointer transition-all ${
              selectedBorough === "Staten Island" ? "fill-blue-600" : 
              selectedBorough ? "fill-gray-300" : "fill-blue-500 hover:fill-blue-600"
            }`}
          >
            <path d="M 240 420 L 320 400 L 360 430 L 370 480 L 340 520 L 280 530 L 230 510 L 220 460 Z" />
            <text x="295" y="465" className="fill-white text-xs font-semibold pointer-events-none" textAnchor="middle">
              Staten Island
            </text>
          </g>

          {/* Borough boundaries - white lines */}
          <path 
            d="M 450 80 L 520 100 L 540 140 L 530 180 L 500 200 L 460 190 L 440 160 L 450 120 Z M 420 200 L 440 210 L 450 280 L 445 350 L 430 360 L 415 350 L 410 280 L 415 210 Z M 480 220 L 620 240 L 650 280 L 640 340 L 580 360 L 520 350 L 470 330 L 450 280 L 460 240 Z M 430 370 L 520 360 L 560 380 L 580 420 L 560 460 L 500 480 L 440 470 L 410 440 L 415 400 Z M 240 420 L 320 400 L 360 430 L 370 480 L 340 520 L 280 530 L 230 510 L 220 460 Z"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="pointer-events-none"
          />
        </svg>
      </div>
    </div>
  );
}

