import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("Label + Input", () => {
  it("associa o rótulo ao campo e foca o campo ao clicar no rótulo", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="ddd">DDD</Label>
        <Input id="ddd" />
      </>,
    );

    const input = screen.getByLabelText("DDD");
    expect(input).toBeInstanceOf(HTMLInputElement);
    await user.click(screen.getByText("DDD"));
    expect(input).toHaveFocus();
  });
});
