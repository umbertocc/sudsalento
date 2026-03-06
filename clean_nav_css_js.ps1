$targets=@('castro','gallipoli','eventi-salento','contatti','lido-marini','casa-giorgio-6','marina-di-felloniche','porto-cesareo','pescoluse','porto-selvaggio','punta-prosciutto','santa-maria-di-leuca','torre-mozza','torre-pali','torre-san-giovanni','torre-vado')

foreach($slug in $targets){
  $path="astro-site/src/pages/$slug.astro"
  if(-not (Test-Path $path)){ continue }

  $text=Get-Content -Raw -LiteralPath $path

  $lines=$text -split "`r?`n"
  $out=New-Object System.Collections.Generic.List[string]
  $inStyle=$false

  foreach($line in $lines){
    if($line -match '<style[^>]*>'){ $inStyle=$true }

    if($inStyle){
      $t=$line.Trim()
      if(
        $t -match '^\.navbar\b' -or
        $t -match '^\.navbar-container\b' -or
        $t -match '^\.navbar-brand\b' -or
        $t -match '^\.navbar-menu\b' -or
        $t -match '^\.dropdown\b' -or
        $t -match '^\.dropdown-toggle\b' -or
        $t -match '^\.dropdown-menu\b' -or
        $t -match '^\.hamburger\b' -or
        $t -match '^\.bar\b'
      ){
        continue
      }
    }

    $out.Add($line)

    if($line -match '</style>'){ $inStyle=$false }
  }

  $text=($out -join "`n")

  $text=[regex]::Replace($text,'(?is)<script>\s*//\s*Menu Hamburger.*?</script>','')
  $text=[regex]::Replace($text,'(?is)<script[^>]*>.*?(toggleMenu\s*\(|function\s+toggleMenu|function\s+closeMenu|document\.querySelector\(''\.dropdown-toggle''\)|getElementById\(''navbarMenu''\)).*?</script>','')
  $text=[regex]::Replace($text,"`n{3,}","`n`n")

  Set-Content -LiteralPath $path -Value $text -NoNewline
  Write-Output "CLEANED $path"
}
