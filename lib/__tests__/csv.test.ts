import { describe, it, expect } from "vitest";
import { generateCSV } from "../csv";

describe("generateCSV", () => {
  it("generates CSV with headers and rows", () => {
    const csv = generateCSV(["Nombre", "Precio"], [
      ["Producto A", "100"],
      ["Producto B", "200"],
    ]);
    expect(csv).toBe("Nombre,Precio\nProducto A,100\nProducto B,200");
  });

  it("handles empty rows", () => {
    const csv = generateCSV(["Col1", "Col2"], []);
    expect(csv).toBe("Col1,Col2");
  });

  it("escapes fields with commas", () => {
    const csv = generateCSV(["Name"], [["Hello, World"]]);
    expect(csv).toBe('Name\n"Hello, World"');
  });

  it("escapes fields with double quotes", () => {
    const csv = generateCSV(["Name"], [['Say "Hi"']]);
    expect(csv).toBe('Name\n"Say ""Hi"""');
  });

  it("escapes fields with newlines", () => {
    const csv = generateCSV(["Name"], [["Line1\nLine2"]]);
    expect(csv).toBe('Name\n"Line1\nLine2"');
  });

  it("handles empty strings in rows", () => {
    const csv = generateCSV(["A", "B"], [["", ""]]);
    expect(csv).toBe("A,B\n,");
  });
});
