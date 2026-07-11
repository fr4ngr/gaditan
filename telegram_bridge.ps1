$Token = "8626733913:AAHzhV_ZUvZGy1bJ-rn-xW46SJ80J9wUEVE"
$OffsetFile = "C:\Users\frn\Documents\gaditan\telegram_offset.txt"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Offset = 0
if (Test-Path $OffsetFile) {
    $Val = Get-Content $OffsetFile -Raw
    if (![string]::IsNullOrWhiteSpace($Val)) {
        $Offset = [int]$Val
    }
}

[Console]::Out.WriteLine("Telegram bridge started. Polling for messages...")
[Console]::Out.Flush()

while ($true) {
    try {
        $Url = "https://api.telegram.org/bot$Token/getUpdates?timeout=30&offset=$Offset"
        $Response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 40 -ErrorAction Stop
        
        if ($Response.ok) {
            foreach ($Result in $Response.result) {
                $UpdateId = $Result.update_id
                if ($Result.message -and $Result.message.text) {
                    $ChatId = $Result.message.chat.id
                    $Username = $Result.message.from.username
                    if (-not $Username) { $Username = "Unknown" }
                    $Text = $Result.message.text
                    
                    [Console]::Out.WriteLine("")
                    [Console]::Out.WriteLine("=== NEW TELEGRAM MESSAGE ===")
                    [Console]::Out.WriteLine("CHAT_ID: $ChatId")
                    [Console]::Out.WriteLine("USER: $Username")
                    [Console]::Out.WriteLine("TEXT: $Text")
                    [Console]::Out.WriteLine("============================")
                    [Console]::Out.Flush()
                }
                $Offset = $UpdateId + 1
            }
            if ($Response.result.Count -gt 0) {
                $Offset | Set-Content -Path $OffsetFile
            }
        }
    } catch {
        # Ignoramos silenciosamente errores de red
        Start-Sleep -Seconds 5
    }
    Start-Sleep -Seconds 1
}
