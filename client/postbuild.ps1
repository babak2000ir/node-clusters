$sourceFolder = "./build"
$targetFolder = "../dist/client"

if (Test-Path -Path $targetFolder) {
    Remove-Item -Path $targetFolder -Recurse -Force
}

mkdir $targetFolder

Copy-Item -Path $sourceFolder\* -Destination $targetFolder -Recurse  | Out-Null