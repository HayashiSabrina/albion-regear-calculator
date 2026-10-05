<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Keep Party Build image export on `/party/print`: read the composition from IndexedDB first, then fall back to the compact copy in the URL hash (`#data=`), because new tabs from iframed previews may not share storage.
- Load item icons in exported sheets through the same-origin `/api/public/item-icon/$id` proxy, because render.albiononline.com sends no CORS headers and would break PNG capture.
- Reuse `BrandHeader` and the CDN-backed MORS logo pointer for visible branding; keep exported-sheet branding inside `PartyPrintSheet` so PNG capture includes it.
