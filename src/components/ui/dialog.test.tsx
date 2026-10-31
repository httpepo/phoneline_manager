import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  it("abre com Enter, prende o foco, fecha com Esc e devolve o foco ao gatilho", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Nova linha</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Nova linha</DialogTitle>
          <DialogDescription>Escolha o DDD e o plano.</DialogDescription>
          <input aria-label="DDD" />
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Nova linha" });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog", { name: "Nova linha" });
    expect(dialog).toHaveAccessibleDescription("Escolha o DDD e o plano.");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.tab();
    await user.tab();
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
