# Outbound card display order
SUMMARY: Keep game state and rule evaluation in ascending order, but sort cards descending immediately before rendering outbound card images.
READ WHEN: before changing card image rendering or the order in which hands, revealed cards, or played cards are sent

---

- `sortCards` remains the canonical ascending order for game state and rule evaluation.
- `CardImageRenderer.render` applies `sortCardsDescending`, so every outbound card image uses the same high-to-low order.
- The rendered order is included in the image cache key, keeping equivalent hands cached consistently.
