"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { Plus, Trash2 } from "lucide-react";

interface TableBlockProps {
  block: EditorBlock;
  onChange: (rows: string[][]) => void;
  onBackspaceEmpty: () => void;
}

export function TableBlock({ block, onChange, onBackspaceEmpty }: TableBlockProps) {
  const rows: string[][] = block.content?.rows || [
    ["Header 1", "Header 2", "Header 3"],
    ["Cell 1", "Cell 2", "Cell 3"],
  ];

  const updateCell = (rowIndex: number, colIndex: number, val: string) => {
    const next = rows.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? val : c))
    );
    onChange(next);
  };

  const addRow = () => {
    const colCount = rows[0]?.length || 2;
    const newRow = Array(colCount).fill("");
    onChange([...rows, newRow]);
  };

  const addColumn = () => {
    const next = rows.map((r) => [...r, ""]);
    onChange(next);
  };

  const deleteRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, idx) => idx !== rowIndex));
  };

  return (
    <div className="space-y-2 my-2 overflow-x-auto w-full">
      <table className="w-full border-collapse border border-border/80 rounded-2xl text-xs sm:text-sm">
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx === 0 ? "bg-accent/40 font-semibold" : "bg-card/50"}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="border border-border/60 p-2">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Cell..."
                  />
                </td>
              ))}
              <td className="w-8 border-none p-1 text-center">
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteRow(rIdx)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-primary hover:underline font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Row</span>
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-1 text-primary hover:underline font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Column</span>
        </button>
      </div>
    </div>
  );
}
