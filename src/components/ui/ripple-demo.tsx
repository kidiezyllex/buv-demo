import React from "react";
import { Button } from "./button";
import { RippleEffect } from "./ripple-effect";

export const RippleDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-3 md:space-y-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-semibold text-neutral-300 mb-4">
        Ripple Effect Demo
      </h2>

      {/* Button with Ripple */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg font-semibold text-neutral-300">
          Buttons with Ripple Effect
        </h3>
        <div className="flex gap-3 md:gap-4 flex-wrap">
          <Button ripple>Primary Button</Button>
          <Button variant="outline" ripple rippleColor="rgba(96, 74, 227, 0.3)">
            Outline Button
          </Button>
          <Button
            variant="destructive"
            ripple
            rippleColor="rgba(239, 68, 68, 0.3)"
          >
            Destructive Button
          </Button>
        </div>
      </div>

      {/* Custom Ripple Cards */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg font-semibold text-neutral-300">
          Custom Ripple Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <RippleEffect
            rippleColor="rgba(59, 130, 246, 0.3)"
            duration={600}
            className="p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔵</div>
              <h4 className="font-semibold text-green-800">Blue Ripple</h4>
              <p className="text-green-600 text-sm">Click me!</p>
            </div>
          </RippleEffect>

          <RippleEffect
            rippleColor="rgba(34, 197, 94, 0.3)"
            duration={500}
            className="p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🟢</div>
              <h4 className="font-semibold text-green-800">Green Ripple</h4>
              <p className="text-green-600 text-sm">Click me!</p>
            </div>
          </RippleEffect>

          <RippleEffect
            rippleColor="rgba(239, 68, 68, 0.3)"
            duration={700}
            className="p-4 bg-red-100 rounded-lg cursor-pointer hover:bg-red-200 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔴</div>
              <h4 className="font-semibold text-red-800">Red Ripple</h4>
              <p className="text-red-600 text-sm">Click me!</p>
            </div>
          </RippleEffect>
        </div>
      </div>

      {/* Navigation-like Items */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg font-semibold text-neutral-300">
          Navigation Items
        </h3>
        <div className="bg-gray-800 rounded-lg p-3 md:p-4 space-y-2">
          {["Dashboard", "Users", "Settings", "Reports"].map((item) => (
            <RippleEffect
              key={item}
              rippleColor="rgba(68, 215, 182, 0.3)"
              duration={500}
              className="block"
            >
              <div className="flex items-center p-3 text-neutral-300 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                <div className="w-6 h-6 bg-gray-600 rounded mr-3"></div>
                <span>{item}</span>
              </div>
            </RippleEffect>
          ))}
        </div>
      </div>
    </div>
  );
};
