import { fireEvent, render, screen } from "@testing-library/react";

import { WebSearchSettings } from "@/components/settings/web-search-settings";
import { resetWebSearchStore, useWebSearchStore } from "@/lib/stores/web-search";

describe("WebSearchSettings", () => {
  beforeEach(() => {
    resetWebSearchStore();
  });

  it("allows selecting a different default provider", () => {
    render(<WebSearchSettings />);

    const tavilyRadio = screen.getByLabelText("选择 Tavily 作为默认搜索服务");
    fireEvent.click(tavilyRadio);

    expect(useWebSearchStore.getState().defaultProviderId).toBe("tavily");
  });

  it("updates API key configuration", () => {
    render(<WebSearchSettings />);

    const apiKeyInput = screen.getAllByPlaceholderText("sk-...")[0];
    fireEvent.change(apiKeyInput, { target: { value: "sk-test" } });

    expect(useWebSearchStore.getState().providerConfigs.tavily?.apiKey).toBe("sk-test");
  });

  it("adds a subscribe source", () => {
    render(<WebSearchSettings />);

    fireEvent.change(screen.getByPlaceholderText("团队知识库"), {
      target: { value: "Docs" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://docs.example.com/feed.xml"), {
      target: { value: "https://docs.example.com/feed.xml" },
    });

    fireEvent.click(screen.getByRole("button", { name: "添加订阅源" }));

    const sources = useWebSearchStore.getState().subscribeSources;
    expect(sources).toHaveLength(1);
    expect(sources[0].name).toBe("Docs");
  });
});
