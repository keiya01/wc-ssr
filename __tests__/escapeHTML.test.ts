import { escapeHTML } from "../src/escapeHTML";

describe("escapeHTML", () => {
  it("should be escaped", () => {
    const html = `<script type="module">console.log(true && 'Hello World')</script>`;
    expect(escapeHTML(html)).toBe(
      "&lt;script type=&quot;module&quot;&gt;console.log(true &amp;&amp; &#39;Hello World&#39;)&lt;/script&gt;"
    );
  });
});
