import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza com o nome acessível e o anel de foco visível", () => {
    render(<Button>Criar linha</Button>);

    const button = screen.getByRole("button", { name: "Criar linha" });
    expect(button).toHaveClass("focus-visible:ring-2", "focus-visible:ring-ring");
  });

  it("recebe foco pelo teclado e dispara onClick com Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Criar linha</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Criar linha" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("desabilitado não dispara onClick por clique nem por teclado", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Indisponível
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Indisponível" });
    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();
    expect(button).not.toHaveFocus();
    await user.keyboard("{Enter}{ }");
    expect(onClick).not.toHaveBeenCalled();
  });
});
