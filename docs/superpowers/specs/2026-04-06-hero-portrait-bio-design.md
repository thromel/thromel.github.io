# Hero Portrait And Bio Refresh Design

## Summary

Refine the homepage hero so the portrait feels intentionally placed rather than vertically floating, and rewrite the hero bio to sound more restrained and factual. The change should stay tightly scoped to the homepage hero and should not redesign the broader page.

## Goals

- Fix the portrait placement so it aligns with the text column more naturally on desktop.
- Keep the portrait image asset unchanged.
- Rewrite the bio to sound less inflated and more direct.
- Preserve the current personality of the homepage without turning the hero into a new design direction.

## Non-Goals

- Replacing the portrait image.
- Redesigning the entire hero section.
- Changing the homepage information architecture.
- Reworking mobile hero layout beyond what is needed to keep the desktop fix from leaking.

## Current Problems

- The portrait is vertically centered against the entire hero block, which makes it start too high relative to the body copy.
- The result feels visually detached from the bio and more like a floating card than a deliberate anchor in the composition.
- The current bio text reads too promotional and self-conscious. It tries to cover too many ideas in one breath and ends up sounding stiff.

## Recommended Approach

Use the existing hero layout and make one desktop-focused alignment adjustment:

- stop treating the portrait as a vertically centered counterpart to the whole hero block
- top-align the portrait wrapper in the hero grid
- add a modest desktop-only downward offset so the image visually starts closer to the bio paragraph than the headline

At the same time, replace the current bio copy with a simpler, more grounded version.

## Layout Design

### Desktop

On desktop, the portrait should be visually tied to the body copy, not the heading stack.

Implementation intent:

- the hero grid remains two-column
- the portrait wrapper is aligned to the top of the grid area
- the portrait receives a small positive top offset so it sits slightly lower than the top of the text column
- image size should remain roughly the same unless a very small adjustment is needed to preserve balance

This should make the portrait feel placed beside the reading block rather than beside the name.

### Mobile

Keep the existing mobile stacking behavior unless the new desktop rule leaks downward. If a reset is needed on smaller breakpoints, it should only neutralize the desktop offset.

## Copy Design

The new copy should be:

- more factual
- less self-promotional
- shorter in rhythm
- still personal enough to avoid sounding sterile

### Replace the main bio with

```html
<strong>Software engineer and researcher</strong> with a CS degree from <a href="https://cse.buet.ac.bd" target="_blank">BUET</a>. I work on backend healthcare systems at <a href="{{ site.data.profile.current_company.url }}" target="_blank">{{ site.data.profile.current_company.name }}</a> and study how AI is changing software engineering, especially around developer tools, reliability, and security. I am starting an <strong>M.Sc in Computing Science</strong> at the <a href="https://www.ualberta.ca/en/computing-science/index.html" target="_blank">University of Alberta</a> in September 2026.
```

### Replace the personal bio with

```html
Outside work, I read a lot of history and economics, travel when I can, and usually have a novel in progress.
```

Keep the existing `More about me →` link after the personal sentence.

## Files

- Modify: [index.html](/Users/romel/Documents/GitHub/thromel.github.io/index.html)
- Modify: [assets/css/overhaul.css](/Users/romel/Documents/GitHub/thromel.github.io/assets/css/overhaul.css)

No other files should be needed for the first implementation.

## Styling Strategy

- Make the portrait placement change in the existing homepage hero rules, not by adding a separate hero variant.
- Prefer a small number of targeted rules over larger grid rewrites.
- Reset the portrait offset inside the existing mobile breakpoint so the stacked mobile layout remains unchanged.

## Verification

Implementation is complete when all of the following are true:

- the portrait sits lower and feels anchored to the bio block on desktop
- the mobile hero still stacks cleanly
- the rewritten bio reads plainly and naturally in the rendered hero
- `bundle exec jekyll build` succeeds
- a fresh desktop screenshot shows the portrait no longer floating too high

## Risks And Mitigations

- Risk: lowering the portrait too much can make the hero feel visually bottom-heavy
  - Mitigation: keep the offset modest and relative to the bio, not dramatic

- Risk: changing global hero alignment can affect other pages
  - Mitigation: scope adjustments to the homepage classic hero rules where possible

- Risk: the rewrite becomes too flat or generic
  - Mitigation: keep one specific sentence about current work and one specific sentence about the Alberta start date

## Open Decisions Resolved

- Best design direction: top-align the portrait and add a small downward offset
- Bio tone: understated, factual, and less promotional
- Scope: homepage hero only
