$port = 8080
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
if ($localIP) {
    try {
        $listener.Prefixes.Add("http://$($localIP):$port/")
    } catch {}
}

try {
    $listener.Start()
} catch {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   VIALPLAY - TEST DE TIEMPO DE REACCION PARA CELULARES   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor local iniciado exitosamente:" -ForegroundColor Green
Write-Host "  -> En tu PC:     http://localhost:$port/" -ForegroundColor White
if ($localIP) {
    Write-Host "  -> En tu Celular: http://$($localIP):$port/" -ForegroundColor Green
    Write-Host "     (Conectate a la misma red Wi-Fi y abri esa direccion)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Presiona Ctrl + C en cualquier momento para detener el servidor." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        $localPath = $request.Url.LocalPath.TrimStart('/')
        $cleanPath = $localPath.ToLower()

        # ====================================================================
        # API REST: Sincronización en vivo Stand Multi-Dispositivo
        # ====================================================================
        $dataFile = Join-Path $root "participantes.json"

        if ($cleanPath -eq "api/sessions" -or $cleanPath -eq "api/sessions/") {
            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                if (Test-Path $dataFile) {
                    $bytes = [System.IO.File]::ReadAllBytes($dataFile)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $emptyBytes = [System.Text.Encoding]::UTF8.GetBytes('[]')
                    $response.OutputStream.Write($emptyBytes, 0, $emptyBytes.Length)
                }
                $response.OutputStream.Close()
                continue
            }

            if ($request.HttpMethod -eq "POST") {
                try {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $body = $reader.ReadToEnd()
                    $reader.Close()

                    $list = @()
                    if (Test-Path $dataFile) {
                        try {
                            $rawJson = [System.IO.File]::ReadAllText($dataFile, [System.Text.Encoding]::UTF8)
                            if ($rawJson) {
                                $parsed = ConvertFrom-Json $rawJson
                                if ($parsed -is [System.Collections.IEnumerable]) {
                                    $list = @($parsed)
                                } else {
                                    $list = @($parsed)
                                }
                            }
                        } catch {}
                    }

                    $newItem = ConvertFrom-Json $body
                    $combined = @($newItem) + $list
                    if ($combined.Count -gt 1000) {
                        $combined = $combined[0..999]
                    }

                    $jsonOut = ConvertTo-Json -InputObject $combined -Depth 10
                    if ($combined.Count -eq 1 -or -not ($jsonOut.Trim().StartsWith("["))) {
                        $jsonOut = "[$jsonOut]"
                    }
                    [System.IO.File]::WriteAllText($dataFile, $jsonOut, [System.Text.Encoding]::UTF8)

                    Write-Host "  -> [PARTIDA REGISTRADA] Piloto: $($newItem.player) | Nivel $($newItem.level) | Promedio: $($newItem.avgTime)s" -ForegroundColor Green

                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $okBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}')
                    $response.OutputStream.Write($okBytes, 0, $okBytes.Length)
                } catch {
                    $response.StatusCode = 400
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"Invalid JSON payload"}')
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $response.OutputStream.Close()
                continue
            }
        }

        if (($cleanPath -eq "api/sessions/clear" -or $cleanPath -eq "api/clear") -and $request.HttpMethod -eq "POST") {
            if (Test-Path $dataFile) {
                [System.IO.File]::WriteAllText($dataFile, '[]', [System.Text.Encoding]::UTF8)
            }
            Write-Host "  -> [STAND REINICIADO] Se vació la base de datos de participantes." -ForegroundColor Yellow
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $okBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"cleared"}')
            $response.OutputStream.Write($okBytes, 0, $okBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }

        $filePath = Join-Path $root $localPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $response.StatusCode = 200

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("Archivo no encontrado")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.OutputStream.Close()
    } catch {
        # continue listening on error
    }
}