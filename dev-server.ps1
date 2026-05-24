param(
  [int]$Port = 8080
)

$root = (Get-Location).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()
Write-Host "Pocket Pet PWA running at http://localhost:$Port"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
}

function Handle-Client {
  param([System.Net.Sockets.TcpClient]$client)

  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 3000
    $stream.WriteTimeout = 3000
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()

    if ([string]::IsNullOrWhiteSpace($requestLine)) {
      return
    }

    while ($stream.DataAvailable -and ($line = $reader.ReadLine()) -ne $null -and $line -ne "") {}

    $path = "/"
    if ($requestLine -match "^[A-Z]+ ([^ ]+) HTTP/") {
      $path = [Uri]::UnescapeDataString($matches[1].Split("?")[0])
    }

    if ($path -eq "/") { $path = "/index.html" }
    $relative = $path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $file = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative))

    if (-not $file.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($file)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Write($body, 0, $body.Length)
      continue
    }

    $body = [System.IO.File]::ReadAllBytes($file)
    $ext = [System.IO.Path]::GetExtension($file)
    $type = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
    $header = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Write($body, 0, $body.Length)
  } finally {
    $client.Close()
  }
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  [System.Threading.ThreadPool]::QueueUserWorkItem([System.Threading.WaitCallback]{
    param($acceptedClient)
    Handle-Client -client $acceptedClient
  }, $client) | Out-Null
}
