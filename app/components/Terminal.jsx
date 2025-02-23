"use client";

import { useState } from "react";

export default function Terminal() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Worm.c");

  const tabs = ["Worm.c", "Worm.h", "Cracksome.c", "Net.c", "Wormdes.c", "Hs.c"];

  return (
    <>
      {/* Button to Open Terminal */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-4 right-4 bg-win95blue text-white px-3 py-1 border border-win95border"
      >
        {isVisible ? "Close Terminal" : "Open Terminal"}
      </button>

      {isVisible && (
        <div className="absolute top-16 right-10 w-[45%] bg-black text-[#FFFF88] font-terminal text-sm shadow-lg border border-win95border p-2">
          {/* Terminal Header */}
          <div className="flex bg-win95gray text-black p-1 border-b border-win95border">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`px-2 py-1 cursor-pointer ${activeTab === tab ? "bg-black text-white" : "bg-win95gray text-black"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Terminal Content */}
          <div className="p-2 font-mono overflow-y-auto h-64 border border-win95border bg-[#000060]">
            {activeTab === "Worm.c" && (
              <pre>
{`#define REPORT_PORT 0x2c5d
#define MAGIC_1 0x00148898
#define MAGIC_2 0x00874697
extern int pleasequit;

struct hst {
  char *hostname;
  int flag;
  struct hst *next;
};

typedef struct {
  char *name;
  unsigned long size;
  char *buf;
} object;`}
              </pre>
            )}

            {activeTab === "Worm.h" && (
              <pre>
{`// Header File for Worm.c
#ifndef WORM_H
#define WORM_H

void infectNetwork();
void spreadWorm();
int executePayload();

#endif`}
              </pre>
            )}

            {activeTab === "Cracksome.c" && (
              <pre>
{`#include "Worm.h"

int main() {
  infectNetwork();
  spreadWorm();
  return executePayload();
}`}
              </pre>
            )}
          </div>
        </div>
      )}
    </>
  );
}
