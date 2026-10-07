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
- Editable site content (hero, FAQ, announcement, affiliate %) lives in the site_content table keyed by name; pricing in plans — never hardcode them in the frontend, so admins can edit live.
- Uploaded Instagram showcase recordings use asset pointers and a dedicated browser-side carousel so playback stays independent of editor previews.
- The Instagram recording carousel uses Embla for touch dragging and snapping; automatic advancement pauses during gestures to avoid fighting manual swipes.
- The shared showcase device shell replaces only the recordings' system-bar margins with device chrome, preserving uploaded app content and playback.
