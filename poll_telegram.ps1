$Token = "8626733913:AAHzhV_ZUvZGy1bJ-rn-xW46SJ80J9wUEVE"
$OffsetFile = "C:\Users\frn\Documents\gaditan\telegram_offset.txt"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Offset = 0
if (Test-Path $OffsetFile) {
    $Val = Get-Content $OffsetFile -Raw
    if (![string]::IsNullOrWhiteSpace($Val)) { $Offset = [int]$Val }
}

while ($true) {
    try {
        $Url = "https://api.telegram.org/bot$Token/getUpdates?timeout=30&offset=$Offset"
        $Response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 40 -ErrorAction Stop
        
        if ($Response.ok -and $Response.result.Count -gt 0) {
            $foundMessage = $false
            foreach ($Result in $Response.result) {
                if ($Result.message -and $Result.message.text) {
                    $ChatId = $Result.message.chat.id
                    $Username = $Result.message.from.username
                    if (-not $Username) { $Username = "Unknown" }
                    $Text = $Result.message.text
                    
                    Write-Output "=== NEW TELEGRAM MESSAGE ==="
                    Write-Output "CHAT_ID: $ChatId"
                    Write-Output "USER: $Username"
                    Write-Output "TEXT: $Text"
                    $foundMessage = $true
                }
                $Offset = $Result.update_id + 1
            }
            $Offset | Set-Content -Path $OffsetFile
            if ($foundMessage) {
                exit 0
            }
        }
    } catch {
        Start-Sleep -Seconds 5
    }
    Start-Sleep -Seconds 1
}
