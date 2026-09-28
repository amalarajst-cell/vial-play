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