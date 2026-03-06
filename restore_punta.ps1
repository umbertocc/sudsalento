$html = Get-Content -Raw -LiteralPath 'docs/punta-prosciutto.html'
$head = [regex]::Match($html, '(?is)<head>(.*?)</head>').Groups[1].Value
$body = [regex]::Match($html, '(?is)<body[^>]*>(.*?)</body>').Groups[1].Value
$body = [regex]::Replace($body, '(?is)<nav class="navbar">.*?</nav>', '<SiteNav guideHref="/spiagge-salento" />', 1)

$out = @"
---
import SiteNav from '../components/SiteNav.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout>
<Fragment slot="head">
$head
</Fragment>
$body
</BaseLayout>
"@

Set-Content -LiteralPath 'astro-site/src/pages/punta-prosciutto.astro' -Value $out -NoNewline
Write-Output 'RESTORED punta-prosciutto'
