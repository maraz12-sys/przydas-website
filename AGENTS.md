# Animilandia birthday landing

This branch is the independent WordPress birthday landing. It must not be merged into or modify the Przydaś production main branch.

Repository: maraz12-sys/przydas-website. Branch: animilandia-urodziny. User-facing origin: https://urodziny.animilandia.pl. Fallback: https://animilandia.pl/urodziny-z-animatorem/.

Preserve package facts from packages.json and source branding. Never invent testimonials or popularity statistics. Never include secrets, customer records or production database exports in source or release archives.

For changes: edit source, increment both plugin version declarations, run PHP syntax and behavior tests plus JS syntax, commit code to this branch, then publish release.json in a separate commit pointing at the exact tested code commit. Only source_commit and semantic version are accepted. The updater's repository and source allowlist must not be widened.

Do not claim deployment is complete until WordPress has installed the target version and the public landing, form persistence, admin authorization and email delivery are verified. A successful wp_mail return is not proof of delivery. This code has no dependence on ChatGPT hosting or authentication.
