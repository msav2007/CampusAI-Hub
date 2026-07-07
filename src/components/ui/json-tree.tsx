"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

interface JsonTreeProps {
  data: unknown;
  searchQuery?: string;
  isRoot?: boolean;
  name?: string;
}

export function JsonTree({ data, searchQuery = "", isRoot = true, name }: JsonTreeProps) {
  const [expanded, setExpanded] = React.useState(true);

  const query = searchQuery.toLowerCase();

  const highlight = (text: string) => {
    if (!query) return text;
    const str = String(text);
    const parts = str.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query ? (
            <mark key={i} className="bg-brand/30 text-brand rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const isMatch = React.useCallback(
    (val: unknown): boolean => {
      if (!query) return true;
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return String(val).toLowerCase().includes(query);
      }
      if (Array.isArray(val)) {
        return val.some(isMatch);
      }
      if (val !== null && typeof val === "object") {
        return Object.entries(val).some(([k, v]) => k.toLowerCase().includes(query) || isMatch(v));
      }
      return false;
    },
    [query],
  );

  React.useEffect(() => {
    if (query && isMatch(data)) {
      setExpanded(true);
    }
  }, [query, data, isMatch]);

  if (data === null) {
    return (
      <div className="flex font-mono text-[13px] leading-6">
        {name !== undefined && <span className="text-brand mr-1">"{highlight(name)}"</span>}
        {name !== undefined && <span className="text-muted-foreground mr-1">:</span>}
        <span className="text-muted-foreground italic">null</span>
      </div>
    );
  }

  if (typeof data === "string") {
    return (
      <div className="flex font-mono text-[13px] leading-6">
        {name !== undefined && <span className="text-brand mr-1">"{highlight(name)}"</span>}
        {name !== undefined && <span className="text-muted-foreground mr-1">:</span>}
        <span className="text-emerald-500 break-all">"{highlight(data)}"</span>
      </div>
    );
  }

  if (typeof data === "number") {
    return (
      <div className="flex font-mono text-[13px] leading-6">
        {name !== undefined && <span className="text-brand mr-1">"{highlight(name)}"</span>}
        {name !== undefined && <span className="text-muted-foreground mr-1">:</span>}
        <span className="text-blue-500">{highlight(String(data))}</span>
      </div>
    );
  }

  if (typeof data === "boolean") {
    return (
      <div className="flex font-mono text-[13px] leading-6">
        {name !== undefined && <span className="text-brand mr-1">"{highlight(name)}"</span>}
        {name !== undefined && <span className="text-muted-foreground mr-1">:</span>}
        <span className="text-amber-500">{highlight(String(data))}</span>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = isArray ? [] : Object.keys(data as object);
  const length = isArray ? (data as unknown[]).length : keys.length;
  const isEmpty = length === 0;

  const bracketOpen = isArray ? "[" : "{";
  const bracketClose = isArray ? "]" : "}";

  return (
    <div className="font-mono text-[13px] leading-6 ml-5">
      <div className="flex items-center group -ml-5">
        {!isEmpty && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 mr-1 hover:bg-foreground/10 rounded flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
        {isEmpty && <span className="w-4 h-4 mr-1" />}
        {name !== undefined && <span className="text-brand mr-1">"{highlight(name)}"</span>}
        {name !== undefined && <span className="text-muted-foreground mr-1">:</span>}
        <span className="text-muted-foreground">
          {bracketOpen}
          {!expanded && !isEmpty && ` ${length} ${isArray ? "items" : "keys"} `}
          {!expanded || isEmpty ? bracketClose : ""}
        </span>
      </div>

      {expanded && !isEmpty && (
        <div className="pl-4 border-l border-border/40 ml-[7px]">
          {isArray
            ? (data as unknown[]).map((val, i) => (
                <JsonTree
                  key={i}
                  data={val}
                  name={String(i)}
                  searchQuery={searchQuery}
                  isRoot={false}
                />
              ))
            : keys.map((key) => (
                <JsonTree
                  key={key}
                  data={(data as Record<string, unknown>)[key]}
                  name={key}
                  searchQuery={searchQuery}
                  isRoot={false}
                />
              ))}
        </div>
      )}
      {expanded && !isEmpty && <div className="text-muted-foreground ml-[2px]">{bracketClose}</div>}
    </div>
  );
}
