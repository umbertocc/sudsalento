$pages = Get-ChildItem -Path "c:/Users/CCNMRT87R/ProjectVsCode/sudsalento/astro-site/src/pages" -Filter "*.astro" -File
$changed = @()

function Get-HeadingEmoji([string]$text) {
  $t = $text.ToLowerInvariant()
  if ($t -match 'contattaci') { return '' }
  elseif ($t -match 'whatsapp') { return '' }
  elseif ($t -match 'telefono') { return '' }
  elseif ($t -match 'email') { return '' }
  elseif ($t -match 'ubicazione|posizione|dove si trova') { return '' }
  elseif ($t -match 'home') { return '' }
  elseif ($t -match 'vista mare') { return '' }
  elseif ($t -match 'casa giorgio') { return '' }
  elseif ($t -match 'caratteristiche|servizi') { return '' }
  elseif ($t -match 'spazi interni') { return '' }
  elseif ($t -match 'nei dintorni|dintorni|località vicine') { return '' }
  elseif ($t -match 'perché scegliere') { return '' }
  elseif ($t -match 'disponibilità') { return '' }
  elseif ($t -match 'benvenuti') { return '' }
  elseif ($t -match 'pineta') { return '' }
  elseif ($t -match 'spiaggia|spiagge') { return '' }
  elseif ($t -match 'famiglie|bambini') { return '' }
  elseif ($t -match 'attività|sport|cosa fare') { return '' }
  elseif ($t -match 'pet friendly') { return '' }
  elseif ($t -match 'gastronomia|dove mangiare|specialità') { return '' }
  elseif ($t -match 'come arrivare|in auto|indicazioni') { return '' }
  elseif ($t -match 'parcheggi|parcheggio') { return '' }
  elseif ($t -match 'trasporti pubblici') { return '' }
  elseif ($t -match 'consigli utili') { return '' }
  elseif ($t -match 'eventi|vita notturna') { return '' }
  elseif ($t -match 'condividi|link utili') { return '' }
  elseif ($t -match 'ugento') { return '' }
  else { return '' }
}

foreach ($file in $pages) {
  $s = Get-Content -Raw -Encoding UTF8 $file.FullName
  $orig = $s

  $s = $s.Replace('Perch','Perché').Replace('Disponibilit','Disponibilità').Replace('Attivit','Attività').Replace('attivit','attività').Replace('Localit','Località').Replace('localit','località').Replace('Citt','Città').Replace('citt','città').Replace('Specialit','Specialità').Replace('specialit','specialità')

  $s = [regex]::Replace($s, '(<h[1-6][^>]*>)\?{2,}\s*([^<]+)(</h[1-6]>)', {
    param($m)
    $inner = $m.Groups[2].Value.Trim()
    $emoji = Get-HeadingEmoji $inner
    return "$($m.Groups[1].Value)$emoji $inner$($m.Groups[3].Value)"
  })

  $s = [regex]::Replace($s, '(<a\b[^>]*>)\?{2,}\s*([^<]+)(</a>)', {
    param($m)
    $inner = $m.Groups[2].Value.Trim()
    $emoji = Get-HeadingEmoji $inner
    return "$($m.Groups[1].Value)$emoji $inner$($m.Groups[3].Value)"
  })

  $s = [regex]::Replace($s, '(^\s*)\?{2,}\s*(<strong>WhatsApp:)', '$1 $2', 'Multiline')
  $s = [regex]::Replace($s, '(^\s*)\?{2,}\s*(<strong>Telefono:)', '$1 $2', 'Multiline')
  $s = [regex]::Replace($s, '(^\s*)\?{2,}\s*(<strong>Email/Form:)', '$1 $2', 'Multiline')

  $s = [regex]::Replace($s, '(<p[^>]*>)\?{2,}\s*(Spiagge del Salento)', '$1 $2')
  $s = [regex]::Replace($s, '(<p[^>]*>)\?{2,}\s*(Torre Pali, Lecce \(LE\))', '$1 $2')
  $s = [regex]::Replace($s, '(<p>)\?{2,}\s*(<a href="tel:)', '$1 $2')
  $s = [regex]::Replace($s, '(<p>)\?{2,}\s*(<strong>info@)', '$1 $2')
  $s = [regex]::Replace($s, '(<p>)\?{2,}\s*(<a href="https://wa\.me/)', '$1 $2')

  $s = [regex]::Replace($s, '(<div class="amenity-icon">)\?+(</div>)', '$1$2')
  $s = [regex]::Replace($s, '(<div class="feature-item-icon">)\?+(</div>)', '$1$2')
  $s = [regex]::Replace($s, '(<div class="info-card-icon">)\?+(</div>)', '$1$2')
  $s = [regex]::Replace($s, '(<div[^>]*>)\?{5}(</div>)', '$1$2')
  $s = [regex]::Replace($s, '(<span>)\?{2,}(</span>\s*WhatsApp)', '$1$2')
  $s = [regex]::Replace($s, '(<span>)\?{2,}(</span>\s*Email)', '$1$2')

  if ($s -ne $orig) {
    Set-Content -Path $file.FullName -Value $s -Encoding UTF8
    $changed += $file.Name
  }
}

"CHANGED_FILES"
$changed
"TOTAL_CHANGED=$($changed.Count)"
