$ErrorActionPreference = "Stop"

Remove-Item -Recurse -Force .\python -ErrorAction SilentlyContinue
Remove-Item -Force .\psycopg-layer.zip -ErrorAction SilentlyContinue

python -m pip install `
  --platform manylinux2014_x86_64 `
  --target .\python `
  --implementation cp `
  --python-version 3.12 `
  --only-binary=:all: `
  "psycopg[binary]"

Compress-Archive -Path .\python -DestinationPath .\psycopg-layer.zip -Force

Write-Host "Created psycopg-layer.zip"