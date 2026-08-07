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

Each field is displayed in a row with a label on the left (gray, `textSecondary`) and the value on the right:

| Label (i18n key) | Value | Example |
|---|---|---|
| `details_amount` | Amount formatted with currency | `€1,234.56` |
| `details_account` | Account icon (28×28) + account name | `🏦 Bank` |
| `details_category` | Category icon (28×28) + category name | `🍔 Restaurant` |
| `details_date` | Date in long format according to language | `July 14, 2026` / `14 de julio de 2026` / `14 de juliol de 2026` |
| `details_comment` | Transaction comment, or "No comment" text in gray if empty | `Dinner with friends` / _No comment_ |

### 3. Date

- The long date format depends on the active language:
  - **en:** `July 14, 2026`
  - **es:** `14 de julio de 2026`
  - **ca:** `14 de juliol de 2026`
- Implemented as a `formatDateLong(date, language)` function in `formatters.ts`.

### 4. Comment

- The "Comment" section is always shown (visual consistency with the rest of the fields).
- If `transaction.description` is `null` or an empty string, the text "No comment" / "Sin comentario" / "Sense comentari" is displayed in `textSecondary` color without background.
- If there is a comment, the full text is displayed in `text` color.

### 5. Photo

- A "Photo" row (i18n key `details_photo`) appears after the Tags row, but only if the transaction has a photo (`transaction.photo` is not null) and the platform is not web.
- Shows a tappable thumbnail (max width 200, aspect ratio preserved).
- Tapping opens a full-screen image viewer: a `<Modal>` with black background, the image displayed with `resizeMode: 'contain'`, and a close button ("×" icon) in the top-right corner (i18n key `photo_viewer_close`).
- If no photo, the row is hidden entirely (not showing "—").
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
- [x] The "Comment" section is always shown; if empty, "No comment" appears in gray.
- [ ] The "Photo" row shows a thumbnail when a photo exists (hidden on web, hidden when no photo).
- [ ] Tapping the photo thumbnail opens a full-screen viewer with close button.
- [x] The "Delete" button shows a confirmation modal with "No" and "Yes".
- [x] Confirming "Yes" deletes the transaction and returns to the previous screen.
- [x] The "Edit" button navigates to `ModifyTransaction` with `transactionId` (TODO).
- [x] The footer shows "Created HH:mm dd MMM yyyy" in 24h with the active language (year always visible).
- [ ] All texts change when switching the language in settings.
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
