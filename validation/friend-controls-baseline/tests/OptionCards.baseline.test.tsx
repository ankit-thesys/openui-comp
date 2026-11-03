/**
 * OptionCards.
 *
 * Same controlled, data-driven shape as Chips, but with radio/checkbox roles
 * and a row-packing grid. Note the DIFFERENT default selection type.
 *
 * Source: packages/react-ui/src/components/OptionCards/OptionCards.tsx
 */
import { expect, fn, userEvent } from "@storybook/test";
import { describe, it } from "vitest";
import { OptionCards } from "../../../packages/react-ui/src/components/OptionCards";
import { OPTION_CARD_ITEMS } from "../fixtures/data";
import { render } from "../setup/render";

const items = OPTION_CARD_ITEMS.map((i) => ({ ...i }));
const [starter, team, enterprise] = OPTION_CARD_ITEMS;

describe("OptionCards — rendered contract", () => {
  it("defaults to type=single → role=radiogroup with role=radio cards", async () => {
    // Worth pinning: Chips defaults to "multiple" (Chips.tsx:28) while
    // OptionCards defaults to "single" (OptionCards.tsx:35) despite the
    // otherwise identical prop shape — finding OC-1.
    const { getByRole, getAllByRole } = await render(<OptionCards items={items} />);

    expect(getByRole("radiogroup")).toBeInTheDocument();
    expect(getAllByRole("radio")).toHaveLength(3);
  });

  it("uses role=group with role=checkbox cards for type=multiple", async () => {
    const { getByRole, getAllByRole } = await render(<OptionCards items={items} type="multiple" />);

    expect(getByRole("group")).toBeInTheDocument();
    expect(getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renders each card as a <button type=button> with aria-checked", async () => {
    const { getAllByRole } = await render(<OptionCards items={items} />);
    for (const card of getAllByRole("radio")) {
      expect(card.tagName).toBe("BUTTON");
      expect(card).toHaveAttribute("type", "button");
      expect(card).toHaveAttribute("aria-checked", "false");
    }
  });

  it("renders title and subtitle, and omits the subtitle node when absent", async () => {
    const withBoth = await render(<OptionCards items={items} />);
    expect(withBoth.getByText(starter.title)).toBeInTheDocument();
    expect(withBoth.getByText(starter.subtitle)).toBeInTheDocument();
    withBoth.unmount();

    const titleOnly = await render(<OptionCards items={[{ value: "basic", title: "Basic" }]} />);
    expect(titleOnly.container.querySelector(".openui-option-card__subtitle")).toBeNull();
  });

  it("renders a top-content slot only when provided, with its variant class", async () => {
    const plain = await render(<OptionCards items={[{ value: "a", title: "A" }]} />);
    expect(plain.container.querySelector(".openui-option-card__top")).toBeNull();
    plain.unmount();

    const icon = await render(
      <OptionCards items={[{ value: "a", title: "A", topContent: <span>i</span> }]} />,
    );
    // Default variant is "icon" (OptionCards.tsx:77).
    expect(icon.container.querySelector(".openui-option-card__top--icon")).toBeInTheDocument();
    icon.unmount();

    const image = await render(
      <OptionCards
        items={[{ value: "a", title: "A", topContent: <span>i</span>, topContentVariant: "image" }]}
      />,
    );
    expect(image.container.querySelector(".openui-option-card__top--image")).toBeInTheDocument();
  });

  it("renders titles through the inline markdown renderer", async () => {
    // Documented in the prop comment (OptionCards.tsx:11) and worth pinning,
    // because it means titles are NOT rendered as literal text.
    const { container } = await render(
      <OptionCards items={[{ value: "a", title: "**Bold** plan" }]} />,
    );
    const title = container.querySelector(".openui-option-card__title")!;

    expect(title.querySelector("strong")).toHaveTextContent("Bold");
  });

  it("drops items with a falsy value and tolerates a missing array", async () => {
    const { getAllByRole } = await render(
      <OptionCards
        items={[
          { value: "a", title: "A" },
          { value: "", title: "Dropped" },
        ]}
      />,
    );
    expect(getAllByRole("radio")).toHaveLength(1);

    const empty = await render(
      // @ts-expect-error documenting the `(items ?? [])` runtime guard
      <OptionCards items={undefined} />,
    );
    expect(empty.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("marks an odd item count on the grid and packs rows at up to 3 per row", async () => {
    const { container } = await render(<OptionCards items={items} />);
    const grid = container.querySelector(".openui-option-cards__grid")!;

    expect(grid).toHaveClass("openui-option-cards__grid--odd-count");
    expect(container.querySelectorAll(".openui-option-cards__row")).toHaveLength(1);
    expect(container.querySelector(".openui-option-cards__row")).toHaveClass(
      "openui-option-cards__row--3",
    );
  });

  it("forwards native div props to the group root", async () => {
    const { getByRole } = await render(
      <OptionCards items={items} id="plans" aria-label="Plans" data-testid="oc" />,
    );
    const root = getByRole("radiogroup");

    expect(root).toHaveAttribute("id", "plans");
    expect(root).toHaveAttribute("aria-label", "Plans");
    expect(root).toHaveAttribute("data-testid", "oc");
  });
});

describe("OptionCards — selection", () => {
  it("reflects `selected` via aria-checked and the selected class", async () => {
    const { getAllByRole } = await render(<OptionCards items={items} selected={[team.value]} />);
    const cards = getAllByRole("radio");

    expect(cards[1]).toHaveAttribute("aria-checked", "true");
    expect(cards[1]).toHaveClass("openui-option-card--selected");
    expect(cards[0]).toHaveAttribute("aria-checked", "false");
  });

  it("is fully controlled: a click reports intent but moves nothing", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(
      <OptionCards items={items} selected={[]} onToggle={onToggle} />,
    );
    const cards = getAllByRole("radio");

    await userEvent.click(cards[0]);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(starter.value);
    expect(cards[0]).toHaveAttribute("aria-checked", "false");
  });

  it("emits only the toggled value, for select and deselect alike", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(
      <OptionCards items={items} selected={[starter.value]} onToggle={onToggle} />,
    );

    await userEvent.click(getAllByRole("radio")[0]);
    expect(onToggle).toHaveBeenCalledWith(starter.value);
  });

  it("does not enforce single-selection in type=single", async () => {
    // Same finding shape as Chips C-2: `type` drives roles only.
    const { getAllByRole } = await render(
      <OptionCards items={items} selected={[starter.value, team.value]} />,
    );
    const cards = getAllByRole("radio");

    expect(cards[0]).toHaveAttribute("aria-checked", "true");
    expect(cards[1]).toHaveAttribute("aria-checked", "true");
  });

  it("reflects a consumer-driven selection update", async () => {
    const { getAllByRole, rerender } = await render(<OptionCards items={items} selected={[]} />);
    expect(getAllByRole("radio")[1]).toHaveAttribute("aria-checked", "false");

    await rerender(<OptionCards items={items} selected={[team.value]} />);
    expect(getAllByRole("radio")[1]).toHaveAttribute("aria-checked", "true");
  });
});

describe("OptionCards — disabled", () => {
  it("disables a single card via item.disabled", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<OptionCards items={items} onToggle={onToggle} />);
    const cards = getAllByRole("radio");

    expect(cards[2]).toBeDisabled();
    expect(cards[2]).toHaveClass("openui-option-card--disabled");

    await userEvent.click(cards[2]);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("disables every card via the group-level disabled prop", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(
      <OptionCards items={items} disabled onToggle={onToggle} />,
    );
    const cards = getAllByRole("radio");

    for (const card of cards) {
      expect(card).toBeDisabled();
    }
    await userEvent.click(cards[0]);
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe("OptionCards — focus and keyboard", () => {
  it("makes every enabled card its own tab stop (no roving focus)", async () => {
    // OBSERVED DEFECT OC-2, mirroring Chips C-3: role=radiogroup/radio implies
    // one tab stop plus arrow-key selection. These are plain buttons.
    const { getAllByRole } = await render(<OptionCards items={items} />);
    const cards = getAllByRole("radio");

    await userEvent.tab();
    expect(cards[0]).toHaveFocus();

    await userEvent.tab();
    expect(cards[1]).toHaveFocus();
  });

  it("has no arrow-key selection", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<OptionCards items={items} onToggle={onToggle} />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    expect(getAllByRole("radio")[0]).toHaveFocus();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("activates the focused card with Enter and Space", async () => {
    const onToggle = fn();
    const { getAllByRole } = await render(<OptionCards items={items} onToggle={onToggle} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onToggle).toHaveBeenLastCalledWith(starter.value);

    await userEvent.keyboard(" ");
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("skips the disabled card when tabbing", async () => {
    const { getAllByRole } = await render(<OptionCards items={items} />);
    const cards = getAllByRole("radio");

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(cards[2]).not.toHaveFocus();
  });
});
