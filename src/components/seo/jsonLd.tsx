/**
 * jsonLd.tsx
 *
 * Emits a JSON-LD block. The site had no structured data at all, which meant
 * search engines had to infer what it is from ~166 words of visible text.
 *
 * Next has no first-class API for this, so a script tag with
 * dangerouslySetInnerHTML is the documented approach. The payload is built
 * server-side from our own constants and never from user input, so there is
 * nothing to escape beyond `<` — which JSON.stringify leaves alone and which
 * would otherwise let a `</script>` sequence break out of the tag.
 */

interface JsonLdProps {
    /** A schema.org node. Serialised as-is. */
    data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, '\\u003c'),
            }}
        />
    );
}
