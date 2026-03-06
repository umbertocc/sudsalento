$pages = Get-ChildItem -Path "c:/Users/CCNMRT87R/ProjectVsCode/sudsalento/astro-site/src/pages" -Filter "*.astro" -File

$repl = @{
  'attivitàà'='attività'; 'Attivitàà'='Attività';
  'localitàà'='località'; 'Localitàà'='Località';
  'cittàà'='città'; 'Cittàà'='Città';
  'disponibilitàà'='disponibilità'; 'Disponibilitàà'='Disponibilità';
  'specialitàà'='specialità'; 'Specialitàà'='Specialità';
  'Perchéé'='Perché';
  'Perch'='Perché'; 'Disponibilit'='Disponibilità';
  'Attivit'='Attività'; 'attivit'='attività';
  'Localit'='Località'; 'localit'='località';
  'Citt'='Città'; 'citt'='città';
  'Specialit'='Specialità'; 'specialit'='specialità';
  'necessit'='necessità'; 'Necessit'='Necessità';
  'possibilit'='possibilità'; 'Possibilit'='Possibilità';
  'biodiversit'='biodiversità'; 'Biodiversit'='Biodiversità';
  'tranquillit'='tranquillità'; 'Tranquillit'='Tranquillità';
  'qualit'='qualità'; 'Qualit'='Qualità';
  'visibilit'='visibilità'; 'Visibilit'='Visibilità';
  'identit'='identità'; 'Identit'='Identità';
  'pi'='più'; 'Pi'='Più';
  'n'='né'; 'N'='Né';
  'C'='°C'
}

foreach ($file in $pages) {
  $s = Get-Content -Raw -Encoding UTF8 $file.FullName

  foreach ($k in $repl.Keys) { $s = $s.Replace($k, $repl[$k]) }

  $s = $s.Replace('à','à').Replace('è','è').Replace('é','é').Replace('ì','ì').Replace('ò','ò').Replace('ù','ù')

  # placeholder prefixes in text nodes
  $s = [regex]::Replace($s, '>(\?{1,5})\s+([^<])', '> $2')

  # list lines starting with ? / ??
  $s = [regex]::Replace($s, '(^\s*)\?{1,5}\s+', '$1 ', 'Multiline')

  # icon containers left empty or with placeholders
  $s = [regex]::Replace($s, '(<div class="(amenity-icon|feature-item-icon|info-card-icon)">)\s*(\?+)?\s*(</div>)', '$1$4')

  # stars placeholders
  $s = [regex]::Replace($s, '(<div[^>]*>)\?{5}(</div>)', '$1$2')

  # spans with replacement char
  $s = [regex]::Replace($s, '(<span>)(</span>)', '$1$2')

  # euro symbol where broken before numbers
  $s = [regex]::Replace($s, '(?=\d)', '€')

  # common standalone replacement-char as verb 'è'
  $s = [regex]::Replace($s, '\s\s', ' è ')

  Set-Content -Path $file.FullName -Value $s -Encoding UTF8
}

"DONE"
