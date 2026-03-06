$targets = @(
  'castro','gallipoli','eventi-salento','contatti','lido-marini','casa-giorgio-6',
  'marina-di-felloniche','porto-cesareo','pescoluse','porto-selvaggio','punta-prosciutto',
  'santa-maria-di-leuca','torre-mozza','torre-pali','torre-san-giovanni','torre-vado'
)

foreach($slug in $targets){
  $src = "docs/$slug.html"
  $dst = "astro-site/src/pages/$slug.astro"

  if(-not (Test-Path $src)){
    Write-Output "SKIP missing $src"
    continue
  }

  $html = Get-Content -Raw -LiteralPath $src
  $headMatch = [regex]::Match($html, '(?is)<head>(.*?)</head>')
  $bodyMatch = [regex]::Match($html, '(?is)<body[^>]*>(.*?)</body>')

  if(-not $headMatch.Success -or -not $bodyMatch.Success){
    Write-Output "SKIP parse $src"
    continue
  }

  $head = $headMatch.Groups[1].Value
  $body = $bodyMatch.Groups[1].Value

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

  Set-Content -LiteralPath $dst -Value $out -NoNewline
  Write-Output "UPDATED $dst"
}
