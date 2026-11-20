import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GaleriaDaConversa, useGaleriaDaConversa, type ItemDaGaleria } from "./GaleriaDaConversa";

const itens: ItemDaGaleria[] = [
  { id: "a", tipo: "imagem", rotulo: "Foto 1" },
  { id: "b", tipo: "imagem", rotulo: "Foto 2" },
  { id: "c", tipo: "pdf", rotulo: "Contrato.pdf" },
];

function Abrir({ id }: { id: string }) {
  const g = useGaleriaDaConversa();
  return <button onClick={() => g?.abrir(id)}>abrir {id}</button>;
}

describe("GaleriaDaConversa (fork C&G)", () => {
  it("abre na foto clicada e passa para a próxima e a anterior", () => {
    render(<GaleriaDaConversa itens={itens}><Abrir id="b" /></GaleriaDaConversa>);
    fireEvent.click(screen.getByText("abrir b"));
    expect(screen.getByText("2 de 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
    expect(screen.getByTitle("Contrato.pdf")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });
});
