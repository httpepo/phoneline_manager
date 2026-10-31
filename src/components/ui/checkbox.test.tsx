import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("alterna com Espaço e reflete o estado em aria-checked e data-state", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Aceito os termos" />);

    const checkbox = screen.getByRole("checkbox", { name: "Aceito os termos" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-state", "checked");

    await user.keyboard(" ");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("desabilitado não alterna", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Aceito os termos" disabled />);

    const checkbox = screen.getByRole("checkbox", { name: "Aceito os termos" });
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });
});
