Remove-Item -Path "src/components/ThemeWrapper.tsx" -ErrorAction SilentlyContinue
Remove-Item -Path "list-sheets.js" -ErrorAction SilentlyContinue
Remove-Item -Path "CORRECT_SPREADSHEET_IDS.txt" -ErrorAction SilentlyContinue
Remove-Item -Path "src/app/font-check" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/app/debug" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleanup completed."
