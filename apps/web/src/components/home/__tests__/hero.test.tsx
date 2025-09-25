import { fireEvent, render, screen } from "@testing-library/react";

import { Hero } from "../hero";

describe("Hero", () => {
  it("updates welcome message", () => {
    render(<Hero />);

    const textarea = screen.getByLabelText(/欢迎语/);
    fireEvent.change(textarea, { target: { value: "你好，世界" } });
    fireEvent.click(screen.getByRole("button", { name: "更新消息" }));

    expect(textarea).toHaveValue("你好，世界");
  });
});
