# 016 — Transaction details page

- **Goal**
`TransactionDetailsScreen` accessible by tapping a transaction from `TransactionsScreen`, `AllTransactionsScreen`, or any transaction listing. Displays all data for an individual transaction: amount, account, category, date, comment, and provides buttons to delete or edit. All texts are multilingual (es/en/ca).

---

## Functional requirements

### 1. Access and navigation

- Tapping a transaction in any listing (`TransactionsScreen`, `AllTransactionsScreen`, `TransactionGroup`) navigates to `TransactionDetails` passing `transactionId` as a parameter.
- The transaction is fetched directly from the database (not from AppContext) to ensure it works when navigating from any screen, including when the Total account is selected.
- The screen has a back button (left arrow) in the header to return to the previous screen.
- The header title is "Transaction details" — i18n key `details_title` (multilingual).

### 2. Data card

Each field is displayed in a row with a **symbol** (an Ionicons glyph in the primary color, `c.primary`) followed by the label on the left, and the value on the right. The symbol matches the field's concept and reuses the icons already used elsewhere in the app: `cash-outline` (Amount), `wallet-outline` (Account), `grid-outline` (Category), `calendar-outline` (Date), `chatbubble-outline` (Comment), `pricetag-outline` (Tags), `repeat-outline` (Recurring), `image-outline` (Photo).

Every row is always present so the card is uniform; when a field has no value the row shows a single placeholder, `details_none` (“—”), in `textSecondary`. Each row is separated from the next by a bottom border, so a separator appears between every pair of rows (the last row has none):

| Label (i18n key) | Value | Example |
|---|---|---|
| `details_amount` | Amount formatted with currency | `€1,234.56` |
| `details_account` | Account icon (28×28) + account name | `🏦 Bank` |
| `details_category` | Category icon (28×28) + category name | `🍔 Restaurant` |
| `details_date` | Date in long format according to language | `July 14, 2026` / `14 de julio de 2026` / `14 de juliol de 2026` |
| `details_comment` | Transaction comment, or `—` if empty | `Dinner with friends` / _—_ |
| `details_tags` | Tag chips, or `—` if none | `lunch` `work` / _—_ |
| `recurring_chip` | Name of the recurring rule that generated the transaction, or `—` | `Rent` / _—_ |
| `details_photo` | Photos (tappable thumbnails), or `—` if none (always last) | 🖼️ / _—_ |

### 3. Date

- The long date format depends on the active language:
  - **en:** `July 14, 2026`
  - **es:** `14 de julio de 2026`
  - **ca:** `14 de juliol de 2026`
- Implemented as a `formatDateLong(date, language)` function in `formatters.ts`.

### 4. Comment

- The "Comment" section is always shown (visual consistency with the rest of the fields).
- If `transaction.description` is `null` or an empty string, the shared placeholder `details_none` (“—”) is shown in `textSecondary` (the same placeholder used for empty Tags and Recurring).
- If there is a comment, the full text is displayed in `text` color.

### 5. Photo

- The "Photos" row (i18n key `details_photo`) is always shown as the **last** row (after Recurring), so the card is uniform for every transaction.
- When the transaction has one or more photos (`transaction.photo` is not null/empty) it shows their tappable thumbnails (max width 200, aspect ratio preserved).
- When there are no photos the row shows the shared `details_none` placeholder ("—") in `textSecondary`.
- Tapping a thumbnail opens a full-screen image viewer: a `<Modal>` with black background, the image displayed with `resizeMode: 'contain'`, and a close button ("×" icon) in the top-right corner (i18n key `photo_viewer_close`).
- **Implementation**: see spec `023-photo-attachment` for full functional requirements.

### 5. "Delete" button

- Button with `trash-outline` icon and "Delete" text (key `details_delete`, multilingual).
- Color: red (`#F87171`), transparent background with red border.
- Tapping it opens a confirmation modal:

**Confirmation modal:**
- Title: `"Delete this transaction?"` (key `details_delete_title`, multilingual).
- Left button: "No" (key `details_delete_no`, multilingual) — closes the modal.
- Right button: "Yes" (key `details_delete_yes`, multilingual) — deletes the transaction, refreshes data, and navigates back to the previous screen.

### 6. "Edit" button (TODO)

- Button with `create-outline` icon and "Edit" text (key `details_edit`, multilingual).
- Color: primary color (`c.primary`).
- Tapping it navigates to a new `ModifyTransaction` screen (TODO) with `transactionId` as a parameter.
- The implementation of `ModifyTransactionScreen` is out of scope for this feature (will be marked as TODO).

### 7. Creation footer

- At the bottom of the screen, aligned to the left, the following text is displayed:
  `"Created HH:mm dd MMM"` (key `details_created`, multilingual).
- Example: `"Created 11:50 14 Jul"` / `"Creado 11:50 14 jul"` / `"Creat 11:50 14 jul"`.
- **24h** format (`HH:mm`) is used for the time.
- `transaction.date` is stored as `YYYY-MM-DD HH:mm:ss`; the time and day are extracted for formatting.
- The year is always shown: `"Created 11:50 14 Jul 2026"`.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()` from the existing i18n system. No hardcoded strings are allowed.
- **Theme**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Monetary format**: use `formatCurrency()` with currency and separator from `ConfigContext`.
- **Navigation**: the screen is added to the Stack navigator with `transactionId` as a route parameter.
- **Auto-refresh**: listing screens (`TransactionsScreen`, `AllTransactionsScreen`) load data directly inside `useFocusEffect` with a cleanup pattern (`active` flag), so they reload from the database each time the screen regains focus (after creating, deleting, or editing a transaction).

---

## Acceptance criteria

- [x] Tapping a transaction in any listing navigates to the details screen.
- [x] The transaction data is fetched directly from the database and displays correctly regardless of the source screen or active account.
- [x] The header shows a back arrow and the title "Transaction details" in the active language.
- [x] The "Amount" row displays the formatted amount with the type color (green income / red expense) and sign (+/-).
- [x] The "Account" section shows icon + account name.
- [x] The "Category" section shows icon + category name.
- [x] The "Date" section displays the date in long format according to the language.
- [x] Each data row shows a muted symbol to the left of its label (matching the field's concept).
- [x] The Comment, Tags, Recurring and Photo rows are always shown; an empty one displays the shared `—` placeholder in gray.
- [x] The Recurring row is present for every transaction (the rule name for a generated transaction, otherwise `—`).
- [x] The Photos row is always the last row: it shows tappable thumbnail(s) when a photo exists, otherwise `—`.
- [x] Every row is separated from the next by a divider (a separator between each pair of rows; the last row has none).
- [x] Tapping the photo thumbnail opens a full-screen viewer with close button.
- [x] The "Delete" button shows a confirmation modal with "No" and "Yes".
- [x] Confirming "Yes" deletes the transaction and returns to the previous screen.
- [x] The "Edit" button navigates to `ModifyTransaction` with `transactionId` (TODO).
- [x] The footer shows "Created HH:mm dd MMM yyyy" in 24h with the active language (year always visible).
- [x] All texts change when switching the language in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
